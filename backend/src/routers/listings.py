from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select, and_
from typing import Optional, List
from datetime import date, datetime

from src.config.database import get_session
from src.models.listing import Listing, ListingPeriod, TrendDirection
from src.schemas.listing import ListingRead
from src.utils.logger import logger

router = APIRouter(prefix="/listings", tags=["Listings"])

@router.get("", response_model=List[ListingRead])
async def get_listings(
    city: Optional[str] = Query(None, description="Filter by city"),
    property_type: Optional[str] = Query(None, description="Filter by property type"),
    neighborhood: Optional[str] = Query(None, description="Filter by neighborhood"),
    period: Optional[ListingPeriod] = Query(ListingPeriod.MONTHLY, description="Aggregation period"),
    start_date: Optional[date] = Query(None, description="Start date for period filter"),
    end_date: Optional[date] = Query(None, description="End date for period filter"),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_session)
):
    """
    Get aggregated listing data (Blueprint 2.4.1.6-7)
    Public endpoint - no auth required for MVP
    Returns time-series aggregated property data
    """
    try:
        # Build query
        query = select(Listing)
        
        conditions = []
        
        if city:
            conditions.append(Listing.city == city)
        if property_type:
            conditions.append(Listing.property_type == property_type)
        if neighborhood:
            conditions.append(Listing.neighborhood.ilike(f"%{neighborhood}%"))
        if period:
            conditions.append(Listing.period == period)
        if start_date:
            conditions.append(Listing.period_start >= start_date)
        if end_date:
            conditions.append(Listing.period_end <= end_date)
        
        if conditions:
            query = query.where(and_(*conditions))
        
        # Order by most recent first
        query = query.order_by(Listing.period_start.desc()).limit(limit)
        
        listings = db.exec(query).all()
        
        return [ListingRead.from_orm(listing) for listing in listings]
        
    except Exception as e:
        logger.error(f"Error retrieving listings: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving listings"
        )

@router.get("/summary", response_model=dict)
async def get_listings_summary(
    city: Optional[str] = Query(None),
    property_type: Optional[str] = Query(None),
    db: Session = Depends(get_session)
):
    """
    Get summary statistics from listings
    Useful for quick insights into market trends
    """
    try:
        query = select(Listing).where(Listing.period == ListingPeriod.MONTHLY)
        
        if city:
            query = query.where(Listing.city == city)
        if property_type:
            query = query.where(Listing.property_type == property_type)
        
        # Get most recent listings
        query = query.order_by(Listing.period_start.desc()).limit(12)  # Last 12 months
        listings = db.exec(query).all()
        
        if not listings:
            return {
                "message": "No listing data available",
                "data_points": 0
            }
        
        # Calculate summary
        total_properties = sum(l.property_count for l in listings)
        avg_price = sum(l.avg_price for l in listings) / len(listings) if listings else 0
        avg_price_per_m2 = sum(l.avg_price_per_m2 for l in listings) / len(listings) if listings else 0
        
        # Determine overall trend
        if len(listings) >= 2:
            recent = listings[0]
            older = listings[-1]
            price_change = ((recent.avg_price - older.avg_price) / older.avg_price * 100) if older.avg_price else 0
            
            if price_change > 5:
                trend = TrendDirection.UP
            elif price_change < -5:
                trend = TrendDirection.DOWN
            else:
                trend = TrendDirection.STABLE
        else:
            trend = TrendDirection.STABLE
            price_change = 0
        
        return {
            "city": city,
            "property_type": property_type,
            "data_points": len(listings),
            "total_properties": total_properties,
            "avg_price": round(avg_price, 2),
            "avg_price_per_m2": round(avg_price_per_m2, 2),
            "trend": trend,
            "trend_percentage": round(price_change, 2),
            "period_start": listings[-1].period_start if listings else None,
            "period_end": listings[0].period_end if listings else None
        }
        
    except Exception as e:
        logger.error(f"Error generating listings summary: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error generating summary"
        )
