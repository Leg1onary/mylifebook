from sqlalchemy import Text, String, Integer, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class TriggerEvent(Base):
    __tablename__ = "trigger_events"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str | None] = mapped_column(String(50), nullable=True, index=True)
    intensity: Mapped[int | None] = mapped_column(Integer, nullable=True)
    old_script_activated: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    grounding_used: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    thought_record_id: Mapped[int | None] = mapped_column(
        ForeignKey("thought_records.id", ondelete="SET NULL"), nullable=True
    )

    user = relationship("User", back_populates="trigger_events")
