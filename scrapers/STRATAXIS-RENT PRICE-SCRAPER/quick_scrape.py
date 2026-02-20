#!/usr/bin/env python3
"""Quick scraper to get immediate results from top sources"""

import json
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from scrapers.generic_scraper import GenericPortalScraper
from pipeline.normalizer import Normalizer
from pipeline.deduplicator import Deduplicator
from pipeline.aggregator import Aggregator
from utils.logger import setup_logger

def quick_scrape():
    """Quick scrape of most productive sources"""
    logger = setup_logger("quick_scrape")
    
    logger.info("="*80)
    logger.info("QUICK SCRAPE - Top Sources Only")
    logger.info("="*80)
    
    cities = ['douala', 'yaounde']
    all_listings = []
    
    # Top sources that work
    sources = [
        ("Mapiole", "https://www.mapiole.com/"),
        ("ADPM Real Estate", "https://adpmrealestate.com/"),
        ("Coin Afrique", "https://cm.coinafrique.com/categorie/immobilier"),
        ("HomeCM", "https://www.homecm.online/"),
    ]
    
    for source_name, url in sources:
        try:
            scraper = GenericPortalScraper(source_name, url)
            for city in cities:
                listings = scraper.scrape(city)
                all_listings.extend(listings)
                logger.info(f"✓ {source_name} ({city}): {len(listings)} listings")
        except Exception as e:
            logger.error(f"✗ {source_name}: {e}")
    
    logger.info(f"\nTotal scraped: {len(all_listings)} listings")
    
    # Save raw data
    os.makedirs('data/raw', exist_ok=True)
    with open('data/raw/quick_scrape_raw.json', 'w', encoding='utf-8') as f:
        json.dump(all_listings, f, indent=2, ensure_ascii=False)
    logger.info(f"Saved raw data: data/raw/quick_scrape_raw.json")
    
    # Normalize
    logger.info("\nNormalizing...")
    normalizer = Normalizer()
    normalized = [normalizer.normalize_listing(l) for l in all_listings]
    normalized = [l for l in normalized if l]
    
    # Deduplicate
    logger.info("Deduplicating...")
    deduplicator = Deduplicator()
    unique = deduplicator.deduplicate(normalized)
    
    # Aggregate
    logger.info("Aggregating...")
    aggregator = Aggregator()
    df = aggregator.aggregate(unique)
    
    # Export
    os.makedirs('outputs', exist_ok=True)
    aggregator.export_csv(df, 'outputs/rental_intelligence.csv')
    aggregator.export_json(df, 'outputs/rental_intelligence.json')
    
    logger.info("\n" + "="*80)
    logger.info(f"COMPLETE! {len(unique)} unique listings")
    logger.info(f"CSV: outputs/rental_intelligence.csv")
    logger.info(f"JSON: outputs/rental_intelligence.json")
    logger.info("="*80)
    
    return unique, df

if __name__ == "__main__":
    unique, df = quick_scrape()
