from typing import Dict, Any, List
import re
from datetime import datetime
from ..utils.logger import setup_logger

class Transformer:
    def __init__(self):
        self.logger = setup_logger("etl.transformer")
        self.city_mapping = {
            "yaounde": "Yaoundé",
            "douala": "Douala",
            "yde": "Yaoundé",
            "dla": "Douala"
        }

    def transform_record(self, record: Dict[str, Any]) -> Dict[str, Any]:
        """Apply normalization rules defined in blueprint 4.3.3"""
        transformed = record.copy()

        # 1. Currency/Price normalization
        if isinstance(transformed.get("price"), str):
            # Remove non-digits
            price_str = re.sub(r'[^\d]', '', transformed["price"])
            transformed["price"] = float(price_str) if price_str else 0.0

        # 2. Location standardization
        location = str(transformed.get("location", "")).lower()
        transformed["city"] = "Other"
        for key, val in self.city_mapping.items():
            if key in location:
                transformed["city"] = val
                break
        
        # 3. Property type categorization
        prop_type = str(transformed.get("property_type", "")).lower()
        if "app" in prop_type:
            transformed["property_type"] = "apartment"
        elif "maison" in prop_type or "villa" in prop_type:
            transformed["property_type"] = "house"
        elif "terrain" in prop_type or "land" in prop_type:
            transformed["property_type"] = "land"
        elif "comm" in prop_type or "bureau" in prop_type:
            transformed["property_type"] = "commercial"
        else:
            transformed["property_type"] = "apartment" # Default for MVP

        # 4. Size normalization (m2)
        if isinstance(transformed.get("size"), str):
            size_str = re.sub(r'[^\d.]', '', transformed["size"])
            transformed["size"] = float(size_str) if size_str else 0.0
            
        # 5. Price per m2 calculation
        if transformed.get("size", 0) > 0 and transformed.get("price", 0) > 0:
            transformed["price_per_m2"] = transformed["price"] / transformed["size"]
        else:
            transformed["price_per_m2"] = 0.0

        # 6. Metadata
        transformed["updated_at"] = datetime.utcnow().isoformat()
        
        return transformed

    def transform_batch(self, records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        self.logger.info(f"Transforming batch of {len(records)} records")
        return [self.transform_record(r) for r in records]
