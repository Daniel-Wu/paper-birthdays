/**
 * Structured Data Components for SEO
 * Provides JSON-LD schema markup
 */

import { Paper } from '@/components/paper/types';

interface WebsiteStructuredDataProps {
  name: string;
  description: string;
  url: string;
}

export function WebsiteStructuredData({ name, description, url }: WebsiteStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": name,
    "description": description,
    "url": url,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${url}/categories?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Paper Birthdays",
      "url": url
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

interface ScholarlyArticleStructuredDataProps {
  paper: Paper;
  featuredDate: string;
  url: string;
}

export function ScholarlyArticleStructuredData({ 
  paper, 
  featuredDate, 
  url 
}: ScholarlyArticleStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    "headline": paper.title,
    "abstract": paper.abstract,
    "author": paper.authors.map(author => ({
      "@type": "Person",
      "name": author.name
    })),
    "datePublished": paper.submittedDate,
    "url": paper.abstractUrl,
    "identifier": {
      "@type": "PropertyValue",
      "name": "arXiv ID",
      "value": paper.arxivId
    },
    "citation": `arXiv:${paper.arxivId}`,
    "about": paper.categories.map(category => ({
      "@type": "DefinedTerm",
      "name": category,
      "inDefinedTermSet": "arXiv Subject Classifications"
    })),
    "publisher": {
      "@type": "Organization",
      "name": "arXiv",
      "url": "https://arxiv.org"
    },
    "license": "https://arxiv.org/licenses/nonexclusive-distrib/1.0/",
    "isAccessibleForFree": true,
    "mentions": {
      "@type": "WebPage",
      "name": "Paper Birthdays",
      "url": url,
      "description": `Featured on Paper Birthdays on ${featuredDate}`
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

interface CollectionPageStructuredDataProps {
  name: string;
  description: string;
  url: string;
  numberOfItems: number;
  category?: string;
}

export function CollectionPageStructuredData({
  name,
  description,
  url,
  numberOfItems,
  category
}: CollectionPageStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": name,
    "description": description,
    "url": url,
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": numberOfItems,
      "about": category ? {
        "@type": "DefinedTerm",
        "name": category,
        "inDefinedTermSet": "arXiv Subject Classifications"
      } : "Academic Papers"
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": url.replace(/\/[^\/]*$/, '')
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": name,
          "item": url
        }
      ]
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

interface BreadcrumbStructuredDataProps {
  items: Array<{
    name: string;
    url: string;
  }>;
}

export function BreadcrumbStructuredData({ items }: BreadcrumbStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

interface FAQStructuredDataProps {
  questions: Array<{
    question: string;
    answer: string;
  }>;
}

export function FAQStructuredData({ questions }: FAQStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": questions.map(({ question, answer }) => ({
      "@type": "Question",
      "name": question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": answer
      }
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}