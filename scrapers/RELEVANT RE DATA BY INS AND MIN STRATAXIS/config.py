"""
StratAxis - Cameroon Real Estate Intelligence Engine
Configuration Module
"""

from datetime import datetime

# Date range filter (inclusive)
START_DATE = datetime(2020, 1, 1)
END_DATE = datetime(2026, 12, 31)

# Target institutions with their base URLs
INSTITUTIONS = {
    "Ministry of State Property, Surveys and Land Tenure": {
        "url": "http://www.mindaf.cm",
        "aliases": ["mindaf", "domaines", "cadastre"]
    },
    "Ministry of Housing and Urban Development": {
        "url": "http://www.minhdu.gov.cm",
        "aliases": ["minhdu", "habitat", "housing"]
    },
    "National Institute of Statistics": {
        "url": "http://www.statistics-cameroon.org",
        "aliases": ["ins", "bucrep", "statistics"]
    },
    "Société Immobilière du Cameroun": {
        "url": "http://www.sic-cm.com",
        "aliases": ["sic", "immobiliere"]
    },
    "Mission for the Development and Equipment of Urban & Rural Land": {
        "url": "http://www.maetur.cm",
        "aliases": ["maetur", "amenagement"]
    }
}

# Real estate intelligence keywords (multilingual: English & French)
KEYWORDS = {
    # Land & Property
    "land": ["land", "terre", "terrain", "foncier", "parcelle", "lot", "cadastre", "cadastral"],
    "housing": ["housing", "logement", "habitation", "résidence", "villa", "appartement", "immeuble"],
    "title": ["title", "titre", "deed", "acte", "ownership", "propriété"],
    
    # Development & Infrastructure
    "infrastructure": ["infrastructure", "route", "road", "bridge", "pont", "eau", "water", "electricité", "electricity"],
    "development": ["development", "développement", "aménagement", "urbanisation", "urbanization", "projet", "project"],
    "construction": ["construction", "building", "bâtiment", "permis", "permit", "chantier"],
    
    # Economic & Market
    "price": ["price", "prix", "coût", "cost", "valeur", "value", "tarif", "rate"],
    "market": ["market", "marché", "vente", "sale", "achat", "purchase", "location", "rental", "loyer", "rent"],
    "investment": ["investment", "investissement", "financement", "financing", "crédit", "credit"],
    
    # Administrative
    "allocation": ["allocation", "attribution", "concession", "lease", "bail"],
    "auction": ["auction", "enchère", "appel d'offres", "tender", "adjudication"],
    "regulation": ["regulation", "réglementation", "loi", "law", "décret", "decree", "arrêté", "ordinance"],
    "zoning": ["zoning", "zonage", "plan", "schéma", "master plan", "urban plan"],
    
    # Statistics & Data
    "statistics": ["statistics", "statistique", "données", "data", "census", "recensement", "enquête", "survey"],
    "population": ["population", "démographie", "demography", "habitant", "resident"],
    "indicator": ["indicator", "indicateur", "index", "indice", "trend", "tendance"]
}

# Document types to track
DOCUMENT_TYPES = [
    "pdf", "html", "doc", "docx", "xls", "xlsx", 
    "report", "press_release", "announcement", "decree", "law"
]

# Categories for classification
CATEGORIES = [
    "land", "housing", "infrastructure", "statistics", 
    "policy", "market_data", "development", "regulation"
]

# Regions of Cameroon
REGIONS = [
    "Adamaoua", "Centre", "East", "Est", "Far North", "Extrême-Nord",
    "Littoral", "North", "Nord", "Northwest", "Nord-Ouest", "West", "Ouest",
    "South", "Sud", "Southwest", "Sud-Ouest", "Douala", "Yaoundé", "Yaounde"
]

# Crawling settings
CRAWL_SETTINGS = {
    "max_depth": 5,  # Maximum crawl depth
    "politeness_delay": 2,  # Seconds between requests (rate limiting)
    "timeout": 30,  # Request timeout in seconds
    "max_retries": 3,  # Maximum retry attempts
    "user_agent": "StratAxis Real Estate Intelligence Bot/1.0 (Educational/Research Purpose)",
    "respect_robots_txt": True,
    "max_pages_per_site": 1000,  # Safety limit
}

# Selenium settings for dynamic content
SELENIUM_SETTINGS = {
    "headless": True,
    "timeout": 30,
    "window_size": (1920, 1080),
    "chrome_options": [
        "--no-sandbox",
        "--disable-dev-shm-usage",
        "--disable-blink-features=AutomationControlled",
        "--disable-gpu"
    ]
}

# PDF processing settings
PDF_SETTINGS = {
    "max_pdf_size_mb": 50,  # Skip PDFs larger than this
    "extract_text": True,
    "extract_tables": True,
    "download_directory": "strataxis_data/pdfs"
}

# Output settings
OUTPUT_SETTINGS = {
    "base_directory": "strataxis_data",
    "csv_filename": "strataxis_real_estate_intelligence_2020_2026.csv",
    "log_filename": "scraper.log",
    "encoding": "utf-8-sig"  # UTF-8 with BOM for Excel compatibility
}

# Logging configuration
LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "detailed": {
            "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
        }
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "level": "INFO",
            "formatter": "detailed"
        },
        "file": {
            "class": "logging.FileHandler",
            "filename": f"{OUTPUT_SETTINGS['base_directory']}/{OUTPUT_SETTINGS['log_filename']}",
            "level": "DEBUG",
            "formatter": "detailed"
        }
    },
    "root": {
        "level": "DEBUG",
        "handlers": ["console", "file"]
    }
}

# Relevance scoring weights
RELEVANCE_WEIGHTS = {
    "title_match": 3.0,
    "keyword_density": 2.0,
    "has_structured_data": 1.5,
    "is_pdf": 1.2,
    "recent_date": 1.0
}
