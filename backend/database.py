"""
StratAxis — database.py
Central database connection layer.
Supports:
  - Supabase client (for simple REST-style queries)
  - Async SQLAlchemy engine (for complex ORM queries)
"""

import os
from dotenv import load_dotenv
from supabase import create_client, Client
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

load_dotenv()

# ─────────────────────────────────────────────
# Supabase client (for table inserts, selects)
# ─────────────────────────────────────────────
SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


# ─────────────────────────────────────────────
# Async SQLAlchemy engine (for ORM / complex queries)
# ─────────────────────────────────────────────
DATABASE_URL: str = os.getenv("DATABASE_URL", "")

engine = create_async_engine(
    DATABASE_URL,
    echo=os.getenv("ENVIRONMENT", "development") == "development",
    future=True,
)

AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_session() -> AsyncSession:
    """FastAPI dependency — yields an async DB session."""
    async with AsyncSessionLocal() as session:
        yield session


def get_supabase() -> Client:
    """Return the shared Supabase client instance."""
    return supabase
