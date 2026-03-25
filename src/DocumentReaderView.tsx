import { useState, useEffect, useRef } from 'react';
import { motion, Variants } from 'motion/react';
import { 
  Settings, User, Plus, FolderOpen, Clock, Pin, Users, Archive, 
  ChevronRight, Maximize2, Copy, Filter, MoreVertical, Reply, 
  ThumbsUp, CheckCircle2, Paperclip, ArrowLeft, BookOpen, FileText, File
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ePub from 'epubjs';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const sampleMarkdown = `
This document outlines the core structural principles behind the Obsidian workspace, focusing on tonal depth and digital material properties.

## 1. Core Philosophy

The system is designed for **deep focus**. Unlike traditional interfaces that rely on high-contrast lines and borders, Obsidian uses tonal shifting to define space. This minimizes visual noise and allows the user's primary content to command attention.

![Obsidian Material Study](https://lh3.googleusercontent.com/aida-public/AB6AXuAqHi58eXOWeAwhBTN26kH1y1iNa7HNymAkMR6-6cHnvMUkXVK6EXwDkVXBhIWfaDRN79LvfMPYQsmZQZdLZLsKdhK4wZ8l7F0azZ-6kgY_7srFiWS6wkzYgm6CqYkM50LF-J6ZaXs9ZW2f_rggpK75A61CvJ4Sq9fZM3cfh1DpdCLbPGlOFtwSJJHJjYOcxwZ1Ho6fwWJxw2IQqKKPECtLdz1Cxs0qoLyKabL11CZ3EURBFXUu2j0EIOJlBoUKOICY7zJ2rYYOE84)
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
    if (docType === 'epub' && epubViewerRef.current) {
      // Initialize ePub reader with a sample epub file
      // Note: In a real app, this would be a valid epub URL or file object
      const book = ePub("https://s3.amazonaws.com/moby-dick/moby-dick.epub");
      const rendition = book.renderTo(epubViewerRef.current, {
        width: "100%",
        height: "100%",
        spread: "none"
      });
      rendition.display();

      return () => {
        book.destroy();
      };
    }
  }, [docType]);

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      className="flex flex-col h-screen bg-background text-on-surface selection:bg-primary-container selection:text-on-primary-container overflow-hidden"
    >
      {/* TopNavBar */}
      <nav className="flex justify-between items-center px-6 lg:px-12 w-full z-50 shrink-0 bg-[#111317] h-16 border-b border-outline-variant/10">
        <div className="flex items-center gap-8 lg:gap-12">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => onNavigate('library')}
              className="p-2 -ml-2 rounded-lg hover:bg-surface-container-high text-on-surface-variant transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="text-xl lg:text-2xl font-black text-white tracking-tighter">Lexicon Docs</span>
          </div>
          <div className="hidden md:flex gap-8">
            <button className="font-headline font-bold text-lg tracking-tight text-primary border-b-2 border-primary pb-1">Documents</button>
            <button className="font-headline font-bold text-lg tracking-tight text-on-surface-variant hover:text-white transition-colors">Annotations</button>
            <button className="font-headline font-bold text-lg tracking-tight text-on-surface-variant hover:text-white transition-colors">Workspace</button>
          </div>
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
                <h3 className="font-body text-sm font-bold text-white leading-tight">Project Obsidian</h3>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-semibold">Creative Curation</p>
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
            <motion.button variants={itemVariants} className="w-full flex items-center gap-3 text-on-surface-variant px-6 py-3 hover:bg-surface-container-high font-body text-sm font-medium transition-all">
              <Users className="w-4 h-4" />
              Shared
            </motion.button>
            <motion.button variants={itemVariants} className="w-full flex items-center gap-3 text-on-surface-variant px-6 py-3 hover:bg-surface-container-high font-body text-sm font-medium transition-all">
              <Archive className="w-4 h-4" />
              Archive
            </motion.button>
          </motion.nav>
        </aside>

        {/* Main Document Content */}
        <main className="flex-1 bg-background overflow-y-auto custom-scrollbar relative flex flex-col">
          {docType === 'markdown' && (
            <motion.div variants={containerVariants} className="max-w-4xl mx-auto px-6 lg:px-16 py-8 lg:py-12 w-full">
              <motion.header variants={itemVariants} className="mb-12">
                <div className="flex items-center gap-3 text-on-surface-variant text-xs mb-4 uppercase tracking-widest font-semibold">
                  <span>Library</span>
                  <ChevronRight className="w-3 h-3" />
                  <span>Product Specifications</span>
                </div>
                <h1 className="font-headline text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">The Obsidian Layering Architecture</h1>
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
            <motion.div variants={itemVariants} className="flex-1 w-full h-full bg-surface-container-lowest flex flex-col items-center overflow-y-auto py-8">
              <div className="bg-surface-container-high/80 backdrop-blur-md px-4 py-2 rounded-lg text-xs font-bold text-white uppercase tracking-widest border border-outline-variant/10 mb-6 sticky top-4 z-10">
                PDF Reader Active
              </div>
              <div className="max-w-4xl w-full flex flex-col items-center">
                <Document
                  file="https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf"
                  onLoadSuccess={onDocumentLoadSuccess}
                  className="flex flex-col items-center gap-4"
                  loading={<div className="text-primary animate-pulse">Loading PDF...</div>}
                >
                  {Array.from(new Array(numPages || 0), (el, index) => (
                    <div key={`page_${index + 1}`} className="bg-white p-2 rounded shadow-xl mb-4">
                      <Page 
                        pageNumber={index + 1} 
                        renderTextLayer={true} 
                        renderAnnotationLayer={true}
                        width={800}
                      />
                    </div>
                  ))}
                </Document>
              </div>
            </motion.div>
          )}
        </main>

        {/* Annotations/Comments Pane */}
        <aside className="hidden xl:flex w-80 bg-surface-container-low border-l border-outline-variant/5 shrink-0 flex-col">
          <div className="h-16 flex items-center justify-between px-6 border-b border-outline-variant/10 bg-surface-container-low shrink-0">
            <h3 className="font-headline font-bold text-white">Annotations</h3>
            <div className="flex gap-3">
              <button className="text-on-surface-variant hover:text-white transition-colors"><Filter className="w-4 h-4" /></button>
              <button className="text-on-surface-variant hover:text-white transition-colors"><MoreVertical className="w-4 h-4" /></button>
            </div>
          </div>
          
          <motion.div variants={containerVariants} className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
            {/* Annotation Card 1 */}
            <motion.div variants={itemVariants} className="bg-surface-container-high rounded-xl p-4 shadow-sm border border-outline-variant/5 transition-all hover:-translate-y-0.5 hover:shadow-lg">
              <div className="flex items-center gap-2 mb-3">
                <img 
                  alt="Elara" 
                  className="w-6 h-6 rounded-full" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCncYbXFvtGuj_sOR17xiNYk-z0DxFd1VNWhWGB5QcRlu7JKMJx_9QxoEyHX9r1I-Do5JdQ12BN0rKt976cKwMa_VO16gpHdcZfuupyc_THSeJzpRLXxV_vrE6LkSqS_1144dL9ANpr_l55ozRTSnGFY3Qw8_FDrn80ZU9vdz25YMb_U_ZjdeQtYvZ2ieB739bSaHBKFCDwAj_HkdKLBNL-jzrmSlkjDPG8tiojGsaUsV2aM7yEq9UwbtkGiHfaVN3owWnBn6zSj7Q"
                />
                <span className="text-xs font-bold text-white">Elara Vance</span>
                <span className="text-[10px] text-on-surface-variant ml-auto">12m ago</span>
              </div>
              <p className="text-sm text-on-surface-variant leading-relaxed mb-3">
                Should we increase the <code className="bg-surface-container-highest px-1 py-0.5 rounded text-xs text-primary font-mono">backdrop-blur</code> on the glass panels to 24px for better legibility against busy backgrounds?
              </p>
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-1.5 text-[10px] font-bold text-primary hover:text-white transition-colors">
                  <Reply className="w-3 h-3" /> REPLY
                </button>
                <button className="flex items-center gap-1.5 text-[10px] font-bold text-on-surface-variant hover:text-white transition-colors">
                  <ThumbsUp className="w-3 h-3" /> 2
                </button>
              </div>
            </motion.div>

            {/* Annotation Card 2 (Active/Contextual) */}
            <motion.div variants={itemVariants} className="bg-primary-container/10 border-l-4 border-primary rounded-xl p-4 shadow-sm transition-all">
              <div className="flex items-center gap-2 mb-3">
                <img 
                  alt="Marcus" 
                  className="w-6 h-6 rounded-full" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_r8_udr6THMmGBHPk85EYV7Lr62e7D5GpbDO6DD1pHufrNMW3aaKeVr-opYtfaF5bSjaTnNTfdPHPZfgc0DOdAx5ZapY4RrbkJ3Q1CCyk8Jn-4MHxwawpIynDb4jIQUC2V44LCKKRDlGXIWPvnPayHDuy46RqlR5iBLkonNndUHGu1tN0NM_7YDgtBn556WPcoGsBYVU596fSJyTVwuy77f1U8Lufy3NRzu4g0KC9_PL5c2bIDh6rhqLgujxerftK2Lg6KRch3ds"
                />
                <span className="text-xs font-bold text-white">Marcus Thorne</span>
                <span className="text-[10px] text-primary ml-auto font-bold tracking-wider">ACTIVE NOW</span>
              </div>
              <p className="text-sm text-on-surface leading-relaxed mb-3">
                The code snippet looks accurate for the v3 release. I've cross-referenced it with the core library.
              </p>
              <div className="bg-surface-container-lowest rounded p-2 text-[10px] font-mono text-primary mb-3 truncate border border-outline-variant/10">
                Re: tailwind-config.js
              </div>
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-1.5 text-[10px] font-bold text-primary hover:text-white transition-colors">
                  <Reply className="w-3 h-3" /> REPLY
                </button>
                <button className="flex items-center gap-1.5 text-[10px] font-bold text-on-surface-variant hover:text-white transition-colors">
                  <CheckCircle2 className="w-3 h-3" /> RESOLVE
                </button>
              </div>
            </motion.div>

            {/* Annotation Card 3 */}
            <motion.div variants={itemVariants} className="bg-surface-container-high rounded-xl p-4 shadow-sm border border-outline-variant/5 opacity-60 hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-2 mb-3">
                <img 
                  alt="Jane" 
                  className="w-6 h-6 rounded-full" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDCSfhwBAKOuTSEpx8Eo3Tcn5K1XR5cPJhi_8pHn7LI5E2oq9c5Y7C2KJR-dMDXgM-PLT0u_mb10JgmUuS2fsi7l9ovjiZrBFUQnI_pyydSrZgCgOtA2tBzr-DOKN7wVBlb7WBlBK4j8O4PaLpk38QPCqMId6P_JWoBoglL2-Ay7ISlZDtsWhThoprYKoXeyu1S2ETWyt-tmOHE24dZMeq-2Lt29kCLlg3AL5CnfLogU7uGPoDN_B8THV7-ThOjtexe8EOE_a-C9m0"
                />
                <span className="text-xs font-bold text-white">System Bot</span>
                <span className="text-[10px] text-on-surface-variant ml-auto">1d ago</span>
              </div>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Document title updated from "Layering Specs" to "The Obsidian Layering Architecture".
              </p>
            </motion.div>
          </motion.div>

          {/* Comment Input */}
          <div className="p-4 bg-surface-container-low border-t border-outline-variant/10 shrink-0">
            <div className="relative group">
              <textarea 
                className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-xl text-sm p-3 focus:ring-1 focus:ring-primary focus:border-primary h-24 resize-none transition-all placeholder:text-on-surface-variant/50 text-on-surface" 
                placeholder="Write a comment..."
              ></textarea>
              <div className="absolute bottom-3 right-3 flex gap-2 items-center">
                <button className="text-on-surface-variant hover:text-white transition-colors p-1">
                  <Paperclip className="w-4 h-4" />
                </button>
                <button className="bg-primary text-on-primary rounded-lg px-4 py-1.5 text-xs font-bold hover:bg-primary/90 active:scale-95 transition-all tracking-wider">
                  POST
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </motion.div>
  );
}
