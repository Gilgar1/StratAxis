"""
Trend Forecasting (Blueprint 5.3.2 & 5.4.2)

Handles:
- Time series aggregation
- Prophet model training
- Trend forecasting
- Forecast evaluation
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Any
from datetime import datetime, timedelta
from pathlib import Path
import joblib
from sqlmodel import Session, select, func

from src.models.property import Property, PropertyCity, PropertyType, ValidationStatus
from src.models.ml_model import MLModel, ModelType, ModelStatus
from src.services.model_versioning import ModelVersioningService
from src.utils.logger import logger


class TrendForecaster:
    """
    Trend Forecasting Model (Blueprint 5.3.2 & 5.4.2)
    
    Uses Prophet for time series forecasting of property prices
    """
    
    def __init__(self, session: Session):
        self.session = session
        self.model_versioning = ModelVersioningService(session)
        self.models_dir = Path("backend/models")
        self.models_dir.mkdir(parents=True, exist_ok=True)
    
    def prepare_time_series_data(
        self,
        city: str = None,
        property_type: str = None,
        months_back: int = 24
    ) -> pd.DataFrame:
        """
        Aggregate data for time series (Blueprint 5.3.2.1, 2)
        
        Aggregates by month: average price per m²
        
        Args:
            city: Filter by city (optional)
            property_type: Filter by property type (optional)
            months_back: Historical data period
            
        Returns:
            DataFrame with columns [ds, y] for Prophet
        """
        logger.info("Preparing time series data for trend forecast...")
        
        # Calculate cutoff date
        cutoff_date = datetime.utcnow() - timedelta(days=months_back * 30)
        
        # Query properties
        query = select(Property).where(
            Property.validation_status == ValidationStatus.VALIDATED,
            Property.created_at >= cutoff_date,
            Property.price_per_m2 > 0
        )
        
        if city:
            city_enum = PropertyCity.YAOUNDE if city == 'Yaoundé' else PropertyCity.DOUALA
            query = query.where(Property.city == city_enum)
        
        if property_type:
            type_enum = PropertyType[property_type.upper()]
            query = query.where(Property.property_type == type_enum)
        
        properties = self.session.exec(query).all()
        
        logger.info(f"Loaded {len(properties)} properties for time series")
        
        if len(properties) == 0:
            return pd.DataFrame()
        
        # Convert to DataFrame
        data = []
        for prop in properties:
            data.append({
                'date': prop.created_at,
                'price_per_m2': float(prop.price_per_m2) if prop.price_per_m2 else prop.price / prop.size
            })
        
        df = pd.DataFrame(data)
        
        # Aggregate by month (Blueprint 5.3.2.1)
        df['month'] = pd.to_datetime(df['date']).dt.to_period('M')
        monthly_avg = df.groupby('month')['price_per_m2'].mean().reset_index()
        
        # Convert to Prophet format (ds, y) (Blueprint 5.3.2.2)
        monthly_avg['ds'] = monthly_avg['month'].dt.to_timestamp()
        monthly_avg['y'] = monthly_avg['price_per_m2']
        
        prophet_df = monthly_avg[['ds', 'y']]
        
        logger.info(f"Time series prepared: {len(prophet_df)} monthly data points")
        
        return prophet_df
    
    def train_forecast_model(
        self,
        df: pd.DataFrame,
        forecast_periods: int = 6
    ) -> Dict[str, Any]:
        """
        Train Prophet forecast model (Blueprint 5.3.2.4)
        
        Args:
            df: Time series data (ds, y)
            forecast_periods: Number of months to forecast
            
        Returns:
            Training results with model and metrics
        """
        logger.info("="*70)
        logger.info("TREND FORECASTING: Model Training")
        logger.info("="*70)
        
        # Import Prophet (lazy import to avoid dependency issues)
        try:
            from prophet import Prophet
        except ImportError:
            logger.error("Prophet library not installed. Install with: pip install prophet")
            raise
        
        if len(df) < 12:
            logger.error("Not enough data for forecasting (minimum 12 months required)")
            return {}
        
        # Split train/test (last 3 months as test) (Blueprint 5.3.2.3)
        test_months = 3
        train_df = df.iloc[:-test_months]
        test_df = df.iloc[-test_months:]
        
        logger.info(f"Train set: {len(train_df)} months, Test set: {len(test_df)} months")
        
        # Train Prophet model (Blueprint 5.3.2.4)
        logger.info("Training Prophet model...")
        
        model = Prophet(
            yearly_seasonality=True,
            weekly_seasonality=False,
            daily_seasonality=False,
            changepoint_prior_scale=0.1,  # Blueprint 5.3.2.4.b (0.05-0.5)
            seasonality_mode='multiplicative'
        )
        
        # Add monthly seasonality (Blueprint 5.3.2.4.a)
        model.add_seasonality(name='monthly', period=30.5, fourier_order=5)
        
        # Fit model
        model.fit(train_df)
        
        # Evaluate on test set (Blueprint 5.3.2.5, 6)
        test_forecast = model.predict(test_df[['ds']])
        
        metrics = self._evaluate_forecast(
            actual=test_df['y'].values,
            predicted=test_forecast['yhat'].values
        )
        
        logger.info("\nTest Set Evaluation:")
        logger.info(f"  RMSE: {metrics['rmse']:.2f}")
        logger.info(f"  MAE: {metrics['mae']:.2f}")
        logger.info(f"  MAPE: {metrics['mape']:.2f}%")
        logger.info(f"  Trend Direction Accuracy: {metrics['trend_accuracy']:.1f}%")
        
        # If satisfactory, train on all data (Blueprint 5.3.2.7)
        if metrics['mape'] < 15 and metrics['trend_accuracy'] > 70:
            logger.info("\nTest performance satisfactory. Retraining on full dataset...")
            
            final_model = Prophet(
                yearly_seasonality=True,
                weekly_seasonality=False,
                daily_seasonality=False,
                changepoint_prior_scale=0.1,
                seasonality_mode='multiplicative'
            )
            final_model.add_seasonality(name='monthly', period=30.5, fourier_order=5)
            final_model.fit(df)
            
            model = final_model
        
        # Generate future forecast (Blueprint 5.3.2.5)
        future = model.make_future_dataframe(periods=forecast_periods, freq='MS')
        forecast = model.predict(future)
        
        # Save model (Blueprint 5.3.2.8)
        model_path = self._save_forecast_model(model, "trend_forecast")
        
        # Store metadata (Blueprint 5.3.2.9)
        model_metadata = self._create_forecast_metadata(
            model_name=f"trend_forecast_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
            training_records=len(df),
            metrics=metrics,
            model_path=str(model_path),
            forecast_periods=forecast_periods
        )
        
        logger.info("\n" + "="*70)
        logger.info("TREND FORECASTING MODEL TRAINING COMPLETE")
        logger.info("="*70 + "\n")
        
        return {
            "model": model,
            "forecast": forecast,
            "model_path": model_path,
            "metrics": metrics,
            "metadata": model_metadata
        }
    
    def _evaluate_forecast(
        self,
        actual: np.ndarray,
        predicted: np.ndarray
    ) -> Dict[str, float]:
        """
        Evaluate forecast accuracy (Blueprint 5.4.2)
        
        Metrics:
        - RMSE, MAE, MAPE
        - Trend direction accuracy
        """
        from sklearn.metrics import mean_squared_error, mean_absolute_error
        
        rmse = np.sqrt(mean_squared_error(actual, predicted))
        mae = mean_absolute_error(actual, predicted)
        
        # MAPE (Mean Absolute Percentage Error) (Blueprint 5.2.2.4.b, 5.4.2.1.c)
        mape = np.mean(np.abs((actual - predicted) / actual)) * 100
        
        # Trend direction accuracy (Blueprint 5.4.2.1.c, d)
        actual_trend = np.diff(actual)
        predicted_trend = np.diff(predicted)
        
        # Check if trends match (both positive or both negative)
        trend_matches = np.sign(actual_trend) == np.sign(predicted_trend)
        trend_accuracy = np.mean(trend_matches) * 100
        
        return {
            'rmse': rmse,
            'mae': mae,
            'mape': mape,
            'trend_accuracy': trend_accuracy
        }
    
    def _save_forecast_model(self, model, model_name: str) -> Path:
        """Save forecast model artifact"""
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        filename = f"{model_name}_{timestamp}.joblib"
        filepath = self.models_dir / filename
        
        joblib.dump(model, filepath)
        
        logger.info(f"Forecast model saved to: {filepath}")
        
        return filepath
    
    def _create_forecast_metadata(
        self,
        model_name: str,
        training_records: int,
        metrics: Dict[str, float],
        model_path: str,
        forecast_periods: int
    ) -> MLModel:
        """Create forecast model metadata"""
        # Get latest version
        latest_version = self.model_versioning.get_latest_version_for_type(ModelType.TREND_FORECAST)
        
        if latest_version:
            new_version = self.model_versioning.increment_version(latest_version, "patch")
        else:
            new_version = "1.0.0"
        
        # Create model record
        model_record = self.model_versioning.create_model(
            name=model_name,
            version=new_version,
            model_type=ModelType.TREND_FORECAST,
            algorithm="Prophet",
            hyperparameters={"forecast_periods": forecast_periods},
            features=["time_series"],
            training_records=training_records,
            metrics=metrics,
            model_path=model_path
        )
        
        logger.info(f"\nForecast model metadata stored: {model_name} v{new_version}")
        
        return model_record
