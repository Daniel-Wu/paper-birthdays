/**
 * History Page
 * Shows featured papers from previous days with infinite scroll
 * Includes category filtering and date-based organization
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { MainLayout, Breadcrumb } from '@/components/layout';
import { Card, Button, Icon, Skeleton } from '@/components/ui';
import { Typography } from '@/components/ui/typography-compat';
import { PaperCard } from '@/components/paper';
import { useInfiniteHistoryPapers } from '@/lib/api';
import type { FeaturedPaper } from '@/components/paper/types';
import { CollectionPageStructuredData, BreadcrumbStructuredData } from '@/components/seo';
import { 
  DatePicker, 
  FilterControls, 
  InfiniteScroll, 
  HistoryTimeline,
  FavoritesProvider,
  EnhancedSearch
} from '@/components/features';
import type { FilterState } from '@/components/features';

// Category options for filtering
const categoryOptions = [
  { value: '', label: 'All Categories' },
  { value: 'cs.AI', label: 'Artificial Intelligence' },
  { value: 'cs.LG', label: 'Machine Learning' },
  { value: 'cs.CV', label: 'Computer Vision' },
  { value: 'cs.CL', label: 'Computation and Language' },
  { value: 'cs.CR', label: 'Cryptography and Security' },
  { value: 'cs.DS', label: 'Data Structures and Algorithms' },
  { value: 'math.GT', label: 'Geometric Topology' },
  { value: 'math.NT', label: 'Number Theory' },
  { value: 'physics.gen-ph', label: 'General Physics' },
  { value: 'astro-ph', label: 'Astrophysics' },
  { value: 'q-bio.BM', label: 'Biomolecules' },
  { value: 'stat.ML', label: 'Machine Learning Statistics' },
];

interface EnhancedFilterBarProps {
  selectedCategory: string;
  selectedDate: string | null;
  onDateChange: (date: string) => void;
  viewMode: 'list' | 'timeline';
  onViewModeChange: (mode: 'list' | 'timeline') => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  totalPapers?: number;
  papers: FeaturedPaper[];
}

function EnhancedFilterBar({
  selectedDate,
  onDateChange,
  viewMode,
  onViewModeChange,
  filters,
  onFiltersChange,
  totalPapers, 
  papers
}: EnhancedFilterBarProps) {
  const availableDates = useMemo(() => {
    return papers.map(p => new Date(p.featuredDate));
  }, [papers]);

  return (
    <div className="space-y-6 mb-8">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <Typography variant="h2" className="text-xl font-semibold text-gray-900 mb-2">
              Paper History
            </Typography>
            <Typography variant="body2" className="text-gray-600">
              {totalPapers ? `${totalPapers.toLocaleString()} featured papers` : 'Browse papers from previous days'}
            </Typography>
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <Typography variant="body2" className="text-gray-700 font-medium">
              View:
            </Typography>
            <div className="flex rounded-lg border border-gray-300 bg-white">
              <Button
                variant={viewMode === 'list' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('list')}
                className="rounded-r-none border-r-0"
              >
                <Icon name="list" className="w-4 h-4 mr-1" />
                List
              </Button>
              <Button
                variant={viewMode === 'timeline' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('timeline')}
                className="rounded-l-none"
              >
                <Icon name="calendar" className="w-4 h-4 mr-1" />
                Timeline
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Search and Quick Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <EnhancedSearch
            papers={papers.map(p => p.paper)}
            placeholder="Search papers by title, author, or keywords..."
            maxResults={20}
            enableHighlighting={true}
          />
        </div>
        <div className="space-y-2">
          <Typography variant="body2" className="text-gray-700 font-medium">
            Quick filter by date:
          </Typography>
          <DatePicker
            selectedDate={selectedDate ? new Date(selectedDate) : undefined}
            onDateChange={(date) => onDateChange(date.toISOString().split('T')[0])}
            availableDates={availableDates}
            showQuickRanges={true}
            className="w-full"
          />
        </div>
      </div>

      {/* Advanced Filters */}
      <FilterControls
        filters={filters}
        onFiltersChange={onFiltersChange}
        availableCategories={categoryOptions.map(opt => ({
          id: opt.value,
          name: opt.label
        }))}
        citationStats={{
          min: 0,
          max: Math.max(...papers.map(p => p.paper.citationCount), 1000),
          median: papers.length > 0 ? papers[Math.floor(papers.length / 2)]?.paper.citationCount || 0 : 0
        }}
        compact={true}
        className="w-full"
      />
    </div>
  );
}

function DateGroupHeader({ date }: { date: string }) {
  const dateObj = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  let label: string;
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  if (dateObj.toDateString() === today.toDateString()) {
    label = `Today • ${formattedDate}`;
  } else if (dateObj.toDateString() === yesterday.toDateString()) {
    label = `Yesterday • ${formattedDate}`;
  } else {
    const daysDiff = Math.floor((today.getTime() - dateObj.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff <= 7) {
      label = `${daysDiff} days ago • ${formattedDate}`;
    } else if (daysDiff <= 30) {
      const weeksDiff = Math.floor(daysDiff / 7);
      label = `${weeksDiff} week${weeksDiff > 1 ? 's' : ''} ago • ${formattedDate}`;
    } else {
      label = formattedDate;
    }
  }
  
  return (
    <div className="flex items-center gap-4 mb-6 mt-8 first:mt-0">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
      <Typography variant="h3" className="text-lg font-semibold text-gray-900 px-4 bg-white">
        {label}
      </Typography>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-8">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="space-y-6">
          <Skeleton className="h-6 w-64 mx-auto" />
          <Card className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-20 w-full" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-20" />
              </div>
            </div>
          </Card>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ selectedCategory }: { selectedCategory: string }) {
  const categoryName = categoryOptions.find(opt => opt.value === selectedCategory)?.label || 'this category';
  
  return (
    <Card className="p-12 text-center bg-gradient-to-br from-gray-50 to-gray-100">
      <Icon name="search" className="w-16 h-16 text-gray-400 mx-auto mb-6" />
      <Typography variant="h2" className="text-2xl font-semibold text-gray-900 mb-4">
        No Papers Found
      </Typography>
      <Typography variant="body1" className="text-gray-600 mb-8 max-w-md mx-auto">
        {selectedCategory 
          ? `We couldn&apos;t find any featured papers in ${categoryName}. Try browsing all categories or explore specific category pages.`
          : "We couldn&apos;t find any featured papers in our history. This might be a temporary issue."
        }
      </Typography>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {selectedCategory && (
          <Button 
            onClick={() => window.location.reload()} 
            variant="primary"
          >
            <Icon name="refresh-cw" className="w-4 h-4 mr-2" />
            Show All Categories
          </Button>
        )}
        <Link href="/categories" className="inline-flex">
          <Button variant="outline">
            <Icon name="grid" className="w-4 h-4 mr-2" />
            Browse Categories
          </Button>
        </Link>
      </div>
    </Card>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <Card className="p-12 text-center bg-gradient-to-br from-red-50 to-pink-50 border-red-200">
      <Icon name="alert-circle" className="w-16 h-16 text-red-500 mx-auto mb-6" />
      <Typography variant="h2" className="text-2xl font-semibold text-gray-900 mb-4">
        Something went wrong
      </Typography>
      <Typography variant="body1" className="text-gray-600 mb-8 max-w-md mx-auto">
        We encountered an error while loading the paper history. Please try again.
      </Typography>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button onClick={onRetry} variant="primary">
          <Icon name="refresh-cw" className="w-4 h-4 mr-2" />
          Try Again
        </Button>
        <Link href="/" className="inline-flex">
          <Button variant="outline">
            <Icon name="home" className="w-4 h-4 mr-2" />
            Go Home
          </Button>
        </Link>
      </div>
    </Card>
  );
}

export default function HistoryPage() {
  const [selectedCategory] = useState('');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list');
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    citationRange: [0, 10000],
    dateRange: [null, null],
    sortBy: 'newest',
    searchQuery: ''
  });
  
  const queryParams = useMemo(() => ({
    ...(selectedCategory && { category: selectedCategory }),
    ...(selectedDate && { date: selectedDate }),
    limit: 12,
  }), [selectedCategory, selectedDate]);

  const {
    data,
    error,
    isLoading,
    isLoadingMore,
    loadMore,
    hasMore,
    mutate,
  } = useInfiniteHistoryPapers(queryParams);

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'History', href: '/history' },
  ];
  
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://paperbirthdays.com';
  const structuredDataBreadcrumbs = [
    { name: 'Home', url: siteUrl },
    { name: 'History', url: `${siteUrl}/history` },
  ];

  // Flatten and group papers by date
  const flattenedPapers = useMemo(() => {
    if (!data) return [];
    return data.flatMap(page => page.papers);
  }, [data]);

  const groupedPapers = useMemo(() => {
    const groups: Record<string, FeaturedPaper[]> = {};
    
    flattenedPapers.forEach(paper => {
      const date = paper.featuredDate;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(paper);
    });
    
    // Sort dates in descending order (most recent first)
    const sortedDates = Object.keys(groups).sort((a, b) => 
      new Date(b).getTime() - new Date(a).getTime()
    );
    
    return sortedDates.map(date => ({
      date,
      papers: groups[date],
    }));
  }, [flattenedPapers]);

  const totalPapers = useMemo(() => {
    return data?.[0]?.pagination?.total || 0;
  }, [data]);


  const handleRetry = useCallback(() => {
    mutate();
  }, [mutate]);

  const handleLoadMore = useCallback(async () => {
    if (hasMore && !isLoadingMore) {
      await loadMore();
    }
  }, [hasMore, isLoadingMore, loadMore]);


  return (
    <FavoritesProvider>
      <MainLayout>
      <CollectionPageStructuredData
        name="Paper History - Paper Birthdays"
        description="Browse through historically significant academic papers featured on previous days"
        url={`${siteUrl}/history`}
        numberOfItems={totalPapers}
        category={selectedCategory || undefined}
      />
      <BreadcrumbStructuredData items={structuredDataBreadcrumbs} />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumb items={breadcrumbItems} />
          
          <div className="mt-6">
            {/* Header */}
            <div className="mb-8">
              <Typography variant="h1" className="text-4xl font-bold text-gray-900 mb-4">
                Paper History
              </Typography>
              <Typography variant="body1" className="text-xl text-gray-600 max-w-3xl">
                Explore featured papers from previous days. Each paper was selected from the most cited
                research published on its respective date in history.
              </Typography>
            </div>

            {/* Enhanced Filter Bar */}
            <EnhancedFilterBar 
              selectedCategory={selectedCategory}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              filters={filters}
              onFiltersChange={setFilters}
              totalPapers={totalPapers}
              papers={flattenedPapers}
            />

            {/* Content */}
            {error ? (
              <ErrorState onRetry={handleRetry} />
            ) : isLoading ? (
              <LoadingState />
            ) : flattenedPapers.length === 0 ? (
              <EmptyState selectedCategory={selectedCategory} />
            ) : (
              <>
                {/* Timeline View */}
                {viewMode === 'timeline' && (
                  <div className="mb-8">
                    <HistoryTimeline
                      papers={flattenedPapers}
                      onDateSelect={(date) => setSelectedDate(date)}
                      selectedDate={selectedDate || undefined}
                      showZoomControls={true}
                      className="w-full"
                    />
                  </div>
                )}

                {/* List View with Infinite Scroll */}
                {viewMode === 'list' && (
                  <InfiniteScroll
                    items={groupedPapers}
                    renderItem={({ date, papers }) => (
                      <div key={date}>
                        <DateGroupHeader date={date} />
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {papers.map((featuredPaper, paperIndex) => (
                            <PaperCard
                              key={`${featuredPaper.paper.id}-${paperIndex}`}
                              paper={featuredPaper.paper}
                              variant="compact"
                              showShareButton={true}
                              showExternalLinks={true}
                              featuredDate={featuredPaper.featuredDate}
                              className="h-full"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    loadMore={handleLoadMore}
                    hasMore={hasMore}
                    isLoading={isLoading}
                    isLoadingMore={isLoadingMore}
                    enableVirtualScrolling={false}
                    fallbackToButton={true}
                    itemHeight={400}
                    containerHeight={800}
                    className="space-y-6"
                  />
                )}

                {/* Traditional Load More (fallback) */}
                {viewMode === 'list' && hasMore && (
                  <div className="text-center mt-12">
                    <Button
                      onClick={handleLoadMore}
                      disabled={isLoadingMore}
                      variant="outline"
                      size="lg"
                      className="min-w-48"
                    >
                      {isLoadingMore ? (
                        <>
                          <Icon name="loader" className="w-5 h-5 mr-2 animate-spin" />
                          Loading more...
                        </>
                      ) : (
                        <>
                          <Icon name="chevron-down" className="w-5 h-5 mr-2" />
                          Load More Papers
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {/* End State */}
                {!hasMore && flattenedPapers.length > 0 && (
                  <Card className="p-8 text-center mt-12 bg-gradient-to-r from-gray-50 to-gray-100">
                    <Icon name="check-circle" className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <Typography variant="h3" className="text-lg font-semibold text-gray-900 mb-2">
                      You&apos;ve reached the end!
                    </Typography>
                    <Typography variant="body2" className="text-gray-600 mb-6">
                      You&apos;ve viewed all available papers in our history.
                      {selectedCategory && " Try browsing a different category or view all categories."}
                    </Typography>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Link href="/categories" className="inline-flex">
                        <Button variant="primary">
                          <Icon name="grid" className="w-4 h-4 mr-2" />
                          Browse Categories
                        </Button>
                      </Link>
                      <Link href="/" className="inline-flex">
                        <Button variant="outline">
                          <Icon name="home" className="w-4 h-4 mr-2" />
                          Today&apos;s Featured
                        </Button>
                      </Link>
                    </div>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      </MainLayout>
    </FavoritesProvider>
  );
}

