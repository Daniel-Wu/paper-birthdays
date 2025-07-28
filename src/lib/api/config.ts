/**
 * API Configuration
 * Manages environment variables and API endpoints
 */

interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  retryDelay: number;
  enableLogging: boolean;
}

interface CacheConfig {
  todayPaperTTL: number;
  categoryPaperTTL: number;
  historyTTL: number;
  enableBackgroundRefresh: boolean;
}

class Config {
  private static instance: Config;
  public readonly api: ApiConfig;
  public readonly cache: CacheConfig;

  private constructor() {
    this.api = {
      baseUrl: this.getApiBaseUrl(),
      timeout: parseInt(this.getEnvVar('API_TIMEOUT', '10000')),
      retries: parseInt(this.getEnvVar('API_RETRIES', '3')),
      retryDelay: parseInt(this.getEnvVar('API_RETRY_DELAY', '1000')),
      enableLogging: this.getEnvVar('NODE_ENV', 'development') === 'development',
    };

    this.cache = {
      todayPaperTTL: 60 * 60 * 1000, // 1 hour
      categoryPaperTTL: 60 * 60 * 1000, // 1 hour
      historyTTL: 24 * 60 * 60 * 1000, // 24 hours
      enableBackgroundRefresh: true,
    };
  }

  public static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config();
    }
    return Config.instance;
  }

  private getEnvVar(key: string, defaultValue: string): string {
    // Next.js environment variables
    if (typeof window === 'undefined') {
      // Server-side
      return process.env[key] || defaultValue;
    } else {
      // Client-side - only public variables
      return process.env[`NEXT_PUBLIC_${key}`] || defaultValue;
    }
  }

  private getApiBaseUrl(): string {
    // Handle both NEXT_PUBLIC_API_URL and NEXT_PUBLIC_API_BASE_URL for compatibility
    if (typeof window === 'undefined') {
      // Server-side
      return process.env.NEXT_PUBLIC_API_URL || process.env.API_BASE_URL || 'http://localhost:8000';
    } else {
      // Client-side
      return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    }
  }

  public getApiUrl(endpoint: string): string {
    const baseUrl = this.getApiBaseUrl().replace(/\/$/, '');
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${baseUrl}${cleanEndpoint}`;
  }

  public isDevelopment(): boolean {
    return this.getEnvVar('NODE_ENV', 'development') === 'development';
  }

  public isProduction(): boolean {
    return this.getEnvVar('NODE_ENV', 'development') === 'production';
  }
}

// Export singleton instance
export const config = Config.getInstance();

// Export types for use in other files
export type { ApiConfig, CacheConfig };

// Export constants for commonly used endpoints
export const API_ENDPOINTS = {
  HEALTH: '/health',
  TODAY_PAPER: '/api/paper/today',
  CATEGORY_PAPER: '/api/paper/category',
  HISTORY: '/api/paper/history',
} as const;

// Export cache keys for SWR
export const CACHE_KEYS = {
  TODAY_PAPER: 'today-paper',
  CATEGORY_PAPER: (category: string) => `category-paper-${category}`,
  HISTORY: (page: number, limit: number, category?: string) => 
    `history-${page}-${limit}${category ? `-${category}` : ''}`,
  HEALTH: 'health',
} as const;
