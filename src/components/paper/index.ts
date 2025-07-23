/**
 * Paper Display Components for Paper Birthdays
 * Module 3: Paper Display Components
 * 
 * Comprehensive components for displaying academic papers with the Bright & Airy design language
 */

// Types (re-export specific types to avoid conflicts)
export type { 
  Author, 
  Paper, 
  FeaturedPaper,
  PaperMetadataProps,
  AbstractDisplayProps,
  AuthorsListProps,
  ShareButtonProps,
  ExternalLinksProps,
  CategoryTagProps,
  CitationBadgeProps
} from './types';

// Main Components
export { PaperCard } from './paper-card';
export type { PaperCardProps } from './paper-card';
export { PaperMetadata } from './paper-metadata';
export { AbstractDisplay } from './abstract-display';

// Specialized Components
export { AuthorsList } from './authors-list';
export { CitationBadge } from './citation-badge';
export { CategoryTag } from './category-tag';
export { ShareButton } from './share-button';
export { ExternalLinks } from './external-links';

// Re-export common UI components for convenience
export { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
export { Button } from '@/components/ui/button';
export { Badge } from '@/components/ui/badge';
export { Heading, Text } from '@/components/ui/typography';