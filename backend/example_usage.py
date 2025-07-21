#!/usr/bin/env python3
"""
Example usage of the Paper Service for selecting daily papers
"""

import logging
from datetime import date
from paper_service import get_daily_paper, get_cache_stats, clear_expired_cache

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

def main():
    """Example usage of the paper service"""
    
    print("Paper Birthdays - Daily Paper Selection Demo")
    print("=" * 50)
    
    # Example 1: Get a daily paper for a specific date
    print("\n1. Getting daily paper for January 15, 2024 (any category)")
    target_date = date(2024, 1, 15)
    
    try:
        paper = get_daily_paper(target_date)
        if paper:
            print(f"✅ Selected Paper:")
            print(f"   Title: {paper['title'][:100]}...")
            print(f"   arXiv ID: {paper['arxiv_id']}")
            print(f"   Citations: {paper['citation_count']}")
            print(f"   Category: {paper['primary_category']}")
            print(f"   Authors: {len(paper['authors'])} authors")
        else:
            print("❌ No paper found")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Example 2: Get a category-specific paper
    print("\n2. Getting daily paper for January 15, 2024 (cs.AI category)")
    try:
        ai_paper = get_daily_paper(target_date, category="cs.AI")
        if ai_paper:
            print(f"✅ Selected AI Paper:")
            print(f"   Title: {ai_paper['title'][:100]}...")
            print(f"   arXiv ID: {ai_paper['arxiv_id']}")
            print(f"   Citations: {ai_paper['citation_count']}")
        else:
            print("❌ No AI paper found")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Example 3: Test caching by requesting the same paper again
    print("\n3. Testing cache by requesting same paper again")
    try:
        cached_paper = get_daily_paper(target_date)
        if cached_paper:
            print("✅ Paper retrieved from cache (should be same as #1)")
        else:
            print("❌ No cached paper found")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Show cache statistics
    print("\n4. Cache Statistics")
    stats = get_cache_stats()
    print(f"   Total cache entries: {stats['total_entries']}")
    print(f"   Valid entries: {stats['valid_entries']}")
    print(f"   Expired entries: {stats['expired_entries']}")
    print(f"   Cache TTL: {stats['cache_ttl_hours']} hours")
    
    # Example 4: Try a different date
    print("\n5. Getting paper for a different date (March 14, 2024)")
    pi_date = date(2024, 3, 14)
    try:
        pi_paper = get_daily_paper(pi_date)
        if pi_paper:
            print(f"✅ Selected Paper for Pi Day:")
            print(f"   Title: {pi_paper['title'][:100]}...")
            print(f"   Citations: {pi_paper['citation_count']}")
        else:
            print("❌ No paper found for Pi Day")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    print(f"\n{'='*50}")
    print("Demo completed!")
    print("\nNote: This demo requires:")
    print("- Database connection (PostgreSQL)")
    print("- arXiv API access")
    print("- Semantic Scholar API access")
    print("- Proper configuration in config.py")

if __name__ == "__main__":
    main()