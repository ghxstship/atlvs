#!/bin/bash

# Fix all createServerClient calls to use cookieStore only
echo "Fixing createServerClient calls..."

# Find all files with the old pattern and replace them
find . -name "*.tsx" -type f -exec grep -l "createServerClient(" {} \; | while read file; do
  # Check if file contains the old multi-argument pattern
  if grep -q "createServerClient(\s*process\.env\.NEXT_PUBLIC_SUPABASE_URL" "$file"; then
    echo "Fixing $file"
    # Replace the multi-argument createServerClient call with single cookieStore argument
    sed -i '' '/const sb = createServerClient(/,/);/c\
  const sb = createServerClient(cookieStore);' "$file"
  fi
done

echo "Fixed all createServerClient calls"
