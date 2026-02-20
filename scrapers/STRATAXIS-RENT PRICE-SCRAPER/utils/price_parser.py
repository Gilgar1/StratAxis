import re
from typing import Tuple, Optional

class PriceParser:
    """Parse and normalize rental prices to monthly XAF"""
    
    # Currency patterns
    CURRENCY_PATTERNS = {
        'XAF': r'(?:XAF|FCFA|CFA|F\s*CFA)',
        'EUR': r'(?:EUR|€)',
        'USD': r'(?:USD|\$)',
    }
    
    # Conversion rates (approximate, should be updated)
    CONVERSIONS_TO_XAF = {
        'XAF': 1,
        'EUR': 655.957,  # Fixed EUR to XAF
        'USD': 600,      # Approximate USD to XAF
    }
    
    # Payment frequency patterns
    FREQUENCY_PATTERNS = {
        'monthly': r'(?:mois|month|mensuel|par mois|/mois|/month)',
        'yearly': r'(?:an|year|annuel|par an|/an|/year)',
        'daily': r'(?:jour|day|journalier|par jour|/jour|/day)',
    }
    
    def parse_price(self, price_text: str) -> Tuple[Optional[float], str, str]:
        """
        Parse price text and return (monthly_xaf, currency, frequency)
        
        Args:
            price_text: Raw price string (e.g., "150k FCFA/mois", "1.2M XAF/an")
            
        Returns:
            Tuple of (monthly_price_xaf, detected_currency, detected_frequency)
        """
        if not price_text or not isinstance(price_text, str):
            return None, 'unknown', 'unknown'
        
        # Clean text
        text = price_text.strip().upper()
        
        # Extract numeric value
        amount = self._extract_amount(text)
        if amount is None:
            return None, 'unknown', 'unknown'
        
        # Detect currency
        currency = self._detect_currency(text)
        
        # Detect frequency
        frequency = self._detect_frequency(text)
        
        # Convert to XAF
        xaf_amount = amount * self.CONVERSIONS_TO_XAF.get(currency, 1)
        
        # Normalize to monthly
        monthly_xaf = self._normalize_to_monthly(xaf_amount, frequency)
        
        return monthly_xaf, currency, frequency
    
    def _extract_amount(self, text: str) -> Optional[float]:
        """Extract numeric amount from text"""
        # Handle formats: 150k, 1.2M, 150000, 150,000, 150.000
        
        # Replace common separators
        text = text.replace(',', '').replace(' ', '')
        
        # Find number with multipliers
        patterns = [
            (r'(\d+(?:\.\d+)?)\s*M(?:IL)?', 1_000_000),   # 1.2M
            (r'(\d+(?:\.\d+)?)\s*K', 1_000),               # 150k
            (r'(\d+(?:\.\d+)?)', 1),                        # 150000
        ]
        
        for pattern, multiplier in patterns:
            match = re.search(pattern, text)
            if match:
                try:
                    return float(match.group(1)) * multiplier
                except ValueError:
                    continue
        
        return None
    
    def _detect_currency(self, text: str) -> str:
        """Detect currency from text"""
        for currency, pattern in self.CURRENCY_PATTERNS.items():
            if re.search(pattern, text):
                return currency
        return 'XAF'  # Default to XAF for Cameroon
    
    def _detect_frequency(self, text: str) -> str:
        """Detect payment frequency from text"""
        for freq, pattern in self.FREQUENCY_PATTERNS.items():
            if re.search(pattern, text, re.IGNORECASE):
                return freq
        return 'monthly'  # Default assumption
    
    def _normalize_to_monthly(self, amount: float, frequency: str) -> float:
        """Convert amount to monthly based on frequency"""
        conversions = {
            'monthly': 1,
            'yearly': 1/12,
            'daily': 30,
        }
        return amount * conversions.get(frequency, 1)


# Convenience function
def parse_rent_price(price_text: str) -> Optional[float]:
    """Quick function to get monthly XAF rent"""
    parser = PriceParser()
    monthly_xaf, _, _ = parser.parse_price(price_text)
    return monthly_xaf
