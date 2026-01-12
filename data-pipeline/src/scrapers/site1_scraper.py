from .base_scraper import BaseScraper
from typing import List, Dict, Any
from bs4 import BeautifulSoup
import re

class Site1Scraper(BaseScraper):
    """
    Scraper for Site 1 (Reference: hypothetical Cameroonian portal 'CamerAnnonces')
    Targeting Yaoundé and Douala property listings.
    """
    def __init__(self):
        super().__init__("site1")

    def scrape(self) -> List[Dict[str, Any]]:
        self.logger.info(f"Starting scrape for {self.name}")
        url = f"{self.base_url}/immobilier"
        html = self._get(url)
        if not html:
            return []
            
        soup = BeautifulSoup(html, 'html.parser')
        listings = []
        
        # Optimized selectors for the target portal
        containers = soup.select(".listing-container, .ads-list .item")
        
        for item in containers:
            try:
                title_elem = item.select_one(".title, h3")
                price_elem = item.select_one(".price, .cost")
                loc_elem = item.select_one(".location, .city")
                
                if not title_elem:
                    continue
                
                raw_data = {
                    "title": title_elem.get_text(strip=True),
                    "price": self._parse_price(price_elem.get_text(strip=True)) if price_elem else None,
                    "location": loc_elem.get_text(strip=True) if loc_elem else "Unknown",
                    "property_type": self._detect_property_type(title_elem.get_text()),
                    "size": self._extract_size(item.get_text()),
                    "source_url": title_elem.find("a")["href"] if title_elem.find("a") else url,
                    "images": [img["src"] for img in item.select("img") if img.get("src")]
                }
                
                listings.append(self.normalize(raw_data))
            except Exception as e:
                self.logger.warning(f"Failed to parse item: {e}")
        
        self.logger.info(f"Scraped {len(listings)} records from {self.name}")
        return listings

    def _parse_price(self, text: str) -> float:
        # Extract digits and handle 'XAF', 'FCFA', etc.
        digits = re.sub(r"[^\d]", "", text)
        return float(digits) if digits else 0.0

    def _detect_property_type(self, text: str) -> str:
        text = text.lower()
        if "appartement" in text: return "apartment"
        if "maison" in text or "villa" in text: return "house"
        if "terrain" in text or "lot" in text: return "land"
        if "bureau" in text or "commerce" in text: return "commercial"
        return "other"

    def _extract_size(self, text: str) -> float:
        # Look for patterns like '150 m2' or '150m²'
        match = re.search(r"(\d+)\s*m[²2]", text)
        return float(match.group(1)) if match else 0.0
