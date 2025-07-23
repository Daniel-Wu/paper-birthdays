'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button, Text } from '@/components/ui';

export interface NavigationItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  children?: NavigationItem[];
  external?: boolean;
}

export interface NavigationProps {
  items: NavigationItem[];
  className?: string;
  /**
   * Whether this is the mobile navigation
   * @default false
   */
  isMobile?: boolean;
  /**
   * Callback when a navigation item is clicked (useful for mobile menu)
   */
  onItemClick?: () => void;
}

/**
 * Flexible navigation component for both desktop and mobile menus
 * Features:
 * - Hierarchical navigation with dropdowns
 * - Mobile-responsive design
 * - External link indicators
 * - Active state management
 * - Keyboard navigation
 */
export const Navigation = React.forwardRef<HTMLElement, NavigationProps>(
  ({ items, className, isMobile = false, onItemClick }, ref) => {
    return (
      <nav
        ref={ref}
        className={cn(
          isMobile 
            ? 'flex flex-col space-y-2' 
            : 'flex items-center space-x-6',
          className
        )}
      >
        {items.map((item, index) => (
          <NavigationItem
            key={index}
            item={item}
            isMobile={isMobile}
            onItemClick={onItemClick}
          />
        ))}
      </nav>
    );
  }
);

Navigation.displayName = 'Navigation';

/**
 * Individual navigation item component with dropdown support
 */
interface NavigationItemProps {
  item: NavigationItem;
  isMobile: boolean;
  onItemClick?: () => void;
}

const NavigationItem: React.FC<NavigationItemProps> = ({ 
  item, 
  isMobile, 
  onItemClick 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  // Close dropdown when clicking outside (desktop only)
  useEffect(() => {
    if (!isMobile && isOpen) {
      const handleClickOutside = () => setIsOpen(false);
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen, isMobile]);

  const handleClick = (e: React.MouseEvent) => {
    if (hasChildren) {
      e.preventDefault();
      setIsOpen(!isOpen);
    } else if (onItemClick) {
      onItemClick();
    }
  };

  const linkClasses = cn(
    'flex items-center space-x-2',
    'text-slate-600 hover:text-slate-900',
    'transition-colors duration-200',
    'text-sm font-medium',
    isMobile 
      ? 'px-3 py-2 w-full justify-start rounded-lg hover:bg-slate-50'
      : 'px-3 py-2 rounded-md'
  );

  if (hasChildren) {
    return (
      <div className={cn('relative', isMobile && 'w-full')}>
        <button
          onClick={handleClick}
          className={cn(linkClasses, 'group')}
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          {item.icon && <span className="shrink-0">{item.icon}</span>}
          <span>{item.label}</span>
          <svg
            className={cn(
              'w-4 h-4 transition-transform',
              isOpen && 'rotate-180'
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {isOpen && (
          <div
            className={cn(
              'bg-white border border-slate-200 rounded-lg shadow-lg',
              'min-w-48 overflow-hidden',
              isMobile 
                ? 'mt-2 w-full static'
                : 'absolute top-full left-0 mt-2 z-50'
            )}
          >
            <div className="py-2">
              {item.children!.map((child, childIndex) => (
                <Link
                  key={childIndex}
                  href={child.href}
                  className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  onClick={onItemClick}
                  {...(child.external && {
                    target: '_blank',
                    rel: 'noopener noreferrer'
                  })}
                >
                  <div className="flex items-center space-x-2">
                    {child.icon && <span className="shrink-0">{child.icon}</span>}
                    <span>{child.label}</span>
                    {child.external && (
                      <svg
                        className="w-3 h-3 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Simple navigation item without children
  const Element = item.external ? 'a' : Link;
  const externalProps = item.external 
    ? { target: '_blank', rel: 'noopener noreferrer' }
    : {};

  return (
    <Element
      href={item.href}
      className={linkClasses}
      onClick={!item.external ? handleClick : undefined}
      {...externalProps}
    >
      {item.icon && <span className="shrink-0">{item.icon}</span>}
      <span>{item.label}</span>
      {item.external && (
        <svg
          className="w-3 h-3 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
      )}
    </Element>
  );
};

/**
 * Mobile menu overlay component
 */
export interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export const MobileMenu = React.forwardRef<HTMLDivElement, MobileMenuProps>(
  ({ isOpen, onClose, children, className }, ref) => {
    // Close menu on escape key
    useEffect(() => {
      if (isOpen) {
        const handleEscape = (e: KeyboardEvent) => {
          if (e.key === 'Escape') {
            onClose();
          }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
      }
    }, [isOpen, onClose]);

    // Prevent body scroll when menu is open
    useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = 'hidden';
        return () => {
          document.body.style.overflow = 'unset';
        };
      }
    }, [isOpen]);

    if (!isOpen) {
      return null;
    }

    return (
      <div className="fixed inset-0 z-50 md:hidden">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-slate-900 bg-opacity-50"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Menu panel */}
        <div
          ref={ref}
          className={cn(
            'fixed inset-y-0 right-0 max-w-sm w-full',
            'bg-white border-l border-slate-200',
            'shadow-xl overflow-y-auto',
            'transform transition-transform duration-300 ease-in-out',
            className
          )}
        >
          <div className="flex items-center justify-between p-4 border-b border-slate-200">
            <Text variant="large" className="font-semibold">
              Navigation
            </Text>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              aria-label="Close menu"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </Button>
          </div>

          <div className="p-4">
            {children}
          </div>
        </div>
      </div>
    );
  }
);

MobileMenu.displayName = 'MobileMenu';