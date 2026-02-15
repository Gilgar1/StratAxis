from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from ..database import get_db
from ..services import payment as payment_service
from ..middleware.auth import get_current_user, require_role
from ..models.user import User

router = APIRouter(prefix="/api/payments", tags=["payments"])

class PaymentSubmitRequest(BaseModel):
    user_id: UUID
    plan: str
    billing_period: str
    payment_id_last_four: str
    amount: float

class PaymentApproveRequest(BaseModel):
    payment_id: UUID

class PaymentRejectRequest(BaseModel):
    payment_id: UUID
    reason: str

@router.post("/submit", status_code=status.HTTP_201_CREATED)
async def submit_payment(
    request: PaymentSubmitRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Submit a payment for verification."""
    try:
        # Ensure user can only submit payment for themselves
        if str(current_user.id) != str(request.user_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only submit payments for yourself"
            )
        
        payment = await payment_service.create_payment_request(
            db=db,
            user_id=request.user_id,
            plan=request.plan,
            billing_period=request.billing_period,
            amount=request.amount,
            payment_id_last_four=request.payment_id_last_four
        )
        
        return {
            "success": True,
            "message": "Payment submitted successfully. Verification may take up to 1 hour.",
            "payment_id": str(payment.id)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/pending")
async def get_pending_payments(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("ADMIN"))
):
    """Get all pending payments (Admin only)."""
    try:
        payments = await payment_service.get_pending_payments(db)
        return {
            "success": True,
            "payments": [{
                "id": str(p.id),
                "user_id": str(p.user_id),
                "plan": p.plan,
                "billing_period": p.billing_period,
                "amount": float(p.amount),
                "payment_id_last_four": p.payment_id_last_four,
                "created_at": p.created_at.isoformat(),
                "verification_status": p.verification_status
            } for p in payments]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/approve")
async def approve_payment(
    request: PaymentApproveRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("ADMIN"))
):
    """Approve a payment (Admin only)."""
    try:
        payment = await payment_service.approve_payment(
            db=db,
            payment_id=request.payment_id,
            admin_id=current_user.id
        )
        
        return {
            "success": True,
            "message": "Payment approved successfully",
            "payment_id": str(payment.id)
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/reject")
async def reject_payment(
    request: PaymentRejectRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("ADMIN"))
):
    """Reject a payment (Admin only)."""
    try:
        payment = await payment_service.reject_payment(
            db=db,
            payment_id=request.payment_id,
            admin_id=current_user.id,
            reason=request.reason
        )
        
        return {
            "success": True,
            "message": "Payment rejected",
            "payment_id": str(payment.id)
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/my-payments")
async def get_my_payments(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current user's payments."""
    try:
        payments = await payment_service.get_user_payments(db, current_user.id)
        return {
            "success": True,
            "payments": [{
                "id": str(p.id),
                "plan": p.plan,
                "billing_period": p.billing_period,
                "amount": float(p.amount),
                "payment_id_last_four": p.payment_id_last_four,
                "created_at": p.created_at.isoformat(),
                "verification_status": p.verification_status,
                "verified_at": p.verified_at.isoformat() if p.verified_at else None,
                "rejection_reason": p.rejection_reason
            } for p in payments]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
