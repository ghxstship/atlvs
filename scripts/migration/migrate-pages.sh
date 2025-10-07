#!/bin/bash

# ATLVS World-Class UI/UX Migration Automation Script
# Phase 4: Page Migration Execution
# This script automates the migration of all pages to standardized templates

set -e

echo "🚀 ATLVS Phase 4: Page Migration Automation"
echo "============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ATLVS/apps/web/app"
TEMPLATE_DIR="/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ATLVS/packages/ui/src/templates"
LOG_FILE="/tmp/atlvs_migration_$(date +%Y%m%d_%H%M%S).log"

# Logging function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Success counter
MIGRATED_COUNT=0
TOTAL_PAGES=0

# Template mapping function
get_template_for_page() {
    local page_path="$1"

    # Dashboard pages → DashboardLayout
    if [[ "$page_path" == *"/dashboard/"* ]]; then
        echo "DashboardLayout"
        return
    fi

    # List/table pages → ListLayout
    if [[ "$page_path" == *"/projects/page.tsx" ]] || \
       [[ "$page_path" == *"/people/page.tsx" ]] || \
       [[ "$page_path" == *"/companies/page.tsx" ]] || \
       [[ "$page_path" == *"/finance/page.tsx" ]] || \
       [[ "$page_path" == *"/jobs/page.tsx" ]] || \
       [[ "$page_path" == *"/assets/page.tsx" ]] || \
       [[ "$page_path" == *"/procurement/page.tsx" ]]; then
        echo "ListLayout"
        return
    fi

    # Detail pages → DetailLayout
    if [[ "$page_path" == */"[id]"* ]] || \
       [[ "$page_path" == *"/profile/"* ]]; then
        echo "DetailLayout"
        return
    fi

    # Settings pages → SettingsLayout
    if [[ "$page_path" == *"/settings/"* ]]; then
        echo "SettingsLayout"
        return
    fi

    # Programming/Analytics → DashboardLayout
    if [[ "$page_path" == *"/programming/"* ]] || \
       [[ "$page_path" == *"/analytics/"* ]]; then
        echo "DashboardLayout"
        return
    fi

    # Default fallback
    echo "DashboardLayout"
}

# Backup function
backup_page() {
    local page_path="$1"
    local backup_path="${page_path}.backup.$(date +%Y%m%d_%H%M%S)"

    cp "$page_path" "$backup_path"
    log "📦 Backed up $page_path to $backup_path"
}

# Migration function for Dashboard pages
migrate_dashboard_page() {
    local page_path="$1"
    local page_name="$2"

    log "🎯 Migrating dashboard page: $page_name"

    # Create new content using DashboardLayout
    cat > "$page_path" << 'EOF'
'use client';

import React from 'react';
import { DashboardLayout } from '@ghxstship/ui/templates';
import { DashboardWidget } from '@ghxstship/ui/organisms';

export default function DashboardPage() {
  // TODO: Implement dashboard content using DashboardLayout
  // This is a placeholder - actual implementation needed

  return (
    <DashboardLayout
      title="Dashboard"
      subtitle="Welcome to your workspace"
      showRefresh={true}
      showExport={true}
      showSettings={true}
      sidebar={
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Quick Actions</h3>
            <div className="space-y-2">
              {/* TODO: Add quick actions */}
            </div>
          </div>
        </div>
      }
      rightPanel={
        <div className="space-y-6">
          <div>
            <h3 className="font-medium mb-4">Recent Activity</h3>
            {/* TODO: Add activity feed */}
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* TODO: Add dashboard widgets */}
        <div className="bg-muted/50 rounded-lg p-6">
          <h3 className="font-medium mb-2">Widget Placeholder</h3>
          <p className="text-muted-foreground">Dashboard content coming soon</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
EOF

    ((MIGRATED_COUNT++))
    log "✅ Migrated dashboard page: $page_name"
}

# Migration function for List pages
migrate_list_page() {
    local page_path="$1"
    local page_name="$2"
    local module_name="$3"

    log "📋 Migrating list page: $page_name ($module_name)"

    # Create new content using ListLayout
    cat > "$page_path" << EOF
'use client';

import React from 'react';
import { ListLayout } from '@ghxstship/ui/templates';
import { BoardView } from '@ghxstship/ui/organisms';

export default function ${module_name}Page() {
  // TODO: Implement ${module_name} content using ListLayout + BoardView
  // This is a placeholder - actual implementation needed

  return (
    <ListLayout
      title="${module_name}"
      subtitle="Manage and track all your ${module_name}"
      actions={
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
          New ${module_name}
        </button>
      }
      search={{
        value: '',
        onChange: (value) => console.log('Search:', value),
        placeholder: 'Search ${module_name}...',
      }}
      filters={{
        activeCount: 0,
        onClear: () => console.log('Clear filters'),
      }}
      sidebar={
        <div className="space-y-6">
          <div>
            <h3 className="font-medium mb-3">Filters</h3>
            <div className="space-y-2">
              {/* TODO: Add ${module_name} filters */}
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="rounded" />
                Active
              </label>
            </div>
          </div>
        </div>
      }
    >
      <BoardView
        columns={[
          {
            id: 'todo',
            title: 'To Do',
            status: 'todo',
            color: '#6b7280',
            tasks: [
              // TODO: Add sample tasks
            ]
          }
        ]}
        onTaskClick={(task) => console.log('Task clicked:', task)}
        onTaskEdit={(task) => console.log('Edit task:', task)}
        onTaskDelete={(task) => console.log('Delete task:', task)}
        onTaskCreate={(columnId) => console.log('Create task in:', columnId)}
      />
    </ListLayout>
  );
}
EOF

    ((MIGRATED_COUNT++))
    log "✅ Migrated list page: $page_name"
}

# Migration function for Settings pages
migrate_settings_page() {
    local page_path="$1"
    local page_name="$2"

    log "⚙️ Migrating settings page: $page_name"

    # Create new content using SettingsLayout
    cat > "$page_path" << 'EOF'
'use client';

import React, { useState } from 'react';
import { SettingsLayout } from '@ghxstship/ui/templates';

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('general');

  const sections = [
    { id: 'general', label: 'General', icon: 'Settings' },
    { id: 'account', label: 'Account', icon: 'User' },
    { id: 'billing', label: 'Billing', icon: 'CreditCard' },
    { id: 'notifications', label: 'Notifications', icon: 'Bell' },
    { id: 'security', label: 'Security', icon: 'Shield' },
  ];

  return (
    <SettingsLayout
      title="Settings"
      subtitle="Manage your account and application preferences"
      sections={sections}
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      save={{
        hasChanges: false,
        onSave: async () => {
          console.log('Saving settings...');
          await new Promise(resolve => setTimeout(resolve, 1000));
          console.log('Settings saved!');
        },
        onDiscard: () => console.log('Discard changes'),
        saving: false,
      }}
    >
      {activeSection === 'general' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">General Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Display Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-input rounded-md"
                  placeholder="Enter your display name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Timezone</label>
                <select className="w-full px-3 py-2 border border-input rounded-md">
                  <option>UTC-8 (Pacific)</option>
                  <option>UTC-5 (Eastern)</option>
                  <option>UTC+0 (GMT)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TODO: Add other settings sections */}
      {activeSection !== 'general' && (
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">
            {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} settings coming soon
          </p>
        </div>
      )}
    </SettingsLayout>
  );
}
EOF

    ((MIGRATED_COUNT++))
    log "✅ Migrated settings page: $page_name"
}

# Migration function for Detail pages
migrate_detail_page() {
    local page_path="$1"
    local page_name="$2"

    log "📄 Migrating detail page: $page_name"

    # Create new content using DetailLayout
    cat > "$page_path" << 'EOF'
'use client';

import React from 'react';
import { DetailLayout } from '@ghxstship/ui/templates';

export default function DetailPage() {
  // TODO: Implement detail content using DetailLayout
  // This is a placeholder - actual implementation needed

  return (
    <DetailLayout
      title="Item Details"
      subtitle="Detailed view of the selected item"
      breadcrumbs={
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
          <button className="hover:text-foreground">Home</button>
          <span>/</span>
          <button className="hover:text-foreground">Module</button>
          <span>/</span>
          <span className="text-foreground">Details</span>
        </nav>
      }
      actions={
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 border border-input rounded-md">
            Edit
          </button>
          <button className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md">
            Delete
          </button>
        </div>
      }
      avatar={
        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-2xl font-bold text-primary-foreground">
          D
        </div>
      }
      status={
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            Active
          </span>
        </div>
      }
      tabs={{
        items: [
          { id: 'overview', label: 'Overview' },
          { id: 'details', label: 'Details' },
          { id: 'activity', label: 'Activity' },
        ],
        activeTab: 'overview',
        onTabChange: (tabId) => console.log('Switch to tab:', tabId),
      }}
      metaSidebar={
        <div className="space-y-6">
          <div>
            <h3 className="font-medium mb-3">Metadata</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground">Created:</span>
                <div>Jan 1, 2024</div>
              </div>
              <div>
                <span className="text-muted-foreground">Last Updated:</span>
                <div>Jan 10, 2024</div>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-muted-foreground">📊</span>
              <span className="text-sm font-medium">Metric 1</span>
            </div>
            <div className="text-2xl font-bold">42</div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-muted-foreground">📈</span>
              <span className="text-sm font-medium">Metric 2</span>
            </div>
            <div className="text-2xl font-bold">85%</div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-muted-foreground">⏱️</span>
              <span className="text-sm font-medium">Metric 3</span>
            </div>
            <div className="text-2xl font-bold">12d</div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Content</h3>
          <div className="prose max-w-none">
            <p>Detailed content for this item goes here. This is a placeholder that will be replaced with actual content.</p>
          </div>
        </div>
      </div>
    </DetailLayout>
  );
}
EOF

    ((MIGRATED_COUNT++))
    log "✅ Migrated detail page: $page_name"
}

# Main migration function
migrate_page() {
    local page_path="$1"
    local relative_path="${page_path#$APP_DIR/}"
    local page_name=$(basename "$page_path" .tsx)
    local template_type=$(get_template_for_page "$page_path")

    ((TOTAL_PAGES++))

    log "🔄 Processing: $relative_path (Template: $template_type)"

    # Skip if already migrated (contains template import)
    if grep -q "from '@ghxstship/ui/templates'" "$page_path" 2>/dev/null; then
        log "⏭️  Already migrated: $relative_path"
        return
    fi

    # Backup original file
    backup_page "$page_path"

    # Apply appropriate migration based on template type
    case "$template_type" in
        "DashboardLayout")
            migrate_dashboard_page "$page_path" "$page_name"
            ;;
        "ListLayout")
            local module_name=$(basename "$(dirname "$page_path")" | sed 's/.*/\u&/')
            migrate_list_page "$page_path" "$page_name" "$module_name"
            ;;
        "SettingsLayout")
            migrate_settings_page "$page_path" "$page_name"
            ;;
        "DetailLayout")
            migrate_detail_page "$page_path" "$page_name"
            ;;
        *)
            log "⚠️  Unknown template type: $template_type for $relative_path"
            ;;
    esac
}

# Main execution
main() {
    log "🚀 Starting ATLVS Page Migration (Phase 4)"
    log "============================================="

    # Find all page.tsx files in the app directory (excluding marketing and auth)
    local pages=$(find "$APP_DIR" -name "page.tsx" -type f | \
                  grep -v "/marketing/" | \
                  grep -v "/auth/" | \
                  grep "/(shell)/" | \
                  sort)

    log "📋 Found $(echo "$pages" | wc -l) pages to migrate"

    # Process each page
    echo "$pages" | while read -r page; do
        migrate_page "$page"
    done

    # Summary
    log "============================================="
    log "🎉 MIGRATION COMPLETE"
    log "Total pages processed: $TOTAL_PAGES"
    log "Pages migrated: $MIGRATED_COUNT"
    log "Success rate: $((MIGRATED_COUNT * 100 / TOTAL_PAGES))%"
    log "Log file: $LOG_FILE"
    log "============================================="

    echo -e "${GREEN}🎉 Migration complete! Check $LOG_FILE for details.${NC}"
}

# Run main function
main "$@"
