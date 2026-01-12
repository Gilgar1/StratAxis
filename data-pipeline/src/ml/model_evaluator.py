from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import numpy as np
from ..utils.logger import setup_logger

class ModelEvaluator:
    def __init__(self):
        self.logger = setup_logger("ml.evaluator")

    def evaluate_regression(self, y_true, y_pred):
        mae = mean_absolute_error(y_true, y_pred)
        rmse = np.sqrt(mean_squared_error(y_true, y_pred))
        r2 = r2_score(y_true, y_pred)
        
        metrics = {
            "MAE": float(mae),
            "RMSE": float(rmse),
            "R2": float(r2)
        }
        
        self.logger.info(f"Evaluation metrics: {metrics}")
        return metrics
