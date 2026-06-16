"""Fix users table: add display_name, timezone; drop name, pin_hash

Revision ID: 0003
Revises: 0002
Create Date: 2026-06-16

Changes:
- users: add display_name (replaces name), add timezone, drop pin_hash
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0003"
down_revision: Union[str, None] = "0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add display_name (NOT NULL — backfill from name first, then enforce)
    op.add_column(
        "users",
        sa.Column("display_name", sa.String(length=100), nullable=True),
    )
    # Copy existing name -> display_name so NOT NULL is safe
    op.execute("UPDATE users SET display_name = COALESCE(name, email) WHERE display_name IS NULL")
    op.alter_column("users", "display_name", nullable=False)

    # Add timezone
    op.add_column(
        "users",
        sa.Column(
            "timezone",
            sa.String(length=50),
            nullable=False,
            server_default="Europe/Moscow",
        ),
    )
    # Remove server_default — model handles the default in Python
    op.alter_column("users", "timezone", server_default=None)

    # Drop columns no longer in the model
    op.drop_column("users", "name")
    op.drop_column("users", "pin_hash")


def downgrade() -> None:
    op.add_column("users", sa.Column("name", sa.String(length=100), nullable=True))
    op.add_column("users", sa.Column("pin_hash", sa.String(length=255), nullable=True))
    op.execute("UPDATE users SET name = display_name")
    op.drop_column("users", "timezone")
    op.drop_column("users", "display_name")
