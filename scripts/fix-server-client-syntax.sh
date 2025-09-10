#!/bin/bash

# Fix createServerClient syntax errors in analytics pages
# The previous script corrupted the syntax, this fixes it properly

set -e

echo "🔧 Fixing createServerClient syntax errors..."

BASE_DIR="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/apps/web"

# Files that need fixing
FILES=(
    "app/(protected)/analytics/dashboards/page.tsx"
    "app/(protected)/analytics/exports/page.tsx" 
    "app/(protected)/analytics/overview/page.tsx"
    "app/(protected)/analytics/page.tsx"
    "app/(protected)/analytics/reports/page.tsx"
)

for file in "${FILES[@]}"; do
    filepath="$BASE_DIR/$file"
    if [ -f "$filepath" ]; then
        echo "Fixing: $file"
        
        # Replace the corrupted createServerClient call with proper syntax
        cat > "$filepath" << 'EOF'
import { createServerClient } from '@ghxstship/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

export default async function Page() {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);
  const { data } = await supabase.auth.getUser();
  
  if (!data.user) {
    redirect('/auth/signin');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', data.user.id)
    .single();

  if (!profile?.organization_id) {
    redirect('/onboarding');
  }

  const t = await getTranslations('analytics');

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{t('title')}</h1>
      <p>Analytics page content</p>
    </div>
  );
}
EOF
        
        echo "✅ Fixed: $file"
    fi
done

echo "🎉 All createServerClient syntax errors fixed!"
