import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

export interface AbstractDisplayProps {
  abstract: string;
  title: string;
  maxLines?: number;
  showReadMore?: boolean;
  className?: string;
}

/**
 * AbstractDisplay component for showing paper abstracts with expand/collapse functionality
 * 
 * Features:
 * - Line-based truncation
 * - Smooth expand/collapse animations
 * - Read more/less functionality
 * - Accessible with proper ARIA labels
 * - Responsive design
 * 
 * @example
 * ```tsx
 * <AbstractDisplay 
 *   abstract={paper.abstract} 
 *   title={paper.title}
 *   maxLines={3} 
 * />
 * ```
 */
export const AbstractDisplay = React.forwardRef<HTMLDivElement, AbstractDisplayProps>(
  ({ 
    abstract,
    title,
    maxLines = 4,
    showReadMore = true,
    className,
    ...props 
  }, ref) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [shouldShowButton, setShouldShowButton] = useState(false);
    const textRef = useRef<HTMLDivElement>(null);

    // Check if text overflows the specified number of lines
    useEffect(() => {
      if (!textRef.current) return;

      const element = textRef.current;
      const lineHeight = parseInt(window.getComputedStyle(element).lineHeight);
      const maxHeight = lineHeight * maxLines;
      
      setShouldShowButton(element.scrollHeight > maxHeight);
    }, [abstract, maxLines]);

    if (!abstract || abstract.trim().length === 0) {
      return (
        <Text variant="muted" className={className}>
          No abstract available
        </Text>
      );
    }

    const handleToggle = () => {
      setIsExpanded(!isExpanded);
    };

    return (
      <div ref={ref} className={cn('space-y-3', className)} {...props}>
        {/* Abstract text */}
        <div className="relative">
          <div
            ref={textRef}
            className={cn(
              'text-slate-700 leading-relaxed transition-all duration-300 ease-in-out overflow-hidden',
              !isExpanded && shouldShowButton && `line-clamp-${maxLines}`
            )}
            style={{
              maxHeight: isExpanded ? 'none' : shouldShowButton ? `${maxLines * 1.5}rem` : 'none',
            }}
          >
            <Text variant="body" as="div">
              {abstract}
            </Text>
          </div>

          {/* Gradient fade effect when collapsed */}
          {!isExpanded && shouldShowButton && (
            <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent pointer-events-none" />
          )}
        </div>

        {/* Read more/less button */}
        {shouldShowButton && showReadMore && (
          <div className="flex justify-start">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggle}
              className="h-auto p-0 text-sky-600 hover:text-sky-700 font-medium"
              aria-expanded={isExpanded}
              aria-label={`${isExpanded ? 'Collapse' : 'Expand'} abstract for "${title}"`}
            >
              {isExpanded ? 'Read less' : 'Read more'}
              <svg
                className={cn(
                  'ml-1 h-4 w-4 transition-transform duration-200',
                  isExpanded && 'rotate-180'
                )}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </Button>
          </div>
        )}
      </div>
    );
  }
);

AbstractDisplay.displayName = 'AbstractDisplay';