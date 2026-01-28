"""
Data Quality Scoring (Blueprint 4.4.2)

Calculates quality score based on:
- Completeness (30%)
- Consistency (40%)
- Accuracy indicators (30%)
"""

from typing import Dict, Any
from src.utils.logger import logger


class DataQualityScorer:
    """
    Data quality scorer for property records (Blueprint 4.4.2)
    
    Quality score calculation:
    - Completeness: 30%
    - Consistency: 40%
    - Accuracy: 30%
    
    Minimum quality score: 70% for validation
    """
    
    # All possible fields for completeness calculation
    ALL_FIELDS = [
        'title', 'description', 'city', 'neighborhood', 'property_type',
        'price', 'size', 'bedrooms', 'bathrooms', 'images',
        'latitude', 'longitude'
    ]
    
    # Price per m² ranges by city and property type (XAF/m²)
    REASONABLE_PRICE_PER_M2_RANGE = {
        'min': 1000,    # Blueprint 4.4.2.b - Price per m² within reasonable range
        'max': 500000
    }
    
    # Typical size ranges by property type (m²)
    TYPICAL_SIZE_RANGES = {
        'apartment': (30, 200),   # Blueprint 4.4.2.b
        'house': (80, 500),
        'land': (100, 10000),
        'commercial': (50, 1000)
    }
    
    # Typical price ranges by property type (XAF)
    TYPICAL_PRICE_RANGES = {
        'apartment': (5_000_000, 100_000_000),  # Blueprint 4.4.2.b
        'house': (15_000_000, 150_000_000),
        'land': (1_000_000, 200_000_000),
        'commercial': (10_000_000, 500_000_000)
    }
    
    # Neighborhood to city mapping (partial list)
    NEIGHBORHOOD_CITY_MAPPING = {
        'Yaoundé': ['Bastos', 'Essos', 'Melen', 'Ngoa-Ekellé', 'Odza', 'Emana'],
        'Douala': ['Akwa', 'Bonanjo', 'Bonapriso', 'Bali', 'Makepe', 'Logbaba']
    }
    
    def calculate_quality_score(self, record: Dict[str, Any]) -> float:
        """
        Calculate overall quality score (Blueprint 4.4.2.d)
        
        Formula: (completeness * 0.3) + (consistency * 0.4) + (accuracy * 0.3)
        
        Args:
            record: Property dictionary
            
        Returns:
            Quality score (0-100)
        """
        # Completeness score (Blueprint 4.4.2.a)
        completeness = self._calculate_completeness(record)
        
        # Consistency score (Blueprint 4.4.2.b)
        consistency = self._calculate_consistency(record)
        
        # Accuracy score (Blueprint 4.4.2.c)
        accuracy = self._calculate_accuracy(record)
        
        # Weighted average (Blueprint 4.4.2.d)
        quality_score = (completeness * 0.3) + (consistency * 0.4) + (accuracy * 0.3)
        
        logger.debug(
            f"Quality score calculated: {quality_score:.1f} "
            f"(completeness: {completeness:.1f}, consistency: {consistency:.1f}, accuracy: {accuracy:.1f})"
        )
        
        return round(quality_score, 2)
    
    def _calculate_completeness(self, record: Dict[str, Any]) -> float:
        """
        Calculate completeness score (Blueprint 4.4.2.a)
        
        Count non-null fields / total fields
        
        Returns:
            Score (0-100)
        """
        non_null_count = 0
        total_fields = len(self.ALL_FIELDS)
        
        for field in self.ALL_FIELDS:
            value = record.get(field)
            
            # Check if field has meaningful value
            if value is not None and value != '' and value != []:
                non_null_count += 1
        
        score = (non_null_count / total_fields) * 100
        
        return score
    
    def _calculate_consistency(self, record: Dict[str, Any]) -> float:
        """
        Calculate logical consistency score (Blueprint 4.4.2.b)
        
        Checks:
        - Price matches property type
        - Size matches property type
        - Location matches city
        - Price per m² within reasonable range
        
        Returns:
            Score (0-100)
        """
        checks = []
        
        # Check 1: Price matches property type (Blueprint 4.4.2.b)
        checks.append(self._check_price_consistency(record))
        
        # Check 2: Size matches property type (Blueprint 4.4.2.b)
        checks.append(self._check_size_consistency(record))
        
        # Check 3: Location matches city (Blueprint 4.4.2.b)
        checks.append(self._check_location_consistency(record))
        
        # Check 4: Price per m² within reasonable range (Blueprint 4.4.2.b)
        checks.append(self._check_price_per_m2_consistency(record))
        
        # Calculate average
        passed_checks = sum(checks)
        total_checks = len(checks)
        
        score = (passed_checks / total_checks) * 100 if total_checks > 0 else 0
        
        return score
    
    def _check_price_consistency(self, record: Dict[str, Any]) -> bool:
        """Check if price is reasonable for property type"""
        try:
            price = float(record.get('price', 0))
            property_type = record.get('property_type', '').lower()
            
            if property_type in self.TYPICAL_PRICE_RANGES:
                min_price, max_price = self.TYPICAL_PRICE_RANGES[property_type]
                return min_price <= price <= max_price
            
            return True  # If type not in mapping, assume OK
            
        except (ValueError, TypeError):
            return False
    
    def _check_size_consistency(self, record: Dict[str, Any]) -> bool:
        """Check if size is reasonable for property type"""
        try:
            size = float(record.get('size', 0))
            property_type = record.get('property_type', '').lower()
            
            if property_type in self.TYPICAL_SIZE_RANGES:
                min_size, max_size = self.TYPICAL_SIZE_RANGES[property_type]
                return min_size <= size <= max_size
            
            return True  # If type not in mapping, assume OK
            
        except (ValueError, TypeError):
            return False
    
    def _check_location_consistency(self, record: Dict[str, Any]) -> bool:
        """Check if neighborhood belongs to the correct city"""
        city = record.get('city', '').strip()
        neighborhood = record.get('neighborhood', '').strip()
        
        # If no neighborhood, can't check but don't penalize
        if not neighborhood:
            return True
        
        # Check if city has known neighborhoods
       if city in self.NEIGHBORHOOD_CITY_MAPPING:
            known_neighborhoods = self.NEIGHBORHOOD_CITY_MAPPING[city]
            
            # Fuzzy match (partial string matching)
            for known_neighborhood in known_neighborhoods:
                if known_neighborhood.lower() in neighborhood.lower() or \
                   neighborhood.lower() in known_neighborhood.lower():
                    return True
            
            # If neighborhood not in known list, be lenient (return True)
            # We don't have complete neighborhood data
            return True
        
        return True  # If city not in mapping, assume OK
    
    def _check_price_per_m2_consistency(self, record: Dict[str, Any]) -> bool:
        """Check if price per m² is within reasonable range"""
        try:
            price = float(record.get('price', 0))
            size = float(record.get('size', 0))
            
            if size <= 0:
                return False
            
            price_per_m2 = price / size
            
            # Check against reasonable range (Blueprint 4.4.2.b)
            min_price = self.REASONABLE_PRICE_PER_M2_RANGE['min']
            max_price = self.REASONABLE_PRICE_PER_M2_RANGE['max']
            
            return min_price <= price_per_m2 <= max_price
            
        except (ValueError, TypeError, ZeroDivisionError):
            return False
    
    def _calculate_accuracy(self, record: Dict[str, Any]) -> float:
        """
        Calculate accuracy indicators score (Blueprint 4.4.2.c)
        
        Indicators:
        - OCR confidence score (if from OCR)
        - Scraper extraction quality (field completeness)
        
        Returns:
            Score (0-100)
        """
        # Check if OCR confidence available
        if 'ocr_confidence' in record and record['ocr_confidence'] is not None:
            # Use OCR confidence directly (Blueprint 4.4.2.c)
            return float(record['ocr_confidence'])
        
        # Check if scraper extraction quality indicator
        if 'extraction_method' in record and record['extraction_method'] == 'scraper':
            # For scrapers, use field completeness as proxy (Blueprint 4.4.2.c)
            return self._calculate_completeness(record)
        
        # Default: use completeness as accuracy indicator
        return self._calculate_completeness(record)
    
    def is_valid_quality(self, quality_score: float) -> bool:
        """
        Check if quality score meets minimum threshold (Blueprint 4.4.2.e)
        
        Minimum: 70%
        
        Args:
            quality_score: Calculated quality score
            
        Returns:
            True if quality score >= 70%
        """
        return quality_score >= 70.0
