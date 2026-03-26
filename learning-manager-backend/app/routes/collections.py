import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.collection import Collection
from app.models.document import Document
from app.models.user import User
from app.schemas.collection_schema import CollectionCreate, CollectionListResponse, CollectionOut

router = APIRouter()


@router.get("", response_model=CollectionListResponse)
def list_collections(
    parent_id: Optional[uuid.UUID] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    stmt = select(Collection).where(Collection.user_id == user.id, Collection.deleted_at.is_(None))
    if parent_id is not None:
        stmt = stmt.where(Collection.parent_id == parent_id)
    if search:
        pat = f"%{search.lower()}%"
        stmt = stmt.where(func.lower(Collection.name).like(pat))
    rows = db.scalars(stmt.order_by(Collection.name)).all()
    data: list[CollectionOut] = []
    for c in rows:
        count = db.scalar(
            select(func.count())
            .select_from(Document)
            .where(
                Document.user_id == user.id,
                Document.collection_id == c.id,
                Document.deleted_at.is_(None),
            )
        )
        base = CollectionOut.model_validate(c)
        data.append(base.model_copy(update={"item_count": int(count or 0)}))
    return CollectionListResponse(data=data)


@router.post("", response_model=CollectionOut, status_code=status.HTTP_201_CREATED)
def create_collection(
    body: CollectionCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    c = Collection(
        user_id=user.id,
        name=body.name,
        description=body.description,
        color=body.color,
        icon=body.icon,
        parent_id=body.parent_id,
        visibility=body.visibility,
    )
    db.add(c)
    db.commit()
    db.refresh(c)
    return CollectionOut.model_validate(c)
