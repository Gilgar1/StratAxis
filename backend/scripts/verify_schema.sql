-- =====================================================================
-- DATABASE SCHEMA VERIFICATION SCRIPT
-- Blueprint Section 3.1 & 3.2
-- =====================================================================

-- Enable timing
\timing on

-- =====================================================================
-- 1. VERIFY EXTENSIONS
-- =====================================================================
\echo '\n=== CHECKING EXTENSIONS ===\n'
SELECT 
    extname AS extension_name,
    extversion AS version
FROM pg_extension
WHERE extname IN ('postgis', 'uuid-ossp')
ORDER BY extname;

-- =====================================================================
-- 2. VERIFY ALL TABLES EXIST
-- =====================================================================
\echo '\n=== CHECKING TABLES ===\n'
SELECT 
    table_name,
    (SELECT count(*) FROM information_schema.columns WHERE table_name = t.table_name) AS column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Expected: 8 tables (users, properties, property_history, listings, bookings, data_sources, ml_models, price_predictions)

-- =====================================================================
-- 3. VERIFY INDEXES (Blueprint 3.2)
-- =====================================================================
\echo '\n=== CHECKING INDEXES ===\n'
SELECT 
    tablename AS table_name,
    indexname AS index_name,
    indexdef AS index_definition
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Expected: 25+ indexes

-- =====================================================================
-- 4. VERIFY PROPERTY TABLE INDEXES (3.2.1 - Should have 8 indexes)
-- =====================================================================
\echo '\n=== PROPERTY TABLE INDEXES (Should be 8) ===\n'
SELECT 
    indexname AS index_name,
    indexdef AS definition
FROM pg_indexes
WHERE schemaname = 'public' 
    AND tablename = 'properties'
ORDER BY indexname;

-- =====================================================================
-- 5. VERIFY LISTING TABLE INDEXES (3.2.2 - Should have 3 indexes)
-- =====================================================================
\echo '\n=== LISTING TABLE INDEXES (Should be 3) ===\n'
SELECT 
    indexname AS index_name,
    indexdef AS definition
FROM pg_indexes
WHERE schemaname = 'public' 
    AND tablename = 'listings'
ORDER BY indexname;

-- =====================================================================
-- 6. VERIFY USER TABLE INDEXES (3.2.3 - Should have 3 indexes)
-- =====================================================================
\echo '\n=== USER TABLE INDEXES (Should be 3) ===\n'
SELECT 
    indexname AS index_name,
    indexdef AS definition
FROM pg_indexes
WHERE schemaname = 'public' 
    AND tablename = 'users'
ORDER BY indexname;

-- =====================================================================
-- 7. VERIFY BOOKING TABLE INDEXES (3.2.4 - Should have 3 indexes)
-- =====================================================================
\echo '\n=== BOOKING TABLE INDEXES (Should be 3) ===\n'
SELECT 
    indexname AS index_name,
    indexdef AS definition
FROM pg_indexes
WHERE schemaname = 'public' 
    AND tablename = 'bookings'
ORDER BY indexname;

-- =====================================================================
-- 8. VERIFY FOREIGN KEY CONSTRAINTS
-- =====================================================================
\echo '\n=== FOREIGN KEY CONSTRAINTS ===\n'
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- =====================================================================
-- 9. VERIFY CHECK CONSTRAINTS (price > 0, size > 0)
-- =====================================================================
\echo '\n=== CHECK CONSTRAINTS ===\n'
SELECT
    tc.table_name,
    tc.constraint_name,
    cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_schema = 'public'
    AND tc.constraint_type = 'CHECK'
ORDER BY tc.table_name;

-- =====================================================================
-- 10. VERIFY COLUMN DATA TYPES
-- =====================================================================
\echo '\n=== PROPERTIES TABLE COLUMNS ===\n'
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    numeric_precision,
    numeric_scale,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'properties'
ORDER BY ordinal_position;

-- =====================================================================
-- 11. VERIFY POSTGIS FUNCTIONALITY
-- =====================================================================
\echo '\n=== POSTGIS VERSION ===\n'
SELECT PostGIS_Version();

\echo '\n=== POSTGIS GEOMETRY COLUMNS ===\n'
SELECT 
    f_table_name AS table_name,
    f_geometry_column AS geometry_column,
    coord_dimension,
    srid,
    type
FROM geometry_columns;

-- =====================================================================
-- 12. TEST INSERTS (Verify constraints and defaults work)
-- =====================================================================
\echo '\n=== TESTING SAMPLE INSERTS ===\n'

-- Test user insert
INSERT INTO users (email, password, first_name, last_name)
VALUES ('test@strataxis.cm', 'hashed_password', 'Test', 'User')
ON CONFLICT (email) DO NOTHING;

-- Test data source insert
INSERT INTO data_sources (name, type, source_url, is_active)
VALUES ('TestScraper', 'scraper', 'https://example.cm', true)
ON CONFLICT (name) DO NOTHING;

-- Test property insert with PostGIS location
INSERT INTO properties (
    title, 
    city, 
    property_type, 
    price, 
    size, 
    location,
    data_source_id
)
SELECT 
    'Test Apartment in Bastos',
    'Yaoundé',
    'apartment',
    35000000,
    120,
    ST_SetSRID(ST_MakePoint(11.5021, 3.8480), 4326),
    id
FROM data_sources WHERE name = 'TestScraper'
LIMIT 1
ON CONFLICT DO NOTHING;

\echo '\n--- Inserted sample data successfully ---\n'

-- =====================================================================
-- 13. VERIFY GEOSPATIAL INDEX WORKS
-- =====================================================================
\echo '\n=== TESTING GEOSPATIAL QUERY (Uses GIST index) ===\n'
EXPLAIN ANALYZE
SELECT 
    title,
    city,
    ST_Distance(location, ST_SetSRID(ST_MakePoint(11.5021, 3.8480), 4326)) AS distance_meters
FROM properties
WHERE location IS NOT NULL
    AND ST_DWithin(
        location,
        ST_SetSRID(ST_MakePoint(11.5021, 3.8480), 4326),
        5000  -- 5km radius
    )
ORDER BY distance_meters
LIMIT 10;

-- =====================================================================
-- 14. VERIFY FULL-TEXT SEARCH INDEX WORKS
-- =====================================================================
\echo '\n=== TESTING FULL-TEXT SEARCH (Uses GIN index) ===\n'
EXPLAIN ANALYZE
SELECT title, city, property_type
FROM properties
WHERE to_tsvector('english', title) @@ to_tsquery('english', 'apartment | house')
LIMIT 10;

-- =====================================================================
-- 15. DATABASE SIZE AND INDEX EFFICIENCY
-- =====================================================================
\echo '\n=== DATABASE SIZE ===\n'
SELECT 
    pg_size_pretty(pg_database_size(current_database())) AS database_size;

\echo '\n=== TABLE SIZES ===\n'
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS index_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- =====================================================================
-- 16. INDEX USAGE STATISTICS (Run this after using the application)
-- =====================================================================
\echo '\n=== INDEX USAGE STATISTICS ===\n'
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan AS index_scans,
    idx_tup_read AS tuples_read,
    idx_tup_fetch AS tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- =====================================================================
-- 17. SUMMARY REPORT
-- =====================================================================
\echo '\n=== SCHEMA VERIFICATION SUMMARY ===\n'
SELECT 
    'Tables Created' AS metric,
    count(*)::text AS value
FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'

UNION ALL

SELECT 
    'Indexes Created',
    count(*)::text
FROM pg_indexes
WHERE schemaname = 'public'

UNION ALL

SELECT 
    'Foreign Keys',
    count(*)::text
FROM information_schema.table_constraints
WHERE table_schema = 'public' AND constraint_type = 'FOREIGN KEY'

UNION ALL

SELECT 
    'Check Constraints',
    count(*)::text
FROM information_schema.table_constraints
WHERE table_schema = 'public' AND constraint_type = 'CHECK'

UNION ALL

SELECT 
    'PostGIS Enabled',
    CASE WHEN count(*) > 0 THEN 'YES' ELSE 'NO' END
FROM pg_extension
WHERE extname = 'postgis';

\echo '\n=== VERIFICATION COMPLETE ===\n'
\echo 'Expected Results:'
\echo '  - Tables Created: 8'
\echo '  - Indexes Created: 25+'
\echo '  - Foreign Keys: 6'
\echo '  - Check Constraints: 2'
\echo '  - PostGIS Enabled: YES'
\echo ''
