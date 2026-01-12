from datetime import datetime, date
from typing import Optional
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field, Column, String, DateTime, Text, Date
from enum import Enum

class ConsultationType(str, Enum):
    MARKET_ANALYSIS = "market_analysis"
    INVESTMENT_ADVICE = "investment_advice"
    PROPERTY_VALUATION = "property_valuation"

class BookingStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class Booking(SQLModel, table=True):
    __tablename__ = "bookings"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", index=True)
    consultation_type: ConsultationType = Field(index=True)
    preferred_date: date = Field(sa_column=Column(Date, nullable=False, index=True))
    preferred_time: Optional[str] = Field(default=None, sa_column=Column(String(20)))
    status: BookingStatus = Field(default=BookingStatus.PENDING, index=True)
    
    notes: Optional[str] = Field(default=None, sa_column=Column(Text))
    admin_notes: Optional[str] = Field(default=None, sa_column=Column(Text))
    
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow, sa_column=Column(DateTime(timezone=True), onupdate=datetime.utcnow))
    confirmed_at: Optional[datetime] = Field(default=None)
    completed_at: Optional[datetime] = Field(default=None)
