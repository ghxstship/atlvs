#!/bin/bash

# Format All Code - Comprehensive Formatting Script
# This script runs Prettier across the entire codebase

set -e

echo "🎨 GHXSTSHIP Code Formatting - Starting..."
echo "=========================================="

# Check if prettier is installed
if ! command -v prettier &> /dev/null; then
    echo "❌ Prettier not found. Installing..."
    pnpm install -D prettier
fi

# Format all files
echo "📝 Formatting all code files..."
pnpm prettier --write . \
  --ignore-path .gitignore \
  --log-level warn

echo ""
echo "✅ Code formatting complete!"
echo ""
echo "📊 Summary:"
echo "  - All TypeScript/JavaScript files formatted"
echo "  - All JSON files formatted"
echo "  - All Markdown files formatted"
echo "  - All CSS files formatted"
echo ""
echo "💡 Tip: Run 'pnpm format:check' to verify without writing"
