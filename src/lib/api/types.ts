/**
 * TypeScript interfaces for all API types
 * Matches the backend API specification
 */

// Core data types from backend
export interface Author {
  name: string;
}

export interface Paper {
  id: string;
  arxivId: string;
  title: string;
  abstract: string;
  authors: Author[];
  categories: string[];
  primaryCategory: string;
  submittedDate: string;
  citationCount: number;
  pdfUrl: string;
  abstractUrl: string;
}

// API Response types
export interface TodayPaperResponse {
  paper: Paper;
  featuredDate: string;
}

export interface CategoryPaperResponse {
  paper: Paper;
  category: string;
  featuredDate: string;
}

export interface FeaturedPaperEntry {
  paper: Paper;
  featuredDate: string;
  category?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  hasNext: boolean;
}

export interface HistoryResponse {
  papers: FeaturedPaperEntry[];
  pagination: PaginationMeta;
}

export interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  services?: {
    database?: 'up' | 'down';
    arxiv?: 'up' | 'down';
    semanticScholar?: 'up' | 'down';
  };
}

// Query parameter types
export interface HistoryQueryParams {
  page?: number;
  limit?: number;
  category?: string;
}

// Error types
export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: Record<string, unknown>;
}

export interface NetworkError extends Error {
  isNetworkError: true;
  originalError: Error;
}

export interface ValidationError extends Error {
  isValidationError: true;
  field?: string;
  value?: unknown;
}

// Request/Response wrapper types
export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  headers: Record<string, string>;
}

export interface ApiRequest {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  data?: unknown;
  params?: Record<string, unknown>;
  timeout?: number;
}

// SWR-specific types
export interface SWRError extends Error {
  status?: number;
  info?: unknown;
}

export interface UseApiOptions {
  revalidateOnFocus?: boolean;
  revalidateOnReconnect?: boolean;
  refreshInterval?: number;
  errorRetryCount?: number;
  errorRetryInterval?: number;
  dedupingInterval?: number;
}

// Hook return types
export interface ApiHookResult<T> {
  data: T | undefined;
  error: SWRError | undefined;
  isLoading: boolean;
  isValidating: boolean;
  mutate: () => Promise<T | undefined>;
}

export interface PaginatedHookResult<T> extends ApiHookResult<T> {
  loadMore: () => void;
  hasMore: boolean;
  isLoadingMore: boolean;
}

// Utility types
export type PaperCategory = string; // e.g., 'cs.AI', 'math.GT', etc.

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

// Type guards
export const isApiError = (error: unknown): error is ApiError => {
  return Boolean(error && typeof error === 'object' && error !== null && 'message' in error && 'status' in error);
};

export const isNetworkError = (error: unknown): error is NetworkError => {
  return Boolean(error && typeof error === 'object' && error !== null && 'isNetworkError' in error && (error as NetworkError).isNetworkError === true);
};

export const isValidationError = (error: unknown): error is ValidationError => {
  return Boolean(error && typeof error === 'object' && error !== null && 'isValidationError' in error && (error as ValidationError).isValidationError === true);
};

// Constants
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const DEFAULT_ERROR_RETRY_COUNT = 3;
export const DEFAULT_ERROR_RETRY_INTERVAL = 1000;

// Validation schemas (basic runtime validation)
export const validatePaper = (paper: unknown): paper is Paper => {
  if (!paper || typeof paper !== 'object' || paper === null) {
    return false;
  }
  
  const p = paper as Record<string, unknown>;
  return Boolean(
    typeof p.id === 'string' &&
    typeof p.arxivId === 'string' &&
    typeof p.title === 'string' &&
    typeof p.abstract === 'string' &&
    Array.isArray(p.authors) &&
    Array.isArray(p.categories) &&
    typeof p.primaryCategory === 'string' &&
    typeof p.submittedDate === 'string' &&
    typeof p.citationCount === 'number' &&
    typeof p.pdfUrl === 'string' &&
    typeof p.abstractUrl === 'string'
  );
};

export const validateTodayPaperResponse = (response: unknown): response is TodayPaperResponse => {
  if (!response || typeof response !== 'object' || response === null) {
    return false;
  }
  
  const r = response as Record<string, unknown>;
  return Boolean(
    validatePaper(r.paper) &&
    typeof r.featuredDate === 'string'
  );
};

export const validateHistoryResponse = (response: unknown): response is HistoryResponse => {
  if (!response || typeof response !== 'object' || response === null) {
    return false;
  }
  
  const r = response as Record<string, unknown>;
  
  if (!('papers' in r) || !Array.isArray(r.papers)) {
    return false;
  }
  
  const papersValid = r.papers.every((entry: unknown) => {
    if (!entry || typeof entry !== 'object' || entry === null) {
      return false;
    }
    const e = entry as Record<string, unknown>;
    return validatePaper(e.paper) && typeof e.featuredDate === 'string';
  });
  
  if (!papersValid || !('pagination' in r) || !r.pagination || typeof r.pagination !== 'object') {
    return false;
  }
  
  const p = r.pagination as Record<string, unknown>;
  return Boolean(
    typeof p.page === 'number' &&
    typeof p.limit === 'number' &&
    typeof p.total === 'number' &&
    typeof p.hasNext === 'boolean'
  );
};