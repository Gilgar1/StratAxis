"""
OCR Processing Pipeline (Blueprint 4.2)

Handles:
- PDF to image conversion
- Image preprocessing (contrast, noise reduction, deskew)
- Tesseract OCR text extraction
- Structured data parsing with regex
- Data normalization
"""

import re
import json
from typing import List, Dict, Optional, Any
from datetime import datetime
from pathlib import Path
from PIL import Image, ImageEnhance, ImageFilter
import pytesseract
from pdf2image import convert_from_path
from sqlmodel import Session, select

from src.models.data_source import DataSource, DataSourceType, RunStatus
from src.utils.logger import logger


class OCRProcessor:
    """
    OCR processor for extracting property data from PDF documents (Blueprint 4.2)
    
    Process:
    1. Load PDF file
    2. Convert pages to images
    3. Preprocess images
    4. Run Tesseract OCR
    5. Parse structured data
    6. Normalize data
    """
    
    def __init__(self, data_source: DataSource):
        self.data_source = data_source
        self.config = data_source.config or {}
        self.pdf_path = Path(data_source.source_path or "")
        
        # OCR configuration
        self.tesser_config = self.config.get('tesseract_config', '--oem 3 --psm 6')
        self.language = self.config.get('language', 'fra')  # French for Cameroon
        
        # Regex patterns for data extraction (Blueprint 4.2.3.f)
        self.patterns = self._compile_patterns()
    
    def _compile_patterns(self) -> Dict[str, re.Pattern]:
        """
        Compile regex patterns for data extraction (Blueprint 4.2.3.f)
        
        Patterns for:
        - Price (various formats)
        - Location (city, neighborhood)
        - Property details (size, bedrooms,bathrooms)
        - Date
        """
        return {
            # Price patterns (XAF, FCFA)
            'price': re.compile(
                r'(?:prix|price|montant)[\s:]*'
                r'(\d{1,3}(?:[,\s]\d{3})*(?:\.\d{2})?)'
                r'[\s]*(XAF|FCFA|F\s?CFA)?',
                re.IGNORECASE
            ),
            
            # Size patterns (m², sqm, hectares)
            'size': re.compile(
                r'(?:surface|superficie|taille|size)[\s:]*'
                r'(\d+(?:[.,]\d+)?)'
                r'[\s]*(m²|m2|sqm|ha|hectares?)?',
                re.IGNORECASE
            ),
            
            # Bedrooms
            'bedrooms': re.compile(
                r'(\d+)[\s]*(?:chambres?|bedrooms?|ch\.)',
                re.IGNORECASE
            ),
            
            # Bathrooms
            'bathrooms': re.compile(
                r'(\d+)[\s]*(?:salles?\s*de\s*bain|bathrooms?|sdb)',
                re.IGNORECASE
            ),
            
            # City (Yaoundé or Douala)
            'city': re.compile(
                r'\b(Yaound[ée]|Douala)\b',
                re.IGNORECASE
            ),
            
            # Property type
            'property_type': re.compile(
                r'\b(appartement|maison|terrain|villa|studio|commercial|bureau)\b',
                re.IGNORECASE
            ),
            
            # Date (various formats)
            'date': re.compile(
                r'(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})|'
                r'(\d{4}[/-]\d{1,2}[/-]\d{1,2})',
                re.IGNORECASE
            )
        }
    
    def convert_pdf_to_images(self) -> List[Image.Image]:
        """
        Convert PDF pages to images (Blueprint 4.2.3.b)
        
        Returns:
            List of PIL Image objects
        """
        logger.info(f"Converting PDF to images: {self.pdf_path}")
        
        try:
            # Convert PDF to images (300 DPI for good OCR quality)
            images = convert_from_path(
                str(self.pdf_path),
                dpi=300,
                fmt='png'
            )
            
            logger.info(f"Converted {len(images)} pages to images")
            return images
            
        except Exception as e:
            logger.error(f"Error converting PDF to images: {e}")
            return []
    
    def preprocess_image(self, image: Image.Image) -> Image.Image:
        """
        Preprocess image for better OCR (Blueprint 4.2.3.c)
        
        Steps:
        - Convert to grayscale
        - Enhance contrast
        - Reduce noise
        - Sharpen
        
        Args:
            image: PIL Image object
            
        Returns:
            Preprocessed PIL Image
        """
        # Convert to grayscale
        if image.mode != 'L':
            image = image.convert('L')
        
        # Enhance contrast
        enhancer = ImageEnhance.Contrast(image)
        image = enhancer.enhance(1.5)
        
        # Reduce noise with median filter
        image = image.filter(ImageFilter.MedianFilter(size=3))
        
        # Sharpen
        image = image.filter(ImageFilter.SHARPEN)
        
        return image
    
    def run_ocr(self, image: Image.Image) -> str:
        """
        Run Tesseract OCR on image (Blueprint 4.2.3.d, e)
        
        Args:
            image: Preprocessed PIL Image
            
        Returns:
            Extracted text from OCR
        """
        try:
            text = pytesseract.image_to_string(
                image,
                lang=self.language,
                config=self.tesseract_config
            )
            
            return text
            
        except Exception as e:
            logger.error(f"OCR failed: {e}")
            return ""
    
    def parse_text(self, text: str) -> Dict[str, Any]:
        """
        Parse structured data from OCR text using regex (Blueprint 4.2.3.f)
        
        Args:
            text: OCR extracted text
            
        Returns:
            Dictionary with extracted property data
        """
        data = {}
        
        # Extract price
        price_match = self.patterns['price'].search(text)
        if price_match:
            price_str = price_match.group(1).replace(',', '').replace(' ', '')
            data['price'] = price_str
            data['currency'] = price_match.group(2) or 'XAF'
        
        # Extract size
        size_match = self.patterns['size'].search(text)
        if size_match:
            data['size'] = size_match.group(1)
            data['size_unit'] = size_match.group(2) or 'm²'
        
        # Extract bedrooms
        bedrooms_match = self.patterns['bedrooms'].search(text)
        if bedrooms_match:
            data['bedrooms'] = bedrooms_match.group(1)
        
        # Extract bathrooms
        bathrooms_match = self.patterns['bathrooms'].search(text)
        if bathrooms_match:
            data['bathrooms'] = bathrooms_match.group(1)
        
        # Extract city
        city_match = self.patterns['city'].search(text)
        if city_match:
            data['city'] = city_match.group(1)
        
        # Extract property type
        type_match = self.patterns['property_type'].search(text)
        if type_match:
            data['property_type'] = type_match.group(1)
        
        # Extract date
        date_match = self.patterns['date'].search(text)
        if date_match:
            data['date'] = date_match.group(0)
        
        # Include raw text for debugging
        data['raw_text'] = text[:500]  # First 500 chars
        
        return data
    
    def normalize_data(self, raw_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Normalize extracted data (Blueprint 4.2.3.g)
        
        Normalization:
        - Currency standardization
        - Date formatting
        - Location standardization
        - Unit conversion
        """
        normalized = {}
        
        # Normalize price
        if 'price' in raw_data:
            try:
                normalized['price'] = float(raw_data['price'])
            except:
                normalized['price'] = None
        
        # Normalize currency
        currency = raw_data.get('currency', 'XAF')
        if currency in ['FCFA', 'F CFA', 'F.CFA']:
            currency = 'XAF'
        normalized['currency'] = currency
        
        # Normalize size (convert to m²)
        if 'size' in raw_data:
            try:
                size = float(raw_data['size'].replace(',', '.'))
                unit = raw_data.get('size_unit', 'm²').lower()
                
                # Convert to m²
                if 'ha' in unit or 'hectare' in unit:
                    size = size * 10000  # 1 hectare = 10,000 m²
                
                normalized['size'] = size
            except:
                normalized['size'] = None
        
        # Normalize bedrooms/bathrooms
        for field in ['bedrooms', 'bathrooms']:
            if field in raw_data:
                try:
                    normalized[field] = int(raw_data[field])
                except:
                    normalized[field] = None
        
        # Normalize city
        city = raw_data.get('city', '').strip()
        if city.lower() in ['yaounde', 'yaoundé']:
            normalized['city'] = 'Yaoundé'
        elif city.lower() == 'douala':
            normalized['city'] = 'Douala'
        else:
            normalized['city'] = city
        
        # Normalize property type
        property_type = raw_data.get('property_type', '').lower()
        type_mapping = {
            'appartement': 'apartment',
            'maison': 'house',
            'villa': 'house',
            'terrain': 'land',
            'studio': 'apartment',
            'commercial': 'commercial',
            'bureau': 'commercial'
        }
        normalized['property_type'] = type_mapping.get(property_type, property_type)
        
        # Normalize date (ISO 8601)
        if 'date' in raw_data:
            try:
                # Parse common date formats
                date_str = raw_data['date']
                normalized['date'] = self._parse_date(date_str)
            except:
                normalized['date'] = None
        
        # Add OCR metadata
        normalized['extraction_method'] = 'ocr'
        normalized['ocr_confidence'] = raw_data.get('confidence', None)
        
        return normalized
    
    @staticmethod
    def _parse_date(date_str: str) -> Optional[str]:
        """Parse date from various formats to ISO 8601"""
        from dateutil import parser as date_parser
        
        try:
            dt = date_parser.parse(date_str, dayfirst=True)
            return dt.date().isoformat()
        except:
            return None
    
    def process_pdf(self) -> List[Dict[str, Any]]:
        """
        Main OCR processing method (Blueprint 4.2.3)
        
        Returns:
            List of extracted property dictionaries
        """
        logger.info(f"Starting OCR processing for {self.pdf_path}")
        
        if not self.pdf_path.exists():
            logger.error(f"PDF file not found: {self.pdf_path}")
            return []
        
        # Convert PDF to images (Blueprint 4.2.3.b)
        images = self.convert_pdf_to_images()
        
        if not images:
            return []
        
        extracted_data = []
        
        # Process each page (Blueprint 4.2.3.d, e, f, g)
        for page_num, image in enumerate(images, start=1):
            try:
                logger.info(f"Processing page {page_num}/{len(images)}")
                
                # Preprocess image (Blueprint 4.2.3.c)
                processed_image = self.preprocess_image(image)
                
                # Run OCR (Blueprint 4.2.3.d)
                text = self.run_ocr(processed_image)
                
                if not text.strip():
                    logger.warning(f"No text extracted from page {page_num}")
                    continue
                
                # Parse structured data (Blueprint 4.2.3.f)
                raw_data = self.parse_text(text)
                
                # Normalize data (Blueprint 4.2.3.g)
                normalized_data = self.normalize_data(raw_data)
                
                # Add metadata
                normalized_data['page_number'] = page_num
                normalized_data['data_source_id'] = str(self.data_source.id)
                normalized_data['data_source_name'] = self.data_source.name
                normalized_data['processed_at'] = datetime.utcnow().isoformat()
                
                extracted_data.append(normalized_data)
                
            except Exception as e:
                logger.error(f"Error processing page {page_num}: {e}")
                continue
        
        # Log extraction results (Blueprint 4.2.3.h)
        logger.info(
            f"OCR processing completed: "
            f"{len(images)} pages processed, "
            f"{len(extracted_data)} records extracted"
        )
        
        return extracted_data


def run_ocr_pipeline(session: Session) -> Dict[str, Any]:
    """
    Main entry point for OCR pipeline (Blueprint 4.2)
    
    Should be triggered byscheduler (cron: weekly, Sunday 03:00 UTC)
    
    Args:
        session: Database session
        
    Returns:
        Dictionary with execution results
    """
    logger.info("=== STARTING OCR PIPELINE ===")
    start_time = datetime.utcnow()
    
    # Load active OCR sources from DataSources table (Blueprint 4.2.2)
    active_ocr_sources = session.exec(
        select(DataSource).where(
            DataSource.type == DataSourceType.OCR,
            DataSource.is_active == True
        )
    ).all()
    
    logger.info(f"Found {len(active_ocr_sources)} active OCR sources")
    
    all_ocr_data = []
    execution_results = {
        "sources_processed": 0,
        "total_pages": 0,
        "total_records": 0,
        "successful_sources": 0,
        "failed_sources": 0,
        "errors": []
    }
    
    # Process each OCR source (Blueprint 4.2.3)
    for data_source in active_ocr_sources:
        try:
            logger.info(f"Processing OCR source: {data_source.name}")
            
            # Create OCR processor
            processor = OCRProcessor(data_source)
            
            # Process PDF
            records = processor.process_pdf()
            
            all_ocr_data.extend(records)
            
            # Update data source statistics
            data_source.last_run_at = datetime.utcnow()
            data_source.last_run_status = RunStatus.SUCCESS
            data_source.records_collected = len(records)
            session.add(data_source)
            
            execution_results["sources_processed"] += 1
            execution_results["successful_sources"] += 1
            execution_results["total_records"] += len(records)
            
            logger.info(f"OCR source {data_source.name} completed: {len(records)} records")
            
        except Exception as e:
            logger.error(f"OCR source {data_source.name} failed: {e}")
            
            data_source.last_run_at = datetime.utcnow()
            data_source.last_run_status = RunStatus.FAILED
            session.add(data_source)
            
            execution_results["failed_sources"] += 1
            execution_results["errors"].append({
                "source": data_source.name,
                "error": str(e)
            })
    
    session.commit()
    
    # Save parsed OCR data to temporary JSON files (Blueprint 4.2.4)
    output_file = save_ocr_data(all_ocr_data)
    
    execution_time = (datetime.utcnow() - start_time).total_seconds()
    
    logger.info(
        f"=== OCR PIPELINE COMPLETED ===\n"
        f"  Sources processed: {execution_results['sources_processed']}\n"
        f"  Total records: {execution_results['total_records']}\n"
        f"  Successful: {execution_results['successful_sources']}\n"
        f"  Failed: {execution_results['failed_sources']}\n"
        f"  Execution time: {execution_time:.2f}s\n"
        f"  Output file: {output_file}"
    )
    
    return {
        **execution_results,
        "execution_time_seconds": execution_time,
        "output_file": output_file,
        "timestamp": start_time.isoformat()
    }


def save_ocr_data(data: List[Dict[str, Any]]) -> str:
    """
    Save parsed OCR data to temporary JSON files (Blueprint 4.2.4)
    
    Args:
        data: List of OCR extracted property dictionaries
        
    Returns:
        Path to saved file
    """
    # Create temp directory if it doesn't exist
    temp_dir = Path("backend/temp/ocr_data")
    temp_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate filename with timestamp
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    filename = f"ocr_{timestamp}.json"
    filepath = temp_dir / filename
    
    # Save to JSON
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    logger.info(f"Saved {len(data)} OCR records to {filepath}")
    
    return str(filepath)
