#!/bin/bash

# Comprehensive script to fix all incomplete generic types
cd "apps/web"

echo "🔧 Fixing incomplete generic types across the codebase..."

# Pattern 1: PostgrestResponse<)
echo "Fixing PostgrestResponse<)..."
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -exec grep -l "PostgrestResponse<)" {} \; | while read file; do
  echo "  - $file"
  sed -i '' 's/PostgrestResponse<)/PostgrestResponse<unknown>/g' "$file"
done

# Pattern 2: Promise<)
echo "Fixing Promise<)..."
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -exec grep -l "Promise<)" {} \; | while read file; do
  echo "  - $file"
  sed -i '' 's/Promise<)/Promise<unknown>/g' "$file"
done

# Pattern 3: Array<)
echo "Fixing Array<)..."
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -exec grep -l "Array<)" {} \; | while read file; do
  echo "  - $file"
  sed -i '' 's/Array<)/Array<unknown>/g' "$file"
done

# Pattern 4: Record<)
echo "Fixing Record<)..."
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -exec grep -l "Record<)" {} \; | while read file; do
  echo "  - $file"
  sed -i '' 's/Record<)/Record<string, unknown>/g' "$file"
done

# Pattern 5: RealtimeChannel<)
echo "Fixing RealtimeChannel<)..."
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -exec grep -l "RealtimeChannel<)" {} \; | while read file; do
  echo "  - $file"
  sed -i '' 's/RealtimeChannel<)/RealtimeChannel<unknown>/g' "$file"
done

# Pattern 6: Partial<)
echo "Fixing Partial<)..."
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -exec grep -l "Partial<)" {} \; | while read file; do
  echo "  - $file"
  sed -i '' 's/Partial<)/Partial<Record<string, unknown>>/g' "$file"
done

# Pattern 7: Omit<)
echo "Fixing Omit<)..."
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -exec grep -l "Omit<)" {} \; | while read file; do
  echo "  - $file"
  sed -i '' 's/Omit<)/Omit<Record<string, unknown>, never>/g' "$file"
done

# Pattern 8: Pick<)
echo "Fixing Pick<)..."
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -exec grep -l "Pick<)" {} \; | while read file; do
  echo "  - $file"
  sed -i '' 's/Pick<)/Pick<Record<string, unknown>, never>/g' "$file"
done

echo "✅ Generic type fixes complete!"
echo ""
echo "Running TypeScript check to count remaining errors..."
cd ../..
npm run build 2>&1 | grep "error TS" | wc -l || echo "Build completed"
