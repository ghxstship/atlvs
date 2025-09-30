#!/bin/bash
# ZERO-TOLERANCE ENTERPRISE CODEBASE AUDIT & UI/UX NORMALIZATION PROTOCOL
# 🚨 MANDATORY EXECUTION ORDER - NO EXCEPTIONS
set -euo pipefail

echo "🚨 INITIATING ZERO-TOLERANCE ENTERPRISE CODEBASE AUDIT"
echo "======================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
TOTAL_ERRORS=0
TOTAL_WARNINGS=0
PHASE_ERRORS=0

# Helper functions
log_error() {
    echo -e "${RED}❌ ERROR: $1${NC}"
    ((TOTAL_ERRORS++))
    ((PHASE_ERRORS++))
}

log_warning() {
    echo -e "${YELLOW}⚠️  WARNING: $1${NC}"
    ((TOTAL_WARNINGS++))
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

check_phase_success() {
    if [[ $PHASE_ERRORS -gt 0 ]]; then
        log_error "Phase failed with $PHASE_ERRORS errors. Terminating audit."
        exit 1
    fi
    PHASE_ERRORS=0
}

# =============================================================================
# PHASE 0: ENVIRONMENT LOCKDOWN & BASELINE ESTABLISHMENT
# =============================================================================
echo ""
echo "🔒 PHASE 0: ENVIRONMENT LOCKDOWN & BASELINE ESTABLISHMENT"
echo "========================================================="

# 0.1 Environment Hardening
log_info "Checking Node.js version..."
NODE_VERSION=$(node --version)
if [[ ! "$NODE_VERSION" =~ ^v(18|20|22)\. ]]; then
    log_error "Invalid Node.js version: $NODE_VERSION (Required: v18.x, v20.x, or v22.x)"
else
    log_success "Node.js version: $NODE_VERSION"
fi

log_info "Checking package manager..."
if command -v pnpm &> /dev/null; then
    PNPM_VERSION=$(pnpm --version)
    log_success "PNPM version: $PNPM_VERSION"
else
    log_error "PNPM not found. This project requires PNPM."
fi

# 0.2 Pre-Audit File System Validation
log_info "Scanning for legacy files..."
LEGACY_FILES=$(find . -type f \( \
    -name "*.backup" -o \
    -name "*.old" -o \
    -name "*.tmp" -o \
    -name "*.bak" -o \
    -name "*~" -o \
    -name ".DS_Store" -o \
    -name "Thumbs.db" \
\) -not -path "./node_modules/*" | wc -l)

if [[ $LEGACY_FILES -gt 0 ]]; then
    log_warning "Found $LEGACY_FILES legacy files (will be cleaned up)"
else
    log_success "No legacy files found"
fi

# Check for hidden configuration conflicts
log_info "Checking for configuration conflicts..."
HIDDEN_CONFIGS=$(find . -maxdepth 2 -name ".*rc*" -o -name ".*config*" | grep -v node_modules | wc -l)
log_info "Found $HIDDEN_CONFIGS configuration files"

check_phase_success

# =============================================================================
# PHASE 1: ZERO-TOLERANCE STATIC ANALYSIS
# =============================================================================
echo ""
echo " PHASE 1: ZERO-TOLERANCE STATIC ANALYSIS"
echo "=========================================="

# 1.1 Dependency Fortress
log_info "Running security audit..."
if pnpm audit --audit-level=critical --json > audit-critical.json 2>/dev/null; then
    CRITICAL_VULNS=$(jq -r '.advisories | length' audit-critical.json 2>/dev/null || echo "0")
    if [[ $CRITICAL_VULNS -gt 0 ]]; then
        log_error "Found $CRITICAL_VULNS critical vulnerabilities"
    else
        log_success "No critical vulnerabilities found"
    fi
else
    log_warning "Security audit failed or no vulnerabilities found"
fi

if pnpm audit --audit-level=high --json > audit-high.json 2>/dev/null; then
    HIGH_VULNS=$(jq -r '.advisories | length' audit-high.json 2>/dev/null || echo "0")
    if [[ $HIGH_VULNS -gt 0 ]]; then
        log_error "Found $HIGH_VULNS high-severity vulnerabilities"
    else
        log_success "No high-severity vulnerabilities found"
    fi
else
    log_warning "High-severity audit failed or no vulnerabilities found"
fi

# 1.2 TypeScript Strictness Check
log_info "Checking TypeScript configuration..."
if [[ -f "tsconfig.json" ]]; then
    STRICT_MODE=$(jq -r '.compilerOptions.strict' tsconfig.json 2>/dev/null || echo "false")
    if [[ "$STRICT_MODE" == "true" ]]; then
        log_success "TypeScript strict mode enabled"
    else
        log_error "TypeScript strict mode not enabled"
    fi
    
    # Check for additional strict options
    EXACT_OPTIONAL=$(jq -r '.compilerOptions.exactOptionalPropertyTypes' tsconfig.json 2>/dev/null || echo "null")
    NO_IMPLICIT_ANY=$(jq -r '.compilerOptions.noImplicitAny' tsconfig.json 2>/dev/null || echo "null")
    
    if [[ "$EXACT_OPTIONAL" != "true" ]]; then
        log_warning "exactOptionalPropertyTypes not enabled (recommended for zero-tolerance)"
    fi
    
    if [[ "$NO_IMPLICIT_ANY" != "true" ]]; then
        log_warning "noImplicitAny not explicitly enabled"
    fi
else
    log_error "tsconfig.json not found"
fi

# 1.3 ESLint Configuration Check
log_info "Checking ESLint configuration..."
if [[ -f "eslint.config.mjs" ]]; then
    # Check if ESLint is properly configured (not just ignoring everything)
    IGNORES_ALL=$(grep -c '"**/*"' eslint.config.mjs || echo "0")
    if [[ $IGNORES_ALL -gt 0 ]]; then
        log_error "ESLint is configured to ignore all files - zero-tolerance requires active linting"
    else
        log_success "ESLint configuration found"
    fi
else
    log_error "ESLint configuration not found"
fi

# 1.4 ESLint Zero-Tolerance Run
log_info "Running ESLint (zero tolerance)..."
if command -v pnpm &> /dev/null; then
    pnpm lint --format json --output-file eslint-results.json || true
else
    npx eslint . --ext .ts,.tsx --format json -o eslint-results.json || true
fi

if command -v jq &> /dev/null; then
    ESLINT_ERRORS=$(jq '[.[] | select(.errorCount > 0) | .errorCount] | add // 0' eslint-results.json 2>/dev/null || echo "0")
    ESLINT_WARNINGS=$(jq '[.[] | select(.warningCount > 0) | .warningCount] | add // 0' eslint-results.json 2>/dev/null || echo "0")
    if [[ ${ESLINT_ERRORS} -gt 0 ]]; then
        log_error "ESLint reported ${ESLINT_ERRORS} errors"
    fi
    if [[ ${ESLINT_WARNINGS} -gt 0 ]]; then
        log_error "ESLint reported ${ESLINT_WARNINGS} warnings (zero-tolerance prohibits warnings)"
    fi
    if [[ ${ESLINT_ERRORS} -eq 0 && ${ESLINT_WARNINGS} -eq 0 ]]; then
        log_success "ESLint validation passed (0 errors, 0 warnings)"
    fi
else
    log_warning "jq not found; falling back to ESLint exit code"
    if ! pnpm lint; then
        log_error "ESLint failed; cannot enforce zero warnings without jq"
    else
        log_success "ESLint completed"
    fi
fi

check_phase_success

# =============================================================================
# PHASE 2: UI/UX ABSOLUTE NORMALIZATION
# =============================================================================
echo ""
echo " PHASE 2: UI/UX ABSOLUTE NORMALIZATION"
echo "========================================"

# 2.1 Design Token Validation
log_info "Ensuring unified design tokens exist..."
if [[ -f "packages/ui/src/tokens/unified-design-tokens.ts" ]]; then
    log_success "Unified design tokens present"
else
    log_error "Unified design tokens missing at packages/ui/src/tokens/unified-design-tokens.ts"
fi

log_info "Scanning for hardcoded values..."

# Check for hardcoded colors
HARDCODED_COLORS=$(find . -name "*.tsx" -o -name "*.ts" -o -name "*.css" | \
    grep -v node_modules | \
    xargs grep -l "#[0-9a-fA-F]\{3,6\}" 2>/dev/null | wc -l || echo "0")

if [[ $HARDCODED_COLORS -gt 0 ]]; then
    log_error "Found hardcoded colors in $HARDCODED_COLORS files"
else
    log_success "No hardcoded colors detected"
fi

# Check for hardcoded pixel values
HARDCODED_PIXELS=$(find . -name "*.tsx" -o -name "*.ts" -o -name "*.css" | \
    grep -v node_modules | \
    xargs grep -l "[0-9]\+px" 2>/dev/null | wc -l || echo "0")

if [[ $HARDCODED_PIXELS -gt 0 ]]; then
    log_warning "Found hardcoded pixel values in $HARDCODED_PIXELS files"
else
    log_success "No hardcoded pixel values detected"
fi

# Check for styled-components usage (forbidden by zero-tolerance)
SC_STYLED=$(grep -R "styled-components" packages/ apps/ --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l || echo "0")
if [[ $SC_STYLED -gt 0 ]]; then
    log_error "Found styled-components imports ($SC_STYLED occurrences) - use Tailwind/design tokens instead"
else
    log_success "No styled-components imports detected"
fi

# Check for legacy import paths
LEGACY_IMPORTS=$(grep -R "@ghxstship/ui/legacy" packages/ apps/ --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l || echo "0")
if [[ $LEGACY_IMPORTS -gt 0 ]]; then
    log_error "Found legacy UI import paths ($LEGACY_IMPORTS occurrences)"
else
    log_success "No legacy UI import paths detected"
fi

# 2.2 Component Architecture Standards
log_info "Checking component structure..."

# Check for components directory
if [[ -d "packages/ui/src/components" ]]; then
    log_success "UI components directory found"
    
    # Count components
    COMPONENT_COUNT=$(find packages/ui/src/components -name "*.tsx" | wc -l)
    log_info "Found $COMPONENT_COUNT component files"
    
    # Check for index files (barrel exports)
    INDEX_FILES=$(find packages/ui/src -name "index.ts" -o -name "index.tsx" | wc -l)
    log_info "Found $INDEX_FILES barrel export files"
    
else
    log_error "UI components directory not found"
fi

check_phase_success

# =============================================================================
# PHASE 3: ZERO-EXCEPTION BUILD VALIDATION
# =============================================================================
echo ""
echo " PHASE 3: ZERO-EXCEPTION BUILD VALIDATION"
echo "==========================================="

# 3.1 TypeScript Compilation
log_info "Running TypeScript compilation check..."
if pnpm typecheck > typecheck.log 2>&1; then
    log_success "TypeScript compilation passed"
else
    TS_ERRORS=$(grep -c "error TS" typecheck.log 2>/dev/null || echo "0")
    if [[ $TS_ERRORS -gt 0 ]]; then
        log_error "TypeScript compilation failed with $TS_ERRORS errors"
        log_info "Check typecheck.log for details"
    else
        log_warning "TypeScript check completed with warnings"
    fi
fi

# 3.2 Build Test (fail on warnings and errors)
log_info "Testing production build..."
rm -rf .next dist build out 2>/dev/null || true
pnpm build 2>&1 | tee build.log || true
BUILD_ERRORS=$(grep -i -c "error\|failed" build.log 2>/dev/null || echo "0")
BUILD_WARNINGS=$(grep -i -c "warning\|warn" build.log 2>/dev/null || echo "0")
if [[ $BUILD_ERRORS -gt 0 ]]; then
    log_error "Production build failed with $BUILD_ERRORS errors"
    log_info "Check build.log for details"
fi
if [[ $BUILD_WARNINGS -gt 0 ]]; then
    log_error "Production build contains $BUILD_WARNINGS warnings (zero-tolerance prohibits warnings)"
    log_info "Check build.log for details"
fi
if [[ $BUILD_ERRORS -eq 0 && $BUILD_WARNINGS -eq 0 ]]; then
    log_success "Production build completed with zero warnings/errors"
fi

# 3.3 Bundle Size Validation (1MB limit)
log_info "Validating bundle size..."
BUNDLE_SIZE=0
if [[ -d ".next" ]]; then
    if [[ "$(uname)" == "Darwin" ]]; then
        BUNDLE_SIZE=$(find .next -name "*.js" -exec stat -f%z {} \; 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
    else
        BUNDLE_SIZE=$(find .next -name "*.js" -exec stat -c%s {} \; 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
    fi
elif [[ -d "dist" ]]; then
    if [[ "$(uname)" == "Darwin" ]]; then
        BUNDLE_SIZE=$(find dist -name "*.js" -exec stat -f%z {} \; 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
    else
        BUNDLE_SIZE=$(find dist -name "*.js" -exec stat -c%s {} \; 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
    fi
fi
MAX_SIZE=$((1024*1024))
if [[ ${BUNDLE_SIZE:-0} -gt ${MAX_SIZE} ]]; then
    log_error "Bundle size ${BUNDLE_SIZE} bytes exceeds limit ${MAX_SIZE} bytes"
else
    log_success "Bundle size OK: ${BUNDLE_SIZE} bytes"
fi

# 3.4 Test Coverage Gate (100% REQUIRED)
log_info "Running test coverage gate (100% required)..."
if pnpm run --if-present test:coverage-100 > coverage.log 2>&1; then
    log_success "Test coverage gate passed (100% required)"
else
    log_error "Coverage gate failed or missing (100% required). Implement test:coverage-100."
    log_info "Check coverage.log for details"
fi

check_phase_success

# =============================================================================
# PHASE 4: FILE STRUCTURE ENFORCEMENT
# =============================================================================
echo ""
echo "📁 PHASE 4: FILE STRUCTURE ENFORCEMENT"
echo "======================================"

# 4.1 Directory Structure Validation
log_info "Validating directory structure..."

REQUIRED_DIRS=(
    "packages/ui/src/components"
    "packages/domain/src"
    "packages/application/src"
    "apps/web/app"
)

for dir in "${REQUIRED_DIRS[@]}"; do
    if [[ -d "$dir" ]]; then
        log_success "Required directory exists: $dir"
    else
        log_error "Missing required directory: $dir"
    fi
done

# 4.2 File Naming Validation
log_info "Checking file naming conventions..."

# Check for PascalCase components
INVALID_COMPONENTS=$(find packages/ui/src/components -name "*.tsx" | \
    grep -v "index.tsx" | \
    grep -E "/[a-z]" | wc -l || echo "0")

if [[ $INVALID_COMPONENTS -gt 0 ]]; then
    log_error "Found $INVALID_COMPONENTS components not following PascalCase naming"
else
    log_success "All components follow PascalCase naming"
fi

check_phase_success

# =============================================================================
# FINAL VALIDATION SUMMARY
# =============================================================================
echo ""
echo "📊 AUDIT SUMMARY"
echo "================"
echo -e "Total Errors: ${RED}$TOTAL_ERRORS${NC}"
echo -e "Total Warnings: ${YELLOW}$TOTAL_WARNINGS${NC}"

if [[ $TOTAL_ERRORS -eq 0 ]]; then
    echo ""
    log_success "🎉 ZERO-TOLERANCE AUDIT COMPLETED SUCCESSFULLY!"
    echo -e "${GREEN}✅ ENTERPRISE-GRADE CODEBASE ACHIEVED!${NC}"
    exit 0
else
    echo ""
    log_error "❌ AUDIT FAILED - $TOTAL_ERRORS CRITICAL ISSUES MUST BE RESOLVED"
    exit 1
fi
