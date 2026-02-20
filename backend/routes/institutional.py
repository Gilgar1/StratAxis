"""
StratAxis — routes/institutional.py
Institutional / government data routes.
Sources: INS (Institut National de la Statistique), Ministry publications,
         construction permits, housing indices.
"""

from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from backend.database import get_supabase

router = APIRouter(prefix="/api/institutional", tags=["Institutional Data"])


# ─────────────────────────────────────────────
# GET /api/institutional/documents
# Government PDFs / publications indexed in DB
# ─────────────────────────────────────────────
@router.get("/documents")
async def get_documents(
    category: Optional[str] = Query(
        None,
        description="housing / construction / economic / policy"
    ),
    year_from: Optional[int] = Query(None),
    year_to: Optional[int] = Query(None),
    limit: int = Query(50, le=200),
):
    """
    Fetch indexed government documents (INS, ministries) from the DB.
    Records include: title, source, publication_date, category, relevance_score, pdf_url.
    """
    supabase = get_supabase()
    try:
        query = supabase.table("institutional_documents").select("*")

        if category:
            query = query.eq("category", category)
        if year_from:
            query = query.gte("year", year_from)
        if year_to:
            query = query.lte("year", year_to)

        query = query.order("publication_date", desc=True).limit(limit)
        result = query.execute()
        return {"count": len(result.data), "data": result.data}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────
# GET /api/institutional/housing-indicators
# Key housing market indicators extracted by ML
# ─────────────────────────────────────────────
@router.get("/housing-indicators")
async def get_housing_indicators(
    year: Optional[int] = Query(None),
    city: Optional[str] = Query(None),
):
    """
    Returns structured housing indicators extracted from government PDFs:
    - Construction permit volumes
    - Housing stock estimates
    - Price indices
    - Affordability ratios
    """
    supabase = get_supabase()
    try:
        query = supabase.table("housing_indicators").select("*")

        if year:
            query = query.eq("year", year)
        if city:
            query = query.ilike("city", f"%{city}%")

        query = query.order("year", desc=True).order("city")
        result = query.execute()
        return {"count": len(result.data), "data": result.data}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────
# GET /api/institutional/construction-permits
# Monthly construction permit volumes
# ─────────────────────────────────────────────
@router.get("/construction-permits")
async def get_construction_permits(
    city: Optional[str] = Query(None),
    year: Optional[int] = Query(None),
):
    """
    Returns construction permit data by month/year.
    Feeds the Construction Permit Volume dashboard page.
    """
    supabase = get_supabase()
    try:
        query = supabase.table("construction_permits").select("*")

        if city:
            query = query.ilike("city", f"%{city}%")
        if year:
            query = query.eq("year", year)

        query = query.order("year", desc=True).order("month", desc=True)
        result = query.execute()
        return {"count": len(result.data), "data": result.data}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────
# GET /api/institutional/market-intelligence
# ML-extracted insights from scraped gov documents
# ─────────────────────────────────────────────
@router.get("/market-intelligence")
async def get_market_intelligence(
    category: Optional[str] = Query(None),
    limit: int = Query(20, le=100),
):
    """
    Returns structured intelligence data extracted from government publications.
    Includes: key metrics, extracted prices, indicators, and relevance scores.
    Populated by the ML engine (RELEVANT RE DATA scraper + ml_engine.py).
    """
    supabase = get_supabase()
    try:
        query = (
            supabase.table("market_intelligence")
            .select("*")
            .order("relevance_score", desc=True)
            .limit(limit)
        )
        if category:
            query = query.eq("category", category)

        result = query.execute()
        return {
            "count": len(result.data),
            "data": result.data,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────
# GET /api/institutional/summary
# High-level overview of all institutional data
# ─────────────────────────────────────────────
@router.get("/summary")
async def get_institutional_summary():
    """
    Returns a summary of all institutional data in the system:
    - Total documents indexed
    - Documents per category
    - Year range coverage
    - Latest update timestamp
    """
    supabase = get_supabase()
    try:
        docs = supabase.table("institutional_documents").select(
            "category, year, created_at"
        ).execute()

        from collections import Counter
        categories = Counter(d.get("category") for d in docs.data if d.get("category"))
        years = [d.get("year") for d in docs.data if d.get("year")]

        return {
            "total_documents": len(docs.data),
            "categories": dict(categories),
            "year_range": {
                "min": min(years) if years else None,
                "max": max(years) if years else None,
            },
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
