@echo off
REM StratAxis - Installation Script for Windows

echo ================================================================================
echo STRATAXIS - CAMEROON REAL ESTATE INTELLIGENCE ENGINE
echo Installation Script
echo ================================================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo.
    echo Please install Python 3.8+ from https://www.python.org/downloads/
    echo Make sure to check "Add Python to PATH" during installation
    pause
    exit /b 1
)

echo Python found:
python --version
echo.

REM Install dependencies
echo Installing required packages...
echo This may take a few minutes...
echo.

pip install -r requirements.txt

if errorlevel 1 (
    echo.
    echo ERROR: Failed to install some packages
    echo Please check your internet connection and try again
    pause
    exit /b 1
)

echo.
echo ================================================================================
echo Installation complete!
echo ================================================================================
echo.

REM Run verification
echo Running setup verification...
echo.
python verify_setup.py

echo.
echo ================================================================================
echo NEXT STEPS:
echo ================================================================================
echo.
echo 1. Review README.md for full documentation
echo 2. Review QUICKSTART.md for quick start guide
echo 3. Run the scraper with: run_scraper.bat
echo    OR manually with: python main.py
echo.
echo ================================================================================

pause
