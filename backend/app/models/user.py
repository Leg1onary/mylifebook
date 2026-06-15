from datetime import datetime
from sqlalchemy import String, Boolean, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    display_name: Mapped[str] = mapped_column(String(100), nullable=False, default="")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    timezone: Mapped[str] = mapped_column(String(50), default="Europe/Moscow", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    checkins: Mapped[list["DailyCheckin"]] = relationship(back_populates="user", cascade="all, delete-orphan")  # noqa: F821
    thought_records: Mapped[list["ThoughtRecord"]] = relationship(back_populates="user", cascade="all, delete-orphan")  # noqa: F821
    experiments: Mapped[list["Experiment"]] = relationship(back_populates="user", cascade="all, delete-orphan")  # noqa: F821
    trigger_events: Mapped[list["TriggerEvent"]] = relationship(back_populates="user", cascade="all, delete-orphan")  # noqa: F821
    weekly_reviews: Mapped[list["WeeklyReview"]] = relationship(back_populates="user", cascade="all, delete-orphan")  # noqa: F821
    personal_context: Mapped["PersonalContext | None"] = relationship(back_populates="user", cascade="all, delete-orphan", uselist=False)  # noqa: F821
    reminders: Mapped[list["Reminder"]] = relationship(back_populates="user", cascade="all, delete-orphan")  # noqa: F821
    ai_logs: Mapped[list["AILog"]] = relationship(back_populates="user", cascade="all, delete-orphan")  # noqa: F821

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email}>"
