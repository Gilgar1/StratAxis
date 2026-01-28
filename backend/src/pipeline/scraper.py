"""
Web Scraping Pipeline (Blueprint 4.1)

Handles:
- Scraper factory pattern for multiple data sources
- HTML parsing with BeautifulSoup
- Rate limiting and robots.txt compliance
- Data extraction and normalization
- Error handling and logging
"""

import time
import json
import requests
from typing import List, Dict, Optional, Any
from datetime import datetime
from pathlib import Path
from bs4 import BeautifulSoup
from urllib.robotparser import RobotFileParser
from sqlmodel import Session, select

from src.models.data_source import DataSource, DataSourceType, RunStatus
from src.utils.logger import logger


class BaseScraper:
    """
    Base class for all property scrapers (Blueprint 4.1.3)
    
    Implements common scraping functionality:
    - HTTP requests with retries
    - Rate limiting
    - robots.txt compliance
    - Error handling
    """
    
    def __init__(self, data_source: DataSource):
        self.data_source = data_source
        self.config = data_source.config or {}
        self.base_url = data_source.source_url or ""
        self.rate_limit_delay = self.config.get('rate_limit_delay', 2)  # seconds between requests
        self.max_retries = self.config.get('max_retries', 3)
        self.timeout = self.config.get('timeout', 30)
        
        # Initialize robots.txt parser
        self.robot_parser = RobotFileParser()
        self.robot_parser.set_url(f"{self.base_url}/robots.txt")
        try:
            self.robot_parser.read()
        except Exception as e:
            logger.warning(f"Could not read robots.txt for {self.base_url}: {e}")
    
    def can_fetch(self, url: str) -> bool:
        """Check if URL can be fetched per robots.txt (Blueprint 4.1.3.b)"""
        try:
            return self.robot_parser.can_fetch("*", url)
        except:
            # If robots.txt parsing fails, allow fetch (be polite anyway with rate limiting)
            return True
    
    def fetch_page(self, url: str) -> Optional[str]:
        """
        Fetch a web page with retry logic and rate limiting (Blueprint 4.1.3.b)
        
        Args:
            url: URL to fetch
            
        Returns:
            HTML content or None if failed
        """
        # Check robots.txt
        if not self.can_fetch(url):
            logger.warning(f"robots.txt disallows fetching {url}")
            return None
        
        # Apply rate limiting (Blueprint 4.1.3.b - delays between requests)
        time.sleep(self.rate_limit_delay)
        
        # Retry logic
        for attempt in range(self.max_retries):
            try:
                response = requests.get(
                    url,
                    headers={'User-Agent': 'StratAxisBot/1.0 (Real Estate Research)'},
                    timeout=self.timeout
                )
                response.raise_for_status()
                
                logger.info(f"Successfully fetched {url}")
                return response.text
                
            except requests.RequestException as e:
                logger.warning(f"Attempt {attempt + 1}/{self.max_retries} failed for {url}: {e}")
                if attempt < self.max_retries - 1:
                    time.sleep(2 ** attempt)  # Exponential backoff
                else:
                    logger.error(f"Failed to fetch {url} after {self.max_retries} attempts")
                    return None
    
    def parse_html(self, html: str) -> BeautifulSoup:
        """Parse HTML with BeautifulSoup (Blueprint 4.1.3.c)"""
        return BeautifulSoup(html, 'html.parser')
    
    def extract_properties(self, html: str) -> List[Dict[str, Any]]:
        """
        Extract property data from HTML (Blueprint 4.1.3.d)
        
        Must be implemented by subclasses for specific websites
        
        Returns:
            List of property dictionaries with normalized schema
        """
        raise NotImplementedError("Subclasses must implement extract_properties()")
    
    def normalize_property(self, raw_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Normalize property data to common schema (Blueprint 4.1.3.e)
        
        Common schema fields:
        - title, description, city, neighborhood, property_type
        - price, currency, size, bedrooms, bathrooms
        - images, data_source_record_id
        """
        normalized = {
            "title": raw_data.get("title", "").strip(),
            "description": raw_data.get("description", "").strip(),
            "city": raw_data.get("city", "").strip(),
            "neighborhood": raw_data.get("neighborhood", "").strip(),
            "property_type": raw_data.get("property_type", "").lower().strip(),
            "price": self._parse_price(raw_data.get("price")),
            "currency": raw_data.get("currency", "XAF"),
            "size": self._parse_size(raw_data.get("size")),
            "bedrooms": self._parse_int(raw_data.get("bedrooms")),
            "bathrooms": self._parse_int(raw_data.get("bathrooms")),
            "images": raw_data.get("images", []),
            "data_source_record_id": raw_data.get("id", ""),
            "scraped_at": datetime.utcnow().isoformat()
        }
        
        return normalized
    
    @staticmethod
    def _parse_price(price_str: Any) -> Optional[float]:
        """Parse price from string (remove commas, spaces, currency symbols)"""
        if not price_str:
            return None
        
        try:
            # Remove common separators and currency symbols
            cleaned = str(price_str).replace(',', '').replace(' ', '').replace('XAF', '').replace('FCFA', '')
            return float(cleaned)
        except (ValueError, TypeError):
            return None
    
    @staticmethod
    def _parse_size(size_str: Any) -> Optional[float]:
        """Parse size from string (handle m², sqm, etc.)"""
        if not size_str:
            return None
        
        try:
            # Remove units and extract number
            cleaned = str(size_str).replace('m²', '').replace('sqm', '').replace('m2', '').replace(',', '').strip()
            return float(cleaned)
        except (ValueError, TypeError):
            return None
    
    @staticmethod
    def _parse_int(value: Any) -> Optional[int]:
        """Parse integer value"""
        if not value:
            return None
        
        try:
            return int(value)
        except (ValueError, TypeError):
            return None
    
    def scrape(self) -> List[Dict[str, Any]]:
        """
        Main scraping method (Blueprint 4.1.3)
        
        Returns:
            List of normalized property dictionaries
        """
        raise NotImplementedError("Subclasses must implement scrape()")


class GenericPropertyScraper(BaseScraper):
    """
    Generic property scraper for demonstration (Blueprint 4.1)
    
    In production, create specific scrapers for each website
    (e.g., CameroonHomeScraper, ImmoAfricaScraper, etc.)
    """
    
    def scrape(self) -> List[Dict[str, Any]]:
        """
        Scrape properties from configured URL (Blueprint 4.1.3)
        """
        logger.info(f"Starting scrape for {self.data_source.name}")
        
        all_properties = []
        errors = []
        
        try:
            # Get listing pages from config
            page_urls = self.config.get('page_urls', [self.base_url])
            
            for page_url in page_urls:
                try:
                    html = self.fetch_page(page_url)
                    if not html:
                        continue
                    
                    # Extract properties from this page
                    properties = self.extract_properties(html)
                    all_properties.extend(properties)
                    
                    logger.info(f"Extracted {len(properties)} properties from {page_url}")
                    
                except Exception as e:
                    logger.error(f"Error scraping {page_url}: {e}")
                    errors.append(str(e))
            
            # Log results (Blueprint 4.1.3.f)
            logger.info(
                f"Scraping completed for {self.data_source.name}: "
                f"{len(all_properties)} records found, {len(errors)} errors"
            )
            
        except Exception as e:
            logger.error(f"Fatal error in scraping: {e}")
        
        return all_properties
    
    def extract_properties(self, html: str) -> List[Dict[str, Any]]:
        """
        Extract properties from HTML (Blueprint 4.1.3.d)
        
        This is a simplified example. Production scrapers would use 
        specific CSS selectors for each target website.
        """
        soup = self.parse_html(html)
        properties = []
        
        # Get selectors from config
        selectors = self.config.get('selectors', {})
        container_selector = selectors.get('container', '.property-listing')
        
        # Find all property containers
        listings = soup.select(container_selector)
        
        for listing in listings:
            try:
                raw_property = {
                    "id": self._extract_text(listing, selectors.get('id', '[data-id]')),
                    "title": self._extract_text(listing, selectors.get('title', '.title')),
                    "description": self._extract_text(listing, selectors.get('description', '.description')),
                    "price": self._extract_text(listing, selectors.get('price', '.price')),
                    "size": self._extract_text(listing, selectors.get('size', '.size')),
                    "bedrooms": self._extract_text(listing, selectors.get('bedrooms', '.bedrooms')),
                    "bathrooms": self._extract_text(listing, selectors.get('bathrooms', '.bathrooms')),
                    "city": self._extract_text(listing, selectors.get('city', '.city')),
                    "neighborhood": self._extract_text(listing, selectors.get('neighborhood', '.neighborhood')),
                    "property_type": self._extract_text(listing, selectors.get('property_type', '.type')),
                    "images": self._extract_images(listing, selectors.get('images', 'img'))
                }
                
                # Normalize to common schema (Blueprint 4.1.3.e)
                normalized = self.normalize_property(raw_property)
                properties.append(normalized)
                
            except Exception as e:
                logger.warning(f"Error extracting property from listing: {e}")
                continue
        
        return properties
    
    @staticmethod
    def _extract_text(element, selector: str) -> str:
        """Extract text from element using CSS selector"""
        found = element.select_one(selector)
        return found.get_text(strip=True) if found else ""
    
    @staticmethod
    def _extract_images(element, selector: str) -> List[str]:
        """Extract image URLs from element"""
        images = element.select(selector)
        return [img.get('src', '') for img in images if img.get('src')]


class ScraperFactory:
    """
    Scraper factory for creating appropriate scrapers (Blueprint 4.1.2)
    """
    
    @staticmethod
    def create_scraper(data_source: DataSource) -> BaseScraper:
        """
        Create appropriate scraper based on data source configuration
        
        In production, map to specific scraper classes:
        - 'cameroon_homes' -> CameroonHomesScraper
        - 'immo_africa' -> ImmoAfricaScraper
        etc.
        """
        scraper_type = data_source.config.get('scraper_type', 'generic')
        
        # Map to scraper classes (extend as needed)
        scraper_classes = {
            'generic': GenericPropertyScraper,
            # Add more scrapers here:
            # 'cameroon_homes': CameroonHomesScraper,
            # 'immo_africa': ImmoAfricaScraper,
        }
        
        scraper_class = scraper_classes.get(scraper_type, GenericPropertyScraper)
        return scraper_class(data_source)


def run_scraping_pipeline(session: Session) -> Dict[str, Any]:
    """
    Main entry point for scraping pipeline (Blueprint 4.1)
    
    Should be triggered by scheduler (cron: daily at 02:00 UTC)
    
    Args:
        session: Database session
        
    Returns:
        Dictionary with execution results
    """
    logger.info("=== STARTING SCRAPING PIPELINE ===")
    start_time = datetime.utcnow()
    
    # Get active scrapers from DataSources table (Blueprint 4.1.2)
    active_scrapers = session.exec(
        select(DataSource).where(
            DataSource.type == DataSourceType.SCRAPER,
            DataSource.is_active == True
        )
    ).all()
    
    logger.info(f"Found {len(active_scrapers)} active scrapers")
    
    all_scraped_data = []
    execution_results = {
        "scrapers_run": 0,
        "total_records": 0,
        "successful_scrapers": 0,
        "failed_scrapers": 0,
        "errors": []
    }
    
    # Run each scraper (Blueprint 4.1.3)
    for data_source in active_scrapers:
        try:
            logger.info(f"Running scraper: {data_source.name}")
            
            # Create appropriate scraper
            scraper = ScraperFactory.create_scraper(data_source)
            
            # Execute scraping
            properties = scraper.scrape()
            
            # Tag records with source (Blueprint 4.3.2.d)
            for prop in properties:
                prop['data_source_id'] = str(data_source.id)
                prop['data_source_name'] = data_source.name
            
            all_scraped_data.extend(properties)
            
            # Update data source statistics
            data_source.last_run_at = datetime.utcnow()
            data_source.last_run_status = RunStatus.SUCCESS
            data_source.records_collected = len(properties)
            session.add(data_source)
            
            execution_results["scrapers_run"] += 1
            execution_results["successful_scrapers"] += 1
            execution_results["total_records"] += len(properties)
            
            logger.info(f"Scraper {data_source.name} completed: {len(properties)} records")
            
        except Exception as e:
            logger.error(f"Scraper {data_source.name} failed: {e}")
            
            data_source.last_run_at = datetime.utcnow()
            data_source.last_run_status = RunStatus.FAILED
            session.add(data_source)
            
            execution_results["failed_scrapers"] += 1
            execution_results["errors"].append({
                "scraper": data_source.name,
                "error": str(e)
            })
    
    session.commit()
    
    # Save raw scraped data to temporary JSON files (Blueprint 4.1.4)
    output_file = save_scraped_data(all_scraped_data)
    
    execution_time = (datetime.utcnow() - start_time).total_seconds()
    
    logger.info(
        f"=== SCRAPING PIPELINE COMPLETED ===\n"
        f"  Scrapers run: {execution_results['scrapers_run']}\n"
        f"  Total records: {execution_results['total_records']}\n"
        f"  Successful: {execution_results['successful_scrapers']}\n"
        f"  Failed: {execution_results['failed_scrapers']}\n"
        f"  Execution time: {execution_time:.2f}s\n"
        f"  Output file: {output_file}"
    )
    
    return {
        **execution_results,
        "execution_time_seconds": execution_time,
        "output_file": output_file,
        "timestamp": start_time.isoformat()
    }


def save_scraped_data(data: List[Dict[str, Any]]) -> str:
    """
    Save raw scraped data to temporary JSON files (Blueprint 4.1.4)
    
    Args:
        data: List of scraped property dictionaries
        
    Returns:
        Path to saved file
    """
    # Create temp directory if it doesn't exist
    temp_dir = Path("backend/temp/scraped_data")
    temp_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate filename with timestamp
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    filename = f"scraped_{timestamp}.json"
    filepath = temp_dir / filename
    
    # Save to JSON
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    logger.info(f"Saved {len(data)} scraped records to {filepath}")
    
    return str(filepath)
