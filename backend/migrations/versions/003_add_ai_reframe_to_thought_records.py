"""add ai_reframe to thought_records

Revision ID: 003_add_ai_reframe
Revises: 002
Create Date: 2026-06-15
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "003_add_ai_reframe"
down_revision = "002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "thought_records",
        sa.Column("ai_reframe", postgresql.JSONB(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("thought_records", "ai_reframe")
