from datetime import datetime, timedelta, timezone
from typing import Any, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.document import Document
from app.models.note import Note
from app.models.session import FocusSession, LearningSession
from app.models.user import User

router = APIRouter()


def _period_start(period: str) -> Optional[datetime]:
    now = datetime.now(timezone.utc)
    if period == "7d":
        return now - timedelta(days=7)
    if period == "30d":
        return now - timedelta(days=30)
    if period == "90d":
        return now - timedelta(days=90)
    return None


@router.get("/dashboard")
def analytics_dashboard(
    period: str = Query(default="30d", pattern="^(7d|30d|90d|all)$"),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    start = _period_start(period)

    ls_q = select(LearningSession).where(LearningSession.user_id == user.id)
    fs_q = select(FocusSession).where(FocusSession.user_id == user.id)
    if start:
        ls_q = ls_q.where(LearningSession.created_at >= start)
        fs_q = fs_q.where(FocusSession.created_at >= start)

    learn_rows = db.scalars(ls_q).all()
    focus_rows = db.scalars(fs_q).all()

    total_minutes = sum(s.duration for s in learn_rows) // 60

    notes_q = select(func.count()).select_from(Note).where(
        Note.user_id == user.id, Note.deleted_at.is_(None)
    )
    if start:
        notes_q = notes_q.where(Note.created_at >= start)
    notes_created = db.scalar(notes_q) or 0

    docs_q = select(func.count()).select_from(Document).where(
        Document.user_id == user.id, Document.deleted_at.is_(None)
    )
    if start:
        docs_q = docs_q.where(Document.created_at >= start)
    docs_count = db.scalar(docs_q) or 0

    modality: dict[str, int] = {}
    for s in learn_rows:
        modality[s.type] = modality.get(s.type, 0) + 1

    focus_minutes = sum(s.elapsed_time for s in focus_rows) // 60
    avg_score = (
        sum(s.focus_score or 0 for s in focus_rows if s.focus_score is not None)
        / max(1, len([s for s in focus_rows if s.focus_score is not None]))
    )

    return {
        "total_minutes_learned": total_minutes,
        "courses_completed": 0,
        "modules_completed": 0,
        "notes_created": notes_created,
        "documents_processed": docs_count,
        "current_streak": 0,
        "longest_streak": 0,
        "total_focus_sessions": len(focus_rows),
        "total_focus_minutes": focus_minutes,
        "average_focus_score": round(avg_score, 2),
        "storage_used_bytes": user.storage_used,
        "learning_by_modality": modality,
        "preferred_learning_time": "",
        "daily_averages": {},
        "weekly_data": [],
    }


@router.get("/progress")
def analytics_progress(
    period: str = Query(default="30d", pattern="^(7d|30d|90d|all)$"),
    granularity: str = Query(default="daily", pattern="^(daily|weekly|monthly)$"),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    start = _period_start(period)
    ls_q = select(LearningSession).where(LearningSession.user_id == user.id)
    if start:
        ls_q = ls_q.where(LearningSession.created_at >= start)
    learn_rows = db.scalars(ls_q).all()

    by_date: dict[str, dict[str, Any]] = {}
    for s in learn_rows:
        d = s.created_at.date().isoformat() if s.created_at else ""
        if d not in by_date:
            by_date[d] = {
                "date": d,
                "minutes_learned": 0,
                "courses_completed_today": 0,
                "modules_completed_today": 0,
                "focus_sessions_completed": 0,
                "total_focus_minutes": 0,
                "notes_created_today": 0,
                "average_mood": 0.0,
                "documents_reviewed": 0,
            }
        by_date[d]["minutes_learned"] += s.duration // 60

    data = sorted(by_date.values(), key=lambda x: x["date"])
    return {"data": data, "summary": {"granularity": granularity, "period": period}}
