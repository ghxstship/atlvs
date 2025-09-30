# Supabase Backup and Recovery Operations

## Overview
This document outlines the backup and recovery procedures for the GHXSTSHIP SaaS platform using Supabase.

## Backup Strategy

### Automated Backups (Supabase Managed)
Supabase provides Point-in-Time Recovery (PITR) for all databases:

- **Retention Period**: 7 days for PITR
- **Daily Backups**: Automated snapshots retained for 30 days
- **Frequency**: Continuous with 1-hour granularity for PITR
- **Coverage**: All data, schema, and configurations

### Manual Backups
For additional security, we maintain manual export scripts for critical data:

#### Database Export Script
Located at `scripts/backup-database.sh`

```bash
#!/bin/bash
# Export all tables to JSON format
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups/$TIMESTAMP"

mkdir -p "$BACKUP_DIR"

# Export each major table
supabase db dump --db-url "$DATABASE_URL" --table organizations > "$BACKUP_DIR/organizations.sql"
supabase db dump --db-url "$DATABASE_URL" --table projects > "$BACKUP_DIR/projects.sql"
# ... additional tables

# Create compressed archive
tar -czf "backups/database_$TIMESTAMP.tar.gz" "$BACKUP_DIR"
```

#### Storage Export Script
Located at `scripts/backup-storage.sh`

```bash
#!/bin/bash
# Export all storage buckets
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups/storage_$TIMESTAMP"

mkdir -p "$BACKUP_DIR"

# Export file metadata and download files
supabase storage list > "$BACKUP_DIR/file_list.txt"
# Download critical files...
```

## Recovery Procedures

### Point-in-Time Recovery (PITR)
1. Access Supabase Dashboard
2. Navigate to Database > Backups
3. Select target timestamp
4. Initiate restore to staging environment first
5. Validate data integrity
6. Promote to production if successful

### Manual Restore
1. Extract backup archive
2. Use Supabase CLI to restore tables:
   ```bash
   supabase db reset
   supabase db push --include-all
   ```
3. Restore storage files if needed

## Monitoring and Alerts

### Backup Success Monitoring
- Daily automated checks via GitHub Actions
- Alerts sent to ops@ghxstship.com on failure
- Backup size and duration tracking

### Recovery Testing
- Monthly restore tests to staging environment
- Validation of data integrity post-restore
- Performance benchmarking after recovery

## Contact Information

For backup/recovery emergencies:
- Primary: ops@ghxstship.com
- Secondary: devops@ghxstship.com
- Supabase Support: https://supabase.com/support

## Last Updated
2025-09-29
