import { useState, useRef, useCallback } from 'react';
import { motion, Variants, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Upload, 
  X, 
  ChevronRight, 
  ChevronLeft,
  Folder,
  FolderPlus,
  Video,
  FileText,
  Image,
  File,
  Tag,
  Check,
  Trash2,
  Edit3,
  MoreHorizontal,
  GripVertical,
  Link,
  Clock,
  Users,
  Globe,
  Lock,
  Search,
  Filter,
  LayoutGrid,
  List
} from 'lucide-react';

interface ContentManageViewProps {
  onNavigate: (view: string) => void;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  progress: number;
}

interface Collection {
  id: string;
  name: string;
  description: string;
  color: string;
  itemCount: number;
  thumbnail?: string;
}

interface CourseModule {
  id: string;
  title: string;
  type: 'video' | 'document' | 'quiz';
  duration?: string;
}

const availableTags = [
  { id: '1', name: 'Design', color: 'bg-purple-500/20 text-purple-400' },
  { id: '2', name: 'Development', color: 'bg-blue-500/20 text-blue-400' },
  { id: '3', name: 'Business', color: 'bg-green-500/20 text-green-400' },
  { id: '4', name: 'Marketing', color: 'bg-pink-500/20 text-pink-400' },
  { id: '5', name: 'Productivity', color: 'bg-orange-500/20 text-orange-400' },
  { id: '6', name: 'AI & ML', color: 'bg-cyan-500/20 text-cyan-400' },
];

const existingCollections: Collection[] = [
  { id: '1', name: 'Productivity Workflow', description: 'Tools and techniques for better productivity', color: 'bg-blue-500', itemCount: 12, thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBX1bWBEyMRgpKwDSE7aI7bwMqvwfeWG4dUaeS4cQNP_z9bjKZf3M3ifahQ2Fw879pDcgSYRCFKE8xKSfCZt-y66FobcDhnPrQWQve7V31tf2xXCp1VC1nLmgcPK4JoyNLa1506I6indMsnfqIy57EBgx5Qm98LEwol-Vfi3dlesbdeUpVe_UMYj9ZJZRbCawcPTgLtrcODFejFNhP4JkBiuCLp9bI8wJPDHsFJDANQFKaJaMSzdR67IYumCawZ_7OMjTrXCN1edGg' },
  { id: '2', name: 'Design Systems 101', description: 'Learn design system fundamentals', color: 'bg-purple-500', itemCount: 8, thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCTMJxr1xXD1F9vcOM1p9s0BGw1awsBNTBfZd4lmjO8ZNCdJrNF5M2DC7pogyIpm6OrpaD309sywxUIEoNc21FlJ-RBg9mjT7_3bUZAEGTosH3P7Mg15zYBSr1-G7yn2LxMDpGkcSi8vMfUH0aN_C9asJTULQCXSAs9dPRwiM2_2iWWr7kuNI173tEvJ5RjWcEIFkqN-MM35q2IdSawAE7cxrDayzhz6AMBWqkB9o48mWh_RyVPBN9gu3DO9l2cf2O0XHktlLUKbKA' },
  { id: '3', name: 'Fullstack Mastery', description: 'Complete fullstack development course', color: 'bg-green-500', itemCount: 42, thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD8dc_e_O4xL2CmQruOwjVjxtmDHBDyza0zFtLEx4IE5bZ-NZax_iCNtPWPEDiXdYbK4P6zc4HkYH7b0GPWmSY_S_xULiQuHkgEvPKy9SaaB22j92AtmjBA8ONlHUIhkGSVV8laFIytVeogTeymtIlvpaStg4lkHZiIpXCP-qphMkXSfSaBLowwz9GpC4GW-v0_bOvF67pjw5EViqUDtOKfWTVmdfNvSWtFxP_Hk5ta3NXR3AQ8Zv4GgsY5kkbOc9jTQ1YqbFW_nW8' },
  { id: '4', name: 'AI & Future Tech', description: 'Exploring AI and emerging technologies', color: 'bg-cyan-500', itemCount: 15, thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuADmYCyty397nCd1goPnNeGmus7ONkH3KJaT0osvkI5d91-_nfDj3vqAonYxF58JD68m53HxOTFf7i7f_iw7uzVn0Z1nu9larR1xIOAtD4nRWe1l3uEv0HiSKiwmVDsuPecX0qNU2fK3ty3dKbd3UWpDVyqcUVeCUidE7QDOzua1Ta5FvqqyhI16meYHpxCPldYLjfPJ1mwVEGFxcWLZyKbUZn7u7x-iJnXVTSJtkPn2yxd1VvhW-gH9GVrHpEuHc4kK8Tat1QVbK0' },
];

export function ContentManageView({ onNavigate }: ContentManageViewProps) {
  // View state
  const [activeTab, setActiveTab] = useState<'courses' | 'collections' | 'files'>('courses');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Course wizard state
  const [showCourseWizard, setShowCourseWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    thumbnail: '',
    visibility: 'private' as 'private' | 'public',
    collection: '',
    tags: [] as string[],
    modules: [] as CourseModule[]
  });
  
  // Collection modal state
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [newCollection, setNewCollection] = useState({ name: '', description: '', color: 'bg-blue-500' });
  const [collections, setCollections] = useState<Collection[]>(existingCollections);
  
  // File upload state
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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

  // File handling
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
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files: File[]) => {
    const newFiles: UploadedFile[] = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      progress: 0
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
    
    // Simulate upload progress
    newFiles.forEach(file => {
      const interval = setInterval(() => {
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === file.id 
              ? { ...f, progress: Math.min(f.progress + 10, 100) }
              : f
          )
        );
      }, 200);
      
      setTimeout(() => clearInterval(interval), 2200);
    });
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('video/')) return <Video className="w-5 h-5 text-tertiary" />;
    if (type.startsWith('image/')) return <Image className="w-5 h-5 text-green-400" />;
    if (type.includes('pdf') || type.includes('document')) return <FileText className="w-5 h-5 text-primary" />;
    return <File className="w-5 h-5 text-on-surface-variant" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };

  // Tag handling
  const toggleTag = (tagId: string) => {
    setCourseData(prev => ({
      ...prev,
      tags: prev.tags.includes(tagId) 
        ? prev.tags.filter(t => t !== tagId)
        : [...prev.tags, tagId]
    }));
  };

  // Collection handling
  const createCollection = () => {
    const newCol: Collection = {
      id: Math.random().toString(36).substr(2, 9),
      name: newCollection.name,
      description: newCollection.description,
      color: newCollection.color,
      itemCount: 0
    };
    setCollections(prev => [...prev, newCol]);
    setNewCollection({ name: '', description: '', color: 'bg-blue-500' });
    setShowCollectionModal(false);
  };

  // Module handling
  const addModule = () => {
    setCourseData(prev => ({
      ...prev,
      modules: [...prev.modules, {
        id: Math.random().toString(36).substr(2, 9),
        title: '',
        type: 'video',
        duration: ''
      }]
    }));
  };

  const updateModule = (id: string, updates: Partial<CourseModule>) => {
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

  const colorOptions = [
    'bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 
    'bg-pink-500', 'bg-cyan-500', 'bg-red-500', 'bg-yellow-500'
  ];

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
            <h1 className="font-headline text-3xl lg:text-4xl font-extrabold text-on-surface tracking-tight">
              Content Manager
            </h1>
            <p className="text-on-surface-variant mt-2">
              Create, organize, and manage your learning content
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCollectionModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-surface-container hover:bg-surface-container-high border border-outline-variant/20 rounded-lg text-on-surface text-sm font-medium transition-colors"
            >
              <FolderPlus className="w-4 h-4" />
              New Collection
            </button>
            <button
              onClick={() => { setShowCourseWizard(true); setWizardStep(1); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary to-primary-container text-on-primary rounded-lg text-sm font-bold shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="w-4 h-4" />
              Create Course
            </button>
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
            accept="video/*,image/*,.pdf,.doc,.docx,.epub,.md"
          />
          <div className="flex flex-col items-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${
              isDragging ? 'bg-primary/20' : 'bg-surface-container-high'
            }`}>
              <Upload className={`w-7 h-7 ${isDragging ? 'text-primary' : 'text-on-surface-variant'}`} />
            </div>
            <p className="text-on-surface font-medium mb-1">
              {isDragging ? 'Drop files here' : 'Drag and drop files here'}
            </p>
            <p className="text-sm text-on-surface-variant">
              or click to browse. Supports video, images, PDF, and documents.
            </p>
          </div>
        </div>

        {/* Uploaded Files List */}
        <AnimatePresence>
          {uploadedFiles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 space-y-2"
            >
              {uploadedFiles.map(file => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-4 p-4 bg-surface-container rounded-lg"
                >
                  {getFileIcon(file.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-on-surface truncate">{file.name}</p>
                    <p className="text-xs text-on-surface-variant">{formatFileSize(file.size)}</p>
                  </div>
                  <div className="w-32">
                    {file.progress < 100 ? (
                      <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${file.progress}%` }}
                          className="h-full bg-primary rounded-full"
                        />
                      </div>
                    ) : (
                      <span className="text-xs text-green-400 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Complete
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => removeFile(file.id)}
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
            {collections.map(collection => (
              <motion.div
                key={collection.id}
                variants={itemVariants}
                className={`bg-surface-container rounded-xl border border-outline-variant/10 overflow-hidden hover:bg-surface-container-high transition-all cursor-pointer group ${
                  viewMode === 'list' ? 'flex items-center' : ''
                }`}
              >
                {viewMode === 'grid' ? (
                  <>
                    <div className="aspect-video relative overflow-hidden">
                      {collection.thumbnail ? (
                        <img src={collection.thumbnail} alt={collection.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className={`w-full h-full ${collection.color} opacity-20`} />
                      )}
                      <div className={`absolute top-3 left-3 w-3 h-3 rounded-full ${collection.color}`} />
                    </div>
                    <div className="p-4">
                      <h3 className="font-headline font-bold text-on-surface mb-1">{collection.name}</h3>
                      <p className="text-xs text-on-surface-variant line-clamp-2 mb-2">{collection.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-outline">{collection.itemCount} items</span>
                        <button className="opacity-0 group-hover:opacity-100 transition-opacity text-on-surface-variant hover:text-on-surface">
                          <MoreHorizontal className="w-4 h-4" />
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
                      <button className="p-2 text-on-surface-variant hover:text-on-surface">
                        <MoreHorizontal className="w-4 h-4" />
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
            {/* Sample course cards */}
            {[
              { title: 'Mastering Architectural Visualization', modules: 24, duration: '12h', status: 'published' },
              { title: 'Design Systems 101', modules: 8, duration: '4h', status: 'draft' },
              { title: 'Fullstack Mastery', modules: 42, duration: '20h', status: 'published' },
            ].map((course, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="bg-surface-container rounded-xl border border-outline-variant/10 overflow-hidden hover:bg-surface-container-high transition-all cursor-pointer group"
              >
                <div className="aspect-video relative overflow-hidden bg-surface-container-high">
                  <img 
                    src={existingCollections[i]?.thumbnail} 
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                      course.status === 'published' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {course.status}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-headline font-bold text-on-surface mb-2 line-clamp-1">{course.title}</h3>
                  <div className="flex items-center gap-4 text-xs text-on-surface-variant mb-3">
                    <span className="flex items-center gap-1">
                      <Video className="w-3 h-3" /> {course.modules} modules
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {course.duration}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="flex-1 py-2 bg-surface-container-high hover:bg-surface-container-highest rounded-lg text-xs font-medium text-on-surface transition-colors flex items-center justify-center gap-1">
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                    <button className="p-2 bg-surface-container-high hover:bg-surface-container-highest rounded-lg text-on-surface-variant transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {/* Create Course Card */}
            <motion.div
              variants={itemVariants}
              onClick={() => { setShowCourseWizard(true); setWizardStep(1); }}
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
                {[
                  { name: 'Intro_Video.mp4', type: 'Video', tags: ['Design'], size: '245 MB', date: '2 hours ago' },
                  { name: 'Course_Outline.pdf', type: 'Document', tags: ['Business', 'Productivity'], size: '2.4 MB', date: 'Yesterday' },
                  { name: 'Module_Assets.zip', type: 'Archive', tags: ['Development'], size: '128 MB', date: '3 days ago' },
                ].map((file, i) => (
                  <tr key={i} className="hover:bg-surface-container-high/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {file.type === 'Video' && <Video className="w-5 h-5 text-tertiary" />}
                        {file.type === 'Document' && <FileText className="w-5 h-5 text-primary" />}
                        {file.type === 'Archive' && <File className="w-5 h-5 text-on-surface-variant" />}
                        <span className="text-sm font-medium text-on-surface">{file.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">{file.type}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {file.tags.map(tag => {
                          const tagData = availableTags.find(t => t.name === tag);
                          return (
                            <span key={tag} className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${tagData?.color || 'bg-surface-container-high text-on-surface-variant'}`}>
                              {tag}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">{file.size}</td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">{file.date}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-1.5 text-on-surface-variant hover:text-on-surface transition-colors">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-on-surface-variant hover:text-red-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
            onClick={() => setShowCourseWizard(false)}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="bg-surface-container-low rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Wizard Header */}
              <div className="p-6 border-b border-outline-variant/10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-headline text-xl font-bold text-on-surface">Create New Course</h2>
                  <button
                    onClick={() => setShowCourseWizard(false)}
                    className="p-2 text-on-surface-variant hover:text-on-surface transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
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
                  <span>Content</span>
                  <span>Settings</span>
                </div>
              </div>

              {/* Wizard Content */}
              <div className="flex-1 overflow-y-auto p-6">
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
                      <label className="block text-sm font-medium text-on-surface mb-2">Thumbnail URL</label>
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={courseData.thumbnail}
                          onChange={(e) => setCourseData(prev => ({ ...prev, thumbnail: e.target.value }))}
                          placeholder="https://..."
                          className="flex-1 bg-surface-container border border-outline-variant/20 rounded-lg py-3 px-4 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                        <button className="px-4 bg-surface-container-high hover:bg-surface-container-highest rounded-lg text-on-surface-variant transition-colors">
                          <Upload className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-on-surface mb-2">Tags</label>
                      <div className="flex flex-wrap gap-2">
                        {availableTags.map(tag => (
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

                {/* Step 2: Content/Modules */}
                {wizardStep === 2 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-on-surface-variant">Add modules to structure your course content</p>
                      <button
                        onClick={addModule}
                        className="flex items-center gap-1 text-primary text-sm font-medium hover:underline"
                      >
                        <Plus className="w-4 h-4" /> Add Module
                      </button>
                    </div>
                    
                    {courseData.modules.length === 0 ? (
                      <div className="text-center py-12 bg-surface-container rounded-xl border-2 border-dashed border-outline-variant/30">
                        <Video className="w-10 h-10 text-on-surface-variant mx-auto mb-3" />
                        <p className="text-on-surface font-medium mb-1">No modules yet</p>
                        <p className="text-sm text-on-surface-variant mb-4">Add modules to organize your course content</p>
                        <button
                          onClick={addModule}
                          className="px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-medium"
                        >
                          Add First Module
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {courseData.modules.map((module, index) => (
                          <div
                            key={module.id}
                            className="flex items-center gap-3 p-4 bg-surface-container rounded-lg border border-outline-variant/10"
                          >
                            <GripVertical className="w-4 h-4 text-outline cursor-grab" />
                            <span className="text-sm text-on-surface-variant w-6">{index + 1}.</span>
                            <input
                              type="text"
                              value={module.title}
                              onChange={(e) => updateModule(module.id, { title: e.target.value })}
                              placeholder="Module title..."
                              className="flex-1 bg-transparent border-none text-on-surface placeholder:text-outline focus:ring-0"
                            />
                            <select
                              value={module.type}
                              onChange={(e) => updateModule(module.id, { type: e.target.value as CourseModule['type'] })}
                              className="bg-surface-container-high border-none rounded-lg py-1.5 px-3 text-sm text-on-surface"
                            >
                              <option value="video">Video</option>
                              <option value="document">Document</option>
                              <option value="quiz">Quiz</option>
                            </select>
                            <button
                              onClick={() => removeModule(module.id)}
                              className="p-1.5 text-on-surface-variant hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
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
                            <p className="text-xs text-on-surface-variant">Anyone can view</p>
                          </div>
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-on-surface mb-2">Add to Collection</label>
                      <select
                        value={courseData.collection}
                        onChange={(e) => setCourseData(prev => ({ ...prev, collection: e.target.value }))}
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
                      <h4 className="font-medium text-on-surface mb-3">Course Summary</h4>
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
                          <span className="text-on-surface-variant">Tags</span>
                          <span className="text-on-surface">{courseData.tags.length} selected</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-on-surface-variant">Visibility</span>
                          <span className="text-on-surface capitalize">{courseData.visibility}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Wizard Footer */}
              <div className="p-6 border-t border-outline-variant/10 flex items-center justify-between">
                <button
                  onClick={() => wizardStep > 1 && setWizardStep(wizardStep - 1)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    wizardStep === 1 
                      ? 'text-outline cursor-not-allowed' 
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                  }`}
                  disabled={wizardStep === 1}
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={() => {
                    if (wizardStep < 3) {
                      setWizardStep(wizardStep + 1);
                    } else {
                      // Create course
                      setShowCourseWizard(false);
                      setCourseData({
                        title: '',
                        description: '',
                        thumbnail: '',
                        visibility: 'private',
                        collection: '',
                        tags: [],
                        modules: []
                      });
                      setWizardStep(1);
                    }
                  }}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary to-primary-container text-on-primary rounded-lg text-sm font-bold"
                >
                  {wizardStep === 3 ? 'Create Course' : 'Next'} <ChevronRight className="w-4 h-4" />
                </button>
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
                  onClick={createCollection}
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
