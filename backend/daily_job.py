#!/usr/bin/env python3
"""
Daily paper pre-fetching script for Paper Birthdays

This script pre-fetches papers for the current date across multiple categories
to ensure fast API responses. Designed to be run via cron job daily.

Usage:
    python daily_job.py                    # Run for today, all categories
    python daily_job.py --date 2024-01-15  # Run for specific date  
    python daily_job.py --category cs.AI   # Run for specific category only
    python daily_job.py --dry-run          # Show what would be done without fetching
    python daily_job.py --verbose          # Enable verbose logging
"""

import argparse
import logging
import sys
import traceback
from datetime import date, datetime, timedelta
from typing import List, Optional, Tuple

from paper_service import PaperService
from database import SessionLocal, FetchHistory
from config import settings

# Default categories to pre-fetch
DEFAULT_CATEGORIES = [
    None,                  # Main page (all categories)
    'cs.AI',              # Artificial Intelligence
    'cs.LG',              # Machine Learning  
    'cs.CL',              # Computation and Language
    'cs.CV',              # Computer Vision
    'math.GT',            # Geometric Topology
    'physics.gen-ph',     # General Physics
    'q-bio.GN',           # Genomics
    'econ.EM',            # Econometrics
    'stat.ML'             # Machine Learning (Statistics)
]

# Set up logger
logger = logging.getLogger(__name__)


def setup_logging(verbose: bool = False) -> None:
    """
    Set up logging configuration
    
    Args:
        verbose: Enable verbose/debug logging
    """
    level = logging.DEBUG if verbose else logging.INFO
    
    # Configure logging format
    log_format = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    
    # Configure root logger
    logging.basicConfig(
        level=level,
        format=log_format,
        handlers=[
            logging.StreamHandler(sys.stdout)
        ]
    )
    
    # Set up logger for this module
    logger.setLevel(level)
    
    logger.info(f"Logging configured at {'DEBUG' if verbose else 'INFO'} level")


def parse_arguments() -> argparse.Namespace:
    """
    Parse command line arguments
    
    Returns:
        Parsed arguments namespace
    """
    parser = argparse.ArgumentParser(
        description="Daily paper pre-fetching script for Paper Birthdays",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s                         # Run for today, all categories
  %(prog)s --date 2024-01-15       # Run for specific date
  %(prog)s --category cs.AI        # Run for specific category only
  %(prog)s --dry-run               # Show what would be done
  %(prog)s --verbose               # Enable verbose logging
        """
    )
    
    parser.add_argument(
        '--date',
        type=str,
        help='Target date in YYYY-MM-DD format (default: today)'
    )
    
    parser.add_argument(
        '--category',
        type=str,
        help='Specific category to process (default: all categories)'
    )
    
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Show what would be done without actually fetching papers'
    )
    
    parser.add_argument(
        '--verbose',
        action='store_true',
        help='Enable verbose/debug logging'
    )
    
    args = parser.parse_args()
    
    # Parse and validate date if provided
    if args.date:
        try:
            args.date = datetime.strptime(args.date, '%Y-%m-%d').date()
        except ValueError:
            parser.error(f"Invalid date format: {args.date}. Use YYYY-MM-DD format.")
    
    return args


def check_if_already_fetched(target_date: date, category: Optional[str]) -> bool:
    """
    Check if papers have already been successfully fetched for this date/category
    
    Args:
        target_date: The date to check
        category: Category to check (None for all categories)
        
    Returns:
        True if already fetched successfully, False otherwise
    """
    db = SessionLocal()
    try:
        # Look for successful fetch history for this date/category
        query = db.query(FetchHistory).filter(
            FetchHistory.fetch_date == target_date,
            FetchHistory.status == 'success'
        )
        
        if category:
            query = query.filter(FetchHistory.category == category)
        else:
            query = query.filter(FetchHistory.category.is_(None))
        
        existing_fetch = query.first()
        
        if existing_fetch:
            logger.info(f"Papers already fetched successfully for {target_date}, category: {category or 'all'}")
            return True
        
        return False
        
    except Exception as e:
        logger.error(f"Error checking fetch history: {e}")
        return False
    finally:
        db.close()


def process_single_category(paper_service: PaperService, target_date: date, category: Optional[str], dry_run: bool) -> bool:
    """
    Process papers for a single category
    
    Args:
        paper_service: PaperService instance
        target_date: Date to process
        category: Category to process (None for all categories)
        dry_run: If True, only log what would be done
        
    Returns:
        True if successful, False otherwise
    """
    category_name = category or "all categories"
    
    try:
        logger.info(f"Processing category: {category_name}")
        
        if dry_run:
            logger.info(f"DRY RUN: Would fetch papers for {target_date}, category: {category_name}")
            return True
        
        # Check if already fetched
        if check_if_already_fetched(target_date, category):
            logger.info(f"Skipping {category_name} - already fetched successfully")
            return True
        
        # Fetch papers using PaperService
        start_time = datetime.now()
        selected_paper = paper_service.get_daily_paper(target_date, category)
        end_time = datetime.now()
        
        processing_time = (end_time - start_time).total_seconds()
        
        if selected_paper:
            logger.info(f"Successfully fetched paper for {category_name}: {selected_paper['title'][:100]}...")
            logger.info(f"Processing time: {processing_time:.2f} seconds")
            return True
        else:
            logger.warning(f"No papers found for {category_name}")
            return False
            
    except Exception as e:
        logger.error(f"Error processing category {category_name}: {e}")
        logger.debug(f"Stack trace: {traceback.format_exc()}")
        return False


def process_categories(target_date: date, categories: List[Optional[str]], dry_run: bool) -> Tuple[int, int]:
    """
    Process papers for multiple categories
    
    Args:
        target_date: Date to process
        categories: List of categories to process
        dry_run: If True, only log what would be done
        
    Returns:
        Tuple of (success_count, failure_count)
    """
    paper_service = PaperService()
    success_count = 0
    failure_count = 0
    
    total_categories = len(categories)
    
    for i, category in enumerate(categories, 1):
        category_name = category or "all categories"
        
        logger.info(f"[{i}/{total_categories}] Starting category: {category_name}")
        
        try:
            success = process_single_category(paper_service, target_date, category, dry_run)
            
            if success:
                success_count += 1
                logger.info(f"[{i}/{total_categories}] ✓ Completed category: {category_name}")
            else:
                failure_count += 1
                logger.warning(f"[{i}/{total_categories}] ✗ Failed category: {category_name}")
                
        except Exception as e:
            failure_count += 1
            logger.error(f"[{i}/{total_categories}] ✗ Exception in category {category_name}: {e}")
            
        # Add small delay between categories to be respectful to APIs
        if not dry_run and i < total_categories:
            logger.debug("Pausing briefly between categories...")
            import time
            time.sleep(2)
    
    return success_count, failure_count


def log_job_summary(target_date: date, categories: List[Optional[str]], success_count: int, failure_count: int, execution_time: float, dry_run: bool) -> None:
    """
    Log summary of job execution
    
    Args:
        target_date: Date processed
        categories: Categories processed
        success_count: Number of successful categories
        failure_count: Number of failed categories
        execution_time: Total execution time in seconds
        dry_run: Whether this was a dry run
    """
    total_categories = len(categories)
    success_rate = (success_count / total_categories) * 100 if total_categories > 0 else 0
    
    logger.info("=" * 60)
    logger.info("DAILY JOB SUMMARY")
    logger.info("=" * 60)
    logger.info(f"Date processed: {target_date}")
    logger.info(f"Dry run mode: {'Yes' if dry_run else 'No'}")
    logger.info(f"Total categories: {total_categories}")
    logger.info(f"Successful: {success_count}")
    logger.info(f"Failed: {failure_count}")
    logger.info(f"Success rate: {success_rate:.1f}%")
    logger.info(f"Execution time: {execution_time:.2f} seconds")
    logger.info("=" * 60)
    
    if failure_count > 0:
        logger.warning(f"⚠️  {failure_count} categories failed. Check logs above for details.")
    
    if not dry_run:
        if failure_count == 0:
            logger.info("🎉 All categories processed successfully!")
        elif success_count > 0:
            logger.info(f"✅ Partial success: {success_count}/{total_categories} categories completed")
        else:
            logger.error("❌ Complete failure: No categories processed successfully")


def get_exit_code(success_count: int, failure_count: int) -> int:
    """
    Determine appropriate exit code based on results
    
    Args:
        success_count: Number of successful operations
        failure_count: Number of failed operations
        
    Returns:
        Exit code (0=success, 1=partial failure, 2=complete failure)
    """
    if failure_count == 0:
        return 0  # Complete success
    elif success_count > 0:
        return 1  # Partial failure
    else:
        return 2  # Complete failure


def main() -> None:
    """Main entry point for daily job"""
    start_time = datetime.now()
    
    try:
        # Parse command line arguments
        args = parse_arguments()
        
        # Set up logging
        setup_logging(args.verbose)
        
        # Determine target date and categories
        target_date = args.date or date.today()
        categories = [args.category] if args.category else DEFAULT_CATEGORIES
        
        logger.info("Starting Paper Birthdays daily job")
        logger.info(f"Target date: {target_date}")
        logger.info(f"Categories to process: {len(categories)}")
        
        if args.dry_run:
            logger.info("🔍 DRY RUN MODE - No actual fetching will be performed")
        
        if args.verbose:
            logger.debug(f"Categories: {[c or 'all' for c in categories]}")
        
        # Process categories
        success_count, failure_count = process_categories(target_date, categories, args.dry_run)
        
        # Calculate execution time
        end_time = datetime.now()
        execution_time = (end_time - start_time).total_seconds()
        
        # Log summary
        log_job_summary(target_date, categories, success_count, failure_count, execution_time, args.dry_run)
        
        # Exit with appropriate code
        exit_code = get_exit_code(success_count, failure_count)
        sys.exit(exit_code)
        
    except KeyboardInterrupt:
        logger.info("Job interrupted by user")
        sys.exit(130)  # Standard exit code for SIGINT
        
    except Exception as e:
        logger.error(f"Unexpected error in daily job: {e}")
        logger.debug(f"Stack trace: {traceback.format_exc()}")
        sys.exit(2)  # Complete failure


if __name__ == "__main__":
    main()