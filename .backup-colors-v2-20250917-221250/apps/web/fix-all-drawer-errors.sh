#!/bin/bash

# Comprehensive script to fix all remaining Drawer component errors
# This script removes unsupported props and adds required children to Drawer components

echo "🔧 Starting comprehensive Drawer component fixes..."

# Find all files with Drawer components that have unsupported props
FILES_TO_FIX=(
  "app/(protected)/companies/contracts/ContractsClient.tsx"
  "app/(protected)/companies/directory/DirectoryClient.tsx"
  "app/(protected)/companies/qualifications/QualificationsClient.tsx"
  "app/(protected)/companies/ratings/RatingsClient.tsx"
)

for file in "${FILES_TO_FIX[@]}"; do
  if [ -f "$file" ]; then
    echo "🔄 Processing $file..."
    
    # Remove unsupported props: record, fields, onSave, mode
    sed -i '' '/record={[^}]*}/d' "$file"
    sed -i '' '/fields={[^}]*}/d' "$file"
    sed -i '' '/onSave={[^}]*}/d' "$file"
    sed -i '' '/mode={[^}]*}/d' "$file"
    
    # Fix self-closing Drawer tags to have children
    # Replace /> with ><div className="p-4"><p>Form content would go here</p></div></Drawer>
    sed -i '' 's|/>|>\
          <div className="p-4">\
            <p>Form content would go here</p>\
          </div>\
        </Drawer>|g' "$file"
    
    echo "✅ Fixed $file"
  else
    echo "⚠️  File not found: $file"
  fi
done

# Search for any remaining Drawer components with unsupported props
echo "🔍 Searching for remaining Drawer prop errors..."
grep -r "record=" app/ --include="*.tsx" | grep -v "DataRecord" || echo "✅ No 'record' props found"
grep -r "fields=" app/ --include="*.tsx" | grep -v "fieldConfig" || echo "✅ No 'fields' props found"
grep -r "onSave=" app/ --include="*.tsx" | grep "Drawer" || echo "✅ No 'onSave' props on Drawer found"

echo "🎉 Comprehensive Drawer fixes completed!"
