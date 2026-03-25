# Learning Manager - Backend Implementation Guide

## Quick Start

### Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│              Learning Manager Desktop App               │
│                   (Tauri + React)                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Frontend (React 19)                                   │
│  ├─ Dashboard, Library, Notes, Courses                │
│  ├─ Local-first state management                      │
│  └─ IndexedDB/LocalStorage for offline               │
│                                                         │
│  ┌────────────────────────────────────────┐           │
│  │  Tauri IPC Bridge                      │           │
│  │  ├─ Invoke (Frontend → Rust/Python)   │           │
│  │  └─ Listen (Events from Backend)      │           │
│  └────────────────────────────────────────┘           │
│                  ↕                                      │
│  ┌────────────────────────────────────────┐           │
│  │  SQLite Database (Local)               │           │
│  │  ├─ Documents, Notes, Courses          │           │
│  │  ├─ Learning Sessions, Analytics       │           │
│  │  └─ Full-text search indexes           │           │
│  └────────────────────────────────────────┘           │
│                                                         │
└─────────────────────────────────────────────────────────┘
         ↕ (HTTP API - Optional Cloud Sync)
┌─────────────────────────────────────────────────────────┐
│           Python Backend (Optional Cloud)              │
│  ├─ FastAPI/Flask REST API                            │
│  ├─ User authentication (OAuth/JWT)                   │
│  ├─ Cloud storage & backup                            │
│  ├─ Collaboration & sharing                           │
│  ├─ Advanced search with embeddings                   │
│  └─ ML-based recommendations                          │
└─────────────────────────────────────────────────────────┘
```

---

## Part 1: Tauri Setup

### Step 1: Initialize Tauri Project

```bash
# Install Tauri CLI
npm install -g tauri-cli

# Add Tauri to existing React project
cd /workspaces/Learning-manager
cargo install tauri-cli
npm run tauri init

# Follow prompts:
# - Package name: learning-manager
# - Window title: Learning Manager
# - Dev URL: http://localhost:3000
# - Frontend dev command: npm run dev
# - Frontend build command: npm run build
# - Frontend dist dir: dist
```

### Step 2: Update Tauri Configuration

Edit `src-tauri/tauri.conf.json`:

```json
{
  "build": {
    "beforeBuildCommand": "npm run build",
    "beforeDevCommand": "npm run dev",
    "devPath": "http://localhost:3000",
    "frontendDist": "../dist"
  },
  "app": {
    "windows": [
      {
        "fullscreen": false,
        "height": 900,
        "resizable": true,
        "title": "Learning Manager",
        "width": 1400,
        "minHeight": 600,
        "minWidth": 800
      }
    ],
    "security": {
      "csp": null
    }
  },
  "tauri": {
    "allowlist": {
      "all": false,
      "shell": {
        "all": false,
        "execute": true,
        "open": true,
        "sidecar": true
      },
      "fs": {
        "all": true,
        "readFile": true,
        "writeFile": true,
        "readDir": true,
        "createDir": true,
        "removeDir": true,
        "removeFile": true,
        "renameFile": true,
        "copyFile": true
      },
      "dialog": {
        "all": true
      },
      "http": {
        "all": true,
        "request": true,
        "scope": [
          "http://localhost/**",
          "https://api.learningmanager.com/**"
        ]
      }
    },
    "bundle": {
      "active": true,
      "targets": ["msi", "nsis"],
      "identifier": "com.learningmanager.app"
    }
  }
}
```

### Step 3: Set Up Tauri Command Handlers (Rust)

Create `src-tauri/src/main.rs`:

```rust
// Tauri main.rs
#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::Manager;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            cmd_initialize_db,
            cmd_sync_data,
            cmd_get_documents,
            cmd_save_note,
            cmd_export_data,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn cmd_initialize_db() -> Result<String, String> {
    // Call Python backend to initialize database
    Ok("Database initialized".to_string())
}

#[tauri::command]
fn cmd_sync_data(data: String) -> Result<String, String> {
    // Sync data with backend
    Ok("Data synced".to_string())
}

#[tauri::command]
fn cmd_get_documents() -> Result<String, String> {
    // Get documents from local database
    Ok("Documents retrieved".to_string())
}

#[tauri::command]
fn cmd_save_note(title: String, content: String) -> Result<String, String> {
    // Save note to local database
    Ok("Note saved".to_string())
}

#[tauri::command]
fn cmd_export_data(format: String) -> Result<String, String> {
    // Export data in specified format
    Ok("Data exported".to_string())
}
```

---

## Part 2: Python Backend Setup

### Step 1: Create Python Project Structure

```bash
mkdir learning-manager-backend
cd learning-manager-backend

# Project structure
learning-manager-backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI application
│   ├── config.py              # Configuration
│   ├── database.py            # SQLite setup
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── document.py
│   │   ├── note.py
│   │   ├── course.py
│   │   └── session.py
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── *_schema.py        # Pydantic models
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── documents.py
│   │   ├── notes.py
│   │   ├── courses.py
│   │   ├── sessions.py
│   │   └── analytics.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── auth_service.py
│   │   ├── document_service.py
│   │   ├── sync_service.py
│   │   └── analytics_service.py
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── security.py
│   │   ├── validators.py
│   │   └── search.py
│   └── middleware/
│       ├── __init__.py
│       ├── auth.py
│       └── errors.py
├── migrations/              # Alembic migrations
├── tests/                  # Test suite
├── requirements.txt        # Python dependencies
├── .env.example           # Environment variables
├── README.md
└── docker-compose.yml     # Docker setup (optional)
```

### Step 2: Install Dependencies

```bash
# requirements.txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0
pydantic-settings==2.1.0
sqlalchemy==2.0.23
alembic==1.12.1
python-jose[cryptography]==3.3.0
python-multipart==0.0.6
python-dotenv==1.0.0
passlib[bcrypt]==1.7.4
email-validator==2.1.0
requests==2.31.0
aiofiles==23.2.1
pdf2image==1.16.3
PyPDF2==4.0.2
ebooklib==0.18.0
markdown2==2.4.9
beautifulsoup4==4.12.2
sqlalchemy-utils==0.41.1
pytest==7.4.3
python-dateutil==2.8.2
pytz==2023.3

# Install
pip install -r requirements.txt
```

### Step 3: FastAPI Application Setup

Create `app/main.py`:

```python
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from contextlib import asynccontextmanager
import logging

from app.config import settings
from app.database import init_db, get_db
from app.routes import auth, documents, notes, courses, sessions, analytics

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Initializing database...")
    init_db()
    logger.info("Database initialized")
    yield
    # Shutdown
    logger.info("Shutting down...")

app = FastAPI(
    title="Learning Manager API",
    description="Comprehensive backend API for Learning Manager",
    version="1.0.0",
    lifespan=lifespan
)

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["localhost", "127.0.0.1"]
)

# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "version": "1.0.0"
    }

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(documents.router, prefix="/api/v1/documents", tags=["documents"])
app.include_router(notes.router, prefix="/api/v1/notes", tags=["notes"])
app.include_router(courses.router, prefix="/api/v1/courses", tags=["courses"])
app.include_router(sessions.router, prefix="/api/v1/sessions", tags=["sessions"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["analytics"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
```

Create `app/config.py`:

```python
from pydantic_settings import BaseSettings
from typing import List
from functools import lru_cache

class Settings(BaseSettings):
    # App
    APP_NAME: str = "Learning Manager API"
    DEBUG: bool = True
    
    # Database
    DATABASE_URL: str = "sqlite:///./learning_manager.db"
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "tauri://localhost",
    ]
    
    # File upload
    MAX_FILE_SIZE_MB: int = 5000  # 5GB
    UPLOAD_DIR: str = "./uploads"
    
    # Search
    FULL_TEXT_SEARCH: bool = True
    
    class Config:
        env_file = ".env"
        case_sensitive = True

@lru_cache()
def get_settings():
    return Settings()

settings = get_settings()
```

Create `app/database.py`:

```python
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import StaticPool
from app.config import settings
import logging

logger = logging.getLogger(__name__)

# Create engine
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

# Enable foreign keys for SQLite
@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Initialize database with all models"""
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created successfully")
```

### Step 4: SQLAlchemy Models

Create `app/models/user.py`:

```python
from sqlalchemy import Column, String, DateTime, Boolean, Integer, JSON
from sqlalchemy.dialects.sqlite import UUID
from datetime import datetime
import uuid
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    full_name = Column(String(100), nullable=False)
    password_hash = Column(String(255), nullable=False)
    avatar_url = Column(String(500), nullable=True)
    language = Column(String(10), default="en")
    theme = Column(String(20), default="light")
    preferences = Column(JSON, default={})
    storage_quota = Column(Integer, default=5368709120)  # 5GB
    storage_used = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
```

Create `app/models/document.py`:

```python
from sqlalchemy import Column, String, Integer, DateTime, Boolean, ForeignKey, JSON, Index
from sqlalchemy.dialects.sqlite import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.database import Base

class Document(Base):
    __tablename__ = "documents"
    __table_args__ = (
        Index('ix_document_user_created', 'user_id', 'created_at'),
        Index('ix_document_type', 'type'),
    )
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    name = Column(String(255), nullable=False)
    path = Column(String(1000), nullable=True)
    size = Column(Integer, nullable=False)
    type = Column(String(50), nullable=False, index=True)
    mime_type = Column(String(100), nullable=False)
    content_hash = Column(String(64), unique=True, nullable=True)
    collection_id = Column(UUID(as_uuid=True), ForeignKey('collections.id'), nullable=True)
    description = Column(String(1000), nullable=True)
    thumbnail_url = Column(String(500), nullable=True)
    page_count = Column(Integer, nullable=True)
    duration = Column(Integer, nullable=True)
    language = Column(String(10), default="en")
    is_starred = Column(Boolean, default=False)
    is_archived = Column(Boolean, default=False)
    metadata = Column(JSON, default={})
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)
```

Create `app/models/note.py`:

```python
from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey, Integer, JSON, Index, Text
from sqlalchemy.dialects.sqlite import UUID
from datetime import datetime
import uuid
from app.database import Base

class Note(Base):
    __tablename__ = "notes"
    __table_args__ = (
        Index('ix_note_user_modality', 'user_id', 'modality'),
        Index('ix_note_folder', 'folder_id'),
    )
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    language = Column(String(10), default="en")
    is_rtl = Column(Boolean, default=False)
    modality = Column(String(50), nullable=False)
    source_type = Column(String(50), nullable=False)
    source_id = Column(UUID(as_uuid=True), nullable=True)
    source_name = Column(String(255), nullable=True)
    source_timestamp = Column(String(50), nullable=True)
    source_page_number = Column(Integer, nullable=True)
    folder_id = Column(UUID(as_uuid=True), ForeignKey('note_folders.id'), nullable=True)
    collection_id = Column(UUID(as_uuid=True), ForeignKey('collections.id'), nullable=True)
    tags = Column(JSON, default=[])
    is_favorite = Column(Boolean, default=False)
    is_pinned = Column(Boolean, default=False)
    word_count = Column(Integer, default=0)
    reading_time = Column(Integer, default=0)
    current_revision = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)
```

### Step 5: Pydantic Schemas

Create `app/schemas/user_schema.py`:

```python
from pydantic import BaseModel, EmailStr, Field
from uuid import UUID
from datetime import datetime
from typing import Optional

class UserRegister(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=30)
    password: str = Field(..., min_length=8)
    full_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: UUID
    email: str
    username: str
    full_name: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserDetailResponse(UserResponse):
    avatar_url: Optional[str]
    language: str
    theme: str
    preferences: dict
    storage_quota: int
    storage_used: int
    last_login: Optional[datetime]
    updated_at: datetime
```

### Step 6: Authentication Routes

Create `app/routes/auth.py`:

```python
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
import logging

from app.database import get_db
from app.config import settings
from app.models.user import User
from app.schemas.user_schema import UserRegister, UserLogin, UserResponse
from app.utils.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token
)

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/register", response_model=UserResponse, status_code=201)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if user exists
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(status_code=409, detail="Email already registered")
    
    if db.query(User).filter(User.username == user_data.username).first():
        raise HTTPException(status_code=409, detail="Username already taken")
    
    # Create user
    user = User(
        email=user_data.email,
        username=user_data.username,
        full_name=user_data.full_name,
        password_hash=get_password_hash(user_data.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    logger.info(f"New user registered: {user.email}")
    return user

@router.post("/login")
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    """Authenticate user and return tokens"""
    user = db.query(User).filter(User.email == user_data.email).first()
    
    if not user or not verify_password(user_data.password, user.password_hash):
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )
    
    if not user.is_active:
        raise HTTPException(status_code=401, detail="User is inactive")
    
    # Update last login
    user.last_login = datetime.utcnow()
    db.commit()
    
    # Generate tokens
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": user,
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }

@router.post("/refresh")
def refresh_token(refresh_token: str, db: Session = Depends(get_db)):
    """Refresh authentication token"""
    try:
        payload = jwt.decode(
            refresh_token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        user_id = payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    access_token = create_access_token(data={"sub": user_id})
    
    return {
        "access_token": access_token,
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }
```

Create `app/utils/security.py`:

```python
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt
from app.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )
    return encoded_jwt

def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )
    return encoded_jwt
```

---

## Part 3: Frontend Integration with Tauri

### Step 1: Create Tauri Service Layer

Create `src/lib/tauri-service.ts`:

```typescript
import { invoke } from "@tauri-apps/api/tauri";
import { listen } from "@tauri-apps/api/event";

export class TauriService {
  // Database operations
  static async initializeDb(): Promise<string> {
    return await invoke("cmd_initialize_db");
  }

  static async getDocuments(): Promise<any[]> {
    return await invoke("cmd_get_documents");
  }

  // Note operations
  static async saveNote(title: string, content: string): Promise<string> {
    return await invoke("cmd_save_note", { title, content });
  }

  // Sync operations
  static async syncData(data: any): Promise<string> {
    return await invoke("cmd_sync_data", { data: JSON.stringify(data) });
  }

  // Export operations
  static async exportData(format: string): Promise<string> {
    return await invoke("cmd_export_data", { format });
  }

  // Event listeners
  static async onDatabaseUpdated(callback: (data: any) => void): Promise<void> {
    await listen("db-updated", (event) => callback(event.payload));
  }

  static async onSyncProgress(callback: (progress: number) => void): Promise<void> {
    await listen("sync-progress", (event) => callback(event.payload));
  }
}
```

### Step 2: Create API Service for Cloud Backend

Create `src/lib/api-service.ts`:

```typescript
import axios, { AxiosInstance } from "axios";

interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export class ApiService {
  private api: AxiosInstance;
  private tokens: AuthTokens | null = null;

  constructor(baseURL: string = "http://localhost:8000/api/v1") {
    this.api = axios.create({
      baseURL,
      headers: {
        "Content-Type": "application/json",
      }
    });

    // Response interceptor for token refresh
    this.api.interceptors.response.use(
      response => response,
      async error => {
        if (error.response?.status === 401) {
          // Try to refresh token
          const refreshed = await this.refreshAccessToken();
          if (refreshed) {
            return this.api.request(error.config);
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth methods
  async register(email: string, username: string, password: string, fullName: string) {
    const response = await this.api.post("/auth/register", {
      email,
      username,
      password,
      full_name: fullName,
    });
    return response.data;
  }

  async login(email: string, password: string) {
    const response = await this.api.post("/auth/login", { email, password });
    this.tokens = {
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token,
    };
    this.setAuthHeader();
    return response.data;
  }

  async refreshAccessToken(): Promise<boolean> {
    if (!this.tokens?.refresh_token) return false;
    
    try {
      const response = await this.api.post("/auth/refresh", {
        refresh_token: this.tokens.refresh_token,
      });
      this.tokens.access_token = response.data.access_token;
      this.setAuthHeader();
      return true;
    } catch (error) {
      this.tokens = null;
      return false;
    }
  }

  // Document methods
  async getDocuments(page: number = 1, search?: string) {
    const response = await this.api.get("/documents", {
      params: { page, search },
    });
    return response.data;
  }

  async uploadDocument(file: File, metadata: any) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", metadata.name);
    
    const response = await this.api.post("/documents", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  }

  // Note methods
  async getNotes(page: number = 1, modality?: string) {
    const response = await this.api.get("/notes", {
      params: { page, modality },
    });
    return response.data;
  }

  async createNote(noteData: any) {
    const response = await this.api.post("/notes", noteData);
    return response.data;
  }

  // Analytics methods
  async getAnalytics(period: string = "30d") {
    const response = await this.api.get("/analytics/dashboard", {
      params: { period },
    });
    return response.data;
  }

  // Sync methods
  async syncData(localChanges: any) {
    const response = await this.api.post("/sync", {
      last_sync: new Date().toISOString(),
      changes: localChanges,
    });
    return response.data;
  }

  private setAuthHeader() {
    if (this.tokens?.access_token) {
      this.api.defaults.headers.common["Authorization"] = `Bearer ${this.tokens.access_token}`;
    }
  }
}

export const apiService = new ApiService();
```

### Step 3: React Hook for Local-First State

Create `src/hooks/useLocalFirstSync.ts`:

```typescript
import { useEffect, useState, useCallback } from "react";
import { TauriService } from "../lib/tauri-service";
import { apiService } from "../lib/api-service";

interface SyncState {
  isSyncing: boolean;
  lastSync: Date | null;
  pendingChanges: number;
  syncEnabled: boolean;
}

export function useLocalFirstSync() {
  const [syncState, setSyncState] = useState<SyncState>({
    isSyncing: false,
    lastSync: null,
    pendingChanges: 0,
    syncEnabled: false,
  });

  // Initialize local database
  useEffect(() => {
    const init = async () => {
      try {
        await TauriService.initializeDb();
        setSyncState(prev => ({ ...prev, syncEnabled: true }));
      } catch (error) {
        console.error("Failed to initialize database:", error);
      }
    };
    init();
  }, []);

  // Set up sync listener
  useEffect(() => {
    const unsubscribe = TauriService.onDatabaseUpdated((data) => {
      setSyncState(prev => ({
        ...prev,
        pendingChanges: prev.pendingChanges + 1,
      }));
    });
    
    return () => {
      unsubscribe.then(unsub => unsub?.());
    };
  }, []);

  // Sync function
  const sync = useCallback(async (localChanges: any) => {
    if (!syncState.syncEnabled || syncState.isSyncing) return;

    setSyncState(prev => ({ ...prev, isSyncing: true }));
    try {
      const result = await apiService.syncData(localChanges);
      setSyncState(prev => ({
        ...prev,
        lastSync: new Date(),
        pendingChanges: 0,
        isSyncing: false,
      }));
      return result;
    } catch (error) {
      console.error("Sync failed:", error);
      setSyncState(prev => ({ ...prev, isSyncing: false }));
    }
  }, [syncState.syncEnabled, syncState.isSyncing]);

  return { syncState, sync };
}
```

---

## Part 4: Deployment

### Development Mode

```bash
# Start Tauri dev server
npm run tauri dev

# Or manually start Vite + Tauri
npm run dev &  # Frontend on port 3000
npm run tauri dev  # Tauri with HMR

# Start Python backend
cd ../learning-manager-backend
uvicorn app.main:app --reload --port 8000
```

### Production Build

```bash
# Build React app
npm run build

# Build Tauri app
npm run tauri build

# Output: src-tauri/target/release/learning-manager  (Linux/macOS)
#         src-tauri/target/release/learning-manager.exe (Windows)
```

### Docker Deployment (Optional)

Create `learning-manager-backend/Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app/ ./app/
COPY migrations/ ./migrations/

ENV DATABASE_URL=sqlite:///./learning_manager.db
ENV SECRET_KEY=your-secret-key-change-in-production

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

EXPOSE 8000
```

Create `learning-manager-backend/docker-compose.yml`:

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "8000:8000"
    volumes:
      - ./learning_manager.db:/app/learning_manager.db
      - ./uploads:/app/uploads
    environment:
      DEBUG: "true"
      DATABASE_URL: "sqlite:///./learning_manager.db"
      SECRET_KEY: "your-secret-key"
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

  frontend:
    image: node:20-alpine
    working_dir: /app
    ports:
      - "3000:3000"
    volumes:
      - ./:/app
    command: npm run dev
```

---

## Part 5: Database Migrations

Using Alembic for schema management:

```bash
cd learning-manager-backend

# Initialize Alembic
alembic init migrations

# Create migration
alembic revision --autogenerate -m "Initial schema"

# Apply migrations
alembic upgrade head
```

Create `migrations/env.py` for SQLite:

```python
from logging.config import fileConfig
from sqlalchemy import engine_from_config
from alembic import context
from app.database import Base
from app.models import *  # Import all models

config = context.config

# SQLite setup
def run_migrations_offline():
    url = config.get_main_option("sqlalchemy.url")
    context.configure(url=url, target_metadata=Base.metadata, literal_binds=True)
    
    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online():
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=StaticPool,
    )
    
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=Base.metadata)
        
        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
```

---

## Best Practices

### 1. Local-First Architecture
- Always write to local SQLite first
- Sync to backend asynchronously
- Handle sync conflicts gracefully
- Provide offline indicators to user

### 2. Security
- Use HTTPS for cloud API (production)
- Store tokens securely (Tauri has secure storage)
- Validate all inputs server-side
- Use parameterized queries (SQLAlchemy does this)
- Hash passwords with bcrypt

### 3. Performance
- Use indexes on frequently queried columns
- Implement pagination for large datasets
- Use full-text search for document content
- Cache search results (Redis optional)
- Lazy load heavy components

### 4. Error Handling
- Return meaningful error codes
- Log errors server-side
- Graceful degradation for offline mode
- User-friendly error messages

### 5. Testing
```bash
# Python backend tests
pytest tests/

# Integration tests
pytest tests/integration/

# Frontend tests
npm run test
```

---

## Troubleshooting

### Tauri IPC not working
- Check Tauri allowlist configuration
- Verify command is properly invoked
- Check browser console for errors

### Database locked
- Ensure only one connection at a time
- Use connection pooling correctly
- Close connections properly

### Sync conflicts
- Implement last-write-wins strategy
- Or manual conflict resolution UI
- Store version numbers on all records

### Large file uploads
- Implement chunked uploads
- Show progress to user
- Resume broken uploads
- Generate thumbnails in background

