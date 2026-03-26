import hashlib
import json
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.responses import FileResponse
from sqlalchemy import String, cast, func, or_, select
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.document import Document
from app.models.user import User
from app.schemas.common import PaginationMeta
from app.schemas.document_schema import DocumentCreateJson, DocumentListResponse, DocumentOut, DocumentUpdate

router = APIRouter()


def _paginate(page: int, per_page: int, total: int) -> PaginationMeta:
    pages = max(1, (total + per_page - 1) // per_page) if total else 1
    return PaginationMeta(page=page, per_page=per_page, total=total, pages=pages, has_more=page < pages)


def _ensure_upload_dir() -> Path:
    p = Path(settings.UPLOAD_DIR)
    p.mkdir(parents=True, exist_ok=True)
    return p


def _document_conditions(
    user_id: uuid.UUID,
    type_: Optional[str] = None,
    search: Optional[str] = None,
    collection_id: Optional[uuid.UUID] = None,
    tag: Optional[str] = None,
    is_starred: Optional[bool] = None,
    is_archived: Optional[bool] = None,
):
    conds = [Document.user_id == user_id, Document.deleted_at.is_(None)]
    if type_:
        conds.append(Document.type == type_)
    if collection_id:
        conds.append(Document.collection_id == collection_id)
    if search:
        pat = f"%{search.lower()}%"
        conds.append(
            or_(func.lower(Document.name).like(pat), func.lower(Document.description).like(pat))
        )
    if tag:
        conds.append(cast(Document.tags, String).like(f"%{tag.lower()}%"))
    if is_starred is not None:
        conds.append(Document.is_starred == is_starred)
    if is_archived is not None:
        conds.append(Document.is_archived == is_archived)
    return conds


@router.get("/search", response_model=dict)
def search_documents(
    q: str,
    type: Optional[str] = None,
    collection_id: Optional[uuid.UUID] = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    pat = f"%{q.lower()}%"
    conds = [Document.user_id == user.id, Document.deleted_at.is_(None)]
    conds.append(or_(func.lower(Document.name).like(pat), func.lower(Document.description).like(pat)))
    if type:
        conds.append(Document.type == type)
    if collection_id:
        conds.append(Document.collection_id == collection_id)
    rows = db.scalars(select(Document).where(*conds).order_by(Document.updated_at.desc())).all()
    return {"data": [DocumentOut.model_validate(r).model_dump() for r in rows]}


@router.get("", response_model=DocumentListResponse)
def list_documents(
    page: int = 1,
    per_page: int = 20,
    type: Optional[str] = None,
    search: Optional[str] = None,
    collection_id: Optional[uuid.UUID] = None,
    tag: Optional[str] = None,
    sort_by: str = "created_at",
    order: str = "desc",
    is_starred: Optional[bool] = None,
    is_archived: Optional[bool] = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    conds = _document_conditions(
        user.id, type, search, collection_id, tag, is_starred, is_archived
    )
    total = db.scalar(select(func.count()).select_from(Document).where(*conds)) or 0
    stmt = select(Document).where(*conds)
    sort_col = getattr(Document, sort_by, Document.created_at)
    stmt = stmt.order_by(sort_col.desc() if order == "desc" else sort_col.asc())
    stmt = stmt.offset((page - 1) * per_page).limit(min(per_page, 100))
    rows = db.scalars(stmt).all()
    return DocumentListResponse(
        data=[DocumentOut.model_validate(r) for r in rows],
        pagination=_paginate(page, per_page, int(total)),
    )


@router.post("", response_model=DocumentOut, status_code=status.HTTP_201_CREATED)
async def create_document(
    request: Request,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    ct = request.headers.get("content-type", "").lower()
    if "multipart/form-data" in ct:
        form = await request.form()
        up = form.get("file")
        if up is None or not hasattr(up, "read"):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="file required")
        body_bytes = await up.read()
        max_b = settings.MAX_FILE_SIZE_MB * 1024 * 1024
        if len(body_bytes) > max_b:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="File too large"
            )

        upload_dir = _ensure_upload_dir()
        raw_name = getattr(up, "filename", None) or "file"
        ext = Path(raw_name).suffix
        fname = f"{uuid.uuid4().hex}{ext}"
        fpath = upload_dir / fname
        fpath.write_bytes(body_bytes)

        name = form.get("name") or raw_name
        if hasattr(name, "strip"):
            name = str(name)
        collection_id_raw = form.get("collection_id")
        cid = None
        if collection_id_raw:
            try:
                cid = uuid.UUID(str(collection_id_raw))
            except ValueError:
                cid = None
        tags_raw = form.get("tags")
        tag_list: list[str] = []
        if tags_raw:
            try:
                tag_list = json.loads(str(tags_raw))
                if not isinstance(tag_list, list):
                    tag_list = [str(tags_raw)]
            except json.JSONDecodeError:
                tag_list = [t.strip() for t in str(tags_raw).split(",") if t.strip()]
        description = form.get("description")
        description = str(description) if description else None

        mime = getattr(up, "content_type", None) or "application/octet-stream"
        doc_type = "other"
        if mime == "application/pdf":
            doc_type = "pdf"
        elif "epub" in mime:
            doc_type = "epub"
        elif "markdown" in mime or ext.lower() in (".md", ".markdown"):
            doc_type = "markdown"
        elif mime.startswith("video/"):
            doc_type = "video"
        elif mime.startswith("audio/"):
            doc_type = "audio"
        elif mime.startswith("image/"):
            doc_type = "image"

        h = hashlib.sha256(body_bytes).hexdigest()
        doc = Document(
            user_id=user.id,
            name=name,
            path=str(fpath.resolve()),
            size=len(body_bytes),
            type=doc_type,
            mime_type=mime,
            content_hash=h,
            collection_id=cid,
            tags=tag_list,
            description=description,
        )
        db.add(doc)
        user.storage_used = (user.storage_used or 0) + len(body_bytes)
        db.add(user)
        db.commit()
        db.refresh(doc)
        return DocumentOut.model_validate(doc)

    payload = await request.json()
    body = DocumentCreateJson.model_validate(payload)
    doc = Document(
        user_id=user.id,
        name=body.name,
        type=body.type,
        mime_type=body.mime_type or "application/octet-stream",
        size=0,
        tags=body.tags,
        description=body.description,
        collection_id=body.collection_id,
        language=body.language,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return DocumentOut.model_validate(doc)


@router.get("/{doc_id}", response_model=DocumentOut)
def get_document(
    doc_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    doc = db.get(Document, doc_id)
    if not doc or doc.user_id != user.id or doc.deleted_at is not None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return DocumentOut.model_validate(doc)


@router.put("/{doc_id}", response_model=DocumentOut)
def update_document(
    doc_id: uuid.UUID,
    body: DocumentUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    doc = db.get(Document, doc_id)
    if not doc or doc.user_id != user.id or doc.deleted_at is not None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    data = body.model_dump(exclude_unset=True)
    meta = data.pop("metadata", None)
    for k, v in data.items():
        setattr(doc, k, v)
    if meta is not None:
        doc.extra = {**(doc.extra or {}), **meta}
    db.commit()
    db.refresh(doc)
    return DocumentOut.model_validate(doc)


@router.delete("/{doc_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(
    doc_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    doc = db.get(Document, doc_id)
    if not doc or doc.user_id != user.id or doc.deleted_at is not None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    doc.deleted_at = datetime.now(timezone.utc)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/{doc_id}/star", response_model=dict)
def star_document(
    doc_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    doc = db.get(Document, doc_id)
    if not doc or doc.user_id != user.id or doc.deleted_at is not None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    doc.is_starred = not doc.is_starred
    db.commit()
    return {"is_starred": doc.is_starred}


@router.post("/{doc_id}/archive", response_model=dict)
def archive_document(
    doc_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    doc = db.get(Document, doc_id)
    if not doc or doc.user_id != user.id or doc.deleted_at is not None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    doc.is_archived = not doc.is_archived
    db.commit()
    return {"is_archived": doc.is_archived}


@router.get("/{doc_id}/download")
def download_document(
    doc_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    doc = db.get(Document, doc_id)
    if not doc or doc.user_id != user.id or doc.deleted_at is not None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    if not doc.path or not Path(doc.path).is_file():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")
    return FileResponse(doc.path, filename=doc.name)
