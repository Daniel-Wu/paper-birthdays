from fastapi import FastAPI, HTTPException, APIRouter, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, datetime
import uvicorn

from database import get_db, test_connection, DailyFeaturedPaper, Paper
from paper_service import PaperService


# Pydantic Response Models
class Author(BaseModel):
    """Author information"""
    name: str

    class Config:
        from_attributes = True


class PaperResponse(BaseModel):
    """Paper response model with proper field aliases"""
    id: str
    arxivId: str = Field(..., alias="arxiv_id")
    title: str
    abstract: str
    authors: List[Author]
    categories: List[str]
    primaryCategory: str = Field(..., alias="primary_category")
    submittedDate: str = Field(..., alias="submitted_date")
    citationCount: int = Field(..., alias="citation_count")
    pdfUrl: str = Field(..., alias="pdf_url")
    abstractUrl: str = Field(..., alias="abstract_url")

    class Config:
        from_attributes = True
        populate_by_name = True

    @classmethod
    def from_dict(cls, paper_dict: dict):
        """Create PaperResponse from dictionary representation"""
        # Convert authors to Author objects if they are dicts
        authors = paper_dict.get("authors", [])
        if authors and isinstance(authors[0], dict):
            authors = [Author(name=author.get("name", "")) for author in authors]
        elif authors and isinstance(authors[0], str):
            authors = [Author(name=name) for name in authors]
        
        return cls(
            id=str(paper_dict.get("id", "")),
            arxiv_id=paper_dict.get("arxiv_id", ""),
            title=paper_dict.get("title", ""),
            abstract=paper_dict.get("abstract", ""),
            authors=authors,
            categories=paper_dict.get("categories", []),
            primary_category=paper_dict.get("primary_category", ""),
            submitted_date=paper_dict.get("submitted_date", ""),
            citation_count=paper_dict.get("citation_count", 0),
            pdf_url=paper_dict.get("pdf_url", ""),
            abstract_url=paper_dict.get("abstract_url", ""),
        )


class TodayPaperResponse(BaseModel):
    """Response for today's featured paper"""
    paper: PaperResponse
    featuredDate: str = Field(..., alias="featured_date")

    class Config:
        from_attributes = True
        populate_by_name = True


class CategoryPaperResponse(BaseModel):
    """Response for category-specific paper"""
    paper: PaperResponse
    category: str
    featuredDate: str = Field(..., alias="featured_date")

    class Config:
        from_attributes = True
        populate_by_name = True


class HistoryPaperItem(BaseModel):
    """Individual item in history response"""
    paper: PaperResponse
    featuredDate: str = Field(..., alias="featured_date")
    category: Optional[str] = None

    class Config:
        from_attributes = True
        populate_by_name = True


class Pagination(BaseModel):
    """Pagination information"""
    page: int
    limit: int
    total: int
    hasNext: bool = Field(..., alias="has_next")

    class Config:
        from_attributes = True
        populate_by_name = True


class HistoryResponse(BaseModel):
    """Response for paper history with pagination"""
    papers: List[HistoryPaperItem]
    pagination: Pagination

    class Config:
        from_attributes = True


app = FastAPI(
    title="Paper Birthdays API",
    description="API for discovering historically significant academic papers published on this day",
    version="1.0.0"
)

# Add CORS middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize paper service
paper_service = PaperService()

# Create API router
router = APIRouter(prefix="/api/paper", tags=["papers"])


@router.get("/today", response_model=TodayPaperResponse)
async def get_today_paper(db: Session = Depends(get_db)):
    """Get today's featured paper for the main page"""
    try:
        today = date.today()
        paper_dict = paper_service.get_daily_paper(today)
        
        if not paper_dict:
            raise HTTPException(
                status_code=404, 
                detail="No featured paper found for today"
            )
        
        paper_response = PaperResponse.from_dict(paper_dict)
        
        return TodayPaperResponse(
            paper=paper_response,
            featured_date=today.isoformat()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@router.get("/category/{category}", response_model=CategoryPaperResponse)
async def get_category_paper(category: str, db: Session = Depends(get_db)):
    """Get today's featured paper for a specific category"""
    try:
        today = date.today()
        paper_dict = paper_service.get_daily_paper(today, category=category)
        
        if not paper_dict:
            raise HTTPException(
                status_code=404,
                detail=f"No featured paper found for category '{category}' today"
            )
        
        paper_response = PaperResponse.from_dict(paper_dict)
        
        return CategoryPaperResponse(
            paper=paper_response,
            category=category,
            featured_date=today.isoformat()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@router.get("/history", response_model=HistoryResponse)
async def get_paper_history(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=50, description="Items per page"),
    category: Optional[str] = Query(None, description="Filter by category"),
    db: Session = Depends(get_db)
):
    """Get featured papers from previous days with pagination"""
    try:
        # Calculate offset
        offset = (page - 1) * limit
        
        # Build base query
        query = db.query(DailyFeaturedPaper).join(Paper)
        
        # Add category filter if specified
        if category:
            query = query.filter(DailyFeaturedPaper.category == category)
        
        # Get total count
        total = query.count()
        
        # Get paginated results, ordered by feature_date desc
        featured_papers = (
            query.order_by(DailyFeaturedPaper.feature_date.desc())
            .offset(offset)
            .limit(limit)
            .all()
        )
        
        # Convert to response format
        history_items = []
        for featured_paper in featured_papers:
            paper = featured_paper.paper
            
            # Convert paper to dict format for PaperResponse.from_dict
            paper_dict = {
                "id": paper.id,
                "arxiv_id": paper.arxiv_id,
                "title": paper.title,
                "abstract": paper.abstract,
                "authors": paper.authors,  # Already in JSON format
                "categories": paper.categories,
                "primary_category": paper.primary_category,
                "submitted_date": paper.submitted_date.isoformat(),
                "citation_count": paper.citation_count,
                "pdf_url": paper.pdf_url,
                "abstract_url": paper.abstract_url,
            }
            
            paper_response = PaperResponse.from_dict(paper_dict)
            
            history_item = HistoryPaperItem(
                paper=paper_response,
                featured_date=featured_paper.feature_date.isoformat(),
                category=featured_paper.category
            )
            history_items.append(history_item)
        
        # Calculate pagination info
        has_next = (offset + limit) < total
        
        pagination = Pagination(
            page=page,
            limit=limit,
            total=total,
            has_next=has_next
        )
        
        return HistoryResponse(
            papers=history_items,
            pagination=pagination
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


# Include the router in the app
app.include_router(router)


@app.get("/health")
async def health_check():
    """Health check endpoint that verifies database connectivity"""
    db_status = test_connection()
    
    if not db_status:
        raise HTTPException(status_code=503, detail="Database connection failed")
    
    return {
        "status": "healthy",
        "database": "connected",
        "service": "paper-birthdays-api"
    }

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Paper Birthdays API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)