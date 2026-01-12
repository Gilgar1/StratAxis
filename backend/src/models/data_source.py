from datetime import datetime
from typing import Optional, Dict, Any
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field, Column, String, DateTime, JSON, Integer, Boolean
from enum import Enum

class DataSourceType(str, Enum):
    SCRAPER = "scraper"
    OCR = "ocr"
    MANUAL = "manual"

class RunStatus(str, Enum):
    SUCCESS = "success"
    FAILED = "failed"
    PARTIAL = "partial"

class DataSource(SQLModel, table=True):
    __tablename__ = "data_sources"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str = Field(sa_column=Column(String(100), unique=True, nullable=False))
    type: DataSourceType = Field(index=True)
    source_url: Optional[str] = Field(default=None, sa_column=Column(String(255)))
    source_path: Optional[str] = Field(default=None, sa_column=Column(String(255)))
    is_active: bool = Field(default=True)
    last_run_at: Optional[datetime] = Field(default=None, sa_column=Column(DateTime(timezone=True)))
    last_run_status: Optional[RunStatus] = Field(default=None)
    records_collected: int = Field(default=0)
    records_validated: int = Field(default=0)
    records_rejected: int = Field(default=0)
    config: Dict[str, Any] = Field(default={}, sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=datetime.utcnow, sa_column=Column(DateTime(timezone=True)))
    updated_at: datetime = Field(default_factory=datetime.utcnow, sa_column=Column(DateTime(timezone=True), onupdate=datetime.utcnow))
