"""
StratAxis - Text Normalization Utilities
"""

import re
from typing import Optional, Tuple
from unidecode import unidecode


class PriceNormalizer:
    """Normalize price strings to numeric XAF"""
    
    @staticmethod
    def normalize(price_str: str) -> Optional[float]:
        """
        Convert price string to numeric XAF
        
        Handles:
        - "50 million FCFA" → 50000000
        - "50M" → 50000000
        - "FCFA 50,000,000" → 50000000
        - "25 milliards" → 25000000000
        
        Args:
            price_str: Raw price string
        
        Returns:
            Numeric price in XAF or None if invalid
        """
        if not price_str or not isinstance(price_str, str):
            return None
        
        # Normalize text
        text = price_str.lower().strip()
        text = unidecode(text)  # Remove accents
        
        # Remove currency symbols and common text
        text = re.sub(r'(fcfa|cfa|xaf|francs?|f)', '', text, flags=re.IGNORECASE)
        text = text.replace(',', '').replace(' ', '')
        
        # Extract number and multiplier
        # Pattern: number followed by optional multiplier (M, million, milliards, etc.)
        pattern = r'(\d+(?:\.\d+)?)\s*(m|million|milliard|mds|mrd|k|mille)?'
        match = re.search(pattern, text, re.IGNORECASE)
        
        if not match:
            return None
        
        try:
            number = float(match.group(1))
            multiplier_text = match.group(2) if match.group(2) else ''
            
            # Determine multiplier
            multiplier = 1
            if multiplier_text:
                mult_lower = multiplier_text.lower()
                if mult_lower in ['m', 'million']:
                    multiplier = 1_000_000
                elif mult_lower in ['milliard', 'mds', 'mrd']:
                    multiplier = 1_000_000_000
                elif mult_lower in ['k', 'mille']:
                    multiplier = 1_000
            
            price = number * multiplier
            
            # Sanity check: reasonable land price range in XAF
            if 100_000 <= price <= 100_000_000_000:  # 100k to 100 billion XAF
                return price
            
            return None
            
        except (ValueError, AttributeError):
            return None


class LandSizeNormalizer:
    """Normalize land size strings to square meters"""
    
    @staticmethod
    def normalize(size_str: str) -> Optional[float]:
        """
        Convert land size to square meters (m²)
        
        Handles:
        - "500 m²" → 500
        - "1 hectare" → 10000
        - "0.5 ha" → 5000
        - "5000 sqm" → 5000
        
        Args:
            size_str: Raw size string
        
        Returns:
            Size in m² or None if invalid
        """
        if not size_str or not isinstance(size_str, str):
            return None
        
        # Normalize text
        text = size_str.lower().strip()
        text = unidecode(text)
        
        # Remove common separators
        text = text.replace(',', '').replace(' ', '')
        
        # Pattern: number followed by unit
        pattern = r'(\d+(?:\.\d+)?)\s*(m2|m²|sqm|squaremeters?|metres?carres?|ha|hectares?)?'
        match = re.search(pattern, text, re.IGNORECASE)
        
        if not match:
            return None
        
        try:
            number = float(match.group(1))
            unit = match.group(2) if match.group(2) else 'm2'
            
            # Convert to m²
            if unit and ('ha' in unit or 'hectare' in unit):
                size_sqm = number * 10_000
            else:
                # Assume m² by default
                size_sqm = number
            
            # Sanity check: reasonable land size range
            if 10 <= size_sqm <= 10_000_000:  # 10 m² to 1000 hectares
                return size_sqm
            
            return None
            
        except (ValueError, AttributeError):
            return None


class NeighborhoodNormalizer:
    """Standardize neighborhood names"""
    
    # Predefined mappings for common variations
    NEIGHBORHOOD_MAPPINGS = {
        # Douala
        'bonapriso': ['bonapriso', 'bonapriso - douala', 'bonapriso dla'],
        'akwa': ['akwa', 'akwa douala', 'quartier akwa'],
        'bonanjo': ['bonanjo', 'bonanjo douala'],
        'deido': ['deido', 'deïdo'],
        'bonaberi': ['bonaberi', 'bonabéri'],
        'bepanda': ['bepanda', 'bépanda'],
        'makepe': ['makepe', 'makèpe'],
        'logbaba': ['logbaba'],
        'ndogpassi': ['ndogpassi', 'ndogpasi'],
        'pk10': ['pk10', 'pk 10', 'pk-10'],
        'pk12': ['pk12', 'pk 12', 'pk-12'],
        
        # Yaoundé
        'bastos': ['bastos', 'quartier bastos'],
        'ngoa-ekelle': ['ngoa-ekelle', 'ngoa ekelle', 'ngoaekelle'],
        'nlongkak': ['nlongkak', 'n-longkak'],
        'omnisport': ['omnisport', 'omni sport'],
        'mvan': ['mvan', 'mvant'],
        'essos': ['essos'],
        'emana': ['emana', 'émana'],
        'odza': ['odza'],
        'mimboman': ['mimboman'],
        'ekounou': ['ekounou', 'ékonou'],
    }
    
    @classmethod
    def normalize(cls, neighborhood_str: str) -> str:
        """
        Standardize neighborhood name
        
        Args:
            neighborhood_str: Raw neighborhood string
        
        Returns:
            Standardized neighborhood name
        """
        if not neighborhood_str or not isinstance(neighborhood_str, str):
            return "Unknown"
        
        # Normalize text
        text = neighborhood_str.strip().lower()
        text = unidecode(text)
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Check against known mappings
        for standard_name, variations in cls.NEIGHBORHOOD_MAPPINGS.items():
            if text in variations:
                return standard_name.title()
        
        # If no mapping found, return cleaned version
        return ' '.join(word.capitalize() for word in text.split())
