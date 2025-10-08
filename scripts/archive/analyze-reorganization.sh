#!/bin/bash

# ATLVS Reorganization Analysis Script
# Analyzes what will be changed without making modifications

echo "🔍 ATLVS Codebase Reorganization Analysis"
echo "========================================"
echo ""

# Count legacy backups
echo "📦 LEGACY BACKUPS TO REMOVE:"
find . -maxdepth 1 -type d \( -name "*backup*" -o -name ".cleanup-*" -o -name ".deep-cleanup-*" \) 2>/dev/null | while read dir; do
  size=$(du -sh "$dir" 2>/dev/null | cut -f1)
  echo "  ✗ $dir ($size)"
done
echo ""

# Count legacy docs
echo "📚 LEGACY DOCS TO ARCHIVE:"
for doc in CLEANUP_COMPLETE_REPORT.md DEEP_CLEANUP_LOG.md DEEP_REDUNDANCY_ANALYSIS.md \
           ERRORS_FIXED_REPORT.md FINAL_CLEANUP_REPORT.md MODERNIZATION_COMPLETE_REPORT.md \
           MODERNIZATION_SUMMARY.md REPOSITORY_CLEANUP_SUMMARY.md REPOSITORY_STATUS.md \
           STRATEGIC_CLEANUP_LOG.md; do
  if [ -f "$doc" ]; then
    size=$(du -sh "$doc" 2>/dev/null | cut -f1)
    echo "  → $doc ($size)"
  fi
done
echo ""

# Count scripts
echo "🔧 SCRIPTS ORGANIZATION:"
cd scripts 2>/dev/null || exit 1
total=$(ls -1 | wc -l | tr -d ' ')
cleanup=$(ls -1 | grep -E "(cleanup|fix|remove)" | wc -l | tr -d ' ')
audit=$(ls -1 | grep -E "(audit|check)" | wc -l | tr -d ' ')
dev=$(ls -1 | grep -E "(dev|test|lint)" | wc -l | tr -d ' ')
build=$(ls -1 | grep -E "(build|compile)" | wc -l | tr -d ' ')
deploy=$(ls -1 | grep -E "(deploy|publish)" | wc -l | tr -d ' ')
cd ..

echo "  Total scripts: $total"
echo "  ├── Development: ~$dev scripts → scripts/dev/"
echo "  ├── Build: ~$build scripts → scripts/build/"
echo "  ├── Deploy: ~$deploy scripts → scripts/deploy/"
echo "  ├── Legacy cleanup: ~$cleanup scripts → scripts/archive/"
echo "  └── Legacy audit: ~$audit scripts → scripts/archive/"
echo ""

# Test artifacts
echo "🧪 TEST ARTIFACTS TO REMOVE:"
for artifact in coverage playwright-report test-results .turbo tsconfig.tsbuildinfo; do
  if [ -e "$artifact" ]; then
    size=$(du -sh "$artifact" 2>/dev/null | cut -f1)
    echo "  ✗ $artifact ($size)"
  fi
done
echo ""

# Calculate space savings
echo "💾 ESTIMATED SPACE SAVINGS:"
total_size=0
for item in .cleanup-backup-* .deep-cleanup-* backups coverage playwright-report test-results .turbo tsconfig.tsbuildinfo; do
  if [ -e "$item" ]; then
    size=$(du -sk "$item" 2>/dev/null | cut -f1)
    total_size=$((total_size + size))
  fi
done
echo "  ~$((total_size / 1024)) MB will be removed"
echo ""

# Core structure that will remain
echo "✅ CORE STRUCTURE (PRESERVED):"
echo "  📁 apps/web/          Main application"
echo "  📁 packages/          Shared packages (12 packages)"
echo "  📁 infrastructure/    Infrastructure as Code"
echo "  📁 supabase/          Database & backend"
echo "  📁 tests/             Test suites"
echo "  📁 .github/           CI/CD workflows"
echo "  📁 .husky/            Git hooks"
echo "  📁 .storybook/        Component docs"
echo ""

# Final recommendations
echo "📋 REORGANIZATION PLAN:"
echo "  1. Remove legacy backups (save ~$((total_size / 1024 / 2)) MB)"
echo "  2. Archive old documentation (10 files → docs/archive/)"
echo "  3. Organize scripts ($total → categorized subdirectories)"
echo "  4. Clean test artifacts (save ~$((total_size / 1024 / 4)) MB)"
echo "  5. Update .gitignore (prevent future clutter)"
echo "  6. Create architecture docs (ARCHITECTURE.md, DEV_INDEX.md)"
echo ""
echo "🎯 RESULT:"
echo "  ✓ Cleaner root directory"
echo "  ✓ Better organized scripts"
echo "  ✓ Consolidated documentation"
echo "  ✓ ~$((total_size / 1024)) MB disk space saved"
echo "  ✓ More maintainable structure"
echo ""
echo "Ready to proceed? Run:"
echo "  bash scripts/reorganize-codebase.sh"
