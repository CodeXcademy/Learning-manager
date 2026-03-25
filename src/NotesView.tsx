import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, Variants, AnimatePresence } from 'motion/react';
import { 
  Plus, Search, X, MoreVertical, Trash2, Pin, Star, Clock, 
  FileText, Video, Music, BookOpen, FolderOpen, Download, Copy,
  ChevronLeft, ChevronRight, Edit3, Eye, Highlighter, Tag,
  Languages, AlignLeft, AlignRight, Bold, Italic, List, ListOrdered,
  Link2, Code, Quote, Image, Heading1, Heading2, CheckSquare,
  Calendar, Filter, SortAsc, Grid3X3, LayoutList, Sparkles
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useData } from './store/DataContext';
import { Note, TextHighlight, HighlightColor, highlightColors, ContentModality } from './store/localDataStore';

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
    exportPdf: 'Export as PDF',
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
    typeToSearch: 'Type to search...',
    noResults: 'No notes found',
    highlightText: 'Highlight selected text',
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
    exportPdf: 'تصدير كـ PDF',
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
    typeToSearch: 'اكتب للبحث...',
    noResults: 'لم يتم العثور على ملاحظات',
    highlightText: 'تمييز النص المحدد',
  }
};

const modalityIcons: Record<ContentModality, typeof Video> = {
  video: Video,
  document: FileText,
  audio: Music,
  course: BookOpen,
  general: FileText,
};

export function NotesView({ onNavigate }: NotesViewProps) {
  const { notes, addNote, updateNote, deleteNote, addHighlightToNote, removeHighlightFromNote, exportNoteToMarkdown, courses } = useData();
  
  // UI State
  const [uiLang, setUiLang] = useState<'en' | 'ar'>('en');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showNewNoteModal, setShowNewNoteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModality, setFilterModality] = useState<ContentModality | 'all'>('all');
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showHighlightMenu, setShowHighlightMenu] = useState(false);
  const [highlightPosition, setHighlightPosition] = useState({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState('');
  
  // Editor State
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editLanguage, setEditLanguage] = useState<'en' | 'ar' | 'auto'>('auto');
  const [editModality, setEditModality] = useState<ContentModality>('general');
  const [editSourceId, setEditSourceId] = useState('');
  
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const str = t[uiLang];
  const isRTL = uiLang === 'ar';

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  // Filter notes
  const filteredNotes = notes.filter(note => {
    const matchesSearch = searchQuery === '' || 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesModality = filterModality === 'all' || note.modality === filterModality;
    const matchesFavorites = !filterFavorites || note.isFavorite;
    return matchesSearch && matchesModality && matchesFavorites;
  }).sort((a, b) => {
    // Pinned first, then by date
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  // Create new note
  const handleCreateNote = () => {
    const newNote = addNote({
      title: editTitle || str.untitled,
      content: editContent,
      language: editLanguage,
      isRTL: editLanguage === 'ar',
      modality: editModality,
      sourceType: editSourceId ? 'course' : 'standalone',
      sourceId: editSourceId || undefined,
      sourceName: editSourceId ? courses.find(c => c.id === editSourceId)?.title : undefined,
      highlights: [],
      tags: [],
      isFavorite: false,
      isPinned: false,
    });
    setSelectedNote(newNote);
    setShowNewNoteModal(false);
    resetEditor();
  };

  // Reset editor
  const resetEditor = () => {
    setEditTitle('');
    setEditContent('');
    setEditLanguage('auto');
    setEditModality('general');
    setEditSourceId('');
  };

  // Open note for editing
  const openNote = (note: Note) => {
    setSelectedNote(note);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditLanguage(note.language);
    setIsEditing(true);
  };

  // Save current note
  const saveNote = useCallback(() => {
    if (selectedNote) {
      updateNote(selectedNote.id, {
        title: editTitle,
        content: editContent,
        language: editLanguage,
      });
    }
  }, [selectedNote, editTitle, editContent, editLanguage, updateNote]);

  // Auto-save
  useEffect(() => {
    if (selectedNote && isEditing) {
      const timer = setTimeout(saveNote, 1000);
      return () => clearTimeout(timer);
    }
  }, [editContent, editTitle, saveNote, selectedNote, isEditing]);

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

  // Insert markdown syntax
  const insertMarkdown = (syntax: string, wrap: boolean = true) => {
    if (!editorRef.current) return;
    const start = editorRef.current.selectionStart;
    const end = editorRef.current.selectionEnd;
    const text = editContent;
    const selected = text.substring(start, end);
    
    let newText: string;
    if (wrap && selected) {
      newText = text.substring(0, start) + syntax + selected + syntax + text.substring(end);
    } else {
      newText = text.substring(0, start) + syntax + text.substring(end);
    }
    
    setEditContent(newText);
    setTimeout(() => {
      editorRef.current?.focus();
      editorRef.current?.setSelectionRange(start + syntax.length, start + syntax.length + selected.length);
    }, 0);
  };

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
              {/* Language Toggle */}
              <button
                onClick={() => setUiLang(uiLang === 'en' ? 'ar' : 'en')}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors text-sm font-medium text-on-surface-variant"
              >
                <Languages className="w-4 h-4" />
                {uiLang === 'en' ? 'عربي' : 'EN'}
              </button>
              
              {/* New Note Button */}
              <button
                onClick={() => setShowNewNoteModal(true)}
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
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={str.search}
                className={`w-full bg-surface-container border border-outline-variant/10 rounded-lg py-2 ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} text-sm text-on-surface placeholder:text-outline focus:ring-1 focus:ring-primary focus:outline-none`}
              />
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
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
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
                onClick={() => setShowNewNoteModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-on-primary font-medium"
              >
                <Plus className="w-4 h-4" />
                {str.createFirst}
              </button>
            </motion.div>
          ) : (
            <motion.div 
              variants={containerVariants}
              className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4' : 'space-y-3'}
            >
              {filteredNotes.map(note => {
                const Icon = modalityIcons[note.modality];
                return (
                  <motion.div
                    key={note.id}
                    variants={itemVariants}
                    onClick={() => openNote(note)}
                    className={`bg-surface-container rounded-xl border border-outline-variant/10 hover:border-primary/30 transition-all cursor-pointer group ${
                      viewMode === 'list' ? 'flex items-center gap-4 p-4' : 'p-4'
                    } ${note.isRTL ? 'text-right' : 'text-left'}`}
                    dir={note.isRTL ? 'rtl' : 'ltr'}
                  >
                    <div className={viewMode === 'list' ? 'flex-1 min-w-0' : ''}>
                      <div className="flex items-center gap-2 mb-2">
                        {note.isPinned && <Pin className="w-3.5 h-3.5 text-primary" />}
                        {note.isFavorite && <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />}
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          note.modality === 'video' ? 'bg-tertiary/20 text-tertiary' :
                          note.modality === 'document' ? 'bg-primary/20 text-primary' :
                          note.modality === 'audio' ? 'bg-purple-500/20 text-purple-400' :
                          'bg-surface-container-high text-on-surface-variant'
                        }`}>
                          <Icon className="w-3 h-3 inline mr-1" />
                          {str[note.modality as keyof typeof str]}
                        </span>
                      </div>
                      <h3 className="font-headline font-bold text-on-surface mb-1 line-clamp-1">{note.title}</h3>
                      <p className="text-sm text-on-surface-variant line-clamp-2 mb-3">{note.content.slice(0, 100)}...</p>
                      <div className="flex items-center gap-3 text-xs text-outline">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(note.updatedAt).toLocaleDateString(note.isRTL ? 'ar-SA' : 'en-US')}
                        </span>
                        <span>{note.wordCount} {str.words}</span>
                        <span>{note.readingTime} {str.minRead}</span>
                      </div>
                      {note.highlights.length > 0 && (
                        <div className="flex items-center gap-1 mt-2">
                          <Highlighter className="w-3 h-3 text-on-surface-variant" />
                          <span className="text-xs text-on-surface-variant">{note.highlights.length}</span>
                          <div className="flex -space-x-1">
                            {[...new Set(note.highlights.map(h => h.color))].slice(0, 4).map(color => (
                              <div key={color} className={`w-3 h-3 rounded-full ${highlightColors[color].bg} border border-surface-container`} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>

        {/* Note Editor/Preview */}
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
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsEditing(true)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        isEditing ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                      }`}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      {str.editor}
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        !isEditing ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      {str.preview}
                    </button>
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
                    
                    <button
                      onClick={() => updateNote(selectedNote.id, { isPinned: !selectedNote.isPinned })}
                      className={`p-2 rounded-lg transition-colors ${selectedNote.isPinned ? 'bg-primary/20 text-primary' : 'text-on-surface-variant hover:bg-surface-container'}`}
                    >
                      <Pin className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => updateNote(selectedNote.id, { isFavorite: !selectedNote.isFavorite })}
                      className={`p-2 rounded-lg transition-colors ${selectedNote.isFavorite ? 'text-yellow-400' : 'text-on-surface-variant hover:bg-surface-container'}`}
                    >
                      <Star className={`w-4 h-4 ${selectedNote.isFavorite ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      onClick={() => handleExport('markdown')}
                      className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleExport('copy')}
                      className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => { deleteNote(selectedNote.id); setSelectedNote(null); }}
                      className="p-2 rounded-lg text-on-surface-variant hover:bg-red-500/20 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* Markdown Toolbar */}
                {isEditing && (
                  <div className="flex items-center gap-1 mt-3 pb-1 overflow-x-auto">
                    <button onClick={() => insertMarkdown('# ', false)} className="p-1.5 rounded hover:bg-surface-container text-on-surface-variant" title="Heading 1">
                      <Heading1 className="w-4 h-4" />
                    </button>
                    <button onClick={() => insertMarkdown('## ', false)} className="p-1.5 rounded hover:bg-surface-container text-on-surface-variant" title="Heading 2">
                      <Heading2 className="w-4 h-4" />
                    </button>
                    <div className="w-px h-4 bg-outline-variant/20 mx-1" />
                    <button onClick={() => insertMarkdown('**')} className="p-1.5 rounded hover:bg-surface-container text-on-surface-variant" title="Bold">
                      <Bold className="w-4 h-4" />
                    </button>
                    <button onClick={() => insertMarkdown('*')} className="p-1.5 rounded hover:bg-surface-container text-on-surface-variant" title="Italic">
                      <Italic className="w-4 h-4" />
                    </button>
                    <button onClick={() => insertMarkdown('`')} className="p-1.5 rounded hover:bg-surface-container text-on-surface-variant" title="Code">
                      <Code className="w-4 h-4" />
                    </button>
                    <div className="w-px h-4 bg-outline-variant/20 mx-1" />
                    <button onClick={() => insertMarkdown('- ', false)} className="p-1.5 rounded hover:bg-surface-container text-on-surface-variant" title="List">
                      <List className="w-4 h-4" />
                    </button>
                    <button onClick={() => insertMarkdown('1. ', false)} className="p-1.5 rounded hover:bg-surface-container text-on-surface-variant" title="Numbered List">
                      <ListOrdered className="w-4 h-4" />
                    </button>
                    <button onClick={() => insertMarkdown('- [ ] ', false)} className="p-1.5 rounded hover:bg-surface-container text-on-surface-variant" title="Checkbox">
                      <CheckSquare className="w-4 h-4" />
                    </button>
                    <div className="w-px h-4 bg-outline-variant/20 mx-1" />
                    <button onClick={() => insertMarkdown('> ', false)} className="p-1.5 rounded hover:bg-surface-container text-on-surface-variant" title="Quote">
                      <Quote className="w-4 h-4" />
                    </button>
                    <button onClick={() => insertMarkdown('[text](url)', false)} className="p-1.5 rounded hover:bg-surface-container text-on-surface-variant" title="Link">
                      <Link2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => insertMarkdown('![alt](url)', false)} className="p-1.5 rounded hover:bg-surface-container text-on-surface-variant" title="Image">
                      <Image className="w-4 h-4" />
                    </button>
                    <div className="flex-1" />
                    <button
                      onClick={() => setEditLanguage(editLanguage === 'ar' ? 'en' : 'ar')}
                      className="p-1.5 rounded hover:bg-surface-container text-on-surface-variant flex items-center gap-1"
                      title="Toggle Direction"
                    >
                      {editLanguage === 'ar' || (editLanguage === 'auto' && selectedNote.isRTL) ? (
                        <AlignRight className="w-4 h-4" />
                      ) : (
                        <AlignLeft className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Editor/Preview Content */}
              <div className="flex-1 overflow-y-auto p-6" onMouseUp={handleTextSelection}>
                {isEditing ? (
                  <div className="max-w-3xl mx-auto">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder={str.untitled}
                      className={`w-full bg-transparent border-none text-2xl font-headline font-bold text-on-surface placeholder:text-outline focus:ring-0 mb-4 ${
                        editLanguage === 'ar' || (editLanguage === 'auto' && selectedNote.isRTL) ? 'text-right' : 'text-left'
                      }`}
                      dir={editLanguage === 'ar' || (editLanguage === 'auto' && selectedNote.isRTL) ? 'rtl' : 'ltr'}
                    />
                    <textarea
                      ref={editorRef}
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      placeholder={str.writeHere}
                      className={`w-full bg-transparent border-none text-on-surface placeholder:text-outline focus:ring-0 resize-none min-h-[60vh] leading-relaxed font-mono text-sm ${
                        editLanguage === 'ar' || (editLanguage === 'auto' && selectedNote.isRTL) ? 'text-right' : 'text-left'
                      }`}
                      dir={editLanguage === 'ar' || (editLanguage === 'auto' && selectedNote.isRTL) ? 'rtl' : 'ltr'}
                    />
                  </div>
                ) : (
                  <div 
                    className={`max-w-3xl mx-auto prose prose-invert prose-p:text-on-surface-variant prose-headings:font-headline prose-headings:text-white prose-a:text-primary prose-strong:text-white prose-code:text-primary ${
                      selectedNote.isRTL ? 'prose-rtl text-right' : ''
                    }`}
                    dir={selectedNote.isRTL ? 'rtl' : 'ltr'}
                  >
                    <h1>{selectedNote.title}</h1>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {selectedNote.content}
                    </ReactMarkdown>
                  </div>
                )}

                {/* Highlights Section */}
                {selectedNote.highlights.length > 0 && !isEditing && (
                  <div className="max-w-3xl mx-auto mt-8 pt-8 border-t border-outline-variant/10">
                    <h3 className="font-headline font-bold text-on-surface mb-4 flex items-center gap-2">
                      <Highlighter className="w-5 h-5 text-primary" />
                      {str.highlights} ({selectedNote.highlights.length})
                    </h3>
                    <div className="space-y-3">
                      {selectedNote.highlights.map(highlight => (
                        <div
                          key={highlight.id}
                          className={`p-3 rounded-lg border-l-4 ${highlightColors[highlight.color].bg} ${highlightColors[highlight.color].border}`}
                          dir={selectedNote.isRTL ? 'rtl' : 'ltr'}
                        >
                          <p className={`text-sm ${highlightColors[highlight.color].text}`}>"{highlight.text}"</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-outline">
                              {highlight.timestamp && `${highlight.timestamp} • `}
                              {new Date(highlight.createdAt).toLocaleDateString(selectedNote.isRTL ? 'ar-SA' : 'en-US')}
                            </span>
                            <button
                              onClick={() => removeHighlightFromNote(selectedNote.id, highlight.id)}
                              className="text-xs text-on-surface-variant hover:text-red-400 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

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
                </div>
                <div className="flex items-center gap-2">
                  <span>{str.updated}: {new Date(selectedNote.updatedAt).toLocaleString(selectedNote.isRTL ? 'ar-SA' : 'en-US')}</span>
                </div>
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

      {/* New Note Modal */}
      <AnimatePresence>
        {showNewNoteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowNewNoteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`bg-surface-container-low rounded-2xl w-full max-w-lg p-6 ${isRTL ? 'text-right' : 'text-left'}`}
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-headline text-xl font-bold text-on-surface">{str.newNote}</h2>
                <button
                  onClick={() => setShowNewNoteModal(false)}
                  className="p-2 text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

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

                {editModality === 'course' && courses.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-on-surface-variant mb-1">Select Course</label>
                    <select
                      value={editSourceId}
                      onChange={(e) => setEditSourceId(e.target.value)}
                      className="w-full bg-surface-container border border-outline-variant/10 rounded-lg py-2 px-3 text-sm text-on-surface"
                    >
                      <option value="">-- Select --</option>
                      {courses.map(course => (
                        <option key={course.id} value={course.id}>{course.title}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder={str.untitled}
                    className={`w-full bg-surface-container border border-outline-variant/10 rounded-lg py-2 px-3 text-on-surface placeholder:text-outline focus:ring-1 focus:ring-primary ${
                      editLanguage === 'ar' ? 'text-right' : 'text-left'
                    }`}
                    dir={editLanguage === 'ar' ? 'rtl' : 'ltr'}
                  />
                </div>

                <div>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    placeholder={str.writeHere}
                    rows={5}
                    className={`w-full bg-surface-container border border-outline-variant/10 rounded-lg py-2 px-3 text-on-surface placeholder:text-outline focus:ring-1 focus:ring-primary resize-none ${
                      editLanguage === 'ar' ? 'text-right' : 'text-left'
                    }`}
                    dir={editLanguage === 'ar' ? 'rtl' : 'ltr'}
                  />
                </div>
              </div>

              <div className={`flex gap-3 mt-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <button
                  onClick={() => setShowNewNoteModal(false)}
                  className="flex-1 py-2 px-4 rounded-lg bg-surface-container text-on-surface-variant font-medium hover:bg-surface-container-high transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateNote}
                  className="flex-1 py-2 px-4 rounded-lg bg-primary text-on-primary font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  {str.newNote}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
