#!/bin/bash

# ATLVS/GHXSTSHIP Layout Normalization Audit
# Zero Tolerance - Comprehensive UI Component Analysis

set -e

REPO_ROOT="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ATLVS"
cd "$REPO_ROOT"

echo "🔍 ATLVS LAYOUT NORMALIZATION AUDIT"
echo "===================================="
echo "Zero Tolerance: 100% Normalized UI Components"
echo ""
echo "Analyzing entire codebase for hardcoded layouts and properties..."
echo ""

# Function to count files matching a pattern
count_files() {
    local pattern=$1
    find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -exec grep -l "$pattern" {} \; 2>/dev/null | wc -l | tr -d ' '
}

# Function to count total occurrences
count_occurrences() {
    local pattern=$1
    find apps/web packages/ui -type f \( -name "*.tsx" -o -name "*.ts" \) -exec grep -o "$pattern" {} \; 2>/dev/null | wc -l | tr -d ' '
}

echo "📊 PHASE 1: HARDCODED WIDTH VALUES"
echo "===================================="
echo ""
echo "Critical Width Violations:"
echo -n "  w-64 (256px): "; count_files '\bw-64\b'
echo -n "  w-72 (288px): "; count_files '\bw-72\b'
echo -n "  w-80 (320px): "; count_files '\bw-80\b'
echo -n "  w-96 (384px): "; count_files '\bw-96\b'
echo -n "  w-48 (192px): "; count_files '\bw-48\b'
echo -n "  w-56 (224px): "; count_files '\bw-56\b'
echo -n "  w-32 (128px): "; count_files '\bw-32\b'
echo -n "  w-24 (96px): "; count_files '\bw-24\b'
echo -n "  w-20 (80px): "; count_files '\bw-20\b'
echo -n "  w-16 (64px): "; count_files '\bw-16\b'
echo -n "  w-12 (48px): "; count_files '\bw-12\b'
echo -n "  w-10 (40px): "; count_files '\bw-10\b'
echo -n "  w-8 (32px): "; count_files '\bw-8\b'
echo -n "  w-6 (24px): "; count_files '\bw-6\b'
echo -n "  w-4 (16px): "; count_files '\bw-4\b'
echo ""
echo "Percentage Width Violations:"
echo -n "  w-1/2 (50%): "; count_files 'w-1/2'
echo -n "  w-1/3 (33%): "; count_files 'w-1/3'
echo -n "  w-2/3 (66%): "; count_files 'w-2/3'
echo -n "  w-1/4 (25%): "; count_files 'w-1/4'
echo -n "  w-3/4 (75%): "; count_files 'w-3/4'
echo ""

echo "📊 PHASE 2: HARDCODED HEIGHT VALUES"
echo "===================================="
echo ""
echo "Critical Height Violations:"
echo -n "  h-64 (256px): "; count_files '\bh-64\b'
echo -n "  h-72 (288px): "; count_files '\bh-72\b'
echo -n "  h-80 (320px): "; count_files '\bh-80\b'
echo -n "  h-96 (384px): "; count_files '\bh-96\b'
echo -n "  h-48 (192px): "; count_files '\bh-48\b'
echo -n "  h-56 (224px): "; count_files '\bh-56\b'
echo -n "  h-32 (128px): "; count_files '\bh-32\b'
echo -n "  h-24 (96px): "; count_files '\bh-24\b'
echo -n "  h-20 (80px): "; count_files '\bh-20\b'
echo -n "  h-16 (64px): "; count_files '\bh-16\b'
echo -n "  h-12 (48px): "; count_files '\bh-12\b'
echo -n "  h-10 (40px): "; count_files '\bh-10\b'
echo -n "  h-8 (32px): "; count_files '\bh-8\b'
echo -n "  h-6 (24px): "; count_files '\bh-6\b'
echo -n "  h-4 (16px): "; count_files '\bh-4\b'
echo ""

echo "📊 PHASE 3: MIN/MAX CONSTRAINTS"
echo "===================================="
echo ""
echo "Min-Width Violations:"
echo -n "  min-w-[...px]: "; count_files 'min-w-\['
echo -n "  min-w-0 to min-w-96: "; count_files 'min-w-[0-9]'
echo ""
echo "Max-Width Violations:"
echo -n "  max-w-[...px]: "; count_files 'max-w-\['
echo -n "  max-w-xs to max-w-7xl: "; count_files 'max-w-[a-z]'
echo ""
echo "Min-Height Violations:"
echo -n "  min-h-[...px]: "; count_files 'min-h-\['
echo -n "  min-h-0 to min-h-96: "; count_files 'min-h-[0-9]'
echo ""
echo "Max-Height Violations:"
echo -n "  max-h-[...px]: "; count_files 'max-h-\['
echo -n "  max-h-0 to max-h-96: "; count_files 'max-h-[0-9]'
echo ""

echo "📊 PHASE 4: FLEX LAYOUT PATTERNS"
echo "===================================="
echo ""
echo "Flex Direction:"
echo -n "  flex-row: "; count_files 'flex-row'
echo -n "  flex-col: "; count_files 'flex-col'
echo ""
echo "Flex Wrapping:"
echo -n "  flex-wrap: "; count_files 'flex-wrap'
echo -n "  flex-nowrap: "; count_files 'flex-nowrap'
echo ""
echo "Flex Sizing:"
echo -n "  flex-1: "; count_files 'flex-1'
echo -n "  flex-auto: "; count_files 'flex-auto'
echo -n "  flex-initial: "; count_files 'flex-initial'
echo -n "  flex-none: "; count_files 'flex-none'
echo ""

echo "📊 PHASE 5: GRID LAYOUT PATTERNS"
echo "===================================="
echo ""
echo "Grid Columns:"
echo -n "  grid-cols-1: "; count_files 'grid-cols-1'
echo -n "  grid-cols-2: "; count_files 'grid-cols-2'
echo -n "  grid-cols-3: "; count_files 'grid-cols-3'
echo -n "  grid-cols-4: "; count_files 'grid-cols-4'
echo -n "  grid-cols-5: "; count_files 'grid-cols-5'
echo -n "  grid-cols-6: "; count_files 'grid-cols-6'
echo -n "  grid-cols-12: "; count_files 'grid-cols-12'
echo ""
echo "Grid Rows:"
echo -n "  grid-rows-1: "; count_files 'grid-rows-1'
echo -n "  grid-rows-2: "; count_files 'grid-rows-2'
echo -n "  grid-rows-3: "; count_files 'grid-rows-3'
echo -n "  grid-rows-4: "; count_files 'grid-rows-4'
echo ""

echo "📊 PHASE 6: INLINE STYLES & ARBITRARY VALUES"
echo "=============================================="
echo ""
echo "Inline Styles (Critical Violation):"
echo -n "  style={{ }}: "; count_files 'style={{' 
echo -n "  style={\\`}: "; count_files 'style={`'
echo ""
echo "Arbitrary Tailwind Values:"
echo -n "  [arbitrary]: "; count_occurrences '\[[0-9].*px\]'
echo -n "  [arbitrary %]: "; count_occurrences '\[[0-9].*%\]'
echo -n "  [arbitrary rem]: "; count_occurrences '\[[0-9].*rem\]'
echo ""

echo "📊 PHASE 7: POSITION & Z-INDEX"
echo "===================================="
echo ""
echo "Position Values:"
echo -n "  absolute: "; count_files 'absolute'
echo -n "  relative: "; count_files 'relative'
echo -n "  fixed: "; count_files 'fixed'
echo -n "  sticky: "; count_files 'sticky'
echo ""
echo "Z-Index Values:"
echo -n "  z-0 to z-50: "; count_files 'z-[0-9]'
echo -n "  z-auto: "; count_files 'z-auto'
echo ""

echo "📊 PHASE 8: ROUNDED CORNERS"
echo "===================================="
echo ""
echo "Border Radius:"
echo -n "  rounded: "; count_files '\brounded\b'
echo -n "  rounded-sm: "; count_files 'rounded-sm'
echo -n "  rounded-md: "; count_files 'rounded-md'
echo -n "  rounded-lg: "; count_files 'rounded-lg'
echo -n "  rounded-xl: "; count_files 'rounded-xl'
echo -n "  rounded-2xl: "; count_files 'rounded-2xl'
echo -n "  rounded-3xl: "; count_files 'rounded-3xl'
echo -n "  rounded-full: "; count_files 'rounded-full'
echo ""

echo "📊 PHASE 9: SHADOW & EFFECTS"
echo "===================================="
echo ""
echo "Box Shadow:"
echo -n "  shadow-sm: "; count_files 'shadow-sm'
echo -n "  shadow: "; count_files '\bshadow\b'
echo -n "  shadow-md: "; count_files 'shadow-md'
echo -n "  shadow-lg: "; count_files 'shadow-lg'
echo -n "  shadow-xl: "; count_files 'shadow-xl'
echo -n "  shadow-2xl: "; count_files 'shadow-2xl'
echo ""
echo "Opacity:"
echo -n "  opacity-0 to opacity-100: "; count_files 'opacity-[0-9]'
echo ""

echo "📊 PHASE 10: COMPONENT ANALYSIS"
echo "===================================="
echo ""
echo "Component Pattern Analysis:"
echo -n "  Total .tsx files: "; find apps/web packages/ui -type f -name "*.tsx" 2>/dev/null | wc -l | tr -d ' '
echo -n "  Client components: "; find apps/web -type f -name "*Client.tsx" 2>/dev/null | wc -l | tr -d ' '
echo -n "  View components: "; find apps/web -type f -name "*View.tsx" 2>/dev/null | wc -l | tr -d ' '
echo -n "  Drawer components: "; find apps/web -type f -name "*Drawer.tsx" 2>/dev/null | wc -l | tr -d ' '
echo -n "  UI package components: "; find packages/ui/src/components -type f -name "*.tsx" 2>/dev/null | wc -l | tr -d ' '
echo ""

echo "📊 PHASE 11: ATOMIC DESIGN COMPLIANCE"
echo "======================================"
echo ""
echo "Checking UI Package Structure:"
if [ -d "packages/ui/src/components/atoms" ]; then
    echo -n "  Atoms: "; find packages/ui/src/components/atoms -type f -name "*.tsx" 2>/dev/null | wc -l | tr -d ' '
else
    echo "  Atoms: Directory not found ❌"
fi

if [ -d "packages/ui/src/components/molecules" ]; then
    echo -n "  Molecules: "; find packages/ui/src/components/molecules -type f -name "*.tsx" 2>/dev/null | wc -l | tr -d ' '
else
    echo "  Molecules: Directory not found ❌"
fi

if [ -d "packages/ui/src/components/organisms" ]; then
    echo -n "  Organisms: "; find packages/ui/src/components/organisms -type f -name "*.tsx" 2>/dev/null | wc -l | tr -d ' '
else
    echo "  Organisms: Directory not found ❌"
fi

if [ -d "packages/ui/src/components/templates" ]; then
    echo -n "  Templates: "; find packages/ui/src/components/templates -type f -name "*.tsx" 2>/dev/null | wc -l | tr -d ' '
else
    echo "  Templates: Directory not found ❌"
fi

echo ""
echo "===================================="
echo "✅ Audit Complete"
echo "===================================="
echo ""
echo "📝 Generating detailed report..."
echo ""
