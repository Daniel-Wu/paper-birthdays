# Cron Job Setup for Paper Birthdays Daily Job

This document provides instructions for setting up the daily paper pre-fetching script to run automatically via cron.

## Prerequisites

1. **Virtual Environment**: Ensure the Python virtual environment is set up and contains all required dependencies:
   ```bash
   cd /home/dan/paper-birthdays/backend
   source venv/bin/activate
   pip install -r requirements.txt
   ```

2. **Database**: Ensure the database is properly configured and accessible.

3. **Environment Variables**: Ensure all required environment variables are set (DATABASE_URL, SEMANTIC_SCHOLAR_API_KEY).

4. **Permissions**: Ensure the script is executable:
   ```bash
   chmod +x daily_job.py
   ```

## Cron Configuration

### Recommended Schedule

Run the job daily at 00:01 UTC (1 minute after midnight) to pre-fetch papers for the current date:

```bash
# Edit crontab
crontab -e

# Add this line to run daily at 00:01 UTC
1 0 * * * /home/dan/paper-birthdays/backend/venv/bin/python /home/dan/paper-birthdays/backend/daily_job.py >> /var/log/paper-birthdays.log 2>&1
```

### Alternative Schedules

**Run at 6:00 AM local time:**
```bash
0 6 * * * /home/dan/paper-birthdays/backend/venv/bin/python /home/dan/paper-birthdays/backend/daily_job.py >> /var/log/paper-birthdays.log 2>&1
```

**Run every 12 hours (for redundancy):**
```bash
0 0,12 * * * /home/dan/paper-birthdays/backend/venv/bin/python /home/dan/paper-birthdays/backend/daily_job.py >> /var/log/paper-birthdays.log 2>&1
```

**Run with verbose logging (for debugging):**
```bash
1 0 * * * /home/dan/paper-birthdays/backend/venv/bin/python /home/dan/paper-birthdays/backend/daily_job.py --verbose >> /var/log/paper-birthdays-verbose.log 2>&1
```

## Using the Wrapper Script (Recommended)

For production environments, use the wrapper script which provides better error handling and environment setup:

```bash
# Use the wrapper script in cron
1 0 * * * /home/dan/paper-birthdays/backend/run_daily_job.sh >> /var/log/paper-birthdays.log 2>&1
```

## Log Management

### Log File Location
The recommended log file location is `/var/log/paper-birthdays.log`. Make sure the directory exists and is writable:

```bash
sudo mkdir -p /var/log
sudo touch /var/log/paper-birthdays.log
sudo chown $USER:$USER /var/log/paper-birthdays.log
```

### Log Rotation
Set up log rotation to prevent log files from growing too large:

```bash
# Create logrotate configuration
sudo tee /etc/logrotate.d/paper-birthdays << EOF
/var/log/paper-birthdays.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 0644 $USER $USER
}
EOF
```

## Monitoring and Alerting

### Check Cron Job Status

**View cron logs:**
```bash
# On Ubuntu/Debian
grep CRON /var/log/syslog | grep daily_job

# On CentOS/RHEL
grep CRON /var/log/cron | grep daily_job
```

**View job output:**
```bash
tail -f /var/log/paper-birthdays.log
```

**Check last execution:**
```bash
# View last 50 lines of log
tail -n 50 /var/log/paper-birthdays.log

# Search for completion messages
grep "DAILY JOB SUMMARY" /var/log/paper-birthdays.log | tail -5
```

### Exit Codes

The script returns different exit codes for monitoring:
- `0`: Complete success (all categories processed successfully)
- `1`: Partial failure (some categories failed)
- `2`: Complete failure (no categories processed successfully)
- `130`: Interrupted by user (SIGINT)

### Email Notifications

To receive email notifications on failures, modify the cron job:

```bash
# Send email only on non-zero exit codes
1 0 * * * /home/dan/paper-birthdays/backend/run_daily_job.sh || echo "Paper Birthdays daily job failed with exit code $?" | mail -s "Paper Birthdays Job Failed" admin@example.com
```

## Troubleshooting

### Common Issues

1. **Permission Denied**
   ```bash
   chmod +x /home/dan/paper-birthdays/backend/daily_job.py
   chmod +x /home/dan/paper-birthdays/backend/run_daily_job.sh
   ```

2. **Python/Module Not Found**
   - Use absolute paths in cron
   - Ensure virtual environment is activated in wrapper script

3. **Database Connection Issues**
   - Check DATABASE_URL environment variable
   - Verify database is running and accessible
   - Check network connectivity

4. **API Rate Limiting**
   - The script includes built-in delays between categories
   - Check API key configurations
   - Monitor API usage limits

### Manual Testing

Test the script manually before setting up cron:

```bash
# Test with dry run
python daily_job.py --dry-run --verbose

# Test with specific date
python daily_job.py --date 2024-01-15 --verbose

# Test specific category
python daily_job.py --category cs.AI --verbose
```

### Debugging Cron Issues

If the cron job isn't working:

1. **Check cron service is running:**
   ```bash
   sudo systemctl status cron
   ```

2. **Verify crontab entry:**
   ```bash
   crontab -l
   ```

3. **Test with a simple command first:**
   ```bash
   # Add this line to test cron is working
   * * * * * echo "Cron test $(date)" >> /tmp/cron-test.log
   ```

4. **Check environment variables:**
   ```bash
   # Add this to crontab to see environment
   1 0 * * * env > /tmp/cron-env.log
   ```

## Performance Considerations

- The script processes ~10 categories and may take 5-15 minutes to complete
- Each category involves API calls to arXiv and Semantic Scholar
- The script includes appropriate delays to respect API rate limits
- Database operations are optimized with proper indexing
- Failed categories don't block processing of other categories

## Security Considerations

- Store sensitive configuration (API keys, database URLs) in environment variables
- Limit log file permissions to prevent sensitive data exposure
- Consider running the job as a dedicated user with minimal privileges
- Regularly rotate API keys and update configurations

## Backup and Recovery

- The script is idempotent - safe to run multiple times
- Failed runs can be retried without causing duplicates
- Database stores fetch history for auditing and debugging
- Consider daily database backups to prevent data loss