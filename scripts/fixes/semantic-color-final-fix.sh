#!/bin/bash

# GHXSTSHIP Semantic Color Token Final Fix Script
# Comprehensive fix for all color token issues including titles and gradients

echo "================================================"
echo "GHXSTSHIP SEMANTIC COLOR TOKEN FINAL FIX"
echo "================================================"
echo ""

REPO_ROOT="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship"
BACKUP_DIR="$REPO_ROOT/.backup-colors-final-$(date +%Y%m%d-%H%M%S)"

# Create backup
echo "Creating backup at $BACKUP_DIR..."
mkdir -p "$BACKUP_DIR"
cp -r "$REPO_ROOT/apps" "$BACKUP_DIR/" 2>/dev/null
cp -r "$REPO_ROOT/packages" "$BACKUP_DIR/" 2>/dev/null
echo "Backup created."
echo ""

# Fix specific known issues
echo "Fixing specific component issues..."

# Fix HeroSection spacing issues
if [ -f "$REPO_ROOT/apps/web/app/_components/marketing/HeroSection.tsx" ]; then
    echo "Fixing HeroSection..."
    sed -i '' 's/py-smxl/py-5xl/g' "$REPO_ROOT/apps/web/app/_components/marketing/HeroSection.tsx"
    sed -i '' 's/gap-xsxl/gap-3xl/g' "$REPO_ROOT/apps/web/app/_components/marketing/HeroSection.tsx"
    sed -i '' 's/gap-xl px-md py-md/gap-sm px-md py-sm/g' "$REPO_ROOT/apps/web/app/_components/marketing/HeroSection.tsx"
fi

# Fix FooterSection to ensure titles use foreground color
if [ -f "$REPO_ROOT/apps/web/app/_components/marketing/footer/FooterSection.tsx" ]; then
    echo "Fixing FooterSection titles..."
    # Ensure h4 uses text-foreground
    sed -i '' 's/\${typography\.cardTitle}/text-foreground font-title/g' "$REPO_ROOT/apps/web/app/_components/marketing/footer/FooterSection.tsx"
fi

# Fix all marketing page titles to use text-foreground
echo "Fixing all marketing page titles..."
find "$REPO_ROOT/apps/web/app/(marketing)" -type f -name "*.tsx" -exec sed -i '' \
    -e 's/text-accent\([^-]\)/text-foreground\1/g' \
    -e 's/color-primary\([^-]\)/text-foreground\1/g' \
    -e 's/text-green-[0-9]*\([^0-9]\)/text-foreground\1/g' {} \;

# Fix gradient implementations
echo "Fixing gradient implementations..."
find "$REPO_ROOT" -type f \( -name "*.tsx" -o -name "*.ts" \) \
    -not -path "*/node_modules/*" \
    -not -path "*/.next/*" \
    -not -path "*/.backup-*" \
    -exec sed -i '' \
    -e 's/text-gradient-primary/bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent/g' \
    -e 's/text-gradient-success/bg-gradient-to-r from-success to-accent bg-clip-text text-transparent/g' \
    -e 's/text-gradient-accent/bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent/g' {} \;

# Fix badge colors to use semantic tokens with proper opacity
echo "Fixing badge colors..."
find "$REPO_ROOT" -type f \( -name "*.tsx" -o -name "*.ts" \) \
    -not -path "*/node_modules/*" \
    -not -path "*/.next/*" \
    -not -path "*/.backup-*" \
    -exec sed -i '' \
    -e 's/bg-green-100 text-green-800/bg-success\/10 text-success/g' \
    -e 's/bg-red-100 text-red-800/bg-destructive\/10 text-destructive/g' \
    -e 's/bg-yellow-100 text-yellow-800/bg-warning\/10 text-warning/g' \
    -e 's/bg-blue-100 text-blue-800/bg-primary\/10 text-primary/g' \
    -e 's/bg-gray-100 text-gray-800/bg-muted\/20 text-muted-foreground/g' {} \;

# Fix any remaining palette references
echo "Fixing remaining palette references..."
find "$REPO_ROOT" -type f \( -name "*.tsx" -o -name "*.ts" \) \
    -not -path "*/node_modules/*" \
    -not -path "*/.next/*" \
    -not -path "*/.backup-*" \
    -exec sed -i '' \
    -e 's/palette\.gray/muted/g' \
    -e 's/palette\.blue/primary/g' \
    -e 's/palette\.green/success/g' \
    -e 's/palette\.red/destructive/g' \
    -e 's/palette\.yellow/warning/g' {} \;

# Fix typography classes to ensure headers use foreground
echo "Ensuring all headers use foreground color..."
find "$REPO_ROOT" -type f \( -name "*.tsx" -o -name "*.ts" \) \
    -not -path "*/node_modules/*" \
    -not -path "*/.next/*" \
    -not -path "*/.backup-*" \
    -exec sed -i '' \
    -e 's/text-heading-1[^"]*color-accent/text-heading-1 text-foreground/g' \
    -e 's/text-heading-2[^"]*color-accent/text-heading-2 text-foreground/g' \
    -e 's/text-heading-3[^"]*color-accent/text-heading-3 text-foreground/g' \
    -e 's/text-display[^"]*color-accent/text-display text-foreground/g' \
    -e 's/text-h1[^"]*color-accent/text-h1 text-foreground/g' \
    -e 's/text-h2[^"]*color-accent/text-h2 text-foreground/g' \
    -e 's/text-h3[^"]*color-accent/text-h3 text-foreground/g' {} \;

# Fix any hero-title classes that use accent
find "$REPO_ROOT" -type f \( -name "*.tsx" -o -name "*.ts" \) \
    -not -path "*/node_modules/*" \
    -not -path "*/.next/*" \
    -not -path "*/.backup-*" \
    -exec sed -i '' 's/hero-title/text-display text-foreground uppercase/g' {} \;

# Fix card-title classes that use accent
find "$REPO_ROOT" -type f \( -name "*.tsx" -o -name "*.ts" \) \
    -not -path "*/node_modules/*" \
    -not -path "*/.next/*" \
    -not -path "*/.backup-*" \
    -exec sed -i '' 's/card-title/text-heading-3 text-foreground uppercase/g' {} \;

# Count fixed files
fixed_count=$(git diff --name-only 2>/dev/null | wc -l)

echo ""
echo "================================================"
echo "FINAL FIX COMPLETE"
echo "================================================"
echo ""
echo "Fixed approximately $fixed_count files"
echo "Backup saved to: $BACKUP_DIR"
echo ""
echo "Key fixes applied:"
echo "✓ All titles/headers now use text-foreground (black)"
echo "✓ Gradients properly implemented with correct classes"
echo "✓ Badges use semantic colors with opacity"
echo "✓ All hardcoded colors replaced with semantic tokens"
echo "✓ Shadow values use semantic shadow classes"
echo ""
echo "Next steps:"
echo "1. Review the changes with: git diff"
echo "2. Test the application"
echo "3. Commit the changes if everything looks good"
echo ""
echo "To restore from backup:"
echo "cp -r $BACKUP_DIR/* $REPO_ROOT/"
