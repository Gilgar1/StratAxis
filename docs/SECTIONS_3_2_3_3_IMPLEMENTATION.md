# Sections 3.2 & 3.3 Implementation: Indexes and Data Versioning

**Blueprint Sections:** 3.2 (Indexes) + 3.3 (Data Versioning Strategy)  
**Implementation Date:** 2026-01-28  
**Status:** ✅ COMPLETE

---

## Overview

This document details the complete implementation of:
- **Section 3.2:** Database Indexes for performance optimization
- **Section 3.3:** Data Versioning strategies for Properties, ML Models, and Listings

---

## Section 3.2: Database Indexes

### Implementation

All indexes specified in blueprint 3.2 are implemented in the Alembic migration:
- **File:** `backend/alembic/versions/001_initial_schema.py`

### 3.2.1. Property Table Indexes (8 total)

```sql
-- 1. Composite B-tree for city + property_type queries
CREATE INDEX ix_properties_city_property_type ON properties (city, property_type);

-- 2. Price index (ascending) for price range queries
CREATE INDEX ix_properties_price ON properties (price);

-- 3. Price per m² index for comparative queries  
CREATE INDEX ix_properties_price_per_m2 ON properties (price_per_m2);

-- 4. Created_at index (descending) for "newest first" queries
CREATE INDEX ix_properties_created_at ON properties (created_at DESC);

-- 5. PostGIS GIST index for geospatial queries
CREATE INDEX ix_properties_location ON properties USING gist (location);

-- 6. GIN index for full-text search on titles
CREATE INDEX ix_properties_title_search ON properties 
USING GIN (to_tsvector('english', title));

-- 7. Composite index for neighborhood queries
CREATE INDEX ix_properties_city_neighborhood ON properties (city, neighborhood);

-- 8. Composite index for data pipeline queries
CREATE INDEX ix_properties_data_source_validation ON properties (data_source_id, validation_status);
```

**Query Optimization Examples:**

```sql
-- Uses index #1 (city, property_type)
SELECT * FROM properties 
WHERE city = 'Yaoundé' AND property_type = 'apartment';

-- Uses index #5 (GIST geospatial)
SELECT * FROM properties
WHERE ST_DWithin(location, ST_SetSRID(ST_MakePoint(11.5021, 3.8480), 4326), 5000);

-- Uses index #6 (GIN full-text search)
SELECT * FROM properties
WHERE to_tsvector('english', title) @@ to_tsquery('english', 'apartment');
```

### 3.2.2. Listing Table Indexes (3 total)

```sql
-- 1. Composite for city + type + time queries
CREATE INDEX ix_listings_city_type_period ON listings (city, property_type, period_start);

-- 2. Composite for neighborhood analytics
CREATE INDEX ix_listings_city_neighborhood_period ON listings (city, neighborhood, period_start);

-- 3. Time-series queries (descending)
CREATE INDEX ix_listings_period_start ON listings (period_start DESC);
```

### 3.2.3. User Table Indexes (3 total)

```sql
-- 1. Unique B-tree for email lookups
CREATE UNIQUE INDEX ix_users_email ON users (email);

-- 2. Role index for RBAC queries
CREATE INDEX ix_users_role ON users (role);

-- 3. Created_at for analytics queries
CREATE INDEX ix_users_created_at ON users (created_at);
```

### 3.2.4. Booking Table Indexes (3 total)

```sql
-- 1. User_id for user-specific queries
CREATE INDEX ix_bookings_user_id ON bookings (user_id);

-- 2. Composite for admin dashboard queries
CREATE INDEX ix_bookings_status_date ON bookings (status, preferred_date);

-- 3. Date index for availability checks
CREATE INDEX ix_bookings_preferred_date ON bookings (preferred_date);
```

### Index Health Monitoring

**Admin Endpoint:** `GET /api/admin/indexes/health`

Returns:
- Total index count
- Top 20 most-used indexes
- Scan count statistics
- Unused index identification

**Example Response:**
```json
{
  "total_indexes": 27,
  "top_used_indexes": [
    {
      "schema": "public",
      "table": "properties",
      "index": "ix_properties_city_property_type",
      "scans": 15423,
      "tuples_read": 245678,
      "tuples_fetched": 12345
    }
  ],
  "note": "Indexes with scan_count=0 might be unused"
}
```

---

## Section 3.3: Data Versioning Strategy

### 3.3.1. Property Versioning

**Implemented in:** `backend/src/services/property_versioning.py`

#### Strategy

1. **New properties:** `version = 1`
2. **Updates from re-scraping:**
   - Archive current version to `property_history` table
   - Increment `version` in `properties` table
   - Update fields with new data
3. **PropertyHistory table:** Same schema + versioning fields
4. **Current properties:** Only latest version in `properties` table
5. **Historical analysis:** Query `property_history` for trends

#### Service Methods

```python
from src.services.property_versioning import PropertyVersioningService

# Initialize service
service = PropertyVersioningService(session)

# Create new property (version = 1)
property = service.create_new_property({
    "title": "Apartment in Bastos",
    "city": "Yaoundé",
    "property_type": "apartment",
    "price": 35000000,
    "size": 120
})

# Update property from re-scraping
updated = service.update_property_from_scrape(
    property_id=property.id,
    new_data={"price": 37000000}  # Price increased
)  # Automatically archives old version, increments to version 2

# Get property history
history = service.get_property_history(property.id, limit=10)

# Compare versions
comparison = service.compare_versions(
    property_id=property.id,
    version1=1,
    version2=2
)
# Returns: price_change, price_change_percentage, etc.

# Get price timeline for charting
timeline = service.get_property_price_history(property.id)
```

#### Admin Endpoint

**Endpoint:** `GET /api/admin/property/{property_id}/history`

Returns version history with:
- Current version and price
- Historical versions with timestamps
- Price changes over time

**Example Response:**
```json
{
  "property_id": "uuid",
  "current_version": 3,
  "current_price": 38000000,
  "history_count": 2,
  "history": [
    {
      "version": 2,
      "timestamp": "2024-02-15T10:30:00Z",
      "price": 37000000,
      "price_per_m2": 308333.33,
      "quality_score": 92.5
    },
    {
      "version": 1,
      "timestamp": "2024-01-10T14:20:00Z",
      "price": 35000000,
      "price_per_m2": 291666.67,
      "quality_score": 90.0
    }
  ]
}
```

---

### 3.3.2. ML Model Versioning

**Implemented in:** `backend/src/services/model_versioning.py`

#### Strategy

1. **Semantic versioning:** `major.minor.patch` (e.g., "1.2.3")
2. **Version increment rules:**
   - **Major:** Breaking API changes, significant algorithm change
   - **Minor:** New features, improved accuracy
   - **Patch:** Bug fixes, parameter tuning
3. **Only one active model per type** (price_prediction, trend_forecast)
4. **Archive previous models** when activating new one

#### Service Methods

```python
from src.services.model_versioning import ModelVersioningService
from src.models.ml_model import ModelType

service = ModelVersioningService(session)

# Create new model
model = service.create_model(
    name="price_prediction_v2",
    version="2.0.0",  # Major version bump
    model_type=ModelType.PRICE_PREDICTION,
    algorithm="XGBoost",
    metrics={"mse": 123456, "mae": 98765, "r2": 0.87},
    model_path="/models/price_pred_v2.pkl"
)

# Activate model (automatically archives previous active model)
activated = service.activate_model(model.id)

# Get currently active model
active_model = service.get_active_model(ModelType.PRICE_PREDICTION)

# Get model version history
history = service.get_model_history(ModelType.PRICE_PREDICTION, limit=5)

# Increment version programmatically
new_version = service.increment_version("1.2.3", "minor")  # Returns "1.3.0"

# Compare model performance
comparison = service.compare_model_performance(model_id_1, model_id_2)
```

#### Version Increment Examples

```python
# Blueprint 3.3.2.2: Major version (breaking changes)
service.increment_version("1.5.2", "major")  # → "2.0.0"

# Blueprint 3.3.2.3: Minor version (new features)
service.increment_version("1.5.2", "minor")  # → "1.6.0"

# Blueprint 3.3.2.4: Patch version (bug fixes)
service.increment_version("1.5.2", "patch")  # → "1.5.3"
```

---

### 3.3.3. Listing Aggregation Versioning

**Implemented in:** `backend/src/services/listing_retention.py`

#### Strategy

1. **Listings are time-period snapshots** (not versioned)
2. **Recalculate monthly** (previous month → historical data)
3. **Keep last 24 months** for trend analysis
4. **Delete older aggregates** (or archive to cold storage)

#### Service Methods

```python
from src.services.listing_retention import ListingRetentionService

service = ListingRetentionService(session)

# Recalculate monthly aggregates (for previous month)
aggregates_created = service.recalculate_monthly_aggregates()

# Cleanup old listings (older than 24 months)
deleted_count = service.cleanup_old_listings(retention_months=24)

# Get retention statistics
stats = service.get_retention_stats()
# Returns: total_listings, oldest_period, newest_period, retention_months

# Run full monthly aggregation job
result = service.schedule_monthly_aggregation()
```

#### Scheduled Job

**File:** `backend/src/jobs/scheduled_jobs.py`

Automated monthly job that runs on the 1st of each month at 02:00 UTC:

```python
# Setup scheduled jobs (call at application startup)
from src.jobs.scheduled_jobs import setup_scheduled_jobs
setup_scheduled_jobs()

# Manually trigger job (for testing/admin)
from src.jobs.scheduled_jobs import run_job_manually
run_job_manually("listing_aggregation")
```

#### Admin Endpoints

**1. Trigger Aggregation:** `POST /api/admin/jobs/listing-aggregation`

Manually trigger monthly aggregation job.

**Response:**
```json
{
  "message": "Listing aggregation completed",
  "result": {
    "status": "success",
    "aggregates_created": 45,
    "listings_deleted": 12,
    "execution_time_seconds": 2.4,
    "timestamp": "2024-01-28T10:00:00Z"
  }
}
```

**2. Retention Stats:** `GET /api/admin/retention/stats`

Get listing retention statistics.

**Response:**
```json
{
  "listing_retention": {
    "total_listings": 540,
    "monthly_aggregates": 540,
    "oldest_period": "2022-02-01",
    "newest_period": "2024-01-01",
    "retention_months": 24
  },
  "retention_policy": "24 months",
  "aggregation_frequency": "monthly"
}
```

---

## Files Created/Modified

```
backend/
├── src/
│   ├── services/
│   │   ├── __init__.py                   ✅ NEW (service exports)
│   │   ├── property_versioning.py        ✅ NEW (3.3.1 implementation)
│   │   ├── model_versioning.py           ✅ NEW (3.3.2 implementation)
│   │   └── listing_retention.py          ✅ NEW (3.3.3 implementation)
│   │
│   ├── jobs/
│   │   └── scheduled_jobs.py             ✅ NEW (monthly aggregation scheduler)
│   │
│   └── routers/
│       └── admin.py                      ✅ UPDATED (added versioning endpoints)
│
└── alembic/
    └── versions/
        └── 001_initial_schema.py         ✅ ALREADY CREATED (all indexes)
```

---

## Integration Guide

### ETL Pipeline Integration (Property Versioning)

When updating properties from re-scraping:

```python
from src.services.property_versioning import PropertyVersioningService

def update_properties_from_scrape(session, scraped_data):
    """Update properties with new scraped data"""
    service = PropertyVersioningService(session)
    
    for record in scraped_data:
        # Find existing property by data_source_record_id
        existing = session.exec(
            select(Property).where(
                Property.data_source_record_id == record['id']
            )
        ).first()
        
        if existing:
            # Update existing (archives old version automatically)
            service.update_property_from_scrape(
                property_id=existing.id,
                new_data=record
            )
        else:
            # Create new (version = 1)
            service.create_new_property(record)
```

### ML Pipeline Integration (Model Versioning)

When deploying new ML models:

```python
from src.services.model_versioning import ModelVersioningService

def deploy_new_model(session, model_data):
    """Deploy new ML model with versioning"""
    service = ModelVersioningService(session)
    
    # Get latest version
    latest_version = service.get_latest_version_for_type(
        ModelType.PRICE_PREDICTION
    )
    
    # Increment version based on change type
    if model_data['breaking_changes']:
        new_version = service.increment_version(latest_version, "major")
    elif model_data['accuracy_improved']:
        new_version = service.increment_version(latest_version, "minor")
    else:
        new_version = service.increment_version(latest_version, "patch")
    
    # Create model
    model = service.create_model(
        name=f"price_prediction_{new_version}",
        version=new_version,
        model_type=ModelType.PRICE_PREDICTION,
        metrics=model_data['metrics'],
        model_path=model_data['path']
    )
    
    # Activate (archives previous active model)
    service.activate_model(model.id)
```

### Cron Setup (Listing Aggregation)

**Using systemd (Linux):**

```ini
# /etc/systemd/system/strataxis-aggregation.service
[Unit]
Description=StratAxis Monthly Listing Aggregation
After=network.target

[Service]
Type=oneshot
User=strataxis
WorkingDirectory=/opt/strataxis/backend
ExecStart=/opt/strataxis/backend/venv/bin/python -c "from src.jobs.scheduled_jobs import run_job_manually; run_job_manually('listing_aggregation')"

[Install]
WantedBy=multi-user.target
```

```ini
# /etc/systemd/system/strataxis-aggregation.timer
[Unit]
Description=Run StratAxis aggregation monthly
Requires=strataxis-aggregation.service

[Timer]
OnCalendar=monthly
OnCalendar=*-*-01 02:00:00
Persistent=true

[Install]
WantedBy=timers.target
```

Enable:
```bash
sudo systemctl enable strataxis-aggregation.timer
sudo systemctl start strataxis-aggregation.timer
```

**Using cron:**

```cron
# Run on 1st of every month at 02:00
0 2 1 * * cd /opt/strataxis/backend && /opt/strataxis/backend/venv/bin/python -c "from src.jobs.scheduled_jobs import run_job_manually; run_job_manually('listing_aggregation')"
```

---

## Testing

### Test Property Versioning

```python
# Create property
service = PropertyVersioningService(session)
prop = service.create_new_property({
    "title": "Test Property",
    "city": "Yaoundé",
    "property_type": "apartment",
    "price": 30000000,
    "size": 100
})

assert prop.version == 1

# Update property
updated = service.update_property_from_scrape(
    prop.id,
    {"price": 32000000}
)

assert updated.version == 2

# Check history
history = service.get_property_history(prop.id)
assert len(history) == 1
assert history[0].price == 30000000  # Old price archived
```

### Test Model Versioning

```python
service = ModelVersioningService(session)

# Create model
model = service.create_model(
    name="test_model",
    version="1.0.0",
    model_type=ModelType.PRICE_PREDICTION
)

assert service._is_valid_semantic_version("1.0.0")
assert not service._is_valid_semantic_version("1.0")

# Test increment
assert service.increment_version("1.2.3", "major") == "2.0.0"
assert service.increment_version("1.2.3", "minor") == "1.3.0"
assert service.increment_version("1.2.3", "patch") == "1.2.4"
```

### Test Listing Retention

```python
service = ListingRetentionService(session)

# Recalculate aggregates
count = service.recalculate_monthly_aggregates()
print(f"Created {count} aggregates")

# Check stats
stats = service.get_retention_stats()
assert stats['retention_months'] <= 24

# Manual cleanup
deleted = service.cleanup_old_listings(retention_months=24)
print(f"Deleted {deleted} old listings")
```

---

## Blueprint Compliance

| Requirement | Implementation | Status |
|------------|----------------|--------|
| 3.2.1. Property Indexes (8) | Alembic migration | ✅ 100% |
| 3.2.2. Listing Indexes (3) | Alembic migration | ✅ 100% |
| 3.2.3. User Indexes (3) | Alembic migration | ✅ 100% |
| 3.2.4. Booking Indexes (3) | Alembic migration | ✅ 100% |
| 3.3.1.1. New property v=1 | PropertyVersioningService | ✅ 100% |
| 3.3.1.2. Update with archiving | PropertyVersioningService | ✅ 100% |
| 3.3.1.3. PropertyHistory table | Created model + service | ✅ 100% |
| 3.3.1.4. Current version query | PropertyVersioningService | ✅ 100% |
| 3.3.1.5. Historical analysis | PropertyVersioningService | ✅ 100% |
| 3.3.2.1. Semantic versioning | ModelVersioningService | ✅ 100% |
| 3.3.2.2-4. Version increment | ModelVersioningService | ✅ 100% |
| 3.3.2.5. Single active model | ModelVersioningService | ✅ 100% |
| 3.3.2.6. Archive previous | ModelVersioningService | ✅ 100% |
| 3.3.3.1. Time-period snapshots | ListingRetentionService | ✅ 100% |
| 3.3.3.2. Monthly recalculation | ListingRetentionService + scheduler | ✅ 100% |
| 3.3.3.3. 24-month retention | ListingRetentionService | ✅ 100% |
| 3.3.3.4. Delete old aggregates | ListingRetentionService | ✅ 100% |

**TOTAL COMPLIANCE: 100%**

---

## Conclusion

**Sections 3.2 and 3.3 are 100% COMPLETE** per blueprint specifications:

✅ **3.2 Indexes:** All 17 indexes implemented via Alembic migration  
✅ **3.3.1 Property Versioning:** Full service layer with history tracking  
✅ **3.3.2 ML Model Versioning:** Semantic versioning with activation logic  
✅ **3.3.3 Listing Retention:** Monthly aggregation with automated cleanup  

The implementation provides:
- Production-ready database performance optimization
- Complete version tracking for trend analysis
- Automated data lifecycle management
- Admin endpoints for monitoring and control

---

**Sections 3.2 & 3.3 Implementation Complete ✅**
