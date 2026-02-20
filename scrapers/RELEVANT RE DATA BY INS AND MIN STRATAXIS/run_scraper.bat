@echo off
REM StratAxis - Run Scraper Script for Windows

echo ================================================================================
echo STRATAXIS - CAMEROON REAL ESTATE INTELLIGENCE ENGINE
echo Starting Scraper
echo ================================================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    pause
    exit /b 1
)

echo Starting StratAxis Real Estate Intelligence Scraper...
echo.
echo Target Date Range: January 1, 2020 - December 31, 2026
echo.
echo Institutions:
echo   - Ministry of State Property, Surveys and Land Tenure (MINDAF)
echo   - Ministry of Housing and Urban Development (MINHDU)
echo   - National Institute of Statistics (INS)
echo   - Societe Immobiliere du Cameroun (SIC)
echo   - Mission for Development and Equipment of Urban and Rural Land (MAETUR)
echo.
echo ================================================================================
echo.
echo Scraping in progress... This may take 30 minutes to 3 hours.
echo.
echo Progress will be displayed below.
echo Check strataxis_data\scraper.log for detailed logs.
echo.
echo Press Ctrl+C to cancel at any time.
echo.
echo ================================================================================
echo.

REM Run the scraper
python main.py

if errorlevel 1 (
    echo.
    echo ================================================================================
    echo ERROR: Scraper encountered an error
    echo ================================================================================
    echo.
    echo Please check strataxis_data\scraper.log for details
    echo.
    pause
    exit /b 1
)

echo.
echo ================================================================================
echo SCRAPING COMPLETE!
echo ================================================================================
echo.
echo Your data is ready in the strataxis_data folder:
echo.
echo   strataxis_data\strataxis_real_estate_intelligence_2020_2026.csv
echo   strataxis_data\pdfs\
echo   strataxis_data\summary_report.json
echo   strataxis_data\scraper.log
echo.
echo ================================================================================
echo.
echo Next steps:
echo   1. Open the CSV file in Excel or Python for analysis
echo   2. Review summary_report.json for statistics
echo   3. Check scraper.log if you need detailed execution info
echo.
echo ================================================================================

pause
