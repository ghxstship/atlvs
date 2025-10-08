#!/bin/bash

# GHXSTSHIP Empty Directory Cleanup Script
# Purpose: Remove all empty directories from the codebase
# Safe to run: Only removes truly empty directories

set -e

REPO_ROOT="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship"
cd "$REPO_ROOT"

echo "=== GHXSTSHIP Empty Directory Cleanup ==="
echo "Starting cleanup at: $(date)"
echo ""

# Count empty directories
EMPTY_COUNT=$(find . -type d -empty -not -path "*/node_modules/*" -not -path "*/.next/*" -not -path "*/.git/*" | wc -l)

echo "Found $EMPTY_COUNT empty directories"
echo ""

# List empty directories
echo "Empty directories to be removed:"
find . -type d -empty -not -path "*/node_modules/*" -not -path "*/.next/*" -not -path "*/.git/*"

echo ""
read -p "Proceed with deletion? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
  # Remove empty directories
  find . -type d -empty -not -path "*/node_modules/*" -not -path "*/.next/*" -not -path "*/.git/*" -delete
  
  echo "✓ Empty directories removed successfully"
  
  # Verify cleanup
  REMAINING=$(find . -type d -empty -not -path "*/node_modules/*" -not -path "*/.next/*" -not -path "*/.git/*" | wc -l)
  
  if [ "$REMAINING" -eq 0 ]; then
    echo "✓ Cleanup verified: 0 empty directories remaining"
  else
    echo "⚠ Warning: $REMAINING empty directories still remain"
  fi
else
  echo "Cleanup cancelled"
  exit 0
fi

echo ""
echo "=== Cleanup Complete ==="
echo "Completed at: $(date)"
