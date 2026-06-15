from datetime import datetime
from typing import Optional
from sqlalchemy import ForeignKey, Integer, String, Text, DateTime, JSON, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class ThoughtRecord(Base):
    """CBT thought record: ситуация → автоматическая мысль → эмоции → рефрейминг."""

    __tablename__ = "thought_records"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)

    # Шаг 1 — ситуация
    situation: Mapped[str] = mapped_column(Text, nullable=False)

    # Шаг 2 — автоматическая мысль
    automatic_thought: Mapped[str] = mapped_column(Text, nullable=False)

    # Шаг 3 — эмоции и их интенсивность 0–100
    emotions: Mapped[list | None] = mapped_column(JSON)
    # Пример: [{"name": "стыд", "intensity": 80}, {"name": "тревога", "intensity": 60}]

    # Шаг 4 — когнитивные искажения (теги)
    distortions: Mapped[list | None] = mapped_column(JSON)
    # Пример: ["catastrophizing", "mind_reading", "emotional_reasoning"]

    # Шаг 5 — поведенческий импульс
    behavioral_impulse: Mapped[str | None] = mapped_column(Text)

    # Шаг 6 — доказательства ЗА и ПРОТИВ автоматической мысли
    evidence_for: Mapped[str | None] = mapped_column(Text)
    evidence_against: Mapped[str | None] = mapped_column(Text)

    # Шаг 7 — альтернативная мысль
    alternative_thought: Mapped[str | None] = mapped_column(Text)

    # Шаг 8 — эмоции ПОСЛЕ (оценка 0–100)
    emotions_after: Mapped[list | None] = mapped_column(JSON)

    # Категория триггера
    trigger_category: Mapped[str | None] = mapped_column(String(50), index=True)
    # Значения: relationships, loneliness, family, work, worthlessness, jealousy, other

    # Метаданные
    is_sos: Mapped[bool] = mapped_column(default=False)  # создано через SOS-режим
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    user: Mapped["User"] = relationship(back_populates="thought_records")  # noqa: F821

    def __repr__(self) -> str:
        return f"<ThoughtRecord id={self.id} user={self.user_id} category={self.trigger_category}>"
