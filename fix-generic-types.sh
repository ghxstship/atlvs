#!/bin/bash

# Fix incomplete generic types across the codebase
cd "apps/web"

# Fix RealtimePostgresChangesPayload<) => void
find . -name "*.ts" -o -name "*.tsx" | while read file; do
  if grep -q "RealtimePostgresChangesPayload<)" "$file"; then
    echo "Fixing $file"
    sed -i '' 's/RealtimePostgresChangesPayload<)/RealtimePostgresChangesPayload<Record<string, unknown>>/g' "$file"
  fi
done

# Fix PostgrestResponse<) => void
find . -name "*.ts" -o -name "*.tsx" | while read file; do
  if grep -q "PostgrestResponse<)" "$file"; then
    echo "Fixing $file"
    sed -i '' 's/PostgrestResponse<)/PostgrestResponse<unknown>/g' "$file"
  fi
done

# Fix Promise<) => void
find . -name "*.ts" -o -name "*.tsx" | while read file; do
  if grep -q "Promise<)" "$file"; then
    echo "Fixing $file"
    sed -i '' 's/Promise<)/Promise<unknown>/g' "$file"
  fi
done

echo "Done fixing generic types"
