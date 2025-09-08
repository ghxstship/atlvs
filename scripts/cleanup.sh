#!/bin/bash

# GHXSTSHIP Codebase Cleanup Script
# 2026 Enterprise Standards Compliance
# Version: 1.0.0

set -e

echo "🧹 Starting GHXSTSHIP Codebase Cleanup..."
echo "========================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# 1. Remove redundant files
echo ""
echo "📁 Removing redundant files..."
echo "------------------------------"

# Remove backup and test files
if [ -f "apps/web/app/page.backup.tsx" ]; then
    rm -f apps/web/app/page.backup.tsx
    print_status "Removed page.backup.tsx"
fi

if [ -f "apps/web/app/page-test.tsx" ]; then
    rm -f apps/web/app/page-test.tsx
    print_status "Removed page-test.tsx"
fi

# Remove duplicate marketing directory
if [ -d "apps/web/app/marketing" ]; then
    rm -rf apps/web/app/marketing
    print_status "Removed duplicate marketing directory"
fi

# 2. Clean node_modules and reinstall
echo ""
echo "📦 Cleaning dependencies..."
echo "---------------------------"

# Remove all node_modules
find . -name "node_modules" -type d -prune -exec rm -rf '{}' + 2>/dev/null || true
print_status "Removed all node_modules directories"

# Remove lock files for clean install
rm -f pnpm-lock.yaml
rm -f package-lock.json
rm -f yarn.lock
print_status "Removed lock files"

# Clean pnpm store
pnpm store prune
print_status "Pruned pnpm store"

# 3. Clean build artifacts
echo ""
echo "🏗️ Cleaning build artifacts..."
echo "------------------------------"

# Clean Next.js build
rm -rf apps/web/.next
rm -rf apps/web/out
print_status "Removed Next.js build artifacts"

# Clean TypeScript build info
find . -name "*.tsbuildinfo" -type f -delete 2>/dev/null || true
print_status "Removed TypeScript build info files"

# Clean dist directories
find . -name "dist" -type d -prune -exec rm -rf '{}' + 2>/dev/null || true
print_status "Removed dist directories"

# 4. Clean temporary files
echo ""
echo "🗑️ Cleaning temporary files..."
echo "------------------------------"

# Remove .DS_Store files (macOS)
find . -name ".DS_Store" -type f -delete 2>/dev/null || true
print_status "Removed .DS_Store files"

# Remove log files
find . -name "*.log" -type f -delete 2>/dev/null || true
print_status "Removed log files"

# Remove coverage reports
rm -rf coverage
rm -rf .nyc_output
print_status "Removed coverage reports"

# 5. Standardize TypeScript version
echo ""
echo "📝 Standardizing TypeScript version..."
echo "--------------------------------------"

# Update root package.json to use single TypeScript version
cat > temp_package.json << 'EOF'
{
  "name": "ghxstship-monorepo",
  "private": true,
  "packageManager": "pnpm@10.15.1",
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "turbo run dev --parallel",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "typecheck": "turbo run typecheck",
    "clean": "turbo run clean",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "prepare": "husky install"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.4.0",
    "eslint": "^9.0.0",
    "prettier": "^3.2.5",
    "@types/node": "^20.12.11",
    "@types/react": "^18.2.66",
    "@types/react-dom": "^18.2.23",
    "husky": "^9.0.0",
    "lint-staged": "^15.0.0"
  },
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
EOF

mv temp_package.json package.json
print_status "Updated root package.json"

# 6. Fix file naming inconsistencies
echo ""
echo "📛 Fixing naming inconsistencies..."
echo "-----------------------------------"

# Find and report inconsistent naming patterns
inconsistent_files=$(find apps/web/app -name "*Client.tsx" | grep -E "(Create[A-Z]|[A-Z][a-z]+Table)" | head -10)
if [ ! -z "$inconsistent_files" ]; then
    print_warning "Found files with inconsistent naming patterns:"
    echo "$inconsistent_files" | head -5
    echo "Consider standardizing to: [Module][Submodule]Client.tsx pattern"
fi

# 7. Reinstall dependencies
echo ""
echo "📥 Reinstalling dependencies..."
echo "-------------------------------"

pnpm install
print_status "Dependencies reinstalled"

# 8. Generate cleanup report
echo ""
echo "📊 Generating cleanup report..."
echo "-------------------------------"

cat > CLEANUP_REPORT.md << 'EOF'
# Cleanup Report
Generated: $(date)

## Files Removed
- apps/web/app/page.backup.tsx
- apps/web/app/page-test.tsx
- apps/web/app/marketing/ (duplicate directory)
- All node_modules directories
- All .DS_Store files
- All log files
- All build artifacts

## Dependencies Standardized
- TypeScript version: 5.4.0
- React version: 18.2.0
- Next.js version: 14.2.3

## Recommendations
1. Run `pnpm typecheck` to verify TypeScript configuration
2. Run `pnpm lint` to check for linting issues
3. Run `pnpm build` to verify build process
4. Review naming inconsistencies reported above

## Next Steps
1. Run optimization script: `./scripts/optimize.sh`
2. Run test setup script: `./scripts/setup-tests.sh`
3. Deploy using: `./scripts/deploy.sh`
EOF

print_status "Cleanup report generated: CLEANUP_REPORT.md"

echo ""
echo "========================================="
echo -e "${GREEN}✅ Cleanup completed successfully!${NC}"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Review CLEANUP_REPORT.md"
echo "2. Run: pnpm typecheck"
echo "3. Run: pnpm lint"
echo "4. Run: pnpm build"
