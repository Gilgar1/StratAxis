import re
from typing import List, Dict, Any
from ..utils.logger import setup_logger

class DataParser:
    """
    Data Parser for OCR Text (Blueprint 2.3.2.4).
    Uses complex regex patterns to identify property details in legal documents.
    """
    def __init__(self):
        self.logger = setup_logger("ocr.data_parser")
        # Localized patterns for Cameroon land/property documents
        self.patterns = {
            "price": r"(?:Prix[:\s]+|Montant[:\s]+)?([\d\s\.]{5,})\s*(?:FCFA|XAF|CFA)",
            "location": r"(?:Lieu|Ville|Quartier|Situé à)[:\s]+([A-Za-zÀ-ÿ\s,\-]{3,})",
            "size": r"(?:Superficie|Surface)[:\s]+([\d\s,]+)\s*(?:m2|m²|m|hectares|acres)",
            "type": r"(Appartement|Maison|Terrain|Villa|Bureau|Duplex|Studio)",
            "title_id": r"(?:Titre Foncier|TF)\s*(?:N°|no|number)?\s*(\d+/\w+)"
        }

    def parse_text(self, text: str) -> List[Dict[str, Any]]:
        """Identify property records within large text blocks (e.g., land registry extracts)"""
        self.logger.info("Starting structured parsing of OCR text")
        records = []
        
        # Heuristic: split text by "Titre Foncier" or common headers to isolate records
        chunks = re.split(r'Titre Foncier', text, flags=re.IGNORECASE)
        
        for chunk in chunks:
            if len(chunk) < 50: continue # Skip trivial chunks
            
            try:
                price_match = re.search(self.patterns["price"], chunk, re.IGNORECASE)
                loc_match = re.search(self.patterns["location"], chunk, re.IGNORECASE)
                type_match = re.search(self.patterns["type"], chunk, re.IGNORECASE)
                size_match = re.search(self.patterns["size"], chunk, re.IGNORECASE)
                tf_match = re.search(self.patterns["title_id"], chunk, re.IGNORECASE)

                if not loc_match and not tf_match: 
                    continue # Skip if we can't identify a location or ID

                record = {
                    "title": f"Document ID: {tf_match.group(1)}" if tf_match else "Property from OCR",
                    "price": self._clean_num(price_match.group(1)) if price_match else 0.0,
                    "location": loc_match.group(1).strip() if loc_match else "Unknown",
                    "property_type": type_match.group(1).lower() if type_match else "land",
                    "size": self._clean_num(size_match.group(1)) if size_match else 0.0,
                    "source": "ocr",
                    "source_url": f"ocr://{tf_match.group(1)}" if tf_match else "ocr://unknown"
                }
                records.append(record)
            except Exception as e:
                self.logger.warning(f"Failed to parse OCR chunk: {e}")
                
        self.logger.info(f"Successfully parsed {len(records)} records from OCR text")
        return records

    def _clean_num(self, text: str) -> float:
        """Remove spaces, commas, and dots from numeric strings"""
        cleaned = re.sub(r'[^\d.]', '', text)
        try:
            return float(cleaned)
        except:
            return 0.0
