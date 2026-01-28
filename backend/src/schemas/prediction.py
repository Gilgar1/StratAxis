from pydantic import BaseModel, Field, validator
from typing import Optional, Dict, List
from src.models.property import PropertyType, PropertyCity
from src.models.listing import TrendDirection

class PricePredictionRequest(BaseModel):
    city: PropertyCity
    property_type: PropertyType
    size: float = Field(gt=0, description="Size in square meters")
    neighborhood: Optional[str] = None
    bedrooms: Optional[int] = Field(None, ge=0)
    bathrooms: Optional[int] = Field(None, ge=0)
    
    @validator('size')
    def validate_size(cls, v):
        if v <= 0 or v > 10000:
            raise ValueError('Size must be between 0 and 10,000 m²')
        return v

class FeatureImportance(BaseModel):
    feature: str
    importance: float

class PricePredictionResponse(BaseModel):
    predicted_price: float
    predicted_price_per_m2: float
    confidence_interval_lower: float
    confidence_interval_upper: float
    confidence_score: float = Field(ge=0, le=1)
    feature_importance: List[FeatureImportance] = []
    model_version: str
    prediction_date: str

class TrendForecastRequest(BaseModel):
    city: PropertyCity
    property_type: PropertyType
    time_horizon: int = Field(ge=1, le=12, description="Forecast horizon in months (1-12)")
    neighborhood: Optional[str] = None
    
    @validator('time_horizon')
    def validate_horizon(cls, v):
        if v not in [1, 3, 6, 12]:
            raise ValueError('Time horizon must be 1, 3, 6, or 12 months')
        return v

class ForecastDataPoint(BaseModel):
    month: str  # "2024-05"
    forecasted_price: float
    forecasted_price_per_m2: float
    confidence_lower: float
    confidence_upper: float

class TrendForecastResponse(BaseModel):
    city: str
    property_type: str
    time_horizon: int
    current_avg_price: float
    current_avg_price_per_m2: float
    trend_direction: TrendDirection
    trend_percentage: float
    forecasts: List[ForecastDataPoint]
    confidence_score: float = Field(ge=0, le=1)
    model_version: str
    forecast_date: str
