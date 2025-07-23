/**
 * HTTP Client with error handling and retries
 * Provides a robust API client with automatic retries, error handling, and logging
 */

import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';
import { config } from './config';
import {
  ApiResponse,
  ApiRequest,
  ApiError,
  NetworkError,
  isApiError,
} from './types';

class ApiClient {
  private static instance: ApiClient;
  private axiosInstance: AxiosInstance;
  private requestId = 0;

  private constructor() {
    this.axiosInstance = axios.create({
      baseURL: config.api.baseUrl,
      timeout: config.api.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  private getRetryCount(): number {
    return config.api.retries;
  }

  private getRetryDelay(): number {
    return config.api.retryDelay;
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const requestId = ++this.requestId;
        const startTime = Date.now();
        
        // Store metadata in a way that doesn't conflict with axios types
        (config as InternalAxiosRequestConfig & { _metadata?: { requestId: number; startTime: number } })._metadata = { requestId, startTime };

        if (process.env.NODE_ENV === 'development') {
          console.log(`[API Request ${requestId}]`, {
            method: config.method?.toUpperCase(),
            url: config.url,
            params: config.params,
            data: config.data,
          });
        }

        return config;
      },
      (error) => {
        console.error('[API Request Error]', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        const metadata = (response.config as InternalAxiosRequestConfig & { _metadata?: { requestId: number; startTime: number } })._metadata;
        const { requestId, startTime } = metadata || {};
        const duration = Date.now() - (startTime || 0);

        if (process.env.NODE_ENV === 'development') {
          console.log(`[API Response ${requestId}]`, {
            status: response.status,
            duration: `${duration}ms`,
            url: response.config.url,
            dataSize: JSON.stringify(response.data).length,
          });
        }

        return response;
      },
      (error: AxiosError) => {
        const metadata = (error.config as InternalAxiosRequestConfig & { _metadata?: { requestId: number; startTime: number } })._metadata;
        const { requestId } = metadata || {};
        
        if (process.env.NODE_ENV === 'development') {
          console.error(`[API Error ${requestId}]`, {
            status: error.response?.status,
            message: error.message,
            url: error.config?.url,
            data: error.response?.data,
          });
        }

        return Promise.reject(this.transformError(error));
      }
    );
  }

  private transformError(error: AxiosError): ApiError | NetworkError {
    // Network errors (no response received)
    if (!error.response) {
      const networkError: NetworkError = new Error(
        error.code === 'ECONNABORTED' 
          ? 'Request timeout. Please check your connection and try again.'
          : 'Network error. Please check your connection and try again.'
      ) as NetworkError;
      networkError.isNetworkError = true;
      networkError.originalError = error;
      return networkError;
    }

    // HTTP errors (response received with error status)
    const apiError: ApiError = {
      message: this.getErrorMessage(error),
      status: error.response.status,
      code: error.code,
      details: error.response.data as Record<string, unknown>,
    };

    return apiError;
  }

  private getErrorMessage(error: AxiosError): string {
    if (error.response?.data) {
      const data = error.response.data as Record<string, unknown>;
      if (typeof data === 'string') return data;
      if (typeof data === 'object' && data !== null) {
        if ('message' in data && typeof data.message === 'string') return data.message;
        if ('error' in data && typeof data.error === 'string') return data.error;
        if ('detail' in data && typeof data.detail === 'string') return data.detail;
      }
    }

    switch (error.response?.status) {
      case 400:
        return 'Bad request. Please check your input and try again.';
      case 401:
        return 'Unauthorized. Please check your credentials.';
      case 403:
        return 'Forbidden. You do not have permission to access this resource.';
      case 404:
        return 'Resource not found. The requested item does not exist.';
      case 408:
        return 'Request timeout. Please try again.';
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      case 500:
        return 'Internal server error. Please try again later.';
      case 502:
        return 'Bad gateway. The server is temporarily unavailable.';
      case 503:
        return 'Service unavailable. Please try again later.';
      case 504:
        return 'Gateway timeout. Please try again later.';
      default:
        return error.message || 'An unexpected error occurred.';
    }
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private shouldRetry(error: ApiError | NetworkError, attempt: number): boolean {
    if (attempt >= this.getRetryCount()) return false;

    // Don't retry client errors (4xx) except for specific cases
    if (isApiError(error)) {
      const retryableStatuses = [408, 429, 500, 502, 503, 504];
      return retryableStatuses.includes(error.status);
    }

    // Always retry network errors
    return 'isNetworkError' in error && error.isNetworkError;
  }

  private calculateRetryDelay(attempt: number): number {
    // Exponential backoff with jitter
    const baseDelay = this.getRetryDelay();
    const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
    const jitter = Math.random() * 0.1 * exponentialDelay;
    return Math.min(exponentialDelay + jitter, 30000); // Cap at 30s
  }

  public async request<T = unknown>(
    request: ApiRequest
  ): Promise<ApiResponse<T>> {
    const axiosConfig: AxiosRequestConfig = {
      url: request.url,
      method: request.method,
      headers: request.headers,
      data: request.data,
      params: request.params,
      timeout: request.timeout || config.api.timeout,
    };

    let lastError: ApiError | NetworkError;
    let attempt = 0;

    while (attempt < this.getRetryCount() + 1) {
      try {
        const response = await this.axiosInstance.request<T>(axiosConfig);
        
        return {
          data: response.data,
          status: response.status,
          headers: response.headers as Record<string, string>,
        };
      } catch (error) {
        const transformedError = error as ApiError | NetworkError;
        lastError = transformedError;
        attempt++;

        if (!this.shouldRetry(transformedError, attempt)) {
          throw transformedError;
        }

        if (attempt <= this.getRetryCount()) {
          const delay = this.calculateRetryDelay(attempt);
          
          if (process.env.NODE_ENV === 'development') {
            console.log(`[API Retry ${attempt}/${this.getRetryCount()}]`, {
              url: request.url,
              delay: `${delay}ms`,
              error: transformedError.message,
            });
          }
          
          await this.sleep(delay);
        }
      }
    }

    throw lastError!;
  }

  // Convenience methods
  public async get<T = unknown>(
    url: string,
    params?: Record<string, unknown>,
    options?: Partial<ApiRequest>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      url,
      method: 'GET',
      params,
      ...options,
    });
  }

  public async post<T = unknown>(
    url: string,
    data?: unknown,
    options?: Partial<ApiRequest>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      url,
      method: 'POST',
      data,
      ...options,
    });
  }

  public async put<T = unknown>(
    url: string,
    data?: unknown,
    options?: Partial<ApiRequest>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      url,
      method: 'PUT',
      data,
      ...options,
    });
  }

  public async delete<T = unknown>(
    url: string,
    options?: Partial<ApiRequest>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      url,
      method: 'DELETE',
      ...options,
    });
  }

  // Health check method
  public async healthCheck(): Promise<boolean> {
    try {
      const response = await this.get('/health', undefined, { timeout: 5000 });
      return response.status === 200;
    } catch {
      return false;
    }
  }

  // Method to update base URL (useful for testing or environment changes)
  public updateBaseURL(baseURL: string): void {
    this.axiosInstance.defaults.baseURL = baseURL;
  }
}

// Export singleton instance
export const apiClient = ApiClient.getInstance();

// Export class for testing purposes
export { ApiClient };

// Export error handling utilities
export const handleApiError = (error: unknown): string => {
  if (isApiError(error)) {
    return error.message;
  }
  
  if (error instanceof Error) {
    if ('isNetworkError' in error) {
      return (error as NetworkError).message;
    }
    return error.message;
  }
  
  return 'An unexpected error occurred.';
};

export const isRetryableError = (error: unknown): boolean => {
  if (isApiError(error)) {
    const retryableStatuses = [408, 429, 500, 502, 503, 504];
    return retryableStatuses.includes(error.status);
  }
  
  return error instanceof Error && 'isNetworkError' in error;
};