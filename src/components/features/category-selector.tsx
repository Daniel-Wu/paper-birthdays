'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

export interface Category {
  id: string;
  name: string;
  description?: string;
  parentCategory?: string;
  subcategories?: Category[];
  paperCount?: number;
}

interface CategorySelectorProps {
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

const RECENT_CATEGORIES_KEY = 'paper-birthdays-recent-categories';

// Predefined arXiv categories with descriptions
const ARXIV_CATEGORIES: Category[] = [
  {
    id: 'all',
    name: 'All Categories',
    description: 'Papers from all categories'
  },
  {
    id: 'cs',
    name: 'Computer Science',
    subcategories: [
      { id: 'cs.AI', name: 'Artificial Intelligence', description: 'AI and machine learning' },
      { id: 'cs.LG', name: 'Machine Learning', description: 'Learning algorithms and theory' },
      { id: 'cs.CV', name: 'Computer Vision', description: 'Image and video analysis' },
      { id: 'cs.CL', name: 'Computational Linguistics', description: 'Natural language processing' },
      { id: 'cs.CR', name: 'Cryptography', description: 'Security and cryptography' },
      { id: 'cs.DS', name: 'Data Structures', description: 'Algorithms and data structures' },
      { id: 'cs.HC', name: 'Human-Computer Interaction', description: 'HCI and user interfaces' },
      { id: 'cs.IR', name: 'Information Retrieval', description: 'Search and information systems' },
      { id: 'cs.NE', name: 'Neural Networks', description: 'Neural and evolutionary computing' },
      { id: 'cs.RO', name: 'Robotics', description: 'Robotics and automation' }
    ]
  },
  {
    id: 'math',
    name: 'Mathematics',
    subcategories: [
      { id: 'math.GT', name: 'Geometric Topology', description: 'Topology and geometry' },
      { id: 'math.AG', name: 'Algebraic Geometry', description: 'Algebraic geometry' },
      { id: 'math.NT', name: 'Number Theory', description: 'Number theory and arithmetic' },
      { id: 'math.PR', name: 'Probability', description: 'Probability theory and statistics' },
      { id: 'math.ST', name: 'Statistics Theory', description: 'Mathematical statistics' },
      { id: 'math.CO', name: 'Combinatorics', description: 'Combinatorial mathematics' }
    ]
  },
  {
    id: 'physics',
    name: 'Physics',
    subcategories: [
      { id: 'physics.gen-ph', name: 'General Physics', description: 'General physics' },
      { id: 'physics.cond-mat', name: 'Condensed Matter', description: 'Condensed matter physics' },
      { id: 'physics.hep-th', name: 'High Energy Theory', description: 'Theoretical high-energy physics' },
      { id: 'physics.quant-ph', name: 'Quantum Physics', description: 'Quantum mechanics and theory' }
    ]
  }
];

export function CategorySelector({
  categories = ARXIV_CATEGORIES,
  selectedCategory,
  onCategoryChange,
  className,
  disabled = false,
  showSearch = true,
  showCounts = false,
  maxRecent = 5
}: CategorySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [recentCategories, setRecentCategories] = useState<string[]>([]);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Load recent categories from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_CATEGORIES_KEY);
      if (stored) {
        setRecentCategories(JSON.parse(stored));
      }
    } catch (error) {
      console.warn('Failed to load recent categories:', error);
    }
  }, []);

  // Flatten categories for search
  const flattenedCategories = useMemo(() => {
    const flattened: Category[] = [];
    
    const flatten = (cats: Category[], parent?: string) => {
      cats.forEach(cat => {
        flattened.push({ ...cat, parentCategory: parent });
        if (cat.subcategories) {
          flatten(cat.subcategories, cat.name);
        }
      });
    };
    
    flatten(categories);
    return flattened;
  }, [categories]);

  // Filter categories based on search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return flattenedCategories;
    
    const query = searchQuery.toLowerCase();
    return flattenedCategories.filter(cat =>
      cat.name.toLowerCase().includes(query) ||
      cat.id.toLowerCase().includes(query) ||
      cat.description?.toLowerCase().includes(query)
    );
  }, [flattenedCategories, searchQuery]);

  // Get recent categories objects
  const recentCategoryObjects = useMemo(() => {
    return recentCategories
      .map(id => flattenedCategories.find(cat => cat.id === id))
      .filter(Boolean) as Category[];
  }, [recentCategories, flattenedCategories]);

  const displayCategories = searchQuery.trim() 
    ? filteredCategories 
    : recentCategoryObjects.length > 0 
      ? [...recentCategoryObjects, ...flattenedCategories.filter(cat => !recentCategories.includes(cat.id))]
      : flattenedCategories;

  // Handle category selection
  const handleCategorySelect = (category: Category) => {
    const categoryId = category.id === 'all' ? null : category.id;
    onCategoryChange(categoryId);
    
    // Add to recent categories
    if (category.id !== 'all') {
      const updated = [category.id, ...recentCategories.filter(id => id !== category.id)].slice(0, maxRecent);
      setRecentCategories(updated);
      try {
        localStorage.setItem(RECENT_CATEGORIES_KEY, JSON.stringify(updated));
      } catch (error) {
        console.warn('Failed to save recent categories:', error);
      }
    }
    
    setIsOpen(false);
    setSearchQuery('');
    setFocusedIndex(-1);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setTimeout(() => searchRef.current?.focus(), 100);
        } else if (focusedIndex >= 0 && displayCategories[focusedIndex]) {
          handleCategorySelect(displayCategories[focusedIndex]);
        }
        break;
      case 'Escape':
        if (isOpen) {
          setIsOpen(false);
          setSearchQuery('');
          setFocusedIndex(-1);
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setFocusedIndex(prev => Math.min(prev + 1, displayCategories.length - 1));
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          setFocusedIndex(prev => Math.max(prev - 1, -1));
        }
        break;
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        !triggerRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery('');
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && showSearch && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 100);
    }
  }, [isOpen, showSearch]);

  // Get selected category display name
  const selectedCategoryName = useMemo(() => {
    if (!selectedCategory) return 'All Categories';
    const category = flattenedCategories.find(cat => cat.id === selectedCategory);
    return category ? category.name : selectedCategory;
  }, [selectedCategory, flattenedCategories]);

  return (
    <div className={cn('relative', className)}>
      <Button
        ref={triggerRef}
        variant="outline"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={cn(
          'w-full justify-between text-left font-normal',
          !selectedCategory && 'text-gray-500',
          isOpen && 'ring-2 ring-blue-500'
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Select category"
      >
        <span className="truncate">{selectedCategoryName}</span>
        <Icon
          name="chevron-down"
          className={cn(
            'ml-2 h-4 w-4 shrink-0 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </Button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className={cn(
            'absolute z-50 mt-2 w-full min-w-[320px] max-w-md rounded-lg border bg-white shadow-lg',
            'animate-in fade-in-0 zoom-in-95 slide-in-from-top-2',
            'max-h-[400px] overflow-hidden'
          )}
          role="listbox"
          aria-label="Category options"
        >
          {showSearch && (
            <div className="p-3 border-b">
              <div className="relative">
                <Icon 
                  name="search" 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setFocusedIndex(-1);
                  }}
                  onKeyDown={handleKeyDown}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div className="overflow-y-auto max-h-[320px]">
            {recentCategoryObjects.length > 0 && !searchQuery.trim() && (
              <div className="p-2 border-b">
                <div className="text-xs font-medium text-gray-500 mb-2 px-2">Recent</div>
                {recentCategoryObjects.slice(0, 3).map((category, index) => (
                  <CategoryOption
                    key={`recent-${category.id}`}
                    category={category}
                    index={index}
                    focused={index === focusedIndex}
                    selected={category.id === selectedCategory}
                    showCounts={showCounts}
                    onClick={() => handleCategorySelect(category)}
                    onMouseEnter={() => setFocusedIndex(index)}
                  />
                ))}
              </div>
            )}

            {displayCategories.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Icon name="search" className="mx-auto h-8 w-8 mb-2 opacity-50" />
                <p>No categories found</p>
                <p className="text-sm">Try a different search term</p>
              </div>
            ) : (
              <div className="p-1">
                {displayCategories.map((category, index) => {
                  const adjustedIndex = searchQuery.trim() ? index : index + recentCategoryObjects.length;
                  return (
                    <CategoryOption
                      key={category.id}
                      category={category}
                      index={adjustedIndex}
                      focused={adjustedIndex === focusedIndex}
                      selected={category.id === selectedCategory}
                      showCounts={showCounts}
                      onClick={() => handleCategorySelect(category)}
                      onMouseEnter={() => setFocusedIndex(adjustedIndex)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface CategoryOptionProps {
  category: Category;
  index: number;
  focused: boolean;
  selected: boolean;
  showCounts: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
}

function CategoryOption({
  category,
  focused,
  selected,
  showCounts,
  onClick,
  onMouseEnter
}: CategoryOptionProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between px-3 py-2 cursor-pointer rounded-md mx-1',
        'transition-colors duration-150',
        focused && 'bg-blue-50',
        selected && 'bg-blue-100 text-blue-900'
      )}
      role="option"
      aria-selected={selected}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{category.name}</span>
          {category.parentCategory && (
            <Badge variant="secondary" size="sm">
              {category.parentCategory}
            </Badge>
          )}
        </div>
        {category.description && (
          <p className="text-sm text-gray-600 truncate mt-0.5">
            {category.description}
          </p>
        )}
      </div>
      
      <div className="flex items-center gap-2 ml-2">
        {showCounts && category.paperCount !== undefined && (
          <Badge variant="outline" size="sm">
            {category.paperCount}
          </Badge>
        )}
        {selected && (
          <Icon name="check" className="h-4 w-4 text-blue-600" />
        )}
      </div>
    </div>
  );
}

export default CategorySelector;