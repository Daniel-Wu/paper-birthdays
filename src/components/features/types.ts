/**
 * TypeScript interfaces for interactive features
 */

import type { Paper } from '@/lib/api/types';

// Category Selector Types
export interface Category {
  id: string;
  name: string;
  description?: string;
  parentCategory?: string;
  subcategories?: Category[];
  paperCount?: number;
}

export interface CategorySelectorProps {
  categories: Category[];
  selectedCategory?: string;
  onCategoryChange: (category: string | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  showSearch?: boolean;
  showCounts?: boolean;
  maxRecent?: number;
}

// Date Picker Types
export interface DatePickerProps {
  selectedDate?: Date;
  onDateChange: (date: Date) => void;
  availableDates?: Date[];
  minDate?: Date;
  maxDate?: Date;
  className?: string;
  disabled?: boolean;
  showQuickRanges?: boolean;
}

export interface QuickRange {
  label: string;
  getValue: () => Date;
}

// Share Modal Types
export interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  paper: Paper;
  currentUrl?: string;
  className?: string;
}

export interface ShareOption {
  name: string;
  icon: string;
  color: string;
  getUrl: (url: string, title: string, description: string) => string;
  ariaLabel: string;
}

// History Timeline Types
export interface HistoryTimelineProps {
  papers: FeaturedPaperEntry[];
  onDateSelect?: (date: string) => void;
  onPaperClick?: (paper: Paper) => void;
  selectedDate?: string;
  className?: string;
  showZoomControls?: boolean;
  groupBy?: 'day' | 'week' | 'month';
}

export interface TimelineGroup {
  date: string;
  displayDate: string;
  papers: FeaturedPaperEntry[];
  position: number;
}

export interface HoverPreview {
  paper: Paper;
  position: { x: number; y: number };
  visible: boolean;
}

export interface FeaturedPaperEntry {
  paper: Paper;
  featuredDate: string;
  category?: string;
}

// Infinite Scroll Types
export interface InfiniteScrollProps<T> {
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

export interface VirtualItem {
  index: number;
  start: number;
  end: number;
}

// Filter Controls Types
export interface FilterState {
  categories: string[];
  citationRange: [number, number];
  dateRange: [Date | null, Date | null];
  sortBy: 'newest' | 'oldest' | 'most-cited' | 'least-cited' | 'relevance';
  searchQuery: string;
}

export interface FilterControlsProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  availableCategories?: Category[];
  citationStats?: {
    min: number;
    max: number;
    median: number;
  };
  className?: string;
  compact?: boolean;
  showSearch?: boolean;
  showDateRange?: boolean;
  showCitationRange?: boolean;
  showCategories?: boolean;
  showSort?: boolean;
}

export interface RangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  step?: number;
  formatValue?: (value: number) => string;
  label?: string;
  className?: string;
}

export interface SortOption {
  value: FilterState['sortBy'];
  label: string;
  icon: string;
}

// Favorites Types
export interface FavoritePaper extends Paper {
  addedAt: string;
  tags?: string[];
  notes?: string;
}

export interface FavoritesContextType {
  favorites: FavoritePaper[];
  isFavorite: (paperId: string) => boolean;
  addFavorite: (paper: Paper, tags?: string[], notes?: string) => void;
  removeFavorite: (paperId: string) => void;
  updateFavorite: (paperId: string, updates: Partial<Pick<FavoritePaper, 'tags' | 'notes'>>) => void;
  clearAllFavorites: () => void;
  exportFavorites: () => void;
}

export interface FavoriteButtonProps {
  paper: Paper;
  variant?: 'default' | 'compact' | 'icon-only';
  showCount?: boolean;
  className?: string;
}

export interface FavoritesListProps {
  className?: string;
  sortBy?: 'newest' | 'oldest' | 'most-cited' | 'title';
  filterTags?: string[];
  onPaperClick?: (paper: Paper) => void;
  compact?: boolean;
}

// Enhanced Search Types
export interface SearchResult {
  paper: Paper;
  relevanceScore: number;
  matchedFields: string[];
  highlights: {
    title?: string;
    abstract?: string;
    authors?: string[];
  };
}

export interface SearchFilter {
  categories: string[];
  authors: string[];
  dateRange: [Date | null, Date | null];
  citationRange: [number, number];
  includeAbstract: boolean;
}

export interface EnhancedSearchProps {
  papers: Paper[];
  onResultClick?: (paper: Paper) => void;
  placeholder?: string;
  className?: string;
  showFilters?: boolean;
  maxResults?: number;
  enableHighlighting?: boolean;
}

export interface SearchSuggestion {
  type: 'recent' | 'popular' | 'author' | 'category' | 'keyword';
  value: string;
  label: string;
  count?: number;
}

// Common Types
export interface InteractiveFeatureProps {
  className?: string;
  disabled?: boolean;
}

export interface AnimationConfig {
  duration?: number;
  easing?: string;
  delay?: number;
}

export interface KeyboardNavigationConfig {
  enableArrowKeys?: boolean;
  enableEnterKey?: boolean;
  enableEscapeKey?: boolean;
  enableTabKey?: boolean;
}

export interface AccessibilityConfig {
  ariaLabel?: string;
  ariaDescribedBy?: string;
  role?: string;
  tabIndex?: number;
}

// Storage Types
export interface LocalStorageItem<T> {
  data: T;
  timestamp: number;
  version: string;
}

export interface StorageConfig {
  key: string;
  maxSize?: number;
  ttl?: number; // Time to live in milliseconds
  compress?: boolean;
}

// Performance Types
export interface PerformanceMetrics {
  renderTime: number;
  loadTime: number;
  interactionLatency: number;
  memoryUsage?: number;
}

export interface OptimizationOptions {
  enableVirtualization?: boolean;
  enableMemoization?: boolean;
  enableDebouncing?: boolean;
  debounceDelay?: number;
  cacheSize?: number;
}

// Error Types
export interface FeatureError extends Error {
  feature: string;
  context?: Record<string, unknown>;
  recoverable: boolean;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: FeatureError;
  errorInfo?: React.ErrorInfo;
}

// Theme Types
export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    error: string;
    warning: string;
    success: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
}

// Mobile/Responsive Types
export interface ResponsiveConfig {
  breakpoints: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  mobileFirst: boolean;
}

export interface TouchGestureConfig {
  enableSwipe?: boolean;
  enablePinch?: boolean;
  enableTap?: boolean;
  swipeThreshold?: number;
  tapTimeout?: number;
}

// Analytics Types
export interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  customProperties?: Record<string, unknown>;
}

export interface UserInteraction {
  type: 'click' | 'scroll' | 'search' | 'filter' | 'share' | 'favorite';
  timestamp: number;
  data: Record<string, unknown>;
}

// Validation Types
export interface ValidationRule<T> {
  validate: (value: T) => boolean;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Export all types
export type {
  // Core Paper types from API
  Paper
};

// Constants
export const STORAGE_KEYS = {
  FAVORITES: 'paper-birthdays-favorites',
  RECENT_SEARCHES: 'paper-birthdays-recent-searches',
  RECENT_CATEGORIES: 'paper-birthdays-recent-categories',
  USER_PREFERENCES: 'paper-birthdays-preferences',
  SHARE_STATS: 'paper-birthdays-share-stats'
} as const;

export const FEATURE_LIMITS = {
  MAX_FAVORITES: 100,
  MAX_RECENT_SEARCHES: 10,
  MAX_RECENT_CATEGORIES: 5,
  MAX_SEARCH_RESULTS: 50,
  MAX_TIMELINE_ITEMS: 1000
} as const;

export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500
} as const;

export const DEBOUNCE_DELAYS = {
  SEARCH: 300,
  FILTER: 150,
  SCROLL: 16
} as const;