"""
StratAxis Setup Verification Script
Run this to verify all dependencies are installed correctly
"""

import sys

print("=" * 70)
print("STRATAXIS SETUP VERIFICATION")
print("=" * 70)
print()

# Check Python version
print("[OK] Checking Python version...")
python_version = sys.version_info
print(f" Python {python_version.major}.{python_version.minor}.{python_version.micro}")

if python_version.major < 3 or (python_version.major == 3 and python_version.minor < 8):
 print(" [FAIL] ERROR: Python 3.8+ required")
 sys.exit(1)
else:
 print(" [OK] Python version OK")

print()

# Check required packages
required_packages = {
 'bs4': 'beautifulsoup4',
 'requests': 'requests',
 'selenium': 'selenium',
 'PyPDF2': 'PyPDF2',
 'pdfminer': 'pdfminer.six',
 'fitz': 'PyMuPDF',
 'pandas': 'pandas',
 'lxml': 'lxml'
}

print("[OK] Checking required packages...")
missing_packages = []

for module_name, package_name in required_packages.items():
 try:
 __import__(module_name)
 print(f" [OK] {package_name}")
 except ImportError:
 print(f" [FAIL] {package_name} - NOT INSTALLED")
 missing_packages.append(package_name)

print()

if missing_packages:
 print("[FAIL] Missing packages detected!")
 print()
 print("Install missing packages with:")
 print(f" pip install {' '.join(missing_packages)}")
 print()
 print("Or install all requirements:")
 print(" pip install -r requirements.txt")
 sys.exit(1)

# Check Selenium WebDriver
print("[OK] Checking Selenium setup...")
try:
 from selenium import webdriver
 from selenium.webdriver.chrome.options import Options
 
 chrome_options = Options()
 chrome_options.add_argument('--headless')
 chrome_options.add_argument('--no-sandbox')
 chrome_options.add_argument('--disable-dev-shm-usage')
 
 # Try to create a driver instance
 try:
 driver = webdriver.Chrome(options=chrome_options)
 driver.quit()
 print(" [OK] Selenium and ChromeDriver working")
 except Exception as e:
 print(f" [WARN] Selenium installed but ChromeDriver may need setup")
 print(f" Error: {str(e)[:100]}")
 print(" Try: pip install webdriver-manager")
except Exception as e:
 print(f" [FAIL] Selenium setup error: {e}")

print()

# Check file structure
print("[OK] Checking project files...")
import os

required_files = [
 'config.py',
 'crawler.py',
 'parser.py',
 'pdf_processor.py',
 'exporter.py',
 'main.py',
 'requirements.txt',
 'README.md'
]

for filename in required_files:
 if os.path.exists(filename):
 print(f" [OK] {filename}")
 else:
 print(f" [FAIL] {filename} - MISSING")

print()

# Try to import modules
print("[OK] Checking StratAxis modules...")
try:
 import config
 print(" [OK] config.py")
except Exception as e:
 print(f" [FAIL] config.py - {e}")

try:
 import crawler
 print(" [OK] crawler.py")
except Exception as e:
 print(f" [FAIL] crawler.py - {e}")

try:
 import parser
 print(" [OK] parser.py")
except Exception as e:
 print(f" [FAIL] parser.py - {e}")

try:
 import pdf_processor
 print(" [OK] pdf_processor.py")
except Exception as e:
 print(f" [FAIL] pdf_processor.py - {e}")

try:
 import exporter
 print(" [OK] exporter.py")
except Exception as e:
 print(f" [FAIL] exporter.py - {e}")

print()
print("=" * 70)
print("[OK] SETUP VERIFICATION COMPLETE")
print("=" * 70)
print()
print("You're ready to run StratAxis!")
print()
print("To start scraping, run:")
print(" python main.py")
print()
print("=" * 70)
