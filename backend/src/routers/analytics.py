from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select, func, and_
from typing import Optional, List, Dict
from datetime import date, datetime
from collections import defaultdict

from src.config.database import get_session
from src.models.property import Property, PropertyType, PropertyCity, ValidationStatus
from src.models.listing import Listing, ListingPeriod, TrendDirection
from src.schemas.analytics import (
    AnalyticsOverviewResponse,
    TrendsResponse,
    NeighborhoodAnalyticsResponse,
    PropertyCountByCity,
    PropertyCountByType,
    PriceStatistics,
    NeighborhoodStats,
    TrendDataPoint
)
from src.utils.logger import logger

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/overview", response_model=AnalyticsOverviewResponse)
async def get_analytics_overview(
    city: Optional[PropertyCity] = Query(None, description="Filter by city"),
    property_type: Optional[PropertyType] = Query(None, description="Filter by property type"),
    start_date: Optional[date] = Query(None, description="Start date filter"),
    end_date: Optional[date] = Query(None, description="End date filter"),
    db: Session = Depends(get_session)
):
    """
    Analytics overview with aggregated statistics (Blueprint 2.4.2.2)
    Returns total counts, averages, price distributions by city and type
    """
    try:
        # Base query for validated properties
        base_query = select(Property).where(Property.validation_status == ValidationStatus.VALIDATED)
        
        # Apply filters
        conditions = []
        if city:
            conditions.append(Property.city == city)
        if property_type:
            conditions.append(Property.property_type == property_type)
        if start_date:
            conditions.append(Property.created_at >= datetime.combine(start_date, datetime.min.time()))
        if end_date:
            conditions.append(Property.created_at <= datetime.combine(end_date, datetime.max.time()))
        
        if conditions:
            base_query = base_query.where(and_(*conditions))
        
        properties = db.exec(base_query).all()
        
        if not properties:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No properties found matching the criteria"
            )
        
        # Total properties
        total_properties = len(properties)
        
        # Group by city
        by_city_dict = defaultdict(lambda: {"count": 0, "by_type": defaultdict(int)})
        for prop in properties:
            by_city_dict[prop.city.value]["count"] += 1
            by_city_dict[prop.city.value]["by_type"][prop.property_type.value] += 1
        
        by_city = [
            PropertyCountByCity(
                city=city,
                count=data["count"],
                by_type=[
                    PropertyCountByType(property_type=pt, count=count)
                    for pt, count in data["by_type"].items()
                ]
            )
            for city, data in by_city_dict.items()
        ]
        
        # Average price per m² by city
        avg_price_m2_by_city = {}
        for city_enum in PropertyCity:
            city_props = [p for p in properties if p.city == city_enum]
            if city_props:
                avg_price_m2_by_city[city_enum.value] = round(
                    sum(p.price_per_m2 for p in city_props) / len(city_props), 2
                )
        
        # Average price per m² by type
        avg_price_m2_by_type = {}
        for type_enum in PropertyType:
            type_props = [p for p in properties if p.property_type == type_enum]
            if type_props:
                avg_price_m2_by_type[type_enum.value] = round(
                    sum(p.price_per_m2 for p in type_props) / len(type_props), 2
                )
        
        # Price distribution statistics
        prices = sorted([p.price for p in properties])
        n = len(prices)
        
        price_distribution = PriceStatistics(
            min=round(min(prices), 2),
            max=round(max(prices), 2),
            avg=round(sum(prices) / n, 2),
            median=round(prices[n // 2] if n % 2 != 0 else (prices[n // 2 - 1] + prices[n // 2]) / 2, 2),
            q1=round(prices[n // 4], 2) if n >= 4 else None,
            q3=round(prices[3 * n // 4], 2) if n >= 4 else None
        )
        
        return AnalyticsOverviewResponse(
            total_properties=total_properties,
            by_city=by_city,
            avg_price_per_m2_by_city=avg_price_m2_by_city,
            avg_price_per_m2_by_type=avg_price_m2_by_type,
            price_distribution=price_distribution,
            last_updated=date.today()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating analytics overview: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error generating analytics overview"
        )

@router.get("/trends", response_model=TrendsResponse)
async def get_trends(
    city: Optional[str] = Query(None, description="Filter by city"),
    property_type: Optional[str] = Query(None, description="Filter by property type"),
    period_type: str = Query("monthly", regex="^(monthly|quarterly)$", description="Aggregation period"),
    limit: int = Query(12, ge=1, le=24, description="Number of periods to return"),
    compare_cities: bool = Query(False, description="Compare Yaoundé and Douala"),
    db: Session = Depends(get_session)
):
    """
    Get price and volume trends over time (Blueprint 2.4.2.3)
    Returns time-series data showing market trends
    """
    try:
        # Map period type
        period_enum = ListingPeriod.MONTHLY if period_type == "monthly" else ListingPeriod.MONTHLY
        
        # Build base query
        query = select(Listing).where(Listing.period == period_enum)
        
        if city and not compare_cities:
            query = query.where(Listing.city == city)
        if property_type:
            query = query.where(Listing.property_type == property_type)
        
        query = query.order_by(Listing.period_start.desc()).limit(limit)
        
        listings = db.exec(query).all()
        
        if not listings:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No trend data available"
            )
        
        # Reverse to chronological order
        listings = list(reversed(listings))
        
        # Build data points
        data_points = [
            TrendDataPoint(
                period=listing.period_start.strftime("%Y-%m"),
                avg_price=round(listing.avg_price, 2),
                avg_price_per_m2=round(listing.avg_price_per_m2, 2),
                property_count=listing.property_count,
                trend_direction=listing.trend_direction,
                trend_percentage=round(listing.trend_percentage, 2) if listing.trend_percentage else None
            )
            for listing in listings
        ]
        
        # City comparison if requested
        comparison = None
        if compare_cities and not city:
            comparison = {}
            for city_name in ["Yaoundé", "Douala"]:
                city_query = select(Listing).where(
                    and_(
                        Listing.period == period_enum,
                        Listing.city == city_name
                    )
                )
                if property_type:
                    city_query = city_query.where(Listing.property_type == property_type)
                
                city_query = city_query.order_by(Listing.period_start.desc()).limit(limit)
                city_listings = list(reversed(db.exec(city_query).all()))
                
                comparison[city_name] = [
                    TrendDataPoint(
                        period=l.period_start.strftime("%Y-%m"),
                        avg_price=round(l.avg_price, 2),
                        avg_price_per_m2=round(l.avg_price_per_m2, 2),
                        property_count=l.property_count,
                        trend_direction=l.trend_direction,
                        trend_percentage=round(l.trend_percentage, 2) if l.trend_percentage else None
                    )
                    for l in city_listings
                ]
        
        return TrendsResponse(
            city=city,
            property_type=property_type,
            period_type=period_type,
            data_points=data_points,
            comparison=comparison
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating trends: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error generating trends"
        )

@router.get("/neighborhoods", response_model=NeighborhoodAnalyticsResponse)
async def get_neighborhood_analytics(
    city: PropertyCity = Query(..., description="City to analyze"),
    property_type: Optional[PropertyType] = Query(None, description="Filter by property type"),
    top_n: int = Query(10, ge=1, le=50, description="Number of top neighborhoods to return"),
    db: Session = Depends(get_session)
):
    """
    Neighborhood-level analytics (Blueprint 2.4.2.4)
    Returns average prices, availability, and rankings by neighborhood
    """
    try:
        # Query validated properties in the city
        query = select(Property).where(
            and_(
                Property.validation_status == ValidationStatus.VALIDATED,
                Property.city == city,
                Property.neighborhood.isnot(None)
            )
        )
        
        if property_type:
            query = query.where(Property.property_type == property_type)
        
        properties = db.exec(query).all()
        
        if not properties:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No properties found in {city.value}"
            )
        
        # Group by neighborhood
        neighborhood_data = defaultdict(lambda: {
            "prices": [],
            "prices_per_m2": [],
            "property_types": set()
        })
        
        for prop in properties:
            neighborhood = prop.neighborhood
            neighborhood_data[neighborhood]["prices"].append(prop.price)
            neighborhood_data[neighborhood]["prices_per_m2"].append(prop.price_per_m2)
            neighborhood_data[neighborhood]["property_types"].add(prop.property_type.value)
        
        # Calculate stats per neighborhood
        neighborhoods = [
            NeighborhoodStats(
                neighborhood=neighborhood,
                avg_price=round(sum(data["prices"]) / len(data["prices"]), 2),
                avg_price_per_m2=round(sum(data["prices_per_m2"]) / len(data["prices_per_m2"]), 2),
                property_count=len(data["prices"]),
                property_types=list(data["property_types"])
            )
            for neighborhood, data in neighborhood_data.items()
        ]
        
        # Sort for top rankings
        top_by_price = sorted(neighborhoods, key=lambda x: x.avg_price_per_m2, reverse=True)[:top_n]
        top_by_volume = sorted(neighborhoods, key=lambda x: x.property_count, reverse=True)[:top_n]
        
        return NeighborhoodAnalyticsResponse(
            city=city.value,
            neighborhoods=neighborhoods,
            top_by_price=top_by_price,
            top_by_volume=top_by_volume
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating neighborhood analytics: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error generating neighborhood analytics"
        )
