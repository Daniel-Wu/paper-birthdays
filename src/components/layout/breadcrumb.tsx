import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Text } from '@/components/ui';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  /**
   * Separator between breadcrumb items
   * @default "chevron"
   */
  separator?: 'chevron' | 'slash' | 'arrow';
  /**
   * Whether to show the home icon for the first item
   * @default true
   */
  showHomeIcon?: boolean;
}

/**
 * Breadcrumb navigation component for showing current page location
 * Features:
 * - Multiple separator styles
 * - Home icon support
 * - Accessible navigation structure
 * - Current page indication
 * - Responsive design
 */
export const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({ 
    items, 
    className, 
    separator = 'chevron', 
    showHomeIcon = true 
  }, ref) => {
    const separatorIcons = {
      chevron: (
        <svg
          className="w-4 h-4 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      ),
      slash: (
        <span className="text-slate-400 mx-2" aria-hidden="true">
          /
        </span>
      ),
      arrow: (
        <svg
          className="w-4 h-4 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M14 5l7 7m0 0l-7 7m7-7H3"
          />
        </svg>
      ),
    };

    if (!items.length) {
      return null;
    }

    return (
      <nav
        ref={ref}
        aria-label="Breadcrumb"
        className={cn(
          'flex items-center space-x-1 md:space-x-2',
          'text-sm',
          className
        )}
      >
        <ol className="flex items-center space-x-1 md:space-x-2">
          {items.map((item, index) => {
            const isFirst = index === 0;
            const isLast = index === items.length - 1;
            const isCurrent = item.current || isLast;

            return (
              <li key={index} className="flex items-center">
                {/* Separator (except for first item) */}
                {!isFirst && (
                  <span className="flex items-center mx-1 md:mx-2">
                    {separatorIcons[separator]}
                  </span>
                )}

                {/* Breadcrumb item */}
                <div className="flex items-center">
                  {isFirst && showHomeIcon && (
                    <svg
                      className="w-4 h-4 mr-1 text-slate-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m0 0V11a1 1 0 011-1h2a1 1 0 011 1v10m3 0a1 1 0 001-1V10M9 21h6"
                      />
                    </svg>
                  )}

                  {isCurrent ? (
                    <Text
                      variant="caption"
                      className={cn(
                        'text-slate-900 font-medium',
                        'truncate max-w-xs md:max-w-sm'
                      )}
                      aria-current="page"
                    >
                      {item.label}
                    </Text>
                  ) : item.href ? (
                    <Link
                      href={item.href}
                      className={cn(
                        'text-slate-600 hover:text-slate-900',
                        'transition-colors duration-200',
                        'truncate max-w-xs md:max-w-sm',
                        'text-sm'
                      )}
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <Text
                      variant="caption"
                      className={cn(
                        'text-slate-600',
                        'truncate max-w-xs md:max-w-sm'
                      )}
                    >
                      {item.label}
                    </Text>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </nav>
    );
  }
);

Breadcrumb.displayName = 'Breadcrumb';

/**
 * Helper hook to generate breadcrumb items based on current route
 * This would typically use Next.js router to automatically generate breadcrumbs
 */
export interface UseBreadcrumbsOptions {
  /**
   * Custom labels for route segments
   */
  customLabels?: Record<string, string>;
  /**
   * Whether to include the home item
   * @default true
   */
  includeHome?: boolean;
}

export const useBreadcrumbs = (
  options: UseBreadcrumbsOptions = {}
): BreadcrumbItem[] => {
  const { customLabels = {}, includeHome = true } = options;

  // In a real implementation, this would use useRouter() from Next.js
  // For now, we'll return a sample breadcrumb structure
  const breadcrumbs: BreadcrumbItem[] = [];

  if (includeHome) {
    breadcrumbs.push({
      label: customLabels['home'] || 'Home',
      href: '/',
    });
  }

  // This would be populated based on the current route
  // Example: /category/cs.AI would generate:
  // - Home -> Categories -> Computer Science -> Artificial Intelligence

  return breadcrumbs;
};