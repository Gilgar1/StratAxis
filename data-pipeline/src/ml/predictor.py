import joblib
import pandas as pd
from pathlib import Path
from ..utils.logger import setup_logger

class Predictor:
    def __init__(self, model_path: str = "./models/price_prediction_v1.joblib"):
        self.logger = setup_logger("ml.predictor")
        if Path(model_path).exists():
            self.model = joblib.load(model_path)
        else:
            self.logger.warning(f"Model not found at {model_path}")
            self.model = None

    def predict(self, features: pd.DataFrame):
        if not self.model:
            raise ValueError("Model not loaded")
        return self.model.predict(features)
