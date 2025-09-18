#!/bin/bash

# Fix all Drawer component size props to width props
echo "Fixing Drawer component size props to width props..."

# Find all TypeScript React files and replace size= with width= in Drawer components
find . -name "*.tsx" -type f -exec sed -i '' 's/\(<Drawer[^>]*\)size=/\1width=/g' {} \;

echo "Fixed all Drawer size props to width props"
