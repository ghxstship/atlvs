#!/bin/bash

# Comprehensive fix for all remaining lint errors
set -e

APPS_WEB="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ATLVS/apps/web"
cd "$APPS_WEB"

echo "🚀 Starting comprehensive lint error fixes..."

# Fix all apostrophes more comprehensively
echo "📝 Fixing all apostrophes in auth files..."
find app/auth -name "*.tsx" -type f -exec perl -i -pe "
  s/don't/don\&apos;t/g;
  s/doesn't/doesn\&apos;t/g;
  s/didn't/didn\&apos;t/g;
  s/Didn't/Didn\&apos;t/g;
  s/We've/We\&apos;ve/g;
  s/you've/you\&apos;ve/g;
  s/I've/I\&apos;ve/g;
  s/it's/it\&apos;s/g;
  s/let's/let\&apos;s/g;
  s/that's/that\&apos;s/g;
  s/what's/what\&apos;s/g;
  s/here's/here\&apos;s/g;
  s/there's/there\&apos;s/g;
  s/we'll/we\&apos;ll/g;
  s/you'll/you\&apos;ll/g;
  s/they'll/they\&apos;ll/g;
  s/won't/won\&apos;t/g;
  s/can't/can\&apos;t/g;
  s/couldn't/couldn\&apos;t/g;
  s/wouldn't/wouldn\&apos;t/g;
  s/shouldn't/shouldn\&apos;t/g;
  s/haven't/haven\&apos;t/g;
  s/hasn't/hasn\&apos;t/g;
  s/hadn't/hadn\&apos;t/g;
  s/isn't/isn\&apos;t/g;
  s/aren't/aren\&apos;t/g;
  s/wasn't/wasn\&apos;t/g;
  s/weren't/weren\&apos;t/g;
" {} \;

echo "✅ Apostrophes fixed!"

# Fix UnifiedInput -> Input in all auth files
echo "🔄 Replacing UnifiedInput with Input..."
find app/auth -name "*.tsx" -type f -exec perl -i -pe "
  s/UnifiedInput/Input/g;
  s/, CardBody//g;
  s/CardBody, //g;
  s/CardBody//g;
" {} \;

echo "✅ UnifiedInput replaced!"

# Fix demo page - replace <a> with <Link>
echo "🔗 Fixing <a> tags in demo page..."
if [ -f "app/demo/page.tsx" ]; then
  perl -i -pe '
    s/<a href="\/dashboard\/"/<Link href="\/dashboard\/"/g;
    s/<a href="\/projects\/"/<Link href="\/projects\/"/g;
    s/<\/a>/<\/Link>/g if /<Link href=/;
  ' app/demo/page.tsx
  
  # Add Link import if not present
  if ! grep -q "import Link from 'next/link'" app/demo/page.tsx; then
    perl -i -pe 'print "import Link from '\''next/link'\'';\n" if $. == 1' app/demo/page.tsx
  fi
fi

echo "✅ Demo page fixed!"

# Fix tailwind.config.ts - remove the @ts-comment line
echo "⚙️ Fixing tailwind.config.ts..."
if [ -f "tailwind.config.ts" ]; then
  perl -i -pe '
    s/\/\/ @ts-ban-comment.*\n//g;
    s/@ts-ban-comment.*\n//g;
  ' tailwind.config.ts
fi

echo "✅ tailwind.config.ts fixed!"

echo "🎯 All comprehensive fixes applied!"
echo ""
echo "Running lint check to verify..."
