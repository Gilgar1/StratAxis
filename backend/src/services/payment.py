from uuid import UUID
from datetime import datetime
from typing import Optional
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.payment import Payment, PaymentVerificationStatus
from ..models.user import User, PaymentStatus

async def create_payment_request(
    db: AsyncSession,
    user_id: UUID,
    plan: str,
    billing_period: str,
    amount: float,
    payment_id_last_four: str
) -> Payment:
    """Create a new payment request."""
    payment = Payment(
        user_id=user_id,
        plan=plan,
        billing_period=billing_period,
        amount=amount,
        payment_id_last_four=payment_id_last_four,
        verification_status=PaymentVerificationStatus.PENDING
    )
    
    db.add(payment)
    await db.commit()
    await db.refresh(payment)
    
    # Update user payment status to PENDING
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user:
        user.payment_status = PaymentStatus.PENDING
        db.add(user)
        await db.commit()
    
    return payment

async def get_pending_payments(db: AsyncSession) -> list[Payment]:
    """Get all pending payment requests."""
    result = await db.execute(
        select(Payment).where(Payment.verification_status == PaymentVerificationStatus.PENDING)
    )
    return list(result.scalars().all())

async def get_payment_by_id(db: AsyncSession, payment_id: UUID) -> Optional[Payment]:
    """Get a payment by ID."""
    result = await db.execute(select(Payment).where(Payment.id == payment_id))
    return result.scalar_one_or_none()

async def approve_payment(
    db: AsyncSession,
    payment_id: UUID,
    admin_id: UUID
) -> Payment:
    """Approve a payment and upgrade user to PAID_USER."""
    payment = await get_payment_by_id(db, payment_id)
    if not payment:
        raise ValueError("Payment not found")
    
    payment.verification_status = PaymentVerificationStatus.APPROVED
    payment.verified_at = datetime.utcnow()
    payment.verified_by = admin_id
    db.add(payment)
    
    # Update user role and payment status
    result = await db.execute(select(User).where(User.id == payment.user_id))
    user = result.scalar_one_or_none()
    if user:
        user.role = "PAID_USER"
        user.payment_status = PaymentStatus.ACTIVE
        # Set subscription expiration based on billing period
        from datetime import timedelta
        if payment.billing_period == "monthly":
            user.subscription_expires = datetime.utcnow() + timedelta(days=30)
        else:  # yearly
            user.subscription_expires = datetime.utcnow() + timedelta(days=365)
        db.add(user)
    
    await db.commit()
    await db.refresh(payment)
    
    return payment

async def reject_payment(
    db: AsyncSession,
    payment_id: UUID,
    admin_id: UUID,
    reason: str
) -> Payment:
    """Reject a payment."""
    payment = await get_payment_by_id(db, payment_id)
    if not payment:
        raise ValueError("Payment not found")
    
    payment.verification_status = PaymentVerificationStatus.REJECTED
    payment.verified_at = datetime.utcnow()
    payment.verified_by = admin_id
    payment.rejection_reason = reason
    db.add(payment)
    
    # Update user payment status back to NONE
    result = await db.execute(select(User).where(User.id == payment.user_id))
    user = result.scalar_one_or_none()
    if user:
        user.payment_status = PaymentStatus.NONE
        db.add(user)
    
    await db.commit()
    await db.refresh(payment)
    
    return payment

async def get_user_payments(db: AsyncSession, user_id: UUID) -> list[Payment]:
    """Get all payments for a user."""
    result = await db.execute(
        select(Payment).where(Payment.user_id == user_id).order_by(Payment.created_at.desc())
    )
    return list(result.scalars().all())
