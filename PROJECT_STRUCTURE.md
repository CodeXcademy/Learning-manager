# Onyx Stream - Project Structure

## Overview

**Onyx Stream** is a local-first personal learning management system built with React 19, TypeScript, and Vite. It enables users to organize, consume, and take notes on educational content (videos, documents, audio) entirely offline using browser localStorage.

### Key Principles
- **Local-First**: All data persisted in localStorage, no backend required
- **Bilingual**: Full English and Arabic (RTL) support throughout
- **Multi-Modal**: Supports video, document, audio, and mixed content types
- **Gamified**: Streaks, achievements, and progress tracking

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React 19 + TypeScript |
| Bundler | Vite 6 |
| Styling | Tailwind CSS 4 |
| Animation | Motion (Framer Motion) |
| Icons | Lucide React |
| Video Player | Vidstack |
| PDF Viewer | react-pdf |
| Markdown Editor | @uiw/react-md-editor |
| Markdown Rendering | react-markdown + remark-gfm |

---

## Directory Structure

```
/
├── src/
│   ├── App.tsx                 # Main app with sidebar navigation
│   ├── main.tsx                # React entry point
│   ├── index.css               # Global styles + Tailwind + MD Editor theme
│   │
│   ├── store/
│   │   ├── DataContext.tsx     # React Context for global state management
│   │   └── localDataStore.ts   # TypeScript types + localStorage utilities
│   │
│   ├── hooks/
│   │   └── useLocalStorage.ts  # Custom hook for localStorage persistence
│   │
│   └── [Views]
│       ├── DashboardView.tsx   # Home dashboard with stats & quick actions
│       ├── LibraryView.tsx     # Browse courses and content library
│       ├── RoadmapView.tsx     # Learning path / roadmap visualization
│       ├── CoursePlayerView.tsx# Video player with notes panel
│       ├── DocumentReaderView.tsx # PDF/document reader
│       ├── ContentManageView.tsx  # Create/edit courses and modules
│       ├── AnalyticsView.tsx   # Detailed learning analytics & gamification
│       └── NotesView.tsx       # Full-featured notes management
│
├── index.html                  # HTML entry point
├── package.json                # Dependencies and scripts
├── vite.config.ts              # Vite configuration
├── tsconfig.json               # TypeScript configuration
└── PROJECT_STRUCTURE.md        # This file
```

---

## Core Data Models

### Content Types

| Model | Description |
|-------|-------------|
| `LocalFile` | Individual media file (video, PDF, audio, image) |
| `Collection` | Folder/category for organizing files |
| `Course` | Structured learning content with modules |
| `CourseModule` | Single lesson containing one or more files |
| `ModuleFile` | Individual file within a module |

### Notes System

| Model | Description |
|-------|-------------|
| `Note` | Markdown note with source linking, highlights, folders |
| `NoteFolder` | Hierarchical folder organization |
| `NoteRevision` | Version history entry (max 10 per note) |
| `NoteTemplate` | Pre-built or custom note templates |
| `TextHighlight` | Color-coded text highlight with timestamp/page |
| `NotesStats` | Analytics for notes (counts, storage, searches) |

### User & Progress

| Model | Description |
|-------|-------------|
| `UserStats` | Streaks, total time, achievements, scores |
| `LearningProgress` | Daily learning minutes and completions |
| `Achievement` | Gamification badges with progress tracking |
| `LearningSession` | Individual study session data |

---

## Views / Screens

### 1. Dashboard (`DashboardView.tsx`)
- Learning streak and daily goal progress
- Quick stats cards (time, courses, streak)
- Continue learning section
- Weekly progress chart
- Quick actions (Notes, Analytics)
- Recent achievements

### 2. Library (`LibraryView.tsx`)
- Browse all courses and files
- Filter by collection, tags, type
- Grid/list view toggle
- Search functionality
- Course cards with progress indicators

### 3. Roadmap (`RoadmapView.tsx`)
- Visual learning path
- Milestone tracking
- Course dependencies
- Progress visualization

### 4. Course Player (`CoursePlayerView.tsx`)
- Vidstack video player
- Module sidebar with completion status
- Integrated notes panel with markdown editor
- Transcript/overview tabs

### 5. Document Reader (`DocumentReaderView.tsx`)
- PDF rendering with react-pdf
- Page navigation
- Zoom controls
- Note-taking integration

### 6. Content Manager (`ContentManageView.tsx`)
- Create/edit courses
- Drag-and-drop module ordering
- Multi-file module support
- Thumbnail management

### 7. Analytics (`AnalyticsView.tsx`)
- Time spent tracking
- Quality/consistency/velocity scores
- Content type breakdown
- Peak hours analysis
- Monthly trends
- Achievement showcase

### 8. Notes (`NotesView.tsx`)
- Full markdown editor with preview
- RTL/LTR language support
- Folder organization
- Version history (10 revisions)
- Templates (Video Notes, Book Summary, Cornell, etc.)
- Bulk actions (move, delete)
- Import/export (JSON, Markdown)
- Storage usage indicator
- Recent searches
- Color-coded highlights

---

## State Management

Uses React Context (`DataContext.tsx`) with `useLocalStorage` hook for persistence.

### Storage Keys
```typescript
STORAGE_KEYS = {
  FILES: 'onyx_stream_files',
  COLLECTIONS: 'onyx_stream_collections',
  COURSES: 'onyx_stream_courses',
  TAGS: 'onyx_stream_tags',
  USER_STATS: 'onyx_stream_user_stats',
  SETTINGS: 'onyx_stream_settings',
  NOTES: 'onyx_stream_notes',
  NOTE_FOLDERS: 'onyx_stream_note_folders',
  NOTE_REVISIONS: 'onyx_stream_note_revisions',
  NOTE_TEMPLATES: 'onyx_stream_note_templates',
  NOTES_STATS: 'onyx_stream_notes_stats',
}
```

### Context Operations

**Files & Courses**
- `addFile`, `updateFile`, `deleteFile`
- `addCourse`, `updateCourse`, `deleteCourse`
- `addModule`, `updateModule`, `deleteModule`

**Notes**
- `addNote`, `updateNote`, `deleteNote`
- `saveNoteRevision`, `restoreNoteRevision`
- `addNoteFolder`, `moveNoteToFolder`
- `createNoteFromTemplate`
- `bulkDeleteNotes`, `bulkMoveNotes`
- `exportAllNotesToJson`, `importNotesFromJson`

**Analytics**
- `logLearningTime`
- `updateUserStats`
- `updateNotesStats`

---

## Design System

### Color Palette (Dark Theme - "Obsidian")
- **Background**: `#111317` (near-black)
- **Surface**: `#1e2024` (card backgrounds)
- **Primary**: `#a4e6ff` (cyan accent)
- **Tertiary**: `#ff7eb3` (pink accent)
- **On-Surface**: `#e4e7eb` (text)
- **Outline**: `#6b7280` (borders)

### Typography
- **Headlines**: Manrope (700 weight)
- **Body**: Inter (400-500 weight)

### Animations
- Motion library for page transitions
- Staggered list animations
- Hover effects on cards

---

## Scripts

```bash
npm run dev      # Start dev server on port 3000
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # TypeScript type checking
npm run clean    # Remove dist folder
```

---

## Future Enhancements

- [ ] Cloud sync option (optional)
- [ ] Spaced repetition system
- [ ] Quiz/flashcard module type
- [ ] AI-powered summaries
- [ ] Mobile responsive refinements
- [ ] PWA offline support
- [ ] File system access API for true local files
