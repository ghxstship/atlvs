#!/bin/bash

# Ultimate script to fix all remaining createServerClient syntax errors
echo "🔧 Starting ultimate createServerClient syntax fix..."

# Find all files with malformed createServerClient patterns
echo "📁 Scanning for files with syntax errors..."

# Pattern 1: Files with '}){' syntax error
find . -name "*.tsx" -type f -exec grep -l '}){' {} \; | while read file; do
    echo "🔨 Fixing syntax error in: $file"
    
    # Use sed to fix the malformed createServerClient calls
    sed -i '' '/const supabase = createServerClient(/,/});/c\
  const supabase = createServerClient(cookieStore);
' "$file"
done

# Pattern 2: Files with multi-line createServerClient calls that are malformed
find . -name "*.tsx" -type f -exec grep -l "createServerClient(" {} \; | while read file; do
    # Check if file contains malformed patterns
    if grep -q "process\.env\.NEXT_PUBLIC_SUPABASE_URL" "$file" && grep -q "cookies: {" "$file"; then
        echo "🔨 Fixing multi-line createServerClient in: $file"
        
        # Replace the entire malformed block with correct usage
        sed -i '' '/const supabase = createServerClient(/,/});/c\
  const supabase = createServerClient(cookieStore);
' "$file"
    fi
done

# Pattern 3: Specific files mentioned in error output
files_to_fix=(
    "./app/(protected)/companies/ratings/page.tsx"
    "./app/(protected)/dashboard/overview/page.tsx"
    "./app/(protected)/finance/accounts/page.tsx"
    "./app/(protected)/finance/budgets/page.tsx"
    "./app/(protected)/finance/expenses/page.tsx"
)

for file in "${files_to_fix[@]}"; do
    if [ -f "$file" ]; then
        echo "🔨 Fixing specific file: $file"
        
        # Read the file and fix the createServerClient call
        temp_file=$(mktemp)
        awk '
        /const supabase = createServerClient\(/ {
            print "  const supabase = createServerClient(cookieStore);"
            # Skip lines until we find the closing });
            while (getline > 0) {
                if (/^[[:space:]]*\}\);[[:space:]]*$/) {
                    break
                }
            }
            next
        }
        { print }
        ' "$file" > "$temp_file"
        
        mv "$temp_file" "$file"
    fi
done

# Pattern 4: Use a more aggressive approach for any remaining issues
echo "🔍 Final cleanup pass..."

find . -name "*.tsx" -type f -exec grep -l "createServerClient" {} \; | while read file; do
    # Check if the file still has syntax issues
    if grep -q '}){' "$file" || (grep -q "createServerClient(" "$file" && grep -q "process\.env\.NEXT_PUBLIC_SUPABASE_URL" "$file"); then
        echo "🔨 Final fix for: $file"
        
        # Create a clean version
        temp_file=$(mktemp)
        
        # Process the file line by line
        in_server_client_block=false
        while IFS= read -r line; do
            if [[ "$line" =~ "const supabase = createServerClient(" ]]; then
                echo "  const supabase = createServerClient(cookieStore);" >> "$temp_file"
                in_server_client_block=true
            elif [[ "$in_server_client_block" == true ]]; then
                if [[ "$line" =~ "});" ]] || [[ "$line" =~ "^[[:space:]]*\}[[:space:]]*$" ]]; then
                    in_server_client_block=false
                fi
                # Skip lines in the server client block
            else
                echo "$line" >> "$temp_file"
            fi
        done < "$file"
        
        mv "$temp_file" "$file"
    fi
done

echo "✅ Ultimate createServerClient fix completed!"
echo "🧪 Running syntax check..."

# Quick syntax check on a few key files
for file in "${files_to_fix[@]}"; do
    if [ -f "$file" ]; then
        if node -c "$file" 2>/dev/null; then
            echo "✅ $file - syntax OK"
        else
            echo "❌ $file - syntax issues remain"
        fi
    fi
done

echo "🎯 Fix complete! Ready for build test."
