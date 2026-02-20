"""
StratAxis ML Engine
====================
Processes real government institutional data (INS, MINHDU) scraped from
Cameroon official sources (2020-2026) and runs ML models + time series analysis.

Data sources:
  - structured JSON tables from HTML/PDF (housing indicators, city stats)
  - document metadata (category, region, relevance, publication date)

Output (in strataxis_data/results/):
  - StratAxis_Intelligence_Report.txt  → plain-text insight report
  - category_distribution.png          → bar chart of document categories
  - region_distribution.png            → bar chart of document by region
  - relevance_over_time.png            → time series of scraped document relevance scores
  - housing_indicators_heatmap.png     → heatmap of DONNEE INDICATEUR by city × theme
  - RandomForest_relevance_importance.png
  - ml_predictions_vs_actual.png
  - StratAxis_ML_Dataset.csv           → ML-ready flat dataset for external tools
"""

import json
import re
import logging
import warnings
from pathlib import Path

import pandas as pd
import numpy as np
import matplotlib
matplotlib.use("Agg")   # non-interactive backend (no GUI needed)
import matplotlib.pyplot as plt
import seaborn as sns
import joblib

from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import mean_absolute_error, r2_score, mean_squared_error
from sklearn.preprocessing import LabelEncoder
from datetime import datetime

warnings.filterwarnings("ignore")
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# ── Paths ──────────────────────────────────────────────────────────────────────
DATA_DIR   = Path("strataxis_data")
RAW_CSV    = DATA_DIR / "strataxis_real_estate_intelligence_2020_2026.csv"
MODELS_DIR = DATA_DIR / "models"
RESULTS    = DATA_DIR / "results"
MODELS_DIR.mkdir(parents=True, exist_ok=True)
RESULTS.mkdir(parents=True, exist_ok=True)

plt.style.use("ggplot")
sns.set_palette("husl")

# ─────────────────────────────────────────────────────────────
# 1. DATA LOADING & STRUCTURED-TABLE EXTRACTION
# ─────────────────────────────────────────────────────────────
def load_raw_data() -> pd.DataFrame:
    df = pd.read_csv(RAW_CSV)
    df["publication_date"] = pd.to_datetime(df["publication_date"], errors="coerce")
    df["year"]  = df["publication_date"].dt.year
    df["month"] = df["publication_date"].dt.month
    logger.info(f"Raw CSV loaded: {len(df):,} rows × {len(df.columns)} cols")
    return df

def expand_structured_tables(df: pd.DataFrame) -> pd.DataFrame:
    """
    Parse the JSON blobs in 'extracted_structured_data' into flat rows.
    Each JSON row becomes one record enriched with parent metadata.
    """
    flat_rows = []
    for _, parent in df.iterrows():
        raw = parent.get("extracted_structured_data")
        if not isinstance(raw, str) or len(raw.strip()) < 10:
            continue
        try:
            tables = json.loads(raw)
        except Exception:
            continue

        for tbl in tables:
            for data_row in tbl.get("data", []):
                if not isinstance(data_row, dict):
                    continue
                record = {
                    "source_institution": parent.get("source_institution"),
                    "parent_title":       parent.get("title"),
                    "publication_date":   parent.get("publication_date"),
                    "year":               parent.get("year"),
                    "month":              parent.get("month"),
                    "url":                parent.get("url"),
                    "document_type":      parent.get("document_type"),
                    "category":           parent.get("category"),
                    "region":             parent.get("region"),
                    "relevance_score":    parent.get("relevance_score"),
                    "keywords_detected":  parent.get("keywords_detected"),
                }
                # Normalise column names in the table row
                for k, v in data_row.items():
                    clean_k = (str(k).lower()
                                     .strip()
                                     .replace(" ", "_")
                                     .replace("\xa0", "")
                                     .replace("/", "_"))
                    record[clean_k] = v
                flat_rows.append(record)

    structured_df = pd.DataFrame(flat_rows)
    logger.info(f"Expanded structured tables: {len(structured_df):,} rows")
    return structured_df


# ─────────────────────────────────────────────────────────────
# 2.  NUMERIC INDICATOR EXTRACTION
# ─────────────────────────────────────────────────────────────
def extract_numeric_indicator(val) -> float | None:
    """
    Turn strings like '91,4 %' / '3 / 1 000 hab' / '250 000 XAF' into floats.
    """
    if pd.isna(val):
        return None
    s = str(val).replace("\xa0", " ").replace(",", ".").strip()
    # take the first numeric token
    m = re.search(r"[\d]+\.?[\d]*", s)
    if m:
        try:
            return float(m.group())
        except ValueError:
            return None
    return None


# ─────────────────────────────────────────────────────────────
# 3.  VISUALISATIONS
# ─────────────────────────────────────────────────────────────
def plot_category_distribution(df: pd.DataFrame):
    cats = df["category"].value_counts()
    fig, ax = plt.subplots(figsize=(12, 5))
    cats.plot(kind="bar", ax=ax, color=sns.color_palette("husl", len(cats)))
    ax.set_title("StratAxis – Document Category Distribution (2020-2026)", fontsize=14)
    ax.set_xlabel("Category")
    ax.set_ylabel("Number of Documents")
    ax.tick_params(axis="x", rotation=35)
    plt.tight_layout()
    plt.savefig(RESULTS / "category_distribution.png", dpi=150)
    plt.close()
    logger.info("Saved: category_distribution.png")


def plot_region_distribution(df: pd.DataFrame):
    regs = df["region"].value_counts().dropna().head(15)
    fig, ax = plt.subplots(figsize=(12, 5))
    regs.plot(kind="bar", ax=ax, color=sns.color_palette("coolwarm", len(regs)))
    ax.set_title("StratAxis – Documents by Region", fontsize=14)
    ax.set_xlabel("Region")
    ax.set_ylabel("Count")
    ax.tick_params(axis="x", rotation=35)
    plt.tight_layout()
    plt.savefig(RESULTS / "region_distribution.png", dpi=150)
    plt.close()
    logger.info("Saved: region_distribution.png")


def plot_relevance_over_time(df: pd.DataFrame):
    ts = (df.dropna(subset=["publication_date"])
            .set_index("publication_date")
            .resample("ME")["relevance_score"]
            .mean()
            .dropna())
    if ts.empty:
        logger.warning("No date data for relevance time series.")
        return
    fig, ax = plt.subplots(figsize=(14, 5))
    ts.plot(ax=ax, marker="o", linewidth=2, color="#1f77b4")
    ax.set_title("StratAxis – Average Relevance Score Over Time", fontsize=14)
    ax.set_xlabel("Month")
    ax.set_ylabel("Avg Relevance Score")
    # Trend line
    x = np.arange(len(ts))
    coeff = np.polyfit(x, ts.values, 1)
    trend = np.polyval(coeff, x)
    ax.plot(ts.index, trend, "--", color="red", label=f"Trend ({'+' if coeff[0]>0 else ''}{coeff[0]:.2f}/mo)")
    ax.legend()
    plt.tight_layout()
    plt.savefig(RESULTS / "relevance_over_time.png", dpi=150)
    plt.close()
    logger.info("Saved: relevance_over_time.png")


def plot_housing_heatmap(structured_df: pd.DataFrame):
    """
    Heatmap of numeric housing indicator values by city × theme.
    Works with the INS IPIE/OMD indicator rows.
    """
    needed = {"ville_commune", "theme", "donnee_indicateur"}
    cols = set(structured_df.columns)
    if not needed.issubset(cols):
        logger.warning("Structured data missing VILLE/COMMUNE or THEME columns – skipping heatmap.")
        return

    work = structured_df[["ville_commune", "theme", "donnee_indicateur"]].copy()
    work["value"] = work["donnee_indicateur"].apply(extract_numeric_indicator)
    work = work.dropna(subset=["value"])

    if work.empty:
        logger.warning("No numeric indicator values found for heatmap.")
        return

    # Pivot: rows = city, cols = theme, values = mean indicator
    pivot = (work.groupby(["ville_commune", "theme"])["value"]
                  .mean()
                  .unstack(fill_value=np.nan))

    # Keep top-10 cities and top-8 themes for readability
    pivot = pivot.iloc[:10, :8]

    fig, ax = plt.subplots(figsize=(14, 8))
    sns.heatmap(pivot, ax=ax, cmap="YlOrRd", annot=True, fmt=".1f",
                linewidths=.5, cbar_kws={"label": "Mean Indicator Value"})
    ax.set_title("StratAxis – Housing Indicators by City × Theme (INS Data)", fontsize=13)
    ax.set_xlabel("Theme")
    ax.set_ylabel("City / Commune")
    plt.tight_layout()
    plt.savefig(RESULTS / "housing_indicators_heatmap.png", dpi=150)
    plt.close()
    logger.info("Saved: housing_indicators_heatmap.png")


# ─────────────────────────────────────────────────────────────
# 4.  ML MODELS
# ─────────────────────────────────────────────────────────────
def build_ml_dataset(df: pd.DataFrame) -> pd.DataFrame:
    """
    Build a feature matrix from the document metadata.
    Target: relevance_score (continuous 0–100 range).
    Features: category, region, document_type, year, month, keywords count.
    """
    ml = df[["relevance_score", "category", "region",
              "document_type", "year", "month",
              "keywords_detected", "source_institution"]].copy()

    # Count how many keywords were detected
    ml["kw_count"] = (ml["keywords_detected"]
                       .fillna("")
                       .apply(lambda x: len([k for k in str(x).split(",") if k.strip()])))

    # Label encode categoricals
    for col in ["category", "region", "document_type", "source_institution"]:
        le = LabelEncoder()
        ml[col + "_enc"] = le.fit_transform(ml[col].fillna("unknown"))

    ml = ml.dropna(subset=["relevance_score", "year"])
    return ml


def train_models(ml_df: pd.DataFrame) -> dict:
    feature_cols = ["category_enc", "region_enc", "document_type_enc",
                    "source_institution_enc", "year", "month", "kw_count"]
    target = "relevance_score"

    X = ml_df[feature_cols].fillna(0)
    y = ml_df[target]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    results = {}

    # — Random Forest —
    rf = RandomForestRegressor(n_estimators=200, max_depth=8, random_state=42, n_jobs=-1)
    rf.fit(X_train, y_train)
    y_pred_rf = rf.predict(X_test)
    results["RandomForest"] = {
        "model": rf,
        "mae":   mean_absolute_error(y_test, y_pred_rf),
        "rmse":  np.sqrt(mean_squared_error(y_test, y_pred_rf)),
        "r2":    r2_score(y_test, y_pred_rf),
        "y_test": y_test, "y_pred": y_pred_rf,
        "features": feature_cols,
    }
    joblib.dump(rf, MODELS_DIR / "RandomForest_model.pkl")
    logger.info(f"[Random Forest] MAE={results['RandomForest']['mae']:.2f}  R²={results['RandomForest']['r2']:.3f}")

    # — Gradient Boosting —
    gb = GradientBoostingRegressor(n_estimators=200, learning_rate=0.1,
                                    max_depth=4, random_state=42)
    gb.fit(X_train, y_train)
    y_pred_gb = gb.predict(X_test)
    results["GradientBoosting"] = {
        "model": gb,
        "mae":   mean_absolute_error(y_test, y_pred_gb),
        "rmse":  np.sqrt(mean_squared_error(y_test, y_pred_gb)),
        "r2":    r2_score(y_test, y_pred_gb),
        "y_test": y_test, "y_pred": y_pred_gb,
        "features": feature_cols,
    }
    joblib.dump(gb, MODELS_DIR / "GradientBoosting_model.pkl")
    logger.info(f"[Gradient Boosting] MAE={results['GradientBoosting']['mae']:.2f}  R²={results['GradientBoosting']['r2']:.3f}")

    return results


def plot_feature_importance(model_results: dict):
    for name, res in model_results.items():
        importances = pd.Series(
            res["model"].feature_importances_,
            index=res["features"]
        ).sort_values(ascending=True)

        fig, ax = plt.subplots(figsize=(9, 5))
        importances.plot(kind="barh", ax=ax, color=sns.color_palette("husl", len(importances)))
        ax.set_title(f"{name} – Feature Importances (Relevance Score Prediction)", fontsize=12)
        ax.set_xlabel("Importance")
        plt.tight_layout()
        plt.savefig(RESULTS / f"{name}_feature_importance.png", dpi=150)
        plt.close()
        logger.info(f"Saved: {name}_feature_importance.png")


def plot_predictions_vs_actual(model_results: dict):
    fig, axes = plt.subplots(1, len(model_results), figsize=(14, 5), sharey=True)
    if len(model_results) == 1:
        axes = [axes]

    for ax, (name, res) in zip(axes, model_results.items()):
        ax.scatter(res["y_test"], res["y_pred"], alpha=0.5, s=15, color="#1f77b4")
        lims = [min(res["y_test"].min(), res["y_pred"].min()),
                max(res["y_test"].max(), res["y_pred"].max())]
        ax.plot(lims, lims, "r--", label="Perfect fit")
        ax.set_title(f"{name}\nR²={res['r2']:.3f}  MAE={res['mae']:.2f}")
        ax.set_xlabel("Actual Relevance Score")
        ax.set_ylabel("Predicted")
        ax.legend()

    fig.suptitle("StratAxis ML – Predicted vs Actual Relevance Scores", fontsize=13)
    plt.tight_layout()
    plt.savefig(RESULTS / "ml_predictions_vs_actual.png", dpi=150)
    plt.close()
    logger.info("Saved: ml_predictions_vs_actual.png")


# ─────────────────────────────────────────────────────────────
# 5.  TIME SERIES ANALYSIS
# ─────────────────────────────────────────────────────────────
def time_series_analysis(df: pd.DataFrame):
    ts = (df.dropna(subset=["publication_date"])
            .set_index("publication_date")
            .resample("ME")["relevance_score"]
            .agg(["mean", "count"])
            .rename(columns={"mean": "avg_relevance", "count": "doc_count"})
            .dropna())

    if len(ts) < 4:
        logger.warning("Less than 4 monthly data points – skipping detailed decomposition.")
        return ts

    # Trend line
    x = np.arange(len(ts))
    coeff_rel = np.polyfit(x, ts["avg_relevance"].values, 1)
    coeff_cnt = np.polyfit(x, ts["doc_count"].values,   1)

    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(14, 8), sharex=True)

    # Avg Relevance
    ax1.plot(ts.index, ts["avg_relevance"], marker="o", linewidth=2, label="Avg Relevance")
    ax1.plot(ts.index, np.polyval(coeff_rel, x), "--r",
             label=f"Trend ({'+' if coeff_rel[0]>0 else ''}{coeff_rel[0]:.2f}/mo)")
    ax1.set_title("Average Document Relevance Score Over Time")
    ax1.set_ylabel("Avg Relevance")
    ax1.legend()

    # Document count
    ax2.bar(ts.index, ts["doc_count"], width=20, label="Docs Published", color="#ff7f0e", alpha=0.8)
    ax2.plot(ts.index, np.polyval(coeff_cnt, x), "--r",
             label=f"Trend ({'+' if coeff_cnt[0]>0 else ''}{coeff_cnt[0]:.2f}/mo)")
    ax2.set_title("Number of Published Documents per Month")
    ax2.set_ylabel("Document Count")
    ax2.set_xlabel("Month")
    ax2.legend()

    plt.suptitle("StratAxis – Time Series Analysis (2020-2026)", fontsize=14)
    plt.tight_layout()
    plt.savefig(RESULTS / "time_series_analysis.png", dpi=150)
    plt.close()
    logger.info("Saved: time_series_analysis.png")
    return ts


# ─────────────────────────────────────────────────────────────
# 6.  INSIGHTS REPORT
# ─────────────────────────────────────────────────────────────
def generate_report(df: pd.DataFrame, structured_df: pd.DataFrame,
                    ml_results: dict, ts: pd.DataFrame):
    report_path = RESULTS / "StratAxis_Intelligence_Report.txt"

    top_cat      = df["category"].value_counts().index[0]
    top_region   = df["region"].value_counts().dropna().index[0] if df["region"].notna().any() else "N/A"
    avg_rel      = df["relevance_score"].mean()
    date_range   = (df["publication_date"].min(), df["publication_date"].max())
    best_model   = min(ml_results, key=lambda k: ml_results[k]["mae"])

    lines = [
        "=" * 60,
        "   STRATAXIS REAL ESTATE INTELLIGENCE REPORT",
        f"   Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}",
        "=" * 60,
        "",
        "── DATASET OVERVIEW ──────────────────────────────────────",
        f"  Total documents analysed : {len(df):,}",
        f"  Structured table rows    : {len(structured_df):,}",
        f"  Date range               : {date_range[0].date() if pd.notna(date_range[0]) else 'N/A'} → {date_range[1].date() if pd.notna(date_range[1]) else 'N/A'}",
        f"  Average relevance score  : {avg_rel:.1f} / 100",
        "",
        "── DOCUMENT DISTRIBUTION ─────────────────────────────────",
    ]

    for cat, cnt in df["category"].value_counts().items():
        lines.append(f"  {cat:<20} : {cnt:>4} documents")

    lines += [
        "",
        "── REGIONAL COVERAGE ─────────────────────────────────────",
    ]
    for reg, cnt in df["region"].value_counts().dropna().items():
        lines.append(f"  {str(reg):<20} : {cnt:>4} documents")

    lines += [
        "",
        "── ML MODEL PERFORMANCE (Relevance Score Prediction) ─────",
    ]
    for name, res in ml_results.items():
        lines.append(f"  {name}")
        lines.append(f"    MAE  : {res['mae']:.3f}")
        lines.append(f"    RMSE : {res['rmse']:.3f}")
        lines.append(f"    R²   : {res['r2']:.3f}")
        lines.append("")

    lines += [
        f"  Best model: {best_model} (lowest MAE)",
        "",
        "── TIME SERIES INSIGHTS ──────────────────────────────────",
    ]
    if not ts.empty:
        ts_slope = np.polyfit(np.arange(len(ts)), ts["avg_relevance"].values, 1)[0]
        dir_str  = "INCREASING ↑" if ts_slope > 0 else "DECLINING ↓"
        lines.append(f"  Relevance trend      : {dir_str} ({ts_slope:+.2f} pts/month)")
        cnt_slope = np.polyfit(np.arange(len(ts)), ts["doc_count"].values, 1)[0]
        lines.append(f"  Publication activity : {'GROWING ↑' if cnt_slope > 0 else 'SHRINKING ↓'} ({cnt_slope:+.2f} docs/month)")

    lines += [
        "",
        "── KEY FINDINGS ──────────────────────────────────────────",
        f"  • Most active category  : {top_cat}",
        f"  • Most active region    : {top_region}",
        f"  • INS housing indicators: {len(structured_df):,} data rows extracted from official tables",
        "  • ML models can predict document relevance to guide further",
        "    scraping / intelligent document prioritisation.",
        "",
        "── OUTPUT FILES ──────────────────────────────────────────",
        "  strataxis_data/results/",
        "    ├── category_distribution.png",
        "    ├── region_distribution.png",
        "    ├── relevance_over_time.png",
        "    ├── time_series_analysis.png",
        "    ├── housing_indicators_heatmap.png",
        "    ├── RandomForest_feature_importance.png",
        "    ├── GradientBoosting_feature_importance.png",
        "    ├── ml_predictions_vs_actual.png",
        "    └── StratAxis_Intelligence_Report.txt",
        "  strataxis_data/models/",
        "    ├── RandomForest_model.pkl",
        "    └── GradientBoosting_model.pkl",
        "",
        "=" * 60,
    ]

    with open(report_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    logger.info(f"Report saved → {report_path}")
    return "\n".join(lines)


# ─────────────────────────────────────────────────────────────
# 7.  MAIN
# ─────────────────────────────────────────────────────────────
def main():
    logger.info("StratAxis ML Engine starting…")

    # Load raw scraped data
    df = load_raw_data()

    # Expand structured JSON tables
    structured_df = expand_structured_tables(df)

    # Save flat structured dataset
    if not structured_df.empty:
        structured_df.to_csv(DATA_DIR / "results" / "StratAxis_ML_Dataset.csv",
                              index=False, encoding="utf-8")
        logger.info(f"ML dataset saved: {len(structured_df):,} rows")

    # ── Visualisations ──
    plot_category_distribution(df)
    plot_region_distribution(df)
    plot_relevance_over_time(df)
    if not structured_df.empty:
        plot_housing_heatmap(structured_df)

    # ── Time Series ──
    ts = time_series_analysis(df)

    # ── ML Models ──
    ml_df = build_ml_dataset(df)
    logger.info(f"ML dataset: {len(ml_df):,} rows with {len(ml_df.columns)} features")
    ml_results = train_models(ml_df)
    plot_feature_importance(ml_results)
    plot_predictions_vs_actual(ml_results)

    # ── Insights Report ──
    report = generate_report(df, structured_df, ml_results, ts)
    print("\n" + report.encode("ascii", errors="replace").decode("ascii"))

    logger.info("StratAxis ML Engine complete.")


if __name__ == "__main__":
    main()
