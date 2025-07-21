import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    database_url: str = os.getenv("DATABASE_URL", "postgresql://localhost:5432/paper_birthdays")
    semantic_scholar_api_key: str = os.getenv("SEMANTIC_SCHOLAR_API_KEY", "")
    
    # API settings
    arxiv_rate_limit_seconds: int = 3
    semantic_scholar_rate_limit_seconds: int = 1
    
    # Cache settings
    cache_ttl_hours: int = 24

settings = Settings()