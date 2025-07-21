from sqlalchemy import create_engine, MetaData, Column, Integer, String, Text, Date, DateTime, JSON, ARRAY, ForeignKey, Index, UniqueConstraint
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.sql import func
from datetime import datetime, date
from typing import Optional, List
from config import settings

engine = create_engine(settings.database_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# SQLAlchemy Models
class Paper(Base):
    """Paper model representing academic papers"""
    __tablename__ = "papers"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    arxiv_id = Column(String(50), unique=True, nullable=False)
    title = Column(Text, nullable=False)
    abstract = Column(Text, nullable=False)
    authors = Column(JSON, nullable=False)  # Array of author objects
    categories = Column(ARRAY(String), nullable=False)  # TEXT[] array
    primary_category = Column(String(20), nullable=False)
    submitted_date = Column(Date, nullable=False)
    updated_date = Column(Date, nullable=True)
    pdf_url = Column(Text, nullable=False)
    abstract_url = Column(Text, nullable=False)
    citation_count = Column(Integer, default=0)
    semantic_scholar_id = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=func.current_timestamp())
    updated_at = Column(DateTime, default=func.current_timestamp(), onupdate=func.current_timestamp())
    
    # Relationships
    featured_papers = relationship("DailyFeaturedPaper", back_populates="paper")
    
    def __repr__(self):
        return f"<Paper(arxiv_id='{self.arxiv_id}', title='{self.title[:50]}...')>"


class DailyFeaturedPaper(Base):
    """Daily featured papers model"""
    __tablename__ = "daily_featured_papers"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    feature_date = Column(Date, nullable=False)
    category = Column(String(20), nullable=True)  # NULL for main page
    paper_id = Column(Integer, ForeignKey("papers.id"), nullable=False)
    rank_in_day = Column(Integer, nullable=False)  # 1-10 ranking by citations
    created_at = Column(DateTime, default=func.current_timestamp())
    
    # Relationships
    paper = relationship("Paper", back_populates="featured_papers")
    
    # Unique constraint
    __table_args__ = (
        UniqueConstraint('feature_date', 'category', 'paper_id', name='_feature_date_category_paper_uc'),
    )
    
    def __repr__(self):
        return f"<DailyFeaturedPaper(date='{self.feature_date}', category='{self.category}', rank={self.rank_in_day})>"


class FetchHistory(Base):
    """Fetch history model to track data fetching operations"""
    __tablename__ = "fetch_history"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    fetch_date = Column(Date, nullable=False)
    fetch_type = Column(String(20), nullable=False)  # 'daily', 'category'
    category = Column(String(20), nullable=True)
    papers_fetched = Column(Integer, nullable=True)
    status = Column(String(20), nullable=False)  # 'success', 'partial', 'failed'
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=func.current_timestamp())
    
    def __repr__(self):
        return f"<FetchHistory(date='{self.fetch_date}', type='{self.fetch_type}', status='{self.status}')>"


# Create indexes
Index('idx_papers_submitted_date', Paper.submitted_date)
Index('idx_papers_primary_category', Paper.primary_category)
Index('idx_papers_citation_count', Paper.citation_count)
Index('idx_daily_featured_date', DailyFeaturedPaper.feature_date)
Index('idx_daily_featured_category', DailyFeaturedPaper.category)
Index('idx_fetch_history_date', FetchHistory.fetch_date)

def get_db():
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def test_connection():
    """Test database connection"""
    try:
        with engine.connect() as connection:
            connection.execute("SELECT 1")
        return True
    except Exception as e:
        print(f"Database connection failed: {e}")
        return False


def create_tables():
    """Create all database tables"""
    try:
        Base.metadata.create_all(bind=engine)
        print("All tables created successfully")
        return True
    except Exception as e:
        print(f"Error creating tables: {e}")
        return False


# Basic CRUD operations for Paper model
def create_paper(db: SessionLocal, paper_data: dict) -> Paper:
    """Create a new paper"""
    paper = Paper(**paper_data)
    db.add(paper)
    db.commit()
    db.refresh(paper)
    return paper


def get_paper_by_id(db: SessionLocal, paper_id: int) -> Optional[Paper]:
    """Get paper by ID"""
    return db.query(Paper).filter(Paper.id == paper_id).first()


def get_paper_by_arxiv_id(db: SessionLocal, arxiv_id: str) -> Optional[Paper]:
    """Get paper by arXiv ID"""
    return db.query(Paper).filter(Paper.arxiv_id == arxiv_id).first()


def get_papers_by_date(db: SessionLocal, submitted_date: date, limit: int = 100) -> List[Paper]:
    """Get papers by submission date"""
    return db.query(Paper).filter(Paper.submitted_date == submitted_date).limit(limit).all()


def get_papers_by_category(db: SessionLocal, category: str, limit: int = 100) -> List[Paper]:
    """Get papers by primary category"""
    return db.query(Paper).filter(Paper.primary_category == category).limit(limit).all()


def update_paper_citation_count(db: SessionLocal, paper_id: int, citation_count: int) -> Optional[Paper]:
    """Update paper citation count"""
    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if paper:
        paper.citation_count = citation_count
        paper.updated_at = func.current_timestamp()
        db.commit()
        db.refresh(paper)
    return paper