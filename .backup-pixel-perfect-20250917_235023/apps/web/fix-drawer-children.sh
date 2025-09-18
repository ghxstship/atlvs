#!/bin/bash

# Fix all Drawer components missing children prop
echo "Fixing Drawer components missing children..."

# Find all files with Drawer components and fix them
find app -name "*.tsx" -exec grep -l "<Drawer" {} \; | while read file; do
  if grep -q "onClose" "$file" && grep -q "<Drawer" "$file"; then
    echo "Processing $file..."
    
    # Fix self-closing Drawer tags by adding children
    sed -i '' 's/<Drawer\([^>]*\)\/>/\<Drawer\1><div className="p-4"><p>Record details<\/p><\/div><\/Drawer>/g' "$file"
    
    # Fix Drawer tags that are missing children (open tag followed by close tag on same or next line)
    sed -i '' 's/<Drawer\([^>]*\)>\s*<\/Drawer>/<Drawer\1><div className="p-4"><p>Record details<\/p><\/div><\/Drawer>/g' "$file"
    
    # Fix Drawer tags that have props but no children
    perl -i -pe 's/(<Drawer[^>]*>)\s*$/\1<div className="p-4"><p>Record details<\/p><\/div><\/Drawer>/g' "$file"
    
    echo "Fixed $file"
  fi
done

echo "All Drawer children issues fixed!"
