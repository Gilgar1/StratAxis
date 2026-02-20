"""
StratAxis - Base Scraper Class
"""

import time
import random
from abc import ABC, abstractmethod
from typing import List, Dict, Optional
import requests
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from config.config import REQUEST_TIMEOUT, REQUEST_DELAY_MIN, REQUEST_DELAY_MAX, MAX_RETRIES, USER_AGENT
from utils.logger import setup_logger


class BaseScraper(ABC):
    """Abstract base class for all website scrapers"""
    
    def __init__(self, site_name: str, base_url: str):
        """
        Initialize scraper
        
        Args:
            site_name: Name of the website
            base_url: Base URL of the website
        """
        self.site_name = site_name
        self.base_url = base_url
        self.logger = setup_logger(f"Scraper.{site_name}")
        self.session = self._create_session()
        self.driver = None
    
    def _create_session(self) -> requests.Session:
        """Create requests session with headers"""
        session = requests.Session()
        session.headers.update({
            'User-Agent': USER_AGENT,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        })
        return session
    
    def _init_selenium(self) -> webdriver.Chrome:
        """Initialize Selenium WebDriver for JavaScript-heavy sites"""
        if self.driver is None:
            self.logger.info("Initializing Selenium WebDriver...")
            chrome_options = Options()
            chrome_options.add_argument('--headless')
            chrome_options.add_argument('--no-sandbox')
            chrome_options.add_argument('--disable-dev-shm-usage')
            chrome_options.add_argument(f'user-agent={USER_AGENT}')
            chrome_options.add_argument('--disable-blink-features=AutomationControlled')
            
            service = Service(ChromeDriverManager().install())
            self.driver = webdriver.Chrome(service=service, options=chrome_options)
        
        return self.driver
    
    def _fetch_page(self, url: str, use_selenium: bool = False) -> Optional[str]:
        """
        Fetch page content with retry logic
        
        Args:
            url: Page URL
            use_selenium: Use Selenium instead of requests
        
        Returns:
            Page HTML content or None if failed
        """
        for attempt in range(MAX_RETRIES):
            try:
                if use_selenium:
                    driver = self._init_selenium()
                    driver.get(url)
                    time.sleep(random.uniform(2, 4))  # Wait for JS to load
                    return driver.page_source
                else:
                    response = self.session.get(url, timeout=REQUEST_TIMEOUT)
                    response.raise_for_status()
                    return response.text
                    
            except Exception as e:
                self.logger.warning(f"Attempt {attempt + 1}/{MAX_RETRIES} failed for {url}: {e}")
                if attempt < MAX_RETRIES - 1:
                    time.sleep(random.uniform(REQUEST_DELAY_MIN, REQUEST_DELAY_MAX))
                else:
                    self.logger.error(f"Failed to fetch {url} after {MAX_RETRIES} attempts")
                    return None
    
    def _parse_html(self, html: str) -> BeautifulSoup:
        """Parse HTML content with BeautifulSoup"""
        return BeautifulSoup(html, 'lxml')
    
    def _delay(self):
        """Random delay between requests to be polite"""
        time.sleep(random.uniform(REQUEST_DELAY_MIN, REQUEST_DELAY_MAX))
    
    @abstractmethod
    def scrape(self) -> List[Dict]:
        """
        Main scraping method - must be implemented by subclasses
        
        Returns:
            List of dictionaries with extracted land listings
            Each dict should contain:
            - city
            - neighborhood
            - price_raw
            - land_size_raw
            - listing_date (optional)
            - source_site
            - listing_url
        """
        pass
    
    def cleanup(self):
        """Clean up resources"""
        if self.driver:
            self.driver.quit()
            self.driver = None
        
        if self.session:
            self.session.close()
    
    def __del__(self):
        """Destructor to ensure cleanup"""
        self.cleanup()
