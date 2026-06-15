from datetime import datetime
from pydantic import BaseModel, Field


class PersonalContextUpdate(BaseModel):
    old_core_belief: str | None = Field(None, max_length=1000)
    new_core_belief: str | None = Field(None, max_length=1000)
    personal_triggers: list[str] | None = None
    strengths: list[str] | None = None
    grounding_phrases: list[str] | None = Field(None, max_length=5)
    therapy_goals: str | None = Field(None, max_length=2000)
    important_relationships: list[dict] | None = None
    ai_context_note: str | None = Field(None, max_length=3000)


class PersonalContextOut(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    user_id: int
    old_core_belief: str | None
    new_core_belief: str | None
    personal_triggers: list[str] | None
    strengths: list[str] | None
    grounding_phrases: list[str] | None
    therapy_goals: str | None
    important_relationships: list[dict] | None
    ai_context_note: str | None
    updated_at: datetime
