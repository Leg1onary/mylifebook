from datetime import datetime
from pydantic import BaseModel, Field
from app.schemas.thought_record import TriggerCategory


class TriggerEventCreate(BaseModel):
    description: str = Field(..., min_length=1, max_length=2000)
    category: TriggerCategory | None = None
    intensity: int | None = Field(None, ge=1, le=10)
    old_script_activated: bool = True
    grounding_used: bool = False
    thought_record_id: int | None = None
    # fields from openapi-notes.md
    situation: str | None = Field(None, max_length=2000)
    auto_thought: str | None = Field(None, max_length=1000)
    emotion_tags: list[str] = Field(default_factory=list)
    emotion_intensity: int | None = Field(None, ge=0, le=10)
    body_response: str | None = Field(None, max_length=500)
    impulse: str | None = Field(None, max_length=500)
    old_law: str | None = Field(None, max_length=500)
    linked_thought_record_id: int | None = None


class TriggerEventUpdate(BaseModel):
    description: str | None = Field(None, min_length=1, max_length=2000)
    category: TriggerCategory | None = None
    intensity: int | None = Field(None, ge=1, le=10)
    old_script_activated: bool | None = None
    grounding_used: bool | None = None
    thought_record_id: int | None = None
    situation: str | None = Field(None, max_length=2000)
    auto_thought: str | None = Field(None, max_length=1000)
    emotion_tags: list[str] | None = None
    emotion_intensity: int | None = Field(None, ge=0, le=10)
    body_response: str | None = Field(None, max_length=500)
    impulse: str | None = Field(None, max_length=500)
    old_law: str | None = Field(None, max_length=500)
    linked_thought_record_id: int | None = None


class TriggerEventOut(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    user_id: int
    description: str
    category: str | None
    intensity: int | None
    old_script_activated: bool
    grounding_used: bool
    thought_record_id: int | None
    # extended fields
    situation: str | None = None
    auto_thought: str | None = None
    emotion_tags: list[str] = []
    emotion_intensity: int | None = None
    body_response: str | None = None
    impulse: str | None = None
    old_law: str | None = None
    linked_thought_record_id: int | None = None
    created_at: datetime
