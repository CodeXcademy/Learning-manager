import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

// Badge Component
const badgeVariants = cva(
  'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase transition-colors',
  {
    variants: {
      variant: {
        primary: 'bg-primary/15 text-primary border border-primary/30 hover:bg-primary/25',
        secondary: 'bg-secondary/15 text-secondary border border-secondary/30 hover:bg-secondary/25',
        tertiary: 'bg-tertiary/15 text-tertiary border border-tertiary/30 hover:bg-tertiary/25',
        success: 'bg-green-500/15 text-green-400 border border-green-500/30 hover:bg-green-500/25',
        warning: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/25',
        danger: 'bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25',
        neutral: 'bg-surface-container-high text-on-surface-variant border border-outline-variant/20 hover:border-outline-variant/40',
      },
      size: {
        sm: 'text-[10px] px-2 py-0.5',
        md: 'text-xs px-3 py-1',
        lg: 'text-sm px-4 py-1.5',
      },
    },
    defaultVariants: {
      variant: 'neutral',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode;
  onRemove?: () => void;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant, size, icon, onRemove, className, children, ...props }, ref) => (
    <span
      ref={ref}
      className={badgeVariants({ variant, size, className })}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 hover:opacity-70 transition-opacity"
          aria-label="Remove"
        >
          ✕
        </button>
      )}
    </span>
  )
);

Badge.displayName = 'Badge';

// Stat Tile Component
export interface StatTileProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  trend?: {
    value: number | string;
    isPositive: boolean;
  };
  isRTL?: boolean;
}

const StatTile = React.forwardRef<HTMLDivElement, StatTileProps>(
  ({ label, value, icon, trend, isRTL, className, ...props }, ref) => (
    <div
      ref={ref}
      className={`flex flex-col gap-2 p-4 rounded-xl bg-surface-container border border-outline-variant/10 hover:border-outline-variant/30 transition-colors ${isRTL ? 'text-right' : 'text-left'} ${className}`}
      dir={isRTL ? 'rtl' : 'ltr'}
      {...props}
    >
      <div className="flex items-center justify-between gap-2">
        {icon && (
          <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
            {icon}
          </div>
        )}
        {trend && (
          <div className={`text-xs font-bold px-2 py-1 rounded-md ${
            trend.isPositive 
              ? 'bg-green-500/15 text-green-400' 
              : 'bg-red-500/15 text-red-400'
          }`}>
            {trend.isPositive ? '↑' : '↓'} {trend.value}
          </div>
        )}
      </div>
      <div>
        <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-tight mb-1">
          {label}
        </p>
        <p className="text-2xl font-black text-on-surface font-headline">
          {value}
        </p>
      </div>
    </div>
  )
);

StatTile.displayName = 'StatTile';

// Progress Badge (for visual progress indication)
export interface ProgressBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0-100
  label?: string;
  variant?: 'primary' | 'success' | 'warning' | 'danger';
  showLabel?: boolean;
}

const ProgressBadge = React.forwardRef<HTMLDivElement, ProgressBadgeProps>(
  ({ value, label, variant = 'primary', showLabel = true, className, ...props }, ref) => {
    const colorClass = {
      primary: 'bg-primary/20',
      success: 'bg-green-500/20',
      warning: 'bg-yellow-500/20',
      danger: 'bg-red-500/20',
    }[variant];

    const barColorClass = {
      primary: 'bg-primary',
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      danger: 'bg-red-500',
    }[variant];

    return (
      <div
        ref={ref}
        className={`${className}`}
        {...props}
      >
        <div className={`w-full h-2 rounded-full ${colorClass} overflow-hidden`}>
          <div
            className={`h-full ${barColorClass} transition-all duration-300`}
            style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
          />
        </div>
        {showLabel && (
          <p className="text-xs font-semibold text-on-surface-variant mt-1">
            {label || `${value}%`}
          </p>
        )}
      </div>
    );
  }
);

ProgressBadge.displayName = 'ProgressBadge';

export { Badge, badgeVariants, StatTile, ProgressBadge };
