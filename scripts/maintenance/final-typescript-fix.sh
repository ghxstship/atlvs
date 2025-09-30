#!/bin/bash

# Final TypeScript Error Fix Script
# Systematically resolves all remaining TypeScript errors in GHXSTSHIP

set -e

echo "🔧 Starting final TypeScript error resolution..."

# Navigate to project root
cd "$(dirname "$0")/.."

echo "📍 Current directory: $(pwd)"

# 1. Fix GalleryView component types and missing properties
echo "🎨 Fixing GalleryView component..."

cat > packages/ui/src/organisms/data-views/types.ts << 'EOF'
export interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select' | 'currency' | 'email' | 'url' | 'password' | 'textarea' | 'toggle' | 'array' | 'object';
  sortable?: boolean;
  filterable?: boolean;
  width?: number;
  align?: 'left' | 'center' | 'right';
  format?: (value: any) => string;
  defaultValue?: any;
  required?: boolean;
  readonly?: boolean;
  helpText?: string;
  validation?: (value: any) => string | null;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  step?: number;
  rows?: number;
  options?: Array<{ value: any; label: string }>;
}

export interface DataRecord {
  id: string;
  [key: string]: any;
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

export interface FilterConfig {
  field: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'gt' | 'lt' | 'in';
  value: any;
}

export type ViewType = 'grid' | 'list' | 'kanban' | 'calendar' | 'timeline' | 'gallery';

export interface GroupConfig {
  field: string;
  direction: 'asc' | 'desc';
}

export interface SavedView {
  id: string;
  name: string;
  config: DataViewConfig;
  isDefault?: boolean;
}

export interface DataViewConfig {
  viewType: ViewType;
  fields: FieldConfig[];
  data: DataRecord[];
  filters: FilterConfig[];
  sorts: SortConfig[];
  groups: GroupConfig[];
  search: string;
  pagination: {
    page: number;
    pageSize: number;
  };
}

export interface DataViewContextType {
  viewType: ViewType;
  setViewType: (type: ViewType) => void;
  sortConfig: SortConfig | null;
  setSortConfig: (config: SortConfig | null) => void;
  filterConfig: FilterConfig[];
  setFilterConfig: (config: FilterConfig[]) => void;
  groupConfig: GroupConfig | null;
  setGroupConfig: (config: GroupConfig | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedView: SavedView | null;
  setSelectedView: (view: SavedView | null) => void;
  viewState: ViewState;
  setViewState: (state: ViewState) => void;
  data: DataRecord[];
  loading: boolean;
  error: string | null;
  config: DataViewConfig;
  actions: {
    onRecordClick?: (record: DataRecord) => void;
    onRecordSelect?: (record: DataRecord) => void;
    onRecordEdit?: (record: DataRecord) => void;
    onRecordDelete?: (record: DataRecord) => void;
  };
}

export interface ViewState {
  viewType: ViewType;
  filters: FilterConfig[];
  sorts: SortConfig[];
  groups: GroupConfig[];
  search: string;
  pagination: {
    page: number;
    pageSize: number;
  };
}

export interface ViewProps {
  data: DataRecord[];
  loading?: boolean;
  error?: string;
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: string[];
  collapsible?: boolean;
  collapsed?: boolean;
}

export interface FormValidation {
  required?: string[];
  rules?: Record<string, (value: any) => string | null>;
}

export interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  image?: string;
  thumbnail?: string;
  video?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  record: DataRecord;
}
EOF

# 2. Fix GalleryView component implementation
echo "🖼️ Fixing GalleryView implementation..."

cat > packages/ui/src/organisms/data-views/GalleryView.tsx << 'EOF'
'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Button, Card, Badge, Input } from '../../UnifiedDesignSystem';
import { 
  Grid3X3, 
  List, 
  Search,
  Filter,
  Download,
  Share2,
  Eye,
  MoreHorizontal,
  Play,
  Image as ImageIcon,
  FileText,
  X,
  Check
} from 'lucide-react';
import { DataRecord, ViewType, FilterConfig, GalleryItem } from './types';
import { useDataView } from './DataViewProvider';

export interface GalleryViewProps {
  data: DataRecord[];
  titleField: string;
  thumbnailField?: string;
  imageField?: string;
  videoField?: string;
  descriptionField?: string;
  metadataField?: string;
  tagsField?: string;
  layout?: 'grid' | 'masonry' | 'list';
  columns?: number;
  className?: string;
  onItemClick?: (record: DataRecord) => void;
  onItemPreview?: (record: DataRecord) => void;
  onItemDownload?: (record: DataRecord) => void;
  onItemShare?: (record: DataRecord) => void;
}

export function GalleryView({
  data = [],
  titleField,
  thumbnailField,
  imageField,
  videoField,
  descriptionField,
  metadataField,
  tagsField,
  layout = 'grid',
  columns = 4,
  className = '',
  onItemClick,
  onItemPreview,
  onItemDownload,
  onItemShare
}: GalleryViewProps) {
  const context = useDataView();
  const [viewLayout, setViewLayout] = useState<'grid' | 'masonry' | 'list'>(layout);
  const [gridColumns, setGridColumns] = useState(columns);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Convert data records to gallery items
  const galleryItems = useMemo(() => {
    return data.map((record: DataRecord) => ({
      id: record.id,
      title: record[titleField] || 'Untitled',
      description: descriptionField ? record[descriptionField] : undefined,
      image: imageField ? record[imageField] : undefined,
      thumbnail: thumbnailField ? record[thumbnailField] : undefined,
      video: videoField ? record[videoField] : undefined,
      metadata: metadataField ? record[metadataField] : undefined,
      tags: tagsField ? record[tagsField] : undefined,
      record
    }));
  }, [data, titleField, thumbnailField, imageField, videoField, descriptionField, metadataField, tagsField]);

  // Apply search and filters
  const filteredItems = useMemo(() => {
    let filtered = [...galleryItems];

    // Apply search if context is available
    if (context?.config?.search) {
      const searchLower = context.config.search.toLowerCase();
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchLower) ||
        (item.description && item.description.toLowerCase().includes(searchLower)) ||
        (item.tags && Array.isArray(item.tags) && 
         item.tags.some((tag: string) => String(tag).toLowerCase().includes(searchLower)))
      );
    }

    // Apply filters if context is available
    if (context?.config?.filters) {
      context.config.filters.forEach((filter: FilterConfig) => {
        filtered = filtered.filter(item => {
          const value = item.record[filter.field];
          switch (filter.operator) {
            case 'equals':
              return value === filter.value;
            case 'contains':
              return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
            case 'in':
              return Array.isArray(filter.value) && filter.value.includes(value);
            default:
              return true;
          }
        });
      });
    }

    return filtered;
  }, [galleryItems, context?.config?.search, context?.config?.filters]);

  // Pagination
  const paginatedItems = useMemo(() => {
    if (!context?.config?.pagination) return filteredItems;
    
    const start = (context.config.pagination.page - 1) * context.config.pagination.pageSize;
    const end = start + context.config.pagination.pageSize;
    return filteredItems.slice(start, end);
  }, [filteredItems, context?.config?.pagination]);

  const handleItemSelect = useCallback((itemId: string, selected: boolean) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(itemId);
      } else {
        newSet.delete(itemId);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedItems.size === paginatedItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(paginatedItems.map(item => item.id)));
    }
  }, [selectedItems.size, paginatedItems]);

  const handleClearSelection = useCallback(() => {
    setSelectedItems(new Set());
  }, []);

  const renderMediaPreview = useCallback((item: GalleryItem) => {
    if (item.video) {
      return (
        <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <Play className="h-8 w-8 text-gray-400" />
          {item.thumbnail && (
            <img
              src={item.thumbnail}
              alt={item.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
        </div>
      );
    }

    if (item.image || item.thumbnail) {
      return (
        <img
          src={item.image || item.thumbnail}
          alt={item.title}
          className="w-full aspect-video object-cover"
        />
      );
    }

    return (
      <div className="aspect-video bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <ImageIcon className="h-8 w-8 text-gray-400" />
      </div>
    );
  }, []);

  const getGridClasses = useCallback(() => {
    const baseClasses = 'p-md';
    
    switch (viewLayout) {
      case 'grid':
        return `${baseClasses} grid gap-md grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-${gridColumns}`;
      case 'masonry':
        return `${baseClasses} columns-1 sm:columns-2 md:columns-3 lg:columns-${gridColumns} gap-md space-y-md`;
      case 'list':
        return `${baseClasses} space-y-md`;
      default:
        return baseClasses;
    }
  }, [viewLayout, gridColumns]);

  const galleryClasses = `
    bg-surface dark:bg-surface-inverse border border-border dark:border-gray-700 rounded-lg overflow-hidden
    ${className}
  `.trim();

  const handleRecordClick = (record: DataRecord) => {
    onItemClick?.(record);
  };

  return (
    <div className={galleryClasses}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-md border-b border-border dark:border-gray-700">
        <div className="flex items-center gap-sm">
          <span className="text-body-sm text-foreground-subtle dark:text-gray-600">
            {selectedItems.size > 0 ? `${selectedItems.size} selected` : `${filteredItems.length} items`}
          </span>
          
          {selectedItems.size > 0 && (
            <div className="flex items-center gap-xs">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearSelection}
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
              
              {onItemDownload && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    selectedItems.forEach(id => {
                      const item = paginatedItems.find(i => i.id === id);
                      if (item) onItemDownload(item.record);
                    });
                  }}
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              )}
              
              {onItemShare && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    selectedItems.forEach(id => {
                      const item = paginatedItems.find(i => i.id === id);
                      if (item) onItemShare(item.record);
                    });
                  }}
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-sm">
          {/* Layout Controls */}
          <div className="flex items-center gap-xs border border-border dark:border-gray-700 rounded-md p-xs">
            <Button
              variant={viewLayout === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewLayout('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewLayout === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewLayout('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {/* Column Control */}
          {viewLayout === 'grid' && (
            <Input
              type="number"
              min="1"
              max="8"
              value={gridColumns}
              onChange={(e) => setGridColumns(parseInt(e.target.value) || 4)}
              className="w-16"
            />
          )}

          {/* Select All */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSelectAll}
          >
            <Check className="h-4 w-4" />
            {selectedItems.size === paginatedItems.length ? 'Deselect All' : 'Select All'}
          </Button>
        </div>
      </div>

      {/* Gallery Content */}
      <div className={getGridClasses()}>
        {paginatedItems.map(item => {
          const isSelected = selectedItems.has(item.id);

          if (viewLayout === 'list') {
            return (
              <Card
                key={item.id}
                className={`
                  flex items-center gap-md p-md cursor-pointer transition-all duration-200 hover:shadow-elevation-md
                  ${isSelected ? 'ring-2 ring-primary' : ''}
                `}
                onClick={() => handleRecordClick(item.record)}
              >
                {/* Thumbnail */}
                <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden">
                  {renderMediaPreview(item)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground dark:text-white truncate">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-body-sm text-foreground-subtle dark:text-gray-600 mt-xs line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  
                  {/* Tags */}
                  {item.tags && Array.isArray(item.tags) && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-xs mt-sm">
                      {item.tags.slice(0, 3).map((tag: string, index: number) => (
                        <Badge key={index} variant="default">
                          {String(tag)}
                        </Badge>
                      ))}
                      {item.tags.length > 3 && (
                        <Badge variant="default">
                          +{item.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-xs">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => handleItemSelect(item.id, e.target.checked)}
                    className="rounded"
                  />
                  
                  {onItemPreview && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onItemPreview(item.record);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            );
          }

          return (
            <Card
              key={item.id}
              className={`
                cursor-pointer transition-all duration-200 hover:shadow-elevation-md group
                ${isSelected ? 'ring-2 ring-primary' : ''}
                ${viewLayout === 'masonry' ? 'break-inside-avoid mb-md' : ''}
              `}
              onClick={() => handleRecordClick(item.record)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleRecordClick(item.record);
                }
              }}
              tabIndex={0}
              role="button"
            >
              {/* Media */}
              <div className="relative overflow-hidden rounded-t-lg">
                {renderMediaPreview(item)}
                
                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex items-center gap-sm">
                    {onItemPreview && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onItemPreview(item.record);
                        }}
                        className="bg-white bg-opacity-90 hover:bg-opacity-100"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {onItemDownload && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onItemDownload(item.record);
                        }}
                        className="bg-white bg-opacity-90 hover:bg-opacity-100"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {onItemShare && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onItemShare(item.record);
                        }}
                        className="bg-white bg-opacity-90 hover:bg-opacity-100"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Selection Checkbox */}
                <div className="absolute top-sm right-sm">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="bg-white bg-opacity-90 hover:bg-opacity-100 p-xs"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => handleItemSelect(item.id, e.target.checked)}
                      className="rounded"
                    />
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="p-md">
                <h3 className="font-medium text-foreground dark:text-white truncate">
                  {item.title}
                </h3>
                
                {item.description && (
                  <p className="text-body-sm text-foreground-subtle dark:text-gray-600 mt-xs line-clamp-2">
                    {item.description}
                  </p>
                )}

                {/* Tags */}
                {item.tags && Array.isArray(item.tags) && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-xs mt-sm">
                    {item.tags.slice(0, 3).map((tag: string, index: number) => (
                      <Badge key={index} variant="default">
                        {String(tag)}
                      </Badge>
                    ))}
                    {item.tags.length > 3 && (
                      <Badge variant="default">
                        +{item.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Metadata */}
                {item.metadata && (
                  <div className="text-xs text-foreground-subtle dark:text-gray-600 mt-sm">
                    {Object.entries(item.metadata).slice(0, 2).map(([key, value]) => (
                      <div key={key}>
                        <span className="font-medium">{key}:</span> {String(value)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {paginatedItems.length === 0 && (
        <div className="flex flex-col items-center justify-center py-xl text-center">
          <ImageIcon className="h-12 w-12 text-gray-400 mb-md" />
          <h3 className="text-lg font-medium text-foreground dark:text-white mb-sm">
            No items found
          </h3>
          <p className="text-body-sm text-foreground-subtle dark:text-gray-600">
            {filteredItems.length === 0 
              ? "No items match your current filters."
              : "Try adjusting your search or filters."
            }
          </p>
        </div>
      )}
    </div>
  );
}
EOF

# 3. Fix missing component exports and props
echo "🔧 Fixing component exports and props..."

# Fix Checkbox component props
cat > packages/ui/src/components/Checkbox.tsx << 'EOF'
'use client';

import React from 'react';

export interface CheckboxProps {
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  className?: string;
}

export function Checkbox({
  checked,
  disabled = false,
  onChange,
  label,
  className = ''
}: CheckboxProps) {
  return (
    <label className={`flex items-center gap-sm cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded border-border dark:border-gray-600"
      />
      <span className="text-body text-foreground dark:text-white">
        {label}
      </span>
    </label>
  );
}
EOF

# Fix Toggle component props
cat > packages/ui/src/components/Toggle.tsx << 'EOF'
'use client';

import React from 'react';

export interface ToggleProps {
  enabled: boolean;
  disabled?: boolean;
  onChange: (enabled: boolean) => void;
  label: string;
  className?: string;
}

export function Toggle({
  enabled,
  disabled = false,
  onChange,
  label,
  className = ''
}: ToggleProps) {
  return (
    <label className={`flex items-center gap-sm cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      <div
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full transition-colors
          ${enabled ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}
          ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
        `}
        onClick={() => !disabled && onChange(!enabled)}
      >
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white transition-transform
            ${enabled ? 'translate-x-6' : 'translate-x-1'}
          `}
        />
      </div>
      <span className="text-body text-foreground dark:text-white">
        {label}
      </span>
    </label>
  );
}
EOF

# Fix Alert component props
cat > packages/ui/src/components/Alert.tsx << 'EOF'
'use client';

import React from 'react';

export interface AlertProps {
  variant: 'info' | 'warning' | 'error' | 'success';
  children: React.ReactNode;
}

export function Alert({
  variant,
  children
}: AlertProps) {
  const variantClasses = {
    info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200',
    error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200',
    success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200'
  };

  return (
    <div className={`border rounded-lg p-md ${variantClasses[variant]}`}>
      {children}
    </div>
  );
}
EOF

# Fix Loader component props
cat > packages/ui/src/organisms/Loader.tsx << 'EOF'
'use client';

import React from 'react';

export interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Loader({
  size = 'md',
  className = ''
}: LoaderProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-primary ${sizeClasses[size]} ${className}`} />
  );
}
EOF

# 4. Run build to check remaining errors
echo "🏗️ Running build to check remaining errors..."
pnpm build 2>&1 | grep -E "(error|Error)" | wc -l > /tmp/error_count.txt
ERROR_COUNT=$(cat /tmp/error_count.txt)

echo "📊 Remaining TypeScript errors: $ERROR_COUNT"

if [ "$ERROR_COUNT" -eq 0 ]; then
    echo "🎉 SUCCESS: Zero TypeScript errors achieved!"
else
    echo "⚠️  Still have $ERROR_COUNT errors remaining"
    echo "📋 Sample of remaining errors:"
    pnpm build 2>&1 | grep -E "(error|Error)" | head -10
fi

echo "✅ Final TypeScript fix script completed"
EOF

chmod +x /Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/scripts/final-typescript-fix.sh
