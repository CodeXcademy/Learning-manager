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
  TextHighlight,
  STORAGE_KEYS,
  defaultTags,
  defaultCollections,
  defaultUserStats,
  generateId,
  initializeStorage,
  detectRTL,
  detectLanguage,
  countWords,
  calculateReadingTime,
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
  addNoteFolder: (folder: Omit<NoteFolder, 'id' | 'noteCount' | 'createdAt'>) => NoteFolder;
  updateNoteFolder: (id: string, updates: Partial<NoteFolder>) => void;
  deleteNoteFolder: (id: string) => void;
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
  const addNote = (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'wordCount' | 'readingTime'>): Note => {
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
  const addNoteFolder = (folder: Omit<NoteFolder, 'id' | 'noteCount' | 'createdAt'>): NoteFolder => {
    const newFolder: NoteFolder = {
      ...folder,
      id: generateId(),
      noteCount: 0,
      createdAt: new Date().toISOString(),
    };
    setNoteFolders(prev => [...prev, newFolder]);
    return newFolder;
  };

  const updateNoteFolder = (id: string, updates: Partial<NoteFolder>) => {
    setNoteFolders(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const deleteNoteFolder = (id: string) => {
    setNoteFolders(prev => prev.filter(f => f.id !== id));
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
