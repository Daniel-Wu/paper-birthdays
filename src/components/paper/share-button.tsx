import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ShareIcon, CheckIcon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { Paper } from './types';

export interface ShareButtonProps {
  paper: Paper;
  variant?: 'button' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * ShareButton component for sharing papers with copy-to-clipboard functionality
 * 
 * Features:
 * - Copy paper URL to clipboard
 * - Visual feedback on successful copy
 * - Multiple display variants
 * - Accessible with proper ARIA labels
 * - Social sharing preparation
 * 
 * @example
 * ```tsx
 * <ShareButton paper={paper} variant="button" />
 * <ShareButton paper={paper} variant="icon" size="sm" />
 * ```
 */
export const ShareButton = React.forwardRef<HTMLButtonElement, ShareButtonProps>(
  ({ 
    paper,
    variant = 'button',
    size = 'md',
    className,
    ...props 
  }, ref) => {
    const [copied, setCopied] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Generate shareable URL (in real app, this would be the actual paper page URL)
    const getShareUrl = (): string => {
      if (typeof window !== 'undefined') {
        const baseUrl = window.location.origin;
        return `${baseUrl}/paper/${paper.arxivId}`;
      }
      return `https://paperbirthdays.com/paper/${paper.arxivId}`;
    };

    // Generate share text
    const getShareText = (): string => {
      const year = new Date(paper.submittedDate).getFullYear();
      return `"${paper.title}" by ${paper.authors.slice(0, 2).map(a => a.name).join(', ')}${paper.authors.length > 2 ? ' et al.' : ''} (${year}) - ${paper.citationCount} citations`;
    };

    const handleShare = async () => {
      setIsLoading(true);
      
      try {
        const shareUrl = getShareUrl();
        const shareText = getShareText();
        
        // Try native Web Share API first (mobile)
        if (navigator.share && /Mobi|Android/i.test(navigator.userAgent)) {
          try {
            await navigator.share({
              title: paper.title,
              text: shareText,
              url: shareUrl,
            });
            return;
          } catch {
            // Fall back to clipboard if share was cancelled or failed
          }
        }

        // Fallback to clipboard
        const fullShareText = `${shareText}\n\n${shareUrl}`;
        
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(fullShareText);
        } else {
          // Fallback for older browsers
          const textArea = document.createElement('textarea');
          textArea.value = fullShareText;
          textArea.style.position = 'fixed';
          textArea.style.left = '-999999px';
          textArea.style.top = '-999999px';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          document.execCommand('copy');
          textArea.remove();
        }

        setCopied(true);
        
        // Reset copied state after 2 seconds
        setTimeout(() => setCopied(false), 2000);
        
      } catch (error) {
        console.error('Failed to share:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const isIconVariant = variant === 'icon';
    const buttonSize = isIconVariant ? size : size;
    
    const buttonContent = () => {
      if (isLoading) {
        return (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
            {!isIconVariant && <span className="ml-2">Sharing...</span>}
          </>
        );
      }
      
      if (copied) {
        return (
          <>
            <CheckIcon size="sm" className="text-emerald-600" />
            {!isIconVariant && <span className="ml-2">Copied!</span>}
          </>
        );
      }

      return (
        <>
          <ShareIcon size="sm" />
          {!isIconVariant && <span className="ml-2">Share</span>}
        </>
      );
    };

    return (
      <Button
        ref={ref}
        variant={isIconVariant ? 'ghost' : 'secondary'}
        size={buttonSize}
        onClick={handleShare}
        disabled={isLoading}
        className={cn(
          copied && 'text-emerald-600 hover:text-emerald-700',
          isIconVariant && 'p-2 aspect-square',
          className
        )}
        title={copied ? 'Copied to clipboard' : 'Share this paper'}
        aria-label={copied ? 'Paper link copied to clipboard' : 'Share this paper'}
        {...props}
      >
        {buttonContent()}
      </Button>
    );
  }
);

ShareButton.displayName = 'ShareButton';