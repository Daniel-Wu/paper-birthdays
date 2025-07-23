import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * The variant of the button
   * @default "primary"
   */
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline';
  
  /**
   * The size of the button
   * @default "md"
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Whether the button is in a loading state
   * @default false
   */
  loading?: boolean;
  
  /**
   * Icon to display before the button text
   */
  iconLeft?: React.ReactNode;
  
  /**
   * Icon to display after the button text
   */
  iconRight?: React.ReactNode;
  
  /**
   * Whether the button should take full width
   * @default false
   */
  fullWidth?: boolean;
}

/**
 * Button component implementing the Bright & Airy design language
 * 
 * Features:
 * - Multiple variants (primary, secondary, ghost, destructive)
 * - Three sizes (sm, md, lg)
 * - Loading state with spinner
 * - Icon support (left and right)
 * - Full width option
 * - Accessible with proper ARIA attributes
 * - Keyboard navigation support
 * 
 * @example
 * ```tsx
 * // Primary button
 * <Button variant="primary">Submit</Button>
 * 
 * // Secondary button with icon
 * <Button variant="secondary" iconLeft={<Icon />}>Save Draft</Button>
 * 
 * // Loading state
 * <Button loading>Processing...</Button>
 * ```
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      iconLeft,
      iconRight,
      fullWidth = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    // Base styles shared by all variants
    const baseStyles = [
      'inline-flex items-center justify-center',
      'font-medium',
      'transition-colors-smooth',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:pointer-events-none disabled:opacity-50',
      'rounded-lg',
      'border',
    ];

    // Variant styles
    const variantStyles = {
      primary: [
        'bg-sky-500 hover:bg-sky-600 active:bg-sky-700',
        'border-sky-500 hover:border-sky-600 active:border-sky-700',
        'text-white',
        'focus:ring-sky-500',
        'shadow-sm',
      ],
      secondary: [
        'bg-white hover:bg-slate-50 active:bg-slate-100',
        'border-slate-200 hover:border-slate-300 active:border-slate-400',
        'text-slate-700 hover:text-slate-800',
        'focus:ring-sky-500',
        'shadow-sm',
      ],
      ghost: [
        'bg-transparent hover:bg-slate-100 active:bg-slate-200',
        'border-transparent hover:border-slate-200 active:border-slate-300',
        'text-slate-700 hover:text-slate-800',
        'focus:ring-sky-500',
      ],
      outline: [
        'bg-transparent hover:bg-sky-50 active:bg-sky-100',
        'border-sky-200 hover:border-sky-300 active:border-sky-400',
        'text-sky-600 hover:text-sky-700 active:text-sky-800',
        'focus:ring-sky-500',
      ],
      destructive: [
        'bg-red-500 hover:bg-red-600 active:bg-red-700',
        'border-red-500 hover:border-red-600 active:border-red-700',
        'text-white',
        'focus:ring-red-500',
        'shadow-sm',
      ],
    };

    // Size styles
    const sizeStyles = {
      sm: ['h-8 px-3 text-sm gap-1.5'],
      md: ['h-10 px-4 text-sm gap-2'],
      lg: ['h-12 px-6 text-base gap-2'],
    };

    // Width styles
    const widthStyles = fullWidth ? ['w-full'] : [];

    // Loading spinner component
    const LoadingSpinner = () => (
      <svg
        className="animate-spin h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    );

    // Combine all styles
    const buttonClasses = cn(
      baseStyles,
      variantStyles[variant],
      sizeStyles[size],
      widthStyles,
      className
    );

    return (
      <button
        ref={ref}
        className={buttonClasses}
        disabled={disabled || loading}
        aria-disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <LoadingSpinner />
            <span className="sr-only">Loading</span>
            {children && <span className="ml-2">{children}</span>}
          </>
        ) : (
          <>
            {iconLeft && <span className="shrink-0">{iconLeft}</span>}
            {children}
            {iconRight && <span className="shrink-0">{iconRight}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';