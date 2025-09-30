#!/bin/bash

echo "Fixing all remaining build errors..."

# Fix all API routes with unused _request parameters
echo "Fixing unused _request parameters in API routes..."
find apps/web/app/api -name "*.ts" -exec grep -l "export async function GET(_request: NextRequest)" {} \; | while read file; do
  # Check if the file actually uses the request parameter
  if ! grep -q "_request\." "$file" && ! grep -q "new URL(_request" "$file"; then
    # If not used, keep it as _request
    echo "Keeping _request in $file"
  else
    # If used, rename to request
    sed -i '' 's/export async function GET(_request: NextRequest)/export async function GET(request: NextRequest)/' "$file"
  fi
done

# Fix all 'any' types with 'unknown'
echo "Replacing 'any' types with 'unknown'..."
find apps/web/app -name "*.ts" -o -name "*.tsx" | while read file; do
  sed -i '' 's/: any\[\]/: unknown[]/g' "$file"
  sed -i '' 's/: any)/: unknown)/g' "$file"
  sed -i '' 's/<any>/<unknown>/g' "$file"
  sed -i '' 's/ as any/ as unknown/g' "$file"
  sed -i '' 's/Record<string, any>/Record<string, unknown>/g' "$file"
done

# Fix missing icon imports in client components
echo "Adding missing icon imports..."
find apps/web/app -name "*.tsx" | while read file; do
  # Check if file uses any icons
  if grep -q "User\|FileText\|Settings\|Award\|Calendar\|TrendingUp\|Activity\|Clock\|Plus\|Search\|Play\|Trash2" "$file"; then
    # Check if lucide-react is already imported
    if ! grep -q "from 'lucide-react'" "$file"; then
      # Add import at the top after 'use client' if present
      if grep -q "'use client'" "$file"; then
        sed -i '' "/'use client'/a\\
import { User, FileText, Settings, Award, Calendar, TrendingUp, Activity, Clock, Plus, Search, Play, Trash2 } from 'lucide-react';" "$file"
      else
        # Add at the very top
        sed -i '' "1i\\
import { User, FileText, Settings, Award, Calendar, TrendingUp, Activity, Clock, Plus, Search, Play, Trash2 } from 'lucide-react';" "$file"
      fi
    fi
  fi
done

echo "Build fixes complete!"
