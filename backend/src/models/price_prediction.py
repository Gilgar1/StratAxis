from datetime import datetime
from typing import Dict, Any
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field, Column, JSON, Numeric, DateTime

class PricePrediction(SQLModel, table=True):
    __tablename__ = "price_predictions"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    model_id: UUID = Field(foreign_key="ml_models.id")
    input_data: Dict[str, Any] = Field(sa_column=Column(JSON)) # city, property_type, size, neighborhood
    prediction: float = Field(sa_column=Column(Numeric(15, 2)))
    confidence_interval_lower: float = Field(sa_column=Column(Numeric(15, 2)))
    confidence_interval_upper: float = Field(sa_column=Column(Numeric(15, 2)))
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
