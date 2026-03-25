import { useState, useEffect, useRef, Suspense } from 'react';
import { motion, Variants, AnimatePresence } from 'motion/react';
import { ArrowLeft, Settings, User, Search, FileText, BookOpen, File, ZoomIn, ZoomOut, ChevronUp, ChevronDown, Plus, LayoutGrid, LayoutList } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ePub from 'epubjs';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { useDocumentLibrary, StoredDocument } from './hooks/useDocumentLibrary';
import { DocumentCard } from './components/DocumentCard';
import { DocumentList } from './components/DocumentList';
import { FileDiscovery } from './components/FileDiscovery';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface DocumentReaderViewProps {
  onNavigate: (view: string) => void;
}

type ViewMode = 'library' | 'reader';
type DisplayMode = 'grid' | 'list';

export function DocumentReaderView({ onNavigate }: DocumentReaderViewProps) {
  // Document library
  const {
    documents,
    addDocument,
    deleteDocument,
    updateDocument,
    searchDocuments,
  } = useDocumentLibrary();

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('library');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('grid');
  const [selectedDocument, setSelectedDocument] = useState<StoredDocument | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploader, setShowUploader] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Reader state
  const [docType, setDocType] = useState<'markdown' | 'epub' | 'pdf'>('markdown');
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [numPages, setNumPages] = useState<number>();
  const [pdfScale, setPdfScale] = useState<number>(1.0);
  const [pdfError, setPdfError] = useState<string | null>(null);

  // EPUB state
  const epubViewerRef = useRef<HTMLDivElement>(null);
  const [epubBook, setEpubBook] = useState<any>(null);
  const [epubRendition, setEpubRendition] = useState<any>(null);
  const [epubToc, setEpubToc] = useState<any[]>([]);
  const [epubCurrentIndex, setEpubCurrentIndex] = useState<number>(0);
  const [epubProgress, setEpubProgress] = useState<number>(0);

  // Filter documents based on search
  const filteredDocuments = searchQuery
    ? searchDocuments(searchQuery)
    : documents;

  // Handle file selection from uploader
  const handleFilesSelected = async (files: File[]) => {
    setIsUploading(true);
    try {
      for (const file of files) {
        const doc = await addDocument(file);
        if (doc) {
          setSelectedDocument(doc);
          setViewMode('reader');
        }
      }
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setIsUploading(false);
      setShowUploader(false);
    }
  };

  // Handle document selection
  const handleSelectDocument = (doc: StoredDocument) => {
    setSelectedDocument(doc);
    setViewMode('reader');
    setDocType(doc.type as any);
    setPageNumber(1);
    setNumPages(undefined);
    setPdfScale(1.0);
    setPdfError(null);
    setEpubCurrentIndex(0);
    setEpubProgress(0);
    
    const now = new Date().toISOString();
    updateDocument(doc.id, { lastOpened: now });
  };

  // PDF handlers
  const goToPdfPage = (target: number) => {
    if (!numPages) return;
    const normalized = Math.max(1, Math.min(numPages, target));
    setPageNumber(normalized);
    const pageElement = document.getElementById(`pdf-page-${normalized}`);
    if (pageElement) {
      pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const zoomIn = () => setPdfScale(s => Math.min(s + 0.25, 3));
  const zoomOut = () => setPdfScale(s => Math.max(s - 0.25, 0.5));
  const fitWidth = () => setPdfScale(1.0);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPdfError(null);
  }

  function onDocumentLoadError(error: Error) {
    console.error('PDF loading error:', error);
    setPdfError(`Failed to load PDF: ${error.message}`);
  }

  // EPUB handlers
  const epubPrev = () => {
    if (epubRendition) epubRendition.prev();
  };

  const epubNext = () => {
    if (epubRendition) epubRendition.next();
  };

  const gotoEpubToc = (index: number) => {
    const target = epubToc[index];
    if (epubRendition && target) {
      epubRendition.display(target.href);
      setEpubCurrentIndex(index);
    }
  };

  // EPUB setup effect
  useEffect(() => {
    let active = true;

    if (viewMode === 'reader' && docType === 'epub' && selectedDocument && epubViewerRef.current) {
      const book = ePub(selectedDocument.dataUrl);
      const rendition = book.renderTo(epubViewerRef.current, {
        width: '100%',
        height: '100%',
        spread: 'none'
      });

      setEpubBook(book);
      setEpubRendition(rendition);

      book.ready.then(() => {
        if (!active) return;
        setEpubToc(book.navigation.toc || []);
      });

      rendition.display();
      rendition.on('relocated', (location: any) => {
        if (!active) return;
        const cfi = location?.start?.cfi;
        const percentage = Math.round((location?.start?.percent || 0) * 100);
        setEpubProgress(percentage);

        const currentIndex = epubToc.findIndex(item => item.href === location?.start?.href);
        if (currentIndex >= 0) {
          setEpubCurrentIndex(currentIndex);
        }

        if (cfi && book.locations) {
          const current = book.locations.percentageFromCfi(cfi) || 0;
          setEpubProgress(Math.round(current * 100));
        }
      });

      return () => {
        active = false;
        rendition?.destroy?.();
        book?.destroy?.();
        setEpubBook(null);
        setEpubRendition(null);
      };
    }

    return () => {
      active = false;
    };
  }, [viewMode, docType, selectedDocument, epubToc]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  // Library View
  if (viewMode === 'library') {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        exit="exit"
        className="flex flex-col h-dvh bg-background text-on-surface overflow-hidden"
      >
        <nav className="flex justify-between items-center px-4 sm:px-6 lg:px-8 h-16 sm:h-18 border-b border-outline-variant/10 gap-4 shrink-0 bg-surface">
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('library')}
              className="p-2 -ml-2 rounded-lg hover:bg-surface-container-high text-on-surface-variant transition-colors"
              title="Back to library"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-headline font-bold text-on-surface">Documents</h1>
              <p className="text-xs text-on-surface-variant">Manage your PDF, EPUB, and Markdown files</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setDisplayMode(displayMode === 'grid' ? 'list' : 'grid')}
              className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors"
              title={`Switch to ${displayMode === 'grid' ? 'list' : 'grid'} view`}
            >
              {displayMode === 'grid' ? (
                <LayoutList className="w-5 h-5" />
              ) : (
                <LayoutGrid className="w-5 h-5" />
              )}
            </button>

            <button
              onClick={() => setShowUploader(!showUploader)}
              className="px-4 py-2 bg-primary text-on-primary font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Document</span>
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {showUploader && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-b border-outline-variant/10 bg-surface-container/50 p-6"
            >
              <Suspense fallback={<div className="text-center text-on-surface-variant">Loading uploader...</div>}>
                <FileDiscovery onFilesSelected={handleFilesSelected} isLoading={isUploading} />
              </Suspense>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="px-4 sm:px-6 lg:px-8 py-4 border-b border-outline-variant/10 bg-surface-container/30">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface-container rounded-lg border border-outline-variant/20 text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {filteredDocuments.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full text-center"
            >
              <FileText className="w-16 h-16 text-on-surface-variant/20 mb-4" />
              <h3 className="text-lg font-headline font-semibold text-on-surface mb-2">
                {searchQuery ? 'No documents found' : 'No documents yet'}
              </h3>
              <p className="text-sm text-on-surface-variant max-w-xs">
                {searchQuery
                  ? 'Try a different search term'
                  : 'Upload your first PDF, EPUB, or Markdown file to get started'}
              </p>
            </motion.div>
          ) : (
            <>
              {displayMode === 'grid' ? (
                <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {filteredDocuments.map(doc => (
                    <DocumentCard
                      key={doc.id}
                      document={doc}
                      onSelect={handleSelectDocument}
                      onDelete={deleteDocument}
                      isSelected={selectedDocument?.id === doc.id}
                    />
                  ))}
                </motion.div>
              ) : (
                <motion.div layout>
                  <DocumentList
                    documents={filteredDocuments}
                    onSelect={handleSelectDocument}
                    onDelete={deleteDocument}
                    selectedId={selectedDocument?.id}
                  />
                </motion.div>
              )}
            </>
          )}
        </div>
      </motion.div>
    );
  }

  // Reader View
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      className="flex flex-col h-dvh bg-background text-on-surface selection:bg-primary-container selection:text-on-primary-container overflow-hidden"
    >
      <nav className="flex justify-between items-center px-4 sm:px-6 lg:px-12 h-14 sm:h-16 z-50 shrink-0 bg-surface border-b border-outline-variant/10 gap-2 sm:gap-4">
        <div className="flex items-center gap-8 lg:gap-12">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setViewMode('library');
                setSelectedDocument(null);
              }}
              className="p-2 -ml-2 rounded-lg hover:bg-surface-container-high text-on-surface-variant transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="text-lg lg:text-xl font-headline font-bold text-on-surface truncate max-w-xs">
              {selectedDocument?.name}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 lg:gap-6">
          <div className="flex bg-surface-container-high rounded-lg p-1">
            {(['markdown', 'epub', 'pdf'] as const).map(type => (
              <button
                key={type}
                onClick={() => setDocType(type)}
                disabled={selectedDocument?.type !== type}
                className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  docType === type ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-white'
                }`}
              >
                {type === 'markdown' && <FileText className="w-4 h-4" />}
                {type === 'epub' && <BookOpen className="w-4 h-4" />}
                {type === 'pdf' && <File className="w-4 h-4" />}
                <span className="hidden sm:inline capitalize">{type}</span>
              </button>
            ))}
          </div>

          <button className="text-on-surface-variant hover:bg-surface-container-high p-2 rounded-lg transition-all">
            <Settings className="w-5 h-5" />
          </button>
          <button className="text-on-surface-variant hover:bg-surface-container-high p-2 rounded-lg transition-all">
            <User className="w-5 h-5" />
          </button>
        </div>
      </nav>

      <main className="flex-1 bg-background overflow-y-auto relative flex flex-col">
        {docType === 'epub' && selectedDocument?.type === 'epub' && (
          <>
            <div className="bg-surface-container-low border-b border-outline-variant/10 px-6 py-3 flex flex-col gap-2 sticky top-0 z-10">
              <div className="flex items-center gap-2 flex-wrap">
                <button onClick={epubPrev} className="px-2 py-1 rounded-md bg-surface-container-high text-xs font-semibold hover:bg-surface-container-highest">
                  Prev
                </button>
                <button onClick={epubNext} className="px-2 py-1 rounded-md bg-surface-container-high text-xs font-semibold hover:bg-surface-container-highest">
                  Next
                </button>
                <div className="text-xs text-on-surface-variant">Progress: {epubProgress}%</div>
                <div className="text-xs text-on-surface-variant">Section {epubCurrentIndex + 1} / {epubToc.length || 1}</div>
              </div>
              {epubToc.length > 0 && (
                <select
                  className="w-full bg-surface-container text-on-surface rounded-lg py-1.5 px-2 text-sm"
                  value={epubCurrentIndex}
                  onChange={e => gotoEpubToc(Number(e.target.value))}
                >
                  {epubToc.map((item, index) => (
                    <option key={item.href} value={index}>
                      {item.label || `Chapter ${index + 1}`}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className="flex-1 w-full h-full bg-surface-container-lowest flex items-center justify-center relative">
              <div ref={epubViewerRef} className="w-full h-full max-w-4xl bg-white text-black overflow-hidden shadow-2xl"></div>
            </div>
          </>
        )}

        {docType === 'markdown' && selectedDocument?.type === 'markdown' && (
          <motion.div variants={containerVariants} className="max-w-4xl mx-auto px-6 lg:px-16 py-8 lg:py-12 w-full">
            <motion.article
              variants={itemVariants}
              className="max-w-none prose prose-invert prose-p:text-on-surface-variant prose-p:leading-relaxed prose-p:text-lg prose-headings:font-headline prose-headings:text-white prose-a:text-primary prose-strong:text-white prose-img:rounded-xl prose-img:border prose-img:border-outline-variant/10"
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {selectedDocument.dataUrl.split(',')[1]
                  ? atob(selectedDocument.dataUrl.split(',')[1])
                  : selectedDocument.dataUrl}
              </ReactMarkdown>
            </motion.article>
          </motion.div>
        )}

        {docType === 'pdf' && selectedDocument?.type === 'pdf' && (
          <motion.div variants={itemVariants} className="flex-1 w-full h-full bg-surface-container-lowest flex flex-col items-center relative overflow-hidden">
            <div className="sticky top-0 z-20 w-full bg-surface-container/95 backdrop-blur-md border-b border-outline-variant/10 px-4 py-2 flex flex-col gap-2 shrink-0">
              <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
                <button
                  onClick={() => goToPdfPage(1)}
                  disabled={!numPages || pageNumber <= 1}
                  className="px-2 py-1 rounded-lg bg-surface-container-high hover:bg-surface-container-highest disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold"
                >
                  First
                </button>
                <button
                  onClick={() => goToPdfPage(pageNumber - 1)}
                  disabled={!numPages || pageNumber <= 1}
                  className="p-1.5 sm:p-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold text-on-surface min-w-[70px] text-center">
                  {pageNumber} / {numPages || '...'}
                </span>
                <button
                  onClick={() => goToPdfPage(pageNumber + 1)}
                  disabled={!numPages || pageNumber >= (numPages || 1)}
                  className="p-1.5 sm:p-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button
                  onClick={() => goToPdfPage(numPages || 1)}
                  disabled={!numPages || pageNumber >= (numPages || 1)}
                  className="px-2 py-1 rounded-lg bg-surface-container-high hover:bg-surface-container-highest disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold"
                >
                  Last
                </button>
              </div>

              <div className="flex items-center gap-2 justify-center w-full">
                <input
                  type="range"
                  min={1}
                  max={numPages || 1}
                  value={pageNumber}
                  onChange={e => goToPdfPage(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="flex items-center justify-center gap-1">
                <button
                  onClick={zoomOut}
                  disabled={pdfScale <= 0.5}
                  className="p-1.5 sm:p-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-on-surface-variant"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={fitWidth}
                  className="px-2 py-1 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-xs font-bold text-on-surface min-w-[50px] text-center transition-colors"
                >
                  {Math.round(pdfScale * 100)}%
                </button>
                <button
                  onClick={zoomIn}
                  disabled={pdfScale >= 3}
                  className="p-1.5 sm:p-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-on-surface-variant"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 w-full overflow-y-auto py-6 px-4">
              <div className="flex flex-col items-center mx-auto">
                {pdfError ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-full max-w-2xl bg-error/10 border border-error/30 rounded-lg p-6 text-center"
                  >
                    <p className="text-error font-medium mb-2">Could not load PDF</p>
                    <p className="text-error/80 text-sm mb-4">{pdfError}</p>
                    <button
                      onClick={() => {
                        setPdfError(null);
                        setPageNumber(1);
                        setNumPages(undefined);
                      }}
                      className="px-4 py-2 bg-error text-on-error rounded-lg text-sm font-medium hover:bg-error/90 transition-colors"
                    >
                      Retry
                    </button>
                  </motion.div>
                ) : (
                  <Document
                    file={selectedDocument.dataUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                    className="flex flex-col items-center gap-4"
                    loading={<div className="text-primary animate-pulse py-12">Loading PDF...</div>}
                  >
                    {Array.from(new Array(numPages || 0), (_, index) => {
                      const page = index + 1;
                      return (
                        <div
                          id={`pdf-page-${page}`}
                          key={`page_${page}`}
                          className={`bg-white rounded-lg shadow-xl overflow-hidden ${
                            page === pageNumber ? 'ring-2 ring-primary' : ''
                          }`}
                        >
                          <Page
                            pageNumber={page}
                            scale={pdfScale}
                            renderTextLayer={true}
                            renderAnnotationLayer={true}
                          />
                        </div>
                      );
                    })}
                  </Document>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {(!selectedDocument || docType !== selectedDocument.type) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex items-center justify-center text-center"
          >
            <div>
              <FileText className="w-16 h-16 text-on-surface-variant/20 mx-auto mb-4" />
              <p className="text-on-surface-variant">Unable to load document</p>
            </div>
          </motion.div>
        )}
      </main>
    </motion.div>
  );
}
