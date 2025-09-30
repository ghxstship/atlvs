#!/bin/bash

echo "🔧 Fixing React imports and directives in marketing pages..."

cd "/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship"

# Remove duplicate React imports
find ./apps/web/app/\(marketing\) -name "*.tsx" -exec sed -i '' '/^import React from '\''react'\'';$/d' {} \;

# Fix 'use client' directive placement - move to top
find ./apps/web/app/\(marketing\) -name "*.tsx" -exec sed -i '' '/^'\''use client'\'';$/d' {} \;
find ./apps/web/app/\(marketing\) -name "*.tsx" -exec sed -i '' '1i\
'\''use client'\'';
' {} \;

# Add single React import after 'use client'
find ./apps/web/app/\(marketing\) -name "*.tsx" -exec sed -i '' '2i\
import React from '\''react'\'';
' {} \;

echo "✅ React imports and directives fixed!"
