#!/bin/bash
set -e

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups"
BACKUP_FILE="${BACKUP_DIR}/backup_${TIMESTAMP}.sql"

mkdir -p "$BACKUP_DIR"

echo "💾 Creating database backup..."

# Extract from DATABASE_URL or use defaults
pg_dump "$DATABASE_URL" > "$BACKUP_FILE"

echo "✅ Backup created: $BACKUP_FILE"
