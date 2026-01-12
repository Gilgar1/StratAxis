from typing import Dict, Any
from ..utils.logger import setup_logger

class SchemaValidator:
    def __init__(self):
        self.logger = setup_logger("validation.schema")
        self.required_fields = ["title", "price", "city", "property_type", "size"]

    def validate(self, record: Dict[str, Any]) -> bool:
        """Basic schema validation for the property record"""
        for field in self.required_fields:
            if field not in record or record[field] is None:
                self.logger.warning(f"Record rejected: missing required field {field}")
                return False
        
        # Range validation
        if record.get("price", 0) <= 0:
            self.logger.warning(f"Record rejected: invalid price {record.get('price')}")
            return False
            
        if record.get("size", 0) <= 0:
            self.logger.warning(f"Record rejected: invalid size {record.get('size')}")
            return False
            
        return True
