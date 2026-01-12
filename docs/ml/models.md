# Machine Learning Models

## Price Prediction Model
- **Algorithm**: Random Forest Regressor / XGBoost
- **Input Features**: Size (m²), City, Property Type, Bedrooms, Bathrooms, Temporal features.
- **Target Variable**: Price or Price per m².
- **Version Control**: Semantic versioning stored in DB.

## Trend Forecast Model
- **Algorithm**: Facebook Prophet
- **Input**: Monthly aggregated price data.
- **Seasonality**: Yearly and Monthly components.
- **Output**: Forecasted prices with confidence intervals for 1-12 months.
