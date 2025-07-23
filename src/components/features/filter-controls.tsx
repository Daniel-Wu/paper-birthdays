'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CategorySelector, Category } from './category-selector';
import { DatePicker } from './date-picker';

export interface FilterState {
  categories: string[];
  citationRange: [number, number];
  dateRange: [Date | null, Date | null];
  sortBy: 'newest' | 'oldest' | 'most-cited' | 'least-cited' | 'relevance';
  searchQuery: string;
}

interface FilterControlsProps {
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

interface RangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  step?: number;
  formatValue?: (value: number) => string;
  label?: string;
  className?: string;
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First', icon: 'calendar' },
  { value: 'oldest', label: 'Oldest First', icon: 'calendar-clock' },
  { value: 'most-cited', label: 'Most Cited', icon: 'trending-up' },
  { value: 'least-cited', label: 'Least Cited', icon: 'trending-down' },
  { value: 'relevance', label: 'Most Relevant', icon: 'search' }
] as const;

function RangeSlider({
  min,
  max,
  value,
  onChange,
  step = 1,
  formatValue = (v) => v.toString(),
  label,
  className
}: RangeSliderProps) {
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleMouseDown = (thumb: 'min' | 'max') => (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(thumb);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    const slider = document.getElementById('range-slider-track');
    if (!slider) return;

    const rect = slider.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newValue = min + percentage * (max - min);
    const steppedValue = Math.round(newValue / step) * step;

    setLocalValue(prev => {
      if (isDragging === 'min') {
        return [Math.min(steppedValue, prev[1]), prev[1]];
      } else {
        return [prev[0], Math.max(steppedValue, prev[0])];
      }
    });
  }, [isDragging, min, max, step]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      onChange(localValue);
      setIsDragging(null);
    }
  }, [isDragging, localValue, onChange]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const minPercent = ((localValue[0] - min) / (max - min)) * 100;
  const maxPercent = ((localValue[1] - min) / (max - min)) * 100;

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">{label}</label>
          <div className="text-sm text-gray-600">
            {formatValue(localValue[0])} - {formatValue(localValue[1])}
          </div>
        </div>
      )}
      
      <div className="relative">
        {/* Track */}
        <div
          id="range-slider-track"
          className="h-2 bg-gray-200 rounded-full cursor-pointer"
        >
          {/* Active range */}
          <div
            className="absolute h-2 bg-blue-500 rounded-full"
            style={{
              left: `${minPercent}%`,
              width: `${maxPercent - minPercent}%`
            }}
          />
          
          {/* Min thumb */}
          <div
            className={cn(
              'absolute w-5 h-5 bg-white border-2 border-blue-500 rounded-full cursor-grab',
              'transform -translate-x-1/2 -translate-y-1/2 top-1/2',
              isDragging === 'min' && 'cursor-grabbing ring-2 ring-blue-200'
            )}
            style={{ left: `${minPercent}%` }}
            onMouseDown={handleMouseDown('min')}
            role="slider"
            aria-valuenow={localValue[0]}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-label={`Minimum ${label?.toLowerCase()}`}
            tabIndex={0}
          />
          
          {/* Max thumb */}
          <div
            className={cn(
              'absolute w-5 h-5 bg-white border-2 border-blue-500 rounded-full cursor-grab',
              'transform -translate-x-1/2 -translate-y-1/2 top-1/2',
              isDragging === 'max' && 'cursor-grabbing ring-2 ring-blue-200'
            )}
            style={{ left: `${maxPercent}%` }}
            onMouseDown={handleMouseDown('max')}
            role="slider"
            aria-valuenow={localValue[1]}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-label={`Maximum ${label?.toLowerCase()}`}
            tabIndex={0}
          />
        </div>
      </div>
    </div>
  );
}

export function FilterControls({
  filters,
  onFiltersChange,
  availableCategories = [],
  citationStats = { min: 0, max: 10000, median: 100 },
  className,
  compact = false,
  showSearch = true,
  showDateRange = true,
  showCitationRange = true,
  showCategories = true,
  showSort = true
}: FilterControlsProps) {
  const [isExpanded, setIsExpanded] = useState(!compact);
  const [tempDateStart, setTempDateStart] = useState<Date | null>(filters.dateRange[0]);
  const [tempDateEnd, setTempDateEnd] = useState<Date | null>(filters.dateRange[1]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.categories.length > 0) count++;
    if (filters.citationRange[0] > citationStats.min || filters.citationRange[1] < citationStats.max) count++;
    if (filters.dateRange[0] || filters.dateRange[1]) count++;
    if (filters.searchQuery.trim()) count++;
    if (filters.sortBy !== 'newest') count++;
    return count;
  }, [filters, citationStats]);

  // Handle filter changes
  const updateFilters = (updates: Partial<FilterState>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const handleCategoryChange = (categoryId: string | null) => {
    const newCategories = categoryId 
      ? [categoryId]
      : [];
    updateFilters({ categories: newCategories });
  };

  const handleCategoryToggle = (categoryId: string) => {
    const newCategories = filters.categories.includes(categoryId)
      ? filters.categories.filter(id => id !== categoryId)
      : [...filters.categories, categoryId];
    updateFilters({ categories: newCategories });
  };

  const handleDateRangeChange = (field: 'start' | 'end', date: Date) => {
    if (field === 'start') {
      setTempDateStart(date);
      updateFilters({ dateRange: [date, filters.dateRange[1]] });
    } else {
      setTempDateEnd(date);
      updateFilters({ dateRange: [filters.dateRange[0], date] });
    }
  };

  const clearAllFilters = () => {
    onFiltersChange({
      categories: [],
      citationRange: [citationStats.min, citationStats.max],
      dateRange: [null, null],
      sortBy: 'newest',
      searchQuery: ''
    });
    setTempDateStart(null);
    setTempDateEnd(null);
  };

  const formatCitationCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return (
    <div className={cn('bg-white border rounded-lg', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Icon name="filter" className="h-5 w-5 text-gray-600" />
          <h3 className="font-medium text-gray-900">Filters</h3>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" size="sm">
              {activeFilterCount}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-gray-600 hover:text-gray-900"
            >
              Clear all
            </Button>
          )}
          {compact && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 p-0"
            >
              <Icon
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                className="h-4 w-4"
              />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      {(!compact || isExpanded) && (
        <div className="p-4 space-y-6">
          {/* Search */}
          {showSearch && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Search Papers
              </label>
              <div className="relative">
                <Icon 
                  name="search" 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search by title, author, or keywords..."
                  value={filters.searchQuery}
                  onChange={(e) => updateFilters({ searchQuery: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Categories */}
          {showCategories && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Categories
              </label>
              <CategorySelector
                categories={availableCategories}
                selectedCategory={filters.categories[0]}
                onCategoryChange={handleCategoryChange}
                showSearch={true}
                className="w-full"
              />
              
              {/* Multi-select categories */}
              {filters.categories.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs text-gray-600">Selected categories:</div>
                  <div className="flex flex-wrap gap-1">
                    {filters.categories.map(categoryId => {
                      const category = availableCategories
                        .flatMap(cat => [cat, ...(cat.subcategories || [])])
                        .find(cat => cat.id === categoryId);
                      
                      return (
                        <Badge
                          key={categoryId}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {category?.name || categoryId}
                          <button
                            onClick={() => handleCategoryToggle(categoryId)}
                            className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                            aria-label={`Remove ${category?.name || categoryId} filter`}
                          >
                            <Icon name="x" className="h-3 w-3" />
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Citation Range */}
          {showCitationRange && (
            <div className="space-y-2">
              <RangeSlider
                label="Citation Count"
                min={citationStats.min}
                max={citationStats.max}
                value={filters.citationRange}
                onChange={(range) => updateFilters({ citationRange: range })}
                formatValue={formatCitationCount}
                step={Math.max(1, Math.floor((citationStats.max - citationStats.min) / 100))}
              />
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Median: {formatCitationCount(citationStats.median)}</span>
                <span>
                  {filters.citationRange[0] === citationStats.min && 
                   filters.citationRange[1] === citationStats.max 
                    ? 'All papers' 
                    : `${formatCitationCount(filters.citationRange[0])} - ${formatCitationCount(filters.citationRange[1])}`
                  }
                </span>
              </div>
            </div>
          )}

          {/* Date Range */}
          {showDateRange && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">
                Date Range
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">From</label>
                  <DatePicker
                    selectedDate={tempDateStart || undefined}
                    onDateChange={(date) => handleDateRangeChange('start', date)}
                    maxDate={tempDateEnd || new Date()}
                    showQuickRanges={false}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">To</label>
                  <DatePicker
                    selectedDate={tempDateEnd || undefined}
                    onDateChange={(date) => handleDateRangeChange('end', date)}
                    minDate={tempDateStart || undefined}
                    maxDate={new Date()}
                    showQuickRanges={false}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Sort */}
          {showSort && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Sort By
              </label>
              <div className="grid grid-cols-1 gap-1">
                {SORT_OPTIONS.map((option) => (
                  <Button
                    key={option.value}
                    variant={filters.sortBy === option.value ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => updateFilters({ sortBy: option.value })}
                    className="justify-start"
                  >
                    <Icon name={option.icon} className="h-4 w-4 mr-2" />
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Active filters summary (compact mode) */}
      {compact && !isExpanded && activeFilterCount > 0 && (
        <div className="px-4 pb-4">
          <div className="flex flex-wrap gap-1">
            {filters.searchQuery.trim() && (
              <Badge variant="outline" size="sm">
                Search: &ldquo;{filters.searchQuery.slice(0, 20)}&hellip;&rdquo;
              </Badge>
            )}
            {filters.categories.length > 0 && (
              <Badge variant="outline" size="sm">
                {filters.categories.length} categories
              </Badge>
            )}
            {(filters.citationRange[0] > citationStats.min || filters.citationRange[1] < citationStats.max) && (
              <Badge variant="outline" size="sm">
                Citations: {formatCitationCount(filters.citationRange[0])}-{formatCitationCount(filters.citationRange[1])}
              </Badge>
            )}
            {(filters.dateRange[0] || filters.dateRange[1]) && (
              <Badge variant="outline" size="sm">
                Date range
              </Badge>
            )}
            {filters.sortBy !== 'newest' && (
              <Badge variant="outline" size="sm">
                Sort: {SORT_OPTIONS.find(opt => opt.value === filters.sortBy)?.label}
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default FilterControls;