from datetime import datetime, date
from sqlalchemy import ForeignKey, Integer, String, Text, Date, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class DailyCheckin(Base):
    """Ежедневный чек-ин: настроение, эмоции, энергия, сон, заметки."""

    __tablename__ = "daily_checkins"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    entry_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)

    # Основные шкалы 1–10
    mood: Mapped[int] = mapped_column(Integer, nullable=False)           # общее настроение
    energy: Mapped[int] = mapped_column(Integer, nullable=False)         # уровень энергии
    anxiety: Mapped[int] = mapped_column(Integer, default=0)             # тревога
    emptiness: Mapped[int] = mapped_column(Integer, default=0)           # ощущение пустоты
    anger: Mapped[int] = mapped_column(Integer, default=0)               # злость
    shame: Mapped[int] = mapped_column(Integer, default=0)               # стыд

    # Контекст дня
    sleep_hours: Mapped[float | None] = mapped_column()                  # часов сна
    social_contact: Mapped[int] = mapped_column(Integer, default=0)      # качество контакта с людьми 0–10
    old_script_triggered: Mapped[bool] = mapped_column(default=False)    # сработал старый паттерн?
    old_script_resisted: Mapped[bool] = mapped_column(default=False)     # удалось не подчиниться?

    # Свободный текст
    what_hurts: Mapped[str | None] = mapped_column(Text)                 # что болит
    what_was_good: Mapped[str | None] = mapped_column(Text)              # что было хорошего
    note: Mapped[str | None] = mapped_column(Text)                       # прочее

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    user: Mapped["User"] = relationship(back_populates="checkins")  # noqa: F821

    def __repr__(self) -> str:
        return f"<DailyCheckin user={self.user_id} date={self.entry_date} mood={self.mood}>"
