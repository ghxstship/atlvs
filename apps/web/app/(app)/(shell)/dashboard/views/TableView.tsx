'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Search,
  Filter,
  MoreHorizontal,
  Download,
  Upload,
  Settings,
  Eye,
  EyeOff,
  GripVertical,
  CheckSquare,
  Square
} from 'lucide-react';
import {
  Badge,
  Button,
  Checkbox,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input
} from "@ghxstship/ui";
import { Input ,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@ghxstship/ui';
import { Checkbox ,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@ghxstship/ui';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@ghxstship/ui';
import {
  Dropdown,
  
  DropdownItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  
  DropdownMenuCheckboxItem
} from '@ghxstship/ui';
import { Badge ,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@ghxstship/ui';
import { cn } from '@ghxstship/ui/lib/utils';
import type { DashboardWidget } from '../types';

// Column Configuration
export interface TableColumn {
  id: string;
  label: string;
  key: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'badge' | 'custom';
  sortable?: boolean;
  filterable?: boolean;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  align?: 'left' | 'center' | 'right';
  format?: (value: unknown) => string;
  render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
  hidden?: boolean;
  frozen?: boolean;
}

// Sort Configuration
export interface SortConfig {
  column: string;
  direction: 'asc' | 'desc';
}

// Filter Configuration
export interface FilterConfig {
  column: string;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains' | 'starts_with' | 'ends_with';
  value: unknown;
}

// Table View Props
export interface TableViewProps {
  data: Record<string, unknown>[];
  columns: TableColumn[];
  loading?: boolean;
  emptyMessage?: string;
  className?: string;

  // Sorting
  sort?: SortConfig;
  onSort?: (sort: SortConfig | undefined) => void;
  multiSort?: boolean;

  // Filtering
  filters?: FilterConfig[];
  onFilter?: (filters: FilterConfig[]) => void;
  globalSearch?: string;
  onGlobalSearch?: (query: string) => void;

  // Selection
  selectable?: boolean;
  selectedRows?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  selectAll?: boolean;

  // Pagination
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
  };

  // Actions
  actions?: {
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick: (row: Record<string, unknown>) => void;
    disabled?: (row: Record<string, unknown>) => boolean;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  }[];

  // Bulk Actions
  bulkActions?: {
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick: (selectedRows: Record<string, unknown>[]) => void;
    disabled?: boolean;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  }[];

  // Customization
  onColumnResize?: (columnId: string, width: number) => void;
  onColumnReorder?: (columnIds: string[]) => void;
  onColumnVisibilityChange?: (columnId: string, visible: boolean) => void;

  // Export/Import
  onExport?: (format: 'csv' | 'excel' | 'json') => void;
  onImport?: () => void;

  // Advanced Features
  virtualized?: boolean;
  resizable?: boolean;
  reorderable?: boolean;
  stickyHeader?: boolean;
  striped?: boolean;
  bordered?: boolean;
  compact?: boolean;
}

// Table View Component
export const TableView: React.FC<TableViewProps> = ({
  data,
  columns,
  loading = false,
  emptyMessage = 'No data available',
  className,

  // Sorting
  sort,
  onSort,
  multiSort = false,

  // Filtering
  filters = [],
  onFilter,
  globalSearch = '',
  onGlobalSearch,

  // Selection
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  selectAll = false,

  // Pagination
  pagination,

  // Actions
  actions = [],
  bulkActions = [],

  // Customization
  onColumnResize,
  onColumnReorder,
  onColumnVisibilityChange,

  // Export/Import
  onExport,
  onImport,

  // Advanced Features
  virtualized = false,
  resizable = true,
  reorderable = false,
  stickyHeader = true,
  striped = false,
  bordered = false,
  compact = false
}) => {
  const [columnWidths, setColumnWidths] = useState<Record<string, number>({});
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  // Visible columns
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const visibleColumns = useMemo(() =>
    columns.filter(col => !col.hidden),
    [columns]
  );

  // Sorted data
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const sortedData = useMemo(() => {
    if (!sort || !data.length) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sort.column];
      const bValue = b[sort.column];

      let comparison = 0;
      if (aValue < bValue) comparison = -1;
      if (aValue > bValue) comparison = 1;

      return sort.direction === 'desc' ? -comparison : comparison;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, sort]);

  // Handle sorting
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleSort = useCallback((columnId: string) => {
    if (!onSort) return;

    if (multiSort) {
      // Multi-column sorting logic would go here
      onSort({ column: columnId, direction: 'asc' });
    } else {
      // Single column sorting
      const newDirection =
        sort?.column === columnId && sort.direction === 'asc' ? 'desc' : 'asc';
      onSort({ column: columnId, direction: newDirection });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, onSort, multiSort]);

  // Handle selection
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleSelectAll = useCallback(() => {
    if (!onSelectionChange) return;

    if (selectAll) {
      onSelectionChange([]);
    } else {
      onSelectionChange(sortedData.map(row => String(row.id || '')));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectAll, sortedData, onSelectionChange]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleSelectRow = useCallback((rowId: string) => {
    if (!onSelectionChange) return;

    const newSelection = selectedRows.includes(rowId)
      ? selectedRows.filter(id => id !== rowId)
      : [...selectedRows, rowId];

    onSelectionChange(newSelection);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRows, onSelectionChange]);

  // Handle column resizing
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleColumnResize = useCallback((columnId: string, width: number) => {
    setColumnWidths(prev => ({ ...prev, [columnId]: width }));
    onColumnResize?.(columnId, width);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onColumnResize]);

  // Handle column reordering
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleColumnReorder = useCallback((fromIndex: number, toIndex: number) => {
    if (!onColumnReorder) return;

    const newColumns = [...visibleColumns];
    const [moved] = newColumns.splice(fromIndex, 1);
    newColumns.splice(toIndex, 0, moved);

    onColumnReorder(newColumns.map(col => col.id));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleColumns, onColumnReorder]);

  // Render cell content
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const renderCell = useCallback((column: TableColumn, value: unknown, row: Record<string, unknown>) => {
    if (column.render) {
      return column.render(value, row);
    }

    switch (column.type) {
      case 'boolean':
        return value ? '✓' : '✗';
      case 'badge':
        return <Badge variant="secondary">{String(value)}</Badge>;
      case 'date':
        return value ? new Date(String(value)).toLocaleDateString() : '';
      case 'number':
        return column.format ? column.format(value) : String(value);
      default:
        return column.format ? column.format(value) : String(value || '');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Table classes
  const tableClasses = cn(
    'w-full',
    striped && 'table-striped',
    bordered && 'table-bordered',
    compact && 'table-compact',
    className
  );

  return (
    <div className="space-y-md">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-xs">
          {/* Global Search */}
          {onGlobalSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-xs/2 transform -translate-y-1/2 h-icon-xs w-icon-xs text-muted-foreground" />
              <Input
                placeholder="Search..."
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
                      const selectedData = sortedData.filter(row =>
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
          {/* Export */}
          {onExport && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-icon-xs w-icon-xs mr-1" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onExport('csv')}>
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport('excel')}>
                  Export as Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport('json')}>
                  Export as JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Import */}
          {onImport && (
            <Button variant="outline" size="sm" onClick={onImport}>
              <Upload className="h-icon-xs w-icon-xs mr-1" />
              Import
            </Button>
          )}

          {/* Column Settings */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-icon-xs w-icon-xs" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-container-xs">
              <DropdownMenuLabel>Column Visibility</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {columns.map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={!column.hidden}
                  onCheckedChange={(checked) =>
                    onColumnVisibilityChange?.(column.id, checked)
                  }
                >
                  {column.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <div className={cn('border rounded-md', stickyHeader && 'overflow-auto max-h-container-lg')}>
        <Table className={tableClasses}>
          <TableHeader className={stickyHeader ? 'sticky top-0 bg-background' : ''}>
            <TableRow>
              {/* Selection Column */}
              {selectable && (
                <TableHead className="w-icon-2xl">
                  <Checkbox
                    checked={selectAll}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
              )}

              {/* Data Columns */}
              {visibleColumns.map((column, index) => {
                const isSorted = sort?.column === column.id;
                const sortIcon = isSorted
                  ? sort.direction === 'asc'
                    ? ChevronUp
                    : ChevronDown
                  : ChevronsUpDown;
                const SortIcon = sortIcon;

                return (
                  <TableHead
                    key={column.id}
                    className={cn(
                      'relative',
                      column.align === 'center' && 'text-center',
                      column.align === 'right' && 'text-right',
                      column.frozen && 'sticky left-0 bg-background z-10',
                      reorderable && 'cursor-move'
                    )}
                    style={{
                      width: columnWidths[column.id] || column.width,
                      minWidth: column.minWidth,
                      maxWidth: column.maxWidth
                    }}
                  >
                    <div className="flex items-center gap-xs">
                      {/* Drag Handle */}
                      {reorderable && (
                        <GripVertical className="h-icon-xs w-icon-xs text-muted-foreground cursor-move" />
                      )}

                      {/* Column Label */}
                      <span className="flex-1">{column.label}</span>

                      {/* Sort Button */}
                      {column.sortable && onSort && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-icon-md w-icon-md p-0"
                          onClick={() => handleSort(column.id)}
                        >
                          <SortIcon className="h-icon-xs w-icon-xs" />
                        </Button>
                      )}
                    </div>

                    {/* Resize Handle */}
                    {resizable && (
                      <div
                        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize bg-border hover:bg-primary"
                        onMouseDown={(e) => {
                          // Resize logic would go here
                          e.preventDefault();
                        }}
                      />
                    )}
                  </TableHead>
                );
              })}

              {/* Actions Column */}
              {actions.length > 0 && (
                <TableHead className="w-icon-2xl">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              // Loading state
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {selectable && <TableCell><div className="h-icon-xs bg-muted animate-pulse rounded" /></TableCell>}
                  {visibleColumns.map((column) => (
                    <TableCell key={column.id}>
                      <div className="h-icon-xs bg-muted animate-pulse rounded" />
                    </TableCell>
                  ))}
                  {actions.length > 0 && <TableCell><div className="h-icon-xs bg-muted animate-pulse rounded" /></TableCell>}
                </TableRow>
              ))
            ) : sortedData.length === 0 ? (
              // Empty state
              <TableRow>
                <TableCell
                  colSpan={
                    (selectable ? 1 : 0) +
                    visibleColumns.length +
                    (actions.length > 0 ? 1 : 0)
                  }
                  className="text-center py-xl text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              // Data rows
              sortedData.map((row, rowIndex) => {
                const rowId = String(row.id || rowIndex);
                const isSelected = selectedRows.includes(rowId);

                return (
                  <TableRow
                    key={rowId}
                    className={cn(
                      striped && rowIndex % 2 === 1 && 'bg-muted/50',
                      isSelected && 'bg-accent'
                    )}
                  >
                    {/* Selection Column */}
                    {selectable && (
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleSelectRow(rowId)}
                        />
                      </TableCell>
                    )}

                    {/* Data Columns */}
                    {visibleColumns.map((column) => (
                      <TableCell
                        key={column.id}
                        className={cn(
                          column.align === 'center' && 'text-center',
                          column.align === 'right' && 'text-right'
                        )}
                      >
                        {renderCell(column, row[column.key], row)}
                      </TableCell>
                    ))}

                    {/* Actions Column */}
                    {actions.length > 0 && (
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-icon-xs w-icon-xs" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {actions.map((action, index) => {
                              const Icon = action.icon;
                              const disabled = action.disabled?.(row);

                              return (
                                <DropdownMenuItem
                                  key={index}
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
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
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
              variant="outline"
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
              variant="outline"
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

export type { TableColumn, SortConfig, FilterConfig, TableViewProps };
