"""
StratAxis — routes/land.py
Land price routes — fully dynamic, reads from Supabase DB.
"""

from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from backend.database import get_supabase

router = APIRouter(prefix="/api/land", tags=["Land Prices"])


# ─────────────────────────────────────────────
# GET /api/land/prices
# Raw land price listings from DB
# ─────────────────────────────────────────────
@router.get("/prices")
async def get_land_prices(
    city: Optional[str] = Query(None, description="Douala / Yaounde"),
    neighborhood: Optional[str] = Query(None),
    min_price_per_m2: Optional[float] = Query(None),
    max_price_per_m2: Optional[float] = Query(None),
    limit: int = Query(100, le=500),
):
    """
    Return land price records from the database.
    Each record includes: neighborhood, city, price_per_m2, lot_size, total_price.
    """
    supabase = get_supabase()
    try:
        query = supabase.table("land_listings").select("*")

        if city:
            query = query.ilike("city", f"%{city}%")
        if neighborhood:
            query = query.ilike("neighborhood", f"%{neighborhood}%")
        if min_price_per_m2 is not None:
            query = query.gte("price_per_m2", min_price_per_m2)
        if max_price_per_m2 is not None:
            query = query.lte("price_per_m2", max_price_per_m2)

        query = query.limit(limit).order("scraped_at", desc=True)
        result = query.execute()
        return {"count": len(result.data), "data": result.data}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────
# GET /api/land/summary
# Average price per m² by neighborhood
# ─────────────────────────────────────────────
@router.get("/summary")
async def get_land_summary(
    city: Optional[str] = Query(None),
    top_n: int = Query(20, le=100),
):
    """
    Returns neighborhood-level land price summary sorted by avg price/m².
    Reads from land_summary table (or computes on the fly).
    """
    supabase = get_supabase()
    try:
        # Try pre-computed summary first
        query = supabase.table("land_summary").select("*")
        if city:
            query = query.ilike("city", f"%{city}%")
        query = query.order("avg_price_per_m2", desc=True).limit(top_n)
        result = query.execute()

        if result.data:
            return {"source": "summary_table", "top_n": top_n, "data": result.data}

        # Fallback: compute from raw listings
        raw = supabase.table("land_listings").select(
            "city, neighborhood, price_per_m2"
        )
        if city:
            raw = raw.ilike("city", f"%{city}%")
        raw_result = raw.execute()

        from collections import defaultdict
        groups: dict = defaultdict(list)
        for row in raw_result.data:
            key = (row.get("city"), row.get("neighborhood"))
            if row.get("price_per_m2"):
                groups[key].append(float(row["price_per_m2"]))

        summary = []
        for (c, n), prices in groups.items():
            summary.append({
                "city": c,
                "neighborhood": n,
                "avg_price_per_m2": round(sum(prices) / len(prices), 2),
                "min_price_per_m2": min(prices),
                "max_price_per_m2": max(prices),
                "listing_count": len(prices),
            })

        summary.sort(key=lambda x: x["avg_price_per_m2"], reverse=True)
        return {"source": "computed", "top_n": top_n, "data": summary[:top_n]}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────
# GET /api/land/comparison
# Side-by-side Douala vs Yaounde land prices
# ─────────────────────────────────────────────
@router.get("/comparison")
async def get_city_comparison():
    """
    Returns a Douala vs Yaoundé land price comparison summary.
    Useful for the Comparison dashboard page.
    """
    supabase = get_supabase()
    try:
        result = supabase.table("land_listings").select(
            "city, price_per_m2"
        ).execute()

        from collections import defaultdict
        city_prices: dict = defaultdict(list)
        for row in result.data:
            if row.get("city") and row.get("price_per_m2"):
                city_prices[row["city"]].append(float(row["price_per_m2"]))

        comparison = {}
        for city, prices in city_prices.items():
            prices_sorted = sorted(prices)
            n = len(prices_sorted)
            comparison[city] = {
                "avg_price_per_m2": round(sum(prices) / n, 2),
                "median_price_per_m2": round(
                    prices_sorted[n // 2] if n % 2 == 1
                    else (prices_sorted[n // 2 - 1] + prices_sorted[n // 2]) / 2, 2
                ),
                "min_price_per_m2": min(prices),
                "max_price_per_m2": max(prices),
                "listing_count": n,
            }

        return {"comparison": comparison}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────
# GET /api/land/predictions
# ML predictions for land prices
# ─────────────────────────────────────────────
@router.get("/predictions")
async def get_land_predictions(
    city: Optional[str] = Query(None),
):
    """
    Return stored ML forecasts for land prices from price_predictions table.
    """
    supabase = get_supabase()
    try:
        query = (
            supabase.table("price_predictions")
            .select("*")
            .eq("data_type", "land")
            .order("predicted_for", desc=False)
        )
        if city:
            query = query.ilike("city", f"%{city}%")

        result = query.execute()
        return {"city": city, "data_type": "land", "predictions": result.data}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
