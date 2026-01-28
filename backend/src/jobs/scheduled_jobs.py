"""
Scheduled jobs for data versioning and maintenance (Blueprint 3.3.3)

Handles:
- Monthly listing aggregation (1st of each month)
- Property history cleanup
- Model archival
"""

import schedule
import time
from datetime import datetime
from sqlmodel import Session

from src.config.database import engine
from src.services.listing_retention import ListingRetentionService
from src.utils.logger import logger


def run_monthly_listing_aggregation():
    """
    Scheduled job: Monthly listing aggregation (Blueprint 3.3.3.2)
    
    Should run on the 1st of each month at 02:00 UTC
    Creates aggregates for the previous month
    Cleans up aggregates older than 24 months
    """
    logger.info("=== STARTING MONTHLY LISTING AGGREGATION JOB ===")
    
    try:
        with Session(engine) as session:
            service = ListingRetentionService(session)
            result = service.schedule_monthly_aggregation()
            
            if result["status"] == "success":
                logger.info(
                    f"✅ Monthly aggregation completed successfully:\n"
                    f"   - Aggregates created: {result['aggregates_created']}\n"
                    f"   - Old listings deleted: {result['listings_deleted']}\n"
                    f"   - Execution time: {result['execution_time_seconds']}s"
                )
            else:
                logger.error(
                    f"❌ Monthly aggregation failed: {result.get('error', 'Unknown error')}"
                )
                
    except Exception as e:
        logger.error(f"❌ Monthly aggregation job crashed: {e}", exc_info=True)
    
    logger.info("=== MONTHLY LISTING AGGREGATION JOB COMPLETED ===\n")


def setup_scheduled_jobs():
    """
    Configure all scheduled jobs (Blueprint 3.3.3)
    
    Jobs:
    - Monthly listing aggregation: 1st of month at 02:00 UTC
    
    Call this function at application startup
    """
    logger.info("Setting up scheduled jobs...")
    
    # Monthly listing aggregation (Blueprint 3.3.3.2)
    # Run on 1st of each month at 02:00 UTC
    schedule.every().month.at("02:00").do(run_monthly_listing_aggregation)
    
    # Also run weekly for testing/backup (optional)
    # schedule.every().sunday.at("03:00").do(run_monthly_listing_aggregation)
    
    logger.info("✅ Scheduled jobs configured:")
    logger.info("   - Monthly listing aggregation: 1st of month @ 02:00 UTC")


def run_scheduler_loop():
    """
    Run the scheduler in a loop
    
    This should be run in a separate thread or process
    """
    logger.info("Starting scheduler loop...")
    
    while True:
        schedule.run_pending()
        time.sleep(60)  # Check every minute


def run_job_manually(job_name: str):
    """
    Manually trigger a scheduled job (for testing or admin control)
    
    Args:
        job_name: Name of job to run ('listing_aggregation')
    """
    if job_name == "listing_aggregation":
        logger.info("Manually triggering monthly listing aggregation...")
        run_monthly_listing_aggregation()
    else:
        logger.error(f"Unknown job name: {job_name}")


if __name__ == "__main__":
    # For testing: run jobs manually
    print("Running scheduled jobs manually (for testing)")
    print("=" * 60)
    
    # Run monthly aggregation
    run_monthly_listing_aggregation()
