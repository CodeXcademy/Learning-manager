import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center font-headline font-semibold rounded-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-on-primary hover:opacity-90 shadow-md hover:shadow-lg',
        secondary: 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest border border-outline-variant/20',
        outline: 'border-2 border-primary text-primary hover:bg-primary/10 bg-transparent',
        ghost: 'text-on-surface hover:bg-surface-container-high bg-transparent',
        danger: 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30',
        success: 'bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/30',
      },
      size: {
        xs: 'px-3 py-1.5 text-xs gap-2',
        sm: 'px-4 py-2 text-sm gap-2',
        md: 'px-5 py-2.5 text-base gap-2.5',
        lg: 'px-6 py-3 text-lg gap-3',
        xl: 'px-8 py-4 text-xl gap-3',
      },
      fullWidth: {
        true: 'w-full',
        false: 'w-auto',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant,
    size,
    fullWidth,
    icon,
    iconPosition = 'left',
    loading,
    children,
    ...props
  }, ref) => {
    return (
      <button
        className={buttonVariants({ variant, size, fullWidth, className })}
        disabled={loading || props.disabled}
        ref={ref}
        {...props}
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            {children}
          </>
        ) : (
          <>
            {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
            {children}
            {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
