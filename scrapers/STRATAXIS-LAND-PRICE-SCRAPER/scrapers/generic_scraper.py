"""
StratAxis - Generic Scraper Template
Use this as a template for websites without custom scrapers
"""

from typing import List, Dict
import re
from .base_scraper import BaseScraper


class GenericScraper(BaseScraper):
    """
    Generic scraper using common patterns
    Works for sites with standard listing structure
    """
    
    def scrape(self) -> List[Dict]:
        """
        Scrape land listings using generic patterns
        
        Returns:
            List of land listings
        """
        listings = []
        
        self.logger.info(f"Scraping {self.site_name} with generic scraper...")
        
        # Try to fetch main page
        html = self._fetch_page(self.base_url)
        if not html:
            self.logger.warning(f"Could not fetch {self.site_name}")
            return listings
        
        soup = self._parse_html(html)
        
        # Look for common listing container patterns
        possible_containers = [
            soup.find_all('div', class_=re.compile(r'listing|property|annonce|item', re.I)),
            soup.find_all('article', class_=re.compile(r'listing|property|annonce|item', re.I)),
            soup.find_all('li', class_=re.compile(r'listing|property|annonce|item', re.I)),
        ]
        
        listing_cards = []
        for containers in possible_containers:
            if containers:
                listing_cards = containers
                break
        
        self.logger.info(f"Found {len(listing_cards)} potential listings on {self.site_name}")
        
        for card in listing_cards:
            try:
                listing = self._extract_listing_generic(card)
                if listing:
                    listings.append(listing)
            except Exception as e:
                self.logger.debug(f"Error extracting listing: {e}")
                continue
        
        self.logger.info(f"{self.site_name} scraping complete: {len(listings)} listings extracted")
        return listings
    
    def _extract_listing_generic(self, card) -> Dict:
        """
        Extract listing using generic patterns
        
        Args:
            card: BeautifulSoup element
        
        Returns:
            Listing dictionary or None
        """
        # Extract price - look for currency patterns
        price_raw = None
        price_patterns = [r'fcfa', r'cfa', r'xaf', r'\d+\s*million', r'\d+\s*m\s']
        for pattern in price_patterns:
            price_elem = card.find(string=re.compile(pattern, re.I))
            if price_elem:
                price_raw = price_elem.strip()
                break
        
        # Extract land size - look for m² or hectare
        land_size_raw = None
        size_patterns = [r'm²', r'sqm', r'hectare', r'ha\s']
        for pattern in size_patterns:
            size_elem = card.find(string=re.compile(pattern, re.I))
            if size_elem:
                land_size_raw = size_elem.strip()
                break
        
        # Extract city - look for Douala or Yaoundé
        city = None
        city_text = card.get_text()
        if 'douala' in city_text.lower():
            city = 'Douala'
        elif 'yaound' in city_text.lower() or 'yaounde' in city_text.lower():
            city = 'Yaoundé'
        
        # Extract neighborhood - difficult without site-specific knowledge
        neighborhood = "Unknown"
        
        # Extract URL
        link_elem = card.find('a', href=True)
        listing_url = link_elem['href'] if link_elem else None
        if listing_url and not listing_url.startswith('http'):
            listing_url = self.base_url.rstrip('/') + '/' + listing_url.lstrip('/')
        
        # Only return if we have minimum data
        if price_raw and land_size_raw and city:
            return {
                'city': city,
                'neighborhood': neighborhood,
                'price_raw': price_raw,
                'land_size_raw': land_size_raw,
                'listing_date': None,
                'source_site': self.site_name,
                'listing_url': listing_url
            }
        
        return None
