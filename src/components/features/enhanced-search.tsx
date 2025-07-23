'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { Text } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { Paper } from '@/lib/api/types';

interface SearchResult {
  paper: Paper;
  relevanceScore: number;
  matchedFields: string[];
  highlights: {
    title?: string;
    abstract?: string;
    authors?: string[];
  };
}

interface SearchFilter {
  categories: string[];
  authors: string[];
  dateRange: [Date | null, Date | null];
  citationRange: [number, number];
  includeAbstract: boolean;
}

interface EnhancedSearchProps {
  papers: Paper[];
  onResultClick?: (paper: Paper) => void;
  placeholder?: string;
  className?: string;
  showFilters?: boolean;
  maxResults?: number;
  enableHighlighting?: boolean;
}

interface SearchSuggestion {
  type: 'recent' | 'popular' | 'author' | 'category' | 'keyword';
  value: string;
  label: string;
  count?: number;
}

const RECENT_SEARCHES_KEY = 'paper-birthdays-recent-searches';
const MAX_RECENT_SEARCHES = 10;
const DEBOUNCE_DELAY = 300;

// Popular search terms (could be dynamically loaded)
const POPULAR_SEARCHES = [
  'artificial intelligence',
  'machine learning',
  'neural networks',
  'deep learning',
  'computer vision',
  'natural language processing',
  'quantum computing',
  'cryptography'
];

export function EnhancedSearch({
  papers,
  onResultClick,
  placeholder = 'Search papers by title, author, or keywords...',
  className,
  showFilters = true,
  maxResults = 50,
  enableHighlighting = true
}: EnhancedSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [filters, setFilters] = useState<SearchFilter>({
    categories: [],
    authors: [],
    dateRange: [null, null],
    citationRange: [0, 100000],
    includeAbstract: true
  });

  const searchRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load recent searches
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (error) {
      console.warn('Failed to load recent searches:', error);
    }
  }, []);

  // Save recent searches
  const saveRecentSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return;

    const updated = [
      searchQuery,
      ...recentSearches.filter(s => s !== searchQuery)
    ].slice(0, MAX_RECENT_SEARCHES);

    setRecentSearches(updated);
    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (error) {
      console.warn('Failed to save recent search:', error);
    }
  }, [recentSearches]);

  // Get unique authors and categories for filters
  const { uniqueAuthors, uniqueCategories } = useMemo(() => {
    const authors = new Set<string>();
    const categories = new Set<string>();

    papers.forEach(paper => {
      paper.authors.forEach(author => authors.add(author.name));
      paper.categories.forEach(category => categories.add(category));
    });

    return {
      uniqueAuthors: Array.from(authors).sort(),
      uniqueCategories: Array.from(categories).sort()
    };
  }, [papers]);

  // Generate search suggestions
  const suggestions = useMemo((): SearchSuggestion[] => {
    if (!query.trim()) {
      const suggestions: SearchSuggestion[] = [];

      // Recent searches
      recentSearches.slice(0, 5).forEach(search => {
        suggestions.push({
          type: 'recent',
          value: search,
          label: search
        });
      });

      // Popular searches
      POPULAR_SEARCHES.slice(0, 5).forEach(search => {
        if (!recentSearches.includes(search)) {
          suggestions.push({
            type: 'popular',
            value: search,
            label: search
          });
        }
      });

      return suggestions;
    }

    const queryLower = query.toLowerCase();
    const suggestions: SearchSuggestion[] = [];

    // Author suggestions
    uniqueAuthors
      .filter(author => author.toLowerCase().includes(queryLower))
      .slice(0, 3)
      .forEach(author => {
        const paperCount = papers.filter(p => 
          p.authors.some(a => a.name === author)
        ).length;
        suggestions.push({
          type: 'author',
          value: `author:"${author}"`,
          label: author,
          count: paperCount
        });
      });

    // Category suggestions
    uniqueCategories
      .filter(category => category.toLowerCase().includes(queryLower))
      .slice(0, 3)
      .forEach(category => {
        const paperCount = papers.filter(p => 
          p.categories.includes(category)
        ).length;
        suggestions.push({
          type: 'category',
          value: `category:${category}`,
          label: category,
          count: paperCount
        });
      });

    // Keyword suggestions from paper titles
    const titleWords = new Set<string>();
    papers.forEach(paper => {
      const words = paper.title.toLowerCase().split(/\s+/);
      words.forEach(word => {
        if (word.length > 3 && word.includes(queryLower)) {
          titleWords.add(word);
        }
      });
    });

    Array.from(titleWords)
      .slice(0, 3)
      .forEach(keyword => {
        suggestions.push({
          type: 'keyword',
          value: keyword,
          label: keyword
        });
      });

    return suggestions.slice(0, 10);
  }, [query, recentSearches, uniqueAuthors, uniqueCategories, papers]);

  // Highlight text
  const highlightText = useCallback((text: string, highlight: string): string => {
    if (!enableHighlighting) return text;
    
    const regex = new RegExp(`(${highlight})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }, [enableHighlighting]);

  // Perform search with highlighting
  const searchResults = useMemo((): SearchResult[] => {
    if (!query.trim()) return [];

    setIsSearching(true);

    const results: SearchResult[] = [];

    // Parse advanced search syntax
    const parseQuery = (q: string) => {
      const authorMatch = q.match(/author:"([^"]+)"/);
      const categoryMatch = q.match(/category:(\S+)/);
      const cleanQuery = q.replace(/author:"[^"]+"/, '').replace(/category:\S+/, '').trim();

      return {
        author: authorMatch?.[1],
        category: categoryMatch?.[1],
        keywords: cleanQuery.split(/\s+/).filter(w => w.length > 0)
      };
    };

    const { author, category, keywords } = parseQuery(query);

    papers.forEach(paper => {
      let relevanceScore = 0;
      const matchedFields: string[] = [];
      const highlights: SearchResult['highlights'] = {};

      // Apply filters
      if (filters.categories.length > 0 && !filters.categories.some(cat => paper.categories.includes(cat))) {
        return;
      }

      if (filters.authors.length > 0 && !filters.authors.some(auth => paper.authors.some(a => a.name === auth))) {
        return;
      }

      if (filters.dateRange[0] && new Date(paper.submittedDate) < filters.dateRange[0]) {
        return;
      }

      if (filters.dateRange[1] && new Date(paper.submittedDate) > filters.dateRange[1]) {
        return;
      }

      if (paper.citationCount < filters.citationRange[0] || paper.citationCount > filters.citationRange[1]) {
        return;
      }

      // Author search
      if (author) {
        const matchingAuthor = paper.authors.find(a => 
          a.name.toLowerCase().includes(author.toLowerCase())
        );
        if (matchingAuthor) {
          relevanceScore += 10;
          matchedFields.push('author');
          highlights.authors = [matchingAuthor.name];
        } else {
          return; // Skip if author not found
        }
      }

      // Category search
      if (category) {
        if (paper.categories.some(cat => cat.toLowerCase().includes(category.toLowerCase()))) {
          relevanceScore += 8;
          matchedFields.push('category');
        } else {
          return; // Skip if category not found
        }
      }

      // Keyword search
      if (keywords.length > 0) {
        // Title search
        const titleLower = paper.title.toLowerCase();
        keywords.forEach(keyword => {
          const keywordLower = keyword.toLowerCase();
          if (titleLower.includes(keywordLower)) {
            relevanceScore += 5;
            if (!matchedFields.includes('title')) {
              matchedFields.push('title');
              if (enableHighlighting) {
                highlights.title = highlightText(paper.title, keyword);
              }
            }
          }
        });

        // Abstract search (if enabled)
        if (filters.includeAbstract) {
          const abstractLower = paper.abstract.toLowerCase();
          keywords.forEach(keyword => {
            const keywordLower = keyword.toLowerCase();
            if (abstractLower.includes(keywordLower)) {
              relevanceScore += 2;
              if (!matchedFields.includes('abstract')) {
                matchedFields.push('abstract');
                if (enableHighlighting) {
                  highlights.abstract = highlightText(
                    paper.abstract.slice(0, 200) + '...', 
                    keyword
                  );
                }
              }
            }
          });
        }

        // Author name search
        paper.authors.forEach(paperAuthor => {
          keywords.forEach(keyword => {
            if (paperAuthor.name.toLowerCase().includes(keyword.toLowerCase())) {
              relevanceScore += 3;
              if (!matchedFields.includes('author')) {
                matchedFields.push('author');
                if (!highlights.authors) highlights.authors = [];
                highlights.authors.push(paperAuthor.name);
              }
            }
          });
        });
      }

      // Boost based on citation count
      relevanceScore += Math.log(paper.citationCount + 1) * 0.1;

      if (relevanceScore > 0) {
        results.push({
          paper,
          relevanceScore,
          matchedFields,
          highlights
        });
      }
    });

    const sortedResults = results
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, maxResults);

    setTimeout(() => setIsSearching(false), 100);
    return sortedResults;
  }, [query, papers, filters, maxResults, enableHighlighting, highlightText]);

  // Handle search
  const handleSearch = useCallback((searchQuery: string) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      setQuery(searchQuery);
      if (searchQuery.trim()) {
        saveRecentSearch(searchQuery.trim());
      }
    }, DEBOUNCE_DELAY);
  }, [saveRecentSearch]);

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.value);
    setIsOpen(false);
    setSelectedIndex(-1);
    saveRecentSearch(suggestion.value);
  };

  // Handle result selection
  const handleResultSelect = (result: SearchResult) => {
    onResultClick?.(result.paper);
    setIsOpen(false);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const totalItems = suggestions.length + searchResults.length;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, totalItems - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          if (selectedIndex < suggestions.length) {
            handleSuggestionSelect(suggestions[selectedIndex]);
          } else {
            const resultIndex = selectedIndex - suggestions.length;
            if (resultIndex < searchResults.length) {
              handleResultSelect(searchResults[resultIndex]);
            }
          }
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current && 
        !searchRef.current.contains(event.target as Node) &&
        resultsRef.current && 
        !resultsRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn('relative w-full', className)}>
      {/* Search Input */}
      <div className="relative">
        <Icon name="search" className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          ref={searchRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className={cn(
            'w-full pl-10 pr-10 py-3 border rounded-lg',
            'focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
            'placeholder-gray-400 text-gray-900'
          )}
        />
        {isSearching && (
          <Icon name="loader" className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500 animate-spin" />
        )}
      </div>

      {/* Search Filters */}
      {showFilters && (
        <div className="mt-2 flex flex-wrap gap-2">
          <Button
            variant={filters.includeAbstract ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilters(prev => ({ ...prev, includeAbstract: !prev.includeAbstract }))}
          >
            Include Abstracts
          </Button>
          {/* Add more filter toggles here */}
        </div>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={resultsRef}
          className={cn(
            'absolute z-50 w-full mt-2 bg-white border rounded-lg shadow-lg',
            'max-h-96 overflow-y-auto',
            'animate-in fade-in-0 zoom-in-95 slide-in-from-top-2'
          )}
        >
          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="p-3 border-b">
              <Text variant="body" className="text-gray-600 mb-2 text-sm">
                {query.trim() ? 'Suggestions' : 'Recent & Popular'}
              </Text>
              {suggestions.map((suggestion, index) => (
                <div
                  key={`${suggestion.type}-${suggestion.value}`}
                  className={cn(
                    'flex items-center gap-2 px-2 py-1 rounded cursor-pointer',
                    'hover:bg-gray-100',
                    selectedIndex === index && 'bg-blue-50'
                  )}
                  onClick={() => handleSuggestionSelect(suggestion)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <Icon 
                    name={
                      suggestion.type === 'recent' ? 'clock' :
                      suggestion.type === 'author' ? 'user' :
                      suggestion.type === 'category' ? 'tag' :
                      'search'
                    } 
                    className="h-3 w-3 text-gray-400" 
                  />
                  <span className="text-sm flex-1">{suggestion.label}</span>
                  {suggestion.count && (
                    <Badge variant="outline" size="sm">
                      {suggestion.count}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="p-3">
              <Text variant="body" className="text-gray-600 mb-2 text-sm">
                Results ({searchResults.length})
              </Text>
              {searchResults.map((result, index) => {
                const globalIndex = suggestions.length + index;
                return (
                  <div
                    key={result.paper.id}
                    className={cn(
                      'p-3 rounded cursor-pointer border-b border-gray-100 last:border-b-0',
                      'hover:bg-gray-50 transition-colors',
                      selectedIndex === globalIndex && 'bg-blue-50'
                    )}
                    onClick={() => handleResultSelect(result)}
                    onMouseEnter={() => setSelectedIndex(globalIndex)}
                  >
                    <Text variant="body" className="font-medium mb-1 line-clamp-2">
                      {enableHighlighting && result.highlights.title ? (
                        <span dangerouslySetInnerHTML={{ __html: result.highlights.title }} />
                      ) : (
                        result.paper.title
                      )}
                    </Text>
                    
                    <Text variant="body" className="text-gray-600 mb-2 text-sm">
                      {result.paper.authors.slice(0, 2).map(a => a.name).join(', ')}
                      {result.paper.authors.length > 2 && ` +${result.paper.authors.length - 2} more`}
                    </Text>

                    {result.highlights.abstract && (
                      <Text variant="body" className="text-gray-500 mb-2 line-clamp-2 text-sm">
                        <span dangerouslySetInnerHTML={{ __html: result.highlights.abstract }} />
                      </Text>
                    )}

                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" size="sm">
                        {result.paper.citationCount.toLocaleString()} citations
                      </Badge>
                      <Badge variant="outline" size="sm">
                        {result.paper.primaryCategory}
                      </Badge>
                      {result.matchedFields.map(field => (
                        <Badge key={field} variant="secondary" size="sm">
                          {field}
                        </Badge>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* No Results */}
          {query.trim() && searchResults.length === 0 && !isSearching && (
            <div className="p-6 text-center">
              <Icon name="search" className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <Text variant="body" className="text-gray-600">
                No papers found for &ldquo;{query}&rdquo;
              </Text>
              <Text variant="body" className="text-gray-500 mt-1 text-sm">
                Try different keywords or check your spelling
              </Text>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default EnhancedSearch;