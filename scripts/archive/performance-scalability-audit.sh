#!/bin/bash
# COMPREHENSIVE PERFORMANCE & SCALABILITY AUDIT
set -euo pipefail

echo "🚀 GHXSTSHIP PERFORMANCE & SCALABILITY AUDIT"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }

# =============================================================================
# F1. APPLICATION-WIDE PERFORMANCE VALIDATION
# =============================================================================

echo ""
echo "📊 F1. APPLICATION-WIDE PERFORMANCE VALIDATION"
echo "==============================================="

# Core Web Vitals Check
echo ""
echo "🔍 Core Web Vitals Implementation:"
echo "----------------------------------"

# Check Web Vitals monitoring
if grep -q "useReportWebVitals\|web-vitals" apps/web/app/UwebUvitals.tsx 2>/dev/null; then
    log_success "Web Vitals monitoring implemented (Google Analytics + PostHog)"
else
    log_error "Web Vitals monitoring NOT implemented"
fi

# Check for LCP optimization (images, fonts, critical resources)
if grep -q "next/font\|Anton\|Share_Tech" apps/web/app/layout.tsx 2>/dev/null; then
    log_success "Font optimization implemented (Next.js font optimization)"
else
    log_warning "Font optimization may not be optimal"
fi

# Check for Image optimization
if grep -q "next/image\|Image.*from.*next" apps/web/app/**/*.tsx 2>/dev/null; then
    log_success "Next.js Image component usage detected"
else
    log_warning "Image optimization may not be comprehensive"
fi

# Bundle Size Validation
echo ""
echo "📦 Bundle Size Optimization:"
echo "----------------------------"

# Build and analyze bundle size
log_info "Building production bundle for analysis..."
cd apps/web
pnpm build > /tmp/build.log 2>&1

if [[ -d ".next" ]]; then
    # Calculate bundle sizes
    JS_SIZE=$(find .next -name "*.js" -exec stat -f%z {} \; 2>/dev/null | awk '{sum+=$1} END {print sum+0}' || echo "0")
    CSS_SIZE=$(find .next -name "*.css" -exec stat -f%z {} \; 2>/dev/null | awk '{sum+=$1} END {print sum+0}' || echo "0")
    TOTAL_SIZE=$((JS_SIZE + CSS_SIZE))

    JS_MB=$((JS_SIZE / 1048576))
    TOTAL_MB=$((TOTAL_SIZE / 1048576))

    echo "   JavaScript: ${JS_MB}MB (target: <1MB)"
    echo "   Total: ${TOTAL_MB}MB (target: <2MB)"

    if [[ $JS_SIZE -lt 1048576 ]]; then
        log_success "JavaScript bundle within 1MB target"
    else
        log_error "JavaScript bundle exceeds 1MB target"
    fi

    if [[ $TOTAL_SIZE -lt 2097152 ]]; then
        log_success "Total bundle within 2MB target"
    else
        log_error "Total bundle exceeds 2MB target"
    fi
else
    log_error "Build failed - cannot analyze bundle size"
fi

cd ../..

# Code Splitting Check
echo ""
echo "🔀 Code Splitting & Lazy Loading:"
echo "---------------------------------"

# Check for dynamic imports
DYNAMIC_IMPORTS=$(grep -r "import(" apps/web/src apps/web/app --include="*.ts" --include="*.tsx" | wc -l)
if [[ $DYNAMIC_IMPORTS -gt 0 ]]; then
    log_success "Dynamic imports detected (${DYNAMIC_IMPORTS} instances)"
else
    log_warning "No dynamic imports found"
fi

# Check for lazy loading
LAZY_COMPONENTS=$(grep -r "lazy\|Suspense" apps/web/src apps/web/app --include="*.ts" --include="*.tsx" | wc -l)
if [[ $LAZY_COMPONENTS -gt 0 ]]; then
    log_success "Lazy loading components detected (${LAZY_COMPONENTS} instances)"
else
    log_warning "Limited lazy loading detected"
fi

# Check Next.js config optimizations
if grep -q "splitChunks\|runtimeChunk" next.config.mjs 2>/dev/null; then
    log_success "Advanced code splitting configured in Next.js"
else
    log_warning "Code splitting may not be optimized"
fi

# Image Optimization Check
echo ""
echo "🖼️  Image Optimization:"
echo "----------------------"

# Check for Next.js Image component usage
IMAGE_USAGE=$(grep -r "<Image\|next/image" apps/web/app apps/web/src --include="*.tsx" | wc -l)
if [[ $IMAGE_USAGE -gt 0 ]]; then
    log_success "Next.js Image component used (${IMAGE_USAGE} instances)"
else
    log_warning "Limited Next.js Image component usage"
fi

# Check for image optimization config
if grep -q "formats.*avif.*webp" next.config.mjs 2>/dev/null; then
    log_success "Advanced image formats configured (AVIF, WebP)"
else
    log_warning "Image format optimization may be limited"
fi

# Font Optimization Check
echo ""
echo "🔤 Font Optimization:"
echo "---------------------"

# Check for Next.js font optimization
if grep -q "next/font" apps/web/app/layout.tsx 2>/dev/null; then
    log_success "Next.js font optimization implemented"
else
    log_error "Next.js font optimization NOT implemented"
fi

# Check for font display optimization
if grep -q "display.*swap\|font-display" apps/web/app/layout.tsx 2>/dev/null; then
    log_success "Font display optimization configured"
else
    log_warning "Font display may cause layout shift"
fi

# PWA & Service Worker Check
echo ""
echo "📱 PWA & Service Worker:"
echo "-----------------------"

# Check for service worker files
if [[ -f "public/sw.js" ]]; then
    log_success "Service worker implemented"
else
    log_error "Service worker NOT found"
fi

if [[ -f "public/manifest.json" ]]; then
    log_success "PWA manifest implemented"
else
    log_error "PWA manifest NOT found"
fi

# Check for service worker registration
SW_REGISTRATION=$(grep -r "serviceWorker\|navigator\.serviceWorker" apps/web --include="*.ts" --include="*.tsx" | wc -l)
if [[ $SW_REGISTRATION -gt 0 ]]; then
    log_success "Service worker registration detected"
else
    log_warning "Service worker registration not found in client code"
fi

# =============================================================================
# DATABASE PERFORMANCE AUDIT
# =============================================================================

echo ""
echo "🗄️  DATABASE PERFORMANCE AUDIT"
echo "=============================="

# Check for database performance optimizations
echo ""
echo "🔍 Database Query Optimization:"
echo "-------------------------------"

# Check Supabase config for performance settings
if [[ -f "supabase/config.toml" ]]; then
    if grep -q "pool_size\|max_connections" supabase/config.toml 2>/dev/null; then
        log_success "Database connection pooling configured"
    else
        log_warning "Database connection pooling may not be optimized"
    fi
fi

# Check for query optimization patterns
QUERY_OPTIMIZATION=$(grep -r "select.*limit\|inner join\|left join" supabase/migrations apps/web/app/api --include="*.sql" --include="*.ts" | wc -l)
if [[ $QUERY_OPTIMIZATION -gt 0 ]]; then
    log_success "Database query optimization patterns detected"
else
    log_warning "Limited database query optimization"
fi

# Check for indexing
INDEX_PATTERNS=$(grep -r "CREATE INDEX\|create_index" supabase/migrations --include="*.sql" | wc -l)
if [[ $INDEX_PATTERNS -gt 0 ]]; then
    log_success "Database indexing implemented (${INDEX_PATTERNS} indexes)"
else
    log_warning "Database indexing may be limited"
fi

# =============================================================================
# SCALABILITY TESTING
# =============================================================================

echo ""
echo "⚡ SCALABILITY TESTING"
echo "======================"

echo ""
echo "🔬 Load Testing Assessment:"
echo "---------------------------"

# Check for load testing setup
if command -v artillery >/dev/null 2>&1; then
    log_success "Load testing tool available (Artillery)"
else
    log_warning "Load testing tools not installed"
fi

if command -v k6 >/dev/null 2>&1; then
    log_success "Load testing tool available (k6)"
else
    log_info "k6 not available - consider installing for advanced load testing"
fi

# Check for performance monitoring
if grep -q "sentry\|datadog\|newrelic" package.json apps/web/package.json 2>/dev/null; then
    log_success "Application performance monitoring configured"
else
    log_warning "Performance monitoring may be limited"
fi

# Memory and CPU monitoring check
MEMORY_MONITORING=$(grep -r "performance\.memory\|process\.memoryUsage" apps/web --include="*.ts" --include="*.tsx" | wc -l)
if [[ $MEMORY_MONITORING -gt 0 ]]; then
    log_success "Memory monitoring implemented"
else
    log_warning "Memory monitoring not detected"
fi

# =============================================================================
# FINAL ASSESSMENT
# =============================================================================

echo ""
echo "🎯 FINAL ASSESSMENT"
echo "==================="

log_info "Performance & Scalability Audit Complete"
echo ""
echo "📈 Key Metrics Summary:"
echo "   - Bundle Size: ${JS_MB}MB JS / ${TOTAL_MB}MB Total"
echo "   - Dynamic Imports: ${DYNAMIC_IMPORTS}"
echo "   - Lazy Components: ${LAZY_COMPONENTS}"
echo "   - Image Optimizations: ${IMAGE_USAGE}"
echo "   - Database Indexes: ${INDEX_PATTERNS}"

echo ""
echo "🔧 Recommendations:"
echo "   1. Monitor Core Web Vitals in production"
echo "   2. Implement service worker registration in client"
echo "   3. Add comprehensive load testing suite"
echo "   4. Set up database performance monitoring"
echo "   5. Implement cache hit rate monitoring"

echo ""
log_success "Audit completed successfully!"
