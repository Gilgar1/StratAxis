"""
StratAxis - Demo Pipeline (using sample data)
Demonstrates full cleaning, normalization, and aggregation
"""

import sys
import json
from pathlib import Path
import pandas as pd
from datetime import datetime

sys.path.append(str(Path(__file__).resolve().parent))

from config.config import OUTPUT_CSV, OUTPUT_JSON, OUTPUT_RAW_CSV, IQR_MULTIPLIER
from processors.data_cleaner import DataCleaner
from aggregators.intelligence_aggregator import IntelligenceAggregator
from utils.logger import setup_logger


def main():
    logger = setup_logger('DemoPipeline')
    
    logger.info("="*80)
    logger.info("STRATAXIS LAND PRICE INTELLIGENCE - DEMO WITH SAMPLE DATA")
    logger.info("="*80)
    
    # Step 1: Load sample data
    logger.info("\nSTEP 1: LOADING SAMPLE DATA")
    logger.info("-"*80)
    
    with open('data/sample_raw_listings.json', 'r', encoding='utf-8') as f:
        raw_listings = json.load(f)
    
    logger.info(f"Loaded {len(raw_listings)} sample raw listings")
    
    # Step 2: Clean and normalize
    logger.info("\nSTEP 2: CLEANING & NORMALIZING DATA")
    logger.info("-"*80)
    cleaner = DataCleaner()
    clean_df = cleaner.clean(raw_listings)
    
    if clean_df.empty:
        logger.error("No valid data after cleaning")
        return
    
    # Save raw cleaned data
    clean_df.to_csv(OUTPUT_RAW_CSV, index=False, encoding='utf-8')
    logger.info(f"✅ Raw cleaned data saved: {OUTPUT_RAW_CSV}")
    
    # Step 3: Remove outliers
    logger.info("\nSTEP 3: REMOVING OUTLIERS")
    logger.info("-"*80)
    clean_df = cleaner.remove_outliers(clean_df, multiplier=IQR_MULTIPLIER)
    
    # Step 4: Aggregate
    logger.info("\nSTEP 4: AGGREGATING TO NEIGHBORHOOD INTELLIGENCE")
    logger.info("-"*80)
    aggregator = IntelligenceAggregator() 
    intelligence_df = aggregator.aggregate(clean_df)
    
    if intelligence_df.empty:
        logger.error("No data after aggregation")
        return
    
    # Step 5: Export
    logger.info("\nSTEP 5: EXPORTING RESULTS")
    logger.info("-"*80)
    
    # Select core columns
    output_columns = [
        'city',
        'neighborhood',
        'median_land_price_per_sqm_xaf',
        'p25_land_price_per_sqm_xaf',
        'p75_land_price_per_sqm_xaf',
        'listing_count',
        'data_confidence_flag'
    ]
    
    export_df = intelligence_df[output_columns].copy()
    
    # Export CSV
    export_df.to_csv(OUTPUT_CSV, index=False, encoding='utf-8')
    logger.info(f"✅ Intelligence CSV: {OUTPUT_CSV}")
    
    # Export JSON
    json_data = {
        'metadata': {
            'generated_at': datetime.now().isoformat(),
            'total_neighborhoods': len(export_df),
            'cities': ['Douala', 'Yaoundé'],
            'total_listings_analyzed': int(export_df['listing_count'].sum()),
            'data_source': 'Sample data (demonstration)'
        },
        'neighborhoods': export_df.to_dict(orient='records')
    }
    
    with open(OUTPUT_JSON, 'w', encoding='utf-8') as f:
        json.dump(json_data, f, indent=2, ensure_ascii=False)
    
    logger.info(f"✅ Intelligence JSON: {OUTPUT_JSON}")
    
    # Print summary
    logger.info("\n" + "="*80)
    logger.info("PIPELINE SUMMARY")
    logger.info("="*80)
    logger.info(f"\n📊 Total Raw Listings: {len(raw_listings)}")
    logger.info(f"✅ Valid After Cleaning: {len(clean_df)}")
    logger.info(f"🏘️  Neighborhoods Analyzed: {len(intelligence_df)}")
    logger.info(f"📈 Total Listings in Final Output: {export_df['listing_count'].sum()}")
    
    # Show top 5 most expensive per city
    for city in ['Douala', 'Yaoundé']:
        city_data = export_df[export_df['city'] == city]
        logger.info(f"\n🏆 Top 5 Most Expensive - {city}:")
        top5 = city_data.nlargest(5, 'median_land_price_per_sqm_xaf')
        for idx, row in top5.iterrows():
            logger.info(f"   {row['neighborhood']:20s} {row['median_land_price_per_sqm_xaf']:>10,.0f} XAF/m² ({row['listing_count']} listings)")
    
    logger.info("\n" + "="*80)
    logger.info("✅ DEMO PIPELINE COMPLETED SUCCESSFULLY")
    logger.info("="*80)
    logger.info(f"\n📁 Output files:")
    logger.info(f"   - {OUTPUT_CSV}")
    logger.info(f"   - {OUTPUT_JSON}")
    logger.info(f"   - {OUTPUT_RAW_CSV}")


if __name__ == "__main__":
    main()
