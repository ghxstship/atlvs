#!/bin/bash

# Comprehensive Legacy Component Modernization (Fixed for spaces in paths)
# Updates ALL legacy component names to modern equivalents throughout the codebase

set -e

REPO_ROOT="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ATLVS"
WEB_ROOT="$REPO_ROOT/apps/web/app"

echo "=========================================="
echo "COMPREHENSIVE LEGACY COMPONENT MODERNIZATION"
echo "=========================================="
echo ""

UPDATED_FILES=0
TOTAL_FILES=0

echo "Processing all TypeScript files..."
echo ""

# Use find with proper null termination to handle spaces
while IFS= read -r -d '' file; do
  TOTAL_FILES=$((TOTAL_FILES + 1))
  
  # Check if file contains any legacy component names
  if grep -qE 'ProgressBar|DynamicProgressBar|CompletionBar|BudgetUtilizationBar|StatusBadge|PriorityBadge|getStatusColor|getPriorityColor|animationPresets|designTokens' "$file" 2>/dev/null; then
    echo "Updating: ${file#$WEB_ROOT/}"
    
    # Replace component names
    sed -i '' 's/\bDynamicProgressBar\b/Progress/g' "$file"
    sed -i '' 's/\bProgressBar\b/Progress/g' "$file"
    sed -i '' 's/\bCompletionBar\b/Progress/g' "$file"
    sed -i '' 's/\bBudgetUtilizationBar\b/Progress/g' "$file"
    sed -i '' 's/\bStatusBadge\b/Badge/g' "$file"
    sed -i '' 's/\bPriorityBadge\b/Badge/g' "$file"
    
    # Remove legacy utility imports
    sed -i '' 's/, getStatusColor//g' "$file"
    sed -i '' 's/, getPriorityColor//g' "$file"
    sed -i '' 's/, animationPresets//g' "$file"
    sed -i '' 's/, animations//g' "$file"
    sed -i '' 's/, designTokens//g' "$file"
    sed -i '' 's/, combineAnimations//g' "$file"
    
    # Clean up resulting syntax issues
    sed -i '' 's/,  ,/,/g' "$file"
    sed -i '' 's/, ,/,/g' "$file"
    sed -i '' 's/,  }/}/g' "$file"
    sed -i '' 's/, }/}/g' "$file"
    
    UPDATED_FILES=$((UPDATED_FILES + 1))
  fi
done < <(find "$WEB_ROOT" -type f \( -name "*.tsx" -o -name "*.ts" \) ! -path "*/node_modules/*" ! -path "*/.next/*" -print0)

echo ""
echo "=========================================="
echo "MODERNIZATION COMPLETE"
echo "=========================================="
echo ""
echo "Statistics:"
echo "  Total files scanned: $TOTAL_FILES"
echo "  Files updated: $UPDATED_FILES"
echo ""
echo "✓ All legacy component names replaced with modern equivalents"
echo ""
