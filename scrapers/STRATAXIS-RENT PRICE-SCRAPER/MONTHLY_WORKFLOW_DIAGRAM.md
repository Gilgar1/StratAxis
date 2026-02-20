#  Monthly Scraping Workflow - How It Works

##  Automated Monthly Cycle

```

                    MONTHLY AUTOMATION WORKFLOW                   


Day 1 of Month (e.g., March 1st, 2026 at 3:00 AM)

 Windows Task Scheduler Triggers
   Wakes computer (if sleeping)

 Runs: run_monthly_scrape_with_archive.bat
  
   Navigates to project directory
   Activates virtual environment (if exists)
   Executes: monthly_scrape_scheduler.py

 monthly_scrape_scheduler.py
  
   Calculates: "Previous Month" = February 2026
  
   Runs Full Scraper (main.py)
    
     Scrapes 30+ sources
     Normalizes data
     Deduplicates listings
     Aggregates metrics
     Exports to outputs/
  
   Creates Monthly Archive Directory
     outputs/monthly_archives/2026/February/
  
   Archives Results
      Copies: rental_intelligence.csv
      Copies: rental_intelligence.json
      Creates: scrape_summary.txt

 Completion
    Logs written to logs/
    Task marked as "Success" in Task Scheduler
```

---

##  File Organization Over Time

```
STRATAXIS-RENT PRICE-SCRAPER/

 outputs/
  
   rental_intelligence.csv          ← Always has latest data
   rental_intelligence.json         ← Always has latest data
  
   monthly_archives/                 ← Historical archive
     
      2026/
        January/
          rental_intelligence_2026_01_January_20260201.csv
          rental_intelligence_2026_01_January_20260201.json
          scrape_summary_20260201.txt
       
        February/
          rental_intelligence_2026_02_February_20260301.csv
          rental_intelligence_2026_02_February_20260301.json
          scrape_summary_20260301.txt
       
        March/
        April/
        ... (and so on)
     
      2027/
         January/
            ...

 logs/
   scraper_20260201_030000.log      ← Detailed execution logs
   scraper_20260301_030000.log
   ...

 data/
    raw/                              ← Raw scraped data (timestamped)
    cleaned/                          ← Normalized data (timestamped)
```

---

##  Example Timeline

```
Timeline View (Year 2026)


Jan 1, 3:00 AM  →  Scrapes December 2025 data
                   Archives to: /2025/December/

Feb 1, 3:00 AM  →  Scrapes January 2026 data
                   Archives to: /2026/January/

Mar 1, 3:00 AM  →  Scrapes February 2026 data
                   Archives to: /2026/February/

Apr 1, 3:00 AM  →  Scrapes March 2026 data
                   Archives to: /2026/March/

... continues every month ...
```

---

##  What Gets Archived Each Month

For each monthly run, you get:

### 1. **CSV File** (Analysis-Ready)
```
rental_intelligence_2026_02_February_20260301.csv
```
- City breakdowns
- Neighborhood analysis
- Housing type metrics
- Price trends (P25, median, P75)
- Confidence scores

### 2. **JSON File** (API-Ready)
```
rental_intelligence_2026_02_February_20260301.json
```
- Hierarchical structure
- Easy programmatic access
- Nested by city → neighborhood → type → year

### 3. **Summary Report** (Quick Overview)
```
scrape_summary_20260301.txt
```
- Target month: February 2026
- Scrape date: March 1, 2026
- Status: SUCCESS
- File references

---

##  How to Use Historical Data

### Compare Month-to-Month Trends
```python
import pandas as pd

# Load multiple months
jan = pd.read_csv('outputs/monthly_archives/2026/January/rental_intelligence_2026_01_January_20260201.csv')
feb = pd.read_csv('outputs/monthly_archives/2026/February/rental_intelligence_2026_02_February_20260301.csv')

# Compare median prices in Akwa (Douala)
jan_akwa = jan[(jan['city']=='douala') & (jan['neighborhood']=='akwa')]
feb_akwa = feb[(feb['city']=='douala') & (feb['neighborhood']=='akwa')]

print("January median:", jan_akwa['median_monthly_rent_xaf'].median())
print("February median:", feb_akwa['median_monthly_rent_xaf'].median())
```

### Build Time Series
```python
import glob
import pandas as pd

# Load all monthly CSVs
all_files = glob.glob('outputs/monthly_archives/**/rental_intelligence_*.csv', recursive=True)
df = pd.concat([pd.read_csv(f) for f in all_files])

# Analyze trends over time
trends = df.groupby(['city', 'neighborhood', 'housing_type', 'year'])['median_monthly_rent_xaf'].mean()
```

---

##  Troubleshooting

### X Archives Not Created?

**Check:**
1. Does `outputs/monthly_archives/` folder exist?
2. Did the scraper run successfully? (Check logs/)
3. Were CSV/JSON files created in `outputs/`?

**Fix:**
- Run manually first: `python monthly_scrape_scheduler.py`
- Check for errors in console output

---

### X Wrong Month in Archive Name?

**Check:**
- The scraper runs on the 1st of the NEW month
- It archives data for the PREVIOUS month
- Example: March 1st → Archives February data

**This is correct behavior!**

---

##  Pro Tips

### 1. **Keep 6-12 Months of Archives**
- After 12 months, move older archives to backup storage
- Frees up disk space

### 2. **Monitor Disk Usage**
- Each month adds ~5-50 MB depending on listing count
- Plan for ~500 MB per year

### 3. **Backup Archives Regularly**
- Copy `monthly_archives/` to cloud storage (Google Drive, Dropbox)
- Protects against data loss

### 4. **Check Logs After Each Run**
- Review `logs/` folder after the 1st of each month
- Ensure no scraping errors occurred

---

##  Benefits of This System

 **Historical Tracking**: See how rental prices change month by month
 **Data Integrity**: Never lose previous months' data
 **Easy Analysis**: Compare trends across time periods
 **Automated**: Zero manual work after initial setup
 **Organized**: Clean folder structure by year/month
 **Timestamped**: Know exactly when each scrape occurred

---

**Questions? See:** `TASK_SCHEDULER_SETUP_GUIDE.md` for full details.
