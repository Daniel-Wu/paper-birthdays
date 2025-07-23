import React from 'react';
import { Badge } from '@/components/ui/badge';
import { formatNumber } from '@/lib/utils';

export interface CitationBadgeProps {
  count: number;
  showZero?: boolean;
  variant?: 'default' | 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

/**
 * CitationBadge component for displaying citation counts with proper formatting
 * 
 * Features:
 * - Formats large numbers with K/M suffixes
 * - Optional display when count is 0
 * - Icon support
 * - Consistent with design system
 * 
 * @example
 * ```tsx
 * <CitationBadge count={1234} />          // "1.2K citations"
 * <CitationBadge count={0} showZero />    // "0 citations"
 * <CitationBadge count={1} />             // "1 citation"
 * ```
 */
export const CitationBadge = React.forwardRef<HTMLSpanElement, CitationBadgeProps>(
  ({ 
    count, 
    showZero = false, 
    variant = 'secondary', 
    size = 'sm',
    showIcon = true,
    className,
    ...props 
  }, ref) => {
    // Don't render if count is 0 and showZero is false
    if (count === 0 && !showZero) {
      return null;
    }

    const formattedCount = formatNumber(count);
    const displayText = `${formattedCount} citation${count !== 1 ? 's' : ''}`;

    const CitationIcon = () => (
      <svg
        className="w-3 h-3"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
        />
      </svg>
    );

    return (
      <Badge
        ref={ref}
        variant={variant}
        size={size}
        icon={showIcon ? <CitationIcon /> : undefined}
        className={className}
        title={`${count} citations`}
        {...props}
      >
        {displayText}
      </Badge>
    );
  }
);

CitationBadge.displayName = 'CitationBadge';