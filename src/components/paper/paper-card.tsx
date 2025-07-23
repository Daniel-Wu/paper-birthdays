import React from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Heading, Text } from '@/components/ui/typography';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { PaperMetadata } from './paper-metadata';
import { AbstractDisplay } from './abstract-display';
import { ShareButton } from './share-button';
import { ExternalLinks } from './external-links';
import { Paper } from './types';

export interface PaperCardProps {
  paper: Paper;
  variant?: 'featured' | 'compact' | 'list';
  showShareButton?: boolean;
  showExternalLinks?: boolean;
  showAbstract?: boolean;
  featuredDate?: string;
  loading?: boolean;
  className?: string;
}

/**
 * PaperCard component - Main display component for papers
 * 
 * Features:
 * - Multiple display variants (featured, compact, list)
 * - Loading states with skeletons
 * - Optional abstract display
 * - Share and external link functionality
 * - Responsive design
 * - Accessible structure
 * 
 * @example
 * ```tsx
 * <PaperCard paper={paper} variant="featured" showAbstract />
 * <PaperCard paper={paper} variant="compact" />
 * <PaperCard paper={paper} variant="list" />
 * ```
 */
export const PaperCard = React.forwardRef<HTMLDivElement, PaperCardProps>(
  ({ 
    paper,
    variant = 'featured',
    showShareButton = true,
    showExternalLinks = true,
    showAbstract = true,
    featuredDate,
    loading = false,
    className,
    ...props 
  }, ref) => {
    // Loading state
    if (loading) {
      return (
        <Card
          ref={ref}
          variant="default"
          className={cn(
            {
              'max-w-4xl': variant === 'featured',
              'max-w-2xl': variant === 'compact',
            },
            className
          )}
          {...props}
        >
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-20" />
            </div>
          </CardFooter>
        </Card>
      );
    }

    // Featured date display
    const FeaturedBadge = () => {
      if (!featuredDate) return null;

      const formatFeaturedDate = (dateString: string): string => {
        try {
          const date = new Date(dateString);
          const year = date.getFullYear();
          const today = new Date();
          const currentYear = today.getFullYear();
          
          if (year === currentYear) {
            return 'Today';
          } else {
            return `On this day in ${year}`;
          }
        } catch {
          return dateString;
        }
      };

      return (
        <Badge variant="primary" size="sm" className="mb-4">
          🎯 {formatFeaturedDate(featuredDate)}
        </Badge>
      );
    };

    // List variant (horizontal layout)
    if (variant === 'list') {
      return (
        <Card
          ref={ref}
          variant="default"
          interactive
          className={cn('hover:shadow-md transition-shadow', className)}
          {...props}
        >
          <div className="flex gap-6 p-6">
            <div className="flex-1 min-w-0 space-y-3">
              <div>
                <Heading level={3} variant="lg" className="line-clamp-2">
                  {paper.title}
                </Heading>
                <div className="mt-2">
                  <PaperMetadata
                    authors={paper.authors}
                    submittedDate={paper.submittedDate}
                    categories={paper.categories}
                    primaryCategory={paper.primaryCategory}
                    citationCount={paper.citationCount}
                    variant="compact"
                    maxAuthors={2}
                  />
                </div>
              </div>
              
              {showAbstract && (
                <div className="line-clamp-2">
                  <Text variant="body" className="text-slate-600">
                    {paper.abstract}
                  </Text>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 shrink-0">
              {(showExternalLinks || showShareButton) && (
                <div className="flex gap-2">
                  {showExternalLinks && (
                    <ExternalLinks
                      pdfUrl={paper.pdfUrl}
                      abstractUrl={paper.abstractUrl}
                      arxivId={paper.arxivId}
                      title={paper.title}
                      size="sm"
                      showLabels={false}
                    />
                  )}
                  {showShareButton && (
                    <ShareButton paper={paper} variant="icon" size="sm" />
                  )}
                </div>
              )}
            </div>
          </div>
        </Card>
      );
    }

    // Compact variant
    if (variant === 'compact') {
      return (
        <Card
          ref={ref}
          variant="default"
          className={cn('max-w-2xl', className)}
          {...props}
        >
          <CardHeader>
            <FeaturedBadge />
            <Heading level={2} variant="xl" className="leading-tight">
              {paper.title}
            </Heading>
          </CardHeader>

          <CardContent className="space-y-4">
            <PaperMetadata
              authors={paper.authors}
              submittedDate={paper.submittedDate}
              categories={paper.categories}
              primaryCategory={paper.primaryCategory}
              citationCount={paper.citationCount}
              variant="compact"
            />

            {showAbstract && (
              <AbstractDisplay
                abstract={paper.abstract}
                title={paper.title}
                maxLines={3}
              />
            )}
          </CardContent>

          {(showExternalLinks || showShareButton) && (
            <CardFooter className="flex justify-between items-center">
              {showExternalLinks && (
                <ExternalLinks
                  pdfUrl={paper.pdfUrl}
                  abstractUrl={paper.abstractUrl}
                  arxivId={paper.arxivId}
                  title={paper.title}
                />
              )}
              
              {showShareButton && (
                <ShareButton paper={paper} size="sm" />
              )}
            </CardFooter>
          )}
        </Card>
      );
    }

    // Featured variant (default)
    return (
      <Card
        ref={ref}
        variant="elevated"
        className={cn('max-w-4xl mx-auto', className)}
        {...props}
      >
        <CardHeader>
          <FeaturedBadge />
          <Heading level={1} variant="3xl" className="leading-tight">
            {paper.title}
          </Heading>
        </CardHeader>

        <CardContent className="space-y-6">
          <PaperMetadata
            authors={paper.authors}
            submittedDate={paper.submittedDate}
            categories={paper.categories}
            primaryCategory={paper.primaryCategory}
            citationCount={paper.citationCount}
            variant="full"
          />

          {showAbstract && (
            <AbstractDisplay
              abstract={paper.abstract}
              title={paper.title}
              maxLines={4}
            />
          )}
        </CardContent>

        {(showExternalLinks || showShareButton) && (
          <CardFooter className="flex flex-wrap justify-between items-center gap-4">
            {showExternalLinks && (
              <ExternalLinks
                pdfUrl={paper.pdfUrl}
                abstractUrl={paper.abstractUrl}
                arxivId={paper.arxivId}
                title={paper.title}
              />
            )}
            
            <div className="flex gap-2">
              {showShareButton && (
                <ShareButton paper={paper} />
              )}
            </div>
          </CardFooter>
        )}
      </Card>
    );
  }
);

PaperCard.displayName = 'PaperCard';