import re
from datetime import datetime
from dateutil import parser as date_parser
from typing import Optional, Tuple

class DateExtractor:
    """Extract and normalize dates from listing text"""
    
    MONTH_NAMES_FR = {
        'janvier': 1, 'février': 2, 'mars': 3, 'avril': 4,
        'mai': 5, 'juin': 6, 'juillet': 7, 'août': 8,
        'septembre': 9, 'octobre': 10, 'novembre': 11, 'décembre': 12
    }
    
    MONTH_NAMES_EN = {
        'january': 1, 'february': 2, 'march': 3, 'april': 4,
        'may': 5, 'june': 6, 'july': 7, 'august': 8,
        'september': 9, 'october': 10, 'november': 11, 'december': 12
    }
    
    def extract_date(self, text: str, fallback_current: bool = True) -> Tuple[Optional[int], Optional[int]]:
        """
        Extract year and month from text
        
        Args:
            text: Text to extract date from
            fallback_current: If True, return current year/month if no date found
            
        Returns:
            Tuple of (year, month)
        """
        if not text:
            return self._current_date() if fallback_current else (None, None)
        
        # Try ISO format first (2024-01-15, 2024/01/15)
        iso_match = re.search(r'(\d{4})[-/](\d{1,2})', text)
        if iso_match:
            year = int(iso_match.group(1))
            month = int(iso_match.group(2))
            if self._is_valid_date(year, month):
                return year, month
        
        # Try French month names
        for month_name, month_num in self.MONTH_NAMES_FR.items():
            pattern = rf'{month_name}\s+(\d{{4}})'
            match = re.search(pattern, text.lower())
            if match:
                year = int(match.group(1))
                if self._is_valid_date(year, month_num):
                    return year, month_num
        
        # Try English month names
        for month_name, month_num in self.MONTH_NAMES_EN.items():
            pattern = rf'{month_name}\s+(\d{{4}})'
            match = re.search(pattern, text.lower())
            if match:
                year = int(match.group(1))
                if self._is_valid_date(year, month_num):
                    return year, month_num
        
        # Try relative dates (e.g., "Il y a 3 jours", "2 days ago")
        relative = self._parse_relative_date(text)
        if relative:
            return relative
        
        # Try dateutil parser as last resort
        try:
            parsed = date_parser.parse(text, fuzzy=True)
            return parsed.year, parsed.month
        except:
            pass
        
        # Fallback to current date
        return self._current_date() if fallback_current else (None, None)
    
    def _parse_relative_date(self, text: str) -> Optional[Tuple[int, int]]:
        """Parse relative dates like 'il y a 3 jours' or '2 weeks ago'"""
        current = datetime.now()
        
        # Days ago
        match = re.search(r'(?:il y a|ago)\s*(\d+)\s*(?:jour|day)s?', text.lower())
        if match:
            days = int(match.group(1))
            # For simplicity, just use current date if within a month
            if days < 30:
                return current.year, current.month
        
        # Weeks ago
        match = re.search(r'(?:il y a|ago)\s*(\d+)\s*(?:semaine|week)s?', text.lower())
        if match:
            weeks = int(match.group(1))
            if weeks < 8:  # Within 2 months
                return current.year, current.month
        
        # Months ago
        match = re.search(r'(?:il y a|ago)\s*(\d+)\s*(?:mois|month)s?', text.lower())
        if match:
            months = int(match.group(1))
            target_month = current.month - months
            target_year = current.year
            while target_month < 1:
                target_month += 12
                target_year -= 1
            return target_year, target_month
        
        return None
    
    def _is_valid_date(self, year: int, month: int) -> bool:
        """Check if date is valid and within 2021-2026 range"""
        return 2021 <= year <= 2026 and 1 <= month <= 12
    
    def _current_date(self) -> Tuple[int, int]:
        """Return current year and month"""
        now = datetime.now()
        return now.year, now.month


# Convenience function
def extract_listing_date(text: str) -> Tuple[Optional[int], Optional[int]]:
    """Quick function to extract year and month from listing text"""
    extractor = DateExtractor()
    return extractor.extract_date(text)
