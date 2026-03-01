from sqlmodel import SQLModel, Field
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from uuid import UUID
import uuid

class BlogPost(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    title: str = Field(index=True)
    slug: str = Field(unique=True, index=True)
    content: str
    cover_image: Optional[str] = None
    author_id: UUID = Field(foreign_key="user.id")
    is_published: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    published_at: Optional[datetime] = None
