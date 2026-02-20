@echo off
REM ============================================================================
REM StratAxis Monthly Rent Scraper - Windows Task Scheduler Script
REM Runs on the 1st of each month to scrape previous month's rental data
REM ============================================================================

echo ===================================================
echo StratAxis Monthly Rent Scraper
echo Started at: %DATE% %TIME%
echo ===================================================

REM Navigate to the scraper directory
cd /d "c:\Users\ander\Desktop\STRATAXIS-RENT PRICE-SCRAPER"

REM Activate virtual environment if it exists, otherwise use global Python
if exist "venv\Scripts\activate.bat" (
    echo Activating virtual environment...
    call venv\Scripts\activate.bat
) else (
    echo Using global Python installation...
)

REM Run the scraper
echo.
echo Running scraper...
python main.py

REM Check if scraper succeeded
if %errorlevel% equ 0 (
    echo.
    echo ===================================================
    echo Scraping completed successfully!
    echo Finished at: %DATE% %TIME%
    echo ===================================================
) else (
    echo.
    echo ===================================================
    echo ERROR: Scraping failed with error code %errorlevel%
    echo Check logs folder for details
    echo ===================================================
)

REM Optional: Pause to see output (remove this line when scheduling)
REM pause

exit /b %errorlevel%
