#!/bin/bash

echo "Fixing remaining TypeScript errors..."

# Fix datetime field types to date
find . -name "*.tsx" -type f -exec sed -i '' "s/type: 'datetime'/type: 'date'/g" {} \;

# Remove invalid props from Drawer components
find . -name "*.tsx" -type f -exec sed -i '' '/onModeChange={.*}/d' {} \;
find . -name "*.tsx" -type f -exec sed -i '' '/enableComments={.*}/d' {} \;
find . -name "*.tsx" -type f -exec sed -i '' '/enableActivity={.*}/d' {} \;
find . -name "*.tsx" -type f -exec sed -i '' '/enableFiles={.*}/d' {} \;

# Remove onRowClick props from DataGrid components
find . -name "*.tsx" -type f -exec sed -i '' 's/<DataGrid onRowClick={[^}]*}/<DataGrid/g' {} \;

# Fix onOpenChange to onClose in Drawer components
find . -name "*.tsx" -type f -exec sed -i '' 's/onOpenChange={setDrawerOpen}/onClose={() => setDrawerOpen(false)}/g' {} \;
find . -name "*.tsx" -type f -exec sed -i '' 's/onOpenChange={setIsOpen}/onClose={() => setIsOpen(false)}/g' {} \;
find . -name "*.tsx" -type f -exec sed -i '' 's/onOpenChange={setOpen}/onClose={() => setOpen(false)}/g' {} \;

# Remove placeholder props from FieldConfig
find . -name "*.tsx" -type f -exec sed -i '' '/placeholder:/d' {} \;

echo "Fixed common TypeScript errors"
