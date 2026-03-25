import { useState, useEffect, useRef } from 'react';
import { motion, Variants } from 'motion/react';
import { Settings, User, Plus, FolderOpen, Clock, Pin, Users, Archive, ChevronRight, Maximize2, Copy, ListFilter as Filter, MoveVertical as MoreVertical, Reply, ThumbsUp, CircleCheck as CheckCircle2, Paperclip, ArrowLeft, BookOpen, FileText, File, ZoomIn, ZoomOut, ChevronLeft, ChevronUp, ChevronDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ePub from 'epubjs';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const sampleMarkdown = `
This document outlines the core structural principles behind the VOID workspace, focusing on tonal depth and digital material properties.

## 1. Core Philosophy

The system is designed for **deep focus**. Unlike traditional interfaces that rely on high-contrast lines and borders, VOID uses tonal shifting to define space. This minimizes visual noise and allows the user's primary content to command attention.

![VOID Material Study](https://lh3.googleusercontent.com/aida-public/AB6AXuAqHi58eXOWeAwhBTN26kH1y1iNa7HNymAkMR6-6cHnvMUkXVK6EXwDkVXBhIWfaDRN79LvfMPYQsmZQZdLZLsKdhK4wZ8l7F0azZ-6kgY_7srFiWS6wkzYgm6CqYkM50LF-J6ZaXs9ZW2f_rggpK75A61CvJ4Sq9fZM3cfh1DpdCLbPGlOFtwSJJHJjYOcxwZ1Ho6fwWJxw2IQqKKPECtLdz1Cxs0qoLyKabL11CZ3EURBFXUu2j0EIOJlBoUKOICY7zJ2rYYOE84)
*Fig 1.1: Tonal layering visual representation*

## 2. Implementation Strategy

Developers should prioritize the use of the \`surface-container\` hierarchy. Transitions between containers should be felt through subtle changes in luminance rather than hard edges.

\`\`\`javascript
// tailwind-config.js
theme: {
  extend: {
    colors: {
      surface: "#111317",
      container: "#1e2024",
      elevated: "#282a2e",
    }
  }
}
\`\`\`

Note that we strictly prohibit \`100% opaque borders\`. Use \`outline-variant\` at 15% opacity if structural clarity is required for accessibility.
`;

export function DocumentReaderView({ onNavigate }: { onNavigate: (view: string) => void }) {
  const [docType, setDocType] = useState<'markdown' | 'epub' | 'pdf'>('markdown');
  const epubViewerRef = useRef<HTMLDivElement>(null);
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pdfScale, setPdfScale] = useState<number>(1.0);

  const [epubBook, setEpubBook] = useState<any>(null);
  const [epubRendition, setEpubRendition] = useState<any>(null);
  const [epubToc, setEpubToc] = useState<any[]>([]);
  const [epubCurrentIndex, setEpubCurrentIndex] = useState<number>(0);
  const [epubProgress, setEpubProgress] = useState<number>(0);

  const goToPdfPage = (target: number) => {
    if (!numPages) return;
    const normalized = Math.max(1, Math.min(numPages, target));
    setPageNumber(normalized);
    const pageElement = document.getElementById(`pdf-page-${normalized}`);
    if (pageElement) {
      pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

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
  
  // Zoom controls
  const zoomIn = () => setPdfScale(s => Math.min(s + 0.25, 3));
  const zoomOut = () => setPdfScale(s => Math.max(s - 0.25, 0.5));
  const fitWidth = () => setPdfScale(1.0);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  useEffect(() => {
    let active = true;

    if (docType === 'epub' && epubViewerRef.current) {
      const book = ePub("https://s3.amazonaws.com/moby-dick/moby-dick.epub");
      const rendition = book.renderTo(epubViewerRef.current, {
        width: "100%",
        height: "100%",
        spread: "none"
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
  }, [docType, epubToc]);

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      className="flex flex-col h-dvh bg-background text-on-surface selection:bg-primary-container selection:text-on-primary-container overflow-hidden"
    >
      {/* TopNavBar */}
      <nav className="flex justify-between items-center px-4 sm:px-6 lg:px-12 w-full z-50 shrink-0 bg-[#111317] h-14 sm:h-16 border-b border-outline-variant/10 gap-2 sm:gap-4">
        <div className="flex items-center gap-8 lg:gap-12">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => onNavigate('library')}
              className="p-2 -ml-2 rounded-lg hover:bg-surface-container-high text-on-surface-variant transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="text-xl lg:text-2xl font-black text-white tracking-tighter">VOID Docs</span>
          </div>
          <div className="hidden md:flex gap-8"></div>
        </div>
        <div className="flex items-center gap-4 lg:gap-6">
          <div className="flex bg-surface-container-high rounded-lg p-1 mr-4">
            <button 
              onClick={() => setDocType('markdown')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-all ${docType === 'markdown' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-white'}`}
            >
              <FileText className="w-4 h-4" /> Markdown
            </button>
            <button 
              onClick={() => setDocType('epub')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-all ${docType === 'epub' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-white'}`}
            >
              <BookOpen className="w-4 h-4" /> ePub
            </button>
            <button 
              onClick={() => setDocType('pdf')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-all ${docType === 'pdf' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-white'}`}
            >
              <File className="w-4 h-4" /> PDF
            </button>
          </div>
          <button className="text-on-surface-variant hover:bg-surface-container-high p-2 rounded-lg transition-all active:scale-95 duration-200">
            <Settings className="w-5 h-5" />
          </button>
          <button className="text-on-surface-variant hover:bg-surface-container-high p-2 rounded-lg transition-all active:scale-95 duration-200">
            <User className="w-5 h-5" />
          </button>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* SideNavBar */}
        <aside className="hidden lg:flex flex-col h-full py-8 border-r border-outline-variant/5 bg-surface-container w-64 shrink-0 overflow-y-auto custom-scrollbar">
          <motion.div variants={itemVariants} className="px-6 mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-surface-container-highest flex items-center justify-center overflow-hidden">
                <img 
                  alt="User Profile" 
                  className="w-full h-full object-cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAW2HxlI0O7zUjNiyiZrHHIAukzr-EmP29ketP8pUydmU7Li9p7RZ6PRVZKm2XBmAiDEDI8HfdsqoLpVFT6eB4cNildrvmESdYwFrZWh3ci4KRpH5J3H_MLNUiLS1Q3obaEsb7LWakmfip8R1uWhVVaLiyZzv_UVJMdv6c5pBdIg42nbphZXkJjI2bP_RGOlaTYMDBaxioFkbCYqIfZe6pMn3vuWbaV1SWKu7zSxfju1pOi0j8rAAhDTJSXs4ueRV0gkr0gtvc0y90"
                />
              </div>
              <div>
                <h3 className="font-body text-sm font-bold text-white leading-tight">Project VOID</h3>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-semibold">Learning Archive</p>
              </div>
            </div>
            <button className="w-full mt-6 bg-gradient-to-br from-primary to-primary-container text-on-primary py-3 px-4 rounded-xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all">
              <Plus className="w-4 h-4" strokeWidth={3} />
              New Document
            </button>
          </motion.div>
          <motion.nav variants={containerVariants} className="flex-1 space-y-1">
            <motion.button variants={itemVariants} className="w-full flex items-center gap-3 bg-surface-container-highest text-primary border-l-2 border-primary px-6 py-3 font-body text-sm font-medium">
              <FolderOpen className="w-4 h-4" />
              Library
            </motion.button>
            <motion.button variants={itemVariants} className="w-full flex items-center gap-3 text-on-surface-variant px-6 py-3 hover:bg-surface-container-high font-body text-sm font-medium transition-all">
              <Clock className="w-4 h-4" />
              Recents
            </motion.button>
            <motion.button variants={itemVariants} className="w-full flex items-center gap-3 text-on-surface-variant px-6 py-3 hover:bg-surface-container-high font-body text-sm font-medium transition-all">
              <Pin className="w-4 h-4" />
              Pinned
            </motion.button>

          </motion.nav>
        </aside>

        {/* Main Document Content */}
        <main className="flex-1 bg-background overflow-y-auto custom-scrollbar relative flex flex-col">
          {docType === 'epub' && (
            <div className="bg-surface-container-low border-b border-outline-variant/10 px-6 py-3 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <button onClick={epubPrev} className="px-2 py-1 rounded-md bg-surface-container-high text-xs font-semibold hover:bg-surface-container-highest">Prev</button>
                <button onClick={epubNext} className="px-2 py-1 rounded-md bg-surface-container-high text-xs font-semibold hover:bg-surface-container-highest">Next</button>
                <div className="text-xs text-on-surface-variant">Progress: {epubProgress}%</div>
                <div className="text-xs text-on-surface-variant">Section {epubCurrentIndex + 1} / {epubToc.length || 1}</div>
              </div>
              {epubToc.length > 0 && (
                <select
                  className="w-full bg-surface-container text-on-surface rounded-lg py-1.5 px-2 text-sm"
                  value={epubCurrentIndex}
                  onChange={(e) => gotoEpubToc(Number(e.target.value))}
                >
                  {epubToc.map((item, index) => (
                    <option key={item.href} value={index}>{item.label || `Chapter ${index + 1}`}</option>
                  ))}
                </select>
              )}
            </div>
          )}
          {docType === 'markdown' && (
            <motion.div variants={containerVariants} className="max-w-4xl mx-auto px-6 lg:px-16 py-8 lg:py-12 w-full">
              <motion.header variants={itemVariants} className="mb-12">
                <div className="flex items-center gap-3 text-on-surface-variant text-xs mb-4 uppercase tracking-widest font-semibold">
                  <span>Library</span>
                  <ChevronRight className="w-3 h-3" />
                  <span>Product Specifications</span>
                </div>
                <h1 className="font-headline text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">The VOID Layering Architecture</h1>
                <div className="flex items-center gap-4 text-on-surface-variant text-sm border-b border-outline-variant/20 pb-8 opacity-70">
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> Last edited 2h ago</span>
                  <span className="flex items-center gap-1.5"><User className="w-4 h-4" /> Edited by Alexander V.</span>
                </div>
              </motion.header>
              
              <motion.article variants={itemVariants} className="max-w-none prose prose-invert prose-p:text-on-surface-variant prose-p:leading-relaxed prose-p:text-lg prose-headings:font-headline prose-headings:text-white prose-a:text-primary prose-strong:text-white prose-img:rounded-xl prose-img:border prose-img:border-outline-variant/10 prose-pre:bg-surface-container-lowest prose-pre:border-l-4 prose-pre:border-primary prose-pre:shadow-2xl prose-code:text-primary">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {sampleMarkdown}
                </ReactMarkdown>
              </motion.article>
            </motion.div>
          )}

          {docType === 'epub' && (
            <motion.div variants={itemVariants} className="flex-1 w-full h-full bg-surface-container-lowest flex items-center justify-center relative">
              <div ref={epubViewerRef} className="w-full h-full max-w-4xl bg-white text-black overflow-hidden shadow-2xl"></div>
              <div className="absolute top-4 right-4 bg-surface-container-high/80 backdrop-blur-md px-4 py-2 rounded-lg text-xs font-bold text-white uppercase tracking-widest border border-outline-variant/10">
                ePub Reader Active
              </div>
            </motion.div>
          )}

          {docType === 'pdf' && (
            <motion.div variants={itemVariants} className="flex-1 w-full h-full bg-surface-container-lowest flex flex-col items-center relative">
              {/* Sticky PDF Toolbar */}
              <div className="sticky top-0 z-20 w-full bg-surface-container/95 backdrop-blur-md border-b border-outline-variant/10 px-4 py-2 flex flex-col gap-2 shrink-0">
                <div className="flex items-center justify-center gap-2 sm:gap-4">
                  <button
                    onClick={() => goToPdfPage(1)}
                    disabled={!numPages || pageNumber <= 1}
                    className="px-2 py-1 rounded-lg bg-surface-container-high hover:bg-surface-container-highest disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold"
                  >First</button>
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
                  >Last</button>
                </div>

                <div className="flex items-center gap-2 justify-center w-full">
                  <input
                    type="range"
                    min={1}
                    max={numPages || 1}
                    value={pageNumber}
                    onChange={(e) => goToPdfPage(Number(e.target.value))}
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

                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest text-center">
                  PDF Reader
                </span>
              </div>

              {/* PDF Content Area - Single Scroll */}
              <div className="flex-1 w-full overflow-y-auto py-6 px-4">
                <div className="flex flex-col items-center">
                  <Document
                    file="https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf"
                    onLoadSuccess={onDocumentLoadSuccess}
                    className="flex flex-col items-center gap-4"
                    loading={<div className="text-primary animate-pulse py-12">Loading PDF...</div>}
                  >
                    {Array.from(new Array(numPages || 0), (_, index) => {
                      const page = index + 1;
                      return (
                        <div
                          id={`pdf-page-${page}`}
                          key={`page_${page}`}
                          className={`bg-white rounded-lg shadow-xl overflow-hidden ${page === pageNumber ? 'ring-2 ring-primary' : ''}`}
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
                </div>
              </div>
            </motion.div>
          )}
        </main>


      </div>
    </motion.div>
  );
}
