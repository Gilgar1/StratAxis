from typing import List, Dict, Any
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import sessionmaker
from ..utils.logger import setup_logger
from ..utils.config import config
import json

class Loader:
    """
    Data Loading Layer (Blueprint 2.3.3.4).
    Handles batch operations for PostgreSQL with upsert logic to prevent duplicates.
    """
    def __init__(self):
        self.logger = setup_logger("etl.loader")
        self.db_url = config.get("database.url")
        self.engine = sa.create_engine(self.db_url)
        self.metadata = sa.MetaData()
        self.properties_table = sa.Table('properties', self.metadata, autoload_with=self.engine)

    def load_batch(self, records: List[Dict[str, Any]]):
        """Perform batch upsert using PostgreSQL ON CONFLICT (Blueprint 2.3.3.4)"""
        if not records:
            return

        self.logger.info(f"Loading/Updating {len(records)} records in database")
        
        # Prepare records for insertion
        clean_records = []
        for r in records:
            clean_records.append({
                "title": r.get("title"),
                "description": r.get("description"),
                "city": r.get("city"),
                "neighborhood": r.get("neighborhood"),
                "property_type": r.get("property_type"),
                "price": r.get("price"),
                "currency": r.get("currency", "XAF"),
                "size": r.get("size"),
                "price_per_m2": r.get("price_per_m2"),
                "bedrooms": r.get("bedrooms"),
                "bathrooms": r.get("bathrooms"),
                "images": json.dumps(r.get("images", [])),
                "data_source_id": r.get("data_source_id"), # UUID
                "data_source_record_id": r.get("source_url"),
                "quality_score": r.get("quality_score", 0.0),
                "validation_status": r.get("validation_status", "pending"),
                "scraped_at": r.get("scraped_at")
            })

        stmt = insert(self.properties_table).values(clean_records)
        
        # Upsert logic based on data_source_record_id (unique source URL)
        update_dict = {
            c.name: c for c in stmt.excluded if c.name not in ['id', 'created_at', 'data_source_record_id', 'data_source_id']
        }
        
        upsert_stmt = stmt.on_conflict_do_update(
            index_elements=['data_source_record_id'],
            set_=update_dict
        )

        with self.engine.begin() as conn:
            try:
                conn.execute(upsert_stmt)
                self.logger.info("Batch load successful")
            except Exception as e:
                self.logger.error(f"Batch load failed: {e}")
                raise
