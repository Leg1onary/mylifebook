from datetime import datetime
from sqlalchemy import ForeignKey, Text, DateTime, JSON, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class PersonalContext(Base):
    """Личный контекст пользователя — используется в AI-запросах для персонализации."""

    __tablename__ = "personal_contexts"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True
    )

    # Ключевые убеждения (старый и новый закон)
    old_core_belief: Mapped[str | None] = mapped_column(Text)
    # Пример: "Моя ценность определяется тем, насколько я полезен другим"

    new_core_belief: Mapped[str | None] = mapped_column(Text)
    # Пример: "Я ценен сам по себе, независимо от пользы"

    # Персональные триггеры (список строк)
    personal_triggers: Mapped[list | None] = mapped_column(JSON)

    # Ресурсы и сильные стороны
    strengths: Mapped[list | None] = mapped_column(JSON)

    # Заземляющие фразы для SOS-режима (3–5 штук)
    grounding_phrases: Mapped[list | None] = mapped_column(JSON)
    # Пример: ["Это просто страх, не реальность", "Я справлюсь", "Это пройдет"]

    # Цели терапии/работы над собой
    therapy_goals: Mapped[str | None] = mapped_column(Text)

    # Важные люди и контексты (для AI)
    important_relationships: Mapped[list | None] = mapped_column(JSON)

    # Дополнительные заметки для AI-контекста
    ai_context_note: Mapped[str | None] = mapped_column(Text)

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    user: Mapped["User"] = relationship(back_populates="personal_context")  # noqa: F821

    def __repr__(self) -> str:
        return f"<PersonalContext user={self.user_id}>"
