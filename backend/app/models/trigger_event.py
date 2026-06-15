from datetime import datetime
from sqlalchemy import ForeignKey, Integer, String, Text, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class TriggerEvent(Base):
    """Быстрая запись триггера из SOS-режима или отдельно."""

    __tablename__ = "trigger_events"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)

    description: Mapped[str] = mapped_column(Text, nullable=False)       # что случилось
    category: Mapped[str | None] = mapped_column(String(50), index=True) # категория
    intensity: Mapped[int | None] = mapped_column(Integer)               # интенсивность 1–10
    old_script_activated: Mapped[bool] = mapped_column(default=True)     # старый паттерн включился?
    grounding_used: Mapped[bool] = mapped_column(default=False)          # использовал заземление?

    # Ссылка на полный thought record (если создан следом)
    thought_record_id: Mapped[int | None] = mapped_column(
        ForeignKey("thought_records.id", ondelete="SET NULL"), nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)

    user: Mapped["User"] = relationship(back_populates="trigger_events")  # noqa: F821

    def __repr__(self) -> str:
        return f"<TriggerEvent id={self.id} category={self.category} intensity={self.intensity}>"
