import React from 'react';
import { cn } from '@/lib/utils';
import { Header } from './header';
import { Footer } from './footer';

export interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Whether to include the skip to content link
   * @default true
   */
  includeSkipLink?: boolean;
  /**
   * Custom header content (overrides default header)
   */
  header?: React.ReactNode;
  /**
   * Custom footer content (overrides default footer)
   */
  footer?: React.ReactNode;
}

/**
 * Main layout wrapper component providing the application shell
 * Features:
 * - Semantic HTML structure (header, main, footer)
 * - Responsive container with max-width
 * - Proper footer positioning (sticky at bottom)
 * - Accessibility features (skip links, landmarks)
 * - Customizable header and footer
 */
export const MainLayout = React.forwardRef<HTMLDivElement, MainLayoutProps>(
  ({ 
    children, 
    className, 
    includeSkipLink = true, 
    header, 
    footer 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'min-h-screen flex flex-col',
          'bg-white text-slate-900',
          className
        )}
      >
        {/* Skip to content link for accessibility */}
        {includeSkipLink && (
          <a
            href="#main-content"
            className={cn(
              'sr-only focus:not-sr-only',
              'absolute top-4 left-4 z-50',
              'bg-sky-600 text-white px-4 py-2 rounded-lg',
              'text-sm font-medium',
              'focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2',
              'transition-all duration-200'
            )}
          >
            Skip to main content
          </a>
        )}

        {/* Header */}
        {header || <Header />}

        {/* Main content area */}
        <main
          id="main-content"
          className={cn(
            'flex-1 flex flex-col',
            'focus:outline-none'
          )}
          tabIndex={-1}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            {children}
          </div>
        </main>

        {/* Footer */}
        {footer || <Footer />}
      </div>
    );
  }
);

MainLayout.displayName = 'MainLayout';

/**
 * Content wrapper for pages with consistent spacing and max-width
 */
export interface ContentWrapperProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Maximum width variant
   * @default "default"
   */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'default' | 'full';
  /**
   * Vertical padding
   * @default "default"
   */
  padding?: 'none' | 'sm' | 'default' | 'lg';
}

export const ContentWrapper = React.forwardRef<HTMLDivElement, ContentWrapperProps>(
  ({ children, className, maxWidth = 'default', padding = 'default' }, ref) => {
    const maxWidthClasses = {
      sm: 'max-w-2xl',
      md: 'max-w-4xl',
      lg: 'max-w-5xl',
      xl: 'max-w-7xl',
      default: 'max-w-6xl',
      full: 'max-w-none',
    };

    const paddingClasses = {
      none: '',
      sm: 'py-6',
      default: 'py-8 lg:py-12',
      lg: 'py-12 lg:py-16',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'w-full mx-auto',
          maxWidthClasses[maxWidth],
          paddingClasses[padding],
          className
        )}
      >
        {children}
      </div>
    );
  }
);

ContentWrapper.displayName = 'ContentWrapper';