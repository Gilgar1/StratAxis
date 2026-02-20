@echo off
REM ============================================================================
REM StratAxis Monthly Rent Scraper with Monthly Archives
REM Runs monthly_scrape_scheduler.py which organizes outputs by month
REM ============================================================================

echo ===================================================
echo StratAxis Monthly Rent Scraper (With Archives)
echo Started at: %DATE% %TIME%
echo ===================================================

REM Navigate to the scraper directory
cd /d "c:\Users\ander\Desktop\STRATAXIS-RENT PRICE-SCRAPER"

REM Activate virtual environment if it exists
if exist "venv\Scripts\activate.bat" (
    echo Activating virtual environment...
    call venv\Scripts\activate.bat
) else (
    echo Using global Python installation...
)

REM Run the monthly scheduler
echo.
echo Running monthly scraper with archiving...
python monthly_scrape_scheduler.py

REM Check if scraper succeeded
if %errorlevel% equ 0 (
    echo.
    echo ===================================================
    echo Monthly scraping completed successfully!
    echo Outputs archived by month in outputs/monthly_archives/
    echo Finished at: %DATE% %TIME%
    echo ===================================================
) else (
    echo.
    echo ===================================================
    echo ERROR: Scraping failed with error code %errorlevel%
    echo Check logs folder for details
    echo ===================================================
)

exit /b %errorlevel%
