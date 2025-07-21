# Paper Birthdays - Technical Specification

## 1. Executive Summary

Paper Birthdays is a Next.js web application that displays historically significant academic papers published on the current date in previous years. The app fetches papers from arXiv, retrieves citation counts from Semantic Scholar, and presents the most cited papers from each day. Users can explore papers both on the main page (showing top papers across all categories) and by specific subcategories.

## 2. Core Features

### 2.1 Main Features
- **Daily Paper Display**: Show one randomly selected paper from the top 10 most cited papers published on this day in history
- **Category Filtering**: Browse papers by specific arXiv subcategories (e.g., cs.AI, math.GT)
- **Historical View**: Access papers featured on previous days
- **Paper Details**: Display comprehensive metadata including title, abstract, authors, submission date, and citation count
- **External Links**: Direct links to PDF downloads and arXiv abstract pages
- **Share Functionality**: Social sharing capabilities for interesting papers

### 2.2 Data Sources
- **arXiv API**: Paper metadata, abstracts, and submission dates
- **Semantic Scholar API**: Citation counts and additional paper metrics

## 3. Technical Architecture

### 3.1 Technology Stack
- **Frontend**: Next.js 14+ with App Router
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL
- **Deployment**: Railway

### 3.2 System Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│                 │     │                  │     │                 │
│  Next.js App    │────▶│  Backend API     │────▶│  PostgreSQL     │
│  (Frontend)     │     │  (API Routes)    │     │  Database       │
│                 │     │                  │     │                 │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │
                               │
                    ┌──────────┴──────────┐
                    │                     │
                    ▼                     ▼
            ┌───────────────┐    ┌───────────────┐
            │   arXiv API   │    │ Semantic      │
            │               │    │ Scholar API   │
            └───────────────┘    └───────────────┘
```

## 4. Database Schema

### 4.1 Tables

#### papers
```sql
CREATE TABLE papers (
    id SERIAL PRIMARY KEY,
    arxiv_id VARCHAR(50) UNIQUE NOT NULL,
    title TEXT NOT NULL,
    abstract TEXT NOT NULL,
    authors JSONB NOT NULL, -- Array of author objects
    categories TEXT[] NOT NULL,
    primary_category VARCHAR(20) NOT NULL,
    submitted_date DATE NOT NULL,
    updated_date DATE,
    pdf_url TEXT NOT NULL,
    abstract_url TEXT NOT NULL,
    citation_count INTEGER DEFAULT 0,
    semantic_scholar_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_papers_submitted_date ON papers(submitted_date);
CREATE INDEX idx_papers_primary_category ON papers(primary_category);
CREATE INDEX idx_papers_citation_count ON papers(citation_count);
```

#### daily_featured_papers
```sql
CREATE TABLE daily_featured_papers (
    id SERIAL PRIMARY KEY,
    feature_date DATE NOT NULL,
    category VARCHAR(20), -- NULL for main page
    paper_id INTEGER REFERENCES papers(id),
    rank_in_day INTEGER NOT NULL, -- 1-10 ranking by citations
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(feature_date, category, paper_id)
);

CREATE INDEX idx_daily_featured_date ON daily_featured_papers(feature_date);
CREATE INDEX idx_daily_featured_category ON daily_featured_papers(category);
```

#### fetch_history
```sql
CREATE TABLE fetch_history (
    id SERIAL PRIMARY KEY,
    fetch_date DATE NOT NULL,
    fetch_type VARCHAR(20) NOT NULL, -- 'daily', 'category'
    category VARCHAR(20),
    papers_fetched INTEGER,
    status VARCHAR(20) NOT NULL, -- 'success', 'partial', 'failed'
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 5. API Design

### 5.1 Internal API Endpoints

#### GET /api/paper/today
Returns today's featured paper (main page)
```typescript
Response: {
  paper: {
    id: string,
    arxivId: string,
    title: string,
    abstract: string,
    authors: Author[],
    categories: string[],
    primaryCategory: string,
    submittedDate: string,
    citationCount: number,
    pdfUrl: string,
    abstractUrl: string
  },
  featuredDate: string
}
```

#### GET /api/paper/category/:category
Returns today's featured paper for a specific category
```typescript
Response: {
  paper: Paper,
  category: string,
  featuredDate: string
}
```

#### GET /api/paper/history
Returns featured papers from previous days
```typescript
Query params: {
  page?: number,
  limit?: number,
  category?: string
}

Response: {
  papers: Array<{
    paper: Paper,
    featuredDate: string,
    category?: string
  }>,
  pagination: {
    page: number,
    limit: number,
    total: number
  }
}
```

### 5.2 External API Integration

#### arXiv API Integration
```typescript
interface ArxivSearchParams {
  query: string;
  start: number;
  maxResults: number;
  sortBy?: 'submittedDate' | 'relevance';
  sortOrder?: 'ascending' | 'descending';
}

// Example query for papers submitted on specific date
const query = `submittedDate:[${date}0000 TO ${date}2359]`;
```

#### Semantic Scholar API Integration
```typescript
interface SemanticScholarPaper {
  paperId: string;
  arxivId?: string;
  title: string;
  citationCount: number;
  influentialCitationCount?: number;
}

// Batch endpoint for efficiency
const BATCH_ENDPOINT = 'https://api.semanticscholar.org/graph/v1/paper/batch';
```

## 6. Core Components

### 6.1 Frontend Components

```typescript
// Main page component
interface PaperDisplayProps {
  paper: Paper;
  showShareButton?: boolean;
  showCategoryFilter?: boolean;
}

// Category selector
interface CategorySelectorProps {
  categories: Category[];
  selectedCategory?: string;
  onCategoryChange: (category: string) => void;
}

// Historical view
interface HistoricalViewProps {
  papers: FeaturedPaper[];
  onLoadMore: () => void;
}
```

### 6.2 Backend Services

```typescript
// Paper fetching service
class PaperFetchService {
  async fetchPapersForDate(date: Date, category?: string): Promise<Paper[]>
  async enrichWithCitations(papers: Paper[]): Promise<Paper[]>
  async selectTopPapers(papers: Paper[], count: number): Promise<Paper[]>
}

// Caching service
class CacheService {
  async getCachedPaper(date: Date, category?: string): Promise<Paper | null>
  async cachePaper(paper: Paper, date: Date, category?: string): Promise<void>
}
```

## 7. Implementation Details

### 7.1 Daily Paper Selection Algorithm

```typescript
async function selectDailyPaper(date: Date, category?: string): Promise<Paper> {
  // 1. Check cache first
  const cached = await getCachedPaper(date, category);
  if (cached) return cached;

  // 2. Calculate date range (last 10 years)
  const dateRanges = getLast10YearsDateRanges(date);

  // 3. Fetch papers from arXiv
  const papers = await fetchPapersFromDateRanges(dateRanges, category);

  // 4. Enrich with citation data from Semantic Scholar
  const enrichedPapers = await enrichWithCitations(papers);

  // 5. Get top 10 by citation count
  const topPapers = enrichedPapers
    .sort((a, b) => b.citationCount - a.citationCount)
    .slice(0, 10);

  // 6. Randomly select one
  const selectedPaper = topPapers[Math.floor(Math.random() * topPapers.length)];

  // 7. Cache the selection and rankings
  await cacheDailySelection(date, category, topPapers, selectedPaper);

  return selectedPaper;
}
```

### 7.2 Scheduled Jobs

```typescript
// Daily cron job to pre-fetch papers
// Runs at 00:01 UTC daily
async function dailyPaperFetchJob() {
  const today = new Date();
  const categories = ['all', 'cs.AI', 'cs.LG', 'math.GT', ...]; // All subcategories

  for (const category of categories) {
    try {
      await selectDailyPaper(today, category === 'all' ? null : category);
    } catch (error) {
      await logFetchError(today, category, error);
    }
  }
}
```

### 7.3 Rate Limiting Strategy

```typescript
class RateLimiter {
  private arxivLimiter = new Bottleneck({
    minTime: 3000, // 3 seconds between requests
    maxConcurrent: 1
  });

  private semanticScholarLimiter = new Bottleneck({
    minTime: 1000, // 1 request per second
    maxConcurrent: 1
  });
}
```

## 8. User Interface Design

### 8.1 Main Page Layout
```
┌─────────────────────────────────────────────────┐
│                   Paper Birthdays                │
│                                                  │
│  [Category Selector ▼]         [Share] [History] │
|                                                  |
│                                                  │
│  📅 On this day in 2019                          │
│                                                  │
│  Title: "Attention Is All You Need"              │
│  Authors: Vaswani et al.                         │
│  Citations: 45,678                               │
│                                                  │
│  Abstract: The dominant sequence transduction... │
│  [Read more...]                                  │
│                                                  │
│  [📄 PDF] [🔗 arXiv Page] [Share]                │
│  [See more categories ->]                        |
|  [Check out History -> ]                         |
└─────────────────────────────────────────────────┘
```

### 8.2 Category View
- Dropdown with all arXiv subcategories
- Organized by main categories (cs, math, physics, etc.)
- Search within dropdown for quick navigation

### 8.3 Historical View
- Selectable Calendar or list view of previous days
- Filter by category
- Infinite scroll

## 9. Performance Optimization

### 9.1 Caching Strategy
- **Database Level**: Store all fetched papers permanently
- **Application Level**: Cache today's selections in memory
- **CDN Level**: Static assets and API responses where appropriate

### 9.2 Query Optimization
- Batch API calls to Semantic Scholar (up to 500 papers per request)

## 10. Security & Best Practices

### 10.1 API Key Management
- Store API keys in environment variables
- Use Next.js API routes to proxy external API calls
- Never expose API keys to frontend

### 10.2 Error Handling
- Graceful fallbacks for API failures
- Retry logic with exponential backoff
- User-friendly error messages

### 11 Environment Variables
```env
DATABASE_URL=postgresql://...
SEMANTIC_SCHOLAR_API_KEY=...
NEXT_PUBLIC_SITE_URL=https://paperbirthdays.com
```

