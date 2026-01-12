from typing import List, Dict, Any
import numpy as np
from ..utils.logger import setup_logger

class OutlierDetector:
    """
    Outlier Detection System (Blueprint 2.3.4.4).
    Combines statistical Z-scores and hard business logic bounds.
    """
    def __init__(self, z_threshold: float = 3.0):
        self.logger = setup_logger("validation.outliers")
        self.z_threshold = z_threshold
        
        # Business logic bounds for price_per_m2 in XAF (Blueprint 2.3.4.4.2)
        self.MIN_PRICE_PER_M2 = 1000.0
        self.MAX_PRICE_PER_M2 = 500000.0

    def detect_and_flag(self, records: List[Dict[str, Any]]):
        """Flag records that are suspicious based on statistical or business bounds."""
        if not records:
            return
            
        values = [r.get("price_per_m2", 0) for r in records if r.get("price_per_m2")]
        if len(values) < 5: # Not enough for statistics
            mean, std = 0, 0
        else:
            mean = np.mean(values)
            std = np.std(values)

        for record in records:
            val = record.get("price_per_m2", 0)
            
            # 1. Business Logic Check
            is_business_outlier = (val < self.MIN_PRICE_PER_M2 or val > self.MAX_PRICE_PER_M2)
            
            # 2. Statistical Check
            is_statistical_outlier = False
            if std > 0:
                z_score = abs((val - mean) / std)
                is_statistical_outlier = z_score > self.z_threshold
            
            # Record flagging
            if is_business_outlier or is_statistical_outlier:
                record["validation_status"] = "rejected"
                record["quality_score"] = min(record.get("quality_score", 1.0), 0.5)
                self.logger.warning(f"Outlier detected for {record.get('title')}: {val} XAF/m2")
            else:
                record["validation_status"] = "validated"
