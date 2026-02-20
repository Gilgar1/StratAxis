#  Quick Reference: Windows Task Scheduler for Monthly Scraping

##  Goal
Run the scraper automatically on the **1st of every month** to collect previous month's rental data.

---

##  Quick Setup (5 Minutes)

### 1⃣ Test the Batch Script First
```
Double-click: run_monthly_scrape_with_archive.bat
```
 Make sure it runs successfully!

---

### 2⃣ Open Task Scheduler
```
Win + R → Type: taskschd.msc → Press Enter
```

---

### 3⃣ Create Task (Settings at a Glance)

| Tab | Setting | Value |
|-----|---------|-------|
| **General** | Name | StratAxis Monthly Rent Scraper |
| | Run whether user is logged on or not | checked Checked |
| | Run with highest privileges | checked Checked |
| **Triggers** | Schedule | Monthly |
| | Days | 1 (first day) |
| | Months | All months selected |
| | Time | 03:00 AM (or your preference) |
| **Actions** | Program/script | `c:\Users\ander\Desktop\STRATAXIS-RENT PRICE-SCRAPER\run_monthly_scrape_with_archive.bat` |
| | Start in | `c:\Users\ander\Desktop\STRATAXIS-RENT PRICE-SCRAPER` |
| **Conditions** | Wake computer to run | checked Checked |
| | Only on AC power | unchecked Unchecked |
| **Settings** | Run on demand | checked Checked |
| | Run if missed | checked Checked |

---

##  Test Your Task

1. In Task Scheduler, find your task
2. Right-click → **"Run"**
3. Check: `outputs/monthly_archives/` for new files

---

##  Output Structure

```
outputs/monthly_archives/
 2026/
    January/
       rental_intelligence_2026_01_January_20260201.csv
       rental_intelligence_2026_01_January_20260201.json
       scrape_summary_20260201.txt
    February/
    March/
 2027/
     ...
```

---

##  Monitor Your Task

### Check Next Run Time:
1. Open Task Scheduler
2. Find your task in the list
3. Look at **"Next Run Time"** column

### View History:
1. Right-click task → **Properties**
2. Go to **History** tab
3. See all execution attempts

### Check Logs:
- Application logs: `logs/scraper_*.log`
- Archived summaries: `outputs/monthly_archives/YEAR/MONTH/scrape_summary_*.txt`

---

##  Common Actions

### Disable Task Temporarily:
```
Right-click task → Disable
```

### Modify Schedule:
```
Right-click task → Properties → Triggers tab → Edit
```

### Delete Task:
```
Right-click task → Delete
```

---

## WARNING: Troubleshooting Quick Fixes

| Problem | Solution |
|---------|----------|
| Task shows "Success" but no files | Check "Start in" path in Actions tab |
| Doesn't run when PC asleep | Enable "Wake computer" in Conditions |
| Permission errors | Enable "Run with highest privileges" |
| Python not found | Use full Python path in .bat file |

---

##  Need the Full Guide?

See: **`TASK_SCHEDULER_SETUP_GUIDE.md`** for detailed step-by-step instructions with screenshots descriptions.

---

** Remember**: Your computer must be ON (or able to wake up) on the 1st of each month!
