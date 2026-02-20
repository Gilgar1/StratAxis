"""
StratAxis - Land Price Intelligence Pipeline
Main Orchestration Script
"""

import sys
from pathlib import Path
import pandas as pd
import json
from datetime import datetime
from tqdm import tqdm

# Add project root to path
sys.path.append(str(Path(__file__).resolve().parent))

from config.config import (
    TARGET_WEBSITES, OUTPUT_CSV, OUTPUT_JSON, OUTPUT_RAW_CSV, 
    IQR_MULTIPLIER, TARGET_CITIES
)
from scrapers.mapiole_scraper import MapioleScraper
from scrapers.generic_scraper import GenericScraper
from processors.data_cleaner import DataCleaner
from aggregators.intelligence_aggregator import IntelligenceAggregator
from utils.logger import setup_logger


class StratAxisPipeline:
    """Main pipeline orchestrator"""
    
    def __init__(self):
        self.logger = setup_logger('StratAxisPipeline')
        self.raw_listings = []
        self.clean_df = None
        self.intelligence_df = None
    
    def run(self):
        """Execute full pipeline"""
        self.logger.info("="*80)
        self.logger.info("STRATAXIS LAND PRICE INTELLIGENCE PIPELINE")
        self.logger.info("="*80)
        
        # Step 1: Scrape
        self._scrape_all_websites()
        if not self.raw_listings:
            self.logger.error("No data scraped.")
            return
        
        # Step 2: Clean
        cleaner = DataCleaner()
        self.clean_df = cleaner.clean(self.raw_listings)
        if self.clean_df.empty:
            return
        
        self.clean_df.to_csv(OUTPUT_RAW_CSV, index=False, encoding='utf-8')
        
        # Step 3: Remove outliers
        self.clean_df = cleaner.remove_outliers(self.clean_df, multiplier=IQR_MULTIPLIER)
        
        # Step 4: Aggregate
        aggregator = IntelligenceAggregator()
        self.intelligence_df = aggregator.aggregate(self.clean_df)
        
        # Step 5: Export
        self._export_results()
        self.logger.info("PIPELINE COMPLETED")
    
    def _scrape_all_websites(self):
        """Scrape all enabled websites"""
        enabled_sites = [site for site in TARGET_WEBSITES if site['enabled']]
        
        for site in tqdm(enabled_sites):
            try:
                if site['name'] == 'mapiole':
                    scraper = MapioleScraper()
                else:
                    scraper = GenericScraper(site['name'], site['url'])
                
                listings = scraper.scrape()
                self.raw_listings.extend(listings)
                scraper.cleanup()
            except Exception as e:
                self.logger.error(f"Error scraping {site['name']}: {e}")
    
    def _export_results(self):
        """Export to CSV and JSON"""
        output_cols = [
            'city', 'neighborhood', 'median_land_price_per_sqm_xaf',
            'p25_land_price_per_sqm_xaf', 'p75_land_price_per_sqm_xaf',
            'listing_count', 'data_confidence_flag'
        ]
        
        export_df = self.intelligence_df[output_cols].copy()
        export_df.to_csv(OUTPUT_CSV, index=False, encoding='utf-8')
        
        json_data = {
            'metadata': {
                'generated_at': datetime.now().isoformat(),
                'total_neighborhoods': len(export_df)
            },
            'neighborhoods': export_df.to_dict(orient='records')
        }
        
        with open(OUTPUT_JSON, 'w', encoding='utf-8') as f:
            json.dump(json_data, f, indent=2, ensure_ascii=False)


def main():
    pipeline = StratAxisPipeline()
    pipeline.run()


if __name__ == "__main__":
    main()
