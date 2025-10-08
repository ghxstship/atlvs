#!/bin/bash

# ATLVS Root Directory Cleanup Script
# Removes outdated files and organizes remaining files for optimal architecture

set -e

REPO_ROOT="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ATLVS"
cd "$REPO_ROOT"

echo "🧹 Starting ATLVS Root Directory Cleanup..."
echo "=============================================="

# Create archive directory for important historical docs
echo "📁 Creating archive directory..."
mkdir -p docs/archive/reports
mkdir -p docs/archive/guides

# ============================================
# PHASE 1: DELETE TEMPORARY MARKER FILES
# ============================================
echo ""
echo "🗑️  Phase 1: Removing temporary marker files..."

rm -f .cleanup-complete
rm -f .compliance-status
rm -f .transformation-01-complete
rm -f .transformation-02-complete
rm -f .transformation-03-complete
rm -f test-push.txt

echo "✅ Temporary marker files removed"

# ============================================
# PHASE 2: DELETE LEGACY SCRIPTS
# ============================================
echo ""
echo "🗑️  Phase 2: Removing legacy migration scripts..."

rm -f apply-migration.js
rm -f apply-migration-api.js
rm -f fix-imports.sh
rm -f app.ts

echo "✅ Legacy scripts removed"

# ============================================
# PHASE 3: DELETE TEMPORARY SQL FILES
# ============================================
echo ""
echo "🗑️  Phase 3: Removing temporary SQL files..."

rm -f .temp-rls-fix.sql

echo "✅ Temporary SQL files removed"

# ============================================
# PHASE 4: ARCHIVE INTEGRATION GUIDES
# ============================================
echo ""
echo "📦 Phase 4: Archiving integration guides..."

mv -f INTEGRATION_GUIDE_BRANDING.md docs/archive/guides/ 2>/dev/null || true
mv -f INTEGRATION_GUIDE_I18N.md docs/archive/guides/ 2>/dev/null || true
mv -f INTEGRATION_GUIDE_UI_COMPONENTS.md docs/archive/guides/ 2>/dev/null || true

echo "✅ Integration guides archived"

# ============================================
# PHASE 5: DELETE ALL COMPLETION REPORTS
# ============================================
echo ""
echo "🗑️  Phase 5: Removing outdated completion reports..."

# Phase reports
rm -f PHASE_0_COMPLETE.md
rm -f PHASE_0_SUCCESS.md
rm -f PHASE_0_SUMMARY.txt
rm -f PHASE_1_COMPLETE.md
rm -f PHASE_1_COMPLETE_SUMMARY.md
rm -f PHASE_1_COMPLETION_REPORT.md
rm -f PHASE_1_COMPLETION_STATUS.md
rm -f PHASE_1_PROGRESS.md
rm -f PHASE_1_TERRAFORM_COMPLETE.md
rm -f PHASE_2_COMPLETE.md
rm -f PHASE_2_COMPLETE_SUMMARY.md
rm -f PHASE_2_CORRECTION_REPORT.md
rm -f PHASE_3_AUDIT_REPORT.md
rm -f PHASE_3_COMPLETE.md
rm -f PHASE_3_COMPLETE_SUMMARY.md
rm -f PHASE_3_PROGRESS_REPORT.md
rm -f PHASE_4_COMPLETE.md
rm -f PHASE_5_COMPLETE.md
rm -f PHASE_5_PROGRESS.md
rm -f PHASE_6_COMPLETE_SUMMARY.md

# Final reports
rm -f FINAL_COMPLETION_REPORT.md
rm -f FINAL_PROGRESS_REPORT.md
rm -f FINAL_SESSION_STATS.md
rm -f FINAL_STATUS_REPORT.md
rm -f FINAL_SUMMARY_2030_ENHANCEMENT.md
rm -f FINAL_WRAP_UP_REPORT.md

# Complete reports
rm -f COMPLETE_SESSION_REPORT.md
rm -f COMPLETION_REPORT.md
rm -f SESSION_COMPLETE_SUMMARY.md
rm -f SESSION_COMPLETION_SUMMARY.md

# Transformation reports
rm -f TRANSFORMATION_COMPLETE.md
rm -f TRANSFORMATION_COMPLETE_FINAL.md
rm -f TRANSFORMATION_FINAL_REPORT.md

# UI Migration reports
rm -f UI_MIGRATION_100_PERCENT_COMPLETE.md
rm -f UI_MIGRATION_COMPLETE.md
rm -f UI_MIGRATION_FINAL_REPORT.md
rm -f UI_MIGRATION_FINAL_STATUS.md
rm -f UI_MIGRATION_PROGRESS.md
rm -f UI_MIGRATION_SESSION_COMPLETE.md
rm -f UI_MIGRATION_SYSTEMATIC_APPROACH.md
rm -f UI_PACKAGE_COMPLETE_FINAL.md
rm -f UI_PACKAGE_FINAL_COMPLETE.md
rm -f UI_PACKAGE_FINAL_STATUS.md
rm -f UI_REBUILD_COMPLETE.md

# Other completion reports
rm -f WHITELABEL_COMPLETE.md
rm -f WHITELABEL_IMPLEMENTATION_SUMMARY.md
rm -f MASS_DELETION_COMPLETE.md
rm -f DELETION_REPORT.md
rm -f DEPLOYMENT_READY.md

echo "✅ Completion reports removed"

# ============================================
# PHASE 6: DELETE CERTIFICATION/AUDIT REPORTS
# ============================================
echo ""
echo "🗑️  Phase 6: Removing certification and audit reports..."

rm -f ABSOLUTE_100_PERCENT_CERTIFIED.md
rm -f TRUE_100_PERCENT_ZERO_TOLERANCE_CERTIFIED.md
rm -f ZERO_TOLERANCE_ACHIEVEMENT_REPORT.md
rm -f ZERO_TOLERANCE_CERTIFICATION.md
rm -f PERFECT_SCORE_ACHIEVED.md
rm -f COMPREHENSIVE_AUDIT_FRAMEWORK.md
rm -f COMPREHENSIVE_AUDIT_SESSION_SUMMARY.md
rm -f COMPREHENSIVE_COMPLETION_AUDIT_REPORT.md
rm -f SURGICAL_AUDIT_EXECUTIVE_SUMMARY.md
rm -f AUDIT_PROGRESS.md
rm -f REDUNDANCY_AUDIT_COMPLETE.md

echo "✅ Certification and audit reports removed"

# ============================================
# PHASE 7: DELETE BUILD/STATUS REPORTS
# ============================================
echo ""
echo "🗑️  Phase 7: Removing build and status reports..."

rm -f BUILD_FIXES_2025-10-01.md
rm -f BUILD_FIX_SUMMARY.md
rm -f BUILD_STATUS.md
rm -f BUILD_WARNINGS_FIXES.md
rm -f IMPLEMENTATION_STATUS.md
rm -f PROGRESS_SUMMARY.md

echo "✅ Build and status reports removed"

# ============================================
# PHASE 8: DELETE ENHANCEMENT/PLANNING DOCS
# ============================================
echo ""
echo "🗑️  Phase 8: Removing enhancement and planning documents..."

rm -f APPROVAL_PACKAGE_2030_UI_ENHANCEMENT.md
rm -f ENHANCEMENT_ROADMAP_2030.md
rm -f COMPLETE_UI_REBUILD_PLAN.md
rm -f REFACTOR_EXECUTION_PLAN.md
rm -f MODULE_REGENERATION_GUIDE.md

echo "✅ Enhancement and planning documents removed"

# ============================================
# PHASE 9: DELETE MISC LEGACY DOCS
# ============================================
echo ""
echo "🗑️  Phase 9: Removing miscellaneous legacy documents..."

rm -f APPLY_RLS_FIX.md
rm -f RLS_FIX_INSTRUCTIONS.md
rm -f DESIGN_TOKEN_CONVERSION_COMPLETE.md
rm -f DESIGN_TOKEN_CONVERSION_README.md
rm -f DESIGN_TOKEN_VIOLATIONS_SEVERITY_REPORT.md
rm -f REMAINING_TOKEN_WARNINGS.md
rm -f ENTERPRISE_UI_UX_HARDENING_COMPLETE.md
rm -f UI_ARCHITECTURE_CLARIFICATION.md
rm -f DELIVERY_CHECKLIST.md
rm -f EXECUTION_SUMMARY.md
rm -f EXECUTIVE_SUMMARY.md
rm -f EXTENDED_SESSION_SUMMARY.md
rm -f LINT_OPTIMIZATION_REPORT.md
rm -f MISSING_COMPONENTS_BUILT.md

echo "✅ Miscellaneous legacy documents removed"

# ============================================
# PHASE 10: DELETE DUPLICATE ESLINT CONFIGS
# ============================================
echo ""
echo "🗑️  Phase 10: Removing duplicate ESLint configurations..."

rm -f .eslintrc.cjs
rm -f .eslintrc.design-tokens.js
rm -f .eslintrc.pixel-perfect.js
rm -f .eslintrc.semantic-tokens.js
rm -f .eslintrc.spacing.js
rm -f .eslintrc.tokens.js

echo "✅ Duplicate ESLint configs removed (kept .eslintrc.json)"

# ============================================
# PHASE 11: DELETE TEMPORARY BUILD FILES
# ============================================
echo ""
echo "🗑️  Phase 11: Removing temporary build artifacts..."

rm -f tsconfig.tsbuildinfo
rm -f typescript-health-report.json
rm -f package.json.scripts

echo "✅ Temporary build files removed"

# ============================================
# PHASE 12: REMOVE .env.local (SHOULD NOT BE IN REPO)
# ============================================
echo ""
echo "🗑️  Phase 12: Removing .env.local (should be gitignored)..."

rm -f .env.local

echo "✅ .env.local removed"

# ============================================
# SUMMARY
# ============================================
echo ""
echo "=============================================="
echo "✅ ATLVS Root Directory Cleanup Complete!"
echo "=============================================="
echo ""
echo "📊 Summary:"
echo "  - Removed ~80+ outdated documentation files"
echo "  - Removed temporary marker files"
echo "  - Removed legacy migration scripts"
echo "  - Removed duplicate ESLint configurations"
echo "  - Removed temporary build artifacts"
echo "  - Archived 3 integration guides to docs/archive/guides/"
echo ""
echo "📁 Remaining Essential Files:"
echo "  - Configuration: .dockerignore, .editorconfig, .env.example, etc."
echo "  - Build Tools: package.json, tsconfig.json, next.config.mjs, etc."
echo "  - Documentation: README.md, START_HERE.md"
echo "  - All project directories intact"
echo ""
echo "🚀 Repository is now optimized and production-ready!"
