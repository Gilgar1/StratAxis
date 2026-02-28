from datetime import datetime
from typing import Optional, List, Dict, Any
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field, Column, String, DateTime, Numeric, Integer, JSON, Relationship
from enum import Enum
try:
    from geoalchemy2 import Geography
except ImportError:
    # Python 3.14 fallback where Shapely fails to compile
    def Geography(*args, **kwargs):
        from sqlalchemy import String
        return String

class PropertyCity(str, Enum):
    YAOUNDE = "Yaoundé"
    DOUALA = "Douala"

class PropertyType(str, Enum):
    APARTMENT = "apartment"
    HOUSE = "house"
    LAND = "land"
    COMMERCIAL = "commercial"

class ValidationStatus(str, Enum):
    PENDING = "pending"
    VALIDATED = "validated"
    REJECTED = "rejected"

class Property(SQLModel, table=True):
    __tablename__ = "properties"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    title: str = Field(sa_column=Column(String(255), nullable=False, index=True))
    description: Optional[str] = Field(default=None)
    city: PropertyCity = Field(index=True)
    neighborhood: Optional[str] = Field(default=None, index=True)
    
    # Geographic location using PostGIS Point
    location: Any = Field(sa_column=Column(Geography(geometry_type='POINT', srid=4326), index=True))
    
    property_type: PropertyType = Field(index=True)
    price: float = Field(sa_column=Column(Numeric(15, 2), nullable=False))
    currency: str = Field(default="XAF", sa_column=Column(String(10)))
    size: float = Field(sa_column=Column(Numeric(10, 2), nullable=False))
    price_per_m2: float = Field(sa_column=Column(Numeric(15, 2), index=True))
    bedrooms: Optional[int] = Field(default=None)
    bathrooms: Optional[int] = Field(default=None)
    images: List[str] = Field(default=[], sa_column=Column(JSON))
    
    data_source_id: UUID = Field(foreign_key="data_sources.id", index=True)
    data_source_record_id: Optional[str] = Field(default=None, sa_column=Column(String(255)))
    
    quality_score: float = Field(default=0.0, sa_column=Column(Numeric(5, 2)))
    validation_status: ValidationStatus = Field(default=ValidationStatus.PENDING, index=True)
    
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow, sa_column=Column(DateTime(timezone=True), onupdate=datetime.utcnow))
    scraped_at: Optional[datetime] = Field(default=None)
    version: int = Field(default=1)

    # Relationships
    # data_source: "DataSource" = Relationship(back_populates="properties")
