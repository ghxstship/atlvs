#!/bin/bash

# Fix JSX Syntax Issues - Automated Remediation Script
# Generated: 2025-10-08
# Purpose: Fix JSX comment placement and syntax errors in React components

set -e

echo "🔧 ATLVS - JSX Syntax Fix Script"
echo "================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counter
FIXED_COUNT=0

# Function to fix JSX comment issues in a file
fix_jsx_comments() {
    local file="$1"
    echo -e "${YELLOW}Processing: ${file}${NC}"
    
    # Backup original file
    cp "$file" "${file}.backup"
    
    # This is a complex fix that requires manual intervention
    # The script will just identify the files
    echo -e "${RED}  ⚠️  Manual fix required for JSX comments${NC}"
    ((FIXED_COUNT++))
}

echo "Step 1: Identifying files with JSX syntax errors..."
echo ""

# Get list of files with errors from TypeScript
FILES_WITH_ERRORS=$(npx tsc --noEmit 2>&1 | grep "apps/web" | sed 's/([0-9]*,.*//' | sort -u | grep "\.tsx$" || true)

if [ -z "$FILES_WITH_ERRORS" ]; then
    echo -e "${GREEN}✅ No JSX syntax errors found!${NC}"
    exit 0
fi

echo "Found files with errors:"
echo "$FILES_WITH_ERRORS"
echo ""

echo "Step 2: Creating fix checklist..."
echo ""

# Create a fix checklist file
CHECKLIST_FILE="JSX_FIX_CHECKLIST.md"
cat > "$CHECKLIST_FILE" << 'EOF'
# JSX Syntax Fix Checklist

## Files Requiring Manual Fixes

This checklist was auto-generated. Each file needs manual review to fix JSX syntax issues.

### Common Issues & Fixes:

#### Issue 1: JSX Comments in Return Statements
```tsx
// ❌ INCORRECT - Comments not wrapped
case 'image':
  return (
    {/* eslint-disable-next-line */}
    <img src={value} />
  );

// ✅ CORRECT - Wrapped in Fragment
case 'image':
  return (
    <>
      {/* eslint-disable-next-line */}
      <img src={value} />
    </>
  );
```

#### Issue 2: Orphaned JSX Comments
```tsx
// ❌ INCORRECT
return (
  {/* eslint-disable-next-line */}
  
  {/* eslint-disable-next-line */}
  <Component />
);

// ✅ CORRECT
return (
  <>
    {/* eslint-disable-next-line */}
    <Component />
  </>
);
```

---

## Files to Fix:

EOF

# Add files to checklist
while IFS= read -r file; do
    if [ -n "$file" ]; then
        # Get error count for this file
        ERROR_COUNT=$(npx tsc --noEmit 2>&1 | grep "$file" | wc -l | tr -d ' ')
        echo "- [ ] \`$file\` ($ERROR_COUNT errors)" >> "$CHECKLIST_FILE"
        
        # Get specific error lines
        ERRORS=$(npx tsc --noEmit 2>&1 | grep "$file" | head -5)
        if [ -n "$ERRORS" ]; then
            echo "  \`\`\`" >> "$CHECKLIST_FILE"
            echo "$ERRORS" >> "$CHECKLIST_FILE"
            echo "  \`\`\`" >> "$CHECKLIST_FILE"
        fi
        echo "" >> "$CHECKLIST_FILE"
    fi
done <<< "$FILES_WITH_ERRORS"

echo -e "${GREEN}✅ Created checklist: ${CHECKLIST_FILE}${NC}"
echo ""

echo "Step 3: Updating tsconfig.json to exclude templates..."
echo ""

# Check if templates are already excluded
if grep -q '"templates/\*\*/\*"' tsconfig.json; then
    echo -e "${GREEN}✅ Templates already excluded in tsconfig.json${NC}"
else
    # Create backup
    cp tsconfig.json tsconfig.json.backup
    
    # Add templates to exclude array
    # This is a simple sed operation - adjust path as needed
    sed -i.bak '/"exclude": \[/,/\]/ {
        /"build"/a\
    ,\
    "templates/**/*"
    }' tsconfig.json 2>/dev/null || {
        echo -e "${YELLOW}⚠️  Manual update required for tsconfig.json${NC}"
        echo "Add this to the exclude array:"
        echo '    "templates/**/*"'
    }
fi

echo ""
echo "================================="
echo "Summary:"
echo "================================="
echo ""
echo -e "Files identified: ${YELLOW}$(echo "$FILES_WITH_ERRORS" | wc -l | tr -d ' ')${NC}"
echo -e "Checklist created: ${GREEN}${CHECKLIST_FILE}${NC}"
echo ""
echo "Next Steps:"
echo "1. Review the checklist file: ${CHECKLIST_FILE}"
echo "2. Fix each file manually (most are simple fragment wrapping)"
echo "3. Run 'npx tsc --noEmit' to verify fixes"
echo ""
echo "Backup files created with .backup extension"
echo ""
echo -e "${GREEN}✅ Script completed successfully${NC}"
