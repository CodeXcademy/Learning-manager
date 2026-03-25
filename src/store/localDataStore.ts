// Types for local-first learning resource management
// Version 2.0 - Multi-file module support

export interface LocalFile {
  id: string;
  name: string;
  path: string; // Local file path
  size: number;
  type: string;
  mimeType: string;
  dateAdded: string;
  lastModified: string;
  tags: string[];
  collectionId?: string;
  thumbnail?: string;
  duration?: string; // For video/audio files
  pageCount?: number; // For documents
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  color: string;
  itemCount: number;
  thumbnail?: string;
  dateCreated: string;
  lastModified: string;
}

export interface ModuleFile {
  id: string;
  name: string;
  path: string;
  type: 'video' | 'document' | 'audio' | 'image' | 'other';
  size?: number;
  duration?: string;
  order: number;
}

export interface CourseModule {
  id: string;
  title: string;
  description?: string;
  type: 'video' | 'document' | 'quiz' | 'audio' | 'mixed'; // 'mixed' for modules with multiple file types
  files: ModuleFile[]; // Multiple files per module
  // Legacy single file support (for backwards compatibility)
  fileId?: string;
  filePath?: string;
  duration?: string;
  order: number;
  completed?: boolean;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  thumbnailPath?: string; // Local thumbnail path
  visibility: 'private' | 'public';
  collectionId?: string;
  tags: string[];
  modules: CourseModule[];
  status: 'draft' | 'published';
  dateCreated: string;
  lastModified: string;
  totalDuration?: string;
  progress?: number; // 0-100
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface LearningProgress {
  date: string;
  minutesLearned: number;
  coursesCompleted: number;
  modulesCompleted: number;
}

export interface UserStats {
  currentStreak: number;
  longestStreak: number;
  totalMinutesLearned: number;
  totalCoursesCompleted: number;
  dailyGoalMinutes: number;
  weeklyProgress: LearningProgress[];
  lastActiveDate: string;
}

// Default tags for the application
export const defaultTags: Tag[] = [
  { id: '1', name: 'Design', color: 'bg-purple-500/20 text-purple-400' },
  { id: '2', name: 'Development', color: 'bg-blue-500/20 text-blue-400' },
  { id: '3', name: 'Business', color: 'bg-green-500/20 text-green-400' },
  { id: '4', name: 'Marketing', color: 'bg-pink-500/20 text-pink-400' },
  { id: '5', name: 'Productivity', color: 'bg-orange-500/20 text-orange-400' },
  { id: '6', name: 'AI & ML', color: 'bg-cyan-500/20 text-cyan-400' },
];

// Storage keys
export const STORAGE_KEYS = {
  FILES: 'onyx_stream_files',
  COLLECTIONS: 'onyx_stream_collections',
  COURSES: 'onyx_stream_courses',
  TAGS: 'onyx_stream_tags',
  USER_STATS: 'onyx_stream_user_stats',
  SETTINGS: 'onyx_stream_settings',
} as const;

// Helper to generate unique IDs
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Helper to format file size
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
}

// Helper to get file type category
export function getFileCategory(mimeType: string): 'video' | 'audio' | 'document' | 'image' | 'archive' | 'other' {
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text') || mimeType.includes('epub')) return 'document';
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z') || mimeType.includes('tar')) return 'archive';
  return 'other';
}

// Helper to format duration from seconds
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

// Default initial data
export const defaultCollections: Collection[] = [
  { 
    id: 'col-1', 
    name: 'Productivity Workflow', 
    description: 'Tools and techniques for better productivity', 
    color: 'bg-blue-500', 
    itemCount: 0, 
    dateCreated: new Date().toISOString(),
    lastModified: new Date().toISOString()
  },
  { 
    id: 'col-2', 
    name: 'Design Systems 101', 
    description: 'Learn design system fundamentals', 
    color: 'bg-purple-500', 
    itemCount: 0,
    dateCreated: new Date().toISOString(),
    lastModified: new Date().toISOString()
  },
  { 
    id: 'col-3', 
    name: 'Fullstack Mastery', 
    description: 'Complete fullstack development course', 
    color: 'bg-green-500', 
    itemCount: 0,
    dateCreated: new Date().toISOString(),
    lastModified: new Date().toISOString()
  },
];

export const defaultUserStats: UserStats = {
  currentStreak: 0,
  longestStreak: 0,
  totalMinutesLearned: 0,
  totalCoursesCompleted: 0,
  dailyGoalMinutes: 60,
  weeklyProgress: [],
  lastActiveDate: new Date().toISOString().split('T')[0],
};

// Initialize storage with defaults if empty
export function initializeStorage(): void {
  if (!localStorage.getItem(STORAGE_KEYS.TAGS)) {
    localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(defaultTags));
  }
  if (!localStorage.getItem(STORAGE_KEYS.COLLECTIONS)) {
    localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(defaultCollections));
  }
  if (!localStorage.getItem(STORAGE_KEYS.USER_STATS)) {
    localStorage.setItem(STORAGE_KEYS.USER_STATS, JSON.stringify(defaultUserStats));
  }
  if (!localStorage.getItem(STORAGE_KEYS.FILES)) {
    localStorage.setItem(STORAGE_KEYS.FILES, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.COURSES)) {
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify([]));
  }
}
