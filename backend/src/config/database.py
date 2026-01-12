from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel
from src.config.env import settings

# Create async engine with asyncpg
# Using asyncpg for high performance asynchronous operations
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=True if settings.ENVIRONMENT == "development" else False,
    future=True
)

# Async session factory
async_session = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

async def init_db():
    """Initialize database and extensions."""
    async with engine.begin() as conn:
        # Enable PostGIS extension for geospatial queries
        await conn.execute("CREATE EXTENSION IF NOT EXISTS postgis;")
        # Create all tables defined in SQLModel metadata
        # In production, migrations should be handled by Alembic
        await conn.run_sync(SQLModel.metadata.create_all)

async def get_session() -> AsyncSession:
    """Dependency for obtaining async database session."""
    async with async_session() as session:
        yield session
