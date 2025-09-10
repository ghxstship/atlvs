#!/bin/bash

# Global fix for createServerClient() calls in GHXSTSHIP
echo "🔧 Fixing createServerClient() calls globally..."

# List of files to fix
files=(
  "apps/web/app/api/v1/projects/[id]/route.ts"
  "apps/web/app/api/v1/projects/[id]/tasks/[taskId]/route.ts"
  "apps/web/app/api/v1/projects/[id]/files/route.ts"
  "apps/web/app/api/v1/projects/[id]/inspections/route.ts"
  "apps/web/app/api/v1/projects/[id]/risks/route.ts"
  "apps/web/app/api/v1/projects/[id]/tasks/route.ts"
  "apps/web/app/api/v1/projects/[id]/time-entries/route.ts"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "📝 Fixing $file..."
    
    # Replace import
    sed -i '' 's/import { createServerClient } from '\''@ghxstship\/auth'\'';/import { createClient } from '\''@\/lib\/supabase\/server'\'';/g' "$file"
    
    # Replace function calls
    sed -i '' 's/createServerClient()/await createClient()/g' "$file"
    
    echo "✅ Fixed $file"
  else
    echo "⚠️  File not found: $file"
  fi
done

echo "🎉 All createServerClient() calls have been fixed!"
echo "📋 Summary:"
echo "   - Updated imports to use @/lib/supabase/server"
echo "   - Changed createServerClient() to await createClient()"
echo "   - Fixed ${#files[@]} files total"
