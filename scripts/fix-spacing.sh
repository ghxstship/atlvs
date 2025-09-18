#!/bin/bash

# GHXSTSHIP Comprehensive Spacing Fix Script
# Migrates all hardcoded Tailwind spacing to semantic design tokens

echo "🚀 Starting comprehensive spacing migration..."
echo "Target: 752 violations across 426+ files"

# Change to repository root
cd "$(dirname "$0")/../ghxstship" || exit 1

# Counter variables
TOTAL_FILES=0
MODIFIED_FILES=0

# Function to process files
process_files() {
    echo "📁 Processing TypeScript and React files..."
    
    # Find all .ts, .tsx, .js, .jsx files
    find . \( -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" \) \
        -not -path "./node_modules/*" \
        -not -path "./.next/*" \
        -not -path "./dist/*" \
        -not -path "./build/*" | while read -r file; do
        
        TOTAL_FILES=$((TOTAL_FILES + 1))
        
        # Check if file contains hardcoded spacing
        if grep -qE '\b(p|m|gap|space)-(1|2|3|4|5|6|8|10|12|16)\b' "$file"; then
            echo "  🔧 Fixing: $file"
            MODIFIED_FILES=$((MODIFIED_FILES + 1))
            
            # Apply comprehensive spacing migrations
            sed -i '' \
                -e 's/\bp-0\b/p-0/g' \
                -e 's/\bp-1\b/p-xs/g' \
                -e 's/\bp-2\b/p-xs/g' \
                -e 's/\bp-3\b/p-sm/g' \
                -e 's/\bp-4\b/p-md/g' \
                -e 's/\bp-5\b/p-lg/g' \
                -e 's/\bp-6\b/p-lg/g' \
                -e 's/\bp-8\b/p-xl/g' \
                -e 's/\bp-10\b/p-xl/g' \
                -e 's/\bp-12\b/p-2xl/g' \
                -e 's/\bp-16\b/p-3xl/g' \
                -e 's/\bpx-0\b/px-0/g' \
                -e 's/\bpx-1\b/px-xs/g' \
                -e 's/\bpx-2\b/px-xs/g' \
                -e 's/\bpx-3\b/px-sm/g' \
                -e 's/\bpx-4\b/px-md/g' \
                -e 's/\bpx-5\b/px-lg/g' \
                -e 's/\bpx-6\b/px-lg/g' \
                -e 's/\bpx-8\b/px-xl/g' \
                -e 's/\bpy-0\b/py-0/g' \
                -e 's/\bpy-1\b/py-xs/g' \
                -e 's/\bpy-2\b/py-xs/g' \
                -e 's/\bpy-3\b/py-sm/g' \
                -e 's/\bpy-4\b/py-md/g' \
                -e 's/\bpy-5\b/py-lg/g' \
                -e 's/\bpy-6\b/py-lg/g' \
                -e 's/\bpy-8\b/py-xl/g' \
                -e 's/\bpt-0\b/pt-0/g' \
                -e 's/\bpt-1\b/pt-xs/g' \
                -e 's/\bpt-2\b/pt-xs/g' \
                -e 's/\bpt-3\b/pt-sm/g' \
                -e 's/\bpt-4\b/pt-md/g' \
                -e 's/\bpt-6\b/pt-lg/g' \
                -e 's/\bpt-8\b/pt-xl/g' \
                -e 's/\bpb-0\b/pb-0/g' \
                -e 's/\bpb-1\b/pb-xs/g' \
                -e 's/\bpb-2\b/pb-xs/g' \
                -e 's/\bpb-3\b/pb-sm/g' \
                -e 's/\bpb-4\b/pb-md/g' \
                -e 's/\bpb-6\b/pb-lg/g' \
                -e 's/\bpb-8\b/pb-xl/g' \
                -e 's/\bpl-0\b/pl-0/g' \
                -e 's/\bpl-1\b/pl-xs/g' \
                -e 's/\bpl-2\b/pl-xs/g' \
                -e 's/\bpl-3\b/pl-sm/g' \
                -e 's/\bpl-4\b/pl-md/g' \
                -e 's/\bpl-6\b/pl-lg/g' \
                -e 's/\bpl-8\b/pl-xl/g' \
                -e 's/\bpr-0\b/pr-0/g' \
                -e 's/\bpr-1\b/pr-xs/g' \
                -e 's/\bpr-2\b/pr-xs/g' \
                -e 's/\bpr-3\b/pr-sm/g' \
                -e 's/\bpr-4\b/pr-md/g' \
                -e 's/\bpr-6\b/pr-lg/g' \
                -e 's/\bpr-8\b/pr-xl/g' \
                -e 's/\bm-0\b/m-0/g' \
                -e 's/\bm-1\b/m-xs/g' \
                -e 's/\bm-2\b/m-xs/g' \
                -e 's/\bm-3\b/m-sm/g' \
                -e 's/\bm-4\b/m-md/g' \
                -e 's/\bm-6\b/m-lg/g' \
                -e 's/\bm-8\b/m-xl/g' \
                -e 's/\bmx-0\b/mx-0/g' \
                -e 's/\bmx-1\b/mx-xs/g' \
                -e 's/\bmx-2\b/mx-xs/g' \
                -e 's/\bmx-3\b/mx-sm/g' \
                -e 's/\bmx-4\b/mx-md/g' \
                -e 's/\bmx-6\b/mx-lg/g' \
                -e 's/\bmx-auto\b/mx-auto/g' \
                -e 's/\bmy-0\b/my-0/g' \
                -e 's/\bmy-1\b/my-xs/g' \
                -e 's/\bmy-2\b/my-xs/g' \
                -e 's/\bmy-3\b/my-sm/g' \
                -e 's/\bmy-4\b/my-md/g' \
                -e 's/\bmy-6\b/my-lg/g' \
                -e 's/\bmy-8\b/my-xl/g' \
                -e 's/\bmt-0\b/mt-0/g' \
                -e 's/\bmt-1\b/mt-xs/g' \
                -e 's/\bmt-2\b/mt-xs/g' \
                -e 's/\bmt-3\b/mt-sm/g' \
                -e 's/\bmt-4\b/mt-md/g' \
                -e 's/\bmt-6\b/mt-lg/g' \
                -e 's/\bmt-8\b/mt-xl/g' \
                -e 's/\bmb-0\b/mb-0/g' \
                -e 's/\bmb-1\b/mb-xs/g' \
                -e 's/\bmb-2\b/mb-xs/g' \
                -e 's/\bmb-3\b/mb-sm/g' \
                -e 's/\bmb-4\b/mb-md/g' \
                -e 's/\bmb-6\b/mb-lg/g' \
                -e 's/\bmb-8\b/mb-xl/g' \
                -e 's/\bml-0\b/ml-0/g' \
                -e 's/\bml-1\b/ml-xs/g' \
                -e 's/\bml-2\b/ml-xs/g' \
                -e 's/\bml-3\b/ml-sm/g' \
                -e 's/\bml-4\b/ml-md/g' \
                -e 's/\bml-6\b/ml-lg/g' \
                -e 's/\bml-auto\b/ml-auto/g' \
                -e 's/\bmr-0\b/mr-0/g' \
                -e 's/\bmr-1\b/mr-xs/g' \
                -e 's/\bmr-2\b/mr-xs/g' \
                -e 's/\bmr-3\b/mr-sm/g' \
                -e 's/\bmr-4\b/mr-md/g' \
                -e 's/\bmr-6\b/mr-lg/g' \
                -e 's/\bmr-auto\b/mr-auto/g' \
                -e 's/\bgap-0\b/gap-0/g' \
                -e 's/\bgap-1\b/gap-xs/g' \
                -e 's/\bgap-2\b/gap-xs/g' \
                -e 's/\bgap-3\b/gap-sm/g' \
                -e 's/\bgap-4\b/gap-md/g' \
                -e 's/\bgap-5\b/gap-lg/g' \
                -e 's/\bgap-6\b/gap-lg/g' \
                -e 's/\bgap-8\b/gap-xl/g' \
                -e 's/\bgap-x-0\b/gap-x-0/g' \
                -e 's/\bgap-x-1\b/gap-x-xs/g' \
                -e 's/\bgap-x-2\b/gap-x-xs/g' \
                -e 's/\bgap-x-3\b/gap-x-sm/g' \
                -e 's/\bgap-x-4\b/gap-x-md/g' \
                -e 's/\bgap-x-6\b/gap-x-lg/g' \
                -e 's/\bgap-y-0\b/gap-y-0/g' \
                -e 's/\bgap-y-1\b/gap-y-xs/g' \
                -e 's/\bgap-y-2\b/gap-y-xs/g' \
                -e 's/\bgap-y-3\b/gap-y-sm/g' \
                -e 's/\bgap-y-4\b/gap-y-md/g' \
                -e 's/\bgap-y-6\b/gap-y-lg/g' \
                -e 's/\bspace-x-0\b/space-x-0/g' \
                -e 's/\bspace-x-1\b/space-x-xs/g' \
                -e 's/\bspace-x-2\b/space-x-xs/g' \
                -e 's/\bspace-x-3\b/space-x-sm/g' \
                -e 's/\bspace-x-4\b/space-x-md/g' \
                -e 's/\bspace-x-6\b/space-x-lg/g' \
                -e 's/\bspace-y-0\b/space-y-0/g' \
                -e 's/\bspace-y-1\b/space-y-xs/g' \
                -e 's/\bspace-y-2\b/space-y-xs/g' \
                -e 's/\bspace-y-3\b/space-y-sm/g' \
                -e 's/\bspace-y-4\b/space-y-md/g' \
                -e 's/\bspace-y-6\b/space-y-lg/g' \
                "$file"
        fi
    done
}

# Run the migration
process_files

echo ""
echo "✅ Spacing migration complete!"
echo "📊 Files processed: $TOTAL_FILES"
echo "🔧 Files modified: $MODIFIED_FILES"
echo ""
echo "Next steps:"
echo "1. Review changes with: git diff"
echo "2. Run tests to ensure no breakage"
echo "3. Commit changes"
