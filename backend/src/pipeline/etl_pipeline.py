"""
ETL Pipeline Orchestration (Blueprint 4.3)

Orchestrates the complete ETL process:
- Extract: Load data from scrapers and OCR
- Transform: Normalize and enrich data
- Validate: Schema, quality, outliers
- Load: Insert/update into database
"""

import json
from typing import List, Dict, Any
from datetime import datetime
from pathlib import Path
from uuid import UUID
from sqlmodel import Session, select

from src.models.property import Property, PropertyCity, PropertyType, ValidationStatus
from src.models.data_source import DataSource
from src.pipeline.validation import SchemaValidator, DataQualityScorer, OutlierDetector
from src.services.property_versioning import PropertyVersioningService
from src.services.listing_retention import ListingRetentionService
from src.utils.logger import logger


class DataTransformer:
    """
    Data transformer for ETL pipeline (Blueprint 4.3.3)
    
    Transforms:
    - Currency normalization
    - Location standardization
    - Property type categorization
    - Unit conversion
    - Date parsing
    - Price per m² calculation
    - Geocoding
    - Data enrichment
    """
    
    # Property type mapping (Blueprint 4.3.3.c)
    PROPERTY_TYPE_MAPPING = {
        # French
        'appartement': 'apartment',
        'maison': 'house',
        'villa': 'house',
        'terrain': 'land',
        'studio': 'apartment',
        'commercial': 'commercial',
        'bureau': 'commercial',
        'entrepôt': 'commercial',
        # English
        'apartment': 'apartment',
        'flat': 'apartment',
        'house': 'house',
        'land': 'land',
        'office': 'commercial',
        'warehouse': 'commercial'
    }
    
    # City name standardization
    CITY_MAPPING = {
        'yaounde': 'Yaoundé',
        'yaoundé': 'Yaoundé',
        'yde': 'Yaoundé',
        'douala': 'Douala',
        'dla': 'Douala'
    }
    
    def transform(self, record: Dict[str, Any]) -> Dict[str, Any]:
        """
        Transform property record (Blueprint 4.3.3)
        
        Args:
            record: Raw property dictionary
            
        Returns:
            Transformed property dictionary
        """
        transformed = record.copy()
        
        # Currency normalization (Blueprint 4.3.3.a)
        transformed = self._normalize_currency(transformed)
        
        # Location standardization (Blueprint 4.3.3.b)
        transformed = self._standardize_location(transformed)
        
        # Property type categorization (Blueprint 4.3.3.c)
        transformed = self._categorize_property_type(transformed)
        
        # Unit conversion (Blueprint 4.3.3.d)
        transformed = self._convert_units(transformed)
        
        # Date parsing (Blueprint 4.3.3.e)
        transformed = self._parse_dates(transformed)
        
        # Price per m² calculation (Blueprint 4.3.3.f)
        transformed = self._calculate_price_per_m2(transformed)
        
        # Geocoding (Blueprint 4.3.3.g)
        transformed = self._geocode_location(transformed)
        
        # Data enrichment (Blueprint 4.3.3.h)
        transformed = self._enrich_data(transformed)
        
        return transformed
    
    def _normalize_currency(self, record: Dict[str, Any]) -> Dict[str, Any]:
        """Currency normalization (Blueprint 4.3.3.a)"""
        currency = record.get('currency', 'XAF')
        
        # Handle currency symbols and variations
        currency_map = {
            'FCFA': 'XAF',
            'F CFA': 'XAF',
            'F.CFA': 'XAF',
            'CFA': 'XAF',
            'XAF': 'XAF'
        }
        
        record['currency'] = currency_map.get(currency.upper().strip(), 'XAF')
        
        return record
    
    def _standardize_location(self, record: Dict[str, Any]) -> Dict[str, Any]:
        """Location standardization (Blueprint 4.3.3.b)"""
        # Standardize city name
        city = record.get('city', '').strip()
        city_lower = city.lower()
        
        if city_lower in self.CITY_MAPPING:
            record['city'] = self.CITY_MAPPING[city_lower]
        else:
            record['city'] = city
        
        # Standardize neighborhood (title case)
        if 'neighborhood' in record and record['neighborhood']:
            record['neighborhood'] = record['neighborhood'].strip().title()
        
        return record
    
    def _categorize_property_type(self, record: Dict[str, Any]) -> Dict[str, Any]:
        """Property type categorization (Blueprint 4.3.3.c)"""
        property_type = record.get('property_type', '').strip().lower()
        
        # Map variations to standard types
        if property_type in self.PROPERTY_TYPE_MAPPING:
            record['property_type'] = self.PROPERTY_TYPE_MAPPING[property_type]
        else:
            # Default to original if no mapping found
            record['property_type'] = property_type
        
        return record
    
    def _convert_units(self, record: Dict[str, Any]) -> Dict[str, Any]:
        """Unit conversion (Blueprint 4.3.3.d)"""
        # Size conversion to m²
        if 'size' in record and record['size'] is not None:
            try:
                size = float(record['size'])
                unit = record.get('size_unit', 'm²').lower()
                
                # Convert to m²
                if 'ha' in unit or 'hectare' in unit:
                    size = size * 10000  # 1 hectare = 10,000 m²
                elif 'acre' in unit:
                    size = size * 4046.86  # 1 acre ≈ 4,047 m²
                elif 'ft' in unit or 'feet' in unit or 'sq ft' in unit:
                    size = size * 0.092903  # 1 sq ft ≈ 0.093 m²
                
                record['size'] = size
                
            except (ValueError, TypeError):
                pass
        
        return record
    
    def _parse_dates(self, record: Dict[str, Any]) -> Dict[str, Any]:
        """Date parsing (Blueprint 4.3.3.e)"""
        from dateutil import parser as date_parser
        
        # Parse scraped_at or date field
        for date_field in ['scraped_at', 'date', 'published_date']:
            if date_field in record and record[date_field]:
                try:
                    # Parse to ISO 8601 format
                    dt = date_parser.parse(record[date_field])
                    record[date_field] = dt.isoformat()
                except:
                    # If parsing fails, keep original
                    pass
        
        # Ensure scraped_at exists
        if 'scraped_at' not in record or not record['scraped_at']:
            record['scraped_at'] = datetime.utcnow().isoformat()
        
        return record
    
    def _calculate_price_per_m2(self, record: Dict[str, Any]) -> Dict[str, Any]:
        """Price per m² calculation (Blueprint 4.3.3.f)"""
        try:
            price = float(record.get('price', 0))
            size = float(record.get('size', 0))
            
            if price > 0 and size > 0:
                record['price_per_m2'] = price / size
            else:
                record['price_per_m2'] = None
                
        except (ValueError, TypeError, ZeroDivisionError):
            record['price_per_m2'] = None
        
        return record
    
    def _geocode_location(self, record: Dict[str, Any]) -> Dict[str, Any]:
        """
        Geocoding (Blueprint 4.3.3.g)
        
        For MVP: Use static mapping or approximate centers
        Production: Integrate with geocoding API
        """
        # Check if coordinates already exist
        if 'latitude' in record and 'longitude' in record:
            if record['latitude'] and record['longitude']:
                return record
        
        # Static city centers (approximate)
        city_centers = {
            'Yaoundé': {'latitude': 3.8480, 'longitude': 11.5021},
            'Douala': {'latitude': 4.0511, 'longitude': 9.7679}
        }
        
        city = record.get('city', '')
        if city in city_centers:
            record['latitude'] = city_centers[city]['latitude']
            record['longitude'] = city_centers[city]['longitude']
            record['geocoded'] = 'city_center'  # Flag as approximate
        
        # TODO: Production - integrate with geocoding service
        # - Google Maps Geocoding API
        # - Nominatim (OpenStreetMap)
        # - Use neighborhood name for more precise location
        
        return record
    
    def _enrich_data(self, record: Dict[str, Any]) -> Dict[str, Any]:
        """Data enrichment (Blueprint 4.3.3.h)"""
        # Add metadata
        record['extraction_date'] = datetime.utcnow().isoformat()
        
        # Ensure data_source metadata exists
        if 'data_source_id' not in record:
            record['data_source_id'] = None
        
        if 'data_source_record_id' not in record:
            record['data_source_record_id'] = None
        
        return record


class ETLPipeline:
    """
    ETL Pipeline Orchestrator (Blueprint 4.3)
    
    Orchestrates the complete ETL process:
    1. Extract: Load data from JSON files
    2. Transform: Normalize and enrich
    3. Validate: Schema, quality, outliers
    4. Load: Insert/update database
    5. Post-load: Trigger aggregations
    """
    
    def __init__(self, session: Session):
        self.session = session
        self.transformer = DataTransformer()
        self.schema_validator = SchemaValidator()
        self.quality_scorer = DataQualityScorer()
        self.outlier_detector = OutlierDetector(session)
        self.property_versioning = PropertyVersioningService(session)
    
    def run(
        self,
        scraped_files: List[str] = None,
        ocr_files: List[str] = None
    ) -> Dict[str, Any]:
        """
        Run complete ETL pipeline (Blueprint 4.3)
        
        Args:
            scraped_files: List of JSON files from scrapers
            ocr_files: List of JSON files from OCR
            
        Returns:
            Execution results dictionary
        """
        logger.info("=== STARTING ETL PIPELINE ===")
        start_time = datetime.utcnow()
        
        # Extract phase (Blueprint 4.3.2)
        all_records = self.extract_phase(scraped_files, ocr_files)
        
        # Transform phase (Blueprint 4.3.3)
        transformed_records = self.transform_phase(all_records)
        
        # Validation phase (Blueprint 4.3.4)
        validated_records = self.validate_phase(transformed_records)
        
        # Load phase (Blueprint 4.3.5)
        load_results = self.load_phase(validated_records)
        
        # Post-load phase (Blueprint 4.3.6)
        self.post_load_phase(load_results)
        
        execution_time = (datetime.utcnow() - start_time).total_seconds()
        
        results = {
            "total_records": len(all_records),
            "transformed": len(transformed_records),
            "validated": load_results['validated'],
            "pending": load_results['pending'],
            "rejected": load_results['rejected'],
            "inserted": load_results['inserted'],
            "updated": load_results['updated'],
            "execution_time_seconds": execution_time,
            "timestamp": start_time.isoformat()
        }
        
        logger.info(
            f"=== ETL PIPELINE COMPLETED ===\n"
            f"  Total records: {results['total_records']}\n"
            f"  Validated: {results['validated']}\n"
            f"  Pending review: {results['pending']}\n"
            f"  Rejected: {results['rejected']}\n"
            f"  Inserted: {results['inserted']}\n"
            f"  Updated: {results['updated']}\n"
            f"  Execution time: {execution_time:.2f}s"
        )
        
        return results
    
    def extract_phase(
        self,
        scraped_files: List[str] = None,
        ocr_files: List[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Extract phase (Blueprint 4.3.2)
        
        Load data from scrapers and OCR, merge and tag
        """
        logger.info("Starting Extract phase...")
        all_records = []
        
        # Load from scrapers (Blueprint 4.3.2.a)
        if scraped_files:
            for file_path in scraped_files:
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        records = json.load(f)
                        # Tag with source type (Blueprint 4.3.2.d)
                        for record in records:
                            record['source_type'] = 'scraper'
                        all_records.extend(records)
                except Exception as e:
                    logger.error(f"Error loading scraped file {file_path}: {e}")
        
        # Load from OCR (Blueprint 4.3.2.b)
        if ocr_files:
            for file_path in ocr_files:
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        records = json.load(f)
                        # Tag with source type (Blueprint 4.3.2.d)
                        for record in records:
                            record['source_type'] = 'ocr'
                        all_records.extend(records)
                except Exception as e:
                    logger.error(f"Error loading OCR file {file_path}: {e}")
        
        # Automatically find and load recent files if none specified
        if not scraped_files and not ocr_files:
            all_records = self._load_latest_data_files()
        
        logger.info(f"Extract phase completed: {len(all_records)} records loaded")
        
        return all_records
    
    def _load_latest_data_files(self) -> List[Dict[str, Any]]:
        """Load latest scraped and OCR JSON files if not specified"""
        all_records = []
        
        # Load latest scraped file
        scraped_dir = Path("backend/temp/scraped_data")
        if scraped_dir.exists():
            scraped_files = sorted(scraped_dir.glob("*.json"), reverse=True)
            if scraped_files:
                try:
                    with open(scraped_files[0], 'r', encoding='utf-8') as f:
                        records = json.load(f)
                        for record in records:
                            record['source_type'] = 'scraper'
                        all_records.extend(records)
                    logger.info(f"Loaded latest scraped file: {scraped_files[0]}")
                except Exception as e:
                    logger.error(f"Error loading {scraped_files[0]}: {e}")
        
        # Load latest OCR file
        ocr_dir = Path("backend/temp/ocr_data")
        if ocr_dir.exists():
            ocr_files = sorted(ocr_dir.glob("*.json"), reverse=True)
            if ocr_files:
                try:
                    with open(ocr_files[0], 'r', encoding='utf-8') as f:
                        records = json.load(f)
                        for record in records:
                            record['source_type'] = 'ocr'
                        all_records.extend(records)
                    logger.info(f"Loaded latest OCR file: {ocr_files[0]}")
                except Exception as e:
                    logger.error(f"Error loading {ocr_files[0]}: {e}")
        
        return all_records
    
    def transform_phase(self, records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Transform phase (Blueprint 4.3.3)
        
        Apply all data transformations
        """
        logger.info(f"Starting Transform phase on {len(records)} records...")
        
        transformed_records = []
        
        for record in records:
            try:
                transformed = self.transformer.transform(record)
                transformed_records.append(transformed)
            except Exception as e:
                logger.error(f"Error transforming record: {e}")
                # Skip records that fail transformation
                continue
        
        logger.info(f"Transform phase completed: {len(transformed_records)} records")
        
        return transformed_records
    
    def validate_phase(self, records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Validation phase (Blueprint 4.3.4 and 4.4)
        
        Validate schema, calculate quality score, detect outliers
        """
        logger.info(f"Starting Validation phase on {len(records)} records...")
        
        validated_records = []
        
        for record in records:
            # Schema validation (Blueprint 4.4.1)
            is_valid_schema, schema_errors = self.schema_validator.validate(record)
            
            if not is_valid_schema:
                # Reject if schema validation fails (Blueprint 4.4.1.e)
                record['validation_status'] = 'rejected'
                record['quality_score'] = 0.0
                record['rejection_reasons'] = schema_errors
                validated_records.append(record)
                continue
            
            # Quality scoring (Blueprint 4.4.2)
            quality_score = self.quality_scorer.calculate_quality_score(record)
            record['quality_score'] = quality_score
            
            # Outlier detection (Blueprint 4.4.3)
            is_outlier, outlier_reasons, quality_penalty = self.outlier_detector.detect_outliers(record)
            
            # Apply quality penalty if outlier (Blueprint 4.4.3.c)
            if is_outlier:
                record['quality_score'] = max(0, quality_score - quality_penalty)
                record['outlier_reasons'] = outlier_reasons
            
            # Determine validation status (Blueprint 4.4.4)
            final_quality = record['quality_score']
            
            if final_quality < 70:
                # Rejected (Blueprint 4.4.4.c)
                record['validation_status'] = 'rejected'
                record['rejection_reasons'] = ['Quality score below 70%']
            elif is_outlier:
                # Pending (requires manual review) (Blueprint 4.4.4.b)
                record['validation_status'] = 'pending'
            else:
                # Validated (Blueprint 4.4.4.a)
                record['validation_status'] = 'validated'
            
            validated_records.append(record)
        
        logger.info(f"Validation phase completed: {len(validated_records)} records")
        
        return validated_records
    
    def load_phase(self, records: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Load phase (Blueprint 4.3.5)
        
        Insert new records or update existing ones
        """
        logger.info(f"Starting Load phase on {len(records)} records...")
        
        stats = {
            'validated': 0,
            'pending': 0,
            'rejected': 0,
            'inserted': 0,
            'updated': 0
        }
        
        for record in records:
            # Count by status
            status = record.get('validation_status', 'rejected')
            if status == 'validated':
                stats['validated'] += 1
            elif status == 'pending':
                stats['pending'] += 1
            else:
                stats['rejected'] += 1
            
            # Load into database
            try:
                was_inserted = self._load_record(record)
                if was_inserted:
                    stats['inserted'] += 1
                else:
                    stats['updated'] += 1
            except Exception as e:
                logger.error(f"Error loading record: {e}")
                continue
        
        self.session.commit()
        
        logger.info(
            f"Load phase completed: "
            f"{stats['inserted']} inserted, {stats['updated']} updated"
        )
        
        return stats
    
    def _load_record(self, record: Dict[str, Any]) -> bool:
        """
        Load single record into database (Blueprint 4.3.5.a-c)
        
        Returns True if inserted, False if updated
        """
        # Check for duplicates (Blueprint 4.3.5.a)
        data_source_id = record.get('data_source_id')
        data_source_record_id = record.get('data_source_record_id')
        
        existing = None
        if data_source_id and data_source_record_id:
            existing = self.session.exec(
                select(Property).where(
                    Property.data_source_id == UUID(data_source_id),
                    Property.data_source_record_id == data_source_record_id
                )
            ).first()
        
        # Prepare property data
        property_data = self._prepare_property_data(record)
        
        if existing:
            # Update if newer or higher quality (Blueprint 4.3.5.b)
            if self._should_update(existing, record):
                self.property_versioning.update_property_from_scrape(
                    existing.id,
                    property_data
                )
                return False
        else:
            # Insert new (Blueprint 4.3.5.c)
            self.property_versioning.create_new_property(property_data)
            return True
        
        return False
    
    def _should_update(self, existing: Property, new_record: Dict[str, Any]) -> bool:
        """Check if existing property should be updated with new data"""
        # Update if quality score is higher
        new_quality = new_record.get('quality_score', 0)
        existing_quality = float(existing.quality_score) if existing.quality_score else 0
        
        return new_quality > existing_quality
    
    def _prepare_property_data(self, record: Dict[str, Any]) -> Dict[str, Any]:
        """Prepare property data for database insertion"""
        # Map validation status
        status_map = {
            'validated': ValidationStatus.VALIDATED,
            'pending': ValidationStatus.PENDING,
            'rejected': ValidationStatus.REJECTED
        }
        
        # Map property type to enum
        type_map = {
            'apartment': PropertyType.APARTMENT,
            'house': PropertyType.HOUSE,
            'land': PropertyType.LAND,
            'commercial': PropertyType.COMMERCIAL
        }
        
        # Map city to enum
        city_map = {
            'Yaoundé': PropertyCity.YAOUNDE,
            'Douala': PropertyCity.DOUALA
        }
        
        return {
            'title': record.get('title', ''),
            'description': record.get('description'),
            'city': city_map.get(record.get('city'), PropertyCity.YAOUNDE),
            'neighborhood': record.get('neighborhood'),
            'property_type': type_map.get(record.get('property_type'), PropertyType.APARTMENT),
            'price': float(record['price']) if record.get('price') else 0,
            'currency': record.get('currency', 'XAF'),
            'size': float(record['size']) if record.get('size') else 0,
            'price_per_m2': float(record['price_per_m2']) if record.get('price_per_m2') else None,
            'bedrooms': int(record['bedrooms']) if record.get('bedrooms') else None,
            'bathrooms': int(record['bathrooms']) if record.get('bathrooms') else None,
            'images': record.get('images', []),
            'data_source_id': UUID(record['data_source_id']) if record.get('data_source_id') else None,
            'data_source_record_id': record.get('data_source_record_id'),
            'quality_score': float(record.get('quality_score', 0)),
            'validation_status': status_map.get(record.get('validation_status'), ValidationStatus.PENDING),
            'scraped_at': datetime.fromisoformat(record['scraped_at']) if record.get('scraped_at') else datetime.utcnow()
        }
    
    def post_load_phase(self, load_results: Dict[str, Any]):
        """
        Post-load phase (Blueprint 4.3.6)
        
        Trigger aggregations and ML retraining flags
        """
        logger.info("Starting Post-load phase...")
        
        # Trigger listing aggregation recalculation (Blueprint 4.3.6.a)
        # Only if significant new data was added
        if load_results['inserted'] > 0:
            try:
                # This would normally trigger monthly aggregation
                # For now, just log
                logger.info(
                    f"{load_results['inserted']} new properties inserted. "
                    "Listing aggregation should be triggered."
                )
                # TODO: Trigger aggregation job
                # listing_service = ListingRetentionService(self.session)
                # listing_service.recalculate_monthly_aggregates()
            except Exception as e:
                logger.error(f"Error triggering listing aggregation: {e}")
        
        # Trigger ML model retraining flag (Blueprint 4.3.6.b)
        if load_results['validated'] > 100:  # Threshold for significant new data
            logger.info(
                f"{load_results['validated']} validated properties. "
                "ML model retraining should be considered."
            )
            # TODO: Set retraining flag or trigger ML pipeline
        
        logger.info("Post-load phase completed")
