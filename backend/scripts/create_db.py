import asyncio
import os
import sys

# Add backend directory to sys path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlmodel import SQLModel
from sqlalchemy.ext.asyncio import create_async_engine
from src.config.env import settings
from src.models import * # import all models so that they are registered

async def init_db():
    print(f"Initializing database using connection string: {settings.DATABASE_URL}")
    engine = create_async_engine(settings.DATABASE_URL)
    
    async with engine.begin() as conn:
        print("Creating all tables from registered models...")
        await conn.run_sync(SQLModel.metadata.create_all)
        print("Tables created successfully.")
    
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(init_db())
