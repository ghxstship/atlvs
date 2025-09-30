#!/bin/bash

# GHXSTSHIP Pixel-Perfect Remediation Execution Script
# This script directly fixes spacing violations in critical files

echo "================================================"
echo "EXECUTING PIXEL-PERFECT REMEDIATION PLAN"
echo "================================================"
echo ""

# Configuration
PROJECT_ROOT="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship"
BACKUP_DIR="$PROJECT_ROOT/.backup-remediation-$(date +%Y%m%d-%H%M%S)"
LOG_FILE="$PROJECT_ROOT/remediation-execution.log"

# Create backup directory
echo "Creating backup directory: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"

# Initialize log
echo "Remediation started at $(date)" > "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Function to fix a file with proper pattern matching
fix_file_content() {
    local file="$1"
    local relative_path="${file#$PROJECT_ROOT/}"
    
    echo "Processing: $relative_path"
    
    # Create backup
    local backup_path="$BACKUP_DIR/$relative_path"
    mkdir -p "$(dirname "$backup_path")"
    cp "$file" "$backup_path"
    
    # Read file content
    local content=$(cat "$file")
    local original_content="$content"
    
    # Apply comprehensive replacements
    # Padding replacements
    content=$(echo "$content" | sed -E 's/([^a-zA-Z0-9_-])p-1([^0-9])/\1p-xs\2/g')
    content=$(echo "$content" | sed -E 's/([^a-zA-Z0-9_-])p-2([^0-9])/\1p-sm\2/g')
    content=$(echo "$content" | sed -E 's/([^a-zA-Z0-9_-])p-3([^0-9])/\1p-sm\2/g')
    content=$(echo "$content" | sed -E 's/([^a-zA-Z0-9_-])p-4([^0-9])/\1p-md\2/g')
    content=$(echo "$content" | sed -E 's/([^a-zA-Z0-9_-])p-5([^0-9])/\1p-lg\2/g')
    content=$(echo "$content" | sed -E 's/([^a-zA-Z0-9_-])p-6([^0-9])/\1p-lg\2/g')
    content=$(echo "$content" | sed -E 's/([^a-zA-Z0-9_-])p-8([^0-9])/\1p-xl\2/g')
    content=$(echo "$content" | sed -E 's/([^a-zA-Z0-9_-])p-10([^0-9])/\1p-2xl\2/g')
    content=$(echo "$content" | sed -E 's/([^a-zA-Z0-9_-])p-12([^0-9])/\1p-2xl\2/g')
    content=$(echo "$content" | sed -E 's/([^a-zA-Z0-9_-])p-16([^0-9])/\1p-3xl\2/g')
    content=$(echo "$content" | sed -E 's/([^a-zA-Z0-9_-])p-20([^0-9])/\1p-4xl\2/g')
    content=$(echo "$content" | sed -E 's/([^a-zA-Z0-9_-])p-24([^0-9])/\1p-5xl\2/g')
    
    # Padding X-axis
    content=$(echo "$content" | sed -E 's/([^a-zA-Z0-9_-])px-1([^0-9])/\1px-xs\2/g')
    content=$(echo "$content" | sed -E 's/([^a-zA-Z0-9_-])px-2([^0-9])/\1px-sm\2/g')
    content=$(echo "$content" | sed -E 's/([^a-zA-Z0-9_-])px-3([^0-9])/\1px-sm\2/g')
    content=$(echo "$content" | sed -E 's/([^a-zA-Z0-9_-])px-4([^0-9])/\1px-md\2/g')
    content=$(echo "$content" | sed -E 's/([^a-zA-Z0-9_-])px-5([^0-9])/\1px-lg\2/g')
    content=$(echo "$content" | sed -E 's/([^a-zA-Z0-9_-])px-6([^0-9])/\1px-lg\2/g')
    content=$(echo "$content" | sed -E 's/([^a-zA-Z0-9_-])px-8([^0-9])/\1px-xl\2/g')
    content=$(echo "$content" | sed -E 's/([^a-zA-Z0-9_-])px-10([^0-9])/\1px-2xl\2/g')
    content=$(echo "$content" | sed -E 's/([^a-zA-Z0-9_-])px-12([^0-9])/\1px-2xl\2/g')
    content=$(echo "$content" | sed -E 's/([^a-zA-Z0-9_-])px-16([^0-9])/\1px-3xl\2/g')
    content=$(echo "$content" | sed -E 's/([^a-zA-Z0-9_-])px-20([^0-9])/\1px-4xl\2/g')
    
    # Padding Y-axis
    content=$(echo "$content" | sed -E 's/([^a-zA-Z0-9_-])py-1([^0-9])/\1py-xs\2/g')
    content=$(echo "$content" | sed -E 's/([^a-zA-Z0-9_-])py-2([^0-9])/\1py-sm\2/g')
    content=$(echo "$content" | sed -E 's/([^a-zA-Z0-9_-])py-3([^0-9])/\1py-sm\2/g')
    content=$(echo "$content" | sed -E 's/([^a-zA-Z0-9_-])py-4([^0-9])/\1py-md\2/g')
    content=$(echo "$content" | sed -E 's/([^a-zA-Z0-9_-])py-5([^0-9])/\1py-lg\2/g')
    content=$(echo "$content" | sed -E 's/([^a-zA-Z0-9_-])py-6([^0-9])/\1py-lg\2/g')
    content=$(echo "$content" | sed -E 's/([^a-zA-Z0-9_-])py-8([^0-9])/\1py-xl\2/g')
    content=$(echo "$content" | sed -E 's/([^a-zA-Z0-9_-])py-10([^0-9])/\1py-2xl\2/g')
    content=$(echo "$content" | sed -E 's/([^a-zA-Z0-9_-])py-12([^0-9])/\1py-2xl\2/g')
    content=$(echo "$content" | sed -E 's/([^a-zA-Z0-9_-])py-16([^0-9])/\1py-3xl\2/g')
    content=$(echo "$content" | sed -E 's/([^a-zA-Z0-9_-])py-20([^0-9])/\1py-4xl\2/g')
    content=$(echo "$content" | sed -E 's/([^a-zA-Z0-9_-])py-24([^0-9])/\1py-5xl\2/g')
    
    # Gap replacements
    content=$(echo "$content" | sed -E 's/([^a-zA-Z0-9_-])gap-1([^0-9])/\1gap-xs\2/g')
    content=$(echo "$content" | sed -E 's/([^a-zA-Z0-9_-])gap-2([^0-9])/\1gap-sm\2/g')
    content=$(echo "$content" | sed -E 's/([^a-zA-Z0-9_-])gap-3([^0-9])/\1gap-sm\2/g')
    content=$(echo "$content" | sed -E 's/([^a-zA-Z0-9_-])gap-4([^0-9])/\1gap-md\2/g')
    content=$(echo "$content" | sed -E 's/([^a-zA-Z0-9_-])gap-5([^0-9])/\1gap-lg\2/g')
    content=$(echo "$content" | sed -E 's/([^a-zA-Z0-9_-])gap-6([^0-9])/\1gap-lg\2/g')
    content=$(echo "$content" | sed -E 's/([^a-zA-Z0-9_-])gap-8([^0-9])/\1gap-xl\2/g')
    content=$(echo "$content" | sed -E 's/([^a-zA-Z0-9_-])gap-10([^0-9])/\1gap-2xl\2/g')
    content=$(echo "$content" | sed -E 's/([^a-zA-Z0-9_-])gap-12([^0-9])/\1gap-2xl\2/g')
    content=$(echo "$content" | sed -E 's/([^a-zA-Z0-9_-])gap-16([^0-9])/\1gap-3xl\2/g')
    
    # Space replacements (convert to gap where appropriate)
    content=$(echo "$content" | sed -E 's/([^a-zA-Z0-9_-])space-x-1([^0-9])/\1gap-xs\2/g')
    content=$(echo "$content" | sed -E 's/([^a-zA-Z0-9_-])space-x-2([^0-9])/\1gap-sm\2/g')
    content=$(echo "$content" | sed -E 's/([^a-zA-Z0-9_-])space-x-3([^0-9])/\1gap-sm\2/g')
    content=$(echo "$content" | sed -E 's/([^a-zA-Z0-9_-])space-x-4([^0-9])/\1gap-md\2/g')
    content=$(echo "$content" | sed -E 's/([^a-zA-Z0-9_-])space-x-6([^0-9])/\1gap-lg\2/g')
    content=$(echo "$content" | sed -E 's/([^a-zA-Z0-9_-])space-x-8([^0-9])/\1gap-xl\2/g')
    
    content=$(echo "$content" | sed -E 's/([^a-zA-Z0-9_-])space-y-1([^0-9])/\1gap-xs\2/g')
    content=$(echo "$content" | sed -E 's/([^a-zA-Z0-9_-])space-y-2([^0-9])/\1gap-sm\2/g')
    content=$(echo "$content" | sed -E 's/([^a-zA-Z0-9_-])space-y-3([^0-9])/\1gap-sm\2/g')
    content=$(echo "$content" | sed -E 's/([^a-zA-Z0-9_-])space-y-4([^0-9])/\1gap-md\2/g')
    content=$(echo "$content" | sed -E 's/([^a-zA-Z0-9_-])space-y-6([^0-9])/\1gap-lg\2/g')
    content=$(echo "$content" | sed -E 's/([^a-zA-Z0-9_-])space-y-8([^0-9])/\1gap-xl\2/g')
    content=$(echo "$content" | sed -E 's/([^a-zA-Z0-9_-])space-y-10([^0-9])/\1gap-2xl\2/g')
    content=$(echo "$content" | sed -E 's/([^a-zA-Z0-9_-])space-y-12([^0-9])/\1gap-2xl\2/g')
    content=$(echo "$content" | sed -E 's/([^a-zA-Z0-9_-])space-y-16([^0-9])/\1gap-3xl\2/g')
    content=$(echo "$content" | sed -E 's/([^a-zA-Z0-9_-])space-y-20([^0-9])/\1gap-4xl\2/g')
    
    # Check if content changed
    if [ "$content" != "$original_content" ]; then
        echo "$content" > "$file"
        echo "✓ Fixed: $relative_path" | tee -a "$LOG_FILE"
        return 0
    else
        echo "  No changes needed: $relative_path" | tee -a "$LOG_FILE"
        return 1
    fi
}

# Phase 1: Fix Critical Files (Top 20 violators)
echo ""
echo "PHASE 1: Fixing Critical Files (Top 20 violators)"
echo "================================================"

critical_files=(
    "$PROJECT_ROOT/packages/ui/src/system/ContainerSystem.tsx"
    "$PROJECT_ROOT/packages/ui/src/system/WorkflowSystem.tsx"
    "$PROJECT_ROOT/packages/ui/src/components/DataViews/DesignTokenValidator.tsx"
    "$PROJECT_ROOT/packages/ui/src/system/GridSystem.tsx"
    "$PROJECT_ROOT/packages/ui/src/system/LayoutSystem.tsx"
    "$PROJECT_ROOT/packages/ui/src/system/CompositePatterns.tsx"
    "$PROJECT_ROOT/packages/ui/src/system/ComponentSystem.tsx"
    "$PROJECT_ROOT/packages/ui/src/components/DataViews/UniversalDrawer.tsx"
    "$PROJECT_ROOT/packages/ui/src/system/PerformanceMonitor.tsx"
    "$PROJECT_ROOT/packages/ui/src/components/Navigation.tsx"
    "$PROJECT_ROOT/packages/ui/src/components/architecture/DesignSystem.tsx"
    "$PROJECT_ROOT/packages/ui/src/components/Table.tsx"
    "$PROJECT_ROOT/packages/ui/src/components/Sidebar/SidebarNavigation.tsx"
    "$PROJECT_ROOT/packages/ui/src/components/DataViews/DataActions.tsx"
    "$PROJECT_ROOT/packages/ui/src/components/monitoring/AlertingSystem.tsx"
    "$PROJECT_ROOT/packages/ui/src/components/DataViews/GalleryView.tsx"
    "$PROJECT_ROOT/packages/ui/src/components/DataViews/DynamicFieldManager.tsx"
    "$PROJECT_ROOT/packages/ui/src/components/monitoring/DatabaseMonitoringDashboard.tsx"
    "$PROJECT_ROOT/packages/ui/src/components/DataViews/DatabaseOptimizer.tsx"
    "$PROJECT_ROOT/packages/ui/src/components/Sidebar/SidebarExample.tsx"
)

fixed_count=0
for file in "${critical_files[@]}"; do
    if [ -f "$file" ]; then
        if fix_file_content "$file"; then
            fixed_count=$((fixed_count + 1))
        fi
    fi
done

echo "Phase 1 Complete: Fixed $fixed_count critical files"
echo ""

# Phase 2: Fix Marketing Components
echo "PHASE 2: Fixing Marketing Components"
echo "================================================"

# Fix HeroSection specifically since it's open
hero_file="$PROJECT_ROOT/apps/web/app/_components/marketing/HeroSection.tsx"
if [ -f "$hero_file" ]; then
    echo "Fixing HeroSection.tsx..."
    fix_file_content "$hero_file"
fi

# Fix other marketing components
marketing_files=(
    "$PROJECT_ROOT/apps/web/app/_components/marketing/FeatureGrid.tsx"
    "$PROJECT_ROOT/apps/web/app/_components/marketing/ProductHighlights.tsx"
    "$PROJECT_ROOT/apps/web/app/_components/marketing/CTASection.tsx"
    "$PROJECT_ROOT/apps/web/app/_components/marketing/SocialProof.tsx"
    "$PROJECT_ROOT/apps/web/app/_components/marketing/TrustSignals.tsx"
    "$PROJECT_ROOT/apps/web/app/_components/marketing/MarketingHeader.tsx"
    "$PROJECT_ROOT/apps/web/app/_components/marketing/MarketingFooter.tsx"
)

for file in "${marketing_files[@]}"; do
    if [ -f "$file" ]; then
        fix_file_content "$file"
    fi
done

echo ""

# Phase 3: Fix Button and Card Components
echo "PHASE 3: Fixing Button and Card Components"
echo "================================================"

# Find and fix all Button components
button_files=$(find "$PROJECT_ROOT" -name "*[Bb]utton*.tsx" -type f | grep -v node_modules | grep -v .next | grep -v .backup)
for file in $button_files; do
    if [ -f "$file" ]; then
        fix_file_content "$file"
    fi
done

# Find and fix all Card components
card_files=$(find "$PROJECT_ROOT" -name "*[Cc]ard*.tsx" -type f | grep -v node_modules | grep -v .next | grep -v .backup)
for file in $card_files; do
    if [ -f "$file" ]; then
        fix_file_content "$file"
    fi
done

echo ""
echo "================================================"
echo "REMEDIATION EXECUTION COMPLETE!"
echo "================================================"
echo ""
echo "Summary:"
echo "  - Backup created at: $BACKUP_DIR"
echo "  - Log file: $LOG_FILE"
echo "  - Critical files processed: ${#critical_files[@]}"
echo "  - Marketing components processed"
echo "  - Button and Card components processed"
echo ""
echo "Next Steps:"
echo "  1. Run audit to verify fixes: ./scripts/pixel-perfect-audit.sh"
echo "  2. Test build: pnpm build"
echo "  3. Visual regression testing"
echo ""
echo "To restore from backup if needed:"
echo "  cp -r '$BACKUP_DIR/'* '$PROJECT_ROOT/'"
echo ""
