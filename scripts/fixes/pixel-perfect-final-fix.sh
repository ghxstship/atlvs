#!/bin/bash

# Final Pixel-Perfect Remediation Script
# Comprehensive fixes for all remaining violations

REPO_PATH="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

echo "🎨 Final Pixel-Perfect Remediation"
echo "==================================="

# Fix remaining spacing violations (handle edge cases)
echo "📏 Fixing remaining spacing violations..."
find "$REPO_PATH" \( -name "*.tsx" -o -name "*.ts" \) \
    -not -path "*/node_modules/*" \
    -not -path "*/.next/*" \
    -not -path "*/.backup-*/*" \
    -exec sed -i '' -E \
    -e 's/\bp-0\.5\b/p-xs/g' \
    -e 's/\bp-1\.5\b/p-xs/g' \
    -e 's/\bp-2\.5\b/p-sm/g' \
    -e 's/\bp-3\.5\b/p-sm/g' \
    -e 's/\bp-5\b/p-lg/g' \
    -e 's/\bp-7\b/p-lg/g' \
    -e 's/\bp-9\b/p-xl/g' \
    -e 's/\bp-11\b/p-2xl/g' \
    -e 's/\bp-14\b/p-3xl/g' \
    -e 's/\bp-32\b/p-5xl/g' \
    -e 's/\bp-36\b/p-5xl/g' \
    -e 's/\bp-40\b/p-5xl/g' \
    -e 's/\bp-44\b/p-5xl/g' \
    -e 's/\bp-48\b/p-5xl/g' \
    -e 's/\bp-52\b/p-5xl/g' \
    -e 's/\bp-56\b/p-5xl/g' \
    -e 's/\bp-60\b/p-5xl/g' \
    -e 's/\bp-64\b/p-5xl/g' \
    -e 's/\bp-72\b/p-5xl/g' \
    -e 's/\bp-80\b/p-5xl/g' \
    -e 's/\bp-96\b/p-5xl/g' \
    -e 's/\bm-0\.5\b/m-xs/g' \
    -e 's/\bm-1\.5\b/m-xs/g' \
    -e 's/\bm-2\.5\b/m-sm/g' \
    -e 's/\bm-3\.5\b/m-sm/g' \
    -e 's/\bm-5\b/m-lg/g' \
    -e 's/\bm-7\b/m-lg/g' \
    -e 's/\bm-9\b/m-xl/g' \
    -e 's/\bm-11\b/m-2xl/g' \
    -e 's/\bm-14\b/m-3xl/g' \
    -e 's/\bgap-0\.5\b/gap-xs/g' \
    -e 's/\bgap-1\.5\b/gap-xs/g' \
    -e 's/\bgap-2\.5\b/gap-sm/g' \
    -e 's/\bgap-3\.5\b/gap-sm/g' \
    -e 's/\bgap-5\b/gap-lg/g' \
    -e 's/\bgap-7\b/gap-lg/g' \
    -e 's/\bgap-9\b/gap-xl/g' \
    -e 's/\bgap-11\b/gap-2xl/g' \
    -e 's/\bgap-14\b/gap-3xl/g' \
    {} \;

# Fix typography that wasn't caught before
echo "📝 Fixing typography edge cases..."
find "$REPO_PATH" \( -name "*.tsx" -o -name "*.ts" \) \
    -not -path "*/node_modules/*" \
    -not -path "*/.next/*" \
    -not -path "*/.backup-*/*" \
    -exec sed -i '' -E \
    -e 's/\btext-6xl\b/text-size-6xl/g' \
    -e 's/\btext-7xl\b/text-size-7xl/g' \
    -e 's/\btext-8xl\b/text-size-7xl/g' \
    -e 's/\btext-9xl\b/text-size-7xl/g' \
    -e 's/\bfont-extralight\b/font-weight-light/g' \
    -e 's/\bfont-black\b/font-weight-black/g' \
    -e 's/\bleading-none\b/leading-none/g' \
    -e 's/\bleading-tight\b/leading-tight/g' \
    -e 's/\bleading-snug\b/leading-snug/g' \
    -e 's/\bleading-normal\b/leading-normal/g' \
    -e 's/\bleading-relaxed\b/leading-relaxed/g' \
    -e 's/\bleading-loose\b/leading-loose/g' \
    {} \;

# Fix shadows more comprehensively
echo "🌑 Fixing all shadow variations..."
find "$REPO_PATH" \( -name "*.tsx" -o -name "*.ts" \) \
    -not -path "*/node_modules/*" \
    -not -path "*/.next/*" \
    -not -path "*/.backup-*/*" \
    -exec sed -i '' -E \
    -e 's/\bshadow\b([^-])/shadow-elevation-md\1/g' \
    -e 's/\bshadow-none\b/shadow-elevation-none/g' \
    -e 's/\bshadow-inner\b/shadow-elevation-inner/g' \
    -e 's/\bdrop-shadow-sm\b/shadow-elevation-sm/g' \
    -e 's/\bdrop-shadow-md\b/shadow-elevation-md/g' \
    -e 's/\bdrop-shadow-lg\b/shadow-elevation-lg/g' \
    -e 's/\bdrop-shadow-xl\b/shadow-elevation-xl/g' \
    -e 's/\bdrop-shadow-2xl\b/shadow-elevation-2xl/g' \
    -e 's/\bdrop-shadow-none\b/shadow-elevation-none/g' \
    -e 's/\bdrop-shadow\b/shadow-elevation-md/g' \
    {} \;

# Fix border radius more comprehensively
echo "🔲 Fixing all border radius variations..."
find "$REPO_PATH" \( -name "*.tsx" -o -name "*.ts" \) \
    -not -path "*/node_modules/*" \
    -not -path "*/.next/*" \
    -not -path "*/.backup-*/*" \
    -exec sed -i '' -E \
    -e 's/\brounded\b([^-])/rounded-radius-md\1/g' \
    -e 's/\brounded-none\b/rounded-radius-none/g' \
    -e 's/\brounded-t-sm\b/rounded-t-radius-sm/g' \
    -e 's/\brounded-t-md\b/rounded-t-radius-md/g' \
    -e 's/\brounded-t-lg\b/rounded-t-radius-lg/g' \
    -e 's/\brounded-b-sm\b/rounded-b-radius-sm/g' \
    -e 's/\brounded-b-md\b/rounded-b-radius-md/g' \
    -e 's/\brounded-b-lg\b/rounded-b-radius-lg/g' \
    -e 's/\brounded-l-sm\b/rounded-l-radius-sm/g' \
    -e 's/\brounded-l-md\b/rounded-l-radius-md/g' \
    -e 's/\brounded-l-lg\b/rounded-l-radius-lg/g' \
    -e 's/\brounded-r-sm\b/rounded-r-radius-sm/g' \
    -e 's/\brounded-r-md\b/rounded-r-radius-md/g' \
    -e 's/\brounded-r-lg\b/rounded-r-radius-lg/g' \
    {} \;

# Fix animation durations more comprehensively
echo "✨ Fixing all animation durations..."
find "$REPO_PATH" \( -name "*.tsx" -o -name "*.ts" \) \
    -not -path "*/node_modules/*" \
    -not -path "*/.next/*" \
    -not -path "*/.backup-*/*" \
    -exec sed -i '' -E \
    -e 's/\bduration-0\b/duration-instant/g' \
    -e 's/\bduration-100\b/duration-fast/g' \
    -e 's/\bduration-200\b/duration-fast/g' \
    -e 's/\bduration-300\b/duration-normal/g' \
    -e 's/\bduration-400\b/duration-normal/g' \
    -e 's/\bduration-500\b/duration-slow/g' \
    -e 's/\bduration-600\b/duration-slow/g' \
    -e 's/\bduration-700\b/duration-slow/g' \
    -e 's/\bduration-800\b/duration-slow/g' \
    -e 's/\bduration-900\b/duration-slower/g' \
    -e 's/\bduration-1000\b/duration-slower/g' \
    -e 's/\bduration-1500\b/duration-slower/g' \
    -e 's/\bduration-2000\b/duration-slower/g' \
    -e 's/\bduration-3000\b/duration-slower/g' \
    {} \;

# Fix transitions more comprehensively
echo "🔄 Fixing all transition variations..."
find "$REPO_PATH" \( -name "*.tsx" -o -name "*.ts" \) \
    -not -path "*/node_modules/*" \
    -not -path "*/.next/*" \
    -not -path "*/.backup-*/*" \
    -exec sed -i '' -E \
    -e 's/\btransition\b([^-])/transition-default\1/g' \
    -e 's/\btransition-none\b/transition-none/g' \
    {} \;

echo ""
echo "✨ Final remediation complete!"
echo ""
echo "Run './pixel-perfect-validate.sh' to verify all violations are fixed."
