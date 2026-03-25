import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import {
  LocalFile,
  Collection,
  Course,
  Tag,
  UserStats,
  Note,
  NoteFolder,
  NoteRevision,
  NoteTemplate,
  NotesStats,
  TextHighlight,
  ContentModality,
  FocusSession,
  FocusState,
  FocusPreferences,
  STORAGE_KEYS,
  defaultTags,
  defaultCollections,
  defaultUserStats,
  defaultNoteTemplates,
  defaultNotesStats,
  generateId,
  initializeStorage,
  detectRTL,
  detectLanguage,
  countWords,
  calculateReadingTime,
  calculateNotesStorageSize,
} from './localDataStore';

interface DataContextType {
  // Files
  files: LocalFile[];
  addFile: (file: Omit<LocalFile, 'id' | 'dateAdded' | 'lastModified'>) => LocalFile;
  updateFile: (id: string, updates: Partial<LocalFile>) => void;
  deleteFile: (id: string) => void;
  getFilesByCollection: (collectionId: string) => LocalFile[];
  getFilesByTag: (tagId: string) => LocalFile[];
  
  // Collections
  collections: Collection[];
  addCollection: (collection: Omit<Collection, 'id' | 'itemCount' | 'dateCreated' | 'lastModified'>) => Collection;
  updateCollection: (id: string, updates: Partial<Collection>) => void;
  deleteCollection: (id: string) => void;
  
  // Courses
  courses: Course[];
  addCourse: (course: Omit<Course, 'id' | 'dateCreated' | 'lastModified'>) => Course;
  updateCourse: (id: string, updates: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  getCoursesByCollection: (collectionId: string) => Course[];
  
  // Tags
  tags: Tag[];
  addTag: (tag: Omit<Tag, 'id'>) => Tag;
  updateTag: (id: string, updates: Partial<Tag>) => void;
  deleteTag: (id: string) => void;
  
  // User Stats
  userStats: UserStats;
  updateUserStats: (updates: Partial<UserStats>) => void;
  logLearningTime: (minutes: number) => void;
  
  // Search
  searchContent: (query: string) => { files: LocalFile[]; courses: Course[]; collections: Collection[]; notes: Note[] };

  // Focus timer (Pomodoro)
  focusState: FocusState;
  setFocusState: (nextState: FocusState | ((prev: FocusState) => FocusState)) => void;
  logFocusSession: (session: FocusSession) => void;
  updateFocusPreferences: (updates: Partial<FocusPreferences>) => void;
  resetFocusState: () => void;
  startFocusSession: (mode?: 'work' | 'shortBreak' | 'longBreak') => void;
  pauseFocusSession: () => void;
  resumeFocusSession: () => void;
  stopFocusSession: () => void;
  
  // Notes
  notes: Note[];
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'wordCount' | 'readingTime'>) => Note;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  getNotesBySource: (sourceType: string, sourceId: string) => Note[];
  getNotesByModality: (modality: string) => Note[];
  addHighlightToNote: (noteId: string, highlight: Omit<TextHighlight, 'id' | 'createdAt'>) => void;
  removeHighlightFromNote: (noteId: string, highlightId: string) => void;
  exportNoteToMarkdown: (noteId: string) => string;
  
  // Note Folders
  noteFolders: NoteFolder[];
  addNoteFolder: (folder: Omit<NoteFolder, 'id' | 'noteCount' | 'createdAt' | 'updatedAt' | 'order'>) => NoteFolder;
  updateNoteFolder: (id: string, updates: Partial<NoteFolder>) => void;
  deleteNoteFolder: (id: string) => void;
  getNotesByFolder: (folderId: string) => Note[];
  moveNoteToFolder: (noteId: string, folderId: string | undefined) => void;
  reorderFolders: (folderIds: string[]) => void;
  
  // Note Revisions (Version History)
  noteRevisions: NoteRevision[];
  saveNoteRevision: (noteId: string) => void;
  restoreNoteRevision: (noteId: string, revisionId: string) => void;
  getNoteRevisions: (noteId: string) => NoteRevision[];
  deleteOldRevisions: (noteId: string, keepCount: number) => void;
  
  // Note Templates
  noteTemplates: NoteTemplate[];
  addNoteTemplate: (template: Omit<NoteTemplate, 'id' | 'createdAt' | 'isCustom'>) => NoteTemplate;
  updateNoteTemplate: (id: string, updates: Partial<NoteTemplate>) => void;
  deleteNoteTemplate: (id: string) => void;
  createNoteFromTemplate: (templateId: string, overrides?: Partial<Note>) => Note | null;
  
  // Notes Stats & Analytics
  notesStats: NotesStats;
  updateNotesStats: () => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  
  // Bulk Operations
  bulkDeleteNotes: (noteIds: string[]) => void;
  bulkMoveNotes: (noteIds: string[], folderId: string | undefined) => void;
  bulkTagNotes: (noteIds: string[], tagIds: string[]) => void;
  
  // Import/Export
  exportAllNotesToJson: () => string;
  exportNotesToMarkdownZip: () => Promise<Blob>;
  importNotesFromJson: (jsonString: string) => { success: boolean; count: number; error?: string };
  backupAllData: () => string;
  getStorageInfo: () => { used: number; notesUsed: number; available: number };
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  // Initialize storage on mount
  useEffect(() => {
    initializeStorage();
  }, []);

  // State with localStorage persistence
  const [files, setFiles] = useLocalStorage<LocalFile[]>(STORAGE_KEYS.FILES, []);
  const [collections, setCollections] = useLocalStorage<Collection[]>(STORAGE_KEYS.COLLECTIONS, defaultCollections);
  const [courses, setCourses] = useLocalStorage<Course[]>(STORAGE_KEYS.COURSES, []);
  const [tags, setTags] = useLocalStorage<Tag[]>(STORAGE_KEYS.TAGS, defaultTags);
  const [userStats, setUserStats] = useLocalStorage<UserStats>(STORAGE_KEYS.USER_STATS, defaultUserStats);
  const [notes, setNotes] = useLocalStorage<Note[]>(STORAGE_KEYS.NOTES, []);
  const [noteFolders, setNoteFolders] = useLocalStorage<NoteFolder[]>(STORAGE_KEYS.NOTE_FOLDERS, []);
  const [noteRevisions, setNoteRevisions] = useLocalStorage<NoteRevision[]>(STORAGE_KEYS.NOTE_REVISIONS, []);
  const [noteTemplates, setNoteTemplates] = useLocalStorage<NoteTemplate[]>(STORAGE_KEYS.NOTE_TEMPLATES, defaultNoteTemplates);
  const [notesStats, setNotesStats] = useLocalStorage<NotesStats>(STORAGE_KEYS.NOTES_STATS, defaultNotesStats);
  const [focusState, setFocusState] = useLocalStorage<FocusState>(STORAGE_KEYS.FOCUS_STATE, {
    activeSession: undefined,
    sessions: [],
    preferences: {
      workMinutes: 25,
      shortBreakMinutes: 5,
      longBreakMinutes: 15,
      cyclesUntilLongBreak: 4,
      autoStartNext: false,
    },
  });

  // File operations
  const addFile = (file: Omit<LocalFile, 'id' | 'dateAdded' | 'lastModified'>): LocalFile => {
    const newFile: LocalFile = {
      ...file,
      id: generateId(),
      dateAdded: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    };
    setFiles(prev => [...prev, newFile]);
    
    // Update collection item count if assigned
    if (file.collectionId) {
      updateCollectionCount(file.collectionId, 1);
    }
    
    return newFile;
  };

  const updateFile = (id: string, updates: Partial<LocalFile>) => {
    setFiles(prev => prev.map(f => 
      f.id === id 
        ? { ...f, ...updates, lastModified: new Date().toISOString() }
        : f
    ));
  };

  const deleteFile = (id: string) => {
    const file = files.find(f => f.id === id);
    if (file?.collectionId) {
      updateCollectionCount(file.collectionId, -1);
    }
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const getFilesByCollection = (collectionId: string) => {
    return files.filter(f => f.collectionId === collectionId);
  };

  const getFilesByTag = (tagId: string) => {
    return files.filter(f => f.tags.includes(tagId));
  };

  // Collection operations
  const updateCollectionCount = (collectionId: string, delta: number) => {
    setCollections(prev => prev.map(c => 
      c.id === collectionId 
        ? { ...c, itemCount: Math.max(0, c.itemCount + delta), lastModified: new Date().toISOString() }
        : c
    ));
  };

  const addCollection = (collection: Omit<Collection, 'id' | 'itemCount' | 'dateCreated' | 'lastModified'>): Collection => {
    const newCollection: Collection = {
      ...collection,
      id: generateId(),
      itemCount: 0,
      dateCreated: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    };
    setCollections(prev => [...prev, newCollection]);
    return newCollection;
  };

  const updateCollection = (id: string, updates: Partial<Collection>) => {
    setCollections(prev => prev.map(c => 
      c.id === id 
        ? { ...c, ...updates, lastModified: new Date().toISOString() }
        : c
    ));
  };

  const deleteCollection = (id: string) => {
    // Remove collection assignment from files and courses
    setFiles(prev => prev.map(f => 
      f.collectionId === id ? { ...f, collectionId: undefined } : f
    ));
    setCourses(prev => prev.map(c => 
      c.collectionId === id ? { ...c, collectionId: undefined } : c
    ));
    setCollections(prev => prev.filter(c => c.id !== id));
  };

  // Course operations
  const addCourse = (course: Omit<Course, 'id' | 'dateCreated' | 'lastModified'>): Course => {
    const newCourse: Course = {
      ...course,
      id: generateId(),
      dateCreated: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    };
    setCourses(prev => [...prev, newCourse]);
    
    // Update collection item count if assigned
    if (course.collectionId) {
      updateCollectionCount(course.collectionId, 1);
    }
    
    return newCourse;
  };

  const updateCourse = (id: string, updates: Partial<Course>) => {
    setCourses(prev => prev.map(c => 
      c.id === id 
        ? { ...c, ...updates, lastModified: new Date().toISOString() }
        : c
    ));
  };

  const deleteCourse = (id: string) => {
    const course = courses.find(c => c.id === id);
    if (course?.collectionId) {
      updateCollectionCount(course.collectionId, -1);
    }
    setCourses(prev => prev.filter(c => c.id !== id));
  };

  const getCoursesByCollection = (collectionId: string) => {
    return courses.filter(c => c.collectionId === collectionId);
  };

  // Tag operations
  const addTag = (tag: Omit<Tag, 'id'>): Tag => {
    const newTag: Tag = {
      ...tag,
      id: generateId(),
    };
    setTags(prev => [...prev, newTag]);
    return newTag;
  };

  const updateTag = (id: string, updates: Partial<Tag>) => {
    setTags(prev => prev.map(t => 
      t.id === id ? { ...t, ...updates } : t
    ));
  };

  const deleteTag = (id: string) => {
    // Remove tag from files and courses
    setFiles(prev => prev.map(f => ({
      ...f,
      tags: f.tags.filter(t => t !== id)
    })));
    setCourses(prev => prev.map(c => ({
      ...c,
      tags: c.tags.filter(t => t !== id)
    })));
    setTags(prev => prev.filter(t => t.id !== id));
  };

  // User stats operations
  const updateUserStats = (updates: Partial<UserStats>) => {
    setUserStats(prev => ({ ...prev, ...updates }));
  };

  const logLearningTime = (minutes: number) => {
    const today = new Date().toISOString().split('T')[0];
    
    setUserStats(prev => {
      const weeklyProgress = [...prev.weeklyProgress];
      const todayIndex = weeklyProgress.findIndex(p => p.date === today);
      
      if (todayIndex >= 0) {
        weeklyProgress[todayIndex].minutesLearned += minutes;
      } else {
        weeklyProgress.push({
          date: today,
          minutesLearned: minutes,
          coursesCompleted: 0,
          modulesCompleted: 0,
        });
      }
      
      // Keep only last 7 days
      const sortedProgress = weeklyProgress
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 7);
      
      // Calculate streak
      let currentStreak = prev.currentStreak;
      if (prev.lastActiveDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        if (prev.lastActiveDate === yesterdayStr) {
          currentStreak += 1;
        } else {
          currentStreak = 1;
        }
      }
      
      return {
        ...prev,
        totalMinutesLearned: prev.totalMinutesLearned + minutes,
        weeklyProgress: sortedProgress,
        currentStreak,
        longestStreak: Math.max(prev.longestStreak, currentStreak),
        lastActiveDate: today,
      };
    });
  };

  // Note operations
  const addNote = (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'wordCount' | 'readingTime' | 'currentRevision'>): Note => {
    const wordCount = countWords(note.content);
    const readingTime = calculateReadingTime(note.content);
    const isRTL = note.language === 'ar' || (note.language === 'auto' && detectRTL(note.content));
    
    const newNote: Note = {
      ...note,
      id: generateId(),
      isRTL,
      language: note.language === 'auto' ? detectLanguage(note.content) : note.language,
      wordCount,
      readingTime,
      currentRevision: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes(prev => [...prev, newNote]);
    return newNote;
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes(prev => prev.map(n => {
      if (n.id !== id) return n;
      
      const updatedContent = updates.content ?? n.content;
      const wordCount = countWords(updatedContent);
      const readingTime = calculateReadingTime(updatedContent);
      const language = updates.language ?? n.language;
      const isRTL = language === 'ar' || (language === 'auto' && detectRTL(updatedContent));
      
      return {
        ...n,
        ...updates,
        isRTL,
        wordCount,
        readingTime,
        updatedAt: new Date().toISOString(),
      };
    }));
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  const getNotesBySource = (sourceType: string, sourceId: string) => {
    return notes.filter(n => n.sourceType === sourceType && n.sourceId === sourceId);
  };

  const getNotesByModality = (modality: string) => {
    return notes.filter(n => n.modality === modality);
  };

  const addHighlightToNote = (noteId: string, highlight: Omit<TextHighlight, 'id' | 'createdAt'>) => {
    setNotes(prev => prev.map(n => {
      if (n.id !== noteId) return n;
      return {
        ...n,
        highlights: [...n.highlights, {
          ...highlight,
          id: generateId(),
          createdAt: new Date().toISOString(),
        }],
        updatedAt: new Date().toISOString(),
      };
    }));
  };

  const removeHighlightFromNote = (noteId: string, highlightId: string) => {
    setNotes(prev => prev.map(n => {
      if (n.id !== noteId) return n;
      return {
        ...n,
        highlights: n.highlights.filter(h => h.id !== highlightId),
        updatedAt: new Date().toISOString(),
      };
    }));
  };

  const exportNoteToMarkdown = (noteId: string): string => {
    const note = notes.find(n => n.id === noteId);
    if (!note) return '';
    
    let markdown = `# ${note.title}\n\n`;
    markdown += `> Source: ${note.sourceName || 'Standalone Note'}\n`;
    markdown += `> Created: ${new Date(note.createdAt).toLocaleDateString()}\n`;
    markdown += `> Language: ${note.language === 'ar' ? 'Arabic' : 'English'}\n\n`;
    markdown += `---\n\n`;
    markdown += note.content;
    
    if (note.highlights.length > 0) {
      markdown += `\n\n---\n\n## Highlights\n\n`;
      note.highlights.forEach(h => {
        markdown += `- "${h.text}" ${h.timestamp ? `(${h.timestamp})` : ''}\n`;
      });
    }
    
    return markdown;
  };

  // Note Folder operations
  const addNoteFolder = (folder: Omit<NoteFolder, 'id' | 'noteCount' | 'createdAt' | 'updatedAt' | 'order'>): NoteFolder => {
    const newFolder: NoteFolder = {
      ...folder,
      id: generateId(),
      noteCount: 0,
      order: noteFolders.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNoteFolders(prev => [...prev, newFolder]);
    return newFolder;
  };

  const updateNoteFolder = (id: string, updates: Partial<NoteFolder>) => {
    setNoteFolders(prev => prev.map(f => f.id === id ? { ...f, ...updates, updatedAt: new Date().toISOString() } : f));
  };

  const deleteNoteFolder = (id: string) => {
    // Move notes from deleted folder to root
    setNotes(prev => prev.map(n => n.folderId === id ? { ...n, folderId: undefined } : n));
    // Delete child folders
    const childFolders = noteFolders.filter(f => f.parentId === id);
    childFolders.forEach(cf => deleteNoteFolder(cf.id));
    setNoteFolders(prev => prev.filter(f => f.id !== id));
  };

  const getNotesByFolder = (folderId: string) => {
    return notes.filter(n => n.folderId === folderId);
  };

  const moveNoteToFolder = (noteId: string, folderId: string | undefined) => {
    // Update old folder count
    const note = notes.find(n => n.id === noteId);
    if (note?.folderId) {
      setNoteFolders(prev => prev.map(f => 
        f.id === note.folderId ? { ...f, noteCount: Math.max(0, f.noteCount - 1) } : f
      ));
    }
    // Update new folder count
    if (folderId) {
      setNoteFolders(prev => prev.map(f => 
        f.id === folderId ? { ...f, noteCount: f.noteCount + 1 } : f
      ));
    }
    // Move note
    setNotes(prev => prev.map(n => n.id === noteId ? { ...n, folderId, updatedAt: new Date().toISOString() } : n));
  };

  const reorderFolders = (folderIds: string[]) => {
    setNoteFolders(prev => prev.map(f => ({
      ...f,
      order: folderIds.indexOf(f.id)
    })));
  };

  // Note Revision operations (Version History)
  const saveNoteRevision = (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;
    
    const revisionNumber = (note.currentRevision || 0) + 1;
    const newRevision: NoteRevision = {
      id: generateId(),
      noteId,
      revisionNumber,
      content: note.content,
      title: note.title,
      timestamp: new Date().toISOString(),
      wordCount: note.wordCount,
    };
    
    setNoteRevisions(prev => [...prev, newRevision]);
    setNotes(prev => prev.map(n => n.id === noteId ? { ...n, currentRevision: revisionNumber } : n));
    
    // Keep only last 10 revisions per note
    deleteOldRevisions(noteId, 10);
  };

  const restoreNoteRevision = (noteId: string, revisionId: string) => {
    const revision = noteRevisions.find(r => r.id === revisionId && r.noteId === noteId);
    if (!revision) return;
    
    // Save current version before restoring
    saveNoteRevision(noteId);
    
    // Restore from revision
    updateNote(noteId, {
      content: revision.content,
      title: revision.title,
    });
  };

  const getNoteRevisions = (noteId: string) => {
    return noteRevisions
      .filter(r => r.noteId === noteId)
      .sort((a, b) => b.revisionNumber - a.revisionNumber);
  };

  const deleteOldRevisions = (noteId: string, keepCount: number) => {
    const noteRevs = getNoteRevisions(noteId);
    if (noteRevs.length > keepCount) {
      const toDelete = noteRevs.slice(keepCount).map(r => r.id);
      setNoteRevisions(prev => prev.filter(r => !toDelete.includes(r.id)));
    }
  };

  // Note Template operations
  const addNoteTemplate = (template: Omit<NoteTemplate, 'id' | 'createdAt' | 'isCustom'>): NoteTemplate => {
    const newTemplate: NoteTemplate = {
      ...template,
      id: generateId(),
      isCustom: true,
      createdAt: new Date().toISOString(),
    };
    setNoteTemplates(prev => [...prev, newTemplate]);
    return newTemplate;
  };

  const updateNoteTemplate = (id: string, updates: Partial<NoteTemplate>) => {
    setNoteTemplates(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteNoteTemplate = (id: string) => {
    // Only allow deleting custom templates
    const template = noteTemplates.find(t => t.id === id);
    if (template?.isCustom) {
      setNoteTemplates(prev => prev.filter(t => t.id !== id));
    }
  };

  const createNoteFromTemplate = (templateId: string, overrides?: Partial<Note>): Note | null => {
    const template = noteTemplates.find(t => t.id === templateId);
    if (!template) return null;
    
    return addNote({
      title: overrides?.title || template.name,
      content: template.content,
      language: overrides?.language || 'auto',
      isRTL: false,
      modality: template.modality,
      sourceType: 'standalone',
      highlights: [],
      tags: overrides?.tags || [],
      folderId: overrides?.folderId,
      isFavorite: false,
      isPinned: false,
      templateId,
      ...overrides,
    });
  };

  // Notes Stats operations
  const updateNotesStats = () => {
    const totalNotes = notes.length;
    const totalWords = notes.reduce((sum, n) => sum + n.wordCount, 0);
    const totalHighlights = notes.reduce((sum, n) => sum + n.highlights.length, 0);
    const storageUsedBytes = calculateNotesStorageSize();
    
    const notesByModality: Record<ContentModality, number> = {
      video: 0, document: 0, audio: 0, course: 0, general: 0
    };
    notes.forEach(n => {
      notesByModality[n.modality] = (notesByModality[n.modality] || 0) + 1;
    });
    
    const notesByFolder: Record<string, number> = {};
    notes.forEach(n => {
      if (n.folderId) {
        notesByFolder[n.folderId] = (notesByFolder[n.folderId] || 0) + 1;
      }
    });
    
    setNotesStats(prev => ({
      ...prev,
      totalNotes,
      totalWords,
      totalHighlights,
      storageUsedBytes,
      notesByModality,
      notesByFolder,
    }));
  };

  const addRecentSearch = (query: string) => {
    if (!query.trim()) return;
    setNotesStats(prev => ({
      ...prev,
      recentSearches: [query, ...prev.recentSearches.filter(s => s !== query)].slice(0, 10),
    }));
  };

  const clearRecentSearches = () => {
    setNotesStats(prev => ({ ...prev, recentSearches: [] }));
  };

  // Focus timer operations
  const logFocusSession = (session: FocusSession) => {
    setFocusState(prev => {
      const next: FocusState = {
        ...prev,
        sessions: [...prev.sessions, session],
        activeSession: undefined,
      };
      return next;
    });

    updateUserStats({
      totalMinutesLearned: userStats.totalMinutesLearned + (session.durationMinutes * (session.completed ? 1 : 0)),
      // optionally can update streak etc.
    });

    // Lean multiple analytics points
    setUserStats(prev => ({
      ...prev,
      monthlyStats: prev.monthlyStats,
      qualityScore: prev.qualityScore,
      consistencyScore: prev.consistencyScore,
      velocityScore: prev.velocityScore,
    }));
  };

  const updateFocusPreferences = (updates: Partial<FocusPreferences>) => {
    setFocusState(prev => ({
      ...prev,
      preferences: { ...prev.preferences, ...updates },
    }));
  };

  const resetFocusState = () => {
    setFocusState({
      activeSession: undefined,
      sessions: [],
      preferences: {
        workMinutes: 25,
        shortBreakMinutes: 5,
        longBreakMinutes: 15,
        cyclesUntilLongBreak: 4,
        autoStartNext: false,
      },
    });
  };

  const getDurationMs = (mode: 'work' | 'shortBreak' | 'longBreak'): number => {
    if (mode === 'work') return focusState.preferences.workMinutes * 60 * 1000;
    if (mode === 'shortBreak') return focusState.preferences.shortBreakMinutes * 60 * 1000;
    return focusState.preferences.longBreakMinutes * 60 * 1000;
  };

  const startFocusSession = (mode: 'work' | 'shortBreak' | 'longBreak' = 'work') => {
    const currentCycle = focusState.activeSession?.cycle || 1;
    const session: FocusSession = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      mode,
      durationMinutes: getDurationMs(mode) / 60000,
      startedAt: new Date().toISOString(),
      remainingMs: getDurationMs(mode),
      cycle: currentCycle,
      completed: false,
    };
    setFocusState(prev => ({ ...prev, activeSession: session }));
  };

  const pauseFocusSession = () => {
    if (!focusState.activeSession) return;
    setFocusState(prev => ({
      ...prev,
      activeSession: prev.activeSession ? {
        ...prev.activeSession,
        pausedAt: new Date().toISOString(),
      } : undefined,
    }));
  };

  const resumeFocusSession = () => {
    if (!focusState.activeSession) return;
    setFocusState(prev => ({
      ...prev,
      activeSession: prev.activeSession ? {
        ...prev.activeSession,
        pausedAt: undefined,
      } : undefined,
    }));
  };

  const stopFocusSession = () => {
    setFocusState(prev => ({ ...prev, activeSession: undefined }));
  };

  // Bulk operations
  const bulkDeleteNotes = (noteIds: string[]) => {
    setNotes(prev => prev.filter(n => !noteIds.includes(n.id)));
    setNoteRevisions(prev => prev.filter(r => !noteIds.includes(r.noteId)));
  };

  const bulkMoveNotes = (noteIds: string[], folderId: string | undefined) => {
    setNotes(prev => prev.map(n => 
      noteIds.includes(n.id) ? { ...n, folderId, updatedAt: new Date().toISOString() } : n
    ));
    // Update folder counts
    updateNotesStats();
  };

  const bulkTagNotes = (noteIds: string[], tagIds: string[]) => {
    setNotes(prev => prev.map(n => 
      noteIds.includes(n.id) 
        ? { ...n, tags: [...new Set([...n.tags, ...tagIds])], updatedAt: new Date().toISOString() } 
        : n
    ));
  };

  // Import/Export operations
  const exportAllNotesToJson = (): string => {
    const exportData = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      notes,
      noteFolders,
      noteTemplates: noteTemplates.filter(t => t.isCustom),
    };
    return JSON.stringify(exportData, null, 2);
  };

  const exportNotesToMarkdownZip = async (): Promise<Blob> => {
    // Create a simple text concatenation as a fallback (real ZIP would need a library)
    let content = '# Notes Export\n\n';
    content += `Exported: ${new Date().toLocaleString()}\n`;
    content += `Total Notes: ${notes.length}\n\n`;
    content += '---\n\n';
    
    notes.forEach(note => {
      content += `# ${note.title}\n\n`;
      content += `Source: ${note.sourceName || 'Standalone'}\n`;
      content += `Created: ${new Date(note.createdAt).toLocaleString()}\n`;
      content += `Words: ${note.wordCount}\n\n`;
      content += note.content;
      content += '\n\n---\n\n';
    });
    
    return new Blob([content], { type: 'text/markdown' });
  };

  const importNotesFromJson = (jsonString: string): { success: boolean; count: number; error?: string } => {
    try {
      const data = JSON.parse(jsonString);
      
      if (!data.notes || !Array.isArray(data.notes)) {
        return { success: false, count: 0, error: 'Invalid format: notes array not found' };
      }
      
      let importedCount = 0;
      
      // Import folders first
      if (data.noteFolders && Array.isArray(data.noteFolders)) {
        data.noteFolders.forEach((folder: NoteFolder) => {
          if (!noteFolders.find(f => f.id === folder.id)) {
            setNoteFolders(prev => [...prev, { ...folder, id: generateId() }]);
          }
        });
      }
      
      // Import notes
      data.notes.forEach((note: Note) => {
        // Generate new ID to avoid conflicts
        const newNote = {
          ...note,
          id: generateId(),
          createdAt: note.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setNotes(prev => [...prev, newNote]);
        importedCount++;
      });
      
      return { success: true, count: importedCount };
    } catch (err) {
      return { success: false, count: 0, error: 'Invalid JSON format' };
    }
  };

  const backupAllData = (): string => {
    return JSON.stringify({
      version: '2.0',
      backupDate: new Date().toISOString(),
      data: {
        files,
        collections,
        courses,
        tags,
        userStats,
        notes,
        noteFolders,
        noteRevisions,
        noteTemplates,
        notesStats,
      }
    }, null, 2);
  };

  const getStorageInfo = () => {
    const used = calculateNotesStorageSize();
    const notesUsed = calculateNotesStorageSize();
    // localStorage limit is typically 5-10MB
    const available = 10 * 1024 * 1024; // Assume 10MB
    return { used, notesUsed, available };
  };

  // Search operations
  const searchContent = (query: string) => {
    const lowerQuery = query.toLowerCase();
    
    return {
      files: files.filter(f => 
        f.name.toLowerCase().includes(lowerQuery) ||
        f.tags.some(t => tags.find(tag => tag.id === t)?.name.toLowerCase().includes(lowerQuery))
      ),
      courses: courses.filter(c => 
        c.title.toLowerCase().includes(lowerQuery) ||
        c.description.toLowerCase().includes(lowerQuery) ||
        c.tags.some(t => tags.find(tag => tag.id === t)?.name.toLowerCase().includes(lowerQuery))
      ),
      collections: collections.filter(c => 
        c.name.toLowerCase().includes(lowerQuery) ||
        c.description.toLowerCase().includes(lowerQuery)
      ),
      notes: notes.filter(n =>
        n.title.toLowerCase().includes(lowerQuery) ||
        n.content.toLowerCase().includes(lowerQuery) ||
        n.sourceName?.toLowerCase().includes(lowerQuery)
      ),
    };
  };

  const value: DataContextType = {
    files,
    addFile,
    updateFile,
    deleteFile,
    getFilesByCollection,
    getFilesByTag,
    collections,
    addCollection,
    updateCollection,
    deleteCollection,
    courses,
    addCourse,
    updateCourse,
    deleteCourse,
    getCoursesByCollection,
    tags,
    addTag,
    updateTag,
    deleteTag,
    userStats,
    updateUserStats,
    logLearningTime,
    searchContent,
    notes,
    addNote,
    updateNote,
    deleteNote,
    getNotesBySource,
    getNotesByModality,
    addHighlightToNote,
    removeHighlightFromNote,
    exportNoteToMarkdown,
    noteFolders,
    addNoteFolder,
    updateNoteFolder,
    deleteNoteFolder,
    getNotesByFolder,
    moveNoteToFolder,
    reorderFolders,
    noteRevisions,
    saveNoteRevision,
    restoreNoteRevision,
    getNoteRevisions,
    deleteOldRevisions,
    noteTemplates,
    addNoteTemplate,
    updateNoteTemplate,
    deleteNoteTemplate,
    createNoteFromTemplate,
    notesStats,
    updateNotesStats,
    addRecentSearch,
    clearRecentSearches,
    bulkDeleteNotes,
    bulkMoveNotes,
    bulkTagNotes,
    exportAllNotesToJson,
    exportNotesToMarkdownZip,
    importNotesFromJson,
    backupAllData,
    getStorageInfo,
    focusState,
    setFocusState,
    logFocusSession,
    updateFocusPreferences,
    resetFocusState,
    startFocusSession,
    pauseFocusSession,
    resumeFocusSession,
    stopFocusSession,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
