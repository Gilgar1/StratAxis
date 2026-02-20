"""
StratAxis — data/cleaned/clean_land.py
Cleans raw land listings CSV → uploads to Supabase land_listings table.

Run after land_scraper.py:
  python data/cleaned/clean_land.py --input data/raw/land_listings_<timestamp>.csv
"""

import os
import sys
import math
import logging
import argparse
import pandas as pd
from datetime import datetime
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", ".env"))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
from backend.database import get_supabase

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [CLEAN-LAND] %(levelname)s — %(message)s",
)
logger = logging.getLogger("strataxis.clean_land")

CLEANED_DIR = os.path.dirname(__file__)

# XAF price per m² bounds for land in Cameroon
LAND_PRICE_M2_MIN = 500       # 500 XAF/m² — very cheap rural
LAND_PRICE_M2_MAX = 1_500_000 # 1.5M XAF/m² — ultra-prime Bastos/Bonanjo

# Lot size bounds
LOT_SIZE_MIN_M2 = 50          # 50m² minimum
LOT_SIZE_MAX_M2 = 100_000     # 10 hectares max

CITY_NORMALIZATION = {
    "douala": "Douala",
    "yaounde": "Yaounde",
    "yaoundé": "Yaounde",
    "bali": "Douala",
    "akwa": "Douala",
    "bonanjo": "Douala",
    "bonapriso": "Douala",
    "makepe": "Douala",
    "bastos": "Yaounde",
    "nlongkak": "Yaounde",
    "biyem assi": "Yaounde",
    "mendong": "Yaounde",
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


def clean_numeric(val) -> float | None:
    if pd.isna(val) or val == "" or val is None:
        return None
    try:
        f = float(str(val).replace(" ", "").replace(",", ""))
        return f if f > 0 else None
    except (ValueError, TypeError):
        return None


def detect_city_from_row(row: pd.Series) -> str:
    if row.get("city") and row["city"] in ["Douala", "Yaounde"]:
        return row["city"]
    text = f"{row.get('neighborhood', '')} {row.get('title', '')}".lower()
    for key, canonical in CITY_NORMALIZATION.items():
        if key in text:
            return canonical
    return row.get("city", "")


def remove_outliers(df: pd.DataFrame, col: str, z_threshold: float = 3.5) -> pd.DataFrame:
    if col not in df.columns or df[col].dropna().empty:
        return df
    mean = df[col].mean()
    std = df[col].std()
    if std == 0:
        return df
    mask = (df[col] - mean).abs() / std <= z_threshold
    removed = (~mask).sum()
    if removed > 0:
        logger.info(f"Removed {removed} outliers from '{col}'")
    return df[mask | df[col].isna()]


# ─────────────────────────────────────────────
# Main cleaning pipeline
# ─────────────────────────────────────────────
def clean_land_file(input_path: str) -> pd.DataFrame:
    logger.info(f"Loading: {input_path}")
    df = pd.read_csv(input_path, encoding="utf-8")
    initial_count = len(df)
    logger.info(f"Loaded {initial_count} raw records")

    # ── Step 1: Clean numeric fields ──
    df["total_price"] = df["total_price"].apply(clean_numeric)
    df["lot_size_m2"] = df["lot_size_m2"].apply(clean_numeric)
    df["price_per_m2"] = df["price_per_m2"].apply(clean_numeric)

    # ── Step 2: Recompute price_per_m2 where missing but total + size available ──
    mask_missing_ppm2 = df["price_per_m2"].isna() & df["total_price"].notna() & df["lot_size_m2"].notna()
    df.loc[mask_missing_ppm2, "price_per_m2"] = (
        df.loc[mask_missing_ppm2, "total_price"] / df.loc[mask_missing_ppm2, "lot_size_m2"]
    ).round(2)

    # ── Step 3: Normalize city ──
    df["city"] = df["city"].apply(normalize_city)
    df["city"] = df.apply(detect_city_from_row, axis=1)

    # ── Step 4: Normalize timestamps ──
    df["scraped_at"] = pd.to_datetime(df["scraped_at"], errors="coerce").dt.isoformat()

    # ── Step 5: Drop missing critical fields ──
    before = len(df)
    df = df.dropna(subset=["price_per_m2", "city"])
    df = df[df["city"].isin(["Douala", "Yaounde"])]
    logger.info(f"Dropped {before - len(df)} records (no price_per_m2 or wrong city)")

    # ── Step 6: Enforce realistic price bounds ──
    before = len(df)
    df = df[
        (df["price_per_m2"] >= LAND_PRICE_M2_MIN)
        & (df["price_per_m2"] <= LAND_PRICE_M2_MAX)
    ]
    logger.info(f"Dropped {before - len(df)} records outside price_per_m2 bounds")

    # ── Step 7: Enforce realistic lot size bounds ──
    if "lot_size_m2" in df.columns:
        df = df[
            df["lot_size_m2"].isna()
            | ((df["lot_size_m2"] >= LOT_SIZE_MIN_M2) & (df["lot_size_m2"] <= LOT_SIZE_MAX_M2))
        ]

    # ── Step 8: Remove outliers ──
    df = remove_outliers(df, "price_per_m2", z_threshold=3.5)

    # ── Step 9: Deduplicate ──
    if "record_id" in df.columns:
        df = df.drop_duplicates(subset=["record_id"])
    else:
        df = df.drop_duplicates(subset=["title", "city", "price_per_m2"])

    # ── Step 10: Quality scoring ──
    df["quality_score"] = 100.0
    df.loc[df["lot_size_m2"].isna(), "quality_score"] -= 15
    df.loc[df["total_price"].isna(), "quality_score"] -= 10
    df.loc[df["neighborhood"].isna() | (df["neighborhood"] == ""), "quality_score"] -= 15
    df["quality_score"] = df["quality_score"].clip(0, 100)

    # ── Step 11: Add metadata ──
    df["cleaned_at"] = datetime.utcnow().isoformat()
    df["data_type"] = "land"
    df["validation_status"] = df["quality_score"].apply(
        lambda s: "validated" if s >= 70 else "pending"
    )

    final_count = len(df)
    logger.info(
        f"Cleaning complete: {initial_count} → {final_count} records "
        f"({initial_count - final_count} dropped, {((final_count/initial_count)*100):.1f}% kept)"
    )
    return df


# ─────────────────────────────────────────────
# Save cleaned CSV
# ─────────────────────────────────────────────
def save_cleaned_csv(df: pd.DataFrame, input_path: str) -> str:
    base = os.path.basename(input_path).replace("land_listings_", "land_cleaned_")
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

    cleaned_records = [
        {k: (None if isinstance(v, float) and math.isnan(v) else v) for k, v in r.items()}
        for r in records
    ]

    BATCH_SIZE = 100
    total_uploaded = 0

    for i in range(0, len(cleaned_records), BATCH_SIZE):
        batch = cleaned_records[i: i + BATCH_SIZE]
        try:
            result = supabase.table("land_listings").upsert(
                batch, on_conflict="record_id"
            ).execute()
            total_uploaded += len(result.data)
            logger.info(f"Uploaded batch {i // BATCH_SIZE + 1}: {len(result.data)} records")
        except Exception as e:
            logger.error(f"Batch upload failed at {i}: {e}")

    logger.info(f"=== Upload complete: {total_uploaded} records in land_listings table ===")


# ─────────────────────────────────────────────
# CLI
# ─────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="Clean land listings CSV and upload to Supabase")
    parser.add_argument("--input", required=True, help="Path to raw CSV")
    parser.add_argument("--no-upload", action="store_true")
    args = parser.parse_args()

    df = clean_land_file(args.input)
    save_cleaned_csv(df, args.input)

    if not args.no_upload:
        upload_to_supabase(df)
    else:
        logger.info("Skipping upload (--no-upload flag set)")


if __name__ == "__main__":
    main()
