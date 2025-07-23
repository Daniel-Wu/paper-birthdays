/**
 * React hooks for data fetching using SWR
 * Provides type-safe hooks with caching, error handling, and loading states
 */

'use client';

import useSWR, { SWRConfiguration, SWRResponse } from 'swr';
import useSWRInfinite, { SWRInfiniteConfiguration } from 'swr/infinite';
import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  todayPaperQuery,
  categoryPaperQuery,
  historyQuery,
  healthQuery,
  categoriesQuery,
  QUERY_KEYS,
} from './queries';
import { config } from './config';
import {
  TodayPaperResponse,
  CategoryPaperResponse,
  HistoryResponse,
  HistoryQueryParams,
  HealthResponse,
  ApiHookResult,
  PaginatedHookResult,
  SWRError,
  UseApiOptions,
  DEFAULT_PAGE_SIZE,
} from './types';

// Default SWR configuration
const defaultSWRConfig: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  errorRetryCount: 3,
  errorRetryInterval: 1000,
  dedupingInterval: 5000,
};

// Cache configurations for different data types
const getCacheConfig = (type: 'today' | 'category' | 'history' | 'health'): SWRConfiguration => {
  const baseConfig = { ...defaultSWRConfig };
  
  switch (type) {
    case 'today':
      return {
        ...baseConfig,
        refreshInterval: config.cache.todayPaperTTL,
        revalidateOnFocus: true,
      };
    case 'category':
      return {
        ...baseConfig,
        refreshInterval: config.cache.categoryPaperTTL,
        revalidateOnFocus: true,
      };
    case 'history':
      return {
        ...baseConfig,
        refreshInterval: config.cache.historyTTL,
        revalidateOnFocus: false,
      };
    case 'health':
      return {
        ...baseConfig,
        refreshInterval: 30000, // 30 seconds
        revalidateOnFocus: false,
        errorRetryCount: 1,
      };
    default:
      return baseConfig;
  }
};

/**
 * Custom hook for today's featured paper
 */
export const useTodayPaper = (options?: UseApiOptions): ApiHookResult<TodayPaperResponse> => {
  const swrConfig = useMemo(
    () => ({
      ...getCacheConfig('today'),
      ...options,
    }),
    [options]
  );

  const {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  }: SWRResponse<TodayPaperResponse, SWRError> = useSWR(
    QUERY_KEYS.todayPaper(),
    () => todayPaperQuery(),
    swrConfig
  );

  return {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  };
};

/**
 * Custom hook for category-specific paper
 */
export const useCategoryPaper = (
  category: string,
  options?: UseApiOptions
): ApiHookResult<CategoryPaperResponse> => {
  const swrConfig = useMemo(
    () => ({
      ...getCacheConfig('category'),
      ...options,
    }),
    [options]
  );

  const {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  }: SWRResponse<CategoryPaperResponse, SWRError> = useSWR(
    category ? QUERY_KEYS.categoryPaper(category) : null,
    () => categoryPaperQuery(category),
    swrConfig
  );

  return {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  };
};

/**
 * Custom hook for historical papers with pagination
 */
export const useHistoryPapers = (
  params?: HistoryQueryParams,
  options?: UseApiOptions
): ApiHookResult<HistoryResponse> => {
  const swrConfig = useMemo(
    () => ({
      ...getCacheConfig('history'),
      ...options,
    }),
    [options]
  );

  const {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  }: SWRResponse<HistoryResponse, SWRError> = useSWR(
    QUERY_KEYS.history(params),
    () => historyQuery(params),
    swrConfig
  );

  return {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  };
};

/**
 * Custom hook for infinite loading of historical papers
 */
export const useInfiniteHistoryPapers = (
  baseParams?: Omit<HistoryQueryParams, 'page'>,
  options?: UseApiOptions & SWRInfiniteConfiguration
): PaginatedHookResult<HistoryResponse[]> => {
  const swrConfig = useMemo(
    () => ({
      ...getCacheConfig('history'),
      ...options,
    }),
    [options]
  );

  const getKey = useCallback(
    (pageIndex: number, previousPageData: HistoryResponse | null) => {
      // If we've reached the end, return null to stop fetching
      if (previousPageData && !previousPageData.pagination.hasNext) return null;
      
      const page = pageIndex + 1;
      const params: HistoryQueryParams = {
        ...baseParams,
        page,
        limit: baseParams?.limit || DEFAULT_PAGE_SIZE,
      };
      
      return QUERY_KEYS.history(params);
    },
    [baseParams]
  );

  const {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
    size,
    setSize,
  } = useSWRInfinite(
    getKey,
    (key) => {
      const params = key[1] as HistoryQueryParams;
      return historyQuery(params);
    },
    swrConfig
  );

  const loadMore = useCallback(() => {
    setSize(size + 1);
  }, [size, setSize]);

  const hasMore = useMemo(() => {
    if (!data || data.length === 0) return false;
    const lastPage = data[data.length - 1];
    return lastPage?.pagination?.hasNext ?? false;
  }, [data]);

  const isLoadingMore = useMemo(() => {
    return data && typeof data[size - 1] === 'undefined';
  }, [data, size]);

  return {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
    loadMore,
    hasMore,
    isLoadingMore: Boolean(isLoadingMore),
  };
};

/**
 * Custom hook for API health status
 */
export const useHealthCheck = (options?: UseApiOptions): ApiHookResult<HealthResponse> => {
  const swrConfig = useMemo(
    () => ({
      ...getCacheConfig('health'),
      ...options,
    }),
    [options]
  );

  const {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  }: SWRResponse<HealthResponse, SWRError> = useSWR(
    QUERY_KEYS.health(),
    () => healthQuery(),
    swrConfig
  );

  return {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  };
};

/**
 * Custom hook for available categories
 */
export const useCategories = (options?: UseApiOptions): ApiHookResult<{ categories: string[] }> => {
  const swrConfig = useMemo(
    () => ({
      ...defaultSWRConfig,
      refreshInterval: 24 * 60 * 60 * 1000, // 24 hours - categories don't change often
      revalidateOnFocus: false,
      ...options,
    }),
    [options]
  );

  const {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  }: SWRResponse<{ categories: string[] }, SWRError> = useSWR(
    QUERY_KEYS.categories(),
    () => categoriesQuery(),
    swrConfig
  );

  return {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  };
};

/**
 * Custom hook for client-side data management and optimistic updates
 */
export const useOptimisticPaper = () => {
  const [optimisticData, setOptimisticData] = useState<TodayPaperResponse | null>(null);
  const [isOptimistic, setIsOptimistic] = useState(false);

  const setOptimistic = useCallback((data: TodayPaperResponse) => {
    setOptimisticData(data);
    setIsOptimistic(true);
  }, []);

  const clearOptimistic = useCallback(() => {
    setOptimisticData(null);
    setIsOptimistic(false);
  }, []);

  return {
    optimisticData,
    isOptimistic,
    setOptimistic,
    clearOptimistic,
  };
};

/**
 * Custom hook for managing favorite papers (client-side only)
 */
export const useFavoritePapers = () => {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const addFavorite = useCallback((paperId: string) => {
    setFavorites(prev => new Set([...prev, paperId]));
    
    // Persist to localStorage
    if (typeof window !== 'undefined') {
      const favArray = Array.from(favorites);
      favArray.push(paperId);
      localStorage.setItem('favorite-papers', JSON.stringify(favArray));
    }
  }, [favorites]);

  const removeFavorite = useCallback((paperId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      newFavorites.delete(paperId);
      return newFavorites;
    });

    // Update localStorage
    if (typeof window !== 'undefined') {
      const favArray = Array.from(favorites);
      const filtered = favArray.filter(id => id !== paperId);
      localStorage.setItem('favorite-papers', JSON.stringify(filtered));
    }
  }, [favorites]);

  const isFavorite = useCallback((paperId: string) => {
    return favorites.has(paperId);
  }, [favorites]);

  const toggleFavorite = useCallback((paperId: string) => {
    if (isFavorite(paperId)) {
      removeFavorite(paperId);
    } else {
      addFavorite(paperId);
    }
  }, [isFavorite, addFavorite, removeFavorite]);

  // Load favorites from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('favorite-papers');
        if (stored) {
          const favArray = JSON.parse(stored) as string[];
          setFavorites(new Set(favArray));
        }
      } catch (error) {
        console.warn('Failed to load favorites from localStorage:', error);
      }
    }
  }, []);

  return {
    favorites: Array.from(favorites),
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite,
    count: favorites.size,
  };
};

/**
 * Custom hook for error handling and retry logic
 */
export const useErrorHandler = () => {
  const [retryCount, setRetryCount] = useState(0);
  const [lastError, setLastError] = useState<SWRError | null>(null);

  const handleError = useCallback((error: SWRError) => {
    setLastError(error);
    console.error('API Error:', error);
  }, []);

  const retry = useCallback(() => {
    setRetryCount(prev => prev + 1);
  }, []);

  const clearError = useCallback(() => {
    setLastError(null);
    setRetryCount(0);
  }, []);

  const canRetry = retryCount < 3;

  return {
    lastError,
    retryCount,
    canRetry,
    handleError,
    retry,
    clearError,
  };
};

/**
 * Hook for managing API loading states across multiple requests
 */
export const useGlobalLoadingState = () => {
  const [loadingOperations, setLoadingOperations] = useState<Set<string>>(new Set());

  const startLoading = useCallback((operationId: string) => {
    setLoadingOperations(prev => new Set([...prev, operationId]));
  }, []);

  const stopLoading = useCallback((operationId: string) => {
    setLoadingOperations(prev => {
      const newSet = new Set(prev);
      newSet.delete(operationId);
      return newSet;
    });
  }, []);

  const isLoading = loadingOperations.size > 0;
  const loadingCount = loadingOperations.size;

  return {
    isLoading,
    loadingCount,
    activeOperations: Array.from(loadingOperations),
    startLoading,
    stopLoading,
  };
};