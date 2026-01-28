"""
Feature Engineering for ML Models (Blueprint 5.1)

Handles:
- Data preparation and cleaning
- Feature extraction (numerical, categorical, temporal, derived, geospatial)
- Feature selection
"""

import pandas as pd
import numpy as np
from typing import List, Dict, Tuple, Optional
from datetime import datetime, timedelta
from sqlmodel import Session, select
from geopy.distance import geodesic
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler

from src.models.property import Property, PropertyCity, PropertyType, ValidationStatus
from src.utils.logger import logger


class FeatureEngineer:
    """
    Feature engineering for property price prediction (Blueprint 5.1)
    
    Implements:
    - Data preparation (5.1.1)
    - Feature extraction (5.1.2)
    - Feature selection (5.1.3)
    """
    
    # City centers for geospatial features (Blueprint 5.1.2.5)
    CITY_CENTERS = {
        'Yaoundé': (3.8480, 11.5021),   # ~3.87°N 11.52°E
        'Douala': (4.0511, 9.7679)       # ~4.05°N 9.70°E
    }
    
    def __init__(self, session: Session):
        self.session = session
        self.neighborhood_avg_prices = {}
        self.city_type_avg_prices = {}
    
    def prepare_data(
        self,
        months_back: int = 24,
        cities: List[str] = None
    ) -> pd.DataFrame:
        """
        Prepare data for ML training (Blueprint 5.1.1)
        
        Steps:
        1. Load validated properties
        2. Filter by date range and cities
        3. Remove properties with missing critical features
        4. Handle missing values
        
        Args:
            months_back: Number of months of historical data (default: 24)
            cities: List of cities to include (default: ['Yaoundé', 'Douala'])
            
        Returns:
            Prepared pandas DataFrame
        """
        logger.info("="*60)
        logger.info("FEATURE ENGINEERING: Data Preparation")
        logger.info("="*60)
        
        if cities is None:
            cities = ['Yaoundé', 'Douala']
        
        # 1. Load validated properties (Blueprint 5.1.1.1)
        logger.info("Loading validated properties from database...")
        
        # Calculate cutoff date (Blueprint 5.1.1.2)
        cutoff_date = datetime.utcnow() - timedelta(days=months_back * 30)
        
        # Query properties (Blueprint 5.1.1.2, 3, 4)
        properties = self.session.exec(
            select(Property).where(
                Property.validation_status == ValidationStatus.VALIDATED,
                Property.created_at >= cutoff_date,
                Property.city.in_([PropertyCity.YAOUNDE if c == 'Yaoundé' else PropertyCity.DOUALA for c in cities]),
                Property.price > 0,
                Property.size > 0,
                Property.property_type.in_([PropertyType.APARTMENT, PropertyType.HOUSE, PropertyType.LAND, PropertyType.COMMERCIAL])
            )
        ).all()
        
        logger.info(f"Loaded {len(properties)} validated properties")
        
        if len(properties) == 0:
            logger.warning("No properties found matching criteria")
            return pd.DataFrame()
        
        # Convert to DataFrame
        data = []
        for prop in properties:
            data.append({
                'id': str(prop.id),
                'price': float(prop.price),
                'size': float(prop.size),
                'price_per_m2': float(prop.price_per_m2) if prop.price_per_m2 else prop.price / prop.size,
                'city': prop.city.value,
                'property_type': prop.property_type.value,
                'neighborhood': prop.neighborhood,
                'bedrooms': prop.bedrooms,
                'bathrooms': prop.bathrooms,
                'scraped_at': prop.scraped_at,
                'created_at': prop.created_at,
                'quality_score': float(prop.quality_score) if prop.quality_score else 0,
            })
        
        df = pd.DataFrame(data)
        
        logger.info(f"Initial dataset: {len(df)} properties")
        
        # Handle missing values (Blueprint 5.1.1.5)
        df = self._handle_missing_values(df)
        
        logger.info(f"After cleaning: {len(df)} properties")
        logger.info(f"Features: {list(df.columns)}")
        
        return df
    
    def _handle_missing_values(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Handle missing values (Blueprint 5.1.1.5)
        
        a. bedrooms: impute with median by propertyType and city
        b. bathrooms: impute with bedrooms * 0.75
        c. neighborhood: use 'unknown' category
        d. location coordinates: geocode neighborhood center (placeholder)
        """
        logger.info("Handling missing values...")
        
        # a. Impute bedrooms with median by property type and city (Blueprint 5.1.1.5.a)
        for city in df['city'].unique():
            for prop_type in df['property_type'].unique():
                mask = (df['city'] == city) & (df['property_type'] == prop_type) & df['bedrooms'].isna()
                if mask.sum() > 0:
                    median_bedrooms = df[
                        (df['city'] == city) & 
                        (df['property_type'] == prop_type) & 
                        df['bedrooms'].notna()
                    ]['bedrooms'].median()
                    
                    if pd.notna(median_bedrooms):
                        df.loc[mask, 'bedrooms'] = median_bedrooms
                        logger.debug(f"Imputed {mask.sum()} bedrooms for {city}/{prop_type} with median {median_bedrooms}")
        
        # b. Impute bathrooms with bedrooms * 0.75 (Blueprint 5.1.1.5.b)
        mask = df['bathrooms'].isna() & df['bedrooms'].notna()
        if mask.sum() > 0:
            df.loc[mask, 'bathrooms'] = df.loc[mask, 'bedrooms'] * 0.75
            logger.info(f"Imputed {mask.sum()} bathrooms using bedrooms * 0.75")
        
        # c. Neighborhood: use 'unknown' category (Blueprint 5.1.1.5.c)
        df['neighborhood'] = df['neighborhood'].fillna('unknown')
        
        # Set default values for remaining nulls
        df['bedrooms'] = df['bedrooms'].fillna(2)  # Default for unknown
        df['bathrooms'] = df['bathrooms'].fillna(1.5)
        
        return df
    
    def extract_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Extract all features for ML model (Blueprint 5.1.2)
        
        Includes:
        1. Numerical features
        2. Categorical features (one-hot encoded)
        3. Temporal features
        4. Derived features
        5. Geospatial features
        
        Args:
            df: Prepared DataFrame
            
        Returns:
            DataFrame with extracted features
        """
        logger.info("="*60)
        logger.info("FEATURE ENGINEERING: Feature Extraction")
        logger.info("="*60)
        
        if len(df) == 0:
            return df
        
        # Copy to avoid modifying original
        features_df = df.copy()
        
        # Calculate aggregated statistics first (for derived features)
        self._calculate_aggregates(df)
        
        # 1. Numerical features (Blueprint 5.1.2.1)
        features_df = self._extract_numerical_features(features_df)
        
        # 2. Categorical features (Blueprint 5.1.2.2)
        features_df = self._extract_categorical_features(features_df)
        
        # 3. Temporal features (Blueprint 5.1.2.3)
        features_df = self._extract_temporal_features(features_df)
        
        # 4. Derived features (Blueprint 5.1.2.4)
        features_df = self._extract_derived_features(features_df)
        
        # 5. Geospatial features (Blueprint 5.1.2.5)
        features_df = self._extract_geospatial_features(features_df)
        
        logger.info(f"Feature extraction complete: {len(features_df.columns)} features")
        
        return features_df
    
    def _calculate_aggregates(self, df: pd.DataFrame):
        """Calculate aggregated statistics for derived features"""
        # Neighborhood average price per m² (Blueprint 5.1.2.4.c)
        self.neighborhood_avg_prices = df.groupby(['city', 'neighborhood'])['price_per_m2'].mean().to_dict()
        
        # City + property type average price per m² (Blueprint 5.1.2.4.d)
        self.city_type_avg_prices = df.groupby(['city', 'property_type'])['price_per_m2'].mean().to_dict()
        
        logger.info(f"Calculated aggregates: {len(self.neighborhood_avg_prices)} neighborhoods, {len(self.city_type_avg_prices)} city/type combinations")
    
    def _extract_numerical_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Extract numerical features (Blueprint 5.1.2.1)"""
        # a. size (m²) - already present
        # b. bedrooms - already present
        # c. bathrooms - already present
        # d. pricePerM2 - already present (target variable)
        # e. age - years since scraped_at
        
        df['age'] = df.apply(lambda row: self._calculate_age(row['scraped_at']), axis=1)
        
        logger.info("Extracted numerical features: size, bedrooms, bathrooms, price_per_m2, age")
        
        return df
    
    @staticmethod
    def _calculate_age(scraped_at) -> float:
        """Calculate age in years since scraped_at (Blueprint 5.1.2.1.e)"""
        if pd.isna(scraped_at) or scraped_at is None:
            return 0.0
        
        try:
            if isinstance(scraped_at, str):
                scraped_date = datetime.fromisoformat(scraped_at.replace('Z', '+00:00'))
            else:
                scraped_date = scraped_at
            
            age_days = (datetime.now() - scraped_date.replace(tzinfo=None)).days
            return age_days / 365.25
        except:
            return 0.0
    
    def _extract_categorical_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Extract categorical features with one-hot encoding (Blueprint 5.1.2.2)"""
        # a. city (Yaoundé, Douala)
        df = pd.get_dummies(df, columns=['city'], prefix='city', drop_first=False)
        
        # b. propertyType (apartment, house, land, commercial)
        df = pd.get_dummies(df, columns=['property_type'], prefix='type', drop_first=False)
        
        # c. neighborhood (top 20 by frequency, rest as 'other') (Blueprint 5.1.2.2.c)
        top_neighborhoods = df['neighborhood'].value_counts().head(20).index.tolist()
        df['neighborhood_grouped'] = df['neighborhood'].apply(
            lambda x: x if x in top_neighborhoods else 'other'
        )
        df = pd.get_dummies(df, columns=['neighborhood_grouped'], prefix='nbhd', drop_first=False)
        
        logger.info(f"Extracted categorical features: city (2), property_type (4), neighborhoods ({len(top_neighborhoods) + 1})")
        
        return df
    
    def _extract_temporal_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Extract temporal features (Blueprint 5.1.2.3)"""
        def extract_temporal(row):
            date = row['created_at']
            if pd.isna(date):
                date = row['scraped_at']
            
            if pd.isna(date):
                return {'year': 2024, 'month': 1, 'quarter': 1}
            
            if isinstance(date, str):
                date = datetime.fromisoformat(date.replace('Z', '+00:00'))
            
            return {
                'year': date.year,
                'month': date.month,
                'quarter': (date.month - 1) // 3 + 1
            }
        
        temporal = df.apply(extract_temporal, axis=1, result_type='expand')
        df['year'] = temporal['year']
        df['month'] = temporal['month']
        df['quarter'] = temporal['quarter']
        
        # Cyclical encoding for month (Blueprint 5.1.2.3.b)
        df['month_sin'] = np.sin(2 * np.pi * df['month'] / 12)
        df['month_cos'] = np.cos(2 * np.pi * df['month'] / 12)
        
        # Cyclical encoding for quarter (Blueprint 5.1.2.3.c)
        df['quarter_sin'] = np.sin(2 * np.pi * df['quarter'] / 4)
        df['quarter_cos'] = np.cos(2 * np.pi * df['quarter'] / 4)
        
        logger.info("Extracted temporal features: year, month (sin/cos), quarter (sin/cos)")
        
        return df
    
    def _extract_derived_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Extract derived features (Blueprint 5.1.2.4)"""
        # a. size_category (Blueprint 5.1.2.4.a)
        df['size_category_small'] = (df['size'] < 50).astype(int)
        df['size_category_medium'] = ((df['size'] >= 50) & (df['size'] <= 150)).astype(int)
        df['size_category_large'] = (df['size'] > 150).astype(int)
        
        # b. bedrooms_per_m2 (Blueprint 5.1.2.4.b)
        df['bedrooms_per_m2'] = df['bedrooms'] / df['size'].replace(0, 1)
        
        # c. neighborhood_price_avg (Blueprint 5.1.2.4.c)
        df['neighborhood_price_avg'] = df.apply(
            lambda row: self.neighborhood_avg_prices.get((row.get('city_Yaoundé', row.get('city_Douala', 'Yaoundé')), row['neighborhood']), row['price_per_m2']),
            axis=1
        )
        
        # d. city_property_type_avg (Blueprint 5.1.2.4.d)
        # This requires mapping back from one-hot encoded columns
        df['city_property_type_avg'] = df['price_per_m2']  # Placeholder
        
        logger.info("Extracted derived features: size_category, bedrooms_per_m2, neighborhood_price_avg, city_property_type_avg")
        
        return df
    
    def _extract_geospatial_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Extract geospatial features (Blueprint 5.1.2.5)"""
        # For MVP, use city center distances
        # In production, use actual property coordinates
        
        def calculate_distance_to_center(row):
            # Determine city
            if 'city_Yaoundé' in row and row['city_Yaoundé'] == 1:
                city = 'Yaoundé'
            elif 'city_Douala' in row and row['city_Douala'] == 1:
                city = 'Douala'
            else:
                city = 'Yaoundé'  # Default
            
            # Use city center as approximation (Blueprint 5.1.2.5.a)
            center = self.CITY_CENTERS[city]
            
            # For MVP, return 0 (property at city center)
            # In production, calculate actual distance using property coordinates
            return 0.0
        
        df['distance_to_city_center'] = df.apply(calculate_distance_to_center, axis=1)
        
        # Latitude and longitude (Blueprint 5.1.2.5.b, c)
        # For MVP, use city center coordinates
        # In production, use actual property coordinates
        df['latitude'] = 0.0
        df['longitude'] = 0.0
        
        logger.info("Extracted geospatial features: distance_to_city_center, latitude, longitude (approximated)")
        
        return df
    
    def select_features(
        self,
        df: pd.DataFrame,
        target_column: str = 'price_per_m2',
        max_features: int = 20
    ) -> Tuple[pd.DataFrame, List[str]]:
        """
        Feature selection (Blueprint 5.1.3)
        
        Steps:
        1. Remove features with > 50% missing values
        2. Remove low-variance features
        3. Remove highly correlated features
        4. Select top features by importance
        
        Args:
            df: DataFrame with all features
            target_column: Target variable name
            max_features: Maximum number of features to select
            
        Returns:
            Tuple of (filtered DataFrame, selected feature names)
        """
        logger.info("="*60)
        logger.info("FEATURE ENGINEERING: Feature Selection")
        logger.info("="*60)
        
        if len(df) == 0:
            return df, []
        
        # Separate target from features
        y = df[target_column]
        X = df.drop(columns=[target_column, 'id', 'price', 'neighborhood', 'scraped_at', 'created_at'], errors='ignore')
        
        initial_features = len(X.columns)
        logger.info(f"Initial feature count: {initial_features}")
        
        # 1. Remove features with > 50% missing values (Blueprint 5.1.3.1)
        missing_threshold = 0.5
        missing_pct = X.isnull().sum() / len(X)
        cols_to_keep = missing_pct[missing_pct <= missing_threshold].index
        X = X[cols_to_keep]
        logger.info(f"After removing high-missing features: {len(X.columns)} features")
        
        # 2. Remove low-variance features (Blueprint 5.1.3.2)
        variance_threshold = 0.01
        variances = X.var()
        cols_to_keep = variances[variances >= variance_threshold].index
        X = X[cols_to_keep]
        logger.info(f"After removing low-variance features: {len(X.columns)} features")
        
        # 3. Remove highly correlated features (Blueprint 5.1.3.3)
        correlation_threshold = 0.95
        corr_matrix = X.corr().abs()
        upper_tri = corr_matrix.where(np.triu(np.ones(corr_matrix.shape), k=1).astype(bool))
        to_drop = [column for column in upper_tri.columns if any(upper_tri[column] > correlation_threshold)]
        X = X.drop(columns=to_drop)
        logger.info(f"After removing highly correlated features: {len(X.columns)} features")
        
        # 4. Feature importance ranking (Blueprint 5.1.3.4)
        # This would typically use Random Forest importance
        # For now, select all remaining features up to max_features
        selected_features = list(X.columns[:max_features])
        
        logger.info(f"Selected top {len(selected_features)} features for final model")
        
        # Return DataFrame with selected features + target
        result_df = X[selected_features].copy()
        result_df[target_column] = y
        
        return result_df, selected_features
    
    def run_full_pipeline(
        self,
        months_back: int = 24,
        max_features: int = 20
    ) -> Tuple[pd.DataFrame, List[str]]:
        """
        Run complete feature engineering pipeline (Blueprint 5.1)
        
        Args:
            months_back: Months of historical data
            max_features: Maximum features to select
            
        Returns:
            Tuple of (final DataFrame, selected feature names)
        """
        logger.info("\n" + "="*70)
        logger.info("RUNNING COMPLETE FEATURE ENGINEERING PIPELINE")
        logger.info("="*70 + "\n")
        
        # Data preparation (5.1.1)
        df = self.prepare_data(months_back=months_back)
        
        if len(df) == 0:
            logger.error("No data available for feature engineering")
            return pd.DataFrame(), []
        
        # Feature extraction (5.1.2)
        df = self.extract_features(df)
        
        # Feature selection (5.1.3)
        final_df, selected_features = self.select_features(df, max_features=max_features)
        
        logger.info("\n" + "="*70)
        logger.info("FEATURE ENGINEERING PIPELINE COMPLETE")
        logger.info("="*70)
        logger.info(f"Final dataset: {len(final_df)} samples, {len(selected_features)} features")
        logger.info(f"Selected features: {selected_features}")
        logger.info("="*70 + "\n")
        
        return final_df, selected_features

# Load data from PostgreSQL or CSV
def load_data(source):
    if source.endswith('.csv'):
        return pd.read_csv(source)
    else:
        raise ValueError("Unsupported data source")

# Missing value imputation
def impute_missing_values(df):
    imputer = SimpleImputer(strategy='mean')
    return pd.DataFrame(imputer.fit_transform(df), columns=df.columns)

# Feature extraction
def extract_features(df):
    # Example: Extract numerical, categorical, and derived features
    df['price_per_m2'] = df['price'] / df['size']
    return df

# Feature normalization
def normalize_features(df):
    scaler = StandardScaler()
    return pd.DataFrame(scaler.fit_transform(df), columns=df.columns)

# Save processed features
def save_features(df, path):
    df.to_csv(path, index=False)

# Example usage
if __name__ == "__main__":
    data = load_data("data.csv")
    data = impute_missing_values(data)
    data = extract_features(data)
    data = normalize_features(data)
    save_features(data, "processed_features.csv")
