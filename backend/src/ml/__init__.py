"""
Machine Learning Package (Blueprint 5)

Exports:
- Feature Engineering (5.1)
- Model Training (5.2 & 5.3)
- Prediction Service (5.5.1.3)
- Trend Forecasting (5.3.2)
- ML Scheduler (5.5.2)
"""

from .feature_engineering import FeatureEngineer
from .model_training import ModelTrainer
from .prediction_service import PredictionService, PredictionCache
from .trend_forecasting import TrendForecaster
from .ml_scheduler import MLScheduler, setup_ml_scheduler, trigger_manual_retraining

__all__ = [
    # Feature Engineering (5.1)
    "FeatureEngineer",
    
    # Model Training (5.2, 5.3)
    "ModelTrainer",
    
    # Prediction Service (5.5.1)
    "PredictionService",
    "PredictionCache",
    
    # Trend Forecasting (5.3.2, 5.4.2)
    "TrendForecaster",
    
    # ML Scheduler (5.5.2)
    "MLScheduler",
    "setup_ml_scheduler",
    "trigger_manual_retraining"
]
