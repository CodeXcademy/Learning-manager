import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

from app.config import settings
from app.database import init_db
from app.routes import analytics, auth, collections, courses, documents, notes, sessions, sync, users

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing database...")
    Path(settings.UPLOAD_DIR).mkdir(parents=True, exist_ok=True)
    import app.models  # noqa: F401 — register models with Base.metadata

    init_db()
    logger.info("Database initialized")
    yield
    logger.info("Shutting down...")


app = FastAPI(
    title="Learning Manager API",
    description="Comprehensive backend API for Learning Manager",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if not settings.DEBUG:
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["localhost", "127.0.0.1"],
    )


@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}


app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
app.include_router(collections.router, prefix="/api/v1/collections", tags=["collections"])
app.include_router(documents.router, prefix="/api/v1/documents", tags=["documents"])
app.include_router(notes.router, prefix="/api/v1/notes", tags=["notes"])
app.include_router(courses.router, prefix="/api/v1/courses", tags=["courses"])
app.include_router(sessions.router, prefix="/api/v1/sessions", tags=["sessions"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["analytics"])
app.include_router(sync.router, prefix="/api/v1/sync", tags=["sync"])


def run():
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
    )


if __name__ == "__main__":
    run()
