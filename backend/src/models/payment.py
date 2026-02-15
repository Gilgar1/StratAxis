from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field, Column, String, DateTime, Numeric
from enum import Enum

class PaymentPlan(str, Enum):
    PRO_INVESTOR = "PRO_INVESTOR"
    INSTITUTIONAL = "INSTITUTIONAL"

class PaymentPeriod(str, Enum):
    MONTHLY = "monthly"
    YEARLY = "yearly"

class PaymentVerificationStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

class Payment(SQLModel, table=True):
    __tablename__ = "payments"

    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    user_id: UUID = Field(foreign_key="users.id", index=True)
    plan: PaymentPlan = Field(index=True)
    billing_period: PaymentPeriod
    amount: float = Field(sa_column=Column(Numeric(precision=10, scale=2)))
    payment_id_last_four: str = Field(sa_column=Column(String(4)))
    payment_method: str = Field(default="MOBILE_MONEY", sa_column=Column(String(50)))
    verification_status: PaymentVerificationStatus = Field(default=PaymentVerificationStatus.PENDING, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, sa_column=Column(DateTime(timezone=True), index=True))
    verified_at: Optional[datetime] = Field(default=None, sa_column=Column(DateTime(timezone=True)))
    verified_by: Optional[UUID] = Field(default=None, foreign_key="users.id")
    rejection_reason: Optional[str] = Field(default=None, sa_column=Column(String(500)))
