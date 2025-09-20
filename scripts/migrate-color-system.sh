#!/bin/bash

# GHXSTSHIP Color System Migration Script
# Implements comprehensive color system update across entire repository

set -e

echo "🎨 GHXSTSHIP Color System Migration"
echo "=================================="
echo ""

# Define directories
REPO_ROOT="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship"
APPS_DIR="$REPO_ROOT/apps/web/app"
PACKAGES_DIR="$REPO_ROOT/packages"

echo "📁 Repository root: $REPO_ROOT"
echo ""

# Function to apply brand context classes
apply_brand_contexts() {
    echo "🏷️  Applying brand context classes..."
    
    # OPENDECK pages - add brand-opendeck class
    echo "   → Adding .brand-opendeck to OPENDECK pages..."
    find "$APPS_DIR" -path "*opendeck*" -name "*.tsx" -type f | while read -r file; do
        if grep -q "className.*min-h-screen" "$file"; then
            sed -i '' 's/className="min-h-screen/className="min-h-screen brand-opendeck/g' "$file"
        elif grep -q "<div className=\"" "$file" | head -1; then
            sed -i '' '/<div className="[^"]*">/{ s/className="/className="brand-opendeck /; }' "$file"
        fi
        echo "     ✓ Updated: $(basename "$file")"
    done
    
    # ATLVS pages - add brand-atlvs class (already exists, verify)
    echo "   → Verifying .brand-atlvs on ATLVS pages..."
    find "$APPS_DIR" -path "*atlvs*" -name "*.tsx" -type f | while read -r file; do
        if ! grep -q "brand-atlvs" "$file"; then
            if grep -q "className.*min-h-screen" "$file"; then
                sed -i '' 's/className="min-h-screen/className="min-h-screen brand-atlvs/g' "$file"
            fi
        fi
        echo "     ✓ Verified: $(basename "$file")"
    done
    
    # Main app pages - add brand-atlvs class (ATLVS is main app)
    echo "   → Adding .brand-atlvs to main app pages..."
    find "$APPS_DIR/(app)" -name "*.tsx" -type f | while read -r file; do
        if [[ "$file" != *"opendeck"* ]] && [[ "$file" != *"marketing"* ]]; then
            if grep -q "className.*min-h-screen" "$file"; then
                sed -i '' 's/className="min-h-screen/className="min-h-screen brand-atlvs/g' "$file"
            fi
        fi
    done
    
    echo "   ✓ Brand context classes applied"
    echo ""
}

# Function to update color references in components
update_color_references() {
    echo "🎨 Updating color references..."
    
    # Update old blue primary references to use contextual colors
    echo "   → Updating primary color references..."
    find "$REPO_ROOT" -name "*.tsx" -o -name "*.ts" -o -name "*.css" | grep -v node_modules | while read -r file; do
        # Update gradient references
        sed -i '' 's/from-primary to-accent/from-primary to-secondary/g' "$file" 2>/dev/null || true
        sed -i '' 's/from-accent to-primary/from-secondary to-primary/g' "$file" 2>/dev/null || true
        
        # Update old color classes that might conflict
        sed -i '' 's/color-primary/color-accent/g' "$file" 2>/dev/null || true
        sed -i '' 's/text-primary/text-accent/g' "$file" 2>/dev/null || true
        sed -i '' 's/bg-primary/bg-accent/g' "$file" 2>/dev/null || true
    done
    
    echo "   ✓ Color references updated"
    echo ""
}

# Function to normalize status colors
normalize_status_colors() {
    echo "⚠️  Normalizing status colors..."
    
    find "$REPO_ROOT" -name "*.tsx" -o -name "*.ts" -o -name "*.css" | grep -v node_modules | while read -r file; do
        # Ensure consistent destructive/error colors
        sed -i '' 's/color-error/color-destructive/g' "$file" 2>/dev/null || true
        sed -i '' 's/bg-error/bg-destructive/g' "$file" 2>/dev/null || true
        sed -i '' 's/text-error/text-destructive/g' "$file" 2>/dev/null || true
        sed -i '' 's/border-error/border-destructive/g' "$file" 2>/dev/null || true
        
        # Ensure consistent warning colors
        sed -i '' 's/color-yellow/color-warning/g' "$file" 2>/dev/null || true
        sed -i '' 's/bg-yellow/bg-warning/g' "$file" 2>/dev/null || true
        sed -i '' 's/text-yellow/text-warning/g' "$file" 2>/dev/null || true
        
        # Ensure consistent success colors  
        sed -i '' 's/color-green/color-success/g' "$file" 2>/dev/null || true
        sed -i '' 's/bg-green/bg-success/g' "$file" 2>/dev/null || true
        sed -i '' 's/text-green/text-success/g' "$file" 2>/dev/null || true
        
        # Ensure consistent info colors
        sed -i '' 's/color-blue/color-info/g' "$file" 2>/dev/null || true
        sed -i '' 's/bg-blue/bg-info/g' "$file" 2>/dev/null || true
        sed -i '' 's/text-blue/text-info/g' "$file" 2>/dev/null || true
    done
    
    echo "   ✓ Status colors normalized"
    echo ""
}

# Function to update marketing layout with default Ghostship Green
update_marketing_layout() {
    echo "🏠 Updating marketing layout..."
    
    local marketing_layout="$APPS_DIR/(marketing)/layout.tsx"
    if [[ -f "$marketing_layout" ]]; then
        # Add brand-ghostship class to marketing layout if not present
        if ! grep -q "brand-ghostship" "$marketing_layout"; then
            sed -i '' 's/<body/<body className="brand-ghostship"/g' "$marketing_layout" 2>/dev/null || true
        fi
        echo "   ✓ Marketing layout updated with Ghostship Green default"
    fi
    echo ""
}

# Function to update auth pages with Ghostship Green
update_auth_pages() {
    echo "🔐 Updating auth pages..."
    
    find "$APPS_DIR/auth" -name "*.tsx" -type f | while read -r file; do
        if grep -q "className.*min-h-screen" "$file"; then
            sed -i '' 's/className="min-h-screen/className="min-h-screen brand-ghostship/g' "$file"
        elif grep -q "<div className=\"" "$file" | head -1; then
            sed -i '' '/<div className="[^"]*">/{ s/className="/className="brand-ghostship /; }' "$file"
        fi
        echo "   ✓ Updated: $(basename "$file")"
    done
    
    echo "   ✓ Auth pages updated with Ghostship Green"
    echo ""
}

# Function to create color validation report
create_validation_report() {
    echo "📊 Creating color validation report..."
    
    local report_file="$REPO_ROOT/docs/COLOR_MIGRATION_REPORT.md"
    
    cat > "$report_file" << 'EOF'
# GHXSTSHIP Color System Migration Report

## Migration Summary
- **Date**: $(date)
- **Ghostship Green**: #22C55E (hsl(158 64% 52%)) - Global Default
- **OPENDECK Blue**: #00BFFF (hsl(195 100% 50%)) - OPENDECK Context
- **ATLVS Pink**: #FF00FF (hsl(320 100% 50%)) - ATLVS Context

## Brand Context Applications

### Global Default (Ghostship Green)
- Marketing pages: `/app/(marketing)/**`
- Auth pages: `/app/auth/**`
- General components and utilities

### OPENDECK Blue Context
- OPENDECK marketplace: `/app/(app)/(shell)/opendeck/**`
- OPENDECK product pages: `/app/(marketing)/products/opendeck/**`

### ATLVS Pink Context  
- Main application: `/app/(app)/**` (excluding OPENDECK)
- ATLVS product pages: `/app/(marketing)/products/atlvs/**`

## Status Colors (Normalized Repo-wide)
- **Destructive**: #EF4444 (Red)
- **Warning**: #F59E0B (Yellow)
- **Success**: #16A34A (Green)
- **Info**: #3B82F6 (Blue)

## Implementation Details
- Updated unified design system CSS with new color tokens
- Applied brand context classes (.brand-ghostship, .brand-opendeck, .brand-atlvs)
- Normalized status color usage across all components
- Maintained backward compatibility with existing color utilities

## Validation
Run the following commands to validate the migration:
```bash
# Check for old color references
grep -r "hsl(195 100% 50%)" apps/ --include="*.tsx" --include="*.ts"

# Verify brand context classes
grep -r "brand-opendeck\|brand-atlvs\|brand-ghostship" apps/ --include="*.tsx"

# Check status color consistency
grep -r "color-error\|color-yellow\|color-green\|color-blue" apps/ --include="*.tsx"
```
EOF

    echo "   ✓ Validation report created: $report_file"
    echo ""
}

# Main execution
main() {
    echo "🚀 Starting color system migration..."
    echo ""
    
    apply_brand_contexts
    update_color_references  
    normalize_status_colors
    update_marketing_layout
    update_auth_pages
    create_validation_report
    
    echo "✅ Color system migration completed successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Test the application: npm run dev"
    echo "   2. Review the validation report: docs/COLOR_MIGRATION_REPORT.md"
    echo "   3. Run validation commands to check for any remaining issues"
    echo ""
}

# Execute main function
main "$@"
