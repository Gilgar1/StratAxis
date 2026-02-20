"""
StratAxis - Intelligence Aggregation
Aggregate cleaned data into neighborhood-level intelligence
"""

import pandas as pd
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from config.config import MIN_LISTING_COUNT_PER_NEIGHBORHOOD
from utils.logger import setup_logger


class IntelligenceAggregator:
    """Aggregate data to neighborhood-level intelligence"""
    
    def __init__(self):
        self.logger = setup_logger('IntelligenceAggregator')
    
    def aggregate(self, df_clean: pd.DataFrame) -> pd.DataFrame:
        """
        Aggregate to neighborhood level with statistical metrics
        
        Args:
            df_clean: Cleaned DataFrame
        
        Returns:
            Aggregated DataFrame with neighborhood intelligence
        """
        self.logger.info("Aggregating data to neighborhood level...")
        
        if df_clean.empty:
            self.logger.warning("No data to aggregate")
            return pd.DataFrame()
        
        # Group by city and neighborhood
        agg_df = df_clean.groupby(['city', 'neighborhood_normalized']).agg(
            median_land_price_per_sqm_xaf=('price_per_sqm', 'median'),
            p25_land_price_per_sqm_xaf=('price_per_sqm', lambda x: x.quantile(0.25)),
            p75_land_price_per_sqm_xaf=('price_per_sqm', lambda x: x.quantile(0.75)),
            listing_count=('price_per_sqm', 'count'),
            mean_land_price_per_sqm_xaf=('price_per_sqm', 'mean'),
            std_land_price_per_sqm_xaf=('price_per_sqm', 'std'),
            min_price_per_sqm=('price_per_sqm', 'min'),
            max_price_per_sqm=('price_per_sqm', 'max'),
        ).reset_index()
        
        # Rename neighborhood column
        agg_df = agg_df.rename(columns={'neighborhood_normalized': 'neighborhood'})
        
        # Add data confidence flag
        agg_df['data_confidence_flag'] = agg_df['listing_count'].apply(
            lambda x: 'High' if x >= MIN_LISTING_COUNT_PER_NEIGHBORHOOD * 2 
            else ('Medium' if x >= MIN_LISTING_COUNT_PER_NEIGHBORHOOD else 'Low')
        )
        
        # Round values
        price_columns = [
            'median_land_price_per_sqm_xaf', 
            'p25_land_price_per_sqm_xaf', 
            'p75_land_price_per_sqm_xaf',
            'mean_land_price_per_sqm_xaf',
            'std_land_price_per_sqm_xaf',
            'min_price_per_sqm',
            'max_price_per_sqm'
        ]
        agg_df[price_columns] = agg_df[price_columns].round(0)
        
        # Sort by city and median price
        agg_df = agg_df.sort_values(['city', 'median_land_price_per_sqm_xaf'], ascending=[True, False])
        
        self.logger.info(f"Aggregated to {len(agg_df)} neighborhoods")
        
        # Log summary statistics
        self._log_summary(agg_df)
        
        return agg_df
    
    def _log_summary(self, agg_df: pd.DataFrame):
        """Log summary statistics"""
        self.logger.info("\n" + "="*60)
        self.logger.info("AGGREGATION SUMMARY")
        self.logger.info("="*60)
        
        for city in agg_df['city'].unique():
            city_data = agg_df[agg_df['city'] == city]
            self.logger.info(f"\n{city}:")
            self.logger.info(f"  - Neighborhoods: {len(city_data)}")
            self.logger.info(f"  - Total Listings: {city_data['listing_count'].sum()}")
            self.logger.info(f"  - Median Price Range: {city_data['median_land_price_per_sqm_xaf'].min():.0f} - {city_data['median_land_price_per_sqm_xaf'].max():.0f} XAF/m²")
            
            # Confidence breakdown
            confidence_counts = city_data['data_confidence_flag'].value_counts()
            self.logger.info(f"  - Confidence: High={confidence_counts.get('High', 0)}, Medium={confidence_counts.get('Medium', 0)}, Low={confidence_counts.get('Low', 0)}")
        
        self.logger.info("\n" + "="*60)
    
    def get_top_neighborhoods(self, agg_df: pd.DataFrame, top_n: int = 10) -> pd.DataFrame:
        """
        Get top N most expensive neighborhoods by city
        
        Args:
            agg_df: Aggregated DataFrame
            top_n: Number of top neighborhoods
        
        Returns:
            DataFrame with top neighborhoods
        """
        top_lists = []
        
        for city in agg_df['city'].unique():
            city_data = agg_df[agg_df['city'] == city]
            top_city = city_data.nlargest(top_n, 'median_land_price_per_sqm_xaf')
            top_lists.append(top_city)
        
        return pd.concat(top_lists, ignore_index=True)
