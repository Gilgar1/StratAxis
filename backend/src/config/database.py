"""
database.py — Async SQLAlchemy engine + table initialisation.

FIX: Previously init_db() would fail silently if:
  - Supabase PostgreSQL wasn't ready yet (container still starting)
  - The PostGIS extension failed (e.g., permissions)
  - Tables couldn't be created (schema conflict)

NEW: init_db() now retries with exponential backoff, so FastAPI
correctly waits for the Supabase DB container to be fully healthy
before accepting traffic. If it cannot connect after all retries,
it raises an exception that crashes startup — forcing a visible error
rather than a silent half-alive state.
"""

import asyncio
import time
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from sqlmodel import SQLModel
from src.config.env import settings
from src.utils.logger import logger

# Create async engine
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=(settings.ENVIRONMENT == "development"),
    future=True,
    # Connection pool settings — important for stability
    pool_pre_ping=True,        # Test connections before using them
    pool_recycle=300,          # Recycle connections every 5 minutes
    pool_size=5,
    max_overflow=10,
)

# Async session factory
async_session = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def _wait_for_db(max_attempts: int = 10, delay: float = 3.0) -> None:
    """
    Attempt to connect to the database with retries.
    This handles the race condition where FastAPI starts before
    the Supabase PostgreSQL container is fully ready.
    """
    for attempt in range(1, max_attempts + 1):
        try:
            async with engine.connect() as conn:
                await conn.execute(text("SELECT 1"))
            logger.info(f"✅ Database connection established (attempt {attempt})")
            return
        except Exception as e:
            if attempt < max_attempts:
                wait = delay * attempt  # exponential-ish backoff
                logger.warning(
                    f"⏳ Database not ready (attempt {attempt}/{max_attempts}): {e}. "
                    f"Retrying in {wait:.0f}s..."
                )
                await asyncio.sleep(wait)
            else:
                logger.error(
                    f"❌ Database unreachable after {max_attempts} attempts. "
                    f"Ensure Supabase Docker is running and healthy."
                )
                raise RuntimeError(
                    f"Cannot connect to database after {max_attempts} attempts. "
                    "Start Supabase Docker first: "
                    "cd infrastructure/supabase-docker/docker && docker compose up -d"
                ) from e


async def init_db() -> None:
    """
    Initialise the database:
    1. Wait for the DB to be reachable (retries with backoff)
    2. Enable PostGIS extension (best-effort — may already exist)
    3. Create all SQLModel tables (idempotent — skips existing tables)
    """
    # Step 1: Wait for DB to be ready
    await _wait_for_db()

    async with engine.begin() as conn:
        # Step 2: PostGIS extension — ignore if it fails (e.g., no superuser)
        try:
            await conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis;"))
            logger.info("PostGIS extension ready.")
        except Exception as e:
            logger.warning(
                f"PostGIS extension could not be created (non-fatal): {e}"
            )

        # Step 3: Import ALL models so SQLModel.metadata knows about them
        import src.models  # noqa: F401

        # Create tables — checkfirst=True makes this idempotent
        await conn.run_sync(
            lambda sync_conn: SQLModel.metadata.create_all(
                sync_conn, checkfirst=True
            )
        )
        logger.info("✅ All application tables created / verified.")


async def get_session() -> AsyncSession:
    """FastAPI dependency — yields an async DB session per request."""
    async with async_session() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
