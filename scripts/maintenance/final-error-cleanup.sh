#!/bin/bash

# Final Error Cleanup Script
# Targets the remaining 89 TypeScript errors

set -e

echo "🔧 Starting final error cleanup..."

cd "$(dirname "$0")/.."

# 1. Fix FormView Toggle component usage
echo "🔄 Fixing FormView Toggle component..."

# Replace Toggle usage with correct props
sed -i '' 's/checked={!!formData\[field\.key\]}/enabled={!!formData[field.key]}/g' packages/ui/src/organisms/data-views/FormView.tsx
sed -i '' 's/onChange={(checked: boolean) => handleFieldChange(field\.key, checked)}/onChange={(enabled: boolean) => handleFieldChange(field.key, enabled)}/g' packages/ui/src/organisms/data-views/FormView.tsx

# 2. Fix GalleryView import and type issues
echo "🖼️ Fixing GalleryView imports..."

# Add missing ViewType import
sed -i '' '1i\
import { ViewType } from "./types";
' packages/ui/src/organisms/data-views/GalleryView.tsx

# 3. Fix DataViewProvider to include missing properties
echo "📊 Updating DataViewProvider..."

cat > packages/ui/src/organisms/data-views/DataViewProvider.tsx << 'EOF'
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { DataViewContextType, ViewType, SortConfig, FilterConfig, GroupConfig, SavedView, ViewState, DataRecord, DataViewConfig } from './types';

const DataViewContext = createContext<DataViewContextType | null>(null);

interface DataViewProviderProps {
  children: ReactNode;
  initialData?: DataRecord[];
  initialConfig?: Partial<DataViewConfig>;
}

export function DataViewProvider({ 
  children, 
  initialData = [],
  initialConfig = {}
}: DataViewProviderProps) {
  const [viewType, setViewType] = useState<ViewType>(initialConfig.viewType || 'grid');
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [filterConfig, setFilterConfig] = useState<FilterConfig[]>(initialConfig.filters || []);
  const [groupConfig, setGroupConfig] = useState<GroupConfig | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>(initialConfig.search || '');
  const [selectedView, setSelectedView] = useState<SavedView | null>(null);
  const [data] = useState<DataRecord[]>(initialData);
  const [loading] = useState<boolean>(false);
  const [error] = useState<string | null>(null);

  const viewState: ViewState = {
    viewType,
    filters: filterConfig,
    sorts: sortConfig ? [sortConfig] : [],
    groups: groupConfig ? [groupConfig] : [],
    search: searchQuery,
    pagination: {
      page: 1,
      pageSize: 20
    }
  };

  const config: DataViewConfig = {
    viewType,
    fields: initialConfig.fields || [],
    data,
    filters: filterConfig,
    sorts: sortConfig ? [sortConfig] : [],
    groups: groupConfig ? [groupConfig] : [],
    search: searchQuery,
    pagination: {
      page: 1,
      pageSize: 20
    }
  };

  const actions = {
    onRecordClick: (record: DataRecord) => {
      console.log('Record clicked:', record);
    },
    onRecordSelect: (record: DataRecord) => {
      console.log('Record selected:', record);
    },
    onRecordEdit: (record: DataRecord) => {
      console.log('Record edit:', record);
    },
    onRecordDelete: (record: DataRecord) => {
      console.log('Record delete:', record);
    }
  };

  const contextValue: DataViewContextType = {
    viewType,
    setViewType,
    sortConfig,
    setSortConfig,
    filterConfig,
    setFilterConfig,
    groupConfig,
    setGroupConfig,
    searchQuery,
    setSearchQuery,
    selectedView,
    setSelectedView,
    viewState,
    setViewState: () => {},
    data,
    loading,
    error,
    config,
    actions
  };

  return (
    <DataViewContext.Provider value={contextValue}>
      {children}
    </DataViewContext.Provider>
  );
}

export function useDataView(): DataViewContextType {
  const context = useContext(DataViewContext);
  if (!context) {
    throw new Error('useDataView must be used within a DataViewProvider');
  }
  return context;
}
EOF

# 4. Fix remaining component prop issues
echo "🔧 Fixing component props..."

# Fix any remaining 'state' references in GalleryView
sed -i '' 's/state\./config\./g' packages/ui/src/organisms/data-views/GalleryView.tsx

# 5. Add missing imports where needed
echo "📦 Adding missing imports..."

# Ensure all necessary imports are present
grep -l "ViewType" packages/ui/src/organisms/data-views/*.tsx | xargs -I {} sh -c '
  if ! grep -q "import.*ViewType" "$1"; then
    sed -i "" "1i\\
import { ViewType } from \"./types\";
" "$1"
  fi
' -- {}

# 6. Run build and check errors
echo "🏗️ Running build to check remaining errors..."
ERROR_COUNT=$(pnpm build 2>&1 | grep -E "(error|Error)" | wc -l | tr -d ' ')

echo "📊 Remaining TypeScript errors: $ERROR_COUNT"

if [ "$ERROR_COUNT" -eq 0 ]; then
    echo "🎉 SUCCESS: Zero TypeScript errors achieved!"
else
    echo "⚠️  Still have $ERROR_COUNT errors remaining"
    echo "📋 Top remaining errors:"
    pnpm build 2>&1 | grep -E "(error|Error)" | head -5
fi

echo "✅ Final error cleanup completed"
EOF

chmod +x /Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/scripts/final-error-cleanup.sh
