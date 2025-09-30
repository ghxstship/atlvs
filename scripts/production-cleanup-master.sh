#!/bin/bash

# GHXSTSHIP Production Cleanup Master Script
# Purpose: Orchestrate all cleanup operations in correct order
# Safe to run: Prompts for confirmation at each step

set -e

REPO_ROOT="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship"
SCRIPTS_DIR="$REPO_ROOT/scripts"

cd "$REPO_ROOT"

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     GHXSTSHIP PRODUCTION CLEANUP MASTER SCRIPT             ║"
echo "║     Zero Tolerance Codebase Cleanup                        ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "Started at: $(date)"
echo ""

# Make all scripts executable
chmod +x "$SCRIPTS_DIR"/*.sh

# Step 1: Fix ESLint Configuration
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 1: Fix ESLint Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
read -p "Fix ESLint i18n package configuration? (y/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
  bash "$SCRIPTS_DIR/fix-eslint-i18n.sh"
  echo "✓ ESLint configuration fixed"
else
  echo "⊘ Skipped ESLint fix"
fi
echo ""

# Step 2: Remove Legacy Files
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 2: Remove Legacy Files"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
read -p "Remove all legacy/backup files? (y/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
  bash "$SCRIPTS_DIR/cleanup-legacy-files.sh"
  echo "✓ Legacy files removed"
else
  echo "⊘ Skipped legacy file cleanup"
fi
echo ""

# Step 3: Remove Empty Directories
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 3: Remove Empty Directories"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
read -p "Remove all empty directories? (y/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
  bash "$SCRIPTS_DIR/cleanup-empty-directories.sh"
  echo "✓ Empty directories removed"
else
  echo "⊘ Skipped empty directory cleanup"
fi
echo ""

# Step 4: Audit Debug Code
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 4: Audit Debug Code"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
read -p "Generate debug code audit report? (y/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
  bash "$SCRIPTS_DIR/audit-debug-code.sh"
  echo "✓ Debug code audit complete"
else
  echo "⊘ Skipped debug code audit"
fi
echo ""

# Step 5: Run Prettier
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 5: Format Code with Prettier"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
read -p "Run Prettier to format all code? (y/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "Running Prettier..."
  npx prettier --write "**/*.{ts,tsx,js,jsx,json,md}" --ignore-path .gitignore || echo "⚠ Prettier completed with warnings"
  echo "✓ Code formatting complete"
else
  echo "⊘ Skipped code formatting"
fi
echo ""

# Step 6: Run ESLint
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 6: Run ESLint"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
read -p "Run ESLint across all packages? (y/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "Running ESLint..."
  npm run lint || echo "⚠ ESLint found issues - review output above"
  echo "✓ ESLint check complete"
else
  echo "⊘ Skipped ESLint"
fi
echo ""

# Step 7: TypeScript Type Check
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 7: TypeScript Type Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
read -p "Run TypeScript type check? (y/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "Running TypeScript check..."
  npm run build 2>&1 | tee typescript-errors.log || echo "⚠ TypeScript errors found - see typescript-errors.log"
  echo "✓ TypeScript check complete"
else
  echo "⊘ Skipped TypeScript check"
fi
echo ""

# Summary
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                    CLEANUP SUMMARY                         ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "Completed at: $(date)"
echo ""
echo "Next Steps:"
echo "1. Review generated reports in docs/ directory"
echo "2. Fix any remaining TypeScript errors (see typescript-errors.log)"
echo "3. Review debug code audit and remove console.log statements"
echo "4. Run 'npm run build' to verify production build"
echo "5. Commit all changes"
echo ""
echo "For detailed validation results, see:"
echo "  docs/E5_PRODUCTION_CLEANUP_VALIDATION.md"
echo ""
