from datetime import datetime, date
from typing import Literal
from pydantic import BaseModel, Field

ExperimentStatus = Literal["planned", "in_progress", "completed", "abandoned"]


class ExperimentCreate(BaseModel):
    old_rule: str = Field(..., min_length=1, max_length=2000)
    new_behavior: str = Field(..., min_length=1, max_length=2000)
    fear_prediction: str | None = Field(None, max_length=1000)
    planned_date: date | None = None


class ExperimentUpdate(BaseModel):
    old_rule: str | None = Field(None, min_length=1, max_length=2000)
    new_behavior: str | None = Field(None, min_length=1, max_length=2000)
    fear_prediction: str | None = Field(None, max_length=1000)
    planned_date: date | None = None
    what_happened: str | None = Field(None, max_length=3000)
    lesson_learned: str | None = Field(None, max_length=2000)
    status: ExperimentStatus | None = None


class ExperimentOut(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    user_id: int
    old_rule: str
    new_behavior: str
    fear_prediction: str | None
    planned_date: date | None
    what_happened: str | None
    lesson_learned: str | None
    status: str
    created_at: datetime
    updated_at: datetime
