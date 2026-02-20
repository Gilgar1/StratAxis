"""
StratAxis - Data Cleaning & Normalization
"""

import pandas as pd
from typing import List, Dict
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from utils.text_normalizer import PriceNormalizer, LandSizeNormalizer, NeighborhoodNormalizer
from utils.logger import setup_logger


class DataCleaner:
    """Clean and normalize raw scraped data"""
    
    def __init__(self):
        self.logger = setup_logger('DataCleaner')
        self.price_normalizer = PriceNormalizer()
        self.size_normalizer = LandSizeNormalizer()
        self.neighborhood_normalizer = NeighborhoodNormalizer()
    
    def clean(self, raw_listings: List[Dict]) -> pd.DataFrame:
        """
        Clean and normalize raw listings
        
        Args:
            raw_listings: List of raw listing dictionaries
        
        Returns:
            Cleaned DataFrame with normalized values
        """
        self.logger.info(f"Cleaning {len(raw_listings)} raw listings...")
        
        if not raw_listings:
            self.logger.warning("No listings to clean")
            return pd.DataFrame()
        
        # Convert to DataFrame
        df = pd.DataFrame(raw_listings)
        
        initial_count = len(df)
        self.logger.info(f"Initial listings: {initial_count}")
        
        # Normalize prices
        df['price_normalized_xaf'] = df['price_raw'].apply(self.price_normalizer.normalize)
        
        # Normalize land sizes
        df['land_size_normalized_sqm'] = df['land_size_raw'].apply(self.size_normalizer.normalize)
        
        # Normalize neighborhoods
        df['neighborhood_normalized'] = df['neighborhood'].apply(self.neighborhood_normalizer.normalize)
        
        # Remove listings with missing critical data
        df_clean = df.dropna(subset=['price_normalized_xaf', 'land_size_normalized_sqm'])
        
        removed_count = initial_count - len(df_clean)
        self.logger.info(f"Removed {removed_count} listings due to missing/invalid data")
        
        # Calculate price per sqm
        df_clean['price_per_sqm'] = (
            df_clean['price_normalized_xaf'] / df_clean['land_size_normalized_sqm']
        )
        
        # Remove duplicates
        initial_clean_count = len(df_clean)
        df_clean = self._remove_duplicates(df_clean)
        duplicate_count = initial_clean_count - len(df_clean)
        
        self.logger.info(f"Removed {duplicate_count} duplicate listings")
        self.logger.info(f"Final clean listings: {len(df_clean)}")
        
        return df_clean
    
    def _remove_duplicates(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Remove duplicate listings
        
        Duplicates defined as:
        - Same neighborhood
        - Same price
        - Same land size
        
        Args:
            df: DataFrame with cleaned data
        
        Returns:
            DataFrame with duplicates removed
        """
        # Create duplicate detection columns
        df_dedup = df.copy()
        
        # Round values for duplicate detection
        df_dedup['price_rounded'] = df_dedup['price_normalized_xaf'].round(-3)  # Round to nearest 1000
        df_dedup['size_rounded'] = df_dedup['land_size_normalized_sqm'].round(0)
        
        # Remove duplicates
        df_dedup = df_dedup.drop_duplicates(
            subset=['neighborhood_normalized', 'price_rounded', 'size_rounded'],
            keep='first'
        )
        
        # Drop temporary columns
        df_dedup = df_dedup.drop(columns=['price_rounded', 'size_rounded'])
        
        return df_dedup
    
    def remove_outliers(self, df: pd.DataFrame, column: str = 'price_per_sqm', 
                       multiplier: float = 1.5) -> pd.DataFrame:
        """
        Remove outliers using IQR method
        
        Args:
            df: DataFrame
            column: Column to check for outliers
            multiplier: IQR multiplier (default 1.5)
        
        Returns:
            DataFrame with outliers removed
        """
        initial_count = len(df)
        
        Q1 = df[column].quantile(0.25)
        Q3 = df[column].quantile(0.75)
        IQR = Q3 - Q1
        
        lower_bound = Q1 - multiplier * IQR
        upper_bound = Q3 + multiplier * IQR
        
        df_no_outliers = df[(df[column] >= lower_bound) & (df[column] <= upper_bound)]
        
        removed_count = initial_count - len(df_no_outliers)
        self.logger.info(f"Removed {removed_count} outliers (IQR multiplier: {multiplier})")
        
        return df_no_outliers
