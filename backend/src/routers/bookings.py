from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlmodel import Session, select, and_
from typing import List
from uuid import UUID
from datetime import datetime

from src.config.database import get_session
from src.models.booking import Booking, BookingStatus, ConsultationType
from src.models.user import User, UserRole
from src.schemas.booking import BookingCreate, BookingRead, BookingUpdate
from src.dependencies.auth import get_current_active_user
from src.dependencies.rbac import paid_user_required, admin_required
from src.utils.logger import logger

router = APIRouter(prefix="/bookings", tags=["Bookings"])

async def send_booking_notification(booking_id: UUID, event_type: str):
    """
    Stub email notification service (Blueprint 2.4.4.11)
    In production, implement actual email sending
    """
    logger.info(f"Email notification: Booking {booking_id} - {event_type}")
    # TODO: Implement actual email service
    pass

def check_booking_availability(db: Session, preferred_date, preferred_time: str = None) -> bool:
    """
    Check if admin has availability (Blueprint 2.4.4.10)
    Prevents overlapping bookings
    """
    # Check for existing confirmed bookings on the same date/time
    query = select(Booking).where(
        and_(
            Booking.preferred_date == preferred_date,
            Booking.status.in_([BookingStatus.CONFIRMED, BookingStatus.PENDING])
        )
    )
    
    if preferred_time:
        query = query.where(Booking.preferred_time == preferred_time)
    
    existing = db.exec(query).first()
    
    # Simple availability check - max 3 bookings per day
    daily_bookings = db.exec(
        select(Booking).where(
            and_(
                Booking.preferred_date == preferred_date,
                Booking.status.in_([BookingStatus.CONFIRMED, BookingStatus.PENDING])
            )
        )
    ).all()
    
    return len(daily_bookings) < 3

@router.post("", response_model=BookingRead, status_code=status.HTTP_201_CREATED)
async def create_booking(
    booking_data: BookingCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(paid_user_required),
    db: Session = Depends(get_session)
):
    """
    Create a new booking (Blueprint 2.4.4.3)
    PAID_USER and ADMIN only
    """
    try:
        # Check availability
        if not check_booking_availability(db, booking_data.preferred_date, booking_data.preferred_time):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="No availability for the selected date/time. Please choose another slot."
            )
        
        # Create booking
        booking = Booking(
            user_id=current_user.id,
            consultation_type=booking_data.consultation_type,
            preferred_date=booking_data.preferred_date,
            preferred_time=booking_data.preferred_time,
            notes=booking_data.notes,
            status=BookingStatus.PENDING
        )
        
        db.add(booking)
        db.commit()
        db.refresh(booking)
        
        # Send notification in background
        background_tasks.add_task(send_booking_notification, booking.id, "created")
        
        logger.info(f"Booking created: {booking.id} by user {current_user.id}")
        
        return BookingRead.from_orm(booking)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating booking: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error creating booking"
        )

@router.get("", response_model=List[BookingRead])
async def get_user_bookings(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_session)
):
    """
    Get current user's bookings (Blueprint 2.4.4.4)
    Authenticated users only
    """
    try:
        bookings = db.exec(
            select(Booking)
            .where(Booking.user_id == current_user.id)
            .order_by(Booking.created_at.desc())
        ).all()
        
        return [BookingRead.from_orm(b) for b in bookings]
        
    except Exception as e:
        logger.error(f"Error retrieving bookings for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving bookings"
        )

@router.get("/admin", response_model=List[BookingRead])
async def get_all_bookings(
    status_filter: BookingStatus = None,
    current_admin: User = Depends(admin_required),
    db: Session = Depends(get_session)
):
    """
    Get all bookings (Blueprint 2.4.4.8)
    ADMIN only
    """
    try:
        query = select(Booking).order_by(Booking.created_at.desc())
        
        if status_filter:
            query = query.where(Booking.status == status_filter)
        
        bookings = db.exec(query).all()
        
        return [BookingRead.from_orm(b) for b in bookings]
        
    except Exception as e:
        logger.error(f"Error retrieving all bookings: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving bookings"
        )

@router.get("/{booking_id}", response_model=BookingRead)
async def get_booking(
    booking_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_session)
):
    """
    Get single booking details (Blueprint 2.4.4.5)
    User can only view their own bookings, admin can view all
    """
    try:
        booking = db.get(Booking, booking_id)
        
        if not booking:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Booking {booking_id} not found"
            )
        
        # Authorization check
        if booking.user_id != current_user.id and current_user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this booking"
            )
        
        return BookingRead.from_orm(booking)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving booking {booking_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving booking"
        )

@router.put("/{booking_id}", response_model=BookingRead)
async def update_booking(
    booking_id: UUID,
    booking_update: BookingUpdate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_session)
):
    """
    Update booking (Blueprint 2.4.4.6)
    User can update their own bookings if status is PENDING
    """
    try:
        booking = db.get(Booking, booking_id)
        
        if not booking:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Booking {booking_id} not found"
            )
        
        # Authorization check
        if booking.user_id != current_user.id and current_user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this booking"
            )
        
        # Users can only update pending bookings
        if booking.status != BookingStatus.PENDING and current_user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Can only update pending bookings"
            )
        
        # Update fields
        update_data = booking_update.dict(exclude_unset=True)
        
        # Check availability if date/time changed
        if "preferred_date" in update_data or "preferred_time" in update_data:
            new_date = update_data.get("preferred_date", booking.preferred_date)
            new_time = update_data.get("preferred_time", booking.preferred_time)
            
            if not check_booking_availability(db, new_date, new_time):
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="No availability for the selected date/time"
                )
        
        for key, value in update_data.items():
            setattr(booking, key, value)
        
        booking.updated_at = datetime.utcnow()
        db.add(booking)
        db.commit()
        db.refresh(booking)
        
        # Send notification
        background_tasks.add_task(send_booking_notification, booking.id, "updated")
        
        logger.info(f"Booking {booking_id} updated by user {current_user.id}")
        
        return BookingRead.from_orm(booking)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating booking {booking_id}: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error updating booking"
        )

@router.delete("/{booking_id}", status_code=status.HTTP_204_NO_CONTENT)
async def cancel_booking(
    booking_id: UUID,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_session)
):
    """
    Cancel booking (Blueprint 2.4.4.7)
    Sets status to CANCELLED (soft delete)
    """
    try:
        booking = db.get(Booking, booking_id)
        
        if not booking:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Booking {booking_id} not found"
            )
        
        # Authorization check
        if booking.user_id != current_user.id and current_user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to cancel this booking"
            )
        
        # Update status to cancelled
        booking.status = BookingStatus.CANCELLED
        booking.updated_at = datetime.utcnow()
        
        db.add(booking)
        db.commit()
        
        # Send notification
        background_tasks.add_task(send_booking_notification, booking.id, "cancelled")
        
        logger.info(f"Booking {booking_id} cancelled by user {current_user.id}")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error cancelling booking {booking_id}: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error cancelling booking"
        )

@router.put("/{booking_id}/status", response_model=BookingRead)
async def update_booking_status(
    booking_id: UUID,
    new_status: BookingStatus,
    admin_notes: str = None,
    background_tasks: BackgroundTasks = None,
    current_admin: User = Depends(admin_required),
    db: Session = Depends(get_session)
):
    """
    Update booking status (Blueprint 2.4.4.9)
    ADMIN only - used to confirm, complete, or cancel bookings
    """
    try:
        booking = db.get(Booking, booking_id)
        
        if not booking:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Booking {booking_id} not found"
            )
        
        old_status = booking.status
        booking.status = new_status
        booking.updated_at = datetime.utcnow()
        
        if admin_notes:
            booking.admin_notes = admin_notes
        
        # Set timestamps based on status
        if new_status == BookingStatus.CONFIRMED and not booking.confirmed_at:
            booking.confirmed_at = datetime.utcnow()
        elif new_status == BookingStatus.COMPLETED and not booking.completed_at:
            booking.completed_at = datetime.utcnow()
        
        db.add(booking)
        db.commit()
        db.refresh(booking)
        
        # Send notification
        if background_tasks:
            background_tasks.add_task(send_booking_notification, booking.id, f"status_changed_{new_status.value}")
        
        logger.info(f"Booking {booking_id} status changed from {old_status} to {new_status} by admin {current_admin.id}")
        
        return BookingRead.from_orm(booking)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating booking status {booking_id}: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error updating booking status"
        )
