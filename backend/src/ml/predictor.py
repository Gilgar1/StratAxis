import joblib
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

# Load models
price_model = joblib.load("best_model.joblib")
trend_model = joblib.load("trend_model.joblib")

# Define input/output schemas
class PricePredictionInput(BaseModel):
    features: dict

class PricePredictionOutput(BaseModel):
    prediction: float

class TrendForecastInput(BaseModel):
    city: str
    property_type: str
    date_range: str

class TrendForecastOutput(BaseModel):
    forecast: list

# Initialize router
router = APIRouter()

@router.post("/predict", response_model=PricePredictionOutput)
def predict_price(input: PricePredictionInput):
    try:
        features = list(input.features.values())
        prediction = price_model.predict([features])[0]
        return PricePredictionOutput(prediction=prediction)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/forecast", response_model=TrendForecastOutput)
def forecast_trend(input: TrendForecastInput):
    try:
        # Example: Generate dummy forecast
        forecast = [100, 110, 120]  # Replace with trend_model.forecast logic
        return TrendForecastOutput(forecast=forecast)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))