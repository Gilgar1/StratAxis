from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional
from src.models.listing import ListingPeriod, TrendDirection

class ListingBase(BaseModel):
    city: str
    neighborhood: Optional[str] = None
    property_type: str
    period: ListingPeriod = ListingPeriod.MONTHLY
    period_start: date
    period_end: date
    
    avg_price: float
    median_price: float
    min_price: float
    max_price: float
    avg_price_per_m2: float
    property_count: int

class ListingRead(ListingBase):
    id: Optional[datetime] = None # Or UUID if stored
    trend_direction: Optional[TrendDirection] = None
    trend_percentage: Optional[float] = None
    created_at: datetime

    class Config:
        from_attributes = True
