import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * The variant of the badge
   * @default "default"
   */
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'outline';
  
  /**
   * The size of the badge
   * @default "md"
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Whether the badge has rounded corners (pill shape)
   * @default false
   */
  rounded?: boolean;
  
  /**
   * Icon to display before the badge text
   */
  icon?: React.ReactNode;
  
  /**
   * Whether the badge is removable (shows close button)
   * @default false
   */
  removable?: boolean;
  
  /**
   * Callback when the remove button is clicked
   */
  onRemove?: () => void;
}

/**
 * Badge component for displaying categories, tags, status indicators, and labels
 * following the Bright & Airy design language
 * 
 * Features:
 * - Multiple variants with semantic colors
 * - Three sizes (sm, md, lg)
 * - Icon support
 * - Removable functionality
 * - Pill-shaped option
 * - Accessible with proper ARIA labels
 * 
 * @example
 * ```tsx
 * // Category tag
 * <Badge variant="primary">Computer Science</Badge>
 * 
 * // Status indicator
 * <Badge variant="success" icon={<CheckIcon />}>Published</Badge>
 * 
 * // Removable tag
 * <Badge variant="outline" removable onRemove={() => console.log('removed')}>
 *   Machine Learning
 * </Badge>
 * 
 * // Citation count
 * <Badge variant="secondary" size="sm">1.2K citations</Badge>
 * ```
 */
export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      rounded = false,
      icon,
      removable = false,
      onRemove,
      children,
      ...props
    },
    ref
  ) => {
    // Base styles for all badges
    const baseStyles = [
      'inline-flex items-center font-medium',
      'transition-colors-smooth',
      'focus:outline-none focus:ring-2 focus:ring-offset-1',
      'whitespace-nowrap',
    ];

    // Variant styles
    const variantStyles = {
      default: [
        'bg-slate-100 text-slate-800',
        'hover:bg-slate-200',
        'focus:ring-slate-500',
      ],
      primary: [
        'bg-sky-100 text-sky-800',
        'hover:bg-sky-200',
        'focus:ring-sky-500',
      ],
      secondary: [
        'bg-slate-50 text-slate-600 border border-slate-200',
        'hover:bg-slate-100',
        'focus:ring-slate-500',
      ],
      success: [
        'bg-emerald-100 text-emerald-800',
        'hover:bg-emerald-200',
        'focus:ring-emerald-500',
      ],
      warning: [
        'bg-amber-100 text-amber-800',
        'hover:bg-amber-200',
        'focus:ring-amber-500',
      ],
      error: [
        'bg-red-100 text-red-800',
        'hover:bg-red-200',
        'focus:ring-red-500',
      ],
      info: [
        'bg-blue-100 text-blue-800',
        'hover:bg-blue-200',
        'focus:ring-blue-500',
      ],
      outline: [
        'bg-transparent text-slate-700 border border-slate-300',
        'hover:bg-slate-50',
        'focus:ring-slate-500',
      ],
    };

    // Size styles
    const sizeStyles = {
      sm: ['text-xs px-2 py-0.5 gap-1'],
      md: ['text-sm px-2.5 py-1 gap-1.5'],
      lg: ['text-base px-3 py-1.5 gap-2'],
    };

    // Border radius styles
    const borderStyles = rounded ? ['rounded-full'] : ['rounded-md'];

    // Remove button component
    const RemoveButton = ({ onClick }: { onClick: () => void }) => (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        className={cn(
          'ml-1 inline-flex items-center justify-center',
          'rounded-full hover:bg-current hover:bg-opacity-20',
          'focus:outline-none focus:ring-1 focus:ring-current',
          'transition-colors',
          {
            'h-3 w-3': size === 'sm',
            'h-4 w-4': size === 'md',
            'h-5 w-5': size === 'lg',
          }
        )}
        aria-label="Remove"
      >
        <svg
          className={cn({
            'h-2 w-2': size === 'sm',
            'h-3 w-3': size === 'md',
            'h-4 w-4': size === 'lg',
          })}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    );

    // Combine all styles
    const badgeClasses = cn(
      baseStyles,
      variantStyles[variant],
      sizeStyles[size],
      borderStyles,
      className
    );

    return (
      <span
        ref={ref}
        className={badgeClasses}
        {...props}
      >
        {icon && <span className="shrink-0">{icon}</span>}
        {children}
        {removable && onRemove && <RemoveButton onClick={onRemove} />}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

/**
 * CategoryBadge - Specialized badge for arXiv categories
 * 
 * @example
 * ```tsx
 * <CategoryBadge category="cs.AI" />
 * <CategoryBadge category="math.GT" variant="outline" />
 * ```
 */
export interface CategoryBadgeProps extends Omit<BadgeProps, 'children'> {
  /**
   * The category code (e.g., "cs.AI", "math.GT")
   */
  category: string;
  
  /**
   * Whether to show the full category name
   * @default false
   */
  showFullName?: boolean;
}

export const CategoryBadge = React.forwardRef<HTMLSpanElement, CategoryBadgeProps>(
  ({ category, showFullName = false, variant = 'primary', ...props }, ref) => {
    // Simple category name mapping (can be expanded)
    const categoryNames: Record<string, string> = {
      'cs.AI': 'Artificial Intelligence',
      'cs.LG': 'Machine Learning',
      'cs.CV': 'Computer Vision',
      'cs.CL': 'Computational Linguistics',
      'cs.NE': 'Neural Networks',
      'math.GT': 'Geometric Topology',
      'math.AG': 'Algebraic Geometry',
      'physics.gen-ph': 'General Physics',
      'astro-ph': 'Astrophysics',
      'q-bio': 'Quantitative Biology',
    };

    const displayText = showFullName ? categoryNames[category] || category : category;

    return (
      <Badge
        ref={ref}
        variant={variant}
        size="sm"
        {...props}
      >
        {displayText}
      </Badge>
    );
  }
);

CategoryBadge.displayName = 'CategoryBadge';

/**
 * CitationBadge - Specialized badge for showing citation counts
 * 
 * @example
 * ```tsx
 * <CitationBadge count={1234} />
 * <CitationBadge count={0} showZero />
 * ```
 */
export interface CitationBadgeProps extends Omit<BadgeProps, 'children'> {
  /**
   * The citation count
   */
  count: number;
  
  /**
   * Whether to show badge when count is 0
   * @default false
   */
  showZero?: boolean;
}

export const CitationBadge = React.forwardRef<HTMLSpanElement, CitationBadgeProps>(
  ({ count, showZero = false, variant = 'secondary', ...props }, ref) => {
    // Don't render if count is 0 and showZero is false
    if (count === 0 && !showZero) {
      return null;
    }

    // Format large numbers
    const formatCount = (num: number): string => {
      if (num < 1000) return num.toString();
      if (num < 1000000) return `${(num / 1000).toFixed(1)}K`;
      return `${(num / 1000000).toFixed(1)}M`;
    };

    const displayText = `${formatCount(count)} citation${count !== 1 ? 's' : ''}`;

    return (
      <Badge
        ref={ref}
        variant={variant}
        size="sm"
        {...props}
      >
        {displayText}
      </Badge>
    );
  }
);

CitationBadge.displayName = 'CitationBadge';