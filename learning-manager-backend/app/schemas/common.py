from pydantic import BaseModel


class PaginationMeta(BaseModel):
    page: int
    per_page: int
    total: int
    pages: int
    has_more: bool
