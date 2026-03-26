import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.session import FocusSession, LearningSession
from app.models.user import User
from app.schemas.common import PaginationMeta
from app.schemas.session_schema import (
    FocusSessionCreate,
    FocusSessionListResponse,
    FocusSessionOut,
    LearningSessionCreate,
    LearningSessionListResponse,
    LearningSessionOut,
)

router = APIRouter()


def _paginate(page: int, per_page: int, total: int) -> PaginationMeta:
    pages = max(1, (total + per_page - 1) // per_page) if total else 1
    return PaginationMeta(page=page, per_page=per_page, total=total, pages=pages, has_more=page < pages)


@router.get("/learning", response_model=LearningSessionListResponse)
def list_learning_sessions(
    page: int = 1,
    per_page: int = 20,
    course_id: Optional[uuid.UUID] = None,
    session_type: Optional[str] = Query(None, alias="type"),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    from sqlalchemy import func

    conds = [LearningSession.user_id == user.id]
    if course_id:
        conds.append(LearningSession.course_id == course_id)
    if session_type:
        conds.append(LearningSession.type == session_type)
    total = db.scalar(select(func.count()).select_from(LearningSession).where(*conds)) or 0
    stmt = (
        select(LearningSession)
        .where(*conds)
        .order_by(LearningSession.created_at.desc())
        .offset((page - 1) * per_page)
        .limit(min(per_page, 100))
    )
    rows = db.scalars(stmt).all()
    return LearningSessionListResponse(
        data=[LearningSessionOut.model_validate(r) for r in rows],
        pagination=_paginate(page, per_page, int(total)),
    )


@router.post("/learning", response_model=LearningSessionOut, status_code=status.HTTP_201_CREATED)
def create_learning_session(
    body: LearningSessionCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    now = datetime.now(timezone.utc)
    s = LearningSession(
        user_id=user.id,
        course_id=body.course_id,
        module_id=body.module_id,
        document_id=body.document_id,
        type=body.type,
        mood_before=body.mood_before,
        goal=body.goal,
        start_time=now,
        duration=0,
    )
    db.add(s)
    db.commit()
    db.refresh(s)
    return LearningSessionOut.model_validate(s)


@router.get("/focus", response_model=FocusSessionListResponse)
def list_focus_sessions(
    page: int = 1,
    per_page: int = 20,
    completed: Optional[bool] = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    from sqlalchemy import func

    conds = [FocusSession.user_id == user.id]
    if completed is not None:
        conds.append(FocusSession.completed == completed)
    total = db.scalar(select(func.count()).select_from(FocusSession).where(*conds)) or 0
    stmt = (
        select(FocusSession)
        .where(*conds)
        .order_by(FocusSession.created_at.desc())
        .offset((page - 1) * per_page)
        .limit(min(per_page, 100))
    )
    rows = db.scalars(stmt).all()
    return FocusSessionListResponse(
        data=[FocusSessionOut.model_validate(r) for r in rows],
        pagination=_paginate(page, per_page, int(total)),
    )


@router.post("/focus", response_model=FocusSessionOut, status_code=status.HTTP_201_CREATED)
def create_focus_session(
    body: FocusSessionCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    now = datetime.now(timezone.utc)
    s = FocusSession(
        user_id=user.id,
        duration=body.duration,
        goal=body.goal,
        start_time=now,
    )
    db.add(s)
    db.commit()
    db.refresh(s)
    return FocusSessionOut.model_validate(s)
