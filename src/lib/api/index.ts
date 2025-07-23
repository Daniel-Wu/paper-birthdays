/**
 * API Integration Layer - Main Export File
 * Provides clean exports for all API-related functionality
 */

import type { ApiError, NetworkError, ValidationError, Paper } from './types';
import { isApiError, isNetworkError, isValidationError } from './types';
import { healthQuery } from './queries';
import { config } from './config';

// Configuration
export { config, API_ENDPOINTS, CACHE_KEYS } from './config';
export type { ApiConfig, CacheConfig } from './config';

// Types
export type {
  // Core data types
  Author,
  Paper,
  
  // API response types
  TodayPaperResponse,
  CategoryPaperResponse,
  FeaturedPaperEntry,
  PaginationMeta,
  HistoryResponse,
  HealthResponse,
  
  // Query parameter types
  HistoryQueryParams,
  
  // Error types
  ApiError,
  NetworkError,
  ValidationError,
  
  // Request/Response wrapper types
  ApiResponse,
  ApiRequest,
  
  // SWR-specific types
  SWRError,
  UseApiOptions,
  
  // Hook return types
  ApiHookResult,
  PaginatedHookResult,
  
  // Utility types
  PaperCategory,
  LoadingState,
  CacheEntry,
  
  // Constants
} from './types';

export {
  // Type guards
  isApiError,
  isNetworkError,
  isValidationError,
  
  // Validation functions
  validatePaper,
  validateTodayPaperResponse,
  validateHistoryResponse,
  
  // Constants
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  DEFAULT_ERROR_RETRY_COUNT,
  DEFAULT_ERROR_RETRY_INTERVAL,
} from './types';

// HTTP Client
export { apiClient, ApiClient, handleApiError, isRetryableError } from './client';

// Query functions
export {
  // Core queries
  healthQuery,
  todayPaperQuery,
  categoryPaperQuery,
  historyQuery,
  
  // Extended queries
  searchHistoryQuery,
  batchPaperQuery,
  categoriesQuery,
  
  // Query utilities
  QUERY_KEYS,
  isQueryError,
  getQueryErrorMessage,
} from './queries';

// React hooks
export {
  // Primary data hooks
  useTodayPaper,
  useCategoryPaper,
  useHistoryPapers,
  useInfiniteHistoryPapers,
  
  // Utility hooks
  useHealthCheck,
  useCategories,
  useOptimisticPaper,
  useFavoritePapers,
  useErrorHandler,
  useGlobalLoadingState,
} from './hooks';

// Re-export commonly used SWR functions for convenience
export { mutate } from 'swr';

// Utility functions for common operations
export const createApiError = (message: string, status: number, details?: Record<string, unknown>): ApiError => ({
  message,
  status,
  details,
});

export const createNetworkError = (message: string, originalError: Error): NetworkError => {
  const error = new Error(message) as NetworkError;
  error.isNetworkError = true;
  error.originalError = originalError;
  return error;
};

export const createValidationError = (message: string, field?: string, value?: unknown): ValidationError => {
  const error = new Error(message) as ValidationError;
  error.isValidationError = true;
  error.field = field;
  error.value = value;
  return error;
};

// Helper functions for working with paper data
export const getPaperUrl = (paper: Paper): string => paper.abstractUrl;
export const getPaperPdfUrl = (paper: Paper): string => paper.pdfUrl;
export const getPaperTitle = (paper: Paper): string => paper.title;
export const getPaperAuthors = (paper: Paper): string => 
  paper.authors.map(author => author.name).join(', ');
export const getPaperCategories = (paper: Paper): string[] => paper.categories;
export const getPrimaryCategory = (paper: Paper): string => paper.primaryCategory;
export const getCitationCount = (paper: Paper): number => paper.citationCount;
export const getSubmittedDate = (paper: Paper): Date => new Date(paper.submittedDate);

// Helper functions for formatting
export const formatCitationCount = (count: number): string => {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
};

export const formatSubmittedDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

export const formatCategory = (category: string): string => {
  // Convert arXiv category codes to readable names
  const categoryMap: Record<string, string> = {
    'cs.AI': 'Artificial Intelligence',
    'cs.LG': 'Machine Learning',
    'cs.CV': 'Computer Vision',
    'cs.CL': 'Computational Linguistics',
    'cs.CR': 'Cryptography',
    'cs.DB': 'Databases',
    'cs.DS': 'Data Structures',
    'cs.GT': 'Game Theory',
    'math.AG': 'Algebraic Geometry',
    'math.AT': 'Algebraic Topology',
    'math.CA': 'Classical Analysis',
    'math.CO': 'Combinatorics',
    'math.CT': 'Category Theory',
    'math.CV': 'Complex Variables',
    'math.DG': 'Differential Geometry',
    'physics.atom-ph': 'Atomic Physics',
    'physics.chem-ph': 'Chemical Physics',
    'physics.class-ph': 'Classical Physics',
    'physics.comp-ph': 'Computational Physics',
    'stat.AP': 'Applied Statistics',
    'stat.CO': 'Computational Statistics',
    'stat.ME': 'Methodology',
    'stat.ML': 'Machine Learning (Statistics)',
    'stat.TH': 'Statistics Theory',
  };
  
  return categoryMap[category] || category;
};

// Helper functions for error handling
export const getErrorMessage = (error: unknown): string => {
  if (isApiError(error)) {
    return error.message;
  }
  
  if (isNetworkError(error)) {
    return error.message;
  }
  
  if (isValidationError(error)) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred.';
};

export const isRetryableApiError = (error: unknown): boolean => {
  if (isApiError(error)) {
    const retryableStatuses = [408, 429, 500, 502, 503, 504];
    return retryableStatuses.includes(error.status);
  }
  
  return isNetworkError(error);
};

// Cache management utilities
export const clearApiCache = async (): Promise<void> => {
  const { mutate } = await import('swr');
  
  // Clear all cached data
  await mutate(() => true, undefined, { revalidate: false });
};

export const clearSpecificCache = async (key: string | string[]): Promise<void> => {
  const { mutate } = await import('swr');
  
  if (Array.isArray(key)) {
    await mutate(key, undefined, { revalidate: false });
  } else {
    await mutate(key, undefined, { revalidate: false });
  }
};

// API readiness check
export const checkApiReadiness = async (): Promise<boolean> => {
  try {
    const response = await healthQuery();
    return response.status === 'healthy';
  } catch {
    return false;
  }
};

// Development utilities
export const enableApiLogging = (): void => {
  if (config.isDevelopment()) {
    console.log('API logging is enabled in development mode');
  }
};

export const getApiInfo = () => ({
  baseUrl: config.api.baseUrl,
  timeout: config.api.timeout,
  retries: config.api.retries,
  environment: config.isDevelopment() ? 'development' : 'production',
  cacheConfig: config.cache,
});