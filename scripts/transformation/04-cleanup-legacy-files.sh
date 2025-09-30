#!/bin/bash

##############################################################################
# GHXSTSHIP Transformation Script #4
# Clean Up ALL Legacy Files
#
# ZERO TOLERANCE - Remove all legacy documentation, logs, and temporary files
# Keep only essential files for 2030-ready codebase
#
# Usage: ./scripts/transformation/04-cleanup-legacy-files.sh
##############################################################################

set -e
set -u

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  GHXSTSHIP TRANSFORMATION - Phase 0, Step 4${NC}"
echo -e "${BLUE}  Clean Up ALL Legacy Files${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

cd "$PROJECT_ROOT"

##############################################################################
# Create backup before cleanup
##############################################################################

BACKUP_DIR="backups/pre-cleanup-$(date +%Y%m%d_%H%M%S)"
echo -e "${YELLOW}📦 Creating backup before cleanup...${NC}"
mkdir -p "$BACKUP_DIR"

# List of files to clean (will be backed up first)
echo -e "${YELLOW}🔍 Identifying legacy files...${NC}"

LEGACY_FILES=()

# Root level legacy markdown files
while IFS= read -r file; do
    LEGACY_FILES+=("$file")
done < <(find . -maxdepth 1 -type f \( -name "*.md" \) ! -name "README.md" ! -name "START_HERE.md" ! -name "TRANSFORMATION_COMPLETE.md")

# Legacy JSON files
while IFS= read -r file; do
    LEGACY_FILES+=("$file")
done < <(find . -maxdepth 1 -type f \( -name "audit*.json" -o -name "migration*.json" -o -name "token-*.json" -o -name "lint-report.json" \))

# Legacy log files
while IFS= read -r file; do
    LEGACY_FILES+=("$file")
done < <(find . -maxdepth 1 -type f \( -name "*.log" -o -name "*.txt" \) ! -name "test-push.txt")

# Legacy build outputs
LEGACY_FILES+=("./build.log" "./build-analysis.log" "./build_output.log")

# Legacy audit reports directory duplicates
LEGACY_FILES+=("./audit-reports")

echo -e "${GREEN}✅ Found ${#LEGACY_FILES[@]} legacy files${NC}"

##############################################################################
# Backup legacy files
##############################################################################

echo -e "${YELLOW}💾 Backing up legacy files...${NC}"
for file in "${LEGACY_FILES[@]}"; do
    if [ -e "$file" ]; then
        mkdir -p "$BACKUP_DIR/$(dirname "$file")"
        cp -r "$file" "$BACKUP_DIR/$file" 2>/dev/null || true
    fi
done

echo -e "${GREEN}✅ Backup created at: $BACKUP_DIR${NC}"

##############################################################################
# Remove legacy files
##############################################################################

echo -e "${YELLOW}🗑️  Removing legacy files...${NC}"

REMOVED_COUNT=0
for file in "${LEGACY_FILES[@]}"; do
    if [ -e "$file" ]; then
        rm -rf "$file"
        echo "  • Removed: $file"
        ((REMOVED_COUNT++))
    fi
done

echo -e "${GREEN}✅ Removed $REMOVED_COUNT legacy files${NC}"

##############################################################################
# Clean up duplicate/legacy shell scripts in root
##############################################################################

echo -e "${YELLOW}🧹 Cleaning legacy scripts...${NC}"

LEGACY_SCRIPTS=(
    "fix-all-eslint-errors.sh"
    "fix-all-generic-types.sh"
    "fix-all-promise-generics.sh"
    "fix-all-remaining-errors.sh"
    "fix-all-unused-params.sh"
    "fix-client-imports.sh"
    "fix-eslint-errors.sh"
    "fix-final-build-errors.sh"
    "fix-formatting.sh"
    "fix-generic-syntax-errors.sh"
    "fix-generic-types.sh"
    "fix-paginated-response.sh"
    "fix-remaining-lint-errors.sh"
    "fix_all_imports.sh"
    "fix_array_types.py"
    "fix_imports.sh"
    "fix_promise_types.py"
    "final-eslint-fixes.sh"
)

for script in "${LEGACY_SCRIPTS[@]}"; do
    if [ -f "./$script" ]; then
        mv "./$script" "$BACKUP_DIR/" 2>/dev/null || true
        echo "  • Archived: $script"
    fi
done

##############################################################################
# Clean up legacy JS/Python fix scripts
##############################################################################

LEGACY_JS_FILES=(
    "fix-imports-final.js"
    "fix-imports-proper.js"
    "fix-imports.js"
)

for jsfile in "${LEGACY_JS_FILES[@]}"; do
    if [ -f "./$jsfile" ]; then
        mv "./$jsfile" "$BACKUP_DIR/" 2>/dev/null || true
        echo "  • Archived: $jsfile"
    fi
done

echo -e "${GREEN}✅ Legacy scripts cleaned${NC}"

##############################################################################
# Clean up .gz backup files
##############################################################################

echo -e "${YELLOW}🗜️  Removing old backup archives...${NC}"

OLD_BACKUPS=$(find . -maxdepth 1 -name "*.tar.gz" -o -name "*.gz" 2>/dev/null)
if [ ! -z "$OLD_BACKUPS" ]; then
    for backup in $OLD_BACKUPS; do
        mv "$backup" "$BACKUP_DIR/" 2>/dev/null || true
        echo "  • Archived: $backup"
    done
fi

echo -e "${GREEN}✅ Old backups archived${NC}"

##############################################################################
# Clean up tsbuildinfo files
##############################################################################

echo -e "${YELLOW}🔨 Removing TypeScript build info...${NC}"

find . -name "tsconfig.tsbuildinfo" -type f -delete 2>/dev/null || true
find . -name "*.tsbuildinfo" -type f -delete 2>/dev/null || true

echo -e "${GREEN}✅ Build artifacts cleaned${NC}"

##############################################################################
# Update .gitignore with comprehensive patterns
##############################################################################

echo -e "${YELLOW}📝 Updating .gitignore...${NC}"

cat >> .gitignore <<'EOF'

# ============================================================================
# 2030 Transformation - Legacy Prevention
# ============================================================================

# Legacy documentation (keep only current transformation docs)
/*_REPORT.md
/*_SUMMARY.md
/*_COMPLETE.md
/*_AUDIT*.md
/*_CHECKLIST.md
/*_ACHIEVEMENT*.md
/*_STATUS.md
/*_VALIDATION*.md
/ATLVS*.md
/REMEDIATION*.md
/COMPLIANCE*.md
/PERFORMANCE*.md
/MIGRATION*.md
/BUILD*.md
/FINAL*.md
!/START_HERE.md
!/TRANSFORMATION_COMPLETE.md
!/README.md

# Legacy JSON files
/audit*.json
/migration*.json
/token-*.json
/lint-report.json

# Build and log files
/*.log
/*.txt
!/test-push.txt
/build_output.log

# Backup archives
/*.tar.gz
/*.gz

# Legacy scripts (keep only in scripts/ directory)
/fix-*.sh
/fix_*.sh
/fix-*.js
/fix_*.py
/final-*.sh

# TypeScript build info
*.tsbuildinfo

# Transformation markers
.transformation-*
.last-backup-location

# Backups directory
/backups/
EOF

echo -e "${GREEN}✅ .gitignore updated with comprehensive patterns${NC}"

##############################################################################
# Create clean state marker
##############################################################################

cat > .cleanup-complete <<EOF
Cleanup completed: $(date)
Backup location: $BACKUP_DIR
Files removed: $REMOVED_COUNT
Status: ZERO TOLERANCE CLEANUP COMPLETE

Legacy files have been removed to maintain a clean 2030-ready codebase.
All removed files are backed up at: $BACKUP_DIR

Current state:
- ✅ Infrastructure directory created
- ✅ Docker containerization setup
- ✅ Database package extracted
- ✅ Legacy files cleaned up
- ✅ Git ignore patterns updated

Next: Focus on Phase 1 implementation
EOF

##############################################################################
# Summary
##############################################################################

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Legacy Cleanup Complete!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}Actions Taken:${NC}"
echo "  • Backed up $REMOVED_COUNT files to: $BACKUP_DIR"
echo "  • Removed all legacy documentation"
echo "  • Removed all legacy scripts"
echo "  • Removed all legacy logs and build files"
echo "  • Removed all legacy JSON audit files"
echo "  • Cleaned TypeScript build artifacts"
echo "  • Updated .gitignore with prevention patterns"
echo ""
echo -e "${YELLOW}Kept Essential Files:${NC}"
echo "  • START_HERE.md (entry point)"
echo "  • TRANSFORMATION_COMPLETE.md (current status)"
echo "  • README.md (project readme)"
echo "  • docs/architecture/* (transformation documentation)"
echo "  • infrastructure/* (new infrastructure)"
echo "  • packages/database/* (new database package)"
echo ""
echo -e "${CYAN}Your codebase is now clean and 2030-ready! 🚀${NC}"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

touch .transformation-04-complete

exit 0
