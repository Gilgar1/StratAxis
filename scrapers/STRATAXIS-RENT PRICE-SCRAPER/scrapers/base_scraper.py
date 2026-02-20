import requests
import time
import random
from abc import ABC, abstractmethod
from bs4 import BeautifulSoup
from typing import List, Dict, Any
from fake_useragent import UserAgent
from utils.logger import setup_logger

class BaseScraper(ABC):
    """Abstract base class for all scrapers"""
    
    def __init__(self, source_name: str, base_url: str, delay_range: tuple = (1, 2)):
        self.source_name = source_name
        self.base_url = base_url
        self.delay_range = delay_range
        self.logger = setup_logger(f"scraper.{source_name}")
        self.ua = UserAgent()
        self.session = self._create_session()
        
    def _create_session(self):
        """Create requests session with headers"""
        session = requests.Session()
        session.headers.update({
            'User-Agent': self.ua.random,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
        })
        return session
    
    def fetch_page(self, url: str, max_retries: int = 2) -> BeautifulSoup:
        """Fetch and parse HTML page with retries"""
        for attempt in range(max_retries):
            try:
                self.logger.debug(f"Fetching: {url} (attempt {attempt + 1}/{max_retries})")
                
                # Random delay to be respectful
                time.sleep(random.uniform(*self.delay_range))
                
                response = self.session.get(url, timeout=15)
                response.raise_for_status()
                
                return BeautifulSoup(response.content, 'lxml')
                
            except requests.RequestException as e:
                self.logger.warning(f"Failed to fetch {url}: {e}")
                if attempt == max_retries - 1:
                    self.logger.error(f"Max retries reached for {url}")
                    return None
                time.sleep(5 * (attempt + 1))  # Exponential backoff
        
        return None
    
    def extract_text(self, element, selector: str, default: str = "") -> str:
        """Safely extract text from BeautifulSoup element"""
        try:
            found = element.select_one(selector)
            return found.get_text(strip=True) if found else default
        except Exception as e:
            self.logger.debug(f"Error extracting text with selector '{selector}': {e}")
            return default
    
    def extract_attr(self, element, selector: str, attr: str, default: str = "") -> str:
        """Safely extract attribute from BeautifulSoup element"""
        try:
            found = element.select_one(selector)
            return found.get(attr, default) if found else default
        except Exception as e:
            self.logger.debug(f"Error extracting attr '{attr}' with selector '{selector}': {e}")
            return default
    
    @abstractmethod
    def scrape(self, city: str) -> List[Dict[str, Any]]:
        """
        Scrape listings for a given city
        
        Args:
            city: 'douala' or 'yaounde'
            
        Returns:
            List of dictionaries with raw listing data
        """
        pass
    
    def build_listing_dict(self, **kwargs) -> Dict[str, Any]:
        """Build standardized listing dictionary"""
        return {
            'city': kwargs.get('city', ''),
            'neighborhood': kwargs.get('neighborhood', ''),
            'housing_type_raw': kwargs.get('housing_type_raw', ''),
            'rent_price_raw': kwargs.get('rent_price_raw', ''),
            'currency_raw': kwargs.get('currency_raw', 'XAF'),
            'payment_frequency_raw': kwargs.get('payment_frequency_raw', ''),
            'bedrooms_raw': kwargs.get('bedrooms_raw', ''),
            'size_raw': kwargs.get('size_raw', ''),
            'listing_date': kwargs.get('listing_date', ''),
            'source_site': self.source_name,
            'listing_url': kwargs.get('listing_url', ''),
            'full_description': kwargs.get('full_description', ''),
        }
