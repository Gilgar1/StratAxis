"""
StratAxis Land Price Intelligence - Configuration
"""

import os
from pathlib import Path

# Project Paths
BASE_DIR = Path(__file__).resolve().parent.parent
OUTPUT_DIR = BASE_DIR / "output"
LOGS_DIR = BASE_DIR / "logs"
DATA_DIR = BASE_DIR / "data"

# Create directories
for directory in [OUTPUT_DIR, LOGS_DIR, DATA_DIR]:
    directory.mkdir(exist_ok=True)

# Geographic Scope
TARGET_CITIES = ["Douala", "Yaoundé"]

# Property Type
PROPERTY_TYPE = "land"

# Target Websites
TARGET_WEBSITES = [
    # Major Real Estate Platforms
    {"name": "mapiole", "url": "https://www.mapiole.com/", "enabled": True},
    {"name": "koutchoumi", "url": "https://koutchoumi.com/", "enabled": True},
    {"name": "keur_immo", "url": "https://keur-immo.com/en/cameroon/", "enabled": True},
    {"name": "geloka", "url": "https://www.geloka.com/en", "enabled": True},
    {"name": "adpm", "url": "https://adpmrealestate.com/", "enabled": True},
    {"name": "coinafrique", "url": "https://cm.coinafrique.com/categorie/immobilier", "enabled": True},
    {"name": "homecm", "url": "https://www.homecm.online/", "enabled": True},
    {"name": "camerounmaison", "url": "https://camerounmaison.com/", "enabled": True},
    {"name": "weetyu", "url": "https://weetyu.com/", "enabled": True},
    {"name": "cameroonproperty", "url": "https://www.cameroonproperty.com/", "enabled": True},
    {"name": "realting", "url": "https://realting.com/cameroon/property", "enabled": True},
    {"name": "4321property", "url": "https://www.4321property.com/cameroon/", "enabled": True},
    
    # Classifieds & Social
    {"name": "jumia", "url": "https://deals.jumia.cm/immobilier", "enabled": True},
    {"name": "expat", "url": "https://www.expat.com/en/housing/africa/cameroon/", "enabled": True},
    {"name": "afribaba", "url": "https://www.afribaba.cm/c-immobilier", "enabled": True},
    
    # Professional Agencies
    {"name": "secpe", "url": "https://www.secpeinvestments.com/listings/", "enabled": True},
    {"name": "tesla", "url": "https://www.groupetesla.com/", "enabled": True},
    {"name": "diamond", "url": "https://www.diamondrealty.estate/", "enabled": True},
    {"name": "c2c", "url": "https://c2cmentors.com/search-cameroon-properties/", "enabled": True},
    {"name": "a2m", "url": "https://immobiliera2m.com/", "enabled": True},
    {"name": "abbas", "url": "https://www.abbasimmob.cm/", "enabled": True},
    {"name": "logementsducam", "url": "https://www.logementsducam.com/", "enabled": True},
    {"name": "sohaing", "url": "https://groupesohaing.com/our-business/real-estate/", "enabled": True},
    {"name": "sci_limmobilier", "url": "https://www.sci-limmobilier.com/", "enabled": True},
    {"name": "cameroonrealtors", "url": "https://cameroonrealtors.com/", "enabled": True},
    
    # Directories
    {"name": "walazouo", "url": "https://cm.walazouo.com/en/agencies", "enabled": True},
    {"name": "goafrica", "url": "https://www.goafricaonline.com/cm/annuaire/agences-immobilieres", "enabled": True},
    {"name": "yellowpages", "url": "https://www.yellowpages.cm/category/real-estate-agencies", "enabled": True},
]

# Data Quality Thresholds
MIN_LISTING_COUNT_PER_NEIGHBORHOOD = 3
IQR_MULTIPLIER = 1.5  # For outlier detection

# Scraping Settings
REQUEST_TIMEOUT = 30  # seconds
REQUEST_DELAY_MIN = 2  # seconds
REQUEST_DELAY_MAX = 5  # seconds
MAX_RETRIES = 3
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

# Output Settings
OUTPUT_CSV = OUTPUT_DIR / "land_prices_intelligence.csv"
OUTPUT_JSON = OUTPUT_DIR / "land_prices_intelligence.json"
OUTPUT_RAW_CSV = OUTPUT_DIR / "raw_listings.csv"

# Logging
LOG_LEVEL = "INFO"
LOG_FORMAT = "%(log_color)s%(asctime)s - %(name)s - %(levelname)s - %(message)s%(reset)s"
LOG_FILE = LOGS_DIR / "scraping_pipeline.log"
