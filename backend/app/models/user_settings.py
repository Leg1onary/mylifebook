from sqlalchemy import String, Boolean, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class UserSettings(Base):
    __tablename__ = "user_settings"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)

    daily_reminder_enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    daily_reminder_time: Mapped[str] = mapped_column(String(5), default="21:00", nullable=False)  # HH:MM
    weekly_review_day: Mapped[int] = mapped_column(Integer, default=6, nullable=False)  # 0=Mon, 6=Sun
    push_token: Mapped[str | None] = mapped_column(String(512), nullable=True)
    theme: Mapped[str] = mapped_column(String(10), default="system", nullable=False)
    language: Mapped[str] = mapped_column(String(10), default="ru", nullable=False)

    user = relationship("User", back_populates="settings")
