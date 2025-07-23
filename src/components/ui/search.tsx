/**
 * Search Component
 * Provides search functionality for categories and papers
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import { Icon } from './icon';
import { Button } from './button';
import { Card } from './card';
import { Typography } from './typography-compat';
import { cn } from '@/lib/utils';

interface SearchProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onClear?: () => void;
  debounceMs?: number;
  showClearButton?: boolean;
  className?: string;
}

export function Search({
  placeholder = "Search...",
  onSearch,
  onClear,
  debounceMs = 300,
  showClearButton = true,
  className,
}: SearchProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Debounced search
  const debouncedSearch = useMemo(() => {
    let timeoutId: NodeJS.Timeout;
    
    return (searchQuery: string) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        onSearch?.(searchQuery);
      }, debounceMs);
    };
  }, [onSearch, debounceMs]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  }, [debouncedSearch]);

  const handleClear = useCallback(() => {
    setQuery('');
    onSearch?.('');
    onClear?.();
  }, [onSearch, onClear]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      handleClear();
      (e.target as HTMLInputElement).blur();
    }
  }, [handleClear]);

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Icon 
          name="search" 
          className={cn(
            "absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors",
            isFocused ? "text-blue-500" : "text-gray-400"
          )}
        />
        
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            "w-full pl-10 pr-12 py-3 rounded-lg border transition-all duration-200",
            "text-gray-900 placeholder-gray-500",
            "focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none",
            isFocused 
              ? "border-blue-300 shadow-lg shadow-blue-500/10" 
              : "border-gray-300 hover:border-gray-400"
          )}
        />
        
        {query && showClearButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-auto hover:bg-gray-100"
          >
            <Icon name="x" className="w-4 h-4 text-gray-400 hover:text-gray-600" />
          </Button>
        )}
      </div>
    </div>
  );
}

interface CategorySearchProps {
  categories: Array<{ key: string; name: string; description: string }>;
  onCategorySelect?: (categoryKey: string) => void;
  placeholder?: string;
  className?: string;
}

export function CategorySearch({
  categories,
  onCategorySelect,
  placeholder = "Search categories...",
  className,
}: CategorySearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredCategories = useMemo(() => {
    if (!query.trim()) return categories;
    
    const lowercaseQuery = query.toLowerCase();
    return categories.filter(category => 
      category.name.toLowerCase().includes(lowercaseQuery) ||
      category.key.toLowerCase().includes(lowercaseQuery) ||
      category.description.toLowerCase().includes(lowercaseQuery)
    );
  }, [categories, query]);

  const handleSearch = useCallback((searchQuery: string) => {
    setQuery(searchQuery);
    setIsOpen(searchQuery.length > 0);
  }, []);

  const handleCategorySelect = useCallback((categoryKey: string) => {
    onCategorySelect?.(categoryKey);
    setQuery('');
    setIsOpen(false);
  }, [onCategorySelect]);

  const handleClear = useCallback(() => {
    setQuery('');
    setIsOpen(false);
  }, []);

  return (
    <div className={cn("relative", className)}>
      <Search
        placeholder={placeholder}
        onSearch={handleSearch}
        onClear={handleClear}
      />
      
      {isOpen && filteredCategories.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-2 max-h-80 overflow-y-auto z-50 shadow-xl border-gray-200">
          <div className="p-2">
            {filteredCategories.slice(0, 10).map((category) => (
              <button
                key={category.key}
                onClick={() => handleCategorySelect(category.key)}
                className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <Typography variant="body2" className="font-medium text-gray-900 truncate">
                      {category.name}
                    </Typography>
                    <Typography variant="caption" className="text-gray-500 font-mono">
                      {category.key}
                    </Typography>
                  </div>
                  <Icon name="arrow-right" className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                </div>
                <Typography variant="caption" className="text-gray-600 line-clamp-2 mt-1">
                  {category.description}
                </Typography>
              </button>
            ))}
            
            {filteredCategories.length > 10 && (
              <div className="p-3 text-center border-t border-gray-100 mt-2">
                <Typography variant="caption" className="text-gray-500">
                  {filteredCategories.length - 10} more categories found
                </Typography>
              </div>
            )}
          </div>
        </Card>
      )}
      
      {isOpen && filteredCategories.length === 0 && query.trim() && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 shadow-xl border-gray-200">
          <div className="p-6 text-center">
            <Icon name="search-x" className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <Typography variant="body2" className="text-gray-600">
              No categories found matching &quot;{query}&quot;
            </Typography>
          </div>
        </Card>
      )}
    </div>
  );
}