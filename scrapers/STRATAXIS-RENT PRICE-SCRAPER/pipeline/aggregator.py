import pandas as pd
import numpy as np
from typing import List, Dict, Any
from utils.logger import setup_logger

class Aggregator:
    """Aggregate listings by city, neighborhood, housing type, and year"""
    
    def __init__(self):
        self.logger = setup_logger("aggregator")
    
    def aggregate(self, listings: List[Dict[str, Any]]) -> pd.DataFrame:
        """
        Aggregate listings to investor-grade metrics
        
        Args:
            listings: List of normalized, deduplicated listings
            
        Returns:
            DataFrame with aggregated metrics
        """
        if not listings:
            self.logger.warning("No listings to aggregate")
            return pd.DataFrame()
        
        self.logger.info(f"Aggregating {len(listings)} listings...")
        
        # Convert to DataFrame
        df = pd.DataFrame(listings)
        
        # Filter out listings without essential data
        df_valid = df[
            df['has_price'] & 
            df['has_housing_type'] & 
            df['has_date']
        ].copy()
        
        self.logger.info(f"{len(df_valid)} listings have complete essential data")
        
        if df_valid.empty:
            return pd.DataFrame()
        
        # Remove outliers using IQR method
        df_clean = self._remove_outliers(df_valid)
        
        # Group by dimensions
        groupby_cols = ['city', 'neighborhood', 'housing_type', 'year']
        
        # Aggregate metrics
        aggregated = df_clean.groupby(groupby_cols).agg({
            'monthly_rent_xaf': [
                ('median_monthly_rent_xaf', 'median'),
                ('p25_monthly_rent_xaf', lambda x: x.quantile(0.25)),
                ('p75_monthly_rent_xaf', lambda x: x.quantile(0.75)),
                ('mean_monthly_rent_xaf', 'mean'),
                ('std_monthly_rent_xaf', 'std'),
            ],
            'rent_per_sqm': [
                ('median_rent_per_sqm', 'median'),
            ],
            'listing_url': [
                ('listing_count', 'count'),
            ],
        }).reset_index()
        
        # Flatten column names
        aggregated.columns = [
            col[0] if col[1] == '' else col[1] 
            for col in aggregated.columns
        ]
        
        # Calculate volatility score (coefficient of variation)
        aggregated['rent_volatility_score'] = (
            aggregated['std_monthly_rent_xaf'] / aggregated['mean_monthly_rent_xaf']
        ).fillna(0)
        
        # Calculate data confidence flag
        aggregated['data_confidence'] = aggregated.apply(
            self._calculate_confidence, axis=1
        )
        
        # Drop intermediate columns
        aggregated = aggregated.drop(columns=['mean_monthly_rent_xaf', 'std_monthly_rent_xaf'])
        
        # Sort by city, year, neighborhood
        aggregated = aggregated.sort_values(['city', 'year', 'neighborhood', 'housing_type'])
        
        self.logger.info(f"Aggregated to {len(aggregated)} unique (city, neighborhood, type, year) groups")
        
        return aggregated
    
    def _remove_outliers(self, df: pd.DataFrame) -> pd.DataFrame:
        """Remove outliers using IQR method per housing type"""
        df_clean = pd.DataFrame()
        
        for housing_type in df['housing_type'].unique():
            subset = df[df['housing_type'] == housing_type].copy()
            
            if len(subset) < 4:  # Need at least 4 data points
                df_clean = pd.concat([df_clean, subset])
                continue
            
            # Calculate IQR
            Q1 = subset['monthly_rent_xaf'].quantile(0.25)
            Q3 = subset['monthly_rent_xaf'].quantile(0.75)
            IQR = Q3 - Q1
            
            # Define outlier bounds
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR
            
            # Filter outliers
            subset_clean = subset[
                (subset['monthly_rent_xaf'] >= lower_bound) &
                (subset['monthly_rent_xaf'] <= upper_bound)
            ]
            
            outliers_removed = len(subset) - len(subset_clean)
            if outliers_removed > 0:
                self.logger.info(f"Removed {outliers_removed} outliers from {housing_type}")
            
            df_clean = pd.concat([df_clean, subset_clean])
        
        return df_clean
    
    def _calculate_confidence(self, row) -> str:
        """
        Calculate data confidence flag based on listing count and volatility
        
        Returns: 'high', 'medium', 'low'
        """
        count = row['listing_count']
        volatility = row['rent_volatility_score']
        
        if count >= 10 and volatility < 0.3:
            return 'high'
        elif count >= 5 and volatility < 0.5:
            return 'medium'
        else:
            return 'low'
    
    def export_csv(self, df: pd.DataFrame, filepath: str):
        """Export to CSV"""
        df.to_csv(filepath, index=False, encoding='utf-8-sig')
        self.logger.info(f"Exported CSV to {filepath}")
    
    def export_json(self, df: pd.DataFrame, filepath: str):
        """Export to hierarchical JSON"""
        # Build hierarchical structure
        result = {}
        
        for _, row in df.iterrows():
            city = row['city']
            neighborhood = row['neighborhood']
            housing_type = row['housing_type']
            year = int(row['year'])
            
            # Initialize nested structure
            if city not in result:
                result[city] = {}
            if neighborhood not in result[city]:
                result[city][neighborhood] = {}
            if housing_type not in result[city][neighborhood]:
                result[city][neighborhood][housing_type] = {}
            
            # Add year data
            result[city][neighborhood][housing_type][year] = {
                'median_monthly_rent_xaf': float(row['median_monthly_rent_xaf']) if pd.notna(row['median_monthly_rent_xaf']) else None,
                'p25_monthly_rent_xaf': float(row['p25_monthly_rent_xaf']) if pd.notna(row['p25_monthly_rent_xaf']) else None,
                'p75_monthly_rent_xaf': float(row['p75_monthly_rent_xaf']) if pd.notna(row['p75_monthly_rent_xaf']) else None,
                'median_rent_per_sqm': float(row['median_rent_per_sqm']) if pd.notna(row['median_rent_per_sqm']) else None,
                'listing_count': int(row['listing_count']),
                'rent_volatility_score': float(row['rent_volatility_score']) if pd.notna(row['rent_volatility_score']) else None,
                'data_confidence': row['data_confidence'],
            }
        
        # Write to file
        import json
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(result, f, indent=2, ensure_ascii=False)
        
        self.logger.info(f"Exported JSON to {filepath}")
