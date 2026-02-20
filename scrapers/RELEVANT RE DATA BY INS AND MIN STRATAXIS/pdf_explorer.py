import os
import re
import pandas as pd
import pdfplumber
import logging
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Optional

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Constants
DATA_DIR = Path("strataxis_data")
PDF_DIR = DATA_DIR / "pdfs"
OUTPUT_FILE = DATA_DIR / "cleaned_strataxis_data_ml_ready.csv"
RAW_CSV_FILE = DATA_DIR / "strataxis_real_estate_intelligence_2020_2026.csv"

# Regex patterns for extraction
PRICE_PATTERN = re.compile(r'(\d+[\d\s.,]*)\s*(FCFA|XAF|F\s?CFA)', re.IGNORECASE)
AREA_PATTERN = re.compile(r'(\d+[\d\s.,]*)\s*(m²|m2|sqm|ha)', re.IGNORECASE)
DATE_PATTERN = re.compile(r'\b(\d{1,2})[-/](\d{1,2})[-/](\d{4})\b', re.IGNORECASE)

def extract_data_from_pdf(pdf_path: Path) -> List[Dict]:
    """
    Extract structured data from a single PDF.
    Attempts to find tables and key-value pairs.
    """
    extracted_data = []
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                # 1. Extract Tables
                tables = page.extract_tables()
                for table in tables:
                    # simplistic table processing: assume header is first row if it looks like keys
                    if not table: continue
                    
                    headers = [str(h).lower().strip() if h else f"col_{i}" for i, h in enumerate(table[0])]
                    # Check if headers look relevant to real estate
                    if any(kw in " ".join(headers) for kw in ['price', 'prix', 'area', 'surface', 'location', 'quartier', 'ville']):
                        for row in table[1:]:
                            if not row: continue
                            # Create a record from the row
                            record = {k: v for k, v in zip(headers, row) if v}
                            record['source_file'] = pdf_path.name
                            record['page_number'] = page.page_number
                            record['extraction_type'] = 'table'
                            extracted_data.append(record)
                
                # 2. Extract Text (if no tables found or complementary)
                text = page.extract_text()
                if text:
                    # Simple heuristic extraction for unstructured text
                    # Look for lines that might be listings
                    for line in text.split('\n'):
                        # Check if line contains price and area
                        price_match = PRICE_PATTERN.search(line)
                        area_match = AREA_PATTERN.search(line)
                        
                        if price_match and area_match:
                            extracted_data.append({
                                'raw_text': line.strip(),
                                'price_raw': price_match.group(0),
                                'area_raw': area_match.group(0),
                                'source_file': pdf_path.name,
                                'page_number': page.page_number,
                                'extraction_type': 'text_heuristic'
                            })

    except Exception as e:
        logger.error(f"Error processing {pdf_path}: {e}")
    
    return extracted_data

def process_pdfs(pdf_dir: Path) -> pd.DataFrame:
    """
    Process all PDFs in the directory and return a DataFrame.
    """
    all_records = []
    pdf_files = list(pdf_dir.glob("*.pdf"))
    logger.info(f"Found {len(pdf_files)} PDFs to process.")
    
    for i, pdf_file in enumerate(pdf_files):
        if i % 10 == 0:
            logger.info(f"Processing {i}/{len(pdf_files)}: {pdf_file.name}")
        
        records = extract_data_from_pdf(pdf_file)
        all_records.extend(records)
        
    logger.info(f"Extracted {len(all_records)} records from PDFs.")
    return pd.DataFrame(all_records)

def clean_price(value):
    """Clean price string to float."""
    if pd.isna(value): return None
    if isinstance(value, (int, float)): return float(value)
    
    # Remove currency and whitespace
    s = str(value).upper().replace('FCFA', '').replace('XAF', '').replace('F CFA', '').strip()
    s = s.replace(' ', '').replace(',', '.') # Assume comma is decimal separator if no other punctuation
    # Handle potentially malformed numbers
    try:
        return float(s)
    except:
        return None

def clean_area(value):
    """Clean area string to float (in m2)."""
    if pd.isna(value): return None
    if isinstance(value, (int, float)): return float(value)
    
    s = str(value).lower()
    is_hectare = 'ha' in s
    s = s.replace('m²', '').replace('m2', '').replace('sqm', '').replace('ha', '').strip()
    s = s.replace(',', '.')
    
    try:
        val = float(s)
        if is_hectare:
            val *= 10000 # Convert ha to m2
        return val
    except:
        return None

def standardize_dataset(pdf_df: pd.DataFrame, csv_df: pd.DataFrame) -> pd.DataFrame:
    """
    Combine and standardize data from PDFs and Scraped CSV.
    """
    # 1. Standardize text columns in CSV
    # Map common CSV columns to a standard schema
    # Expected standard columns: ['title', 'price', 'area', 'location', 'city', 'date', 'source', 'url']
    
    # Check CSV columns
    logger.info(f"CSV Columns: {csv_df.columns.tolist()}")
    
    # Create a new standardized dataframe list
    stand_records = []
    
    # Process CSV Data
    # Process CSV Data
    for _, row in csv_df.iterrows():
        description = row.get('extracted_unstructured_text', row.get('description', ''))
        
        # Try to extract price/area from description if not explicit columns
        price_val = row.get('price', None)
        area_val = row.get('area', None)
        
        if pd.isna(price_val) and isinstance(description, str):
            pm = PRICE_PATTERN.search(description)
            if pm: price_val = pm.group(0)
            
        if pd.isna(area_val) and isinstance(description, str):
            am = AREA_PATTERN.search(description)
            if am: area_val = am.group(0)

        record = {
            'title': row.get('title', ''),
            'description': description,
            'price_raw': price_val,
            'area_raw': area_val,
            'location': row.get('region', row.get('location', '')), # Map region to location
            'city': row.get('region', 'Unknown'), # Use region as proxy for city if not distinct
            'date': row.get('publication_date', ''),
            'source': 'web_scraper',
            'url': row.get('url', ''),
            'property_type': row.get('category', 'general')
        }
        stand_records.append(record)
        
    # Process PDF Data
    # PDF extraction is messier. We map what we found.
    # Note: 'price_raw' and 'area_raw' from heuristic
    if not pdf_df.empty:
        for _, row in pdf_df.iterrows():
            # If extracted from table, keys might differ. 
            # We try to find price/area keys.
            
            # Simple heuristic mapping for table columns
            price_val = None
            area_val = None
            loc_val = ''
            
            # Search for price key
            for k in row.keys():
                k_lower = str(k).lower()
                if 'price' in k_lower or 'prix' in k_lower or 'loyer' in k_lower or 'montant' in k_lower:
                    price_val = row[k]
                if 'area' in k_lower or 'surface' in k_lower or 'sup' in k_lower:
                    area_val = row[k]
                if 'quartier' in k_lower or 'location' in k_lower or 'lieu' in k_lower:
                    loc_val = row[k]

            # Use heuristic text extraction if available
            if pd.isna(price_val) and 'price_raw' in row:
                price_val = row['price_raw']
            if pd.isna(area_val) and 'area_raw' in row:
                area_val = row['area_raw']
                
            record = {
                'title': f"Extracted from {row.get('source_file', 'unknown')}",
                'description': row.get('raw_text', ''),
                'price_raw': price_val,
                'area_raw': area_val,
                'location': loc_val,
                'city': '', # Hard to guess without NER
                'date': '', # Could try to parse from filename or text
                'source': f"pdf: {row.get('source_file', 'unknown')}",
                'url': '',
                'property_type': 'unknown'
            }
            stand_records.append(record)
            
    final_df = pd.DataFrame(stand_records)
    
    # 2. Clean and Convert Data Types
    logger.info("Cleaning data...")
    final_df['price_cleaned'] = final_df['price_raw'].apply(clean_price)
    final_df['area_cleaned'] = final_df['area_raw'].apply(clean_area)
    
    # Calculate price per m2 (crucial for ML)
    final_df['price_per_m2'] = final_df['price_cleaned'] / final_df['area_cleaned']
    
    # Remove rows with no price AND no area (useless for ML price prediction)
    valid_data = final_df.dropna(subset=['price_cleaned', 'area_cleaned'], how='all')
    
    # Fill remaining missing values with reasonable defaults or flags
    valid_data['city'] = valid_data['city'].fillna('Unknown')
    valid_data['location'] = valid_data['location'].fillna('Unknown')
    
    # Drop duplicates
    valid_data = valid_data.drop_duplicates(subset=['price_cleaned', 'area_cleaned', 'location', 'description'])
    
    return valid_data

def main():
    logger.info("Starting PDF Explorer and Data Cleaner...")
    
    # 1. Load CSV Data
    if RAW_CSV_FILE.exists():
        logger.info(f"Loading CSV data from {RAW_CSV_FILE}")
        csv_df = pd.read_csv(RAW_CSV_FILE)
    else:
        logger.warning(f"No CSV file found at {RAW_CSV_FILE}")
        csv_df = pd.DataFrame()
        
    # 2. Process PDFs
    pdf_df = process_pdfs(PDF_DIR)
    
    # 3. Standardize and Merge
    final_df = standardize_dataset(pdf_df, csv_df)
    
    # 4. Save Output
    logger.info(f"Saving {len(final_df)} cleaned records to {OUTPUT_FILE}")
    final_df.to_csv(OUTPUT_FILE, index=False)
    
    # Summary stats
    logger.info("Data Summary:")
    print(final_df.describe())
    print(final_df['city'].value_counts().head())

if __name__ == "__main__":
    main()
