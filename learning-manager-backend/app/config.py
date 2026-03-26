from functools import lru_cache
from pathlib import Path
from typing import List, Optional

from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True, extra="ignore")

    APP_NAME: str = "Learning Manager API"
    DEBUG: bool = True

    DATABASE_URL: str = "sqlite:///./learning_manager.db"

    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "https://tauri.localhost",
        "http://tauri.localhost",
        "tauri://localhost",
    ]

    LEARNING_MANAGER_DATA_DIR: Optional[str] = None

    # REMOVE_DEV_AUTO_LOGIN — See REMOVE_DEV_AUTO_LOGIN.txt (repo root). Grep this tag to remove.
    DEV_AUTO_LOGIN: bool = True
    DEFAULT_DEV_EMAIL: str = "dev@local.app"
    DEFAULT_DEV_USERNAME: str = "devuser"
    DEFAULT_DEV_PASSWORD: str = "LearningManagerDev!"
    DEFAULT_DEV_FULL_NAME: str = "Local Dev User"

    MAX_FILE_SIZE_MB: int = 5000
    UPLOAD_DIR: str = "./uploads"

    FULL_TEXT_SEARCH: bool = True

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors(cls, v):
        if isinstance(v, str):
            import json

            try:
                return json.loads(v)
            except json.JSONDecodeError:
                return [s.strip() for s in v.split(",") if s.strip()]
        return v

    @model_validator(mode="after")
    def apply_packaged_paths_and_flags(self):
        import os

        raw_login = os.environ.get("LM_DEV_AUTO_LOGIN")
        if raw_login is not None:
            self.DEV_AUTO_LOGIN = raw_login.strip().lower() in ("1", "true", "yes")
        if self.LEARNING_MANAGER_DATA_DIR:
            root = Path(self.LEARNING_MANAGER_DATA_DIR)
            root.mkdir(parents=True, exist_ok=True)
            db_file = root / "learning_manager.db"
            self.DATABASE_URL = f"sqlite:///{db_file.resolve().as_posix()}"
            uploads = root / "uploads"
            uploads.mkdir(parents=True, exist_ok=True)
            self.UPLOAD_DIR = str(uploads.resolve())
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
