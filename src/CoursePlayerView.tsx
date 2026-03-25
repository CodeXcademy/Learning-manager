import { useState } from 'react';
import { motion, Variants } from 'motion/react';
import { ChevronLeft, Search, Download, CheckCircle, Play, Lock, PlayCircle, Share2, Bookmark, FileText, ExternalLink, MoreHorizontal, Send } from 'lucide-react';
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';
import { MediaPlayer, MediaProvider } from '@vidstack/react';
import { defaultLayoutIcons, DefaultVideoLayout } from '@vidstack/react/player/layouts/default';

export function CoursePlayerView({ onNavigate }: { onNavigate: (view: string) => void }) {
  const [leftTab, setLeftTab] = useState<'overview' | 'script'>('overview');
  const [rightTab, setRightTab] = useState<'content' | 'notes'>('content');

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
      y: -20,
      transition: { duration: 0.2 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      className="flex flex-col min-h-screen bg-background"
    >
      {/* Top Bar for Course Player */}
      <header className="w-full h-16 sticky top-0 z-50 bg-[#111317]/90 backdrop-blur-md flex justify-between items-center px-6 lg:px-8 shadow-[0_0_40px_rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-black text-white tracking-tighter hidden sm:block">Digital Curator</h1>
          <div className="h-4 w-[1px] bg-outline-variant/30 hidden sm:block"></div>
          <button 
            onClick={() => onNavigate('roadmap')}
            className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="text-xs font-medium tracking-wide uppercase">Back to Modules</span>
          </button>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-container rounded-full border border-outline-variant/10">
            <div className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></div>
            <span className="text-[10px] font-bold tracking-widest text-on-surface uppercase">Live Sync</span>
          </div>
        </div>
      </header>

      <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Left Column (75%) */}
          <section className="xl:col-span-3 flex flex-col gap-8">
            {/* Video Player Section */}
            <motion.div variants={itemVariants} className="relative rounded-xl overflow-hidden aspect-video bg-surface-container-lowest shadow-2xl border border-outline-variant/5">
              <MediaPlayer 
                title="The Psychology of Tonal Depth in UI" 
                src="https://files.vidstack.io/sprite-fight/720p.mp4"
                crossOrigin
                className="w-full h-full"
              >
                <MediaProvider />
                <DefaultVideoLayout icons={defaultLayoutIcons} />
              </MediaPlayer>
            </motion.div>

            {/* Left Tabs */}
            <motion.div variants={itemVariants} className="bg-surface-container-low rounded-xl p-6 lg:p-8 border border-outline-variant/10">
              <div className="flex border-b border-outline-variant/10 mb-8">
                <button 
                  onClick={() => setLeftTab('overview')}
                  className={`px-6 py-4 text-sm font-bold tracking-widest uppercase transition-colors ${leftTab === 'overview' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
                >
                  Overview
                </button>
                <button 
                  onClick={() => setLeftTab('script')}
                  className={`px-6 py-4 text-sm font-bold tracking-widest uppercase transition-colors ${leftTab === 'script' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
                >
                  Script
                </button>
              </div>

              {leftTab === 'overview' ? (
                <div className="animate-in fade-in duration-300">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                    <div>
                      <div className="flex gap-2 mb-3">
                        <span className="px-2 py-0.5 rounded bg-surface-container-highest text-primary-container text-[10px] font-bold tracking-widest uppercase">Chapter 4</span>
                        <span className="px-2 py-0.5 rounded bg-surface-container-highest text-on-surface-variant text-[10px] font-bold tracking-widest uppercase">Color Theory</span>
                      </div>
                      <h2 className="text-3xl font-headline font-extrabold text-on-surface tracking-tight">The Psychology of Tonal Depth in UI</h2>
                      <p className="text-on-surface-variant mt-3 max-w-2xl leading-relaxed">In this module, we explore how Obsidian Layering creates a sense of spatial hierarchy without the need for traditional borders or heavy drop shadows.</p>
                    </div>
                    <div className="flex gap-3 shrink-0">
                      <button className="p-3 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface border border-outline-variant/10">
                        <Share2 className="w-5 h-5" />
                      </button>
                      <button className="p-3 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface border border-outline-variant/10">
                        <Bookmark className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Resources Section */}
                  <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-10">
                    <motion.div variants={itemVariants} className="p-6 rounded-xl bg-surface-container border border-outline-variant/5 hover:border-primary/20 transition-all cursor-pointer group">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
                          <FileText className="w-5 h-5" />
                        </div>
                        <Download className="w-5 h-5 text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="font-bold text-on-surface">Course Workbook.pdf</p>
                      <p className="text-xs text-on-surface-variant mt-1">12.4 MB • Essential Reading</p>
                    </motion.div>
                    <motion.div variants={itemVariants} className="p-6 rounded-xl bg-surface-container border border-outline-variant/5 hover:border-primary/20 transition-all cursor-pointer group">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
                          <ExternalLink className="w-5 h-5" />
                        </div>
                        <ExternalLink className="w-5 h-5 text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="font-bold text-on-surface">Design System FigJam</p>
                      <p className="text-xs text-on-surface-variant mt-1">Interactive Board • External Link</p>
                    </motion.div>
                  </motion.div>
                </div>
              ) : (
                <div className="animate-in fade-in duration-300">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                    <h2 className="font-headline text-xl font-bold tracking-tight text-on-background">Transcript</h2>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 rounded-lg bg-surface-container-high text-xs font-semibold text-primary flex items-center gap-2 border border-outline-variant/10 hover:bg-surface-container-highest transition-colors">
                        <Search className="w-4 h-4" />
                        Search Script
                      </button>
                      <button className="px-4 py-2 rounded-lg bg-surface-container-high text-xs font-semibold text-on-surface-variant flex items-center gap-2 border border-outline-variant/10 hover:bg-surface-container-highest transition-colors">
                        <Download className="w-4 h-4" />
                        PDF
                      </button>
                    </div>
                  </div>

                  <motion.div variants={containerVariants} className="space-y-6 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                    <motion.div variants={itemVariants} className="flex gap-6 group">
                      <span className="text-primary font-mono text-sm shrink-0 pt-1">00:00</span>
                      <p className="text-on-surface leading-relaxed transition-colors group-hover:text-white">
                        Welcome back to the third module of our series on <span className="text-primary font-semibold">Digital Curation and Workspace Design</span>. Today we're diving deep into the obsidian layering principle that makes interfaces feel physical and tactile.
                      </p>
                    </motion.div>
                    <motion.div variants={itemVariants} className="flex gap-6 group bg-surface-container-high/40 p-4 -mx-4 rounded-lg border-l-2 border-primary">
                      <span className="text-primary font-mono text-sm shrink-0 pt-1">04:12</span>
                      <p className="text-on-surface leading-relaxed">
                        Notice how the background uses <span className="bg-surface-container-lowest px-2 py-0.5 rounded text-sm">#111317</span> instead of pure black. This allows us to use even darker tones like <span className="bg-surface-container-lowest px-2 py-0.5 rounded text-sm">#0C0E12</span> for inset depth. This is crucial for creating that "Digital Curator" illusion.
                      </p>
                    </motion.div>
                    <motion.div variants={itemVariants} className="flex gap-6 group">
                      <span className="text-primary font-mono text-sm shrink-0 pt-1">08:45</span>
                      <p className="text-on-surface-variant leading-relaxed group-hover:text-white transition-colors">
                        When you're building out your bento grids, remember the "No-Line" rule. We're separating sections using background shifts. If you look at the playlist column on your right, you'll see how tonal depth replaces borders.
                      </p>
                    </motion.div>
                    <motion.div variants={itemVariants} className="flex gap-6 group opacity-60 hover:opacity-100 transition-opacity">
                      <span className="text-primary font-mono text-sm shrink-0 pt-1">14:22</span>
                      <p className="text-on-surface-variant leading-relaxed group-hover:text-white transition-colors">
                        Let's move on to typography. We're using Manrope for editorial authority and Inter for functional clarity. This dual-typeface system ensures the hierarchy is unmistakable even in dense data sets.
                      </p>
                    </motion.div>
                    <motion.div variants={itemVariants} className="flex gap-6 group opacity-60 hover:opacity-100 transition-opacity">
                      <span className="text-primary font-mono text-sm shrink-0 pt-1">22:10</span>
                      <p className="text-on-surface-variant leading-relaxed group-hover:text-white transition-colors">
                        Finally, we will examine the use of glassmorphism. By applying a 3-5% surface tint overlay on top of blurred containers, we give them a cool-to-the-touch glass feel that enhances the premium editorial aesthetic.
                      </p>
                    </motion.div>
                  </motion.div>
                </div>
              )}
            </motion.div>
          </section>

          {/* Right Column (25%) */}
          <aside className="flex flex-col gap-6">
            <motion.div variants={itemVariants} className="bg-surface-container rounded-xl p-6 border border-outline-variant/10 h-full flex flex-col">
              {/* Right Tabs */}
              <div className="flex border-b border-outline-variant/10 mb-6">
                <button 
                  onClick={() => setRightTab('content')}
                  className={`flex-1 py-4 text-xs font-bold tracking-widest uppercase transition-colors ${rightTab === 'content' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
                >
                  Course Content
                </button>
                <button 
                  onClick={() => setRightTab('notes')}
                  className={`flex-1 py-4 text-xs font-bold tracking-widest uppercase transition-colors ${rightTab === 'notes' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
                >
                  Notes
                </button>
              </div>

              {rightTab === 'content' ? (
                <div className="animate-in fade-in duration-300 flex-1">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-headline font-bold text-lg">Module Overview</h3>
                    <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-1 rounded tracking-widest uppercase">42% Done</span>
                  </div>
                  
                  {/* Progress Header */}
                  <div className="mb-8">
                    <div className="flex justify-between text-xs text-on-surface-variant mb-2 font-medium">
                      <span>Curating Depth</span>
                      <span>4 / 12 Lessons</span>
                    </div>
                    <div className="w-full h-1 bg-surface-container-high rounded-full">
                      <div className="w-[42%] h-full bg-primary rounded-full shadow-[0_0_8px_rgba(0,209,255,0.4)]"></div>
                    </div>
                  </div>

                  {/* Lesson List */}
                  <motion.div variants={containerVariants} className="space-y-4">
                    <motion.div variants={itemVariants} className="group flex gap-4 p-3 rounded-xl hover:bg-surface-container-high transition-colors cursor-pointer border border-transparent hover:border-outline-variant/10">
                      <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-primary mb-1 uppercase tracking-tight">Lesson 01</div>
                        <div className="text-sm font-medium text-white truncate">The Obsidian Framework</div>
                        <div className="text-[10px] text-on-surface-variant mt-1">12:05 • Completed</div>
                      </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="group flex gap-4 p-3 rounded-xl hover:bg-surface-container-high transition-colors cursor-pointer border border-transparent hover:border-outline-variant/10">
                      <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-primary mb-1 uppercase tracking-tight">Lesson 02</div>
                        <div className="text-sm font-medium text-white truncate">Editorial Authority</div>
                        <div className="text-[10px] text-on-surface-variant mt-1">08:42 • Completed</div>
                      </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="group flex gap-4 p-3 rounded-xl bg-surface-container-high transition-colors cursor-pointer border border-primary/20">
                      <div className="shrink-0 w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center shadow-lg shadow-primary-container/20">
                        <Play className="w-5 h-5 text-on-primary fill-current ml-0.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-primary mb-1 uppercase tracking-tight">Lesson 03</div>
                        <div className="text-sm font-bold text-white truncate">Video Player & Script</div>
                        <div className="text-[10px] text-primary/80 mt-1">Now Playing • 38:05</div>
                      </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="group flex gap-4 p-3 rounded-xl hover:bg-surface-container-high transition-colors cursor-pointer opacity-60 grayscale hover:grayscale-0 hover:opacity-100 border border-transparent hover:border-outline-variant/10">
                      <div className="shrink-0 w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center">
                        <Lock className="w-5 h-5 text-on-surface-variant" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-tight">Lesson 04</div>
                        <div className="text-sm font-medium text-white truncate">Tonal Asymmetry</div>
                        <div className="text-[10px] text-on-surface-variant mt-1">15:30 • Up next</div>
                      </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="group flex gap-4 p-3 rounded-xl hover:bg-surface-container-high transition-colors cursor-pointer opacity-60 grayscale hover:grayscale-0 hover:opacity-100 border border-transparent hover:border-outline-variant/10">
                      <div className="shrink-0 w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center">
                        <PlayCircle className="w-5 h-5 text-on-surface-variant" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-tight">Lesson 05</div>
                        <div className="text-sm font-medium text-white truncate">Glassmorphism Masterclass</div>
                        <div className="text-[10px] text-on-surface-variant mt-1">24:12</div>
                      </div>
                    </motion.div>
                  </motion.div>

                  <button className="w-full mt-8 py-4 bg-surface-container-highest text-on-surface-variant text-xs font-bold rounded-lg border border-outline-variant/10 hover:text-white hover:bg-surface-variant transition-all uppercase tracking-widest">
                    View All 12 Lessons
                  </button>
                </div>
              ) : (
                <div className="animate-in fade-in duration-300 flex-1 flex flex-col h-[600px]">
                  <motion.div variants={containerVariants} className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                    {/* Sample note 1 */}
                    <motion.div variants={itemVariants} className="bg-surface-container-high p-4 rounded-xl space-y-3 group hover:ring-1 ring-primary-container/30 transition-all">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-on-surface-variant font-mono">04:12</span>
                        <MoreHorizontal className="w-4 h-4 text-outline group-hover:text-primary cursor-pointer" />
                      </div>
                      <p className="text-xs text-on-surface italic border-l-2 border-primary-container pl-3">"Notice how the background uses #111317 instead of pure black."</p>
                      <p className="text-[13px] text-on-surface-variant leading-snug">Crucial point on tonal depth. Need to update my Figma variables to match this.</p>
                    </motion.div>

                    {/* Sample note 2 */}
                    <motion.div variants={itemVariants} className="bg-surface-container-high p-4 rounded-xl space-y-3 group hover:ring-1 ring-primary-container/30 transition-all">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-on-surface-variant font-mono">14:22</span>
                        <MoreHorizontal className="w-4 h-4 text-outline group-hover:text-primary cursor-pointer" />
                      </div>
                      <p className="text-[13px] text-on-surface-variant leading-snug">Manrope for headlines, Inter for body. Good rule of thumb for editorial tech vibe.</p>
                    </motion.div>
                  </motion.div>

                  {/* Input */}
                  <div className="mt-4 relative shrink-0">
                    <textarea 
                      className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl text-sm p-4 h-24 focus:ring-1 focus:ring-primary/50 focus:border-primary/50 resize-none placeholder:text-outline/50 text-on-surface" 
                      placeholder="Add quick note..."
                    ></textarea>
                    <button className="absolute bottom-3 right-3 p-2 bg-primary-container text-on-primary rounded-lg hover:bg-primary transition-colors">
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </aside>
        </div>
      </div>
    </motion.div>
  );
}
