import pandas as pd
import numpy as np
from typing import Tuple, List
from ..utils.logger import setup_logger

class FeatureEngineer:
    def __init__(self):
        self.logger = setup_logger("ml.feature_engineering")

    def engineer_features(self, df: pd.DataFrame) -> pd.DataFrame:
        self.logger.info("Starting feature engineering")
        
        # 1. Handle missing values
        df['bedrooms'] = df.get('bedrooms', 0).fillna(df['bedrooms'].median() if 'bedrooms' in df else 0)
        df['bathrooms'] = df.get('bathrooms', 0).fillna(df['bedrooms'] * 0.75 if 'bedrooms' in df else 0)
        
        # 2. Extract temporal features
        if 'scraped_at' in df:
            df['scraped_at'] = pd.to_datetime(df['scraped_at'])
            df['month'] = df['scraped_at'].dt.month
            df['quarter'] = df['scraped_at'].dt.quarter
            
        # 3. Categorical encoding (one-hot)
        df = pd.get_dummies(df, columns=['city', 'property_type'], prefix=['city', 'type'])
        
        # 4. Derived features
        if 'price' in df and 'size' in df:
            df['price_per_m2'] = df['price'] / df['size']
            
        self.logger.info(f"Feature engineering complete. Shape: {df.shape}")
        return df

    def select_features(self, df: pd.DataFrame, target: str = 'price') -> Tuple[pd.DataFrame, pd.Series]:
        """Separates features and target variable"""
        # Drop columns that are not features
        drop_cols = [target, 'id', 'title', 'description', 'location', 'images', 
                     'data_source_id', 'data_source_record_id', 'created_at', 
                     'updated_at', 'scraped_at', 'price_per_m2']
        
        X = df.drop(columns=[c for c in drop_cols if c in df])
        y = df[target] if target in df else None
        
        return X, y
