"""
Service layer for property versioning (Blueprint 3.3.1)

Handles:
- Creating new properties (version = 1)
- Updating properties from re-scraping (archive old → increment version → update)
- Querying property history for trend analysis
"""

from datetime import datetime
from typing import Optional, List
from uuid import UUID
from sqlmodel import Session, select
from sqlalchemy import desc

from src.models.property import Property
from src.models.property_history import PropertyHistory
from src.utils.logger import logger


class PropertyVersioningService:
    """
    Service for managing property versions according to Blueprint 3.3.1
    
    Strategy:
    1. New properties: version = 1
    2. Updates from re-scraping: 
       - Copy current version to PropertyHistory
       - Increment version in Property
       - Update Property with new data
    3. Historical analysis: Query PropertyHistory
    """
    
    def __init__(self, session: Session):
        self.session = session
    
    def create_new_property(self, property_data: dict) -> Property:
        """
        Create a new property with version = 1 (Blueprint 3.3.1.1)
        
        Args:
            property_data: Dictionary with property fields
            
        Returns:
            Created Property instance
        """
        property_data['version'] = 1
        new_property = Property(**property_data)
        
        self.session.add(new_property)
        self.session.commit()
        self.session.refresh(new_property)
        
        logger.info(f"Created new property {new_property.id} with version 1")
        return new_property
    
    def update_property_from_scrape(
        self,
        property_id: UUID,
        new_data: dict,
        archive_current: bool = True
    ) -> Property:
        """
        Update property from re-scraping (Blueprint 3.3.1.2)
        
        Process:
        1. Load current property
        2. Archive current version to PropertyHistory (if archive_current=True)
        3. Increment version
        4. Update property fields
        5. Commit changes
        
        Args:
            property_id: UUID of property to update
            new_data: New property data from scraping
            archive_current: Whether to archive current version (default True)
            
        Returns:
            Updated Property instance
        """
        # Load current property
        current_property = self.session.get(Property, property_id)
        
        if not current_property:
            raise ValueError(f"Property {property_id} not found")
        
        # Archive current version to history (Blueprint 3.3.1.2)
        if archive_current:
            self._archive_property_version(current_property)
        
        # Increment version (Blueprint 3.3.1.2)
        new_version = current_property.version + 1
        
        # Update property fields
        for key, value in new_data.items():
            if key not in ['id', 'created_at', 'version']:  # Preserve these fields
                setattr(current_property, key, value)
        
        current_property.version = new_version
        current_property.updated_at = datetime.utcnow()
        
        self.session.add(current_property)
        self.session.commit()
        self.session.refresh(current_property)
        
        logger.info(f"Updated property {property_id} to version {new_version}")
        return current_property
    
    def _archive_property_version(self, property: Property) -> PropertyHistory:
        """
        Archive current property version to PropertyHistory (Blueprint 3.3.1.3)
        
        Creates a snapshot of the current property state in property_history table
        
        Args:
            property: Current Property instance to archive
            
        Returns:
            Created PropertyHistory instance
        """
        history_record = PropertyHistory(
            original_id=property.id,
            
            # Copy all property fields (Blueprint 3.3.1.3 - same schema)
            title=property.title,
            description=property.description,
            city=property.city,
            neighborhood=property.neighborhood,
            property_type=property.property_type,
            price=property.price,
            currency=property.currency,
            size=property.size,
            price_per_m2=property.price_per_m2,
            bedrooms=property.bedrooms,
            bathrooms=property.bathrooms,
            images=property.images,
            data_source_id=property.data_source_id,
            data_source_record_id=property.data_source_record_id,
            quality_score=property.quality_score,
            validation_status=property.validation_status,
            
            # Versioning fields (Blueprint 3.3.1.3)
            version=property.version,
            version_timestamp=datetime.utcnow(),
            
            # Original timestamps
            original_created_at=property.created_at,
            original_updated_at=property.updated_at,
            original_scraped_at=property.scraped_at
        )
        
        self.session.add(history_record)
        self.session.commit()
        
        logger.info(
            f"Archived property {property.id} version {property.version} "
            f"to history (id: {history_record.id})"
        )
        
        return history_record
    
    def get_property_history(
        self,
        property_id: UUID,
        limit: Optional[int] = None
    ) -> List[PropertyHistory]:
        """
        Get historical versions of a property (Blueprint 3.3.1.5)
        
        Used for trend analysis and historical price tracking
        
        Args:
            property_id: UUID of the property
            limit: Maximum number of versions to return
            
        Returns:
            List of PropertyHistory records, ordered by version_timestamp DESC
        """
        query = select(PropertyHistory).where(
            PropertyHistory.original_id == property_id
        ).order_by(desc(PropertyHistory.version_timestamp))
        
        if limit:
            query = query.limit(limit)
        
        history = self.session.exec(query).all()
        
        logger.info(
            f"Retrieved {len(history)} historical versions for property {property_id}"
        )
        
        return history
    
    def get_current_version(self, property_id: UUID) -> Property:
        """
        Get current version of a property (Blueprint 3.3.1.4)
        
        Current properties table only stores latest version
        
        Args:
            property_id: UUID of the property
            
        Returns:
            Current Property instance
        """
        current_property = self.session.get(Property, property_id)
        
        if not current_property:
            raise ValueError(f"Property {property_id} not found")
        
        return current_property
    
    def compare_versions(
        self,
        property_id: UUID,
        version1: int,
        version2: int
    ) -> dict:
        """
        Compare two versions of a property for trend analysis
        
        Args:
            property_id: UUID of the property
            version1: First version number
            version2: Second version number
            
        Returns:
            Dictionary with comparison data (price change, etc.)
        """
        # Get version 1 from history
        history1 = self.session.exec(
            select(PropertyHistory).where(
                PropertyHistory.original_id == property_id,
                PropertyHistory.version == version1
            )
        ).first()
        
        # Get version 2 (could be current or historical)
        if version2 == self.get_current_version(property_id).version:
            version2_data = self.get_current_version(property_id)
            v2_price = version2_data.price
            v2_price_per_m2 = version2_data.price_per_m2
        else:
            history2 = self.session.exec(
                select(PropertyHistory).where(
                    PropertyHistory.original_id == property_id,
                    PropertyHistory.version == version2
                )
            ).first()
            v2_price = history2.price if history2 else None
            v2_price_per_m2 = history2.price_per_m2 if history2 else None
        
        if not history1:
            raise ValueError(f"Version {version1} not found for property {property_id}")
        
        # Calculate changes
        price_change = v2_price - history1.price if v2_price else 0
        price_change_pct = (price_change / history1.price * 100) if history1.price > 0 else 0
        
        return {
            "property_id": property_id,
            "version1": version1,
            "version2": version2,
            "price_v1": float(history1.price),
            "price_v2": float(v2_price) if v2_price else None,
            "price_change": float(price_change),
            "price_change_percentage": round(price_change_pct, 2),
            "price_per_m2_v1": float(history1.price_per_m2),
            "price_per_m2_v2": float(v2_price_per_m2) if v2_price_per_m2 else None
        }
    
    def get_property_price_history(
        self,
        property_id: UUID
    ) -> List[dict]:
        """
        Get price history timeline for a property
        
        Useful for charting price changes over time
        
        Args:
            property_id: UUID of the property
            
        Returns:
            List of price data points with timestamps
        """
        history = self.get_property_history(property_id)
        current = self.get_current_version(property_id)
        
        # Build timeline
        timeline = []
        
        # Add historical versions
        for record in reversed(history):  # Oldest to newest
            timeline.append({
                "version": record.version,
                "timestamp": record.version_timestamp.isoformat(),
                "price": float(record.price),
                "price_per_m2": float(record.price_per_m2)
            })
        
        # Add current version
        timeline.append({
            "version": current.version,
            "timestamp": current.updated_at.isoformat(),
            "price": float(current.price),
            "price_per_m2": float(current.price_per_m2)
        })
        
        return timeline
