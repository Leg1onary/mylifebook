from datetime import date
from sqlalchemy import Text, String, Date, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Experiment(Base):
    __tablename__ = "experiments"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    old_rule: Mapped[str] = mapped_column(Text, nullable=False)
    new_behavior: Mapped[str] = mapped_column(Text, nullable=False)
    fear_prediction: Mapped[str | None] = mapped_column(Text, nullable=True)
    planned_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    what_happened: Mapped[str | None] = mapped_column(Text, nullable=True)
    lesson_learned: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="planned", nullable=False, index=True)

    user = relationship("User", back_populates="experiments")
