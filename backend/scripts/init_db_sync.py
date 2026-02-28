import os
import sys

# Add backend directory to sys path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlmodel import SQLModel, create_engine
from src.config.env import settings
from src.models import * # Import all models so they are registered

def init_db():
    sync_url = settings.DATABASE_URL.replace("postgresql+asyncpg", "postgresql")
    print(f"Initializing database synchronously: {sync_url}")
    engine = create_engine(sync_url)
    
    print("Creating all tables from registered models...")
    SQLModel.metadata.create_all(engine)
    print("Tables created successfully.")
    
    engine.dispose()

if __name__ == "__main__":
    init_db()
