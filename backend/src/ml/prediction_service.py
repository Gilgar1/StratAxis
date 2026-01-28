"""
Prediction Service (Blueprint 5.5.1.3)

Handles:
- Price prediction for properties
- Caching layer
- Feature engineering for prediction
"""

import joblib
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
from pathlib import Path
import pandas as pd
from sqlmodel import Session

from src.models.ml_model import MLModel, ModelType
from src.models.price_prediction import PricePrediction
from src.models.property import PropertyCity, PropertyType
from src.ml.feature_engineering import FeatureEngineer
from src.ml.model_training import ModelTrainer
from src.utils.logger import logger


class PredictionCache:
    """
    Simple in-memory cache for predictions (Blueprint 5.5.1.3.c)
    
    TTL: 24 hours
    """
    
    def __init__(self, ttl_hours: int = 24):
        self.cache = {}
        self.ttl = timedelta(hours=ttl_hours)
    
    def _make_key(self, input_data: Dict[str, Any]) -> str:
        """Create cache key from input data"""
        # Sort keys for consistent hashing
        key_parts = []
        for k in sorted(input_data.keys()):
            key_parts.append(f"{k}={input_data[k]}")
        return "|".join(key_parts)
    
    def get(self, input_data: Dict[str, Any]) -> Optional[float]:
        """Get cached prediction if available and not expired"""
        key = self._make_key(input_data)
        
        if key in self.cache:
            cached_value, timestamp = self.cache[key]
            
            # Check if expired
            if datetime.utcnow() - timestamp < self.ttl:
                logger.debug(f"Cache hit for: {key[:50]}...")
                return cached_value
            else:
                # Expired, remove
                del self.cache[key]
        
        return None
    
    def set(self, input_data: Dict[str, Any], prediction: float):
        """Cache prediction with timestamp"""
        key = self._make_key(input_data)
        self.cache[key] = (prediction, datetime.utcnow())
        logger.debug(f"Cached prediction for: {key[:50]}...")
    
    def clear(self):
        """Clear entire cache"""
        self.cache = {}
        logger.info("Prediction cache cleared")


class PredictionService:
    """
    ML Prediction Service (Blueprint 5.5.1.3)
    
    Provides:
    - Price prediction for properties
    - Caching layer
    - Feature engineering integration
    - Model loading and management
    """
    
    def __init__(self, session: Session):
        self.session = session
        self.feature_engineer = FeatureEngineer(session)
        self.model_trainer = ModelTrainer(session)
        self.cache = PredictionCache(ttl_hours=24)
        
        # Lazy-loaded active model
        self._active_model = None
        self._active_model_metadata = None
        self._model_features = []
    
    def predict_price(
        self,
        property_data: Dict[str, Any],
        use_cache: bool = True
    ) -> Dict[str, Any]:
        """
        Predict property price (Blueprint 5.5.1.3.b)
        
        Process:
        1. Check cache
        2. Prepare features
        3. Load model
        4. Make prediction
        5. Cache result
        6. Return prediction with confidence
        
        Args:
            property_data: Property attributes (city, type, size, bedrooms, etc.)
            use_cache: Whether to use cached predictions
            
        Returns:
            Dictionary with prediction and metadata
        """
        # 1. Check cache (Blueprint 5.5.1.3.c)
        if use_cache:
            cached_prediction = self.cache.get(property_data)
            if cached_prediction is not None:
                return {
                    "predicted_price_per_m2": cached_prediction,
                    "predicted_price": cached_prediction * property_data.get('size', 0),
                    "from_cache": True,
                    "timestamp": datetime.utcnow().isoformat()
                }
        
        # 2. Prepare features (Blueprint 5.5.1.3.b - feature engineering)
        features_df = self._prepare_features_for_prediction(property_data)
        
        # 3. Load active model
        if self._active_model is None:
            self._load_active_model()
        
        # 4. Make prediction (Blueprint 5.5.1.3.b - model.predict)
        try:
            # Ensure features match training features
            X = features_df[self._model_features]
            
            predicted_price_per_m2 = self._active_model.predict(X)[0]
            
            # Calculate total price
            predicted_price = predicted_price_per_m2 * property_data.get('size', 0)
            
            # 5. Cache result (Blueprint 5.5.1.3.c)
            if use_cache:
                self.cache.set(property_data, predicted_price_per_m2)
            
            # 6. Return prediction
            return {
                "predicted_price_per_m2": float(predicted_price_per_m2),
                "predicted_price": float(predicted_price),
                "from_cache": False,
                "model_name": self._active_model_metadata.name,
                "model_version": self._active_model_metadata.version,
                "model_algorithm": self._active_model_metadata.algorithm,
                "model_r2": self._active_model_metadata.metrics.get('r2', 0) if self._active_model_metadata.metrics else 0,
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Prediction error: {e}")
            raise
    
    def _load_active_model(self):
        """Load active deployed model (Blueprint 5.5.1.3.a)"""
        logger.info("Loading active price prediction model...")
        
        try:
            self._active_model, self._active_model_metadata = self.model_trainer.load_active_model(
                ModelType.PRICE_PREDICTION
            )
            
            # Load feature list from metadata
            self._model_features = self._active_model_metadata.features or []
            
            logger.info(
                f"Loaded model: {self._active_model_metadata.name} "
                f"v{self._active_model_metadata.version} "
                f"(R²={self._active_model_metadata.metrics.get('r2', 0):.4f})"
            )
            
        except Exception as e:
            logger.error(f"Failed to load active model: {e}")
            raise ValueError("No active prediction model available. Train and deploy a model first.")
    
    def _prepare_features_for_prediction(
        self,
        property_data: Dict[str, Any]
    ) -> pd.DataFrame:
        """
        Prepare features for prediction (Blueprint 5.5.1.3.b)
        
        Applies same feature engineering as training
        """
        # Create DataFrame from input
        df = pd.DataFrame([{
            'price': 0,  # Unknown (we're predicting this)
            'size': property_data.get('size', 100),
            'price_per_m2': 0,  # Will be calculated
            'city': property_data.get('city', 'Yaoundé'),
            'property_type': property_data.get('property_type', 'apartment'),
            'neighborhood': property_data.get('neighborhood', 'unknown'),
            'bedrooms': property_data.get('bedrooms', 2),
            'bathrooms': property_data.get('bathrooms', 1.5),
            'scraped_at': datetime.utcnow(),
            'created_at': datetime.utcnow(),
            'quality_score': 80,
            'id': 'prediction'
        }])
        
        # Apply feature engineering (same as training)
        features_df = self.feature_engineer.extract_features(df)
        
        return features_df
    
    def reload_model(self):
        """Reload active model (call after new deployment)"""
        self._active_model = None
        self._active_model_metadata = None
        self._model_features = []
        self.cache.clear()
        
        logger.info("Model reloaded and cache cleared")
    
    def create_prediction_record(
        self,
        user_id: str,
        property_data: Dict[str, Any],
        prediction_result: Dict[str, Any]
    ) -> PricePrediction:
        """
        Store prediction in database (for analytics)
        
        Args:
            user_id: UUID of user requesting prediction
            property_data: Input property data
            prediction_result: Prediction output
            
        Returns:
            PricePrediction record
        """
        from uuid import UUID
        
        prediction = PricePrediction(
            user_id=UUID(user_id) if user_id else None,
            ml_model_id=UUID(str(self._active_model_metadata.id)) if self._active_model_metadata else None,
            property_city=PropertyCity.YAOUNDE if property_data.get('city') == 'Yaoundé' else PropertyCity.DOUALA,
            property_type=PropertyType[property_data.get('property_type', 'apartment').upper()],
            property_size=property_data.get('size', 0),
            bedrooms=property_data.get('bedrooms'),
            bathrooms=property_data.get('bathrooms'),
            neighborhood=property_data.get('neighborhood'),
            predicted_price=prediction_result['predicted_price'],
            predicted_price_per_m2=prediction_result['predicted_price_per_m2'],
            confidence_score=float(self._active_model_metadata.metrics.get('r2', 0)) if self._active_model_metadata and self._active_model_metadata.metrics else None,
            input_features=property_data
        )
        
        self.session.add(prediction)
        self.session.commit()
        self.session.refresh(prediction)
        
        logger.info(f"Prediction record created: {prediction.id}")
        
        return prediction
