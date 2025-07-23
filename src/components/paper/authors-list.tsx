import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/typography';
import { cn } from '@/lib/utils';
import { Author } from './types';

export interface AuthorsListProps {
  authors: Author[];
  maxAuthors?: number;
  showAllOnExpand?: boolean;
  variant?: 'full' | 'compact' | 'inline';
  className?: string;
}

/**
 * AuthorsList component for displaying paper authors with proper formatting
 * 
 * Features:
 * - Configurable author count display
 * - Expandable to show all authors
 * - Multiple display variants
 * - Proper name formatting and truncation
 * - Accessible expand/collapse
 * 
 * @example
 * ```tsx
 * <AuthorsList authors={authors} maxAuthors={3} />
 * <AuthorsList authors={authors} variant="compact" />
 * <AuthorsList authors={authors} showAllOnExpand />
 * ```
 */
export const AuthorsList = React.forwardRef<HTMLDivElement, AuthorsListProps>(
  ({ 
    authors,
    maxAuthors = 3,
    showAllOnExpand = true,
    variant = 'full',
    className,
    ...props 
  }, ref) => {
    const [showAll, setShowAll] = useState(false);

    if (!authors || authors.length === 0) {
      return (
        <Text variant="muted" as="span" className={className}>
          No authors listed
        </Text>
      );
    }

    // Determine how many authors to show
    const shouldTruncate = authors.length > maxAuthors && !showAll;
    const displayAuthors = shouldTruncate ? authors.slice(0, maxAuthors) : authors;
    const remainingCount = authors.length - maxAuthors;

    // Format author names
    const formatAuthorName = (author: Author): string => {
      return author.name.trim();
    };

    // Create author display based on variant
    const renderAuthors = () => {
      const authorElements = displayAuthors.map((author, index) => (
        <span key={index} className="font-medium">
          {formatAuthorName(author)}
        </span>
      ));

      if (variant === 'inline') {
        return (
          <span className="space-x-1">
            {authorElements.map((element, index) => (
              <span key={index}>
                {element}
                {index < authorElements.length - 1 && (
                  <span className="text-slate-400">, </span>
                )}
              </span>
            ))}
          </span>
        );
      }

      if (variant === 'compact') {
        return (
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {authorElements.map((element, index) => (
              <span key={index} className="text-sm">
                {element}
                {index < authorElements.length - 1 && shouldTruncate && index === displayAuthors.length - 1 && (
                  <span className="text-slate-400">, ...</span>
                )}
              </span>
            ))}
          </div>
        );
      }

      // Full variant (default)
      return (
        <div className="space-y-1">
          {authorElements.map((element, index) => (
            <div key={index} className="text-sm">
              {element}
            </div>
          ))}
        </div>
      );
    };

    const baseClasses = cn(
      'text-slate-700',
      {
        'flex items-center gap-2': variant === 'inline',
        'space-y-2': variant === 'full',
      },
      className
    );

    return (
      <div ref={ref} className={baseClasses} {...props}>
        <div className="flex items-start gap-2">
          {/* Authors icon */}
          <svg
            className="w-4 h-4 mt-0.5 text-slate-400 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" 
            />
          </svg>
          
          <div className="flex-1 min-w-0">
            {renderAuthors()}
            
            {/* Show remaining count and expand button */}
            {shouldTruncate && remainingCount > 0 && (
              <div className="mt-1 flex items-center gap-2">
                <Text variant="muted" as="span" className="text-xs">
                  +{remainingCount} more author{remainingCount !== 1 ? 's' : ''}
                </Text>
                {showAllOnExpand && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAll(true)}
                    className="h-auto p-1 text-xs text-sky-600 hover:text-sky-700"
                  >
                    Show all
                  </Button>
                )}
              </div>
            )}
            
            {/* Show collapse button when expanded */}
            {showAll && showAllOnExpand && authors.length > maxAuthors && (
              <div className="mt-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAll(false)}
                  className="h-auto p-1 text-xs text-sky-600 hover:text-sky-700"
                >
                  Show fewer
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

AuthorsList.displayName = 'AuthorsList';