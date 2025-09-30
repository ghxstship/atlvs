#!/bin/bash

# Architecture Audit Script
# Validates architecture patterns, circular dependencies, and API consistency

set -e

echo "🏗️  GHXSTSHIP Architecture Audit - Starting..."
echo "=============================================="

ISSUES_FOUND=0

# 1. Check for circular dependencies using madge (if installed)
echo ""
echo "1️⃣ Checking for circular dependencies..."
if command -v madge &> /dev/null; then
  if madge --circular --extensions ts,tsx,js,jsx apps/web 2>/dev/null; then
    echo "⚠️  Circular dependencies detected!"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
  else
    echo "✅ No circular dependencies found"
  fi
else
  echo "ℹ️  madge not installed. Install: npm install -g madge"
fi

# 2. Check for consistent API patterns
echo ""
echo "2️⃣ Checking API route consistency..."
API_ROUTES=$(find apps/web/app/api -type f -name "route.ts" 2>/dev/null | wc -l || echo "0")
echo "   Found $API_ROUTES API routes"

# Check for consistent error handling
ERROR_HANDLING=$(grep -r "NextResponse.json" apps/web/app/api 2>/dev/null | grep -c "error" || echo "0")
if [ "$ERROR_HANDLING" -gt $((API_ROUTES / 2)) ]; then
  echo "✅ API routes have error handling"
else
  echo "⚠️  Some API routes may lack error handling"
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# 3. Check for consistent component structure
echo ""
echo "3️⃣ Checking component organization..."
CLIENT_COMPONENTS=$(find apps/web -name "*Client.tsx" 2>/dev/null | wc -l || echo "0")
SERVER_COMPONENTS=$(find apps/web -name "page.tsx" 2>/dev/null | wc -l || echo "0")
echo "   Client components: $CLIENT_COMPONENTS"
echo "   Server components (pages): $SERVER_COMPONENTS"

if [ "$CLIENT_COMPONENTS" -gt 50 ] && [ "$SERVER_COMPONENTS" -gt 20 ]; then
  echo "✅ Good component organization"
else
  echo "ℹ️  Component architecture: Client=$CLIENT_COMPONENTS, Server=$SERVER_COMPONENTS"
fi

# 4. Check for consistent service layer
echo ""
echo "4️⃣ Checking service layer consistency..."
SERVICE_FILES=$(find packages -name "*-service.ts" -o -name "*Service.ts" 2>/dev/null | wc -l || echo "0")
echo "   Found $SERVICE_FILES service files"

if [ "$SERVICE_FILES" -gt 10 ]; then
  echo "✅ Service layer well established"
else
  echo "⚠️  Limited service layer implementation"
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# 5. Check for proper type definitions
echo ""
echo "5️⃣ Checking TypeScript type definitions..."
TYPE_FILES=$(find apps/web packages -name "types.ts" 2>/dev/null | wc -l || echo "0")
echo "   Found $TYPE_FILES type definition files"

if [ "$TYPE_FILES" -gt 15 ]; then
  echo "✅ Comprehensive type definitions"
else
  echo "⚠️  May need more type definitions"
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# 6. Check for consistent error handling patterns
echo ""
echo "6️⃣ Analyzing error handling patterns..."
TRY_CATCH=$(grep -r "try {" \
  --include="*.ts" \
  --include="*.tsx" \
  --exclude-dir="node_modules" \
  --exclude-dir=".next" \
  apps/web packages 2>/dev/null | wc -l || echo "0")

PROPER_ERROR=$(grep -r "catch (error" \
  --include="*.ts" \
  --include="*.tsx" \
  --exclude-dir="node_modules" \
  --exclude-dir=".next" \
  apps/web packages 2>/dev/null | wc -l || echo "0")

if [ "$TRY_CATCH" -gt 0 ] && [ "$PROPER_ERROR" -eq "$TRY_CATCH" ]; then
  echo "✅ Consistent error handling ($TRY_CATCH blocks)"
else
  echo "⚠️  Error handling may be inconsistent"
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# 7. Check for barrel exports (index.ts files)
echo ""
echo "7️⃣ Checking for barrel exports..."
INDEX_FILES=$(find packages -name "index.ts" -o -name "index.tsx" 2>/dev/null | wc -l || echo "0")
echo "   Found $INDEX_FILES barrel export files"

if [ "$INDEX_FILES" -gt 5 ]; then
  echo "✅ Good use of barrel exports"
else
  echo "ℹ️  Limited barrel exports ($INDEX_FILES files)"
fi

# 8. Check for monorepo structure
echo ""
echo "8️⃣ Validating monorepo structure..."
PACKAGES=$(find packages -maxdepth 1 -mindepth 1 -type d 2>/dev/null | wc -l || echo "0")
APPS=$(find apps -maxdepth 1 -mindepth 1 -type d 2>/dev/null | wc -l || echo "0")

echo "   Packages: $PACKAGES"
echo "   Apps: $APPS"

if [ "$PACKAGES" -gt 3 ] && [ "$APPS" -gt 0 ]; then
  echo "✅ Proper monorepo structure"
else
  echo "ℹ️  Monorepo structure: $PACKAGES packages, $APPS apps"
fi

# Summary
echo ""
echo "=============================================="
echo "📊 Architecture Audit Complete"
echo ""

if [ $ISSUES_FOUND -eq 0 ]; then
  echo "✅ All architecture checks passed!"
  echo ""
  echo "💡 Architecture highlights:"
  echo "  - $API_ROUTES API routes"
  echo "  - $CLIENT_COMPONENTS client components"
  echo "  - $SERVICE_FILES service layer files"
  echo "  - $TYPE_FILES type definition files"
  exit 0
else
  echo "⚠️  Found $ISSUES_FOUND architecture areas for improvement"
  echo ""
  echo "💡 Recommended actions:"
  echo "  1. Resolve circular dependencies"
  echo "  2. Standardize API error handling"
  echo "  3. Expand service layer coverage"
  echo "  4. Add comprehensive type definitions"
  echo "  5. Ensure consistent error handling patterns"
  echo ""
  echo "📚 Resources:"
  echo "  - Install madge: npm install -g madge"
  echo "  - Check circular deps: madge --circular apps/web"
  exit 1
fi
