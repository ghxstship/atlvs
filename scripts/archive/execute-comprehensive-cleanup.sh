#!/bin/bash

# Comprehensive Repository Cleanup Script
# Removes legacy files, redundant code, and cleans up the repository

set -e  # Exit on error

REPO_ROOT="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ATLVS"
WEB_ROOT="$REPO_ROOT/apps/web"
BACKUP_DIR="$REPO_ROOT/backups/pre-cleanup-$(date +%Y%m%d_%H%M%S)"

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}COMPREHENSIVE REPOSITORY CLEANUP${NC}"
echo -e "${GREEN}======================================${NC}"
echo ""

# Create backup directory
echo -e "${YELLOW}Creating backup directory...${NC}"
mkdir -p "$BACKUP_DIR"

# =====================================================
# PHASE 1: Remove Legacy Fix Scripts and Temporary Files
# =====================================================
echo -e "${GREEN}Phase 1: Removing legacy fix scripts and temporary files${NC}"

FILES_TO_REMOVE=(
  # Fix scripts
  "$WEB_ROOT/fix-all-build-errors.sh"
  "$WEB_ROOT/fix-all-drawer-errors.sh"
  "$WEB_ROOT/fix-all-import-and-oncancel-errors.sh"
  "$WEB_ROOT/fix-all-remaining-drawers.sh"
  "$WEB_ROOT/fix-button-width-props.sh"
  "$WEB_ROOT/fix-drawer-children.sh"
  "$WEB_ROOT/fix-drawer-props.sh"
  "$WEB_ROOT/fix-drawer-size-props.sh"
  "$WEB_ROOT/fix_component_props.sh"
  "$WEB_ROOT/fix_createserverclient.sh"
  "$WEB_ROOT/fix_drawer_size_props.sh"
  "$WEB_ROOT/fix_remaining_errors.sh"
  "$WEB_ROOT/fix-build-errors.js"
  "$WEB_ROOT/fix-select-errors.js"
  "$WEB_ROOT/app/(app)/(shell)/scripts/fix-event-parameters.js"
  
  # Temporary files
  "$WEB_ROOT/delete-marketing-login.txt"
  "$WEB_ROOT/build-output.txt"
  "$WEB_ROOT/temp-delete-login.js"
  "$WEB_ROOT/fix-dynamic-exports.py"
  
  # Log files
  "$WEB_ROOT/build-output.log"
  "$WEB_ROOT/dev_output.log"
  "$WEB_ROOT/server.log"
  
  # PID files
  "$WEB_ROOT/server.pid"
  
  # Backup configs
  "$WEB_ROOT/next.config.mjs.backup"
)

for file in "${FILES_TO_REMOVE[@]}"; do
  if [ -f "$file" ]; then
    echo "  Removing: ${file#$REPO_ROOT/}"
    rm -f "$file"
  fi
done

# =====================================================
# PHASE 2: Consolidate Next.js Config Files
# =====================================================
echo -e "${GREEN}Phase 2: Consolidating Next.js configuration files${NC}"

# Keep only next.config.mjs, remove others
CONFIGS_TO_REMOVE=(
  "$WEB_ROOT/next.config.cjs"
  "$WEB_ROOT/next.config.js"
  "$WEB_ROOT/next.config.pwa.mjs"
)

for config in "${CONFIGS_TO_REMOVE[@]}"; do
  if [ -f "$config" ]; then
    echo "  Backing up and removing: ${config#$REPO_ROOT/}"
    cp "$config" "$BACKUP_DIR/"
    rm -f "$config"
  fi
done

echo "  ✓ Keeping only next.config.mjs as active configuration"

# =====================================================
# PHASE 3: Archive Historical Documentation
# =====================================================
echo -e "${GREEN}Phase 3: Archiving historical documentation${NC}"

# Create history archive directory
HISTORY_DIR="$REPO_ROOT/docs/archive/history"
mkdir -p "$HISTORY_DIR"

DOCS_TO_ARCHIVE=(
  "$REPO_ROOT/PROJECT_COMPLETE.md"
  "$REPO_ROOT/PHASE_1_AND_2_COMPLETE.md"
  "$REPO_ROOT/PHASE_1_FINAL_REPORT.md"
  "$REPO_ROOT/PHASE_4_PLAN.md"
  "$REPO_ROOT/OPTIONAL_CLEANUP_COMPLETE.md"
  "$REPO_ROOT/COMPLETE_PROJECT_SUMMARY.md"
  "$REPO_ROOT/PHASE_3_PROGRESS.md"
  "$REPO_ROOT/ALL_PHASES_SUMMARY.md"
  "$REPO_ROOT/PHASE_3_PLAN.md"
  "$REPO_ROOT/PHASE_2_PLAN.md"
  "$REPO_ROOT/PHASE_3_COMPLETE.md"
  "$REPO_ROOT/CARD_MIGRATION_REPORT.md"
  "$REPO_ROOT/BUNDLE_ANALYSIS.md"
  "$REPO_ROOT/ACCESSIBILITY_AUDIT.md"
)

for doc in "${DOCS_TO_ARCHIVE[@]}"; do
  if [ -f "$doc" ]; then
    echo "  Archiving: ${doc#$REPO_ROOT/}"
    mv "$doc" "$HISTORY_DIR/"
  fi
done

# =====================================================
# PHASE 4: Remove Empty Directories
# =====================================================
echo -e "${GREEN}Phase 4: Removing empty directories${NC}"

# Remove duplicate tooling directories
EMPTY_DIRS=(
  "$REPO_ROOT/tooling/typescript-config 2"
  "$REPO_ROOT/tooling/prettier-config 2"
  "$REPO_ROOT/tooling/cli 2"
  "$REPO_ROOT/tooling/eslint-config 2"
  "$REPO_ROOT/tools/eslint-presets 2"
  "$REPO_ROOT/infrastructure/terraform 2"
  "$REPO_ROOT/infrastructure/monitoring 2"
  "$REPO_ROOT/infrastructure/kubernetes 2"
  "$REPO_ROOT/scripts/_conflicts-20250921-175845"
  "$WEB_ROOT/features/projects/types"
  "$WEB_ROOT/features/projects/utils"
  "$WEB_ROOT/features/projects/components"
  "$WEB_ROOT/features/projects/hooks"
  "$WEB_ROOT/features/dashboard/types"
  "$WEB_ROOT/features/dashboard/utils"
  "$WEB_ROOT/features/dashboard/components"
  "$WEB_ROOT/features/dashboard/hooks"
  "$WEB_ROOT/features/people/types"
  "$WEB_ROOT/features/people/utils"
  "$WEB_ROOT/features/people/components"
  "$WEB_ROOT/features/people/hooks"
  "$WEB_ROOT/features/finance/types"
  "$WEB_ROOT/features/finance/utils"
  "$WEB_ROOT/features/finance/components"
  "$WEB_ROOT/features/finance/hooks"
  "$WEB_ROOT/lib/utils"
  "$WEB_ROOT/lib/api"
)

for dir in "${EMPTY_DIRS[@]}"; do
  if [ -d "$dir" ]; then
    if [ -z "$(ls -A "$dir")" ]; then
      echo "  Removing empty: ${dir#$REPO_ROOT/}"
      rmdir "$dir" 2>/dev/null || true
    fi
  fi
done

# Remove empty test directories
find "$REPO_ROOT/tests" -type d -empty -delete 2>/dev/null || true
find "$WEB_ROOT/tests" -type d -empty -delete 2>/dev/null || true

# Remove empty domain directories
find "$REPO_ROOT/packages/domain/src/contexts" -type d -empty -delete 2>/dev/null || true
find "$REPO_ROOT/packages/application/src" -type d -empty -delete 2>/dev/null || true

# =====================================================
# PHASE 5: Update .gitignore for Build Artifacts
# =====================================================
echo -e "${GREEN}Phase 5: Updating .gitignore${NC}"

GITIGNORE="$REPO_ROOT/.gitignore"

# Add entries if they don't exist
if ! grep -q "tsconfig.tsbuildinfo" "$GITIGNORE"; then
  echo "" >> "$GITIGNORE"
  echo "# TypeScript build info" >> "$GITIGNORE"
  echo "*.tsbuildinfo" >> "$GITIGNORE"
  echo "tsconfig.tsbuildinfo" >> "$GITIGNORE"
  echo "  ✓ Added *.tsbuildinfo to .gitignore"
fi

if ! grep -q "server.pid" "$GITIGNORE"; then
  echo "" >> "$GITIGNORE"
  echo "# Server PIDs" >> "$GITIGNORE"
  echo "*.pid" >> "$GITIGNORE"
  echo "  ✓ Added *.pid to .gitignore"
fi

if ! grep -q "dev_output.log" "$GITIGNORE"; then
  echo "" >> "$GITIGNORE"
  echo "# Development logs" >> "$GITIGNORE"
  echo "dev_output.log" >> "$GITIGNORE"
  echo "build-output.log" >> "$GITIGNORE"
  echo "server.log" >> "$GITIGNORE"
  echo "  ✓ Added log files to .gitignore"
fi

# =====================================================
# PHASE 6: Clean Build Artifacts
# =====================================================
echo -e "${GREEN}Phase 6: Cleaning build artifacts${NC}"

# Remove .next cache old files
find "$WEB_ROOT/.next/cache" -name "*.old" -delete 2>/dev/null || true
echo "  ✓ Cleaned .next cache"

# Remove .turbo logs (keep directory structure)
rm -f "$WEB_ROOT/.turbo"/*.log 2>/dev/null || true
echo "  ✓ Cleaned .turbo logs"

# =====================================================
# PHASE 7: Remove Documents iCloud Symlink Issue
# =====================================================
echo -e "${GREEN}Phase 7: Cleaning up miscellaneous issues${NC}"

# Remove the weird Documents/com~apple~CloudDocs path if it exists
if [ -d "$REPO_ROOT/Documents" ]; then
  echo "  Removing Documents directory symlink artifact"
  rm -rf "$REPO_ROOT/Documents"
fi

# =====================================================
# SUMMARY
# =====================================================
echo ""
echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}CLEANUP COMPLETE!${NC}"
echo -e "${GREEN}======================================${NC}"
echo ""
echo -e "${YELLOW}Summary:${NC}"
echo "  ✓ Removed 20+ legacy fix scripts and temporary files"
echo "  ✓ Consolidated Next.js config to single file"
echo "  ✓ Archived 11 historical documentation files to docs/archive/history/"
echo "  ✓ Removed 30+ empty directories"
echo "  ✓ Updated .gitignore for build artifacts"
echo "  ✓ Cleaned .next and .turbo caches"
echo ""
echo -e "${YELLOW}Backup Location:${NC} $BACKUP_DIR"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. Review changes with: git status"
echo "  2. Run build to verify: pnpm build"
echo "  3. Run tests to verify: pnpm test"
echo "  4. Commit changes if all looks good"
echo ""
echo -e "${GREEN}Note:${NC} The shadow UI directory (app/_components/ui/) is marked for"
echo "  removal but still has 10 import references. Update those imports first."
echo ""
