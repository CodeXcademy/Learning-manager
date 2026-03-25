import { useState, useMemo } from 'react';
import { motion, Variants } from 'motion/react';
import { 
  BarChart3, 
  Clock, 
  Flame, 
  Trophy, 
  Target, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Zap,
  BookOpen,
  Video,
  FileText,
  Music,
  Brain,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  Award,
  Star,
  ChevronRight,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Activity,
  PieChart,
  LineChart,
  CalendarDays,
  GraduationCap,
  Lightbulb,
  Timer,
  Focus
} from 'lucide-react';
import { useData } from './store/DataContext';
import { LearningSession, Achievement } from './store/localDataStore';

interface AnalyticsViewProps {
  onNavigate: (view: string) => void;
}

// Time period options
type TimePeriod = '7d' | '30d' | '90d' | 'all';

// Mock historical data for demo (in real app, this comes from sessions)
const generateMockData = () => {
  const data = [];
  const today = new Date();
  for (let i = 89; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const baseMinutes = isWeekend ? 45 : 75;
    const variance = Math.floor(Math.random() * 60) - 30;
    data.push({
      date: date.toISOString().split('T')[0],
      minutes: Math.max(0, baseMinutes + variance),
      sessions: Math.floor(Math.random() * 3) + 1,
      quality: Math.floor(Math.random() * 40) + 60,
    });
  }
  return data;
};

const mockHistoricalData = generateMockData();

// Helper to get achievement icon
const getAchievementIcon = (iconName: string) => {
  const icons: Record<string, React.ReactNode> = {
    flame: <Flame className="w-5 h-5" />,
    calendar: <Calendar className="w-5 h-5" />,
    clock: <Clock className="w-5 h-5" />,
    brain: <Brain className="w-5 h-5" />,
    trophy: <Trophy className="w-5 h-5" />,
    flag: <Target className="w-5 h-5" />,
    books: <BookOpen className="w-5 h-5" />,
    graduation: <GraduationCap className="w-5 h-5" />,
    target: <Focus className="w-5 h-5" />,
    sun: <Sun className="w-5 h-5" />,
    moon: <Moon className="w-5 h-5" />,
    zap: <Zap className="w-5 h-5" />,
  };
  return icons[iconName] || <Star className="w-5 h-5" />;
};

// Helper to get color classes
const getColorClasses = (color: string) => {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    orange: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
    purple: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
    blue: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
    cyan: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/30' },
    gold: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
    green: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
    indigo: { bg: 'bg-indigo-500/20', text: 'text-indigo-400', border: 'border-indigo-500/30' },
    pink: { bg: 'bg-pink-500/20', text: 'text-pink-400', border: 'border-pink-500/30' },
    red: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
    yellow: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
    slate: { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/30' },
    amber: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
  };
  return colors[color] || colors.blue;
};

export function AnalyticsView({ onNavigate }: AnalyticsViewProps) {
  const { userStats, courses, files } = useData();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'time' | 'sessions' | 'quality'>('time');
  const [showAllAchievements, setShowAllAchievements] = useState(false);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.06 }
    },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  // Calculate filtered data based on time period
  const filteredData = useMemo(() => {
    const days = timePeriod === '7d' ? 7 : timePeriod === '30d' ? 30 : timePeriod === '90d' ? 90 : mockHistoricalData.length;
    return mockHistoricalData.slice(-days);
  }, [timePeriod]);

  // Calculate period stats
  const periodStats = useMemo(() => {
    const totalMinutes = filteredData.reduce((acc, d) => acc + d.minutes, 0);
    const totalSessions = filteredData.reduce((acc, d) => acc + d.sessions, 0);
    const avgQuality = Math.round(filteredData.reduce((acc, d) => acc + d.quality, 0) / filteredData.length);
    const avgDaily = Math.round(totalMinutes / filteredData.length);
    const activeDays = filteredData.filter(d => d.minutes > 0).length;
    const bestDay = filteredData.reduce((best, d) => d.minutes > best.minutes ? d : best, filteredData[0]);
    
    // Calculate previous period for comparison
    const prevPeriodData = mockHistoricalData.slice(-filteredData.length * 2, -filteredData.length);
    const prevTotalMinutes = prevPeriodData.reduce((acc, d) => acc + d.minutes, 0);
    const changePercent = prevTotalMinutes > 0 ? Math.round(((totalMinutes - prevTotalMinutes) / prevTotalMinutes) * 100) : 0;
    
    return { totalMinutes, totalSessions, avgQuality, avgDaily, activeDays, bestDay, changePercent };
  }, [filteredData]);

  // Weekly breakdown for chart
  const weeklyBreakdown = useMemo(() => {
    const last7 = filteredData.slice(-7);
    const maxMinutes = Math.max(...last7.map(d => d.minutes), 60);
    return last7.map(d => ({
      ...d,
      dayName: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
      height: (d.minutes / maxMinutes) * 100,
    }));
  }, [filteredData]);

  // Content type breakdown
  const contentBreakdown = useMemo(() => {
    const stats = userStats.contentStats || {
      videoMinutes: 245,
      documentMinutes: 180,
      audioMinutes: 95,
      quizMinutes: 30,
    };
    const total = stats.videoMinutes + stats.documentMinutes + stats.audioMinutes + stats.quizMinutes || 1;
    return [
      { type: 'Video', minutes: stats.videoMinutes, percent: Math.round((stats.videoMinutes / total) * 100), color: 'bg-tertiary', icon: Video },
      { type: 'Documents', minutes: stats.documentMinutes, percent: Math.round((stats.documentMinutes / total) * 100), color: 'bg-primary', icon: FileText },
      { type: 'Audio', minutes: stats.audioMinutes, percent: Math.round((stats.audioMinutes / total) * 100), color: 'bg-purple-500', icon: Music },
      { type: 'Quizzes', minutes: stats.quizMinutes, percent: Math.round((stats.quizMinutes / total) * 100), color: 'bg-amber-500', icon: Brain },
    ];
  }, [userStats.contentStats]);

  // Time of day distribution
  const timeDistribution = useMemo(() => {
    const dist = userStats.timeDistribution || {
      morning: 35,
      afternoon: 40,
      evening: 20,
      night: 5,
    };
    const total = dist.morning + dist.afternoon + dist.evening + dist.night || 1;
    return [
      { period: 'Morning', label: '6am - 12pm', percent: Math.round((dist.morning / total) * 100), icon: Sunrise, color: 'text-yellow-400' },
      { period: 'Afternoon', label: '12pm - 6pm', percent: Math.round((dist.afternoon / total) * 100), icon: Sun, color: 'text-orange-400' },
      { period: 'Evening', label: '6pm - 10pm', percent: Math.round((dist.evening / total) * 100), icon: Sunset, color: 'text-purple-400' },
      { period: 'Night', label: '10pm - 6am', percent: Math.round((dist.night / total) * 100), icon: Moon, color: 'text-blue-400' },
    ];
  }, [userStats.timeDistribution]);

  // Quality metrics
  const qualityMetrics = useMemo(() => {
    return {
      quality: userStats.qualityScore || 72,
      consistency: userStats.consistencyScore || 85,
      velocity: userStats.velocityScore || 68,
    };
  }, [userStats]);

  // Achievements
  const achievements = useMemo(() => {
    const allAchievements = userStats.achievements || [];
    const unlocked = allAchievements.filter(a => a.unlockedAt);
    const inProgress = allAchievements.filter(a => !a.unlockedAt && a.progress > 0).sort((a, b) => (b.progress / b.requirement) - (a.progress / a.requirement));
    const locked = allAchievements.filter(a => !a.unlockedAt && a.progress === 0);
    return { unlocked, inProgress, locked, all: allAchievements };
  }, [userStats.achievements]);

  // Monthly trend for chart
  const monthlyTrend = useMemo(() => {
    const months: { month: string; minutes: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toISOString().slice(0, 7);
      const monthData = mockHistoricalData.filter(d => d.date.startsWith(monthKey));
      months.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        minutes: monthData.reduce((acc, d) => acc + d.minutes, 0),
      });
    }
    return months;
  }, []);

  const maxMonthlyMinutes = Math.max(...monthlyTrend.map(m => m.minutes), 1);

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
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <h1 className="font-headline text-3xl lg:text-4xl font-extrabold text-on-surface tracking-tight">
                Learning Analytics
              </h1>
            </div>
            <p className="text-on-surface-variant max-w-lg">
              Track your progress, understand your learning patterns, and unlock achievements.
            </p>
          </div>
          
          {/* Time Period Selector */}
          <div className="flex items-center gap-2 bg-surface-container rounded-xl p-1">
            {(['7d', '30d', '90d', 'all'] as TimePeriod[]).map(period => (
              <button
                key={period}
                onClick={() => setTimePeriod(period)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  timePeriod === period
                    ? 'bg-primary text-on-primary'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {period === '7d' ? '7 Days' : period === '30d' ? '30 Days' : period === '90d' ? '90 Days' : 'All Time'}
              </button>
            ))}
          </div>
        </div>
      </motion.section>

      {/* KPI Cards */}
      <motion.section variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Learning Time */}
        <motion.div 
          variants={itemVariants}
          className="bg-surface-container rounded-xl p-5 border border-outline-variant/10"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div className={`flex items-center gap-1 text-xs font-medium ${periodStats.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {periodStats.changePercent >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(periodStats.changePercent)}%
            </div>
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-on-surface font-headline">
            {Math.floor(periodStats.totalMinutes / 60)}h {periodStats.totalMinutes % 60}m
          </p>
          <p className="text-sm text-on-surface-variant">Total Learning Time</p>
        </motion.div>

        {/* Active Days */}
        <motion.div 
          variants={itemVariants}
          className="bg-surface-container rounded-xl p-5 border border-outline-variant/10"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-green-400" />
            </div>
            <span className="text-xs font-medium text-on-surface-variant">
              {Math.round((periodStats.activeDays / filteredData.length) * 100)}% active
            </span>
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-on-surface font-headline">
            {periodStats.activeDays}
          </p>
          <p className="text-sm text-on-surface-variant">Active Days</p>
        </motion.div>

        {/* Avg Daily */}
        <motion.div 
          variants={itemVariants}
          className="bg-surface-container rounded-xl p-5 border border-outline-variant/10"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 bg-tertiary/20 rounded-lg flex items-center justify-center">
              <Timer className="w-5 h-5 text-tertiary" />
            </div>
            <span className="text-xs font-medium text-on-surface-variant">
              Goal: {userStats.dailyGoalMinutes || 60}m
            </span>
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-on-surface font-headline">
            {periodStats.avgDaily}m
          </p>
          <p className="text-sm text-on-surface-variant">Avg Daily Time</p>
        </motion.div>

        {/* Quality Score */}
        <motion.div 
          variants={itemVariants}
          className="bg-surface-container rounded-xl p-5 border border-outline-variant/10"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-xs font-medium text-purple-400">
              {periodStats.avgQuality >= 80 ? 'Excellent' : periodStats.avgQuality >= 60 ? 'Good' : 'Needs Focus'}
            </span>
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-on-surface font-headline">
            {periodStats.avgQuality}%
          </p>
          <p className="text-sm text-on-surface-variant">Quality Score</p>
        </motion.div>
      </motion.section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Weekly Activity Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-surface-container rounded-xl p-6 border border-outline-variant/10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-headline font-bold text-on-surface text-lg">Weekly Activity</h3>
              <p className="text-sm text-on-surface-variant">Your learning hours this week</p>
            </div>
            <div className="flex items-center gap-2">
              {(['time', 'sessions', 'quality'] as const).map(metric => (
                <button
                  key={metric}
                  onClick={() => setSelectedMetric(metric)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                    selectedMetric === metric
                      ? 'bg-primary/20 text-primary'
                      : 'text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  {metric}
                </button>
              ))}
            </div>
          </div>
          
          {/* Bar Chart */}
          <div className="flex items-end justify-between gap-3 h-48 mb-4">
            {weeklyBreakdown.map((day, index) => {
              const value = selectedMetric === 'time' ? day.minutes : selectedMetric === 'sessions' ? day.sessions * 30 : day.quality;
              const maxValue = selectedMetric === 'time' ? 120 : selectedMetric === 'sessions' ? 120 : 100;
              const height = Math.max((value / maxValue) * 100, 4);
              const isToday = index === weeklyBreakdown.length - 1;
              const metGoal = day.minutes >= (userStats.dailyGoalMinutes || 60);
              
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex flex-col items-center justify-end h-40 relative group">
                    {/* Tooltip */}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-container-highest px-2 py-1 rounded text-xs text-on-surface opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      {selectedMetric === 'time' ? `${day.minutes}m` : selectedMetric === 'sessions' ? `${day.sessions} sessions` : `${day.quality}%`}
                    </div>
                    {/* Goal line */}
                    {selectedMetric === 'time' && (
                      <div 
                        className="absolute w-full border-t border-dashed border-primary/40"
                        style={{ bottom: `${((userStats.dailyGoalMinutes || 60) / 120) * 100}%` }}
                      />
                    )}
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                      className={`w-full rounded-t-lg ${
                        isToday 
                          ? 'bg-gradient-to-t from-primary/60 to-primary' 
                          : metGoal && selectedMetric === 'time'
                            ? 'bg-gradient-to-t from-green-600/60 to-green-500' 
                            : 'bg-surface-container-high hover:bg-surface-container-highest transition-colors'
                      }`}
                    />
                  </div>
                  <span className={`text-xs font-medium ${isToday ? 'text-primary' : 'text-on-surface-variant'}`}>
                    {day.dayName}
                  </span>
                </div>
              );
            })}
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-between text-xs text-on-surface-variant pt-4 border-t border-outline-variant/10">
            <span>Best: {periodStats.bestDay?.date ? new Date(periodStats.bestDay.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'N/A'} ({periodStats.bestDay?.minutes || 0}m)</span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                Met Goal
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-primary" />
                Today
              </span>
            </div>
          </div>
        </motion.div>

        {/* Quality Metrics */}
        <motion.div variants={itemVariants} className="bg-surface-container rounded-xl p-6 border border-outline-variant/10">
          <h3 className="font-headline font-bold text-on-surface text-lg mb-2">Learning Quality</h3>
          <p className="text-sm text-on-surface-variant mb-6">Your learning effectiveness scores</p>
          
          <div className="space-y-6">
            {/* Focus Quality */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-on-surface">Focus Quality</span>
                </div>
                <span className="text-sm font-bold text-primary">{qualityMetrics.quality}%</span>
              </div>
              <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${qualityMetrics.quality}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full"
                />
              </div>
              <p className="text-xs text-on-surface-variant mt-1">Based on focused vs distracted time</p>
            </div>

            {/* Consistency */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-medium text-on-surface">Consistency</span>
                </div>
                <span className="text-sm font-bold text-green-400">{qualityMetrics.consistency}%</span>
              </div>
              <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${qualityMetrics.consistency}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full"
                />
              </div>
              <p className="text-xs text-on-surface-variant mt-1">How regularly you learn</p>
            </div>

            {/* Velocity */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-medium text-on-surface">Learning Velocity</span>
                </div>
                <span className="text-sm font-bold text-amber-400">{qualityMetrics.velocity}%</span>
              </div>
              <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${qualityMetrics.velocity}%` }}
                  transition={{ duration: 1, delay: 0.4 }}
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
                />
              </div>
              <p className="text-xs text-on-surface-variant mt-1">Course completion speed</p>
            </div>
          </div>

          {/* Insight */}
          <div className="mt-6 p-4 bg-primary/10 rounded-xl border border-primary/20">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-on-surface mb-1">Insight</p>
                <p className="text-xs text-on-surface-variant">
                  {qualityMetrics.consistency > 70 
                    ? "Great consistency! You're building strong learning habits."
                    : "Try to maintain a more regular learning schedule for better retention."}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Content Type Breakdown */}
        <motion.div variants={itemVariants} className="bg-surface-container rounded-xl p-6 border border-outline-variant/10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-headline font-bold text-on-surface text-lg">Content Types</h3>
              <p className="text-sm text-on-surface-variant">Time by content category</p>
            </div>
            <PieChart className="w-5 h-5 text-on-surface-variant" />
          </div>
          
          <div className="space-y-4">
            {contentBreakdown.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={item.type}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${item.color.replace('bg-', 'text-')}`} />
                      <span className="text-sm text-on-surface">{item.type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-on-surface-variant">{Math.floor(item.minutes / 60)}h {item.minutes % 60}m</span>
                      <span className="text-xs font-medium text-on-surface">{item.percent}%</span>
                    </div>
                  </div>
                  <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percent}%` }}
                      transition={{ duration: 0.8, delay: 0.1 * index }}
                      className={`h-full ${item.color} rounded-full`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Time of Day Distribution */}
        <motion.div variants={itemVariants} className="bg-surface-container rounded-xl p-6 border border-outline-variant/10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-headline font-bold text-on-surface text-lg">Peak Hours</h3>
              <p className="text-sm text-on-surface-variant">When you learn best</p>
            </div>
            <Clock className="w-5 h-5 text-on-surface-variant" />
          </div>
          
          <div className="space-y-4">
            {timeDistribution.map((item, index) => {
              const Icon = item.icon;
              const isHighest = item.percent === Math.max(...timeDistribution.map(t => t.percent));
              return (
                <div key={item.period} className={`p-3 rounded-lg ${isHighest ? 'bg-primary/10 border border-primary/20' : ''}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${item.color}`} />
                      <div>
                        <span className="text-sm font-medium text-on-surface">{item.period}</span>
                        <span className="text-xs text-on-surface-variant ml-2">{item.label}</span>
                      </div>
                    </div>
                    <span className={`text-sm font-bold ${isHighest ? 'text-primary' : 'text-on-surface-variant'}`}>
                      {item.percent}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percent}%` }}
                      transition={{ duration: 0.6, delay: 0.1 * index }}
                      className={`h-full rounded-full ${isHighest ? 'bg-primary' : 'bg-surface-container-highest'}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Peak time insight */}
          <div className="mt-4 pt-4 border-t border-outline-variant/10">
            <p className="text-xs text-on-surface-variant">
              <span className="text-primary font-medium">Optimal time:</span> {timeDistribution.find(t => t.percent === Math.max(...timeDistribution.map(td => td.percent)))?.period}
            </p>
          </div>
        </motion.div>

        {/* Monthly Trend */}
        <motion.div variants={itemVariants} className="bg-surface-container rounded-xl p-6 border border-outline-variant/10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-headline font-bold text-on-surface text-lg">Monthly Trend</h3>
              <p className="text-sm text-on-surface-variant">Last 6 months</p>
            </div>
            <LineChart className="w-5 h-5 text-on-surface-variant" />
          </div>
          
          {/* Mini bar chart */}
          <div className="flex items-end justify-between gap-2 h-32 mb-4">
            {monthlyTrend.map((month, index) => {
              const height = (month.minutes / maxMonthlyMinutes) * 100;
              const isCurrentMonth = index === monthlyTrend.length - 1;
              return (
                <div key={month.month} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex flex-col items-center justify-end h-24 relative group">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-surface-container-highest px-1.5 py-0.5 rounded text-[10px] text-on-surface opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {Math.floor(month.minutes / 60)}h
                    </div>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ duration: 0.5, delay: index * 0.08 }}
                      className={`w-full rounded-t-md ${isCurrentMonth ? 'bg-primary' : 'bg-surface-container-high'}`}
                    />
                  </div>
                  <span className={`text-[10px] font-medium ${isCurrentMonth ? 'text-primary' : 'text-on-surface-variant'}`}>
                    {month.month}
                  </span>
                </div>
              );
            })}
          </div>
          
          {/* Summary */}
          <div className="flex items-center justify-between text-xs text-on-surface-variant pt-3 border-t border-outline-variant/10">
            <span>Total: {Math.floor(monthlyTrend.reduce((acc, m) => acc + m.minutes, 0) / 60)}h</span>
            <span className="flex items-center gap-1 text-green-400">
              <TrendingUp className="w-3 h-3" />
              Trending up
            </span>
          </div>
        </motion.div>
      </div>

      {/* Achievements Section */}
      <motion.section variants={itemVariants} className="bg-surface-container rounded-xl p-6 border border-outline-variant/10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
              <Trophy className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-headline font-bold text-on-surface text-lg">Achievements</h3>
              <p className="text-sm text-on-surface-variant">
                {achievements.unlocked.length} unlocked, {achievements.inProgress.length} in progress
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAllAchievements(!showAllAchievements)}
            className="flex items-center gap-1 text-primary text-sm font-medium hover:underline"
          >
            {showAllAchievements ? 'Show Less' : 'View All'}
            <ChevronDown className={`w-4 h-4 transition-transform ${showAllAchievements ? 'rotate-180' : ''}`} />
          </button>
        </div>
        
        {/* Unlocked Achievements */}
        {achievements.unlocked.length > 0 && (
          <div className="mb-6">
            <h4 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-3">Unlocked</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {achievements.unlocked.map(achievement => {
                const colors = getColorClasses(achievement.color);
                return (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-xl ${colors.bg} border ${colors.border} text-center`}
                  >
                    <div className={`w-10 h-10 mx-auto mb-2 rounded-lg bg-surface-container flex items-center justify-center ${colors.text}`}>
                      {getAchievementIcon(achievement.icon)}
                    </div>
                    <p className="text-xs font-semibold text-on-surface line-clamp-1">{achievement.title}</p>
                    <p className="text-[10px] text-on-surface-variant line-clamp-1 mt-0.5">{achievement.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* In Progress Achievements */}
        <div>
          <h4 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-3">In Progress</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(showAllAchievements ? achievements.inProgress : achievements.inProgress.slice(0, 3)).map(achievement => {
              const colors = getColorClasses(achievement.color);
              const progressPercent = Math.min((achievement.progress / achievement.requirement) * 100, 100);
              return (
                <div
                  key={achievement.id}
                  className="p-4 rounded-xl bg-surface-container-high border border-outline-variant/10"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 shrink-0 rounded-lg ${colors.bg} flex items-center justify-center ${colors.text}`}>
                      {getAchievementIcon(achievement.icon)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-on-surface line-clamp-1">{achievement.title}</p>
                      <p className="text-xs text-on-surface-variant line-clamp-1">{achievement.description}</p>
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-[10px] mb-1">
                          <span className="text-on-surface-variant">{achievement.progress}/{achievement.requirement}</span>
                          <span className={colors.text}>{Math.round(progressPercent)}%</span>
                        </div>
                        <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 0.6 }}
                            className={`h-full rounded-full ${colors.bg.replace('/20', '')}`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Locked Achievements (only show when expanded) */}
        {showAllAchievements && achievements.locked.length > 0 && (
          <div className="mt-6">
            <h4 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-3">Locked</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {achievements.locked.map(achievement => (
                <div
                  key={achievement.id}
                  className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/5 text-center opacity-50"
                >
                  <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-surface-container flex items-center justify-center text-outline">
                    {getAchievementIcon(achievement.icon)}
                  </div>
                  <p className="text-xs font-semibold text-on-surface-variant line-clamp-1">{achievement.title}</p>
                  <p className="text-[10px] text-outline line-clamp-1 mt-0.5">{achievement.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.section>

      {/* Quick Insights */}
      <motion.section variants={itemVariants} className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl p-5 border border-primary/20">
          <Flame className="w-6 h-6 text-primary mb-3" />
          <p className="text-2xl font-bold text-on-surface font-headline">{userStats.currentStreak || 0}</p>
          <p className="text-sm text-on-surface-variant">Current Streak</p>
          <p className="text-xs text-primary mt-1">Best: {userStats.longestStreak || 0} days</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-500/20 to-green-500/5 rounded-xl p-5 border border-green-500/20">
          <BookOpen className="w-6 h-6 text-green-400 mb-3" />
          <p className="text-2xl font-bold text-on-surface font-headline">{userStats.totalCoursesCompleted || 0}</p>
          <p className="text-sm text-on-surface-variant">Courses Completed</p>
          <p className="text-xs text-green-400 mt-1">{courses.length} total courses</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 rounded-xl p-5 border border-purple-500/20">
          <GraduationCap className="w-6 h-6 text-purple-400 mb-3" />
          <p className="text-2xl font-bold text-on-surface font-headline">{userStats.totalModulesCompleted || 0}</p>
          <p className="text-sm text-on-surface-variant">Modules Completed</p>
          <p className="text-xs text-purple-400 mt-1">{courses.reduce((acc, c) => acc + c.modules.length, 0)} total modules</p>
        </div>
        
        <div className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-xl p-5 border border-amber-500/20">
          <Clock className="w-6 h-6 text-amber-400 mb-3" />
          <p className="text-2xl font-bold text-on-surface font-headline">
            {Math.floor((userStats.totalMinutesLearned || 0) / 60)}h
          </p>
          <p className="text-sm text-on-surface-variant">Total Learning Time</p>
          <p className="text-xs text-amber-400 mt-1">All time</p>
        </div>
      </motion.section>
    </motion.div>
  );
}
