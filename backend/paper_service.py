from datetime import date, datetime, timedelta
from typing import List, Dict, Optional, Any
import logging
import random
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from database import (
    get_db, Paper, DailyFeaturedPaper, FetchHistory, 
    create_paper, get_paper_by_arxiv_id, SessionLocal
)
from external_apis import (
    ArxivClient, SemanticScholarClient, 
    convert_arxiv_to_paper_dict, get_arxiv_papers_for_date,
    get_citation_counts_for_papers
)
from config import settings

# Set up logging
logger = logging.getLogger(__name__)

# In-memory cache with TTL support
_paper_cache: Dict[str, Dict[str, Any]] = {}


class PaperService:
    """Core service for paper selection algorithm and caching"""
    
    def __init__(self):
        self.arxiv_client = ArxivClient()
        self.semantic_scholar_client = SemanticScholarClient()
    
    def get_daily_paper(self, target_date: date, category: str = None) -> Optional[Dict[str, Any]]:
        """
        Main algorithm function to get daily paper
        
        Args:
            target_date: The date to get a paper for
            category: Optional category filter (e.g., 'cs.AI')
            
        Returns:
            Dictionary representation of the selected paper or None if no paper found
        """
        logger.info(f"Getting daily paper for {target_date}, category: {category}")
        
        try:
            # 1. Check cache first
            cached_paper = self._get_cached_paper(target_date, category)
            if cached_paper:
                logger.info(f"Returning cached paper for {target_date}, category: {category}")
                return cached_paper
            
            # 2. Calculate date range (last 10 years)
            historical_dates = self.get_last_10_years_dates(target_date)
            logger.info(f"Searching papers from {len(historical_dates)} historical dates")
            
            # 3. Fetch and enrich papers from arXiv and Semantic Scholar
            enriched_papers = self.fetch_and_enrich_papers(historical_dates, category)
            
            if not enriched_papers:
                logger.warning(f"No papers found for {target_date}, category: {category}")
                self._log_fetch_history(target_date, category, 0, "failed", "No papers found")
                return None
            
            # 4. Get top 10 by citation count
            top_papers = self.select_top_papers(enriched_papers, count=10)
            
            if not top_papers:
                logger.warning(f"No top papers selected for {target_date}, category: {category}")
                self._log_fetch_history(target_date, category, len(enriched_papers), "failed", "No top papers selected")
                return None
            
            # 5. Randomly select one from top 10
            selected_paper = random.choice(top_papers)
            logger.info(f"Selected paper: {selected_paper['title'][:100]}... (citations: {selected_paper['citation_count']})")
            
            # 6. Store daily selection and rankings
            self.store_daily_selection(target_date, category, top_papers, selected_paper)
            
            # 7. Cache the selection
            self._cache_paper(target_date, category, selected_paper)
            
            # 8. Log successful fetch
            self._log_fetch_history(target_date, category, len(enriched_papers), "success", None)
            
            return selected_paper
            
        except Exception as e:
            logger.error(f"Error getting daily paper for {target_date}, category {category}: {e}")
            self._log_fetch_history(target_date, category, 0, "failed", str(e))
            raise
    
    def get_last_10_years_dates(self, target_date: date) -> List[date]:
        """
        Get 10 years of the same date (month/day) as target_date
        
        Args:
            target_date: The target date
            
        Returns:
            List of dates from the last 10 years
        """
        dates = []
        current_year = target_date.year
        
        for i in range(10):
            year = current_year - i - 1  # Start from previous year
            try:
                # Handle leap year edge case for Feb 29
                historical_date = date(year, target_date.month, target_date.day)
                dates.append(historical_date)
            except ValueError:
                # Feb 29 in non-leap year - use Feb 28 instead
                if target_date.month == 2 and target_date.day == 29:
                    historical_date = date(year, 2, 28)
                    dates.append(historical_date)
                else:
                    logger.warning(f"Could not create date for {year}-{target_date.month}-{target_date.day}")
        
        logger.info(f"Generated {len(dates)} historical dates: {[d.strftime('%Y-%m-%d') for d in dates]}")
        return dates
    
    def fetch_and_enrich_papers(self, dates: List[date], category: str = None) -> List[Dict[str, Any]]:
        """
        Fetch papers from arXiv for given dates and enrich with citation data
        
        Args:
            dates: List of dates to search
            category: Optional category filter
            
        Returns:
            List of enriched paper dictionaries
        """
        all_papers = []
        arxiv_id_to_paper = {}
        
        # Fetch papers from arXiv for each date
        for search_date in dates:
            try:
                logger.info(f"Fetching papers for {search_date}")
                arxiv_papers = get_arxiv_papers_for_date(search_date, category)
                
                for arxiv_paper in arxiv_papers:
                    # Convert to dictionary format and avoid duplicates
                    if arxiv_paper.arxiv_id not in arxiv_id_to_paper:
                        paper_dict = convert_arxiv_to_paper_dict(arxiv_paper)
                        arxiv_id_to_paper[arxiv_paper.arxiv_id] = paper_dict
                        all_papers.append(paper_dict)
                
                logger.info(f"Found {len(arxiv_papers)} papers for {search_date}")
                
            except Exception as e:
                logger.error(f"Failed to fetch papers for {search_date}: {e}")
                continue
        
        if not all_papers:
            logger.warning("No papers found from arXiv")
            return []
        
        logger.info(f"Total unique papers from arXiv: {len(all_papers)}")
        
        # Enrich with citation data from Semantic Scholar
        try:
            arxiv_ids = [paper['arxiv_id'] for paper in all_papers]
            citation_counts = get_citation_counts_for_papers(arxiv_ids)
            
            # Update papers with citation counts
            for paper in all_papers:
                arxiv_id = paper['arxiv_id']
                paper['citation_count'] = citation_counts.get(arxiv_id, 0)
            
            logger.info(f"Successfully enriched {len(all_papers)} papers with citation data")
            
        except Exception as e:
            logger.error(f"Failed to enrich papers with citation data: {e}")
            # Continue with papers but without citation data
        
        return all_papers
    
    def select_top_papers(self, papers: List[Dict[str, Any]], count: int = 10) -> List[Dict[str, Any]]:
        """
        Select top papers by citation count
        
        Args:
            papers: List of paper dictionaries
            count: Number of top papers to select
            
        Returns:
            List of top papers sorted by citation count descending
        """
        # Sort by citation count descending, then by title for deterministic ordering
        sorted_papers = sorted(
            papers, 
            key=lambda p: (p.get('citation_count', 0), p.get('title', '')), 
            reverse=True
        )
        
        top_papers = sorted_papers[:count]
        
        logger.info(f"Selected top {len(top_papers)} papers from {len(papers)} total papers")
        if top_papers:
            logger.info(f"Citation counts range: {top_papers[0].get('citation_count', 0)} to {top_papers[-1].get('citation_count', 0)}")
        
        return top_papers
    
    def store_daily_selection(self, target_date: date, category: str, top_papers: List[Dict[str, Any]], selected_paper: Dict[str, Any]):
        """
        Store daily paper selection and rankings in database
        
        Args:
            target_date: The date for the selection
            category: Category filter used (or None)
            top_papers: List of top papers ranked 1-10
            selected_paper: The randomly selected paper from top_papers
        """
        db = SessionLocal()
        try:
            # Store all top papers in database first
            stored_papers = {}
            
            for paper_dict in top_papers:
                # Check if paper already exists
                existing_paper = get_paper_by_arxiv_id(db, paper_dict['arxiv_id'])
                
                if existing_paper:
                    # Update citation count if it's higher
                    if paper_dict.get('citation_count', 0) > existing_paper.citation_count:
                        existing_paper.citation_count = paper_dict['citation_count']
                        db.commit()
                        db.refresh(existing_paper)
                    stored_papers[paper_dict['arxiv_id']] = existing_paper
                else:
                    # Create new paper
                    try:
                        new_paper = create_paper(db, paper_dict)
                        stored_papers[paper_dict['arxiv_id']] = new_paper
                    except IntegrityError:
                        # Handle race condition where paper was created by another process
                        db.rollback()
                        existing_paper = get_paper_by_arxiv_id(db, paper_dict['arxiv_id'])
                        if existing_paper:
                            stored_papers[paper_dict['arxiv_id']] = existing_paper
            
            # Clear any existing daily featured papers for this date/category
            db.query(DailyFeaturedPaper).filter(
                DailyFeaturedPaper.feature_date == target_date,
                DailyFeaturedPaper.category == category
            ).delete()
            
            # Store rankings for all top papers
            for rank, paper_dict in enumerate(top_papers, 1):
                paper = stored_papers.get(paper_dict['arxiv_id'])
                if paper:
                    daily_featured = DailyFeaturedPaper(
                        feature_date=target_date,
                        category=category,
                        paper_id=paper.id,
                        rank_in_day=rank
                    )
                    db.add(daily_featured)
            
            db.commit()
            logger.info(f"Stored daily selection for {target_date}, category: {category} with {len(top_papers)} ranked papers")
            
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to store daily selection: {e}")
            raise
        finally:
            db.close()
    
    def _get_cached_paper(self, target_date: date, category: str) -> Optional[Dict[str, Any]]:
        """
        Get cached paper if available and not expired
        
        Args:
            target_date: The date for the paper
            category: Category filter (or None)
            
        Returns:
            Cached paper dictionary or None
        """
        cache_key = self._get_cache_key(target_date, category)
        
        if cache_key in _paper_cache:
            cached_entry = _paper_cache[cache_key]
            
            # Check if expired
            if datetime.now() < cached_entry['expires']:
                logger.info(f"Cache hit for {cache_key}")
                return cached_entry['paper']
            else:
                # Remove expired entry
                del _paper_cache[cache_key]
                logger.info(f"Cache expired for {cache_key}")
        
        return None
    
    def _cache_paper(self, target_date: date, category: str, paper: Dict[str, Any]):
        """
        Cache paper with TTL
        
        Args:
            target_date: The date for the paper
            category: Category filter (or None)
            paper: Paper dictionary to cache
        """
        cache_key = self._get_cache_key(target_date, category)
        expires = datetime.now() + timedelta(hours=settings.cache_ttl_hours)
        
        _paper_cache[cache_key] = {
            'paper': paper,
            'timestamp': datetime.now(),
            'expires': expires
        }
        
        logger.info(f"Cached paper for {cache_key}, expires: {expires}")
    
    def _get_cache_key(self, target_date: date, category: str) -> str:
        """
        Generate cache key for date and category
        
        Args:
            target_date: The date
            category: Category filter (or None)
            
        Returns:
            Cache key string
        """
        category_str = category if category else "all"
        return f"{target_date.strftime('%Y-%m-%d')}_{category_str}"
    
    def _log_fetch_history(self, target_date: date, category: str, papers_fetched: int, status: str, error_message: str = None):
        """
        Log fetch operation to database
        
        Args:
            target_date: The date that was searched
            category: Category filter used
            papers_fetched: Number of papers fetched
            status: 'success', 'partial', or 'failed'
            error_message: Error message if status is 'failed'
        """
        db = SessionLocal()
        try:
            fetch_type = "category" if category else "daily"
            
            fetch_history = FetchHistory(
                fetch_date=target_date,
                fetch_type=fetch_type,
                category=category,
                papers_fetched=papers_fetched,
                status=status,
                error_message=error_message
            )
            
            db.add(fetch_history)
            db.commit()
            
        except Exception as e:
            logger.error(f"Failed to log fetch history: {e}")
            db.rollback()
        finally:
            db.close()


# Cache management functions
def clear_expired_cache():
    """Clear expired entries from cache"""
    global _paper_cache
    current_time = datetime.now()
    expired_keys = []
    
    for cache_key, cache_entry in _paper_cache.items():
        if current_time >= cache_entry['expires']:
            expired_keys.append(cache_key)
    
    for key in expired_keys:
        del _paper_cache[key]
    
    if expired_keys:
        logger.info(f"Cleared {len(expired_keys)} expired cache entries")


def get_cache_stats() -> Dict[str, Any]:
    """Get cache statistics"""
    current_time = datetime.now()
    valid_entries = 0
    expired_entries = 0
    
    for cache_entry in _paper_cache.values():
        if current_time < cache_entry['expires']:
            valid_entries += 1
        else:
            expired_entries += 1
    
    return {
        'total_entries': len(_paper_cache),
        'valid_entries': valid_entries,
        'expired_entries': expired_entries,
        'cache_ttl_hours': settings.cache_ttl_hours
    }


def clear_all_cache():
    """Clear all cache entries"""
    global _paper_cache
    cache_size = len(_paper_cache)
    _paper_cache.clear()
    logger.info(f"Cleared all {cache_size} cache entries")


# Convenience functions for easier usage
def get_daily_paper(target_date: date, category: str = None) -> Optional[Dict[str, Any]]:
    """
    Convenience function to get daily paper
    
    Args:
        target_date: The date to get a paper for
        category: Optional category filter
        
    Returns:
        Paper dictionary or None
    """
    service = PaperService()
    return service.get_daily_paper(target_date, category)


def get_last_10_years_dates(target_date: date) -> List[date]:
    """
    Convenience function to get last 10 years dates
    
    Args:
        target_date: The target date
        
    Returns:
        List of historical dates
    """
    service = PaperService()
    return service.get_last_10_years_dates(target_date)


def fetch_and_enrich_papers(dates: List[date], category: str = None) -> List[Dict[str, Any]]:
    """
    Convenience function to fetch and enrich papers
    
    Args:
        dates: List of dates to search
        category: Optional category filter
        
    Returns:
        List of enriched paper dictionaries
    """
    service = PaperService()
    return service.fetch_and_enrich_papers(dates, category)


def select_top_papers(papers: List[Dict[str, Any]], count: int = 10) -> List[Dict[str, Any]]:
    """
    Convenience function to select top papers
    
    Args:
        papers: List of paper dictionaries
        count: Number of top papers to select
        
    Returns:
        List of top papers
    """
    service = PaperService()
    return service.select_top_papers(papers, count)


def store_daily_selection(target_date: date, category: str, top_papers: List[Dict[str, Any]], selected_paper: Dict[str, Any]):
    """
    Convenience function to store daily selection
    
    Args:
        target_date: The date for the selection
        category: Category filter used
        top_papers: List of top papers
        selected_paper: The selected paper
    """
    service = PaperService()
    return service.store_daily_selection(target_date, category, top_papers, selected_paper)