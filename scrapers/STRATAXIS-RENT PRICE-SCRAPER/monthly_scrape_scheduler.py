#!/usr/bin/env python3
"""
Monthly Scraper with Date-Organized Outputs
Runs the scraper and organizes outputs by month/year
"""

import os
import sys
import shutil
from datetime import datetime, timedelta
from pathlib import Path

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from main import StratAxisRentScraper
from utils.logger import setup_logger


class MonthlyScraperScheduler:
    """Wrapper to run scraper with monthly organization"""
    
    def __init__(self):
        self.logger = setup_logger("monthly_scheduler")
        self.base_dir = Path(__file__).parent
        
    def get_previous_month_info(self):
        """Get previous month's year and month"""
        today = datetime.now()
        # Get first day of current month, then subtract one day to get last day of previous month
        first_day_current_month = today.replace(day=1)
        last_day_previous_month = first_day_current_month - timedelta(days=1)
        
        year = last_day_previous_month.year
        month = last_day_previous_month.month
        month_name = last_day_previous_month.strftime("%B")  # e.g., "January"
        
        return year, month, month_name
    
    def create_monthly_directory(self, year, month_name):
        """Create directory for this month's data"""
        monthly_dir = self.base_dir / "outputs" / "monthly_archives" / str(year) / month_name
        monthly_dir.mkdir(parents=True, exist_ok=True)
        return monthly_dir
    
    def run_monthly_scrape(self):
        """Execute the scraper and organize outputs by month"""
        year, month, month_name = self.get_previous_month_info()
        
        self.logger.info("=" * 80)
        self.logger.info(f"MONTHLY SCHEDULED SCRAPE - {month_name} {year}")
        self.logger.info("=" * 80)
        self.logger.info(f"Target Month: {month_name} {year} (Month #{month})")
        self.logger.info(f"Scrape Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        self.logger.info("=" * 80)
        
        # Run the main scraper
        try:
            scraper = StratAxisRentScraper()
            scraper.run()
            
            # Create monthly archive directory
            monthly_dir = self.create_monthly_directory(year, month_name)
            
            # Copy outputs to monthly archive
            source_csv = self.base_dir / "outputs" / "rental_intelligence.csv"
            source_json = self.base_dir / "outputs" / "rental_intelligence.json"
            
            timestamp = datetime.now().strftime("%Y%m%d")
            dest_csv = monthly_dir / f"rental_intelligence_{year}_{month:02d}_{month_name}_{timestamp}.csv"
            dest_json = monthly_dir / f"rental_intelligence_{year}_{month:02d}_{month_name}_{timestamp}.json"
            
            if source_csv.exists():
                shutil.copy2(source_csv, dest_csv)
                self.logger.info(f"✓ Archived CSV to: {dest_csv}")
            
            if source_json.exists():
                shutil.copy2(source_json, dest_json)
                self.logger.info(f"✓ Archived JSON to: {dest_json}")
            
            # Create a summary file
            summary_file = monthly_dir / f"scrape_summary_{timestamp}.txt"
            with open(summary_file, 'w', encoding='utf-8') as f:
                f.write(f"StratAxis Monthly Scrape Summary\n")
                f.write(f"=" * 60 + "\n\n")
                f.write(f"Target Month: {month_name} {year}\n")
                f.write(f"Scrape Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
                f.write(f"CSV Output: {dest_csv.name}\n")
                f.write(f"JSON Output: {dest_json.name}\n")
                f.write(f"\nStatus: SUCCESS\n")
            
            self.logger.info(f"✓ Created summary: {summary_file}")
            
            self.logger.info("=" * 80)
            self.logger.info("MONTHLY SCRAPE COMPLETED SUCCESSFULLY")
            self.logger.info(f"Data archived to: {monthly_dir}")
            self.logger.info("=" * 80)
            
        except Exception as e:
            self.logger.error(f"ERROR: Monthly scrape failed: {e}")
            raise


def main():
    """Main entry point for scheduled monthly scraping"""
    scheduler = MonthlyScraperScheduler()
    scheduler.run_monthly_scrape()


if __name__ == "__main__":
    main()
