#!/bin/bash

echo "Fixing all remaining Drawer component issues..."

# Fix remaining UniversalDrawer references
find apps/web -name "*.tsx" -type f -exec sed -i '' 's/UniversalDrawer/Drawer/g' {} \;

# Fix isOpen prop to open
find apps/web -name "*.tsx" -type f -exec sed -i '' 's/isOpen={/open={/g' {} \;

# Fix size prop to width for Drawer components (but not Button components)
find apps/web -name "*.tsx" -type f -exec sed -i '' 's/size="lg"/width="lg"/g' {} \;
find apps/web -name "*.tsx" -type f -exec sed -i '' 's/size="md"/width="md"/g' {} \;
find apps/web -name "*.tsx" -type f -exec sed -i '' 's/size="sm"/width="sm"/g' {} \;
find apps/web -name "*.tsx" -type f -exec sed -i '' 's/size="xl"/width="xl"/g' {} \;

# Fix Button width props back to size (since we may have changed Button props by mistake)
find apps/web -name "*.tsx" -type f -exec sed -i '' 's/<Button[^>]*width="sm"/<Button size="sm"/g' {} \;
find apps/web -name "*.tsx" -type f -exec sed -i '' 's/<Button[^>]*width="md"/<Button size="md"/g' {} \;
find apps/web -name "*.tsx" -type f -exec sed -i '' 's/<Button[^>]*width="lg"/<Button size="lg"/g' {} \;

# Fix Badge variant "default" to "primary"
find apps/web -name "*.tsx" -type f -exec sed -i '' 's/variant="default"/variant="primary"/g' {} \;

# Fix Button variant "default" to "primary"
find apps/web -name "*.tsx" -type f -exec sed -i '' 's/<Button[^>]*variant="default"/<Button variant="primary"/g' {} \;

echo "All Drawer component issues fixed!"
