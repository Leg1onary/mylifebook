"""Sync schema with current SQLAlchemy models.

Revision ID: 0002
Revises: 0001
Create Date: 2026-06-16

Changes vs 0001:
- personal_contexts: drop old columns (old_law, new_law, core_fear, therapy_goals JSONB),
  add new columns matching PersonalContext model.
- daily_checkins: rename script_resisted -> old_script_resisted, add anger/shame/
  what_hurts/what_was_good, drop old social_contact bool -> int, fix energy/anxiety NOT NULL.
- thought_records: drop NOT NULL on situation/automatic_thought, add is_draft/
  behavioral_impulse/emotions_after/trigger_category/is_sos/ai_reframe,
  change distortions ARRAY->JSONB.
- ai_logs: drop context_type, add action/cost_usd/error columns.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "0002"
down_revision: Union[str, None] = "0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ------------------------------------------------------------------ #
    # personal_contexts — full column swap                                #
    # ------------------------------------------------------------------ #
    op.drop_column("personal_contexts", "old_law")
    op.drop_column("personal_contexts", "new_law")
    op.drop_column("personal_contexts", "core_fear")
    op.drop_column("personal_contexts", "therapy_goals")

    op.add_column("personal_contexts", sa.Column("old_core_belief", sa.Text(), nullable=True))
    op.add_column("personal_contexts", sa.Column("new_core_belief", sa.Text(), nullable=True))
    op.add_column("personal_contexts", sa.Column("personal_triggers", postgresql.JSONB(), nullable=True))
    op.add_column("personal_contexts", sa.Column("strengths", postgresql.JSONB(), nullable=True))
    op.add_column("personal_contexts", sa.Column("grounding_phrases", postgresql.JSONB(), nullable=True))
    op.add_column("personal_contexts", sa.Column("therapy_goals", sa.Text(), nullable=True))
    op.add_column("personal_contexts", sa.Column("important_relationships", postgresql.JSONB(), nullable=True))
    op.add_column("personal_contexts", sa.Column("ai_context_note", sa.Text(), nullable=True))
    # add missing timestamps (Base mixin)
    op.add_column("personal_contexts", sa.Column(
        "created_at", sa.DateTime(timezone=True),
        server_default=sa.text("now()"), nullable=False,
    ))

    # ------------------------------------------------------------------ #
    # daily_checkins                                                      #
    # ------------------------------------------------------------------ #
    # rename script_resisted -> old_script_resisted
    op.alter_column("daily_checkins", "script_resisted", new_column_name="old_script_resisted")

    # social_contact: bool -> integer (0/1/2 scale)
    op.alter_column(
        "daily_checkins", "social_contact",
        type_=sa.Integer(),
        existing_type=sa.Boolean(),
        postgresql_using="social_contact::int",
        nullable=False,
        server_default="0",
    )

    # energy/anxiety: make NOT NULL with default 0
    op.alter_column("daily_checkins", "energy",
        existing_type=sa.SmallInteger(), type_=sa.Integer(),
        nullable=False, server_default="0")
    op.alter_column("daily_checkins", "anxiety",
        existing_type=sa.SmallInteger(), type_=sa.Integer(),
        nullable=False, server_default="0")
    op.alter_column("daily_checkins", "emptiness",
        existing_type=sa.SmallInteger(), type_=sa.Integer(),
        nullable=True, server_default="0")

    # new emotion columns
    op.add_column("daily_checkins", sa.Column("anger", sa.Integer(), nullable=False, server_default="0"))
    op.add_column("daily_checkins", sa.Column("shame", sa.Integer(), nullable=False, server_default="0"))
    op.add_column("daily_checkins", sa.Column("what_hurts", sa.Text(), nullable=True))
    op.add_column("daily_checkins", sa.Column("what_was_good", sa.Text(), nullable=True))

    # rename old_script_triggered (it matched already, keep as-is)
    # fix unique constraint name mismatch
    op.drop_constraint("uq_daily_user_date", "daily_checkins", type_="unique")
    op.create_unique_constraint("uq_user_checkin_date", "daily_checkins", ["user_id", "entry_date"])

    # ------------------------------------------------------------------ #
    # thought_records                                                     #
    # ------------------------------------------------------------------ #
    # make situation / automatic_thought nullable (wizard saves as draft)
    op.alter_column("thought_records", "situation", nullable=True)
    op.alter_column("thought_records", "automatic_thought", nullable=True)

    # distortions: ARRAY(String) -> JSONB
    op.alter_column(
        "thought_records", "distortions",
        type_=postgresql.JSONB(),
        existing_type=postgresql.ARRAY(sa.String()),
        postgresql_using="to_jsonb(distortions)",
        nullable=True,
    )

    # new columns
    op.add_column("thought_records", sa.Column(
        "is_draft", sa.Boolean(), nullable=False,
        server_default=sa.text("true"),
    ))
    op.add_column("thought_records", sa.Column("behavioral_impulse", sa.Text(), nullable=True))
    op.add_column("thought_records", sa.Column("emotions_after", postgresql.JSONB(), nullable=True))
    op.add_column("thought_records", sa.Column(
        "trigger_category", sa.String(length=50), nullable=True,
    ))
    op.add_column("thought_records", sa.Column(
        "is_sos", sa.Boolean(), nullable=False, server_default=sa.text("false"),
    ))
    op.add_column("thought_records", sa.Column("ai_reframe", postgresql.JSONB(), nullable=True))
    op.create_index("ix_thought_trigger_category", "thought_records", ["user_id", "trigger_category"])

    # ------------------------------------------------------------------ #
    # ai_logs — align with AILog model                                   #
    # ------------------------------------------------------------------ #
    op.drop_column("ai_logs", "context_type")
    op.add_column("ai_logs", sa.Column("action", sa.String(length=100), nullable=False, server_default="unknown"))
    op.add_column("ai_logs", sa.Column("cost_usd", sa.String(length=20), nullable=True))
    op.add_column("ai_logs", sa.Column("error", sa.Text(), nullable=True))
    # remove server_default used only for migration
    op.alter_column("ai_logs", "action", server_default=None)
    op.alter_column("ai_logs", "model", nullable=False, existing_type=sa.String(length=100))


def downgrade() -> None:
    # ai_logs
    op.drop_column("ai_logs", "error")
    op.drop_column("ai_logs", "cost_usd")
    op.drop_column("ai_logs", "action")
    op.add_column("ai_logs", sa.Column("context_type", sa.String(length=50), nullable=False, server_default="unknown"))

    # thought_records
    op.drop_index("ix_thought_trigger_category", "thought_records")
    op.drop_column("thought_records", "ai_reframe")
    op.drop_column("thought_records", "is_sos")
    op.drop_column("thought_records", "trigger_category")
    op.drop_column("thought_records", "emotions_after")
    op.drop_column("thought_records", "behavioral_impulse")
    op.drop_column("thought_records", "is_draft")
    op.alter_column("thought_records", "distortions",
        type_=postgresql.ARRAY(sa.String()),
        existing_type=postgresql.JSONB(),
        postgresql_using="ARRAY(SELECT jsonb_array_elements_text(distortions))",
        nullable=True)
    op.alter_column("thought_records", "automatic_thought", nullable=False)
    op.alter_column("thought_records", "situation", nullable=False)

    # daily_checkins
    op.drop_column("daily_checkins", "what_was_good")
    op.drop_column("daily_checkins", "what_hurts")
    op.drop_column("daily_checkins", "shame")
    op.drop_column("daily_checkins", "anger")
    op.drop_constraint("uq_user_checkin_date", "daily_checkins", type_="unique")
    op.create_unique_constraint("uq_daily_user_date", "daily_checkins", ["user_id", "entry_date"])
    op.alter_column("daily_checkins", "old_script_resisted", new_column_name="script_resisted")

    # personal_contexts
    op.drop_column("personal_contexts", "created_at")
    op.drop_column("personal_contexts", "ai_context_note")
    op.drop_column("personal_contexts", "important_relationships")
    op.drop_column("personal_contexts", "therapy_goals")
    op.drop_column("personal_contexts", "grounding_phrases")
    op.drop_column("personal_contexts", "strengths")
    op.drop_column("personal_contexts", "personal_triggers")
    op.drop_column("personal_contexts", "new_core_belief")
    op.drop_column("personal_contexts", "old_core_belief")
    op.add_column("personal_contexts", sa.Column("therapy_goals", postgresql.JSONB(), nullable=True))
    op.add_column("personal_contexts", sa.Column("core_fear", sa.Text(), nullable=True))
    op.add_column("personal_contexts", sa.Column("new_law", sa.Text(), nullable=True))
    op.add_column("personal_contexts", sa.Column("old_law", sa.Text(), nullable=True))
