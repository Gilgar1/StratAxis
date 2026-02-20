# StratAxis Quick Start Guide

##  Getting Started in 3 Steps

### Step 1: Install Dependencies

```bash
pip install -r requirements.txt
```

This will install:
- requests & BeautifulSoup4 (HTML parsing)
- Selenium (JavaScript-heavy sites)
- pandas & numpy (data processing)
- unidecode (text normalization)

### Step 2: Test Normalizers (Optional)

Run the test suite to verify text normalization:

```bash
python test_normalizers.py
```

Expected output:
```
TESTING PRICE NORMALIZATION
50 million FCFA → 50000000.0
50M → 50000000.0
FCFA 50,000,000 → 50000000.0
```

### Step 3: Run the Pipeline

```bash
python main.py
```

**What it does:**
1. Scrapes 30+ real estate websites
2. Cleans and normalizes data
3. Removes outliers
4. Aggregates by neighborhood
5. Exports to CSV and JSON

**Expected duration:** 15-30 minutes (depending on internet speed)

---

##  Understanding the Output

### Output Files

After running, check the `output/` directory:

**1. `land_prices_intelligence.csv`** - Final neighborhood analysis
```csv
city,neighborhood,median_land_price_per_sqm_xaf,p25_land_price_per_sqm_xaf,p75_land_price_per_sqm_xaf,listing_count,data_confidence_flag
Douala,Bonapriso,125000,100000,150000,23,High
Douala,Akwa,110000,95000,130000,18,High
Yaoundé,Bastos,140000,120000,160000,15,High
```

**2. `land_prices_intelligence.json`** - API-ready format
```json
{
  "metadata": {
    "generated_at": "2026-01-29T12:00:00",
    "total_neighborhoods": 45
  },
  "neighborhoods": [...]
}
```

**3. `raw_listings.csv`** - All cleaned listings (for debugging)

### Key Metrics

| Metric | Description | Use Case |
|--------|-------------|----------|
| **median_land_price_per_sqm_xaf** | Median price per m² | Most reliable for investment decisions |
| **p25/p75** | 25th/75th percentile | Price range, market variability |
| **listing_count** | Number of listings | Data reliability indicator |
| **data_confidence_flag** | High/Medium/Low | Quality assessment |

---

##  Configuration Tips

### Adjust Scraping Speed

Edit `config/config.py`:

```python
REQUEST_DELAY_MIN = 1  # Faster (less polite)
REQUEST_DELAY_MAX = 3

# OR

REQUEST_DELAY_MIN = 5  # Slower (more polite)
REQUEST_DELAY_MAX = 10
```

### Enable/Disable Websites

Edit `config/config.py`:

```python
TARGET_WEBSITES = [
    {"name": "mapiole", "url": "...", "enabled": True},   # Active
    {"name": "keur_immo", "url": "...", "enabled": False}, # Disabled
]
```

### Adjust Quality Thresholds

```python
MIN_LISTING_COUNT_PER_NEIGHBORHOOD = 5  # Require more data
IQR_MULTIPLIER = 2.0  # More lenient on outliers
```

---

##  Troubleshooting

### Issue: "No data scraped"

**Cause:** Website structure changed, network issue, or blocking

**Solution:**
1. Check logs: `logs/scraping_pipeline.log`
2. Test one website manually:
```python
from scrapers.mapiole_scraper import MapioleScraper
scraper = MapioleScraper()
listings = scraper.scrape()
print(len(listings))
```

### Issue: "ModuleNotFoundError"

**Cause:** Dependencies not installed

**Solution:**
```bash
pip install -r requirements.txt
```

### Issue: Selenium crashes

**Cause:** ChromeDriver not compatible

**Solution:**
```bash
pip install --upgrade selenium webdriver-manager
```

### Issue: Very low listing counts

**Cause:** Aggressive filtering

**Solution:**
- Review `text_normalizer.py` patterns
- Check neighborhood name variations
- Adjust `MIN_LISTING_COUNT_PER_NEIGHBORHOOD`

---

##  Next Steps

### Analyze the Data

Use pandas to explore:

```python
import pandas as pd

# Load intelligence data
df = pd.read_csv('output/land_prices_intelligence.csv')

# Top 10 most expensive neighborhoods
top10 = df.nlargest(10, 'median_land_price_per_sqm_xaf')
print(top10[['city', 'neighborhood', 'median_land_price_per_sqm_xaf']])

# Douala vs Yaoundé comparison
print(df.groupby('city')['median_land_price_per_sqm_xaf'].describe())

# High confidence neighborhoods only
high_conf = df[df['data_confidence_flag'] == 'High']
print(f"High confidence: {len(high_conf)} neighborhoods")
```

### Schedule Monthly Runs

**Windows Task Scheduler:**
1. Open Task Scheduler
2. Create Basic Task
3. Trigger: Monthly, 1st day, 2:00 AM
4. Action: Start a program
5. Program: `python`
6. Arguments: `main.py`
7. Start in: `C:\Users\ander\Desktop\strataxis data two`

**Linux/Mac Cron:**
```bash
# Edit crontab
crontab -e

# Add line:
0 2 1 * * cd /path/to/strataxis && python main.py
```

### Integrate with StratAxis Platform

The output JSON can be directly consumed by your StratAxis backend API:

```python
# In your Django/Flask backend
import json

with open('output/land_prices_intelligence.json') as f:
    data = json.load(f)

# Store in database
for neighborhood in data['neighborhoods']:
    LandPrice.objects.create(**neighborhood)
```

---

##  Pro Tips

1. **Start Small**: Test with 2-3 websites first
2. **Monitor Logs**: Always check logs after first run
3. **Validate Output**: Spot-check prices against source websites
4. **Backup Data**: Keep historical runs for trend analysis
5. **Respect Websites**: Don't decrease delays below 2 seconds

---

##  Additional Resources

- **README.md** - Project overview
- **TECHNICAL_DOCS.md** - Architecture details
- **config/config.py** - All configuration options
- **logs/** - Execution logs

---

##  Success Checklist

- [ ] Dependencies installed
- [ ] Test normalizers passed
- [ ] First scraping run completed
- [ ] Output files generated
- [ ] Data looks reasonable (spot-check)
- [ ] Logs reviewed for errors
- [ ] Configuration customized
- [ ] Monthly schedule set up (optional)

---

**Need Help?**

Check the logs first: `logs/scraping_pipeline.log`

Common log patterns:
- `INFO` - Normal operation
- `WARNING` - Non-critical issues (retry, skip)
- `ERROR` - Critical issues (failed scrape, no data)
