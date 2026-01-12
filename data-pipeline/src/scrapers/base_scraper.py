import requests
from abc import ABC, abstractmethod
from typing import List, Dict, Any
import time
from ..utils.logger import setup_logger
from ..utils.config import config

class BaseScraper(ABC):
    def __init__(self, name: str):
        self.name = name
        self.logger = setup_logger(f"scraper.{name}")
        self.base_url = config.get(f"scraping.sites.{name}.base_url")
        self.delay = config.get(f"scraping.sites.{name}.delay", 2)
        self.user_agent = config.get("scraping.user_agent", "StratAxis-Bot/1.0")
        self.headers = {"User-Agent": self.user_agent}

    def _get(self, url: str) -> str:
        """Helper to make GET requests with retries and delay"""
        retries = 3
        for i in range(retries):
            try:
                response = requests.get(url, headers=self.headers, timeout=30)
                response.raise_for_status()
                time.sleep(self.delay)
                return response.text
            except Exception as e:
                self.logger.error(f"Error fetching {url}: {e}")
                if i < retries - 1:
                    time.sleep(self.delay * (i + 1))
                else:
                    raise
        return ""

    @abstractmethod
    def scrape(self) -> List[Dict[str, Any]]:
        """Main scraping method to be implemented by subclasses"""
        pass

    def normalize(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Standardize the scraped data to match the project schema"""
        # Basic normalization, can be overridden
        return {
            "title": data.get("title"),
            "price": data.get("price"),
            "location": data.get("location"),
            "property_type": data.get("property_type"),
            "size": data.get("size"),
            "bedrooms": data.get("bedrooms"),
            "bathrooms": data.get("bathrooms"),
            "images": data.get("images", []),
            "source_url": data.get("source_url"),
            "scraped_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        }
