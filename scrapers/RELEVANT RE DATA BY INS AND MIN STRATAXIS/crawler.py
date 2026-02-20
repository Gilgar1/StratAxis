"""
StratAxis - Web Crawler Module
Handles both static and dynamic page crawling with rate limiting and robots.txt respect
"""

import requests
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from urllib.parse import urljoin, urlparse, parse_qs
from urllib.robotparser import RobotFileParser
import time
import logging
from typing import Set, List, Dict, Optional
import re
from datetime import datetime

from config import CRAWL_SETTINGS, SELENIUM_SETTINGS, START_DATE, END_DATE

logger = logging.getLogger(__name__)


class WebCrawler:
    """
    Production-grade web crawler with support for static and dynamic content
    """
    
    def __init__(self):
        self.visited_urls: Set[str] = set()
        self.robots_parsers: Dict[str, RobotFileParser] = {}
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': CRAWL_SETTINGS['user_agent']
        })
        self.driver: Optional[webdriver.Chrome] = None
        
    def _get_robots_parser(self, base_url: str) -> Optional[RobotFileParser]:
        """Get or create robots.txt parser for a domain"""
        if not CRAWL_SETTINGS['respect_robots_txt']:
            return None
            
        domain = f"{urlparse(base_url).scheme}://{urlparse(base_url).netloc}"
        
        if domain not in self.robots_parsers:
            rp = RobotFileParser()
            robots_url = urljoin(domain, '/robots.txt')
            try:
                rp.set_url(robots_url)
                rp.read()
                self.robots_parsers[domain] = rp
                logger.info(f"Loaded robots.txt from {robots_url}")
            except Exception as e:
                logger.warning(f"Could not load robots.txt from {robots_url}: {e}")
                self.robots_parsers[domain] = None
                
        return self.robots_parsers[domain]
    
    def _can_fetch(self, url: str) -> bool:
        """Check if URL can be fetched according to robots.txt"""
        if not CRAWL_SETTINGS['respect_robots_txt']:
            return True
            
        parser = self._get_robots_parser(url)
        if parser is None:
            return True
            
        return parser.can_fetch(CRAWL_SETTINGS['user_agent'], url)
    
    def _normalize_url(self, url: str) -> str:
        """Normalize URL to avoid duplicates"""
        parsed = urlparse(url)
        # Remove fragments
        normalized = f"{parsed.scheme}://{parsed.netloc}{parsed.path}"
        # Remove trailing slash for consistency
        if normalized.endswith('/') and normalized.count('/') > 3:
            normalized = normalized[:-1]
        return normalized
    
    def _is_valid_url(self, url: str, base_domain: str) -> bool:
        """Check if URL is valid and within scope"""
        try:
            parsed = urlparse(url)
            base_parsed = urlparse(base_domain)
            
            # Must be HTTP(S)
            if parsed.scheme not in ['http', 'https']:
                return False
            
            # Must be same domain or subdomain
            if base_parsed.netloc not in parsed.netloc:
                return False
            
            # Skip common non-content URLs
            skip_patterns = [
                r'/login', r'/signup', r'/register', r'/auth',
                r'/download\.php', r'/print\.php',
                r'\.css$', r'\.js$', r'\.jpg$', r'\.png$', r'\.gif$', r'\.ico$'
            ]
            
            for pattern in skip_patterns:
                if re.search(pattern, url, re.IGNORECASE):
                    return False
                    
            return True
            
        except Exception as e:
            logger.error(f"Error validating URL {url}: {e}")
            return False
    
    def _extract_date_from_page(self, soup: BeautifulSoup, html: str) -> Optional[datetime]:
        """
        Attempt to extract publication date from page content
        """
        # Common date patterns
        date_patterns = [
            r'\b(\d{1,2}[-/]\d{1,2}[-/]\d{4})\b',  # DD/MM/YYYY or MM/DD/YYYY
            r'\b(\d{4}[-/]\d{1,2}[-/]\d{1,2})\b',  # YYYY/MM/DD
            r'\b(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})\b',
            r'\b(\d{1,2}\s+(?:janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s+\d{4})\b'
        ]
        
        # Look in meta tags first
        meta_dates = soup.find_all('meta', attrs={'name': re.compile(r'date|time', re.I)})
        for meta in meta_dates:
            if meta.get('content'):
                try:
                    # Try to parse various formats
                    date_str = meta.get('content')
                    for fmt in ['%Y-%m-%d', '%d/%m/%Y', '%m/%d/%Y', '%Y/%m/%d']:
                        try:
                            return datetime.strptime(date_str[:10], fmt)
                        except:
                            continue
                except:
                    pass
        
        # Look in common date containers
        date_containers = soup.find_all(class_=re.compile(r'date|time|published', re.I))
        date_containers += soup.find_all(id=re.compile(r'date|time|published', re.I))
        
        for container in date_containers:
            text = container.get_text()
            for pattern in date_patterns:
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    try:
                        date_str = match.group(1)
                        # Try to parse
                        for fmt in ['%d/%m/%Y', '%d-%m-%Y', '%Y-%m-%d', '%Y/%m/%d']:
                            try:
                                return datetime.strptime(date_str, fmt)
                            except:
                                continue
                    except:
                        pass
        
        # Last resort: search entire text
        for pattern in date_patterns:
            match = re.search(pattern, html[:5000], re.IGNORECASE)  # Check first 5000 chars
            if match:
                try:
                    date_str = match.group(1)
                    for fmt in ['%d/%m/%Y', '%d-%m-%Y', '%Y-%m-%d', '%Y/%m/%d']:
                        try:
                            date = datetime.strptime(date_str, fmt)
                            # Sanity check
                            if START_DATE <= date <= END_DATE:
                                return date
                        except:
                            continue
                except:
                    pass
        
        return None
    
    def fetch_static_page(self, url: str) -> Optional[Dict]:
        """
        Fetch a static page using requests
        """
        if url in self.visited_urls:
            return None
            
        if not self._can_fetch(url):
            logger.info(f"Blocked by robots.txt: {url}")
            return None
        
        try:
            # Politeness delay
            time.sleep(CRAWL_SETTINGS['politeness_delay'])
            
            logger.info(f"Fetching: {url}")
            response = self.session.get(
                url,
                timeout=CRAWL_SETTINGS['timeout'],
                allow_redirects=True
            )
            response.raise_for_status()
            
            self.visited_urls.add(url)
            
            # Parse HTML
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Extract publication date
            pub_date = self._extract_date_from_page(soup, response.text)
            
            # Extract all links
            links = []
            for a_tag in soup.find_all('a', href=True):
                href = a_tag['href']
                absolute_url = urljoin(url, href)
                normalized = self._normalize_url(absolute_url)
                
                if self._is_valid_url(normalized, url) and normalized not in self.visited_urls:
                    links.append(normalized)
            
            return {
                'url': url,
                'html': response.text,
                'soup': soup,
                'publication_date': pub_date,
                'links': links,
                'encoding': response.encoding
            }
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching {url}: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error fetching {url}: {e}")
            return None
    
    def _init_selenium_driver(self):
        """Initialize Selenium WebDriver"""
        if self.driver is not None:
            return
            
        try:
            chrome_options = Options()
            if SELENIUM_SETTINGS['headless']:
                chrome_options.add_argument('--headless')
            
            for option in SELENIUM_SETTINGS['chrome_options']:
                chrome_options.add_argument(option)
            
            self.driver = webdriver.Chrome(options=chrome_options)
            self.driver.set_window_size(*SELENIUM_SETTINGS['window_size'])
            logger.info("Selenium WebDriver initialized")
            
        except Exception as e:
            logger.error(f"Failed to initialize Selenium: {e}")
            raise
    
    def fetch_dynamic_page(self, url: str) -> Optional[Dict]:
        """
        Fetch a dynamic page using Selenium
        """
        if url in self.visited_urls:
            return None
            
        if not self._can_fetch(url):
            logger.info(f"Blocked by robots.txt: {url}")
            return None
        
        try:
            self._init_selenium_driver()
            
            # Politeness delay
            time.sleep(CRAWL_SETTINGS['politeness_delay'])
            
            logger.info(f"Fetching (Selenium): {url}")
            self.driver.get(url)
            
            # Wait for page to load
            WebDriverWait(self.driver, SELENIUM_SETTINGS['timeout']).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )
            
            # Additional wait for dynamic content
            time.sleep(2)
            
            # Get page source
            html = self.driver.page_source
            soup = BeautifulSoup(html, 'html.parser')
            
            self.visited_urls.add(url)
            
            # Extract publication date
            pub_date = self._extract_date_from_page(soup, html)
            
            # Extract links
            links = []
            for a_tag in soup.find_all('a', href=True):
                href = a_tag['href']
                absolute_url = urljoin(url, href)
                normalized = self._normalize_url(absolute_url)
                
                if self._is_valid_url(normalized, url) and normalized not in self.visited_urls:
                    links.append(normalized)
            
            return {
                'url': url,
                'html': html,
                'soup': soup,
                'publication_date': pub_date,
                'links': links,
                'encoding': 'utf-8'
            }
            
        except Exception as e:
            logger.error(f"Error fetching {url} with Selenium: {e}")
            return None
    
    def crawl_site(self, start_url: str, max_pages: int = None, use_selenium: bool = False) -> List[Dict]:
        """
        Crawl a website starting from start_url
        """
        if max_pages is None:
            max_pages = CRAWL_SETTINGS['max_pages_per_site']
        
        to_visit = [start_url]
        crawled_pages = []
        
        logger.info(f"Starting crawl of {start_url} (max {max_pages} pages)")
        
        while to_visit and len(crawled_pages) < max_pages:
            url = to_visit.pop(0)
            
            if url in self.visited_urls:
                continue
            
            # Fetch page
            if use_selenium:
                page_data = self.fetch_dynamic_page(url)
            else:
                page_data = self.fetch_static_page(url)
            
            if page_data:
                crawled_pages.append(page_data)
                
                # Add new links to queue
                for link in page_data['links']:
                    if link not in self.visited_urls and link not in to_visit:
                        to_visit.append(link)
                
                logger.info(f"Crawled {len(crawled_pages)}/{max_pages} pages, {len(to_visit)} in queue")
        
        logger.info(f"Completed crawl of {start_url}: {len(crawled_pages)} pages")
        return crawled_pages
    
    def close(self):
        """Clean up resources"""
        if self.driver:
            self.driver.quit()
        self.session.close()
        logger.info("Crawler resources closed")
