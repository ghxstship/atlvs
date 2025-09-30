#!/bin/bash

# Fix atomic component import paths after directory cleanup

echo "🔧 Fixing atomic component import paths..."

ROOT_DIR="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship"

# Function to fix imports in a file
fix_imports() {
    local file="$1"
    echo "  📝 Fixing imports in: $(basename "$file")"
    
    # Backup original file
    cp "$file" "$file.backup"
    
    # Fix Button imports
    sed -i '' "s|from '../atomic/Button'|from '../Button'|g" "$file"
    sed -i '' "s|from '../atomic/Input'|from '../Input'|g" "$file"
    sed -i '' "s|from '../atomic/Textarea'|from '../Textarea'|g" "$file"
    sed -i '' "s|from '../atomic/Checkbox'|from '../Checkbox'|g" "$file"
    
    # Also fix any other atomic imports that might exist
    sed -i '' "s|from '../atomic/|from '../|g" "$file"
    
    # Remove backup if successful
    if [ $? -eq 0 ]; then
        rm "$file.backup"
    else
        echo "  ❌ Error processing $file, restoring backup"
        mv "$file.backup" "$file"
    fi
}

# Find all files with atomic imports and fix them
echo "📁 Searching for files with atomic imports..."
find "$ROOT_DIR/packages/ui/src" -name "*.tsx" -o -name "*.ts" | xargs grep -l "from '../atomic/" | while read -r file; do
    fix_imports "$file"
done

echo "✅ Import path fixes complete!"
echo "🔧 All atomic component imports have been updated"
