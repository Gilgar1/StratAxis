import pandas as pd
from sklearn.model_selection import train_test_split, GridSearchCV, RandomizedSearchCV
from sklearn.ensemble import RandomForestRegressor
from xgboost import XGBRegressor
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import joblib

# Load preprocessed features
def load_features(path):
    return pd.read_csv(path)

# Train models
def train_models(X_train, y_train):
    models = {
        "RandomForest": RandomForestRegressor(),
        "XGBoost": XGBRegressor(),
        "LinearRegression": LinearRegression(),
        "DecisionTree": DecisionTreeRegressor()
    }
    for name, model in models.items():
        model.fit(X_train, y_train)
        print(f"Trained {name}")
    return models

# Evaluate models
def evaluate_model(model, X_test, y_test):
    predictions = model.predict(X_test)
    return {
        "RMSE": mean_squared_error(y_test, predictions, squared=False),
        "MAE": mean_absolute_error(y_test, predictions),
        "R2": r2_score(y_test, predictions)
    }

# Save best model
def save_model(model, path):
    joblib.dump(model, path)

# Example usage
if __name__ == "__main__":
    data = load_features("processed_features.csv")
    X = data.drop(columns=['target'])
    y = data['target']
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.15, random_state=42)

    models = train_models(X_train, y_train)
    for name, model in models.items():
        metrics = evaluate_model(model, X_test, y_test)
        print(f"{name} Metrics: {metrics}")

    best_model = models["RandomForest"]  # Example selection
    save_model(best_model, "best_model.joblib")