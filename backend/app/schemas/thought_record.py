from datetime import datetime
from typing import Literal
from pydantic import BaseModel, Field
from app.schemas.common import EmotionItem

TriggerCategory = Literal[
    "relationships", "loneliness", "family", "work",
    "worthlessness", "jealousy", "other"
]

CognitiveDistortion = Literal[
    "catastrophizing", "mind_reading", "emotional_reasoning",
    "all_or_nothing", "overgeneralization", "personalization",
    "should_statements", "mental_filter", "disqualifying_positive",
    "jumping_to_conclusions", "magnification", "labeling"
]


class ThoughtRecordCreate(BaseModel):
    situation: str = Field(..., min_length=1, max_length=3000)
    automatic_thought: str = Field(..., min_length=1, max_length=2000)
    emotions: list[EmotionItem] | None = None
    distortions: list[CognitiveDistortion] | None = None
    behavioral_impulse: str | None = Field(None, max_length=1000)
    evidence_for: str | None = Field(None, max_length=2000)
    evidence_against: str | None = Field(None, max_length=2000)
    alternative_thought: str | None = Field(None, max_length=2000)
    emotions_after: list[EmotionItem] | None = None
    trigger_category: TriggerCategory | None = None
    is_sos: bool = False


class ThoughtRecordUpdate(BaseModel):
    situation: str | None = Field(None, min_length=1, max_length=3000)
    automatic_thought: str | None = Field(None, min_length=1, max_length=2000)
    emotions: list[EmotionItem] | None = None
    distortions: list[CognitiveDistortion] | None = None
    behavioral_impulse: str | None = Field(None, max_length=1000)
    evidence_for: str | None = Field(None, max_length=2000)
    evidence_against: str | None = Field(None, max_length=2000)
    alternative_thought: str | None = Field(None, max_length=2000)
    emotions_after: list[EmotionItem] | None = None
    trigger_category: TriggerCategory | None = None


class ThoughtRecordOut(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    user_id: int
    situation: str
    automatic_thought: str
    emotions: list[EmotionItem] | None
    distortions: list[str] | None
    behavioral_impulse: str | None
    evidence_for: str | None
    evidence_against: str | None
    alternative_thought: str | None
    emotions_after: list[EmotionItem] | None
    trigger_category: str | None
    is_sos: bool
    created_at: datetime
    updated_at: datetime
