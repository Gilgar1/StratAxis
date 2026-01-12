from typing import Dict, Any, List
import re
from datetime import datetime
from ..utils.logger import setup_logger

class Transformer:
    """
    Data Transformation Layer: standardizes heterogeneous inputs from scrapers and OCR.
    Follows blueprint 2.3.3.2 normalization rules.
    """
    def __init__(self):
        self.logger = setup_logger("etl.transformer")
        self.city_mapping = {
            "yaounde": "Yaoundé",
            "yaoundé": "Yaoundé",
            "douala": "Douala",
            "yde": "Yaoundé",
            "dla": "Douala"
        }
        self.neighborhood_patterns = {
            "Yaoundé": ["Bastos", "Omnisport", "Ngousso", "Mvan", "Emana", "Biyem-Assi"],
            "Douala": ["Bonapriso", "Akwa", "Kotto", "Bonamoussadi", "Logbessou"]
        }

    def transform_record(self, record: Dict[str, Any]) -> Dict[str, Any]:
        transformed = record.copy()

        # 1. Price Normalization (Blueprint 2.3.3.2.1)
        if isinstance(transformed.get("price"), str):
            price_str = re.sub(r'[^\d]', '', transformed["price"])
            transformed["price"] = float(price_str) if price_str else 0.0
        
        transformed["currency"] = "XAF"

        # 2. Location & City Standardization (Blueprint 2.3.3.2.2)
        location_raw = str(transformed.get("location", "")).lower()
        standardized_city = "Other"
        for key, val in self.city_mapping.items():
            if key in location_raw:
                standardized_city = val
                break
        transformed["city"] = standardized_city
        
        # Neighborhood extraction (simple match)
        if standardized_city in self.neighborhood_patterns:
            for nb in self.neighborhood_patterns[standardized_city]:
                if nb.lower() in location_raw:
                    transformed["neighborhood"] = nb
                    break

        # 3. Property Type categorization (Blueprint 2.3.3.2.3)
        prop_type = str(transformed.get("property_type", "")).lower()
        if any(x in prop_type for x in ["app", "studio", "chambre"]):
            transformed["property_type"] = "apartment"
        elif any(x in prop_type for x in ["maison", "villa", "duplex"]):
            transformed["property_type"] = "house"
        elif any(x in prop_type for x in ["terrain", "lot", "parcelle"]):
            transformed["property_type"] = "land"
        elif any(x in prop_type for x in ["comm", "bureau", "magasin"]):
            transformed["property_type"] = "commercial"
        else:
            transformed["property_type"] = "apartment"

        # 4. Size & Unit Conversion (Blueprint 2.3.3.2.4)
        size_raw = transformed.get("size", 0)
        if isinstance(size_raw, str):
            # Unit conversion: 1 acre = 4046.86 m2
            if "acre" in size_raw.lower():
                val = re.sub(r'[^\d.]', '', size_raw)
                transformed["size"] = float(val) * 4046.86 if val else 0.0
            else:
                val = re.sub(r'[^\d.]', '', size_raw)
                transformed["size"] = float(val) if val else 0.0

        # 5. Price per m2 (Blueprint 2.3.3.2.5)
        if transformed.get("size", 0) > 0 and transformed.get("price", 0) > 0:
            transformed["price_per_m2"] = transformed["price"] / transformed["size"]
        else:
            transformed["price_per_m2"] = 0.0

        # 6. Cleaning & Metadata (Blueprint 2.3.3.2.6)
        transformed["scraped_at"] = datetime.utcnow().isoformat()
        transformed["version"] = 1
        
        return transformed

    def transform_batch(self, records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        self.logger.info(f"Transforming batch of {len(records)} records")
        return [self.transform_record(r) for r in records]
