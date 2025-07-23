import React from 'react';
import { cn } from '@/lib/utils';

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /**
   * The heading level (h1-h6)
   * @default "h2"
   */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  
  /**
   * The visual size variant
   * @default matches level
   */
  variant?: '5xl' | '4xl' | '3xl' | '2xl' | 'xl' | 'lg' | 'base';
  
  /**
   * Whether the heading should be rendered as its semantic level or styled differently
   * @default true
   */
  asChild?: boolean;
}

export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  /**
   * The text variant
   * @default "body"
   */
  variant?: 'body' | 'caption' | 'small' | 'large' | 'muted' | 'code';
  
  /**
   * The HTML element to render
   * @default "p"
   */
  as?: 'p' | 'span' | 'div' | 'label' | 'strong' | 'em' | 'code' | 'pre';
  
  /**
   * Text truncation
   * @default false
   */
  truncate?: boolean;
}

export type BlockquoteProps = React.HTMLAttributes<HTMLQuoteElement>;

/**
 * Heading component with consistent typography following the Bright & Airy design language
 * 
 * Features:
 * - Semantic HTML (h1-h6) with visual variants
 * - Consistent spacing and typography scale
 * - Accessible heading hierarchy
 * - Support for Geist Sans font family
 * 
 * @example
 * ```tsx
 * <Heading level={1} variant="4xl">Main Title</Heading>
 * <Heading level={2}>Section Title</Heading>
 * <Heading level={3} variant="lg">Subsection</Heading>
 * ```
 */
export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, level = 2, variant, children, ...props }, ref) => {
    // Determine the visual variant based on level if not specified
    const defaultVariants: Record<number, NonNullable<HeadingProps['variant']>> = {
      1: '4xl',
      2: '3xl',
      3: '2xl',
      4: 'xl',
      5: 'lg',
      6: 'base',
    };
    
    const visualVariant = variant || defaultVariants[level] || 'base';

    // Base heading styles
    const baseStyles = [
      'font-heading',
      'text-slate-900',
      'tracking-tight',
      'leading-tight',
    ];

    // Variant styles
    const variantStyles = {
      '5xl': ['text-5xl font-bold', 'md:text-6xl'],
      '4xl': ['text-4xl font-bold', 'md:text-5xl'],
      '3xl': ['text-3xl font-bold', 'md:text-4xl'],
      '2xl': ['text-2xl font-bold', 'md:text-3xl'],
      'xl': ['text-xl font-semibold', 'md:text-2xl'],
      'lg': ['text-lg font-semibold', 'md:text-xl'],
      'base': ['text-base font-medium', 'md:text-lg'],
    };

    // Combine styles
    const headingClasses = cn(
      baseStyles,
      variantStyles[visualVariant],
      className
    );

    // Render the appropriate heading element
    switch (level) {
      case 1:
        return <h1 ref={ref} className={headingClasses} {...props}>{children}</h1>;
      case 2:
        return <h2 ref={ref} className={headingClasses} {...props}>{children}</h2>;
      case 3:
        return <h3 ref={ref} className={headingClasses} {...props}>{children}</h3>;
      case 4:
        return <h4 ref={ref} className={headingClasses} {...props}>{children}</h4>;
      case 5:
        return <h5 ref={ref} className={headingClasses} {...props}>{children}</h5>;
      case 6:
        return <h6 ref={ref} className={headingClasses} {...props}>{children}</h6>;
      default:
        return <h2 ref={ref} className={headingClasses} {...props}>{children}</h2>;
    }
  }
);

Heading.displayName = 'Heading';

/**
 * Text component for body text, captions, and other content
 * 
 * Features:
 * - Multiple variants for different text types
 * - Flexible HTML element rendering
 * - Text truncation support
 * - Consistent color and spacing
 * 
 * @example
 * ```tsx
 * <Text variant="body">Regular paragraph text</Text>
 * <Text variant="caption" as="span">Caption text</Text>
 * <Text variant="muted">Muted helper text</Text>
 * <Text variant="code" as="code">inline code</Text>
 * ```
 */
export const Text = React.forwardRef<HTMLParagraphElement, TextProps>(
  ({ className, variant = 'body', as = 'p', truncate = false, children, ...props }, ref) => {
    // Base text styles
    const baseStyles = [
      'font-body',
    ];

    // Variant styles
    const variantStyles = {
      body: [
        'text-base text-slate-700 leading-relaxed',
      ],
      large: [
        'text-lg text-slate-700 leading-relaxed',
      ],
      caption: [
        'text-sm text-slate-600 leading-normal',
      ],
      small: [
        'text-xs text-slate-600 leading-normal',
      ],
      muted: [
        'text-sm text-slate-500 leading-normal',
      ],
      code: [
        'font-code text-sm text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded-md',
      ],
    };

    // Truncation styles
    const truncateStyles = truncate ? [
      'truncate overflow-hidden',
    ] : [];

    // Combine styles
    const textClasses = cn(
      baseStyles,
      variantStyles[variant],
      truncateStyles,
      className
    );

    // Render the appropriate element based on the 'as' prop
    if (as === 'p') {
      return <p ref={ref} className={textClasses} {...props}>{children}</p>;
    }
    
    // For other elements, we'll use a more flexible approach
    const Element = as;
    return React.createElement(
      Element,
      {
        className: textClasses,
        ...props,
      },
      children
    );
  }
);

Text.displayName = 'Text';

/**
 * Blockquote component for styled quotations
 * 
 * @example
 * ```tsx
 * <Blockquote>
 *   "This is a quote from a research paper abstract."
 * </Blockquote>
 * ```
 */
export const Blockquote = React.forwardRef<HTMLQuoteElement, BlockquoteProps>(
  ({ className, children, ...props }, ref) => {
    const blockquoteClasses = cn(
      'border-l-4 border-sky-200 pl-6 py-2',
      'text-slate-700 italic text-lg leading-relaxed',
      'bg-slate-50 rounded-r-lg',
      className
    );

    return (
      <blockquote
        ref={ref}
        className={blockquoteClasses}
        {...props}
      >
        {children}
      </blockquote>
    );
  }
);

Blockquote.displayName = 'Blockquote';

/**
 * Lead text component for introductory paragraphs
 * 
 * @example
 * ```tsx
 * <Lead>
 *   This is an introductory paragraph with larger, more prominent text.
 * </Lead>
 * ```
 */
export const Lead = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children, ...props }, ref) => {
    const leadClasses = cn(
      'text-xl text-slate-600 leading-relaxed font-light',
      className
    );

    return (
      <p
        ref={ref}
        className={leadClasses}
        {...props}
      >
        {children}
      </p>
    );
  }
);

Lead.displayName = 'Lead';

/**
 * Small text component for fine print and disclaimers
 * 
 * @example
 * ```tsx
 * <Small>© 2024 Paper Birthdays. All rights reserved.</Small>
 * ```
 */
export const Small = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className, children, ...props }, ref) => {
    const smallClasses = cn(
      'text-xs text-slate-500 leading-normal',
      className
    );

    return (
      <small
        ref={ref}
        className={smallClasses}
        {...props}
      >
        {children}
      </small>
    );
  }
);

Small.displayName = 'Small';