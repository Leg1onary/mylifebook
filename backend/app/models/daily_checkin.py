from datetime import date
from sqlalchemy import Date, Integer, Boolean, Text, Float, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class DailyCheckin(Base):
    __tablename__ = "daily_checkins"
    __table_args__ = (
        UniqueConstraint("user_id", "entry_date", name="uq_user_checkin_date"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    entry_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)

    mood: Mapped[int] = mapped_column(Integer, nullable=False)
    energy: Mapped[int] = mapped_column(Integer, nullable=False)
    anxiety: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    emptiness: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    anger: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    shame: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    sleep_hours: Mapped[float | None] = mapped_column(Float, nullable=True)
    social_contact: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    old_script_triggered: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    old_script_resisted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    what_hurts: Mapped[str | None] = mapped_column(Text, nullable=True)
    what_was_good: Mapped[str | None] = mapped_column(Text, nullable=True)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)

    user = relationship("User", back_populates="checkins")
