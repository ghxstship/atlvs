#!/bin/bash

# Comprehensive fix for all Promise generic type errors
cd "apps/web"

echo "🔧 Fixing all Promise generic type errors..."

# Fix Promise<PaginatedResponse<T> { patterns
echo "Fixing Promise<PaginatedResponse<...> { patterns..."
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's/Promise<PaginatedResponse<\([^>]*\) {/Promise<PaginatedResponse<\1>> {/g' {} \;

# Fix Promise<PostgrestResponse<T> { patterns  
echo "Fixing Promise<PostgrestResponse<...> { patterns..."
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's/Promise<PostgrestResponse<\([^>]*\) {/Promise<PostgrestResponse<\1>> {/g' {} \;

# Fix Promise<Result<T> { patterns
echo "Fixing Promise<Result<...> { patterns..."
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's/Promise<Result<\([^>]*\) {/Promise<Result<\1>> {/g' {} \;

# Fix Promise<Response<T> { patterns
echo "Fixing Promise<Response<...> { patterns..."
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's/Promise<Response<\([^>]*\) {/Promise<Response<\1>> {/g' {} \;

# Fix RealtimeChannel<{ patterns
echo "Fixing RealtimeChannel<{ patterns..."
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's/RealtimeChannel<{/RealtimeChannel<Record<string, unknown>>/g' {} \;

# Fix Map<string, Set<(data: unknown) => void)> patterns
echo "Fixing Map/Set patterns..."
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's/Map<string, Set<(data: unknown) => void)>/Map<string, Set<(data: unknown) => void>>/g' {} \;

# Fix Record<string, unknown)> patterns
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' 's/Record<string, unknown)>/Record<string, unknown>>/g' {} \;

echo "✅ All Promise generic type errors fixed!"

# Count remaining errors
echo ""
echo "Checking remaining TypeScript errors..."
cd ../..
ERROR_COUNT=$(npx tsc --noEmit 2>&1 | grep -c "error TS")
echo "Remaining TypeScript errors: $ERROR_COUNT"

if [ "$ERROR_COUNT" -lt 100 ]; then
  echo "✅ Under 100 errors! Showing first 50:"
  npx tsc --noEmit 2>&1 | head -50
else
  echo "⚠️  Still over 100 errors. Showing first 50:"
  npx tsc --noEmit 2>&1 | head -50
fi
