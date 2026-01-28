from datetime import datetime
from typing import Optional, List
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field, Column, String, DateTime, Numeric, Integer, JSON
from src.models.property import PropertyCity, PropertyType, ValidationStatus

class PropertyHistory(SQLModel, table=True):
    """
    Historical versions of properties for trend analysis (Blueprint 3.3.1)
    Stores previous versions when properties are re-scraped/updated
    """
    __tablename__ = "property_history"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    original_id: UUID = Field(foreign_key="properties.id", index=True)  # Reference to current property
    
    # Same schema as Property table
    title: str = Field(sa_column=Column(String(255), nullable=False))
    description: Optional[str] = Field(default=None)
    city: PropertyCity
    neighborhood: Optional[str] = Field(default=None)
    property_type: PropertyType
    price: float = Field(sa_column=Column(Numeric(15, 2), nullable=False))
    currency: str = Field(default="XAF", sa_column=Column(String(10)))
    size: float = Field(sa_column=Column(Numeric(10, 2), nullable=False))
    price_per_m2: float = Field(sa_column=Column(Numeric(15, 2)))
    bedrooms: Optional[int] = Field(default=None)
    bathrooms: Optional[int] = Field(default=None)
    images: List[str] = Field(default=[], sa_column=Column(JSON))
    
    data_source_id: UUID = Field(foreign_key="data_sources.id")
    data_source_record_id: Optional[str] = Field(default=None, sa_column=Column(String(255)))
    
    quality_score: float = Field(default=0.0, sa_column=Column(Numeric(5, 2)))
    validation_status: ValidationStatus
    
    # Versioning fields
    version: int = Field(default=1)
    version_timestamp: datetime = Field(default_factory=datetime.utcnow, sa_column=Column(DateTime(timezone=True), index=True))
    
    # Original timestamps
    original_created_at: datetime = Field(sa_column=Column(DateTime(timezone=True)))
    original_updated_at: datetime = Field(sa_column=Column(DateTime(timezone=True)))
    original_scraped_at: Optional[datetime] = Field(default=None)
