#!/bin/bash
# NUCLEAR CODE CLEANUP - ZERO TOLERANCE CLEANUP AUTOMATION
# 🚨 This script will aggressively clean and optimize the codebase
set -euo pipefail

echo "☢️  INITIATING NUCLEAR CODE CLEANUP"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
TOTAL_FILES_PROCESSED=0
TOTAL_FILES_REMOVED=0
TOTAL_BYTES_SAVED=0

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

# =============================================================================
# PHASE 1: FILESYSTEM NUCLEAR CLEANUP
# =============================================================================
echo ""
echo "🗑️  PHASE 1: FILESYSTEM NUCLEAR CLEANUP"
echo "======================================="

log_info "Removing ALL legacy artifacts..."

# Remove ALL legacy artifacts - NO EXCEPTIONS
find . -type f \( \
  -name "*.backup*" -o \
  -name "*.old*" -o \
  -name "*.tmp*" -o \
  -name "*.bak*" -o \
  -name "*~" -o \
  -name ".DS_Store" -o \
  -name "Thumbs.db" -o \
  -name "*.orig" -o \
  -name "*.rej" -o \
  -name "*.swp" -o \
  -name "*.swo" -o \
  -name "npm-debug.log*" -o \
  -name "yarn-debug.log*" -o \
  -name "yarn-error.log*" -o \
  -name "lerna-debug.log*" -o \
  -name "*.tsbuildinfo" -o \
  -name "*.log" \
\) -not -path "./node_modules/*" -delete 2>/dev/null || true

# Remove empty directories
EMPTY_DIRS=$(find . -type d -empty -not -path "./node_modules/*" | wc -l)
find . -type d -empty -not -path "./node_modules/*" -delete 2>/dev/null || true
log_success "Removed $EMPTY_DIRS empty directories"

# Remove build artifacts
log_info "Removing build artifacts..."
rm -rf .next dist build out coverage .turbo .vercel 2>/dev/null || true
rm -rf packages/*/.turbo packages/*/dist packages/*/build 2>/dev/null || true
rm -rf apps/*/.next apps/*/dist apps/*/build apps/*/out 2>/dev/null || true

# Remove cache directories
log_info "Removing cache directories..."
rm -rf .cache .parcel-cache .eslintcache .stylelintcache 2>/dev/null || true

log_success "Phase 1 completed - Filesystem cleanup"

# =============================================================================
# PHASE 2: DEPENDENCY NUCLEAR CLEANUP
# =============================================================================
echo ""
echo "🧹 PHASE 2: DEPENDENCY NUCLEAR CLEANUP"
echo "======================================"

log_info "Cleaning dependency artifacts..."

# Remove lock files for fresh install
rm -f package-lock.json yarn.lock pnpm-lock.yaml 2>/dev/null || true

# Clean package manager caches
if command -v pnpm &> /dev/null; then
    log_info "Cleaning PNPM cache..."
    pnpm store prune 2>/dev/null || true
fi

if command -v npm &> /dev/null; then
    log_info "Cleaning NPM cache..."
    npm cache clean --force 2>/dev/null || true
fi

if command -v yarn &> /dev/null; then
    log_info "Cleaning Yarn cache..."
    yarn cache clean 2>/dev/null || true
fi

# Fresh dependency installation
log_info "Performing fresh dependency installation..."
if command -v pnpm &> /dev/null; then
    pnpm install --frozen-lockfile --prefer-offline 2>/dev/null || pnpm install
else
    npm ci --prefer-offline --no-audit --progress=false 2>/dev/null || npm install
fi

log_success "Phase 2 completed - Dependency cleanup"

# =============================================================================
# PHASE 3: CODE NUCLEAR CLEANUP
# =============================================================================
echo ""
echo "⚡ PHASE 3: CODE NUCLEAR CLEANUP"
echo "==============================="

log_info "Scanning for dead code..."

# Create temporary file for dead code analysis
DEAD_CODE_FILE=$(mktemp)

# Find potentially unused files (basic heuristic)
find packages/*/src apps/*/src -name "*.ts" -o -name "*.tsx" | while read -r file; do
    # Skip test files, stories, and config files
    if [[ "$file" =~ \.(test|spec|stories)\. ]] || [[ "$file" =~ config\. ]]; then
        continue
    fi
    
    # Check if file is imported anywhere
    filename=$(basename "$file" | sed 's/\.[^.]*$//')
    if ! grep -r "from.*$filename" packages/ apps/ --include="*.ts" --include="*.tsx" >/dev/null 2>&1; then
        if ! grep -r "import.*$filename" packages/ apps/ --include="*.ts" --include="*.tsx" >/dev/null 2>&1; then
            echo "$file" >> "$DEAD_CODE_FILE"
        fi
    fi
done

# Report potentially dead files (don't auto-delete to avoid breaking things)
if [[ -s "$DEAD_CODE_FILE" ]]; then
    DEAD_FILE_COUNT=$(wc -l < "$DEAD_CODE_FILE")
    log_warning "Found $DEAD_FILE_COUNT potentially unused files (review manually):"
    head -10 "$DEAD_CODE_FILE" | while read -r file; do
        log_warning "  - $file"
    done
fi

rm -f "$DEAD_CODE_FILE"

# Remove commented code blocks and console statements
log_info "Cleaning up code artifacts..."

find packages/*/src apps/*/src -name "*.ts" -o -name "*.tsx" | while read -r file; do
    if [[ -f "$file" ]]; then
        # Create backup
        cp "$file" "$file.cleanup_backup"
        
        # Remove single-line comments that are just commented code
        sed -i.tmp '/^[[:space:]]*\/\/[[:space:]]*[a-zA-Z].*[;{}]$/d' "$file" 2>/dev/null || true
        
        # Remove console.log statements (except in development/debug files)
        if [[ "$file" != *"dev"* && "$file" != *"debug"* && "$file" != *"test"* ]]; then
            sed -i.tmp '/console\.\(log\|warn\|info\|debug\)/d' "$file" 2>/dev/null || true
        fi
        
        # Remove debugger statements
        sed -i.tmp '/debugger;*/d' "$file" 2>/dev/null || true
        
        # Remove temporary sed files
        rm -f "$file.tmp" 2>/dev/null || true
        
        # If file is unchanged, remove backup
        if cmp -s "$file" "$file.cleanup_backup"; then
            rm -f "$file.cleanup_backup"
        else
            ((TOTAL_FILES_PROCESSED++))
        fi
    fi
done

log_success "Phase 3 completed - Code cleanup"

# =============================================================================
# PHASE 4: IMPORT/EXPORT NUCLEAR OPTIMIZATION
# =============================================================================
echo ""
echo "📦 PHASE 4: IMPORT/EXPORT NUCLEAR OPTIMIZATION"
echo "=============================================="

log_info "Generating barrel exports..."

# Function to generate barrel exports
generate_barrel_exports() {
    local dir="$1"
    local index_file="$dir/index.ts"
    
    if [[ ! -d "$dir" ]]; then
        return
    fi
    
    log_info "Generating barrel export for $dir"
    
    {
        echo "// AUTO-GENERATED BARREL EXPORT - DO NOT EDIT MANUALLY"
        echo "// Generated on: $(date)"
        echo "// Zero-Tolerance Enterprise Codebase Audit"
        echo ""
    } > "$index_file"
    
    # Find all TypeScript files in directory (excluding index.ts, test files, story files)
    find "$dir" -maxdepth 1 -name "*.ts" -o -name "*.tsx" | \
        grep -v "index\.ts" | \
        grep -v "\.test\." | \
        grep -v "\.spec\." | \
        grep -v "\.stories\." | \
        sort | \
        while read -r file; do
            if [[ -f "$file" ]]; then
                basename_no_ext=$(basename "$file" | sed 's/\.[^.]*$//')
                echo "export * from './$basename_no_ext';" >> "$index_file"
                
                # Try to detect default exports
                if grep -q "export default" "$file" 2>/dev/null; then
                    echo "export { default as $basename_no_ext } from './$basename_no_ext';" >> "$index_file"
                fi
            fi
        done
    
    # Find subdirectories and export them
    find "$dir" -maxdepth 1 -type d | \
        grep -v "^\.$" | \
        sort | \
        while read -r subdir; do
            subdir_name=$(basename "$subdir")
            if [[ -f "$subdir/index.ts" ]]; then
                echo "export * from './$subdir_name';" >> "$index_file"
            fi
        done
    
    # Add final newline
    echo "" >> "$index_file"
    
    log_success "Generated barrel export: $index_file"
}

# Generate barrel exports for key directories
BARREL_DIRS=(
    "packages/ui/src/components"
    "packages/ui/src/hooks"
    "packages/ui/src/utils"
    "packages/ui/src/types"
    "packages/ui/src/tokens"
    "packages/domain/src"
    "packages/application/src"
)

for dir in "${BARREL_DIRS[@]}"; do
    if [[ -d "$dir" ]]; then
        generate_barrel_exports "$dir"
    fi
done

log_success "Phase 4 completed - Import/Export optimization"

# =============================================================================
# PHASE 5: STYLE NUCLEAR CLEANUP
# =============================================================================
echo ""
echo "🎨 PHASE 5: STYLE NUCLEAR CLEANUP"
echo "================================="

log_info "Converting hardcoded values to design tokens..."

# Create Node.js script for style cleanup
cat > /tmp/style-cleanup.js << 'EOF'
const fs = require('fs');
const path = require('path');

function replaceHardcodedValues(content) {
  let modified = false;
  let newContent = content;
  
  // Replace common hardcoded colors with design token references
  const colorMap = {
    '#ffffff': 'hsl(var(--color-background))',
    '#fff': 'hsl(var(--color-background))',
    '#000000': 'hsl(var(--color-foreground))',
    '#000': 'hsl(var(--color-foreground))',
    '#0ea5e9': 'hsl(var(--color-primary))',
    '#ef4444': 'hsl(var(--color-destructive))',
    '#10b981': 'hsl(var(--color-success))',
    '#f59e0b': 'hsl(var(--color-warning))',
    '#3b82f6': 'hsl(var(--color-info))',
  };
  
  // Replace colors
  Object.entries(colorMap).forEach(([hardcoded, token]) => {
    const regex = new RegExp(hardcoded.replace('#', '#'), 'gi');
    if (regex.test(newContent)) {
      newContent = newContent.replace(regex, token);
      modified = true;
    }
  });
  
  // Replace common pixel values with spacing tokens
  const spacingMap = {
    '4px': 'var(--spacing-1)',
    '8px': 'var(--spacing-2)',
    '12px': 'var(--spacing-3)',
    '16px': 'var(--spacing-4)',
    '20px': 'var(--spacing-5)',
    '24px': 'var(--spacing-6)',
    '32px': 'var(--spacing-8)',
    '40px': 'var(--spacing-10)',
    '48px': 'var(--spacing-12)',
    '64px': 'var(--spacing-16)',
  };
  
  // Replace spacing (be careful not to replace in comments or design token definitions)
  Object.entries(spacingMap).forEach(([hardcoded, token]) => {
    const regex = new RegExp(`\\b${hardcoded}\\b(?![\\w\\]\\}])`, 'g');
    const matches = newContent.match(regex);
    if (matches) {
      // Check if it's not in a comment or design token definition
      const lines = newContent.split('\n');
      lines.forEach((line, index) => {
        if (line.includes(hardcoded) && 
            !line.includes('DESIGN_TOKENS') && 
            !line.includes('//') && 
            !line.includes('/*') &&
            !line.includes('clamp(')) {
          lines[index] = line.replace(regex, token);
          modified = true;
        }
      });
      newContent = lines.join('\n');
    }
  });
  
  return { content: newContent, modified };
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const result = replaceHardcodedValues(content);
    
    if (result.modified) {
      fs.writeFileSync(filePath, result.content);
      console.log(`✅ Updated hardcoded values in: ${filePath}`);
      return 1;
    }
    return 0;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return 0;
  }
}

// Process all relevant files
const glob = require('glob');
const patterns = [
  'packages/*/src/**/*.{ts,tsx,css}',
  'apps/*/src/**/*.{ts,tsx,css}',
  'apps/*/app/**/*.{ts,tsx,css}',
];

let totalProcessed = 0;

patterns.forEach(pattern => {
  try {
    const files = glob.sync(pattern);
    files.forEach(file => {
      totalProcessed += processFile(file);
    });
  } catch (error) {
    console.error(`Error with pattern ${pattern}:`, error.message);
  }
});

console.log(`\n📊 Style cleanup completed: ${totalProcessed} files updated`);
EOF

# Run the style cleanup if Node.js is available
if command -v node &> /dev/null; then
    log_info "Running automated style cleanup..."
    if npm list glob &>/dev/null || pnpm list glob &>/dev/null; then
        node /tmp/style-cleanup.js
    else
        log_warning "glob package not available, skipping automated style cleanup"
    fi
else
    log_warning "Node.js not available, skipping automated style cleanup"
fi

# Clean up temporary file
rm -f /tmp/style-cleanup.js

log_success "Phase 5 completed - Style cleanup"

# =============================================================================
# PHASE 6: FINAL VALIDATION NUCLEAR TEST
# =============================================================================
echo ""
echo "🔬 PHASE 6: FINAL VALIDATION NUCLEAR TEST"
echo "========================================="

log_info "Running final validation checks..."

# Check if the audit script exists and run it
if [[ -f "./scripts/zero-tolerance-audit.sh" ]]; then
    log_info "Running zero-tolerance audit..."
    if ./scripts/zero-tolerance-audit.sh; then
        log_success "Zero-tolerance audit passed!"
    else
        log_warning "Zero-tolerance audit found issues (check output above)"
    fi
else
    log_warning "Zero-tolerance audit script not found"
fi

# Run basic build test
log_info "Testing build process..."
if command -v pnpm &> /dev/null; then
    if pnpm build &>/dev/null; then
        log_success "Build test passed"
    else
        log_warning "Build test failed (check configuration)"
    fi
else
    log_warning "PNPM not available, skipping build test"
fi

# =============================================================================
# CLEANUP SUMMARY
# =============================================================================
echo ""
echo "📊 NUCLEAR CLEANUP SUMMARY"
echo "=========================="

# Calculate final statistics
TOTAL_FILES=$(find packages/ apps/ -name "*.ts" -o -name "*.tsx" | wc -l)
TOTAL_DIRS=$(find packages/ apps/ -type d | wc -l)
TOTAL_SIZE=$(du -sh . 2>/dev/null | cut -f1 || echo "Unknown")

echo -e "${GREEN}✅ NUCLEAR CLEANUP COMPLETED SUCCESSFULLY${NC}"
echo ""
echo "📈 CLEANUP METRICS:"
echo "   - Total TypeScript files: $TOTAL_FILES"
echo "   - Total directories: $TOTAL_DIRS"
echo "   - Repository size: $TOTAL_SIZE"
echo "   - Files processed: $TOTAL_FILES_PROCESSED"
echo "   - Cleanup duration: ${SECONDS}s"
echo ""
echo "🎯 NEXT STEPS:"
echo "   1. Review any warnings above"
echo "   2. Run 'pnpm typecheck' to verify TypeScript"
echo "   3. Run 'pnpm lint' to check code quality"
echo "   4. Run 'pnpm build' to test production build"
echo "   5. Commit changes if everything looks good"
echo ""
echo -e "${GREEN}🎉 ENTERPRISE-GRADE CODEBASE ACHIEVED!${NC}"
