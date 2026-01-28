# Section 5 Implementation: Machine Learning Workflow

**Blueprint Section:** 5. MACHINE LEARNING WORKFLOW  
**Implementation Date:** 2026-01-28  
**Status:** ✅ COMPLETE

---

## Overview

Section 5 defines the complete ML workflow for StratAxis, implementing price prediction and trend forecasting models with production-ready ML infrastructure.

**Implemented Components:**
- ✅ **5.1 Feature Engineering** - Data preparation, extraction, selection
- ✅ **5.2 Model Selection** - Multi-model comparison and evaluation
- ✅ **5.3 Training** - Price prediction & trend forecasting models
- ✅ **5.4 Evaluation** - Comprehensive metrics and error analysis
- ✅ **5.5 Deployment** - Model deployment, prediction service, retraining

---

## Files Created

```
backend/src/ml/
├── __init__.py                              ✅ Package exports
├── feature_engineering.py                   ✅ 5.1 (680 lines)
├── model_training.py                        ✅ 5.2, 5.3 (580 lines)
├── prediction_service.py                    ✅ 5.5.1.3 (320 lines)
├── trend_forecasting.py                     ✅ 5.3.2, 5.4.2 (400 lines)
└── ml_scheduler.py                          ✅ 5.5.2 (450 lines)

backend/models/                              ✅ Model artifacts directory
backend/requirements.txt                     ✅ Updated (+7 ML dependencies)
backend/src/routers/admin.py                 ✅ Updated (+5 ML endpoints)
docs/SECTION_5_IMPLEMENTATION.md             ✅ This documentation
```

**Total:** 9 files, ~2,430 lines of ML pipeline code

---

## 5.1 Feature Engineering ✅

**File:** `backend/src/ml/feature_engineering.py`

### Data Preparation (5.1.1)

**Process:**
1. Load validated properties (last 24 months)
2. Filter by cities (Yaoundé, Douala)
3. Remove missing critical features (price, size, type, city)
4. Handle missing values:
   - Bedrooms: median by property type & city
   - Bathrooms: bedrooms × 0.75
   - Neighborhood: 'unknown' category

### Feature Extraction (5.1.2)

**1. Numerical Features:**
- size (m²)
- bedrooms, bathrooms
- price_per_m² (target)
- age (years since scraped_at)

**2. Categorical Features (One-Hot Encoded):**
- city (Yaoundé, Douala)
- property_type (apartment, house, land, commercial)
- neighborhood (top 20 + "other")

**3. Temporal Features:**
- year
- month (sin/cos cyclical encoding)
- quarter (sin/cos cyclical encoding)

**4. Derived Features:**
- size_category (small/medium/large)
- bedrooms_per_m²
- neighborhood_price_avg
- city_property_type_avg

**5. Geospatial Features:**
- distance_to_city_center (km)
- latitude, longitude

### Feature Selection (5.1.3)

**Filters:**
1. Remove features with >50% missing
2. Remove low-variance features (variance < 0.01)
3. Remove highly correlated features (r > 0.95)
4. Select top 15-20 features

### Usage

```python
from src.ml.feature_engineering import FeatureEngineer

with Session(engine) as session:
    engineer = FeatureEngineer(session)
    
    # Run full pipeline
    df, features = engineer.run_full_pipeline(
        months_back=24,
        max_features=20
    )
    
print(f"Dataset: {len(df)} samples, {len(features)} features")
```

---

## 5.2 & 5.3 Model Training ✅

**File:** `backend/src/ml/model_training.py`

### Model Candidates (5.2.1)

**Price Prediction:**
1. **Random Forest** (baseline, feature importance)
2. **XGBoost** (gradient boosting, best for tabular data)
3. **Ridge Regression** (linear, interpretable)
4. **Lasso Regression** (feature selection)
5. **Decision Tree** (simple baseline)

**Evaluation Metrics:**
- Primary: RMSE, MAE
- Secondary: R²
- Business: % predictions within 20%

### Training Process (5.3.1)

**Steps:**
1. Split data: 70% train, 15% val, 15% test
2. Train all candidates on training set
3. Evaluate on validation set
4. Select best model (highest R²)
5. Hyperparameter tuning (RandomizedSearchCV)
   - Random Forest: n_estimators, max_depth, min_samples_split
   - XGBoost: n_estimators, max_depth, learning_rate
6. Final training on train + validation
7. Test set evaluation
8. Save model artifact (joblib)
9. Extract feature importance
10. Store metadata in MLModels table

### Deployment (5.5.1)

**Validation Thresholds:**
- Price Prediction: R² > 0.6, RMSE < 20% of mean
- Trend Forecast: MAPE < 15%, trend accuracy > 70%

**Deployment Process:**
1. Validate thresholds
2. Archive current active model
3. Set new model as active
4. Update MLModels table

### Usage

```python
from src.ml.model_training import ModelTrainer

with Session(engine) as session:
    trainer = ModelTrainer(session)
    
    # Train model
    result = trainer.train_price_prediction_model(
        df=features_df,
        feature_columns=feature_list
    )
    
    print(f"R²: {result['metrics']['r2']:.4f}")
    print(f"RMSE: {result['metrics']['rmse']:.2f}")
    
    # Deploy if satisfactory
    deployment = trainer.deploy_model(
        str(result['metadata'].id)
    )
```

---

## 5.5.1.3 Prediction Service ✅

**File:** `backend/src/ml/prediction_service.py`

### Features

**1. Price Prediction:**
- Input: property attributes (city, type, size, bedrooms...)
- Output: predicted price & price/m²
- Confidence score from model R²

**2. Caching Layer:**
- 24-hour TTL for identical inputs
- In-memory cache
- Reduces prediction latency

**3. Feature Preparation:**
- Applies same feature engineering as training
- Ensures feature compatibility

**4. Prediction Storage:**
- Logs predictions to `PricePredictions` table
- Analytics and model monitoring

### Usage

```python
from src.ml.prediction_service import PredictionService

with Session(engine) as session:
    service = PredictionService(session)
    
    # Make prediction
    result = service.predict_price({
        "city": "Yaoundé",
        "property_type": "apartment",
        "size": 100,
        "bedrooms": 2,
        "bathrooms": 1.5,
        "neighborhood": "Bastos"
    })
    
    print(f"Predicted Price: {result['predicted_price']:,.0f} XAF")
    print(f"Price/m²: {result['predicted_price_per_m2']:,.0f} XAF/m²")
    print(f"From cache: {result['from_cache']}")
```

---

## 5.3.2 & 5.4.2 Trend Forecasting ✅

**File:** `backend/src/ml/trend_forecasting.py`

### Time Series Preparation

**Aggregation:**
- Monthly averages by city and property type
- Minimum 12 months historical data
- Format: (date, average_price_per_m²)

### Prophet Model Training

**Configuration:**
- Yearly seasonality: enabled
- Monthly custom seasonality (fourier_order=5)
- Changepoint prior scale: 0.1 (controls trend flexibility)
- Seasonality mode: multiplicative

**Training:**
1. Split: last 3 months as test set
2. Train on remaining data
3. Evaluate on test set (RMSE, MAE, MAPE, trend accuracy)
4. If satisfactory (MAPE < 15%, trend accuracy > 70%):
   - Retrain on full dataset
5. Generate future forecasts (6 months)
6. Save model artifact
7. Store metadata

### Evaluation Metrics

- **RMSE:** Root mean squared error
- **MAE:** Mean absolute error
- **MAPE:** Mean absolute percentage error
- **Trend Direction Accuracy:** % of periods where forecast trend matches actual

### Usage

```python
from src.ml.trend_forecasting import TrendForecaster

with Session(engine) as session:
    forecaster = TrendForecaster(session)
    
    # Prepare time series
    df = forecaster.prepare_time_series_data(
        city="Yaoundé",
        property_type="apartment",
        months_back=24
    )
    
    # Train model
    result = forecaster.train_forecast_model(
        df=df,
        forecast_periods=6
    )
    
    print(f"MAPE: {result['metrics']['mape']:.2f}%")
    print(f"Trend Accuracy: {result['metrics']['trend_accuracy']:.1f}%")
```

---

## 5.5.2 Model Retraining Scheduler ✅

**File:** `backend/src/ml/ml_scheduler.py`

### Trigger Conditions

1. **Scheduled:** Monthly retraining (1st of month @ 04:00 UTC)
2. **On-demand:** Admin API trigger
3. **Automatic:** > 1000 new validated properties since last training

### Retraining Process

1. Load updated dataset (all validated properties)
2. Re-run feature engineering
3. Retrain model (same hyperparameters)
4. Evaluate new model vs current active model
5. If better performance:
   - Deploy new model (archives previous)
6. If performance similar/worse:
   - Keep current model, log for review

### Model Comparison

**Deployment Decision:**
- New model R² > Active model R² → Deploy
- Otherwise → Keep active model

### Usage

```python
from src.ml.ml_scheduler import setup_ml_scheduler, trigger_manual_retraining

# Setup scheduler at application startup
setup_ml_scheduler()

# Manual trigger
trigger_manual_retraining("price")   # Price prediction
trigger_manual_retraining("trend")   # Trend forecast
trigger_manual_retraining("both")    # Both models
```

### Scheduler Configuration

```python
# In main.py or startup script
from src.ml.ml_scheduler import setup_ml_scheduler, run_ml_scheduler_loop

# Setup scheduler
scheduler = setup_ml_scheduler()

# Run in background thread
import threading
scheduler_thread = threading.Thread(target=run_ml_scheduler_loop, daemon=True)
scheduler_thread.start()
```

---

## Admin API Endpoints

### ML Management

```bash
# Train price prediction model
POST /api/admin/ml/train/price-prediction
Authorization: Bearer <ADMIN_TOKEN>

# Train trend forecast model
POST /api/admin/ml/train/trend-forecast
Authorization: Bearer <ADMIN_TOKEN>

# Deploy model
POST /api/admin/ml/deploy/{model_id}
Authorization: Bearer <ADMIN_TOKEN>

# Get active models
GET /api/admin/ml/models/active
Authorization: Bearer <ADMIN_TOKEN>

# List all models (with optional filtering)
GET /api/admin/ml/models?model_type=price-prediction
Authorization: Bearer <ADMIN_TOKEN>
```

---

## Dependencies Added

```txt
scikit-learn==1.3.2    # ML algorithms, preprocessing
xgboost==2.0.3         # Gradient boosting
prophet==1.1.5         # Time series forecasting
pandas==2.1.4          # Data manipulation
numpy==1.26.2          # Numerical computing
joblib==1.3.2          # Model serialization
geopy==2.4.1           # Geospatial calculations
```

**Installation:**
```bash
cd backend
pip install -r requirements.txt
```

---

## Blueprint Compliance: 100%

| Requirement | Implementation | Status |
|------------|----------------|--------|
| 5.1.1. Data preparation | Filtering, missing value handling | ✅ 100% |
| 5.1.2. Feature extraction | 5 feature types implemented | ✅ 100% |
| 5.1.3. Feature selection | Variance, correlation filtering | ✅ 100% |
| 5.2.1. Model candidates | 5 models compared | ✅ 100% |
| 5.2.3. Model selection | Best model by R² | ✅ 100% |
| 5.3.1. Price prediction training | Full training pipeline | ✅ 100% |
| 5.3.2. Trend forecast training | Prophet with seasonality | ✅ 100% |
| 5.4.1. Price prediction evaluation | RMSE, MAE, R², within-20% | ✅ 100% |
| 5.4.2. Trend forecast evaluation | RMSE, MAE, MAPE, trend accuracy | ✅ 100% |
| 5.5.1. Deployment pipeline | Validation, activation | ✅ 100% |
| 5.5.1.3. Prediction service | Feature prep, caching | ✅ 100% |
| 5.5.2. Retraining strategy | 3 triggers, comparison logic | ✅ 100% |

**TOTAL COMPLIANCE: 100%**

---

## Testing

### Test Feature Engineering

```python
from src.ml.feature_engineering import FeatureEngineer

with Session(engine) as session:
    engineer = FeatureEngineer(session)
    df, features = engineer.run_full_pipeline()
    print(f"Features: {features}")
```

### Test Model Training

```python
from src.ml.ml_scheduler import trigger_manual_retraining

# Train and evaluate models
trigger_manual_retraining("both")
```

### Test Prediction

```python
from src.ml.prediction_service import PredictionService

with Session(engine) as session:
    service = PredictionService(session)
    
    result = service.predict_price({
        "city": "Douala",
        "property_type": "house",
        "size": 150,
        "bedrooms": 3,
        "bathrooms": 2
    })
    
    print(result)
```

---

## Production Deployment

### Initialize Models

```bash
# 1. Train initial models
python -m src.ml.ml_scheduler

# 2. Verify models in database
psql -d strataxis -c "SELECT name, version, status FROM ml_models;"
```

### Enable Scheduler

```python
# In src/main.py
from src.ml.ml_scheduler import setup_ml_scheduler
import threading

@app.on_event("startup")
async def startup_event():
    # Setup ML scheduler
    setup_ml_scheduler()
    
    # Run scheduler in background
    from src.ml.ml_scheduler import run_ml_scheduler_loop
    scheduler_thread = threading.Thread(
        target=run_ml_scheduler_loop,
        daemon=True
    )
    scheduler_thread.start()
```

---

## Monitoring

### Model Performance Tracking

Monitor via `MLModels` table:
- Training metrics (R², RMSE, MAE)
- Deployment timestamps
- Version history

### Prediction Analytics

Monitor via `PricePredictions` table:
- Request volume
- Average confidence scores
- User segments

---

## Conclusion

**Section 5 is 100% COMPLETE** per blueprint specifications.

The implementation provides:
- ✅ **Production-ML infrastructure** with automated feature engineering
- ✅ **Multi-model comparison** (5 algorithms evaluated)
- ✅ **Hyperparameter tuning** via RandomizedSearchCV
- ✅ **Prophet forecasting** with seasonality configuration
- ✅ **Prediction service** with 24h caching
- ✅ **Automated retraining** (monthly + automatic triggers)
- ✅ **Model versioning** with deployment validation
- ✅ **Admin control** via API endpoints

The ML workflow is now ready for:
- Real-world price predictions
- Market trend forecasting
- Continuous model improvement
- Academic project demonstration

**Section 5 Implementation Complete ✅**
