"""
Pipeline Scheduler (Blueprint 4.1.1, 4.2.1)

Schedules:
- Scraping pipeline: Daily at 02:00 UTC
- OCR pipeline: Weekly, Sunday at 03:00 UTC
- ETL pipeline: After scraping/OCR completion
"""

import schedule
import time
from datetime import datetime
from sqlmodel import Session

from src.config.database import engine
from src.pipeline.scraper import run_scraping_pipeline
from src.pipeline.ocr_processor import run_ocr_pipeline
from src.pipeline.etl_pipeline import ETLPipeline
from src.utils.logger import logger


def run_complete_data_pipeline():
    """
    Run complete data pipeline: Scraping → OCR → ETL
    
    Called by scheduler or manually
    """
    logger.info("\n" + "="*70)
    logger.info("STARTING COMPLETE DATA PIPELINE")
    logger.info("="*70)
    
    start_time = datetime.utcnow()
    
    with Session(engine) as session:
        try:
            # Step 1: Run scraping pipeline (Blueprint 4.1)
            logger.info("\n>>> STEP 1: SCRAPING PIPELINE")
            scraping_results = run_scraping_pipeline(session)
            scraped_file = scraping_results.get('output_file')
            
            # Step 2: Run OCR pipeline (Blueprint 4.2)
            logger.info("\n>>> STEP 2: OCR PIPELINE")
            ocr_results = run_ocr_pipeline(session)
            ocr_file = ocr_results.get('output_file')
            
            # Step 3: Run ETL pipeline (Blueprint 4.3)
            logger.info("\n>>> STEP 3: ETL PIPELINE")
            etl = ETLPipeline(session)
            
            # Prepare file lists
            scraped_files = [scraped_file] if scraped_file else []
            ocr_files = [ocr_file] if ocr_file else []
            
            etl_results = etl.run(
                scraped_files=scraped_files,
                ocr_files=ocr_files
            )
            
            # Pipeline completed
            execution_time = (datetime.utcnow() - start_time).total_seconds()
            
            logger.info("\n" + "="*70)
            logger.info("COMPLETE DATA PIPELINE FINISHED")
            logger.info("="*70)
            logger.info(f"Execution time: {execution_time:.2f}s")
            logger.info(f"Records scraped: {scraping_results.get('total_records', 0)}")
            logger.info(f"Records from OCR: {ocr_results.get('total_records', 0)}")
            logger.info(f"Records validated: {etl_results.get('validated', 0)}")
            logger.info(f"Records inserted: {etl_results.get('inserted', 0)}")
            logger.info(f"Records updated: {etl_results.get('updated', 0)}")
            logger.info("="*70 + "\n")
            
        except Exception as e:
            logger.error(f"Pipeline failed: {e}", exc_info=True)


def run_daily_scraping():
    """
    Daily scraping job (Blueprint 4.1.1)
    
    Scheduled: Daily at 02:00 UTC
    """
    logger.info("=== DAILY SCRAPING JOB TRIGGERED ===")
    
    with Session(engine) as session:
        try:
            scraping_results = run_scraping_pipeline(session)
            
            # Auto-trigger ETL if scraping successful
            if scraping_results.get('total_records', 0) > 0:
                logger.info("Scraping successful, triggering ETL...")
                
                etl = ETLPipeline(session)
                scraped_file = scraping_results.get('output_file')
                
                etl_results = etl.run(scraped_files=[scraped_file] if scraped_file else [])
                
                logger.info(
                    f"ETL completed: {etl_results.get('inserted', 0)} inserted, "
                    f"{etl_results.get('updated', 0)} updated"
                )
        except Exception as e:
            logger.error(f"Daily scraping job failed: {e}", exc_info=True)


def run_weekly_ocr():
    """
    Weekly OCR job (Blueprint 4.2.1)
    
    Scheduled: Weekly, Sunday at 03:00 UTC
    """
    logger.info("=== WEEKLY OCR JOB TRIGGERED ===")
    
    with Session(engine) as session:
        try:
            ocr_results = run_ocr_pipeline(session)
            
            # Auto-trigger ETL if OCR successful
            if ocr_results.get('total_records', 0) > 0:
                logger.info("OCR successful, triggering ETL...")
                
                etl = ETLPipeline(session)
                ocr_file = ocr_results.get('output_file')
                
                etl_results = etl.run(ocr_files=[ocr_file] if ocr_file else [])
                
                logger.info(
                    f"ETL completed: {etl_results.get('inserted', 0)} inserted, "
                    f"{etl_results.get('updated', 0)} updated"
                )
        except Exception as e:
            logger.error(f"Weekly OCR job failed: {e}", exc_info=True)


def setup_pipeline_scheduler():
    """
    Configure pipeline scheduled jobs (Blueprint 4.1.1, 4.2.1)
    
    Jobs:
    - Daily scraping: 02:00 UTC
    - Weekly OCR: Sunday 03:00 UTC
    
    Call this function at application startup
    """
    logger.info("Setting up pipeline scheduler...")
    
    # Daily scraping (Blueprint 4.1.1)
    schedule.every().day.at("02:00").do(run_daily_scraping)
    
    # Weekly OCR (Blueprint 4.2.1)
    schedule.every().sunday.at("03:00").do(run_weekly_ocr)
    
    logger.info("✅ Pipeline scheduler configured:")
    logger.info("   - Daily scraping: Every day @ 02:00 UTC")
    logger.info("   - Weekly OCR: Sunday @ 03:00 UTC")


def run_scheduler_loop():
    """
    Run the scheduler in a loop
    
    This should be run in a separate thread or process
    """
    logger.info("Starting pipeline scheduler loop...")
    
    while True:
        schedule.run_pending()
        time.sleep(60)  # Check every minute


def run_pipeline_manually(pipeline: str = "complete"):
    """
    Manually trigger a pipeline (for testing or admin control)
    
    Args:
        pipeline: 'scraping', 'ocr', 'etl', or 'complete'
    """
    if pipeline == "scraping":
        logger.info("Manually triggering scraping pipeline...")
        run_daily_scraping()
    elif pipeline == "ocr":
        logger.info("Manually triggering OCR pipeline...")
        run_weekly_ocr()
    elif pipeline == "complete":
        logger.info("Manually triggering complete pipeline...")
        run_complete_data_pipeline()
    elif pipeline == "etl":
        logger.info("Manually triggering ETL pipeline...")
        with Session(engine) as session:
            etl = ETLPipeline(session)
            etl.run()  # Will auto-load latest files
    else:
        logger.error(f"Unknown pipeline: {pipeline}")


if __name__ == "__main__":
    # For testing: run pipelines manually
    print("Running data pipeline manually (for testing)")
    print("=" * 60)
    
    # Run complete pipeline
    run_complete_data_pipeline()
