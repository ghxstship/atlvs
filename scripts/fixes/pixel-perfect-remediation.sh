#!/bin/bash

# Pixel-Perfect UI Remediation Script
# Automated fixes for design token violations

REPO_PATH="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="$REPO_PATH/.backup-pixel-perfect-$TIMESTAMP"

echo "🎨 Starting Pixel-Perfect UI Remediation"
echo "========================================"

# Create backup
echo "📦 Creating backup..."
mkdir -p "$BACKUP_DIR"
cp -r "$REPO_PATH/packages" "$BACKUP_DIR/" 2>/dev/null
cp -r "$REPO_PATH/apps" "$BACKUP_DIR/" 2>/dev/null
echo "✅ Backup created at: $BACKUP_DIR"

# Phase 1: Fix Colors
echo ""
echo "🎨 Phase 1: Fixing Color Violations"
find "$REPO_PATH" \( -name "*.tsx" -o -name "*.ts" \) \
    -not -path "*/node_modules/*" \
    -not -path "*/.next/*" \
    -not -path "*/.backup-*/*" \
    -exec sed -i '' -E \
    -e 's/text-gray-[0-9]+/text-muted-foreground/g' \
    -e 's/bg-gray-[0-9]+/bg-muted/g' \
    -e 's/border-gray-[0-9]+/border-border/g' \
    -e 's/text-blue-[0-9]+/text-primary/g' \
    -e 's/bg-blue-[0-9]+/bg-primary/g' \
    -e 's/text-red-[0-9]+/text-destructive/g' \
    -e 's/bg-red-[0-9]+/bg-destructive/g' \
    -e 's/text-green-[0-9]+/text-success/g' \
    -e 's/bg-green-[0-9]+/bg-success/g' \
    -e 's/text-yellow-[0-9]+/text-warning/g' \
    -e 's/bg-yellow-[0-9]+/bg-warning/g' \
    {} \;
echo "✅ Color violations fixed"

# Phase 2: Fix Spacing
echo ""
echo "📏 Phase 2: Fixing Spacing Violations"
find "$REPO_PATH" \( -name "*.tsx" -o -name "*.ts" \) \
    -not -path "*/node_modules/*" \
    -not -path "*/.next/*" \
    -not -path "*/.backup-*/*" \
    -exec sed -i '' -E \
    -e 's/\bp-1\b/p-xs/g' \
    -e 's/\bp-2\b/p-sm/g' \
    -e 's/\bp-3\b/p-sm/g' \
    -e 's/\bp-4\b/p-md/g' \
    -e 's/\bp-6\b/p-lg/g' \
    -e 's/\bp-8\b/p-xl/g' \
    -e 's/\bp-10\b/p-2xl/g' \
    -e 's/\bp-12\b/p-2xl/g' \
    -e 's/\bp-16\b/p-3xl/g' \
    -e 's/\bp-20\b/p-4xl/g' \
    -e 's/\bpx-1\b/px-xs/g' \
    -e 's/\bpx-2\b/px-sm/g' \
    -e 's/\bpx-3\b/px-sm/g' \
    -e 's/\bpx-4\b/px-md/g' \
    -e 's/\bpx-6\b/px-lg/g' \
    -e 's/\bpx-8\b/px-xl/g' \
    -e 's/\bpy-1\b/py-xs/g' \
    -e 's/\bpy-2\b/py-sm/g' \
    -e 's/\bpy-3\b/py-sm/g' \
    -e 's/\bpy-4\b/py-md/g' \
    -e 's/\bpy-6\b/py-lg/g' \
    -e 's/\bpy-8\b/py-xl/g' \
    -e 's/\bm-1\b/m-xs/g' \
    -e 's/\bm-2\b/m-sm/g' \
    -e 's/\bm-3\b/m-sm/g' \
    -e 's/\bm-4\b/m-md/g' \
    -e 's/\bm-6\b/m-lg/g' \
    -e 's/\bm-8\b/m-xl/g' \
    -e 's/\bmx-1\b/mx-xs/g' \
    -e 's/\bmx-2\b/mx-sm/g' \
    -e 's/\bmx-4\b/mx-md/g' \
    -e 's/\bmx-6\b/mx-lg/g' \
    -e 's/\bmy-1\b/my-xs/g' \
    -e 's/\bmy-2\b/my-sm/g' \
    -e 's/\bmy-4\b/my-md/g' \
    -e 's/\bmy-6\b/my-lg/g' \
    -e 's/\bmy-8\b/my-xl/g' \
    -e 's/\bgap-1\b/gap-xs/g' \
    -e 's/\bgap-2\b/gap-sm/g' \
    -e 's/\bgap-3\b/gap-sm/g' \
    -e 's/\bgap-4\b/gap-md/g' \
    -e 's/\bgap-6\b/gap-lg/g' \
    -e 's/\bgap-8\b/gap-xl/g' \
    -e 's/\bspace-x-1\b/space-x-xs/g' \
    -e 's/\bspace-x-2\b/space-x-sm/g' \
    -e 's/\bspace-x-4\b/space-x-md/g' \
    -e 's/\bspace-y-1\b/space-y-xs/g' \
    -e 's/\bspace-y-2\b/space-y-sm/g' \
    -e 's/\bspace-y-4\b/space-y-md/g' \
    {} \;
echo "✅ Spacing violations fixed"

# Phase 3: Fix Typography
echo ""
echo "📝 Phase 3: Fixing Typography Violations"
find "$REPO_PATH" \( -name "*.tsx" -o -name "*.ts" \) \
    -not -path "*/node_modules/*" \
    -not -path "*/.next/*" \
    -not -path "*/.backup-*/*" \
    -exec sed -i '' -E \
    -e 's/\btext-xs\b/text-size-xs/g' \
    -e 's/\btext-sm\b/text-size-sm/g' \
    -e 's/\btext-base\b/text-size-md/g' \
    -e 's/\btext-lg\b/text-size-lg/g' \
    -e 's/\btext-xl\b/text-size-xl/g' \
    -e 's/\btext-2xl\b/text-size-2xl/g' \
    -e 's/\btext-3xl\b/text-size-3xl/g' \
    -e 's/\btext-4xl\b/text-size-4xl/g' \
    -e 's/\bfont-medium\b/font-weight-medium/g' \
    -e 's/\bfont-semibold\b/font-weight-semibold/g' \
    -e 's/\bfont-bold\b/font-weight-bold/g' \
    {} \;
echo "✅ Typography violations fixed"

# Phase 4: Fix Shadows & Borders
echo ""
echo "🌑 Phase 4: Fixing Shadows & Borders"
find "$REPO_PATH" \( -name "*.tsx" -o -name "*.ts" \) \
    -not -path "*/node_modules/*" \
    -not -path "*/.next/*" \
    -not -path "*/.backup-*/*" \
    -exec sed -i '' -E \
    -e 's/\bshadow-sm\b/shadow-elevation-sm/g' \
    -e 's/\bshadow-md\b/shadow-elevation-md/g' \
    -e 's/\bshadow-lg\b/shadow-elevation-lg/g' \
    -e 's/\bshadow-xl\b/shadow-elevation-xl/g' \
    -e 's/\brounded-sm\b/rounded-radius-sm/g' \
    -e 's/\brounded-md\b/rounded-radius-md/g' \
    -e 's/\brounded-lg\b/rounded-radius-lg/g' \
    -e 's/\brounded-xl\b/rounded-radius-xl/g' \
    -e 's/\brounded-full\b/rounded-radius-full/g' \
    {} \;
echo "✅ Shadows & borders fixed"

# Phase 5: Fix Animations
echo ""
echo "✨ Phase 5: Fixing Animation Violations"
find "$REPO_PATH" \( -name "*.tsx" -o -name "*.ts" \) \
    -not -path "*/node_modules/*" \
    -not -path "*/.next/*" \
    -not -path "*/.backup-*/*" \
    -exec sed -i '' -E \
    -e 's/\bduration-75\b/duration-instant/g' \
    -e 's/\bduration-150\b/duration-fast/g' \
    -e 's/\bduration-300\b/duration-normal/g' \
    -e 's/\bduration-500\b/duration-slow/g' \
    -e 's/\bduration-1000\b/duration-slower/g' \
    {} \;
echo "✅ Animation violations fixed"

echo ""
echo "========================================="
echo "✨ Pixel-Perfect Remediation Complete!"
echo "Backup saved at: $BACKUP_DIR"
echo ""
echo "Next steps:"
echo "1. Run 'npm run build' to verify no build errors"
echo "2. Test UI components visually"
echo "3. Run accessibility checks"
echo "4. Commit changes if everything looks good"
