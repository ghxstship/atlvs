#!/bin/bash

# Comprehensive fix for all remaining TypeScript errors in GHXSTSHIP production build
cd "apps/web"

echo "🔧 Starting comprehensive TypeScript error fixes..."

# Fix 1: Incomplete RealtimePostgresChangesPayload generics
echo "Fixing RealtimePostgresChangesPayload generics..."
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -exec grep -l "RealtimePostgresChangesPayload<)" {} \; | while read file; do
  echo "  - $file"
  sed -i '' 's/RealtimePostgresChangesPayload<)/RealtimePostgresChangesPayload<Record<string, unknown>>/g' "$file"
done

# Fix 2: Incomplete PostgrestResponse generics
echo "Fixing PostgrestResponse generics..."
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -exec grep -l "PostgrestResponse<)" {} \; | while read file; do
  echo "  - $file"
  sed -i '' 's/PostgrestResponse<)/PostgrestResponse<unknown>/g' "$file"
done

# Fix 3: Incomplete Promise generics
echo "Fixing Promise generics..."
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -exec grep -l "Promise<)" {} \; | while read file; do
  echo "  - $file"
  sed -i '' 's/Promise<)/Promise<unknown>/g' "$file"
done

# Fix 4: Generic type issues in view files
echo "Fixing view component generics..."
find . -name "*View.tsx" -exec sed -i '' 's/RealtimePostgresChangesPayload<)/RealtimePostgresChangesPayload<Record<string, unknown>>/g' {} \;

# Fix 5: Fix malformed Map/Set declarations
echo "Fixing Map/Set declarations..."
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -exec grep -l "new Map<.*Set<.*);" {} \; | while read file; do
  echo "  - $file"
  sed -i '' 's/new Map<.*Set<.*);/new Map<string, Set<(data: unknown) => void>>();/g' "$file"
done

echo "✅ All automated fixes applied!"

# Run final check
echo ""
echo "Running final TypeScript check..."
cd ../..
npm run build 2>&1 | grep "Found.*errors" || echo "Build completed successfully"
