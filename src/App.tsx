import { useState, useEffect, useCallback, useRef, lazy, Suspense, memo } from 'react';
import { AnimatePresence, motion, useDragControls, PanInfo } from 'motion/react';
import { DataProvider } from './store/DataContext';
import { FocusTimerWidget } from './components/FocusTimerWidget';
import { ThemeSwitcher } from './components/ThemeSwitcher';
import { LayoutDashboard, Video, Map, Settings, Circle as HelpCircle, LogOut, Search, Bell, Bookmark, Kanban, FileText, Plus, Layers, ChartBar as BarChart3, NotebookPen, X, Menu, PanelLeftClose, PanelLeftOpen, ChevronLeft, Loader as Loader2 } from 'lucide-react';

// Lazy load all views for code splitting
const DashboardView = lazy(() => import('./DashboardView').then(m => ({ default: m.DashboardView })));
const LibraryView = lazy(() => import('./LibraryView').then(m => ({ default: m.LibraryView })));
const RoadmapView = lazy(() => import('./RoadmapView').then(m => ({ default: m.RoadmapView })));
const CoursePlayerView = lazy(() => import('./CoursePlayerView').then(m => ({ default: m.CoursePlayerView })));
const DocumentReaderView = lazy(() => import('./DocumentReaderView').then(m => ({ default: m.DocumentReaderView })));
const ContentManageView = lazy(() => import('./ContentManageView').then(m => ({ default: m.ContentManageView })));
const AnalyticsView = lazy(() => import('./AnalyticsView').then(m => ({ default: m.AnalyticsView })));
const NotesView = lazy(() => import('./NotesView').then(m => ({ default: m.NotesView })));

// Loading fallback component
function ViewLoader() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[50vh]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm text-on-surface-variant font-medium">Loading...</p>
      </div>
    </div>
  );
}

// Breakpoint constants matching Tailwind
const BREAKPOINTS = { md: 768, lg: 1024 } as const;

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'library',   label: 'Library',   icon: Video },
  { id: 'roadmap',   label: 'Roadmap',   icon: Map },
  { id: 'document-reader', label: 'Documents', icon: FileText },
  { id: 'content-manage',  label: 'Manage',    icon: Layers },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'notes',     label: 'Notes',     icon: NotebookPen },
  { id: 'settings',  label: 'Settings',  icon: Settings },
] as const;

const BOTTOM_NAV = [
  { id: 'dashboard', label: 'Home',     icon: LayoutDashboard },
  { id: 'library',   label: 'Library',  icon: Video },
  { id: 'roadmap',   label: 'Roadmap',  icon: Map },
  { id: 'notes',     label: 'Notes',    icon: NotebookPen },
  { id: 'analytics', label: 'Stats',    icon: BarChart3 },
] as const;

const NavItem = memo(function NavItem({ id, label, icon: Icon, current, expanded, onClick }: {
  id: string; label: string; icon: React.ElementType;
  current: string; expanded: boolean; onClick: (id: string) => void;
}) {
  const active = current === id;
  return (
    <button
      onClick={() => onClick(id)}
      title={label}
      className={`w-full flex items-center gap-3 py-3 rounded-lg cursor-pointer transition-all duration-200 ${
        active ? 'bg-[#333539] text-[#a4e6ff]' : 'text-[#bbc9cf] hover:bg-[#282a2e] hover:text-white'
      } ${expanded ? 'px-4' : 'justify-center px-0'}`}
    >
      <Icon className="w-5 h-5 shrink-0" />
      {expanded && <span className="font-headline text-sm font-medium whitespace-nowrap">{label}</span>}
    </button>
  );
});

// Custom hook to detect screen size
function useScreenSize() {
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  
  useEffect(() => {
    const checkSize = () => {
      const w = window.innerWidth;
      if (w < BREAKPOINTS.md) setScreenSize('mobile');
      else if (w < BREAKPOINTS.lg) setScreenSize('tablet');
      else setScreenSize('desktop');
    };
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);
  
  return screenSize;
}

function AppContent() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  // Tablet: toggled expanded state; Desktop: hover-controlled
  const [isTabletSidebarExpanded, setIsTabletSidebarExpanded] = useState(false);
  const [isDesktopHovered, setIsDesktopHovered] = useState(false);
  // Navigation history for back/forward
  const [navigationHistory, setNavigationHistory] = useState<string[]>(['dashboard']);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  const screenSize = useScreenSize();
  const dragControls = useDragControls();
  const drawerRef = useRef<HTMLElement>(null);

  const isFullscreenView = currentView === 'course-player' || currentView === 'document-reader';
  
  // Determine if sidebar is expanded based on screen size
  const isSidebarExpanded = screenSize === 'desktop' ? isDesktopHovered : isTabletSidebarExpanded;

  const navigate = (view: string) => {
    setCurrentView(view);
    setIsMobileDrawerOpen(false);
    
    // Update navigation history
    const newHistory = navigationHistory.slice(0, historyIndex + 1);
    if (newHistory[newHistory.length - 1] !== view) {
      newHistory.push(view);
      setNavigationHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  };

  const goBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setCurrentView(navigationHistory[newIndex]);
    }
  };

  const goForward = () => {
    if (historyIndex < navigationHistory.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setCurrentView(navigationHistory[newIndex]);
    }
  };
  
  // Handle swipe gesture for mobile drawer
  const handleDragEnd = useCallback((_: unknown, info: PanInfo) => {
    // Close drawer if swiped left past threshold
    if (info.offset.x < -100 || info.velocity.x < -500) {
      setIsMobileDrawerOpen(false);
    }
  }, []);
  
  // Swipe-to-open detection on main content edge
  const handleEdgeSwipe = useCallback((e: React.TouchEvent) => {
    if (screenSize !== 'mobile' || isFullscreenView) return;
    const touch = e.touches[0];
    // Only trigger if touch starts within 20px of left edge
    if (touch.clientX < 20) {
      setIsMobileDrawerOpen(true);
    }
  }, [screenSize, isFullscreenView]);

  return (
    <div className="flex min-h-dvh bg-background text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container">

      {/* ── Tablet/Desktop sidebar ── */}
      {/* Tablet (md-lg): toggle button to expand/collapse */}
      {/* Desktop (lg+): hover to expand, click toggle to pin */}
      {!isFullscreenView && (
        <aside
          onMouseEnter={() => screenSize === 'desktop' && setIsDesktopHovered(true)}
          onMouseLeave={() => screenSize === 'desktop' && setIsDesktopHovered(false)}
          className={`hidden md:flex fixed inset-y-0 left-0 flex-col py-4 lg:py-6 z-50 transition-[width] duration-300 ease-in-out ${
            isSidebarExpanded ? 'w-64 shadow-2xl' : 'w-16 lg:w-20 border-r border-outline-variant/5'
          }`}
          style={{ backgroundColor: 'var(--color-surface-container, #1e2024)' }}
        >
          {/* Logo + collapse toggle */}
          <div className={`mb-6 lg:mb-10 flex items-center ${isSidebarExpanded ? 'justify-between px-4 lg:px-6' : 'justify-center'}`}>
            {isSidebarExpanded ? (
              <>
                <div className="animate-in fade-in duration-200">
                  <p className="text-lg font-bold font-headline tracking-tighter" style={{ color: 'var(--color-primary, #a4e6ff)' }}>VOID</p>
                  <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-medium opacity-60">Learning System</p>
                </div>
                {/* Collapse button (always visible when expanded) */}
                <button
                  onClick={() => {
                    if (screenSize === 'tablet') setIsTabletSidebarExpanded(false);
                    else setIsDesktopHovered(false);
                  }}
                  className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-white transition-colors"
                  aria-label="Collapse sidebar"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                onClick={() => screenSize === 'tablet' && setIsTabletSidebarExpanded(true)}
                className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-lg border border-primary/20 shrink-0 hover:bg-primary/20 transition-colors cursor-pointer"
                aria-label="Expand sidebar"
              >
                V
              </button>
            )}
          </div>

          {/* Expand button for tablet when collapsed */}
          {!isSidebarExpanded && screenSize === 'tablet' && (
            <button
              onClick={() => setIsTabletSidebarExpanded(true)}
              className="mx-auto mb-4 p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-white transition-colors"
              aria-label="Expand sidebar"
            >
              <PanelLeftOpen className="w-5 h-5" />
            </button>
          )}

          {/* Nav links */}
          <nav className="flex-1 space-y-1 px-2 lg:px-3 overflow-y-auto">
            {NAV_ITEMS.map(item => (
              <NavItem key={item.id} {...item} current={currentView} expanded={isSidebarExpanded} onClick={navigate} />
            ))}
          </nav>

          {/* Bottom actions */}
          <div className="px-2 lg:px-3 mt-4 space-y-1">
            <button
              onClick={() => navigate('content-manage')}
              title="New Discovery"
              className={`w-full py-2.5 lg:py-3 rounded-lg bg-primary text-on-primary font-bold text-sm shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 mb-2 ${
                isSidebarExpanded ? 'px-4' : 'px-0'
              }`}
            >
              <Plus className="w-4 h-4 shrink-0" />
              {isSidebarExpanded && <span className="whitespace-nowrap">New Discovery</span>}
            </button>
            <button title="Help" className={`w-full flex items-center gap-3 py-2.5 lg:py-3 rounded-lg transition-colors ${isSidebarExpanded ? 'px-4' : 'justify-center'}`} style={{
              color: 'var(--color-on-surface-variant, #bbc9cf)',
              '--sidebar-hover-bg': 'var(--color-surface-container-high, #282a2e)',
              '--sidebar-hover-text': 'white'
            } as any} onMouseEnter={(e) => {
              (e.currentTarget as any).style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--color-surface-container-high').trim() || '#282a2e';
              (e.currentTarget as any).style.color = 'white';
            }} onMouseLeave={(e) => {
              (e.currentTarget as any).style.backgroundColor = 'transparent';
              (e.currentTarget as any).style.color = getComputedStyle(document.documentElement).getPropertyValue('--color-on-surface-variant').trim() || '#bbc9cf';
            }}>
              <HelpCircle className="w-5 h-5 shrink-0" />
              {isSidebarExpanded && <span className="font-headline text-sm font-medium whitespace-nowrap">Help</span>}
            </button>
            <button title="Logout" className={`w-full flex items-center gap-3 py-2.5 lg:py-3 rounded-lg transition-colors ${isSidebarExpanded ? 'px-4' : 'justify-center'}`} style={{
              color: 'var(--color-on-surface-variant, #bbc9cf)'
            }} onMouseEnter={(e) => {
              (e.currentTarget as any).style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--color-surface-container-high').trim() || '#282a2e';
              (e.currentTarget as any).style.color = 'white';
            }} onMouseLeave={(e) => {
              (e.currentTarget as any).style.backgroundColor = 'transparent';
              (e.currentTarget as any).style.color = getComputedStyle(document.documentElement).getPropertyValue('--color-on-surface-variant').trim() || '#bbc9cf';
            }}>
              <LogOut className="w-5 h-5 shrink-0" />
              {isSidebarExpanded && <span className="font-headline text-sm font-medium whitespace-nowrap">Logout</span>}
            </button>
          </div>
        </aside>
      )}

      {/* ── Mobile drawer backdrop ── */}
      <AnimatePresence>
        {isMobileDrawerOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsMobileDrawerOpen(false)}
            className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* ── Mobile drawer panel (swipe-to-close) ── */}
      <AnimatePresence>
        {isMobileDrawerOpen && (
          <motion.aside
            ref={drawerRef}
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 340, damping: 32 }}
            drag="x"
            dragControls={dragControls}
            dragConstraints={{ left: -288, right: 0 }}
            dragElastic={0.1}
            onDragEnd={handleDragEnd}
            className="md:hidden fixed inset-y-0 left-0 z-50 w-72 flex flex-col py-6 shadow-2xl touch-pan-y"
            style={{ backgroundColor: 'var(--color-surface-container, #1e2024)' }}
          >
            {/* Drag handle indicator */}
            <div className="absolute right-1 top-1/2 -translate-y-1/2 w-1 h-12 bg-outline-variant/30 rounded-full" />
            
            <div className="flex items-center justify-between px-5 mb-6">
              <div>
                <p className="text-lg font-bold font-headline tracking-tighter" style={{ color: 'var(--color-primary, #a4e6ff)' }}>VOID</p>
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-medium opacity-60">Learning System</p>
              </div>
              <button 
                onClick={() => setIsMobileDrawerOpen(false)} 
                className="p-2 rounded-lg text-on-surface-variant hover:text-white hover:bg-surface-container transition-colors"
                aria-label="Close navigation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <nav className="flex-1 space-y-1 px-3 overflow-y-auto">
              {NAV_ITEMS.map(item => (
                <NavItem key={item.id} {...item} current={currentView} expanded onClick={navigate} />
              ))}
            </nav>
            
            <div className="px-3 mt-4 space-y-1">
              <button
                onClick={() => navigate('content-manage')}
                className="w-full py-3 px-4 rounded-lg bg-primary text-on-primary font-bold text-sm shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 mb-2"
              >
                <Plus className="w-4 h-4" />
                <span>New Discovery</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Main content wrapper ── */}
      <main 
        onTouchStart={handleEdgeSwipe}
        className={`flex-1 flex flex-col min-h-dvh transition-[margin] duration-300 ${
          !isFullscreenView 
            ? isSidebarExpanded && screenSize === 'tablet' 
              ? 'md:ml-64' 
              : 'md:ml-16 lg:ml-20' 
            : ''
        }`}
      >

        {/* Top nav bar */}
        {!isFullscreenView && (
          <header className="sticky top-0 z-40 w-full bg-[#111317]/90 backdrop-blur-md border-b border-outline-variant/5 shadow-sm">
            <div className="flex justify-between items-center px-4 sm:px-6 lg:px-8 h-14">
              {/* Left: hamburger (mobile) + navigation + title */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsMobileDrawerOpen(true)}
                  className="md:hidden p-2 -ml-1 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
                  aria-label="Open navigation"
                >
                  <Menu className="w-5 h-5" />
                </button>
                
                {/* Back/Forward Navigation Buttons */}
                <div className="hidden sm:flex items-center gap-1">
                  <button
                    onClick={goBack}
                    disabled={historyIndex === 0}
                    className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    aria-label="Back"
                    title="Go back"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={goForward}
                    disabled={historyIndex === navigationHistory.length - 1}
                    className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    aria-label="Forward"
                    title="Go forward"
                  >
                    <ChevronLeft className="w-5 h-5 rotate-180" />
                  </button>
                </div>
                
                <span className="text-xl font-black tracking-tighter text-[#00D1FF] font-headline capitalize">
                  {currentView.replace('-', ' ')}
                </span>
              </div>

              {/* Right: search + actions */}
              <div className="flex items-center gap-2 lg:gap-3">
                {currentView === 'roadmap' && (
                  <button
                    onClick={() => navigate('library')}
                    className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-surface-container-high hover:bg-surface-container-highest text-primary text-xs font-bold uppercase tracking-wide rounded-lg transition-all border border-primary/20"
                  >
                    <Kanban className="w-3.5 h-3.5" /> Library
                  </button>
                )}
                <div className="relative hidden sm:block">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="bg-surface-container-lowest rounded-full py-1.5 pl-9 pr-4 text-sm focus:ring-2 focus:ring-primary w-40 lg:w-56 transition-all text-on-surface placeholder:text-outline outline-none"
                  />
                </div>
                <button className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-all" aria-label="Notifications">
                  <Bell className="w-5 h-5" />
                </button>
                <button className="hidden sm:flex p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-all" aria-label="Bookmarks">
                  <Bookmark className="w-5 h-5" />
                </button>
                <ThemeSwitcher />
                <div className="w-8 h-8 rounded-full bg-surface-container-high overflow-hidden border border-outline-variant/20 ml-1 shrink-0">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPBB_Y4cHLeHJd3kB5XfXCUj_3RLx14M0Rv1YlVq5TJHXKaUt_bp6GeWQoe91nc9WlDaDu5g4N9o_ozaTLHpfJn1RT4ZnfvfGv6Qe2dUy8rMIpz_cTX5kCZWJuOOn76ZkBpOKoUDJBgcMwog5pEdghRaRT5ZdUDtlLaJi7Gspofz5vZ59OUkZPGc7uLVUkTtc9Dh6mmrc7srLLwkE_8hmbEQJqGAkFmD3HDDgNetRVgbo3PpE1yPGkJbVyEIWviBjruV52D99VzsU"
                    alt="User profile"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </header>
        )}

        {/* Page content */}
        <div className="flex-1 min-w-0 overflow-x-hidden">
          <Suspense fallback={<ViewLoader />}>
            <AnimatePresence mode="wait">
              {currentView === 'dashboard'       && <DashboardView      key="dashboard"       onNavigate={navigate} />}
              {currentView === 'library'         && <LibraryView        key="library"         onNavigate={navigate} />}
              {currentView === 'roadmap'         && <RoadmapView        key="roadmap"         onNavigate={navigate} />}
              {currentView === 'course-player'   && <CoursePlayerView   key="course-player"   onNavigate={navigate} />}
              {currentView === 'document-reader' && <DocumentReaderView key="document-reader" onNavigate={navigate} />}
              {currentView === 'content-manage'  && <ContentManageView  key="content-manage"  onNavigate={navigate} />}
              {currentView === 'analytics'       && <AnalyticsView      key="analytics"       onNavigate={navigate} />}
              {currentView === 'notes'           && <NotesView          key="notes"           onNavigate={navigate} />}
            </AnimatePresence>
          </Suspense>
        </div>
      </main>

      {/* Focus timer widget (Option B) */}
      {!isFullscreenView && <FocusTimerWidget />}

      {/* ── Mobile bottom tab bar ── */}
      {!isFullscreenView && (
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 backdrop-blur-xl border-t border-outline-variant/10 safe-area-inset-bottom" style={{ backgroundColor: 'var(--color-surface-container-low, #1a1c20)' }}>
          <div className="flex justify-around items-center h-16 px-2">
            {BOTTOM_NAV.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => navigate(id)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl active:scale-90 transition-all ${
                  currentView === id ? 'font-medium' : ''
                }`}
                style={{
                  color: currentView === id 
                    ? 'var(--color-primary, #a4e6ff)'
                    : 'var(--color-on-surface-variant, #bbc9cf)'
                }}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium font-headline">{label}</span>
              </button>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}

export default function App() {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
}
