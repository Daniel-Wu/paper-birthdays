'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTodayPaper } from '@/lib/api/hooks';
import { PaperCard } from '@/components/paper';
import { ContentWrapper } from '@/components/layout/main-layout';
import { Heading, Text, Button } from '@/components/ui';
import { SkeletonCard } from '@/components/ui/skeleton';
import { generatePaperStructuredData } from './metadata';
import { 
  CategorySelector, 
  ShareModal, 
  FavoriteButton 
} from '@/components/features';
import type { Paper } from '@/lib/api/types';

/**
 * Quick Actions Component with Interactive Features
 */
interface QuickActionsProps {
  paper: Paper;
}

const QuickActions: React.FC<QuickActionsProps> = ({ paper }) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category);
    if (category) {
      window.location.href = `/categories/${category}`;
    }
  };

  return (
    <div className="space-y-8 mt-12">
      {/* Category Selection */}
      <div className="max-w-md mx-auto">
        <Text variant="body" className="text-center mb-4 text-slate-600">
          Explore papers by category:
        </Text>
        <CategorySelector
          categories={[]}
          selectedCategory={selectedCategory || undefined}
          onCategoryChange={handleCategorySelect}
          placeholder="Choose a category to explore..."
          showSearch={true}
          className="w-full"
        />
      </div>

      {/* Paper Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <FavoriteButton 
          paper={paper} 
          variant="default"
          showCount={false}
        />
        <Button 
          variant="secondary" 
          onClick={() => setShowShareModal(true)}
          className="flex items-center gap-2"
        >
          📤 Share This Paper
        </Button>
      </div>

      {/* Navigation Links */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/categories">
          <Button variant="secondary" size="lg">
            <span className="flex items-center gap-2">
              🗂️ Browse by Category
            </span>
          </Button>
        </Link>
        <Link href="/history">
          <Button variant="outline" size="lg">
            <span className="flex items-center gap-2">
              📚 View History
            </span>
          </Button>
        </Link>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        paper={paper}
      />
    </div>
  );
};

/**
 * Error State Component
 */
interface ErrorStateProps {
  error: Error;
  onRetry: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => {
  const isNetworkError = error.message.includes('fetch') || error.message.includes('network');
  
  return (
    <div className="text-center py-12">
      <div className="max-w-md mx-auto">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        
        <Heading level={2} variant="lg" className="mb-4 text-slate-900">
          {isNetworkError ? 'Connection Problem' : 'Unable to Load Today&apos;s Paper'}
        </Heading>
        
        <Text variant="body" className="text-slate-600 mb-6">
          {isNetworkError 
            ? 'Please check your internet connection and try again.'
            : 'We encountered an issue while loading today&apos;s featured paper. Please try again in a moment.'
          }
        </Text>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="primary" onClick={onRetry}>
            Try Again
          </Button>
          <Link href="/categories">
            <Button variant="secondary">Browse Categories</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

/**
 * Empty State Component (when no paper is found)
 */
const EmptyState: React.FC = () => {
  return (
    <div className="text-center py-12">
      <div className="max-w-md mx-auto">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-slate-500"
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
        
        <Heading level={2} variant="lg" className="mb-4 text-slate-900">
          No Paper Found for Today
        </Heading>
        
        <Text variant="body" className="text-slate-600 mb-6">
          We couldn&apos;t find any historically significant papers published on this date. 
          Check back tomorrow or explore papers by category.
        </Text>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/categories">
            <Button variant="primary">Browse Categories</Button>
          </Link>
          <Link href="/history">
            <Button variant="secondary">View History</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

/**
 * Page Title Component
 */
interface PageTitleProps {
  featuredDate?: string;
  isLoading?: boolean;
}

const PageTitle: React.FC<PageTitleProps> = ({ featuredDate, isLoading }) => {
  const getPageTitle = (): string => {
    if (isLoading) return 'Loading Today&apos;s Paper...';
    
    if (featuredDate) {
      try {
        const date = new Date(featuredDate);
        const year = date.getFullYear();
        const today = new Date();
        const currentYear = today.getFullYear();
        
        if (year === currentYear) {
          return `Today&apos;s Featured Paper`;
        } else {
          return `On this day in ${year}`;
        }
      } catch {
        return 'Today&apos;s Featured Paper';
      }
    }
    
    return 'Today&apos;s Featured Paper';
  };

  return (
    <div className="text-center mb-8">
      <Heading level={1} variant="2xl" className="mb-4 text-slate-900">
        📅 {getPageTitle()}
      </Heading>
      <Text variant="large" className="text-slate-600 max-w-2xl mx-auto">
        Discover a historically significant academic paper published on this day in academic history.
      </Text>
    </div>
  );
};


/**
 * Main Home Page Component
 */
export default function HomePage() {
  const { data, error, isLoading, mutate } = useTodayPaper();

  const handleRetry = () => {
    mutate();
  };

  // Update document title and add structured data when paper loads
  useEffect(() => {
    if (data?.paper) {
      // Update document title
      const year = new Date(data.featuredDate).getFullYear();
      const title = year === new Date().getFullYear() 
        ? `Today's Featured Paper | Paper Birthdays`
        : `On this day in ${year} | Paper Birthdays`;
      document.title = title;

      // Add structured data
      const structuredData = generatePaperStructuredData(data.paper);
      
      // Remove existing structured data script if it exists
      const existingScript = document.querySelector('script[data-paper-structured-data]');
      if (existingScript) {
        existingScript.remove();
      }

      // Add new structured data script
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-paper-structured-data', 'true');
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);

      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        const newDescription = `${data.paper.title} - A historically significant paper published on this day in ${year}. ${data.paper.abstract.substring(0, 100)}...`;
        metaDescription.setAttribute('content', newDescription);
      }
    }
  }, [data]);

  // Cleanup structured data on unmount
  useEffect(() => {
    return () => {
      const script = document.querySelector('script[data-paper-structured-data]');
      if (script) {
        script.remove();
      }
    };
  }, []);

  return (
    <ContentWrapper maxWidth="lg" padding="lg">
      {/* Page Title */}
      <PageTitle 
        featuredDate={data?.featuredDate} 
        isLoading={isLoading} 
      />

      {/* Main Content */}
      <div className="flex flex-col items-center">
        {/* Loading State */}
        {isLoading && (
          <div className="w-full max-w-4xl">
            <SkeletonCard className="mx-auto" />
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <ErrorState error={error} onRetry={handleRetry} />
        )}

        {/* Empty State */}
        {!data && !error && !isLoading && (
          <EmptyState />
        )}

        {/* Featured Paper */}
        {data && !isLoading && (
          <div className="w-full">
            <PaperCard
              paper={data.paper}
              variant="featured"
              featuredDate={data.featuredDate}
              showShareButton={true}
              showExternalLinks={true}
              showAbstract={true}
              className="mx-auto"
            />
          </div>
        )}

        {/* Interactive Actions */}
        {data?.paper && <QuickActions paper={data.paper} />}
      </div>

      {/* Additional Information */}
      <div className="mt-16 text-center">
        <div className="max-w-3xl mx-auto">
          <Heading level={2} variant="lg" className="mb-6 text-slate-900">
            About Paper Birthdays
          </Heading>
          <div className="grid md:grid-cols-2 gap-8 text-left">
            <div>
              <Heading level={3} variant="lg" className="mb-3 text-slate-800">
                📊 Citation-Based Selection
              </Heading>
              <Text variant="body" className="text-slate-600">
                Papers are selected from the most cited research published on this day in previous years, 
                using data from Semantic Scholar to identify historically significant work.
              </Text>
            </div>
            <div>
              <Heading level={3} variant="lg" className="mb-3 text-slate-800">
                🎯 Daily Discovery
              </Heading>
              <Text variant="body" className="text-slate-600">
                Each day features a different paper from arXiv&apos;s vast collection, helping you discover 
                groundbreaking research that shaped various fields of study.
              </Text>
            </div>
          </div>
        </div>
      </div>
    </ContentWrapper>
  );
}
