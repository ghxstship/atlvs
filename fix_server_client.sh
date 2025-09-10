#!/bin/bash

# Files to fix
files=(
  "apps/web/app/(protected)/jobs/bids/page.tsx"
  "apps/web/app/(protected)/jobs/compliance/page.tsx"
  "apps/web/app/(protected)/jobs/contracts/page.tsx"
  "apps/web/app/(protected)/jobs/opportunities/page.tsx"
  "apps/web/app/(protected)/jobs/overview/page.tsx"
  "apps/web/app/(protected)/jobs/rfps/page.tsx"
)

for file in "${files[@]}"; do
  echo "Fixing $file..."
  
  # Replace the import
  sed -i '' "s|import { createServerClient } from '@ghxstship/auth/server';|import { createServerClient } from '@ghxstship/auth';\nimport { cookies } from 'next/headers';|g" "$file"
  
  # Replace the createServerClient() call
  sed -i '' "s|const supabase = createServerClient();|const cookieStore = cookies();\n  const supabase = createServerClient({\n    get: (name: string) => {\n      const c = cookieStore.get(name);\n      return c ? { name: c.name, value: c.value } : undefined;\n    },\n    set: (name: string, value: string, options: any) => {\n      cookieStore.set(name, value, options);\n    },\n    remove: (name: string, options: any) => {\n      cookieStore.delete(name);\n    }\n  });|g" "$file"
done

echo "All files fixed!"
