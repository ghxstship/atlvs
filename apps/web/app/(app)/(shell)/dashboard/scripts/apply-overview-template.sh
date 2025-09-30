#!/bin/bash

# GHXSTSHIP Dashboard Template Application Script
# Applies the standardized overview template to all module overview pages

# Define the modules to update
MODULES=(
  "analytics"
  "assets" 
  "companies"
  "jobs"
  "people"
  "procurement"
  "programming"
  "files"
  "settings"
  "profile"
)

# Base directory
BASE_DIR="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ghxstship/apps/web/app/(app)/(shell)"

# Template content function
generate_overview_page() {
  local module=$1
  local module_title=$(echo "$module" | sed 's/\b\w/\u&/g')
  
  cat << EOF
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import OverviewTemplate from '../../dashboard/components/OverviewTemplate';
import { getModuleConfig } from '../../dashboard/lib/module-configs';

export const metadata = {
  title: '${module_title} - Overview',
  description: 'Comprehensive ${module} management dashboard with analytics, real-time metrics, and enterprise features.',
};

export default async function ${module_title}OverviewPage() {
  const supabase = await createClient();

  const {
    data: { session },
    error: authError,
  } = await supabase.auth.getSession();

  if (authError || !session) {
    redirect('/auth/signin');
  }

  // Get user profile and organization membership
  const { data: profile } = await supabase
    .from('users')
    .select(\`
      *,
      memberships!inner(
        organization_id,
        role,
        status,
        organization:organizations(
          id,
          name,
          slug
        )
      )
    \`)
    .eq('auth_id', session.user.id)
    .single();

  if (!profile || !profile.memberships?.[0]) {
    redirect('/auth/onboarding');
  }

  const orgId = profile.memberships[0].organization_id;
  const config = getModuleConfig('${module}');

  return (
    <OverviewTemplate
      orgId={orgId}
      userId={session.user.id}
      userEmail={session.user.email || ''}
      module="${module}"
      config={config}
    />
  );
}
EOF
}

echo "🚀 Starting GHXSTSHIP Dashboard Template Application..."
echo "📊 Applying standardized overview template to all modules"

# Apply template to each module
for module in "${MODULES[@]}"; do
  overview_dir="${BASE_DIR}/${module}/overview"
  overview_file="${overview_dir}/page.tsx"
  
  if [ -d "$overview_dir" ]; then
    echo "✅ Updating ${module} overview page..."
    
    # Backup existing file
    if [ -f "$overview_file" ]; then
      cp "$overview_file" "${overview_file}.backup"
      echo "   📋 Backed up existing file to ${overview_file}.backup"
    fi
    
    # Generate new content
    generate_overview_page "$module" > "$overview_file"
    echo "   🎯 Applied template to ${overview_file}"
  else
    echo "⚠️  Overview directory not found for ${module}: ${overview_dir}"
  fi
done

echo ""
echo "🎉 Template application complete!"
echo "📈 All module overview pages now use the standardized dashboard template"
echo ""
echo "✅ Features applied to all modules:"
echo "   • Unified authentication and session management"
echo "   • Standardized OverviewTemplate component"
echo "   • Module-specific configurations from module-configs.ts"
echo "   • Consistent metadata and SEO optimization"
echo "   • Enterprise-grade error handling and redirects"
echo ""
echo "🔧 Next steps:"
echo "   1. Test each module overview page"
echo "   2. Customize module-specific widgets as needed"
echo "   3. Validate 100% implementation across all areas"
echo ""
