"""Create database schema and indexes per blueprint 3.1 and 3.2

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-01-28 10:15:00.000000

Implements:
- All tables from blueprint 3.1 (Users, Properties, Listings, Bookings, DataSources, MLModels, PricePredictions, PropertyHistory)
- All indexes from blueprint 3.2 (Property, Listing, User, Booking indexes)
- PostGIS extension for geospatial queries
- Full-text search indexes (GIN)
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import geoalchemy2


# revision identifiers, used by Alembic.
revision = '001_initial_schema'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """
    Create all tables and indexes exactly as specified in blueprint.txt Section 3
    """
    
    # Enable PostGIS extension for geospatial support
    op.execute('CREATE EXTENSION IF NOT EXISTS postgis')
    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
    
    # =====================================================================
    # 3.1.1. USERS TABLE (Blueprint specification)
    # =====================================================================
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('email', sa.String(255), nullable=False, unique=True),
        sa.Column('password', sa.String(255), nullable=False),
        sa.Column('role', sa.String(20), nullable=False, server_default='FREE_USER'),
        sa.Column('first_name', sa.String(100)),
        sa.Column('last_name', sa.String(100)),
        sa.Column('phone', sa.String(20)),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('last_login', sa.DateTime(timezone=True)),
        sa.Column('is_active', sa.Boolean, nullable=False, server_default='true'),
        sa.Column('reset_password_token', sa.String(255)),
        sa.Column('reset_password_expires', sa.DateTime(timezone=True)),
        sa.Column('subscription_expires', sa.DateTime(timezone=True))
    )
    
    # 3.2.3. User Table Indexes
    op.create_index('ix_users_email', 'users', ['email'], unique=True)  # Already unique, but explicit index
    op.create_index('ix_users_role', 'users', ['role'])  # For access control
    op.create_index('ix_users_created_at', 'users', ['created_at'])  # For analytics
    
    # =====================================================================
    # 3.1.5. DATASOURCES TABLE
    # =====================================================================
    op.create_table(
        'data_sources',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('name', sa.String(100), nullable=False, unique=True),
        sa.Column('type', sa.String(20), nullable=False),
        sa.Column('source_url', sa.String(255)),
        sa.Column('source_path', sa.String(255)),
        sa.Column('is_active', sa.Boolean, nullable=False, server_default='true'),
        sa.Column('last_run_at', sa.DateTime(timezone=True)),
        sa.Column('last_run_status', sa.String(20)),
        sa.Column('records_collected', sa.Integer, server_default='0'),
        sa.Column('records_validated', sa.Integer, server_default='0'),
        sa.Column('records_rejected', sa.Integer, server_default='0'),
        sa.Column('config', postgresql.JSONB, server_default='{}'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()'))
    )
    
    # =====================================================================
    # 3.1.2. PROPERTIES TABLE
    # =====================================================================
    op.create_table(
        'properties',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('description', sa.Text),
        sa.Column('city', sa.String(50), nullable=False),
        sa.Column('neighborhood', sa.String(100)),
        sa.Column('location', geoalchemy2.Geography(geometry_type='POINT', srid=4326)),
        sa.Column('property_type', sa.String(20), nullable=False),
        sa.Column('price', sa.Numeric(15, 2), nullable=False),
        sa.Column('currency', sa.String(10), server_default='XAF'),
        sa.Column('size', sa.Numeric(10, 2), nullable=False),
        sa.Column('price_per_m2', sa.Numeric(15, 2)),
        sa.Column('bedrooms', sa.Integer),
        sa.Column('bathrooms', sa.Integer),
        sa.Column('images', postgresql.JSONB, server_default='[]'),
        sa.Column('data_source_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('data_sources.id')),
        sa.Column('data_source_record_id', sa.String(255)),
        sa.Column('quality_score', sa.Numeric(5, 2), server_default='0.0'),
        sa.Column('validation_status', sa.String(20), server_default='pending'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('scraped_at', sa.DateTime(timezone=True)),
        sa.Column('version', sa.Integer, server_default='1'),
        sa.CheckConstraint('price > 0', name='check_price_positive'),
        sa.CheckConstraint('size > 0', name='check_size_positive')
    )
    
    # 3.2.1. Property Table Indexes (Blueprint specification)
    op.create_index('ix_properties_city_property_type', 'properties', ['city', 'property_type'])  # Composite B-tree
    op.create_index('ix_properties_price', 'properties', ['price'])  # Ascending
    op.create_index('ix_properties_price_per_m2', 'properties', ['price_per_m2'])  # Ascending
    op.create_index('ix_properties_created_at', 'properties', [sa.text('created_at DESC')])  # Descending
    op.create_index('ix_properties_location', 'properties', ['location'], postgresql_using='gist')  # PostGIS GIST index
    # Full-text search index with to_tsvector (Blueprint 3.2.1.6)
    op.execute("""
        CREATE INDEX ix_properties_title_search ON properties 
        USING GIN (to_tsvector('english', title))
    """)
    op.create_index('ix_properties_city_neighborhood', 'properties', ['city', 'neighborhood'])  # Composite
    op.create_index('ix_properties_data_source_validation', 'properties', ['data_source_id', 'validation_status'])  # Composite
    
    # =====================================================================
    # 3.1.7. PROPERTY_HISTORY TABLE (Blueprint 3.3.1 - Versioning)
    # =====================================================================
    op.create_table(
        'property_history',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('original_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('properties.id')),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('description', sa.Text),
        sa.Column('city', sa.String(50), nullable=False),
        sa.Column('neighborhood', sa.String(100)),
        sa.Column('property_type', sa.String(20), nullable=False),
        sa.Column('price', sa.Numeric(15, 2), nullable=False),
        sa.Column('currency', sa.String(10), server_default='XAF'),
        sa.Column('size', sa.Numeric(10, 2), nullable=False),
        sa.Column('price_per_m2', sa.Numeric(15, 2)),
        sa.Column('bedrooms', sa.Integer),
        sa.Column('bathrooms', sa.Integer),
        sa.Column('images', postgresql.JSONB, server_default='[]'),
        sa.Column('data_source_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('data_sources.id')),
        sa.Column('data_source_record_id', sa.String(255)),
        sa.Column('quality_score', sa.Numeric(5, 2), server_default='0.0'),
        sa.Column('validation_status', sa.String(20)),
        sa.Column('version', sa.Integer),
        sa.Column('version_timestamp', sa.DateTime(timezone=True), nullable=False),
        sa.Column('original_created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('original_updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('original_scraped_at', sa.DateTime(timezone=True))
    )
    
    # Indexes for property history
    op.create_index('ix_property_history_original_id', 'property_history', ['original_id'])
    op.create_index('ix_property_history_version_timestamp', 'property_history', ['version_timestamp'])
    
    # =====================================================================
    # 3.1.3. LISTINGS TABLE (Aggregated data snapshots)
    # =====================================================================
    op.create_table(
        'listings',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('city', sa.String(50), nullable=False),
        sa.Column('neighborhood', sa.String(100)),
        sa.Column('property_type', sa.String(20), nullable=False),
        sa.Column('period', sa.String(20), server_default='monthly'),
        sa.Column('period_start', sa.Date, nullable=False),
        sa.Column('period_end', sa.Date),
        sa.Column('avg_price', sa.Numeric(15, 2)),
        sa.Column('median_price', sa.Numeric(15, 2)),
        sa.Column('min_price', sa.Numeric(15, 2)),
        sa.Column('max_price', sa.Numeric(15, 2)),
        sa.Column('avg_price_per_m2', sa.Numeric(15, 2)),
        sa.Column('property_count', sa.Integer, server_default='0'),
        sa.Column('trend_direction', sa.String(10)),
        sa.Column('trend_percentage', sa.Numeric(5, 2)),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()'))
    )
    
    # 3.2.2. Listing Table Indexes
    op.create_index('ix_listings_city_type_period', 'listings', ['city', 'property_type', 'period_start'])  # Composite
    op.create_index('ix_listings_city_neighborhood_period', 'listings', ['city', 'neighborhood', 'period_start'])  # Composite
    op.create_index('ix_listings_period_start', 'listings', [sa.text('period_start DESC')])  # Descending
    
    # =====================================================================
    # 3.1.4. BOOKINGS TABLE
    # =====================================================================
    op.create_table(
        'bookings',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('consultation_type', sa.String(50), nullable=False),
        sa.Column('preferred_date', sa.Date, nullable=False),
        sa.Column('preferred_time', sa.String(20)),
        sa.Column('status', sa.String(20), server_default='pending'),
        sa.Column('notes', sa.Text),
        sa.Column('admin_notes', sa.Text),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('confirmed_at', sa.DateTime(timezone=True)),
        sa.Column('completed_at', sa.DateTime(timezone=True))
    )
    
    # 3.2.4. Booking Table Indexes
    op.create_index('ix_bookings_user_id', 'bookings', ['user_id'])  # B-tree
    op.create_index('ix_bookings_status_date', 'bookings', ['status', 'preferred_date'])  # Composite
    op.create_index('ix_bookings_preferred_date', 'bookings', ['preferred_date'])  # Ascending
    
    # =====================================================================
    # 3.1.6. ML_MODELS TABLE
    # =====================================================================
    op.create_table(
        'ml_models',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('version', sa.String(20), nullable=False),
        sa.Column('type', sa.String(50), nullable=False),
        sa.Column('algorithm', sa.String(50)),
        sa.Column('status', sa.String(20), server_default='training'),
        sa.Column('metrics', postgresql.JSONB, server_default='{}'),
        sa.Column('feature_importance', postgresql.JSONB, server_default='{}'),
        sa.Column('training_data_range_start', sa.Date),
        sa.Column('training_data_range_end', sa.Date),
        sa.Column('record_count', sa.Integer, server_default='0'),
        sa.Column('trained_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('deployed_at', sa.DateTime(timezone=True)),
        sa.Column('model_path', sa.String(255)),
        sa.Column('config', postgresql.JSONB, server_default='{}')
    )
    
    # Index for ML models
    op.create_index('ix_ml_models_status', 'ml_models', ['status'])
    op.create_index('ix_ml_models_type', 'ml_models', ['type'])
    
    # =====================================================================
    # 3.1.7. PRICE_PREDICTIONS TABLE
    # =====================================================================
    op.create_table(
        'price_predictions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('model_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('ml_models.id')),
        sa.Column('input_data', postgresql.JSONB, nullable=False),
        sa.Column('prediction', sa.Numeric(15, 2)),
        sa.Column('confidence_interval_lower', sa.Numeric(15, 2)),
        sa.Column('confidence_interval_upper', sa.Numeric(15, 2)),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()'))
    )
    
    # Index for price predictions
    op.create_index('ix_price_predictions_created_at', 'price_predictions', ['created_at'])
    op.create_index('ix_price_predictions_model_id', 'price_predictions', ['model_id'])


def downgrade() -> None:
    """
    Drop all tables and indexes
    """
    op.drop_table('price_predictions')
    op.drop_table('ml_models')
    op.drop_table('bookings')
    op.drop_table('listings')
    op.drop_table('property_history')
    op.drop_table('properties')
    op.drop_table('data_sources')
    op.drop_table('users')
    
    # Drop extensions
    op.execute('DROP EXTENSION IF EXISTS postgis')
    op.execute('DROP EXTENSION IF EXISTS "uuid-ossp"')
