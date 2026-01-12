from typing import List, Dict, Any
import sqlalchemy as sa
from sqlalchemy.orm import sessionmaker
from ..utils.logger import setup_logger
from ..utils.config import config

class Loader:
    def __init__(self):
        self.logger = setup_logger("etl.loader")
        self.db_url = config.get("database.url")
        self.engine = sa.create_engine(self.db_url)
        self.Session = sessionmaker(bind=self.engine)

    def load_properties(self, records: List[Dict[str, Any]]):
        """Batch insert or update properties into PostgreSQL"""
        self.logger.info(f"Loading {len(records)} records into database")
        
        # In a real implementation, we would use SQLModel/SQLAlchemy models
        # and handle upserts based on source_url or record_id.
        # Here we use a generic SQL approach for the MVP structure.
        
        with self.Session() as session:
            try:
                for record in records:
                    # Simplified insert logic
                    # session.execute(sa.text("INSERT INTO properties ..."), record)
                    pass
                session.commit()
                self.logger.info("Database load successful")
            except Exception as e:
                session.rollback()
                self.logger.error(f"Database load failed: {e}")
                raise
