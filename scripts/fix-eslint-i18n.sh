#!/bin/bash

# GHXSTSHIP ESLint i18n Package Fix Script
# Purpose: Fix ESLint configuration in i18n package
# Issue: Using flat config (eslint.config.js) with legacy --ext flag

set -e

REPO_ROOT="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship"
I18N_PACKAGE="$REPO_ROOT/packages/i18n"

echo "=== GHXSTSHIP ESLint i18n Fix ==="
echo "Starting fix at: $(date)"
echo ""

cd "$I18N_PACKAGE"

# Check if package.json exists
if [ ! -f "package.json" ]; then
  echo "❌ Error: package.json not found in $I18N_PACKAGE"
  exit 1
fi

echo "Current lint script:"
grep '"lint"' package.json

echo ""
echo "Fixing lint script to remove --ext flag..."

# Backup package.json
cp package.json package.json.backup

# Fix the lint script - remove --ext flag for flat config compatibility
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  sed -i '' 's/"lint": "eslint src --ext .ts,.tsx"/"lint": "eslint src"/g' package.json
else
  # Linux
  sed -i 's/"lint": "eslint src --ext .ts,.tsx"/"lint": "eslint src"/g' package.json
fi

echo "✓ Lint script updated"
echo ""
echo "New lint script:"
grep '"lint"' package.json

echo ""
echo "Testing ESLint configuration..."

# Test if ESLint runs without errors
if pnpm run lint --dry-run 2>&1 | grep -q "Invalid option"; then
  echo "⚠ ESLint still has configuration issues"
  echo "Restoring backup..."
  mv package.json.backup package.json
  exit 1
else
  echo "✓ ESLint configuration fixed successfully"
  rm package.json.backup
fi

echo ""
echo "=== Fix Complete ==="
echo "Completed at: $(date)"
echo ""
echo "Next steps:"
echo "1. Run 'pnpm run lint' to verify"
echo "2. Commit the changes"
echo "3. Run full turbo lint: 'npm run lint' from root"
