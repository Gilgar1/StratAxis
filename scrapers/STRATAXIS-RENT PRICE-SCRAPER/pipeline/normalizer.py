import yaml
import re
from typing import Dict, Any, Optional
from utils.logger import setup_logger
from utils.price_parser import PriceParser
from utils.date_extractor import DateExtractor

class Normalizer:
    """Normalize raw listing data to standardized format"""
    
    def __init__(self, config_dir: str = "config"):
        self.logger = setup_logger("normalizer")
        self.price_parser = PriceParser()
        self.date_extractor = DateExtractor()
        
        # Load configurations
        self.housing_types = self._load_yaml(f"{config_dir}/housing_types.yaml")
        self.neighborhoods = self._load_yaml(f"{config_dir}/neighborhoods.yaml")
    
    def _load_yaml(self, filepath: str) -> dict:
        """Load YAML configuration file"""
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                return yaml.safe_load(f)
        except Exception as e:
            self.logger.error(f"Failed to load {filepath}: {e}")
            return {}
    
    def normalize_listing(self, raw_listing: Dict[str, Any]) -> Dict[str, Any]:
        """
        Normalize a single listing
        
        Args:
            raw_listing: Raw listing dictionary
            
        Returns:
            Normalized listing dictionary
        """
        try:
            # Parse price
            monthly_rent, currency, frequency = self.price_parser.parse_price(
                raw_listing.get('rent_price_raw', '')
            )
            
            # Extract date
            year, month = self.date_extractor.extract_date(
                raw_listing.get('listing_date', '')
            )
            
            # Normalize housing type
            housing_type = self._normalize_housing_type(
                raw_listing.get('housing_type_raw', ''),
                raw_listing.get('full_description', ''),
                raw_listing.get('bedrooms_raw', '')
            )
            
            # Normalize neighborhood
            city = raw_listing.get('city', '').lower()
            neighborhood = self._normalize_neighborhood(
                raw_listing.get('neighborhood', ''),
                city
            )
            
            # Parse size
            size_sqm = self._parse_size(raw_listing.get('size_raw', ''))
            
            # Compute rent per sqm
            rent_per_sqm = None
            if monthly_rent and size_sqm:
                rent_per_sqm = monthly_rent / size_sqm
            
            # Build normalized listing
            normalized = {
                # Location
                'city': city,
                'neighborhood': neighborhood,
                
                # Property type
                'housing_type': housing_type,
                'bedrooms': self._parse_bedrooms(raw_listing.get('bedrooms_raw', '')),
                'size_sqm': size_sqm,
                
                # Price
                'monthly_rent_xaf': monthly_rent,
                'rent_per_sqm': rent_per_sqm,
                
                # Time
                'year': year,
                'month': month,
                
                # Metadata
                'source_site': raw_listing.get('source_site', ''),
                'listing_url': raw_listing.get('listing_url', ''),
                
                # Quality flags
                'has_price': monthly_rent is not None,
                'has_size': size_sqm is not None,
                'has_neighborhood': bool(neighborhood),
                'has_housing_type': bool(housing_type),
                'has_date': year is not None,
            }
            
            return normalized
            
        except Exception as e:
            self.logger.error(f"Error normalizing listing: {e}")
            return None
    
    def _normalize_housing_type(self, raw_type: str, description: str, bedrooms: str) -> str:
        """Normalize housing type to standard categories"""
        text = f"{raw_type} {description}".lower()
        
        # Check each housing type category
        for standard_type, config in self.housing_types.items():
            keywords = config.get('keywords', [])
            for keyword in keywords:
                if keyword.lower() in text:
                    return standard_type
        
        # Fallback: use bedrooms count
        if bedrooms:
            try:
                bed_count = int(bedrooms)
                if bed_count == 0:
                    return 'studio'
                elif bed_count == 1:
                    return 'one_bedroom'
                elif bed_count == 2:
                    return 'two_bedroom'
                elif bed_count >= 3:
                    return 'three_plus_bedroom'
            except ValueError:
                pass
        
        return 'unknown'
    
    def _normalize_neighborhood(self, raw_neighborhood: str, city: str) -> str:
        """Normalize neighborhood name"""
        if not raw_neighborhood or city not in self.neighborhoods:
            return ''
        
        raw_lower = raw_neighborhood.lower().strip()
        
        # Check against known neighborhoods for the city
        city_neighborhoods = self.neighborhoods[city]
        for standard_name, variants in city_neighborhoods.items():
            for variant in variants:
                if variant.lower() in raw_lower or raw_lower in variant.lower():
                    return standard_name
        
        # Return cleaned raw name if no match
        cleaned = re.sub(r'[^\w\s-]', '', raw_neighborhood)
        cleaned = re.sub(r'\s+', ' ', cleaned).strip()
        return cleaned[:50]  # Limit length
    
    def _parse_bedrooms(self, bedrooms_raw: str) -> Optional[int]:
        """Parse bedroom count"""
        if not bedrooms_raw:
            return None
        
        try:
            # Extract first number
            match = re.search(r'\d+', str(bedrooms_raw))
            if match:
                return int(match.group())
        except ValueError:
            pass
        
        return None
    
    def _parse_size(self, size_raw: str) -> Optional[float]:
        """Parse size to sqm"""
        if not size_raw:
            return None
        
        try:
            # Extract number
            match = re.search(r'(\d+(?:\.\d+)?)', str(size_raw))
            if match:
                return float(match.group(1))
        except ValueError:
            pass
        
        return None
