import React from 'react';
import { cn } from '@/lib/utils';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  /**
   * The size of the icon
   * @default "md"
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  
  /**
   * Custom size in pixels (overrides size prop)
   */
  customSize?: number;
  
  /**
   * The color variant of the icon
   * @default "current"
   */
  variant?: 'current' | 'primary' | 'secondary' | 'muted' | 'success' | 'warning' | 'error';
  
  /**
   * Whether the icon should spin
   * @default false
   */
  spinning?: boolean;
}

/**
 * Icon wrapper component for consistent icon styling following the Bright & Airy design language
 * 
 * Features:
 * - Consistent sizing system
 * - Color variants matching the design system
 * - Spinning animation option
 * - Accessible with proper ARIA attributes
 * - Custom size support
 * 
 * @example
 * ```tsx
 * // Basic icon
 * <Icon size="md">
 *   <path d="..." />
 * </Icon>
 * 
 * // Colored icon
 * <Icon variant="primary" size="lg">
 *   <path d="..." />
 * </Icon>
 * 
 * // Spinning loader
 * <Icon spinning variant="primary">
 *   <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
 * </Icon>
 * ```
 */
export const Icon = React.forwardRef<SVGSVGElement, IconProps>(
  (
    {
      className,
      size = 'md',
      customSize,
      variant = 'current',
      spinning = false,
      children,
      ...props
    },
    ref
  ) => {
    // Size styles
    const sizeStyles = {
      xs: 'w-3 h-3',
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
      xl: 'w-8 h-8',
      '2xl': 'w-10 h-10',
    };

    // Color variant styles
    const variantStyles = {
      current: 'text-current',
      primary: 'text-sky-600',
      secondary: 'text-slate-600',
      muted: 'text-slate-400',
      success: 'text-emerald-600',
      warning: 'text-amber-600',
      error: 'text-red-600',
    };

    // Animation styles
    const animationStyles = spinning ? 'animate-spin' : '';

    // Combine styles
    const iconClasses = cn(
      'shrink-0',
      !customSize && sizeStyles[size],
      variantStyles[variant],
      animationStyles,
      className
    );

    // Custom size styles
    const customStyles = customSize
      ? {
          width: `${customSize}px`,
          height: `${customSize}px`,
        }
      : {};

    return (
      <svg
        ref={ref}
        className={iconClasses}
        style={customStyles}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
        {...props}
      >
        {children}
      </svg>
    );
  }
);

Icon.displayName = 'Icon';

/**
 * Common icon components for the Paper Birthdays application
 */

export const ChevronRightIcon = React.forwardRef<SVGSVGElement, Omit<IconProps, 'children'>>(
  (props, ref) => (
    <Icon ref={ref} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </Icon>
  )
);
ChevronRightIcon.displayName = 'ChevronRightIcon';

export const ChevronLeftIcon = React.forwardRef<SVGSVGElement, Omit<IconProps, 'children'>>(
  (props, ref) => (
    <Icon ref={ref} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </Icon>
  )
);
ChevronLeftIcon.displayName = 'ChevronLeftIcon';

export const ChevronDownIcon = React.forwardRef<SVGSVGElement, Omit<IconProps, 'children'>>(
  (props, ref) => (
    <Icon ref={ref} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </Icon>
  )
);
ChevronDownIcon.displayName = 'ChevronDownIcon';

export const ExternalLinkIcon = React.forwardRef<SVGSVGElement, Omit<IconProps, 'children'>>(
  (props, ref) => (
    <Icon ref={ref} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </Icon>
  )
);
ExternalLinkIcon.displayName = 'ExternalLinkIcon';

export const DownloadIcon = React.forwardRef<SVGSVGElement, Omit<IconProps, 'children'>>(
  (props, ref) => (
    <Icon ref={ref} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    </Icon>
  )
);
DownloadIcon.displayName = 'DownloadIcon';

export const ShareIcon = React.forwardRef<SVGSVGElement, Omit<IconProps, 'children'>>(
  (props, ref) => (
    <Icon ref={ref} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
    </Icon>
  )
);
ShareIcon.displayName = 'ShareIcon';

export const BookmarkIcon = React.forwardRef<SVGSVGElement, Omit<IconProps, 'children'>>(
  (props, ref) => (
    <Icon ref={ref} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
    </Icon>
  )
);
BookmarkIcon.displayName = 'BookmarkIcon';

export const CalendarIcon = React.forwardRef<SVGSVGElement, Omit<IconProps, 'children'>>(
  (props, ref) => (
    <Icon ref={ref} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </Icon>
  )
);
CalendarIcon.displayName = 'CalendarIcon';

export const SearchIcon = React.forwardRef<SVGSVGElement, Omit<IconProps, 'children'>>(
  (props, ref) => (
    <Icon ref={ref} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </Icon>
  )
);
SearchIcon.displayName = 'SearchIcon';

export const FilterIcon = React.forwardRef<SVGSVGElement, Omit<IconProps, 'children'>>(
  (props, ref) => (
    <Icon ref={ref} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
    </Icon>
  )
);
FilterIcon.displayName = 'FilterIcon';

export const MenuIcon = React.forwardRef<SVGSVGElement, Omit<IconProps, 'children'>>(
  (props, ref) => (
    <Icon ref={ref} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </Icon>
  )
);
MenuIcon.displayName = 'MenuIcon';

export const CloseIcon = React.forwardRef<SVGSVGElement, Omit<IconProps, 'children'>>(
  (props, ref) => (
    <Icon ref={ref} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </Icon>
  )
);
CloseIcon.displayName = 'CloseIcon';

export const CheckIcon = React.forwardRef<SVGSVGElement, Omit<IconProps, 'children'>>(
  (props, ref) => (
    <Icon ref={ref} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </Icon>
  )
);
CheckIcon.displayName = 'CheckIcon';

export const LoadingSpinnerIcon = React.forwardRef<SVGSVGElement, Omit<IconProps, 'children'>>(
  (props, ref) => (
    <Icon ref={ref} spinning {...props}>
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </Icon>
  )
);
LoadingSpinnerIcon.displayName = 'LoadingSpinnerIcon';

export const HeartIcon = React.forwardRef<SVGSVGElement, Omit<IconProps, 'children'>>(
  (props, ref) => (
    <Icon ref={ref} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </Icon>
  )
);
HeartIcon.displayName = 'HeartIcon';