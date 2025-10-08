#!/bin/bash

# GHXSTSHIP Build Verification Script
# Checks for errors, warnings, and hardcoded design elements

echo "🔍 GHXSTSHIP Build Verification Report"
echo "======================================"
echo ""

# Change to repository root
cd "$(dirname "$0")/../ghxstship" || exit 1

# 1. Check for TypeScript errors
echo "📝 TypeScript Check..."
if npm run typecheck 2>&1 | grep -E "(error|Error)" > /dev/null; then
    echo "  ❌ TypeScript errors found"
    npm run typecheck 2>&1 | grep -E "(error|Error)" | head -5
else
    echo "  ✅ No TypeScript errors"
fi
echo ""

# 2. Check for remaining hardcoded spacing
echo "🎨 Design Token Compliance Check..."
SPACING_VIOLATIONS=$(grep -r "className.*\(p\|m\|gap\|space\)-[0-9]" \
    --include="*.tsx" --include="*.ts" \
    --exclude-dir=node_modules \
    --exclude-dir=.next \
    --exclude-dir=dist \
    --exclude-dir=build 2>/dev/null | wc -l)

if [ "$SPACING_VIOLATIONS" -gt 0 ]; then
    echo "  ⚠️  Found $SPACING_VIOLATIONS files with potential hardcoded spacing"
    echo "  Files with violations:"
    grep -r "className.*\(p\|m\|gap\|space\)-[0-9]" \
        --include="*.tsx" --include="*.ts" \
        --exclude-dir=node_modules \
        --exclude-dir=.next \
        --exclude-dir=dist \
        --exclude-dir=build 2>/dev/null | cut -d: -f1 | sort | uniq | head -10
else
    echo "  ✅ No hardcoded spacing violations found"
fi
echo ""

# 3. Check for hardcoded colors
echo "🎨 Color Token Compliance Check..."
COLOR_VIOLATIONS=$(grep -r "className.*\(text\|bg\|border\)-\(gray\|blue\|red\|green\|yellow\|purple\|pink\|indigo\)-[0-9]" \
    --include="*.tsx" --include="*.ts" \
    --exclude-dir=node_modules \
    --exclude-dir=.next \
    --exclude-dir=dist \
    --exclude-dir=build 2>/dev/null | wc -l)

if [ "$COLOR_VIOLATIONS" -gt 0 ]; then
    echo "  ⚠️  Found $COLOR_VIOLATIONS files with hardcoded colors"
else
    echo "  ✅ No hardcoded color violations found"
fi
echo ""

# 4. Check build output size
echo "📦 Build Output Analysis..."
if [ -d ".next" ]; then
    BUILD_SIZE=$(du -sh .next 2>/dev/null | cut -f1)
    echo "  Build size: $BUILD_SIZE"
    
    # Check for large bundles
    LARGE_BUNDLES=$(find .next -name "*.js" -size +500k 2>/dev/null | wc -l)
    if [ "$LARGE_BUNDLES" -gt 0 ]; then
        echo "  ⚠️  Found $LARGE_BUNDLES large JavaScript bundles (>500KB)"
    else
        echo "  ✅ All bundles are optimally sized"
    fi
else
    echo "  ℹ️  No build output found. Run 'npm run build' first."
fi
echo ""

# 5. Check for console.log statements
echo "🔍 Console Statement Check..."
CONSOLE_LOGS=$(grep -r "console\.\(log\|error\|warn\)" \
    --include="*.tsx" --include="*.ts" \
    --exclude-dir=node_modules \
    --exclude-dir=.next \
    --exclude-dir=dist \
    --exclude-dir=build \
    --exclude="*test*" \
    --exclude="*spec*" 2>/dev/null | wc -l)

if [ "$CONSOLE_LOGS" -gt 0 ]; then
    echo "  ⚠️  Found $CONSOLE_LOGS console statements in production code"
else
    echo "  ✅ No console statements in production code"
fi
echo ""

# 6. Final build test
echo "🏗️  Production Build Test..."
if npm run build > /dev/null 2>&1; then
    echo "  ✅ Production build successful"
else
    echo "  ❌ Production build failed"
    echo "  Run 'npm run build' to see detailed errors"
fi
echo ""

# Summary
echo "======================================"
echo "📊 Summary"
echo "======================================"

ISSUES=0

if [ "$SPACING_VIOLATIONS" -gt 0 ]; then
    echo "  ⚠️  Spacing violations: $SPACING_VIOLATIONS files"
    ISSUES=$((ISSUES + 1))
fi

if [ "$COLOR_VIOLATIONS" -gt 0 ]; then
    echo "  ⚠️  Color violations: $COLOR_VIOLATIONS files"
    ISSUES=$((ISSUES + 1))
fi

if [ "$CONSOLE_LOGS" -gt 0 ]; then
    echo "  ⚠️  Console statements: $CONSOLE_LOGS occurrences"
    ISSUES=$((ISSUES + 1))
fi

if [ "$LARGE_BUNDLES" -gt 0 ]; then
    echo "  ⚠️  Large bundles: $LARGE_BUNDLES files"
    ISSUES=$((ISSUES + 1))
fi

if [ "$ISSUES" -eq 0 ]; then
    echo "  ✅ Build is production-ready with no issues!"
else
    echo "  ⚠️  Found $ISSUES categories of issues to address"
fi
echo ""
echo "Verification complete!"
