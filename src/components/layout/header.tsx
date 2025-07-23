'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button, Heading } from '@/components/ui';

export interface HeaderProps {
  className?: string;
}

/**
 * Main header component with navigation and mobile menu
 * Features:
 * - Responsive design with mobile hamburger menu
 * - Sticky positioning with subtle shadow
 * - Category dropdown and history navigation
 * - Brand logo and title
 * - Accessibility features
 */
export const Header = React.forwardRef<HTMLElement, HeaderProps>(
  ({ className }, ref) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
      setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
      <header
        ref={ref}
        className={cn(
          'sticky top-0 z-50 w-full',
          'bg-white border-b border-slate-200',
          'shadow-sm backdrop-blur-sm',
          className
        )}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <Heading level={1} variant="lg" className="text-slate-900 font-bold">
                  Paper Birthdays
                </Heading>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <CategoryDropdown />
              <Link
                href="/history"
                className="text-slate-600 hover:text-slate-900 transition-colors px-3 py-2 text-sm font-medium"
              >
                History
              </Link>
              <Link
                href="/favorites"
                className="text-slate-600 hover:text-slate-900 transition-colors px-3 py-2 text-sm font-medium flex items-center gap-1"
              >
                <span>❤️</span>
                Favorites
              </Link>
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMobileMenu}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
                aria-label="Toggle navigation menu"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  {isMobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </Button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div
              id="mobile-menu"
              className="md:hidden border-t border-slate-200 py-4"
            >
              <nav className="flex flex-col space-y-3">
                <div className="px-3 py-2">
                  <CategoryDropdown isMobile />
                </div>
                <Link
                  href="/history"
                  className="text-slate-600 hover:text-slate-900 transition-colors px-3 py-2 text-sm font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  History
                </Link>
                <Link
                  href="/favorites"
                  className="text-slate-600 hover:text-slate-900 transition-colors px-3 py-2 text-sm font-medium flex items-center gap-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span>❤️</span>
                  Favorites
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>
    );
  }
);

Header.displayName = 'Header';

/**
 * Category dropdown component for filtering papers by arXiv categories
 */
interface CategoryDropdownProps {
  isMobile?: boolean;
}

const CategoryDropdown: React.FC<CategoryDropdownProps> = ({ isMobile = false }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Sample categories - these will be populated from the backend later
  const categories = [
    { id: 'all', label: 'All Categories', href: '/' },
    { id: 'cs.AI', label: 'Artificial Intelligence', href: '/category/cs.AI' },
    { id: 'cs.LG', label: 'Machine Learning', href: '/category/cs.LG' },
    { id: 'math.GT', label: 'Geometric Topology', href: '/category/math.GT' },
    { id: 'physics.gen-ph', label: 'General Physics', href: '/category/physics.gen-ph' },
    { id: 'q-bio.BM', label: 'Biomolecules', href: '/category/q-bio.BM' },
  ];

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={cn(
          'flex items-center space-x-1',
          isMobile && 'w-full justify-start'
        )}
      >
        <span>Categories</span>
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
      </Button>

      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          {isMobile && (
            <div
              className="fixed inset-0 bg-black bg-opacity-25 z-40"
              onClick={() => setIsOpen(false)}
            />
          )}
          
          {/* Dropdown menu */}
          <div
            className={cn(
              'absolute z-50 mt-2 w-64 bg-white rounded-lg shadow-lg border border-slate-200',
              'max-h-96 overflow-y-auto',
              isMobile ? 'left-0' : 'right-0'
            )}
          >
            <div className="py-2">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={category.href}
                  className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="font-medium">{category.label}</div>
                  {category.id !== 'all' && (
                    <div className="text-xs text-slate-500 mt-0.5">{category.id}</div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};