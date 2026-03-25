import React from 'react';

export interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  isRTL?: boolean;
}

const SectionHeader = React.forwardRef<HTMLDivElement, SectionHeaderProps>(
  ({ title, subtitle, action, isRTL, className, ...props }, ref) => (
    <div
      ref={ref}
      className={`flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6 ${isRTL ? 'text-right' : 'text-left'} ${className}`}
      dir={isRTL ? 'rtl' : 'ltr'}
      {...props}
    >
      <div>
        <h2 className="font-headline text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight mb-2">
          {title}
        </h2>
        {subtitle && (
          <p className="text-on-surface-variant max-w-md text-sm sm:text-base leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
);

SectionHeader.displayName = 'SectionHeader';

// Empty State
export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  isRTL?: boolean;
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ icon, title, description, action, isRTL, className, ...props }, ref) => (
    <div
      ref={ref}
      className={`flex flex-col items-center justify-center py-12 px-4 text-center ${isRTL ? 'text-right' : 'text-left'} ${className}`}
      dir={isRTL ? 'rtl' : 'ltr'}
      {...props}
    >
      {icon && (
        <div className="mb-4 p-4 rounded-2xl bg-surface-container-high">
          {icon}
        </div>
      )}
      <h3 className="font-headline text-xl font-bold text-on-surface mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-on-surface-variant max-w-sm mb-6 leading-relaxed">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  )
);

EmptyState.displayName = 'EmptyState';

export { SectionHeader, EmptyState };
