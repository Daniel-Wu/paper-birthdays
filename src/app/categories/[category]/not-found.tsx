/**
 * 404 Not Found Page for Invalid Categories
 */

import Link from 'next/link';
import { MainLayout, Breadcrumb } from '@/components/layout';
import { Card, Button, Icon } from '@/components/ui';
import { Typography } from '@/components/ui/typography-compat';

export default function CategoryNotFound() {
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Categories', href: '/categories' },
    { label: 'Not Found', href: '#' },
  ];

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumb items={breadcrumbItems} />
          
          <div className="mt-6 max-w-2xl mx-auto">
            <Card className="p-12 text-center bg-gradient-to-br from-red-50 to-pink-50 border-red-200">
              <Icon name="search-x" className="w-16 h-16 text-red-500 mx-auto mb-6" />
              
              <Typography variant="h1" className="text-3xl font-bold text-gray-900 mb-4">
                Category Not Found
              </Typography>
              
              <Typography variant="body1" className="text-lg text-gray-600 mb-8">
                The category you&apos;re looking for doesn&apos;t exist or may have been moved. 
                Browse our available categories to discover papers from different research areas.
              </Typography>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/categories" className="inline-flex">
                  <Button variant="primary" size="lg" className="w-full">
                    <Icon name="grid" className="w-5 h-5 mr-2" />
                    Browse All Categories
                  </Button>
                </Link>
                
                <Link href="/" className="inline-flex">
                  <Button variant="outline" size="lg" className="w-full">
                    <Icon name="home" className="w-5 h-5 mr-2" />
                    Back to Home
                  </Button>
                </Link>
              </div>
              
              <div className="mt-8 pt-8 border-t border-red-200">
                <Typography variant="caption" className="text-red-600">
                  Need help? Contact us if you believe this is an error.
                </Typography>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}