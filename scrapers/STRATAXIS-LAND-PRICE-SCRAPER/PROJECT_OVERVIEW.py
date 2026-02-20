"""
StratAxis Project Structure Visualization
"""

PROJECT_STRUCTURE = """
strataxis data two/
│
├── 📄 main.py                          # Main pipeline orchestrator
├── 📄 test_normalizers.py              # Test suite for normalization
├── 📄 requirements.txt                 # Python dependencies
├── 📄 .gitignore                       # Git ignore rules
│
├── 📚 README.md                        # Project overview
├── 📚 QUICKSTART.md                    # Getting started guide
├── 📚 TECHNICAL_DOCS.md                # Architecture documentation
│
├── 📁 config/                          # Configuration
│   ├── __init__.py
│   └── config.py                       # All settings and website list
│
├── 📁 scrapers/                        # Web scraping modules
│   ├── __init__.py
│   ├── base_scraper.py                 # Abstract base class
│   ├── mapiole_scraper.py              # Mapiole.com scraper
│   └── generic_scraper.py              # Generic fallback scraper
│
├── 📁 processors/                      # Data processing
│   ├── __init__.py
│   └── data_cleaner.py                 # Cleaning & normalization
│
├── 📁 aggregators/                     # Statistical aggregation
│   ├── __init__.py
│   └── intelligence_aggregator.py      # Neighborhood aggregation
│
├── 📁 utils/                           # Utilities
│   ├── __init__.py
│   ├── logger.py                       # Colored logging
│   └── text_normalizer.py              # Price/size/neighborhood normalization
│
├── 📁 output/                          # Generated files (created at runtime)
│   ├── land_prices_intelligence.csv    # Final intelligence (CSV)
│   ├── land_prices_intelligence.json   # Final intelligence (JSON)
│   └── raw_listings.csv                # All cleaned listings
│
├── 📁 logs/                            # Execution logs (created at runtime)
│   └── scraping_pipeline.log           # Detailed logs
│
└── 📁 data/                            # Data storage (created at runtime)
"""

MODULE_SUMMARY = """
KEY MODULES SUMMARY
===================

1. main.py (243 lines)
   - Pipeline orchestration
   - Coordinates scraping → cleaning → aggregation → export
   - Progress reporting and logging

2. scrapers/base_scraper.py (141 lines)
   - HTTP requests with retry logic
   - Selenium WebDriver management
   - Rate limiting (2-5s delays)
   - Error handling

3. utils/text_normalizer.py (181 lines)
   - PriceNormalizer: "50M FCFA" → 50000000.0
   - LandSizeNormalizer: "2 ha" → 20000.0
   - NeighborhoodNormalizer: "Bonapriso - DLA" → "Bonapriso"

4. processors/data_cleaner.py (126 lines)
   - Apply normalizers to raw data
   - Calculate price_per_sqm
   - Remove duplicates
   - IQR-based outlier removal

5. aggregators/intelligence_aggregator.py (97 lines)
   - Group by city + neighborhood
   - Calculate median, P25, P75
   - Assign confidence flags (High/Medium/Low)

6. config/config.py (71 lines)
   - 30+ website URLs
   - Target cities: Douala, Yaoundé
   - Quality thresholds
   - Scraping parameters

TOTAL: ~850 lines of production code
"""

DATA_FLOW = """
DATA FLOW PIPELINE
==================

┌─────────────────────────────────────────────────────────────────┐
│  STEP 1: SCRAPING (scrapers/)                                   │
│  ─────────────────────────────────────────────────────────────  │
│  Input:  30+ real estate websites                               │
│  Output: Raw listings                                           │
│          [{city, neighborhood, price_raw, land_size_raw, ...}]  │
│  Status: ~1000-5000 raw listings expected                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 2: NORMALIZATION (processors/data_cleaner.py)             │
│  ─────────────────────────────────────────────────────────────  │
│  Process:                                                        │
│  - price_raw → price_normalized_xaf (numeric)                   │
│  - land_size_raw → land_size_normalized_sqm (numeric)           │
│  - neighborhood → neighborhood_normalized (standardized)        │
│  - Calculate: price_per_sqm                                     │
│  Loss: ~20-30% (invalid/missing data)                           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 3: DEDUPLICATION (processors/data_cleaner.py)             │
│  ─────────────────────────────────────────────────────────────  │
│  Remove: Same neighborhood + similar price + similar size       │
│  Loss: ~5-10% (duplicates across sites)                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 4: OUTLIER REMOVAL (processors/data_cleaner.py)           │
│  ─────────────────────────────────────────────────────────────  │
│  Method: IQR with 1.5x multiplier                               │
│  Remove: Extreme prices (likely errors)                         │
│  Loss: ~5-15% (statistical outliers)                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 5: AGGREGATION (aggregators/intelligence_aggregator.py)   │
│  ─────────────────────────────────────────────────────────────  │
│  Group by: city + neighborhood                                  │
│  Calculate:                                                      │
│  - median_land_price_per_sqm_xaf                                │
│  - p25_land_price_per_sqm_xaf (25th percentile)                 │
│  - p75_land_price_per_sqm_xaf (75th percentile)                 │
│  - listing_count                                                │
│  - data_confidence_flag (High/Medium/Low)                       │
│  Output: ~30-60 neighborhoods                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 6: EXPORT (main.py)                                       │
│  ─────────────────────────────────────────────────────────────  │
│  Formats:                                                        │
│  - CSV: output/land_prices_intelligence.csv                     │
│  - JSON: output/land_prices_intelligence.json                   │
│  - Raw: output/raw_listings.csv (debug)                         │
└─────────────────────────────────────────────────────────────────┘
"""

WEBSITE_COVERAGE = """
WEBSITE COVERAGE (30+ Sites)
=============================

Major Real Estate Platforms:
  ✓ mapiole.com
  ✓ koutchoumi.com
  ✓ keur-immo.com
  ✓ geloka.com
  ✓ adpmrealestate.com
  ✓ coinafrique.com
  ✓ homecm.online
  ✓ camerounmaison.com
  ✓ weetyu.com
  ✓ cameroonproperty.com
  ✓ realting.com
  ✓ 4321property.com

Classifieds & Marketplaces:
  ✓ jumia.cm
  ✓ expat.com
  ✓ afribaba.cm

Professional Agencies (14 sites):
  ✓ secpeinvestments.com
  ✓ groupetesla.com
  ✓ diamondrealty.estate
  ✓ c2cmentors.com
  ✓ immobiliera2m.com
  ✓ abbasimmob.cm
  ✓ logementsducam.com
  ✓ groupesohaing.com
  ✓ sci-limmobilier.com
  ✓ cameroonrealtors.com
  + 4 more

Directories:
  ✓ walazouo.com
  ✓ goafricaonline.com
  ✓ yellowpages.cm

Note: Facebook Marketplace requires manual authentication
"""

if __name__ == "__main__":
    print(PROJECT_STRUCTURE)
    print("\n" + "="*70 + "\n")
    print(MODULE_SUMMARY)
    print("\n" + "="*70 + "\n")
    print(DATA_FLOW)
    print("\n" + "="*70 + "\n")
    print(WEBSITE_COVERAGE)
