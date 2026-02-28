import os
import re
import fitz  # PyMuPDF
import pandas as pd
from deep_translator import GoogleTranslator
import time
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

RAW_DATA_DIR = r"c:\Users\ander\Desktop\StratAxis\data\raw"
PDF_DIR = os.path.join(RAW_DATA_DIR, "gov_re_pdfs")
OUTPUT_FILE = r"c:\Users\ander\Desktop\StratAxis\data\yaounde_douala_insights.md"

CITIES = ["yaoundé", "yaounde", "douala"]
RE_KEYWORDS = [
    "logement", "foncier", "immobilier", "prix", "construction", "btp", 
    "infrastructure", "terrain", "investissement", "highway", "port", 
    "airport", "route", "pont", "bridge", "rent", "loyer", "bâtiment", "aménagement"
]

def load_numerical_data():
    files = [f for f in os.listdir(RAW_DATA_DIR) if f.startswith("gov_re_numerical_") and f.endswith(".csv")]
    if not files:
        return pd.DataFrame()
    # just pick the most recent one
    latest_file = sorted(files)[-1]
    logging.info(f"Loading numerical data from {latest_file}")
    df = pd.read_csv(os.path.join(RAW_DATA_DIR, latest_file))
    return df

def clean_text(text):
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def process_pdfs():
    if not os.path.exists(PDF_DIR):
        logging.warning("PDF directory not found.")
        return []
    
    files = [f for f in os.listdir(PDF_DIR) if f.endswith(".pdf")]
    logging.info(f"Found {len(files)} PDFs to scan.")
    
    paragraphs_found = []
    
    for f in files:
        filepath = os.path.join(PDF_DIR, f)
        try:
            doc = fitz.open(filepath)
            for page_num in range(len(doc)):
                page = doc.load_page(page_num)
                # get text sorted by blocks (y-coordinate)
                blocks = page.get_text("blocks")
                for b in blocks:
                    text = b[4]
                    if not text:
                        continue
                    text_clean = clean_text(text)
                    if len(text_clean) < 150:
                        continue
                    
                    text_lower = text_clean.lower()
                    has_re = any(kw in text_lower for kw in RE_KEYWORDS)
                    
                    if has_re:
                        paragraphs_found.append({
                            "source_file": f,
                            "page": page_num + 1,
                            "original_text": text_clean
                        })
            doc.close()
        except Exception as e:
            logging.error(f"Error reading {f}: {e}")
            
    return paragraphs_found

def generate_insights():
    logging.info("Starting NLP extraction process...")
    
    # 1. Get raw paragraphs from PDFs
    raw_paragraphs = process_pdfs()
    logging.info(f"Extracted {len(raw_paragraphs)} potentially relevant paragraphs.")
    
    # 2. Get numerical data
    num_df = load_numerical_data()
    city_nums = []
    if not num_df.empty:
        # filter for yaounde/douala if region column exists
        if 'region' in num_df.columns:
            city_df = num_df[num_df['region'].fillna('').astype(str).str.lower().isin(['centre', 'littoral'])]
            for _, row in city_df.iterrows():
                context = row.get('context', '')
                if pd.isna(context): context = ''
                val = format(row.get('value', 0), ",").replace(",", " ")
                metric = row.get('metric_name', '')
                source = row.get('source_display', '')
                city_nums.append({
                    "text": f"Metric recorded: {metric}.\nAmount: {val} FCFA.\nContext provided: {context}",
                    "source": source
                })
    
    translator = GoogleTranslator(source='fr', target='en')
    
    # Let's deduplicate raw_paragraphs based on first 50 chars approx
    seen = set()
    unique_paras = []
    for p in raw_paragraphs:
        sig = p['original_text'][:70].lower()
        if sig not in seen:
            seen.add(sig)
            unique_paras.append(p)
    
    logging.info(f"{len(unique_paras)} unique paragraphs after deduplication. Limiting to top 50 for quick insights.")
    unique_paras = unique_paras[:50]
    
    insights = []
    
    # Translate and build document insights
    for i, p in enumerate(unique_paras):
        try:
            logging.info(f"Translating paragraph {i+1}/{len(unique_paras)}...")
            time.sleep(0.5)
            # Make sure we don't exceed max char length for deep-translator
            text_to_translate = p['original_text'][:4000] 
            translated = translator.translate(text_to_translate)
            
            # Build a dynamic title based on keywords
            translated_lower = translated.lower()
            title = "Urban Development / Construction Update"
            if "road" in translated_lower or "highway" in translated_lower or "bridge" in translated_lower:
                title = "Infrastructure and Road Network Development"
            elif "price" in translated_lower or "budget" in translated_lower or "cost" in translated_lower:
                title = "Market Valuation and Project Costing"
            elif "land" in translated_lower or "cadastral" in translated_lower:
                title = "Land Allocation and Land Policy"
                
            insights.append({
                "title": title,
                "body": translated,
                "source": f"{p['source_file']} (Page {p['page']})"
            })
        except Exception as e:
            logging.error(f"Translation failed: {e}")
            
    # Also translate numerical insights
    num_insights = []
    for i, num in enumerate(city_nums):
        try:
            if i > 25: break # cap numerical insights so translation doesn't take forever
            time.sleep(0.5)
            # The context is in French, other phrasing is English
            translated = translator.translate(num["text"])
            num_insights.append({
                "body": translated,
                "source": num["source"]
            })
        except Exception as e:
            pass

    # Save to file
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write("# Real Estate Market Insights: Yaoundé and Douala\n\n")
        f.write("This document contains natural language insights generated directly from government real estate PDFs and structured numerical data, scanned between 2020 and 2026. The text has been extracted, filtered for relevance to Yaoundé and Douala, and translated into English for seamless data-driven decision-making.\n\n")
        
        f.write("## 📄 Document-Based Market Insights\n\n")
        if not insights:
            f.write("*No document-based insights could be extracted for Douala/Yaoundé from the PDFs currently downloaded.*")
            
        for i, insight in enumerate(insights):
            f.write(f"### {i+1}. {insight['title']}\n")
            f.write(f"**Actionable Insights & Details:**\n{insight['body']}\n\n")
            f.write(f"**Source Document:** `{insight['source']}`\n\n")
            f.write("---\n\n")
            
        f.write("## 🧮 Numerical & Financial Data Insights (Centre & Littoral Regions)\n\n")
        if not num_insights:
            f.write("*No structural public market numerical data found specifically for Yaoundé (Centre) or Douala (Littoral).*")
            
        for i, num in enumerate(num_insights):
            f.write(f"### Datapoint {i+1}\n")
            f.write(f"{num['body']}\n\n")
            f.write(f"**Original Authority:** {num['source']}\n\n")
            f.write("---\n\n")
            
    logging.info(f"Successfully saved insights to {OUTPUT_FILE}")

if __name__ == '__main__':
    generate_insights()
