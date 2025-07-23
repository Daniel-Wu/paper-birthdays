'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Paper } from '@/lib/api/types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  paper: Paper;
  currentUrl?: string;
  className?: string;
}

interface ShareOption {
  name: string;
  icon: string;
  color: string;
  getUrl: (url: string, title: string, description: string) => string;
  ariaLabel: string;
}

const SHARE_OPTIONS: ShareOption[] = [
  {
    name: 'Twitter',
    icon: 'twitter',
    color: 'bg-blue-500 hover:bg-blue-600',
    getUrl: (url, title) => 
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${title} - Paper Birthdays`)}&url=${encodeURIComponent(url)}`,
    ariaLabel: 'Share on Twitter'
  },
  {
    name: 'LinkedIn',
    icon: 'linkedin',
    color: 'bg-blue-700 hover:bg-blue-800',
    getUrl: (url, title, description) => 
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(description)}`,
    ariaLabel: 'Share on LinkedIn'
  },
  {
    name: 'Facebook',
    icon: 'facebook',
    color: 'bg-blue-600 hover:bg-blue-700',
    getUrl: (url) => 
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    ariaLabel: 'Share on Facebook'
  },
  {
    name: 'Reddit',
    icon: 'reddit',
    color: 'bg-orange-500 hover:bg-orange-600',
    getUrl: (url, title) => 
      `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
    ariaLabel: 'Share on Reddit'
  }
];

// Simple QR code generation using a placeholder approach
// In a real app, you'd use a proper QR code library like qrcode
function generateQRCodeDataURL(): string {
  // This is a placeholder - in reality you'd use a QR code library
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  
  canvas.width = 200;
  canvas.height = 200;
  
  // Simple placeholder pattern
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, 200, 200);
  ctx.fillStyle = '#fff';
  ctx.fillRect(10, 10, 180, 180);
  ctx.fillStyle = '#000';
  ctx.font = '12px monospace';
  ctx.fillText('QR Code', 70, 100);
  ctx.fillText('Placeholder', 60, 115);
  
  return canvas.toDataURL();
}

export function ShareModal({
  isOpen,
  onClose,
  paper,
  currentUrl = window.location.href,
  className
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [shareStats, setShareStats] = useState<Record<string, number>>({});
  const modalRef = useRef<HTMLDivElement>(null);
  const copyInputRef = useRef<HTMLInputElement>(null);

  const shareUrl = currentUrl;
  const shareTitle = paper.title;
  const shareDescription = `${paper.abstract.slice(0, 150)}...`;

  // Generate QR code when modal opens
  useEffect(() => {
    if (isOpen) {
      try {
        const qrUrl = generateQRCodeDataURL();
        setQrCodeUrl(qrUrl);
      } catch (error) {
        console.warn('Failed to generate QR code:', error);
      }
    }
  }, [isOpen, shareUrl]);

  // Load share statistics from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`share-stats-${paper.id}`);
      if (stored) {
        setShareStats(JSON.parse(stored));
      }
    } catch (error) {
      console.warn('Failed to load share stats:', error);
    }
  }, [paper.id]);

  // Handle copy to clipboard
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      // Track copy action
      trackShareAction('copy');
    } catch {
      // Fallback for older browsers
      if (copyInputRef.current) {
        copyInputRef.current.select();
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        trackShareAction('copy');
      }
    }
  };

  // Handle social media sharing
  const handleSocialShare = (option: ShareOption) => {
    const url = option.getUrl(shareUrl, shareTitle, shareDescription);
    window.open(url, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
    trackShareAction(option.name.toLowerCase());
  };

  // Handle email sharing
  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Interesting paper: ${shareTitle}`);
    const body = encodeURIComponent(
      `I found this interesting paper on Paper Birthdays:\n\n${shareTitle}\n\nBy: ${paper.authors.map(a => a.name).join(', ')}\n\n${shareDescription}\n\nView it here: ${shareUrl}\n\nSubmitted on: ${new Date(paper.submittedDate).toLocaleDateString()}\nCitations: ${paper.citationCount.toLocaleString()}`
    );
    
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    trackShareAction('email');
  };

  // Track share actions
  const trackShareAction = (platform: string) => {
    const newStats = {
      ...shareStats,
      [platform]: (shareStats[platform] || 0) + 1
    };
    setShareStats(newStats);
    
    try {
      localStorage.setItem(`share-stats-${paper.id}`, JSON.stringify(newStats));
    } catch (error) {
      console.warn('Failed to save share stats:', error);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div
        ref={modalRef}
        className={cn(
          'relative w-full max-w-md mx-4 bg-white rounded-lg shadow-xl',
          'animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4',
          className
        )}
        role="dialog"
        aria-labelledby="share-modal-title"
        aria-describedby="share-modal-description"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 id="share-modal-title" className="text-lg font-semibold">
              Share Paper
            </h2>
            <p id="share-modal-description" className="text-sm text-gray-600 mt-1">
              Share this interesting paper with others
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
            aria-label="Close share modal"
          >
            <Icon name="x" className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Paper Info */}
          <div className="space-y-2">
            <h3 className="font-medium text-sm text-gray-700">Paper Details</h3>
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-sm mb-1 line-clamp-2">{paper.title}</h4>
              <p className="text-xs text-gray-600 mb-2">
                By {paper.authors.slice(0, 3).map(a => a.name).join(', ')}
                {paper.authors.length > 3 && ` +${paper.authors.length - 3} more`}
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" size="sm">
                  {paper.citationCount.toLocaleString()} citations
                </Badge>
                <Badge variant="outline" size="sm">
                  {new Date(paper.submittedDate).getFullYear()}
                </Badge>
              </div>
            </div>
          </div>

          {/* Copy Link */}
          <div className="space-y-2">
            <h3 className="font-medium text-sm text-gray-700">Copy Link</h3>
            <div className="flex gap-2">
              <input
                ref={copyInputRef}
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-3 py-2 text-sm border rounded-md bg-gray-50 font-mono"
                aria-label="Share URL"
              />
              <Button
                onClick={handleCopyLink}
                variant={copied ? 'primary' : 'outline'}
                size="sm"
                className="shrink-0"
              >
                <Icon name={copied ? 'check' : 'copy'} className="h-4 w-4 mr-1" />
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </div>

          {/* Social Media */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm text-gray-700">Share on Social Media</h3>
            <div className="grid grid-cols-2 gap-2">
              {SHARE_OPTIONS.map((option) => (
                <Button
                  key={option.name}
                  onClick={() => handleSocialShare(option)}
                  className={cn('flex items-center gap-2 text-white', option.color)}
                  size="sm"
                  aria-label={option.ariaLabel}
                >
                  <Icon name={option.icon} className="h-4 w-4" />
                  <span>{option.name}</span>
                  {shareStats[option.name.toLowerCase()] && (
                    <Badge variant="secondary" size="sm" className="ml-auto bg-white/20">
                      {shareStats[option.name.toLowerCase()]}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <h3 className="font-medium text-sm text-gray-700">Share via Email</h3>
            <Button
              onClick={handleEmailShare}
              variant="outline"
              className="w-full flex items-center gap-2"
            >
              <Icon name="mail" className="h-4 w-4" />
              Send Email
              {shareStats.email && (
                <Badge variant="outline" size="sm" className="ml-auto">
                  {shareStats.email}
                </Badge>
              )}
            </Button>
          </div>

          {/* QR Code */}
          <div className="space-y-2">
            <h3 className="font-medium text-sm text-gray-700">QR Code</h3>
            <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
              {qrCodeUrl ? (
                <div className="space-y-2">
                  <Image
                    src={qrCodeUrl}
                    alt="QR code for sharing"
                    width={128}
                    height={128}
                    className="border rounded"
                  />
                  <p className="text-xs text-gray-600 text-center">
                    Scan to open paper
                  </p>
                </div>
              ) : (
                <div className="w-32 h-32 bg-gray-200 rounded flex items-center justify-center">
                  <Icon name="qr-code" className="h-8 w-8 text-gray-400" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t bg-gray-50 rounded-b-lg">
          <div className="text-xs text-gray-500">
            Total shares: {Object.values(shareStats).reduce((sum, count) => sum + count, 0)}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ShareModal;