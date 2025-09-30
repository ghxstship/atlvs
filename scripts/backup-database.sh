#!/bin/bash
# GHXSTSHIP Database Backup Script
# Usage: ./scripts/backup-database.sh

set -e

# Configuration
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups/database_$TIMESTAMP"
DATABASE_URL=${DATABASE_URL:-$SUPABASE_DB_URL}

# Create backup directory
mkdir -p "$BACKUP_DIR"

echo "Starting database backup at $TIMESTAMP"

# Export major tables
tables=(
  "organizations"
  "users"
  "memberships"
  "projects"
  "expenses"
  "revenue"
  "budgets"
  "purchase_orders"
  "vendors"
  "procurement_requests"
  "jobs"
  "job_assignments"
  "bids"
  "compliance"
  "contracts"
  "opportunities"
  "rfps"
  "people"
  "competencies"
  "person_competencies"
  "companies"
  "contracts"
  "invoices"
  "finance_accounts"
  "finance_transactions"
  "programming_events"
  "call_sheets"
  "itineraries"
  "lineups"
  "performances"
  "riders"
  "spaces"
  "workshops"
  "marketplace_catalog_items"
  "marketplace_listings"
  "reports"
  "activity_logs"
  "emergency_contacts"
  "api_keys"
  "webhooks"
)

for table in "${tables[@]}"; do
  echo "Exporting $table..."
  supabase db dump --db-url "$DATABASE_URL" --table "$table" > "$BACKUP_DIR/${table}.sql"
done

# Create compressed archive
echo "Creating compressed archive..."
tar -czf "backups/database_$TIMESTAMP.tar.gz" "$BACKUP_DIR"

# Cleanup uncompressed files
rm -rf "$BACKUP_DIR"

echo "Database backup completed: backups/database_$TIMESTAMP.tar.gz"

# Optional: Upload to cloud storage
if [ -n "$BACKUP_BUCKET" ]; then
  echo "Uploading to cloud storage..."
  # Add cloud upload logic here (AWS S3, GCP, etc.)
fi

echo "Backup process completed successfully"
