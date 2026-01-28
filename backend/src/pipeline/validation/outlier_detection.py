"""
Outlier Detection (Blueprint 4.4.3)

Detects:
- Statistical outliers (Z-score > 3)
- Business logic out liers
"""

from typing import Dict, Any, List, Tuple
import statistics
from sqlmodel import Session, select

from src.models.property import Property, ValidationStatus
from src.utils.logger import logger


class OutlierDetector:
    """
    Outlier detector for property records (Blueprint 4.4.3)
    
    Detection methods:
    - Statistical outliers: Z-score > 3 for price per m²
    - Business logic outliers: Extreme values that violate business rules
    """
    
    def __init__(self, session: Session):
        self.session = session
        # Cache for city/type statistics
        self._stats_cache = {}
    
    def detect_outliers(self, record: Dict[str, Any]) -> Tuple[bool, List[str], float]:
        """
        Detect outliers in property record (Blueprint 4.4.3)
        
        Args:
            record: Property dictionary
            
        Returns:
            Tuple of (is_outlier, list_of_outlier_reasons, quality_penalty)
        """
        outlier_reasons = []
        quality_penalty = 0.0
        
        # Statistical outliers (Blueprint 4.4.3.a)
        is_statistical_outlier, stat_reason = self._check_statistical_outliers(record)
        if is_statistical_outlier:
            outlier_reasons.append(stat_reason)
            quality_penalty = 10.0  # Blueprint 4.4.3.c
        
        # Business logic outliers (Blueprint 4.4.3.b)
        business_outliers = self._check_business_logic_outliers(record)
        outlier_reasons.extend(business_outliers)
        
        if business_outliers and not is_statistical_outlier:
            quality_penalty = 10.0  # Blueprint 4.4.3.c
        
        is_outlier = len(outlier_reasons) > 0
        
        # Do not auto-reject outliers (Blueprint 4.4.3.d)
        # They are flagged for manual review
        
        return is_outlier, outlier_reasons, quality_penalty
    
    def _check_statistical_outliers(self, record: Dict[str, Any]) -> Tuple[bool, str]:
        """
        Check for statistical outliers using Z-score (Blueprint 4.4.3.a)
        
        Z-score > 3 for price per m² (by city and property type)
        
        Returns:
            Tuple of (is_outlier, reason_message)
        """
        try:
            city = record.get('city', '').strip()
            property_type = record.get('property_type', '').lower().strip()
            price = float(record.get('price', 0))
            size = float(record.get('size', 0))
            
            if size <= 0:
                return False, ""
            
            price_per_m2 = price / size
            
            # Get statistics for this city/property_type combination
            stats = self._get_price_per_m2_stats(city, property_type)
            
            if not stats:
                # Not enough data for statistical analysis
                return False, ""
            
            mean = stats['mean']
            std_dev = stats['std_dev']
            
            if std_dev == 0:
                # No variance, can't calculate Z-score
                return False, ""
            
            # Calculate Z-score (Blueprint 4.4.3.a)
            z_score = abs((price_per_m2 - mean) / std_dev)
            
            if z_score > 3:
                return True, f"Statistical outlier: Z-score={z_score:.2f} for price/m²={price_per_m2:,.0f} XAF (mean={mean:,.0f}, std={std_dev:,.0f})"
            
            return False, ""
            
        except (ValueError, TypeError, ZeroDivisionError) as e:
            logger.debug(f"Error in statistical outlier detection: {e}")
            return False, ""
    
    def _get_price_per_m2_stats(self, city: str, property_type: str) -> Dict[str, float]:
        """
        Get price per m² statistics for city/property_type combination
        
        Returns cached stats or calculates from database
        """
        cache_key = f"{city}_{property_type}"
        
        # Check cache
        if cache_key in self._stats_cache:
            return self._stats_cache[cache_key]
        
        # Query database for validated properties
        properties = self.session.exec(
            select(Property).where(
                Property.city == city,
                Property.property_type == property_type,
                Property.validation_status == ValidationStatus.VALIDATED,
                Property.price_per_m2 > 0
            )
        ).all()
        
        if len(properties) < 10:
            # Not enough data for meaningful statistics
            return {}
        
        # Calculate statistics
        prices_per_m2 = [float(p.price_per_m2) for p in properties]
        
        stats = {
            'mean': statistics.mean(prices_per_m2),
            'std_dev': statistics.stdev(prices_per_m2) if len(prices_per_m2) > 1 else 0,
            'count': len(prices_per_m2)
        }
        
        # Cache for future use
        self._stats_cache[cache_key] = stats
        
        return stats
    
    def _check_business_logic_outliers(self, record: Dict[str, Any]) -> List[str]:
        """
        Check for business logic outliers (Blueprint 4.4.3.b)
        
        Business rules:
        - Price per m² < 1,000 XAF (likely data error)
        - Price per m² > 500,000 XAF (likely luxury/commercial, flag for review)
        - Size > 1,000 m² for apartments (likely house mislabeled)
        - Price > 1,000,000,000 XAF (likely data entry error)
        
        Returns:
            List of outlier reason messages
        """
        outliers = []
        
        try:
            price = float(record.get('price', 0))
            size = float(record.get('size', 0))
            property_type = record.get('property_type', '').lower().strip()
            
            # Calculate price per m²
            price_per_m2 = price / size if size > 0 else 0
            
            # Check 1: Price per m² < 1,000 XAF (Blueprint 4.4.3.b)
            if 0 < price_per_m2 < 1000:
                outliers.append(
                    f"Price per m² too low: {price_per_m2:,.0f} XAF/m² (min: 1,000)"
                )
            
            # Check 2: Price per m² > 500,000 XAF (Blueprint 4.4.3.b)
            if price_per_m2 > 500000:
                outliers.append(
                    f"Price per m² very high: {price_per_m2:,.0f} XAF/m² (max: 500,000) - possible luxury/commercial"
                )
            
            # Check 3: Size > 1,000 m² for apartments (Blueprint 4.4.3.b)
            if property_type == 'apartment' and size > 1000:
                outliers.append(
                    f"Apartment size too large: {size:,.0f} m² (max: 1,000) - possibly mislabeled as house"
                )
            
            # Check 4: Price > 1,000,000,000 XAF (Blueprint 4.4.3.b)
            if price > 1_000_000_000:
                outliers.append(
                    f"Price extremely high: {price:,.0f} XAF (max: 1,000,000,000) - possible data entry error"
                )
            
        except (ValueError, TypeError, ZeroDivisionError) as e:
            logger.debug(f"Error in business logic outlier detection: {e}")
        
        return outliers
    
    def clear_cache(self):
        """Clear statistics cache (call when new data is loaded)"""
        self._stats_cache = {}
