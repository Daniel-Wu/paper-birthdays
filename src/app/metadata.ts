import { Metadata } from 'next';

/**
 * Generate dynamic metadata for the home page based on featured paper
 */
export async function generateHomePageMetadata(): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://paperbirthdays.com';
  
  try {
    // In a real implementation, we'd fetch the today's paper data here
    // For now, we'll use default metadata with dynamic date
    const today = new Date();
    const dateString = today.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
    
    return {
      title: `Today's Featured Paper - ${dateString}`,
      description: `Discover a historically significant academic paper published on ${dateString} in previous years. Explore groundbreaking research from arXiv with citation data from Semantic Scholar.`,
      keywords: [
        'academic papers',
        'daily paper',
        'research discovery',
        'arxiv',
        'semantic scholar',
        'scientific research',
        'academic history',
        'research papers',
        'citations',
        dateString
      ],
      openGraph: {
        title: `Today's Featured Paper - ${dateString}`,
        description: `Discover a historically significant academic paper published on ${dateString} in previous years.`,
        url: baseUrl,
        siteName: 'Paper Birthdays',
        type: 'website',
        images: [
          {
            url: `${baseUrl}/og-image.png`,
            width: 1200,
            height: 630,
            alt: `Paper Birthdays - Featured Paper for ${dateString}`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `Today's Featured Paper - ${dateString}`,
        description: `Discover a historically significant academic paper published on ${dateString} in previous years.`,
        images: [`${baseUrl}/og-image.png`],
      },
      alternates: {
        canonical: '/',
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    
    // Fallback to default metadata
    return {
      title: 'Today\'s Featured Paper',
      description: 'Discover historically significant academic papers published on this day in previous years.',
      alternates: {
        canonical: '/',
      },
    };
  }
}

/**
 * Generate structured data for academic papers
 */
export function generatePaperStructuredData(paper: {
  title: string;
  authors: { name: string }[];
  abstract: string;
  submittedDate: string;
  arxivId: string;
  citationCount: number;
  categories: string[];
  pdfUrl: string;
  abstractUrl: string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://paperbirthdays.com';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'ScholarlyArticle',
    name: paper.title,
    headline: paper.title,
    abstract: paper.abstract,
    author: paper.authors.map(author => ({
      '@type': 'Person',
      name: author.name,
    })),
    datePublished: paper.submittedDate,
    publisher: {
      '@type': 'Organization',
      name: 'arXiv',
      url: 'https://arxiv.org',
    },
    url: paper.abstractUrl,
    identifier: [
      {
        '@type': 'PropertyValue',
        propertyID: 'arXiv',
        value: paper.arxivId,
      },
    ],
    citation: paper.citationCount,
    about: paper.categories.map(category => ({
      '@type': 'Thing',
      name: category,
    })),
    mainEntity: {
      '@type': 'DigitalDocument',
      name: `${paper.title} - PDF`,
      url: paper.pdfUrl,
      encodingFormat: 'application/pdf',
    },
    isPartOf: {
      '@type': 'WebSite',
      name: 'Paper Birthdays',
      url: baseUrl,
    },
  };
}