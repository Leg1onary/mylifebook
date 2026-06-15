from datetime import date, datetime
from sqlalchemy import Date, Integer, Float, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class WeeklyReview(Base):
    __tablename__ = "weekly_reviews"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    week_start: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    week_end: Mapped[date] = mapped_column(Date, nullable=False)

    # Computed stats
    avg_mood: Mapped[float | None] = mapped_column(Float, nullable=True)
    avg_energy: Mapped[float | None] = mapped_column(Float, nullable=True)
    avg_anxiety: Mapped[float | None] = mapped_column(Float, nullable=True)
    checkins_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    trigger_events_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    old_script_triggered_days: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    old_script_resisted_days: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    experiments_completed: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    top_trigger_categories: Mapped[list | None] = mapped_column(JSONB, nullable=True)
    recurring_thoughts: Mapped[list | None] = mapped_column(JSONB, nullable=True)

    # AI-generated
    ai_insights: Mapped[str | None] = mapped_column(Text, nullable=True)
    ai_patterns: Mapped[list | None] = mapped_column(JSONB, nullable=True)
    ai_suggestions: Mapped[list | None] = mapped_column(JSONB, nullable=True)
    ai_generated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # User reflection
    user_reflection: Mapped[str | None] = mapped_column(Text, nullable=True)
    user_wins: Mapped[str | None] = mapped_column(Text, nullable=True)
    user_goals: Mapped[str | None] = mapped_column(Text, nullable=True)

    user = relationship("User", back_populates="weekly_reviews")
