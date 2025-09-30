#!/bin/bash
# ACCURATE COMPONENT NAMING VALIDATION
set -euo pipefail

echo "🔍 ACCURATE COMPONENT NAMING VALIDATION"
echo "======================================="

INVALID_COMPONENTS=0

if [[ -d "packages/ui/src/components" ]]; then
    echo "Checking component files in packages/ui/src/components..."
    
    while IFS= read -r -d '' file; do
        # Get just the filename without path and extension
        filename=$(basename "$file" .tsx)
        
        # Skip index files
        if [[ "$filename" == "index" ]]; then
            continue
        fi
        
        # Check if filename follows PascalCase (starts with uppercase, contains only letters/numbers)
        if [[ ! "$filename" =~ ^[A-Z][a-zA-Z0-9]*$ ]]; then
            echo "❌ Invalid component name: $file (filename: $filename)"
            ((INVALID_COMPONENTS++))
        else
            echo "✅ Valid component name: $filename"
        fi
        
    done < <(find packages/ui/src/components -name "*.tsx" -print0 2>/dev/null)
fi

echo ""
echo "📊 COMPONENT NAMING RESULTS:"
echo "   - Invalid components: $INVALID_COMPONENTS"

if [[ $INVALID_COMPONENTS -eq 0 ]]; then
    echo "✅ All components follow PascalCase naming convention"
    exit 0
else
    echo "❌ Found $INVALID_COMPONENTS components with invalid naming"
    exit 1
fi
