"""Free Journal — unstructured daily notes without CBT templates."""
from sqlalchemy import Text, String, ForeignKey, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )

    entry_date: Mapped[str] = mapped_column(Date, nullable=False, index=True)  # YYYY-MM-DD
    title: Mapped[str | None] = mapped_column(String(200), nullable=True)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    mood: Mapped[int | None] = mapped_column(nullable=True)  # 1-10 optional quick mood

    user = relationship("User", back_populates="journal_entries")
