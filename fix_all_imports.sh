#!/bin/bash

echo "Starting comprehensive import fix..."

# Find all tsx files with malformed imports
find apps/web -name "*Drawer.tsx" -o -name "*Create*.tsx" | while read file; do
  echo "Processing $file"
  
  # Skip if file doesn't exist or is already fixed
  if [ ! -f "$file" ]; then
    continue
  fi
  
  # Check if file has the broken import pattern
  if grep -q "^import {$" "$file"; then
    echo "Fixing broken import in $file"
    
    # Remove the broken import line
    sed -i '/^import {$/d' "$file"
    
    # Fix any remaining malformed import lines
    sed -i 's/^import { Edit } from .lucide-react.;$/import { Edit } from '\''lucide-react'\'';/' "$file"
    sed -i 's/^  import { Edit } from .lucide-react.;$/import { Edit } from '\''lucide-react'\'';/' "$file"
    
    # Add zod import if missing and needed
    if grep -q "formSchema = z.object" "$file" && ! grep -q "import { z } from 'zod';" "$file"; then
      sed -i '/import { zodResolver } from '\''@hookform\/resolvers\/zod'\'';/a import { z } from '\''zod'\'';' "$file"
    fi
  fi
done

# Fix any remaining issues in specific files
find apps/web -name "*.tsx" | while read file; do
  # Fix duplicate import issues
  if grep -q "import { Edit } from 'lucide-react';" "$file" && grep -q "import { Edit } from 'lucide-react';" "$file" | wc -l | grep -q "2"; then
    # Remove duplicate Edit imports
    sed -i '0,/import { Edit } from '\''lucide-react'\'';/ {/import { Edit } from '\''lucide-react'\'';/d;}' "$file"
  fi
done

echo "Import fixes completed"
