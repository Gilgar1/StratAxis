# StratAxis Rent Price Intelligence System

**Production-grade rental market intelligence pipeline for Douala & Yaoundé (2020-2026)**

## Overview

This system collects, normalizes, and aggregates rental price data from 30+ public sources across Cameroon to provide investor-grade market intelligence.

### Capabilities

- Multi-source scraping (portals, classifieds, agencies)
- Housing type classification (Studio to Villa)
- Neighborhood normalization
- Price parsing (handles "150k", "1.2M/year", multiple currencies)
- Date extraction (2020-2026 coverage)
- Intelligent deduplication
- Outlier removal (IQR-based)
- Investor-grade metrics (median, p25, p75, volatility)
- CSV + JSON export

## Quick Start

### Manual Run (One-Time Scrape)

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Run the scraper
python main.py
```

### Automated Monthly Scraping (Windows Task Scheduler)

Set up the scraper to run automatically on the 1st of each month:

```bash
# 1. Test the batch script first
run_monthly_scrape_with_archive.bat

# 2. Follow the setup guide
See: TASK_SCHEDULER_SETUP_GUIDE.md (detailed step-by-step)
Or:  QUICK_SETUP_REFERENCE.md (quick reference)
```

**Features of Automated Scraping:**
- Runs on the 1st of each month automatically
- Archives outputs by year/month for historical tracking
- Creates timestamped summaries
- No manual intervention needed (computer must be on/wake-enabled)

## Project Structure

```
STRATAXIS-RENT-PRICE-SCRAPER/
├── config/              # Source definitions & normalization rules
├── scrapers/            # Web scrapers (base + generic)
├── pipeline/            # Data processing (normalizer, deduplicator, aggregator)
├── utils/               # Utilities (price parser, date extractor, logger)
├── data/                # Raw & cleaned data (generated)
├── outputs/             # Final CSV & JSON (generated)
├── logs/                # Execution logs (generated)
└── main.py              # Orchestration script
```

## Outputs

### 1. CSV (`outputs/rental_intelligence.csv`)
Analysis-ready format with columns:
- `city`, `neighborhood`, `housing_type`, `year`
- `median_monthly_rent_xaf`, `p25_monthly_rent_xaf`, `p75_monthly_rent_xaf`
- `median_rent_per_sqm`, `listing_count`, `rent_volatility_score`, `data_confidence`

### 2. JSON (`outputs/rental_intelligence.json`)
API-ready hierarchical structure:
```json
{
  "douala": {
    "akwa": {
      "two_bedroom": {
        "2026": {
          "median_monthly_rent_xaf": 150000,
          "p25_monthly_rent_xaf": 120000,
          "p75_monthly_rent_xaf": 180000,
          "listing_count": 15,
          "data_confidence": "high"
        }
      }
    }
  }
}
```

## Data Sources

- **Portals**: Mapiole, Koutchoumi, Keur Immo, Geloka, HomeCM, etc.
- **Classifieds**: Jumia, Coin Afrique, Expat, Afribaba
- **Agencies**: SECPE, Tesla, Diamond Realty, A2M, etc.
- **Total**: 30+ sources

## Housing Types

- Studio
- 1-bedroom apartment
- 2-bedroom apartment
- 3+ bedroom apartment
- Villa / house
- Shared housing

## Coverage

- **Cities**: Douala, Yaoundé
- **Period**: 2020-2026
- **Granularity**: Neighborhood level

## Configuration

### Add neighborhoods
Edit `config/neighborhoods.yaml` to add/update neighborhood variants.

### Add sources
Edit `config/sources.yaml` to add new websites.

### Customize housing types
Edit `config/housing_types.yaml` to adjust classification keywords.

## Data Quality

- **Outlier Removal**: IQR-based filtering per housing type
- **Deduplication**: Signature-based (city + neighborhood + type + price)
- **Confidence Flags**: `high`, `medium`, `low` based on sample size & volatility
- **Quality Metrics**: Tracks which listings have price, size, neighborhood, etc.

## Customization

### Adjust scraping delay
In `scrapers/base_scraper.py`, modify `delay_range` parameter.

### Change outlier threshold
In `pipeline/aggregator.py`, modify IQR multiplier (default 1.5).

### Add custom scraper
Extend `BaseScraper` class for site-specific logic.

## Logs

All execution logs are saved to `logs/scraper_TIMESTAMP.log` with:
- Scraping progress
- Parsing errors
- Normalization issues
- Aggregation statistics

## Legal & Ethics

- Only scrapes publicly visible listings
- Respectful rate limiting (2-4 sec delays)
- No authentication bypassing
- No private data access
- Complies with robots.txt

## Tech Stack

- **Python 3.8+**
- **Libraries**: requests, BeautifulSoup, pandas, PyYAML
- **Parsing**: lxml, dateutil
- **User-Agent rotation**: fake-useragent

## Use Cases

- Rental yield calculations
- Neighborhood affordability analysis
- Market trend identification
- Development feasibility studies
- Portfolio risk assessment

## Troubleshooting

### Low listing counts
- Some sites may have changed structure
- Check logs for scraping errors
- Verify site availability

### Missing neighborhoods
- Add variants to `config/neighborhoods.yaml`
- Check raw data for actual names used

### Price parsing issues
- Check `utils/price_parser.py` patterns
- Add custom formats if needed

---

**Built for StratAxis | Investor-Grade Real Estate Intelligence**
