from pydantic import BaseModel, Field, validator
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from src.models.property import PropertyType, PropertyCity, ValidationStatus

class PropertyBase(BaseModel):
    title: str = Field(..., min_length=5, max_length=255)
    description: Optional[str] = None
    city: PropertyCity
    neighborhood: Optional[str] = None
    property_type: PropertyType
    price: float = Field(..., gt=0)
    currency: str = "XAF"
    size: float = Field(..., gt=0)
    bedrooms: Optional[int] = Field(None, ge=0)
    bathrooms: Optional[int] = Field(None, ge=0)
    images: List[str] = []

class PropertyCreate(PropertyBase):
    data_source_id: UUID
    data_source_record_id: Optional[str] = None

class PropertyRead(PropertyBase):
    id: UUID
    price_per_m2: float
    quality_score: float
    validation_status: ValidationStatus
    created_at: datetime
    updated_at: datetime
    scraped_at: Optional[datetime] = None

    class Config:
        from_attributes = True
