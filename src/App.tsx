import { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { DataProvider } from './store/DataContext';
import { DashboardView } from './DashboardView';
import { LibraryView } from './LibraryView';
import { RoadmapView } from './RoadmapView';
import { CoursePlayerView } from './CoursePlayerView';
import { DocumentReaderView } from './DocumentReaderView';
import { ContentManageView } from './ContentManageView';
import { LayoutDashboard, Video, Map, Settings, HelpCircle, LogOut, Search, Bell, Bookmark, Kanban, FileText, PanelLeftClose, PanelLeftOpen, Plus, Layers } from 'lucide-react';

function AppContent() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  const isFullscreenView = currentView === 'course-player' || currentView === 'document-reader';

  return (
    <div className="flex min-h-screen bg-background text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container">
      {/* SideNavBar */}
      {!isFullscreenView && (
        <aside 
          onMouseEnter={() => setIsSidebarExpanded(true)}
          onMouseLeave={() => setIsSidebarExpanded(false)}
          className={`hidden md:flex fixed left-0 top-0 bg-[#1e2024] flex-col h-full py-6 z-50 transition-all duration-300 ${isSidebarExpanded ? 'w-64 shadow-2xl' : 'w-20 border-r border-outline-variant/5'}`}
        >
          <div className={`mb-10 flex items-center ${!isSidebarExpanded ? 'justify-center px-0' : 'px-6'}`}>
            {isSidebarExpanded ? (
              <div className="animate-in fade-in duration-300">
                <div className="text-lg font-bold text-[#a4e6ff] font-headline tracking-tighter whitespace-nowrap">Onyx Stream</div>
                <div className="text-[10px] uppercase tracking-widest text-on-surface-variant font-medium opacity-60 whitespace-nowrap">Digital Curator</div>
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary-container/20 flex items-center justify-center text-primary font-black text-lg border border-primary/20 shrink-0 animate-in fade-in duration-300">
                OS
              </div>
            )}
          </div>
          
          <nav className="flex-1 space-y-2 px-3">
            <div 
              onClick={() => setCurrentView('dashboard')}
              className={`flex items-center gap-3 py-3 rounded-lg cursor-pointer transition-all duration-300 ${currentView === 'dashboard' ? 'bg-[#333539] text-[#a4e6ff]' : 'text-[#bbc9cf] hover:bg-[#282a2e] hover:text-white'} ${!isSidebarExpanded ? 'justify-center px-0' : 'px-4'}`}
              title="Dashboard"
            >
              <LayoutDashboard className="w-5 h-5 shrink-0" />
              {isSidebarExpanded && <span className="font-headline text-sm font-medium whitespace-nowrap">Dashboard</span>}
            </div>
            <div 
              onClick={() => setCurrentView('library')}
              className={`flex items-center gap-3 py-3 rounded-lg cursor-pointer transition-all duration-300 ${currentView === 'library' ? 'bg-[#333539] text-[#a4e6ff]' : 'text-[#bbc9cf] hover:bg-[#282a2e] hover:text-white'} ${!isSidebarExpanded ? 'justify-center px-0' : 'px-4'}`}
              title="Library"
            >
              <Video className="w-5 h-5 shrink-0" />
              {isSidebarExpanded && <span className="font-headline text-sm font-medium whitespace-nowrap">Library</span>}
            </div>
            <div 
              onClick={() => setCurrentView('roadmap')}
              className={`flex items-center gap-3 py-3 rounded-lg cursor-pointer transition-all duration-300 ${currentView === 'roadmap' ? 'bg-[#333539] text-[#a4e6ff]' : 'text-[#bbc9cf] hover:bg-[#282a2e] hover:text-white'} ${!isSidebarExpanded ? 'justify-center px-0' : 'px-4'}`}
              title="Roadmap"
            >
              <Map className="w-5 h-5 shrink-0" />
              {isSidebarExpanded && <span className="font-headline text-sm font-medium whitespace-nowrap">Roadmap</span>}
            </div>
            <div 
              onClick={() => setCurrentView('document-reader')}
              className={`flex items-center gap-3 py-3 rounded-lg cursor-pointer transition-all duration-300 ${currentView === 'document-reader' ? 'bg-[#333539] text-[#a4e6ff]' : 'text-[#bbc9cf] hover:bg-[#282a2e] hover:text-white'} ${!isSidebarExpanded ? 'justify-center px-0' : 'px-4'}`}
              title="Documents"
            >
              <FileText className="w-5 h-5 shrink-0" />
              {isSidebarExpanded && <span className="font-headline text-sm font-medium whitespace-nowrap">Documents</span>}
            </div>
            <div 
              onClick={() => setCurrentView('content-manage')}
              className={`flex items-center gap-3 py-3 rounded-lg cursor-pointer transition-all duration-300 ${currentView === 'content-manage' ? 'bg-[#333539] text-[#a4e6ff]' : 'text-[#bbc9cf] hover:bg-[#282a2e] hover:text-white'} ${!isSidebarExpanded ? 'justify-center px-0' : 'px-4'}`}
              title="Content Manager"
            >
              <Layers className="w-5 h-5 shrink-0" />
              {isSidebarExpanded && <span className="font-headline text-sm font-medium whitespace-nowrap">Manage</span>}
            </div>
            <div 
              className={`flex items-center gap-3 py-3 rounded-lg text-[#bbc9cf] hover:bg-[#282a2e] hover:text-white transition-colors duration-300 cursor-pointer ${!isSidebarExpanded ? 'justify-center px-0' : 'px-4'}`}
              title="Settings"
            >
              <Settings className="w-5 h-5 shrink-0" />
              {isSidebarExpanded && <span className="font-headline text-sm font-medium whitespace-nowrap">Settings</span>}
            </div>
          </nav>
          
          <div className="px-3 mt-auto space-y-2">
            <button 
              onClick={() => setCurrentView('content-manage')}
              className={`w-full py-3 rounded-lg bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold text-sm shadow-lg active:scale-95 transition-all mb-4 flex items-center justify-center gap-2 ${!isSidebarExpanded ? 'px-0' : 'px-4'}`}
              title="New Discovery"
            >
              {!isSidebarExpanded ? <Plus className="w-5 h-5 shrink-0" /> : <>
                <Plus className="w-4 h-4 shrink-0" />
                <span className="whitespace-nowrap">New Discovery</span>
              </>}
            </button>
            <div 
              className={`flex items-center gap-3 py-3 rounded-lg text-[#bbc9cf] hover:bg-[#282a2e] hover:text-white transition-colors duration-300 cursor-pointer ${!isSidebarExpanded ? 'justify-center px-0' : 'px-4'}`}
              title="Help"
            >
              <HelpCircle className="w-5 h-5 shrink-0" />
              {isSidebarExpanded && <span className="font-headline text-sm font-medium whitespace-nowrap">Help</span>}
            </div>
            <div 
              className={`flex items-center gap-3 py-3 rounded-lg text-[#bbc9cf] hover:bg-[#282a2e] hover:text-white transition-colors duration-300 cursor-pointer ${!isSidebarExpanded ? 'justify-center px-0' : 'px-4'}`}
              title="Logout"
            >
              <LogOut className="w-5 h-5 shrink-0" />
              {isSidebarExpanded && <span className="font-headline text-sm font-medium whitespace-nowrap">Logout</span>}
            </div>
          </div>
        </aside>
      )}

      {/* Main Content Wrapper */}
      <main className={`flex-1 ${!isFullscreenView ? 'md:ml-20' : ''} flex flex-col min-h-screen relative transition-all duration-300`}>
        {/* TopNavBar - Hidden in Fullscreen Views */}
        {!isFullscreenView && (
          <header className="w-full sticky top-0 z-40 bg-[#111317]/90 backdrop-blur-md flex justify-between items-center px-6 lg:px-8 py-4 shadow-[0_40px_40px_rgba(0,0,0,0.08)]">
            <div className="flex items-center gap-8">
              <span className="text-2xl font-black tracking-tighter text-[#00D1FF] font-headline capitalize">
                {currentView}
              </span>
              {currentView === 'roadmap' && (
                <nav className="hidden lg:flex items-center gap-6">
                  <a href="#" className="text-[#a4e6ff] font-bold px-3 py-1 rounded transition-all duration-400">Roadmap Path</a>
                  <a href="#" className="text-[#bbc9cf] hover:bg-[#333539]/40 hover:text-white transition-all duration-400 px-3 py-1 rounded">Explore</a>
                  <a href="#" className="text-[#bbc9cf] hover:bg-[#333539]/40 hover:text-white transition-all duration-400 px-3 py-1 rounded">Community</a>
                </nav>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              {currentView === 'roadmap' && (
                <button 
                  onClick={() => setCurrentView('library')}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 bg-surface-container-high hover:bg-surface-container-highest text-primary text-xs font-bold uppercase tracking-wider rounded transition-all border border-primary/20 hover:border-primary/50 group"
                >
                  <Kanban className="w-4 h-4" /> Back to Library
                </button>
              )}
              
              <div className="relative group hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="bg-surface-container-lowest border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary w-48 lg:w-64 transition-all text-on-surface placeholder:text-outline"
                />
              </div>
              
              <div className="flex items-center gap-2 lg:gap-3">
                <button className="p-2 text-on-surface-variant hover:bg-[#333539]/40 rounded-full transition-all">
                  <Bell className="w-5 h-5" />
                </button>
                <button className="p-2 text-on-surface-variant hover:bg-[#333539]/40 rounded-full transition-all">
                  <Bookmark className="w-5 h-5" />
                </button>
                <div className="w-8 h-8 rounded-full bg-surface-container-high overflow-hidden border border-outline-variant/20 ml-2">
                  <img 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPBB_Y4cHLeHJd3kB5XfXCUj_3RLx14M0Rv1YlVq5TJHXKaUt_bp6GeWQoe91nc9WlDaDu5g4N9o_ozaTLHpfJn1RT4ZnfvfGv6Qe2dUy8rMIpz_cTX5kCZWJuOOn76ZkBpOKoUDJBgcMwog5pEdghRaRT5ZdUDtlLaJi7Gspofz5vZ59OUkZPGc7uLVUkTtc9Dh6mmrc7srLLwkE_8hmbEQJqGAkFmD3HDDgNetRVgbo3PpE1yPGkJbVyEIWviBjruV52D99VzsU" 
                    alt="User Profile" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </header>
        )}

        {/* Dynamic Content */}
        <div className="flex-1 overflow-x-hidden">
          <AnimatePresence mode="wait">
            {currentView === 'dashboard' && <DashboardView key="dashboard" onNavigate={setCurrentView} />}
            {currentView === 'library' && <LibraryView key="library" onNavigate={setCurrentView} />}
            {currentView === 'roadmap' && <RoadmapView key="roadmap" onNavigate={setCurrentView} />}
            {currentView === 'course-player' && <CoursePlayerView key="course-player" onNavigate={setCurrentView} />}
            {currentView === 'document-reader' && <DocumentReaderView key="document-reader" onNavigate={setCurrentView} />}
            {currentView === 'content-manage' && <ContentManageView key="content-manage" onNavigate={setCurrentView} />}
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      {!isFullscreenView && (
        <nav className="md:hidden fixed bottom-0 left-0 w-full h-20 z-50 bg-[#1a1c20]/90 backdrop-blur-xl flex justify-around items-center px-6 pb-4 shadow-2xl border-t border-outline-variant/10">
          <div onClick={() => setCurrentView('dashboard')} className={`flex flex-col items-center active:scale-95 transition-all cursor-pointer ${currentView === 'dashboard' ? 'text-[#a4e6ff]' : 'text-[#bbc9cf]'}`}>
            <LayoutDashboard className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-medium font-headline">Home</span>
          </div>
          <div onClick={() => setCurrentView('library')} className={`flex flex-col items-center active:scale-95 transition-all cursor-pointer ${currentView === 'library' ? 'text-[#a4e6ff]' : 'text-[#bbc9cf]'}`}>
            <Video className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-medium font-headline">Library</span>
          </div>
          <div onClick={() => setCurrentView('roadmap')} className={`flex flex-col items-center active:scale-95 transition-all cursor-pointer ${currentView === 'roadmap' ? 'text-[#a4e6ff]' : 'text-[#bbc9cf]'}`}>
            <Map className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-medium font-headline">Roadmap</span>
          </div>
          <div onClick={() => setCurrentView('document-reader')} className={`flex flex-col items-center active:scale-95 transition-all cursor-pointer ${currentView === 'document-reader' ? 'text-[#a4e6ff]' : 'text-[#bbc9cf]'}`}>
            <FileText className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-medium font-headline">Docs</span>
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
