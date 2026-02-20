#!/usr/bin/env python3
"""
StratAxis Rent Price Intelligence System
Main orchestration script for scraping, normalizing, and aggregating rental data
"""

import os
import sys
import json
import yaml
from datetime import datetime
from typing import List, Dict, Any

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from utils.logger import setup_logger
from scrapers.generic_scraper import GenericPortalScraper
from pipeline.normalizer import Normalizer
from pipeline.deduplicator import Deduplicator
from pipeline.aggregator import Aggregator


class StratAxisRentScraper:
    """Main orchestrator for the rent price intelligence system"""
    
    def __init__(self):
        self.logger = setup_logger("main")
        self.cities = ['douala', 'yaounde']
        
        # Initialize components
        self.normalizer = Normalizer()
        self.deduplicator = Deduplicator()
        self.aggregator = Aggregator()
        
        # Create output directories
        os.makedirs('data/raw', exist_ok=True)
        os.makedirs('data/cleaned', exist_ok=True)
        os.makedirs('data/aggregated', exist_ok=True)
        os.makedirs('outputs', exist_ok=True)
        
        # Load sources
        self.sources = self._load_sources()
    
    def _load_sources(self) -> dict:
        """Load source configurations"""
        with open('config/sources.yaml', 'r', encoding='utf-8') as f:
            return yaml.safe_load(f)
    
    def run(self):
        """Execute the complete pipeline"""
        self.logger.info("=" * 80)
        self.logger.info("STRATAXIS RENT PRICE INTELLIGENCE SYSTEM")
        self.logger.info("Starting execution...")
        self.logger.info("=" * 80)
        
        # Step 1: Scrape all sources
        all_raw_listings = self._scrape_all_sources()
        
        # Step 2: Normalize listings
        normalized_listings = self._normalize_listings(all_raw_listings)
        
        # Step 3: Deduplicate
        unique_listings = self._deduplicate_listings(normalized_listings)
        
        # Step 4: Aggregate
        aggregated_df = self._aggregate_listings(unique_listings)
        
        # Step 5: Export results
        self._export_results(aggregated_df)
        
        self.logger.info("=" * 80)
        self.logger.info("PIPELINE COMPLETED SUCCESSFULLY")
        self.logger.info("=" * 80)
        
        # Print summary
        self._print_summary(all_raw_listings, unique_listings, aggregated_df)
    
    def _scrape_all_sources(self) -> List[Dict[str, Any]]:
        """Scrape all configured sources"""
        self.logger.info("\n" + "=" * 80)
        self.logger.info("PHASE 1: SCRAPING")
        self.logger.info("=" * 80)
        
        all_listings = []
        
        # Scrape portals
        for portal in self.sources.get('portals', []):
            try:
                scraper = GenericPortalScraper(
                    source_name=portal['name'],
                    base_url=portal['url'],
                    city_paths=portal.get('search_params', {})
                )
                
                for city in self.cities:
                    listings = scraper.scrape(city)
                    all_listings.extend(listings)
                    
                    self.logger.info(f"✓ {portal['name']} ({city}): {len(listings)} listings")
                    
            except Exception as e:
                self.logger.error(f"✗ Failed to scrape {portal['name']}: {e}")
        
        # Scrape classifieds
        for classified in self.sources.get('classifieds', []):
            try:
                scraper = GenericPortalScraper(
                    source_name=classified['name'],
                    base_url=classified['url']
                )
                
                for city in self.cities:
                    listings = scraper.scrape(city)
                    all_listings.extend(listings)
                    
                    self.logger.info(f"✓ {classified['name']} ({city}): {len(listings)} listings")
                    
            except Exception as e:
                self.logger.error(f"✗ Failed to scrape {classified['name']}: {e}")
        
        # Scrape agencies
        for agency in self.sources.get('agencies', []):
            try:
                scraper = GenericPortalScraper(
                    source_name=agency['name'],
                    base_url=agency['url']
                )
                
                for city in self.cities:
                    listings = scraper.scrape(city)
                    all_listings.extend(listings)
                    
                    self.logger.info(f"✓ {agency['name']} ({city}): {len(listings)} listings")
                    
            except Exception as e:
                self.logger.error(f"✗ Failed to scrape {agency['name']}: {e}")
        
        # Save raw data
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        raw_file = f"data/raw/raw_listings_{timestamp}.json"
        with open(raw_file, 'w', encoding='utf-8') as f:
            json.dump(all_listings, f, indent=2, ensure_ascii=False)
        
        self.logger.info(f"\nTotal raw listings scraped: {len(all_listings)}")
        self.logger.info(f"Raw data saved to: {raw_file}")
        
        return all_listings
    
    def _normalize_listings(self, raw_listings: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Normalize all listings"""
        self.logger.info("\n" + "=" * 80)
        self.logger.info("PHASE 2: NORMALIZATION")
        self.logger.info("=" * 80)
        
        normalized = []
        
        for listing in raw_listings:
            norm_listing = self.normalizer.normalize_listing(listing)
            if norm_listing:
                normalized.append(norm_listing)
        
        # Save normalized data
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        normalized_file = f"data/cleaned/normalized_listings_{timestamp}.json"
        with open(normalized_file, 'w', encoding='utf-8') as f:
            json.dump(normalized, f, indent=2, ensure_ascii=False)
        
        self.logger.info(f"Normalized: {len(normalized)} / {len(raw_listings)} listings")
        self.logger.info(f"Normalized data saved to: {normalized_file}")
        
        return normalized
    
    def _deduplicate_listings(self, normalized_listings: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Deduplicate listings"""
        self.logger.info("\n" + "=" * 80)
        self.logger.info("PHASE 3: DEDUPLICATION")
        self.logger.info("=" * 80)
        
        unique = self.deduplicator.deduplicate(normalized_listings)
        
        return unique
    
    def _aggregate_listings(self, unique_listings: List[Dict[str, Any]]):
        """Aggregate listings to investor-grade metrics"""
        self.logger.info("\n" + "=" * 80)
        self.logger.info("PHASE 4: AGGREGATION")
        self.logger.info("=" * 80)
        
        aggregated = self.aggregator.aggregate(unique_listings)
        
        return aggregated
    
    def _export_results(self, aggregated_df):
        """Export final results"""
        self.logger.info("\n" + "=" * 80)
        self.logger.info("PHASE 5: EXPORT")
        self.logger.info("=" * 80)
        
        # Export CSV
        csv_path = 'outputs/rental_intelligence.csv'
        self.aggregator.export_csv(aggregated_df, csv_path)
        
        # Export JSON
        json_path = 'outputs/rental_intelligence.json'
        self.aggregator.export_json(aggregated_df, json_path)
        
        self.logger.info(f"\n✓ Final outputs generated:")
        self.logger.info(f"  • CSV: {csv_path}")
        self.logger.info(f"  • JSON: {json_path}")
    
    def _print_summary(self, raw_listings, unique_listings, aggregated_df):
        """Print execution summary"""
        print("\n" + "=" * 80)
        print("EXECUTION SUMMARY")
        print("=" * 80)
        print(f"Raw listings scraped:        {len(raw_listings)}")
        print(f"After normalization:         {len([l for l in raw_listings if l])}")
        print(f"After deduplication:         {len(unique_listings)}")
        print(f"Aggregated groups:           {len(aggregated_df)}")
        
        # Validate unique listings count
        print("\n" + "=" * 80)
        print("REQUIREMENT VALIDATION")
        print("=" * 80)
        
        unique_count = len(unique_listings)
        print(f"✓ Unique listings: {unique_count}")
        if unique_count >= 500:
            print("  ✅ PASSED: ≥500 unique listings requirement")
        else:
            print(f"  ⚠️  WARNING: Only {unique_count} listings (target: ≥500)")
        
        # Check year distribution
        if unique_listings:
            year_counts = {}
            for listing in unique_listings:
                year = listing.get('year')
                if year:
                    year_counts[year] = year_counts.get(year, 0) + 1
            
            recent_count = year_counts.get(2025, 0) + year_counts.get(2026, 0)
            total_with_year = sum(year_counts.values())
            recent_pct = (recent_count / total_with_year * 100) if total_with_year > 0 else 0
            
            print(f"\n✓ Year distribution:")
            for year in sorted(year_counts.keys()):
                count = year_counts[year]
                pct = (count / total_with_year * 100) if total_with_year > 0 else 0
                print(f"  {year}: {count} listings ({pct:.1f}%)")
            
            print(f"\n✓ Recent data (2025-2026): {recent_count} listings ({recent_pct:.1f}%)")
            if recent_pct >= 40:
                print("  ✅ PASSED: ≥40% from 2025-2026")
            else:
                print(f"  ⚠️  WARNING: Only {recent_pct:.1f}% recent (target: ≥40%)")
        
        print("\n" + "=" * 80)
        print("BREAKDOWN BY CITY")
        print("=" * 80)
        
        if not aggregated_df.empty:
            for city in aggregated_df['city'].unique():
                city_data = aggregated_df[aggregated_df['city'] == city]
                print(f"\n{city.title()}:")
                print(f"  • Neighborhoods: {city_data['neighborhood'].nunique()}")
                print(f"  • Housing types: {city_data['housing_type'].nunique()}")
                print(f"  • Year coverage: {city_data['year'].min():.0f} - {city_data['year'].max():.0f}")
                print(f"  • Total data points: {len(city_data)}")
        
        print("\n" + "=" * 80)
        print("DATA CONFIDENCE")
        print("=" * 80)
        if not aggregated_df.empty:
            confidence_counts = aggregated_df['data_confidence'].value_counts()
            for conf, count in confidence_counts.items():
                print(f"  {conf.title()}: {count}")
        
        print("=" * 80 + "\n")


def main():
    """Main entry point"""
    scraper = StratAxisRentScraper()
    scraper.run()


if __name__ == "__main__":
    main()
