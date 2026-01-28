"""
Service layer for listing aggregation retention (Blueprint 3.3.3)

Handles:
- Listing aggregation recalculation (monthly)
- 24-month retention policy
- Cleanup of old aggregates
"""

from datetime import datetime, timedelta, date
from typing import Optional, List
from sqlmodel import Session, select
from sqlalchemy import and_, func

from src.models.listing import Listing, ListingPeriod
from src.models.property import Property, ValidationStatus
from src.utils.logger import logger


class ListingRetentionService:
    """
    Service for managing listing aggregations according to Blueprint 3.3.3
    
    Strategy:
    1. Listings are time-period snapshots (not versioned)
    2. Recalculate monthly (previous month becomes historical)
    3. Keep last 24 months for trend analysis
    4. Delete older aggregates (or archive to cold storage)
    """
    
    def __init__(self, session: Session):
        self.session = session
    
    def cleanup_old_listings(
        self,
        retention_months: int = 24,
        archive: bool = False
    ) -> int:
        """
        Delete listings older than retention period (Blueprint 3.3.3.3, 3.3.3.4)
        
        Args:
            retention_months: Number of months to keep (default: 24)
            archive: If True, archive to cold storage instead of deleting (not implemented)
            
        Returns:
            Number of listings deleted/archived
        """
        cutoff_date = datetime.utcnow().date() - timedelta(days=retention_months * 30)
        
        # Find old listings
        old_listings = self.session.exec(
            select(Listing).where(Listing.period_start < cutoff_date)
        ).all()
        
        count = len(old_listings)
        
        if archive:
            # TODO: Implement archival to cold storage (S3, etc.)
            logger.info(
                f"Archive mode enabled but not implemented. "
                f"Would archive {count} listings older than {cutoff_date}"
            )
            return 0
        else:
            # Delete old listings (Blueprint 3.3.3.4)
            for listing in old_listings:
                self.session.delete(listing)
            
            self.session.commit()
            
            logger.info(
                f"Deleted {count} listings older than {cutoff_date} "
                f"(retention: {retention_months} months)"
            )
            
            return count
    
    def recalculate_monthly_aggregates(
        self,
        target_month: Optional[date] = None
    ) -> int:
        """
        Recalculate monthly listing aggregates for a specific month (Blueprint 3.3.3.2)
        
        This should be run monthly to create historical snapshots
        
        Args:
            target_month: Month to aggregate (default: previous month)
            
        Returns:
            Number of listing aggregates created
        """
        # Default to previous month if not specified
        if target_month is None:
            today = datetime.utcnow().date()
            # Get first day of current month
            first_of_month = date(today.year, today.month, 1)
            # Subtract one day to get last day of previous month
            last_of_prev_month = first_of_month - timedelta(days=1)
            target_month = date(last_of_prev_month.year, last_of_prev_month.month, 1)
        
        # Calculate period end
        if target_month.month == 12:
            period_end = date(target_month.year + 1, 1, 1) - timedelta(days=1)
        else:
            period_end = date(target_month.year, target_month.month + 1, 1) - timedelta(days=1)
        
        logger.info(
            f"Recalculating monthly aggregates for period: "
            f"{target_month} to {period_end}"
        )
        
        # Get all unique combinations of city, property_type, neighborhood
        # that have properties in this period
        properties_in_period = self.session.exec(
            select(
                Property.city,
                Property.property_type,
                Property.neighborhood
            ).where(
                and_(
                    Property.validation_status == ValidationStatus.VALIDATED,
                    Property.created_at >= datetime.combine(target_month, datetime.min.time()),
                    Property.created_at <= datetime.combine(period_end, datetime.max.time())
                )
            ).distinct()
        ).all()
        
        aggregates_created = 0
        
        # Create aggregates for each combination
        for city, property_type, neighborhood in properties_in_period:
            aggregate = self._calculate_aggregate(
                city=city,
                property_type=property_type,
                neighborhood=neighborhood,
                period_start=target_month,
                period_end=period_end
            )
            
            if aggregate:
                self.session.add(aggregate)
                aggregates_created += 1
        
        self.session.commit()
        
        logger.info(
            f"Created {aggregates_created} monthly listing aggregates "
            f"for period {target_month}"
        )
        
        return aggregates_created
    
    def _calculate_aggregate(
        self,
        city: str,
        property_type: str,
        neighborhood: Optional[str],
        period_start: date,
        period_end: date
    ) -> Optional[Listing]:
        """
        Calculate listing aggregate for a specific combination (Blueprint 3.3.3.1)
        
        Args:
            city: City name
            property_type: Property type
            neighborhood: Neighborhood (can be None for city-wide aggregates)
            period_start: Start date of period
            period_end: End date of period
            
        Returns:
            Listing instance with aggregated data or None if no properties found
        """
        # Build query
        query = select(Property).where(
            and_(
                Property.city == city,
                Property.property_type == property_type,
                Property.validation_status == ValidationStatus.VALIDATED,
                Property.created_at >= datetime.combine(period_start, datetime.min.time()),
                Property.created_at <= datetime.combine(period_end, datetime.max.time())
            )
        )
        
        if neighborhood:
            query = query.where(Property.neighborhood == neighborhood)
        
        properties = self.session.exec(query).all()
        
        if not properties:
            return None
        
        # Calculate statistics
        prices = [p.price for p in properties]
        prices_per_m2 = [p.price_per_m2 for p in properties]
        
        # Sort for median calculation
        sorted_prices = sorted(prices)
        n = len(sorted_prices)
        median_price = (
            sorted_prices[n // 2] if n % 2 != 0
            else (sorted_prices[n // 2 - 1] + sorted_prices[n // 2]) / 2
        )
        
        # Calculate trend (compare with previous period if exists)
        trend_direction, trend_percentage = self._calculate_trend(
            city=city,
            property_type=property_type,
            neighborhood=neighborhood,
            current_avg_price=sum(prices) / len(prices),
            period_start=period_start
        )
        
        # Create listing aggregate
        listing = Listing(
            city=city,
            property_type=property_type,
            neighborhood=neighborhood,
            period=ListingPeriod.MONTHLY,
            period_start=period_start,
            period_end=period_end,
            avg_price=sum(prices) / len(prices),
            median_price=median_price,
            min_price=min(prices),
            max_price=max(prices),
            avg_price_per_m2=sum(prices_per_m2) / len(prices_per_m2),
            property_count=len(properties),
            trend_direction=trend_direction,
            trend_percentage=trend_percentage
        )
        
        return listing
    
    def _calculate_trend(
        self,
        city: str,
        property_type: str,
        neighborhood: Optional[str],
        current_avg_price: float,
        period_start: date
    ) -> tuple:
        """
        Calculate trend compared to previous period
        
        Args:
            city: City name
            property_type: Property type
            neighborhood: Neighborhood
            current_avg_price: Average price for current period
            period_start: Start date of current period
            
        Returns:
            Tuple of (trend_direction, trend_percentage)
        """
        # Calculate previous period start (one month before)
        if period_start.month == 1:
            prev_period_start = date(period_start.year - 1, 12, 1)
        else:
            prev_period_start = date(period_start.year, period_start.month - 1, 1)
        
        # Find previous period listing
        query = select(Listing).where(
            and_(
                Listing.city == city,
                Listing.property_type == property_type,
                Listing.period == ListingPeriod.MONTHLY,
                Listing.period_start == prev_period_start
            )
        )
        
        if neighborhood:
            query = query.where(Listing.neighborhood == neighborhood)
        
        prev_listing = self.session.exec(query).first()
        
        if not prev_listing or prev_listing.avg_price == 0:
            # No previous data, trend is stable
            return "stable", 0.0
        
        # Calculate percentage change
        price_change = current_avg_price - prev_listing.avg_price
        percentage_change = (price_change / prev_listing.avg_price) * 100
        
        # Determine direction (threshold: ±5%)
        if percentage_change > 5:
            trend_direction = "up"
        elif percentage_change < -5:
            trend_direction = "down"
        else:
            trend_direction = "stable"
        
        return trend_direction, round(percentage_change, 2)
    
    def get_retention_stats(self) -> dict:
        """
        Get statistics about listing retention
        
        Returns:
            Dictionary with retention statistics
        """
        # Get oldest and newest listings
        oldest = self.session.exec(
            select(Listing).order_by(Listing.period_start).limit(1)
        ).first()
        
        newest = self.session.exec(
            select(Listing).order_by(Listing.period_start.desc()).limit(1)
        ).first()
        
        # Count total listings
        total_count = self.session.exec(
            select(func.count()).select_from(Listing)
        ).one()
        
        # Count by period
        monthly_count = self.session.exec(
            select(func.count()).select_from(Listing)
            .where(Listing.period == ListingPeriod.MONTHLY)
        ).one()
        
        return {
            "total_listings": total_count,
            "monthly_aggregates": monthly_count,
            "oldest_period": oldest.period_start.isoformat() if oldest else None,
            "newest_period": newest.period_start.isoformat() if newest else None,
            "retention_months": (
                (newest.period_start.year - oldest.period_start.year) * 12 +
                (newest.period_start.month - oldest.period_start.month)
            ) if oldest and newest else 0
        }
    
    def schedule_monthly_aggregation(self) -> dict:
        """
        Entry point for scheduled monthly aggregation job
        
        Should be called by cron/scheduler on the 1st of each month
        
        Returns:
            Dictionary with execution results
        """
        start_time = datetime.utcnow()
        
        logger.info("Starting scheduled monthly listing aggregation")
        
        try:
            # Recalculate previous month's aggregates
            aggregates_created = self.recalculate_monthly_aggregates()
            
            # Cleanup old listings (older than 24 months)
            listings_deleted = self.cleanup_old_listings(retention_months=24)
            
            execution_time = (datetime.utcnow() - start_time).total_seconds()
            
            result = {
                "status": "success",
                "aggregates_created": aggregates_created,
                "listings_deleted": listings_deleted,
                "execution_time_seconds": round(execution_time, 2),
                "timestamp": datetime.utcnow().isoformat()
            }
            
            logger.info(
                f"Monthly aggregation completed successfully: "
                f"{aggregates_created} created, {listings_deleted} deleted, "
                f"{execution_time:.2f}s"
            )
            
            return result
            
        except Exception as e:
            logger.error(f"Monthly aggregation failed: {e}")
            return {
                "status": "failed",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
