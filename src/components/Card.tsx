import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const cardVariants = cva(
  'rounded-xl border transition-all',
  {
    variants: {
      variant: {
        default: 'bg-surface-container border-outline-variant/10 hover:border-outline-variant/20',
        elevated: 'bg-surface-container-low border-outline-variant/20 shadow-md hover:shadow-lg',
        filled: 'bg-surface-container-high border-outline-variant/30',
        outline: 'bg-transparent border-outline-variant/50 hover:border-primary/30',
      },
      interactive: {
        true: 'cursor-pointer hover:bg-surface-container-high/50 active:scale-98 transition-transform',
        false: '',
      },
      padding: {
        none: 'p-0',
        xs: 'p-3',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      interactive: false,
      padding: 'md',
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant, interactive, padding, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cardVariants({ variant, interactive, padding, className })}
      {...props}
    />
  )
);

Card.displayName = 'Card';

// Card Header
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={`mb-4 flex flex-col gap-2 ${className}`}
      {...props}
    />
  )
);

CardHeader.displayName = 'CardHeader';

// Card Title
export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: 'h1' | 'h2' | 'h3' | 'h4';
}

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, level = 'h3', children, ...props }, ref) => {
    const Heading = level;
    return (
      <Heading
        ref={ref as any}
        className={`font-headline font-bold text-lg text-on-surface ${className}`}
        {...props}
      >
        {children}
      </Heading>
    );
  }
);

CardTitle.displayName = 'CardTitle';

// Card Description
export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={`text-sm text-on-surface-variant ${className}`}
      {...props}
    />
  )
);

CardDescription.displayName = 'CardDescription';

// Card Content
export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={`flex-1 ${className}`}
      {...props}
    />
  )
);

CardContent.displayName = 'CardContent';

// Card Footer
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={`mt-6 flex items-center gap-3 border-t border-outline-variant/10 pt-4 ${className}`}
      {...props}
    />
  )
);

CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, cardVariants };
