from typing import List, Dict, Any
from utils.logger import setup_logger

class Deduplicator:
    """Remove duplicate listings"""
    
    def __init__(self, similarity_threshold: float = 0.9):
        self.logger = setup_logger("deduplicator")
        self.similarity_threshold = similarity_threshold
    
    def deduplicate(self, listings: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Remove duplicate listings
        
        Args:
            listings: List of normalized listings
            
        Returns:
            Deduplicated list
        """
        if not listings:
            return []
        
        self.logger.info(f"Deduplicating {len(listings)} listings...")
        
        unique_listings = []
        seen_signatures = set()
        
        for listing in listings:
            signature = self._create_signature(listing)
            
            if signature not in seen_signatures:
                unique_listings.append(listing)
                seen_signatures.add(signature)
        
        duplicates_removed = len(listings) - len(unique_listings)
        self.logger.info(f"Removed {duplicates_removed} duplicates. {len(unique_listings)} unique listings remain.")
        
        return unique_listings
    
    def _create_signature(self, listing: Dict[str, Any]) -> str:
        """
        Create a signature for duplicate detection
        
        Uses: city, neighborhood, housing_type, price (rounded), source
        """
        city = listing.get('city', '').lower()
        neighborhood = listing.get('neighborhood', '').lower()
        housing_type = listing.get('housing_type', '')
        
        # Round price to nearest 1000 XAF for fuzzy matching
        price = listing.get('monthly_rent_xaf')
        if price:
            price = round(price / 1000) * 1000
        else:
            price = 0
        
        source = listing.get('source_site', '')
        
        signature = f"{city}|{neighborhood}|{housing_type}|{price}|{source}"
        return signature
