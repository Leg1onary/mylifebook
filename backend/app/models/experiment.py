from datetime import datetime, date
from sqlalchemy import ForeignKey, String, Text, Date, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Experiment(Base):
    """Поведенческий эксперимент: старое правило → новое поведение → что произошло."""

    __tablename__ = "experiments"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)

    # Описание эксперимента
    old_rule: Mapped[str] = mapped_column(Text, nullable=False)          # старое правило/убеждение
    new_behavior: Mapped[str] = mapped_column(Text, nullable=False)      # новое поведение для теста
    fear_prediction: Mapped[str | None] = mapped_column(Text)            # что боюсь, что случится
    planned_date: Mapped[date | None] = mapped_column(Date)

    # Результат (заполняется после)
    what_happened: Mapped[str | None] = mapped_column(Text)              # что на самом деле произошло
    lesson_learned: Mapped[str | None] = mapped_column(Text)             # чему это учит

    # Статус
    status: Mapped[str] = mapped_column(String(20), default="planned", index=True)
    # Значения: planned, in_progress, completed, abandoned

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    user: Mapped["User"] = relationship(back_populates="experiments")  # noqa: F821

    def __repr__(self) -> str:
        return f"<Experiment id={self.id} status={self.status}>"
