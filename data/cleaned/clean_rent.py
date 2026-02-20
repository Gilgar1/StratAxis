"""
StratAxis — data/cleaned/clean_rent.py
Cleans raw rent listings CSV → uploads to Supabase rent_listings table.

Run after house_scraper.py:
  python data/cleaned/clean_rent.py --input data/raw/rent_listings_<timestamp>.csv
"""

import os
import re
import sys
import logging
import argparse
import pandas as pd
from datetime import datetime
from dotenv import load_dotenv

# Load env from project root
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", ".env"))

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
from backend.database import get_supabase

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [CLEAN-RENT] %(levelname)s — %(message)s",
)
logger = logging.getLogger("strataxis.clean_rent")

CLEANED_DIR = os.path.dirname(__file__)

# ─────────────────────────────────────────────
# Neighborhood → City canonical mapping
# ─────────────────────────────────────────────
CITY_NORMALIZATION = {
    "douala": "Douala",
    "yaounde": "Yaounde",
    "yaoundé": "Yaounde",
    "bali": "Douala",
    "akwa": "Douala",
    "bonanjo": "Douala",
    "bonapriso": "Douala",
    "bonamoussadi": "Douala",
    "makepe": "Douala",
    "logbessou": "Douala",
    "bassa": "Douala",
    "bastos": "Yaounde",
    "nlongkak": "Yaounde",
    "essos": "Yaounde",
    "biyem assi": "Yaounde",
    "mendong": "Yaounde",
    "mvog ada": "Yaounde",
    "nsimeyong": "Yaounde",
}

HOUSING_TYPE_NORMALIZATION = {
    "appartement": "apartment",
    "maison": "house",
    "villa": "villa",
    "studio": "studio",
    "chambre": "room",
    "duplex": "duplex",
    "s1": "studio",
    "f1": "studio",
    "f2": "apartment",
    "f3": "apartment",
    "f4": "apartment",
    "f5": "house",
}

# ─────────────────────────────────────────────
# Cleaning functions
# ─────────────────────────────────────────────
def normalize_city(raw: str) -> str:
    if not raw:
        return ""
    raw_lower = raw.lower().strip()
    for key, canonical in CITY_NORMALIZATION.items():
        if key in raw_lower:
            return canonical
    return raw.strip().title()


def normalize_housing_type(raw: str) -> str:
    if not raw:
        return "unknown"
    raw_lower = raw.lower().strip()
    for key, canonical in HOUSING_TYPE_NORMALIZATION.items():
        if key == raw_lower or key in raw_lower:
            return canonical
    return raw_lower


def clean_price(val) -> float | None:
    if pd.isna(val) or val == "" or val == 0:
        return None
    try:
        f = float(str(val).replace(" ", "").replace(",", ""))
        return f if f > 0 else None
    except (ValueError, TypeError):
        return None


def clean_int(val) -> int | None:
    if pd.isna(val) or val == "":
        return None
    try:
        return int(float(val))
    except (ValueError, TypeError):
        return None


def detect_and_fill_city(row: pd.Series) -> str:
    """If city is missing, try to detect from neighborhood or title."""
    if row.get("city"):
        return row["city"]
    text = f"{row.get('neighborhood', '')} {row.get('title', '')}".lower()
    for key, canonical in CITY_NORMALIZATION.items():
        if key in text:
            return canonical
    return ""


def remove_outliers(df: pd.DataFrame, col: str, z_threshold: float = 3.5) -> pd.DataFrame:
    """Remove statistical outliers using Z-score."""
    if col not in df.columns or df[col].dropna().empty:
        return df
    mean = df[col].mean()
    std = df[col].std()
    if std == 0:
        return df
    mask = (df[col] - mean).abs() / std <= z_threshold
    removed = (~mask).sum()
    if removed > 0:
        logger.info(f"Removed {removed} outliers from column '{col}'")
    return df[mask | df[col].isna()]


# ─────────────────────────────────────────────
# Main cleaning pipeline
# ─────────────────────────────────────────────
def clean_rent_file(input_path: str) -> pd.DataFrame:
    logger.info(f"Loading: {input_path}")
    df = pd.read_csv(input_path, encoding="utf-8")
    initial_count = len(df)
    logger.info(f"Loaded {initial_count} raw records")

    # ── Step 1: Rename / standardize columns ──
    col_map = {
        "price_raw": "price_raw",
        "size_m2": "size_m2",
        "scraped_at": "scraped_at",
    }
    df = df.rename(columns=col_map)

    # ── Step 2: Clean price ──
    df["price"] = df["price"].apply(clean_price)

    # ── Step 3: Clean numeric fields ──
    df["bedrooms"] = df["bedrooms"].apply(clean_int)
    df["bathrooms"] = df["bathrooms"].apply(clean_int)
    if "size_m2" in df.columns:
        df["size_m2"] = pd.to_numeric(df["size_m2"], errors="coerce")

    # ── Step 4: Normalize city ──
    df["city"] = df["city"].apply(normalize_city)
    df["city"] = df.apply(detect_and_fill_city, axis=1)

    # ── Step 5: Normalize housing type ──
    df["housing_type"] = df["housing_type"].apply(normalize_housing_type)

    # ── Step 6: Normalize timestamps ──
    df["scraped_at"] = pd.to_datetime(df["scraped_at"], errors="coerce").dt.isoformat()

    # ── Step 7: Drop records missing critical fields ──
    before_drop = len(df)
    df = df.dropna(subset=["price", "city"])
    df = df[df["city"].isin(["Douala", "Yaounde"])]
    logger.info(f"Dropped {before_drop - len(df)} records (missing price/city or wrong city)")

    # ── Step 8: Filter realistic price range (XAF 20,000 - 5,000,000/month) ──
    df = df[(df["price"] >= 20_000) & (df["price"] <= 5_000_000)]

    # ── Step 9: Remove outliers ──
    df = remove_outliers(df, "price", z_threshold=3.5)

    # ── Step 10: Deduplicate by record_id ──
    if "record_id" in df.columns:
        df = df.drop_duplicates(subset=["record_id"])
    else:
        df = df.drop_duplicates(subset=["title", "city", "price"])

    # ── Step 11: Add quality score ──
    df["quality_score"] = 100.0
    df.loc[df["bedrooms"].isna(), "quality_score"] -= 10
    df.loc[df["bathrooms"].isna(), "quality_score"] -= 5
    df.loc[df["neighborhood"].isna() | (df["neighborhood"] == ""), "quality_score"] -= 15
    df.loc[df["size_m2"].isna(), "quality_score"] -= 10
    df["quality_score"] = df["quality_score"].clip(0, 100)

    # ── Step 12: Add metadata ──
    df["cleaned_at"] = datetime.utcnow().isoformat()
    df["validation_status"] = df["quality_score"].apply(
        lambda s: "validated" if s >= 70 else "pending"
    )

    final_count = len(df)
    logger.info(
        f"Cleaning complete: {initial_count} → {final_count} records "
        f"({initial_count - final_count} dropped)"
    )
    return df


# ─────────────────────────────────────────────
# Save cleaned CSV
# ─────────────────────────────────────────────
def save_cleaned_csv(df: pd.DataFrame, input_path: str) -> str:
    base = os.path.basename(input_path).replace("rent_listings_", "rent_cleaned_")
    output_path = os.path.join(CLEANED_DIR, base)
    df.to_csv(output_path, index=False, encoding="utf-8")
    logger.info(f"Saved cleaned CSV: {output_path}")
    return output_path


# ─────────────────────────────────────────────
# Upload to Supabase
# ─────────────────────────────────────────────
def upload_to_supabase(df: pd.DataFrame):
    supabase = get_supabase()
    records = df.to_dict("records")

    # Clean up NaN values (JSON doesn't support NaN)
    import math
    cleaned_records = []
    for r in records:
        cleaned = {
            k: (None if isinstance(v, float) and math.isnan(v) else v)
            for k, v in r.items()
        }
        cleaned_records.append(cleaned)

    BATCH_SIZE = 100
    total_uploaded = 0

    for i in range(0, len(cleaned_records), BATCH_SIZE):
        batch = cleaned_records[i: i + BATCH_SIZE]
        try:
            result = supabase.table("rent_listings").upsert(
                batch, on_conflict="record_id"
            ).execute()
            total_uploaded += len(result.data)
            logger.info(f"Uploaded batch {i // BATCH_SIZE + 1}: {len(result.data)} records")
        except Exception as e:
            logger.error(f"Batch upload failed at {i}: {e}")

    logger.info(f"=== Upload complete: {total_uploaded} records in rent_listings table ===")


# ─────────────────────────────────────────────
# CLI entry point
# ─────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="Clean rent listings CSV and upload to Supabase")
    parser.add_argument("--input", required=True, help="Path to raw CSV file")
    parser.add_argument("--no-upload", action="store_true", help="Skip Supabase upload")
    args = parser.parse_args()

    df = clean_rent_file(args.input)
    save_cleaned_csv(df, args.input)

    if not args.no_upload:
        upload_to_supabase(df)
    else:
        logger.info("Skipping upload (--no-upload flag set)")


if __name__ == "__main__":
    main()
