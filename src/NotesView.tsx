import { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, Variants, AnimatePresence } from 'motion/react';
import { 
  Plus, Search, X, Trash2, Pin, Star, Clock, 
  FileText, Video, Music, BookOpen, Download, Copy,
  ChevronLeft, ChevronRight, Highlighter, Tag,
  Languages, Filter, Grid3X3, LayoutList, Folder, FolderPlus,
  History, RotateCcw, FileUp, FileDown, Check, ChevronDown,
  Layout, Users, GraduationCap, Zap, Save, HardDrive,
  MoreHorizontal, FolderOpen, Edit3, Link2
} from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';
import { useData } from './store/DataContext';
import { TagManager } from './components/TagManager';
import { Note, NoteFolder, NoteTemplate, NoteRevision, HighlightColor, highlightColors, ContentModality, formatFileSize } from './store/localDataStore';

interface NotesViewProps {
  onNavigate: (view: string) => void;
}

// Translations
const t = {
  en: {
    title: 'Notes & Highlights',
    newNote: 'New Note',
    search: 'Search notes...',
    allNotes: 'All Notes',
    favorites: 'Favorites',
    recent: 'Recent',
    bySource: 'By Source',
    video: 'Video Notes',
    document: 'Document Notes',
    audio: 'Audio Notes',
    course: 'Course Notes',
    general: 'General Notes',
    noNotes: 'No notes yet',
    startWriting: 'Start capturing your thoughts',
    createFirst: 'Create your first note',
    untitled: 'Untitled Note',
    editNote: 'Edit Note',
    preview: 'Preview',
    editor: 'Editor',
    highlights: 'Highlights',
    addHighlight: 'Add Highlight',
    export: 'Export',
    exportMd: 'Export as Markdown',
    exportAll: 'Export All Notes',
    copyContent: 'Copy Content',
    delete: 'Delete',
    pin: 'Pin',
    favorite: 'Favorite',
    source: 'Source',
    created: 'Created',
    updated: 'Updated',
    words: 'words',
    minRead: 'min read',
    selectLanguage: 'Language',
    english: 'English',
    arabic: 'Arabic',
    auto: 'Auto-detect',
    writeHere: 'Start writing here...',
    noResults: 'No notes found',
    highlightText: 'Highlight selected text',
    cancel: 'Cancel',
    create: 'Create Note',
    selectCourse: 'Select Course',
    // New translations
    folders: 'Folders',
    newFolder: 'New Folder',
    noFolder: 'No Folder',
    templates: 'Templates',
    useTemplate: 'Use Template',
    versionHistory: 'Version History',
    restore: 'Restore',
    revision: 'Revision',
    importNotes: 'Import Notes',
    backupAll: 'Backup All Data',
    storageUsed: 'Storage Used',
    savedLocally: 'Saved locally',
    autoSaving: 'Auto-saving...',
    bulkActions: 'Bulk Actions',
    selectAll: 'Select All',
    moveToFolder: 'Move to Folder',
    addTags: 'Add Tags',
    deleteSelected: 'Delete Selected',
    selected: 'selected',
    recentSearches: 'Recent Searches',
    clearHistory: 'Clear History',
    linkedFile: 'Linked File',
    linkFile: 'Link Local File',
    timestamp: 'Timestamp',
    pageNumber: 'Page Number',
  },
  ar: {
    title: 'الملاحظات والتمييزات',
    newNote: 'ملاحظة جديدة',
    search: 'البحث في الملاحظات...',
    allNotes: 'كل الملاحظات',
    favorites: 'المفضلة',
    recent: 'الأخيرة',
    bySource: 'حسب المصدر',
    video: 'ملاحظات الفيديو',
    document: 'ملاحظات المستندات',
    audio: 'ملاحظات الصوت',
    course: 'ملاحظات الدورة',
    general: 'ملاحظات عامة',
    noNotes: 'لا توجد ملاحظات',
    startWriting: 'ابدأ بتدوين أفكارك',
    createFirst: 'أنشئ أول ملاحظة',
    untitled: 'ملاحظة بدون عنوان',
    editNote: 'تعديل الملاحظة',
    preview: 'معاينة',
    editor: 'المحرر',
    highlights: 'التمييزات',
    addHighlight: 'إضافة تمييز',
    export: 'تصدير',
    exportMd: 'تصدير كـ Markdown',
    exportAll: 'تصدير كل الملاحظات',
    copyContent: 'نسخ المحتوى',
    delete: 'حذف',
    pin: 'تثبيت',
    favorite: 'مفضل',
    source: 'المصدر',
    created: 'تاريخ الإنشاء',
    updated: 'آخر تحديث',
    words: 'كلمة',
    minRead: 'دقيقة للقراءة',
    selectLanguage: 'اللغة',
    english: 'الإنجليزية',
    arabic: 'العربية',
    auto: 'كشف تلقائي',
    writeHere: 'ابدأ الكتابة هنا...',
    noResults: 'لم يتم العثور على ملاحظات',
    highlightText: 'تمييز النص المحدد',
    cancel: 'إلغاء',
    create: 'إنشاء ملاحظة',
    selectCourse: 'اختر الدورة',
    // New translations
    folders: 'المجلدات',
    newFolder: 'مجلد جديد',
    noFolder: 'بدون مجلد',
    templates: 'القوالب',
    useTemplate: 'استخدم قالب',
    versionHistory: 'سجل الإصدارات',
    restore: 'استعادة',
    revision: 'الإصدار',
    importNotes: 'استيراد ملاحظات',
    backupAll: 'نسخ احتياطي للكل',
    storageUsed: 'المساحة المستخدمة',
    savedLocally: 'تم الحفظ محلياً',
    autoSaving: 'جاري الحفظ...',
    bulkActions: 'إجراءات متعددة',
    selectAll: 'تحديد الكل',
    moveToFolder: 'نقل إلى مجلد',
    addTags: 'إضافة وسوم',
    deleteSelected: 'حذف المحدد',
    selected: 'محدد',
    recentSearches: 'عمليات البحث الأخيرة',
    clearHistory: 'مسح السجل',
    linkedFile: 'ملف مرتبط',
    linkFile: 'ربط ملف محلي',
    timestamp: 'الوقت',
    pageNumber: 'رقم الصفحة',
  }
};

const modalityIcons: Record<ContentModality, typeof Video> = {
  video: Video,
  document: FileText,
  audio: Music,
  course: BookOpen,
  general: FileText,
};

const templateIcons: Record<string, typeof Video> = {
  video: Video,
  book: BookOpen,
  users: Users,
  'graduation-cap': GraduationCap,
  layout: Layout,
  'file-text': FileText,
};

export function NotesView({ onNavigate }: NotesViewProps) {
  const { 
    notes, addNote, updateNote, deleteNote, 
    addHighlightToNote, removeHighlightFromNote, exportNoteToMarkdown,
    courses, files,
    noteFolders, addNoteFolder, updateNoteFolder, deleteNoteFolder, moveNoteToFolder, getNotesByFolder,
    noteRevisions, saveNoteRevision, restoreNoteRevision, getNoteRevisions,
    noteTemplates, createNoteFromTemplate,
    notesStats, updateNotesStats, addRecentSearch, clearRecentSearches,
    bulkDeleteNotes, bulkMoveNotes,
    exportAllNotesToJson, importNotesFromJson, backupAllData, getStorageInfo,
  } = useData();
  
  // UI State
  const [uiLang, setUiLang] = useState<'en' | 'ar'>('en');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [showNewNoteModal, setShowNewNoteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModality, setFilterModality] = useState<ContentModality | 'all'>('all');
  const [filterFolderId, setFilterFolderId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showHighlightMenu, setShowHighlightMenu] = useState(false);
  const [highlightPosition, setHighlightPosition] = useState({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState('');
  
  // New UI states
  const [showSidebar, setShowSidebar] = useState(true);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showImportExportModal, setShowImportExportModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedNoteIds, setSelectedNoteIds] = useState<string[]>([]);
  const [showBulkFolderMenu, setShowBulkFolderMenu] = useState(false);
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  
  // Editor State
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editLanguage, setEditLanguage] = useState<'en' | 'ar' | 'auto'>('auto');
  const [editModality, setEditModality] = useState<ContentModality>('general');
  const [editSourceId, setEditSourceId] = useState('');
  const [editFolderId, setEditFolderId] = useState<string | undefined>(undefined);
  const [editTimestamp, setEditTimestamp] = useState('');
  const [editPageNumber, setEditPageNumber] = useState<number | undefined>(undefined);
  const [editTags, setEditTags] = useState<string[]>([]);
  // Mobile editor mode: 'edit' or 'preview' (desktop always uses 'live' side-by-side)
  const [mobileEditorMode, setMobileEditorMode] = useState<'edit' | 'preview'>('edit');
  
  // Folder creation state
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('bg-blue-500');
  
  const str = t[uiLang];
  const isRTL = uiLang === 'ar';

  // Get storage info
  const storageInfo = useMemo(() => getStorageInfo(), [notes, noteFolders, noteRevisions]);
  const storagePercent = Math.min(100, (storageInfo.used / storageInfo.available) * 100);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  // Update stats on mount
  useEffect(() => {
    updateNotesStats();
  }, [notes.length]);

  // Filter notes
  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      const matchesSearch = searchQuery === '' || 
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesModality = filterModality === 'all' || note.modality === filterModality;
      const matchesFolder = filterFolderId === null || note.folderId === filterFolderId;
      return matchesSearch && matchesModality && matchesFolder;
    }).sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [notes, searchQuery, filterModality, filterFolderId]);

  // Current note revisions
  const currentRevisions = useMemo(() => {
    return selectedNote ? getNoteRevisions(selectedNote.id) : [];
  }, [selectedNote, noteRevisions]);

  // Create new note
  const handleCreateNote = (templateId?: string) => {
    if (templateId) {
      const newNote = createNoteFromTemplate(templateId, {
        folderId: editFolderId,
        language: editLanguage,
      });
      if (newNote) {
        setSelectedNote(newNote);
        setEditTitle(newNote.title);
        setEditContent(newNote.content);
        setEditLanguage(newNote.language);
      }
    } else {
      const newNote = addNote({
        title: editTitle || str.untitled,
        content: editContent,
        language: editLanguage,
        isRTL: editLanguage === 'ar',
        modality: editModality,
        sourceType: editSourceId ? 'course' : 'standalone',
        sourceId: editSourceId || undefined,
        sourceName: editSourceId ? courses.find(c => c.id === editSourceId)?.title : undefined,
        sourceTimestamp: editTimestamp || undefined,
        sourcePageNumber: editPageNumber,
        highlights: [],
        tags: [],
        folderId: editFolderId,
        isFavorite: false,
        isPinned: false,
        currentRevision: 1,
      });
      setSelectedNote(newNote);
      setEditTitle(newNote.title);
      setEditContent(newNote.content);
      setEditLanguage(newNote.language);
    }
    setShowNewNoteModal(false);
    setShowTemplatesModal(false);
  };

  // Reset editor
  const resetEditor = () => {
    setEditTitle('');
    setEditContent('');
    setEditLanguage('auto');
    setEditModality('general');
    setEditSourceId('');
    setEditFolderId(filterFolderId || undefined);
    setEditTimestamp('');
    setEditPageNumber(undefined);
    setEditTags([]);
  };

  // Open note for editing
  const openNote = (note: Note) => {
    if (bulkMode) {
      toggleNoteSelection(note.id);
      return;
    }
    setSelectedNote(note);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditLanguage(note.language);
    setEditTags(note.tags);
    setShowHistoryPanel(false);
  };

  // Toggle note selection for bulk actions
  const toggleNoteSelection = (noteId: string) => {
    setSelectedNoteIds(prev => 
      prev.includes(noteId) ? prev.filter(id => id !== noteId) : [...prev, noteId]
    );
  };

  // Save current note
  const saveNote = useCallback(() => {
    if (selectedNote) {
      setIsSaving(true);
      // Save revision before updating
      saveNoteRevision(selectedNote.id);
      updateNote(selectedNote.id, {
        title: editTitle,
        content: editContent,
        language: editLanguage,
        tags: editTags,
      });
      setTimeout(() => {
        setIsSaving(false);
        setLastSaved(new Date());
      }, 300);
    }
  }, [selectedNote, editTitle, editContent, editLanguage, editTags, updateNote, saveNoteRevision]);

  // Auto-save with debounce
  useEffect(() => {
    if (selectedNote) {
      const timer = setTimeout(() => {
        updateNote(selectedNote.id, {
          title: editTitle,
          content: editContent,
          language: editLanguage,
          tags: editTags,
        });
        setLastSaved(new Date());
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [editContent, editTitle, editTags]);

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Get the currently focused element
      const activeElement = document.activeElement as HTMLElement;
      const isInputFocused = activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA';
      
      // Ctrl/Cmd shortcuts
      const isMeta = e.ctrlKey || e.metaKey;
      
      // Global shortcut: Ctrl+F / Cmd+F - Focus search bar
      if (isMeta && e.key === 'f') {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
        searchInput?.focus();
      }
      
      // Global shortcut: Ctrl+N / Cmd+N - New note
      if (isMeta && e.key === 'n' && !isInputFocused) {
        e.preventDefault();
        resetEditor();
        setShowTemplatesModal(true);
      }
      
      // Global shortcut: Ctrl+S / Cmd+S - Save current note
      if (isMeta && e.key === 's') {
        e.preventDefault();
        saveNote();
      }
      
      // Global shortcut: Escape - Close modals, clear search, exit bulk mode
      if (e.key === 'Escape') {
        if (showNewNoteModal) setShowNewNoteModal(false);
        if (showTemplatesModal) setShowTemplatesModal(false);
        if (showFolderModal) setShowFolderModal(false);
        if (showImportExportModal) setShowImportExportModal(false);
        if (showHistoryPanel) setShowHistoryPanel(false);
        if (bulkMode) setBulkMode(false);
        if (searchQuery) setSearchQuery('');
      }
      
      // Note navigation: Arrow Up/Down - Navigate note list
      if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && !isInputFocused && filteredNotes.length > 0) {
        const currentIndex = selectedNote 
          ? filteredNotes.findIndex(n => n.id === selectedNote.id)
          : -1;
        
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (currentIndex > 0) {
            openNote(filteredNotes[currentIndex - 1]);
          } else if (currentIndex === -1) {
            openNote(filteredNotes[filteredNotes.length - 1]);
          }
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (currentIndex >= 0 && currentIndex < filteredNotes.length - 1) {
            openNote(filteredNotes[currentIndex + 1]);
          } else if (currentIndex === -1) {
            openNote(filteredNotes[0]);
          }
        }
      }
      
      // Note navigation: Enter - Open selected note
      if (e.key === 'Enter' && !isInputFocused && !selectedNote && filteredNotes.length > 0) {
        e.preventDefault();
        openNote(filteredNotes[0]);
      }
      
      // Note navigation: Delete - Delete selected note
      if (e.key === 'Delete' && selectedNote && !isInputFocused) {
        e.preventDefault();
        if (confirm(`Delete "${selectedNote.title}"?`)) {
          deleteNote(selectedNote.id);
          setSelectedNote(null);
          resetEditor();
        }
      }
      
      // Note navigation: Space - Select note in bulk mode
      if (e.key === ' ' && bulkMode && !isInputFocused && selectedNote) {
        e.preventDefault();
        toggleNoteSelection(selectedNote.id);
      }
      
      // Editor shortcuts - only when note is selected
      if (selectedNote && isInputFocused === false) {
        // Ctrl+B - Bold
        if (isMeta && e.key === 'b' && activeElement?.closest('[data-color-mode]')) {
          e.preventDefault();
          setEditContent(prev => {
            const selection = window.getSelection();
            if (selection && selection.toString()) {
              const text = selection.toString();
              return prev.replace(text, `**${text}**`);
            }
            return prev;
          });
        }
        
        // Ctrl+I - Italic
        if (isMeta && e.key === 'i' && activeElement?.closest('[data-color-mode]')) {
          e.preventDefault();
          setEditContent(prev => {
            const selection = window.getSelection();
            if (selection && selection.toString()) {
              const text = selection.toString();
              return prev.replace(text, `*${text}*`);
            }
            return prev;
          });
        }
        
        // Ctrl+K - Link
        if (isMeta && e.key === 'k' && activeElement?.closest('[data-color-mode]')) {
          e.preventDefault();
          setEditContent(prev => {
            const selection = window.getSelection();
            if (selection && selection.toString()) {
              const text = selection.toString();
              return prev.replace(text, `[${text}](url)`);
            }
            return prev;
          });
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedNote, filteredNotes, searchQuery, bulkMode, showNewNoteModal, showTemplatesModal, showFolderModal, showImportExportModal, showHistoryPanel, editContent, saveNote, resetEditor, deleteNote, toggleNoteSelection, openNote, setEditContent]);

  // Handle search with history
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      addRecentSearch(query);
    }
  };

  // Handle text selection for highlighting
  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelectedText(selection.toString());
      setHighlightPosition({ x: rect.left + rect.width / 2, y: rect.top - 10 });
      setShowHighlightMenu(true);
    } else {
      setShowHighlightMenu(false);
    }
  };

  // Add highlight
  const addHighlight = (color: HighlightColor) => {
    if (selectedNote && selectedText) {
      addHighlightToNote(selectedNote.id, {
        text: selectedText,
        color,
      });
      setShowHighlightMenu(false);
      setSelectedText('');
    }
  };

  // Export note
  const handleExport = (format: 'markdown' | 'copy') => {
    if (!selectedNote) return;
    
    const content = exportNoteToMarkdown(selectedNote.id);
    
    if (format === 'copy') {
      navigator.clipboard.writeText(content);
    } else {
      const blob = new Blob([content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedNote.title.replace(/[^a-z0-9]/gi, '_')}.md`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // Export all notes
  const handleExportAll = () => {
    const content = exportAllNotesToJson();
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notes_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import notes
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const result = importNotesFromJson(content);
      if (result.success) {
        alert(`Imported ${result.count} notes successfully!`);
      } else {
        alert(`Import failed: ${result.error}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Backup all data
  const handleBackup = () => {
    const content = backupAllData();
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `full_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Restore revision
  const handleRestoreRevision = (revisionId: string) => {
    if (selectedNote) {
      restoreNoteRevision(selectedNote.id, revisionId);
      const note = notes.find(n => n.id === selectedNote.id);
      if (note) {
        setEditTitle(note.title);
        setEditContent(note.content);
      }
    }
  };

  // Create folder
  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    addNoteFolder({
      name: newFolderName,
      color: newFolderColor,
    });
    setNewFolderName('');
    setShowFolderModal(false);
  };

  // Bulk actions
  const handleBulkDelete = () => {
    if (confirm(`Delete ${selectedNoteIds.length} notes?`)) {
      bulkDeleteNotes(selectedNoteIds);
      setSelectedNoteIds([]);
      setBulkMode(false);
    }
  };

  const handleBulkMove = (folderId: string | undefined) => {
    bulkMoveNotes(selectedNoteIds, folderId);
    setSelectedNoteIds([]);
    setShowBulkFolderMenu(false);
  };

  // Determine if current editing should be RTL
  const isCurrentNoteRTL = editLanguage === 'ar' || (editLanguage === 'auto' && selectedNote?.isRTL);

  // Folder colors
  const folderColors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-orange-500', 'bg-cyan-500'];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      className={`flex-1 flex flex-col min-h-screen bg-background ${isRTL ? 'rtl' : 'ltr'}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface-container/95 backdrop-blur-xl border-b border-outline-variant/10">
        <div className="px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => onNavigate('dashboard')}
                className="p-2 rounded-lg hover:bg-surface-container-high text-on-surface-variant transition-colors"
              >
                {isRTL ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
              </button>
              <div>
                <h1 className="font-headline text-2xl font-bold text-on-surface">{str.title}</h1>
                <p className="text-sm text-on-surface-variant">{filteredNotes.length} {str.allNotes.toLowerCase()}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Storage Indicator */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container">
                <HardDrive className="w-4 h-4 text-on-surface-variant" />
                <div className="w-16 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${storagePercent > 80 ? 'bg-red-500' : 'bg-primary'}`}
                    style={{ width: `${storagePercent}%` }}
                  />
                </div>
                <span className="text-[10px] text-on-surface-variant">{formatFileSize(storageInfo.used)}</span>
              </div>

              <button
                onClick={() => setUiLang(uiLang === 'en' ? 'ar' : 'en')}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors text-sm font-medium text-on-surface-variant"
              >
                <Languages className="w-4 h-4" />
                {uiLang === 'en' ? 'عربي' : 'EN'}
              </button>
              
              <button
                onClick={() => setShowImportExportModal(true)}
                className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors"
                title={str.exportAll}
              >
                <FileDown className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => { resetEditor(); setShowTemplatesModal(true); }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-on-primary font-medium text-sm hover:opacity-90 transition-opacity"
              >
                <Plus className="w-4 h-4" />
                {str.newNote}
              </button>
            </div>
          </div>
          
          {/* Search and Filters */}
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-outline`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => setShowRecentSearches(true)}
                onBlur={() => setTimeout(() => setShowRecentSearches(false), 200)}
                placeholder={str.search}
                className={`w-full bg-surface-container border border-outline-variant/10 rounded-lg py-2 ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} text-sm text-on-surface placeholder:text-outline focus:ring-1 focus:ring-primary focus:outline-none`}
              />
              {/* Recent Searches Dropdown */}
              {showRecentSearches && notesStats.recentSearches.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-surface-container-high rounded-lg shadow-xl border border-outline-variant/10 z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-outline-variant/10">
                    <span className="text-xs text-on-surface-variant">{str.recentSearches}</span>
                    <button onClick={clearRecentSearches} className="text-[10px] text-primary hover:underline">
                      {str.clearHistory}
                    </button>
                  </div>
                  {notesStats.recentSearches.slice(0, 5).map((search, i) => (
                    <button
                      key={i}
                      onClick={() => { setSearchQuery(search); setShowRecentSearches(false); }}
                      className="w-full px-3 py-2 text-sm text-on-surface-variant hover:bg-surface-container text-left"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Modality Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {(['all', 'video', 'document', 'audio', 'course', 'general'] as const).map(mod => {
                const Icon = mod === 'all' ? Filter : modalityIcons[mod];
                return (
                  <button
                    key={mod}
                    onClick={() => setFilterModality(mod)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                      filterModality === mod 
                        ? 'bg-primary text-on-primary' 
                        : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {mod === 'all' ? str.allNotes : str[mod as keyof typeof str]}
                  </button>
                );
              })}
            </div>
            
            {/* Bulk Mode Toggle */}
            <button
              onClick={() => { setBulkMode(!bulkMode); setSelectedNoteIds([]); }}
              className={`p-1.5 rounded-lg transition-colors ${bulkMode ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}
            >
              <Check className="w-4 h-4" />
            </button>
            
            {/* View Mode */}
            <div className="flex items-center gap-1 bg-surface-container rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-primary text-on-primary' : 'text-on-surface-variant'}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-primary text-on-primary' : 'text-on-surface-variant'}`}
              >
                <LayoutList className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Bulk Actions Bar */}
          {bulkMode && selectedNoteIds.length > 0 && (
            <div className="flex items-center gap-3 mt-3 p-3 bg-primary/10 rounded-lg">
              <span className="text-sm text-primary font-medium">{selectedNoteIds.length} {str.selected}</span>
              <div className="flex-1" />
              <div className="relative">
                <button
                  onClick={() => setShowBulkFolderMenu(!showBulkFolderMenu)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-surface-container rounded-lg text-xs font-medium text-on-surface-variant hover:bg-surface-container-high"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  {str.moveToFolder}
                  <ChevronDown className="w-3 h-3" />
                </button>
                {showBulkFolderMenu && (
                  <div className="absolute top-full left-0 mt-1 bg-surface-container-high rounded-lg shadow-xl border border-outline-variant/10 z-50 min-w-[150px]">
                    <button
                      onClick={() => handleBulkMove(undefined)}
                      className="w-full px-3 py-2 text-xs text-left text-on-surface-variant hover:bg-surface-container"
                    >
                      {str.noFolder}
                    </button>
                    {noteFolders.map(folder => (
                      <button
                        key={folder.id}
                        onClick={() => handleBulkMove(folder.id)}
                        className="w-full px-3 py-2 text-xs text-left text-on-surface-variant hover:bg-surface-container flex items-center gap-2"
                      >
                        <div className={`w-3 h-3 rounded ${folder.color}`} />
                        {folder.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/30"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {str.deleteSelected}
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Folders Sidebar */}
        {showSidebar && (
          <div className={`w-56 border-r border-outline-variant/10 bg-surface-container-low p-4 overflow-y-auto hidden lg:block ${isRTL ? 'border-l border-r-0' : ''}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-headline font-bold text-on-surface text-sm">{str.folders}</h3>
              <button
                onClick={() => setShowFolderModal(true)}
                className="p-1 rounded hover:bg-surface-container text-on-surface-variant"
              >
                <FolderPlus className="w-4 h-4" />
              </button>
            </div>
            
            {/* All Notes */}
            <button
              onClick={() => setFilterFolderId(null)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                filterFolderId === null ? 'bg-primary/20 text-primary' : 'text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span className="flex-1 text-left">{str.allNotes}</span>
              <span className="text-xs opacity-60">{notes.length}</span>
            </button>
            
            {/* Favorites */}
            <button
              onClick={() => { setFilterFolderId(null); setFilterModality('all'); }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-on-surface-variant hover:bg-surface-container transition-colors"
            >
              <Star className="w-4 h-4" />
              <span className="flex-1 text-left">{str.favorites}</span>
              <span className="text-xs opacity-60">{notes.filter(n => n.isFavorite).length}</span>
            </button>
            
            <div className="h-px bg-outline-variant/10 my-3" />
            
            {/* Folder List */}
            {noteFolders.sort((a, b) => a.order - b.order).map(folder => (
              <div key={folder.id} className="group">
                <button
                  onClick={() => setFilterFolderId(folder.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    filterFolderId === folder.id ? 'bg-primary/20 text-primary' : 'text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <div className={`w-4 h-4 rounded ${folder.color} flex items-center justify-center`}>
                    <Folder className="w-3 h-3 text-white" />
                  </div>
                  <span className="flex-1 text-left truncate">{folder.name}</span>
                  <span className="text-xs opacity-60">{getNotesByFolder(folder.id).length}</span>
                </button>
              </div>
            ))}
            
            {noteFolders.length === 0 && (
              <p className="text-xs text-on-surface-variant text-center py-4 opacity-60">
                {str.newFolder}
              </p>
            )}
          </div>
        )}

        {/* Notes List */}
        <div className={`flex-1 overflow-y-auto p-6 ${selectedNote ? 'hidden lg:block lg:w-1/3 lg:border-r border-outline-variant/10' : ''}`}>
          {filteredNotes.length === 0 ? (
            <motion.div 
              variants={itemVariants}
              className="flex flex-col items-center justify-center h-full text-center py-20"
            >
              <div className="w-20 h-20 rounded-2xl bg-surface-container flex items-center justify-center mb-6">
                <FileText className="w-10 h-10 text-on-surface-variant" />
              </div>
              <h2 className="font-headline text-xl font-bold text-on-surface mb-2">{str.noNotes}</h2>
              <p className="text-on-surface-variant mb-6">{str.startWriting}</p>
              <button
                onClick={() => { resetEditor(); setShowTemplatesModal(true); }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-on-primary font-medium"
              >
                <Plus className="w-4 h-4" />
                {str.createFirst}
              </button>
            </motion.div>
          ) : (
            <motion.div 
              variants={containerVariants}
              className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-5' : 'space-y-3'}
            >
              {filteredNotes.map(note => {
                const Icon = modalityIcons[note.modality];
                const isSelected = selectedNoteIds.includes(note.id);
                // Strip markdown syntax for plain-text preview
                const plainPreview = note.content
                  .replace(/^#{1,6}\s+/gm, '')
                  .replace(/\*\*(.+?)\*\*/g, '$1')
                  .replace(/\*(.+?)\*/g, '$1')
                  .replace(/__(.+?)__/g, '$1')
                  .replace(/_(.+?)_/g, '$1')
                  .replace(/`{1,3}[^`]*`{1,3}/g, '')
                  .replace(/!\[.*?\]\(.*?\)/g, '')
                  .replace(/\[(.+?)\]\(.*?\)/g, '$1')
                  .replace(/^>\s+/gm, '')
                  .replace(/^[-*+]\s+/gm, '')
                  .replace(/^\d+\.\s+/gm, '')
                  .replace(/^-{3,}$/gm, '')
                  .replace(/\n{2,}/g, '\n')
                  .trim();

                return (
                  <motion.div
                    key={note.id}
                    variants={itemVariants}
                    onClick={() => openNote(note)}
                    className={`relative bg-surface-container rounded-2xl border transition-all cursor-pointer group ${
                      viewMode === 'list' ? 'flex items-start gap-5 px-5 py-4' : 'p-5'
                    } ${note.isRTL ? 'text-right' : 'text-left'} ${
                      selectedNote?.id === note.id
                        ? 'ring-2 ring-primary border-primary/30 bg-primary/5'
                        : 'border-outline-variant/10 hover:border-primary/30 hover:bg-surface-container-high/50'
                    } ${isSelected ? 'ring-2 ring-primary bg-primary/5' : ''}`}
                    dir={note.isRTL ? 'rtl' : 'ltr'}
                  >
                    {/* Bulk Selection Checkbox */}
                    {bulkMode && (
                      <div className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-3`}>
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          isSelected ? 'bg-primary border-primary' : 'border-outline-variant'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 text-on-primary" />}
                        </div>
                      </div>
                    )}

                    {/* List-mode left icon strip */}
                    {viewMode === 'list' && (
                      <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center mt-0.5 ${
                        note.modality === 'video' ? 'bg-tertiary/15 text-tertiary' :
                        note.modality === 'document' ? 'bg-primary/15 text-primary' :
                        note.modality === 'audio' ? 'bg-purple-500/15 text-purple-400' :
                        note.modality === 'course' ? 'bg-green-500/15 text-green-400' :
                        'bg-surface-container-high text-on-surface-variant'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                    )}
                    
                    <div className={viewMode === 'list' ? 'flex-1 min-w-0' : 'flex flex-col h-full'}>
                      {/* Top row: badges + pins */}
                      <div className="flex items-center gap-2 mb-3">
                        {note.isPinned && <Pin className="w-3.5 h-3.5 text-primary shrink-0" />}
                        {note.isFavorite && <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 shrink-0" />}
                        {viewMode === 'grid' && (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            note.modality === 'video' ? 'bg-tertiary/15 text-tertiary' :
                            note.modality === 'document' ? 'bg-primary/15 text-primary' :
                            note.modality === 'audio' ? 'bg-purple-500/15 text-purple-400' :
                            note.modality === 'course' ? 'bg-green-500/15 text-green-400' :
                            'bg-surface-container-high text-on-surface-variant'
                          }`}>
                            <Icon className="w-3 h-3" />
                            {str[note.modality as keyof typeof str]}
                          </span>
                        )}
                        {note.folderId && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-md">
                            <Folder className="w-3 h-3" />
                            {noteFolders.find(f => f.id === note.folderId)?.name}
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="font-headline font-bold text-base text-on-surface mb-2 line-clamp-1 leading-snug">
                        {note.title}
                      </h3>

                      {/* Plain-text preview — 3 lines in grid, 2 in list */}
                      <p className={`text-sm text-on-surface-variant leading-relaxed mb-3 ${
                        viewMode === 'grid' ? 'line-clamp-3' : 'line-clamp-2'
                      }`}>
                        {plainPreview || '—'}
                      </p>

                      {/* Highlights dots */}
                      {note.highlights.length > 0 && (
                        <div className="flex items-center gap-1.5 mb-3">
                          <Highlighter className="w-3 h-3 text-on-surface-variant" />
                          <span className="text-xs text-on-surface-variant">{note.highlights.length}</span>
                          <div className="flex -space-x-1">
                            {[...new Set(note.highlights.map(h => h.color))].slice(0, 5).map(color => (
                              <div key={color} className={`w-3 h-3 rounded-full ${highlightColors[color].bg} ring-1 ring-surface-container`} />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Footer row */}
                      <div className="flex items-center gap-3 text-xs text-outline mt-auto pt-1 border-t border-outline-variant/10">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(note.updatedAt).toLocaleDateString(note.isRTL ? 'ar-SA' : 'en-US')}
                        </span>
                        <span>{note.wordCount} {str.words}</span>
                        {note.sourceTimestamp && (
                          <span className="flex items-center gap-1 ml-auto">
                            <Link2 className="w-3 h-3" />
                            {note.sourceTimestamp}
                          </span>
                        )}
                        {note.sourcePageNumber && (
                          <span className="flex items-center gap-1 ml-auto">
                            <FileText className="w-3 h-3" />
                            p. {note.sourcePageNumber}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>

        {/* Note Editor with MD Editor */}
        <AnimatePresence>
          {selectedNote && (
            <motion.div
              initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isRTL ? -20 : 20 }}
              className="flex-1 flex flex-col bg-surface-container-low lg:w-2/3"
            >
              {/* Editor Header */}
              <div className="sticky top-0 z-30 bg-surface-container-low/95 backdrop-blur-xl border-b border-outline-variant/10 p-4">
                <div className="flex items-center justify-between gap-4">
                  <button
                    onClick={() => { saveNote(); setSelectedNote(null); }}
                    className="lg:hidden p-2 rounded-lg hover:bg-surface-container text-on-surface-variant"
                  >
                    {isRTL ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                  </button>
                  
                  {/* Save Status */}
                  <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                    {isSaving ? (
                      <>
                        <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                        {str.autoSaving}
                      </>
                    ) : lastSaved ? (
                      <>
                        <Save className="w-3 h-3 text-green-400" />
                        {str.savedLocally}
                      </>
                    ) : null}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Language Selector */}
                    <select
                      value={editLanguage}
                      onChange={(e) => setEditLanguage(e.target.value as 'en' | 'ar' | 'auto')}
                      className="bg-surface-container border-none rounded-lg py-1.5 px-2 text-xs text-on-surface"
                    >
                      <option value="auto">{str.auto}</option>
                      <option value="en">{str.english}</option>
                      <option value="ar">{str.arabic}</option>
                    </select>
                    
                    {/* Version History */}
                    <button
                      onClick={() => setShowHistoryPanel(!showHistoryPanel)}
                      className={`p-2 rounded-lg transition-colors ${showHistoryPanel ? 'bg-primary/20 text-primary' : 'text-on-surface-variant hover:bg-surface-container'}`}
                      title={str.versionHistory}
                    >
                      <History className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => updateNote(selectedNote.id, { isPinned: !selectedNote.isPinned })}
                      className={`p-2 rounded-lg transition-colors ${selectedNote.isPinned ? 'bg-primary/20 text-primary' : 'text-on-surface-variant hover:bg-surface-container'}`}
                      title={str.pin}
                    >
                      <Pin className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => updateNote(selectedNote.id, { isFavorite: !selectedNote.isFavorite })}
                      className={`p-2 rounded-lg transition-colors ${selectedNote.isFavorite ? 'text-yellow-400' : 'text-on-surface-variant hover:bg-surface-container'}`}
                      title={str.favorite}
                    >
                      <Star className={`w-4 h-4 ${selectedNote.isFavorite ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      onClick={() => handleExport('markdown')}
                      className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
                      title={str.exportMd}
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleExport('copy')}
                      className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
                      title={str.copyContent}
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => { deleteNote(selectedNote.id); setSelectedNote(null); }}
                      className="p-2 rounded-lg text-on-surface-variant hover:bg-red-500/20 hover:text-red-400 transition-colors"
                      title={str.delete}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex-1 flex overflow-hidden">
                {/* Main Editor */}
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Title Input */}
                  <div className="px-6 pt-4">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder={str.untitled}
                      className={`w-full bg-transparent border-none text-2xl font-headline font-bold text-on-surface placeholder:text-outline focus:ring-0 focus:outline-none ${
                        isCurrentNoteRTL ? 'text-right' : 'text-left'
                      }`}
                      dir={isCurrentNoteRTL ? 'rtl' : 'ltr'}
                    />
                  </div>

                  {/* Tags */}
                  <div className="px-6 pb-4">
                    <TagManager
                      noteId={selectedNote?.id || ''}
                      currentTags={editTags}
                      onTagsChange={setEditTags}
                      aria-label="Note tags"
                    />
                  </div>

                  {/* Mobile Editor/Preview Toggle (lg:hidden) */}
                  <div className="lg:hidden flex border-b border-outline-variant/10 shrink-0">
                    <button
                      onClick={() => setMobileEditorMode('edit')}
                      className={`flex-1 py-2.5 text-xs font-bold tracking-widest uppercase transition-colors ${
                        mobileEditorMode === 'edit'
                          ? 'text-primary border-b-2 border-primary bg-primary/5'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      {str.editor}
                    </button>
                    <button
                      onClick={() => setMobileEditorMode('preview')}
                      className={`flex-1 py-2.5 text-xs font-bold tracking-widest uppercase transition-colors ${
                        mobileEditorMode === 'preview'
                          ? 'text-primary border-b-2 border-primary bg-primary/5'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      {str.preview}
                    </button>
                  </div>

                  {/* MD Editor */}
                  <div className="flex-1 overflow-hidden p-2 sm:p-4" data-color-mode="dark">
                    {/* Desktop: side-by-side (live) */}
                    <div className="hidden lg:block h-full">
                      <MDEditor
                        value={editContent}
                        onChange={(val) => setEditContent(val || '')}
                        height="100%"
                        preview="live"
                        className={isCurrentNoteRTL ? 'rtl-editor' : ''}
                        textareaProps={{
                          placeholder: str.writeHere,
                          dir: isCurrentNoteRTL ? 'rtl' : 'ltr',
                          style: {
                            textAlign: isCurrentNoteRTL ? 'right' : 'left',
                          }
                        }}
                        previewOptions={{
                          style: {
                            direction: isCurrentNoteRTL ? 'rtl' : 'ltr',
                            textAlign: isCurrentNoteRTL ? 'right' : 'left',
                          }
                        }}
                      />
                    </div>
                    {/* Mobile: tabbed edit/preview */}
                    <div className="lg:hidden h-full">
                      <MDEditor
                        value={editContent}
                        onChange={(val) => setEditContent(val || '')}
                        height="100%"
                        preview={mobileEditorMode}
                        className={isCurrentNoteRTL ? 'rtl-editor' : ''}
                        textareaProps={{
                          placeholder: str.writeHere,
                          dir: isCurrentNoteRTL ? 'rtl' : 'ltr',
                          style: {
                            textAlign: isCurrentNoteRTL ? 'right' : 'left',
                          }
                        }}
                        previewOptions={{
                          style: {
                            direction: isCurrentNoteRTL ? 'rtl' : 'ltr',
                            textAlign: isCurrentNoteRTL ? 'right' : 'left',
                          }
                        }}
                        hideToolbar={mobileEditorMode === 'preview'}
                      />
                    </div>
                  </div>

                  {/* Highlights Section */}
                  {selectedNote.highlights.length > 0 && (
                    <div className="border-t border-outline-variant/10 p-4 max-h-48 overflow-y-auto" onMouseUp={handleTextSelection}>
                      <h3 className="font-headline font-bold text-on-surface mb-3 flex items-center gap-2 text-sm">
                        <Highlighter className="w-4 h-4 text-primary" />
                        {str.highlights} ({selectedNote.highlights.length})
                      </h3>
                      <div className="space-y-2">
                        {selectedNote.highlights.map(highlight => (
                          <div
                            key={highlight.id}
                            className={`p-2 rounded-lg border-l-4 ${highlightColors[highlight.color].bg} ${highlightColors[highlight.color].border} flex items-start justify-between gap-2`}
                            dir={selectedNote.isRTL ? 'rtl' : 'ltr'}
                          >
                            <p className={`text-xs ${highlightColors[highlight.color].text} flex-1`}>"{highlight.text}"</p>
                            <button
                              onClick={() => removeHighlightFromNote(selectedNote.id, highlight.id)}
                              className="text-on-surface-variant hover:text-red-400 transition-colors shrink-0"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Status Bar */}
                  <div className="border-t border-outline-variant/10 px-4 py-2 flex items-center justify-between text-xs text-on-surface-variant">
                    <div className="flex items-center gap-4">
                      <span>{selectedNote.wordCount} {str.words}</span>
                      <span>{selectedNote.readingTime} {str.minRead}</span>
                      {selectedNote.sourceName && (
                        <span className="flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          {selectedNote.sourceName}
                        </span>
                      )}
                      {selectedNote.sourceTimestamp && (
                        <span className="flex items-center gap-1 text-primary">
                          <Clock className="w-3 h-3" />
                          {selectedNote.sourceTimestamp}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span>v{selectedNote.currentRevision || 1}</span>
                      <span>{str.updated}: {new Date(selectedNote.updatedAt).toLocaleString(selectedNote.isRTL ? 'ar-SA' : 'en-US')}</span>
                    </div>
                  </div>
                </div>

                {/* Version History Panel */}
                {showHistoryPanel && (
                  <div className="w-64 border-l border-outline-variant/10 bg-surface-container p-4 overflow-y-auto">
                    <h3 className="font-headline font-bold text-on-surface text-sm mb-4 flex items-center gap-2">
                      <History className="w-4 h-4" />
                      {str.versionHistory}
                    </h3>
                    {currentRevisions.length === 0 ? (
                      <p className="text-xs text-on-surface-variant text-center py-4">No previous versions</p>
                    ) : (
                      <div className="space-y-2">
                        {currentRevisions.map(rev => (
                          <div
                            key={rev.id}
                            className="p-3 rounded-lg bg-surface-container-high hover:bg-surface-container-highest transition-colors"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-on-surface">{str.revision} {rev.revisionNumber}</span>
                              <button
                                onClick={() => handleRestoreRevision(rev.id)}
                                className="text-[10px] text-primary hover:underline flex items-center gap-1"
                              >
                                <RotateCcw className="w-3 h-3" />
                                {str.restore}
                              </button>
                            </div>
                            <p className="text-[10px] text-on-surface-variant">{new Date(rev.timestamp).toLocaleString()}</p>
                            <p className="text-[10px] text-outline mt-1">{rev.wordCount} {str.words}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Highlight Menu Popup */}
      <AnimatePresence>
        {showHighlightMenu && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed z-50 bg-surface-container-high rounded-lg shadow-xl border border-outline-variant/10 p-2 flex items-center gap-1"
            style={{ left: highlightPosition.x - 80, top: highlightPosition.y - 50 }}
          >
            {(Object.keys(highlightColors) as HighlightColor[]).map(color => (
              <button
                key={color}
                onClick={() => addHighlight(color)}
                className={`w-6 h-6 rounded-full ${highlightColors[color].bg} border-2 ${highlightColors[color].border} hover:scale-110 transition-transform`}
                title={isRTL ? highlightColors[color].nameAr : highlightColors[color].name}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Templates Modal */}
      <AnimatePresence>
        {showTemplatesModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowTemplatesModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`bg-surface-container-low rounded-2xl w-full max-w-2xl max-h-[90dvh] flex flex-col ${isRTL ? 'text-right' : 'text-left'}`}
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              {/* Header — fixed, never scrolls */}
              <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-outline-variant/10 shrink-0">
                <div>
                  <h2 className="font-headline text-lg font-bold text-on-surface">{str.templates}</h2>
                  <p className="text-xs text-on-surface-variant mt-0.5">Pick a template to get started</p>
                </div>
                <button
                  onClick={() => setShowTemplatesModal(false)}
                  className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable body */}
              <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">

                {/* Template cards — horizontal scroll on mobile, grid on md+ */}
                <div>
                  {/* Mobile: horizontal pill-scroll */}
                  <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 snap-x snap-mandatory md:hidden">
                    {noteTemplates.map(template => {
                      const IconComponent = templateIcons[template.icon] || FileText;
                      return (
                        <button
                          key={template.id}
                          onClick={() => handleCreateNote(template.id)}
                          className="snap-start shrink-0 w-36 flex flex-col items-start gap-3 p-4 rounded-2xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/10 hover:border-primary/30 active:scale-95 transition-all text-left"
                        >
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <IconComponent className="w-5 h-5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-on-surface text-sm leading-snug">
                              {isRTL ? template.nameAr : template.name}
                            </p>
                            <p className="text-[11px] text-on-surface-variant mt-0.5 line-clamp-2 leading-relaxed">
                              {isRTL ? template.descriptionAr : template.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* md+: standard grid */}
                  <div className="hidden md:grid grid-cols-3 gap-3">
                    {noteTemplates.map(template => {
                      const IconComponent = templateIcons[template.icon] || FileText;
                      return (
                        <button
                          key={template.id}
                          onClick={() => handleCreateNote(template.id)}
                          className="flex flex-col gap-3 p-4 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/10 hover:border-primary/30 active:scale-95 transition-all text-left group"
                        >
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <IconComponent className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-on-surface text-sm leading-snug">
                              {isRTL ? template.nameAr : template.name}
                            </p>
                            <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-2 leading-relaxed">
                              {isRTL ? template.descriptionAr : template.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t border-outline-variant/10 pt-4">
                <h3 className="font-headline font-bold text-on-surface text-sm mb-4">{str.newNote}</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-on-surface-variant mb-1">{str.selectLanguage}</label>
                    <div className="flex gap-2">
                      {(['auto', 'en', 'ar'] as const).map(lang => (
                        <button
                          key={lang}
                          onClick={() => setEditLanguage(lang)}
                          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                            editLanguage === lang 
                              ? 'bg-primary text-on-primary' 
                              : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                          }`}
                        >
                          {lang === 'auto' ? str.auto : lang === 'en' ? str.english : str.arabic}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-on-surface-variant mb-1">{str.source}</label>
                    <div className="flex flex-wrap gap-2">
                      {(['general', 'video', 'document', 'audio', 'course'] as ContentModality[]).map(mod => {
                        const Icon = modalityIcons[mod];
                        return (
                          <button
                            key={mod}
                            onClick={() => setEditModality(mod)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              editModality === mod 
                                ? 'bg-primary text-on-primary' 
                                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            {str[mod as keyof typeof str]}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Timestamp/Page for video/document notes */}
                  {(editModality === 'video' || editModality === 'audio') && (
                    <div>
                      <label className="block text-sm font-medium text-on-surface-variant mb-1">{str.timestamp}</label>
                      <input
                        type="text"
                        value={editTimestamp}
                        onChange={(e) => setEditTimestamp(e.target.value)}
                        placeholder="00:00"
                        className="w-32 bg-surface-container border border-outline-variant/10 rounded-lg py-2 px-3 text-sm text-on-surface"
                      />
                    </div>
                  )}

                  {editModality === 'document' && (
                    <div>
                      <label className="block text-sm font-medium text-on-surface-variant mb-1">{str.pageNumber}</label>
                      <input
                        type="number"
                        value={editPageNumber || ''}
                        onChange={(e) => setEditPageNumber(e.target.value ? parseInt(e.target.value) : undefined)}
                        placeholder="1"
                        className="w-32 bg-surface-container border border-outline-variant/10 rounded-lg py-2 px-3 text-sm text-on-surface"
                      />
                    </div>
                  )}

                  {/* Folder selection */}
                  {noteFolders.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-on-surface-variant mb-1">{str.folders}</label>
                      <select
                        value={editFolderId || ''}
                        onChange={(e) => setEditFolderId(e.target.value || undefined)}
                        className="w-full bg-surface-container border border-outline-variant/10 rounded-lg py-2 px-3 text-sm text-on-surface"
                      >
                        <option value="">{str.noFolder}</option>
                        {noteFolders.map(folder => (
                          <option key={folder.id} value={folder.id}>{folder.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
                </div>

              </div>

            {/* Sticky action footer */}
            <div className={`flex gap-3 px-5 py-4 border-t border-outline-variant/10 shrink-0 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <button
                onClick={() => setShowTemplatesModal(false)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-surface-container text-on-surface-variant font-medium hover:bg-surface-container-high transition-colors text-sm"
              >
                {str.cancel}
              </button>
              <button
                onClick={() => handleCreateNote()}
                className="flex-1 py-2.5 px-4 rounded-xl bg-primary text-on-primary font-medium hover:opacity-90 transition-opacity text-sm"
              >
                {str.create}
              </button>
            </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Folder Creation Modal */}
      <AnimatePresence>
        {showFolderModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowFolderModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface-container-low rounded-2xl w-full max-w-sm p-6"
            >
              <h2 className="font-headline text-xl font-bold text-on-surface mb-4">{str.newFolder}</h2>
              
              <div className="space-y-4">
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Folder name"
                  className="w-full bg-surface-container border border-outline-variant/10 rounded-lg py-2 px-3 text-on-surface"
                  autoFocus
                />
                
                <div>
                  <label className="block text-sm text-on-surface-variant mb-2">Color</label>
                  <div className="flex gap-2">
                    {folderColors.map(color => (
                      <button
                        key={color}
                        onClick={() => setNewFolderColor(color)}
                        className={`w-8 h-8 rounded-full ${color} ${newFolderColor === color ? 'ring-2 ring-primary ring-offset-2 ring-offset-surface-container-low' : ''}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowFolderModal(false)}
                  className="flex-1 py-2 px-4 rounded-lg bg-surface-container text-on-surface-variant font-medium"
                >
                  {str.cancel}
                </button>
                <button
                  onClick={handleCreateFolder}
                  disabled={!newFolderName.trim()}
                  className="flex-1 py-2 px-4 rounded-lg bg-primary text-on-primary font-medium disabled:opacity-50"
                >
                  {str.create}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Import/Export Modal */}
      <AnimatePresence>
        {showImportExportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowImportExportModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface-container-low rounded-2xl w-full max-w-md p-6"
            >
              <h2 className="font-headline text-xl font-bold text-on-surface mb-6">Import / Export</h2>
              
              {/* Storage Info */}
              <div className="bg-surface-container rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-on-surface-variant">{str.storageUsed}</span>
                  <span className="text-sm font-medium text-on-surface">{formatFileSize(storageInfo.used)} / {formatFileSize(storageInfo.available)}</span>
                </div>
                <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${storagePercent > 80 ? 'bg-red-500' : 'bg-primary'}`}
                    style={{ width: `${storagePercent}%` }}
                  />
                </div>
                <p className="text-xs text-on-surface-variant mt-2">{notes.length} notes, {noteFolders.length} folders</p>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={handleExportAll}
                  className="w-full flex items-center gap-3 p-4 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors"
                >
                  <Download className="w-5 h-5 text-primary" />
                  <div className="text-left">
                    <p className="font-medium text-on-surface">{str.exportAll}</p>
                    <p className="text-xs text-on-surface-variant">Export as JSON file</p>
                  </div>
                </button>
                
                <label className="w-full flex items-center gap-3 p-4 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors cursor-pointer">
                  <FileUp className="w-5 h-5 text-primary" />
                  <div className="text-left">
                    <p className="font-medium text-on-surface">{str.importNotes}</p>
                    <p className="text-xs text-on-surface-variant">Import from JSON file</p>
                  </div>
                  <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                </label>
                
                <button
                  onClick={handleBackup}
                  className="w-full flex items-center gap-3 p-4 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors"
                >
                  <HardDrive className="w-5 h-5 text-primary" />
                  <div className="text-left">
                    <p className="font-medium text-on-surface">{str.backupAll}</p>
                    <p className="text-xs text-on-surface-variant">Full backup including settings</p>
                  </div>
                </button>
              </div>
              
              <button
                onClick={() => setShowImportExportModal(false)}
                className="w-full py-2 px-4 rounded-lg bg-surface-container text-on-surface-variant font-medium mt-6 hover:bg-surface-container-high transition-colors"
              >
                {str.cancel}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
