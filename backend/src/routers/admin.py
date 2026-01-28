from fastapi import APIRouter, Depends, HTTPException, Query, status, BackgroundTasks
from sqlmodel import Session, select, func
from typing import List, Optional
from uuid import UUID
from datetime import datetime
import subprocess

from src.config.database import get_session
from src.models.user import User, UserRole
from src.models.data_source import DataSource, DataSourceType, RunStatus
from src.models.ml_model import MLModel, ModelStatus, ModelType
from src.models.property import Property, ValidationStatus
from src.models.booking import Booking, BookingStatus
from src.dependencies.rbac import admin_required
from src.utils.logger import logger
from pydantic import BaseModel

router = APIRouter(prefix="/admin", tags=["Admin"], dependencies=[Depends(admin_required)])

# ==================== SCHEMAS ====================

class UserRoleUpdate(BaseModel):
    role: UserRole

class DataSourceCreate(BaseModel):
    name: str
    type: DataSourceType
    source_url: Optional[str] = None
    source_path: Optional[str] = None
    is_active: bool = True
    config: dict = {}

class DataSourceUpdate(BaseModel):
    name: Optional[str] = None
    source_url: Optional[str] = None
    source_path: Optional[str] = None
    is_active: Optional[bool] = None
    config: Optional[dict] = None

class DataSourceRead(BaseModel):
    id: UUID
    name: str
    type: DataSourceType
    source_url: Optional[str]
    source_path: Optional[str]
    is_active: bool
    last_run_at: Optional[datetime]
    last_run_status: Optional[RunStatus]
    records_collected: int
    records_validated: int
    records_rejected: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class MLModelRead(BaseModel):
    id: UUID
    name: str
    version: str
    type: ModelType
    algorithm: Optional[str]
    status: ModelStatus
    metrics: dict
    record_count: int
    trained_at: datetime
    deployed_at: Optional[datetime]
    
    class Config:
        from_attributes = True

class SystemStats(BaseModel):
    total_users: int
    users_by_role: dict
    total_properties: int
    validated_properties: int
    pending_properties: int
    rejected_properties: int
    total_bookings: int
    pending_bookings: int
    confirmed_bookings: int
    active_data_sources: int
    active_ml_models: int
    avg_property_quality_score: float
    last_updated: datetime

# ==================== USER MANAGEMENT ====================

@router.get("/users", response_model=dict)
async def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    role: Optional[UserRole] = Query(None, description="Filter by role"),
    current_admin: User = Depends(admin_required),
    db: Session = Depends(get_session)
):
    """
    List all users with pagination and filtering (Blueprint 2.4.5.2)
    """
    try:
        query = select(User)
        
        if role:
            query = query.where(User.role == role)
        
        # Count total
        count_query = select(func.count()).select_from(User)
        if role:
            count_query = count_query.where(User.role == role)
        total = db.exec(count_query).one()
        
        # Get users
        query = query.order_by(User.created_at.desc()).offset(skip).limit(limit)
        users = db.exec(query).all()
        
        return {
            "total": total,
            "skip": skip,
            "limit": limit,
            "items": [
                {
                    "id": u.id,
                    "email": u.email,
                    "role": u.role,
                    "first_name": u.first_name,
                    "last_name": u.last_name,
                    "is_active": u.is_active,
                    "created_at": u.created_at,
                    "last_login": u.last_login
                }
                for u in users
            ]
        }
        
    except Exception as e:
        logger.error(f"Error listing users: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving users"
        )

@router.put("/users/{user_id}/role")
async def update_user_role(
    user_id: UUID,
    role_update: UserRoleUpdate,
    current_admin: User = Depends(admin_required),
    db: Session = Depends(get_session)
):
    """
    Change user role (Blueprint 2.4.5.3)
    """
    try:
        user = db.get(User, user_id)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User {user_id} not found"
            )
        
        # Prevent self-demotion
        if user.id == current_admin.id and role_update.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot change your own admin role"
            )
        
        old_role = user.role
        user.role = role_update.role
        user.updated_at = datetime.utcnow()
        
        db.add(user)
        db.commit()
        db.refresh(user)
        
        logger.info(f"User {user_id} role changed from {old_role} to {role_update.role} by admin {current_admin.id}")
        
        return {
            "message": "User role updated successfully",
            "user_id": user.id,
            "old_role": old_role,
            "new_role": user.role
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating user role: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error updating user role"
        )

@router.delete("/users/{user_id}", status_code=status.HTTP_200_OK)
async def deactivate_user(
    user_id: UUID,
    current_admin: User = Depends(admin_required),
    db: Session = Depends(get_session)
):
    """
    Deactivate user (soft delete) (Blueprint 2.4.5.4)
    """
    try:
        user = db.get(User, user_id)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User {user_id} not found"
            )
        
        # Prevent self-deactivation
        if user.id == current_admin.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot deactivate your own account"
            )
        
        user.is_active = False
        user.updated_at = datetime.utcnow()
        
        db.add(user)
        db.commit()
        
        logger.info(f"User {user_id} deactivated by admin {current_admin.id}")
        
        return {
            "message": "User deactivated successfully",
            "user_id": user.id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deactivating user: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error deactivating user"
        )

# ==================== DATA SOURCE MANAGEMENT ====================

@router.get("/data-sources", response_model=List[DataSourceRead])
async def list_data_sources(
    current_admin: User = Depends(admin_required),
    db: Session = Depends(get_session)
):
    """
    List all data sources (Blueprint 2.4.5.5)
    """
    try:
        data_sources = db.exec(select(DataSource).order_by(DataSource.created_at.desc())).all()
        return [DataSourceRead.from_orm(ds) for ds in data_sources]
        
    except Exception as e:
        logger.error(f"Error listing data sources: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving data sources"
        )

@router.post("/data-sources", response_model=DataSourceRead, status_code=status.HTTP_201_CREATED)
async def create_data_source(
    data_source_data: DataSourceCreate,
    current_admin: User = Depends(admin_required),
    db: Session = Depends(get_session)
):
    """
    Add new data source (Blueprint 2.4.5.6)
    """
    try:
        # Check for duplicate name
        existing = db.exec(select(DataSource).where(DataSource.name == data_source_data.name)).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Data source with name '{data_source_data.name}' already exists"
            )
        
        data_source = DataSource(
            name=data_source_data.name,
            type=data_source_data.type,
            source_url=data_source_data.source_url,
            source_path=data_source_data.source_path,
            is_active=data_source_data.is_active,
            config=data_source_data.config
        )
        
        db.add(data_source)
        db.commit()
        db.refresh(data_source)
        
        logger.info(f"Data source '{data_source.name}' created by admin {current_admin.id}")
        
        return DataSourceRead.from_orm(data_source)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating data source: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error creating data source"
        )

@router.put("/data-sources/{source_id}", response_model=DataSourceRead)
async def update_data_source(
    source_id: UUID,
    update_data: DataSourceUpdate,
    current_admin: User = Depends(admin_required),
    db: Session = Depends(get_session)
):
    """
    Update data source configuration (Blueprint 2.4.5.7)
    """
    try:
        data_source = db.get(DataSource, source_id)
        
        if not data_source:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Data source {source_id} not found"
            )
        
        # Update fields
        update_dict = update_data.dict(exclude_unset=True)
        for key, value in update_dict.items():
            setattr(data_source, key, value)
        
        data_source.updated_at = datetime.utcnow()
        
        db.add(data_source)
        db.commit()
        db.refresh(data_source)
        
        logger.info(f"Data source {source_id} updated by admin {current_admin.id}")
        
        return DataSourceRead.from_orm(data_source)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating data source: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error updating data source"
        )

@router.post("/data-sources/{source_id}/trigger")
async def trigger_data_pipeline(
    source_id: UUID,
    background_tasks: BackgroundTasks,
    current_admin: User = Depends(admin_required),
    db: Session = Depends(get_session)
):
    """
    Manually trigger data pipeline for a source (Blueprint 2.4.5.8)
    """
    try:
        data_source = db.get(DataSource, source_id)
        
        if not data_source:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Data source {source_id} not found"
            )
        
        if not data_source.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot trigger inactive data source"
            )
        
        # Update last run timestamp
        data_source.last_run_at = datetime.utcnow()
        db.add(data_source)
        db.commit()
        
        # Trigger pipeline in background (stub implementation)
        # In production, this would call the actual data-pipeline service
        logger.info(f"Data pipeline triggered for source {source_id} by admin {current_admin.id}")
        
        # TODO: Implement actual pipeline trigger
        # background_tasks.add_task(run_pipeline, source_id)
        
        return {
            "message": "Data pipeline triggered successfully",
            "source_id": source_id,
            "source_name": data_source.name,
            "triggered_at": data_source.last_run_at
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error triggering pipeline: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error triggering data pipeline"
        )

# ==================== ML MODEL MANAGEMENT ====================

@router.get("/models", response_model=List[MLModelRead])
async def list_ml_models(
    current_admin: User = Depends(admin_required),
    db: Session = Depends(get_session)
):
    """
    List all ML models with metrics (Blueprint 2.4.5.9)
    """
    try:
        models = db.exec(select(MLModel).order_by(MLModel.trained_at.desc())).all()
        return [MLModelRead.from_orm(m) for m in models]
        
    except Exception as e:
        logger.error(f"Error listing ML models: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving ML models"
        )

@router.post("/models/retrain")
async def trigger_model_retraining(
    model_type: ModelType,
    background_tasks: BackgroundTasks,
    current_admin: User = Depends(admin_required),
    db: Session = Depends(get_session)
):
    """
    Trigger ML model retraining (Blueprint 2.4.5.10)
    """
    try:
        logger.info(f"Model retraining triggered for {model_type} by admin {current_admin.id}")
        
        # TODO: Implement actual model retraining
        # background_tasks.add_task(retrain_model, model_type)
        
        return {
            "message": "Model retraining queued successfully",
            "model_type": model_type,
            "triggered_at": datetime.utcnow(),
            "status": "queued"
        }
        
    except Exception as e:
        logger.error(f"Error triggering model retraining: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error triggering model retraining"
        )

# ==================== SYSTEM STATISTICS ====================

@router.get("/stats", response_model=SystemStats)
async def get_admin_stats(
    current_admin: User = Depends(admin_required),
    db: Session = Depends(get_session)
):
    """
    Get comprehensive system statistics (Blueprint 2.4.5.11)
    """
    try:
        # User statistics
        total_users = db.exec(select(func.count()).select_from(User)).one()
        
        users_by_role = {}
        for role in UserRole:
            count = db.exec(select(func.count()).select_from(User).where(User.role == role)).one()
            users_by_role[role.value] = count
        
        # Property statistics
        total_properties = db.exec(select(func.count()).select_from(Property)).one()
        validated_properties = db.exec(
            select(func.count()).select_from(Property)
            .where(Property.validation_status == ValidationStatus.VALIDATED)
        ).one()
        pending_properties = db.exec(
            select(func.count()).select_from(Property)
            .where(Property.validation_status == ValidationStatus.PENDING)
        ).one()
        rejected_properties = db.exec(
            select(func.count()).select_from(Property)
            .where(Property.validation_status == ValidationStatus.REJECTED)
        ).one()
        
        # Calculate average quality score
        avg_quality = db.exec(select(func.avg(Property.quality_score))).one()
        avg_property_quality_score = round(float(avg_quality), 2) if avg_quality else 0.0
        
        # Booking statistics
        total_bookings = db.exec(select(func.count()).select_from(Booking)).one()
        pending_bookings = db.exec(
            select(func.count()).select_from(Booking)
            .where(Booking.status == BookingStatus.PENDING)
        ).one()
        confirmed_bookings = db.exec(
            select(func.count()).select_from(Booking)
            .where(Booking.status == BookingStatus.CONFIRMED)
        ).one()
        
        # Data source statistics
        active_data_sources = db.exec(
            select(func.count()).select_from(DataSource)
            .where(DataSource.is_active == True)
        ).one()
        
        # ML model statistics
        active_ml_models = db.exec(
            select(func.count()).select_from(MLModel)
            .where(MLModel.status == ModelStatus.ACTIVE)
        ).one()
        
        return SystemStats(
            total_users=total_users,
            users_by_role=users_by_role,
            total_properties=total_properties,
            validated_properties=validated_properties,
            pending_properties=pending_properties,
            rejected_properties=rejected_properties,
            total_bookings=total_bookings,
            pending_bookings=pending_bookings,
            confirmed_bookings=confirmed_bookings,
            active_data_sources=active_data_sources,
            active_ml_models=active_ml_models,
            avg_property_quality_score=avg_property_quality_score,
            last_updated=datetime.utcnow()
        )
        
    except Exception as e:
        logger.error(f"Error generating admin stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error generating system statistics"
        )

# ==================== VERSIONING & MAINTENANCE (BLUEPRINT 3.3) ====================

@router.post("/jobs/listing-aggregation")
async def trigger_listing_aggregation(
    background_tasks: BackgroundTasks,
    current_admin: User = Depends(admin_required),
    db: Session = Depends(get_session)
):
    """
    Manually trigger monthly listing aggregation job (Blueprint 3.3.3.2)
    """
    from src.services.listing_retention import ListingRetentionService
    
    try:
        service = ListingRetentionService(db)
        result = service.schedule_monthly_aggregation()
        
        logger.info(
            f"Listing aggregation triggered by admin {current_admin.id}: "
            f"{result.get('aggregates_created', 0)} created"
        )
        
        return {
            "message": "Listing aggregation completed",
            "result": result
        }
        
    except Exception as e:
        logger.error(f"Error running listing aggregation: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error running listing aggregation: {str(e)}"
        )

@router.get("/retention/stats")
async def get_retention_stats(
    current_admin: User = Depends(admin_required),
    db: Session = Depends(get_session)
):
    """
    Get listing retention statistics (Blueprint 3.3.3)
    """
    from src.services.listing_retention import ListingRetentionService
    
    try:
        service = ListingRetentionService(db)
        stats = service.get_retention_stats()
        
        return {
            "listing_retention": stats,
            "retention_policy": "24 months",
            "aggregation_frequency": "monthly"
        }
        
    except Exception as e:
        logger.error(f"Error retrieving retention stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving retention statistics"
        )

@router.get("/indexes/health")
async def check_index_health(
    current_admin: User = Depends(admin_required),
    db: Session = Depends(get_session)
):
    """
    Check database index health and usage (Blueprint 3.2)
    
    Returns index statistics for performance monitoring
    """
    try:
        # Query PostgreSQL index statistics
        index_stats_query = """
        SELECT 
            schemaname,
            tablename,
            indexname,
            idx_scan as scan_count,
            idx_tup_read as tuples_read,
            idx_tup_fetch as tuples_fetched
        FROM pg_stat_user_indexes
        WHERE schemaname = 'public'
        ORDER BY idx_scan DESC
        LIMIT 20;
        """
        
        result = db.execute(index_stats_query)
        rows = result.fetchall()
        
        indexes = [
            {
                "schema": row[0],
                "table": row[1],
                "index": row[2],
                "scans": row[3],
                "tuples_read": row[4],
                "tuples_fetched": row[5]
            }
            for row in rows
        ]
        
        # Count total indexes
        count_query = """
        SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public';
        """
        total_indexes = db.execute(count_query).scalar()
        
        return {
            "total_indexes": total_indexes,
            "top_used_indexes": indexes,
            "note": "Indexes with scan_count=0 might be unused and could be candidates for removal"
        }
        
    except Exception as e:
        logger.error(f"Error checking index health: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error checking index health"
        )

@router.get("/property/{property_id}/history")
async def get_property_version_history(
    property_id: UUID,
    limit: int = Query(10, ge=1, le=50),
    current_admin: User = Depends(admin_required),
    db: Session = Depends(get_session)
):
    """
    Get version history for a property (Blueprint 3.3.1.5)
    
    Returns historical versions for trend analysis
    """
    from src.services.property_versioning import PropertyVersioningService
    
    try:
        service = PropertyVersioningService(db)
        history = service.get_property_history(property_id, limit=limit)
        current = service.get_current_version(property_id)
        
        return {
            "property_id": property_id,
            "current_version": current.version,
            "current_price": float(current.price),
            "history_count": len(history),
            "history": [
                {
                    "version": h.version,
                    "timestamp": h.version_timestamp.isoformat(),
                    "price": float(h.price),
                    "price_per_m2": float(h.price_per_m2),
                    "quality_score": float(h.quality_score)
                }
                for h in history
            ]
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error retrieving property history: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving property history"
        )

# ==================== DATA PIPELINE MANAGEMENT (BLUEPRINT 4) ====================

@router.post("/pipeline/scraping")
async def trigger_scraping_pipeline(
    background_tasks: BackgroundTasks,
    current_admin: User = Depends(admin_required),
    db: Session = Depends(get_session)
):
    """
    Manually trigger scraping pipeline (Blueprint 4.1)
    """
    from src.pipeline.scheduler import run_daily_scraping
    
    try:
        # Run in background
        background_tasks.add_task(run_daily_scraping)
        
        logger.info(f"Scraping pipeline triggered by admin {current_admin.id}")
        
        return {
            "message": "Scraping pipeline started in background",
            "triggered_by": current_admin.email,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error triggering scraping pipeline: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error triggering scraping pipeline: {str(e)}"
        )

@router.post("/pipeline/ocr")
async def trigger_ocr_pipeline(
    background_tasks: BackgroundTasks,
    current_admin: User = Depends(admin_required),
    db: Session = Depends(get_session)
):
    """
    Manually trigger OCR pipeline (Blueprint 4.2)
    """
    from src.pipeline.scheduler import run_weekly_ocr
    
    try:
        # Run in background
        background_tasks.add_task(run_weekly_ocr)
        
        logger.info(f"OCR pipeline triggered by admin {current_admin.id}")
        
        return {
            "message": "OCR pipeline started in background",
            "triggered_by": current_admin.email,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error triggering OCR pipeline: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error triggering OCR pipeline: {str(e)}"
        )

@router.post("/pipeline/etl")
async def trigger_etl_pipeline(
    background_tasks: BackgroundTasks,
    current_admin: User = Depends(admin_required),
    db: Session = Depends(get_session)
):
    """
    Manually trigger ETL pipeline (Blueprint 4.3)
    """
    from src.pipeline.scheduler import run_pipeline_manually
    
    try:
        # Run in background
        background_tasks.add_task(run_pipeline_manually, "etl")
        
        logger.info(f"ETL pipeline triggered by admin {current_admin.id}")
        
        return {
            "message": "ETL pipeline started in background",
            "triggered_by": current_admin.email,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error triggering ETL pipeline: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error triggering ETL pipeline: {str(e)}"
        )

@router.post("/pipeline/complete")
async def trigger_complete_pipeline(
    background_tasks: BackgroundTasks,
    current_admin: User = Depends(admin_required),
    db: Session = Depends(get_session)
):
    """
    Manually trigger complete pipeline (Scraping + OCR + ETL) (Blueprint 4)
    """
    from src.pipeline.scheduler import run_complete_data_pipeline
    
    try:
        # Run in background
        background_tasks.add_task(run_complete_data_pipeline)
        
        logger.info(f"Complete pipeline triggered by admin {current_admin.id}")
        
        return {
            "message": "Complete data pipeline started in background",
            "triggered_by": current_admin.email,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error triggering complete pipeline: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error triggering complete pipeline: {str(e)}"
        )

@router.get("/pipeline/data-quality")
async def get_data_quality_metrics(
    current_admin: User = Depends(admin_required),
    db: Session = Depends(get_session)
):
    """
    Get data quality metrics (Blueprint 4.4)
    
    Returns validation statistics and quality scores
    """
    try:
        # Get validation status counts
        validated_count = db.execute(
            select(func.count()).select_from(Property)
            .where(Property.validation_status == ValidationStatus.VALIDATED)
        ).scalar()
        
        pending_count = db.execute(
            select(func.count()).select_from(Property)
            .where(Property.validation_status == ValidationStatus.PENDING)
        ).scalar()
        
        rejected_count = db.execute(
            select(func.count()).select_from(Property)
            .where(Property.validation_status == ValidationStatus.REJECTED)
        ).scalar()
        
        total_count = validated_count + pending_count + rejected_count
        
        # Get average quality score
        avg_quality = db.execute(
            select(func.avg(Property.quality_score))
            .where(Property.validation_status == ValidationStatus.VALIDATED)
        ).scalar()
        
        # Get quality score distribution
        high_quality = db.execute(
            select(func.count()).select_from(Property)
            .where(Property.quality_score >= 90)
        ).scalar()
        
        medium_quality = db.execute(
            select(func.count()).select_from(Property)
            .where(
                Property.quality_score >= 70,
                Property.quality_score < 90
            )
        ).scalar()
        
        low_quality = db.execute(
            select(func.count()).select_from(Property)
            .where(Property.quality_score < 70)
        ).scalar()
        
        return {
            "validation_status": {
                "validated": validated_count,
                "pending": pending_count,
                "rejected": rejected_count,
                "total": total_count,
                "validation_rate": round((validated_count / total_count * 100) if total_count > 0 else 0, 2)
            },
            "quality_scores": {
                "average": round(float(avg_quality), 2) if avg_quality else 0,
                "distribution": {
                    "high (≥90)": high_quality,
                    "medium (70-89)": medium_quality,
                    "low (<70)": low_quality
                }
            },
            "min_quality_threshold": 70.0,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error retrieving data quality metrics: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving data quality metrics"
        )

# ==================== MACHINE LEARNING MANAGEMENT (BLUEPRINT 5) ====================

@router.post("/ml/train/price-prediction")
async def train_price_prediction_model(
    background_tasks: BackgroundTasks,
    current_admin: User = Depends(admin_required),
    db: Session = Depends(get_session)
):
    """
    Train price prediction model (Blueprint 5.3.1)
    """
    from src.ml.ml_scheduler import trigger_manual_retraining
    
    try:
        # Run in background
        background_tasks.add_task(trigger_manual_retraining, "price")
        
        logger.info(f"Price prediction training triggered by admin {current_admin.id}")
        
        return {
            "message": "Price prediction model training started in background",
            "triggered_by": current_admin.email,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error triggering price prediction training: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error triggering training: {str(e)}"
        )

@router.post("/ml/train/trend-forecast")
async def train_trend_forecast_model(
    background_tasks: BackgroundTasks,
    current_admin: User = Depends(admin_required),
    db: Session = Depends(get_session)
):
    """
    Train trend forecast model (Blueprint 5.3.2)
    """
    from src.ml.ml_scheduler import trigger_manual_retraining
    
    try:
        # Run in background
        background_tasks.add_task(trigger_manual_retraining, "trend")
        
        logger.info(f"Trend forecast training triggered by admin {current_admin.id}")
        
        return {
            "message": "Trend forecast model training started in background",
            "triggered_by": current_admin.email,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error triggering trend forecast training: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error triggering training: {str(e)}"
        )

@router.post("/ml/deploy/{model_id}")
async def deploy_ml_model(
    model_id: str,
    current_admin: User = Depends(admin_required),
    db: Session = Depends(get_session)
):
    """
    Deploy ML model to production (Blueprint 5.5.1)
    """
    from src.ml.model_training import ModelTrainer
    
    try:
        trainer = ModelTrainer(db)
        result = trainer.deploy_model(model_id)
        
        logger.info(f"Model {model_id} deployed by admin {current_admin.id}")
        
        return result
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error deploying model: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deploying model: {str(e)}"
        )

@router.get("/ml/models/active")
async def get_active_models(
    current_admin: User = Depends(admin_required),
    db: Session = Depends(get_session)
):
    """
    Get active ML models (Blueprint 5.5.1)
    """
    from src.models.ml_model import MLModel, ModelType, ModelStatus
    
    try:
        # Get active price prediction model
        price_model = db.exec(
            select(MLModel).where(
                MLModel.model_type == ModelType.PRICE_PREDICTION,
                MLModel.status == ModelStatus.ACTIVE
            )
        ).first()
        
        # Get active trend forecast model
        trend_model = db.exec(
            select(MLModel).where(
                MLModel.model_type == ModelType.TREND_FORECAST,
                MLModel.status == ModelStatus.ACTIVE
            )
        ).first()
        
        return {
            "price_prediction": {
                "id": str(price_model.id),
                "name": price_model.name,
                "version": price_model.version,
                "algorithm": price_model.algorithm,
                "metrics": price_model.metrics,
                "deployed_at": price_model.deployed_at.isoformat() if price_model.deployed_at else None
            } if price_model else None,
            "trend_forecast": {
                "id": str(trend_model.id),
                "name": trend_model.name,
                "version": trend_model.version,
                "algorithm": trend_model.algorithm,
                "metrics": trend_model.metrics,
                "deployed_at": trend_model.deployed_at.isoformat() if trend_model.deployed_at else None
            } if trend_model else None
        }
        
    except Exception as e:
        logger.error(f"Error retrieving active models: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving active models"
        )

@router.get("/ml/models")
async def list_ml_models(
    model_type: Optional[str] = None,
    current_admin: User = Depends(admin_required),
    db: Session = Depends(get_session)
):
    """
    List all ML models with filtering (Blueprint 5)
    """
    from src.models.ml_model import MLModel, ModelType
    
    try:
        query = select(MLModel)
        
        if model_type:
            query = query.where(MLModel.model_type == ModelType[model_type.upper().replace("-", "_")])
        
        models = db.exec(query.order_by(MLModel.created_at.desc())).all()
        
        return {
            "models": [
                {
                    "id": str(m.id),
                    "name": m.name,
                    "version": m.version,
                    "type": m.model_type.value,
                    "algorithm": m.algorithm,
                    "status": m.status.value,
                    "metrics": m.metrics,
                    "training_records": m.training_records,
                    "created_at": m.created_at.isoformat(),
                    "deployed_at": m.deployed_at.isoformat() if m.deployed_at else None
                }
                for m in models
            ],
            "total": len(models)
        }
        
    except Exception as e:
        logger.error(f"Error listing models: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error listing models"
        )

