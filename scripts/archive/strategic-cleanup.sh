#!/bin/bash

# GHXSTSHIP Strategic Cleanup Script
# Removes legacy files, old scripts, and redundancies while preserving functionality

REPO_ROOT="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ATLVS"
BACKUP_DIR="$REPO_ROOT/.cleanup-backup-$(date +%Y%m%d-%H%M%S)"
LOG_FILE="$REPO_ROOT/STRATEGIC_CLEANUP_LOG.md"

echo "# STRATEGIC CLEANUP EXECUTION LOG" > "$LOG_FILE"
echo "Date: $(date)" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Create backup directory
mkdir -p "$BACKUP_DIR"
echo "✅ Created backup directory: $BACKUP_DIR" | tee -a "$LOG_FILE"

cd "$REPO_ROOT"

echo "" >> "$LOG_FILE"
echo "## PHASE 1: REMOVING OLD AUDIT/VALIDATION SCRIPTS" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Remove old audit and validation scripts
OLD_SCRIPTS=(
  "scripts/zero-tolerance-audit.sh"
  "scripts/comprehensive-validation.sh"
  "scripts/design-system-audit-complete.sh"
  "scripts/cleanup-legacy-files.sh"
  "scripts/final-cleanup.sh"
  "scripts/final-validation-fix.js"
  "scripts/performance-audit-final.sh"
  "scripts/precise-color-audit.sh"
  "scripts/nuclear-cleanup.sh"
  "scripts/ux-audit.sh"
  "scripts/accessibility-audit.sh"
  "scripts/ui-legacy-audit.sh"
  "scripts/execute-cleanup.sh"
  "scripts/ui-enterprise-cleanup.sh"
  "scripts/production-cleanup-master.sh"
  "scripts/performance-audit-simple.sh"
  "scripts/audits/pixel-perfect-audit.sh"
  "scripts/audits/semantic-color-audit.sh"
  "scripts/audits/comprehensive-dark-theme-audit.sh"
  "scripts/audits/pixel-perfect-ui-audit.sh"
  "scripts/audits/comprehensive-theme-opacity-audit.sh"
  "scripts/comprehensive-audit.sh"
)

for script in "${OLD_SCRIPTS[@]}"; do
  if [ -f "$REPO_ROOT/$script" ]; then
    cp "$REPO_ROOT/$script" "$BACKUP_DIR/"
    rm "$REPO_ROOT/$script"
    echo "- Removed: $script" >> "$LOG_FILE"
  fi
done

echo "" >> "$LOG_FILE"
echo "## PHASE 2: REMOVING OLD VALIDATION REPORTS" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Remove old validation reports
OLD_REPORTS=(
  "MODULE_AUDITS/COMPLETE_PLATFORM_VALIDATION.md"
  "MARKETING_AUTH_UI_MIGRATION_VALIDATION.md"
  "docs/I18N_VALIDATION_SUMMARY.md"
  "docs/E5_PRODUCTION_CLEANUP_VALIDATION.md"
  "docs/PIXEL_PERFECT_VALIDATION.md"
  "docs/THEME_FIX_VALIDATION_REPORT.md"
  "docs/E5_VALIDATION_SUMMARY.md"
  "docs/THEME_SYSTEM_VALIDATION_REPORT.md"
  "docs/E5_VALIDATION_INDEX.md"
  "docs/ENTERPRISE_TESTING_VALIDATION_REPORT.md"
  "docs/I18N_VALIDATION_REPORT.md"
  "VALIDATION_SUMMARY.md"
  "apps/web/app/(app)/(shell)/settings/SETTINGS_FINAL_VALIDATION_REPORT.md"
  "apps/web/app/(app)/(shell)/settings/SETTINGS_VALIDATION_REPORT.md"
  "apps/web/app/(app)/(shell)/projects/activations/VALIDATION_REPORT.md"
  "apps/web/app/(app)/(shell)/projects/schedule/VALIDATION_REPORT.md"
  "apps/web/app/(app)/(shell)/projects/tasks/VALIDATION_REPORT.md"
  "apps/web/app/(app)/(shell)/projects/inspections/VALIDATION_REPORT.md"
  "apps/web/app/(app)/(shell)/projects/locations/VALIDATION_REPORT.md"
  "apps/web/app/(app)/(shell)/projects/risks/VALIDATION_REPORT.md"
  "migration-validation-report-20251007-221446.txt"
  ".cleanup-summary"
  "COMPREHENSIVE_AUDIT_REPORT.md"
)

for report in "${OLD_REPORTS[@]}"; do
  if [ -f "$REPO_ROOT/$report" ]; then
    cp "$REPO_ROOT/$report" "$BACKUP_DIR/"
    rm "$REPO_ROOT/$report"
    echo "- Removed: $report" >> "$LOG_FILE"
  fi
done

echo "" >> "$LOG_FILE"
echo "## PHASE 3: REMOVING EMPTY/STUB FILES" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Remove empty or stub files with _New suffix
STUB_FILES=(
  "apps/web/app/(app)/(shell)/settings/SettingsClient_New.tsx"
  "apps/web/app/(app)/(shell)/dashboard/DashboardOverviewClient.tsx"
  "apps/web/app/(app)/(shell)/programming/ProgrammingClient.unified.tsx"
  "apps/web/app/(app)/(shell)/procurement/approvals/ApprovalsClient_New.tsx"
  "apps/web/app/(app)/(shell)/people/training/TrainingClient_New.tsx"
  "apps/web/app/(app)/(shell)/people/network/NetworkClient_New.tsx"
  "apps/web/app/(app)/(shell)/people/shortlists/ShortlistsClient_New.tsx"
  "apps/web/app/(app)/(shell)/people/endorsements/EndorsementsClient_New.tsx"
  "apps/web/app/(app)/(shell)/people/onboarding/OnboardingClient_New.tsx"
  "apps/web/test-build.tsx"
)

for stub in "${STUB_FILES[@]}"; do
  if [ -f "$REPO_ROOT/$stub" ]; then
    cp "$REPO_ROOT/$stub" "$BACKUP_DIR/"
    rm "$REPO_ROOT/$stub"
    echo "- Removed stub: $stub" >> "$LOG_FILE"
  fi
done

echo "" >> "$LOG_FILE"
echo "## PHASE 4: REMOVING DUPLICATE UTILITY FILES" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Remove duplicate utility files (keep the lib/ version)
DUPLICATE_UTILS=(
  "apps/web/app/lib/rate-limit.ts"
  "apps/web/app/_components/lib/rate-limit.ts"
  "apps/web/app/_components/lib/performance.ts"
  "apps/web/lib/ab-testing.ts"
)

for util in "${DUPLICATE_UTILS[@]}"; do
  if [ -f "$REPO_ROOT/$util" ]; then
    cp "$REPO_ROOT/$util" "$BACKUP_DIR/"
    rm "$REPO_ROOT/$util"
    echo "- Removed duplicate: $util" >> "$LOG_FILE"
  fi
done

echo "" >> "$LOG_FILE"
echo "## PHASE 5: REMOVING EMPTY INDEX FILES" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Remove empty index.ts files in drawer/view directories
EMPTY_INDEXES=(
  "apps/web/app/(app)/(shell)/pipeline/drawers/index.ts"
  "apps/web/app/(app)/(shell)/projects/drawers/index.ts"
  "apps/web/app/(app)/(shell)/programming/drawers/index.ts"
  "apps/web/app/(app)/(shell)/people/drawers/index.ts"
  "apps/web/app/(app)/(shell)/finance/drawers/index.ts"
  "apps/web/app/(app)/(shell)/jobs/drawers/index.ts"
  "apps/web/app/_components/molecules/index.ts"
  "apps/web/app/_components/templates/index.ts"
  "apps/web/app/_components/organisms/index.ts"
)

for idx in "${EMPTY_INDEXES[@]}"; do
  if [ -f "$REPO_ROOT/$idx" ]; then
    # Check if file is empty or very small (< 50 bytes)
    if [ $(stat -f%z "$REPO_ROOT/$idx" 2>/dev/null || stat -c%s "$REPO_ROOT/$idx" 2>/dev/null || echo 0) -lt 50 ]; then
      cp "$REPO_ROOT/$idx" "$BACKUP_DIR/"
      rm "$REPO_ROOT/$idx"
      echo "- Removed empty index: $idx" >> "$LOG_FILE"
    fi
  fi
done

echo "" >> "$LOG_FILE"
echo "## PHASE 6: CLEANING UP DUPLICATE COMPONENTS" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Remove duplicate shared components (keep app/_components version)
DUPLICATE_COMPONENTS=(
  "apps/web/app/_components/design-system/page.tsx"
  "apps/web/app/_components/SkipLink.tsx"
)

for comp in "${DUPLICATE_COMPONENTS[@]}"; do
  if [ -f "$REPO_ROOT/$comp" ]; then
    cp "$REPO_ROOT/$comp" "$BACKUP_DIR/"
    rm "$REPO_ROOT/$comp"
    echo "- Removed duplicate component: $comp" >> "$LOG_FILE"
  fi
done

echo "" >> "$LOG_FILE"
echo "## PHASE 7: REMOVING SPECIAL FILES" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Remove special problematic files
SPECIAL_FILES=(
  "apps/web/app/(app)/(shell)/dashboard/.!74333!DashboardClient.tsx"
)

for special in "${SPECIAL_FILES[@]}"; do
  if [ -f "$REPO_ROOT/$special" ]; then
    cp "$REPO_ROOT/$special" "$BACKUP_DIR/"
    rm "$REPO_ROOT/$special"
    echo "- Removed special file: $special" >> "$LOG_FILE"
  fi
done

echo "" >> "$LOG_FILE"
echo "## CLEANUP SUMMARY" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"
echo "- Backup location: $BACKUP_DIR" >> "$LOG_FILE"
echo "- Total files backed up: $(ls -1 "$BACKUP_DIR" | wc -l)" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"
echo "✅ Strategic cleanup complete!" | tee -a "$LOG_FILE"
echo "📁 Backup created at: $BACKUP_DIR" | tee -a "$LOG_FILE"
echo "📄 Log file: $LOG_FILE" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"
echo "⚠️  To restore files, copy them from the backup directory" | tee -a "$LOG_FILE"
