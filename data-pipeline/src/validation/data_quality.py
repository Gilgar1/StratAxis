from typing import Dict, Any
from ..utils.logger import setup_logger

class DataQualityChecker:
    """
    Data Quality Metric Engine (Blueprint 2.3.4.3).
    Calculates completeness, consistency, and accuracy scores.
    """
    def __init__(self):
        self.logger = setup_logger("validation.quality")
        self.required_fields = ["title", "price", "city", "property_type", "size"]
        self.optional_fields = ["neighborhood", "bedrooms", "bathrooms", "images"]

    def calculate_score(self, record: Dict[str, Any]) -> float:
        """Calculate weighted quality score (0-1.0)"""
        
        # 1. Completeness Score (30%)
        # Check presence of all core fields
        all_fields = self.required_fields + self.optional_fields
        filled_count = sum(1 for f in all_fields if record.get(f) not in [None, "", 0, 0.0, []])
        completeness = filled_count / len(all_fields)
        
        # 2. Consistency Score (40%)
        consistency = 1.0
        # Rule: Price must be within sane bounds for city/type in Cameroon
        price = record.get("price", 0)
        p_type = record.get("property_type")
        
        # Sane bounds logic (Placeholder for real data-driven bounds)
        if p_type == "apartment" and price > 500000000: # 500M XAF is very high for avg appt
             consistency *= 0.8
        if p_type == "land" and record.get("size", 0) < 100: # Smaller than 100m2 land is rare
             consistency *= 0.9

        # Rule: Size must be present for price_per_m2 calculation
        if record.get("size", 0) <= 0:
            consistency *= 0.5

        # 3. Accuracy Indicators (30%)
        # OCR data is inherently less accurate than direct scraping
        accuracy = 1.0
        if record.get("source") == "ocr":
            accuracy = 0.8 # Base penalty for OCR without manual verification
            
        final_score = (completeness * 0.3) + (consistency * 0.4) + (accuracy * 0.3)
        return round(final_score, 2)

    def is_valid(self, record: Dict[str, Any], threshold: float = 0.7) -> bool:
        """Blueprint 2.3.4.7: Automatic rejection below 70% quality score"""
        score = self.calculate_score(record)
        record["quality_score"] = score
        return score >= threshold
