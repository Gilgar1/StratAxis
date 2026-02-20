"""
StratAxis — routes/prices.py
House / Rent price routes — fully dynamic, reads from Supabase DB.
"""

from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from backend.database import get_supabase

router = APIRouter(prefix="/api/prices", tags=["Prices"])


# ─────────────────────────────────────────────
# GET /api/prices/rent
# Returns rental price records from DB
# ─────────────────────────────────────────────
@router.get("/rent")
async def get_rent_prices(
    city: Optional[str] = Query(None, description="Filter by city (Douala / Yaounde)"),
    neighborhood: Optional[str] = Query(None, description="Filter by neighborhood"),
    housing_type: Optional[str] = Query(None, description="apartment / house / studio"),
    limit: int = Query(100, le=500),
):
    """
    Fetch rental price listings from the database.
    Returns listings with avg_rent, neighborhood, city, housing_type.
    """
    supabase = get_supabase()
    try:
        query = supabase.table("rent_listings").select("*")

        if city:
            query = query.ilike("city", f"%{city}%")
        if neighborhood:
            query = query.ilike("neighborhood", f"%{neighborhood}%")
        if housing_type:
            query = query.eq("housing_type", housing_type)

        query = query.limit(limit).order("scraped_at", desc=True)
        result = query.execute()
        return {"count": len(result.data), "data": result.data}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────
# GET /api/prices/rent/summary
# Aggregated rent stats per city / neighborhood
# ─────────────────────────────────────────────
@router.get("/rent/summary")
async def get_rent_summary(
    city: Optional[str] = Query(None),
):
    """
    Returns aggregated rental statistics:
    avg rent, min, max, count — grouped by city + neighborhood.
    """
    supabase = get_supabase()
    try:
        # Try to read from pre-computed summary table first
        query = supabase.table("rent_summary").select("*")
        if city:
            query = query.ilike("city", f"%{city}%")
        result = query.execute()

        if result.data:
            return {"source": "summary_table", "data": result.data}

        # Fallback: compute on the fly from raw listings
        raw = supabase.table("rent_listings").select(
            "city, neighborhood, housing_type, price"
        )
        if city:
            raw = raw.ilike("city", f"%{city}%")
        raw_result = raw.execute()

        from collections import defaultdict
        groups: dict = defaultdict(list)
        for row in raw_result.data:
            key = (row.get("city"), row.get("neighborhood"), row.get("housing_type"))
            if row.get("price"):
                groups[key].append(float(row["price"]))

        summary = []
        for (c, n, h), prices in groups.items():
            summary.append({
                "city": c,
                "neighborhood": n,
                "housing_type": h,
                "avg_price": round(sum(prices) / len(prices), 2),
                "min_price": min(prices),
                "max_price": max(prices),
                "count": len(prices),
            })

        summary.sort(key=lambda x: x["avg_price"], reverse=True)
        return {"source": "computed", "data": summary}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────
# GET /api/prices/trend
# Monthly price trend over time (time series)
# ─────────────────────────────────────────────
@router.get("/trend")
async def get_price_trend(
    city: Optional[str] = Query(None),
    data_type: str = Query("rent", description="rent / land"),
    months: int = Query(12, le=36),
):
    """
    Returns monthly average price trend for charting.
    Reads from price_trends table (populated by ETL pipeline).
    """
    supabase = get_supabase()
    try:
        table = "price_trends"
        query = (
            supabase.table(table)
            .select("*")
            .eq("data_type", data_type)
            .order("period", desc=True)
            .limit(months)
        )
        if city:
            query = query.ilike("city", f"%{city}%")

        result = query.execute()
        # Reverse so oldest is first (correct order for charts)
        data = list(reversed(result.data))
        return {"city": city, "data_type": data_type, "periods": len(data), "data": data}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────
# GET /api/prices/predictions
# ML model predictions from DB
# ─────────────────────────────────────────────
@router.get("/predictions")
async def get_price_predictions(
    city: Optional[str] = Query(None),
    data_type: str = Query("rent", description="rent / land"),
):
    """
    Returns stored ML predictions from the price_predictions table.
    These are populated by the Intelligence Layer (forecast_service).
    """
    supabase = get_supabase()
    try:
        query = (
            supabase.table("price_predictions")
            .select("*")
            .eq("data_type", data_type)
            .order("predicted_for", desc=False)
        )
        if city:
            query = query.ilike("city", f"%{city}%")

        result = query.execute()
        return {
            "city": city,
            "data_type": data_type,
            "predictions": result.data,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
