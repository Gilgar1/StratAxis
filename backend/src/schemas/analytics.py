from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import date
from src.models.listing import TrendDirection

class PropertyCountByType(BaseModel):
    property_type: str
    count: int

class PropertyCountByCity(BaseModel):
    city: str
    count: int
    by_type: List[PropertyCountByType] = []

class PriceStatistics(BaseModel):
    min: float
    max: float
    avg: float
    median: float
    q1: Optional[float] = None  # First quartile
    q3: Optional[float] = None  # Third quartile

class NeighborhoodStats(BaseModel):
    neighborhood: str
    avg_price: float
    avg_price_per_m2: float
    property_count: int
    property_types: List[str] = []

class CityStats(BaseModel):
    city: str
    property_count: int
    avg_price: float
    avg_price_per_m2: float
    price_stats: PriceStatistics

class AnalyticsOverviewResponse(BaseModel):
    total_properties: int
    by_city: List[PropertyCountByCity]
    avg_price_per_m2_by_city: Dict[str, float]
    avg_price_per_m2_by_type: Dict[str, float]
    price_distribution: PriceStatistics
    last_updated: Optional[date] = None

class TrendDataPoint(BaseModel):
    period: str  # "2024-01", "2024-Q1", etc.
    avg_price: float
    avg_price_per_m2: float
    property_count: int
    trend_direction: Optional[TrendDirection] = None
    trend_percentage: Optional[float] = None

class TrendsResponse(BaseModel):
    city: Optional[str] = None
    property_type: Optional[str] = None
    period_type: str  # "monthly", "quarterly"
    data_points: List[TrendDataPoint]
    comparison: Optional[Dict[str, List[TrendDataPoint]]] = None  # City comparisons

class NeighborhoodAnalyticsResponse(BaseModel):
    city: str
    neighborhoods: List[NeighborhoodStats]
    top_by_price: List[NeighborhoodStats]
    top_by_volume: List[NeighborhoodStats]

class AnalyticsQueryParams(BaseModel):
    city: Optional[str] = None
    property_type: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    
    class Config:
        from_attributes = True
