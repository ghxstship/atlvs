#!/bin/bash

# GHXSTSHIP Production Cleanup Script
# Purpose: Remove all legacy, backup, and deprecated files
# Safe to run: Only removes files matching specific patterns

set -e

REPO_ROOT="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship"
cd "$REPO_ROOT"

echo "=== GHXSTSHIP Legacy File Cleanup ==="
echo "Starting cleanup at: $(date)"
echo ""

# Count files before cleanup
LEGACY_COUNT=$(find . -type f \( -name "*.old" -o -name "*.backup" -o -name "*.deprecated" -o -name "*-old.*" -o -name "*.bak" \) -not -path "*/node_modules/*" -not -path "*/.next/*" | wc -l)

echo "Found $LEGACY_COUNT legacy files to remove"
echo ""

# List files that will be removed
echo "Files to be removed:"
find . -type f \( -name "*.old" -o -name "*.backup" -o -name "*.deprecated" -o -name "*-old.*" -o -name "*.bak" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*"

echo ""
read -p "Proceed with deletion? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
  # Remove legacy files
  find . -type f \( -name "*.old" -o -name "*.backup" -o -name "*.deprecated" -o -name "*-old.*" -o -name "*.bak" \) \
    -not -path "*/node_modules/*" \
    -not -path "*/.next/*" \
    -delete
  
  echo "✓ Legacy files removed successfully"
  
  # Verify cleanup
  REMAINING=$(find . -type f \( -name "*.old" -o -name "*.backup" -o -name "*.deprecated" -o -name "*-old.*" -o -name "*.bak" \) -not -path "*/node_modules/*" -not -path "*/.next/*" | wc -l)
  
  if [ "$REMAINING" -eq 0 ]; then
    echo "✓ Cleanup verified: 0 legacy files remaining"
  else
    echo "⚠ Warning: $REMAINING legacy files still remain"
  fi
else
  echo "Cleanup cancelled"
  exit 0
fi

echo ""
echo "=== Cleanup Complete ==="
echo "Completed at: $(date)"
