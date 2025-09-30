#!/bin/bash

# Find all tsx files with malformed imports
find apps/web -name "*.tsx" -exec grep -l "import {$" {} \; | while read file; do
  echo "Fixing $file"
  
  # Fix the import pattern by removing the broken line and fixing the structure
  sed -i '/^import {$/d' "$file"
  
  # Fix any remaining malformed import lines
  sed -i 's/^import { Edit } from .lucide-react.;$/import { Edit } from '\''lucide-react'\'';/' "$file"
  sed -i 's/^  import { Edit } from .lucide-react.;$/import { Edit } from '\''lucide-react'\'';/' "$file"
  
  # Add zod import if missing
  if grep -q "formSchema = z.object" "$file" && ! grep -q "import { z } from 'zod';" "$file"; then
    sed -i '/import { zodResolver } from '\''@hookform\/resolvers\/zod'\'';/a import { z } from '\''zod'\'';' "$file"
  fi
  
done

echo "Import fixes completed"
