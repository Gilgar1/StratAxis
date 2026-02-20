"""
StratAxis - Mapiole.com Scraper
"""

from typing import List, Dict
import re
from .base_scraper import BaseScraper


class MapioleScraper(BaseScraper):
    """Scraper for mapiole.com"""
    
    def __init__(self):
        super().__init__('mapiole', 'https://www.mapiole.com/')
    
    def scrape(self) -> List[Dict]:
        """
        Scrape land listings from Mapiole
        
        Returns:
            List of land listings
        """
        listings = []
        
        # Target cities
        cities = {
            'Douala': 'douala',
            'Yaoundé': 'yaounde'
        }
        
        for city_name, city_slug in cities.items():
            self.logger.info(f"Scraping {city_name} listings from Mapiole...")
            
            # Mapiole typically has a search/filter structure
            # This is a template - actual implementation depends on site structure
            search_url = f"{self.base_url}recherche?ville={city_slug}&type=terrain"
            
            html = self._fetch_page(search_url)
            if not html:
                continue
            
            soup = self._parse_html(html)
            
            # Find listing cards (adjust selectors based on actual HTML)
            listing_cards = soup.find_all('div', class_=re.compile(r'listing|property|annonce', re.I))
            
            self.logger.info(f"Found {len(listing_cards)} potential listings for {city_name}")
            
            for card in listing_cards:
                try:
                    listing = self._extract_listing(card, city_name)
                    if listing:
                        listings.append(listing)
                except Exception as e:
                    self.logger.debug(f"Error extracting listing: {e}")
                    continue
            
            self._delay()
        
        self.logger.info(f"Mapiole scraping complete: {len(listings)} listings extracted")
        return listings
    
    def _extract_listing(self, card, city: str) -> Dict:
        """
        Extract listing data from a listing card
        
        Args:
            card: BeautifulSoup element containing listing
            city: City name
        
        Returns:
            Dictionary with listing data or None
        """
        # Extract price
        price_elem = card.find(['span', 'div', 'p'], class_=re.compile(r'price|prix', re.I))
        price_raw = price_elem.get_text(strip=True) if price_elem else None
        
        # Extract land size
        size_elem = card.find(['span', 'div', 'p'], string=re.compile(r'm²|superficie|surface', re.I))
        land_size_raw = size_elem.get_text(strip=True) if size_elem else None
        
        # Extract neighborhood
        location_elem = card.find(['span', 'div', 'p'], class_=re.compile(r'location|quartier', re.I))
        neighborhood = location_elem.get_text(strip=True) if location_elem else "Unknown"
        
        # Extract listing URL
        link_elem = card.find('a', href=True)
        listing_url = link_elem['href'] if link_elem else None
        if listing_url and not listing_url.startswith('http'):
            listing_url = self.base_url.rstrip('/') + '/' + listing_url.lstrip('/')
        
        # Only return if we have minimum required fields
        if price_raw and land_size_raw:
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
