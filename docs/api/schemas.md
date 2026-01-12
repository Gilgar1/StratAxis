# Schema Decisions

This document outlines the architecture and design decisions for the StratAxis PostgreSQL database schema.

## 1. Relational Model vs. JSONB
For the MVP, we prioritize strict relational integrity for core business logic, while using `JSONB` for flexible or unstructured data to minimize frequent schema migrations.

### JSONB Usage:
- `Properties.images`: A list of strings for image URLs. Avoids a separate `PropertyImages` table for the MVP.
- `DataSources.config`: Configuration unique to scrapers or OCR (e.g., selectors, keys).
- `MLModels.metrics` and `MLModels.feature_importance`: Stores heterogeneous evaluation data (MSE, MAE, feature names).
- `PricePredictions.input_data`: Stores the exact parameters used for a prediction for reproducibility.

## 2. Geospatial Data (PostGIS)
We use `Geography(Point, 4326)` for property locations.
- **Decision**: `Geography` is preferred over `Geometry` for global coordinate systems (WGS84) to simplify distance-based queries without manual projection.
- **Extension**: `postgis` must be enabled on the database.

## 3. Versioning and History
- `Properties.version`: Tracks the number of times a listing has been updated from source.
- `Properties.scraped_at`: Records the last collection time to ensure data freshness.
- `PricePredictions`: Acts as a history of ML interactions, serving both as a cache and an audit trail.

## 4. Enumerations
Standard Python `Enums` are mapped to PostgreSQL types via `SQLModel`/`SQLAlchemy`.
- Roles: `FREE_USER`, `PAID_USER`, `ADMIN`.
- Statuses: `PENDING`, `VALIDATED`, `REJECTED`.
- Property Types: `apartment`, `house`, `land`, `commercial`.

## 5. Indexes
Specific indexes are defined in `blueprint.txt` (Section 3.2). Key optimizations include:
- `GIN` indexes for full-text search on property titles.
- `GIST` indexes for geospatial queries.
- Composite indexes on `(city, property_type)` for frequent dashboard filtering.
