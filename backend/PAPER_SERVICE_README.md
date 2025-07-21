# Paper Service Documentation

## Overview

The `paper_service.py` module implements the core business logic for "Paper Birthdays" - a system that selects historically significant academic papers for each day of the year. This module provides the daily paper selection algorithm, caching system, and database integration.

## Core Algorithm

The daily paper selection follows this algorithm:

1. **Cache Check**: First check if a paper is already cached for the target date/category
2. **Date Range Calculation**: Calculate the last 10 years of the same month/day
3. **Paper Fetching**: Fetch papers from arXiv for all historical dates
4. **Citation Enrichment**: Enrich papers with citation data from Semantic Scholar
5. **Ranking**: Sort papers by citation count and select top 10
6. **Random Selection**: Randomly select one paper from the top 10
7. **Storage**: Store the selection and rankings in the database
8. **Caching**: Cache the result for 24 hours

## Key Components

### PaperService Class

The main service class that orchestrates the paper selection process.

#### Main Methods

- `get_daily_paper(target_date, category=None)` - Main algorithm entry point
- `get_last_10_years_dates(target_date)` - Calculate historical dates
- `fetch_and_enrich_papers(dates, category=None)` - Fetch and enrich papers
- `select_top_papers(papers, count=10)` - Rank papers by citations
- `store_daily_selection(...)` - Store results in database

### Caching System

Simple in-memory caching with TTL (Time To Live) support:

- **Cache Key Format**: `{date}_{category}` (e.g., "2024-01-15_cs.AI" or "2024-01-15_all")
- **TTL**: 24 hours (configurable via `settings.cache_ttl_hours`)
- **Storage**: Python dictionary with expiration timestamps

#### Cache Management Functions

- `clear_expired_cache()` - Remove expired entries
- `get_cache_stats()` - Get cache statistics
- `clear_all_cache()` - Clear all cache entries

### Database Integration

The service integrates with three main database tables:

1. **papers** - Stores paper metadata and citation counts
2. **daily_featured_papers** - Stores daily selections and rankings (1-10)
3. **fetch_history** - Logs all fetch operations for monitoring

## Usage Examples

### Basic Usage

```python
from datetime import date
from paper_service import get_daily_paper

# Get daily paper for any category
paper = get_daily_paper(date(2024, 1, 15))

# Get category-specific paper
ai_paper = get_daily_paper(date(2024, 1, 15), category="cs.AI")
```

### Using the Service Class

```python
from paper_service import PaperService

service = PaperService()

# Get paper with full control
paper = service.get_daily_paper(date(2024, 1, 15), "cs.LG")

# Access individual components
historical_dates = service.get_last_10_years_dates(date(2024, 1, 15))
papers = service.fetch_and_enrich_papers(historical_dates, "cs.AI")
top_papers = service.select_top_papers(papers, count=5)
```

### Cache Management

```python
from paper_service import get_cache_stats, clear_expired_cache

# Check cache status
stats = get_cache_stats()
print(f"Cache has {stats['valid_entries']} valid entries")

# Clean up expired entries
clear_expired_cache()
```

## Date Range Logic

For a target date like January 15, 2024, the algorithm searches:
- January 15, 2023
- January 15, 2022
- January 15, 2021
- ...
- January 15, 2014 (10 years back)

### Leap Year Handling

Special handling for February 29th:
- In non-leap years, February 28th is used instead
- This ensures the algorithm always finds 10 historical dates

## Paper Selection Strategy

1. **Fetch**: Get papers from arXiv for all 10 historical dates
2. **Deduplicate**: Remove duplicate papers (same arXiv ID)
3. **Enrich**: Add citation counts from Semantic Scholar
4. **Rank**: Sort by citation count (descending)
5. **Select**: Take top 10 papers
6. **Randomize**: Randomly select 1 from top 10

This strategy balances:
- **Quality**: High citation counts indicate impact
- **Variety**: Random selection from top papers adds diversity
- **Relevance**: Historical significance for the specific date

## Error Handling

The service includes comprehensive error handling:

- **API Failures**: Gracefully handle external API timeouts/errors
- **Database Issues**: Transaction rollback and connection management
- **Data Quality**: Handle missing or malformed data
- **Rate Limiting**: Respect API rate limits with exponential backoff

All errors are logged with appropriate detail for debugging.

## Configuration

Key configuration options in `config.py`:

```python
class Settings:
    # Cache settings
    cache_ttl_hours: int = 24
    
    # API rate limiting
    arxiv_rate_limit_seconds: int = 3
    semantic_scholar_rate_limit_seconds: int = 1
    
    # API keys
    semantic_scholar_api_key: str = "..."
```

## Testing

Run the test suite to verify functionality:

```bash
# Activate virtual environment
source venv/bin/activate

# Run tests
python test_paper_service.py

# Run example usage
python example_usage.py
```

## Performance Considerations

- **Caching**: 24-hour TTL reduces API calls
- **Batch Processing**: Semantic Scholar batch API for citations
- **Rate Limiting**: Respects API limits to avoid being blocked
- **Database Optimization**: Proper indexes on key fields

## Dependencies

- **SQLAlchemy**: Database ORM and connection management
- **httpx**: HTTP client for external API calls
- **External APIs**: arXiv and Semantic Scholar clients
- **Logging**: Python standard logging module

## Monitoring

The service logs all operations and stores fetch history in the database:

- **Success/Failure rates**: Track via `fetch_history` table
- **Performance metrics**: Monitor API response times
- **Cache effectiveness**: Use `get_cache_stats()`
- **Error patterns**: Review logs for recurring issues

## Future Enhancements

Potential improvements:

1. **Redis Cache**: Replace in-memory cache with Redis for scalability
2. **Background Processing**: Async paper fetching and caching
3. **ML Ranking**: Use machine learning for better paper selection
4. **User Preferences**: Personalized paper recommendations
5. **API Optimization**: Implement more sophisticated caching strategies