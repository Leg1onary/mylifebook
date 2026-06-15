from datetime import datetime, time
from sqlalchemy import ForeignKey, String, Time, Boolean, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Reminder(Base):
    """Напоминания для ежедневного чек-ина и других активностей."""

    __tablename__ = "reminders"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)

    reminder_type: Mapped[str] = mapped_column(String(30), nullable=False)
    # Значения: daily_checkin, weekly_review, experiment_followup, custom

    reminder_time: Mapped[time] = mapped_column(Time, nullable=False)    # время в часовом поясе пользователя
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    days_of_week: Mapped[str | None] = mapped_column(String(20))         # "1,2,3,4,5" (пн–пт) или "0,6" (сб–вс)
    label: Mapped[str | None] = mapped_column(String(100))

    # Push-уведомления (Web Push / FCM)
    push_subscription: Mapped[str | None] = mapped_column()              # JSON-строка с Web Push subscription

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped["User"] = relationship(back_populates="reminders")  # noqa: F821

    def __repr__(self) -> str:
        return f"<Reminder user={self.user_id} type={self.reminder_type} time={self.reminder_time}>"
