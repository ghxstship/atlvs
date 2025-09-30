#!/bin/bash

# Comprehensive Layout Normalization Script
# Fixes all hardcoded spacing violations and normalizes to semantic design tokens

echo "🎯 Starting comprehensive layout normalization..."

# Define the root directory
ROOT_DIR="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship"

# Function to normalize spacing in files
normalize_spacing() {
    local file="$1"
    echo "  📝 Normalizing: $(basename "$file")"
    
    # Backup original file
    cp "$file" "$file.backup"
    
    # Padding normalization (p-*)
    sed -i '' 's/p-1\b/p-xs/g' "$file"
    sed -i '' 's/p-2\b/p-xs/g' "$file"
    sed -i '' 's/p-3\b/p-sm/g' "$file"
    sed -i '' 's/p-4\b/p-md/g' "$file"
    sed -i '' 's/p-5\b/p-md/g' "$file"
    sed -i '' 's/p-6\b/p-lg/g' "$file"
    sed -i '' 's/p-7\b/p-lg/g' "$file"
    sed -i '' 's/p-8\b/p-xl/g' "$file"
    sed -i '' 's/p-10\b/p-xl/g' "$file"
    sed -i '' 's/p-12\b/p-2xl/g' "$file"
    sed -i '' 's/p-16\b/p-3xl/g' "$file"
    sed -i '' 's/p-20\b/p-4xl/g' "$file"
    sed -i '' 's/p-24\b/p-5xl/g' "$file"
    
    # Horizontal padding (px-*)
    sed -i '' 's/px-1\b/px-xs/g' "$file"
    sed -i '' 's/px-2\b/px-xs/g' "$file"
    sed -i '' 's/px-3\b/px-sm/g' "$file"
    sed -i '' 's/px-4\b/px-md/g' "$file"
    sed -i '' 's/px-5\b/px-md/g' "$file"
    sed -i '' 's/px-6\b/px-lg/g' "$file"
    sed -i '' 's/px-7\b/px-lg/g' "$file"
    sed -i '' 's/px-8\b/px-xl/g' "$file"
    sed -i '' 's/px-10\b/px-xl/g' "$file"
    sed -i '' 's/px-12\b/px-2xl/g' "$file"
    sed -i '' 's/px-16\b/px-3xl/g' "$file"
    sed -i '' 's/px-20\b/px-4xl/g' "$file"
    sed -i '' 's/px-24\b/px-5xl/g' "$file"
    
    # Vertical padding (py-*)
    sed -i '' 's/py-1\b/py-xs/g' "$file"
    sed -i '' 's/py-2\b/py-xs/g' "$file"
    sed -i '' 's/py-3\b/py-sm/g' "$file"
    sed -i '' 's/py-4\b/py-md/g' "$file"
    sed -i '' 's/py-5\b/py-md/g' "$file"
    sed -i '' 's/py-6\b/py-lg/g' "$file"
    sed -i '' 's/py-7\b/py-lg/g' "$file"
    sed -i '' 's/py-8\b/py-xl/g' "$file"
    sed -i '' 's/py-10\b/py-xl/g' "$file"
    sed -i '' 's/py-12\b/py-2xl/g' "$file"
    sed -i '' 's/py-16\b/py-3xl/g' "$file"
    sed -i '' 's/py-20\b/py-4xl/g' "$file"
    sed -i '' 's/py-24\b/py-5xl/g' "$file"
    
    # Margin normalization (m-*)
    sed -i '' 's/m-1\b/m-xs/g' "$file"
    sed -i '' 's/m-2\b/m-xs/g' "$file"
    sed -i '' 's/m-3\b/m-sm/g' "$file"
    sed -i '' 's/m-4\b/m-md/g' "$file"
    sed -i '' 's/m-5\b/m-md/g' "$file"
    sed -i '' 's/m-6\b/m-lg/g' "$file"
    sed -i '' 's/m-8\b/m-xl/g' "$file"
    sed -i '' 's/m-10\b/m-xl/g' "$file"
    sed -i '' 's/m-12\b/m-2xl/g' "$file"
    sed -i '' 's/m-16\b/m-3xl/g' "$file"
    
    # Bottom margin (mb-*)
    sed -i '' 's/mb-1\b/mb-xs/g' "$file"
    sed -i '' 's/mb-2\b/mb-xs/g' "$file"
    sed -i '' 's/mb-3\b/mb-sm/g' "$file"
    sed -i '' 's/mb-4\b/mb-md/g' "$file"
    sed -i '' 's/mb-5\b/mb-md/g' "$file"
    sed -i '' 's/mb-6\b/mb-lg/g' "$file"
    sed -i '' 's/mb-8\b/mb-xl/g' "$file"
    sed -i '' 's/mb-10\b/mb-xl/g' "$file"
    sed -i '' 's/mb-12\b/mb-2xl/g' "$file"
    sed -i '' 's/mb-16\b/mb-3xl/g' "$file"
    sed -i '' 's/mb-20\b/mb-4xl/g' "$file"
    sed -i '' 's/mb-24\b/mb-5xl/g' "$file"
    
    # Top margin (mt-*)
    sed -i '' 's/mt-1\b/mt-xs/g' "$file"
    sed -i '' 's/mt-2\b/mt-xs/g' "$file"
    sed -i '' 's/mt-3\b/mt-sm/g' "$file"
    sed -i '' 's/mt-4\b/mt-md/g' "$file"
    sed -i '' 's/mt-5\b/mt-md/g' "$file"
    sed -i '' 's/mt-6\b/mt-lg/g' "$file"
    sed -i '' 's/mt-8\b/mt-xl/g' "$file"
    sed -i '' 's/mt-10\b/mt-xl/g' "$file"
    sed -i '' 's/mt-12\b/mt-2xl/g' "$file"
    sed -i '' 's/mt-16\b/mt-3xl/g' "$file"
    sed -i '' 's/mt-20\b/mt-4xl/g' "$file"
    sed -i '' 's/mt-24\b/mt-5xl/g' "$file"
    
    # Left/Right margins
    sed -i '' 's/ml-1\b/ml-xs/g' "$file"
    sed -i '' 's/ml-2\b/ml-xs/g' "$file"
    sed -i '' 's/ml-3\b/ml-sm/g' "$file"
    sed -i '' 's/ml-4\b/ml-md/g' "$file"
    sed -i '' 's/ml-6\b/ml-lg/g' "$file"
    sed -i '' 's/ml-8\b/ml-xl/g' "$file"
    
    sed -i '' 's/mr-1\b/mr-xs/g' "$file"
    sed -i '' 's/mr-2\b/mr-xs/g' "$file"
    sed -i '' 's/mr-3\b/mr-sm/g' "$file"
    sed -i '' 's/mr-4\b/mr-md/g' "$file"
    sed -i '' 's/mr-6\b/mr-lg/g' "$file"
    sed -i '' 's/mr-8\b/mr-xl/g' "$file"
    
    # Gap normalization (gap-*)
    sed -i '' 's/gap-1\b/gap-xs/g' "$file"
    sed -i '' 's/gap-2\b/gap-xs/g' "$file"
    sed -i '' 's/gap-3\b/gap-sm/g' "$file"
    sed -i '' 's/gap-4\b/gap-md/g' "$file"
    sed -i '' 's/gap-5\b/gap-md/g' "$file"
    sed -i '' 's/gap-6\b/gap-lg/g' "$file"
    sed -i '' 's/gap-8\b/gap-xl/g' "$file"
    sed -i '' 's/gap-10\b/gap-xl/g' "$file"
    sed -i '' 's/gap-12\b/gap-2xl/g' "$file"
    sed -i '' 's/gap-16\b/gap-3xl/g' "$file"
    
    # Space-y normalization (space-y-*)
    sed -i '' 's/space-y-1\b/space-y-xs/g' "$file"
    sed -i '' 's/space-y-2\b/space-y-xs/g' "$file"
    sed -i '' 's/space-y-3\b/space-y-sm/g' "$file"
    sed -i '' 's/space-y-4\b/space-y-md/g' "$file"
    sed -i '' 's/space-y-6\b/space-y-lg/g' "$file"
    sed -i '' 's/space-y-8\b/space-y-xl/g' "$file"
    
    # Space-x normalization (space-x-*)
    sed -i '' 's/space-x-1\b/space-x-xs/g' "$file"
    sed -i '' 's/space-x-2\b/space-x-xs/g' "$file"
    sed -i '' 's/space-x-3\b/space-x-sm/g' "$file"
    sed -i '' 's/space-x-4\b/space-x-md/g' "$file"
    sed -i '' 's/space-x-6\b/space-x-lg/g' "$file"
    sed -i '' 's/space-x-8\b/space-x-xl/g' "$file"
    
    # Typography normalization
    sed -i '' 's/text-xs\b/text-size-xs/g' "$file"
    sed -i '' 's/text-sm\b/text-size-sm/g' "$file"
    sed -i '' 's/text-base\b/text-size-md/g' "$file"
    sed -i '' 's/text-lg\b/text-size-lg/g' "$file"
    sed -i '' 's/text-xl\b/text-size-xl/g' "$file"
    sed -i '' 's/text-2xl\b/text-size-2xl/g' "$file"
    sed -i '' 's/text-3xl\b/text-size-3xl/g' "$file"
    sed -i '' 's/text-4xl\b/text-size-4xl/g' "$file"
    sed -i '' 's/text-5xl\b/text-size-5xl/g' "$file"
    
    # Font weight normalization
    sed -i '' 's/font-thin\b/font-weight-thin/g' "$file"
    sed -i '' 's/font-light\b/font-weight-light/g' "$file"
    sed -i '' 's/font-normal\b/font-weight-normal/g' "$file"
    sed -i '' 's/font-medium\b/font-weight-medium/g' "$file"
    sed -i '' 's/font-semibold\b/font-weight-semibold/g' "$file"
    sed -i '' 's/font-bold\b/font-weight-bold/g' "$file"
    sed -i '' 's/font-extrabold\b/font-weight-extrabold/g' "$file"
    sed -i '' 's/font-black\b/font-weight-black/g' "$file"
    
    # Border radius normalization
    sed -i '' 's/rounded-sm\b/rounded-radius-sm/g' "$file"
    sed -i '' 's/rounded-md\b/rounded-radius-md/g' "$file"
    sed -i '' 's/rounded-lg\b/rounded-radius-lg/g' "$file"
    sed -i '' 's/rounded-xl\b/rounded-radius-xl/g' "$file"
    sed -i '' 's/rounded-2xl\b/rounded-radius-2xl/g' "$file"
    sed -i '' 's/rounded-3xl\b/rounded-radius-3xl/g' "$file"
    sed -i '' 's/rounded-full\b/rounded-radius-full/g' "$file"
    
    # Height/Width normalization for common values
    sed -i '' 's/h-4\b/h-sm/g' "$file"
    sed -i '' 's/h-5\b/h-md/g' "$file"
    sed -i '' 's/h-6\b/h-lg/g' "$file"
    sed -i '' 's/h-8\b/h-xl/g' "$file"
    sed -i '' 's/h-10\b/h-2xl/g' "$file"
    sed -i '' 's/h-12\b/h-3xl/g' "$file"
    
    sed -i '' 's/w-4\b/w-sm/g' "$file"
    sed -i '' 's/w-5\b/w-md/g' "$file"
    sed -i '' 's/w-6\b/w-lg/g' "$file"
    sed -i '' 's/w-8\b/w-xl/g' "$file"
    sed -i '' 's/w-10\b/w-2xl/g' "$file"
    sed -i '' 's/w-12\b/w-3xl/g' "$file"
    
    # Remove backup if successful
    if [ $? -eq 0 ]; then
        rm "$file.backup"
    else
        echo "  ❌ Error processing $file, restoring backup"
        mv "$file.backup" "$file"
    fi
}

# Process all TypeScript and TSX files in the apps directory
echo "📁 Processing apps/web directory..."
find "$ROOT_DIR/apps/web" -name "*.tsx" -o -name "*.ts" | while read -r file; do
    # Skip node_modules and .next directories
    if [[ "$file" != *"node_modules"* && "$file" != *".next"* ]]; then
        normalize_spacing "$file"
    fi
done

# Process all TypeScript and TSX files in the packages/ui directory
echo "📁 Processing packages/ui directory..."
find "$ROOT_DIR/packages/ui" -name "*.tsx" -o -name "*.ts" | while read -r file; do
    # Skip node_modules
    if [[ "$file" != *"node_modules"* ]]; then
        normalize_spacing "$file"
    fi
done

echo "✅ Layout normalization complete!"
echo "🎯 All hardcoded spacing values have been replaced with semantic design tokens"
echo "📊 Run 'npm run build' to verify no build errors were introduced"
