# Data Pipeline Overview

The StratAxis data pipeline follows an **ETL (Extract, Transform, Load)** architecture with an additional **Validation** layer.

## 1. Extract
- Multi-source ingestion: Web Scrapers and OCR Processors.
- Normalization to a common JSON schema.

## 2. Transform
- Currency normalization (XAF).
- Location standardization and geocoding.
- Property type mapping.
- Price per m² calculation.

## 3. Validate
- **Schema Validation**: Correct types and required fields.
- **Quality Scoring**: Completeness, Consistency, Accuracy.
- **Outlier Detection**: Z-score and business logic checks.

## 4. Load
- Batch operations into PostgreSQL.
- Conflict resolution (Upsert based on source/ID).
- Auto-trigger of listing aggregations.
