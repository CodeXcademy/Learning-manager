import uuid
from typing import Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.course import Course, CourseModule
from app.models.user import User
from app.schemas.common import PaginationMeta
from app.schemas.course_schema import CourseCreate, CourseListResponse, CourseModuleOut, CourseOut, ModuleFileOut

router = APIRouter()


def _paginate(page: int, per_page: int, total: int) -> PaginationMeta:
    pages = max(1, (total + per_page - 1) // per_page) if total else 1
    return PaginationMeta(page=page, per_page=per_page, total=total, pages=pages, has_more=page < pages)


def _course_to_out(c: Course) -> CourseOut:
    modules_out: list[CourseModuleOut] = []
    for m in sorted(c.modules, key=lambda x: x.order):
        files_out = [
            ModuleFileOut.model_validate(f) for f in sorted(m.files, key=lambda x: x.order)
        ]
        mo = CourseModuleOut.model_validate(m)
        modules_out.append(mo.model_copy(update={"files": files_out}))
    co = CourseOut.model_validate(c)
    return co.model_copy(update={"modules": modules_out})


@router.get("", response_model=CourseListResponse)
def list_courses(
    page: int = 1,
    per_page: int = 20,
    search: Optional[str] = None,
    course_status: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    conds = [Course.user_id == user.id, Course.deleted_at.is_(None)]
    if search:
        pat = f"%{search.lower()}%"
        conds.append(
            or_(func.lower(Course.title).like(pat), func.lower(Course.description).like(pat))
        )
    if course_status:
        conds.append(Course.status == course_status)

    total = db.scalar(select(func.count()).select_from(Course).where(*conds)) or 0
    stmt = (
        select(Course)
        .options(joinedload(Course.modules).joinedload(CourseModule.files))
        .where(*conds)
        .order_by(Course.updated_at.desc())
        .offset((page - 1) * per_page)
        .limit(min(per_page, 100))
    )
    rows = db.scalars(stmt).unique().all()
    return CourseListResponse(
        data=[_course_to_out(r) for r in rows],
        pagination=_paginate(page, per_page, int(total)),
    )


@router.post("", response_model=CourseOut, status_code=status.HTTP_201_CREATED)
def create_course(
    body: CourseCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    c = Course(
        user_id=user.id,
        title=body.title,
        description=body.description,
        thumbnail_id=body.thumbnail_id,
        collection_id=body.collection_id,
        visibility=body.visibility,
        tags=body.tags,
        status=body.status,
    )
    db.add(c)
    db.commit()
    db.refresh(c)
    return _course_to_out(c)
