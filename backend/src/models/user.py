from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field, Column, String, DateTime
from enum import Enum

class UserRole(str, Enum):
    FREE_USER = "FREE_USER"
    PAID_USER = "PAID_USER"
    ADMIN = "ADMIN"

class User(SQLModel, table=True):
    __tablename__ = "users"

    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    email: str = Field(sa_column=Column(String(255), unique=True, index=True, nullable=False))
    password: Optional[str] = Field(default=None, sa_column=Column(String(255), nullable=True))
    role: UserRole = Field(default=UserRole.FREE_USER, index=True)
    first_name: Optional[str] = Field(default=None, sa_column=Column(String(100)))
    last_name: Optional[str] = Field(default=None, sa_column=Column(String(100)))
    phone: Optional[str] = Field(default=None, sa_column=Column(String(20)))
    created_at: datetime = Field(default_factory=datetime.utcnow, sa_column=Column(DateTime(timezone=True), index=True))
    updated_at: datetime = Field(default_factory=datetime.utcnow, sa_column=Column(DateTime(timezone=True), onupdate=datetime.utcnow))
    last_login: Optional[datetime] = Field(default=None, sa_column=Column(DateTime(timezone=True)))
    is_active: bool = Field(default=True)
    reset_password_token: Optional[str] = Field(default=None, sa_column=Column(String(255)))
    reset_password_expires: Optional[datetime] = Field(default=None, sa_column=Column(DateTime(timezone=True)))
    subscription_expires: Optional[datetime] = Field(default=None, sa_column=Column(DateTime(timezone=True)))
