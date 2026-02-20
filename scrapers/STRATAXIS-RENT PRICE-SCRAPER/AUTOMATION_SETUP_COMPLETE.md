#  SETUP COMPLETE - Automated Monthly Scraping

##  What You Now Have

Your StratAxis Rent Price Scraper is now ready for **fully automated monthly data collection**!

---

##  New Files Created

| File | Purpose |
|------|---------|
| `run_monthly_scrape.bat` | Basic batch script to run scraper |
| `run_monthly_scrape_with_archive.bat` | **RECOMMENDED**: Runs scraper with monthly archiving |
| `monthly_scrape_scheduler.py` | Python script that organizes outputs by month |
| `TASK_SCHEDULER_SETUP_GUIDE.md` | ** Detailed step-by-step guide** (START HERE!) |
| `QUICK_SETUP_REFERENCE.md` | Quick reference card with essential settings |
| `MONTHLY_WORKFLOW_DIAGRAM.md` | Visual workflow and file organization guide |
| `README.md` | *(Updated)* Now includes automated scraping section |

---

##  Next Steps (Choose Your Path)

###  **Recommended Path: Full Automation Setup**

1. **Test the batch script** (verify everything works):
   ```bash
   # Double-click or run from terminal:
   run_monthly_scrape_with_archive.bat
   ```

2. **Open the detailed guide**:
   ```
   Open: TASK_SCHEDULER_SETUP_GUIDE.md
   ```

3. **Follow the 10-step setup** to configure Windows Task Scheduler

4. **Test your scheduled task** by running it manually in Task Scheduler

5. **Monitor the first automatic run** on the 1st of next month

---

###  **Quick Path: I Just Want the Summary**

**What happens:**
- Every **1st of the month at 3:00 AM** (customizable time)
- Windows Task Scheduler automatically runs the scraper
- Data for the **previous month** is collected
- Results are saved in two places:
  - `outputs/` → Latest data (always overwritten)
  - `outputs/monthly_archives/YEAR/MONTH/` → Historical archive (never overwritten)

**What you need:**
- Computer must be ON or have "Wake to run" enabled
- Python installed with dependencies
- 10 minutes to set up Task Scheduler (one-time setup)

**Quick setup:**
1. Open: `QUICK_SETUP_REFERENCE.md`
2. Follow the settings table
3. Done!

---

##  Usage Scenarios

### Scenario 1: Manual One-Time Scrape
```bash
python main.py
```
**Use when:** You need fresh data right now

---

### Scenario 2: Monthly Scrape with Archive
```bash
python monthly_scrape_scheduler.py
```
**Use when:** You want to test the monthly archiving feature

---

### Scenario 3: Automated (Task Scheduler)
```
No command needed - runs automatically!
```
**Use when:** You want set-it-and-forget-it monthly data collection

---

##  What You'll Get Each Month

### Folder Structure After 3 Months:
```
outputs/
 rental_intelligence.csv          ← Latest
 rental_intelligence.json         ← Latest

 monthly_archives/
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
             rental_intelligence_2026_03_March_20260401.csv
             rental_intelligence_2026_03_March_20260401.json
             scrape_summary_20260401.txt
```

---

##  How to Monitor

### Check Last Run:
1. Open **Task Scheduler** (Win + R → `taskschd.msc`)
2. Find task: "StratAxis Monthly Rent Scraper"
3. Look at columns:
   - **Last Run Time**: When it last executed
   - **Last Run Result**: Success (0x0) or error code
   - **Next Run Time**: When it will run next

### View Execution Logs:
```bash
# Application logs
logs/scraper_YYYYMMDD_HHMMSS.log

# Monthly summaries
outputs/monthly_archives/YEAR/MONTH/scrape_summary_YYYYMMDD.txt
```

### Task History:
1. Right-click task → Properties
2. Go to **History** tab
3. See all execution attempts with timestamps

---

##  FAQ

**Q: When is the best time to schedule the scraper?**
- **A:** 3:00 AM is recommended (low system usage, likely plugged in)
- Avoid peak hours (9 AM - 5 PM) when you're using the computer

**Q: What if my computer is off on the 1st?**
- **A:** Enable "Run task as soon as possible after a scheduled start is missed"
- Task will run next time computer is on

**Q: Can I test without waiting until the 1st?**
- **A:** Yes! Right-click the task → "Run" in Task Scheduler
- Or run the batch script manually anytime

**Q: How much disk space will this use?**
- **A:** ~5-50 MB per month depending on listing count
- ~500 MB per year estimated

**Q: Can I change the schedule to weekly or daily?**
- **A:** Yes! Edit the trigger in Task Scheduler settings
- Change from "Monthly" to "Weekly" or "Daily"

**Q: What if I want to disable automated scraping temporarily?**
- **A:** Right-click task → "Disable" (re-enable later)

---

##  Customization Options

### Change the Schedule:
1. Open Task Scheduler
2. Right-click your task → Properties
3. Go to **Triggers** tab → Edit
4. Modify day/time/frequency

### Change the Time:
- Default: 3:00 AM
- Recommended: Between 12:00 AM - 6:00 AM
- Avoid: Peak usage hours

### Run on Multiple Days:
- You can add multiple triggers
- Example: 1st and 15th of each month

---

##  Learning Resources

| Document | Best For |
|----------|----------|
| `TASK_SCHEDULER_SETUP_GUIDE.md` | First-time setup, detailed instructions |
| `QUICK_SETUP_REFERENCE.md` | Quick settings table, troubleshooting |
| `MONTHLY_WORKFLOW_DIAGRAM.md` | Understanding how it all works |
| `README.md` | Project overview, capabilities |

---

## WARNING: Important Reminders

1. **Computer Must Be On**: Or have "Wake to run task" enabled
2. **Dependencies Installed**: `pip install -r requirements.txt`
3. **Test First**: Always test batch script manually before scheduling
4. **Monitor First Run**: Check results after the first scheduled run
5. **Backup Archives**: Periodically backup `monthly_archives/` folder

---

##  You're Ready!

Everything is set up for automated monthly scraping. Follow the guides to configure Task Scheduler, and you'll have investor-grade rental data automatically collected every month!

###  **Next Step:** 
Open `TASK_SCHEDULER_SETUP_GUIDE.md` and complete the 10-step setup process.

---

**Questions or issues?** Check the troubleshooting sections in:
- `TASK_SCHEDULER_SETUP_GUIDE.md` (Detailed solutions)
- `QUICK_SETUP_REFERENCE.md` (Quick fixes)

**Happy automated scraping! **
