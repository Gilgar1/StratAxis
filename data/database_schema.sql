-- StratAxis — data/database_schema.sql
-- Supabase / PostgreSQL table definitions for the new dynamic architecture.
--
-- Run this in your Supabase SQL editor to create all required tables.
-- Order matters: no foreign key issues.

-- ════════════════════════════════════════════════════════════
-- 1. RENT LISTINGS (from house_scraper.py → clean_rent.py)
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS rent_listings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    record_id       VARCHAR(64) UNIQUE NOT NULL,  -- MD5 hash of source+url+title
    title           TEXT,
    price           NUMERIC(15, 2),               -- Monthly rent in XAF
    price_raw       TEXT,
    city            VARCHAR(50),                  -- 'Douala' | 'Yaounde'
    neighborhood    VARCHAR(100),
    housing_type    VARCHAR(30),                  -- 'apartment' | 'house' | 'studio' | 'villa'
    bedrooms        INTEGER,
    bathrooms       INTEGER,
    size_m2         NUMERIC(10, 2),
    description     TEXT,
    source_url      TEXT,
    source_name     VARCHAR(50),
    quality_score   NUMERIC(5, 2) DEFAULT 100,
    validation_status VARCHAR(20) DEFAULT 'pending',  -- 'validated' | 'pending' | 'rejected'
    scraped_at      TIMESTAMPTZ,
    cleaned_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rent_city ON rent_listings(city);
CREATE INDEX IF NOT EXISTS idx_rent_city_type ON rent_listings(city, housing_type);
CREATE INDEX IF NOT EXISTS idx_rent_price ON rent_listings(price);
CREATE INDEX IF NOT EXISTS idx_rent_scraped ON rent_listings(scraped_at DESC);
CREATE INDEX IF NOT EXISTS idx_rent_validation ON rent_listings(validation_status);


-- ════════════════════════════════════════════════════════════
-- 2. LAND LISTINGS (from land_scraper.py → clean_land.py)
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS land_listings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    record_id       VARCHAR(64) UNIQUE NOT NULL,
    title           TEXT,
    total_price     NUMERIC(15, 2),
    price_raw       TEXT,
    lot_size_m2     NUMERIC(12, 2),
    size_raw        TEXT,
    price_per_m2    NUMERIC(15, 2),               -- KEY metric
    city            VARCHAR(50),
    neighborhood    VARCHAR(100),
    property_type   VARCHAR(20) DEFAULT 'land',
    description     TEXT,
    source_url      TEXT,
    source_name     VARCHAR(50),
    data_type       VARCHAR(10) DEFAULT 'land',
    quality_score   NUMERIC(5, 2) DEFAULT 100,
    validation_status VARCHAR(20) DEFAULT 'pending',
    scraped_at      TIMESTAMPTZ,
    cleaned_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_land_city ON land_listings(city);
CREATE INDEX IF NOT EXISTS idx_land_ppm2 ON land_listings(price_per_m2);
CREATE INDEX IF NOT EXISTS idx_land_city_nbhd ON land_listings(city, neighborhood);
CREATE INDEX IF NOT EXISTS idx_land_validation ON land_listings(validation_status);


-- ════════════════════════════════════════════════════════════
-- 3. INSTITUTIONAL DOCUMENTS (from institutional_scraper.py)
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS institutional_documents (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    record_id           VARCHAR(64) UNIQUE NOT NULL,
    title               TEXT NOT NULL,
    source_name         VARCHAR(50),
    source_display      VARCHAR(100),
    document_url        TEXT,
    pdf_url             TEXT,
    pdf_local_path      TEXT,
    publication_date    DATE,
    year                INTEGER,
    category            VARCHAR(50),              -- 'housing' | 'construction' | 'economic' | 'policy' | 'land'
    relevance_keywords  TEXT,
    summary             TEXT,
    language            VARCHAR(10) DEFAULT 'fr',
    scraped_at          TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inst_category ON institutional_documents(category);
CREATE INDEX IF NOT EXISTS idx_inst_year ON institutional_documents(year);
CREATE INDEX IF NOT EXISTS idx_inst_source ON institutional_documents(source_name);


-- ════════════════════════════════════════════════════════════
-- 4. HOUSING INDICATORS (extracted by ML from gov docs)
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS housing_indicators (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    year                        INTEGER NOT NULL,
    city                        VARCHAR(50),
    construction_permits        INTEGER,
    housing_stock_estimate      INTEGER,
    avg_price_index             NUMERIC(10, 4),   -- Indexed to base year 2020 = 100
    affordability_ratio         NUMERIC(8, 4),    -- Median income / median rent
    vacancy_rate_pct            NUMERIC(6, 2),
    social_housing_units        INTEGER,
    private_housing_units       INTEGER,
    source_document_id          UUID REFERENCES institutional_documents(id),
    created_at                  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_indicators_year_city ON housing_indicators(year, city);


-- ════════════════════════════════════════════════════════════
-- 5. CONSTRUCTION PERMITS
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS construction_permits (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city            VARCHAR(50) NOT NULL,
    year            INTEGER NOT NULL,
    month           INTEGER,                      -- 1-12, NULL for annual
    permit_count    INTEGER,
    residential     INTEGER,
    commercial      INTEGER,
    industrial      INTEGER,
    source_name     VARCHAR(100),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(city, year, month)
);

CREATE INDEX IF NOT EXISTS idx_permits_city_year ON construction_permits(city, year);


-- ════════════════════════════════════════════════════════════
-- 6. PRICE TRENDS (computed monthly by forecast_service.py)
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS price_trends (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city            VARCHAR(50) NOT NULL,
    period          VARCHAR(7) NOT NULL,          -- '2024-01' format
    data_type       VARCHAR(10) NOT NULL,         -- 'rent' | 'land'
    avg_price       NUMERIC(15, 2),
    median_price    NUMERIC(15, 2),
    min_price       NUMERIC(15, 2),
    max_price       NUMERIC(15, 2),
    count           INTEGER,
    trend_pct       NUMERIC(6, 2),                -- % change from previous period
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(city, period, data_type)
);

CREATE INDEX IF NOT EXISTS idx_trends_city_type ON price_trends(city, data_type);
CREATE INDEX IF NOT EXISTS idx_trends_period ON price_trends(period DESC);


-- ════════════════════════════════════════════════════════════
-- 7. PRICE PREDICTIONS (output of forecast_service.py ML)
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS price_predictions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city            VARCHAR(50) NOT NULL,
    data_type       VARCHAR(10) NOT NULL,         -- 'rent' | 'land'
    predicted_for   DATE NOT NULL,                -- Future month being predicted
    predicted_price NUMERIC(15, 2),
    lower_bound     NUMERIC(15, 2),
    upper_bound     NUMERIC(15, 2),
    model_used      VARCHAR(50),                  -- 'ml_model' | 'statistical'
    horizon_month   INTEGER,                      -- 1-12
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_preds_city_type ON price_predictions(city, data_type);
CREATE INDEX IF NOT EXISTS idx_preds_date ON price_predictions(predicted_for);


-- ════════════════════════════════════════════════════════════
-- 8. MARKET INTELLIGENCE (ML-extracted insights from docs)
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS market_intelligence (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title               TEXT,
    category            VARCHAR(50),
    city                VARCHAR(50),
    year                INTEGER,
    extracted_value     NUMERIC(15, 2),
    extracted_unit      VARCHAR(30),
    insight_text        TEXT,
    relevance_score     NUMERIC(5, 4),            -- 0.0 to 1.0 from ML model
    source_document_id  UUID REFERENCES institutional_documents(id),
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_intel_category ON market_intelligence(category);
CREATE INDEX IF NOT EXISTS idx_intel_relevance ON market_intelligence(relevance_score DESC);


-- ════════════════════════════════════════════════════════════
-- 9. RENT SUMMARY (materialized-like, refreshed periodically)
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS rent_summary (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city            VARCHAR(50) NOT NULL,
    neighborhood    VARCHAR(100),
    housing_type    VARCHAR(30),
    avg_price       NUMERIC(15, 2),
    median_price    NUMERIC(15, 2),
    min_price       NUMERIC(15, 2),
    max_price       NUMERIC(15, 2),
    count           INTEGER,
    computed_at     TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(city, neighborhood, housing_type)
);


-- ════════════════════════════════════════════════════════════
-- 10. LAND SUMMARY (materialized-like)
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS land_summary (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city                VARCHAR(50) NOT NULL,
    neighborhood        VARCHAR(100),
    avg_price_per_m2    NUMERIC(15, 2),
    median_price_per_m2 NUMERIC(15, 2),
    min_price_per_m2    NUMERIC(15, 2),
    max_price_per_m2    NUMERIC(15, 2),
    listing_count       INTEGER,
    computed_at         TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(city, neighborhood)
);
