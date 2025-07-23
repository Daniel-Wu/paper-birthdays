/**
 * Type definitions for Paper Birthdays paper components
 */

export interface Author {
  name: string;
}

export interface Paper {
  id: string;
  arxivId: string;
  title: string;
  abstract: string;
  authors: Author[];
  categories: string[];
  primaryCategory: string;
  submittedDate: string;
  citationCount: number;
  pdfUrl: string;
  abstractUrl: string;
}

export interface FeaturedPaper {
  paper: Paper;
  featuredDate: string;
  category?: string;
}

/**
 * Component prop interfaces
 */

export interface PaperCardProps {
  paper: Paper;
  variant?: 'featured' | 'compact' | 'list';
  showShareButton?: boolean;
  showExternalLinks?: boolean;
  featuredDate?: string;
  loading?: boolean;
  className?: string;
}

export interface PaperMetadataProps {
  authors: Author[];
  submittedDate: string;
  categories: string[];
  primaryCategory: string;
  citationCount: number;
  variant?: 'full' | 'compact';
  className?: string;
}

export interface AbstractDisplayProps {
  abstract: string;
  title: string;
  maxLines?: number;
  showReadMore?: boolean;
  className?: string;
}

export interface AuthorsListProps {
  authors: Author[];
  maxAuthors?: number;
  showAllOnExpand?: boolean;
  className?: string;
}

export interface ShareButtonProps {
  paper: Paper;
  variant?: 'button' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export interface ExternalLinksProps {
  pdfUrl: string;
  abstractUrl: string;
  arxivId: string;
  title: string;
  variant?: 'buttons' | 'links';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export interface CategoryTagProps {
  category: string;
  isPrimary?: boolean;
  showFullName?: boolean;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  removable?: boolean;
  onRemove?: () => void;
  className?: string;
}

export interface CitationBadgeProps {
  count: number;
  showZero?: boolean;
  variant?: 'default' | 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}