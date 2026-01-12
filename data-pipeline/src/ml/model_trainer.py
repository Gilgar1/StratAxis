from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split, GridSearchCV
import joblib
from pathlib import Path
from ..utils.logger import setup_logger
from ..utils.config import config

class ModelTrainer:
    def __init__(self, model_dir: str = "./models"):
        self.logger = setup_logger("ml.trainer")
        self.model_dir = Path(model_dir)
        self.model_dir.mkdir(parents=True, exist_ok=True)

    def train_price_model(self, X, y):
        self.logger.info("Training price prediction model")
        
        test_size = config.get("ml.test_size", 0.15)
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=test_size, random_state=42)
        
        # Hyperparameter tuning
        param_grid = {
            'n_estimators': [100, 200],
            'max_depth': [None, 10, 20],
            'min_samples_split': [2, 5]
        }
        
        rf = RandomForestRegressor(random_state=42)
        grid_search = GridSearchCV(estimator=rf, param_grid=param_grid, cv=3, scoring='neg_mean_absolute_error')
        grid_search.fit(X_train, y_train)
        
        best_model = grid_search.best_estimator_
        self.logger.info(f"Best parameters: {grid_search.best_params_}")
        
        # Save model
        model_path = self.model_dir / "price_prediction_v1.joblib"
        joblib.dump(best_model, model_path)
        self.logger.info(f"Model saved to {model_path}")
        
        return best_model, X_test, y_test
