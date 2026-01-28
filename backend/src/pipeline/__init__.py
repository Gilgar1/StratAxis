"""
Data Engineering Pipeline Package (Blueprint 4)

Exports:
- Scraper components (4.1)
- OCR processor (4.2)
- ETL pipeline (4.3)
- Validation components (4.4)
- Pipeline scheduler
"""

from .scraper import BaseScraper, GenericPropertyScraper, ScraperFactory, run_scraping_pipeline
from .ocr_processor import OCRProcessor, run_ocr_pipeline
from .etl_pipeline import ETLPipeline, DataTransformer
from .validation import SchemaValidator, DataQualityScorer, OutlierDetector
from .scheduler import (
    run_complete_data_pipeline,
    run_daily_scraping,
    run_weekly_ocr,
    setup_pipeline_scheduler,
    run_pipeline_manually
)

__all__ = [
    # Scraping (4.1)
    "BaseScraper",
    "GenericPropertyScraper",
    "ScraperFactory",
    "run_scraping_pipeline",
    
    # OCR (4.2)
    "OCRProcessor",
    "run_ocr_pipeline",
    
    # ETL (4.3)
    "ETLPipeline",
    "DataTransformer",
    
    # Validation (4.4)
    "SchemaValidator",
    "DataQualityScorer",
    "OutlierDetector",
    
    # Scheduler
    "run_complete_data_pipeline",
    "run_daily_scraping",
    "run_weekly_ocr",
    "setup_pipeline_scheduler",
    "run_pipeline_manually"
]
