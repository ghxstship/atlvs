#!/bin/bash

echo "🎨 GHXSTSHIP Vaporwave Design System Validation Report"
echo "=================================================="
echo ""

# Check for hardcoded hex colors in source code (excluding node_modules and comments)
echo "🔍 Checking for hardcoded hex color values..."
HARDCODED_COLORS=$(find apps packages -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" | \
  xargs grep -n "#[0-9a-fA-F]\{3,6\}" | \
  grep -v "node_modules" | \
  grep -v "// " | \
  grep -v "/\*" | \
  wc -l)

if [ "$HARDCODED_COLORS" -eq 0 ]; then
  echo "  ✅ No hardcoded hex colors found in source code"
else
  echo "  ⚠️  Found $HARDCODED_COLORS instances of hardcoded hex colors"
  echo "  📋 Details:"
  find apps packages -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" | \
    xargs grep -n "#[0-9a-fA-F]\{3,6\}" | \
    grep -v "node_modules" | \
    grep -v "// " | \
    grep -v "/\*" | \
    head -10
  if [ "$HARDCODED_COLORS" -gt 10 ]; then
    echo "  ... and $((HARDCODED_COLORS - 10)) more"
  fi
fi

echo ""

# Check for hardcoded pixel values
echo "🔍 Checking for hardcoded pixel values..."
HARDCODED_PIXELS=$(find apps packages -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" | \
  xargs grep -n "[0-9]\+px" | \
  grep -v "node_modules" | \
  grep -v "// " | \
  grep -v "/\*" | \
  wc -l)

if [ "$HARDCODED_PIXELS" -eq 0 ]; then
  echo "  ✅ No hardcoded pixel values found in source code"
else
  echo "  ⚠️  Found $HARDCODED_PIXELS instances of hardcoded pixel values"
fi

echo ""

# Check for pop art shadow usage
echo "🎭 Checking pop art shadow adoption..."
POP_SHADOWS=$(find apps packages -name "*.tsx" -o -name "*.ts" | \
  xargs grep -l "pop-shadow" | \
  wc -l)
echo "  📊 $POP_SHADOWS files using pop art shadows"

echo ""

# Check for vaporwave color usage
echo "🌈 Checking vaporwave color system adoption..."
VW_COLORS=$(find apps packages -name "*.tsx" -o -name "*.ts" | \
  xargs grep -l "vw-\|glow-\|ghxstship-gradient\|atlvs-gradient\|opendeck-gradient" | \
  wc -l)
echo "  📊 $VW_COLORS files using vaporwave color system"

echo ""

# Check CSS variables usage
echo "🎨 Checking CSS variables usage..."
CSS_VARS=$(find packages/ui/src -name "*.css" | \
  xargs grep -c "var(--" | \
  awk -F: '{sum += $2} END {print sum}')
echo "  📊 $CSS_VARS CSS variable references in design system"

echo ""

# Check for brand theming
echo "🏷️  Checking brand-specific theming..."
BRAND_ATTRS=$(find apps -name "*.tsx" | \
  xargs grep -c "data-brand=" | \
  awk -F: '{sum += $2} END {print sum}')
echo "  📊 $BRAND_ATTRS brand attribute usages"

echo ""

# Summary
echo "📋 DESIGN SYSTEM VALIDATION SUMMARY"
echo "=================================="

if [ "$HARDCODED_COLORS" -eq 0 ] && [ "$HARDCODED_PIXELS" -eq 0 ]; then
  echo "  ✅ ZERO HARDCODED DESIGN VALUES - EXCELLENT!"
else
  echo "  ⚠️  HARDCODED VALUES DETECTED - NEEDS ATTENTION"
fi

if [ "$POP_SHADOWS" -gt 0 ]; then
  echo "  ✅ Pop art shadow system is being used"
else
  echo "  ⚠️  Pop art shadow system not yet adopted"
fi

if [ "$VW_COLORS" -gt 0 ]; then
  echo "  ✅ Vaporwave color system is being used"
else
  echo "  ⚠️  Vaporwave color system not yet adopted"
fi

if [ "$CSS_VARS" -gt 50 ]; then
  echo "  ✅ Comprehensive CSS variable system in place"
else
  echo "  ⚠️  CSS variable system needs expansion"
fi

echo ""
echo "🎯 NEXT STEPS:"
if [ "$HARDCODED_COLORS" -gt 0 ]; then
  echo "  1. Replace hardcoded hex colors with CSS variables"
fi
if [ "$HARDCODED_PIXELS" -gt 0 ]; then
  echo "  2. Replace hardcoded pixel values with design tokens"
fi
if [ "$POP_SHADOWS" -eq 0 ]; then
  echo "  3. Implement pop art shadow system in components"
fi
if [ "$VW_COLORS" -eq 0 ]; then
  echo "  4. Adopt vaporwave color system in components"
fi

echo ""
echo "🌟 Vaporwave Miami Vice Design System Status: $([ "$HARDCODED_COLORS" -eq 0 ] && [ "$HARDCODED_PIXELS" -eq 0 ] && echo "PRODUCTION READY" || echo "IN PROGRESS")"
