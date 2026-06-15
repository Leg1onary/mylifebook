from datetime import datetime
from sqlalchemy import ForeignKey, Integer, String, Text, DateTime, Float, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class AILog(Base):
    """Лог всех AI-запросов к OpenRouter — для учёта токенов и дебага."""

    __tablename__ = "ai_logs"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)

    request_type: Mapped[str] = mapped_column(String(50), index=True)
    # Значения: weekly_insights, pattern_analysis, sos_support, reframe_help

    model: Mapped[str] = mapped_column(String(100), nullable=False)
    prompt_tokens: Mapped[int | None] = mapped_column(Integer)
    completion_tokens: Mapped[int | None] = mapped_column(Integer)
    total_tokens: Mapped[int | None] = mapped_column(Integer)
    cost_usd: Mapped[float | None] = mapped_column(Float)

    # Краткий контекст запроса (не полный промпт для экономии места)
    context_summary: Mapped[str | None] = mapped_column(Text)
    success: Mapped[bool] = mapped_column(default=True)
    error_message: Mapped[str | None] = mapped_column(Text)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)

    user: Mapped["User"] = relationship(back_populates="ai_logs")  # noqa: F821

    def __repr__(self) -> str:
        return f"<AILog id={self.id} type={self.request_type} tokens={self.total_tokens}>"
