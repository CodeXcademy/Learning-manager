from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.common import PaginationMeta


class LearningSessionCreate(BaseModel):
    course_id: Optional[UUID] = None
    module_id: Optional[UUID] = None
    document_id: Optional[UUID] = None
    type: str
    mood_before: Optional[int] = None
    goal: Optional[str] = None


class LearningSessionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: UUID
    course_id: Optional[UUID] = None
    module_id: Optional[UUID] = None
    document_id: Optional[UUID] = None
    type: str
    duration: int = 0
    notes_created: int = 0
    highlights_created: int = 0
    is_focused: bool = False
    mood_before: Optional[int] = None
    mood_after: Optional[int] = None
    retention_score: Optional[float] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    created_at: datetime


class FocusSessionCreate(BaseModel):
    duration: int
    goal: Optional[str] = None


class FocusSessionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: UUID
    duration: int
    elapsed_time: int = 0
    breaks_taken: int = 0
    total_break_time: int = 0
    goal: Optional[str] = None
    completed: bool = False
    interruptions: int = 0
    focus_score: Optional[float] = None
    timezone: Optional[str] = Field(
        default=None,
        validation_alias="timezone_label",
        serialization_alias="timezone",
    )
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    created_at: datetime


class LearningSessionListResponse(BaseModel):
    data: list[LearningSessionOut]
    pagination: PaginationMeta


class FocusSessionListResponse(BaseModel):
    data: list[FocusSessionOut]
    pagination: PaginationMeta
