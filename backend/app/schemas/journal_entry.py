from datetime import date
from pydantic import BaseModel, Field


class JournalEntryCreate(BaseModel):
    entry_date: date
    title: str | None = Field(None, max_length=200)
    body: str = Field(..., min_length=1)
    mood: int | None = Field(None, ge=1, le=10)


class JournalEntryUpdate(BaseModel):
    title: str | None = Field(None, max_length=200)
    body: str | None = Field(None, min_length=1)
    mood: int | None = Field(None, ge=1, le=10)


class JournalEntryOut(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    entry_date: date
    title: str | None
    body: str
    mood: int | None
    created_at: str
    updated_at: str
