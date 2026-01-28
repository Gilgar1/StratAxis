"""
Schema Validation (Blueprint 4.4.1)

Validates:
- Required fields presence
- Data types
- Value ranges
- Enum values
"""

from typing import Dict, Any, Tuple, List
from datetime import datetime

from src.models.property import PropertyCity, PropertyType
from src.utils.logger import logger


class SchemaValidator:
    """
    Schema validator for property data (Blueprint 4.4.1)
    
    Validates:
    - Required fields
    - Data types
    - Value ranges
    - Enum constraints
    """
    
    # Required fields (Blueprint 4.4.1.a)
    REQUIRED_FIELDS = [
        'title', 'city', 'property_type', 'price', 'size'
    ]
    
    # Cameroon geographic bounds (approximate)
    CAMEROON_BOUNDS = {
        'lat_min': 1.5,
        'lat_max': 13.1,
        'lon_min': 8.3,
        'lon_max': 16.3
    }
    
    # Allowed cities (Blueprint 4.4.1.d)
    ALLOWED_CITIES = ['Yaoundé', 'Douala']
    
    # Allowed property types (Blueprint 4.4.1.d)
    ALLOWED_PROPERTY_TYPES = ['apartment', 'house', 'land', 'commercial']
    
    def validate(self, record: Dict[str, Any]) -> Tuple[bool, List[str]]:
        """
        Validate property record againstschema (Blueprint 4.4.1)
        
        Args:
            record: Property dictionary to validate
            
        Returns:
            Tuple of (is_valid, list_of_errors)
        """
        errors = []
        
        # Check required fields (Blueprint 4.4.1.a)
        for field in self.REQUIRED_FIELDS:
            if field not in record or record[field] is None or record[field] == '':
                errors.append(f"Required field '{field}' is missing or empty")
        
        # If required fields missing, no point continuing
        if errors:
            return False, errors
        
        # Validate data types (Blueprint 4.4.1.b)
        type_errors = self._validate_types(record)
        errors.extend(type_errors)
        
        # Validate ranges (Blueprint 4.4.1.c)
        range_errors = self._validate_ranges(record)
        errors.extend(range_errors)
        
        # Validate enums (Blueprint 4.4.1.d)
        enum_errors = self._validate_enums(record)
        errors.extend(enum_errors)
        
        # Reject if schema validation fails (Blueprint 4.4.1.e)
        is_valid = len(errors) == 0
        
        if not is_valid:
            logger.warning(f"Schema validation failed for record: {errors}")
        
        return is_valid, errors
    
    def _validate_types(self, record: Dict[str, Any]) -> List[str]:
        """Validate data types (Blueprint 4.4.1.b)"""
        errors = []
        
        # Price must be number
        if 'price' in record:
            try:
                float(record['price'])
            except (ValueError, TypeError):
                errors.append(f"Price must be a number, got: {record['price']}")
        
        # Size must be number
        if 'size' in record:
            try:
                float(record['size'])
            except (ValueError, TypeError):
                errors.append(f"Size must be a number, got: {record['size']}")
        
        # Bedrooms must be integer
        if 'bedrooms' in record and record['bedrooms'] is not None:
            try:
                int(record['bedrooms'])
            except (ValueError, TypeError):
                errors.append(f"Bedrooms must be an integer, got: {record['bedrooms']}")
        
        # Bathrooms must be integer
        if 'bathrooms' in record and record['bathrooms'] is not None:
            try:
                int(record['bathrooms'])
            except (ValueError, TypeError):
                errors.append(f"Bathrooms must be an integer, got: {record['bathrooms']}")
        
        return errors
    
    def _validate_ranges(self, record: Dict[str, Any]) -> List[str]:
        """Validate value ranges (Blueprint 4.4.1.c)"""
        errors = []
        
        # Price > 0
        try:
            price = float(record.get('price', 0))
            if price <= 0:
                errors.append(f"Price must be > 0, got: {price}")
        except:
            pass  # Type error already caught
        
        # Size > 0
        try:
            size = float(record.get('size', 0))
            if size <= 0:
                errors.append(f"Size must be > 0, got: {size}")
        except:
            pass  # Type error already caught
        
        # Coordinates within Cameroon bounds (if present)
        if 'latitude' in record and 'longitude' in record:
            try:
                lat = float(record['latitude'])
                lon = float(record['longitude'])
                
                if not (self.CAMEROON_BOUNDS['lat_min'] <= lat <= self.CAMEROON_BOUNDS['lat_max']):
                    errors.append(f"Latitude {lat} outside Cameroon bounds")
                
                if not (self.CAMEROON_BOUNDS['lon_min'] <= lon <= self.CAMEROON_BOUNDS['lon_max']):
                    errors.append(f"Longitude {lon} outside Cameroon bounds")
            except (ValueError, TypeError):
                errors.append("Invalid coordinate format")
        
        return errors
    
    def _validate_enums(self, record: Dict[str, Any]) -> List[str]:
        """Validate enum values (Blueprint 4.4.1.d)"""
        errors = []
        
        # City must be in allowed list
        city = record.get('city', '').strip()
        if city and city not in self.ALLOWED_CITIES:
            errors.append(f"City '{city}' not in allowed list: {self.ALLOWED_CITIES}")
        
        # Property type must be in allowed list
        property_type = record.get('property_type', '').strip().lower()
        if property_type and property_type not in self.ALLOWED_PROPERTY_TYPES:
            errors.append(f"Property type '{property_type}' not in allowed list: {self.ALLOWED_PROPERTY_TYPES}")
        
        return errors
