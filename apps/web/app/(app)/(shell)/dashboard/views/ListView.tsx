'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Calendar, CheckSquare, ChevronRight, Dropdown,  DropdownItem,  Eye, FileText, MoreHorizontal, Search, Square, Tag, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage, Badge, Button, Checkbox, Dropdown,  DropdownItem,  Input ,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@ghxstship/ui';
import { cn } from '@ghxstship/ui/lib/utils';

// List Item Configuration
export interface ListField {
  key: string;
  label?: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'badge' | 'avatar' | 'icon' | 'custom';
  width?: string;
  format?: (value: unknown) => string;
  render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
  className?: string;
}

export interface ListConfig {
  primary: {
    field: string;
    format?: (value: unknown) => string;
    icon?: React.ComponentType<{ className?: string }>;
  };
  secondary?: {
    field: string;
    format?: (value: unknown) => string;
  };
  metadata?: ListField[];
  badges?: ListField[];
  avatar?: {
    field: string;
    fallbackField?: string;
  };
  actions?: {
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick: (row: Record<string, unknown>) => void;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    disabled?: (row: Record<string, unknown>) => boolean;
  }[];
}

// List Density
export type ListDensity = 'compact' | 'comfortable' | 'spacious';

// List View Props
export interface ListViewProps {
  data: Record<string, unknown>[];
  config: ListConfig;
  density?: ListDensity;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;

  // Search
  globalSearch?: string;
  onGlobalSearch?: (query: string) => void;

  // Selection
  selectable?: boolean;
  selectedRows?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;

  // Bulk Actions
  bulkActions?: {
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick: (selectedRows: Record<string, unknown>[]) => void;
    disabled?: boolean;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  }[];

  // Pagination
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
  };

  // Advanced Features
  showBorders?: boolean;
  showStripes?: boolean;
  hoverable?: boolean;
  animated?: boolean;
  showExpandIcon?: boolean;
  onItemClick?: (row: Record<string, unknown>) => void;
}

// List View Component
export const ListView: React.FC<ListViewProps> = ({
  data,
  config,
  density = 'comfortable',
  loading = false,
  emptyMessage = 'No items found',
  className,

  // Search
  globalSearch = '',
  onGlobalSearch,

  // Selection
  selectable = false,
  selectedRows = [],
  onSelectionChange,

  // Bulk Actions
  bulkActions = [],

  // Pagination
  pagination,

  // Advanced Features
  showBorders = false,
  showStripes = false,
  hoverable = true,
  animated = true,
  showExpandIcon = false,
  onItemClick
}) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Filtered data based on search
  const filteredData = useMemo(() => {
    if (!globalSearch) return data;

    const searchTerm = globalSearch.toLowerCase();
    return data.filter(row => {
      const searchableFields = [
        config.primary.field,
        config.secondary?.field,
        ...(config.metadata?.map(m => m.key) || []),
        ...(config.badges?.map(b => b.key) || [])
      ].filter(Boolean);

      return searchableFields.some(field => {
        const value = row[field!];
        return String(value || '').toLowerCase().includes(searchTerm);
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, globalSearch, config]);

  // Handle selection
  const handleSelectRow = useCallback((rowId: string) => {
    if (!onSelectionChange) return;

    const newSelection = selectedRows.includes(rowId)
      ? selectedRows.filter(id => id !== rowId)
      : [...selectedRows, rowId];

    onSelectionChange(newSelection);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRows, onSelectionChange]);

  const handleSelectAll = useCallback(() => {
    if (!onSelectionChange) return;

    const allSelected = filteredData.every(row =>
      selectedRows.includes(String(row.id || ''))
    );

    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(filteredData.map(row => String(row.id || '')));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredData, selectedRows, onSelectionChange]);

  // Handle item click
  const handleItemClick = useCallback((row: Record<string, unknown>) => {
    if (onItemClick) {
      onItemClick(row);
    } else {
      // Default behavior - select item if selectable
      const rowId = String(row.id || '');
      if (selectable) {
        handleSelectRow(rowId);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onItemClick, selectable, handleSelectRow]);

  // Render field value
  const renderField = useCallback((field: ListField, value: unknown, row: Record<string, unknown>) => {
    if (field.render) {
      return field.render(value, row);
    }

    switch (field.type) {
      case 'text':
        return <span className={cn('truncate', field.className)}>{field.format ? field.format(value) : String(value || '')}</span>;
      case 'number':
        return <span className={cn('font-mono', field.className)}>{field.format ? field.format(value) : String(value || '')}</span>;
      case 'date':
        return <span className={field.className}>{value ? new Date(String(value)).toLocaleDateString() : ''}</span>;
      case 'boolean':
        return <span className={field.className}>{value ? '✓' : '✗'}</span>;
      case 'badge':
        return <Badge variant="secondary" className={cn('text-xs', field.className)}>{field.format ? field.format(value) : String(value || '')}</Badge>;
      case 'avatar':
        const avatarUrl = row[field.key] as string;
        const fallback = field.fallbackField ? String(row[field.fallbackField] || '') : '';
        return (
          <Avatar className={cn('h-icon-md w-icon-md', field.className)}>
            <AvatarImage src={avatarUrl} />
            <AvatarFallback className="text-xs">{fallback.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        );
      case 'icon':
        const IconComponent = e.target.value as React.ComponentType<{ className?: string }> | undefined;
        return IconComponent ? <IconComponent className={cn('h-icon-xs w-icon-xs', field.className)} /> : null;
      default:
        return <span className={field.className}>{String(value || '')}</span>;
    }
  }, []);

  // Density classes
  const densityClasses = {
    compact: 'py-xs',
    comfortable: 'py-sm',
    spacious: 'py-md'
  };

  // Render list item
  const renderListItem = (row: Record<string, unknown>, index: number) => {
    const rowId = String(row.id || index);
    const isSelected = selectedRows.includes(rowId);
    const isHovered = hoveredItem === rowId;
    const PrimaryIcon = config.primary.icon;

    return (
      <div
        key={rowId}
        className={cn(
          'flex items-center gap-sm px-md transition-colors',
          densityClasses[density],
          showBorders && 'border-b border-border',
          showStripes && index % 2 === 1 && 'bg-muted/30',
          hoverable && 'hover:bg-accent/50 cursor-pointer',
          animated && 'transition-all duration-150',
          isSelected && 'bg-accent',
          isHovered && hoverable && 'bg-accent/70'
        )}
        onMouseEnter={() => setHoveredItem(rowId)}
        onMouseLeave={() => setHoveredItem(null)}
        onClick={() => handleItemClick(row)}
      >
        {/* Selection Checkbox */}
        {selectable && (
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => handleSelectRow(rowId)}
            className="flex-shrink-0"
          />
        )}

        {/* Avatar */}
        {config.avatar && (
          <div className="flex-shrink-0">
            {renderField({
              key: config.avatar.field,
              type: 'avatar',
              fallbackField: config.avatar.fallbackField
            }, row[config.avatar.field], row)}
          </div>
        )}

        {/* Primary Icon */}
        {PrimaryIcon && (
          <PrimaryIcon className="h-icon-sm w-icon-sm text-muted-foreground flex-shrink-0" />
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-xs">
            {/* Primary Text */}
            <h4 className="font-medium truncate">
              {config.primary.format
                ? config.primary.format(row[config.primary.field])
                : String(row[config.primary.field] || '')
              }
            </h4>

            {/* Badges */}
            {config.badges && config.badges.length > 0 && (
              <div className="flex gap-xs flex-shrink-0">
                {config.badges.slice(0, 2).map((badge, idx) => (
                  <div key={idx}>
                    {renderField(badge, row[badge.key], row)}
                  </div>
                ))}
                {config.badges.length > 2 && (
                  <Badge variant="secondary" className="text-xs">
                    +{config.badges.length - 2}
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Secondary Text */}
          {config.secondary && (
            <p className="text-sm text-muted-foreground truncate mt-1">
              {config.secondary.format
                ? config.secondary.format(row[config.secondary.field])
                : String(row[config.secondary.field] || '')
              }
            </p>
          )}

          {/* Metadata */}
          {config.metadata && config.metadata.length > 0 && (
            <div className="flex gap-md mt-2 text-xs text-muted-foreground">
              {config.metadata.map((meta, idx) => (
                <div key={idx} className="flex items-center gap-xs">
                  {meta.label && <span className="font-medium">{meta.label}:</span>}
                  {renderField(meta, row[meta.key], row)}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-xs flex-shrink-0">
          {config.actions && config.actions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-icon-lg w-icon-lg p-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-icon-xs w-icon-xs" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {config.actions.map((action, idx) => {
                  const Icon = action.icon;
                  const disabled = action.disabled?.(row);

                  return (
                    <DropdownMenuItem
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        action.onClick(row);
                      }}
                      disabled={disabled}
                    >
                      {Icon && <Icon className="h-icon-xs w-icon-xs mr-2" />}
                      {action.label}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Expand Icon */}
          {showExpandIcon && (
            <ChevronRight className="h-icon-xs w-icon-xs text-muted-foreground" />
          )}
        </div>
      </div>
    );
  };

  const allSelected = filteredData.length > 0 && filteredData.every(row =>
    selectedRows.includes(String(row.id || ''))
  );

  return (
    <div className="space-y-md">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-xs">
          {/* Search */}
          {onGlobalSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-xs/2 transform -translate-y-1/2 h-icon-xs w-icon-xs text-muted-foreground" />
              <Input
                placeholder="Search items..."
                value={globalSearch}
                onChange={(e) => onGlobalSearch(e.target.value)}
                className="pl-9 w-container-sm"
              />
            </div>
          )}

          {/* Select All */}
          {selectable && filteredData.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSelectAll}
              className="flex items-center gap-xs"
            >
              {allSelected ? <CheckSquare className="h-icon-xs w-icon-xs" /> : <Square className="h-icon-xs w-icon-xs" />}
              {allSelected ? 'Deselect All' : 'Select All'}
            </Button>
          )}

          {/* Bulk Actions */}
          {bulkActions.length > 0 && selectedRows.length > 0 && (
            <div className="flex items-center gap-xs">
              {bulkActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={index}
                    variant={action.variant || 'outline'}
                    size="sm"
                    onClick={() => {
                      const selectedData = filteredData.filter(row =>
                        selectedRows.includes(String(row.id || ''))
                      );
                      action.onClick(selectedData);
                    }}
                    disabled={action.disabled}
                  >
                    {Icon && <Icon className="h-icon-xs w-icon-xs mr-1" />}
                    {action.label}
                  </Button>
                );
              })}
            </div>
          )}
        </div>

        <div className="text-sm text-muted-foreground">
          {selectedRows.length > 0 && `${selectedRows.length} selected`}
        </div>
      </div>

      {/* List Container */}
      <div className={cn(
        'border rounded-md bg-background',
        showBorders && 'divide-y divide-border',
        className
      )}>
        {loading ? (
          // Loading state
          Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className={cn('flex items-center gap-sm px-md', densityClasses[density])}>
              {selectable && <div className="h-icon-xs w-icon-xs bg-muted animate-pulse rounded flex-shrink-0" />}
              <div className="h-icon-xs bg-muted animate-pulse rounded flex-1" />
              <div className="h-3 bg-muted animate-pulse rounded w-component-lg" />
            </div>
          ))
        ) : filteredData.length === 0 ? (
          // Empty state
          <div className="flex items-center justify-center py-xsxl">
            <div className="text-center">
              <div className="text-muted-foreground mb-2">{emptyMessage}</div>
              <Button variant="secondary" size="sm">
                Reset Filters
              </Button>
            </div>
          </div>
        ) : (
          // Data items
          filteredData.map((row, index) => renderListItem(row, index))
        )}
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{' '}
            {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{' '}
            {pagination.total} results
          </div>

          <div className="flex items-center gap-xs">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              Previous
            </Button>

            <span className="text-sm">
              Page {pagination.page} of {Math.ceil(pagination.total / pagination.pageSize)}
            </span>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page === Math.ceil(pagination.total / pagination.pageSize)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export type { ListConfig, ListField, ListViewProps, ListDensity };
