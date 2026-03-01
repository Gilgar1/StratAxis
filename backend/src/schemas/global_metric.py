from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from datetime import datetime

class GlobalMetricBase(BaseModel):
    key: str
    value: str

class GlobalMetricCreate(GlobalMetricBase):
    pass

class GlobalMetricUpdate(BaseModel):
    value: str

class GlobalMetric(GlobalMetricBase):
    last_updated: datetime

    class Config:
        orm_mode = True

class GlobalMetricBulkUpdate(BaseModel):
    metrics: Dict[str, str]
