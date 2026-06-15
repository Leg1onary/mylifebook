from sqlalchemy import Text, Boolean, String, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class ThoughtRecord(Base):
    __tablename__ = "thought_records"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Draft flag: True while user is going through the 12-step wizard
    # Frontend saves partial records as drafts; false = completed record
    is_draft: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    situation: Mapped[str | None] = mapped_column(Text, nullable=True)          # step 1 - nullable for drafts
    automatic_thought: Mapped[str | None] = mapped_column(Text, nullable=True)  # step 2
    emotions: Mapped[list | None] = mapped_column(JSONB, nullable=True)         # list[{name, intensity}]
    distortions: Mapped[list | None] = mapped_column(JSONB, nullable=True)      # list[str]
    behavioral_impulse: Mapped[str | None] = mapped_column(Text, nullable=True)
    evidence_for: Mapped[str | None] = mapped_column(Text, nullable=True)
    evidence_against: Mapped[str | None] = mapped_column(Text, nullable=True)
    alternative_thought: Mapped[str | None] = mapped_column(Text, nullable=True)
    emotions_after: Mapped[list | None] = mapped_column(JSONB, nullable=True)   # list[{name, intensity}]
    trigger_category: Mapped[str | None] = mapped_column(String(50), nullable=True, index=True)
    is_sos: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    user = relationship("User", back_populates="thought_records")
