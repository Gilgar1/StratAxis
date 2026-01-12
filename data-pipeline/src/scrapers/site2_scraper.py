from .base_scraper import BaseScraper
from typing import List, Dict, Any
from bs4 import BeautifulSoup
import re

class Site2Scraper(BaseScraper):
    """
    Scraper for Site 2 (Reference: hypothetical Cameroonian portal 'ImmobilierCameroun')
    Targeting luxury and residential properties.
    """
    def __init__(self):
        super().__init__("site2")

    def scrape(self) -> List[Dict[str, Any]]:
        self.logger.info(f"Starting scrape for {self.name}")
        url = f"{self.base_url}/search"
        html = self._get(url)
        if not html:
            return []
            
        soup = BeautifulSoup(html, 'html.parser')
        listings = []
        
        # Site 2 specific grid selectors
        items = soup.select(".property-grid .property-card")
        
        for item in items:
            try:
                title = item.find("h2").get_text(strip=True)
                price_text = item.select_one(".property-price").get_text(strip=True)
                features = item.select_one(".property-features").get_text()
                
                raw_data = {
                    "title": title,
                    "price": self._clean_currency(price_text),
                    "location": item.select_one(".property-location").get_text(strip=True),
                    "property_type": self._map_type(title),
                    "size": self._extract_area(features),
                    "bedrooms": self._extract_beds(features),
                    "source_url": item.find("a")["href"],
                    "images": [img["data-src"] for img in item.select("img[data-src]")]
                }
                
                listings.append(self.normalize(raw_data))
            except Exception as e:
                self.logger.error(f"Error parsing Site2 item: {e}")
                
        return listings

    def _clean_currency(self, text: str) -> float:
        return float(re.sub(r"[^\d]", "", text))

    def _map_type(self, title: str) -> str:
        title = title.lower()
        if any(kw in title for kw in ["studio", "appt", "chambre"]): return "apartment"
        if any(kw in title for kw in ["duplex", "villa", "maison"]): return "house"
        return "other"

    def _extract_area(self, text: str) -> float:
        match = re.search(r"(\d+)\s*m2", text, re.IGNORECASE)
        return float(match.group(1)) if match else 0.0

    def _extract_beds(self, text: str) -> int:
        match = re.search(r"(\d+)\s*chambre", text, re.IGNORECASE)
        return int(match.group(1)) if match else 0
