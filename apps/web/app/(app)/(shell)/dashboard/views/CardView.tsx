'use client';

import React, { useState, useMemo, useCallback } from 'react';
import Image from "next/image";
import { Dropdown,  DropdownItem, DropdownMenuSeparator,  Edit, Eye, Filter, Grid3X3, Heart, List, MoreHorizontal, Search, Share, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage, Badge, Button, Card, CardBody, CardContent, CardHeader, CardTitle, Checkbox, Dropdown,  DropdownItem,  Input,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@ghxstship/ui";
import { cn } from '@ghxstship/ui/lib/utils';

// Card Layout Types
export type CardLayout = 'grid' | 'masonry' | 'list';

export type CardSize = 'sm' | 'md' | 'lg' | 'xl';

// Card Field Configuration
export interface CardField {
  key: string;
  label?: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'badge' | 'avatar' | 'image' | 'custom';
  format?: (value: unknown) => string;
  render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
  className?: string;
}

// Card Configuration
export interface CardConfig {
  title?: {
    field: string;
    format?: (value: unknown) => string;
  };
  subtitle?: {
    field: string;
    format?: (value: unknown) => string;
  };
  description?: {
    field: string;
    maxLength?: number;
    format?: (value: unknown) => string;
  };
  image?: {
    field: string;
    fallback?: string;
    aspectRatio?: number;
  };
  avatar?: {
    field: string;
    fallbackField?: string;
  };
  badges?: CardField[];
  metadata?: CardField[];
  actions?: {
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick: (row: Record<string, unknown>) => void;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    disabled?: (row: Record<string, unknown>) => boolean;
  }[];
}

// Card View Props
export interface CardViewProps {
  data: Record<string, unknown>[];
  config: CardConfig;
  layout?: CardLayout;
  size?: CardSize;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;

  // Filtering & Search
  globalSearch?: string;
  onGlobalSearch?: (query: string) => void;

  // Selection
  selectable?: boolean;
  selectedRows?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;

  // Layout Controls
  onLayoutChange?: (layout: CardLayout) => void;
  onSizeChange?: (size: CardSize) => void;

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
  virtualized?: boolean;
  animated?: boolean;
  hoverable?: boolean;
  bordered?: boolean;
  showFooter?: boolean;
}

// Card View Component
export const CardView: React.FC<CardViewProps> = ({
  data,
  config,
  layout = 'grid',
  size = 'md',
  loading = false,
  emptyMessage = 'No data available',
  className,

  // Filtering & Search
  globalSearch = '',
  onGlobalSearch,

  // Selection
  selectable = false,
  selectedRows = [],
  onSelectionChange,

  // Layout Controls
  onLayoutChange,
  onSizeChange,

  // Bulk Actions
  bulkActions = [],

  // Pagination
  pagination,

  // Advanced Features
  virtualized = false,
  animated = true,
  hoverable = true,
  bordered = true,
  showFooter = true
}) => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // Filtered data based on search
  const filteredData = useMemo(() => {
    if (!globalSearch) return data;

    const searchTerm = globalSearch.toLowerCase();
    return data.filter(row => {
      const searchableFields = [
        config.title?.field,
        config.subtitle?.field,
        config.description?.field,
        ...(config.badges?.map(b => b.key) || []),
        ...(config.metadata?.map(m => m.key) || [])
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

  // Render field value
  const renderField = useCallback((field: CardField, value: unknown, row: Record<string, unknown>) => {
    if (field.render) {
      return field.render(value, row);
    }

    switch (field.type) {
      case 'text':
        return <span className={field.className}>{field.format ? field.format(value) : String(value || '')}</span>;
      case 'number':
        return <span className={cn('font-mono', field.className)}>{field.format ? field.format(value) : String(value || '')}</span>;
      case 'date':
        return <span className={field.className}>{value ? new Date(String(value)).toLocaleDateString() : ''}</span>;
      case 'boolean':
        return <span className={field.className}>{value ? '✓' : '✗'}</span>;
      case 'badge':
        return <Badge variant="secondary" className={field.className}>{field.format ? field.format(value) : String(value || '')}</Badge>;
      case 'avatar':
        const avatarUrl = row[field.key] as string;
        const fallback = field.fallbackField ? String(row[field.fallbackField] || '') : '';
        return (
          <Avatar className={cn('h-icon-lg w-icon-lg', field.className)}>
            <AvatarImage src={avatarUrl} />
            <AvatarFallback>{fallback.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        );
      case 'image':
        return (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={String(value || '')}
              alt=""
              className={cn('w-full h-component-xl object-cover rounded', field.className)}
            />
          </>
        );
      default:
        return <span className={field.className}>{String(value || '')}</span>;
    }
  }, []);

  // Layout classes
  const layoutClasses = {
    grid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-md',
    masonry: 'columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-md',
    list: 'flex flex-col gap-xs'
  };

  // Size classes
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  };

  // Render individual card
  const renderCard = (row: Record<string, unknown>, index: number) => {
    const rowId = String(row.id || index);
    const isSelected = selectedRows.includes(rowId);
    const isHovered = hoveredCard === rowId;

    return (
      <Card
        key={rowId}
        className={cn(
          'relative transition-all duration-200',
          layout === 'masonry' ? 'break-inside-avoid mb-4' : '',
          sizeClasses[size],
          hoverable && 'hover:shadow-md cursor-pointer',
          bordered && 'border',
          animated && 'hover:scale-[1.02]',
          isSelected && 'ring-2 ring-primary',
          isHovered && hoverable && 'shadow-lg'
        )}
        onMouseEnter={() => setHoveredCard(rowId)}
        onMouseLeave={() => setHoveredCard(null)}
      >
        {/* Selection Checkbox */}
        {selectable && (
          <div className="absolute top-xs left-2 z-10">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => handleSelectRow(rowId)}
              className="bg-background border-2"
            />
          </div>
        )}

        {/* Image */}
        {config.image && (
          <div className="relative">
            {renderField(config.image, row[config.image.field], row)}
            {config.avatar && (
              <div className="absolute bottom-2 left-2">
                {renderField(config.avatar, row[config.avatar.field], row)}
              </div>
            )}
          </div>
        )}

        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              {/* Title */}
              {config.title && (
                <CardTitle className="text-lg font-semibold truncate">
                  {config.title.format
                    ? config.title.format(row[config.title.field])
                    : String(row[config.title.field] || '')
                  }
                </CardTitle>
              )}

              {/* Subtitle */}
              {config.subtitle && (
                <p className="text-sm text-muted-foreground mt-1 truncate">
                  {config.subtitle.format
                    ? config.subtitle.format(row[config.subtitle.field])
                    : String(row[config.subtitle.field] || '')
                  }
                </p>
              )}
            </div>

            {/* Actions Menu */}
            {config.actions && config.actions.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-icon-lg w-icon-lg p-0">
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
                        onClick={() => action.onClick(row)}
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
          </div>

          {/* Badges */}
          {config.badges && config.badges.length > 0 && (
            <div className="flex flex-wrap gap-xs mt-2">
              {config.badges.map((badge, idx) => (
                <div key={idx}>
                  {renderField(badge, row[badge.key], row)}
                </div>
              ))}
            </div>
          )}
        </CardHeader>

        <CardContent className="pt-0">
          {/* Description */}
          {config.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-xs">
              {config.description.format
                ? config.description.format(row[config.description.field])
                : String(row[config.description.field] || '').slice(0, config.description.maxLength || 150)
              }
            </p>
          )}

          {/* Metadata */}
          {config.metadata && config.metadata.length > 0 && (
            <div className="grid grid-cols-2 gap-xs text-xs text-muted-foreground">
              {config.metadata.map((meta, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="font-medium">{meta.label}:</span>
                  <span>{renderField(meta, row[meta.key], row)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Footer Actions */}
          {showFooter && config.actions && config.actions.length > 0 && (
            <div className="flex gap-xs mt-4 pt-4 border-t">
              {config.actions.slice(0, 2).map((action, idx) => {
                const Icon = action.icon;
                const disabled = action.disabled?.(row);

                return (
                  <Button
                    key={idx}
                    variant={action.variant || 'outline'}
                    size="sm"
                    onClick={() => action.onClick(row)}
                    disabled={disabled}
                    className="flex-1"
                  >
                    {Icon && <Icon className="h-icon-xs w-icon-xs mr-1" />}
                    {action.label}
                  </Button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

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
                placeholder="Search cards..."
                value={globalSearch}
                onChange={(e) => onGlobalSearch(e.target.value)}
                className="pl-9 w-container-sm"
              />
            </div>
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

        <div className="flex items-center gap-xs">
          {/* Layout Controls */}
          <div className="flex items-center border rounded-md">
            <Button
              variant={layout === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onLayoutChange?.('grid')}
              className="rounded-r-none"
            >
              <Grid3X3 className="h-icon-xs w-icon-xs" />
            </Button>
            <Button
              variant={layout === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onLayoutChange?.('list')}
              className="rounded-none border-x"
            >
              <List className="h-icon-xs w-icon-xs" />
            </Button>
          </div>

          {/* Size Controls */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="sm">
                Size
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onSizeChange?.('sm')}>
                Small
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSizeChange?.('md')}>
                Medium
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSizeChange?.('lg')}>
                Large
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSizeChange?.('xl')}>
                Extra Large
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Cards Container */}
      <div className={cn(layoutClasses[layout], className)}>
        {loading ? (
          // Loading state
          Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className={cn(sizeClasses[size])}>
              <CardHeader>
                <div className="h-icon-xs bg-muted animate-pulse rounded w-3/4" />
                <div className="h-3 bg-muted animate-pulse rounded w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-muted animate-pulse rounded w-full mb-2" />
                <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
              </CardContent>
            </Card>
          ))
        ) : filteredData.length === 0 ? (
          // Empty state
          <div className="col-span-full flex items-center justify-center py-xsxl">
            <div className="text-center">
              <div className="text-muted-foreground mb-2">{emptyMessage}</div>
              <Button variant="secondary" size="sm">
                Reset Filters
              </Button>
            </div>
          </div>
        ) : (
          // Data cards
          filteredData.map((row, index) => renderCard(row, index))
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

export type { CardConfig, CardField, CardViewProps, CardLayout, CardSize };
