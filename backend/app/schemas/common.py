from typing import Generic, TypeVar
from pydantic import BaseModel, Field

T = TypeVar("T")


class MessageResponse(BaseModel):
    message: str


class PaginatedResponse(BaseModel, Generic[T]):
    items: list[T]
    total: int
    page: int
    per_page: int
    has_next: bool


class EmotionItem(BaseModel):
    """Единица эмоции с интенсивностью 0–100."""
    name: str = Field(..., max_length=50)
    intensity: int = Field(..., ge=0, le=100)


class ScoreRange(BaseModel):
    """Валидируемый числовой диапазон 1–10 для шкал чек-ина."""
    value: int = Field(..., ge=1, le=10)
