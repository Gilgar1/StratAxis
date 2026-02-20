"""
StratAxis — services/forecast_service.py
Intelligence Layer: reads data from DB, runs ML models, writes predictions back to DB.

Flow:
  DB (cleaned data) → Feature Engineering → ML Model → Predictions → DB

Supports:
  - Rent price forecasting (6/12 month horizons)
  - Land price forecasting
  - Annual appreciation estimates
  - Neighborhood-level trend forecasting
"""

import os
import pickle
import logging
import numpy as np
import pandas as pd
from datetime import datetime, date
from dateutil.relativedelta import relativedelta
from collections import defaultdict
from typing import Optional
from backend.database import get_supabase

logger = logging.getLogger("strataxis.forecast")

# ─────────────────────────────────────────────
# Model paths
# ─────────────────────────────────────────────
MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "models")

MODELS = {
    "rent": os.path.join(MODEL_DIR, "rent_price_model.pkl"),
    "land": os.path.join(MODEL_DIR, "land_price_model.pkl"),
}


def _load_model(data_type: str):
    """Load a pickled ML model from the models/ directory."""
    path = MODELS.get(data_type)
    if not path or not os.path.exists(path):
        logger.warning(f"No model found for data_type='{data_type}' at {path}")
        return None
    with open(path, "rb") as f:
        return pickle.load(f)


# ─────────────────────────────────────────────
# Feature Engineering
# ─────────────────────────────────────────────
def _engineer_features(df: pd.DataFrame, data_type: str) -> pd.DataFrame:
    """
    Convert raw DB rows into model-ready feature vectors.
    Mirrors the feature_engineering.py logic in the data-pipeline.
    """
    df = df.copy()

    # Temporal features
    if "scraped_at" in df.columns:
        df["scraped_at"] = pd.to_datetime(df["scraped_at"], errors="coerce")
        df["year"] = df["scraped_at"].dt.year
        df["month"] = df["scraped_at"].dt.month
        df["month_sin"] = np.sin(2 * np.pi * df["month"] / 12)
        df["month_cos"] = np.cos(2 * np.pi * df["month"] / 12)
        df["quarter"] = df["scraped_at"].dt.quarter

    # City encoding
    if "city" in df.columns:
        df["city_douala"] = (df["city"].str.lower().str.contains("douala")).astype(int)
        df["city_yaounde"] = (df["city"].str.lower().str.contains("yaounde|yaoundé")).astype(int)

    # Property type encoding
    if data_type == "rent" and "housing_type" in df.columns:
        for t in ["apartment", "house", "studio", "villa"]:
            df[f"type_{t}"] = (df["housing_type"].str.lower() == t).astype(int)

    # Numeric normalization
    numeric_cols = ["price", "price_per_m2", "lot_size", "bedrooms", "bathrooms"]
    for col in numeric_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")

    return df


# ─────────────────────────────────────────────
# Core Forecast Function
# ─────────────────────────────────────────────
def generate_forecast(
    data_type: str,
    city: Optional[str] = None,
    horizon_months: int = 6,
) -> list[dict]:
    """
    Main forecasting function.
    1. Reads cleaned data from Supabase
    2. Engineers features
    3. Runs the ML model
    4. Returns forecast list (one row per month)

    Args:
        data_type: "rent" or "land"
        city: optional city filter
        horizon_months: how many months ahead to forecast

    Returns:
        List of dicts: [{period, city, data_type, predicted_price, lower_bound, upper_bound}]
    """
    supabase = get_supabase()
    table = "rent_listings" if data_type == "rent" else "land_listings"

    # Load data from DB
    query = supabase.table(table).select("*")
    if city:
        query = query.ilike("city", f"%{city}%")
    result = query.execute()

    if not result.data:
        logger.warning(f"No data found in {table} for city={city}")
        return []

    df = pd.DataFrame(result.data)
    df = _engineer_features(df, data_type)

    # Use model if available, else statistical fallback
    model = _load_model(data_type)
    price_col = "price" if data_type == "rent" else "price_per_m2"

    if price_col not in df.columns or df[price_col].dropna().empty:
        logger.warning(f"No numeric price column found in {table}")
        return []

    prices = df[price_col].dropna().astype(float)

    # ── Statistical baseline (always available) ──
    baseline_avg = prices.mean()
    baseline_std = prices.std()

    # ── Trend slope (simple linear regression over time) ──
    slope = 0.0
    if "month_sin" in df.columns and len(df) > 5:
        try:
            X_trend = df[["year", "month"]].dropna().values
            y_trend = prices[df[["year", "month"]].dropna().index].values
            if len(X_trend) > 5:
                from numpy.linalg import lstsq
                A = np.column_stack([X_trend[:, 1], np.ones(len(X_trend))])
                slope, _ = lstsq(A, y_trend, rcond=None)[0]
        except Exception:
            slope = 0.0

    # ── ML model prediction if available ──
    feature_cols = [c for c in df.columns if c not in [
        "id", "title", "description", "source_url", "image_url",
        "scraped_at", "created_at", "updated_at", price_col
    ] and df[c].dtype in [np.float64, np.int64, float, int]]

    model_available = model is not None and len(feature_cols) > 0

    forecasts = []
    today = date.today()

    for i in range(1, horizon_months + 1):
        forecast_date = today + relativedelta(months=i)
        month_offset = i

        if model_available:
            try:
                # Build a simple feature row for the forecast
                sample = df[feature_cols].dropna().mean().to_dict()
                sample["month"] = forecast_date.month
                sample["year"] = forecast_date.year
                sample["month_sin"] = np.sin(2 * np.pi * forecast_date.month / 12)
                sample["month_cos"] = np.cos(2 * np.pi * forecast_date.month / 12)
                X_pred = pd.DataFrame([sample])[feature_cols].fillna(0)
                predicted = float(model.predict(X_pred)[0])
            except Exception as e:
                logger.error(f"Model prediction failed: {e}")
                predicted = baseline_avg + (slope * month_offset)
        else:
            # Statistical projection: baseline + trend slope
            predicted = baseline_avg + (slope * month_offset)

        # Confidence interval (±1 std, adjusted by horizon uncertainty)
        uncertainty = baseline_std * (1 + 0.05 * month_offset)
        lower = max(0, predicted - uncertainty)
        upper = predicted + uncertainty

        forecasts.append({
            "predicted_for": forecast_date.isoformat(),
            "city": city or "all",
            "data_type": data_type,
            "predicted_price": round(predicted, 2),
            "lower_bound": round(lower, 2),
            "upper_bound": round(upper, 2),
            "model_used": "ml_model" if model_available else "statistical",
            "horizon_month": i,
            "created_at": datetime.utcnow().isoformat(),
        })

    return forecasts


# ─────────────────────────────────────────────
# Persist Predictions to DB
# ─────────────────────────────────────────────
def save_predictions_to_db(
    forecasts: list[dict],
    data_type: str,
    city: Optional[str] = None,
):
    """
    Upsert forecast results into the price_predictions table in Supabase.
    Called by the scheduler or admin trigger endpoint.
    """
    supabase = get_supabase()
    if not forecasts:
        logger.info("No forecasts to save.")
        return

    # Delete existing predictions for same city + data_type
    delete_query = (
        supabase.table("price_predictions")
        .delete()
        .eq("data_type", data_type)
    )
    if city:
        delete_query = delete_query.eq("city", city)
    delete_query.execute()

    # Insert fresh predictions
    result = supabase.table("price_predictions").insert(forecasts).execute()
    logger.info(f"Saved {len(result.data)} predictions for {data_type} / {city or 'all'}")
    return result.data


# ─────────────────────────────────────────────
# Compute + Save Monthly Trend Summaries
# ─────────────────────────────────────────────
def compute_price_trends(data_type: str):
    """
    Aggregate raw listings by month and store in price_trends table.
    Run after each scrape cycle to keep trend data fresh.
    """
    supabase = get_supabase()
    table = "rent_listings" if data_type == "rent" else "land_listings"
    price_col = "price" if data_type == "rent" else "price_per_m2"

    result = supabase.table(table).select(f"city, {price_col}, scraped_at").execute()
    if not result.data:
        return

    df = pd.DataFrame(result.data)
    df["scraped_at"] = pd.to_datetime(df["scraped_at"], errors="coerce")
    df[price_col] = pd.to_numeric(df[price_col], errors="coerce")
    df = df.dropna(subset=["scraped_at", price_col])
    df["period"] = df["scraped_at"].dt.to_period("M").astype(str)

    grouped = df.groupby(["city", "period"])[price_col].agg(
        avg_price="mean",
        median_price="median",
        min_price="min",
        max_price="max",
        count="count",
    ).reset_index()

    trends = grouped.rename(columns={"avg_price": "avg_price"}).to_dict("records")
    for t in trends:
        t["data_type"] = data_type
        t["avg_price"] = round(t["avg_price"], 2)
        t["median_price"] = round(t["median_price"], 2)
        t["created_at"] = datetime.utcnow().isoformat()

    # Upsert into price_trends table
    supabase.table("price_trends").upsert(
        trends, on_conflict="city,period,data_type"
    ).execute()
    logger.info(f"Computed {len(trends)} trend periods for {data_type}")


# ─────────────────────────────────────────────
# Full Pipeline Run (called by scheduler / admin)
# ─────────────────────────────────────────────
def run_full_intelligence_pipeline():
    """
    Orchestrates the full Intelligence Layer:
    1. Compute trend summaries for rent + land
    2. Generate + save forecasts for all cities
    """
    cities = ["Douala", "Yaounde"]
    data_types = ["rent", "land"]

    logger.info("=== StratAxis Intelligence Pipeline Starting ===")

    for dt in data_types:
        logger.info(f"Computing price trends for {dt}...")
        compute_price_trends(dt)

        for city in cities:
            logger.info(f"Generating forecasts: {dt} / {city}")
            forecasts = generate_forecast(dt, city=city, horizon_months=12)
            save_predictions_to_db(forecasts, data_type=dt, city=city)

    logger.info("=== Intelligence Pipeline Complete ===")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    run_full_intelligence_pipeline()
