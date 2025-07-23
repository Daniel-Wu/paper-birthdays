'use client';

import React from 'react';
import Link from 'next/link';
import { MainLayout, Breadcrumb } from '@/components/layout';
import { Card, Button, Icon } from '@/components/ui';
import { Typography } from '@/components/ui/typography-compat';
import { FavoritesList, FavoritesProvider } from '@/components/features';
import { CollectionPageStructuredData, BreadcrumbStructuredData } from '@/components/seo';
import type { Paper } from '@/lib/api/types';

function FavoritesPageContent() {
  const handlePaperClick = (paper: Paper) => {
    // Navigate to paper details or open external link
    window.open(paper.abstractUrl, '_blank');
  };

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'My Favorites', href: '/favorites' },
  ];
  
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://paperbirthdays.com';
  const structuredDataBreadcrumbs = [
    { name: 'Home', url: siteUrl },
    { name: 'My Favorites', url: `${siteUrl}/favorites` },
  ];

  return (
    <MainLayout>
      <CollectionPageStructuredData
        name="My Favorites - Paper Birthdays"
        description="Your personal collection of favorite academic papers from Paper Birthdays"
        url={`${siteUrl}/favorites`}
        numberOfItems={0} // Will be updated by the FavoritesList component
      />
      <BreadcrumbStructuredData items={structuredDataBreadcrumbs} />
      
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumb items={breadcrumbItems} />
          
          <div className="mt-6">
            {/* Header */}
            <div className="mb-8 text-center">
              <Typography variant="h1" className="text-4xl font-bold text-gray-900 mb-4">
                ❤️ My Favorites
              </Typography>
              <Typography variant="body1" className="text-xl text-gray-600 max-w-3xl mx-auto">
                Your personal collection of interesting papers. Add papers to your favorites 
                while browsing to build your own curated research library.
              </Typography>
            </div>

            {/* Quick Actions */}
            <Card className="p-6 mb-8 bg-gradient-to-r from-red-50 to-pink-50 border-red-200">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <Typography variant="h2" className="text-lg font-semibold text-gray-900 mb-2">
                    Manage Your Collection
                  </Typography>
                  <Typography variant="body2" className="text-gray-600">
                    Organize, search, and export your favorite papers
                  </Typography>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/" className="inline-flex">
                    <Button variant="primary" className="flex items-center gap-2">
                      <Icon name="search" className="w-4 h-4" />
                      Discover Papers
                    </Button>
                  </Link>
                  <Link href="/categories" className="inline-flex">
                    <Button variant="outline" className="flex items-center gap-2">
                      <Icon name="grid" className="w-4 h-4" />
                      Browse Categories
                    </Button>
                  </Link>
                  <Link href="/history" className="inline-flex">
                    <Button variant="outline" className="flex items-center gap-2">
                      <Icon name="clock" className="w-4 h-4" />
                      View History
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>

            {/* Favorites List */}
            <div className="max-w-6xl mx-auto">
              <FavoritesList
                onPaperClick={handlePaperClick}
                sortBy="newest"
                className="w-full"
              />
            </div>

            {/* Help Section */}
            <Card className="p-8 mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <div className="max-w-4xl mx-auto">
                <Typography variant="h2" className="text-2xl font-semibold text-gray-900 mb-6 text-center">
                  How to Use Favorites
                </Typography>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon name="heart" className="w-6 h-6 text-red-600" />
                    </div>
                    <Typography variant="h3" className="text-lg font-semibold text-gray-900 mb-2">
                      Add to Favorites
                    </Typography>
                    <Typography variant="body2" className="text-gray-600">
                      Click the heart icon on any paper card to add it to your favorites collection.
                    </Typography>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon name="tag" className="w-6 h-6 text-blue-600" />
                    </div>
                    <Typography variant="h3" className="text-lg font-semibold text-gray-900 mb-2">
                      Organize with Tags
                    </Typography>
                    <Typography variant="body2" className="text-gray-600">
                      Add custom tags and notes to your favorites to organize them by topic or research area.
                    </Typography>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon name="download" className="w-6 h-6 text-green-600" />
                    </div>
                    <Typography variant="h3" className="text-lg font-semibold text-gray-900 mb-2">
                      Export & Share
                    </Typography>
                    <Typography variant="body2" className="text-gray-600">
                      Export your favorites as JSON for backup or sharing with colleagues and collaborators.
                    </Typography>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default function FavoritesPage() {
  return (
    <FavoritesProvider>
      <FavoritesPageContent />
    </FavoritesProvider>
  );
}