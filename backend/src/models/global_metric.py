from datetime import datetime
from sqlmodel import SQLModel, Field, Column, String, DateTime

class GlobalMetric(SQLModel, table=True):
    __tablename__ = "global_metrics"

    key: str = Field(primary_key=True, index=True)
    value: str = Field(nullable=False)
    last_updated: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column=Column(DateTime(timezone=True), onupdate=datetime.utcnow)
    )
