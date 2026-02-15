"""make_password_optional_for_supabase

Revision ID: 002_optional_password
Revises: 001_initial_schema
Create Date: 2026-02-13 14:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '002_optional_password'
down_revision = '001_initial_schema'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Make password nullable in users table
    op.alter_column('users', 'password',
               existing_type=sa.VARCHAR(length=255),
               nullable=True)


def downgrade() -> None:
    # Revert password to not nullable
    # Note: This might fail if there are users with null passwords
    op.alter_column('users', 'password',
               existing_type=sa.VARCHAR(length=255),
               nullable=False)
