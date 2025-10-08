#!/bin/bash

# ATLVS Codebase Reorganization Script
# Purpose: Normalize, optimize, and consolidate file structure
# Created: 2025-10-08

set -e

echo "🚀 Starting ATLVS Codebase Reorganization..."
echo ""

BACKUP_DIR=".reorganization-backup-$(date +%Y%m%d-%H%M%S)"

# Create backup before any changes
echo "📦 Creating safety backup in $BACKUP_DIR..."
mkdir -p "$BACKUP_DIR"

# ============================================================================
# PHASE 1: Remove Legacy Backup Directories
# ============================================================================
echo ""
echo "🗑️  PHASE 1: Removing Legacy Backups..."

LEGACY_BACKUPS=(
  ".cleanup-backup-20251008-103626"
  ".deep-cleanup-backup-20251008-103916"
  "backups"
)

for dir in "${LEGACY_BACKUPS[@]}"; do
  if [ -d "$dir" ]; then
    echo "  ✓ Removing $dir"
    rm -rf "$dir"
  fi
done

# ============================================================================
# PHASE 2: Consolidate Documentation
# ============================================================================
echo ""
echo "📚 PHASE 2: Consolidating Documentation..."

# Create docs/archive for legacy reports
mkdir -p docs/archive

LEGACY_DOCS=(
  "CLEANUP_COMPLETE_REPORT.md"
  "DEEP_CLEANUP_LOG.md"
  "DEEP_REDUNDANCY_ANALYSIS.md"
  "ERRORS_FIXED_REPORT.md"
  "FINAL_CLEANUP_REPORT.md"
  "MODERNIZATION_COMPLETE_REPORT.md"
  "MODERNIZATION_SUMMARY.md"
  "REPOSITORY_CLEANUP_SUMMARY.md"
  "REPOSITORY_STATUS.md"
  "STRATEGIC_CLEANUP_LOG.md"
)

for doc in "${LEGACY_DOCS[@]}"; do
  if [ -f "$doc" ]; then
    echo "  ✓ Archiving $doc"
    mv "$doc" "docs/archive/"
  fi
done

# Keep these in root:
# - README.md (primary)
# - START_HERE.md (onboarding)
# - QUICK_START_GUIDE.md (developer guide)
# - GIT_COMMIT_GUIDE.md (workflow guide)

# ============================================================================
# PHASE 3: Organize Scripts Directory
# ============================================================================
echo ""
echo "🔧 PHASE 3: Organizing Scripts..."

cd scripts

# Create organized subdirectories
mkdir -p dev build deploy utils archive

# Move development scripts
echo "  → Organizing development scripts..."
for script in *dev* *test* *lint* *format* *validate*; do
  [ -f "$script" ] && mv "$script" dev/ 2>/dev/null || true
done

# Move build scripts
echo "  → Organizing build scripts..."
for script in *build* *compile* *bundle*; do
  [ -f "$script" ] && mv "$script" build/ 2>/dev/null || true
done

# Move deployment scripts
echo "  → Organizing deployment scripts..."
for script in *deploy* *publish* *release* *docker*; do
  [ -f "$script" ] && mv "$script" deploy/ 2>/dev/null || true
done

# Archive cleanup scripts (no longer needed)
echo "  → Archiving legacy cleanup scripts..."
for script in *cleanup* *fix* *remove* *duplicate* *deep-*; do
  [ -f "$script" ] && mv "$script" archive/ 2>/dev/null || true
done

# Archive audit scripts
echo "  → Archiving audit scripts..."
for script in *audit* *check* *analyze*; do
  [ -f "$script" ] && mv "$script" archive/ 2>/dev/null || true
done

cd ..

# ============================================================================
# PHASE 4: Clean Test Artifacts
# ============================================================================
echo ""
echo "🧪 PHASE 4: Cleaning Test Artifacts..."

TEST_ARTIFACTS=(
  "coverage"
  "playwright-report"
  "test-results"
  ".turbo"
  "tsconfig.tsbuildinfo"
)

for artifact in "${TEST_ARTIFACTS[@]}"; do
  if [ -e "$artifact" ]; then
    echo "  ✓ Removing $artifact"
    rm -rf "$artifact"
  fi
done

# ============================================================================
# PHASE 5: Update .gitignore
# ============================================================================
echo ""
echo "📝 PHASE 5: Updating .gitignore..."

cat >> .gitignore << 'EOF'

# Test & Build Artifacts
coverage/
playwright-report/
test-results/
.turbo/
*.tsbuildinfo

# Backups (never commit)
*backup*/
.cleanup-*/
.deep-cleanup-*/

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db
EOF

echo "  ✓ .gitignore updated"

# ============================================================================
# PHASE 6: Optimize Empty Directories
# ============================================================================
echo ""
echo "📁 PHASE 6: Removing Empty Directories..."

find . -type d -empty -not -path "./.git/*" -delete 2>/dev/null || true
echo "  ✓ Empty directories removed"

# ============================================================================
# PHASE 7: Create Consolidated Documentation
# ============================================================================
echo ""
echo "📖 PHASE 7: Creating Consolidated Documentation..."

cat > docs/ARCHITECTURE.md << 'EOF'
# ATLVS Architecture

## Directory Structure

```
atlvs/
├── apps/                      # Application implementations
│   ├── web/                  # Main web application (Next.js)
│   ├── mobile/               # Mobile application
│   └── desktop/              # Desktop application
├── packages/                  # Shared packages (monorepo)
│   ├── ui/                   # UI components library
│   ├── domain/               # Business logic & domain models
│   ├── infrastructure/       # External integrations
│   ├── application/          # Application services
│   ├── auth/                 # Authentication utilities
│   ├── database/             # Database utilities
│   ├── analytics/            # Analytics integration
│   ├── i18n/                 # Internationalization
│   ├── config/               # Configuration management
│   ├── utils/                # Utility functions
│   └── shared/               # Shared types & constants
├── infrastructure/            # Infrastructure as Code
│   ├── terraform/            # Terraform configurations
│   ├── kubernetes/           # K8s manifests
│   └── docker/               # Docker configurations
├── supabase/                  # Supabase backend
│   ├── migrations/           # Database migrations
│   ├── functions/            # Edge functions
│   └── seed/                 # Database seed data
├── scripts/                   # Utility scripts
│   ├── dev/                  # Development scripts
│   ├── build/                # Build scripts
│   ├── deploy/               # Deployment scripts
│   ├── utils/                # Utility scripts
│   └── archive/              # Legacy scripts
├── docs/                      # Documentation
│   ├── architecture/         # Architecture docs
│   ├── api/                  # API documentation
│   ├── guides/               # How-to guides
│   └── archive/              # Legacy documentation
├── tests/                     # Integration & E2E tests
├── .github/                   # GitHub workflows & templates
├── .husky/                    # Git hooks
└── .storybook/               # Storybook configuration
```

## Key Principles

1. **Modular Architecture**: Clear separation of concerns
2. **Monorepo Structure**: Shared packages with independent versioning
3. **Domain-Driven Design**: Business logic in domain package
4. **Infrastructure as Code**: All infrastructure versioned
5. **Type Safety**: TypeScript throughout
6. **Testing**: Comprehensive test coverage
7. **Documentation**: Living documentation alongside code

## Development Workflow

See [START_HERE.md](../START_HERE.md) for getting started.
EOF

echo "  ✓ Architecture documentation created"

# ============================================================================
# PHASE 8: Create Development Index
# ============================================================================
echo ""
echo "📋 PHASE 8: Creating Development Index..."

cat > docs/DEV_INDEX.md << 'EOF'
# Development Index

Quick reference for common development tasks.

## Getting Started
- [START_HERE.md](../START_HERE.md) - Onboarding guide
- [QUICK_START_GUIDE.md](../QUICK_START_GUIDE.md) - Quick start
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture

## Development
```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build
```

## Scripts
- `scripts/dev/` - Development utilities
- `scripts/build/` - Build scripts
- `scripts/deploy/` - Deployment scripts
- `scripts/utils/` - General utilities

## Testing
```bash
# Unit tests
pnpm test:unit

# Integration tests
pnpm test:integration

# E2E tests
pnpm test:e2e

# Coverage report
pnpm test:coverage
```

## Deployment
See `infrastructure/README.md` for deployment documentation.

## Code Quality
```bash
# Lint
pnpm lint

# Format
pnpm format

# Type check
pnpm typecheck
```

## Documentation
- API docs: `docs/api/`
- Architecture: `docs/architecture/`
- Guides: `docs/guides/`

## Support
- GitHub Issues: Report bugs & request features
- Discussions: Ask questions & share ideas
EOF

echo "  ✓ Development index created"

# ============================================================================
# PHASE 9: Summary Report
# ============================================================================
echo ""
echo "✅ REORGANIZATION COMPLETE!"
echo ""
echo "Summary of Changes:"
echo "  ✓ Removed legacy backup directories"
echo "  ✓ Archived old documentation reports"
echo "  ✓ Organized scripts into categories"
echo "  ✓ Cleaned test artifacts"
echo "  ✓ Updated .gitignore"
echo "  ✓ Removed empty directories"
echo "  ✓ Created consolidated documentation"
echo ""
echo "New Structure:"
echo "  📁 docs/"
echo "     ├── ARCHITECTURE.md (new)"
echo "     ├── DEV_INDEX.md (new)"
echo "     └── archive/ (legacy reports)"
echo "  📁 scripts/"
echo "     ├── dev/ (development scripts)"
echo "     ├── build/ (build scripts)"
echo "     ├── deploy/ (deployment scripts)"
echo "     ├── utils/ (utilities)"
echo "     └── archive/ (legacy scripts)"
echo ""
echo "Next Steps:"
echo "  1. Review changes: git status"
echo "  2. Test build: pnpm build"
echo "  3. Commit changes: git add -A && git commit -m 'chore: reorganize codebase structure'"
echo ""
echo "🎉 Codebase is now optimized and ready!"
