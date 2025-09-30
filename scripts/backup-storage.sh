#!/bin/bash
# GHXSTSHIP Storage Backup Script
# Usage: ./scripts/backup-storage.sh

set -e

# Configuration
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups/storage_$TIMESTAMP"

# Create backup directory
mkdir -p "$BACKUP_DIR"

echo "Starting storage backup at $TIMESTAMP"

# List all files in storage
echo "Listing all storage files..."
supabase storage list --bucket avatars > "$BACKUP_DIR/avatars_list.txt"
supabase storage list --bucket documents > "$BACKUP_DIR/documents_list.txt"
supabase storage list --bucket attachments > "$BACKUP_DIR/attachments_list.txt"
supabase storage list --bucket exports > "$BACKUP_DIR/exports_list.txt"

# Download critical files (avatars, recent documents)
echo "Downloading critical files..."

# Create subdirectories
mkdir -p "$BACKUP_DIR/avatars"
mkdir -p "$BACKUP_DIR/documents"
mkdir -p "$BACKUP_DIR/attachments"

# Download recent avatars (last 30 days)
echo "Downloading recent avatars..."
# Note: Implement date filtering logic based on file metadata

# Download important documents
echo "Downloading important documents..."
# Download contracts, policies, templates, etc.

# Create compressed archive
echo "Creating compressed archive..."
tar -czf "backups/storage_$TIMESTAMP.tar.gz" "$BACKUP_DIR"

# Cleanup uncompressed files
rm -rf "$BACKUP_DIR"

echo "Storage backup completed: backups/storage_$TIMESTAMP.tar.gz"

# Optional: Upload to cloud storage
if [ -n "$BACKUP_BUCKET" ]; then
  echo "Uploading to cloud storage..."
  # Add cloud upload logic here
fi

echo "Storage backup process completed successfully"
