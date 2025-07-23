/**
 * Categories Listing Page
 * Displays all available arXiv categories in a grid layout
 */

'use client';

import Link from 'next/link';
import { MainLayout } from '@/components/layout';
import { Card, Badge, Button, Icon, CategorySearch } from '@/components/ui';
import { Typography } from '@/components/ui/typography-compat';
import { Breadcrumb } from '@/components/layout';
import { useState, useCallback, useMemo } from 'react';

// arXiv categories with descriptions and metadata
const categories = {
  'cs.AI': {
    name: 'Artificial Intelligence',
    description: 'AI and machine intelligence research, including automated reasoning, knowledge representation, and intelligent agents',
    color: 'primary',
    icon: 'brain',
    paperCount: 156,
  },
  'cs.LG': {
    name: 'Machine Learning',
    description: 'Learning algorithms, neural networks, statistical learning theory, and machine learning applications',
    color: 'success',
    icon: 'trending-up',
    paperCount: 298,
  },
  'cs.CV': {
    name: 'Computer Vision',
    description: 'Image processing, pattern recognition, computer vision, and visual understanding systems',
    color: 'info',
    icon: 'eye',
    paperCount: 142,
  },
  'cs.CL': {
    name: 'Computation and Language',
    description: 'Natural language processing, computational linguistics, and language understanding',
    color: 'warning',
    icon: 'message-square',
    paperCount: 89,
  },
  'cs.CR': {
    name: 'Cryptography and Security',
    description: 'Information security, cryptography, network security, and privacy protection',
    color: 'error',
    icon: 'shield',
    paperCount: 67,
  },
  'cs.DS': {
    name: 'Data Structures and Algorithms',
    description: 'Algorithms, data structures, computational complexity, and algorithmic analysis',
    color: 'secondary',
    icon: 'git-branch',
    paperCount: 134,
  },
  'math.GT': {
    name: 'Geometric Topology',
    description: 'Topology, geometric structures, manifolds, and topological invariants',
    color: 'primary',
    icon: 'shapes',
    paperCount: 45,
  },
  'math.NT': {
    name: 'Number Theory',
    description: 'Prime numbers, arithmetic functions, algebraic number theory, and Diophantine equations',
    color: 'success',
    icon: 'hash',
    paperCount: 78,
  },
  'physics.gen-ph': {
    name: 'General Physics',
    description: 'General physics research, theoretical physics, and interdisciplinary physics studies',
    color: 'info',
    icon: 'atom',
    paperCount: 92,
  },
  'astro-ph': {
    name: 'Astrophysics',
    description: 'Astronomy, astrophysics, cosmology, and observational studies of celestial objects',
    color: 'warning',
    icon: 'star',
    paperCount: 167,
  },
  'q-bio.BM': {
    name: 'Biomolecules',
    description: 'Biological molecules, protein structures, molecular biology, and biochemistry',
    color: 'error',
    icon: 'dna',
    paperCount: 34,
  },
  'stat.ML': {
    name: 'Machine Learning Statistics',
    description: 'Statistical methods for machine learning, probabilistic models, and statistical inference',
    color: 'secondary',
    icon: 'bar-chart',
    paperCount: 123,
  },
} as const;

type CategoryKey = keyof typeof categories;


interface CategoryCardProps {
  categoryKey: CategoryKey;
  category: typeof categories[CategoryKey];
  href: string;
}

function CategoryCard({ categoryKey, category, href }: CategoryCardProps) {
  return (
    <Link href={href} className="group">
      <Card className="h-full p-6 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1 group-hover:border-blue-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 group-hover:from-blue-100 group-hover:to-indigo-100 transition-all duration-200">
              <Icon 
                name={category.icon as string}
                className="w-6 h-6 text-blue-600"
              />
            </div>
            <div>
              <Typography variant="h3" className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {category.name}
              </Typography>
              <Badge 
                variant="outline" 
                className="mt-1 text-xs font-mono text-gray-500"
              >
                {categoryKey}
              </Badge>
            </div>
          </div>
          <Badge 
            variant={category.color as 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'}
            className="text-xs"
          >
            {category.paperCount} papers
          </Badge>
        </div>
        
        <Typography variant="body2" className="text-gray-600 mb-4 line-clamp-3">
          {category.description}
        </Typography>
        
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <Typography variant="caption" className="text-gray-500 font-medium">
            View today&apos;s featured paper
          </Typography>
          <Icon 
            name="arrow-right" 
            className="w-4 h-4 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all duration-200" 
          />
        </div>
      </Card>
    </Link>
  );
}

export default function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Categories', href: '/categories' },
  ];

  const categoryEntries = Object.entries(categories) as [CategoryKey, typeof categories[CategoryKey]][];
  
  // Prepare categories for search
  const searchableCategories = useMemo(() => 
    categoryEntries.map(([key, category]) => ({
      key,
      name: category.name,
      description: category.description,
    }))
  , [categoryEntries]);

  // Filter categories based on search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categoryEntries;
    
    const lowercaseQuery = searchQuery.toLowerCase();
    return categoryEntries.filter(([key, category]) =>
      category.name.toLowerCase().includes(lowercaseQuery) ||
      key.toLowerCase().includes(lowercaseQuery) ||
      category.description.toLowerCase().includes(lowercaseQuery)
    );
  }, [categoryEntries, searchQuery]);

  const handleCategorySelect = useCallback((categoryKey: string) => {
    window.location.href = `/categories/${categoryKey}`;
  }, []);

  
  // Group filtered categories by main field
  const groupedCategories = filteredCategories.reduce((acc, [key, category]) => {
    const field = key.split('.')[0];
    const fieldName = {
      'cs': 'Computer Science',
      'math': 'Mathematics', 
      'physics': 'Physics',
      'astro': 'Astrophysics',
      'q-bio': 'Quantitative Biology',
      'stat': 'Statistics'
    }[field] || 'Other';
    
    if (!acc[fieldName]) {
      acc[fieldName] = [];
    }
    acc[fieldName].push([key, category]);
    return acc;
  }, {} as Record<string, [CategoryKey, typeof categories[CategoryKey]][]>);

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <Breadcrumb items={breadcrumbItems} />
            
            <div className="mt-6">
              <Typography variant="h1" className="text-4xl font-bold text-gray-900 mb-4">
                Browse Categories
              </Typography>
              <Typography variant="body1" className="text-xl text-gray-600 max-w-3xl mb-8">
                Explore historically significant academic papers organized by arXiv categories. 
                Each category features papers published on this day in previous years, 
                ranked by their citation impact.
              </Typography>
              
              {/* Search Categories */}
              <div className="max-w-2xl">
                <CategorySearch
                  categories={searchableCategories}
                  onCategorySelect={handleCategorySelect}
                  placeholder="Search categories by name, code, or description..."
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <Card className="p-4 text-center bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <Typography variant="h2" className="text-2xl font-bold text-blue-600 mb-1">
                {categoryEntries.length}
              </Typography>
              <Typography variant="caption" className="text-blue-700 font-medium">
                Categories
              </Typography>
            </Card>
            <Card className="p-4 text-center bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <Typography variant="h2" className="text-2xl font-bold text-green-600 mb-1">
                {categoryEntries.reduce((sum, [, cat]) => sum + cat.paperCount, 0).toLocaleString()}
              </Typography>
              <Typography variant="caption" className="text-green-700 font-medium">
                Papers
              </Typography>
            </Card>
            <Card className="p-4 text-center bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <Typography variant="h2" className="text-2xl font-bold text-purple-600 mb-1">
                10
              </Typography>
              <Typography variant="caption" className="text-purple-700 font-medium">
                Years Back
              </Typography>
            </Card>
            <Card className="p-4 text-center bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <Typography variant="h2" className="text-2xl font-bold text-orange-600 mb-1">
                Daily
              </Typography>
              <Typography variant="caption" className="text-orange-700 font-medium">
                Updates
              </Typography>
            </Card>
          </div>

          {/* Categories by Field */}
          {Object.keys(groupedCategories).length === 0 ? (
            <Card className="p-12 text-center bg-gradient-to-br from-gray-50 to-gray-100">
              <Icon name="search-x" className="w-16 h-16 text-gray-400 mx-auto mb-6" />
              <Typography variant="h2" className="text-2xl font-semibold text-gray-900 mb-4">
                No categories found
              </Typography>
              <Typography variant="body1" className="text-gray-600 mb-6 max-w-md mx-auto">
                No categories match your search &quot;{searchQuery}&quot;. Try a different search term or browse all available categories.
              </Typography>
              <Button onClick={() => setSearchQuery('')} variant="primary">
                <Icon name="refresh-cw" className="w-4 h-4 mr-2" />
                Show All Categories
              </Button>
            </Card>
          ) : (
            Object.entries(groupedCategories).map(([fieldName, fieldCategories]) => (
              <div key={fieldName} className="mb-12">
                <Typography variant="h2" className="text-2xl font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200">
                  {fieldName}
                </Typography>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {fieldCategories.map(([categoryKey, category]) => (
                    <CategoryCard
                      key={categoryKey}
                      categoryKey={categoryKey}
                      category={category}
                      href={`/categories/${categoryKey}`}
                    />
                  ))}
                </div>
              </div>
            ))
          )}

          {/* Call to Action */}
          <Card className="p-8 text-center bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-blue-200">
            <Typography variant="h2" className="text-2xl font-semibold text-gray-900 mb-4">
              Can&apos;t find what you&apos;re looking for?
            </Typography>
            <Typography variant="body1" className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Browse through our complete paper history or return to today&apos;s featured paper across all categories.
            </Typography>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/history" className="inline-flex">
                <Button variant="primary" size="lg" className="w-full">
                  <Icon name="clock" className="w-5 h-5 mr-2" />
                  Browse History
                </Button>
              </Link>
              <Link href="/" className="inline-flex">
                <Button variant="outline" size="lg" className="w-full">
                  <Icon name="home" className="w-5 h-5 mr-2" />
                  Today&apos;s Featured
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}