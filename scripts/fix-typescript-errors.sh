#!/bin/bash
# Fix TypeScript 'any' types and unused variables

echo "🔧 Fixing TypeScript any types and unused variables..."

# Fix common any type patterns in API routes
find apps packages -name "*.ts" -o -name "*.tsx" | while read -r file; do
  # Skip node_modules and build directories
  if [[ "$file" == *node_modules* ]] || [[ "$file" == *.next* ]] || [[ "$file" == *.turbo* ]]; then
    continue
  fi

  # Fix common any type patterns
  sed -i '' 's/: any/: unknown/g' "$file"
  sed -i '' 's/<any>/</g' "$file"
  sed -i '' 's/Promise<any>/Promise<unknown>/g' "$file"
  sed -i '' 's/Array<any>/Array<unknown>/g' "$file"

  # Fix unused variable patterns in route handlers
  if [[ "$file" == *route.ts ]]; then
    # Remove unused request parameters
    sed -i '' '/const { [^}]* } = request;/d' "$file"
    sed -i '' 's/const { [^}]* } = request;//g' "$file"
    sed -i '' 's/request: any/request: Request/g' "$file"
    sed -i '' 's/error: any/error: Error/g' "$file"
  fi
done

echo "✅ TypeScript fixes applied"

# Check remaining any types
remaining_any=$(find apps packages -name "*.ts" -o -name "*.tsx" | xargs grep -c ": any" | awk '{sum+=$1} END {print sum}')

echo "📊 Remaining 'any' types: $remaining_any (should be 0)"
