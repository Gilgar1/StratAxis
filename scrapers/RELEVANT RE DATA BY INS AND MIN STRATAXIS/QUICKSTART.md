# StratAxis Quick Start Guide

## 5-Minute Setup

### Step 1: Install Python Dependencies

Open PowerShell in this directory and run:

```powershell
pip install -r requirements.txt
```

This will install:
- beautifulsoup4 (HTML parsing)
- requests (HTTP requests)
- selenium (Dynamic page handling)
- PyMuPDF, pdfminer.six, PyPDF2 (PDF processing)
- pandas (Data handling)

### Step 2: Verify Chrome Installation

The scraper uses Chrome with Selenium. Make sure you have **Google Chrome** installed.

If not, download from: https://www.google.com/chrome/

### Step 3: Run the Scraper

```powershell
python main.py
```

### Step 4: Monitor Progress

Watch the console output for progress updates. The scraper will:

1. [OK] Initialize components
2. [OK] Crawl each institution's website
3. [OK] Extract data and download PDFs
4. [OK] Filter by date range (2020-2026)
5. [OK] Export to CSV
6. [OK] Generate summary report

### Step 5: Access Results

After completion, find your data in:

```
strataxis_data/
├── strataxis_real_estate_intelligence_2020_2026.csv <- Main data file
├── pdfs/ <- Downloaded PDFs
├── summary_report.json <- Statistics
└── scraper.log <- Execution log
```

---

## Understanding Your Data

### Open the CSV

**In Excel:**
1. Open Excel
2. File -> Open -> Select the CSV file
3. Data is UTF-8 encoded (supports French characters)

**In Python:**
```python
import pandas as pd
df = pd.read_csv('strataxis_data/strataxis_real_estate_intelligence_2020_2026.csv')
print(df.head())
print(f"Total records: {len(df)}")
```

### Key Columns

- **title**: Document title
- **publication_date**: When it was published
- **source_institution**: Which ministry/agency
- **category**: land, housing, infrastructure, etc.
- **keywords_detected**: Real estate keywords found
- **relevance_score**: How relevant it is (higher = more relevant)
- **file_path**: Local PDF path (if downloaded)
- **extracted_unstructured_text**: Full text content

### Check the Summary

Open `summary_report.json` to see:
- Total records collected
- PDFs downloaded
- Distribution by institution
- Distribution by category
- Date range coverage
- Top keywords

---

## Common Customizations

### 1. Change Date Range

Edit `config.py`:

```python
START_DATE = datetime(2022, 1, 1) # Start from 2022
END_DATE = datetime(2026, 12, 31)
```

### 2. Focus on Specific Institution

Edit `config.py` and comment out institutions you don't want:

```python
INSTITUTIONS = {
 "Ministry of Housing and Urban Development": {
 "url": "http://www.minhdu.gov.cm",
 "aliases": ["minhdu", "habitat", "housing"]
 },
 # "National Institute of Statistics": { # Commented out
 # "url": "http://www.statistics-cameroon.org",
 # "aliases": ["ins", "bucrep"]
 # },
}
```

### 3. Adjust Crawling Speed

Edit `config.py`:

```python
CRAWL_SETTINGS = {
 "politeness_delay": 1, # Faster: 1 second (default: 2)
 "max_pages_per_site": 500, # Fewer pages for testing
}
```

### 4. Add Custom Keywords

Edit `config.py`:

```python
KEYWORDS = {
 "land": ["land", "terre", "terrain", "your_keyword"],
 # ...
}
```

---

## Troubleshooting

### Problem: "No module named 'bs4'"

**Solution:**
```powershell
pip install beautifulsoup4
```

### Problem: "ChromeDriver not found"

**Solution:**
```powershell
pip install webdriver-manager
```

This automatically downloads ChromeDriver.

### Problem: Scraper finds no data

**Reasons:**
1. Website might be down (check URLs in browser)
2. Robots.txt might block the scraper
3. Date range might be too restrictive

**Check the log:**
```powershell
type strataxis_data\scraper.log
```

### Problem: Memory error

**Solution:** Reduce pages per site in `config.py`:
```python
"max_pages_per_site": 200,
```

---

## What to Do with Your Data

### 1. Analyze Trends

```python
import pandas as pd
import matplotlib.pyplot as plt

df = pd.read_csv('strataxis_data/strataxis_real_estate_intelligence_2020_2026.csv')

# Publications by institution
df['source_institution'].value_counts().plot(kind='bar')
plt.title('Data by Institution')
plt.show()

# Publications over time
df['publication_date'] = pd.to_datetime(df['publication_date'])
df['publication_date'].dt.year.value_counts().sort_index().plot()
plt.title('Publications by Year')
plt.show()
```

### 2. Search for Specific Topics

```python
# Find all housing-related documents
housing_docs = df[df['category'] == 'housing']

# Find documents mentioning Douala
douala_docs = df[df['region'] == 'Douala']

# Find documents with high relevance
important_docs = df[df['relevance_score'] > 10]
```

### 3. Export Filtered Data

```python
# Export only high-relevance housing data
housing_important = df[(df['category'] == 'housing') & (df['relevance_score'] > 5)]
housing_important.to_csv('housing_analysis.csv', index=False)
```

---

## Running Regularly

### Windows Task Scheduler

1. Open Task Scheduler
2. Create Basic Task
3. Set trigger (e.g., Weekly)
4. Action: Start a program
5. Program: `python`
6. Arguments: `main.py`
7. Start in: `C:\Users\ander\Desktop\RELEVANT RE DATA BY INS AND MIN STRATAXIS`

This will automatically update your data weekly!

---

## Best Practices

[OK] **DO:**
- Run during off-peak hours (night/weekend)
- Review `scraper.log` after each run
- Backup your data regularly
- Verify data accuracy before using for decisions

[FAIL] **DON'T:**
- Run multiple instances simultaneously
- Decrease politeness delay below 1 second
- Share credentials or personal data
- Use for commercial purposes without permission

---

## Expected Results

After running the scraper, you should expect:

- **Records**: 500-3,000+ depending on institutional data availability
- **PDFs**: 100-500+ documents
- **Categories**: Distributed across land, housing, statistics, infrastructure
- **Date Coverage**: Concentrated in recent years (2023-2026)
- **Execution Time**: 30 minutes - 3 hours depending on settings

---

## Getting Help

1. **Check the log**: `strataxis_data\scraper.log` has detailed errors
2. **Review README.md**: Full documentation
3. **Test with one institution**: Comment out others in `config.py`
4. **Verify URLs**: Open institution URLs in browser to confirm they're accessible

---

## [OK] Quick Verification Checklist

After your first run:

- [ ] CSV file created in `strataxis_data/`
- [ ] PDFs downloaded to `strataxis_data/pdfs/`
- [ ] Summary report generated (`summary_report.json`)
- [ ] Log file shows no critical errors
- [ ] CSV opens correctly in Excel
- [ ] At least some records have publication dates
- [ ] Records filtered to 2020-2026 range

---

## Success!

If you see the CSV file with data, **you're done!** 

You now have a centralized real estate intelligence database for Cameroon.

**Next Steps:**
1. Analyze the data with Python/Excel
2. Schedule regular updates
3. Share insights with your team
4. Build visualizations and reports

**Welcome to StratAxis - Cameroon's Real Estate Intelligence Platform! **
