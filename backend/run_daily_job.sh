#!/bin/bash

# Production wrapper script for Paper Birthdays daily job
# This script provides robust error handling and environment setup for cron execution

set -euo pipefail  # Exit on any error, undefined variable, or pipe failure

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_PATH="${SCRIPT_DIR}/venv"
PYTHON_SCRIPT="${SCRIPT_DIR}/daily_job.py"
LOG_PREFIX="[$(date '+%Y-%m-%d %H:%M:%S')] run_daily_job.sh:"

# Function to log messages with timestamp
log() {
    echo "${LOG_PREFIX} $1"
}

# Function to log errors to stderr
log_error() {
    echo "${LOG_PREFIX} ERROR: $1" >&2
}

# Function to cleanup on exit
cleanup() {
    local exit_code=$?
    if [ $exit_code -ne 0 ]; then
        log_error "Script exited with code $exit_code"
    fi
    exit $exit_code
}

# Set up cleanup trap
trap cleanup EXIT

# Main execution function
main() {
    log "Starting Paper Birthdays daily job wrapper"
    
    # Change to script directory
    cd "${SCRIPT_DIR}" || {
        log_error "Failed to change to script directory: ${SCRIPT_DIR}"
        exit 1
    }
    
    # Check if virtual environment exists
    if [ ! -d "${VENV_PATH}" ]; then
        log_error "Virtual environment not found at: ${VENV_PATH}"
        log_error "Please create the virtual environment first:"
        log_error "  python3 -m venv ${VENV_PATH}"
        log_error "  source ${VENV_PATH}/bin/activate"
        log_error "  pip install -r requirements.txt"
        exit 1
    fi
    
    # Check if Python script exists
    if [ ! -f "${PYTHON_SCRIPT}" ]; then
        log_error "Python script not found: ${PYTHON_SCRIPT}"
        exit 1
    fi
    
    # Check if Python script is executable
    if [ ! -x "${PYTHON_SCRIPT}" ]; then
        log "Making Python script executable"
        chmod +x "${PYTHON_SCRIPT}" || {
            log_error "Failed to make script executable"
            exit 1
        }
    fi
    
    # Activate virtual environment
    log "Activating virtual environment: ${VENV_PATH}"
    source "${VENV_PATH}/bin/activate" || {
        log_error "Failed to activate virtual environment"
        exit 1
    }
    
    # Verify Python and required modules are available
    log "Verifying Python environment"
    python3 -c "import paper_service, database, config" || {
        log_error "Required Python modules not available"
        log_error "Please install dependencies: pip install -r requirements.txt"
        exit 1
    }
    
    # Set environment variables for production if not already set
    export PYTHONPATH="${SCRIPT_DIR}:${PYTHONPATH:-}"
    export PYTHONUNBUFFERED=1  # Ensure logs are flushed immediately
    
    # Run the daily job with all passed arguments
    log "Executing daily job: python3 ${PYTHON_SCRIPT} $*"
    
    # Capture start time
    start_time=$(date +%s)
    
    # Execute the Python script with error handling
    python3 "${PYTHON_SCRIPT}" "$@"
    job_exit_code=$?
    
    # Capture end time and calculate duration
    end_time=$(date +%s)
    duration=$((end_time - start_time))
    
    # Log completion status
    case $job_exit_code in
        0)
            log "Daily job completed successfully (duration: ${duration}s)"
            ;;
        1)
            log "Daily job completed with partial failures (duration: ${duration}s)"
            ;;
        2)
            log_error "Daily job failed completely (duration: ${duration}s)"
            ;;
        130)
            log "Daily job was interrupted by user (duration: ${duration}s)"
            ;;
        *)
            log_error "Daily job exited with unexpected code: $job_exit_code (duration: ${duration}s)"
            ;;
    esac
    
    return $job_exit_code
}

# Function to show usage information
show_usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Production wrapper script for Paper Birthdays daily job.

This script:
- Sets up the Python virtual environment
- Verifies all dependencies are available
- Executes the daily job with proper error handling
- Logs execution status and duration

OPTIONS:
  All options are passed through to daily_job.py

Examples:
  $0                         # Run for today, all categories
  $0 --date 2024-01-15       # Run for specific date
  $0 --category cs.AI        # Run for specific category
  $0 --dry-run               # Dry run mode
  $0 --verbose               # Enable verbose logging
  $0 --help                  # Show daily_job.py help

Environment:
  SCRIPT_DIR:     ${SCRIPT_DIR}
  VENV_PATH:      ${VENV_PATH}
  PYTHON_SCRIPT:  ${PYTHON_SCRIPT}

For more information, see: cron_setup.md
EOF
}

# Check for help flag
if [[ "${1:-}" == "--help" ]] || [[ "${1:-}" == "-h" ]]; then
    show_usage
    exit 0
fi

# Check if running in a terminal (for development) vs cron (production)
if [ -t 1 ]; then
    log "Running in interactive mode"
else
    log "Running in non-interactive mode (likely from cron)"
fi

# Execute main function with all arguments
main "$@"