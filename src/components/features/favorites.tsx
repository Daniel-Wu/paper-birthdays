'use client';

import React, { useState, useEffect, useMemo, createContext, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Heading, Text } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { Paper } from '@/lib/api/types';

interface FavoritePaper extends Paper {
  addedAt: string;
  tags?: string[];
  notes?: string;
}

interface FavoritesContextType {
  favorites: FavoritePaper[];
  isFavorite: (paperId: string) => boolean;
  addFavorite: (paper: Paper, tags?: string[], notes?: string) => void;
  removeFavorite: (paperId: string) => void;
  updateFavorite: (paperId: string, updates: Partial<Pick<FavoritePaper, 'tags' | 'notes'>>) => void;
  clearAllFavorites: () => void;
  exportFavorites: () => void;
}

const FavoritesContext = createContext<FavoritesContextType | null>(null);

const FAVORITES_STORAGE_KEY = 'paper-birthdays-favorites';
const MAX_FAVORITES = 100;

// Favorites Provider
export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<FavoritePaper[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load favorites from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setFavorites(Array.isArray(parsed) ? parsed : []);
      }
    } catch (error) {
      console.warn('Failed to load favorites:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
      } catch (error) {
        console.warn('Failed to save favorites:', error);
      }
    }
  }, [favorites, isLoaded]);

  const isFavorite = (paperId: string) => {
    return favorites.some(fav => fav.id === paperId);
  };

  const addFavorite = (paper: Paper, tags: string[] = [], notes = '') => {
    if (favorites.length >= MAX_FAVORITES) {
      alert(`You can only save up to ${MAX_FAVORITES} favorite papers.`);
      return;
    }

    if (isFavorite(paper.id)) {
      return; // Already favorited
    }

    const favoritePaper: FavoritePaper = {
      ...paper,
      addedAt: new Date().toISOString(),
      tags,
      notes
    };

    setFavorites(prev => [favoritePaper, ...prev]);
  };

  const removeFavorite = (paperId: string) => {
    setFavorites(prev => prev.filter(fav => fav.id !== paperId));
  };

  const updateFavorite = (paperId: string, updates: Partial<Pick<FavoritePaper, 'tags' | 'notes'>>) => {
    setFavorites(prev => prev.map(fav => 
      fav.id === paperId ? { ...fav, ...updates } : fav
    ));
  };

  const clearAllFavorites = () => {
    if (confirm('Are you sure you want to remove all favorite papers? This action cannot be undone.')) {
      setFavorites([]);
    }
  };

  const exportFavorites = () => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      source: 'Paper Birthdays',
      favorites: favorites.map(fav => ({
        title: fav.title,
        authors: fav.authors.map(a => a.name).join(', '),
        abstract: fav.abstract,
        arxivId: fav.arxivId,
        categories: fav.categories,
        primaryCategory: fav.primaryCategory,
        submittedDate: fav.submittedDate,
        citationCount: fav.citationCount,
        pdfUrl: fav.pdfUrl,
        abstractUrl: fav.abstractUrl,
        addedAt: fav.addedAt,
        tags: fav.tags,
        notes: fav.notes
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `paper-birthdays-favorites-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const contextValue: FavoritesContextType = {
    favorites,
    isFavorite,
    addFavorite,
    removeFavorite,
    updateFavorite,
    clearAllFavorites,
    exportFavorites
  };

  return (
    <FavoritesContext.Provider value={contextValue}>
      {children}
    </FavoritesContext.Provider>
  );
}

// Hook to use favorites
export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}

// Favorite Button Component
interface FavoriteButtonProps {
  paper: Paper;
  variant?: 'default' | 'compact' | 'icon-only';
  showCount?: boolean;
  className?: string;
}

export function FavoriteButton({
  paper,
  variant = 'default',
  showCount = false,
  className
}: FavoriteButtonProps) {
  const { isFavorite, addFavorite, removeFavorite, favorites } = useFavorites();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);

    if (isFavorite(paper.id)) {
      removeFavorite(paper.id);
    } else {
      addFavorite(paper);
    }
  };

  const favorited = isFavorite(paper.id);
  const count = favorites.length;

  if (variant === 'icon-only') {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleToggle}
        className={cn(
          'h-8 w-8 p-0 transition-all duration-200',
          favorited && 'text-red-500 hover:text-red-600',
          isAnimating && 'scale-110',
          className
        )}
        aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
      >
        <Icon
          name={favorited ? 'heart-filled' : 'heart'}
          className={cn('h-4 w-4', isAnimating && 'animate-pulse')}
        />
      </Button>
    );
  }

  if (variant === 'compact') {
    return (
      <Button
        variant={favorited ? 'primary' : 'outline'}
        size="sm"
        onClick={handleToggle}
        className={cn(
          'flex items-center gap-1 transition-all duration-200',
          favorited && 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
          isAnimating && 'scale-105',
          className
        )}
      >
        <Icon
          name={favorited ? 'heart-filled' : 'heart'}
          className={cn('h-3 w-3', isAnimating && 'animate-pulse')}
        />
        {showCount && count > 0 && (
          <Badge variant="secondary" size="sm">
            {count}
          </Badge>
        )}
      </Button>
    );
  }

  return (
    <Button
      variant={favorited ? 'primary' : 'outline'}
      onClick={handleToggle}
      className={cn(
        'flex items-center gap-2 transition-all duration-200',
        favorited && 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
        isAnimating && 'scale-105',
        className
      )}
    >
      <Icon
        name={favorited ? 'heart-filled' : 'heart'}
        className={cn('h-4 w-4', isAnimating && 'animate-pulse')}
      />
      {favorited ? 'Favorited' : 'Add to Favorites'}
      {showCount && count > 0 && (
        <Badge variant="secondary" size="sm">
          {count}
        </Badge>
      )}
    </Button>
  );
}

// Favorites List Component
interface FavoritesListProps {
  className?: string;
  sortBy?: 'newest' | 'oldest' | 'most-cited' | 'title';
  filterTags?: string[];
  onPaperClick?: (paper: Paper) => void;
  compact?: boolean;
}

export function FavoritesList({
  className,
  sortBy = 'newest',
  filterTags = [],
  onPaperClick,
  compact = false
}: FavoritesListProps) {
  const { favorites, removeFavorite, updateFavorite, clearAllFavorites, exportFavorites } = useFavorites();
  const [selectedTags, setSelectedTags] = useState<string[]>(filterTags);

  // Get all unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    favorites.forEach(fav => {
      fav.tags?.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [favorites]);

  // Filter and sort favorites
  const filteredFavorites = useMemo(() => {
    let filtered = favorites;

    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(fav =>
        selectedTags.some(tag => fav.tags?.includes(tag))
      );
    }

    // Sort
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime();
        case 'most-cited':
          return b.citationCount - a.citationCount;
        case 'title':
          return a.title.localeCompare(b.title);
        default: // newest
          return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
      }
    });
  }, [favorites, selectedTags, sortBy]);

  if (favorites.length === 0) {
    return (
      <div className={cn('text-center py-12', className)}>
        <Icon name="heart" className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <Heading level={3} variant="xl" className="text-gray-600 mb-2">
          No favorites yet
        </Heading>
        <Text variant="body" className="text-gray-500 mb-4">
          Start exploring papers and save your favorites to see them here.
        </Text>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name="heart" className="h-5 w-5 text-red-500" />
          <Heading level={3} variant="xl">
            My Favorites ({favorites.length})
          </Heading>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportFavorites}
            className="flex items-center gap-1"
          >
            <Icon name="download" className="h-4 w-4" />
            Export
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFavorites}
            className="text-red-600 hover:text-red-700"
          >
            Clear All
          </Button>
        </div>
      </div>

      {/* Filters */}
      {allTags.length > 0 && (
        <div className="space-y-2">
          <Text variant="body" className="text-gray-600 text-sm">
            Filter by tags:
          </Text>
          <div className="flex flex-wrap gap-1">
            {allTags.map(tag => (
              <Button
                key={tag}
                variant={selectedTags.includes(tag) ? 'primary' : 'outline'}
                size="sm"
                onClick={() => {
                  setSelectedTags(prev =>
                    prev.includes(tag)
                      ? prev.filter(t => t !== tag)
                      : [...prev, tag]
                  );
                }}
                className="h-7 text-xs"
              >
                {tag}
              </Button>
            ))}
            {selectedTags.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTags([])}
                className="h-7 text-xs text-gray-500"
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Favorites List */}
      <div className="space-y-3">
        {filteredFavorites.map(favorite => (
          <FavoriteItem
            key={favorite.id}
            favorite={favorite}
            onRemove={() => removeFavorite(favorite.id)}
            onUpdate={(updates) => updateFavorite(favorite.id, updates)}
            onClick={() => onPaperClick?.(favorite)}
            compact={compact}
          />
        ))}
      </div>

      {filteredFavorites.length === 0 && selectedTags.length > 0 && (
        <div className="text-center py-8">
          <Text variant="body" className="text-gray-500">
            No favorites match the selected tags.
          </Text>
        </div>
      )}
    </div>
  );
}

// Individual Favorite Item
interface FavoriteItemProps {
  favorite: FavoritePaper;
  onRemove: () => void;
  onUpdate: (updates: Partial<Pick<FavoritePaper, 'tags' | 'notes'>>) => void;
  onClick?: () => void;
  compact?: boolean;
}

function FavoriteItem({
  favorite,
  onRemove,
  onUpdate,
  onClick,
  compact = false
}: FavoriteItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempTags, setTempTags] = useState(favorite.tags?.join(', ') || '');
  const [tempNotes, setTempNotes] = useState(favorite.notes || '');

  const handleSaveEdits = () => {
    const tags = tempTags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
    
    onUpdate({
      tags,
      notes: tempNotes.trim()
    });
    setIsEditing(false);
  };

  const handleCancelEdits = () => {
    setTempTags(favorite.tags?.join(', ') || '');
    setTempNotes(favorite.notes || '');
    setIsEditing(false);
  };

  return (
    <Card className="p-4 hover:shadow-md transition-shadow duration-200">
      <div className="space-y-3">
        {/* Paper Info */}
        <div 
          className={cn('space-y-2', onClick && 'cursor-pointer')}
          onClick={onClick}
        >
          <div className="flex items-start justify-between gap-3">
            <Heading 
              level={4} 
              variant="lg"
              className="line-clamp-2 flex-1 hover:text-blue-600 transition-colors"
            >
              {favorite.title}
            </Heading>
            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(!isEditing);
                }}
                className="h-8 w-8 p-0"
                aria-label="Edit favorite"
              >
                <Icon name="edit" className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                aria-label="Remove favorite"
              >
                <Icon name="trash" className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {!compact && (
            <>
              <Text variant="body" className="text-gray-600 text-sm">
                {favorite.authors.slice(0, 3).map(a => a.name).join(', ')}
                {favorite.authors.length > 3 && ` +${favorite.authors.length - 3} more`}
              </Text>

              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" size="sm">
                  {favorite.citationCount.toLocaleString()} citations
                </Badge>
                <Badge variant="outline" size="sm">
                  {favorite.primaryCategory}
                </Badge>
                <Badge variant="outline" size="sm">
                  Added {new Date(favorite.addedAt).toLocaleDateString()}
                </Badge>
              </div>
            </>
          )}
        </div>

        {/* Tags and Notes */}
        {!isEditing ? (
          <div className="space-y-2">
            {favorite.tags && favorite.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {favorite.tags.map(tag => (
                  <Badge key={tag} variant="secondary" size="sm">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            {favorite.notes && (
              <Text variant="body" className="text-gray-600 bg-gray-50 p-2 rounded text-sm">
                {favorite.notes}
              </Text>
            )}
          </div>
        ) : (
          <div className="space-y-3 border-t pt-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={tempTags}
                onChange={(e) => setTempTags(e.target.value)}
                placeholder="research, AI, favorites..."
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Notes
              </label>
              <textarea
                value={tempNotes}
                onChange={(e) => setTempNotes(e.target.value)}
                placeholder="Add your notes about this paper..."
                rows={3}
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveEdits}
              >
                Save
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelEdits}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

export default FavoritesList;