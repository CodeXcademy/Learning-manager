# Learning Manager - Backend API Specification

## Overview

This document defines the complete backend API specification for the Learning Manager application. The backend will be built with:

- **Framework**: Python (FastAPI/Flask for API, could use Tauri's backend)
- **Database**: SQLite (local storage with future backend sync)
- **Architecture**: Local-first with backend sync for collaboration and cloud backup
- **Desktop Wrapper**: Tauri (native application)

## Architecture Philosophy

- **Local-First**: All data exists and functions locally on the user's machine
- **Sync-Ready**: Backend provides synchronization, backup, and collaboration features
- **Offline-First**: App works completely offline; backend is optional
- **Progressive Enhancement**: Features degrade gracefully without backend connection

---

## Core Data Models

### 1. User & Authentication

```python
# User Model
User:
  - id: UUID (primary key)
  - email: String (unique, optional for local-first)
  - username: String (unique, required for sharing)
  - password_hash: String (optional, for cloud sync)
  - full_name: String
  - avatar_url: String
  - language: Enum ['en', 'ar', 'auto']
  - theme: Enum ['light', 'dark']
  - preferences: JSON (settings, keyboard shortcuts, etc.)
  - storage_quota: Integer (bytes, optional)
  - storage_used: Integer (bytes)
  - created_at: DateTime
  - updated_at: DateTime
  - is_active: Boolean
  - last_login: DateTime
```

### 2. Files & Documents

```python
# Document/File Model
Document:
  - id: UUID (primary key)
  - user_id: UUID (foreign key)
  - name: String
  - path: String (local file path - not synced to server)
  - size: Integer (bytes)
  - type: Enum ['pdf', 'epub', 'markdown', 'video', 'audio', 'image', 'other']
  - mime_type: String
  - content_hash: String (SHA256 for deduplication)
  - storage_location: Enum ['local', 'cloud', 'both']
  - collection_id: UUID (foreign key, optional)
  - tags: Array<String>
  - description: String
  - thumbnail_url: String
  - page_count: Integer (for PDFs)
  - duration: Integer (seconds, for videos/audio)
  - language: String
  - is_starred: Boolean
  - is_archived: Boolean
  - metadata: JSON (custom metadata)
  - created_at: DateTime
  - updated_at: DateTime
  - deleted_at: DateTime (soft delete)
```

### 3. Collections & Organization

```python
# Collection Model
Collection:
  - id: UUID (primary key)
  - user_id: UUID (foreign key)
  - name: String
  - description: String
  - color: String (hex color code)
  - icon: String (emoji or icon name)
  - parent_id: UUID (self-referencing for nesting)
  - item_count: Integer (denormalized for performance)
  - thumbnail_id: UUID (Document ID)
  - visibility: Enum ['private', 'shared_link', 'public']
  - created_at: DateTime
  - updated_at: DateTime
  - deleted_at: DateTime
```

### 4. Courses & Learning Modules

```python
# Course Model
Course:
  - id: UUID (primary key)
  - user_id: UUID (foreign key, creator)
  - title: String
  - description: String
  - thumbnail_id: UUID (Document ID, optional)
  - collection_id: UUID (foreign key, optional)
  - visibility: Enum ['private', 'public', 'shared']
  - tags: Array<String>
  - status: Enum ['draft', 'published', 'archived']
  - total_duration: Integer (seconds, denormalized)
  - completion_progress: Float (0-100)
  - metadata: JSON
  - created_at: DateTime
  - updated_at: DateTime
  - published_at: DateTime (optional)
  - deleted_at: DateTime

# CourseModule Model
CourseModule:
  - id: UUID (primary key)
  - course_id: UUID (foreign key)
  - title: String
  - description: String
  - type: Enum ['video', 'document', 'quiz', 'audio', 'mixed']
  - order: Integer (sequence in course)
  - duration: Integer (seconds, calculated)
  - is_completed: Boolean
  - metadata: JSON
  - created_at: DateTime
  - updated_at: DateTime

# ModuleFile Model (Join table for multiple files per module)
ModuleFile:
  - id: UUID (primary key)
  - module_id: UUID (foreign key)
  - document_id: UUID (foreign key)
  - file_type: Enum ['video', 'document', 'audio', 'image', 'other']
  - order: Integer
  - duration: Integer (seconds, optional)
  - size: Integer (bytes)
  - created_at: DateTime
```

### 5. Notes & Highlights

```python
# Note Model
Note:
  - id: UUID (primary key)
  - user_id: UUID (foreign key)
  - title: String
  - content: String (markdown)
  - language: Enum ['en', 'ar', 'auto']
  - is_rtl: Boolean
  - modality: Enum ['video', 'document', 'audio', 'course', 'general']
  - source_type: Enum ['course', 'module', 'document', 'standalone']
  - source_id: UUID (reference to course/module/document)
  - source_name: String
  - source_timestamp: String (for videos, e.g., "04:32")
  - source_page_number: Integer (for documents)
  - linked_file_path: String (local path reference)
  - linked_file_type: Enum ['video', 'document', 'audio', 'image']
  - folder_id: UUID (foreign key, optional)
  - collection_id: UUID (foreign key, optional)
  - tags: Array<String>
  - is_favorite: Boolean
  - is_pinned: Boolean
  - template_id: UUID (foreign key, optional)
  - word_count: Integer
  - reading_time: Integer (minutes)
  - current_revision: Integer
  - created_at: DateTime
  - updated_at: DateTime
  - deleted_at: DateTime

# TextHighlight Model
TextHighlight:
  - id: UUID (primary key)
  - note_id: UUID (foreign key)
  - text: String
  - color: Enum ['yellow', 'green', 'blue', 'pink', 'purple', 'orange']
  - start_offset: Integer
  - end_offset: Integer
  - page_number: Integer (for PDFs)
  - timestamp: String (for videos)
  - created_at: DateTime

# NoteRevision Model
NoteRevision:
  - id: UUID (primary key)
  - note_id: UUID (foreign key)
  - revision_number: Integer
  - title: String
  - content: String (markdown)
  - word_count: Integer
  - created_at: DateTime

# NoteFolder Model
NoteFolder:
  - id: UUID (primary key)
  - user_id: UUID (foreign key)
  - name: String
  - color: String (hex)
  - icon: String
  - parent_id: UUID (self-referencing)
  - note_count: Integer
  - order: Integer
  - is_expanded: Boolean
  - created_at: DateTime
  - updated_at: DateTime

# NoteTemplate Model
NoteTemplate:
  - id: UUID (primary key)
  - user_id: UUID (foreign key)
  - name: String
  - description: String
  - content: String (markdown template with placeholders)
  - modality: Enum ['video', 'document', 'audio', 'course', 'general']
  - icon: String
  - is_custom: Boolean
  - created_at: DateTime
```

### 6. Learning & Focus Sessions

```python
# LearningSession Model
LearningSession:
  - id: UUID (primary key)
  - user_id: UUID (foreign key)
  - course_id: UUID (foreign key, optional)
  - module_id: UUID (foreign key, optional)
  - document_id: UUID (foreign key, optional)
  - type: Enum ['reading', 'watching', 'listening', 'practicing', 'reviewing']
  - duration: Integer (seconds)
  - start_time: DateTime
  - end_time: DateTime
  - notes_created: Integer (count)
  - highlights_created: Integer (count)
  - is_focused: Boolean (from focus timer)
  - mood_before: Integer (1-5, optional)
  - mood_after: Integer (1-5, optional)
  - retention_score: Float (0-100, optional)
  - metadata: JSON
  - created_at: DateTime

# FocusSession Model
FocusSession:
  - id: UUID (primary key)
  - user_id: UUID (foreign key)
  - duration: Integer (seconds, target)
  - elapsed_time: Integer (seconds)
  - breaks_taken: Integer
  - total_break_time: Integer (seconds)
  - goal: String
  - completed: Boolean
  - interruptions: Integer (count)
  - focus_score: Float (0-100)
  - notes: String
  - timezone: String
  - start_time: DateTime
  - end_time: DateTime (optional, if not completed)
  - metadata: JSON
  - created_at: DateTime

# FocusPreference Model
FocusPreference:
  - id: UUID (primary key)
  - user_id: UUID (foreign key)
  - default_duration: Integer (minutes)
  - break_duration: Integer (minutes)
  - long_break_duration: Integer (minutes)
  - sessions_until_long_break: Integer
  - sound_enabled: Boolean
  - sound_type: String
  - notification_type: Enum ['sound', 'visual', 'both', 'none']
  - auto_start_breaks: Boolean
  - hourly_goal: Integer (minutes)
  - daily_goal: Integer (hours)
  - created_at: DateTime
  - updated_at: DateTime
```

### 7. Analytics & Progress

```python
# UserStats Model
UserStats:
  - id: UUID (primary key)
  - user_id: UUID (foreign key)
  - total_minutes_learned: Integer
  - courses_completed: Integer
  - modules_completed: Integer
  - notes_created: Integer
  - documents_processed: Integer
  - current_streak: Integer (days)
  - longest_streak: Integer (days)
  - total_focus_sessions: Integer
  - total_focus_minutes: Integer
  - average_focus_score: Float (0-100)
  - preferred_learning_time: String (e.g., "morning", "afternoon")
  - preferred_modality: Array<String> (video, document, audio, etc.)
  - storage_used_bytes: Integer
  - last_activity: DateTime
  - updated_at: DateTime

# LearningProgress Model (Daily aggregation)
LearningProgress:
  - id: UUID (primary key)
  - user_id: UUID (foreign key)
  - date: Date
  - minutes_learned: Integer
  - courses_completed_today: Integer
  - modules_completed_today: Integer
  - focus_sessions_completed: Integer
  - total_focus_minutes: Integer
  - notes_created_today: Integer
  - average_mood: Float
  - documents_reviewed: Integer
  - created_at: DateTime

# Achievement Model
Achievement:
  - id: UUID (primary key)
  - user_id: UUID (foreign key)
  - achievement_type: Enum ['streak', 'hours', 'courses', 'badges', 'milestones', 'custom']
  - title: String
  - description: String
  - icon: String
  - progress: Float (0-100)
  - is_unlocked: Boolean
  - unlocked_at: DateTime (optional)
  - metadata: JSON
  - created_at: DateTime
  - updated_at: DateTime
```

### 8. Tags & Metadata

```python
# Tag Model
Tag:
  - id: UUID (primary key)
  - user_id: UUID (foreign key)
  - name: String
  - color: String (hex)
  - usage_count: Integer
  - created_at: DateTime
  - updated_at: DateTime

# NotesStats Model
NotesStats:
  - id: UUID (primary key)
  - user_id: UUID (foreign key)
  - total_notes: Integer
  - total_words: Integer
  - total_highlights: Integer
  - storage_used_bytes: Integer
  - last_backup: DateTime
  - notes_by_modality: JSON (map of modality -> count)
  - notes_by_folder: JSON (map of folder_id -> count)
  - recent_searches: Array<String>
  - updated_at: DateTime
```

---

## API Endpoints

### Authentication & User Management

#### 1. POST /api/v1/auth/register
Create a new user account (optional for local-first).

**Request**:
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "securePassword123",
  "full_name": "John Doe"
}
```

**Response (201)**:
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "username": "username",
  "full_name": "John Doe",
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### 2. POST /api/v1/auth/login
Authenticate user and get session token.

**Request**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200)**:
```json
{
  "access_token": "jwt_token",
  "refresh_token": "refresh_token",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "username"
  },
  "expires_in": 3600
}
```

#### 3. POST /api/v1/auth/refresh
Refresh authentication token.

**Request**:
```json
{
  "refresh_token": "refresh_token"
}
```

**Response (200)**:
```json
{
  "access_token": "new_jwt_token",
  "expires_in": 3600
}
```

#### 4. POST /api/v1/auth/logout
Invalidate current session.

#### 5. GET /api/v1/users/me
Get current user details.

**Response (200)**:
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "username": "username",
  "full_name": "John Doe",
  "avatar_url": "https://...",
  "language": "en",
  "theme": "dark",
  "storage_quota": 5368709120,
  "storage_used": 1073741824,
  "preferences": {
    "keyboard_shortcuts": {...},
    "notifications": {...}
  },
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### 6. PUT /api/v1/users/me
Update user profile.

**Request**:
```json
{
  "full_name": "John Doe Updated",
  "avatar_url": "https://...",
  "language": "ar",
  "theme": "light",
  "preferences": {...}
}
```

#### 7. POST /api/v1/users/me/password
Change user password.

**Request**:
```json
{
  "current_password": "oldPassword123",
  "new_password": "newPassword123"
}
```

---

### Documents & Files Management

#### 8. GET /api/v1/documents
List all documents with filtering, sorting, and pagination.

**Query Parameters**:
- `page`: Integer (default: 1)
- `per_page`: Integer (default: 20)
- `type`: String (filter by type: pdf, epub, markdown, etc.)
- `search`: String (search in name and description)
- `collection_id`: UUID (filter by collection)
- `tag`: String (filter by tag)
- `sort_by`: String (name, created_at, updated_at, size)
- `order`: String (asc, desc)
- `is_starred`: Boolean
- `is_archived`: Boolean

**Response (200)**:
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Document Name",
      "type": "pdf",
      "size": 1048576,
      "mime_type": "application/pdf",
      "collection_id": "uuid",
      "tags": ["tag1", "tag2"],
      "description": "Document description",
      "thumbnail_url": "https://...",
      "page_count": 50,
      "language": "en",
      "is_starred": false,
      "is_archived": false,
      "metadata": {...},
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 100,
    "pages": 5
  }
}
```

#### 9. POST /api/v1/documents
Create a new document record or upload file.

**Content-Type**: application/json or multipart/form-data

**Request (JSON)**:
```json
{
  "name": "Document Name",
  "type": "pdf",
  "mime_type": "application/pdf",
  "collection_id": "uuid",
  "tags": ["tag1", "tag2"],
  "description": "Document description",
  "language": "en"
}
```

**Request (multipart/form-data)**:
```
- file: <binary file data>
- name: "Document Name" (optional, from filename if not provided)
- collection_id: "uuid" (optional)
- tags: ["tag1", "tag2"] (optional)
- description: "Document description" (optional)
```

**Response (201)**:
```json
{
  "id": "uuid",
  "name": "Document Name",
  "type": "pdf",
  "size": 1048576,
  "mime_type": "application/pdf",
  "collection_id": "uuid",
  "tags": ["tag1", "tag2"],
  "thumbnail_url": "https://...",
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### 10. GET /api/v1/documents/:id
Get a specific document.

**Response (200)**:
```json
{
  "id": "uuid",
  "name": "Document Name",
  "type": "pdf",
  "size": 1048576,
  "mime_type": "application/pdf",
  "collection_id": "uuid",
  "tags": ["tag1", "tag2"],
  "description": "Document description",
  "thumbnail_url": "https://...",
  "page_count": 50,
  "language": "en",
  "is_starred": false,
  "is_archived": false,
  "metadata": {...},
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

#### 11. PUT /api/v1/documents/:id
Update document metadata.

**Request**:
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "tags": ["tag1", "tag2", "tag3"],
  "collection_id": "uuid",
  "is_starred": true,
  "is_archived": false,
  "language": "en",
  "metadata": {...}
}
```

#### 12. DELETE /api/v1/documents/:id
Delete a document (soft delete).

#### 13. POST /api/v1/documents/:id/star
Star/favorite a document.

**Response (200)**:
```json
{
  "is_starred": true
}
```

#### 14. POST /api/v1/documents/:id/archive
Archive a document.

**Response (200)**:
```json
{
  "is_archived": true
}
```

#### 15. GET /api/v1/documents/:id/download
Download the actual file.

**Response (200)**: Binary file with appropriate Content-Type header.

#### 16. POST /api/v1/documents/bulk/delete
Bulk delete documents.

**Request**:
```json
{
  "document_ids": ["uuid1", "uuid2", "uuid3"]
}
```

#### 17. POST /api/v1/documents/bulk/tag
Bulk tag documents.

**Request**:
```json
{
  "document_ids": ["uuid1", "uuid2"],
  "tags": ["tag1", "tag2"],
  "operation": "add" | "remove" | "set"
}
```

#### 18. GET /api/v1/documents/search
Advanced search with full-text search.

**Query Parameters**:
- `q`: String (search query)
- `type`: String (filter by type)
- `collection_id`: UUID
- `date_from`: ISO 8601 date
- `date_to`: ISO 8601 date
- `size_min`: Integer (bytes)
- `size_max`: Integer (bytes)

**Response (200)**: Same as list endpoint.

---

### Collections Management

#### 19. GET /api/v1/collections
List all collections.

**Query Parameters**:
- `parent_id`: UUID (get children only)
- `search`: String

**Response (200)**:
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Collection Name",
      "description": "Collection description",
      "color": "#FF5733",
      "icon": "📚",
      "parent_id": "uuid",
      "item_count": 10,
      "thumbnail_id": "uuid",
      "visibility": "private",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### 20. POST /api/v1/collections
Create a new collection.

**Request**:
```json
{
  "name": "My Collection",
  "description": "Collection description",
  "color": "#FF5733",
  "icon": "📚",
  "parent_id": "uuid",
  "visibility": "private"
}
```

#### 21. PUT /api/v1/collections/:id
Update a collection.

#### 22. DELETE /api/v1/collections/:id
Delete a collection.

#### 23. GET /api/v1/collections/:id/items
Get all items in a collection.

---

### Courses & Learning Modules

#### 24. GET /api/v1/courses
List all courses.

**Query Parameters**:
- `page`: Integer
- `per_page`: Integer
- `search`: String
- `status`: String (draft, published, archived)
- `visibility`: String (private, public, shared)
- `tag`: String
- `sort_by`: String (title, progress, created_at)

**Response (200)**:
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Course Title",
      "description": "Course description",
      "thumbnail_id": "uuid",
      "collection_id": "uuid",
      "visibility": "private",
      "tags": ["tag1", "tag2"],
      "status": "published",
      "total_duration": 7200,
      "completion_progress": 45.5,
      "modules": [
        {
          "id": "uuid",
          "title": "Module Title",
          "type": "video",
          "order": 1,
          "duration": 1800,
          "is_completed": false,
          "files": [
            {
              "id": "uuid",
              "document_id": "uuid",
              "file_type": "video",
              "order": 1,
              "duration": 1800
            }
          ]
        }
      ],
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {...}
}
```

#### 25. POST /api/v1/courses
Create a new course.

**Request**:
```json
{
  "title": "Course Title",
  "description": "Course description",
  "thumbnail_id": "uuid",
  "collection_id": "uuid",
  "visibility": "private",
  "tags": ["tag1", "tag2"],
  "status": "draft"
}
```

#### 26. GET /api/v1/courses/:id
Get course details with modules and files.

#### 27. PUT /api/v1/courses/:id
Update course metadata.

#### 28. DELETE /api/v1/courses/:id
Delete a course.

#### 29. POST /api/v1/courses/:id/publish
Publish a course.

**Request**:
```json
{
  "make_public": true
}
```

#### 30. GET /api/v1/courses/:id/modules
List all modules in a course.

#### 31. POST /api/v1/courses/:id/modules
Create a new module in a course.

**Request**:
```json
{
  "title": "Module Title",
  "description": "Module description",
  "type": "video",
  "order": 1,
  "files": [
    {
      "document_id": "uuid",
      "file_type": "video",
      "order": 1
    }
  ]
}
```

#### 32. PUT /api/v1/courses/:course_id/modules/:module_id
Update module details.

#### 33. DELETE /api/v1/courses/:course_id/modules/:module_id
Delete a module.

#### 34. POST /api/v1/courses/:course_id/modules/:module_id/complete
Mark a module as completed.

#### 35. POST /api/v1/courses/:id/reorder-modules
Reorder modules in a course.

**Request**:
```json
{
  "module_ids": ["uuid1", "uuid2", "uuid3"]
}
```

---

### Notes & Highlights

#### 36. GET /api/v1/notes
List all notes with filtering and search.

**Query Parameters**:
- `page`: Integer
- `per_page`: Integer
- `search`: String
- `modality`: String (video, document, audio, course, general)
- `folder_id`: UUID
- `source_id`: UUID
- `tag`: String
- `is_favorite`: Boolean
- `is_pinned`: Boolean
- `sort_by`: String (created_at, updated_at, title, word_count)
- `order`: String (asc, desc)

**Response (200)**:
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Note Title",
      "content": "# Markdown content",
      "language": "en",
      "is_rtl": false,
      "modality": "document",
      "source_type": "document",
      "source_id": "uuid",
      "source_name": "Document Name",
      "source_timestamp": "04:32",
      "source_page_number": 5,
      "folder_id": "uuid",
      "tags": ["tag1", "tag2"],
      "is_favorite": false,
      "is_pinned": false,
      "word_count": 350,
      "reading_time": 2,
      "highlights": [
        {
          "id": "uuid",
          "text": "Highlighted text",
          "color": "yellow",
          "page_number": 5,
          "created_at": "2024-01-01T00:00:00Z"
        }
      ],
      "current_revision": 1,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {...}
}
```

#### 37. POST /api/v1/notes
Create a new note.

**Request**:
```json
{
  "title": "Note Title",
  "content": "# Markdown content",
  "language": "en",
  "is_rtl": false,
  "modality": "document",
  "source_type": "document",
  "source_id": "uuid",
  "source_name": "Document Name",
  "source_timestamp": "04:32",
  "source_page_number": 5,
  "folder_id": "uuid",
  "tags": ["tag1", "tag2"],
  "template_id": "uuid"
}
```

#### 38. GET /api/v1/notes/:id
Get a specific note with all revisions.

**Response (200)**:
```json
{
  "id": "uuid",
  "title": "Note Title",
  "content": "# Markdown content",
  "language": "en",
  "is_rtl": false,
  "modality": "document",
  "source_type": "document",
  "source_id": "uuid",
  "is_favorite": false,
  "is_pinned": false,
  "word_count": 350,
  "reading_time": 2,
  "highlights": [...],
  "revisions": [
    {
      "revision_number": 1,
      "title": "Note Title",
      "content": "Previous content",
      "word_count": 200,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "current_revision": 1,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

#### 39. PUT /api/v1/notes/:id
Update note content (creates new revision).

**Request**:
```json
{
  "title": "Updated Title",
  "content": "Updated markdown content",
  "language": "en",
  "tags": ["tag1", "tag2", "tag3"]
}
```

#### 40. DELETE /api/v1/notes/:id
Delete a note.

#### 41. POST /api/v1/notes/:id/favorite
Toggle favorite status.

#### 42. POST /api/v1/notes/:id/pin
Toggle pin status.

#### 43. GET /api/v1/notes/:id/revisions/:revision_number
Get a specific revision of a note.

#### 44. POST /api/v1/notes/:id/revisions/:revision_number/restore
Restore a note to a previous revision.

#### 45. POST /api/v1/notes/:id/highlights
Add a highlight to a note.

**Request**:
```json
{
  "text": "Highlighted text",
  "color": "yellow",
  "start_offset": 10,
  "end_offset": 30,
  "page_number": 5,
  "timestamp": "04:32"
}
```

#### 46. DELETE /api/v1/notes/:note_id/highlights/:highlight_id
Delete a highlight.

#### 47. GET /api/v1/note-folders
List all note folders.

**Response (200)**:
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Folder Name",
      "color": "#FF5733",
      "icon": "📁",
      "parent_id": "uuid",
      "note_count": 5,
      "order": 1,
      "is_expanded": true,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### 48. POST /api/v1/note-folders
Create a new note folder.

**Request**:
```json
{
  "name": "Folder Name",
  "color": "#FF5733",
  "icon": "📁",
  "parent_id": "uuid"
}
```

#### 49. PUT /api/v1/note-folders/:id
Update a folder.

#### 50. DELETE /api/v1/note-folders/:id
Delete a folder.

#### 51. GET /api/v1/note-templates
List all note templates.

**Response (200)**:
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Template Name",
      "description": "Template description",
      "content": "# Template with {{placeholder}}",
      "modality": "document",
      "icon": "📝",
      "is_custom": true,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### 52. POST /api/v1/note-templates
Create a note template.

#### 53. DELETE /api/v1/note-templates/:id
Delete a template.

---

### Learning & Focus Sessions

#### 54. GET /api/v1/sessions/learning
List all learning sessions.

**Query Parameters**:
- `page`: Integer
- `per_page`: Integer
- `course_id`: UUID
- `module_id`: UUID
- `document_id`: UUID
- `type`: String (reading, watching, listening, practicing, reviewing)
- `date_from`: ISO 8601 date
- `date_to`: ISO 8601 date

**Response (200)**:
```json
{
  "data": [
    {
      "id": "uuid",
      "course_id": "uuid",
      "module_id": "uuid",
      "document_id": "uuid",
      "type": "reading",
      "duration": 1800,
      "notes_created": 3,
      "highlights_created": 5,
      "is_focused": true,
      "mood_before": 4,
      "mood_after": 5,
      "retention_score": 85.5,
      "start_time": "2024-01-01T14:00:00Z",
      "end_time": "2024-01-01T14:30:00Z",
      "metadata": {...},
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {...}
}
```

#### 55. POST /api/v1/sessions/learning
Create a new learning session.

**Request**:
```json
{
  "course_id": "uuid",
  "module_id": "uuid",
  "document_id": "uuid",
  "type": "reading",
  "mood_before": 4,
  "goal": "Complete module and take notes"
}
```

#### 56. GET /api/v1/sessions/learning/:id
Get learning session details.

#### 57. PUT /api/v1/sessions/learning/:id
Update learning session (end session, add mood, etc.).

**Request**:
```json
{
  "mood_after": 5,
  "retention_score": 85.5,
  "notes_created": 3,
  "highlights_created": 5,
  "end_time": "2024-01-01T14:30:00Z"
}
```

#### 58. GET /api/v1/sessions/focus
List all focus sessions.

**Query Parameters**:
- `page`: Integer
- `per_page`: Integer
- `completed`: Boolean
- `date_from`: ISO 8601 date
- `date_to`: ISO 8601 date

**Response (200)**:
```json
{
  "data": [
    {
      "id": "uuid",
      "duration": 1500,
      "elapsed_time": 1200,
      "breaks_taken": 2,
      "total_break_time": 600,
      "goal": "Complete module review",
      "completed": true,
      "interruptions": 1,
      "focus_score": 92.5,
      "timezone": "UTC",
      "start_time": "2024-01-01T14:00:00Z",
      "end_time": "2024-01-01T14:30:00Z",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {...}
}
```

#### 59. POST /api/v1/sessions/focus
Start a new focus session.

**Request**:
```json
{
  "duration": 1500,
  "goal": "Complete module review"
}
```

#### 60. GET /api/v1/sessions/focus/:id
Get focus session details.

#### 61. PUT /api/v1/sessions/focus/:id
Update focus session (end session, add break, mark complete).

**Request**:
```json
{
  "elapsed_time": 1200,
  "breaks_taken": 2,
  "total_break_time": 600,
  "interruptions": 1,
  "completed": true,
  "end_time": "2024-01-01T14:30:00Z",
  "notes": "Good focus session, minimal distractions"
}
```

#### 62. GET /api/v1/preferences/focus
Get focus preferences.

**Response (200)**:
```json
{
  "id": "uuid",
  "default_duration": 25,
  "break_duration": 5,
  "long_break_duration": 15,
  "sessions_until_long_break": 4,
  "sound_enabled": true,
  "sound_type": "bell",
  "notification_type": "both",
  "auto_start_breaks": true,
  "hourly_goal": 50,
  "daily_goal": 2,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

#### 63. PUT /api/v1/preferences/focus
Update focus preferences.

**Request**:
```json
{
  "default_duration": 25,
  "break_duration": 5,
  "long_break_duration": 15,
  "sessions_until_long_break": 4,
  "sound_enabled": true,
  "sound_type": "bell",
  "notification_type": "both",
  "auto_start_breaks": true,
  "hourly_goal": 50,
  "daily_goal": 2
}
```

---

### Analytics & Statistics

#### 64. GET /api/v1/analytics/dashboard
Get dashboard analytics summary.

**Query Parameters**:
- `period`: String (7d, 30d, 90d, all)

**Response (200)**:
```json
{
  "total_minutes_learned": 12450,
  "courses_completed": 5,
  "modules_completed": 42,
  "notes_created": 156,
  "documents_processed": 23,
  "current_streak": 12,
  "longest_streak": 45,
  "total_focus_sessions": 89,
  "total_focus_minutes": 3600,
  "average_focus_score": 87.5,
  "storage_used_bytes": 5368709120,
  "learning_by_modality": {
    "video": 6000,
    "document": 3600,
    "audio": 1800,
    "course": 1050
  },
  "preferred_learning_time": "morning",
  "daily_averages": {
    "minutes": 180,
    "notes": 2.3,
    "focus_sessions": 1.5
  },
  "weekly_data": [
    {
      "date": "2024-01-01",
      "minutes_learned": 180,
      "focus_sessions": 2,
      "notes_created": 5,
      "mood_average": 4.2
    }
  ]
}
```

#### 65. GET /api/v1/analytics/progress
Get detailed learning progress.

**Query Parameters**:
- `period`: String (7d, 30d, 90d, all)
- `granularity`: String (daily, weekly, monthly)

**Response (200)**:
```json
{
  "data": [
    {
      "date": "2024-01-01",
      "minutes_learned": 180,
      "courses_completed_today": 1,
      "modules_completed_today": 3,
      "focus_sessions_completed": 2,
      "total_focus_minutes": 60,
      "notes_created_today": 5,
      "average_mood": 4.2,
      "documents_reviewed": 2
    }
  ],
  "summary": {
    "total_minutes": 12450,
    "average_daily_minutes": 180,
    "total_focus_minutes": 3600,
    "total_notes": 156,
    "days_active": 69
  }
}
```

#### 66. GET /api/v1/analytics/achievements
Get user achievements and progress.

**Response (200)**:
```json
{
  "achievements": [
    {
      "id": "uuid",
      "achievement_type": "streak",
      "title": "7-Day Learner",
      "description": "Maintain a 7-day learning streak",
      "icon": "🔥",
      "progress": 100.0,
      "is_unlocked": true,
      "unlocked_at": "2024-01-08T00:00:00Z"
    },
    {
      "id": "uuid",
      "achievement_type": "hours",
      "title": "100 Hours Master",
      "description": "Complete 100 hours of learning",
      "icon": "⏰",
      "progress": 67.3,
      "is_unlocked": false
    }
  ],
  "total_unlocked": 8,
  "total_achievements": 15
}
```

#### 67. GET /api/v1/analytics/stats
Get comprehensive user statistics.

**Response (200)**:
```json
{
  "id": "uuid",
  "total_minutes_learned": 12450,
  "courses_completed": 5,
  "modules_completed": 42,
  "notes_created": 156,
  "documents_processed": 23,
  "current_streak": 12,
  "longest_streak": 45,
  "total_focus_sessions": 89,
  "total_focus_minutes": 3600,
  "average_focus_score": 87.5,
  "preferred_learning_time": "morning",
  "preferred_modality": ["video", "document"],
  "storage_used_bytes": 5368709120,
  "updated_at": "2024-01-01T00:00:00Z"
}
```

#### 68. GET /api/v1/analytics/notes-stats
Get detailed notes statistics.

**Response (200)**:
```json
{
  "total_notes": 156,
  "total_words": 45230,
  "total_highlights": 428,
  "storage_used_bytes": 2147483648,
  "last_backup": "2024-01-01T00:00:00Z",
  "notes_by_modality": {
    "video": 45,
    "document": 78,
    "audio": 18,
    "course": 12,
    "general": 3
  },
  "notes_by_folder": {
    "folder-uuid-1": 45,
    "folder-uuid-2": 78
  },
  "average_words_per_note": 290,
  "recent_searches": ["python", "javascript", "ui design"]
}
```

---

### Synchronization & Backup

#### 69. POST /api/v1/sync
Synchronize local data with cloud backend.

**Request**:
```json
{
  "last_sync": "2024-01-01T00:00:00Z",
  "changes": {
    "documents": [{"id": "uuid", "action": "create|update|delete", "data": {...}}],
    "notes": [{"id": "uuid", "action": "create|update|delete", "data": {...}}],
    "courses": []
  }
}
```

**Response (200)**:
```json
{
  "synced": true,
  "timestamp": "2024-01-01T00:00:00Z",
  "remote_changes": {
    "documents": [],
    "notes": [],
    "courses": []
  },
  "conflicts": []
}
```

#### 70. GET /api/v1/sync/status
Get synchronization status.

**Response (200)**:
```json
{
  "last_sync": "2024-01-01T00:00:00Z",
  "is_syncing": false,
  "pending_items": 0,
  "sync_enabled": true,
  "cloud_storage_available": true
}
```

#### 71. POST /api/v1/backup/create
Create a backup of all data.

**Response (200)**:
```json
{
  "backup_id": "uuid",
  "timestamp": "2024-01-01T00:00:00Z",
  "size_bytes": 2147483648,
  "status": "completed"
}
```

#### 72. GET /api/v1/backup/list
List all available backups.

**Response (200)**:
```json
{
  "backups": [
    {
      "backup_id": "uuid",
      "timestamp": "2024-01-01T00:00:00Z",
      "size_bytes": 2147483648,
      "status": "completed"
    }
  ]
}
```

#### 73. POST /api/v1/backup/:id/restore
Restore from a backup.

---

### Search & Discovery

#### 74. GET /api/v1/search
Advanced full-text search across all resources.

**Query Parameters**:
- `q`: String (search query)
- `type`: String (document, note, course, all)
- `modality`: String (video, document, audio, course)
- `date_from`: ISO 8601 date
- `date_to`: ISO 8601 date
- `tags`: Array<String>

**Response (200)**:
```json
{
  "results": {
    "documents": [...],
    "notes": [...],
    "courses": [...]
  },
  "total_count": 45
}
```

#### 75. GET /api/v1/trending
Get trending resources and topics.

**Response (200)**:
```json
{
  "trending_tags": ["python", "javascript", "ui design"],
  "trending_courses": [...],
  "trending_documents": [...],
  "trending_topics": [...]
}
```

---

### Tags & Metadata

#### 76. GET /api/v1/tags
List all tags.

**Response (200)**:
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "python",
      "color": "#3776AB",
      "usage_count": 45
    }
  ]
}
```

#### 77. POST /api/v1/tags
Create a new tag.

**Request**:
```json
{
  "name": "python",
  "color": "#3776AB"
}
```

#### 78. PUT /api/v1/tags/:id
Update a tag.

#### 79. DELETE /api/v1/tags/:id
Delete a tag.

#### 80. GET /api/v1/tags/:id/usage
Get all resources using a specific tag.

---

### Export & Import

#### 81. POST /api/v1/export
Export user data in various formats.

**Request**:
```json
{
  "resources": ["documents", "notes", "courses", "sessions", "stats"],
  "format": "json|csv|zip|pdf",
  "include_files": true,
  "date_from": "2024-01-01",
  "date_to": "2024-12-31"
}
```

**Response (200)**: Binary file or JSON with download link.

#### 82. POST /api/v1/import
Import data from backup or external source.

**Content-Type**: application/json or multipart/form-data

**Request**:
```json
{
  "source": "backup|external",
  "format": "json|csv|zip",
  "merge_strategy": "merge|replace|skip_duplicates"
}
```

#### 83. POST /api/v1/notes/export
Export notes in specific format.

**Request**:
```json
{
  "note_ids": ["uuid1", "uuid2"],
  "format": "markdown|pdf|html|json",
  "include_highlights": true,
  "include_metadata": true
}
```

---

### File Storage & Processing

#### 84. GET /api/v1/storage/quota
Get storage quota and usage information.

**Response (200)**:
```json
{
  "quota_bytes": 5368709120,
  "used_bytes": 2147483648,
  "available_bytes": 3221225472,
  "usage_percent": 40.0,
  "breakdown": {
    "documents": 1610612736,
    "notes_and_highlights": 268435456,
    "thumbnails": 268435456
  }
}
```

#### 85. POST /api/v1/files/process
Process a file (generate thumbnail, extract metadata, OCR, etc.).

**Request**:
```json
{
  "document_id": "uuid",
  "operations": ["generate_thumbnail", "extract_metadata", "ocr"]
}
```

**Response (202)**: Accepted (async processing)
```json
{
  "task_id": "uuid",
  "status": "processing"
}
```

#### 86. GET /api/v1/files/process/:task_id/status
Get file processing status.

**Response (200)**:
```json
{
  "task_id": "uuid",
  "status": "completed|processing|failed",
  "progress": 75,
  "results": {
    "thumbnail_url": "https://...",
    "metadata": {...},
    "text_content": "Extracted text..."
  }
}
```

#### 87. POST /api/v1/files/:id/thumbnail
Generate or update thumbnail for a document.

---

### Sharing & Collaboration (Future)

#### 88. POST /api/v1/documents/:id/share
Create a share link for a document.

**Request**:
```json
{
  "expiration": "7d|30d|90d|never",
  "permission": "view|comment|edit",
  "password": "optional_password"
}
```

#### 89. GET /api/v1/collections/:id/share
Share a collection.

#### 90. POST /api/v1/notes/:id/publish
Publish a note publicly.

---

## Error Handling

All endpoints follow standard HTTP status codes:

- **200**: Success
- **201**: Created
- **202**: Accepted (async operations)
- **204**: No Content
- **400**: Bad Request (validation error)
- **401**: Unauthorized (authentication required)
- **403**: Forbidden (permission denied)
- **404**: Not Found
- **409**: Conflict (duplicate resource, version mismatch)
- **422**: Unprocessable Entity (semantic error)
- **429**: Too Many Requests (rate limiting)
- **500**: Internal Server Error
- **503**: Service Unavailable

### Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable error message",
    "details": [
      {
        "field": "email",
        "message": "Email is invalid",
        "code": "INVALID_EMAIL"
      }
    ],
    "request_id": "uuid",
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

---

## Rate Limiting

API implements rate limiting per user:

- **Default**: 100 requests per minute
- **Upload**: 10 uploads per minute
- **Search**: 30 requests per minute
- **Background Jobs**: 50 per hour

Rate limit info in response headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1704067200
```

---

## Pagination

List endpoints support cursor-based pagination:

**Query Parameters**:
- `page`: Page number (1-indexed)
- `per_page`: Items per page (default: 20, max: 100)
- `cursor`: Cursor for pagination (optional)

**Response**:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 500,
    "pages": 25,
    "next_cursor": "cursor-string",
    "has_more": true
  }
}
```

---

## Caching Strategy

- **Client-side**: Cache for 1 hour (or until explicit refresh)
- **Server-side**: Cache search results (5 minutes), aggregations (1 hour)
- **ETags**: All endpoints support ETag-based caching

---

## Security Requirements

1. **Authentication**: JWT tokens with expiration
2. **Authorization**: Role-based access control (RBAC)
3. **HTTPS**: All communication must be encrypted
4. **CORS**: Configured for Tauri desktop app
5. **CSRF**: Token-based protection for state-changing operations
6. **Password**: Minimum 8 characters, bcrypt hashing
7. **File Upload**: Virus scanning, type validation, size limits
8. **Data Encryption**: End-to-end encryption for sensitive fields (optional)
9. **SQL Injection**: Parameterized queries only
10. **Rate Limiting**: Per IP and per user

---

## Database Schema Generation

SQLite will be initialized with the following migrations:

1. **Users table**: Authentication and profiles
2. **Documents table**: File metadata and references
3. **Collections table**: Organizational structure
4. **Courses table**: Learning paths
5. **CourseModules table**: Course structure
6. **ModuleFiles table**: File relationships
7. **Notes table**: Note content and metadata
8. **NoteRevisions table**: Version history
9. **TextHighlights table**: Highlights within notes
10. **NoteFolders table**: Note organization
11. **NoteTemplates table**: Reusable templates
12. **Tags table**: Tag definitions
13. **Learningsessions table**: Activity tracking
14. **FocusSessions table**: Focus timer data
15. **FocusPreferences table**: User preferences
16. **UserStats table**: Aggregated statistics
17. **LearningProgress table**: Daily progress
18. **Achievements table**: Gamification
19. **NotesStats table**: Detailed notes statistics

---

## Deployment Architecture

For Tauri + Python backend:

```
Learning Manager (Tauri App)
    ↓
    ├─ Local Frontend (React)
    ├─ Local SQLite Database
    └─ Tauricommand handlers (IPC)
        ↓
    Python Backend (FastAPI/Flask)
        ├─ API endpoints
        ├─ File processing
        ├─ Background tasks (Celery)
        └─ Optional: Cloud sync/backup
```

The Tauri app communicates with Python backend via:
1. **Local IPC** (Tauri invoke/listen)
2. **HTTP API** (when backend is exposed)
3. **WebSocket** (for real-time updates, optional)

---

## Future Enhancements

1. **Collaboration**: Real-time multi-user editing
2. **AI Integration**: Smart note suggestions, content recommendations
3. **Mobile Sync**: iOS/Android app with cloud sync
4. **Advanced Search**: Semantic search with embeddings
5. **Content Recommendations**: ML-based suggestions
6. **Offline-first Sync**: Automatic conflict resolution
7. **Encryption**: E2E encryption for sensitive data
8. **API Webhooks**: Event-driven integrations
9. **Third-party Integrations**: Notion, Obsidian, Evernote import
10. **Analytics Dashboard**: Team usage analytics (for multi-user)

