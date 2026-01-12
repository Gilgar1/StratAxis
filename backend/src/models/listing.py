from datetime import datetime, date
from typing import Optional
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field, Column, String, DateTime, Numeric, Integer, Date
from enum import Enum

class ListingPeriod(str, Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"

class TrendDirection(str, Enum):
    UP = "up"
    DOWN = "down"
    STABLE = "stable"

class Listing(SQLModel, table=True):
    __tablename__ = "listings"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    city: str = Field(index=True)
    neighborhood: Optional[str] = Field(default=None, index=True)
    property_type: str = Field(index=True)
    period: ListingPeriod = Field(default=ListingPeriod.MONTHLY)
    period_start: date = Field(sa_column=Column(Date, index=True))
    period_end: date = Field(sa_column=Column(Date))
    
    avg_price: float = Field(sa_column=Column(Numeric(15, 2)))
    median_price: float = Field(sa_column=Column(Numeric(15, 2)))
    min_price: float = Field(sa_column=Column(Numeric(15, 2)))
    max_price: float = Field(sa_column=Column(Numeric(15, 2)))
    avg_price_per_m2: float = Field(sa_column=Column(Numeric(15, 2)))
    property_count: int = Field(default=0)
    
    trend_direction: Optional[TrendDirection] = Field(default=None)
    trend_percentage: Optional[float] = Field(default=None, sa_column=Column(Numeric(5, 2)))
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
