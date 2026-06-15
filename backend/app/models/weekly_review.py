from datetime import datetime, date
from sqlalchemy import ForeignKey, Integer, Float, String, Text, Date, DateTime, JSON, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class WeeklyReview(Base):
    """Еженедельный обзор: автоматически вычисляемая статистика + AI-инсайты."""

    __tablename__ = "weekly_reviews"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)

    week_start: Mapped[date] = mapped_column(Date, nullable=False, index=True)  # понедельник
    week_end: Mapped[date] = mapped_column(Date, nullable=False)                # воскресенье

    # Агрегированная статистика за неделю
    avg_mood: Mapped[float | None] = mapped_column(Float)
    avg_energy: Mapped[float | None] = mapped_column(Float)
    avg_anxiety: Mapped[float | None] = mapped_column(Float)
    checkins_count: Mapped[int] = mapped_column(Integer, default=0)
    trigger_events_count: Mapped[int] = mapped_column(Integer, default=0)
    old_script_triggered_days: Mapped[int] = mapped_column(Integer, default=0)  # дней с триггером
    old_script_resisted_days: Mapped[int] = mapped_column(Integer, default=0)   # дней с сопротивлением
    experiments_completed: Mapped[int] = mapped_column(Integer, default=0)

    # Топ категории триггеров за неделю
    top_trigger_categories: Mapped[list | None] = mapped_column(JSON)
    # Пример: [{"category": "loneliness", "count": 3}, {"category": "work", "count": 1}]

    # Повторяющиеся мысли
    recurring_thoughts: Mapped[list | None] = mapped_column(JSON)

    # AI-инсайты (генерируются через OpenRouter)
    ai_insights: Mapped[str | None] = mapped_column(Text)
    ai_patterns: Mapped[list | None] = mapped_column(JSON)
    ai_suggestions: Mapped[list | None] = mapped_column(JSON)
    ai_generated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    # Ручные заметки пользователя
    user_reflection: Mapped[str | None] = mapped_column(Text)
    user_wins: Mapped[str | None] = mapped_column(Text)    # победы недели
    user_goals: Mapped[str | None] = mapped_column(Text)   # цели на следующую

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    user: Mapped["User"] = relationship(back_populates="weekly_reviews")  # noqa: F821

    def __repr__(self) -> str:
        return f"<WeeklyReview user={self.user_id} week={self.week_start}>"
