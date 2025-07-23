import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Text, Small } from '@/components/ui';

export interface FooterProps {
  className?: string;
}

/**
 * Footer component with links and copyright information
 * Features:
 * - Responsive layout with grouped links
 * - Social links and external references
 * - Copyright notice
 * - Minimal, clean design
 */
export const Footer = React.forwardRef<HTMLElement, FooterProps>(
  ({ className }, ref) => {
    const currentYear = new Date().getFullYear();

    return (
      <footer
        ref={ref}
        className={cn(
          'bg-slate-50 border-t border-slate-200',
          'mt-auto',
          className
        )}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-12">
            {/* Main footer content */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Brand and description */}
              <div className="md:col-span-2">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-6 h-6 bg-sky-500 rounded-md flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
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
                  <Text variant="large" className="font-semibold text-slate-900">
                    Paper Birthdays
                  </Text>
                </div>
                <Text variant="body" className="text-slate-600 max-w-md">
                  Discover historically significant academic papers published on this day in previous years. 
                  Explore the evolution of scientific knowledge through daily paper recommendations.
                </Text>
              </div>

              {/* Navigation links */}
              <div>
                <Text variant="small" className="font-semibold text-slate-900 uppercase tracking-wide mb-4">
                  Explore
                </Text>
                <ul className="space-y-3">
                  <li>
                    <Link
                      href="/"
                      className="text-slate-600 hover:text-slate-900 transition-colors text-sm"
                    >
                      Today&apos;s Papers
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/history"
                      className="text-slate-600 hover:text-slate-900 transition-colors text-sm"
                    >
                      History
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/categories"
                      className="text-slate-600 hover:text-slate-900 transition-colors text-sm"
                    >
                      Categories
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/about"
                      className="text-slate-600 hover:text-slate-900 transition-colors text-sm"
                    >
                      About
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Resources and links */}
              <div>
                <Text variant="small" className="font-semibold text-slate-900 uppercase tracking-wide mb-4">
                  Resources
                </Text>
                <ul className="space-y-3">
                  <li>
                    <Link
                      href="/api"
                      className="text-slate-600 hover:text-slate-900 transition-colors text-sm"
                    >
                      API
                    </Link>
                  </li>
                  <li>
                    <a
                      href="https://github.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-600 hover:text-slate-900 transition-colors text-sm inline-flex items-center"
                    >
                      GitHub
                      <svg
                        className="w-3 h-3 ml-1"
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
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://arxiv.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-600 hover:text-slate-900 transition-colors text-sm inline-flex items-center"
                    >
                      arXiv
                      <svg
                        className="w-3 h-3 ml-1"
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
                    </a>
                  </li>
                  <li>
                    <Link
                      href="/contact"
                      className="text-slate-600 hover:text-slate-900 transition-colors text-sm"
                    >
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom section */}
            <div className="border-t border-slate-200 mt-8 pt-8">
              <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                {/* Copyright */}
                <Small className="text-slate-500">
                  © {currentYear} Paper Birthdays. All rights reserved.
                </Small>

                {/* Social links */}
                <div className="flex items-center space-x-6">
                  <Small className="text-slate-500">
                    Powered by{' '}
                    <a
                      href="https://arxiv.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-600 hover:text-sky-700 transition-colors"
                    >
                      arXiv
                    </a>
                    {' '}and{' '}
                    <a
                      href="https://www.semanticscholar.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-600 hover:text-sky-700 transition-colors"
                    >
                      Semantic Scholar
                    </a>
                  </Small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    );
  }
);

Footer.displayName = 'Footer';