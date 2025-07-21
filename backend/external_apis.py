import httpx
import time
import logging
import xml.etree.ElementTree as ET
from datetime import datetime, date
from typing import List, Optional, Dict, Any
from dataclasses import dataclass
from config import settings

# Set up logging
logger = logging.getLogger(__name__)

@dataclass
class ArxivPaper:
    """Data class for arXiv paper response"""
    arxiv_id: str
    title: str
    abstract: str
    authors: List[Dict[str, str]]
    categories: List[str]
    primary_category: str
    submitted_date: date
    updated_date: Optional[date]
    pdf_url: str
    abstract_url: str

@dataclass
class SemanticScholarPaper:
    """Data class for Semantic Scholar paper response"""
    paper_id: str
    arxiv_id: Optional[str]
    title: str
    citation_count: int


class ArxivClient:
    """HTTP client for arXiv API with rate limiting"""
    
    def __init__(self):
        self.base_url = "https://export.arxiv.org/api/query"
        self.rate_limit_seconds = settings.arxiv_rate_limit_seconds
        self.last_request_time = 0
        self.timeout = 10
        self.max_retries = 3
        
    def _enforce_rate_limit(self):
        """Enforce rate limiting between requests"""
        time_since_last_request = time.time() - self.last_request_time
        if time_since_last_request < self.rate_limit_seconds:
            sleep_time = self.rate_limit_seconds - time_since_last_request
            logger.info(f"Rate limiting: sleeping for {sleep_time:.2f} seconds")
            time.sleep(sleep_time)
        self.last_request_time = time.time()
    
    def _make_request_with_retry(self, url: str, params: Dict[str, Any]) -> str:
        """Make HTTP request with retry logic and exponential backoff"""
        for attempt in range(self.max_retries):
            try:
                self._enforce_rate_limit()
                
                with httpx.Client(timeout=self.timeout, follow_redirects=True) as client:
                    response = client.get(url, params=params)
                    
                    if response.status_code == 429:
                        # Rate limited - wait longer and retry
                        wait_time = (2 ** attempt) * self.rate_limit_seconds
                        logger.warning(f"Rate limited by arXiv API. Waiting {wait_time} seconds before retry {attempt + 1}")
                        time.sleep(wait_time)
                        continue
                    
                    response.raise_for_status()
                    return response.text
                    
            except httpx.TimeoutException:
                logger.warning(f"Timeout on attempt {attempt + 1}/{self.max_retries}")
                if attempt == self.max_retries - 1:
                    raise
                time.sleep(2 ** attempt)  # Exponential backoff
                
            except httpx.HTTPStatusError as e:
                logger.error(f"HTTP error on attempt {attempt + 1}/{self.max_retries}: {e}")
                if attempt == self.max_retries - 1:
                    raise
                time.sleep(2 ** attempt)
                
            except Exception as e:
                logger.error(f"Unexpected error on attempt {attempt + 1}/{self.max_retries}: {e}")
                if attempt == self.max_retries - 1:
                    raise
                time.sleep(2 ** attempt)
        
        raise Exception("Max retries exceeded")
    
    def search_papers_by_date(self, date: date, category: str = None, max_results: int = None) -> List[ArxivPaper]:
        """
        Search for papers by submission date with automatic pagination to get ALL papers
        
        Args:
            date: The submission date to search for
            category: Optional category filter (e.g., 'cs.CL')
            max_results: Maximum number of results to return (None = get all papers for the date)
            
        Returns:
            List of ArxivPaper objects
        """
        # Format date for arXiv query
        date_str = date.strftime("%Y%m%d")
        search_query = f"submittedDate:[{date_str}0000 TO {date_str}2359]"
        
        # Add category filter if specified
        if category:
            search_query += f" AND cat:{category}"
        
        params = {
            "search_query": search_query,
            "start": 0,
            "max_results": max_results,
            "sortBy": "submittedDate",
            "sortOrder": "descending"
        }
        
        logger.info(f"Searching arXiv for papers on {date} with query: {search_query}")
        
        all_papers = []
        start = 0
        batch_size = 1000  # arXiv allows up to 2000, but 1000 is safer for reliability
        
        while True:
            params = {
                "search_query": search_query,
                "start": start,
                "max_results": batch_size,
                "sortBy": "submittedDate", 
                "sortOrder": "descending"
            }
            
            try:
                xml_response = self._make_request_with_retry(self.base_url, params)
                papers = self.parse_arxiv_response(xml_response)
                
                if not papers:
                    # No more papers to fetch
                    break
                    
                all_papers.extend(papers)
                
                # If we got fewer papers than requested, we've reached the end
                if len(papers) < batch_size:
                    break
                    
                # If user specified max_results and we've exceeded it, truncate and break
                if max_results and len(all_papers) >= max_results:
                    all_papers = all_papers[:max_results]
                    break
                    
                start += batch_size
                
                # Log progress for long fetches
                if len(all_papers) > 0 and len(all_papers) % 1000 == 0:
                    logger.info(f"Progress: fetched {len(all_papers)} papers so far for {date}")
                    
            except Exception as e:
                logger.error(f"Failed to search arXiv papers for date {date} at start={start}: {e}")
                # Return what we have so far rather than failing completely
                break
        
        logger.info(f"Found {len(all_papers)} total papers from arXiv for date {date}")
        return all_papers
    
    def parse_arxiv_response(self, xml_response: str) -> List[ArxivPaper]:
        """
        Parse arXiv XML response into ArxivPaper objects
        
        Args:
            xml_response: Raw XML response from arXiv API
            
        Returns:
            List of parsed ArxivPaper objects
        """
        papers = []
        
        try:
            # Parse XML
            root = ET.fromstring(xml_response)
            
            # Define namespace
            ns = {'atom': 'http://www.w3.org/2005/Atom'}
            
            # Find all entry elements
            entries = root.findall('atom:entry', ns)
            
            for entry in entries:
                try:
                    # Extract arXiv ID from URL
                    arxiv_url = entry.find('atom:id', ns).text
                    arxiv_id = arxiv_url.split('/')[-1]
                    
                    # Clean up arXiv ID (remove version number for main ID)
                    if 'v' in arxiv_id:
                        clean_arxiv_id = arxiv_id.split('v')[0]
                    else:
                        clean_arxiv_id = arxiv_id
                    
                    # Extract basic info
                    title = entry.find('atom:title', ns).text.strip()
                    abstract = entry.find('atom:summary', ns).text.strip()
                    
                    # Extract authors
                    authors = []
                    for author in entry.findall('atom:author', ns):
                        name = author.find('atom:name', ns).text
                        authors.append({"name": name})
                    
                    # Extract categories
                    categories = []
                    category_elements = entry.findall('atom:category', ns)
                    for cat in category_elements:
                        categories.append(cat.get('term'))
                    
                    primary_category = categories[0] if categories else "unknown"
                    
                    # Extract dates
                    published_str = entry.find('atom:published', ns).text
                    submitted_date = datetime.fromisoformat(published_str.replace('Z', '+00:00')).date()
                    
                    # Check for updated date
                    updated_element = entry.find('atom:updated', ns)
                    updated_date = None
                    if updated_element is not None:
                        updated_str = updated_element.text
                        updated_date = datetime.fromisoformat(updated_str.replace('Z', '+00:00')).date()
                        # Only set updated_date if it's different from submitted_date
                        if updated_date == submitted_date:
                            updated_date = None
                    
                    # Extract PDF URL
                    pdf_url = ""
                    for link in entry.findall('atom:link', ns):
                        if link.get('type') == 'application/pdf':
                            pdf_url = link.get('href')
                            break
                    
                    # Construct abstract URL
                    abstract_url = f"http://arxiv.org/abs/{clean_arxiv_id}"
                    
                    paper = ArxivPaper(
                        arxiv_id=clean_arxiv_id,
                        title=title,
                        abstract=abstract,
                        authors=authors,
                        categories=categories,
                        primary_category=primary_category,
                        submitted_date=submitted_date,
                        updated_date=updated_date,
                        pdf_url=pdf_url,
                        abstract_url=abstract_url
                    )
                    
                    papers.append(paper)
                    
                except Exception as e:
                    logger.warning(f"Failed to parse individual paper entry: {e}")
                    continue
            
            return papers
            
        except ET.ParseError as e:
            logger.error(f"Failed to parse arXiv XML response: {e}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error parsing arXiv response: {e}")
            raise


class SemanticScholarClient:
    """HTTP client for Semantic Scholar API with rate limiting"""
    
    def __init__(self):
        self.base_url = "https://api.semanticscholar.org/graph/v1/paper"
        self.rate_limit_seconds = settings.semantic_scholar_rate_limit_seconds
        self.api_key = settings.semantic_scholar_api_key
        self.last_request_time = 0
        self.timeout = 10
        self.max_retries = 3
        
    def _get_headers(self) -> Dict[str, str]:
        """Get headers for Semantic Scholar API requests"""
        headers = {
            "User-Agent": "paper-birthdays/1.0"
        }
        if self.api_key:
            headers["x-api-key"] = self.api_key
        return headers
    
    def _enforce_rate_limit(self):
        """Enforce rate limiting between requests"""
        time_since_last_request = time.time() - self.last_request_time
        if time_since_last_request < self.rate_limit_seconds:
            sleep_time = self.rate_limit_seconds - time_since_last_request
            logger.info(f"Rate limiting: sleeping for {sleep_time:.2f} seconds")
            time.sleep(sleep_time)
        self.last_request_time = time.time()
    
    def _make_request_with_retry(self, url: str, method: str = "GET", json_data: Dict = None) -> Dict[str, Any]:
        """Make HTTP request with retry logic and exponential backoff"""
        for attempt in range(self.max_retries):
            try:
                self._enforce_rate_limit()
                
                headers = self._get_headers()
                
                with httpx.Client(timeout=self.timeout, follow_redirects=True) as client:
                    if method == "GET":
                        response = client.get(url, headers=headers)
                    elif method == "POST":
                        response = client.post(url, headers=headers, json=json_data)
                    else:
                        raise ValueError(f"Unsupported HTTP method: {method}")
                    
                    if response.status_code == 429:
                        # Rate limited - wait longer and retry
                        wait_time = (2 ** attempt) * self.rate_limit_seconds
                        logger.warning(f"Rate limited by Semantic Scholar API. Waiting {wait_time} seconds before retry {attempt + 1}")
                        time.sleep(wait_time)
                        continue
                    
                    if response.status_code == 404:
                        # Paper not found - return None instead of raising error
                        logger.info("Paper not found in Semantic Scholar")
                        return None
                    
                    response.raise_for_status()
                    return response.json()
                    
            except httpx.TimeoutException:
                logger.warning(f"Timeout on attempt {attempt + 1}/{self.max_retries}")
                if attempt == self.max_retries - 1:
                    raise
                time.sleep(2 ** attempt)
                
            except httpx.HTTPStatusError as e:
                logger.error(f"HTTP error on attempt {attempt + 1}/{self.max_retries}: {e}")
                if attempt == self.max_retries - 1:
                    raise
                time.sleep(2 ** attempt)
                
            except Exception as e:
                logger.error(f"Unexpected error on attempt {attempt + 1}/{self.max_retries}: {e}")
                if attempt == self.max_retries - 1:
                    raise
                time.sleep(2 ** attempt)
        
        raise Exception("Max retries exceeded")
    
    def get_paper_citations(self, arxiv_id: str) -> Optional[SemanticScholarPaper]:
        """
        Get citation count for a single paper by arXiv ID
        
        Args:
            arxiv_id: The arXiv ID of the paper
            
        Returns:
            SemanticScholarPaper object or None if not found
        """
        # Clean arXiv ID (remove version if present)
        clean_arxiv_id = arxiv_id.split('v')[0] if 'v' in arxiv_id else arxiv_id
        
        url = f"{self.base_url}/arXiv:{clean_arxiv_id}"
        params = "fields=paperId,externalIds,title,citationCount"
        full_url = f"{url}?{params}"
        
        logger.info(f"Getting citations for arXiv paper: {clean_arxiv_id}")
        
        try:
            response_data = self._make_request_with_retry(full_url)
            
            if response_data is None:
                return None
            
            paper = SemanticScholarPaper(
                paper_id=response_data.get("paperId", ""),
                arxiv_id=clean_arxiv_id,
                title=response_data.get("title", ""),
                citation_count=response_data.get("citationCount", 0)
            )
            
            logger.info(f"Found paper {clean_arxiv_id} with {paper.citation_count} citations")
            return paper
            
        except Exception as e:
            logger.error(f"Failed to get citations for arXiv paper {clean_arxiv_id}: {e}")
            raise
    
    def batch_get_citations(self, arxiv_ids: List[str]) -> List[SemanticScholarPaper]:
        """
        Get citation counts for multiple papers in batch (up to 500)
        
        Args:
            arxiv_ids: List of arXiv IDs (max 500)
            
        Returns:
            List of SemanticScholarPaper objects for found papers
        """
        if len(arxiv_ids) > 500:
            raise ValueError("Batch size cannot exceed 500 papers")
        
        # Clean arXiv IDs
        clean_ids = []
        for arxiv_id in arxiv_ids:
            clean_id = arxiv_id.split('v')[0] if 'v' in arxiv_id else arxiv_id
            clean_ids.append(f"arXiv:{clean_id}")
        
        url = f"{self.base_url}/batch"
        params = "fields=paperId,externalIds,title,citationCount"
        full_url = f"{url}?{params}"
        
        json_data = {"ids": clean_ids}
        
        logger.info(f"Batch getting citations for {len(clean_ids)} papers")
        
        try:
            response_data = self._make_request_with_retry(full_url, method="POST", json_data=json_data)
            
            papers = []
            
            if response_data and isinstance(response_data, list):
                for item in response_data:
                    if item is not None:  # Some papers might not be found
                        # Extract arXiv ID from external IDs
                        arxiv_id = None
                        if "externalIds" in item and item["externalIds"]:
                            arxiv_id = item["externalIds"].get("ArXiv")
                        
                        paper = SemanticScholarPaper(
                            paper_id=item.get("paperId", ""),
                            arxiv_id=arxiv_id,
                            title=item.get("title", ""),
                            citation_count=item.get("citationCount", 0)
                        )
                        papers.append(paper)
            
            logger.info(f"Successfully retrieved {len(papers)} papers from batch of {len(clean_ids)}")
            return papers
            
        except Exception as e:
            logger.error(f"Failed to batch get citations: {e}")
            raise


# Convenience functions for easier usage
def get_arxiv_papers_for_date(target_date: date, category: str = None) -> List[ArxivPaper]:
    """
    Convenience function to get arXiv papers for a specific date
    
    Args:
        target_date: The date to search for
        category: Optional category filter
        
    Returns:
        List of ArxivPaper objects
    """
    client = ArxivClient()
    return client.search_papers_by_date(target_date, category)


def get_citation_counts_for_papers(arxiv_ids: List[str]) -> Dict[str, int]:
    """
    Convenience function to get citation counts for multiple papers
    
    Args:
        arxiv_ids: List of arXiv IDs
        
    Returns:
        Dictionary mapping arXiv ID to citation count
    """
    client = SemanticScholarClient()
    citation_counts = {}
    
    # Process in batches of 500
    batch_size = 500
    for i in range(0, len(arxiv_ids), batch_size):
        batch = arxiv_ids[i:i + batch_size]
        
        try:
            papers = client.batch_get_citations(batch)
            for paper in papers:
                if paper.arxiv_id:
                    citation_counts[paper.arxiv_id] = paper.citation_count
        except Exception as e:
            logger.error(f"Failed to get citations for batch {i//batch_size + 1}: {e}")
            # Fall back to individual requests for this batch
            for arxiv_id in batch:
                try:
                    paper = client.get_paper_citations(arxiv_id)
                    if paper and paper.arxiv_id:
                        citation_counts[paper.arxiv_id] = paper.citation_count
                except Exception as individual_error:
                    logger.warning(f"Failed to get citations for {arxiv_id}: {individual_error}")
                    citation_counts[arxiv_id] = 0
    
    return citation_counts


def convert_arxiv_to_paper_dict(arxiv_paper: ArxivPaper) -> Dict[str, Any]:
    """
    Convert ArxivPaper to dictionary format compatible with SQLAlchemy Paper model
    
    Args:
        arxiv_paper: ArxivPaper object from arXiv API
        
    Returns:
        Dictionary ready for Paper model creation
    """
    return {
        "arxiv_id": arxiv_paper.arxiv_id,
        "title": arxiv_paper.title,
        "abstract": arxiv_paper.abstract,
        "authors": arxiv_paper.authors,
        "categories": arxiv_paper.categories,
        "primary_category": arxiv_paper.primary_category,
        "submitted_date": arxiv_paper.submitted_date,
        "updated_date": arxiv_paper.updated_date,
        "pdf_url": arxiv_paper.pdf_url,
        "abstract_url": arxiv_paper.abstract_url,
        "citation_count": 0,  # Will be updated separately with Semantic Scholar data
        "semantic_scholar_id": None  # Will be updated when getting citation data
    }