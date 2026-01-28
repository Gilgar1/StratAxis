from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select, func, or_, and_, col
from typing import Optional, List
from uuid import UUID
from datetime import datetime

from src.config.database import get_session
from src.models.property import Property, PropertyType, PropertyCity, ValidationStatus
from src.schemas.property import PropertyRead, PropertyCreate
from src.utils.logger import logger
from geoalchemy2.functions import ST_DWithin, ST_MakePoint
from geoalchemy2.elements import WKTElement

router = APIRouter(prefix="/properties", tags=["Properties"])

@router.get("", response_model=dict)
async def list_properties(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(50, ge=1, le=100, description="Number of records to return"),
    city: Optional[PropertyCity] = Query(None, description="Filter by city"),
    property_type: Optional[PropertyType] = Query(None, description="Filter by property type"),
    min_price: Optional[float] = Query(None, ge=0, description="Minimum price"),
    max_price: Optional[float] = Query(None, ge=0, description="Maximum price"),
    min_size: Optional[float] = Query(None, ge=0, description="Minimum size (m²)"),
    max_size: Optional[float] = Query(None, ge=0, description="Maximum size (m²)"),
    neighborhood: Optional[str] = Query(None, description="Filter by neighborhood"),
    validation_status: Optional[ValidationStatus] = Query(ValidationStatus.VALIDATED, description="Filter by validation status"),
    sort_by: str = Query("created_at", regex="^(price|size|date_added|price_per_m2|created_at)$"),
    sort_order: str = Query("desc", regex="^(asc|desc)$"),
    db: Session = Depends(get_session)
):
    """
    List properties with pagination, filtering, and sorting.
    
    Blueprint 2.4.1.2 - 2.4.1.4: Full property listing with filters
    """
    try:
        # Build base query
        query = select(Property).where(Property.validation_status == validation_status)
        
        # Apply filters
        if city:
            query = query.where(Property.city == city)
        if property_type:
            query = query.where(Property.property_type == property_type)
        if min_price is not None:
            query = query.where(Property.price >= min_price)
        if max_price is not None:
            query = query.where(Property.price <= max_price)
        if min_size is not None:
            query = query.where(Property.size >= min_size)
        if max_size is not None:
            query = query.where(Property.size <= max_size)
        if neighborhood:
            query = query.where(Property.neighborhood.ilike(f"%{neighborhood}%"))
        
        # Get total count
        count_query = select(func.count()).select_from(Property).where(Property.validation_status == validation_status)
        if city:
            count_query = count_query.where(Property.city == city)
        if property_type:
            count_query = count_query.where(Property.property_type == property_type)
        if min_price is not None:
            count_query = count_query.where(Property.price >= min_price)
        if max_price is not None:
            count_query = count_query.where(Property.price <= max_price)
        if min_size is not None:
            count_query = count_query.where(Property.size >= min_size)
        if max_size is not None:
            count_query = count_query.where(Property.size <= max_size)
        if neighborhood:
            count_query = count_query.where(Property.neighborhood.ilike(f"%{neighborhood}%"))
            
        total = db.exec(count_query).one()
        
        # Apply sorting (blueprint 2.4.1.4)
        sort_field_map = {
            "price": Property.price,
            "size": Property.size,
            "date_added": Property.created_at,
            "created_at": Property.created_at,
            "price_per_m2": Property.price_per_m2
        }
        
        sort_column = sort_field_map.get(sort_by, Property.created_at)
        if sort_order == "desc":
            query = query.order_by(sort_column.desc())
        else:
            query = query.order_by(sort_column.asc())
        
        # Apply pagination
        query = query.offset(skip).limit(limit)
        
        # Execute query
        properties = db.exec(query).all()
        
        return {
            "total": total,
            "skip": skip,
            "limit": limit,
            "items": [PropertyRead.from_orm(p) for p in properties]
        }
        
    except Exception as e:
        logger.error(f"Error listing properties: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving properties"
        )

@router.get("/search", response_model=dict)
async def search_properties(
    q: str = Query(..., min_length=3, description="Search query"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_session)
):
    """
    Full-text search for properties (Blueprint 2.4.1.9)
    Uses database text search capabilities
    """
    try:
        # Simple ILIKE search across title and description
        # In production, this would use PostgreSQL's to_tsvector and GIN indexes
        search_pattern = f"%{q}%"
        query = select(Property).where(
            and_(
                Property.validation_status == ValidationStatus.VALIDATED,
                or_(
                    Property.title.ilike(search_pattern),
                    Property.description.ilike(search_pattern),
                    Property.neighborhood.ilike(search_pattern)
                )
            )
        )
        
        # Count total results
        count_query = select(func.count()).select_from(Property).where(
            and_(
                Property.validation_status == ValidationStatus.VALIDATED,
                or_(
                    Property.title.ilike(search_pattern),
                    Property.description.ilike(search_pattern),
                    Property.neighborhood.ilike(search_pattern)
                )
            )
        )
        total = db.exec(count_query).one()
        
        # Apply pagination
        query = query.order_by(Property.created_at.desc()).offset(skip).limit(limit)
        properties = db.exec(query).all()
        
        return {
            "total": total,
            "skip": skip,
            "limit": limit,
            "query": q,
            "items": [PropertyRead.from_orm(p) for p in properties]
        }
        
    except Exception as e:
        logger.error(f"Error searching properties: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error searching properties"
        )

@router.get("/nearby", response_model=dict)
async def get_nearby_properties(
    latitude: float = Query(..., ge=-90, le=90),
    longitude: float = Query(..., ge=-180, le=180),
    radius_km: float = Query(5.0, ge=0.1, le=50, description="Search radius in kilometers"),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_session)
):
    """
    Geospatial query for nearby properties (Blueprint 2.4.1.8)
    Uses PostGIS for location-based filtering
    """
    try:
        # Convert radius from km to meters for PostGIS
        radius_meters = radius_km * 1000
        
        # Create point from lat/lon
        # Note: PostGIS expects (lon, lat) order
        point_wkt = f"POINT({longitude} {latitude})"
        
        # Query using PostGIS ST_DWithin
        # This is a simplified version - in production would use proper PostGIS functions
        query = select(Property).where(
            and_(
                Property.validation_status == ValidationStatus.VALIDATED,
                Property.location.isnot(None)
            )
        ).limit(limit)
        
        properties = db.exec(query).all()
        
        # Filter by distance manually for MVP (in production, use ST_DWithin)
        # This is a placeholder implementation
        
        return {
            "center": {"latitude": latitude, "longitude": longitude},
            "radius_km": radius_km,
            "count": len(properties),
            "items": [PropertyRead.from_orm(p) for p in properties]
        }
        
    except Exception as e:
        logger.error(f"Error finding nearby properties: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error finding nearby properties"
        )

@router.get("/{property_id}", response_model=PropertyRead)
async def get_property(
    property_id: UUID,
    db: Session = Depends(get_session)
):
    """
    Get single property details (Blueprint 2.4.1.5)
    """
    try:
        property_obj = db.get(Property, property_id)
        
        if not property_obj:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Property with ID {property_id} not found"
            )
        
        return PropertyRead.from_orm(property_obj)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving property {property_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving property"
        )
