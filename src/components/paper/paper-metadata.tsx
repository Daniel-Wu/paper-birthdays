import React from 'react';
import { Text } from '@/components/ui/typography';
import { CalendarIcon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { AuthorsList } from './authors-list';
import { CategoryTag } from './category-tag';
import { CitationBadge } from './citation-badge';
import { Author } from './types';

export interface PaperMetadataProps {
  authors: Author[];
  submittedDate: string;
  categories: string[];
  primaryCategory: string;
  citationCount: number;
  variant?: 'full' | 'compact' | 'minimal';
  showAllCategories?: boolean;
  maxAuthors?: number;
  className?: string;
}

/**
 * PaperMetadata component for displaying comprehensive paper metadata
 * 
 * Features:
 * - Authors list with expansion
 * - Submission date with icon
 * - Category tags with primary highlighting
 * - Citation count badge
 * - Multiple display variants
 * - Responsive layout
 * 
 * @example
 * ```tsx
 * <PaperMetadata 
 *   authors={paper.authors}
 *   submittedDate={paper.submittedDate}
 *   categories={paper.categories}
 *   primaryCategory={paper.primaryCategory}
 *   citationCount={paper.citationCount}
 * />
 * ```
 */
export const PaperMetadata = React.forwardRef<HTMLDivElement, PaperMetadataProps>(
  ({ 
    authors,
    submittedDate,
    categories,
    primaryCategory,
    citationCount,
    variant = 'full',
    showAllCategories = true,
    maxAuthors = 3,
    className,
    ...props 
  }, ref) => {
    // Format the submission date
    const formatDate = (dateString: string): string => {
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      } catch {
        return dateString;
      }
    };

    // Get year for compact display
    const getYear = (dateString: string): string => {
      try {
        const date = new Date(dateString);
        return date.getFullYear().toString();
      } catch {
        return dateString;
      }
    };

    // Organize categories with primary first
    const sortedCategories = [
      primaryCategory,
      ...categories.filter(cat => cat !== primaryCategory)
    ];

    const displayCategories = showAllCategories ? sortedCategories : [primaryCategory];

    if (variant === 'minimal') {
      return (
        <div ref={ref} className={cn('flex items-center gap-4 text-sm', className)} {...props}>
          <Text variant="muted" as="span">
            {getYear(submittedDate)}
          </Text>
          <CategoryTag category={primaryCategory} />
          <CitationBadge count={citationCount} />
        </div>
      );
    }

    if (variant === 'compact') {
      return (
        <div ref={ref} className={cn('space-y-3', className)} {...props}>
          {/* Authors and date on one line */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <AuthorsList 
              authors={authors} 
              maxAuthors={maxAuthors}
              variant="inline"
              showAllOnExpand={false}
            />
            <div className="flex items-center gap-1.5 text-slate-500">
              <CalendarIcon size="sm" />
              <Text variant="caption" as="span">
                {getYear(submittedDate)}
              </Text>
            </div>
          </div>

          {/* Categories and citations */}
          <div className="flex flex-wrap items-center gap-2">
            {displayCategories.map((category) => (
              <CategoryTag
                key={category}
                category={category}
                isPrimary={category === primaryCategory}
              />
            ))}
            <CitationBadge count={citationCount} />
          </div>
        </div>
      );
    }

    // Full variant (default)
    return (
      <div ref={ref} className={cn('space-y-4', className)} {...props}>
        {/* Authors */}
        <AuthorsList 
          authors={authors} 
          maxAuthors={maxAuthors}
          variant="compact"
        />

        {/* Date and categories row */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-600">
            <CalendarIcon size="sm" />
            <Text variant="caption" as="span">
              Submitted {formatDate(submittedDate)}
            </Text>
          </div>
          
          <div className="flex items-center gap-2">
            <CitationBadge count={citationCount} />
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {displayCategories.map((category) => (
            <CategoryTag
              key={category}
              category={category}
              isPrimary={category === primaryCategory}
            />
          ))}
          {!showAllCategories && categories.length > 1 && (
            <Text variant="muted" as="span" className="text-xs self-center">
              +{categories.length - 1} more
            </Text>
          )}
        </div>
      </div>
    );
  }
);

PaperMetadata.displayName = 'PaperMetadata';