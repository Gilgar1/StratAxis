# StratAxis Pipeline - Technical Documentation

## Architecture

### 1. Scraping Layer (`scrapers/`)

**Base Scraper** (`base_scraper.py`)
- Provides HTTP requests with retry logic
- Selenium WebDriver initialization for JavaScript-heavy sites
- Rate limiting and politeness delays
- Error handling and logging

**Website-Specific Scrapers**
- `mapiole_scraper.py` - Mapiole.com implementation
- `generic_scraper.py` - Fallback for sites without custom scrapers

**How to Add New Scrapers:**
```python
from scrapers.base_scraper import BaseScraper

class NewSiteScraper(BaseScraper):
    def __init__(self):
        super().__init__('sitename', 'https://example.com')
    
    def scrape(self) -> List[Dict]:
        # Implement scraping logic
        listings = []
        # ... extract data ...
        return listings
```

### 2. Processing Layer (`processors/`)

**Data Cleaner** (`data_cleaner.py`)
- Applies text normalizers to raw data
- Removes invalid/incomplete listings
- Deduplicates using fuzzy matching
- Calculates price_per_sqm
- IQR-based outlier removal

### 3. Normalization Utilities (`utils/`)

**Price Normalizer**
- Handles: "50M", "50 million FCFA", "FCFA 50,000,000"
- Outputs: Numeric XAF
- Validation: 100k - 100B XAF range

**Land Size Normalizer**
- Handles: m², hectares, sqm
- Outputs: Square meters
- Validation: 10 m² - 1000 hectares

**Neighborhood Normalizer**
- Maps variations to standard names
- Example: "Bonapriso – Douala" → "Bonapriso"
- Extensible mapping dictionary

### 4. Aggregation Layer (`aggregators/`)

**Intelligence Aggregator**
- Groups by city + neighborhood
- Calculates: median, P25, P75
- Assigns confidence flags
- Filters low-count neighborhoods

### 5. Configuration (`config/`)

**Key Settings:**
```python
TARGET_CITIES = ["Douala", "Yaoundé"]
MIN_LISTING_COUNT_PER_NEIGHBORHOOD = 3
IQR_MULTIPLIER = 1.5
REQUEST_TIMEOUT = 30
REQUEST_DELAY_MIN = 2
REQUEST_DELAY_MAX = 5
```

## Data Flow

```
1. SCRAPING
   ↓
   Raw listings (30+ websites)
   {city, neighborhood, price_raw, land_size_raw, ...}
   
2. CLEANING
   ↓
   Normalized listings
   {city, neighborhood, price_xaf, land_size_sqm, price_per_sqm}
   
3. DEDUPLICATION
   ↓
   Unique listings
   
4. OUTLIER REMOVAL
   ↓
   Valid listings (IQR filtered)
   
5. AGGREGATION
   ↓
   Neighborhood intelligence
   {city, neighborhood, median, P25, P75, count, confidence}
   
6. EXPORT
   ↓
   CSV + JSON outputs
```

## Output Schema

### Final Intelligence Output

```json
{
  "metadata": {
    "generated_at": "2026-01-29T12:00:00",
    "total_neighborhoods": 45,
    "cities": ["Douala", "Yaoundé"],
    "total_listings_analyzed": 1250
  },
  "neighborhoods": [
    {
      "city": "Douala",
      "neighborhood": "Bonapriso",
      "median_land_price_per_sqm_xaf": 125000,
      "p25_land_price_per_sqm_xaf": 100000,
      "p75_land_price_per_sqm_xaf": 150000,
      "listing_count": 23,
      "data_confidence_flag": "High"
    }
  ]
}
```

## Quality Control

### Data Validation Rules

1. **Price Validation**
   - Must parse to numeric XAF
   - Range: 100,000 - 100,000,000,000 XAF
   
2. **Land Size Validation**
   - Must parse to numeric m²
   - Range: 10 - 10,000,000 m²
   
3. **Deduplication**
   - Same neighborhood + similar price + similar size
   
4. **Outlier Detection**
   - IQR method with 1.5x multiplier
   - Applied to price_per_sqm
   
5. **Confidence Scoring**
   - High: ≥6 listings
   - Medium: 3-5 listings
   - Low: <3 listings

## Deployment

### Monthly Execution

Recommended cron schedule:
```bash
# Run on 1st of each month at 2 AM
0 2 1 * * cd /path/to/strataxis && python main.py
```

### Monitoring

Check logs at: `logs/scraping_pipeline.log`

Key metrics to monitor:
- Total listings scraped
- Success rate per website
- Neighborhoods with low confidence
- Price range sanity checks

## Extensibility

### Adding New Neighborhoods

Edit `utils/text_normalizer.py`:
```python
NEIGHBORHOOD_MAPPINGS = {
    'new_neighborhood': ['variation1', 'variation2'],
    ...
}
```

### Adding New Websites

1. Create scraper in `scrapers/`
2. Add to `config/config.py`:
```python
{"name": "newsite", "url": "https://...", "enabled": True}
```
3. Update `main.py` to use custom scraper

### Adjusting Quality Thresholds

Edit `config/config.py`:
```python
MIN_LISTING_COUNT_PER_NEIGHBORHOOD = 5  # Stricter
IQR_MULTIPLIER = 2.0  # More lenient on outliers
```

## Performance Optimization

Current bottlenecks:
1. Network I/O (scraping)
2. Selenium initialization

Optimizations:
- Use asyncio for concurrent scraping
- Cache Selenium driver instances
- Implement request pooling
- Add database backend for incremental updates

## Legal & Ethical Considerations

-  Respects robots.txt
-  Rate limiting (2-5s delays)
-  Only scrapes publicly visible data
-  No authentication bypass
-  Polite user agent
-  Does NOT scrape private user data
-  Does NOT bypass paywalls

## Troubleshooting

### Common Issues

**No data scraped:**
- Check internet connection
- Verify website structure hasn't changed
- Review logs for specific errors

**Low listing counts:**
- Adjust filters in scrapers
- Verify city name matching
- Check neighborhood normalization

**High outlier removal:**
- Adjust IQR_MULTIPLIER
- Review price normalization logic
- Check for data entry errors on source sites

## Future Enhancements

1. **Machine Learning**
   - Price prediction model
   - Anomaly detection
   - Trend forecasting

2. **Data Sources**
   - Social media integration (Facebook Marketplace)
   - Agency APIs
   - Manual data entry interface

3. **Analytics**
   - Price trend visualization
   - Heat maps
   - Comparative analysis

4. **Automation**
   - Email alerts for new data
   - Automated quality reports
   - Change detection
