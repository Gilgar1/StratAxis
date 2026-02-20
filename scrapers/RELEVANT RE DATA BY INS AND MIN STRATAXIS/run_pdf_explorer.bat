@echo off
echo Installing required libraries if missing...
pip install pdfplumber pandas openpyxl

echo Running PDF Explorer...
python "pdf_explorer.py"

echo Done! Check strataxis_data/cleaned_strataxis_data_ml_ready.csv
pause
