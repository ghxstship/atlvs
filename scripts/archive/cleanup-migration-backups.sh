#!/bin/bash

# Cleanup Migration Backups
# Removes backup files created during migrations after verification

set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WEB_APP_DIR="$REPO_ROOT/apps/web"

echo "🧹 Migration Backup Cleanup"
echo ""

# Count backup files
BAK_COUNT=$(find "$WEB_APP_DIR" -name "*.bak" -type f 2>/dev/null | wc -l | tr -d ' ')
BACKUP_COUNT=$(find "$WEB_APP_DIR" -name "*.backup.*" -type f 2>/dev/null | wc -l | tr -d ' ')
CARD_BAK_COUNT=$(find "$WEB_APP_DIR" -name "*.card-migration.bak" -type f 2>/dev/null | wc -l | tr -d ' ')

TOTAL=$((BAK_COUNT + BACKUP_COUNT + CARD_BAK_COUNT))

echo "📊 Backup files found:"
echo "  - Badge migration backups (.bak): $BAK_COUNT"
echo "  - Old backups (.backup.*): $BACKUP_COUNT"
echo "  - Card migration backups (.card-migration.bak): $CARD_BAK_COUNT"
echo "  - Total: $TOTAL files"
echo ""

if [ "$TOTAL" -eq 0 ]; then
  echo "✅ No backup files to clean up!"
  exit 0
fi

echo "⚠️  This will permanently delete $TOTAL backup files"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cleanup cancelled"
    exit 1
fi

echo ""
echo "🗑️  Removing backup files..."

# Remove Badge migration backups
if [ "$BAK_COUNT" -gt 0 ]; then
  echo "  Removing $BAK_COUNT .bak files..."
  find "$WEB_APP_DIR" -name "*.bak" -type f -delete
fi

# Remove old backups
if [ "$BACKUP_COUNT" -gt 0 ]; then
  echo "  Removing $BACKUP_COUNT .backup.* files..."
  find "$WEB_APP_DIR" -name "*.backup.*" -type f -delete
fi

# Remove Card migration backups
if [ "$CARD_BAK_COUNT" -gt 0 ]; then
  echo "  Removing $CARD_BAK_COUNT .card-migration.bak files..."
  find "$WEB_APP_DIR" -name "*.card-migration.bak" -type f -delete
fi

echo ""
echo "✅ Cleanup complete! Removed $TOTAL backup files"
echo ""

exit 0
