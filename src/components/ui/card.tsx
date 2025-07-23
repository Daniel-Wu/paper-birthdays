import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The variant of the card
   * @default "default"
   */
  variant?: 'default' | 'elevated' | 'outlined' | 'ghost';
  
  /**
   * The padding size of the card
   * @default "md"
   */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  
  /**
   * Whether the card is interactive (hover effects)
   * @default false
   */
  interactive?: boolean;
  
  /**
   * Whether the card is in a loading state
   * @default false
   */
  loading?: boolean;
}

export type CardHeaderProps = React.HTMLAttributes<HTMLDivElement>;

export type CardContentProps = React.HTMLAttributes<HTMLDivElement>;

export type CardFooterProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * Card component implementing the Bright & Airy design language
 * 
 * Features:
 * - Multiple variants (default, elevated, outlined, ghost)
 * - Configurable padding sizes
 * - Interactive hover states
 * - Loading state
 * - Accessible with proper semantics
 * - Composable with CardHeader, CardContent, and CardFooter
 * 
 * @example
 * ```tsx
 * <Card variant="elevated" interactive>
 *   <CardHeader>
 *     <h3>Paper Title</h3>
 *   </CardHeader>
 *   <CardContent>
 *     <p>Paper abstract...</p>
 *   </CardContent>
 *   <CardFooter>
 *     <Button>Read More</Button>
 *   </CardFooter>
 * </Card>
 * ```
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = 'default',
      padding = 'md',
      interactive = false,
      loading = false,
      children,
      ...props
    },
    ref
  ) => {
    // Base styles for all cards
    const baseStyles = [
      'rounded-lg',
      'transition-smooth',
      'relative',
      'overflow-hidden',
    ];

    // Variant styles
    const variantStyles = {
      default: [
        'bg-white',
        'border border-sky-100',
        'shadow-card',
        ...(interactive ? [
          'hover:shadow-md hover:border-sky-200',
          'focus-within:ring-2 focus-within:ring-sky-500 focus-within:ring-offset-2',
          'cursor-pointer',
        ] : []),
      ],
      elevated: [
        'bg-white',
        'border border-slate-100',
        'shadow-md',
        ...(interactive ? [
          'hover:shadow-lg hover:border-slate-200',
          'hover:-translate-y-0.5',
          'focus-within:ring-2 focus-within:ring-sky-500 focus-within:ring-offset-2',
          'cursor-pointer',
        ] : []),
      ],
      outlined: [
        'bg-white',
        'border-2 border-slate-200',
        'shadow-subtle',
        ...(interactive ? [
          'hover:border-sky-300 hover:shadow-sm',
          'focus-within:ring-2 focus-within:ring-sky-500 focus-within:ring-offset-2',
          'cursor-pointer',
        ] : []),
      ],
      ghost: [
        'bg-slate-50',
        'border border-transparent',
        ...(interactive ? [
          'hover:bg-slate-100 hover:border-slate-200',
          'focus-within:ring-2 focus-within:ring-sky-500 focus-within:ring-offset-2',
          'cursor-pointer',
        ] : []),
      ],
    };

    // Padding styles
    const paddingStyles = {
      none: [],
      sm: ['p-4'],
      md: ['p-6'],
      lg: ['p-8'],
    };

    // Loading overlay
    const loadingOverlay = loading && (
      <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sky-500"></div>
      </div>
    );

    // Combine all styles
    const cardClasses = cn(
      baseStyles,
      variantStyles[variant],
      paddingStyles[padding],
      className
    );

    return (
      <div
        ref={ref}
        className={cardClasses}
        role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : undefined}
        {...props}
      >
        {loadingOverlay}
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

/**
 * CardHeader component for consistent card header styling
 */
export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex flex-col space-y-1.5', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

/**
 * CardContent component for consistent card content styling
 */
export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('pt-0', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardContent.displayName = 'CardContent';

/**
 * CardFooter component for consistent card footer styling
 */
export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex items-center pt-6', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';