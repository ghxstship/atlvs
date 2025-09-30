#!/bin/bash

echo "🔧 Fixing client directives - removing from pages with metadata..."

cd "/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship"

# Remove 'use client' from all marketing pages first
find ./apps/web/app/\(marketing\) -name "*.tsx" -exec sed -i '' '/^'\''use client'\'';$/d' {} \;

# Remove React imports that are not needed for server components
find ./apps/web/app/\(marketing\) -name "*.tsx" -exec sed -i '' '/^import React from '\''react'\'';$/d' {} \;

# Only add 'use client' to pages that actually need it (those with useState, useEffect, etc.)
# Check for useState usage and add 'use client' only to those
find ./apps/web/app/\(marketing\) -name "*.tsx" -exec grep -l "useState\|useEffect\|useCallback\|useMemo" {} \; | while read file; do
  sed -i '' '1i\
'\''use client'\'';
' "$file"
done

echo "✅ Client directives fixed!"
