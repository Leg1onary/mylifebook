"""Initial schema

Revision ID: 0001
Revises:
Create Date: 2026-06-15
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # users
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=True),
        sa.Column("pin_hash", sa.String(length=255), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
    )

    # personal_contexts
    op.create_table(
        "personal_contexts",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("old_law", sa.Text(), nullable=True),
        sa.Column("new_law", sa.Text(), nullable=True),
        sa.Column("core_fear", sa.Text(), nullable=True),
        sa.Column("therapy_goals", postgresql.JSONB(), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id"),
    )

    # daily_checkins
    op.create_table(
        "daily_checkins",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("entry_date", sa.Date(), nullable=False),
        sa.Column("mood", sa.SmallInteger(), nullable=False),
        sa.Column("energy", sa.SmallInteger(), nullable=True),
        sa.Column("anxiety", sa.SmallInteger(), nullable=True),
        sa.Column("emptiness", sa.SmallInteger(), nullable=True),
        sa.Column("old_script_triggered", sa.Boolean(), nullable=True),
        sa.Column("script_resisted", sa.Boolean(), nullable=True),
        sa.Column("sleep_hours", sa.Numeric(precision=4, scale=1), nullable=True),
        sa.Column("social_contact", sa.Boolean(), nullable=True),
        sa.Column("note", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "entry_date", name="uq_daily_user_date"),
    )
    op.create_index("ix_daily_user_date", "daily_checkins", ["user_id", "entry_date"])

    # thought_records
    op.create_table(
        "thought_records",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("situation", sa.Text(), nullable=False),
        sa.Column("automatic_thought", sa.Text(), nullable=False),
        sa.Column("emotions", postgresql.JSONB(), nullable=True),
        sa.Column("distortions", postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column("behavior_impulse", sa.Text(), nullable=True),
        sa.Column("evidence_for", sa.Text(), nullable=True),
        sa.Column("evidence_against", sa.Text(), nullable=True),
        sa.Column("alternative_thought", sa.Text(), nullable=True),
        sa.Column("outcome_note", sa.Text(), nullable=True),
        sa.Column("old_script_related", sa.Boolean(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_thought_user_created", "thought_records", ["user_id", "created_at"])

    # trigger_events
    op.create_table(
        "trigger_events",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("category", sa.String(length=50), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("intensity", sa.SmallInteger(), nullable=True),
        sa.Column("old_script_activated", sa.Boolean(), nullable=True),
        sa.Column("what_i_did", sa.Text(), nullable=True),
        sa.Column("what_helped", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_trigger_user_created", "trigger_events", ["user_id", "created_at"])
    op.create_index("ix_trigger_user_category", "trigger_events", ["user_id", "category"])

    # experiments (matches Experiment model / __tablename__ = "experiments")
    op.create_table(
        "experiments",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("old_rule", sa.Text(), nullable=False),
        sa.Column("new_behavior", sa.Text(), nullable=False),
        sa.Column("fear_prediction", sa.Text(), nullable=True),
        sa.Column("planned_date", sa.Date(), nullable=True),
        sa.Column("what_happened", sa.Text(), nullable=True),
        sa.Column("lesson_learned", sa.Text(), nullable=True),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="planned"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_experiment_user_status", "experiments", ["user_id", "status"])

    # weekly_reviews
    op.create_table(
        "weekly_reviews",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("week_start", sa.Date(), nullable=False),
        sa.Column("week_end", sa.Date(), nullable=False),
        sa.Column("checkin_count", sa.SmallInteger(), nullable=True),
        sa.Column("avg_mood", sa.Numeric(precision=4, scale=2), nullable=True),
        sa.Column("avg_anxiety", sa.Numeric(precision=4, scale=2), nullable=True),
        sa.Column("trigger_count", sa.SmallInteger(), nullable=True),
        sa.Column("top_trigger_categories", postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column("thought_count", sa.SmallInteger(), nullable=True),
        sa.Column("top_distortions", postgresql.JSONB(), nullable=True),
        sa.Column("script_triggered_count", sa.SmallInteger(), nullable=True),
        sa.Column("script_resisted_count", sa.SmallInteger(), nullable=True),
        sa.Column("experiments_completed", sa.SmallInteger(), nullable=True),
        sa.Column("ai_summary", sa.Text(), nullable=True),
        sa.Column("ai_insights", postgresql.JSONB(), nullable=True),
        sa.Column("therapist_questions", postgresql.ARRAY(sa.Text()), nullable=True),
        sa.Column("manual_note", sa.Text(), nullable=True),
        sa.Column("generated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "week_start", name="uq_review_user_week"),
    )
    op.create_index("ix_review_user_week", "weekly_reviews", ["user_id", "week_start"])

    # user_settings
    op.create_table(
        "user_settings",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("reminder_time", sa.String(length=5), nullable=True),
        sa.Column("timezone", sa.String(length=50), nullable=True, server_default="Europe/Moscow"),
        sa.Column("ai_enabled", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("theme", sa.String(length=20), nullable=True, server_default="dark"),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id"),
    )

    # reminders
    op.create_table(
        "reminders",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("type", sa.String(length=30), nullable=False),
        sa.Column("scheduled_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("sent", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_reminders_user_sent", "reminders", ["user_id", "sent"])

    # ai_logs
    op.create_table(
        "ai_logs",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("context_type", sa.String(length=50), nullable=False),
        sa.Column("prompt_tokens", sa.Integer(), nullable=True),
        sa.Column("completion_tokens", sa.Integer(), nullable=True),
        sa.Column("model", sa.String(length=100), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_ai_logs_user", "ai_logs", ["user_id", "created_at"])


def downgrade() -> None:
    op.drop_table("ai_logs")
    op.drop_table("reminders")
    op.drop_table("user_settings")
    op.drop_table("weekly_reviews")
    op.drop_table("experiments")
    op.drop_table("trigger_events")
    op.drop_table("thought_records")
    op.drop_table("daily_checkins")
    op.drop_table("personal_contexts")
    op.drop_table("users")
