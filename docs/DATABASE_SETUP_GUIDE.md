# Database Setup Quick Start Guide

**Section:** 3.1 - PostgreSQL Tables Schema  
**Purpose:** Complete database setup from zero to production-ready

---

## Prerequisites

- PostgreSQL 14+ installed
- PostGIS extension available
- Python 3.10+ with Alembic
- Database credentials configured in `.env`

---

## Step 1: Create Database

```bash
# Connect to PostgreSQL as superuser
psql -U postgres

# Create database
CREATE DATABASE strataxis;

# Create database user (if needed)
CREATE USER strataxis_user WITH PASSWORD 'your_secure_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE strataxis TO strataxis_user;

# Exit psql
\q
```

---

## Step 2: Enable Required Extensions

```bash
# Connect to strataxis database
psql -U postgres -d strataxis

# Enable extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

# Verify extensions
\dx

# Expected output:
#   postgis    | ...
#   uuid-ossp  | ...

# Exit
\q
```

---

## Step 3: Configure Environment Variables

Create or update `backend/.env`:

```bash
# Database Configuration
DATABASE_URL=postgresql://strataxis_user:your_secure_password@localhost:5432/strataxis

# Application Settings
PROJECT_NAME=StratAxis
ENVIRONMENT=development
PORT=8000

# Security (generate your own secrets)
SECRET_KEY=your-secret-key-here-min-32-chars
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS (adjust for production)
CORS_ORIGINS=["http://localhost:3000", "http://localhost:5173"]
```

---

## Step 4: Run Database Migration

```bash
# Navigate to backend directory
cd backend

# Ensure virtual environment is activated
source venv/bin/activate  # Linux/Mac
# OR
venv\Scripts\activate  # Windows

# Install dependencies (if not already done)
pip install -r requirements.txt

# Check migration status
alembic current

# Expected: No current revision

# Run migration to create all tables and indexes
alembic upgrade head

# Verify migration succeeded
alembic current

# Expected: 001_initial_schema (head)
```

**Expected Output:**
```
INFO  [alembic.runtime.migration] Context impl PostgresqlImpl.
INFO  [alembic.runtime.migration] Will assume transactional DDL.
INFO  [alembic.runtime.migration] Running upgrade  -> 001_initial_schema, Create database schema and indexes per blueprint 3.1 and 3.2
```

---

## Step 5: Verify Schema

```bash
# Run verification script
psql -U strataxis_user -d strataxis -f scripts/verify_schema.sql

# OR manually check tables
psql -U strataxis_user -d strataxis

# List all tables
\dt

# Expected output:
#   bookings
#   data_sources
#   listings
#   ml_models
#   price_predictions
#   properties
#   property_history
#   users

# List all indexes
\di

# Expected: 25+ indexes

# Check PostGIS
SELECT PostGIS_Version();

# Exit
\q
```

---

## Step 6: Seed Initial Data (Optional)

### Option A: Using Python Script

Create `backend/scripts/seed_database.py`:

```python
import asyncio
from sqlmodel import Session, select
from src.config.database import engine
from src.models import User, UserRole, DataSource, DataSourceType
from src.utils.auth import hash_password

async def seed_database():
    """Seed database with initial data"""
    with Session(engine) as session:
        # Create admin user
        admin = User(
            email="admin@strataxis.cm",
            password=hash_password("AdminPassword123!"),
            role=UserRole.ADMIN,
            first_name="System",
            last_name="Administrator",
            is_active=True
        )
        session.add(admin)
        
        # Create test data source
        data_source = DataSource(
            name="Manual Entry",
            type=DataSourceType.MANUAL,
            is_active=True
        )
        session.add(data_source)
        
        session.commit()
        print("✅ Database seeded successfully")
        print(f"Admin user: admin@strataxis.cm")
        print(f"Data source: Manual Entry")

if __name__ == "__main__":
    asyncio.run(seed_database())
```

Run it:
```bash
cd backend
python scripts/seed_database.py
```

### Option B: Direct SQL

```sql
-- Connect to database
psql -U strataxis_user -d strataxis

-- Create admin user (use bcrypt hash in production)
INSERT INTO users (email, password, role, first_name, last_name, is_active)
VALUES (
    'admin@strataxis.cm',
    '$2b$12$your_bcrypt_hash_here',  -- Replace with actual bcrypt hash
    'ADMIN',
    'System',
    'Administrator',
    true
);

-- Create initial data source
INSERT INTO data_sources (name, type, is_active)
VALUES ('Manual Entry', 'manual', true);

-- Verify
SELECT id, email, role FROM users;
SELECT id, name, type FROM data_sources;
```

---

## Step 7: Test Database Connection

Create `backend/scripts/test_connection.py`:

```python
from sqlmodel import Session, select
from src.config.database import engine
from src.models import User

def test_connection():
    """Test database connection and query"""
    try:
        with Session(engine) as session:
            # Simple query
            users = session.exec(select(User)).all()
            print(f"✅ Database connection successful")
            print(f"   Users in database: {len(users)}")
            
            for user in users:
                print(f"   - {user.email} ({user.role})")
                
            return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

if __name__ == "__main__":
    test_connection()
```

Run:
```bash
python scripts/test_connection.py
```

---

## Step 8: Start Backend Server

```bash
# From backend directory
cd backend

# Start server
uvicorn src.main:app --reload --port 8000

# Or use the run script
python -m src.main
```

**Check health endpoint:**
```bash
curl http://localhost:8000/api/health
```

**Expected:**
```json
{
  "status": "online",
  "project": "StratAxis",
  "environment": "development",
  "timestamp": 1706437200.0
}
```

---

## Step 9: Access API Documentation

Open browser:
- **Swagger UI:** http://localhost:8000/api/docs
- **ReDoc:** http://localhost:8000/api/redoc

---

## Troubleshooting

### Issue: `alembic: command not found`

**Solution:**
```bash
pip install alembic
# OR
pip install -r requirements.txt
```

### Issue: `FATAL: database "strataxis" does not exist`

**Solution:**
```bash
createdb -U postgres strataxis
```

### Issue: `ERROR: extension "postgis" is not available`

**Solution:**
```bash
# Ubuntu/Debian
sudo apt-get install postgresql-14-postgis-3

# macOS
brew install postgis

# Then retry CREATE EXTENSION
```

### Issue: `ModuleNotFoundError: No module named 'geoalchemy2'`

**Solution:**
```bash
pip install geoalchemy2
```

### Issue: Migration fails with `relation already exists`

**Solution:**
```bash
# Drop all tables and retry
psql -U strataxis_user -d strataxis

DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO strataxis_user;

\q

# Re-run migration
alembic upgrade head
```

### Issue: `connection refused` when starting server

**Solution:**
- Check PostgreSQL is running: `sudo systemctl status postgresql`
- Verify DATABASE_URL in `.env`
- Check firewall settings
- Ensure database accepts connections from localhost

---

## Production Deployment

### 1. Use Environment-Specific Configs

```bash
# Production .env
DATABASE_URL=postgresql://user:pass@production-db-host:5432/strataxis
ENVIRONMENT=production
CORS_ORIGINS=["https://strataxis.cm"]
DEBUG=false
```

### 2. Use Connection Pooling

Update `backend/src/config/database.py`:

```python
from sqlalchemy.pool import QueuePool

engine = create_engine(
    settings.DATABASE_URL,
    echo=False,
    poolclass=QueuePool,
    pool_size=20,
    max_overflow=10,
    pool_pre_ping=True
)
```

### 3. Set Up Read Replicas (Optional)

For analytics queries, use read replicas to reduce load on primary database.

### 4. Configure Backups

```bash
# Daily backup script
pg_dump -U strataxis_user -d strataxis > backup_$(date +%Y%m%d).sql

# Automated via cron
0 2 * * * pg_dump -U strataxis_user -d strataxis > /backups/strataxis_$(date +\%Y\%m\%d).sql
```

### 5. Monitor Performance

```sql
-- Check slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Check index usage
SELECT * FROM pg_stat_user_indexes
WHERE idx_scan = 0;
```

---

## Database Maintenance

### Regular Tasks

**Weekly:**
```sql
-- Analyze tables
ANALYZE users;
ANALYZE properties;
ANALYZE listings;
ANALYZE bookings;
```

**Monthly:**
```sql
-- Full vacuum
VACUUM FULL ANALYZE;
```

**As Needed:**
```sql
-- Reindex if queries slow down
REINDEX TABLE properties;
```

---

## Next Steps

1. ✅ Database created and migrated
2. ✅ Schema verified
3. ✅ Initial data seeded
4. ✅ Backend server running

**Continue with:**
- Populate properties using data pipeline (Section 2.3)
- Test all API endpoints (see `docs/TESTING_GUIDE.md`)
- Train ML models (Section 5)
- Deploy frontend (Section 1.3)

---

## Quick Reference

### Essential Commands

```bash
# Start PostgreSQL
sudo systemctl start postgresql

# Connect to database
psql -U strataxis_user -d strataxis

# Run migration
alembic upgrade head

# Rollback migration
alembic downgrade -1

# Create new migration
alembic revision --autogenerate -m "description"

# Check migration status
alembic current

# Start backend
uvicorn src.main:app --reload
```

### Essential SQL

```sql
-- List tables
\dt

-- Describe table
\d properties

-- List indexes
\di

-- Table sizes
SELECT pg_size_pretty(pg_total_relation_size('properties'));

-- Row counts
SELECT count(*) FROM properties;
```

---

**Database Setup Complete! ✅**
