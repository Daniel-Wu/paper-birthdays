import React from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The width of the skeleton
   * @default "100%"
   */
  width?: string | number;
  
  /**
   * The height of the skeleton
   * @default "1rem"
   */
  height?: string | number;
  
  /**
   * Whether the skeleton should have rounded corners
   * @default false
   */
  rounded?: boolean;
  
  /**
   * Whether the skeleton should be circular
   * @default false
   */
  circle?: boolean;
  
  /**
   * Number of lines for text skeleton
   */
  lines?: number;
  
  /**
   * Whether the animation should be disabled
   * @default false
   */
  noAnimation?: boolean;
}

/**
 * Skeleton component for loading states following the Bright & Airy design language
 * 
 * Features:
 * - Smooth shimmer animation
 * - Configurable dimensions
 * - Text line support
 * - Circular variant for avatars
 * - Rounded corners option
 * - Accessible with proper ARIA labels
 * 
 * @example
 * ```tsx
 * // Basic skeleton
 * <Skeleton width="200px" height="20px" />
 * 
 * // Text lines
 * <Skeleton lines={3} />
 * 
 * // Circular avatar
 * <Skeleton circle width="40px" height="40px" />
 * 
 * // Card skeleton
 * <SkeletonCard />
 * ```
 */
export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      className,
      width = '100%',
      height = '1rem',
      rounded = false,
      circle = false,
      lines,
      noAnimation = false,
      style,
      ...props
    },
    ref
  ) => {
    // Base skeleton styles
    const baseStyles = [
      'bg-slate-200',
      !noAnimation && 'animate-pulse',
      circle ? 'rounded-full' : rounded ? 'rounded-lg' : 'rounded',
    ].filter(Boolean);

    // Single skeleton element
    const skeletonElement = (
      <div
        ref={lines ? undefined : ref}
        className={cn(baseStyles, className)}
        style={{
          width: typeof width === 'number' ? `${width}px` : width,
          height: typeof height === 'number' ? `${height}px` : height,
          ...style,
        }}
        aria-label="Loading..."
        role="status"
        {...(lines ? {} : props)}
      />
    );

    // Multi-line skeleton
    if (lines && lines > 1) {
      return (
        <div ref={ref} className="space-y-2" {...props}>
          {Array.from({ length: lines }, (_, index) => (
            <div
              key={index}
              className={cn(baseStyles, className)}
              style={{
                width: index === lines - 1 ? '75%' : '100%', // Last line is shorter
                height: typeof height === 'number' ? `${height}px` : height,
                ...style,
              }}
              aria-hidden="true"
            />
          ))}
          <span className="sr-only">Loading content...</span>
        </div>
      );
    }

    return skeletonElement;
  }
);

Skeleton.displayName = 'Skeleton';

/**
 * Pre-built skeleton for paper cards
 */
export const SkeletonCard = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'p-6 border border-slate-200 rounded-lg bg-white shadow-card',
          className
        )}
        {...props}
      >
        <div className="space-y-4">
          {/* Title */}
          <Skeleton height="24px" width="85%" />
          
          {/* Authors */}
          <div className="space-y-2">
            <Skeleton height="16px" width="60%" />
            <Skeleton height="16px" width="45%" />
          </div>
          
          {/* Abstract */}
          <div className="space-y-2">
            <Skeleton lines={4} height="16px" />
          </div>
          
          {/* Footer with badges and date */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex gap-2">
              <Skeleton width="60px" height="24px" rounded />
              <Skeleton width="80px" height="24px" rounded />
            </div>
            <Skeleton width="100px" height="16px" />
          </div>
        </div>
      </div>
    );
  }
);

SkeletonCard.displayName = 'SkeletonCard';

/**
 * Pre-built skeleton for paper list items
 */
export const SkeletonListItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('p-4 border-b border-slate-200', className)}
        {...props}
      >
        <div className="space-y-3">
          {/* Title */}
          <Skeleton height="20px" width="90%" />
          
          {/* Authors and date */}
          <div className="flex items-center justify-between">
            <Skeleton height="14px" width="50%" />
            <Skeleton height="14px" width="80px" />
          </div>
          
          {/* Categories */}
          <div className="flex gap-2">
            <Skeleton width="50px" height="20px" rounded />
            <Skeleton width="70px" height="20px" rounded />
          </div>
        </div>
      </div>
    );
  }
);

SkeletonListItem.displayName = 'SkeletonListItem';

/**
 * Pre-built skeleton for user avatar
 */
export interface SkeletonAvatarProps extends Omit<SkeletonProps, 'circle' | 'width' | 'height'> {
  /**
   * Size of the avatar in pixels
   * @default 40
   */
  size?: number;
}

export const SkeletonAvatar = React.forwardRef<HTMLDivElement, SkeletonAvatarProps>(
  ({ size = 40, ...props }, ref) => {
    return (
      <Skeleton
        ref={ref}
        circle
        width={size}
        height={size}
        {...props}
      />
    );
  }
);

SkeletonAvatar.displayName = 'SkeletonAvatar';

/**
 * Pre-built skeleton for button
 */
export interface SkeletonButtonProps extends Omit<SkeletonProps, 'rounded'> {
  /**
   * Width of the button skeleton
   * @default "100px"
   */
  width?: string | number;
  
  /**
   * Height of the button skeleton
   * @default "40px"
   */
  height?: string | number;
}

export const SkeletonButton = React.forwardRef<HTMLDivElement, SkeletonButtonProps>(
  ({ width = '100px', height = '40px', ...props }, ref) => {
    return (
      <Skeleton
        ref={ref}
        width={width}
        height={height}
        rounded
        {...props}
      />
    );
  }
);

SkeletonButton.displayName = 'SkeletonButton';

/**
 * Skeleton grid for loading multiple cards
 */
export interface SkeletonGridProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Number of skeleton items to show
   * @default 6
   */
  count?: number;
  
  /**
   * Type of skeleton to render
   * @default "card"
   */
  type?: 'card' | 'list';
  
  /**
   * Number of columns in the grid
   * @default 2
   */
  columns?: 1 | 2 | 3 | 4;
}

export const SkeletonGrid = React.forwardRef<HTMLDivElement, SkeletonGridProps>(
  ({ className, count = 6, type = 'card', columns = 2, ...props }, ref) => {
    const gridClasses = cn(
      'grid gap-6',
      {
        'grid-cols-1': columns === 1,
        'grid-cols-1 md:grid-cols-2': columns === 2,
        'grid-cols-1 md:grid-cols-2 lg:grid-cols-3': columns === 3,
        'grid-cols-1 md:grid-cols-2 lg:grid-cols-4': columns === 4,
      },
      className
    );

    const SkeletonComponent = type === 'card' ? SkeletonCard : SkeletonListItem;

    return (
      <div ref={ref} className={gridClasses} {...props}>
        {Array.from({ length: count }, (_, index) => (
          <SkeletonComponent key={index} />
        ))}
      </div>
    );
  }
);

SkeletonGrid.displayName = 'SkeletonGrid';