#!/bin/bash

# Script to fix malformed TypeScript/JavaScript files with broken lines
# This fixes the issue where long lines were broken with backslashes and semicolons

find . -name "*.ts" -o -name "*.tsx" | while read -r file; do
    if grep -q ";$" "$file" && grep -q "\\\\$" "$file"; then
        echo "Fixing $file"
        
        # Use sed to remove backslashes at end of lines and join broken lines
        # This is a complex sed operation to handle the line joining
        sed -i.bak '
            :a
            /\\$/ {
                N
                s/\\\n\s*//
                ta
            }
        ' "$file"
        
        # Clean up any remaining semicolons at line ends that are not proper statement ends
        # This is tricky to do safely, so let me be more conservative
    fi
done

echo "Formatting fix completed"
