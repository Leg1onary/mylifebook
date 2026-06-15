from sqlalchemy import String, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Reminder(Base):
    __tablename__ = "reminders"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    reminder_type: Mapped[str] = mapped_column(String(30), nullable=False)  # "daily_checkin" | "weekly_review"
    scheduled_time: Mapped[str] = mapped_column(String(5), nullable=False)  # HH:MM
    is_sent: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    push_token: Mapped[str | None] = mapped_column(String(512), nullable=True)

    user = relationship("User", back_populates="reminders")
