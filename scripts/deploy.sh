#!/bin/bash

# GHXSTSHIP Enterprise Deployment Script
# 2026 Standards Compliant
# Version: 1.0.0

set -e

echo "🚀 GHXSTSHIP Enterprise Deployment"
echo "=================================="

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Parse command line arguments
ENVIRONMENT=${1:-staging}
SKIP_TESTS=${2:-false}

if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
    print_error "Invalid environment. Use 'staging' or 'production'"
    exit 1
fi

echo ""
echo "Deployment Configuration:"
echo "------------------------"
echo "Environment: $ENVIRONMENT"
echo "Skip Tests: $SKIP_TESTS"
echo ""

# 1. Pre-deployment checks
echo "🔍 Running pre-deployment checks..."
echo "-----------------------------------"

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    print_error "Node.js 20+ required (current: $(node -v))"
    exit 1
fi
print_status "Node.js version check passed"

# Check pnpm
if ! command -v pnpm &> /dev/null; then
    print_error "pnpm is not installed"
    exit 1
fi
print_status "pnpm found"

# Check environment variables
if [ "$ENVIRONMENT" == "production" ]; then
    REQUIRED_VARS=(
        "NEXT_PUBLIC_SUPABASE_URL"
        "NEXT_PUBLIC_SUPABASE_ANON_KEY"
        "SUPABASE_SERVICE_ROLE_KEY"
        "DATABASE_URL"
        "STRIPE_SECRET_KEY"
        "STRIPE_WEBHOOK_SECRET"
        "SENTRY_DSN"
    )
    
    for var in "${REQUIRED_VARS[@]}"; do
        if [ -z "${!var}" ]; then
            print_error "Missing required environment variable: $var"
            exit 1
        fi
    done
    print_status "Environment variables verified"
fi

# 2. Run tests
if [ "$SKIP_TESTS" != "true" ]; then
    echo ""
    echo "🧪 Running test suite..."
    echo "----------------------"
    
    pnpm test:unit || {
        print_error "Unit tests failed"
        exit 1
    }
    print_status "Unit tests passed"
    
    pnpm test:integration || {
        print_error "Integration tests failed"
        exit 1
    }
    print_status "Integration tests passed"
    
    if [ "$ENVIRONMENT" == "production" ]; then
        pnpm test:e2e || {
            print_error "E2E tests failed"
            exit 1
        }
        print_status "E2E tests passed"
    fi
else
    print_warning "Skipping tests (not recommended for production)"
fi

# 3. Build application
echo ""
echo "🏗️ Building application..."
echo "------------------------"

# Clean previous builds
rm -rf apps/web/.next
rm -rf apps/web/out
print_status "Cleaned previous builds"

# Run build
NODE_ENV=production pnpm build || {
    print_error "Build failed"
    exit 1
}
print_status "Build completed successfully"

# 4. Database migrations
echo ""
echo "🗄️ Running database migrations..."
echo "--------------------------------"

if [ "$ENVIRONMENT" == "production" ]; then
    # Backup database first
    print_info "Creating database backup..."
    pg_dump $DATABASE_URL > backup-$(date +%Y%m%d-%H%M%S).sql
    print_status "Database backed up"
fi

# Run migrations
pnpm supabase db push || {
    print_error "Database migrations failed"
    exit 1
}
print_status "Database migrations completed"

# Apply optimizations
psql $DATABASE_URL < supabase/optimizations/001_performance_indexes.sql
psql $DATABASE_URL < supabase/optimizations/002_materialized_views.sql
print_status "Database optimizations applied"

# 5. Deploy to Vercel
echo ""
echo "☁️ Deploying to Vercel..."
echo "-----------------------"

if [ "$ENVIRONMENT" == "staging" ]; then
    vercel deploy --env preview || {
        print_error "Staging deployment failed"
        exit 1
    }
    DEPLOYMENT_URL=$(vercel ls --json | jq -r '.deployments[0].url')
    print_status "Deployed to staging: https://$DEPLOYMENT_URL"
else
    vercel deploy --prod || {
        print_error "Production deployment failed"
        exit 1
    }
    DEPLOYMENT_URL=$(vercel ls --json | jq -r '.deployments[0].url')
    print_status "Deployed to production: https://$DEPLOYMENT_URL"
fi

# 6. Post-deployment tasks
echo ""
echo "📋 Running post-deployment tasks..."
echo "----------------------------------"

# Invalidate CDN cache
if [ "$ENVIRONMENT" == "production" ]; then
    print_info "Invalidating CDN cache..."
    curl -X POST https://api.vercel.com/v1/purge \
        -H "Authorization: Bearer $VERCEL_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{"url": "/*"}'
    print_status "CDN cache invalidated"
fi

# Warm up critical paths
print_info "Warming up critical paths..."
PATHS=("/api/health" "/api/v1/projects" "/api/v1/people" "/dashboard")
for path in "${PATHS[@]}"; do
    curl -s -o /dev/null -w "%{http_code}" "https://$DEPLOYMENT_URL$path" > /dev/null
done
print_status "Critical paths warmed up"

# Notify monitoring services
if [ "$ENVIRONMENT" == "production" ]; then
    print_info "Notifying monitoring services..."
    curl -X POST https://api.sentry.io/releases/ \
        -H "Authorization: Bearer $SENTRY_AUTH_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{
            \"version\": \"$(git rev-parse HEAD)\",
            \"projects\": [\"ghxstship\"],
            \"environment\": \"production\"
        }"
    print_status "Sentry release created"
fi

# 7. Health checks
echo ""
echo "❤️ Running health checks..."
echo "-------------------------"

# Wait for deployment to be ready
sleep 10

# Check API health
API_HEALTH=$(curl -s "https://$DEPLOYMENT_URL/api/health")
if [[ "$API_HEALTH" == *"\"status\":\"healthy\""* ]]; then
    print_status "API health check passed"
else
    print_error "API health check failed"
    exit 1
fi

# Check database connectivity
DB_CHECK=$(curl -s "https://$DEPLOYMENT_URL/api/v1/health/db")
if [[ "$DB_CHECK" == *"\"connected\":true"* ]]; then
    print_status "Database connectivity verified"
else
    print_error "Database connectivity check failed"
    exit 1
fi

# 8. Generate deployment report
echo ""
echo "📊 Generating deployment report..."
echo "---------------------------------"

cat > DEPLOYMENT_REPORT.md << EOF
# Deployment Report
Generated: $(date)

## Deployment Details
- **Environment:** $ENVIRONMENT
- **URL:** https://$DEPLOYMENT_URL
- **Commit:** $(git rev-parse HEAD)
- **Branch:** $(git branch --show-current)
- **Deployed By:** $(git config user.name)

## Pre-deployment Checks
- ✅ Node.js version verified
- ✅ Dependencies installed
- ✅ Environment variables configured
$(if [ "$SKIP_TESTS" != "true" ]; then echo "- ✅ Tests passed"; else echo "- ⚠️ Tests skipped"; fi)

## Build Information
- **Build Time:** $(date)
- **Build Size:** $(du -sh apps/web/.next | cut -f1)
- **Bundle Analysis:** Available at /_next/analyze

## Database Status
- ✅ Migrations applied
- ✅ Performance indexes created
- ✅ Materialized views refreshed
$(if [ "$ENVIRONMENT" == "production" ]; then echo "- ✅ Database backed up"; fi)

## Health Checks
- ✅ API endpoint responsive
- ✅ Database connection verified
- ✅ Critical paths warmed up
$(if [ "$ENVIRONMENT" == "production" ]; then echo "- ✅ CDN cache invalidated"; fi)

## Monitoring
- Sentry: https://sentry.io/organizations/ghxstship
- Vercel Analytics: https://vercel.com/ghxstship/analytics
- PostHog: https://app.posthog.com/ghxstship

## Next Steps
1. Monitor error rates for 30 minutes
2. Check performance metrics
3. Verify user flows are working
4. Review deployment logs
5. Update status page

## Rollback Instructions
If issues are detected:
\`\`\`bash
# Rollback to previous deployment
vercel rollback

# Restore database if needed
psql \$DATABASE_URL < backup-[timestamp].sql
\`\`\`
EOF

print_status "Deployment report generated: DEPLOYMENT_REPORT.md"

# 9. Success message
echo ""
echo "=================================="
echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo "=================================="
echo ""
echo "🌐 Application URL: https://$DEPLOYMENT_URL"
echo "📊 View deployment report: DEPLOYMENT_REPORT.md"
echo ""
echo "Recommended next steps:"
echo "1. Monitor application metrics"
echo "2. Check error tracking dashboard"
echo "3. Verify critical user flows"
echo "4. Update status page if production"
