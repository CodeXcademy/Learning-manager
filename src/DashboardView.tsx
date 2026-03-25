import { motion, Variants } from 'motion/react';
import { 
  Flame, 
  Target, 
  Clock, 
  Play, 
  Trophy, 
  Zap, 
  TrendingUp,
  BookOpen,
  Calendar,
  ChevronRight,
  Star,
  HardDrive,
  Video,
  BarChart3
} from 'lucide-react';
import { useData } from './store/DataContext';

interface DashboardViewProps {
  onNavigate: (view: string) => void;
}

// Mock data for the dashboard
const continueWatching = [
  {
    id: 1,
    title: 'Mastering Architectural Visualization',
    module: 'Module 12: Lighting Techniques',
    progress: 65,
    duration: '24 min left',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCKwzjuZztM_XiAt0SAFdj_VgylIJXeW-V_jeFwwmM1vcb7uq3boqc7JpCQl6324KxEWzO-9bkLzz4Izy0LGP4qd2YItNvUQYSla-vX-KXzdaFNXNVP-JYejCHqiNOV4mYjp4-OBg-uRoFp-HI3jLBW5r4R9ZSNUe-B3IaXdlVHwmTdXVd1qT3cgugJNWeaf0jsGIR2NXmzqPqQ7p7vdorupuNeLcGDLNmjOoXCbf1Y6N8nLmd2F78Rf8S4269fixI07LzpkkFDrgY'
  },
  {
    id: 2,
    title: 'Design Systems 101',
    module: 'Module 5: Component Libraries',
    progress: 42,
    duration: '38 min left',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCTMJxr1xXD1F9vcOM1p9s0BGw1awsBNTBfZd4lmjO8ZNCdJrNF5M2DC7pogyIpm6OrpaD309sywxUIEoNc21FlJ-RBg9mjT7_3bUZAEGTosH3P7Mg15zYBSr1-G7yn2LxMDpGkcSi8vMfUH0aN_C9asJTULQCXSAs9dPRwiM2_2iWWr7kuNI173tEvJ5RjWcEIFkqN-MM35q2IdSawAE7cxrDayzhz6AMBWqkB9o48mWh_RyVPBN9gu3DO9l2cf2O0XHktlLUKbKA'
  },
  {
    id: 3,
    title: 'Fullstack Mastery',
    module: 'Module 18: Database Optimization',
    progress: 78,
    duration: '15 min left',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD8dc_e_O4xL2CmQruOwjVjxtmDHBDyza0zFtLEx4IE5bZ-NZax_iCNtPWPEDiXdYbK4P6zc4HkYH7b0GPWmSY_S_xULiQuHkgEvPKy9SaaB22j92AtmjBA8ONlHUIhkGSVV8laFIytVeogTeymtIlvpaStg4lkHZiIpXCP-qphMkXSfSaBLowwz9GpC4GW-v0_bOvF67pjw5EViqUDtOKfWTVmdfNvSWtFxP_Hk5ta3NXR3AQ8Zv4GgsY5kkbOc9jTQ1YqbFW_nW8'
  }
];

const weeklyData = [
  { day: 'Mon', hours: 2.5, goal: 2 },
  { day: 'Tue', hours: 1.8, goal: 2 },
  { day: 'Wed', hours: 3.2, goal: 2 },
  { day: 'Thu', hours: 2.0, goal: 2 },
  { day: 'Fri', hours: 1.5, goal: 2 },
  { day: 'Sat', hours: 0.8, goal: 2 },
  { day: 'Sun', hours: 0, goal: 2 }
];

const achievements = [
  { id: 1, title: 'Week Warrior', description: '7-day streak', icon: Flame, unlocked: true, color: 'text-orange-400' },
  { id: 2, title: 'Quick Learner', description: '10 lessons in a day', icon: Zap, unlocked: true, color: 'text-yellow-400' },
  { id: 3, title: 'Milestone Master', description: 'Complete 5 courses', icon: Trophy, unlocked: false, color: 'text-primary' },
  { id: 4, title: 'Rising Star', description: 'Top 10% this week', icon: Star, unlocked: false, color: 'text-tertiary' }
];

export function DashboardView({ onNavigate }: DashboardViewProps) {
  const { courses, files, collections, userStats } = useData();
  
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
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

  // Use data from context with fallbacks
  const currentStreak = userStats.currentStreak || 0;
  const dailyGoalMinutes = userStats.dailyGoalMinutes || 60;
  const todayProgress = userStats.weeklyProgress.find(p => p.date === new Date().toISOString().split('T')[0]);
  const completedMinutes = todayProgress?.minutesLearned || 0;
  const goalProgress = dailyGoalMinutes > 0 ? Math.round((completedMinutes / dailyGoalMinutes) * 100) : 0;
  const totalHoursThisWeek = weeklyData.reduce((acc, day) => acc + day.hours, 0) + (userStats.totalMinutesLearned / 60);
  const maxHours = Math.max(...weeklyData.map(d => d.hours), 4);
  
  // Get courses from context or use mock data
  const displayCourses = courses.length > 0 ? courses.slice(0, 3).map(c => ({
    id: c.id,
    title: c.title,
    module: c.modules[0]?.title || 'No modules',
    progress: c.progress || 0,
    duration: c.totalDuration || 'Not started',
    thumbnail: c.thumbnail || ''
  })) : continueWatching;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      className="p-6 lg:p-8 pb-32 max-w-7xl mx-auto"
    >
      {/* Welcome Section */}
      <motion.section variants={itemVariants} className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-on-surface-variant text-sm mb-1">Welcome back,</p>
            <h1 className="font-headline text-3xl lg:text-4xl font-extrabold text-on-surface tracking-tight flex items-center gap-3">
              Good morning, Alex
              <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs font-bold rounded-full flex items-center gap-1">
                <HardDrive className="w-3 h-3" /> Local
              </span>
            </h1>
            <p className="text-on-surface-variant mt-2 max-w-lg">
              You're making great progress. Keep up the momentum!
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-on-surface-variant">
            <Calendar className="w-4 h-4" />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
      </motion.section>

      {/* Stats Grid */}
      <motion.section variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Streak Card */}
        <motion.div 
          variants={itemVariants}
          className="bg-surface-container rounded-xl p-5 border border-outline-variant/10 hover:bg-surface-container-high transition-colors"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <Flame className="w-5 h-5 text-orange-400" />
            </div>
            <span className="text-xs font-medium text-orange-400 bg-orange-500/10 px-2 py-1 rounded-full">
              Personal Best!
            </span>
          </div>
          <p className="text-3xl font-bold text-on-surface font-headline">{currentStreak}</p>
          <p className="text-sm text-on-surface-variant">Day Streak</p>
        </motion.div>

        {/* Daily Goal Card */}
        <motion.div 
          variants={itemVariants}
          className="bg-surface-container rounded-xl p-5 border border-outline-variant/10 hover:bg-surface-container-high transition-colors"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xs font-medium text-on-surface-variant">
              {completedMinutes}/{dailyGoalMinutes} min
            </span>
          </div>
          <div className="mb-2">
            <div className="flex justify-between items-center mb-1">
              <p className="text-3xl font-bold text-on-surface font-headline">{goalProgress}%</p>
            </div>
            <p className="text-sm text-on-surface-variant">Daily Goal</p>
          </div>
          <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${goalProgress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full"
            />
          </div>
        </motion.div>

        {/* Weekly Hours Card */}
        <motion.div 
          variants={itemVariants}
          className="bg-surface-container rounded-xl p-5 border border-outline-variant/10 hover:bg-surface-container-high transition-colors"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 bg-tertiary/20 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-tertiary" />
            </div>
            <div className="flex items-center gap-1 text-xs text-green-400">
              <TrendingUp className="w-3 h-3" />
              +12%
            </div>
          </div>
          <p className="text-3xl font-bold text-on-surface font-headline">{totalHoursThisWeek.toFixed(1)}h</p>
          <p className="text-sm text-on-surface-variant">This Week</p>
        </motion.div>

        {/* Courses & Files Card */}
        <motion.div 
          variants={itemVariants}
          className="bg-surface-container rounded-xl p-5 border border-outline-variant/10 hover:bg-surface-container-high transition-colors"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-secondary" />
            </div>
            <span className="text-[10px] font-medium text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-full flex items-center gap-1">
              <HardDrive className="w-2.5 h-2.5" /> Local
            </span>
          </div>
          <p className="text-3xl font-bold text-on-surface font-headline">{courses.length}</p>
          <p className="text-sm text-on-surface-variant">Courses Created</p>
          <div className="mt-2 pt-2 border-t border-outline-variant/10 flex items-center gap-3 text-xs text-on-surface-variant">
            <span>{files.length} files</span>
            <span>{collections.length} collections</span>
          </div>
        </motion.div>
      </motion.section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Continue Watching Section */}
        <motion.section variants={itemVariants} className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-headline text-xl font-bold text-on-surface">Continue Watching</h2>
            <button 
              onClick={() => onNavigate('library')}
              className="text-primary text-sm font-medium hover:underline flex items-center gap-1"
            >
              View All <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          {displayCourses.length > 0 ? (
            <div className="space-y-4">
              {displayCourses.map((course) => (
                <motion.div
                  key={course.id}
                  variants={itemVariants}
                  onClick={() => onNavigate('course-player')}
                  className="bg-surface-container rounded-xl overflow-hidden border border-outline-variant/10 hover:bg-surface-container-high transition-all cursor-pointer group flex flex-col sm:flex-row"
                >
                  <div className="relative w-full sm:w-48 h-32 sm:h-auto shrink-0">
                    {course.thumbnail ? (
                      <img 
                        src={course.thumbnail} 
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-tertiary/20 flex items-center justify-center">
                        <Video className="w-10 h-10 text-on-surface-variant/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-12 h-12 bg-primary/90 rounded-full flex items-center justify-center">
                        <Play className="w-5 h-5 text-on-primary fill-current ml-0.5" />
                      </div>
                    </div>
                    {/* Progress bar on thumbnail */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
                      <div 
                        className="h-full bg-primary"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex-1 p-4 flex flex-col justify-center">
                    <h3 className="font-headline font-bold text-on-surface mb-1 line-clamp-1">{course.title}</h3>
                    <p className="text-sm text-on-surface-variant mb-3">{course.module}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-on-surface-variant">{course.progress}%</span>
                      </div>
                      <span className="text-xs text-on-surface-variant flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {course.duration}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div 
              onClick={() => onNavigate('content-manage')}
              className="bg-surface-container rounded-xl p-8 border-2 border-dashed border-outline-variant/30 text-center cursor-pointer hover:border-primary/50 hover:bg-surface-container-high transition-all"
            >
              <Video className="w-12 h-12 text-on-surface-variant mx-auto mb-3" />
              <p className="text-on-surface font-medium mb-1">No courses yet</p>
              <p className="text-sm text-on-surface-variant mb-4">Create your first course to start learning</p>
              <span className="inline-flex items-center gap-1 text-primary text-sm font-medium">
                Go to Content Manager <ChevronRight className="w-4 h-4" />
              </span>
            </div>
          )}
        </motion.section>

        {/* Right Column */}
        <motion.div variants={itemVariants} className="space-y-6">
          {/* Weekly Progress Chart */}
          <div className="bg-surface-container rounded-xl p-5 border border-outline-variant/10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-headline font-bold text-on-surface">Weekly Progress</h3>
              <button 
                onClick={() => onNavigate('analytics')}
                className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
              >
                <BarChart3 className="w-3 h-3" /> View Analytics
              </button>
            </div>
            <div className="flex items-end justify-between gap-2 h-32 mb-3">
              {weeklyData.map((day, index) => {
                const height = day.hours > 0 ? (day.hours / maxHours) * 100 : 4;
                const isToday = index === 6;
                const metGoal = day.hours >= day.goal;
                
                return (
                  <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex flex-col items-center justify-end h-24 relative">
                      {/* Goal line indicator */}
                      <div 
                        className="absolute w-full border-t border-dashed border-outline-variant/30"
                        style={{ bottom: `${(2 / maxHours) * 100}%` }}
                      />
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                        className={`w-full rounded-t-md ${
                          isToday 
                            ? 'bg-surface-container-highest' 
                            : metGoal 
                              ? 'bg-gradient-to-t from-primary/60 to-primary' 
                              : 'bg-surface-container-high'
                        }`}
                      />
                    </div>
                    <span className={`text-[10px] font-medium ${isToday ? 'text-on-surface-variant' : 'text-outline'}`}>
                      {day.day}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between text-xs text-on-surface-variant pt-3 border-t border-outline-variant/10">
              <span>Total: {totalHoursThisWeek.toFixed(1)} hours</span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-primary" />
                Met Goal
              </span>
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-surface-container rounded-xl p-5 border border-outline-variant/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-headline font-bold text-on-surface">Achievements</h3>
              <span className="text-xs text-on-surface-variant">2/4 unlocked</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {achievements.map((achievement) => {
                const Icon = achievement.icon;
                return (
                  <div
                    key={achievement.id}
                    className={`p-3 rounded-lg border transition-colors ${
                      achievement.unlocked 
                        ? 'bg-surface-container-high border-outline-variant/20' 
                        : 'bg-surface-container-low border-outline-variant/5 opacity-50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${
                      achievement.unlocked ? 'bg-surface-container-highest' : 'bg-surface-container'
                    }`}>
                      <Icon className={`w-4 h-4 ${achievement.unlocked ? achievement.color : 'text-outline'}`} />
                    </div>
                    <p className="text-xs font-semibold text-on-surface line-clamp-1">{achievement.title}</p>
                    <p className="text-[10px] text-on-surface-variant line-clamp-1">{achievement.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
