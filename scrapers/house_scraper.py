"""
StratAxis — scrapers/house_scraper.py
Production rent / residential property scraper.

Targets Cameroonian real estate listing sites.
Outputs: data/raw/rent_listings_<timestamp>.csv

Flow:
  Run this script → data/raw/ → run data/cleaned/clean_rent.py → Supabase
"""

import os
import csv
import time
import random
import logging
import requests
import hashlib
from datetime import datetime
from typing import Optional
from bs4 import BeautifulSoup
from dataclasses import dataclass, field, asdict

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [HOUSE-SCRAPER] %(levelname)s — %(message)s",
)
logger = logging.getLogger("strataxis.house_scraper")

# ─────────────────────────────────────────────
# Config
# ─────────────────────────────────────────────
RAW_OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "raw")
os.makedirs(RAW_OUTPUT_DIR, exist_ok=True)

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}

# Target sites — add real Cameroonian sites here
SCRAPE_TARGETS = [
    {
        "name": "jumia_house",
        "base_url": "https://house.jumia.cm",
        "listing_path": "/en/for-rent/",
        "pagination_param": "page",
        "max_pages": 10,
        "delay": (2, 4),
    },
    {
        "name": "afribaba_cm",
        "base_url": "https://www.afribaba.cm",
        "listing_path": "/immobilier/location/",
        "pagination_param": "page",
        "max_pages": 10,
        "delay": (2, 4),
    },
]


# ─────────────────────────────────────────────
# Data model
# ─────────────────────────────────────────────
@dataclass
class RentListing:
    title: str = ""
    price: Optional[float] = None
    price_raw: str = ""
    city: str = ""
    neighborhood: str = ""
    housing_type: str = ""
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    size_m2: Optional[float] = None
    description: str = ""
    source_url: str = ""
    source_name: str = ""
    record_id: str = ""
    scraped_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())

    def generate_id(self):
        raw = f"{self.source_name}|{self.source_url}|{self.title}"
        self.record_id = hashlib.md5(raw.encode()).hexdigest()


# ─────────────────────────────────────────────
# Normalization helpers
# ─────────────────────────────────────────────
def _parse_price(raw: str) -> Optional[float]:
    """Extract numeric price from strings like '150 000 FCFA', '1.5M XAF'."""
    import re
    raw = raw.upper().replace("\xa0", " ").replace(",", "").strip()
    multiplier = 1
    if "M " in raw or raw.endswith("M"):
        multiplier = 1_000_000
        raw = raw.replace("M", "")
    elif "K" in raw:
        multiplier = 1_000
        raw = raw.replace("K", "")
    nums = re.findall(r"[\d\s]+", raw)
    if not nums:
        return None
    try:
        return float(nums[0].replace(" ", "")) * multiplier
    except ValueError:
        return None


def _detect_city(text: str) -> str:
    text_lower = text.lower()
    if "douala" in text_lower:
        return "Douala"
    if "yaounde" in text_lower or "yaoundé" in text_lower:
        return "Yaounde"
    return ""


def _detect_housing_type(text: str) -> str:
    text_lower = text.lower()
    for t in ["studio", "villa", "apartment", "appartement", "maison", "house", "duplex"]:
        if t in text_lower:
            mapping = {
                "appartement": "apartment",
                "maison": "house",
            }
            return mapping.get(t, t)
    return "unknown"


# ─────────────────────────────────────────────
# Generic scraper
# ─────────────────────────────────────────────
def scrape_site(target: dict) -> list[RentListing]:
    """
    Scrapes a listing site using BeautifulSoup.
    Attempts multiple CSS selector patterns to maximize coverage.
    """
    listings: list[RentListing] = []
    base_url = target["base_url"]
    delay_range = target.get("delay", (2, 4))
    session = requests.Session()
    session.headers.update(HEADERS)

    for page in range(1, target["max_pages"] + 1):
        url = f"{base_url}{target['listing_path']}?{target['pagination_param']}={page}"
        logger.info(f"Fetching page {page}: {url}")

        try:
            resp = session.get(url, timeout=15)
            resp.raise_for_status()
        except requests.RequestException as e:
            logger.warning(f"Request failed for {url}: {e}")
            break

        soup = BeautifulSoup(resp.text, "html.parser")

        # Try common listing card selectors
        cards = (
            soup.select(".property-item")
            or soup.select(".listing-card")
            or soup.select(".ad-item")
            or soup.select("article.property")
            or soup.select("[data-listing]")
        )

        if not cards:
            logger.info(f"No cards found on page {page}, stopping.")
            break

        for card in cards:
            listing = RentListing(source_name=target["name"])

            # Title
            title_el = (
                card.select_one("h2")
                or card.select_one("h3")
                or card.select_one(".title")
                or card.select_one(".property-title")
            )
            listing.title = title_el.get_text(strip=True) if title_el else ""

            # Price
            price_el = (
                card.select_one(".price")
                or card.select_one("[class*='price']")
                or card.select_one(".cost")
            )
            if price_el:
                listing.price_raw = price_el.get_text(strip=True)
                listing.price = _parse_price(listing.price_raw)

            # Location
            loc_el = (
                card.select_one(".location")
                or card.select_one("[class*='location']")
                or card.select_one(".address")
            )
            location_text = loc_el.get_text(strip=True) if loc_el else ""
            listing.city = _detect_city(location_text or listing.title)
            listing.neighborhood = location_text

            # Type
            listing.housing_type = _detect_housing_type(listing.title)

            # URL
            link = card.select_one("a[href]")
            if link:
                href = link["href"]
                listing.source_url = href if href.startswith("http") else base_url + href

            listing.generate_id()

            if listing.title:
                listings.append(listing)

        logger.info(f"  → Scraped {len(cards)} cards from page {page}")
        sleep_time = random.uniform(*delay_range)
        time.sleep(sleep_time)

    logger.info(f"Total listings from {target['name']}: {len(listings)}")
    return listings


# ─────────────────────────────────────────────
# CSV Export
# ─────────────────────────────────────────────
def save_to_csv(listings: list[RentListing], filename: str):
    if not listings:
        logger.warning("No listings to save.")
        return

    filepath = os.path.join(RAW_OUTPUT_DIR, filename)
    fieldnames = list(asdict(listings[0]).keys())

    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for l in listings:
            writer.writerow(asdict(l))

    logger.info(f"Saved {len(listings)} listings → {filepath}")
    return filepath


# ─────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────
def run():
    all_listings: list[RentListing] = []
    for target in SCRAPE_TARGETS:
        try:
            results = scrape_site(target)
            all_listings.extend(results)
        except Exception as e:
            logger.error(f"Error scraping {target['name']}: {e}")

    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    output_file = f"rent_listings_{timestamp}.csv"
    save_to_csv(all_listings, output_file)

    logger.info(f"=== House Scraper complete. Total: {len(all_listings)} listings ===")
    return all_listings


if __name__ == "__main__":
    run()
