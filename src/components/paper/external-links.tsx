import React from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLinkIcon, DownloadIcon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

export interface ExternalLinksProps {
  pdfUrl: string;
  abstractUrl: string;
  arxivId: string;
  title: string;
  variant?: 'buttons' | 'links';
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  className?: string;
}

/**
 * ExternalLinks component for PDF downloads and arXiv page links
 * 
 * Features:
 * - PDF download link
 * - arXiv abstract page link
 * - Multiple display variants
 * - Proper external link handling
 * - Accessible with ARIA labels
 * 
 * @example
 * ```tsx
 * <ExternalLinks 
 *   pdfUrl={paper.pdfUrl}
 *   abstractUrl={paper.abstractUrl}
 *   arxivId={paper.arxivId}
 *   title={paper.title}
 * />
 * ```
 */
export const ExternalLinks = React.forwardRef<HTMLDivElement, ExternalLinksProps>(
  ({ 
    pdfUrl,
    abstractUrl,
    arxivId,
    title,
    variant = 'buttons',
    size = 'md',
    showLabels = true,
    className,
    ...props 
  }, ref) => {
    const isButtonVariant = variant === 'buttons';

    const linkProps = {
      target: '_blank',
      rel: 'noopener noreferrer',
    };

    const PDFLink = () => {
      if (isButtonVariant) {
        return (
          <Button
            variant="secondary"
            size={size}
            className={cn(!showLabels && 'p-2 aspect-square')}
            onClick={() => window.open(pdfUrl, '_blank', 'noopener,noreferrer')}
            aria-label={`Download PDF of "${title}"`}
            title="Download PDF"
          >
            <DownloadIcon size={showLabels ? 'sm' : 'md'} />
            {showLabels && <span className="ml-2">PDF</span>}
          </Button>
        );
      }

      return (
        <a
          href={pdfUrl}
          {...linkProps}
          className="inline-flex items-center gap-2 p-0 h-auto font-normal text-sky-600 hover:text-sky-700 transition-colors"
          aria-label={`Download PDF of "${title}"`}
          title="Download PDF"
        >
          <DownloadIcon size={showLabels ? 'sm' : 'md'} />
          {showLabels && <span>PDF</span>}
        </a>
      );
    };

    const ArxivLink = () => {
      if (isButtonVariant) {
        return (
          <Button
            variant="secondary"
            size={size}
            className={cn(!showLabels && 'p-2 aspect-square')}
            onClick={() => window.open(abstractUrl, '_blank', 'noopener,noreferrer')}
            aria-label={`View "${title}" on arXiv`}
            title="View on arXiv"
          >
            <ExternalLinkIcon size={showLabels ? 'sm' : 'md'} />
            {showLabels && <span className="ml-2">arXiv</span>}
          </Button>
        );
      }

      return (
        <a
          href={abstractUrl}
          {...linkProps}
          className="inline-flex items-center gap-2 p-0 h-auto font-normal text-sky-600 hover:text-sky-700 transition-colors"
          aria-label={`View "${title}" on arXiv`}
          title="View on arXiv"
        >
          <ExternalLinkIcon size={showLabels ? 'sm' : 'md'} />
          {showLabels && <span>arXiv</span>}
        </a>
      );
    };

    const containerClasses = cn(
      'flex items-center',
      {
        'gap-3': isButtonVariant,
        'gap-4': !isButtonVariant,
      },
      className
    );

    return (
      <div ref={ref} className={containerClasses} {...props}>
        <PDFLink />
        <ArxivLink />
        
        {/* Additional link for arXiv ID reference */}
        {!isButtonVariant && showLabels && (
          <span className="text-xs text-slate-400 ml-2">
            ID: {arxivId}
          </span>
        )}
      </div>
    );
  }
);

ExternalLinks.displayName = 'ExternalLinks';