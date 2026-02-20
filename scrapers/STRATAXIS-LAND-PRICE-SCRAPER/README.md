# StratAxis Land Price Intelligence

Production-grade web scraping and data processing pipeline for land price intelligence in Douala and Yaoundé, Cameroon.

## Overview

This system collects, cleans, normalizes, and aggregates land price data per square meter for all neighborhoods in Douala and Yaoundé using 30+ real estate websites.

## Features

- **Modular Architecture**: Separate modules for scraping, cleaning, and aggregation  
- **Multi-Site Support**: 30+ real estate websites configured  
- **Intelligent Normalization**: Handles price and land size variations  
- **Outlier Detection**: IQR-based statistical filtering  
- **Neighborhood Standardization**: Automatic spelling variation handling  
- **Dual Output**: CSV and JSON formats  
- **Confidence Scoring**: Data quality flags per neighborhood  

## Installation

```bash
# Install dependencies
pip install -r requirements.txt
```

## Usage

```bash
# Run the full pipeline
python main.py
```

## Output Files

- `output/land_prices_intelligence.csv` - Final aggregated neighborhood data
- `output/land_prices_intelligence.json` - API-ready JSON format
- `output/raw_listings.csv` - Cleaned raw listings (for debugging)
- `logs/scraping_pipeline.log` - Execution logs

## Data Fields (Final Output)

| Field | Description |
|-------|-------------|
| `city` | Douala or Yaoundé |
| `neighborhood` |Standardized neighborhood name |
| `median_land_price_per_sqm_xaf` | Median price per m² (XAF) |
| `p25_land_price_per_sqm_xaf` | 25th percentile |
| `p75_land_price_per_sqm_xaf` | 75th percentile |
| `listing_count` | Number of listings analyzed |
| `data_confidence_flag` | High/Medium/Low |

## Project Structure

```
strataxis data two/
 scrapers/           # Website-specific scrapers
 processors/         # Data cleaning & normalization
 aggregators/        # Statistical aggregation
 utils/              # Helper utilities
 config/             # Configuration
 output/             # Generated reports
 logs/               # Execution logs
 main.py             # Pipeline orchestrator
 requirements.txt    # Python dependencies
```

## Configuration

Edit `config/config.py` to:
- Enable/disable specific websites
- Adjust quality thresholds
- Modify scraping delays
- Configure outlier detection

## Adding Custom Scrapers

1. Create new file in `scrapers/` (e.g., `newsite_scraper.py`)
2. Inherit from `BaseScraper`
3. Implement `scrape()` method
4. Return list of dictionaries with required fields

## Success Criteria

- Land price per m² comparable across neighborhoods  
- Data supports investment decisions  
- Reproducible and defensible results  

## Monthly Execution

This pipeline is designed to be rerun monthly for updated market intelligence.

## License

Proprietary - StratAxis Project
