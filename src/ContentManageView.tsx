import { useState, useRef, useCallback } from 'react';
import { motion, Variants, AnimatePresence, Reorder } from 'motion/react';
import { 
  Plus, 
  Upload, 
  X, 
  ChevronRight, 
  ChevronLeft,
  Folder,
  FolderPlus,
  FolderOpen,
  Video,
  FileText,
  Image,
  File,
  Music,
  Archive,
  Tag,
  Check,
  Trash2,
  Edit3,
  GripVertical,
  Clock,
  Globe,
  Lock,
  Search,
  Filter,
  LayoutGrid,
  List,
  HardDrive,
  Download,
  FileUp,
  FileJson,
  Copy,
  Play,
  ChevronDown,
  FolderInput,
  BookOpen,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { useData } from './store/DataContext';
import { LocalFile, Course, CourseModule, ModuleFile, formatFileSize, getFileCategory } from './store/localDataStore';

interface ContentManageViewProps {
  onNavigate: (view: string) => void;
}

interface PendingFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  path: string;
  progress: number;
  status: 'pending' | 'processing' | 'complete' | 'error';
}

interface ModuleFileLocal {
  id: string;
  name: string;
  path: string;
  type: 'video' | 'document' | 'audio' | 'image' | 'other';
  size?: number;
  duration?: string;
  order: number;
}

interface CourseModuleLocal {
  id: string;
  title: string;
  type: 'video' | 'document' | 'quiz' | 'audio' | 'mixed';
  files: ModuleFileLocal[];
  // Legacy single file support
  filePath?: string;
  duration?: string;
  order: number;
  description?: string;
}

// JSON Course Schema for import/export - supports folder-level course structure
interface CourseJsonSchema {
  version: string;
  course: {
    title: string;
    description: string;
    thumbnailPath?: string;
    visibility: 'private' | 'public';
    tags: string[];
    totalDuration?: string;
  };
  modules: {
    title: string;
    type: 'video' | 'document' | 'quiz' | 'audio' | 'mixed';
    description?: string;
    // Support for multiple files per module (folder-based content)
    files?: {
      name: string;
      path: string;
      type: 'video' | 'document' | 'audio' | 'image' | 'other';
      size?: number;
      duration?: string;
    }[];
    // Legacy single file support
    filePath?: string;
    duration?: string;
  }[];
  metadata?: {
    createdBy?: string;
    createdAt?: string;
    sourcePath?: string; // Root folder path from backend tool
    generatedBy?: string; // e.g., "backend-folder-scanner"
  };
}

// Course templates - updated for multi-file modules
const courseTemplates = [
  {
    id: 'video-series',
    name: 'Video Series',
    description: 'A series of video lessons with accompanying materials',
    icon: Video,
    defaultModules: [
      { title: 'Introduction', type: 'video' as const, files: [] },
      { title: 'Chapter 1', type: 'mixed' as const, files: [] },
      { title: 'Chapter 2', type: 'mixed' as const, files: [] },
      { title: 'Summary & Resources', type: 'mixed' as const, files: [] },
    ]
  },
  {
    id: 'reading-list',
    name: 'Reading List',
    description: 'A collection of documents and reading materials',
    icon: BookOpen,
    defaultModules: [
      { title: 'Overview', type: 'document' as const, files: [] },
      { title: 'Reading Materials', type: 'mixed' as const, files: [] },
      { title: 'Supplementary', type: 'mixed' as const, files: [] },
      { title: 'Notes & Summary', type: 'mixed' as const, files: [] },
    ]
  },
  {
    id: 'mixed-media',
    name: 'Mixed Media',
    description: 'Combination of videos, audio, and documents',
    icon: Sparkles,
    defaultModules: [
      { title: 'Welcome', type: 'mixed' as const, files: [] },
      { title: 'Core Content', type: 'mixed' as const, files: [] },
      { title: 'Practice Materials', type: 'mixed' as const, files: [] },
      { title: 'Resources', type: 'mixed' as const, files: [] },
    ]
  },
  {
    id: 'blank',
    name: 'Blank Course',
    description: 'Start from scratch with an empty course',
    icon: Plus,
    defaultModules: []
  }
];

export function ContentManageView({ onNavigate }: ContentManageViewProps) {
  const { 
    files, addFile, deleteFile, 
    collections, addCollection, deleteCollection,
    courses, addCourse, updateCourse, deleteCourse,
    tags 
  } = useData();

  // View state
  const [activeTab, setActiveTab] = useState<'courses' | 'collections' | 'files'>('courses');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Course wizard state
  const [showCourseWizard, setShowCourseWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(0); // 0 = template selection, 1-3 = wizard steps
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    thumbnail: '',
    thumbnailPath: '',
    visibility: 'private' as 'private' | 'public',
    collectionId: '',
    tags: [] as string[],
    modules: [] as CourseModuleLocal[]
  });
  
  // JSON Import/Export state
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [jsonMode, setJsonMode] = useState<'import' | 'export'>('import');
  const [jsonContent, setJsonContent] = useState('');
  const [jsonError, setJsonError] = useState('');
  const [selectedCourseForExport, setSelectedCourseForExport] = useState<string | null>(null);
  
  // File picker state for modules
  const [showFilePicker, setShowFilePicker] = useState(false);
  const [filePickerModuleId, setFilePickerModuleId] = useState<string | null>(null);
  const [filePickerFilter, setFilePickerFilter] = useState<'all' | 'video' | 'audio' | 'document'>('all');
  
  // Collection modal state
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [newCollection, setNewCollection] = useState({ name: '', description: '', color: 'bg-blue-500' });
  
  // File upload state
  const [isDragging, setIsDragging] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);
  
  // Search and filter
  const [searchQuery, setSearchQuery] = useState('');

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  const modalVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } }
  };

  // ==================== FILE HANDLING ====================
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleLocalFiles(droppedFiles);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleLocalFiles(Array.from(e.target.files));
    }
  };

  const handleLocalFiles = (fileList: File[]) => {
    const newPendingFiles: PendingFile[] = fileList.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      path: file.name,
      progress: 0,
      status: 'pending' as const
    }));
    
    setPendingFiles(prev => [...prev, ...newPendingFiles]);
    
    newPendingFiles.forEach(pendingFile => {
      const interval = setInterval(() => {
        setPendingFiles(prev => 
          prev.map(f => 
            f.id === pendingFile.id 
              ? { ...f, progress: Math.min(f.progress + 15, 100), status: f.progress >= 85 ? 'complete' : 'processing' }
              : f
          )
        );
      }, 150);
      
      setTimeout(() => {
        clearInterval(interval);
        addFile({
          name: pendingFile.name,
          path: pendingFile.path,
          size: pendingFile.size,
          type: getFileCategory(pendingFile.type),
          mimeType: pendingFile.type,
          tags: [],
        });
        setPendingFiles(prev => 
          prev.map(f => 
            f.id === pendingFile.id 
              ? { ...f, progress: 100, status: 'complete' }
              : f
          )
        );
      }, 1500);
    });
  };

  const removePendingFile = (id: string) => {
    setPendingFiles(prev => prev.filter(f => f.id !== id));
  };

  const getFileIcon = (type: string, mimeType?: string) => {
    if (type === 'video' || mimeType?.startsWith('video/')) return <Video className="w-5 h-5 text-tertiary" />;
    if (type === 'audio' || mimeType?.startsWith('audio/')) return <Music className="w-5 h-5 text-purple-400" />;
    if (type === 'image' || mimeType?.startsWith('image/')) return <Image className="w-5 h-5 text-green-400" />;
    if (type === 'document' || mimeType?.includes('pdf') || mimeType?.includes('document')) return <FileText className="w-5 h-5 text-primary" />;
    if (type === 'archive' || mimeType?.includes('zip')) return <Archive className="w-5 h-5 text-yellow-400" />;
    return <File className="w-5 h-5 text-on-surface-variant" />;
  };

  const getModuleIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4 text-tertiary" />;
      case 'audio': return <Music className="w-4 h-4 text-purple-400" />;
      case 'document': return <FileText className="w-4 h-4 text-primary" />;
      case 'quiz': return <BookOpen className="w-4 h-4 text-green-400" />;
      default: return <File className="w-4 h-4 text-on-surface-variant" />;
    }
  };

  // ==================== TAG HANDLING ====================
  const toggleTag = (tagId: string) => {
    setCourseData(prev => ({
      ...prev,
      tags: prev.tags.includes(tagId) 
        ? prev.tags.filter(t => t !== tagId)
        : [...prev.tags, tagId]
    }));
  };

  // ==================== COLLECTION HANDLING ====================
  const handleCreateCollection = () => {
    if (!newCollection.name) return;
    addCollection({
      name: newCollection.name,
      description: newCollection.description,
      color: newCollection.color,
    });
    setNewCollection({ name: '', description: '', color: 'bg-blue-500' });
    setShowCollectionModal(false);
  };

  // ==================== MODULE HANDLING ====================
  const addModule = () => {
    setCourseData(prev => ({
      ...prev,
      modules: [...prev.modules, {
        id: Math.random().toString(36).substr(2, 9),
        title: '',
        type: 'mixed',
        files: [],
        duration: '',
        order: prev.modules.length
      }]
    }));
  };

  const addFileToModule = (moduleId: string) => {
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.map(m => {
        if (m.id !== moduleId) return m;
        return {
          ...m,
          files: [...m.files, {
            id: Math.random().toString(36).substr(2, 9),
            name: '',
            path: '',
            type: 'document' as const,
            order: m.files.length
          }]
        };
      })
    }));
  };

  const updateModuleFile = (moduleId: string, fileId: string, updates: Partial<ModuleFileLocal>) => {
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.map(m => {
        if (m.id !== moduleId) return m;
        return {
          ...m,
          files: m.files.map(f => f.id === fileId ? { ...f, ...updates } : f)
        };
      })
    }));
  };

  const removeModuleFile = (moduleId: string, fileId: string) => {
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.map(m => {
        if (m.id !== moduleId) return m;
        return {
          ...m,
          files: m.files.filter(f => f.id !== fileId)
        };
      })
    }));
  };

  const selectLibraryFileForModule = (moduleId: string, fileId: string, libraryFile: LocalFile) => {
    updateModuleFile(moduleId, fileId, {
      name: libraryFile.name,
      path: libraryFile.path,
      type: libraryFile.type as ModuleFileLocal['type'],
      size: libraryFile.size,
      duration: libraryFile.duration
    });
    setShowFilePicker(false);
    setFilePickerModuleId(null);
  };

  const updateModule = (id: string, updates: Partial<CourseModuleLocal>) => {
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.map(m => m.id === id ? { ...m, ...updates } : m)
    }));
  };

  const removeModule = (id: string) => {
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.filter(m => m.id !== id)
    }));
  };

  const handleModuleReorder = (newOrder: CourseModuleLocal[]) => {
    setCourseData(prev => ({
      ...prev,
      modules: newOrder.map((m, i) => ({ ...m, order: i }))
    }));
  };

  const selectFileForModule = (moduleId: string, file: LocalFile) => {
    updateModule(moduleId, { 
      filePath: file.path,
      title: courseData.modules.find(m => m.id === moduleId)?.title || file.name.replace(/\.[^/.]+$/, ''),
      type: file.type as 'video' | 'audio' | 'document' | 'quiz',
      duration: file.duration
    });
    setShowFilePicker(false);
    setFilePickerModuleId(null);
  };

  // ==================== COURSE TEMPLATE HANDLING ====================
  const applyTemplate = (templateId: string) => {
    const template = courseTemplates.find(t => t.id === templateId);
    if (template) {
      setCourseData(prev => ({
        ...prev,
        modules: template.defaultModules.map((m, i) => ({
          id: Math.random().toString(36).substr(2, 9),
          title: m.title,
          type: m.type,
          files: [],
          duration: '',
          order: i
        }))
      }));
    }
    setWizardStep(1);
  };

  // ==================== COURSE CRUD ====================
  const handleCreateCourse = () => {
    // Calculate total duration from modules (including all files)
    const totalMinutes = courseData.modules.reduce((acc, m) => {
      // Sum durations from all files in the module
      const fileDurations = m.files.reduce((fileAcc, f) => {
        if (f.duration) {
          const match = f.duration.match(/(\d+)h?\s*(\d+)?m?/);
          if (match) {
            const hours = parseInt(match[1]) || 0;
            const mins = parseInt(match[2]) || 0;
            return fileAcc + (hours * 60) + mins;
          }
        }
        return fileAcc;
      }, 0);
      
      // Also check module-level duration (legacy)
      if (m.duration) {
        const match = m.duration.match(/(\d+)h?\s*(\d+)?m?/);
        if (match) {
          const hours = parseInt(match[1]) || 0;
          const mins = parseInt(match[2]) || 0;
          return acc + (hours * 60) + mins + fileDurations;
        }
      }
      return acc + fileDurations;
    }, 0);
    
    const totalDuration = totalMinutes > 0 
      ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`
      : undefined;

    // Determine module type based on files
    const processedModules = courseData.modules.map((m, i) => {
      const fileTypes = new Set(m.files.map(f => f.type));
      let moduleType = m.type;
      if (m.files.length > 0) {
        if (fileTypes.size === 1) {
          moduleType = Array.from(fileTypes)[0] as typeof m.type;
        } else if (fileTypes.size > 1) {
          moduleType = 'mixed';
        }
      }
      return {
        id: m.id,
        title: m.title,
        type: moduleType,
        files: m.files.map((f, fi) => ({
          id: f.id,
          name: f.name,
          path: f.path,
          type: f.type,
          size: f.size,
          duration: f.duration,
          order: fi,
        })),
        filePath: m.filePath,
        duration: m.duration,
        order: i,
      };
    });

    if (isEditMode && editingCourseId) {
      updateCourse(editingCourseId, {
        title: courseData.title,
        description: courseData.description,
        thumbnail: courseData.thumbnail,
        thumbnailPath: courseData.thumbnailPath,
        visibility: courseData.visibility,
        collectionId: courseData.collectionId || undefined,
        tags: courseData.tags,
        modules: processedModules,
        totalDuration,
      });
    } else {
      addCourse({
        title: courseData.title,
        description: courseData.description,
        thumbnail: courseData.thumbnail,
        thumbnailPath: courseData.thumbnailPath,
        visibility: courseData.visibility,
        collectionId: courseData.collectionId || undefined,
        tags: courseData.tags,
        modules: processedModules,
        status: 'draft',
        totalDuration,
      });
    }
    
    resetWizard();
  };

  const editCourse = (course: Course) => {
    setIsEditMode(true);
    setEditingCourseId(course.id);
    setCourseData({
      title: course.title,
      description: course.description,
      thumbnail: course.thumbnail || '',
      thumbnailPath: course.thumbnailPath || '',
      visibility: course.visibility,
      collectionId: course.collectionId || '',
      tags: course.tags,
      modules: course.modules.map(m => ({
        id: m.id,
        title: m.title,
        type: m.type,
        files: m.files?.map(f => ({
          id: f.id,
          name: f.name,
          path: f.path,
          type: f.type,
          size: f.size,
          duration: f.duration,
          order: f.order
        })) || [],
        filePath: m.filePath,
        duration: m.duration,
        order: m.order
      }))
    });
    setWizardStep(1);
    setShowCourseWizard(true);
  };

  const duplicateCourse = (course: Course) => {
    addCourse({
      title: `${course.title} (Copy)`,
      description: course.description,
      thumbnail: course.thumbnail,
      thumbnailPath: course.thumbnailPath,
      visibility: 'private',
      collectionId: course.collectionId,
      tags: course.tags,
      modules: course.modules.map((m, i) => ({
        ...m,
        id: Math.random().toString(36).substr(2, 9),
        files: m.files?.map(f => ({
          ...f,
          id: Math.random().toString(36).substr(2, 9)
        })) || [],
        order: i
      })),
      status: 'draft',
      totalDuration: course.totalDuration,
    });
  };

  const resetWizard = () => {
    setShowCourseWizard(false);
    setIsEditMode(false);
    setEditingCourseId(null);
    setSelectedFileId(null);
    setCourseData({
      title: '',
      description: '',
      thumbnail: '',
      thumbnailPath: '',
      visibility: 'private',
      collectionId: '',
      tags: [],
      modules: []
    });
    setWizardStep(0);
  };

  // Track which file in which module is selected for file picker
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

  // ==================== JSON IMPORT/EXPORT ====================
  const exportCourseToJson = (course: Course) => {
    const jsonSchema: CourseJsonSchema = {
      version: '2.0', // Updated version for multi-file support
      course: {
        title: course.title,
        description: course.description,
        thumbnailPath: course.thumbnailPath,
        visibility: course.visibility,
        tags: course.tags.map(tagId => tags.find(t => t.id === tagId)?.name || tagId),
        totalDuration: course.totalDuration,
      },
      modules: course.modules.map(m => ({
        title: m.title,
        type: m.type,
        description: m.description,
        // Include files array for multi-file modules
        files: m.files?.map(f => ({
          name: f.name,
          path: f.path,
          type: f.type,
          size: f.size,
          duration: f.duration,
        })),
        // Legacy single file support
        filePath: m.filePath,
        duration: m.duration,
      })),
      metadata: {
        createdAt: course.dateCreated,
        generatedBy: 'onyx-stream-frontend',
      }
    };
    return JSON.stringify(jsonSchema, null, 2);
  };

  const importCourseFromJson = (jsonString: string): CourseJsonSchema | null => {
    try {
      const parsed = JSON.parse(jsonString);
      // Validate required fields
      if (!parsed.course?.title || !Array.isArray(parsed.modules)) {
        throw new Error('Invalid course JSON format. Missing required fields: course.title or modules array.');
      }
      return parsed as CourseJsonSchema;
    } catch (e) {
      setJsonError(e instanceof Error ? e.message : 'Invalid JSON format');
      return null;
    }
  };

  const handleJsonImport = () => {
    setJsonError('');
    const courseJson = importCourseFromJson(jsonContent);
    if (courseJson) {
      // Map tag names back to IDs or create as-is
      const tagIds = courseJson.course.tags?.map(tagName => {
        const existingTag = tags.find(t => t.name.toLowerCase() === tagName.toLowerCase());
        return existingTag?.id || tagName;
      }) || [];

      // Process modules with multi-file support
      const processedModules = courseJson.modules.map((m, i) => {
        // Convert files array from JSON to internal format
        const files: ModuleFile[] = m.files?.map((f, fi) => ({
          id: Math.random().toString(36).substr(2, 9),
          name: f.name,
          path: f.path,
          type: f.type,
          size: f.size,
          duration: f.duration,
          order: fi,
        })) || [];

        // If no files array but has filePath (legacy), create single file entry
        if (files.length === 0 && m.filePath) {
          const fileName = m.filePath.split(/[/\\]/).pop() || m.title;
          const normalizedType: ModuleFile['type'] = m.type === 'video'
            ? 'video'
            : m.type === 'document'
            ? 'document'
            : m.type === 'audio'
            ? 'audio'
            : 'document';

          files.push({
            id: Math.random().toString(36).substr(2, 9),
            name: fileName,
            path: m.filePath,
            type: normalizedType,
            duration: m.duration,
            order: 0,
          });
        }

        return {
          id: Math.random().toString(36).substr(2, 9),
          title: m.title,
          type: m.type,
          files,
          filePath: m.filePath,
          duration: m.duration,
          order: i,
        };
      });

      addCourse({
        title: courseJson.course.title,
        description: courseJson.course.description || '',
        thumbnailPath: courseJson.course.thumbnailPath,
        visibility: courseJson.course.visibility || 'private',
        tags: tagIds,
        modules: processedModules,
        status: 'draft',
        totalDuration: courseJson.course.totalDuration,
      });

      setShowJsonModal(false);
      setJsonContent('');
      setJsonError('');
    }
  };

  const handleJsonFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setJsonContent(event.target?.result as string || '');
        setJsonError('');
      };
      reader.readAsText(file);
    }
  };

  const downloadJson = () => {
    if (!selectedCourseForExport) return;
    const course = courses.find(c => c.id === selectedCourseForExport);
    if (!course) return;

    const json = exportCourseToJson(course);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${course.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_course.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyJsonToClipboard = () => {
    navigator.clipboard.writeText(jsonContent);
  };

  const colorOptions = [
    'bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 
    'bg-pink-500', 'bg-cyan-500', 'bg-red-500', 'bg-yellow-500'
  ];

  // Filter content based on search
  const filteredFiles = files.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredCourses = courses.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredCollections = collections.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter files for file picker
  const pickerFiles = files.filter(f => {
    if (filePickerFilter === 'all') return true;
    return f.type === filePickerFilter;
  });

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      className="p-6 lg:p-8 pb-32 max-w-7xl mx-auto"
    >
      {/* Header */}
      <motion.section variants={itemVariants} className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-headline text-3xl lg:text-4xl font-extrabold text-on-surface tracking-tight flex items-center gap-3">
              Content Manager
              <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs font-bold rounded-full flex items-center gap-1">
                <HardDrive className="w-3 h-3" /> Local
              </span>
            </h1>
            <p className="text-on-surface-variant mt-2">
              Manage your local learning resources - courses, collections, and files
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setJsonMode('import'); setShowJsonModal(true); setJsonContent(''); setJsonError(''); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-surface-container hover:bg-surface-container-high border border-outline-variant/20 rounded-lg text-on-surface text-sm font-medium transition-colors"
            >
              <FileJson className="w-4 h-4" />
              Import JSON
            </button>
            <button
              onClick={() => setShowCollectionModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-surface-container hover:bg-surface-container-high border border-outline-variant/20 rounded-lg text-on-surface text-sm font-medium transition-colors"
            >
              <FolderPlus className="w-4 h-4" />
              New Collection
            </button>
            <button
              onClick={() => { setShowCourseWizard(true); setWizardStep(0); setIsEditMode(false); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary to-primary-container text-on-primary rounded-lg text-sm font-bold shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="w-4 h-4" />
              Create Course
            </button>
          </div>
        </div>
      </motion.section>

      {/* Stats Bar */}
      <motion.section variants={itemVariants} className="mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-surface-container rounded-xl p-4 border border-outline-variant/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Video className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-on-surface">{courses.length}</p>
                <p className="text-xs text-on-surface-variant">Courses</p>
              </div>
            </div>
          </div>
          <div className="bg-surface-container rounded-xl p-4 border border-outline-variant/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <FolderOpen className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-on-surface">{collections.length}</p>
                <p className="text-xs text-on-surface-variant">Collections</p>
              </div>
            </div>
          </div>
          <div className="bg-surface-container rounded-xl p-4 border border-outline-variant/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <File className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-on-surface">{files.length}</p>
                <p className="text-xs text-on-surface-variant">Files</p>
              </div>
            </div>
          </div>
          <div className="bg-surface-container rounded-xl p-4 border border-outline-variant/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                <HardDrive className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-on-surface">
                  {formatFileSize(files.reduce((acc, f) => acc + f.size, 0))}
                </p>
                <p className="text-xs text-on-surface-variant">Total Size</p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Search and Tabs */}
      <motion.section variants={itemVariants} className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2 bg-surface-container rounded-lg p-1">
            {(['courses', 'collections', 'files'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all capitalize ${
                  activeTab === tab 
                    ? 'bg-surface-container-highest text-on-surface' 
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {tab}
                <span className="ml-1.5 text-xs opacity-60">
                  ({tab === 'courses' ? filteredCourses.length : tab === 'collections' ? filteredCollections.length : filteredFiles.length})
                </span>
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
              <input
                type="text"
                placeholder="Search content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 bg-surface-container border-none rounded-lg py-2.5 pl-10 pr-4 text-sm text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary"
              />
            </div>
            <button className="p-2.5 bg-surface-container rounded-lg text-on-surface-variant hover:text-on-surface transition-colors">
              <Filter className="w-4 h-4" />
            </button>
            <div className="flex items-center bg-surface-container rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-surface-container-highest text-on-surface' : 'text-on-surface-variant'}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-surface-container-highest text-on-surface' : 'text-on-surface-variant'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* File Upload Zone */}
      <motion.section variants={itemVariants} className="mb-8">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            isDragging 
              ? 'border-primary bg-primary/5' 
              : 'border-outline-variant/30 hover:border-outline-variant/50 hover:bg-surface-container/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            accept="video/*,audio/*,image/*,.pdf,.doc,.docx,.epub,.md,.txt"
          />
          <div className="flex flex-col items-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${
              isDragging ? 'bg-primary/20' : 'bg-surface-container-high'
            }`}>
              <Upload className={`w-7 h-7 ${isDragging ? 'text-primary' : 'text-on-surface-variant'}`} />
            </div>
            <p className="text-on-surface font-medium mb-1">
              {isDragging ? 'Drop files here' : 'Drag and drop local files here'}
            </p>
            <p className="text-sm text-on-surface-variant">
              or click to browse. Supports video, audio, images, PDF, ePub, and documents.
            </p>
            <p className="text-xs text-outline mt-2 flex items-center gap-1">
              <HardDrive className="w-3 h-3" /> Files are stored locally on your device
            </p>
          </div>
        </div>

        {/* Pending Files List */}
        <AnimatePresence>
          {pendingFiles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 space-y-2"
            >
              {pendingFiles.map(file => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-4 p-4 bg-surface-container rounded-lg"
                >
                  {getFileIcon(getFileCategory(file.type), file.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-on-surface truncate">{file.name}</p>
                    <p className="text-xs text-on-surface-variant">{formatFileSize(file.size)}</p>
                  </div>
                  <div className="w-32">
                    {file.status !== 'complete' ? (
                      <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${file.progress}%` }}
                          className="h-full bg-primary rounded-full"
                        />
                      </div>
                    ) : (
                      <span className="text-xs text-green-400 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Added
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); removePendingFile(file.id); }}
                    className="p-1.5 text-on-surface-variant hover:text-red-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>

      {/* Collections Tab Content */}
      {activeTab === 'collections' && (
        <motion.section variants={itemVariants}>
          <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1'}`}>
            {filteredCollections.map(collection => (
              <motion.div
                key={collection.id}
                variants={itemVariants}
                className={`bg-surface-container rounded-xl border border-outline-variant/10 overflow-hidden hover:bg-surface-container-high transition-all cursor-pointer group ${
                  viewMode === 'list' ? 'flex items-center' : ''
                }`}
              >
                {viewMode === 'grid' ? (
                  <>
                    <div className="aspect-video relative overflow-hidden bg-surface-container-high">
                      <div className={`absolute inset-0 ${collection.color} opacity-20`} />
                      <div className={`absolute top-3 left-3 w-3 h-3 rounded-full ${collection.color}`} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Folder className="w-12 h-12 text-on-surface-variant/30" />
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-headline font-bold text-on-surface mb-1">{collection.name}</h3>
                      <p className="text-xs text-on-surface-variant line-clamp-2 mb-2">{collection.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-outline">{collection.itemCount} items</span>
                        <button 
                          onClick={(e) => { e.stopPropagation(); deleteCollection(collection.id); }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-on-surface-variant hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className={`w-2 h-full ${collection.color}`} />
                    <div className="flex-1 flex items-center gap-4 p-4">
                      <Folder className="w-10 h-10 text-on-surface-variant" />
                      <div className="flex-1">
                        <h3 className="font-headline font-bold text-on-surface">{collection.name}</h3>
                        <p className="text-sm text-on-surface-variant">{collection.description}</p>
                      </div>
                      <span className="text-sm text-outline">{collection.itemCount} items</span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); deleteCollection(collection.id); }}
                        className="p-2 text-on-surface-variant hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
            
            {/* Add Collection Card */}
            <motion.div
              variants={itemVariants}
              onClick={() => setShowCollectionModal(true)}
              className={`bg-surface-container-low border-2 border-dashed border-outline-variant/30 rounded-xl flex items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-surface-container transition-all ${
                viewMode === 'grid' ? 'aspect-[4/3]' : 'p-8'
              }`}
            >
              <div className="text-center">
                <FolderPlus className="w-8 h-8 text-on-surface-variant mx-auto mb-2" />
                <p className="text-sm text-on-surface-variant font-medium">Create Collection</p>
              </div>
            </motion.div>
          </div>
        </motion.section>
      )}

      {/* Courses Tab Content */}
      {activeTab === 'courses' && (
        <motion.section variants={itemVariants}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <motion.div
                key={course.id}
                variants={itemVariants}
                className="bg-surface-container rounded-xl border border-outline-variant/10 overflow-hidden hover:bg-surface-container-high transition-all group"
              >
                <div className="aspect-video relative overflow-hidden bg-surface-container-high">
                  {course.thumbnailPath ? (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-tertiary/20 flex items-center justify-center">
                      <span className="text-xs text-on-surface-variant">{course.thumbnailPath}</span>
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-tertiary/20 flex items-center justify-center">
                      <Video className="w-12 h-12 text-on-surface-variant/30" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                      course.status === 'published' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {course.status}
                    </span>
                  </div>
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-1 rounded-full text-[10px] font-medium bg-black/40 text-white flex items-center gap-1">
                      <HardDrive className="w-2.5 h-2.5" /> Local
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-headline font-bold text-on-surface mb-2 line-clamp-1">{course.title}</h3>
                  <div className="flex items-center gap-4 text-xs text-on-surface-variant mb-3">
                    <span className="flex items-center gap-1">
                      <Video className="w-3 h-3" /> {course.modules.length} modules
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {course.totalDuration || 'No duration'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => editCourse(course)}
                      className="flex-1 py-2 bg-surface-container-high hover:bg-surface-container-highest rounded-lg text-xs font-medium text-on-surface transition-colors flex items-center justify-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                    <button 
                      onClick={() => duplicateCourse(course)}
                      className="p-2 bg-surface-container-high hover:bg-surface-container-highest rounded-lg text-on-surface-variant hover:text-on-surface transition-colors"
                      title="Duplicate"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => { 
                        setSelectedCourseForExport(course.id); 
                        setJsonContent(exportCourseToJson(course));
                        setJsonMode('export'); 
                        setShowJsonModal(true); 
                      }}
                      className="p-2 bg-surface-container-high hover:bg-surface-container-highest rounded-lg text-on-surface-variant hover:text-on-surface transition-colors"
                      title="Export JSON"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteCourse(course.id); }}
                      className="p-2 bg-surface-container-high hover:bg-red-500/20 rounded-lg text-on-surface-variant hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {/* Create Course Card */}
            <motion.div
              variants={itemVariants}
              onClick={() => { setShowCourseWizard(true); setWizardStep(0); setIsEditMode(false); }}
              className="bg-surface-container-low border-2 border-dashed border-outline-variant/30 rounded-xl flex items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-surface-container transition-all min-h-[280px]"
            >
              <div className="text-center">
                <Plus className="w-10 h-10 text-on-surface-variant mx-auto mb-3" />
                <p className="text-on-surface font-medium mb-1">Create New Course</p>
                <p className="text-sm text-on-surface-variant">Start building your course</p>
              </div>
            </motion.div>
          </div>
        </motion.section>
      )}

      {/* Files Tab Content */}
      {activeTab === 'files' && (
        <motion.section variants={itemVariants}>
          {filteredFiles.length === 0 ? (
            <div className="text-center py-16 bg-surface-container rounded-xl border border-outline-variant/10">
              <File className="w-12 h-12 text-on-surface-variant mx-auto mb-4" />
              <p className="text-on-surface font-medium mb-1">No files yet</p>
              <p className="text-sm text-on-surface-variant mb-4">Drop files above or click to browse</p>
            </div>
          ) : (
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-outline-variant/10 text-on-surface-variant text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-semibold">Name</th>
                    <th className="px-6 py-4 font-semibold">Type</th>
                    <th className="px-6 py-4 font-semibold">Tags</th>
                    <th className="px-6 py-4 font-semibold">Size</th>
                    <th className="px-6 py-4 font-semibold">Date Added</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/5">
                  {filteredFiles.map((file) => (
                    <tr key={file.id} className="hover:bg-surface-container-high/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {getFileIcon(file.type, file.mimeType)}
                          <div>
                            <span className="text-sm font-medium text-on-surface block">{file.name}</span>
                            <span className="text-xs text-outline">{file.path}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-on-surface-variant capitalize">{file.type}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          {file.tags.length === 0 ? (
                            <span className="text-xs text-outline">No tags</span>
                          ) : (
                            file.tags.map(tagId => {
                              const tagData = tags.find(t => t.id === tagId);
                              return tagData ? (
                                <span key={tagId} className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${tagData.color}`}>
                                  {tagData.name}
                                </span>
                              ) : null;
                            })
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-on-surface-variant">{formatFileSize(file.size)}</td>
                      <td className="px-6 py-4 text-sm text-on-surface-variant">{formatRelativeTime(file.dateAdded)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-1.5 text-on-surface-variant hover:text-on-surface transition-colors">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => deleteFile(file.id)}
                            className="p-1.5 text-on-surface-variant hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.section>
      )}

      {/* Course Wizard Modal */}
      <AnimatePresence>
        {showCourseWizard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={resetWizard}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="bg-surface-container-low rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Wizard Header */}
              <div className="p-6 border-b border-outline-variant/10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-headline text-xl font-bold text-on-surface">
                    {isEditMode ? 'Edit Course' : wizardStep === 0 ? 'Choose Template' : 'Create New Course'}
                  </h2>
                  <button
                    onClick={resetWizard}
                    className="p-2 text-on-surface-variant hover:text-on-surface transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {wizardStep > 0 && (
                  <>
                    {/* Progress Steps */}
                    <div className="flex items-center gap-2">
                      {[1, 2, 3].map(step => (
                        <div key={step} className="flex items-center gap-2 flex-1">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                            wizardStep >= step 
                              ? 'bg-primary text-on-primary' 
                              : 'bg-surface-container-high text-on-surface-variant'
                          }`}>
                            {wizardStep > step ? <Check className="w-4 h-4" /> : step}
                          </div>
                          {step < 3 && (
                            <div className={`flex-1 h-0.5 rounded-full transition-colors ${
                              wizardStep > step ? 'bg-primary' : 'bg-surface-container-high'
                            }`} />
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-on-surface-variant">
                      <span>Basic Info</span>
                      <span>Modules</span>
                      <span>Settings</span>
                    </div>
                  </>
                )}
              </div>

              {/* Wizard Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* Step 0: Template Selection */}
                {wizardStep === 0 && !isEditMode && (
                  <div className="space-y-4">
                    <p className="text-on-surface-variant mb-4">Choose a template to get started quickly, or start from scratch.</p>
                    <div className="grid grid-cols-2 gap-4">
                      {courseTemplates.map(template => (
                        <button
                          key={template.id}
                          onClick={() => applyTemplate(template.id)}
                          className="p-5 bg-surface-container rounded-xl border border-outline-variant/20 hover:border-primary/50 hover:bg-surface-container-high transition-all text-left group"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                              <template.icon className="w-6 h-6 text-on-surface-variant group-hover:text-primary transition-colors" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-headline font-bold text-on-surface mb-1">{template.name}</h3>
                              <p className="text-xs text-on-surface-variant">{template.description}</p>
                              {template.defaultModules.length > 0 && (
                                <p className="text-xs text-outline mt-2">{template.defaultModules.length} modules</p>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                    
                    {/* Quick Import Option */}
                    <div className="mt-6 pt-6 border-t border-outline-variant/10">
                      <p className="text-sm text-on-surface-variant mb-3">Or import an existing course:</p>
                      <button
                        onClick={() => { resetWizard(); setJsonMode('import'); setShowJsonModal(true); }}
                        className="flex items-center gap-3 px-4 py-3 bg-surface-container rounded-xl border border-outline-variant/20 hover:border-primary/50 transition-all w-full"
                      >
                        <FileJson className="w-5 h-5 text-primary" />
                        <div className="text-left">
                          <p className="font-medium text-on-surface">Import from JSON</p>
                          <p className="text-xs text-on-surface-variant">Load a course structure from a JSON file</p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 1: Basic Info */}
                {wizardStep === 1 && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-on-surface mb-2">Course Title</label>
                      <input
                        type="text"
                        value={courseData.title}
                        onChange={(e) => setCourseData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter course title..."
                        className="w-full bg-surface-container border border-outline-variant/20 rounded-lg py-3 px-4 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-on-surface mb-2">Description</label>
                      <textarea
                        value={courseData.description}
                        onChange={(e) => setCourseData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe your course..."
                        rows={4}
                        className="w-full bg-surface-container border border-outline-variant/20 rounded-lg py-3 px-4 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-on-surface mb-2">Thumbnail (Local Path)</label>
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={courseData.thumbnailPath}
                          onChange={(e) => setCourseData(prev => ({ ...prev, thumbnailPath: e.target.value }))}
                          placeholder="C:\Videos\thumbnail.jpg or /path/to/image.png"
                          className="flex-1 bg-surface-container border border-outline-variant/20 rounded-lg py-3 px-4 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                        <button className="px-4 bg-surface-container-high hover:bg-surface-container-highest rounded-lg text-on-surface-variant transition-colors">
                          <Upload className="w-5 h-5" />
                        </button>
                      </div>
                      <p className="text-xs text-outline mt-1 flex items-center gap-1">
                        <HardDrive className="w-3 h-3" /> Enter the local file path to your thumbnail image
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-on-surface mb-2">Tags</label>
                      <div className="flex flex-wrap gap-2">
                        {tags.map(tag => (
                          <button
                            key={tag.id}
                            onClick={() => toggleTag(tag.id)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                              courseData.tags.includes(tag.id)
                                ? tag.color + ' ring-2 ring-offset-2 ring-offset-surface-container-low ring-current'
                                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                            }`}
                          >
                            <Tag className="w-3 h-3" />
                            {tag.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Modules with Multi-File Support */}
                {wizardStep === 2 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm text-on-surface-variant">Add and arrange modules for your course</p>
                        <p className="text-xs text-outline mt-1">Each module can contain multiple files. Drag modules to reorder.</p>
                      </div>
                      <button
                        onClick={addModule}
                        className="flex items-center gap-1 text-primary text-sm font-medium hover:underline"
                      >
                        <Plus className="w-4 h-4" /> Add Module
                      </button>
                    </div>
                    
                    {courseData.modules.length === 0 ? (
                      <div className="text-center py-12 bg-surface-container rounded-xl border-2 border-dashed border-outline-variant/30">
                        <Folder className="w-10 h-10 text-on-surface-variant mx-auto mb-3" />
                        <p className="text-on-surface font-medium mb-1">No modules yet</p>
                        <p className="text-sm text-on-surface-variant mb-4">Add modules to organize your course content. Each module can contain multiple files.</p>
                        <button
                          onClick={addModule}
                          className="px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-medium"
                        >
                          Add First Module
                        </button>
                      </div>
                    ) : (
                      <Reorder.Group 
                        axis="y" 
                        values={courseData.modules} 
                        onReorder={handleModuleReorder}
                        className="space-y-4"
                      >
                        {courseData.modules.map((module, index) => (
                          <Reorder.Item
                            key={module.id}
                            value={module}
                            className="bg-surface-container rounded-xl border border-outline-variant/10 overflow-hidden"
                          >
                            {/* Module Header */}
                            <div className="flex items-center gap-3 p-4 bg-surface-container-high cursor-grab active:cursor-grabbing">
                              <GripVertical className="w-4 h-4 text-outline shrink-0" />
                              <span className="text-xs font-bold text-on-surface-variant bg-surface-container px-2 py-1 rounded shrink-0">
                                {index + 1}
                              </span>
                              <input
                                type="text"
                                value={module.title}
                                onChange={(e) => updateModule(module.id, { title: e.target.value })}
                                placeholder="Module title (e.g., Chapter 1: Introduction)..."
                                className="flex-1 bg-transparent border-none text-on-surface font-medium placeholder:text-outline focus:ring-0"
                              />
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-xs text-on-surface-variant bg-surface-container px-2 py-1 rounded flex items-center gap-1">
                                  {module.files.length} file{module.files.length !== 1 ? 's' : ''}
                                </span>
                                <button
                                  onClick={() => removeModule(module.id)}
                                  className="p-1.5 text-on-surface-variant hover:text-red-400 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            
                            {/* Module Files */}
                            <div className="p-4 space-y-3">
                              {module.files.length === 0 ? (
                                <div className="text-center py-6 border-2 border-dashed border-outline-variant/20 rounded-lg">
                                  <p className="text-sm text-on-surface-variant mb-2">No files in this module</p>
                                  <button
                                    onClick={() => addFileToModule(module.id)}
                                    className="text-primary text-sm font-medium hover:underline flex items-center gap-1 mx-auto"
                                  >
                                    <Plus className="w-4 h-4" /> Add File
                                  </button>
                                </div>
                              ) : (
                                <>
                                  {module.files.map((file, fileIndex) => (
                                    <div 
                                      key={file.id}
                                      className="flex items-center gap-3 p-3 bg-surface-container-high rounded-lg border border-outline-variant/10"
                                    >
                                      <span className="text-xs text-outline shrink-0">{fileIndex + 1}</span>
                                      {getFileIcon(file.type)}
                                      <input
                                        type="text"
                                        value={file.name}
                                        onChange={(e) => updateModuleFile(module.id, file.id, { name: e.target.value })}
                                        placeholder="File name..."
                                        className="w-32 bg-transparent border-none text-sm text-on-surface placeholder:text-outline focus:ring-0"
                                      />
                                      <div className="flex-1 relative">
                                        <input
                                          type="text"
                                          value={file.path}
                                          onChange={(e) => updateModuleFile(module.id, file.id, { path: e.target.value })}
                                          placeholder="Local file path..."
                                          className="w-full bg-surface-container border border-outline-variant/10 rounded-lg py-1.5 pl-3 pr-10 text-xs text-on-surface placeholder:text-outline focus:ring-1 focus:ring-primary"
                                        />
                                        <button
                                          onClick={() => { 
                                            setFilePickerModuleId(module.id); 
                                            setSelectedFileId(file.id);
                                            setShowFilePicker(true); 
                                            setFilePickerFilter('all'); 
                                          }}
                                          className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-on-surface-variant hover:text-primary transition-colors"
                                          title="Select from library"
                                        >
                                          <FolderInput className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                      <select
                                        value={file.type}
                                        onChange={(e) => updateModuleFile(module.id, file.id, { type: e.target.value as ModuleFileLocal['type'] })}
                                        className="bg-surface-container border-none rounded-lg py-1.5 px-2 text-xs text-on-surface shrink-0"
                                      >
                                        <option value="video">Video</option>
                                        <option value="document">Document</option>
                                        <option value="audio">Audio</option>
                                        <option value="image">Image</option>
                                        <option value="other">Other</option>
                                      </select>
                                      <input
                                        type="text"
                                        value={file.duration || ''}
                                        onChange={(e) => updateModuleFile(module.id, file.id, { duration: e.target.value })}
                                        placeholder="Duration"
                                        className="w-20 bg-surface-container border border-outline-variant/10 rounded-lg py-1.5 px-2 text-xs text-on-surface placeholder:text-outline focus:ring-1 focus:ring-primary shrink-0"
                                      />
                                      <button
                                        onClick={() => removeModuleFile(module.id, file.id)}
                                        className="p-1 text-on-surface-variant hover:text-red-400 transition-colors shrink-0"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ))}
                                </>
                              )}
                              
                              {/* Add File Button */}
                              {module.files.length > 0 && (
                                <button
                                  onClick={() => addFileToModule(module.id)}
                                  className="w-full py-2 border border-dashed border-outline-variant/30 rounded-lg text-sm text-on-surface-variant hover:border-primary/50 hover:text-primary transition-all flex items-center justify-center gap-1"
                                >
                                  <Plus className="w-4 h-4" /> Add Another File
                                </button>
                              )}
                            </div>
                          </Reorder.Item>
                        ))}
                      </Reorder.Group>
                    )}
                    
                    {/* Module Summary */}
                    {courseData.modules.length > 0 && (
                      <div className="mt-4 p-3 bg-surface-container-high rounded-lg">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-on-surface-variant font-medium">
                            {courseData.modules.length} module{courseData.modules.length !== 1 ? 's' : ''}
                          </span>
                          <span className="text-on-surface-variant">
                            {courseData.modules.reduce((acc, m) => acc + m.files.length, 0)} total files
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-on-surface-variant">
                          <span className="flex items-center gap-1">
                            <Video className="w-3 h-3 text-tertiary" />
                            {courseData.modules.reduce((acc, m) => acc + m.files.filter(f => f.type === 'video').length, 0)} videos
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3 text-primary" />
                            {courseData.modules.reduce((acc, m) => acc + m.files.filter(f => f.type === 'document').length, 0)} docs
                          </span>
                          <span className="flex items-center gap-1">
                            <Music className="w-3 h-3 text-purple-400" />
                            {courseData.modules.reduce((acc, m) => acc + m.files.filter(f => f.type === 'audio').length, 0)} audio
                          </span>
                          <span className="flex items-center gap-1">
                            <Image className="w-3 h-3 text-green-400" />
                            {courseData.modules.reduce((acc, m) => acc + m.files.filter(f => f.type === 'image').length, 0)} images
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 3: Settings */}
                {wizardStep === 3 && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-on-surface mb-3">Visibility</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => setCourseData(prev => ({ ...prev, visibility: 'private' }))}
                          className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                            courseData.visibility === 'private'
                              ? 'border-primary bg-primary/10'
                              : 'border-outline-variant/20 hover:border-outline-variant/40'
                          }`}
                        >
                          <Lock className={`w-5 h-5 ${courseData.visibility === 'private' ? 'text-primary' : 'text-on-surface-variant'}`} />
                          <div className="text-left">
                            <p className="font-medium text-on-surface">Private</p>
                            <p className="text-xs text-on-surface-variant">Only you can access</p>
                          </div>
                        </button>
                        <button
                          onClick={() => setCourseData(prev => ({ ...prev, visibility: 'public' }))}
                          className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                            courseData.visibility === 'public'
                              ? 'border-primary bg-primary/10'
                              : 'border-outline-variant/20 hover:border-outline-variant/40'
                          }`}
                        >
                          <Globe className={`w-5 h-5 ${courseData.visibility === 'public' ? 'text-primary' : 'text-on-surface-variant'}`} />
                          <div className="text-left">
                            <p className="font-medium text-on-surface">Public</p>
                            <p className="text-xs text-on-surface-variant">Share with others</p>
                          </div>
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-on-surface mb-2">Add to Collection</label>
                      <select
                        value={courseData.collectionId}
                        onChange={(e) => setCourseData(prev => ({ ...prev, collectionId: e.target.value }))}
                        className="w-full bg-surface-container border border-outline-variant/20 rounded-lg py-3 px-4 text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="">None</option>
                        {collections.map(col => (
                          <option key={col.id} value={col.id}>{col.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Summary */}
                    <div className="p-4 bg-surface-container rounded-xl">
                      <h4 className="font-medium text-on-surface mb-3 flex items-center gap-2">
                        Course Summary
                        <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full flex items-center gap-1">
                          <HardDrive className="w-3 h-3" /> Local
                        </span>
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-on-surface-variant">Title</span>
                          <span className="text-on-surface">{courseData.title || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-on-surface-variant">Modules</span>
                          <span className="text-on-surface">{courseData.modules.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-on-surface-variant">Total Files</span>
                          <span className="text-on-surface">{courseData.modules.reduce((acc, m) => acc + m.files.length, 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-on-surface-variant">Tags</span>
                          <span className="text-on-surface">{courseData.tags.length} selected</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-on-surface-variant">Visibility</span>
                          <span className="text-on-surface capitalize">{courseData.visibility}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-on-surface-variant">Collection</span>
                          <span className="text-on-surface">
                            {courseData.collectionId 
                              ? collections.find(c => c.id === courseData.collectionId)?.name 
                              : 'None'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Wizard Footer */}
              <div className="p-6 border-t border-outline-variant/10 flex items-center justify-between">
                <button
                  onClick={() => {
                    if (wizardStep === 0 || (wizardStep === 1 && !isEditMode)) {
                      resetWizard();
                    } else {
                      setWizardStep(wizardStep - 1);
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> {wizardStep === 0 ? 'Cancel' : 'Back'}
                </button>
                {wizardStep > 0 && (
                  <button
                    onClick={() => {
                      if (wizardStep < 3) {
                        setWizardStep(wizardStep + 1);
                      } else {
                        handleCreateCourse();
                      }
                    }}
                    disabled={wizardStep === 1 && !courseData.title}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary to-primary-container text-on-primary rounded-lg text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {wizardStep === 3 ? (isEditMode ? 'Save Changes' : 'Create Course') : 'Next'} <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* JSON Import/Export Modal */}
      <AnimatePresence>
        {showJsonModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => { setShowJsonModal(false); setJsonContent(''); setJsonError(''); }}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="bg-surface-container-low rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-outline-variant/10">
                <div className="flex items-center justify-between">
                  <h2 className="font-headline text-xl font-bold text-on-surface flex items-center gap-2">
                    <FileJson className="w-5 h-5 text-primary" />
                    {jsonMode === 'import' ? 'Import Course from JSON' : 'Export Course to JSON'}
                  </h2>
                  <button
                    onClick={() => { setShowJsonModal(false); setJsonContent(''); setJsonError(''); }}
                    className="p-2 text-on-surface-variant hover:text-on-surface transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {jsonMode === 'import' ? (
                  <>
                    <p className="text-sm text-on-surface-variant">
                      Paste JSON content or upload a JSON file. The file should follow the course schema with title, description, and modules array.
                    </p>
                    
                    <div className="flex gap-3">
                      <input
                        ref={jsonInputRef}
                        type="file"
                        accept=".json,application/json"
                        onChange={handleJsonFileUpload}
                        className="hidden"
                      />
                      <button
                        onClick={() => jsonInputRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-2.5 bg-surface-container hover:bg-surface-container-high border border-outline-variant/20 rounded-lg text-sm font-medium text-on-surface transition-colors"
                      >
                        <FileUp className="w-4 h-4" />
                        Upload JSON File
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-on-surface mb-2">JSON Content</label>
                      <textarea
                        value={jsonContent}
                        onChange={(e) => { setJsonContent(e.target.value); setJsonError(''); }}
                        placeholder={`{
  "version": "1.0",
  "course": {
    "title": "My Course",
    "description": "Course description",
    "tags": ["Design", "Development"]
  },
  "modules": [
    {
      "title": "Introduction",
      "type": "video",
      "filePath": "/path/to/video.mp4",
      "duration": "10m"
    }
  ]
}`}
                        rows={12}
                        className="w-full bg-surface-container border border-outline-variant/20 rounded-lg py-3 px-4 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary focus:border-transparent resize-none font-mono text-sm"
                      />
                    </div>

                    {jsonError && (
                      <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        {jsonError}
                      </div>
                    )}

                    <div className="p-4 bg-surface-container rounded-xl">
                      <h4 className="font-medium text-on-surface mb-2 text-sm">Expected JSON Schema (v2.0 - Multi-File)</h4>
                      <div className="text-xs text-on-surface-variant space-y-1">
                        <p><code className="bg-surface-container-high px-1 rounded">course.title</code> - Required: Course title</p>
                        <p><code className="bg-surface-container-high px-1 rounded">modules[]</code> - Required: Array of modules</p>
                        <p><code className="bg-surface-container-high px-1 rounded">modules[].title</code> - Module title</p>
                        <p><code className="bg-surface-container-high px-1 rounded">modules[].type</code> - video | document | audio | quiz | mixed</p>
                        <p><code className="bg-surface-container-high px-1 rounded">modules[].files[]</code> - Array of files in module</p>
                        <p><code className="bg-surface-container-high px-1 rounded">modules[].files[].name</code> - File name</p>
                        <p><code className="bg-surface-container-high px-1 rounded">modules[].files[].path</code> - Local file path</p>
                        <p><code className="bg-surface-container-high px-1 rounded">modules[].files[].type</code> - video | document | audio | image | other</p>
                        <p className="pt-2 text-outline">Legacy: <code className="bg-surface-container-high px-1 rounded">modules[].filePath</code> also supported</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-on-surface-variant">
                      Export your course structure as JSON to share or backup. You can import this file later to recreate the course.
                    </p>

                    {courses.length > 0 && !selectedCourseForExport && (
                      <div>
                        <label className="block text-sm font-medium text-on-surface mb-2">Select Course to Export</label>
                        <select
                          value={selectedCourseForExport || ''}
                          onChange={(e) => {
                            setSelectedCourseForExport(e.target.value);
                            const course = courses.find(c => c.id === e.target.value);
                            if (course) setJsonContent(exportCourseToJson(course));
                          }}
                          className="w-full bg-surface-container border border-outline-variant/20 rounded-lg py-3 px-4 text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          <option value="">Select a course...</option>
                          {courses.map(c => (
                            <option key={c.id} value={c.id}>{c.title}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {jsonContent && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-on-surface mb-2">Generated JSON</label>
                          <textarea
                            value={jsonContent}
                            readOnly
                            rows={12}
                            className="w-full bg-surface-container border border-outline-variant/20 rounded-lg py-3 px-4 text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent resize-none font-mono text-sm"
                          />
                        </div>
                        
                        <div className="flex gap-3">
                          <button
                            onClick={copyJsonToClipboard}
                            className="flex items-center gap-2 px-4 py-2.5 bg-surface-container hover:bg-surface-container-high border border-outline-variant/20 rounded-lg text-sm font-medium text-on-surface transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                            Copy to Clipboard
                          </button>
                          <button
                            onClick={downloadJson}
                            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-on-primary rounded-lg text-sm font-medium transition-colors"
                          >
                            <Download className="w-4 h-4" />
                            Download JSON
                          </button>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-outline-variant/10 flex items-center justify-between">
                <button
                  onClick={() => { setShowJsonModal(false); setJsonContent(''); setJsonError(''); }}
                  className="px-4 py-2.5 text-on-surface-variant hover:text-on-surface text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                {jsonMode === 'import' && (
                  <button
                    onClick={handleJsonImport}
                    disabled={!jsonContent}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary to-primary-container text-on-primary rounded-lg text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FileUp className="w-4 h-4" />
                    Import Course
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* File Picker Modal - Updated for Multi-File Support */}
      <AnimatePresence>
        {showFilePicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => { setShowFilePicker(false); setFilePickerModuleId(null); setSelectedFileId(null); }}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="bg-surface-container-low rounded-2xl w-full max-w-xl max-h-[70vh] overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-outline-variant/10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-headline text-lg font-bold text-on-surface">Select File from Library</h2>
                  <button
                    onClick={() => { setShowFilePicker(false); setFilePickerModuleId(null); setSelectedFileId(null); }}
                    className="p-2 text-on-surface-variant hover:text-on-surface transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  {(['all', 'video', 'audio', 'document', 'image'] as const).map(filter => (
                    <button
                      key={filter}
                      onClick={() => setFilePickerFilter(filter as typeof filePickerFilter)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                        filePickerFilter === filter 
                          ? 'bg-primary text-on-primary' 
                          : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4">
                {pickerFiles.length === 0 ? (
                  <div className="text-center py-12">
                    <File className="w-10 h-10 text-on-surface-variant mx-auto mb-3" />
                    <p className="text-on-surface font-medium mb-1">No files found</p>
                    <p className="text-sm text-on-surface-variant">Add files to your library first</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {pickerFiles.map(file => (
                      <button
                        key={file.id}
                        onClick={() => {
                          if (filePickerModuleId && selectedFileId) {
                            // Multi-file mode: update specific file in module
                            selectLibraryFileForModule(filePickerModuleId, selectedFileId, file);
                          } else if (filePickerModuleId) {
                            // Legacy single-file mode
                            const module = courseData.modules.find(m => m.id === filePickerModuleId);
                            if (module) {
                              // Add as new file to the module
                              addFileToModule(filePickerModuleId);
                              const newFileId = courseData.modules.find(m => m.id === filePickerModuleId)?.files.slice(-1)[0]?.id;
                              if (newFileId) {
                                selectLibraryFileForModule(filePickerModuleId, newFileId, file);
                              }
                            }
                          }
                          setShowFilePicker(false);
                          setFilePickerModuleId(null);
                          setSelectedFileId(null);
                        }}
                        className="w-full flex items-center gap-3 p-3 bg-surface-container rounded-lg hover:bg-surface-container-high transition-colors text-left"
                      >
                        {getFileIcon(file.type, file.mimeType)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-on-surface truncate">{file.name}</p>
                          <p className="text-xs text-on-surface-variant truncate">{file.path}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className="text-xs text-outline">{formatFileSize(file.size)}</span>
                          {file.duration && <span className="text-xs text-primary">{file.duration}</span>}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collection Modal */}
      <AnimatePresence>
        {showCollectionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCollectionModal(false)}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="bg-surface-container-low rounded-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-outline-variant/10">
                <div className="flex items-center justify-between">
                  <h2 className="font-headline text-xl font-bold text-on-surface">New Collection</h2>
                  <button
                    onClick={() => setShowCollectionModal(false)}
                    className="p-2 text-on-surface-variant hover:text-on-surface transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-2">Collection Name</label>
                  <input
                    type="text"
                    value={newCollection.name}
                    onChange={(e) => setNewCollection(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter collection name..."
                    className="w-full bg-surface-container border border-outline-variant/20 rounded-lg py-3 px-4 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-2">Description</label>
                  <textarea
                    value={newCollection.description}
                    onChange={(e) => setNewCollection(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe this collection..."
                    rows={3}
                    className="w-full bg-surface-container border border-outline-variant/20 rounded-lg py-3 px-4 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-2">Color</label>
                  <div className="flex gap-2">
                    {colorOptions.map(color => (
                      <button
                        key={color}
                        onClick={() => setNewCollection(prev => ({ ...prev, color }))}
                        className={`w-8 h-8 rounded-full ${color} transition-transform ${
                          newCollection.color === color ? 'ring-2 ring-offset-2 ring-offset-surface-container-low ring-white scale-110' : ''
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-outline-variant/10 flex justify-end gap-3">
                <button
                  onClick={() => setShowCollectionModal(false)}
                  className="px-4 py-2.5 text-on-surface-variant hover:text-on-surface text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateCollection}
                  disabled={!newCollection.name}
                  className="px-6 py-2.5 bg-gradient-to-r from-primary to-primary-container text-on-primary rounded-lg text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Collection
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
