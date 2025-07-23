/**
 * Individual Category Page
 * Dynamic route for specific categories (e.g., /categories/cs.AI)
 * Shows today's featured paper for that category
 */

'use client';

import { use, Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MainLayout, Breadcrumb } from '@/components/layout';
import { Card, Badge, Button, Icon, Skeleton } from '@/components/ui';
import { Typography } from '@/components/ui/typography-compat';
import { PaperCard } from '@/components/paper';
import { useCategoryPaper } from '@/lib/api';

// Category definitions (should be shared between pages)
const categories = {
  'cs.AI': {
    name: 'Artificial Intelligence',
    description: 'AI and machine intelligence research, including automated reasoning, knowledge representation, and intelligent agents',
    color: 'primary',
    icon: 'brain',
  },
  'cs.LG': {
    name: 'Machine Learning',
    description: 'Learning algorithms, neural networks, statistical learning theory, and machine learning applications',
    color: 'success',
    icon: 'trending-up',
  },
  'cs.CV': {
    name: 'Computer Vision',
    description: 'Image processing, pattern recognition, computer vision, and visual understanding systems',
    color: 'info',
    icon: 'eye',
  },
  'cs.CL': {
    name: 'Computation and Language',
    description: 'Natural language processing, computational linguistics, and language understanding',
    color: 'warning',
    icon: 'message-square',
  },
  'cs.CR': {
    name: 'Cryptography and Security',
    description: 'Information security, cryptography, network security, and privacy protection',
    color: 'error',
    icon: 'shield',
  },
  'cs.DS': {
    name: 'Data Structures and Algorithms',
    description: 'Algorithms, data structures, computational complexity, and algorithmic analysis',
    color: 'secondary',
    icon: 'git-branch',
  },
  'math.GT': {
    name: 'Geometric Topology',
    description: 'Topology, geometric structures, manifolds, and topological invariants',
    color: 'primary',
    icon: 'shapes',
  },
  'math.NT': {
    name: 'Number Theory',
    description: 'Prime numbers, arithmetic functions, algebraic number theory, and Diophantine equations',
    color: 'success',
    icon: 'hash',
  },
  'physics.gen-ph': {
    name: 'General Physics',
    description: 'General physics research, theoretical physics, and interdisciplinary physics studies',
    color: 'info',
    icon: 'atom',
  },
  'astro-ph': {
    name: 'Astrophysics',
    description: 'Astronomy, astrophysics, cosmology, and observational studies of celestial objects',
    color: 'warning',
    icon: 'star',
  },
  'q-bio.BM': {
    name: 'Biomolecules',
    description: 'Biological molecules, protein structures, molecular biology, and biochemistry',
    color: 'error',
    icon: 'dna',
  },
  'stat.ML': {
    name: 'Machine Learning Statistics',
    description: 'Statistical methods for machine learning, probabilistic models, and statistical inference',
    color: 'secondary',
    icon: 'bar-chart',
  },
} as const;

type CategoryKey = keyof typeof categories;

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

function CategoryHeader({ categoryKey, category }: { categoryKey: string; category: typeof categories[CategoryKey] }) {
  return (
    <Card className="p-8 mb-8 bg-gradient-to-br from-blue-50 via-white to-indigo-50 border-blue-200">
      <div className="flex items-start gap-6">
        <div className="p-4 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100">
          <Icon 
            name={category.icon as string}
            className="w-8 h-8 text-blue-600"
          />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <Typography variant="h1" className="text-3xl font-bold text-gray-900">
              {category.name}
            </Typography>
            <Badge variant="outline" className="font-mono text-sm">
              {categoryKey}
            </Badge>
          </div>
          
          <Typography variant="body1" className="text-lg text-gray-600 max-w-3xl">
            {category.description}
          </Typography>
          
          <div className="flex items-center gap-4 mt-4">
            <Badge variant={category.color as 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'} className="px-3 py-1">
              Featured Today
            </Badge>
            <Typography variant="caption" className="text-gray-500">
              Papers published on this day in history
            </Typography>
          </div>
        </div>
      </div>
    </Card>
  );
}

function ErrorState({ categoryKey }: { categoryKey: string }) {
  return (
    <Card className="p-8 text-center bg-gradient-to-br from-red-50 to-pink-50 border-red-200">
      <Icon name="alert-circle" className="w-12 h-12 text-red-500 mx-auto mb-4" />
      <Typography variant="h2" className="text-xl font-semibold text-gray-900 mb-2">
        No Papers Found
      </Typography>
      <Typography variant="body1" className="text-gray-600 mb-6 max-w-md mx-auto">
        We couldn&apos;t find any featured papers for {categoryKey} today. 
        This might be because no papers were published in this category on this date in previous years.
      </Typography>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/categories" className="inline-flex">
          <Button variant="primary">
            <Icon name="arrow-left" className="w-4 h-4 mr-2" />
            Browse Other Categories
          </Button>
        </Link>
        <Link href="/history" className="inline-flex">
          <Button variant="outline">
            <Icon name="clock" className="w-4 h-4 mr-2" />
            View History
          </Button>
        </Link>
      </div>
    </Card>
  );
}

function LoadingState() {
  return (
    <div className="space-y-6">
      <Card className="p-8">
        <div className="flex items-start gap-6">
          <Skeleton className="w-16 h-16 rounded-xl" />
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-6 w-16" />
            </div>
            <Skeleton className="h-5 w-full max-w-2xl" />
            <Skeleton className="h-5 w-3/4 max-w-xl" />
            <div className="flex items-center gap-4 pt-2">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </div>
      </Card>
      
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <Card className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-20 w-full" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-20" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function CategoryPageContent({ category }: { category: string }) {
  const { data, error, isLoading } = useCategoryPaper(category);
  
  // Check if category exists
  const categoryInfo = categories[category as CategoryKey];
  if (!categoryInfo) {
    notFound();
  }

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Categories', href: '/categories' },
    { label: categoryInfo.name, href: `/categories/${category}` },
  ];

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
          <div className="container mx-auto px-4 py-8">
            <Breadcrumb items={breadcrumbItems} />
            <div className="mt-6">
              <LoadingState />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !data?.paper) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
          <div className="container mx-auto px-4 py-8">
            <Breadcrumb items={breadcrumbItems} />
            <div className="mt-6">
              <CategoryHeader categoryKey={category} category={categoryInfo} />
              <ErrorState categoryKey={category} />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  const formattedDate = new Date(data.featuredDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumb items={breadcrumbItems} />
          
          <div className="mt-6">
            <CategoryHeader categoryKey={category} category={categoryInfo} />
            
            {/* Featured Paper Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <Typography variant="h2" className="text-2xl font-semibold text-gray-900 mb-2">
                    Featured Paper
                  </Typography>
                  <Typography variant="body1" className="text-gray-600">
                    Published on this day • {formattedDate}
                  </Typography>
                </div>
              </div>
              
              <PaperCard 
                paper={data.paper}
                variant="featured"
                showShareButton={true}
                showExternalLinks={true}
                featuredDate={data.featuredDate}
              />
            </div>

            {/* Navigation Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <div className="flex items-center gap-4 mb-4">
                  <Icon name="layers" className="w-6 h-6 text-blue-600" />
                  <Typography variant="h3" className="text-lg font-semibold text-gray-900">
                    Explore More Categories
                  </Typography>
                </div>
                <Typography variant="body2" className="text-gray-600 mb-4">
                  Discover papers from other research areas and scientific disciplines.
                </Typography>
                <Link href="/categories" className="inline-flex w-full">
                  <Button variant="primary" className="w-full">
                    <Icon name="grid" className="w-4 h-4 mr-2" />
                    Browse All Categories
                  </Button>
                </Link>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <div className="flex items-center gap-4 mb-4">
                  <Icon name="clock" className="w-6 h-6 text-green-600" />
                  <Typography variant="h3" className="text-lg font-semibold text-gray-900">
                    Historical Papers
                  </Typography>
                </div>
                <Typography variant="body2" className="text-gray-600 mb-4">
                  Browse through featured papers from previous days across all categories.
                </Typography>
                <Link href="/history" className="inline-flex w-full">
                  <Button variant="primary" className="w-full">
                    <Icon name="history" className="w-4 h-4 mr-2" />
                    View Paper History
                  </Button>
                </Link>
              </Card>
            </div>

            {/* Additional Info */}
            <Card className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200">
              <div className="flex items-start gap-4">
                <Icon name="info" className="w-6 h-6 text-gray-500 mt-1" />
                <div>
                  <Typography variant="h3" className="text-lg font-semibold text-gray-900 mb-2">
                    How Papers Are Selected
                  </Typography>
                  <Typography variant="body2" className="text-gray-600 leading-relaxed">
                    Each day, we search through the last 10 years of papers published on this date in the{' '}
                    <strong>{categoryInfo.name}</strong> category. We then rank them by citation count from{' '}
                    Semantic Scholar and randomly select one from the top 10 most cited papers. This ensures{' '}
                    you discover both highly impactful and historically significant research.
                  </Typography>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const resolvedParams = use(params);
  const { category } = resolvedParams;

  return (
    <Suspense fallback={<LoadingState />}>
      <CategoryPageContent category={category} />
    </Suspense>
  );
}


