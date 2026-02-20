"""
StratAxis - Main Execution Module
Central Real Estate Intelligence Engine for Cameroon

This is the entry point for the StratAxis web scraping system.
Run with: python main.py
"""

import logging
import logging.config
from datetime import datetime
from typing import List, Dict

from config import INSTITUTIONS, LOGGING_CONFIG, OUTPUT_SETTINGS, START_DATE, END_DATE
from crawler import WebCrawler
from parser import HTMLParser
from pdf_processor import PDFProcessor
from exporter import DataExporter


def setup_logging():
    """Initialize logging configuration"""
    import os
    from pathlib import Path
    
    # Ensure log directory exists
    Path(OUTPUT_SETTINGS['base_directory']).mkdir(parents=True, exist_ok=True)
    
    # Setup logging
    logging.config.dictConfig(LOGGING_CONFIG)
    logger = logging.getLogger(__name__)
    
    logger.info("=" * 80)
    logger.info("STRATAXIS - CAMEROON REAL ESTATE INTELLIGENCE ENGINE")
    logger.info("=" * 80)
    logger.info(f"Start time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    logger.info(f"Target date range: {START_DATE.strftime('%Y-%m-%d')} to {END_DATE.strftime('%Y-%m-%d')}")
    logger.info(f"Output directory: {OUTPUT_SETTINGS['base_directory']}")
    logger.info("=" * 80)
    
    return logger


def filter_by_date_range(records: List[Dict]) -> List[Dict]:
    """
    Filter records to only include those within the target date range
    """
    filtered = []
    
    for record in records:
        pub_date = record.get('publication_date')
        
        # If no date found, include it (we'll review manually)
        if pub_date is None:
            filtered.append(record)
            continue
        
        # Check date range
        if isinstance(pub_date, datetime):
            if START_DATE <= pub_date <= END_DATE:
                filtered.append(record)
        elif isinstance(pub_date, str):
            try:
                date = datetime.strptime(pub_date, '%Y-%m-%d')
                if START_DATE <= date <= END_DATE:
                    filtered.append(record)
            except:
                # If parsing fails, include it
                filtered.append(record)
    
    logger = logging.getLogger(__name__)
    logger.info(f"Date filter: {len(filtered)}/{len(records)} records within range")
    
    return filtered


def scrape_institution(institution_name: str, institution_info: Dict, 
                      crawler: WebCrawler, parser: HTMLParser, 
                      pdf_processor: PDFProcessor) -> List[Dict]:
    """
    Scrape a single institution
    """
    logger = logging.getLogger(__name__)
    logger.info(f"\n{'='*80}")
    logger.info(f"Scraping: {institution_name}")
    logger.info(f"URL: {institution_info['url']}")
    logger.info(f"{'='*80}")
    
    all_records = []
    
    try:
        # Crawl the website
        # Try static first, fall back to Selenium if needed
        pages = crawler.crawl_site(institution_info['url'], use_selenium=False)
        
        if not pages:
            logger.warning(f"Static crawl failed, trying Selenium for {institution_name}")
            pages = crawler.crawl_site(institution_info['url'], use_selenium=True)
        
        logger.info(f"Crawled {len(pages)} pages from {institution_name}")
        
        # Parse each page
        for idx, page_data in enumerate(pages, 1):
            logger.debug(f"Parsing page {idx}/{len(pages)}: {page_data['url']}")
            
            # Parse HTML content
            parsed_data = parser.parse_page(page_data)
            
            # Add institution info
            parsed_data['source_institution'] = institution_name
            parsed_data['crawl_timestamp'] = datetime.now()
            
            # Only include if it has some relevance
            if parsed_data.get('relevance_score', 0) > 0.5 or parsed_data.get('has_structured_data'):
                all_records.append(parsed_data)
            
            # Process PDF links found on the page
            pdf_links = parsed_data.get('pdf_links', [])
            for pdf_link in pdf_links:
                logger.info(f"Processing PDF: {pdf_link['title']}")
                
                pdf_data = pdf_processor.process_pdf(pdf_link['url'], pdf_link['title'])
                
                if pdf_data:
                    # Parse PDF text with same parser
                    from bs4 import BeautifulSoup
                    
                    # Create pseudo-page for PDF
                    pdf_text = pdf_data.get('extracted_text', '')
                    pdf_title = pdf_data.get('title', '')
                    
                    # Detect keywords and categorize
                    keywords = parser.detect_keywords(pdf_text)
                    category = parser.classify_category(pdf_text, pdf_title)
                    region = parser.detect_region(pdf_text, pdf_title)
                    
                    # Try to extract date from PDF
                    pdf_date = pdf_processor.detect_pdf_date(pdf_data['file_path'])
                    if not pdf_date:
                        pdf_date = page_data.get('publication_date')
                    
                    # Calculate relevance
                    relevance = parser.calculate_relevance_score(
                        pdf_title, pdf_text, len(pdf_data.get('tables', [])) > 0, 
                        True, pdf_date
                    )
                    
                    pdf_record = {
                        'source_institution': institution_name,
                        'title': pdf_title,
                        'publication_date': pdf_date,
                        'url': pdf_link['url'],
                        'category': category,
                        'region': region,
                        'tables': pdf_data.get('tables', []),
                        'clean_text': pdf_text[:5000],
                        'keywords': keywords,
                        'file_path': pdf_data['file_path'],
                        'crawl_timestamp': pdf_data['download_timestamp'],
                        'relevance_score': relevance,
                        'has_structured_data': len(pdf_data.get('tables', [])) > 0,
                        'is_pdf': True
                    }
                    
                    all_records.append(pdf_record)
        
        logger.info(f"Collected {len(all_records)} records from {institution_name}")
        
    except Exception as e:
        logger.error(f"Error scraping {institution_name}: {e}", exc_info=True)
    
    return all_records


def main():
    """
    Main execution function
    """
    logger = setup_logging()
    
    # Initialize components
    logger.info("Initializing scraper components...")
    crawler = WebCrawler()
    parser = HTMLParser()
    pdf_processor = PDFProcessor()
    exporter = DataExporter()
    
    # Collection to store all data
    all_data = []
    
    try:
        # Scrape each institution
        for institution_name, institution_info in INSTITUTIONS.items():
            records = scrape_institution(
                institution_name, 
                institution_info, 
                crawler, 
                parser, 
                pdf_processor
            )
            all_data.extend(records)
        
        # Filter by date range
        logger.info(f"\nTotal records before date filtering: {len(all_data)}")
        filtered_data = filter_by_date_range(all_data)
        logger.info(f"Total records after date filtering: {len(filtered_data)}")
        
        # Remove duplicates based on URL
        unique_data = []
        seen_urls = set()
        
        for record in filtered_data:
            url = record.get('url', '')
            if url and url not in seen_urls:
                seen_urls.add(url)
                unique_data.append(record)
        
        logger.info(f"Total unique records: {len(unique_data)}")
        
        # Sort by relevance score
        unique_data.sort(key=lambda x: x.get('relevance_score', 0), reverse=True)
        
        # Export to CSV
        if unique_data:
            logger.info("\nExporting data to CSV...")
            exporter.export_to_csv(unique_data)
            
            # Generate summary report
            exporter.save_summary_report(unique_data)
            
            logger.info(f"\n{'='*80}")
            logger.info("SCRAPING COMPLETED SUCCESSFULLY")
            logger.info(f"{'='*80}")
            logger.info(f"Total records collected: {len(unique_data)}")
            logger.info(f"CSV file: {exporter.csv_path}")
            logger.info(f"PDF directory: {pdf_processor.download_dir}")
            logger.info(f"{'='*80}\n")
        else:
            logger.warning("No data collected!")
        
    except KeyboardInterrupt:
        logger.warning("\nScraping interrupted by user")
    except Exception as e:
        logger.error(f"Fatal error during scraping: {e}", exc_info=True)
    finally:
        # Cleanup
        logger.info("Cleaning up resources...")
        crawler.close()
        logger.info(f"End time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")


if __name__ == "__main__":
    main()
