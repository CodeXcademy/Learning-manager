import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import String, cast, func, or_, select
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.highlight import TextHighlight
from app.models.note import Note
from app.models.note_revision import NoteRevision
from app.models.user import User
from app.schemas.common import PaginationMeta
from app.schemas.note_schema import (
    HighlightCreate,
    HighlightOut,
    NoteCreate,
    NoteDetailOut,
    NoteListResponse,
    NoteOut,
    NoteRevisionOut,
    NoteUpdate,
)

router = APIRouter()


def _paginate(page: int, per_page: int, total: int) -> PaginationMeta:
    pages = max(1, (total + per_page - 1) // per_page) if total else 1
    return PaginationMeta(page=page, per_page=per_page, total=total, pages=pages, has_more=page < pages)


def _word_stats(text: str) -> tuple[int, int]:
    words = len(text.split())
    reading = max(1, words // 200) if words else 0
    return words, reading


@router.get("", response_model=NoteListResponse)
def list_notes(
    page: int = 1,
    per_page: int = 20,
    search: Optional[str] = None,
    modality: Optional[str] = None,
    folder_id: Optional[uuid.UUID] = None,
    source_id: Optional[uuid.UUID] = None,
    tag: Optional[str] = None,
    is_favorite: Optional[bool] = None,
    is_pinned: Optional[bool] = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    conds = [Note.user_id == user.id, Note.deleted_at.is_(None)]
    if modality:
        conds.append(Note.modality == modality)
    if folder_id:
        conds.append(Note.folder_id == folder_id)
    if source_id:
        conds.append(Note.source_id == source_id)
    if search:
        pat = f"%{search.lower()}%"
        conds.append(
            or_(func.lower(Note.title).like(pat), func.lower(Note.content).like(pat))
        )
    if tag:
        conds.append(cast(Note.tags, String).like(f"%{tag.lower()}%"))
    if is_favorite is not None:
        conds.append(Note.is_favorite == is_favorite)
    if is_pinned is not None:
        conds.append(Note.is_pinned == is_pinned)

    total = db.scalar(select(func.count()).select_from(Note).where(*conds)) or 0
    stmt = (
        select(Note)
        .where(*conds)
        .order_by(Note.updated_at.desc())
        .offset((page - 1) * per_page)
        .limit(min(per_page, 100))
    )
    rows = db.scalars(stmt).all()
    return NoteListResponse(
        data=[NoteOut.model_validate(r) for r in rows],
        pagination=_paginate(page, per_page, int(total)),
    )


@router.post("", response_model=NoteOut, status_code=status.HTTP_201_CREATED)
def create_note(
    body: NoteCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    wc, rt = _word_stats(body.content)
    note = Note(
        user_id=user.id,
        title=body.title,
        content=body.content,
        language=body.language or "en",
        modality=body.modality or "general",
        source_type=body.source_type or "standalone",
        source_id=body.source_id,
        source_name=body.source_name,
        folder_id=body.folder_id,
        tags=body.tags,
        word_count=wc,
        reading_time=rt,
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    rev = NoteRevision(
        note_id=note.id,
        revision_number=note.current_revision,
        title=note.title,
        content=note.content,
        word_count=note.word_count,
    )
    db.add(rev)
    db.commit()
    return NoteOut.model_validate(note)


@router.get("/{note_id}", response_model=NoteDetailOut)
def get_note(
    note_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    note = db.scalars(
        select(Note)
        .options(joinedload(Note.highlights), joinedload(Note.revisions))
        .where(Note.id == note_id, Note.user_id == user.id, Note.deleted_at.is_(None))
    ).first()
    if not note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    base = NoteOut.model_validate(note)
    return NoteDetailOut(
        **base.model_dump(),
        highlights=[HighlightOut.model_validate(h) for h in note.highlights],
        revisions=[
            NoteRevisionOut.model_validate(r)
            for r in sorted(note.revisions, key=lambda x: x.revision_number)
        ],
    )


@router.put("/{note_id}", response_model=NoteOut)
def update_note(
    note_id: uuid.UUID,
    body: NoteUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    note = db.get(Note, note_id)
    if not note or note.user_id != user.id or note.deleted_at is not None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    data = body.model_dump(exclude_unset=True)
    if "title" in data:
        note.title = data["title"]
    if "content" in data:
        note.content = data["content"]
        wc, rt = _word_stats(note.content)
        note.word_count = wc
        note.reading_time = rt
    if "language" in data:
        note.language = data["language"]
    if "tags" in data:
        note.tags = data["tags"]

    if "content" in data or "title" in data:
        note.current_revision += 1
        db.add(
            NoteRevision(
                note_id=note.id,
                revision_number=note.current_revision,
                title=note.title,
                content=note.content,
                word_count=note.word_count,
            )
        )
    db.commit()
    db.refresh(note)
    return NoteOut.model_validate(note)


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(
    note_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    note = db.get(Note, note_id)
    if not note or note.user_id != user.id or note.deleted_at is not None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    note.deleted_at = datetime.now(timezone.utc)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/{note_id}/highlights", response_model=HighlightOut, status_code=status.HTTP_201_CREATED)
def add_highlight(
    note_id: uuid.UUID,
    body: HighlightCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    note = db.get(Note, note_id)
    if not note or note.user_id != user.id or note.deleted_at is not None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    hl = TextHighlight(
        note_id=note.id,
        text=body.text,
        color=body.color,
        start_offset=body.start_offset,
        end_offset=body.end_offset,
        page_number=body.page_number,
        timestamp=body.timestamp,
    )
    db.add(hl)
    db.commit()
    db.refresh(hl)
    return HighlightOut.model_validate(hl)
