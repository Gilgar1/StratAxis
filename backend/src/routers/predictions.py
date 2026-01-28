from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from datetime import datetime, timedelta
from typing import Optional

from src.config.database import get_session
from src.schemas.prediction import (
    PricePredictionRequest,
    PricePredictionResponse,
    TrendForecastRequest,
    TrendForecastResponse,
    FeatureImportance,
    ForecastDataPoint
)
from src.models.listing import TrendDirection
from src.dependencies.rate_limiter import rate_limit
from src.utils.logger import logger
import random

router = APIRouter(prefix="/predictions", tags=["Predictions"])

# In-memory cache for predictions (Blueprint 2.4.3.5)
# In production, use Redis
prediction_cache = {}

def get_cached_prediction(cache_key: str) -> Optional[dict]:
    """Check if prediction is cached and not expired (24h TTL)"""
    if cache_key in prediction_cache:
        cached_data, timestamp = prediction_cache[cache_key]
        if datetime.utcnow() - timestamp < timedelta(hours=24):
            return cached_data
        else:
            del prediction_cache[cache_key]
    return None

def cache_prediction(cache_key: str, prediction: dict):
    """Cache prediction with timestamp"""
    prediction_cache[cache_key] = (prediction, datetime.utcnow())

@router.post("/price", response_model=PricePredictionResponse)
async def predict_price(
    request: PricePredictionRequest,
    db: Session = Depends(get_session)
):
    """
    Predict property price using ML model (Blueprint 2.4.3.2)
    
    STUB IMPLEMENTATION: Returns mock predictions
    TODO: Connect to actual ML model from data-pipeline/ml
    """
    try:
        # Create cache key
        cache_key = f"price_{request.city}_{request.property_type}_{request.size}_{request.neighborhood}_{request.bedrooms}"
        
        # Check cache (Blueprint 2.4.3.5)
        cached = get_cached_prediction(cache_key)
        if cached:
            logger.info(f"Returning cached prediction for: {cache_key}")
            return PricePredictionResponse(**cached)
        
        # STUB: Mock ML prediction
        # In production, load model and make actual prediction
        base_price_per_m2 = {
            "Yaoundé": {"apartment": 120000, "house": 150000, "land": 80000, "commercial": 200000},
            "Douala": {"apartment": 130000, "house": 160000, "land": 85000, "commercial": 210000}
        }
        
        city_key = request.city.value
        type_key = request.property_type.value
        
        # Calculate mock prediction
        base_rate = base_price_per_m2.get(city_key, {}).get(type_key, 100000)
        
        # Add random variation for realism
        variation_factor = 1 + (random.random() - 0.5) * 0.2  # ±10%
        predicted_price_per_m2 = base_rate * variation_factor
        predicted_price = predicted_price_per_m2 * request.size
        
        # Confidence interval ±15%
        confidence_interval_lower = predicted_price * 0.85
        confidence_interval_upper = predicted_price * 1.15
        
        # Mock feature importance
        feature_importance = [
            FeatureImportance(feature="size", importance=0.35),
            FeatureImportance(feature="city", importance=0.25),
            FeatureImportance(feature="property_type", importance=0.20),
            FeatureImportance(feature="neighborhood", importance=0.12),
            FeatureImportance(feature="bedrooms", importance=0.08)
        ]
        
        response_data = {
            "predicted_price": round(predicted_price, 2),
            "predicted_price_per_m2": round(predicted_price_per_m2, 2),
            "confidence_interval_lower": round(confidence_interval_lower, 2),
            "confidence_interval_upper": round(confidence_interval_upper, 2),
            "confidence_score": 0.78,  # Mock confidence
            "feature_importance": feature_importance,
            "model_version": "v1.0.0-stub",
            "prediction_date": datetime.utcnow().isoformat()
        }
        
        # Cache the prediction
        cache_prediction(cache_key, response_data)
        
        logger.info(f"Generated price prediction for {city_key} {type_key} ({request.size}m²)")
        
        return PricePredictionResponse(**response_data)
        
    except Exception as e:
        logger.error(f"Error generating price prediction: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error generating price prediction. Model may not be ready."
        )

@router.post("/trend", response_model=TrendForecastResponse)
async def forecast_trend(
    request: TrendForecastRequest,
    db: Session = Depends(get_session)
):
    """
    Forecast price trends over time (Blueprint 2.4.3.3)
    
    STUB IMPLEMENTATION: Returns mock forecasts
    TODO: Connect to actual time-series forecasting model
    """
    try:
        # Create cache key
        cache_key = f"trend_{request.city}_{request.property_type}_{request.time_horizon}_{request.neighborhood}"
        
        # Check cache
        cached = get_cached_prediction(cache_key)
        if cached:
            logger.info(f"Returning cached forecast for: {cache_key}")
            return TrendForecastResponse(**cached)
        
        # STUB: Mock trend forecast
        current_avg_price = {
            "Yaoundé": {"apartment": 25000000, "house": 45000000, "land": 15000000, "commercial": 60000000},
            "Douala": {"apartment": 28000000, "house": 50000000, "land": 18000000, "commercial": 65000000}
        }
        
        city_key = request.city.value
        type_key = request.property_type.value
        
        current_price = current_avg_price.get(city_key, {}).get(type_key, 30000000)
        current_price_per_m2 = current_price / 200  # Assume 200m² average
        
        # Simulate upward trend with some randomness
        monthly_growth_rate = 0.015 + (random.random() - 0.5) * 0.01  # ~1.5% per month ± 0.5%
        
        # Generate forecast data points
        forecasts = []
        for month in range(1, request.time_horizon + 1):
            forecast_date = datetime.utcnow() + timedelta(days=30 * month)
            forecasted_price = current_price * ((1 + monthly_growth_rate) ** month)
            forecasted_price_per_m2 = current_price_per_m2 * ((1 + monthly_growth_rate) ** month)
            
            forecasts.append(ForecastDataPoint(
                month=forecast_date.strftime("%Y-%m"),
                forecasted_price=round(forecasted_price, 2),
                forecasted_price_per_m2=round(forecasted_price_per_m2, 2),
                confidence_lower=round(forecasted_price * 0.90, 2),
                confidence_upper=round(forecasted_price * 1.10, 2)
            ))
        
        # Determine trend direction
        total_growth_percentage = (monthly_growth_rate * request.time_horizon) * 100
        
        if total_growth_percentage > 5:
            trend_direction = TrendDirection.UP
        elif total_growth_percentage < -5:
            trend_direction = TrendDirection.DOWN
        else:
            trend_direction = TrendDirection.STABLE
        
        response_data = {
            "city": city_key,
            "property_type": type_key,
            "time_horizon": request.time_horizon,
            "current_avg_price": round(current_price, 2),
            "current_avg_price_per_m2": round(current_price_per_m2, 2),
            "trend_direction": trend_direction,
            "trend_percentage": round(total_growth_percentage, 2),
            "forecasts": forecasts,
            "confidence_score": 0.72,  # Mock confidence
            "model_version": "v1.0.0-stub",
            "forecast_date": datetime.utcnow().isoformat()
        }
        
        # Cache the forecast
        cache_prediction(cache_key, response_data)
        
        logger.info(f"Generated trend forecast for {city_key} {type_key} ({request.time_horizon} months)")
        
        return TrendForecastResponse(**response_data)
        
    except Exception as e:
        logger.error(f"Error generating trend forecast: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error generating trend forecast. Model may not be ready."
        )

@router.get("/health")
async def prediction_health():
    """
    Check prediction service health and model status (Blueprint 2.4.3.7)
    """
    return {
        "status": "operational",
        "model_status": "stub",
        "message": "Prediction service is running in stub mode. ML models not yet deployed.",
        "cache_size": len(prediction_cache),
        "available_models": ["price_prediction_stub", "trend_forecast_stub"]
    }
