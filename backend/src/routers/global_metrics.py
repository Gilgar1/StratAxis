from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List, Dict, Any

from src.config.database import get_session
from src.dependencies.rbac import admin_required
from src.models.user import User
from src.models.global_metric import GlobalMetric
from src.schemas.global_metric import GlobalMetric as GlobalMetricSchema, GlobalMetricCreate, GlobalMetricUpdate, GlobalMetricBulkUpdate

router = APIRouter(prefix="/metrics", tags=["Metrics"])

@router.get("/", response_model=List[GlobalMetricSchema])
async def get_all_metrics(db: Session = Depends(get_session)):
    """
    Get all global metrics (accessible to all authenticated or public users)
    """
    metrics = db.exec(select(GlobalMetric)).all()
    return metrics

@router.get("/dict", response_model=Dict[str, str])
async def get_all_metrics_dict(db: Session = Depends(get_session)):
    """
    Get all global metrics as a key-value dictionary
    """
    metrics = db.exec(select(GlobalMetric)).all()
    return {m.key: m.value for m in metrics}

@router.get("/{key}", response_model=GlobalMetricSchema)
async def get_metric(key: str, db: Session = Depends(get_session)):
    """
    Get a specific metric by key
    """
    metric = db.get(GlobalMetric, key)
    if not metric:
        raise HTTPException(status_code=404, detail="Metric not found")
    return metric

@router.post("/", response_model=GlobalMetricSchema, dependencies=[Depends(admin_required)])
async def create_metric(metric: GlobalMetricCreate, db: Session = Depends(get_session)):
    """
    Create a new metric (Admin only)
    """
    existing_metric = db.get(GlobalMetric, metric.key)
    if existing_metric:
        raise HTTPException(status_code=400, detail="Metric already exists")
    
    db_metric = GlobalMetric(key=metric.key, value=metric.value)
    db.add(db_metric)
    db.commit()
    db.refresh(db_metric)
    return db_metric

@router.put("/{key}", response_model=GlobalMetricSchema, dependencies=[Depends(admin_required)])
async def update_metric(key: str, metric: GlobalMetricUpdate, db: Session = Depends(get_session)):
    """
    Update a metric (Admin only)
    """
    db_metric = db.get(GlobalMetric, key)
    if not db_metric:
        raise HTTPException(status_code=404, detail="Metric not found")
    
    db_metric.value = metric.value
    db.add(db_metric)
    db.commit()
    db.refresh(db_metric)
    return db_metric

@router.put("/bulk/update", response_model=Dict[str, str], dependencies=[Depends(admin_required)])
async def bulk_update_metrics(bulk_update: GlobalMetricBulkUpdate, db: Session = Depends(get_session)):
    """
    Bulk update multiple metrics (Admin only)
    """
    updated_metrics = {}
    for key, value in bulk_update.metrics.items():
        db_metric = db.get(GlobalMetric, key)
        if db_metric:
            db_metric.value = value
            db.add(db_metric)
        else:
            db_metric = GlobalMetric(key=key, value=value)
            db.add(db_metric)
        updated_metrics[key] = value
        
    db.commit()
    return updated_metrics
