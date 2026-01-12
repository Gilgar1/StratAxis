from typing import List, Dict, Any
import numpy as np
from ..utils.logger import setup_logger

class OutlierDetector:
    def __init__(self, z_threshold: float = 3.0):
        self.logger = setup_logger("validation.outliers")
        self.z_threshold = z_threshold

    def detect_outliers(self, records: List[Dict[str, Any]], field: str = "price_per_m2") -> List[bool]:
        """Detect outliers using Z-score purely for statistical context"""
        values = [r.get(field, 0) for r in records if isinstance(r.get(field), (int, float))]
        if not values:
            return [False] * len(records)
            
        mean = np.mean(values)
        std = np.std(values)
        
        if std == 0:
            return [False] * len(records)
            
        outliers = []
        for r in records:
            val = r.get(field, 0)
            if not isinstance(val, (int, float)):
                outliers.append(True) # Treat as suspicious
                continue
                
            z_score = abs((val - mean) / std)
            outliers.append(z_score > self.z_threshold)
            
        return outliers
