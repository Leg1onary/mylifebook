from datetime import datetime, date
from pydantic import BaseModel


class TopTriggerCategory(BaseModel):
    category: str
    count: int


class AIPattern(BaseModel):
    pattern: str
    frequency: int | None = None


class WeeklyReviewOut(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    user_id: int
    week_start: date
    week_end: date

    # Статистика
    avg_mood: float | None
    avg_energy: float | None
    avg_anxiety: float | None
    checkins_count: int
    trigger_events_count: int
    old_script_triggered_days: int
    old_script_resisted_days: int
    experiments_completed: int
    top_trigger_categories: list[TopTriggerCategory] | None
    recurring_thoughts: list[str] | None

    # AI
    ai_insights: str | None
    ai_patterns: list[AIPattern] | None
    ai_suggestions: list[str] | None
    ai_generated_at: datetime | None

    # Рефлексия пользователя
    user_reflection: str | None
    user_wins: str | None
    user_goals: str | None

    created_at: datetime
    updated_at: datetime


class WeeklyReviewUpdate(BaseModel):
    """Пользователь может дополнить обзор своими заметками."""
    user_reflection: str | None = None
    user_wins: str | None = None
    user_goals: str | None = None
