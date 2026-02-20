#  Windows Task Scheduler Setup Guide
## Automated Monthly Rent Scraping on the 1st of Each Month

---

##  What This Does

This guide will help you set up **Windows Task Scheduler** to automatically run your rent scraper on the **1st day of every month** without any manual intervention.

### What You'll Get:
-  Automatic scraping on the 1st of each month
-  Organized monthly archives (outputs/monthly_archives/YEAR/MONTH/)
-  Timestamped outputs for historical tracking
-  Error logging for troubleshooting

---

##  Prerequisites

Before setting up the scheduled task, ensure:

1. **Python is installed** and accessible from the command line
2. **All dependencies are installed**: `pip install -r requirements.txt`
3. **The scraper works manually**: Test by running `python main.py`
4. **Your computer will be ON on the 1st of each month** (or use wake timers - see advanced section)

---

##  Step-by-Step Setup

### **Step 1: Test the Batch Script Manually**

Before scheduling, let's make sure the batch script works:

1. Open **File Explorer** and navigate to:
   ```
   c:\Users\ander\Desktop\STRATAXIS-RENT PRICE-SCRAPER
   ```

2. Double-click on `run_monthly_scrape_with_archive.bat`

3. You should see:
   - The scraper running
   - Progress messages
   - "Completed successfully!" at the end

4. Check the `outputs/monthly_archives/` folder to verify files were created

 **If the script runs successfully, proceed to Step 2!**

---

### **Step 2: Open Task Scheduler**

1. Press `Win + R` on your keyboard
2. Type: `taskschd.msc`
3. Press `Enter`

**Task Scheduler** window should now be open.

---

### **Step 3: Create a New Task**

1. In Task Scheduler, on the right side, click **"Create Task..."** (NOT "Create Basic Task")
   
2. You'll see a window with multiple tabs

---

### **Step 4: Configure General Settings**

In the **"General"** tab:

1. **Name**: `StratAxis Monthly Rent Scraper`

2. **Description**: 
   ```
   Automatically scrapes rental price data on the 1st of each month and archives results by month
   ```

3. **Security Options**:
   - checked Select: **"Run whether user is logged on or not"**
   - checked Select: **"Run with highest privileges"**
   
4. **Configure for**: Select `Windows 10` (or your Windows version)

---

### **Step 5: Set the Trigger (When to Run)**

Click on the **"Triggers"** tab:

1. Click **"New..."** button

2. Configure as follows:
   - **Begin the task**: `On a schedule`
   - **Settings**: Select `Monthly`
   - **Months**: checked Check **ALL months** (Jan, Feb, Mar, ... Dec)
   - **Days**: Select `1` (first day of the month)
   - **Start time**: Set your preferred time (e.g., `03:00:00 AM` - 3 AM)
   - **Start date**: Today's date
   - checked **Enabled**: Make sure this is checked

3. Click **"OK"**

---

### **Step 6: Set the Action (What to Run)**

Click on the **"Actions"** tab:

1. Click **"New..."** button

2. Configure as follows:
   - **Action**: `Start a program`
   - **Program/script**: Browse to your batch file:
     ```
     c:\Users\ander\Desktop\STRATAXIS-RENT PRICE-SCRAPER\run_monthly_scrape_with_archive.bat
     ```
   - **Start in (optional)**: Enter the folder path:
     ```
     c:\Users\ander\Desktop\STRATAXIS-RENT PRICE-SCRAPER
     ```

3. Click **"OK"**

---

### **Step 7: Configure Conditions**

Click on the **"Conditions"** tab:

**Power Settings** (Important for laptops):
   - unchecked **Uncheck**: "Start the task only if the computer is on AC power"
   - unchecked **Uncheck**: "Stop if the computer switches to battery power"

**Wake the computer to run this task** (Optional but recommended):
   - checked **Check**: "Wake the computer to run this task"
   - This ensures your computer wakes up to run the scraper even if it's asleep

---

### **Step 8: Configure Settings**

Click on the **"Settings"** tab:

1. checked **Check**: "Allow task to be run on demand"
2. checked **Check**: "Run task as soon as possible after a scheduled start is missed"
3. checked **Check**: "If the task fails, restart every": `15 minutes`
   - Attempt to restart up to: `3 times`
4. **If the running task does not end when requested, force it to stop**: Select `1 hour`
5. **If the task is already running**: Select `Do not start a new instance`

---

### **Step 9: Save the Task**

1. Click **"OK"** at the bottom of the window

2. **You'll be prompted for your Windows password**:
   - Enter your Windows account password
   - This is required for the task to run even when you're not logged in

3. Click **"OK"**

---

### **Step 10: Test the Scheduled Task**

Let's test that the task works:

1. In Task Scheduler, find your task in the list: `StratAxis Monthly Rent Scraper`

2. **Right-click** on it and select **"Run"**

3. Watch the **"Status"** column:
   - It should change to `Running`
   - Then back to `Ready` when complete

4. **Verify the output**:
   - Check `outputs/monthly_archives/` for new files
   - Check `logs/` for log files

 **If folders/files were created, your scheduled task is working!**

---

##  How to Monitor

### View Task History:

1. Right-click your task → Select **"Properties"**
2. Go to the **"History"** tab
3. You'll see all execution attempts with success/failure status

### Check Logs:

- **Application logs**: `logs/` folder in your project
- **Windows Event Logs**: Windows Event Viewer → Task Scheduler logs

### Verify Monthly Archives:

Your outputs will be organized like this:

```
outputs/
 monthly_archives/
     2026/
         January/
            rental_intelligence_2026_01_January_20260201.csv
            rental_intelligence_2026_01_January_20260201.json
            scrape_summary_20260201.txt
         February/
            rental_intelligence_2026_02_February_20260301.csv
            ...
         March/
             ...
```

---

##  Troubleshooting

### Problem: Task shows "Success" but no files are created

**Solution**: Check the batch script path and working directory
1. Edit your task
2. Go to "Actions" tab
3. Verify "Start in" is set to: `c:\Users\ander\Desktop\STRATAXIS-RENT PRICE-SCRAPER`

---

### Problem: Task doesn't run when computer is asleep

**Solution**: Enable "Wake the computer to run this task"
1. Edit your task
2. Go to "Conditions" tab
3. Check checked "Wake the computer to run this task"

---

### Problem: Permission errors

**Solution**: Run with highest privileges
1. Edit your task
2. Go to "General" tab
3. Check checked "Run with highest privileges"

---

### Problem: Python not found

**Solution**: Use full path to Python executable

1. Find your Python path by opening Command Prompt and typing:
   ```bash
   where python
   ```
   
2. Edit `run_monthly_scrape_with_archive.bat` and replace `python` with the full path:
   ```batch
   "C:\Users\ander\AppData\Local\Programs\Python\Python310\python.exe" monthly_scrape_scheduler.py
   ```

---

##  Advanced: Email Notifications (Optional)

Want to receive an email when scraping completes?

### Option 1: Use Windows Task Scheduler Email (Requires SMTP setup)

1. Edit your task
2. Go to "Actions" tab
3. Add new action: "Send an e-mail"
4. Configure your SMTP settings

### Option 2: Use Python Email Script (Recommended)

Modify `monthly_scrape_scheduler.py` to send emails using Gmail/Outlook SMTP.

---

##  FAQ

### Q: What if I'm away on the 1st of the month?

**A:** If you check checked "Run task as soon as possible after a scheduled start is missed", the task will run when your computer is next turned on.

---

### Q: Can I run the scraper more frequently (e.g., weekly)?

**A:** Yes! Edit the task trigger and change from `Monthly` to `Weekly` or `Daily`.

---

### Q: How do I temporarily disable the task?

**A:** Right-click the task → Select **"Disable"**. To re-enable, right-click → **"Enable"**.

---

### Q: How do I delete the task?

**A:** Right-click the task → Select **"Delete"**

---

##  You're All Set!

Your scraper will now run automatically on the 1st of each month at the time you specified.

**Next scrape scheduled**: Check in Task Scheduler → Select your task → Look at "Next Run Time"

---

##  Need Help?

If you encounter issues:
1. Check the `logs/` folder for error messages
2. Review Task Scheduler History tab
3. Test the batch script manually first
4. Ensure Python and all dependencies are installed

**Happy Scraping! **
