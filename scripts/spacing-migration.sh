#!/bin/bash
# GHXSTSHIP Spacing Migration Script
# Migrates hardcoded Tailwind spacing classes to semantic design tokens

set -e

echo "🚀 Starting GHXSTSHIP Spacing Migration..."
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
TOTAL_FILES=0
MODIFIED_FILES=0

# Function to log with colors
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

# Function to count files before migration
count_files() {
    log_info "Counting files to be processed..."
    TOTAL_FILES=$(find . -name "*.tsx" -o -name "*.ts" | grep -v node_modules | grep -v .next | grep -v dist | wc -l)
    log_info "Found $TOTAL_FILES TypeScript/React files to process"
}

# Function to create backup
create_backup() {
    log_info "Creating backup..."
    BACKUP_DIR="./spacing-migration-backup-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    
    # Copy all TypeScript and React files to backup
    find . -name "*.tsx" -o -name "*.ts" | grep -v node_modules | grep -v .next | grep -v dist | while read file; do
        mkdir -p "$BACKUP_DIR/$(dirname "$file")"
        cp "$file" "$BACKUP_DIR/$file"
    done
    
    log_success "Backup created at: $BACKUP_DIR"
}

# Function to migrate padding classes
migrate_padding() {
    log_info "Migrating padding classes..."
    
    find . -name "*.tsx" -o -name "*.ts" | grep -v node_modules | grep -v .next | grep -v dist | while read file; do
        if grep -q "className.*p-[0-9]" "$file"; then
            # Create temp file for atomic replacement
            temp_file=$(mktemp)
            
            # Migrate padding classes
            sed -E \
                -e 's/([[:space:]]|")p-1([[:space:]]|")/\1p-xs\2/g' \
                -e 's/([[:space:]]|")p-2([[:space:]]|")/\1p-xs\2/g' \
                -e 's/([[:space:]]|")p-3([[:space:]]|")/\1p-sm\2/g' \
                -e 's/([[:space:]]|")p-4([[:space:]]|")/\1p-md\2/g' \
                -e 's/([[:space:]]|")p-6([[:space:]]|")/\1p-lg\2/g' \
                -e 's/([[:space:]]|")p-8([[:space:]]|")/\1p-xl\2/g' \
                -e 's/([[:space:]]|")p-12([[:space:]]|")/\1p-2xl\2/g' \
                -e 's/([[:space:]]|")p-16([[:space:]]|")/\1p-3xl\2/g' \
                "$file" > "$temp_file"
            
            mv "$temp_file" "$file"
            echo "  📝 Updated padding in: $file"
            ((MODIFIED_FILES++))
        fi
    done
}

# Function to migrate directional padding classes
migrate_directional_padding() {
    log_info "Migrating directional padding classes..."
    
    find . -name "*.tsx" -o -name "*.ts" | grep -v node_modules | grep -v .next | grep -v dist | while read file; do
        if grep -qE "className.*(px|py|pt|pb|pl|pr)-[0-9]" "$file"; then
            temp_file=$(mktemp)
            
            # Migrate horizontal padding
            sed -E \
                -e 's/([[:space:]]|")px-1([[:space:]]|")/\1px-xs\2/g' \
                -e 's/([[:space:]]|")px-2([[:space:]]|")/\1px-xs\2/g' \
                -e 's/([[:space:]]|")px-3([[:space:]]|")/\1px-sm\2/g' \
                -e 's/([[:space:]]|")px-4([[:space:]]|")/\1px-md\2/g' \
                -e 's/([[:space:]]|")px-6([[:space:]]|")/\1px-lg\2/g' \
                -e 's/([[:space:]]|")px-8([[:space:]]|")/\1px-xl\2/g' \
                "$file" > "$temp_file"
            
            # Migrate vertical padding
            sed -E \
                -e 's/([[:space:]]|")py-1([[:space:]]|")/\1py-xs\2/g' \
                -e 's/([[:space:]]|")py-2([[:space:]]|")/\1py-xs\2/g' \
                -e 's/([[:space:]]|")py-3([[:space:]]|")/\1py-sm\2/g' \
                -e 's/([[:space:]]|")py-4([[:space:]]|")/\1py-md\2/g' \
                -e 's/([[:space:]]|")py-6([[:space:]]|")/\1py-lg\2/g' \
                -e 's/([[:space:]]|")py-8([[:space:]]|")/\1py-xl\2/g' \
                "$temp_file" > "${temp_file}.2"
            
            # Migrate individual sides
            sed -E \
                -e 's/([[:space:]]|")pt-1([[:space:]]|")/\1pt-xs\2/g' \
                -e 's/([[:space:]]|")pt-2([[:space:]]|")/\1pt-xs\2/g' \
                -e 's/([[:space:]]|")pt-3([[:space:]]|")/\1pt-sm\2/g' \
                -e 's/([[:space:]]|")pt-4([[:space:]]|")/\1pt-md\2/g' \
                -e 's/([[:space:]]|")pb-1([[:space:]]|")/\1pb-xs\2/g' \
                -e 's/([[:space:]]|")pb-2([[:space:]]|")/\1pb-xs\2/g' \
                -e 's/([[:space:]]|")pb-3([[:space:]]|")/\1pb-sm\2/g' \
                -e 's/([[:space:]]|")pb-4([[:space:]]|")/\1pb-md\2/g' \
                -e 's/([[:space:]]|")pl-1([[:space:]]|")/\1pl-xs\2/g' \
                -e 's/([[:space:]]|")pl-2([[:space:]]|")/\1pl-xs\2/g' \
                -e 's/([[:space:]]|")pl-3([[:space:]]|")/\1pl-sm\2/g' \
                -e 's/([[:space:]]|")pl-4([[:space:]]|")/\1pl-md\2/g' \
                -e 's/([[:space:]]|")pr-1([[:space:]]|")/\1pr-xs\2/g' \
                -e 's/([[:space:]]|")pr-2([[:space:]]|")/\1pr-xs\2/g' \
                -e 's/([[:space:]]|")pr-3([[:space:]]|")/\1pr-sm\2/g' \
                -e 's/([[:space:]]|")pr-4([[:space:]]|")/\1pr-md\2/g' \
                "${temp_file}.2" > "$temp_file"
            
            mv "$temp_file" "$file"
            rm -f "${temp_file}.2"
            echo "  📝 Updated directional padding in: $file"
        fi
    done
}

# Function to migrate margin classes
migrate_margins() {
    log_info "Migrating margin classes..."
    
    find . -name "*.tsx" -o -name "*.ts" | grep -v node_modules | grep -v .next | grep -v dist | while read file; do
        if grep -qE "className.*(^|[[:space:]])m-[0-9]" "$file"; then
            temp_file=$(mktemp)
            
            sed -E \
                -e 's/([[:space:]]|")m-1([[:space:]]|")/\1m-xs\2/g' \
                -e 's/([[:space:]]|")m-2([[:space:]]|")/\1m-xs\2/g' \
                -e 's/([[:space:]]|")m-3([[:space:]]|")/\1m-sm\2/g' \
                -e 's/([[:space:]]|")m-4([[:space:]]|")/\1m-md\2/g' \
                -e 's/([[:space:]]|")m-6([[:space:]]|")/\1m-lg\2/g' \
                -e 's/([[:space:]]|")m-8([[:space:]]|")/\1m-xl\2/g' \
                -e 's/([[:space:]]|")m-12([[:space:]]|")/\1m-2xl\2/g' \
                -e 's/([[:space:]]|")m-16([[:space:]]|")/\1m-3xl\2/g' \
                "$file" > "$temp_file"
            
            mv "$temp_file" "$file"
            echo "  📝 Updated margins in: $file"
        fi
    done
}

# Function to migrate directional margin classes
migrate_directional_margins() {
    log_info "Migrating directional margin classes..."
    
    find . -name "*.tsx" -o -name "*.ts" | grep -v node_modules | grep -v .next | grep -v dist | while read file; do
        if grep -qE "className.*(mx|my|mt|mb|ml|mr)-[0-9]" "$file"; then
            temp_file=$(mktemp)
            
            sed -E \
                -e 's/([[:space:]]|")mx-1([[:space:]]|")/\1mx-xs\2/g' \
                -e 's/([[:space:]]|")mx-2([[:space:]]|")/\1mx-xs\2/g' \
                -e 's/([[:space:]]|")mx-3([[:space:]]|")/\1mx-sm\2/g' \
                -e 's/([[:space:]]|")mx-4([[:space:]]|")/\1mx-md\2/g' \
                -e 's/([[:space:]]|")mx-6([[:space:]]|")/\1mx-lg\2/g' \
                -e 's/([[:space:]]|")mx-8([[:space:]]|")/\1mx-xl\2/g' \
                -e 's/([[:space:]]|")my-1([[:space:]]|")/\1my-xs\2/g' \
                -e 's/([[:space:]]|")my-2([[:space:]]|")/\1my-xs\2/g' \
                -e 's/([[:space:]]|")my-3([[:space:]]|")/\1my-sm\2/g' \
                -e 's/([[:space:]]|")my-4([[:space:]]|")/\1my-md\2/g' \
                -e 's/([[:space:]]|")my-6([[:space:]]|")/\1my-lg\2/g' \
                -e 's/([[:space:]]|")my-8([[:space:]]|")/\1my-xl\2/g' \
                -e 's/([[:space:]]|")mt-1([[:space:]]|")/\1mt-xs\2/g' \
                -e 's/([[:space:]]|")mt-2([[:space:]]|")/\1mt-xs\2/g' \
                -e 's/([[:space:]]|")mt-3([[:space:]]|")/\1mt-sm\2/g' \
                -e 's/([[:space:]]|")mt-4([[:space:]]|")/\1mt-md\2/g' \
                -e 's/([[:space:]]|")mb-1([[:space:]]|")/\1mb-xs\2/g' \
                -e 's/([[:space:]]|")mb-2([[:space:]]|")/\1mb-xs\2/g' \
                -e 's/([[:space:]]|")mb-3([[:space:]]|")/\1mb-sm\2/g' \
                -e 's/([[:space:]]|")mb-4([[:space:]]|")/\1mb-md\2/g' \
                -e 's/([[:space:]]|")ml-1([[:space:]]|")/\1ml-xs\2/g' \
                -e 's/([[:space:]]|")ml-2([[:space:]]|")/\1ml-xs\2/g' \
                -e 's/([[:space:]]|")ml-3([[:space:]]|")/\1ml-sm\2/g' \
                -e 's/([[:space:]]|")ml-4([[:space:]]|")/\1ml-md\2/g' \
                -e 's/([[:space:]]|")mr-1([[:space:]]|")/\1mr-xs\2/g' \
                -e 's/([[:space:]]|")mr-2([[:space:]]|")/\1mr-xs\2/g' \
                -e 's/([[:space:]]|")mr-3([[:space:]]|")/\1mr-sm\2/g' \
                -e 's/([[:space:]]|")mr-4([[:space:]]|")/\1mr-md\2/g' \
                "$file" > "$temp_file"
            
            mv "$temp_file" "$file"
            echo "  📝 Updated directional margins in: $file"
        fi
    done
}

# Function to migrate gap classes
migrate_gaps() {
    log_info "Migrating gap classes..."
    
    find . -name "*.tsx" -o -name "*.ts" | grep -v node_modules | grep -v .next | grep -v dist | while read file; do
        if grep -qE "className.*gap-[0-9]" "$file"; then
            temp_file=$(mktemp)
            
            sed -E \
                -e 's/([[:space:]]|")gap-1([[:space:]]|")/\1gap-x-xs\2/g' \
                -e 's/([[:space:]]|")gap-2([[:space:]]|")/\1gap-x-xs\2/g' \
                -e 's/([[:space:]]|")gap-3([[:space:]]|")/\1gap-x-sm\2/g' \
                -e 's/([[:space:]]|")gap-4([[:space:]]|")/\1gap-x-md\2/g' \
                -e 's/([[:space:]]|")gap-6([[:space:]]|")/\1gap-x-lg\2/g' \
                -e 's/([[:space:]]|")gap-8([[:space:]]|")/\1gap-x-xl\2/g' \
                "$file" > "$temp_file"
            
            mv "$temp_file" "$file"
            echo "  📝 Updated gaps in: $file"
        fi
    done
}

# Function to run post-migration validation
validate_migration() {
    log_info "Running post-migration validation..."
    
    # Count remaining violations
    REMAINING_VIOLATIONS=$(find . -name "*.tsx" -o -name "*.ts" | grep -v node_modules | grep -v .next | grep -v dist | xargs grep -l "className.*[pm]-[0-9]" | wc -l)
    
    if [ "$REMAINING_VIOLATIONS" -eq 0 ]; then
        log_success "✨ Migration completed successfully! No spacing violations found."
    else
        log_warning "Found $REMAINING_VIOLATIONS files with remaining violations. Manual review needed."
        
        echo ""
        echo "Files with remaining violations:"
        find . -name "*.tsx" -o -name "*.ts" | grep -v node_modules | grep -v .next | grep -v dist | xargs grep -l "className.*[pm]-[0-9]" | head -10
    fi
}

# Function to generate migration report
generate_report() {
    log_info "Generating migration report..."
    
    REPORT_FILE="./spacing-migration-report-$(date +%Y%m%d-%H%M%S).md"
    
    cat > "$REPORT_FILE" << EOF
# GHXSTSHIP Spacing Migration Report
Generated: $(date)

## Summary
- **Total files processed**: $TOTAL_FILES
- **Files modified**: $MODIFIED_FILES
- **Migration success rate**: $(( MODIFIED_FILES * 100 / TOTAL_FILES ))%

## Changes Applied
- ✅ Padding classes (p-1 → p-xs, p-4 → p-md, etc.)
- ✅ Directional padding (px-3 → px-sm, py-2 → py-xs, etc.)
- ✅ Margin classes (m-4 → m-md, mb-4 → mb-md, etc.)
- ✅ Directional margins (mx-4 → mx-md, my-2 → my-xs, etc.)
- ✅ Gap classes (gap-2 → gap-x-xs, gap-4 → gap-x-md, etc.)

## Design Token Mapping Applied
\`\`\`
Tailwind → Design Token
p-1, p-2 → p-xs (4px, 8px → 4px)
p-3 → p-sm (12px → 8px)
p-4 → p-md (16px)
p-6 → p-lg (24px)
p-8 → p-xl (32px)
p-12 → p-2xl (48px)
p-16 → p-3xl (64px)
\`\`\`

## Next Steps
1. Run \`npm run lint\` to check for any remaining issues
2. Run \`npm run build\` to ensure no build errors
3. Test application functionality
4. Review visual changes in development environment

## Backup Location
Backup created at: $BACKUP_DIR
EOF

    log_success "Migration report generated: $REPORT_FILE"
}

# Main execution
main() {
    echo ""
    log_info "GHXSTSHIP Spacing Migration Script v1.0"
    echo "This script will migrate hardcoded Tailwind spacing classes to semantic design tokens."
    echo ""
    
    # Confirmation prompt
    read -p "Do you want to proceed with the migration? (y/N): " -n 1 -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_warning "Migration cancelled by user."
        exit 0
    fi
    
    # Execute migration steps
    count_files
    create_backup
    
    echo ""
    log_info "Starting migration process..."
    echo ""
    
    migrate_padding
    migrate_directional_padding
    migrate_margins
    migrate_directional_margins
    migrate_gaps
    
    echo ""
    validate_migration
    generate_report
    
    echo ""
    echo "=================================================="
    log_success "🎉 GHXSTSHIP Spacing Migration Complete!"
    echo "=================================================="
    echo ""
    log_info "Next steps:"
    echo "  1. Review the migration report"
    echo "  2. Run 'npm run lint' to check for issues"
    echo "  3. Run 'npm run build' to verify build"
    echo "  4. Test your application"
    echo ""
    log_warning "If you encounter any issues, restore from backup: $BACKUP_DIR"
}

# Run the main function
main "$@"
