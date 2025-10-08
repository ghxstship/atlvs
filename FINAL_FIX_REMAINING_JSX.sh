#!/bin/bash

# Final automated JSX syntax fixer
# Fixes all remaining JSX comment issues

set -e

cd "/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ATLVS"

echo "🔧 Fixing all remaining JSX syntax errors..."
echo ""

# Files to fix (from TypeScript errors)
declare -a FILES=(
  "apps/web/app/(app)/(shell)/assets/views/CardView.tsx"
  "apps/web/app/(app)/(shell)/assets/views/KanbanView.tsx"
  "apps/web/app/(app)/(shell)/assets/views/ListView.tsx"
  "apps/web/app/(app)/(shell)/assets/views/TableView.tsx"
  "apps/web/app/(app)/(shell)/companies/directory/views/DirectoryGridView.tsx"
  "apps/web/app/(app)/(shell)/companies/directory/views/DirectoryListView.tsx"
  "apps/web/app/(app)/(shell)/files/media/MediaClient.tsx"
  "apps/web/app/(app)/(shell)/files/media/views/MediaGridView.tsx"
  "apps/web/app/(app)/(shell)/files/views/GalleryView.tsx"
  "apps/web/app/(app)/(shell)/jobs/assignments/AssignmentsClient.tsx"
  "apps/web/app/(app)/(shell)/marketplace/settings/SettingsClient.tsx"
  "apps/web/app/(app)/(shell)/marketplace/views/GalleryView.tsx"
  "apps/web/app/(app)/(shell)/profile/basic/BasicInfoClient.tsx"
  "apps/web/app/(app)/(shell)/profile/basic/views/ProfileCardView.tsx"
  "apps/web/app/(app)/(shell)/profile/basic/views/ProfileFormView.tsx"
  "apps/web/app/(app)/(shell)/profile/basic/views/ProfileTableView.tsx"
  "apps/web/app/(app)/(shell)/profile/views/ProfileCalendarView.tsx"
  "apps/web/app/(app)/(shell)/profile/views/ProfileGridView.tsx"
  "apps/web/app/(app)/(shell)/profile/views/ProfileKanbanView.tsx"
  "apps/web/app/(app)/(shell)/profile/views/ProfileListView.tsx"
  "apps/web/app/(app)/(shell)/profile/views/ProfileTableView.tsx"
  "apps/web/app/(app)/(shell)/programming/calendar/drawers/ViewProgrammingEventDrawer.tsx"
  "apps/web/app/(app)/(shell)/programming/views/GalleryView.tsx"
  "apps/web/app/(app)/(shell)/projects/locations/views/LocationGalleryView.tsx"
  "apps/web/app/(app)/(shell)/projects/views/GalleryView.tsx"
  "apps/web/app/(app)/(shell)/settings/components/OrganizationSettings.tsx"
)

FIXED=0
SKIPPED=0

for file in "${FILES[@]}"; do
  if [ ! -f "$file" ]; then
    echo "⚠️  File not found: $file"
    ((SKIPPED++))
    continue
  fi
  
  echo "Processing: $file"
  
  # Read the file
  content=$(cat "$file")
  
  # Pattern 1: Fix JSX comments before img tags (wrapped in conditional/ternary)
  # This handles: {condition ? ( {/* comment */} <img /> ) : ...}
  if echo "$content" | grep -q '{/\* eslint-disable-next-line'; then
    # Use sed to fix the pattern
    sed -i.bak -E '
      # When we see a line with just a JSX comment after an opening paren
      /\(\s*$/,/^\s*\)/ {
        # If next line is a JSX comment
        /^\s*\{\/\*.*\*\/\}\s*$/ {
          # Read next line
          N
          # If its blank or another comment
          /\n\s*$/ {
            N
          }
          /\n\s*\{\/\*.*\*\/\}/ {
            N
          }
          # If followed by img tag
          /\n\s*<img/ {
            # Insert fragment wrapper
            s/\(\s*\n\s*\{/(\n          <>\n            {/
            s/<img\s+src=/<img\n              src=/
            # Will need to close fragment
          }
        }
      }
    ' "$file"
    
    # Simpler approach: Use perl for multi-line replacement
    perl -i -p0e '
      # Pattern: opening paren, JSX comments, img tag
      s/\?\s*\(\s*\n\s*(\{\/\*[^}]*\})\s*\n\s*\{\/\*[^}]*\}\s*\n\s*<img\s+src=/? (\n                  <>\n                    $1\n                    <img\n                      src=/g;
      
      # Fix closing for images in conditionals
      s/(<img[^>]*\/>)\s*\n\s*\)\s*:/\1\n                  <\/>\n                ) :/g;
      
      # Pattern for return statements
      s/return\s*\(\s*\n\s*(\{\/\*[^}]*\})\s*\n\s*\{\/\*[^}]*\}\s*\n\s*<img/return (\n          <>\n            $1\n            <img/g;
    ' "$file"
    
    rm -f "$file.bak"
    ((FIXED++))
    echo "✅ Fixed: $file"
  else
    echo "⏭️  No JSX comments found: $file"
    ((SKIPPED++))
  fi
done

echo ""
echo "================================="
echo "Summary:"
echo "  Fixed: $FIXED files"
echo "  Skipped: $SKIPPED files"
echo "================================="
echo ""
echo "Running TypeScript check..."
npx tsc --noEmit 2>&1 | head -20
echo ""
echo "✨ Complete! Check errors above."
