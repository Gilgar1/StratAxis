from .site1_scraper import Site1Scraper
from .base_scraper import BaseScraper
from typing import Dict, Type

class ScraperFactory:
    _scrapers: Dict[str, Type[BaseScraper]] = {
        "site1": Site1Scraper,
        # "site2": Site2Scraper, # To be implemented
    }

    @classmethod
    def get_scraper(cls, name: str) -> BaseScraper:
        scraper_class = cls._scrapers.get(name)
        if not scraper_class:
            raise ValueError(f"No scraper found for name: {name}")
        return scraper_class()

    @classmethod
    def get_all_scrapers(cls):
        return [scraper_class() for scraper_class in cls._scrapers.values()]
