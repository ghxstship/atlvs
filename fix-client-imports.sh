#!/bin/bash

echo "Fixing client component unused imports..."

# Find and remove unused imports in client components
find apps/web/app -name "*.tsx" -o -name "*.ts" | while read file; do
  # Remove unused icon imports
  sed -i '' '/^import.*Settings.*from.*lucide-react.*$/d' "$file"
  sed -i '' '/^import.*Download.*from.*lucide-react.*$/d' "$file"
  sed -i '' '/^import.*Eye.*from.*lucide-react.*$/d' "$file"
  
  # Comment out unused z imports
  sed -i '' "s/^import { z } from 'zod';/\/\/ import { z } from 'zod';/" "$file"
  
  # Comment out unused DashboardWidget imports
  sed -i '' "s/^import.*DashboardWidget.*from/\/\/ import DashboardWidget from/" "$file"
done

# Fix specific files with known issues
# Remove unused onClose prop
find apps/web/app -name "*.tsx" | xargs grep -l "onClose.*is defined but never used" | while read file; do
  sed -i '' 's/onClose,/\/\/ onClose,/' "$file"
done

echo "Client imports fixed!"
