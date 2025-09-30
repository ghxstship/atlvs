#!/bin/bash

# Performance Optimization Audit
# Validates bundle size, image optimization, and performance best practices

set -e

echo "⚡ GHXSTSHIP Performance Audit - Starting..."
echo "==========================================="

ISSUES_FOUND=0

# 1. Check bundle size
echo ""
echo "1️⃣ Analyzing bundle size..."
if [ -d ".next" ]; then
  BUNDLE_SIZE=$(du -sh .next 2>/dev/null | cut -f1 || echo "unknown")
  echo "   Build size: $BUNDLE_SIZE"
  
  # Check for large chunks
  LARGE_CHUNKS=$(find .next -name "*.js" -size +500k 2>/dev/null | wc -l || echo "0")
  if [ "$LARGE_CHUNKS" -gt 0 ]; then
    echo "⚠️  Found $LARGE_CHUNKS JavaScript chunks > 500KB"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
  else
    echo "✅ No excessively large chunks"
  fi
else
  echo "ℹ️  No build found. Run 'pnpm build' first"
fi

# 2. Check for unoptimized images
echo ""
echo "2️⃣ Checking for unoptimized images..."
LARGE_IMAGES=$(find public -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" \) -size +500k 2>/dev/null | wc -l || echo "0")

if [ "$LARGE_IMAGES" -gt 0 ]; then
  echo "⚠️  Found $LARGE_IMAGES images > 500KB"
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
  echo "✅ No large unoptimized images"
fi

# Check if using Next.js Image component
NEXT_IMAGE_COUNT=$(grep -r "next/image" \
  --include="*.tsx" \
  --include="*.jsx" \
  --exclude-dir="node_modules" \
  --exclude-dir=".next" \
  apps/web 2>/dev/null | wc -l || echo "0")

RAW_IMG_COUNT=$(grep -r "<img" \
  --include="*.tsx" \
  --include="*.jsx" \
  --exclude-dir="node_modules" \
  --exclude-dir=".next" \
  apps/web 2>/dev/null | grep -v "next/image" | wc -l || echo "0")

echo "   Next.js Image usage: $NEXT_IMAGE_COUNT"
echo "   Raw <img> tags: $RAW_IMG_COUNT"

if [ "$RAW_IMG_COUNT" -gt 10 ]; then
  echo "⚠️  Consider using Next.js Image component for better optimization"
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# 3. Check for font optimization
echo ""
echo "3️⃣ Checking font optimization..."
if grep -r "next/font" \
  --include="*.tsx" \
  --include="*.jsx" \
  --exclude-dir="node_modules" \
  --exclude-dir=".next" \
  apps/web 2>/dev/null > /dev/null; then
  echo "✅ Using Next.js font optimization"
else
  echo "⚠️  No Next.js font optimization detected"
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# 4. Check for CSS optimization
echo ""
echo "4️⃣ Checking CSS optimization..."
if [ -d ".next" ]; then
  CSS_FILES=$(find .next -name "*.css" 2>/dev/null | wc -l || echo "0")
  TOTAL_CSS_SIZE=$(find .next -name "*.css" -exec du -ch {} + 2>/dev/null | tail -1 | cut -f1 || echo "0K")
  
  echo "   CSS files: $CSS_FILES"
  echo "   Total CSS size: $TOTAL_CSS_SIZE"
  
  # Basic check for CSS optimization
  if echo "$TOTAL_CSS_SIZE" | grep -E "[0-9]+M" > /dev/null; then
    echo "⚠️  CSS bundle may be too large"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
  else
    echo "✅ CSS bundle size acceptable"
  fi
fi

# 5. Check for dynamic imports
echo ""
echo "5️⃣ Checking for code splitting..."
DYNAMIC_IMPORTS=$(grep -r "dynamic(" \
  --include="*.ts" \
  --include="*.tsx" \
  --exclude-dir="node_modules" \
  --exclude-dir=".next" \
  apps/web 2>/dev/null | wc -l || echo "0")

if [ "$DYNAMIC_IMPORTS" -gt 5 ]; then
  echo "✅ Good use of dynamic imports ($DYNAMIC_IMPORTS)"
else
  echo "⚠️  Limited code splitting ($DYNAMIC_IMPORTS dynamic imports)"
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# 6. Check for performance monitoring
echo ""
echo "6️⃣ Checking for performance monitoring..."
if grep -r "web-vitals\|analytics\|performance.mark" \
  --include="*.ts" \
  --include="*.tsx" \
  --exclude-dir="node_modules" \
  --exclude-dir=".next" \
  apps/web 2>/dev/null > /dev/null; then
  echo "✅ Performance monitoring implemented"
else
  echo "⚠️  No performance monitoring detected"
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# 7. Check for lazy loading
echo ""
echo "7️⃣ Checking for lazy loading implementation..."
LAZY_COUNT=$(grep -r "loading=\"lazy\"" \
  --include="*.tsx" \
  --include="*.jsx" \
  --exclude-dir="node_modules" \
  --exclude-dir=".next" \
  apps/web 2>/dev/null | wc -l || echo "0")

if [ "$LAZY_COUNT" -gt 5 ]; then
  echo "✅ Lazy loading implemented ($LAZY_COUNT instances)"
else
  echo "⚠️  Limited lazy loading implementation"
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# 8. Check package.json for heavy dependencies
echo ""
echo "8️⃣ Analyzing dependencies..."
TOTAL_DEPS=$(cat package.json | grep -c "\"" | grep -v "//" || echo "0")
echo "   Total dependencies: $TOTAL_DEPS"

# Check for commonly heavy packages
if grep -q "moment\|lodash\":" package.json 2>/dev/null; then
  echo "⚠️  Consider lighter alternatives (moment→date-fns, lodash→lodash-es)"
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
  echo "✅ No heavy legacy dependencies detected"
fi

# Summary
echo ""
echo "==========================================="
echo "📊 Performance Audit Complete"
echo ""

if [ $ISSUES_FOUND -eq 0 ]; then
  echo "✅ All performance checks passed!"
  echo ""
  echo "💡 Performance highlights:"
  echo "  - Optimized bundle size"
  echo "  - Image optimization in place"
  echo "  - Font optimization enabled"
  echo "  - Good code splitting"
  exit 0
else
  echo "⚠️  Found $ISSUES_FOUND performance areas for improvement"
  echo ""
  echo "💡 Recommended actions:"
  echo "  1. Reduce bundle size with code splitting"
  echo "  2. Optimize images (compress, use WebP, Next.js Image)"
  echo "  3. Use Next.js font optimization"
  echo "  4. Purge unused CSS"
  echo "  5. Implement more dynamic imports"
  echo "  6. Add performance monitoring (Web Vitals)"
  echo "  7. Implement lazy loading for images/components"
  echo "  8. Replace heavy dependencies with lighter alternatives"
  echo ""
  echo "📚 Resources:"
  echo "  - Next.js Optimization: https://nextjs.org/docs/app/building-your-application/optimizing"
  echo "  - Web Vitals: https://web.dev/vitals/"
  echo "  - Bundle Analyzer: next build && next-bundle-analyzer"
  exit 1
fi
