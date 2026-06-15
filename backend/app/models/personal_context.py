from sqlalchemy import Text, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class PersonalContext(Base):
    __tablename__ = "personal_contexts"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)

    old_core_belief: Mapped[str | None] = mapped_column(Text, nullable=True)
    new_core_belief: Mapped[str | None] = mapped_column(Text, nullable=True)
    personal_triggers: Mapped[list | None] = mapped_column(JSONB, nullable=True)  # list[str]
    strengths: Mapped[list | None] = mapped_column(JSONB, nullable=True)          # list[str]
    grounding_phrases: Mapped[list | None] = mapped_column(JSONB, nullable=True)  # list[str], max 5
    therapy_goals: Mapped[str | None] = mapped_column(Text, nullable=True)
    important_relationships: Mapped[list | None] = mapped_column(JSONB, nullable=True)  # list[dict]
    ai_context_note: Mapped[str | None] = mapped_column(Text, nullable=True)

    user = relationship("User", back_populates="context")
