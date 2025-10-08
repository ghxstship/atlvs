#!/bin/bash

# Comprehensive Legacy Component Modernization
# Updates ALL legacy component names to modern equivalents throughout the codebase

set -e

REPO_ROOT="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ATLVS"
WEB_ROOT="$REPO_ROOT/apps/web/app"

echo "=========================================="
echo "COMPREHENSIVE LEGACY COMPONENT MODERNIZATION"
echo "=========================================="
echo ""

# Find all TypeScript/TSX files in the app directory
FILES=$(find "$WEB_ROOT" -type f \( -name "*.tsx" -o -name "*.ts" \) ! -path "*/node_modules/*" ! -path "*/.next/*")

TOTAL_FILES=0
UPDATED_FILES=0

echo "Scanning all TypeScript files for legacy component usage..."
echo ""

for file in $FILES; do
  TOTAL_FILES=$((TOTAL_FILES + 1))
  CHANGED=false
  
  # Check if file contains any legacy component names
  if grep -qE 'ProgressBar|DynamicProgressBar|CompletionBar|BudgetUtilizationBar|StatusBadge|PriorityBadge|getStatusColor|getPriorityColor|animationPresets|designTokens' "$file"; then
    echo "Updating: ${file#$WEB_ROOT/}"
    
    # Replace component names in imports
    sed -i '' 's/DynamicProgressBar/Progress/g' "$file"
    sed -i '' 's/ProgressBar/Progress/g' "$file"
    sed -i '' 's/CompletionBar/Progress/g' "$file"
    sed -i '' 's/BudgetUtilizationBar/Progress/g' "$file"
    sed -i '' 's/StatusBadge/Badge/g' "$file"
    sed -i '' 's/PriorityBadge/Badge/g' "$file"
    
    # Remove legacy utility imports from import statements
    sed -i '' 's/, getStatusColor//g' "$file"
    sed -i '' 's/, getPriorityColor//g' "$file"
    sed -i '' 's/, animationPresets//g' "$file"
    sed -i '' 's/, animations//g' "$file"
    sed -i '' 's/, designTokens//g' "$file"
    sed -i '' 's/, combineAnimations//g' "$file"
    
    # Clean up double commas that might result
    sed -i '' 's/,  ,/,/g' "$file"
    sed -i '' 's/, ,/,/g' "$file"
    
    # Clean up trailing commas in imports
    sed -i '' 's/,  }/}/g' "$file"
    sed -i '' 's/, }/}/g' "$file"
    
    UPDATED_FILES=$((UPDATED_FILES + 1))
    CHANGED=true
  fi
  
  # Update Progress component prop usage patterns
  if grep -q '<Progress' "$file"; then
    # Convert percentage= to value=
    sed -i '' 's/<Progress percentage=/<Progress value=/g' "$file"
    sed -i '' 's/percentage={/value={/g' "$file"
    
    # Convert utilized/total pattern to calculated percentage with variant
    # Pattern: utilized={x} total={y} -> value={(x/y)*100} variant="..."
    # This is complex, so we'll flag files that need manual review
    if grep -q 'utilized=' "$file"; then
      echo "  ⚠️  Manual review needed: 'utilized' prop usage (convert to calculated percentage)"
    fi
    
    if grep -q 'completed=' "$file"; then
      echo "  ⚠️  Manual review needed: 'completed' prop usage (convert to calculated percentage)"
    fi
  fi
done

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
echo "Note: Some files may need manual review for complex prop conversions"
echo "      Search for 'utilized=' or 'completed=' props in Progress components"
echo ""
