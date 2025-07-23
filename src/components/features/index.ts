/**
 * Interactive Features for Paper Birthdays
 * 
 * This module provides a comprehensive set of interactive components
 * for enhancing the user experience of the Paper Birthdays application.
 */

// Main Components
export { CategorySelector } from './category-selector';
export { DatePicker } from './date-picker';
export { ShareModal } from './share-modal';
export { HistoryTimeline } from './history-timeline';
export { InfiniteScroll, withInfiniteScroll } from './infinite-scroll';
export { FilterControls } from './filter-controls';
export { 
  FavoriteButton, 
  FavoritesList, 
  FavoritesProvider, 
  useFavorites 
} from './favorites';
export { EnhancedSearch } from './enhanced-search';

// Types
export type {
  // Category Selector
  Category,
  CategorySelectorProps,
  
  // Date Picker
  DatePickerProps,
  QuickRange,
  
  // Share Modal
  ShareModalProps,
  ShareOption,
  
  // History Timeline
  HistoryTimelineProps,
  TimelineGroup,
  HoverPreview,
  FeaturedPaperEntry,
  
  // Infinite Scroll
  InfiniteScrollProps,
  VirtualItem,
  
  // Filter Controls
  FilterState,
  FilterControlsProps,
  RangeSliderProps,
  SortOption,
  
  // Favorites
  FavoritePaper,
  FavoritesContextType,
  FavoriteButtonProps,
  FavoritesListProps,
  
  // Enhanced Search
  SearchResult,
  SearchFilter,
  EnhancedSearchProps,
  SearchSuggestion,
  
  // Common Types
  InteractiveFeatureProps,
  AnimationConfig,
  KeyboardNavigationConfig,
  AccessibilityConfig,
  LocalStorageItem,
  StorageConfig,
  PerformanceMetrics,
  OptimizationOptions,
  FeatureError,
  ErrorBoundaryState,
  ThemeConfig,
  ResponsiveConfig,
  TouchGestureConfig,
  AnalyticsEvent,
  UserInteraction,
  ValidationRule,
  ValidationResult
} from './types';

// Constants
export {
  STORAGE_KEYS,
  FEATURE_LIMITS,
  ANIMATION_DURATIONS,
  DEBOUNCE_DELAYS
} from './types';

// Utility Functions
export const featureUtils = {
  /**
   * Format citation count for display
   */
  formatCitationCount: (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  },

  /**
   * Generate a unique ID for components
   */
  generateId: (prefix = 'feature'): string => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Debounce function calls
   */
  debounce: <T extends (...args: unknown[]) => unknown>(
    func: T,
    delay: number
  ): ((...args: Parameters<T>) => void) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  },

  /**
   * Throttle function calls
   */
  throttle: <T extends (...args: unknown[]) => unknown>(
    func: T,
    delay: number
  ): ((...args: Parameters<T>) => void) => {
    let lastCall = 0;
    return (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        func(...args);
      }
    };
  },

  /**
   * Safe localStorage operations
   */
  storage: {
    get: <T>(key: string, defaultValue?: T): T | null => {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue || null;
      } catch (error) {
        console.warn(`Failed to get ${key} from localStorage:`, error);
        return defaultValue || null;
      }
    },

    set: <T>(key: string, value: T): boolean => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (error) {
        console.warn(`Failed to set ${key} in localStorage:`, error);
        return false;
      }
    },

    remove: (key: string): boolean => {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (error) {
        console.warn(`Failed to remove ${key} from localStorage:`, error);
        return false;
      }
    },

    clear: (): boolean => {
      try {
        localStorage.clear();
        return true;
      } catch (error) {
        console.warn('Failed to clear localStorage:', error);
        return false;
      }
    }
  },

  /**
   * Accessibility helpers
   */
  a11y: {
    announceToScreenReader: (message: string): void => {
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = message;
      
      document.body.appendChild(announcement);
      setTimeout(() => document.body.removeChild(announcement), 1000);
    },

    trapFocus: (element: HTMLElement): (() => void) => {
      const focusableElements = element.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === lastElement) {
              firstElement.focus();
              e.preventDefault();
            }
          }
        }
      };

      element.addEventListener('keydown', handleTabKey);
      firstElement?.focus();

      return () => {
        element.removeEventListener('keydown', handleTabKey);
      };
    }
  },

  /**
   * Performance monitoring
   */
  performance: {
    measureRender: <T extends (...args: unknown[]) => unknown>(
      name: string,
      func: T
    ): T => {
      return ((...args: Parameters<T>) => {
        const start = performance.now();
        const result = func(...args);
        const end = performance.now();
        console.debug(`${name} render time:`, end - start, 'ms');
        return result;
      }) as T;
    },

    measureAsync: async <T>(
      name: string,
      asyncFunc: () => Promise<T>
    ): Promise<T> => {
      const start = performance.now();
      const result = await asyncFunc();
      const end = performance.now();
      console.debug(`${name} async time:`, end - start, 'ms');
      return result;
    }
  },

  /**
   * Mobile/touch detection
   */
  device: {
    isMobile: (): boolean => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    },

    isTouchDevice: (): boolean => {
      return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    },

    getScreenSize: (): 'sm' | 'md' | 'lg' | 'xl' => {
      const width = window.innerWidth;
      if (width < 640) return 'sm';
      if (width < 768) return 'md';
      if (width < 1024) return 'lg';
      return 'xl';
    }
  },

  /**
   * Animation utilities
   */
  animation: {
    fadeIn: (element: HTMLElement, duration = 300): Promise<void> => {
      return new Promise((resolve) => {
        element.style.opacity = '0';
        element.style.transition = `opacity ${duration}ms ease-in-out`;
        
        requestAnimationFrame(() => {
          element.style.opacity = '1';
          setTimeout(resolve, duration);
        });
      });
    },

    slideDown: (element: HTMLElement, duration = 300): Promise<void> => {
      return new Promise((resolve) => {
        const height = element.scrollHeight;
        element.style.height = '0';
        element.style.overflow = 'hidden';
        element.style.transition = `height ${duration}ms ease-in-out`;
        
        requestAnimationFrame(() => {
          element.style.height = `${height}px`;
          setTimeout(() => {
            element.style.height = 'auto';
            element.style.overflow = 'visible';
            resolve();
          }, duration);
        });
      });
    }
  }
};

// Feature Status
export const FEATURE_STATUS = {
  CATEGORY_SELECTOR: 'stable',
  DATE_PICKER: 'stable', 
  SHARE_MODAL: 'stable',
  HISTORY_TIMELINE: 'stable',
  INFINITE_SCROLL: 'stable',
  FILTER_CONTROLS: 'stable',
  FAVORITES: 'stable',
  ENHANCED_SEARCH: 'stable'
} as const;

// Version
export const FEATURES_VERSION = '1.0.0';