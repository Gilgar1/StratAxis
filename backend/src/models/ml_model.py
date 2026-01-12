from datetime import datetime, date
from typing import Optional, Dict, Any
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field, Column, String, DateTime, JSON, Date, Integer
from enum import Enum

class ModelStatus(str, Enum):
    TRAINING = "training"
    ACTIVE = "active"
    ARCHIVED = "archived"

class ModelType(str, Enum):
    PRICE_PREDICTION = "price_prediction"
    TREND_FORECAST = "trend_forecast"

class MLModel(SQLModel, table=True):
    __tablename__ = "ml_models"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str = Field(sa_column=Column(String(100), nullable=False))
    version: str = Field(sa_column=Column(String(20), nullable=False))
    type: ModelType = Field(index=True)
    algorithm: Optional[str] = Field(default=None, sa_column=Column(String(50)))
    status: ModelStatus = Field(default=ModelStatus.TRAINING, index=True)
    
    metrics: Dict[str, Any] = Field(default={}, sa_column=Column(JSON)) # MSE, MAE, R2, RMSE
    feature_importance: Dict[str, Any] = Field(default={}, sa_column=Column(JSON))
    
    training_data_range_start: Optional[date] = Field(default=None)
    training_data_range_end: Optional[date] = Field(default=None)
    record_count: int = Field(default=0)
    
    trained_at: datetime = Field(default_factory=datetime.utcnow)
    deployed_at: Optional[datetime] = Field(default=None)
    model_path: str = Field(sa_column=Column(String(255)))
    config: Dict[str, Any] = Field(default={}, sa_column=Column(JSON))
