'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface InfiniteScrollProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  loadMore: () => Promise<void>;
  hasMore: boolean;
  isLoading: boolean;
  isLoadingMore?: boolean;
  className?: string;
  itemHeight?: number;
  containerHeight?: number;
  overscan?: number;
  threshold?: number;
  enableVirtualScrolling?: boolean;
  fallbackToButton?: boolean;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  onScrollPositionChange?: (position: number) => void;
  error?: Error | null;
}

interface VirtualItem {
  index: number;
  start: number;
  end: number;
}

const DEFAULT_ITEM_HEIGHT = 200;
const DEFAULT_CONTAINER_HEIGHT = 600;
const DEFAULT_OVERSCAN = 5;
const DEFAULT_THRESHOLD = 0.8;

export function InfiniteScroll<T>({
  items,
  renderItem,
  loadMore,
  hasMore,
  isLoading,
  isLoadingMore = false,
  className,
  itemHeight = DEFAULT_ITEM_HEIGHT,
  containerHeight = DEFAULT_CONTAINER_HEIGHT,
  overscan = DEFAULT_OVERSCAN,
  threshold = DEFAULT_THRESHOLD,
  enableVirtualScrolling = true,
  fallbackToButton = true,
  loadingComponent,
  errorComponent,
  emptyComponent,
  onScrollPositionChange,
  error
}: InfiniteScrollProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const [isLoadingTriggered, setIsLoadingTriggered] = useState(false);
  const [shouldRestorePosition, setShouldRestorePosition] = useState(false);
  const [savedScrollPosition, setSavedScrollPosition] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  const intersectionObserverRef = useRef<IntersectionObserver | null>(null);

  // Calculate virtual items if virtual scrolling is enabled
  const virtualItems = useMemo(() => {
    if (!enableVirtualScrolling || items.length === 0) {
      return items.map((_, index) => ({
        index,
        start: index * itemHeight,
        end: (index + 1) * itemHeight
      }));
    }

    // const totalHeight = items.length * itemHeight; // Used for virtual scrolling calculation
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    const virtualItems: VirtualItem[] = [];
    for (let i = startIndex; i <= endIndex; i++) {
      virtualItems.push({
        index: i,
        start: i * itemHeight,
        end: (i + 1) * itemHeight
      });
    }

    return virtualItems;
  }, [items, scrollTop, itemHeight, containerHeight, overscan, enableVirtualScrolling]);

  // Handle scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const newScrollTop = target.scrollTop;
    setScrollTop(newScrollTop);
    onScrollPositionChange?.(newScrollTop);

    // Check if we need to load more items
    const scrollPercentage = (newScrollTop + target.clientHeight) / target.scrollHeight;
    if (scrollPercentage >= threshold && hasMore && !isLoading && !isLoadingTriggered) {
      setIsLoadingTriggered(true);
      loadMore().finally(() => {
        setIsLoadingTriggered(false);
      });
    }
  }, [hasMore, isLoading, isLoadingTriggered, loadMore, threshold, onScrollPositionChange]);

  // Load more with button
  const handleLoadMore = useCallback(async () => {
    if (hasMore && !isLoading) {
      setSavedScrollPosition(containerRef.current?.scrollTop || 0);
      setShouldRestorePosition(true);
      await loadMore();
    }
  }, [hasMore, isLoading, loadMore]);

  // Restore scroll position after loading
  useEffect(() => {
    if (shouldRestorePosition && containerRef.current) {
      containerRef.current.scrollTop = savedScrollPosition;
      setShouldRestorePosition(false);
    }
  }, [shouldRestorePosition, savedScrollPosition, items.length]);

  // Set up intersection observer for loading trigger
  useEffect(() => {
    if (!fallbackToButton && loadingRef.current) {
      intersectionObserverRef.current = new IntersectionObserver(
        (entries) => {
          const [entry] = entries;
          if (entry.isIntersecting && hasMore && !isLoading && !isLoadingTriggered) {
            setIsLoadingTriggered(true);
            loadMore().finally(() => {
              setIsLoadingTriggered(false);
            });
          }
        },
        { threshold: 0.1 }
      );

      intersectionObserverRef.current.observe(loadingRef.current);
    }

    return () => {
      if (intersectionObserverRef.current) {
        intersectionObserverRef.current.disconnect();
      }
    };
  }, [hasMore, isLoading, isLoadingTriggered, loadMore, fallbackToButton]);

  // Error state
  if (error && errorComponent) {
    return <div className={className}>{errorComponent}</div>;
  }

  if (error) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-8', className)}>
        <Icon name="alert-circle" className="h-8 w-8 text-red-500 mb-2" />
        <p className="text-red-600 font-medium mb-2">Failed to load items</p>
        <p className="text-sm text-gray-600 mb-4">{error.message}</p>
        <Button variant="outline" onClick={() => loadMore()}>
          <Icon name="refresh-cw" className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  // Empty state
  if (items.length === 0 && !isLoading) {
    if (emptyComponent) {
      return <div className={className}>{emptyComponent}</div>;
    }
    
    return (
      <div className={cn('flex flex-col items-center justify-center py-12', className)}>
        <Icon name="inbox" className="h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-600 font-medium mb-2">No items found</p>
        <p className="text-sm text-gray-500">There are no items to display at the moment.</p>
      </div>
    );
  }

  // Loading state
  if (isLoading && items.length === 0) {
    if (loadingComponent) {
      return <div className={className}>{loadingComponent}</div>;
    }

    return (
      <div className={cn('space-y-4', className)}>
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-48 w-full" />
        ))}
      </div>
    );
  }

  const totalHeight = items.length * itemHeight;

  return (
    <div className={cn('relative', className)}>
      <div
        ref={containerRef}
        className="overflow-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
        style={{ height: enableVirtualScrolling ? containerHeight : 'auto' }}
        onScroll={handleScroll}
      >
        {enableVirtualScrolling ? (
          // Virtual scrolling mode
          <div style={{ height: totalHeight, position: 'relative' }}>
            {virtualItems.map((virtualItem) => (
              <div
                key={virtualItem.index}
                style={{
                  position: 'absolute',
                  top: virtualItem.start,
                  height: itemHeight,
                  width: '100%'
                }}
              >
                {renderItem(items[virtualItem.index], virtualItem.index)}
              </div>
            ))}
          </div>
        ) : (
          // Regular scrolling mode
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index}>
                {renderItem(item, index)}
              </div>
            ))}
          </div>
        )}

        {/* Loading indicator */}
        {(isLoadingMore || isLoadingTriggered) && (
          <div className="flex items-center justify-center py-6">
            <div className="flex items-center gap-2 text-gray-600">
              <Icon name="loader" className="h-4 w-4 animate-spin" />
              <span className="text-sm">Loading more items...</span>
            </div>
          </div>
        )}

        {/* Intersection observer target */}
        {!fallbackToButton && hasMore && (
          <div ref={loadingRef} className="h-4" />
        )}
      </div>

      {/* Load more button */}
      {fallbackToButton && hasMore && !isLoading && (
        <div className="flex justify-center pt-6">
          <Button
            onClick={handleLoadMore}
            variant="outline"
            disabled={isLoadingMore || isLoadingTriggered}
            className="flex items-center gap-2"
          >
            {isLoadingMore || isLoadingTriggered ? (
              <>
                <Icon name="loader" className="h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Icon name="chevron-down" className="h-4 w-4" />
                Load More
              </>
            )}
          </Button>
        </div>
      )}

      {/* Scroll to top button */}
      {scrollTop > containerHeight && (
        <Button
          variant="secondary"
          size="sm"
          className="fixed bottom-6 right-6 rounded-full w-12 h-12 p-0 shadow-lg z-40"
          onClick={() => {
            containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          aria-label="Scroll to top"
        >
          <Icon name="arrow-up" className="h-4 w-4" />
        </Button>
      )}

      {/* Scroll indicator */}
      {enableVirtualScrolling && items.length > 0 && (
        <div className="absolute top-0 right-0 w-1 bg-gray-200 h-full">
          <div
            className="bg-blue-500 w-full transition-all duration-150"
            style={{
              height: `${Math.min(100, (containerHeight / totalHeight) * 100)}%`,
              transform: `translateY(${(scrollTop / (totalHeight - containerHeight)) * (containerHeight - (containerHeight / totalHeight) * containerHeight)}px)`
            }}
          />
        </div>
      )}

      {/* Performance stats (debug mode) */}
      {process.env.NODE_ENV === 'development' && enableVirtualScrolling && (
        <div className="absolute bottom-2 left-2 bg-black/75 text-white text-xs p-2 rounded font-mono">
          <div>Items: {items.length}</div>
          <div>Rendered: {virtualItems.length}</div>
          <div>Scroll: {Math.round(scrollTop)}px</div>
          <div>Height: {totalHeight}px</div>
        </div>
      )}
    </div>
  );
}

// Higher-order component for easier usage
export function withInfiniteScroll<T>(
  WrappedComponent: React.ComponentType<{ item: T; index: number }>,
  options: Partial<InfiniteScrollProps<T>> = {}
) {
  return function InfiniteScrollWrapper(props: InfiniteScrollProps<T>) {
    const renderItem = (item: T, index: number) => (
      <WrappedComponent item={item} index={index} />
    );

    return (
      <InfiniteScroll
        {...options}
        {...props}
        renderItem={renderItem}
      />
    );
  };
}

export default InfiniteScroll;