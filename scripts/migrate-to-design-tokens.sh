#!/bin/bash

###############################################################################
# ATLVS Design Token Migration Script
# Purpose: Migrate hardcoded colors and arbitrary Tailwind classes to design tokens
# Usage: ./scripts/migrate-to-design-tokens.sh [--dry-run]
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

DRY_RUN=false
if [[ "$1" == "--dry-run" ]]; then
  DRY_RUN=true
  echo -e "${YELLOW}🔍 DRY RUN MODE - No files will be modified${NC}"
fi

BACKUP_DIR=".migration-backups-$(date +%Y%m%d-%H%M%S)"

###############################################################################
# Helper Functions
###############################################################################

log_info() {
  echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
  echo -e "${RED}❌ $1${NC}"
}

create_backup() {
  local file=$1
  if [[ "$DRY_RUN" == false ]]; then
    mkdir -p "$BACKUP_DIR/$(dirname "$file")"
    cp "$file" "$BACKUP_DIR/$file"
  fi
}

replace_in_file() {
  local file=$1
  local pattern=$2
  local replacement=$3
  local count=0
  
  if grep -q "$pattern" "$file" 2>/dev/null; then
    if [[ "$DRY_RUN" == false ]]; then
      create_backup "$file"
      # Use perl for cross-platform compatibility
      perl -pi -e "s/$pattern/$replacement/g" "$file"
    fi
    count=$(grep -o "$pattern" "$file" 2>/dev/null | wc -l | tr -d ' ')
    log_success "Replaced $count occurrence(s) in $file"
    return 0
  fi
  return 1
}

###############################################################################
# Phase 1: Navigation Component Arbitrary Classes
###############################################################################

migrate_navigation_arbitrary_classes() {
  log_info "Phase 1: Migrating navigation arbitrary classes..."
  
  local files=(
    "packages/ui/src/components/Navigation/NavigationVariants.tsx"
    "packages/ui/src/components/Navigation/NavigationLazyLoader.tsx"
  )
  
  # Define mappings: pattern -> replacement
  declare -A MAPPINGS=(
    # Background colors
    ["bg-\\[hsl\\(var\\(--nav-bg-accent\\)\\)\\]"]="bg-popover"
    ["bg-\\[hsl\\(var\\(--nav-bg-secondary\\)\\)\\]"]="bg-muted"
    ["bg-\\[hsl\\(var\\(--nav-bg-glass\\)\\)\\]"]="bg-popover/80"
    ["bg-\\[hsl\\(var\\(--nav-bg-primary\\)\\)\\]"]="bg-background"
    
    # Text colors
    ["text-\\[hsl\\(var\\(--nav-fg-primary\\)\\)\\]"]="text-foreground"
    ["text-\\[hsl\\(var\\(--nav-fg-secondary\\)\\)\\]"]="text-muted-foreground"
    ["text-\\[hsl\\(var\\(--nav-fg-muted\\)\\)\\]"]="text-muted-foreground"
    ["text-\\[hsl\\(var\\(--nav-accent-primary\\)\\)\\]"]="text-primary"
    
    # Border colors
    ["border-\\[hsl\\(var\\(--nav-border-default\\)\\)\\]"]="border-border"
    ["border-\\[hsl\\(var\\(--nav-border-subtle\\)\\)\\]"]="border-border/50"
    
    # Hover states
    ["hover:bg-\\[hsl\\(var\\(--nav-accent-secondary\\)\\/0\\.1\\)\\]"]="hover:bg-accent/10"
    ["hover:text-\\[hsl\\(var\\(--nav-accent-primary\\)\\)\\]"]="hover:text-primary"
    
    # Focus states
    ["focus:ring-\\[hsl\\(var\\(--nav-accent-focus\\)\\)\\]"]="focus:ring-ring"
    
    # Arbitrary measurements with var()
    ["text-\\[var\\(--nav-text-xs\\)\\]"]="text-xs"
    ["text-\\[var\\(--nav-text-sm\\)\\]"]="text-sm"
    ["text-\\[var\\(--nav-text-base\\)\\]"]="text-base"
    ["font-\\[var\\(--nav-weight-medium\\)\\]"]="font-medium"
    ["font-\\[var\\(--nav-weight-semibold\\)\\]"]="font-semibold"
  )
  
  local total_replacements=0
  
  for file in "${files[@]}"; do
    if [[ ! -f "$file" ]]; then
      log_warning "File not found: $file"
      continue
    fi
    
    log_info "Processing: $file"
    local file_replacements=0
    
    for pattern in "${!MAPPINGS[@]}"; do
      replacement="${MAPPINGS[$pattern]}"
      if replace_in_file "$file" "$pattern" "$replacement"; then
        ((file_replacements++))
      fi
    done
    
    if [[ $file_replacements -gt 0 ]]; then
      total_replacements=$((total_replacements + file_replacements))
      log_success "Completed $file_replacements pattern replacements"
    else
      log_info "No replacements needed in $file"
    fi
  done
  
  log_success "Phase 1 complete: $total_replacements total pattern replacements"
}

###############################################################################
# Phase 2: Standardize Color Class Patterns
###############################################################################

standardize_color_classes() {
  log_info "Phase 2: Standardizing color class patterns..."
  
  # Find all TypeScript/TSX files
  local files=$(find packages/ui/src apps/web/app -type f \( -name "*.tsx" -o -name "*.ts" \) \
    ! -path "*/node_modules/*" \
    ! -path "*/dist/*" \
    ! -path "*/.next/*")
  
  local patterns_to_fix=(
    # Redundant hsl() wrappers when var already returns HSL
    's/className="([^"]*?)bg-\[hsl\(var\(--color-([a-z-]+)\)\)\]/className="$1bg-$2/g'
    's/className="([^"]*?)text-\[hsl\(var\(--color-([a-z-]+)\)\)\]/className="$1text-$2/g'
    's/className="([^"]*?)border-\[hsl\(var\(--color-([a-z-]+)\)\)\]/className="$1border-$2/g'
  )
  
  local count=0
  for file in $files; do
    for pattern in "${patterns_to_fix[@]}"; do
      if grep -qE 'hsl\(var\(--color-' "$file" 2>/dev/null; then
        if [[ "$DRY_RUN" == false ]]; then
          create_backup "$file"
          perl -pi -e "$pattern" "$file"
        fi
        ((count++))
      fi
    done
  done
  
  log_success "Phase 2 complete: Standardized $count files"
}

###############################################################################
# Phase 3: Create CSS Utility Classes for Common Patterns
###############################################################################

create_utility_classes() {
  log_info "Phase 3: Creating CSS utility classes..."
  
  local css_file="packages/ui/src/styles/utilities.css"
  
  if [[ "$DRY_RUN" == true ]]; then
    log_info "Would create: $css_file"
    return
  fi
  
  cat > "$css_file" <<'EOF'
/**
 * Design Token Utility Classes
 * Generated utility classes for common design patterns
 */

/* Navigation Utilities */
.nav-surface {
  background-color: hsl(var(--color-popover));
  color: hsl(var(--color-popover-foreground));
}

.nav-item {
  @apply px-sm py-xs rounded-md transition-colors;
  background-color: transparent;
  color: hsl(var(--color-muted-foreground));
}

.nav-item:hover {
  background-color: hsl(var(--color-accent) / 0.1);
  color: hsl(var(--color-foreground));
}

.nav-item-active {
  background-color: hsl(var(--color-accent) / 0.1);
  color: hsl(var(--color-primary));
  font-weight: 500;
}

/* Chart Utilities */
.chart-primary {
  color: hsl(var(--color-primary));
  fill: hsl(var(--color-primary));
}

.chart-success {
  color: hsl(var(--color-success));
  fill: hsl(var(--color-success));
}

.chart-warning {
  color: hsl(var(--color-warning));
  fill: hsl(var(--color-warning));
}

.chart-error {
  color: hsl(var(--color-destructive));
  fill: hsl(var(--color-destructive));
}

.chart-info {
  color: hsl(var(--color-info));
  fill: hsl(var(--color-info));
}

/* Status Badge Utilities */
.badge-status {
  @apply px-sm py-xs rounded-md text-xs font-medium;
}

.badge-success {
  @apply badge-status;
  background-color: hsl(var(--color-success) / 0.1);
  color: hsl(var(--color-success));
}

.badge-warning {
  @apply badge-status;
  background-color: hsl(var(--color-warning) / 0.1);
  color: hsl(var(--color-warning));
}

.badge-error {
  @apply badge-status;
  background-color: hsl(var(--color-destructive) / 0.1);
  color: hsl(var(--color-destructive));
}

.badge-info {
  @apply badge-status;
  background-color: hsl(var(--color-info) / 0.1);
  color: hsl(var(--color-info));
}
EOF
  
  log_success "Created utility classes: $css_file"
  
  # Import in main styles file
  local main_styles="packages/ui/src/styles.css"
  if [[ ! -f "$main_styles" ]]; then
    log_warning "Main styles file not found: $main_styles"
    return
  fi
  
  if ! grep -q "utilities.css" "$main_styles"; then
    echo "" >> "$main_styles"
    echo "@import './utilities.css';" >> "$main_styles"
    log_success "Added utilities import to $main_styles"
  fi
}

###############################################################################
# Phase 4: Validation
###############################################################################

validate_migration() {
  log_info "Phase 4: Validating migration..."
  
  local errors=0
  
  # Check for remaining arbitrary classes
  log_info "Checking for remaining arbitrary color classes..."
  local arbitrary_classes=$(grep -rE 'className="[^"]*\[(#|rgb|hsl)' \
    packages/ui/src/components/Navigation \
    2>/dev/null | wc -l | tr -d ' ')
  
  if [[ $arbitrary_classes -gt 0 ]]; then
    log_warning "Found $arbitrary_classes remaining arbitrary color classes in Navigation"
    ((errors++))
  else
    log_success "No arbitrary color classes in Navigation components"
  fi
  
  # Check for hardcoded hex colors (excluding allowed files)
  log_info "Checking for hardcoded hex colors..."
  local hex_colors=$(grep -rE '#[0-9a-fA-F]{6}' \
    packages/ui/src/components/Navigation \
    2>/dev/null | wc -l | tr -d ' ')
  
  if [[ $hex_colors -gt 0 ]]; then
    log_warning "Found $hex_colors hardcoded hex colors in Navigation"
    ((errors++))
  else
    log_success "No hardcoded hex colors in Navigation components"
  fi
  
  if [[ $errors -eq 0 ]]; then
    log_success "✨ All validation checks passed!"
    return 0
  else
    log_warning "⚠️  Migration complete with $errors warnings"
    return 1
  fi
}

###############################################################################
# Phase 5: Generate Report
###############################################################################

generate_report() {
  log_info "Generating migration report..."
  
  local report_file="docs/MIGRATION_REPORT_$(date +%Y%m%d-%H%M%S).md"
  
  cat > "$report_file" <<EOF
# Design Token Migration Report
**Date:** $(date '+%Y-%m-%d %H:%M:%S')  
**Mode:** $( [[ "$DRY_RUN" == true ]] && echo "Dry Run" || echo "Execution" )

## Summary

$(if [[ "$DRY_RUN" == true ]]; then
  echo "This was a dry run. No files were modified."
else
  echo "Migration executed successfully."
  echo ""
  echo "**Backup Location:** \`$BACKUP_DIR\`"
fi)

## Changes Applied

### Phase 1: Navigation Components
- Replaced arbitrary Tailwind classes with semantic tokens
- Target files:
  - \`NavigationVariants.tsx\`
  - \`NavigationLazyLoader.tsx\`

### Phase 2: Standardized Color Patterns
- Removed redundant \`hsl()\` wrappers
- Standardized variable usage

### Phase 3: Utility Classes
- Created \`packages/ui/src/styles/utilities.css\`
- Added navigation, chart, and badge utilities

### Phase 4: Validation
$( validate_migration 2>&1 | tail -n 5 )

## Next Steps

1. Run tests: \`npm test\`
2. Visual regression testing
3. Review backup files in \`$BACKUP_DIR\`
4. Commit changes if all tests pass

## Rollback Instructions

If issues are found, restore from backup:

\`\`\`bash
# Restore specific file
cp "$BACKUP_DIR/path/to/file" path/to/file

# Restore all files
cp -r "$BACKUP_DIR/packages" ./
cp -r "$BACKUP_DIR/apps" ./
\`\`\`
EOF
  
  log_success "Report generated: $report_file"
}

###############################################################################
# Main Execution
###############################################################################

main() {
  echo ""
  echo "======================================================================"
  echo "  ATLVS Design Token Migration"
  echo "======================================================================"
  echo ""
  
  if [[ "$DRY_RUN" == true ]]; then
    log_warning "DRY RUN MODE - Analyzing changes only"
  else
    log_info "EXECUTION MODE - Files will be modified"
    log_info "Creating backup directory: $BACKUP_DIR"
    mkdir -p "$BACKUP_DIR"
  fi
  
  echo ""
  
  # Execute migration phases
  migrate_navigation_arbitrary_classes
  echo ""
  
  standardize_color_classes
  echo ""
  
  create_utility_classes
  echo ""
  
  validate_migration
  echo ""
  
  generate_report
  
  echo ""
  echo "======================================================================"
  if [[ "$DRY_RUN" == true ]]; then
    echo "  DRY RUN COMPLETE - No files were modified"
    echo "  Run without --dry-run to apply changes"
  else
    echo "  MIGRATION COMPLETE"
    echo "  Backup location: $BACKUP_DIR"
  fi
  echo "======================================================================"
  echo ""
}

# Run main function
main "$@"
