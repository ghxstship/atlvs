#!/bin/bash

# COMPONENT DUPLICATION DETECTION
# Automated duplicate component scanner

UI_PATH="packages/ui/src"

echo "🔍 Scanning for duplicate components..."
echo ""

# Find duplicate component names
find "$UI_PATH" -type f -name "*.tsx" -o -name "*.ts" | \
  xargs -n1 basename | \
  sort | \
  uniq -d | \
  while read duplicate; do
    echo "⚠️  Duplicate found: $duplicate"
    find "$UI_PATH" -name "$duplicate"
    echo ""
  done

echo "✅ Scan complete"
