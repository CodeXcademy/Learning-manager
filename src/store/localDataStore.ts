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

// Notes and Highlights Types
export type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink' | 'purple' | 'orange';
export type NoteLanguage = 'en' | 'ar' | 'auto';
export type ContentModality = 'video' | 'document' | 'audio' | 'course' | 'general';

export interface TextHighlight {
  id: string;
  text: string;
  color: HighlightColor;
  startOffset?: number;
  endOffset?: number;
  pageNumber?: number; // For PDFs
  timestamp?: string; // For videos (e.g., "04:32")
  createdAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string; // Markdown content
  language: NoteLanguage;
  isRTL: boolean;
  modality: ContentModality;
  // Source reference
  sourceType: 'course' | 'module' | 'file' | 'standalone';
  sourceId?: string;
  sourceName?: string;
  sourceTimestamp?: string; // For video notes
  sourcePageNumber?: number; // For document notes
  // Highlights within this note or from source
  highlights: TextHighlight[];
  // Organization
  tags: string[];
  collectionId?: string;
  isFavorite: boolean;
  isPinned: boolean;
  // Metadata
  createdAt: string;
  updatedAt: string;
  wordCount: number;
  readingTime: number; // minutes
}

export interface NoteFolder {
  id: string;
  name: string;
  color: string;
  parentId?: string;
  noteCount: number;
  createdAt: string;
}

export interface NoteExportOptions {
  format: 'markdown' | 'pdf' | 'html' | 'json';
  includeHighlights: boolean;
  includeMetadata: boolean;
  includeSourceLinks: boolean;
}

// Highlight color configurations
export const highlightColors: Record<HighlightColor, { bg: string; text: string; border: string; name: string; nameAr: string }> = {
  yellow: { bg: 'bg-yellow-500/20', text: 'text-yellow-300', border: 'border-yellow-500/50', name: 'Yellow', nameAr: 'اصفر' },
  green: { bg: 'bg-green-500/20', text: 'text-green-300', border: 'border-green-500/50', name: 'Green', nameAr: 'اخضر' },
  blue: { bg: 'bg-blue-500/20', text: 'text-blue-300', border: 'border-blue-500/50', name: 'Blue', nameAr: 'ازرق' },
  pink: { bg: 'bg-pink-500/20', text: 'text-pink-300', border: 'border-pink-500/50', name: 'Pink', nameAr: 'وردي' },
  purple: { bg: 'bg-purple-500/20', text: 'text-purple-300', border: 'border-purple-500/50', name: 'Purple', nameAr: 'بنفسجي' },
  orange: { bg: 'bg-orange-500/20', text: 'text-orange-300', border: 'border-orange-500/50', name: 'Orange', nameAr: 'برتقالي' },
};

// Enhanced analytics types
export interface LearningSession {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number; // minutes
  courseId?: string;
  moduleId?: string;
  contentType: 'video' | 'document' | 'audio' | 'quiz' | 'mixed';
  quality: 'focused' | 'distracted' | 'casual'; // self-reported or inferred
  notes?: string;
}

export interface ContentStats {
  totalVideosWatched: number;
  totalDocumentsRead: number;
  totalAudioListened: number;
  totalQuizzesTaken: number;
  videoMinutes: number;
  documentMinutes: number;
  audioMinutes: number;
  quizMinutes: number;
}

export interface TimeDistribution {
  morning: number; // 6am-12pm
  afternoon: number; // 12pm-6pm
  evening: number; // 6pm-10pm
  night: number; // 10pm-6am
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  requirement: number;
  progress: number;
  unlockedAt?: string;
  category: 'streak' | 'time' | 'completion' | 'quality' | 'special';
}

export interface MonthlyStats {
  month: string; // YYYY-MM
  totalMinutes: number;
  totalSessions: number;
  coursesCompleted: number;
  modulesCompleted: number;
  avgSessionLength: number;
  avgQuality: number; // 0-100
  bestDay: string;
  bestDayMinutes: number;
}

export interface UserStats {
  currentStreak: number;
  longestStreak: number;
  totalMinutesLearned: number;
  totalCoursesCompleted: number;
  totalModulesCompleted: number;
  dailyGoalMinutes: number;
  weeklyProgress: LearningProgress[];
  lastActiveDate: string;
  // Enhanced analytics
  sessions: LearningSession[];
  contentStats: ContentStats;
  timeDistribution: TimeDistribution;
  achievements: Achievement[];
  monthlyStats: MonthlyStats[];
  qualityScore: number; // 0-100, calculated from focus time
  consistencyScore: number; // 0-100, based on regularity
  velocityScore: number; // 0-100, learning speed
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
  NOTES: 'onyx_stream_notes',
  NOTE_FOLDERS: 'onyx_stream_note_folders',
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

// Helper to detect RTL text (Arabic, Hebrew, Persian, Urdu)
export function detectRTL(text: string): boolean {
  const rtlChars = /[\u0591-\u07FF\u200F\u202B\u202E\uFB1D-\uFDFD\uFE70-\uFEFC]/;
  const ltrChars = /[A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02B8]/;
  
  const rtlCount = (text.match(rtlChars) || []).length;
  const ltrCount = (text.match(ltrChars) || []).length;
  
  return rtlCount > ltrCount;
}

// Helper to detect language from text
export function detectLanguage(text: string): 'en' | 'ar' | 'auto' {
  const arabicChars = /[\u0600-\u06FF]/;
  const arabicCount = (text.match(arabicChars) || []).length;
  
  if (arabicCount > text.length * 0.3) {
    return 'ar';
  }
  return 'en';
}

// Helper to calculate reading time (words per minute)
export function calculateReadingTime(text: string, wpm: number = 200): number {
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / wpm));
}

// Helper to count words (supports Arabic and English)
export function countWords(text: string): number {
  // Remove markdown syntax
  const cleanText = text
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*|__/g, '')
    .replace(/\*|_/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`{1,3}[^`]*`{1,3}/g, '')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '');
  
  return cleanText.trim().split(/\s+/).filter(Boolean).length;
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

// Default achievements
export const defaultAchievements: Achievement[] = [
  { id: 'streak-7', title: 'Week Warrior', description: 'Maintain a 7-day learning streak', icon: 'flame', color: 'orange', requirement: 7, progress: 0, category: 'streak' },
  { id: 'streak-30', title: 'Monthly Master', description: 'Maintain a 30-day learning streak', icon: 'calendar', color: 'purple', requirement: 30, progress: 0, category: 'streak' },
  { id: 'time-10h', title: 'Dedicated Learner', description: 'Accumulate 10 hours of learning', icon: 'clock', color: 'blue', requirement: 600, progress: 0, category: 'time' },
  { id: 'time-50h', title: 'Knowledge Seeker', description: 'Accumulate 50 hours of learning', icon: 'brain', color: 'cyan', requirement: 3000, progress: 0, category: 'time' },
  { id: 'time-100h', title: 'Centurion', description: 'Accumulate 100 hours of learning', icon: 'trophy', color: 'gold', requirement: 6000, progress: 0, category: 'time' },
  { id: 'complete-1', title: 'First Steps', description: 'Complete your first course', icon: 'flag', color: 'green', requirement: 1, progress: 0, category: 'completion' },
  { id: 'complete-5', title: 'Course Collector', description: 'Complete 5 courses', icon: 'books', color: 'indigo', requirement: 5, progress: 0, category: 'completion' },
  { id: 'complete-10', title: 'Graduation Day', description: 'Complete 10 courses', icon: 'graduation', color: 'pink', requirement: 10, progress: 0, category: 'completion' },
  { id: 'quality-focused', title: 'Deep Focus', description: 'Complete 10 focused learning sessions', icon: 'target', color: 'red', requirement: 10, progress: 0, category: 'quality' },
  { id: 'early-bird', title: 'Early Bird', description: 'Complete 5 morning learning sessions', icon: 'sun', color: 'yellow', requirement: 5, progress: 0, category: 'special' },
  { id: 'night-owl', title: 'Night Owl', description: 'Complete 5 evening learning sessions', icon: 'moon', color: 'slate', requirement: 5, progress: 0, category: 'special' },
  { id: 'speed-demon', title: 'Speed Learner', description: 'Complete a course in one day', icon: 'zap', color: 'amber', requirement: 1, progress: 0, category: 'special' },
];

export const defaultUserStats: UserStats = {
  currentStreak: 0,
  longestStreak: 0,
  totalMinutesLearned: 0,
  totalCoursesCompleted: 0,
  totalModulesCompleted: 0,
  dailyGoalMinutes: 60,
  weeklyProgress: [],
  lastActiveDate: new Date().toISOString().split('T')[0],
  // Enhanced analytics defaults
  sessions: [],
  contentStats: {
    totalVideosWatched: 0,
    totalDocumentsRead: 0,
    totalAudioListened: 0,
    totalQuizzesTaken: 0,
    videoMinutes: 0,
    documentMinutes: 0,
    audioMinutes: 0,
    quizMinutes: 0,
  },
  timeDistribution: {
    morning: 0,
    afternoon: 0,
    evening: 0,
    night: 0,
  },
  achievements: defaultAchievements,
  monthlyStats: [],
  qualityScore: 0,
  consistencyScore: 0,
  velocityScore: 0,
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
  if (!localStorage.getItem(STORAGE_KEYS.NOTES)) {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.NOTE_FOLDERS)) {
    localStorage.setItem(STORAGE_KEYS.NOTE_FOLDERS, JSON.stringify([]));
  }
}
