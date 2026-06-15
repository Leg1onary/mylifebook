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
    created_at: datetime
