"""
StratAxis - Data Exporter Module
Exports collected data to CSV format
"""

import os
import csv
import json
import logging
from pathlib import Path
from typing import List, Dict
from datetime import datetime

from config import OUTPUT_SETTINGS

logger = logging.getLogger(__name__)


class DataExporter:
    """
    Exports collected real estate intelligence data to CSV
    """
    
    def __init__(self):
        self.output_dir = OUTPUT_SETTINGS['base_directory']
        self.csv_path = os.path.join(self.output_dir, OUTPUT_SETTINGS['csv_filename'])
        self._ensure_directory()
        
        # CSV column headers
        self.headers = [
            'source_institution',
            'title',
            'publication_date',
            'url',
            'document_type',
            'category',
            'region',
            'extracted_structured_data',
            'extracted_unstructured_text',
            'keywords_detected',
            'file_path',
            'crawl_timestamp',
            'relevance_score'
        ]
    
    def _ensure_directory(self):
        """Create output directory if it doesn't exist"""
        Path(self.output_dir).mkdir(parents=True, exist_ok=True)
        logger.info(f"Output directory: {self.output_dir}")
    
    def _serialize_tables(self, tables: List[Dict]) -> str:
        """
        Convert tables to JSON string for CSV storage
        """
        if not tables:
            return ""
        
        try:
            return json.dumps(tables, ensure_ascii=False)
        except Exception as e:
            logger.error(f"Error serializing tables: {e}")
            return ""
    
    def _format_keywords(self, keywords: List[str]) -> str:
        """
        Format keywords as comma-separated string
        """
        if not keywords:
            return ""
        return ", ".join(sorted(set(keywords)))
    
    def _determine_document_type(self, url: str, has_tables: bool, is_pdf: bool) -> str:
        """
        Determine document type
        """
        if is_pdf:
            return "pdf"
        elif has_tables:
            return "html_with_tables"
        elif any(keyword in url.lower() for keyword in ['press', 'news', 'actualite', 'communique']):
            return "press_release"
        elif any(keyword in url.lower() for keyword in ['report', 'rapport', 'publication']):
            return "report"
        elif any(keyword in url.lower() for keyword in ['announce', 'annonce', 'avis']):
            return "announcement"
        else:
            return "html"
    
    def export_to_csv(self, data_records: List[Dict], append: bool = False):
        """
        Export data records to CSV
        
        Args:
            data_records: List of data dictionaries
            append: If True, append to existing file; if False, overwrite
        """
        mode = 'a' if append and os.path.exists(self.csv_path) else 'w'
        write_header = mode == 'w' or not os.path.exists(self.csv_path)
        
        try:
            with open(self.csv_path, mode, newline='', encoding=OUTPUT_SETTINGS['encoding']) as csvfile:
                writer = csv.DictWriter(csvfile, fieldnames=self.headers, extrasaction='ignore')
                
                if write_header:
                    writer.writeheader()
                    logger.info(f"Created new CSV file: {self.csv_path}")
                
                # Write records
                rows_written = 0
                for record in data_records:
                    try:
                        # Prepare row
                        row = self._prepare_row(record)
                        writer.writerow(row)
                        rows_written += 1
                    except Exception as e:
                        logger.error(f"Error writing record to CSV: {e}")
                        continue
                
                logger.info(f"Wrote {rows_written} records to CSV")
                
        except Exception as e:
            logger.error(f"Error exporting to CSV: {e}")
            raise
    
    def _prepare_row(self, record: Dict) -> Dict:
        """
        Prepare a data record for CSV export
        """
        # Handle publication date
        pub_date = record.get('publication_date')
        if isinstance(pub_date, datetime):
            pub_date = pub_date.strftime('%Y-%m-%d')
        elif pub_date is None:
            pub_date = ""
        
        # Handle crawl timestamp
        crawl_ts = record.get('crawl_timestamp')
        if isinstance(crawl_ts, datetime):
            crawl_ts = crawl_ts.strftime('%Y-%m-%d %H:%M:%S')
        elif crawl_ts is None:
            crawl_ts = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        # Serialize structured data
        structured_data = self._serialize_tables(record.get('tables', []))
        
        # Format keywords
        keywords = self._format_keywords(record.get('keywords', []))
        
        # Determine document type
        doc_type = self._determine_document_type(
            record.get('url', ''),
            record.get('has_structured_data', False),
            record.get('is_pdf', False)
        )
        
        # Prepare row
        row = {
            'source_institution': record.get('source_institution', ''),
            'title': record.get('title', ''),
            'publication_date': pub_date,
            'url': record.get('url', ''),
            'document_type': doc_type,
            'category': record.get('category', ''),
            'region': record.get('region', ''),
            'extracted_structured_data': structured_data,
            'extracted_unstructured_text': record.get('clean_text', '')[:10000],  # Limit length
            'keywords_detected': keywords,
            'file_path': record.get('file_path', ''),
            'crawl_timestamp': crawl_ts,
            'relevance_score': record.get('relevance_score', 0.0)
        }
        
        return row
    
    def create_summary_report(self, data_records: List[Dict]) -> Dict:
        """
        Create a summary report of collected data
        """
        summary = {
            'total_records': len(data_records),
            'by_institution': {},
            'by_category': {},
            'by_document_type': {},
            'by_region': {},
            'date_range': {
                'earliest': None,
                'latest': None
            },
            'pdf_count': 0,
            'records_with_tables': 0,
            'records_with_dates': 0,
            'average_relevance_score': 0.0,
            'top_keywords': {}
        }
        
        all_keywords = []
        relevance_scores = []
        
        for record in data_records:
            # By institution
            inst = record.get('source_institution', 'Unknown')
            summary['by_institution'][inst] = summary['by_institution'].get(inst, 0) + 1
            
            # By category
            cat = record.get('category', 'Unknown')
            summary['by_category'][cat] = summary['by_category'].get(cat, 0) + 1
            
            # By document type
            doc_type = self._determine_document_type(
                record.get('url', ''),
                record.get('has_structured_data', False),
                record.get('is_pdf', False)
            )
            summary['by_document_type'][doc_type] = summary['by_document_type'].get(doc_type, 0) + 1
            
            # By region
            region = record.get('region')
            if region:
                summary['by_region'][region] = summary['by_region'].get(region, 0) + 1
            
            # PDFs
            if record.get('file_path'):
                summary['pdf_count'] += 1
            
            # Tables
            if record.get('has_structured_data'):
                summary['records_with_tables'] += 1
            
            # Dates
            pub_date = record.get('publication_date')
            if pub_date:
                summary['records_with_dates'] += 1
                if isinstance(pub_date, str):
                    try:
                        pub_date = datetime.strptime(pub_date, '%Y-%m-%d')
                    except:
                        pub_date = None
                
                if isinstance(pub_date, datetime):
                    if summary['date_range']['earliest'] is None or pub_date < summary['date_range']['earliest']:
                        summary['date_range']['earliest'] = pub_date
                    if summary['date_range']['latest'] is None or pub_date > summary['date_range']['latest']:
                        summary['date_range']['latest'] = pub_date
            
            # Keywords
            keywords = record.get('keywords', [])
            all_keywords.extend(keywords)
            
            # Relevance scores
            score = record.get('relevance_score', 0.0)
            if score:
                relevance_scores.append(score)
        
        # Calculate averages and top keywords
        if relevance_scores:
            summary['average_relevance_score'] = round(sum(relevance_scores) / len(relevance_scores), 2)
        
        # Top 20 keywords
        from collections import Counter
        keyword_counts = Counter(all_keywords)
        summary['top_keywords'] = dict(keyword_counts.most_common(20))
        
        # Format dates
        if summary['date_range']['earliest']:
            summary['date_range']['earliest'] = summary['date_range']['earliest'].strftime('%Y-%m-%d')
        if summary['date_range']['latest']:
            summary['date_range']['latest'] = summary['date_range']['latest'].strftime('%Y-%m-%d')
        
        return summary
    
    def save_summary_report(self, data_records: List[Dict]):
        """
        Generate and save summary report as JSON
        """
        summary = self.create_summary_report(data_records)
        
        summary_path = os.path.join(self.output_dir, 'summary_report.json')
        
        try:
            with open(summary_path, 'w', encoding='utf-8') as f:
                json.dump(summary, f, indent=2, ensure_ascii=False)
            
            logger.info(f"Summary report saved to: {summary_path}")
            
            # Also log summary to console
            logger.info("=" * 60)
            logger.info("STRATAXIS DATA COLLECTION SUMMARY")
            logger.info("=" * 60)
            logger.info(f"Total records: {summary['total_records']}")
            logger.info(f"PDFs downloaded: {summary['pdf_count']}")
            logger.info(f"Records with tables: {summary['records_with_tables']}")
            logger.info(f"Records with dates: {summary['records_with_dates']}")
            logger.info(f"Average relevance score: {summary['average_relevance_score']}")
            logger.info(f"Date range: {summary['date_range']['earliest']} to {summary['date_range']['latest']}")
            logger.info("\nBy Institution:")
            for inst, count in sorted(summary['by_institution'].items(), key=lambda x: x[1], reverse=True):
                logger.info(f"  {inst}: {count}")
            logger.info("\nBy Category:")
            for cat, count in sorted(summary['by_category'].items(), key=lambda x: x[1], reverse=True):
                logger.info(f"  {cat}: {count}")
            logger.info("=" * 60)
            
        except Exception as e:
            logger.error(f"Error saving summary report: {e}")
