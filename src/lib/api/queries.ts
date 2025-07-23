/**
 * Query functions for each API endpoint
 * Provides strongly-typed query functions with data validation
 */

import { apiClient } from './client';
import { API_ENDPOINTS } from './config';
import {
  TodayPaperResponse,
  CategoryPaperResponse,
  HistoryResponse,
  HistoryQueryParams,
  HealthResponse,
  ApiResponse,
  Paper,
  validateTodayPaperResponse,
  validateHistoryResponse,
  ValidationError,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} from './types';

/**
 * Validates and sanitizes history query parameters
 */
const validateHistoryParams = (params?: HistoryQueryParams): HistoryQueryParams => {
  if (!params) return {};

  const validated: HistoryQueryParams = {};

  if (params.page !== undefined) {
    if (!Number.isInteger(params.page) || params.page < 1) {
      const error = new Error('Page must be a positive integer') as ValidationError;
      error.isValidationError = true;
      error.field = 'page';
      error.value = params.page;
      throw error;
    }
    validated.page = params.page;
  }

  if (params.limit !== undefined) {
    if (!Number.isInteger(params.limit) || params.limit < 1 || params.limit > MAX_PAGE_SIZE) {
      const error = new Error(`Limit must be between 1 and ${MAX_PAGE_SIZE}`) as ValidationError;
      error.isValidationError = true;
      error.field = 'limit';
      error.value = params.limit;
      throw error;
    }
    validated.limit = params.limit;
  }

  if (params.category !== undefined) {
    if (typeof params.category !== 'string' || params.category.trim().length === 0) {
      const error = new Error('Category must be a non-empty string') as ValidationError;
      error.isValidationError = true;
      error.field = 'category';
      error.value = params.category;
      throw error;
    }
    validated.category = params.category.trim();
  }

  return validated;
};

/**
 * Validates category parameter
 */
const validateCategory = (category: string): string => {
  if (typeof category !== 'string' || category.trim().length === 0) {
    const error = new Error('Category must be a non-empty string') as ValidationError;
    error.isValidationError = true;
    error.field = 'category';
    error.value = category;
    throw error;
  }
  return category.trim();
};

/**
 * Creates a validation error for API responses
 */
const createValidationError = (message: string, data: unknown): ValidationError => {
  const error = new Error(message) as ValidationError;
  error.isValidationError = true;
  error.value = data;
  return error;
};

/**
 * Health Check Query
 * Checks if the API is healthy and responsive
 */
export const healthQuery = async (): Promise<HealthResponse> => {
  try {
    const response: ApiResponse<HealthResponse> = await apiClient.get(API_ENDPOINTS.HEALTH);
    
    // Basic validation for health response
    if (!response.data || typeof response.data !== 'object') {
      throw createValidationError('Invalid health response format', response.data);
    }

    return response.data;
  } catch {
    // If health endpoint fails, return unhealthy status
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
    };
  }
};

/**
 * Today's Paper Query
 * Fetches today's featured paper across all categories
 */
export const todayPaperQuery = async (): Promise<TodayPaperResponse> => {
  const response: ApiResponse<TodayPaperResponse> = await apiClient.get(API_ENDPOINTS.TODAY_PAPER);

  if (!validateTodayPaperResponse(response.data)) {
    throw createValidationError('Invalid today paper response format', response.data);
  }

  return response.data;
};

/**
 * Category Paper Query
 * Fetches today's featured paper for a specific category
 */
export const categoryPaperQuery = async (category: string): Promise<CategoryPaperResponse> => {
  const validatedCategory = validateCategory(category);
  const endpoint = `${API_ENDPOINTS.CATEGORY_PAPER}/${encodeURIComponent(validatedCategory)}`;
  
  const response: ApiResponse<CategoryPaperResponse> = await apiClient.get(endpoint);

  // Validate response structure
  if (!response.data || typeof response.data !== 'object') {
    throw createValidationError('Invalid category paper response format', response.data);
  }

  const { paper, category: responseCategory, featuredDate } = response.data;

  if (!paper || !responseCategory || !featuredDate) {
    throw createValidationError('Missing required fields in category paper response', response.data);
  }

  // Additional validation could be added here to check paper structure
  
  return response.data;
};

/**
 * History Query
 * Fetches historical featured papers with pagination
 */
export const historyQuery = async (params?: HistoryQueryParams): Promise<HistoryResponse> => {
  const validatedParams = validateHistoryParams(params);
  
  // Set default values
  const queryParams = {
    page: validatedParams.page || 1,
    limit: validatedParams.limit || DEFAULT_PAGE_SIZE,
    ...(validatedParams.category && { category: validatedParams.category }),
  };

  const response: ApiResponse<HistoryResponse> = await apiClient.get(
    API_ENDPOINTS.HISTORY,
    queryParams
  );

  if (!validateHistoryResponse(response.data)) {
    throw createValidationError('Invalid history response format', response.data);
  }

  return response.data;
};

/**
 * Search Historical Papers
 * A convenience function for searching through historical papers
 */
export const searchHistoryQuery = async (
  searchTerm: string,
  params?: Omit<HistoryQueryParams, 'category'>
): Promise<HistoryResponse> => {
  // Note: This would need backend support for search functionality
  // For now, we'll use the regular history query
  // In a full implementation, this might be a separate endpoint like /api/paper/search
  
  if (!searchTerm || searchTerm.trim().length === 0) {
    const error = new Error('Search term must be provided') as ValidationError;
    error.isValidationError = true;
    error.field = 'searchTerm';
    error.value = searchTerm;
    throw error;
  }

  // This is a placeholder - the backend would need to implement search functionality
  return historyQuery(params);
};

/**
 * Batch Paper Query
 * Fetches multiple papers by their IDs (if backend supports it)
 */
export const batchPaperQuery = async (paperIds: string[]): Promise<{ papers: Paper[] }> => {
  if (!Array.isArray(paperIds) || paperIds.length === 0) {
    const error = new Error('Paper IDs array must not be empty') as ValidationError;
    error.isValidationError = true;
    error.field = 'paperIds';
    error.value = paperIds;
    throw error;
  }

  if (paperIds.length > 50) {
    const error = new Error('Cannot fetch more than 50 papers at once') as ValidationError;
    error.isValidationError = true;
    error.field = 'paperIds';
    error.value = paperIds;
    throw error;
  }

  // Validate all IDs are strings
  const invalidIds = paperIds.filter(id => typeof id !== 'string' || id.trim().length === 0);
  if (invalidIds.length > 0) {
    const error = new Error('All paper IDs must be non-empty strings') as ValidationError;
    error.isValidationError = true;
    error.field = 'paperIds';
    error.value = invalidIds;
    throw error;
  }

  // This would be implemented if the backend supports batch fetching
  // For now, throw an error to indicate it's not implemented
  throw new Error('Batch paper fetching is not yet implemented');
};

/**
 * Categories Query
 * Fetches available paper categories (if backend supports it)
 */
export const categoriesQuery = async (): Promise<{ categories: string[] }> => {
  // This would fetch available categories from the backend
  // For now, return a hardcoded list based on common arXiv categories
  
  const commonCategories = [
    'cs.AI', 'cs.LG', 'cs.CV', 'cs.CL', 'cs.CR', 'cs.DB', 'cs.DS', 'cs.GT',
    'math.AG', 'math.AT', 'math.CA', 'math.CO', 'math.CT', 'math.CV', 'math.DG',
    'physics.atom-ph', 'physics.chem-ph', 'physics.class-ph', 'physics.comp-ph',
    'stat.AP', 'stat.CO', 'stat.ME', 'stat.ML', 'stat.TH',
    'econ.EM', 'econ.GN', 'econ.TH',
    'q-bio.BM', 'q-bio.CB', 'q-bio.GN', 'q-bio.MN', 'q-bio.NC', 'q-bio.OT',
  ];

  return { categories: commonCategories };
};

// Export query key generators for use with SWR
export const QUERY_KEYS = {
  health: () => ['health'],
  todayPaper: () => ['today-paper'],
  categoryPaper: (category: string) => ['category-paper', category],
  history: (params?: HistoryQueryParams) => ['history', params],
  search: (searchTerm: string, params?: Omit<HistoryQueryParams, 'category'>) => 
    ['search', searchTerm, params],
  categories: () => ['categories'],
  batchPapers: (paperIds: string[]) => ['batch-papers', paperIds.sort()],
} as const;

// Export error handling utilities specific to queries
export const isQueryError = (error: unknown): error is Error => {
  return error instanceof Error;
};

export const getQueryErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred while fetching data.';
};