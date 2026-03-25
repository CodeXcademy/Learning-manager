import { cn } from '../lib/utils';

// ─── Base shimmer block ──────────────────────────────────────────────────────
interface SkeletonProps {
  className?: string;
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export function Skeleton({ className, rounded = 'md' }: SkeletonProps) {
  const roundedMap = {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    full: 'rounded-full',
  };
  return (
    <div
      className={cn('skeleton', roundedMap[rounded], className)}
      aria-hidden="true"
    />
  );
}

// ─── Text line skeletons ─────────────────────────────────────────────────────
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn('h-3.5', i === lines - 1 ? 'w-3/5' : 'w-full')}
          rounded="full"
        />
      ))}
    </div>
  );
}

// ─── Stat tile skeleton ──────────────────────────────────────────────────────
export function SkeletonStatTile({ className }: { className?: string }) {
  return (
    <div className={cn('bg-surface-container rounded-2xl p-4 sm:p-5 border border-outline-variant/10', className)} aria-hidden="true">
      <div className="flex items-start justify-between mb-4">
        <Skeleton className="w-10 h-10" rounded="xl" />
        <Skeleton className="w-14 h-5" rounded="full" />
      </div>
      <Skeleton className="h-8 w-20 mb-2" rounded="md" />
      <Skeleton className="h-3.5 w-28" rounded="full" />
    </div>
  );
}

// ─── Card skeleton ───────────────────────────────────────────────────────────
export function SkeletonCard({ className, showThumbnail = true }: { className?: string; showThumbnail?: boolean }) {
  return (
    <div className={cn('bg-surface-container rounded-xl border border-outline-variant/10 overflow-hidden', className)} aria-hidden="true">
      {showThumbnail && <Skeleton className="w-full aspect-video" rounded="sm" />}
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-4/5" rounded="full" />
        <Skeleton className="h-3.5 w-3/5" rounded="full" />
        <div className="flex items-center gap-2 pt-1">
          <Skeleton className="w-5 h-5" rounded="full" />
          <Skeleton className="h-3 w-20" rounded="full" />
        </div>
      </div>
    </div>
  );
}

// ─── Library grid skeleton ───────────────────────────────────────────────────
export function SkeletonLibraryGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

// ─── Dashboard skeleton ──────────────────────────────────────────────────────
export function SkeletonDashboard() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6 sm:space-y-8" aria-hidden="true">
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 4 }).map((_, i) => <SkeletonStatTile key={i} />)}
      </div>
      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 bg-surface-container rounded-2xl border border-outline-variant/10 p-6 space-y-4">
          <Skeleton className="h-5 w-36" rounded="full" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="w-full sm:w-40 h-24" rounded="xl" />
                <div className="flex-1 space-y-2 py-1">
                  <Skeleton className="h-4 w-4/5" rounded="full" />
                  <Skeleton className="h-3.5 w-3/5" rounded="full" />
                  <Skeleton className="h-2 w-full mt-3" rounded="full" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-surface-container rounded-2xl border border-outline-variant/10 p-6 space-y-4">
          <Skeleton className="h-5 w-28" rounded="full" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-8 h-8" rounded="xl" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-4/5" rounded="full" />
                  <Skeleton className="h-3 w-2/5" rounded="full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Note list skeleton ───────────────────────────────────────────────────────
export function SkeletonNoteList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-2 p-2" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 px-3 py-3 rounded-xl">
          <Skeleton className="w-8 h-8 shrink-0" rounded="lg" />
          <div className="flex-1 space-y-2 min-w-0">
            <Skeleton className="h-3.5 w-4/5" rounded="full" />
            <Skeleton className="h-3 w-3/5" rounded="full" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Table row skeleton ───────────────────────────────────────────────────────
export function SkeletonTableRows({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-0" aria-hidden="true">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 px-4 py-3 border-b border-outline-variant/10">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className={cn('h-3.5', c === 0 ? 'w-2/5' : c === cols - 1 ? 'w-16' : 'w-1/5')} rounded="full" />
          ))}
        </div>
      ))}
    </div>
  );
}
