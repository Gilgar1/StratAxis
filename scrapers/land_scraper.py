"""
StratAxis — scrapers/land_scraper.py
Production land price scraper for Douala and Yaoundé.

Targets: Real estate listing sites with land/plot listings.
Outputs: data/raw/land_listings_<timestamp>.csv

Flow:
  Run this script → data/raw/ → run data/cleaned/clean_land.py → Supabase
"""

import os
import re
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
    format="%(asctime)s [LAND-SCRAPER] %(levelname)s — %(message)s",
)
logger = logging.getLogger("strataxis.land_scraper")

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
}

SCRAPE_TARGETS = [
    {
        "name": "jumia_land",
        "base_url": "https://house.jumia.cm",
        "listing_path": "/en/for-sale/land/",
        "pagination_param": "page",
        "max_pages": 15,
        "delay": (2, 5),
        "property_type": "land",
    },
    {
        "name": "expat_dakar_cm",
        "base_url": "https://www.expat-dakar.com",
        "listing_path": "/cameroun/terrains-a-vendre/",
        "pagination_param": "page",
        "max_pages": 10,
        "delay": (2, 4),
        "property_type": "land",
    },
]

# Known neighborhood → city mapping (Cameroon)
NEIGHBORHOOD_CITY_MAP = {
    # Douala neighborhoods
    "bonanjo": "Douala", "akwa": "Douala", "deido": "Douala",
    "bali": "Douala", "bonaberi": "Douala", "makepe": "Douala",
    "logbessou": "Douala", "pk8": "Douala", "pk10": "Douala",
    "pk12": "Douala", "pk14": "Douala", "bonamoussadi": "Douala",
    "kotto": "Douala", "ndokotti": "Douala", "bonapriso": "Douala",
    "bassa": "Douala", "nyalla": "Douala",
    # Yaoundé neighborhoods
    "bastos": "Yaounde", "nlongkak": "Yaounde", "mvan": "Yaounde",
    "essos": "Yaounde", "oyom abang": "Yaounde", "nkomo": "Yaounde",
    "mvog ada": "Yaounde", "mvog mbi": "Yaounde", "biyem assi": "Yaounde",
    "nsimeyong": "Yaounde", "mfandena": "Yaounde", "mendong": "Yaounde",
    "odza": "Yaounde", "omnisport": "Yaounde", "elig edzoa": "Yaounde",
}


# ─────────────────────────────────────────────
# Data model
# ─────────────────────────────────────────────
@dataclass
class LandListing:
    title: str = ""
    total_price: Optional[float] = None
    price_raw: str = ""
    lot_size_m2: Optional[float] = None
    size_raw: str = ""
    price_per_m2: Optional[float] = None
    city: str = ""
    neighborhood: str = ""
    property_type: str = "land"
    description: str = ""
    source_url: str = ""
    source_name: str = ""
    record_id: str = ""
    scraped_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())

    def compute_price_per_m2(self):
        if self.total_price and self.lot_size_m2 and self.lot_size_m2 > 0:
            self.price_per_m2 = round(self.total_price / self.lot_size_m2, 2)

    def generate_id(self):
        raw = f"{self.source_name}|{self.source_url}|{self.title}"
        self.record_id = hashlib.md5(raw.encode()).hexdigest()


# ─────────────────────────────────────────────
# Parsing helpers
# ─────────────────────────────────────────────
def _parse_price(raw: str) -> Optional[float]:
    raw = raw.upper().replace("\xa0", " ").replace(",", "").strip()
    multiplier = 1
    if "MILLION" in raw or raw.count("M ") > 0:
        multiplier = 1_000_000
    elif "MILLIARD" in raw:
        multiplier = 1_000_000_000
    raw = re.sub(r"[A-Z\s]+", "", raw)
    nums = re.findall(r"[\d.]+", raw)
    try:
        return float(nums[0]) * multiplier if nums else None
    except ValueError:
        return None


def _parse_size(raw: str) -> Optional[float]:
    """Parse lot size from text like '500 m²', '0.5 ha', '1500sqm'."""
    raw_lower = raw.lower()
    if "ha" in raw_lower or "hectare" in raw_lower:
        # Convert hectares to m²
        nums = re.findall(r"[\d.]+", raw)
        try:
            return float(nums[0]) * 10_000 if nums else None
        except ValueError:
            return None
    nums = re.findall(r"[\d.]+", raw)
    try:
        return float(nums[0]) if nums else None
    except ValueError:
        return None


def _detect_city(text: str) -> str:
    text_lower = text.lower()
    if "douala" in text_lower:
        return "Douala"
    if "yaounde" in text_lower or "yaoundé" in text_lower:
        return "Yaounde"
    # Try neighborhood mapping
    for nbhd, city in NEIGHBORHOOD_CITY_MAP.items():
        if nbhd in text_lower:
            return city
    return ""


def _detect_neighborhood(text: str) -> str:
    text_lower = text.lower()
    for nbhd in NEIGHBORHOOD_CITY_MAP:
        if nbhd in text_lower:
            return nbhd.title()
    return text.split(",")[0].strip() if text else ""


# ─────────────────────────────────────────────
# Generic scraper
# ─────────────────────────────────────────────
def scrape_site(target: dict) -> list[LandListing]:
    listings: list[LandListing] = []
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

        cards = (
            soup.select(".property-item")
            or soup.select(".listing-card")
            or soup.select(".ad-item")
            or soup.select("article.property")
            or soup.select("li.classified")
        )

        if not cards:
            logger.info(f"No cards on page {page}, stopping.")
            break

        for card in cards:
            listing = LandListing(source_name=target["name"])

            # Title
            title_el = card.select_one("h2") or card.select_one("h3") or card.select_one(".title")
            listing.title = title_el.get_text(strip=True) if title_el else ""

            # Price
            price_el = (
                card.select_one(".price")
                or card.select_one("[class*='price']")
                or card.select_one(".cost")
            )
            if price_el:
                listing.price_raw = price_el.get_text(strip=True)
                listing.total_price = _parse_price(listing.price_raw)

            # Size
            size_el = (
                card.select_one(".surface")
                or card.select_one("[class*='size']")
                or card.select_one("[class*='area']")
            )
            if size_el:
                listing.size_raw = size_el.get_text(strip=True)
                listing.lot_size_m2 = _parse_size(listing.size_raw)
            else:
                # Try to extract from title/description
                size_match = re.search(
                    r"(\d[\d\s]*)\s*(m²|m2|sqm|ha)", listing.title, re.IGNORECASE
                )
                if size_match:
                    listing.size_raw = size_match.group(0)
                    listing.lot_size_m2 = _parse_size(listing.size_raw)

            # Location
            loc_el = (
                card.select_one(".location")
                or card.select_one("[class*='location']")
                or card.select_one(".address")
            )
            location_text = loc_el.get_text(strip=True) if loc_el else ""
            combined_text = f"{listing.title} {location_text}"
            listing.city = _detect_city(combined_text)
            listing.neighborhood = _detect_neighborhood(location_text or listing.title)

            # URL
            link = card.select_one("a[href]")
            if link:
                href = link["href"]
                listing.source_url = href if href.startswith("http") else base_url + href

            listing.compute_price_per_m2()
            listing.generate_id()

            if listing.title and listing.city:
                listings.append(listing)

        logger.info(f"  → Scraped {len(cards)} cards from page {page}")
        time.sleep(random.uniform(*delay_range))

    logger.info(f"Total land listings from {target['name']}: {len(listings)}")
    return listings


# ─────────────────────────────────────────────
# CSV Export
# ─────────────────────────────────────────────
def save_to_csv(listings: list[LandListing], filename: str):
    if not listings:
        logger.warning("No land listings to save.")
        return

    filepath = os.path.join(RAW_OUTPUT_DIR, filename)
    fieldnames = list(asdict(listings[0]).keys())

    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for l in listings:
            writer.writerow(asdict(l))

    logger.info(f"Saved {len(listings)} land listings → {filepath}")
    return filepath


# ─────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────
def run():
    all_listings: list[LandListing] = []
    for target in SCRAPE_TARGETS:
        try:
            results = scrape_site(target)
            all_listings.extend(results)
        except Exception as e:
            logger.error(f"Error scraping {target['name']}: {e}")

    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    output_file = f"land_listings_{timestamp}.csv"
    save_to_csv(all_listings, output_file)

    logger.info(f"=== Land Scraper complete. Total: {len(all_listings)} listings ===")
    return all_listings


if __name__ == "__main__":
    run()
