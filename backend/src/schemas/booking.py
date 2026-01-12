from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional
from uuid import UUID
from src.models.booking import ConsultationType, BookingStatus

class BookingBase(BaseModel):
    consultation_type: ConsultationType
    preferred_date: date
    preferred_time: Optional[str] = Field(None, pattern=r"^\d{2}:\d{2}$")
    notes: Optional[str] = None

class BookingCreate(BookingBase):
    pass

class BookingUpdate(BaseModel):
    preferred_date: Optional[date] = None
    preferred_time: Optional[str] = None
    status: Optional[BookingStatus] = None
    notes: Optional[str] = None
    admin_notes: Optional[str] = None

class BookingRead(BookingBase):
    id: UUID
    user_id: UUID
    status: BookingStatus
    admin_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
