'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';
import { cva, type VariantProps } from 'class-variance-authority';
import { 
  ChevronUp, 
  ChevronDown, 
  ChevronsUpDown, 
  Search, 
  Filter,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { Select } from './Select';
import { Badge } from './Badge';
import { Skeleton } from './Skeleton';

const tableVariants = cva(
  'w-full caption-bottom text-sm',
  {
    variants: {
      variant: {
        default: 'border-collapse',
        striped: 'border-collapse',
        bordered: 'border border-border rounded-lg overflow-hidden',
      },
      size: {
        sm: 'text-xs',
        default: 'text-sm',
        lg: 'text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface Column<T = any> {
  key: string;
  title: string;
  dataIndex?: keyof T;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  fixed?: 'left' | 'right';
}

export interface TableAction<T = any> {
  key: string;
  label: string;
  icon?: React.ReactNode;
  onClick: (record: T) => void;
  variant?: 'outline' | 'primary' | 'ghost' | 'destructive';
  disabled?: (record: T) => boolean;
}

export interface TableProps<T = any> extends VariantProps<typeof tableVariants> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  className?: string;
  rowKey?: string | ((record: T) => string | number);
  onRowClick?: (record: T, index: number) => void;
  actions?: TableAction<T>[];
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
    showSizeChanger?: boolean;
    showQuickJumper?: boolean;
  };
  searchable?: boolean;
  onSearch?: (value: string) => void;
  filterable?: boolean;
  sortable?: boolean;
  onSort?: (key: string, direction: 'asc' | 'desc' | null) => void;
  selectedRowKeys?: (string | number)[];
  onSelectionChange?: (selectedRowKeys: (string | number)[], selectedRows: T[]) => void;
  expandable?: {
    expandedRowRender: (record: T, index: number) => React.ReactNode;
    rowExpandable?: (record: T) => boolean;
  };
  emptyText?: string;
  scroll?: { x?: number; y?: number };
}

export function Table<T extends Record<string, any> = Record<string, any>>({
  columns,
  data,
  loading = false,
  className,
  variant,
  size,
  rowKey = 'id',
  onRowClick,
  actions,
  pagination,
  searchable = false,
  onSearch,
  filterable = false,
  sortable = true,
  onSort,
  selectedRowKeys = [],
  onSelectionChange,
  expandable,
  emptyText = 'No data available',
  scroll,
}: TableProps<T>) {
  const [searchValue, setSearchValue] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string | number>>(new Set());
  const [filters, setFilters] = useState<Record<string, any>>({});

  const getRowKey = useCallback((record: T, index: number): string | number => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    return (record as any)[rowKey as string] as string | number || index;
  }, [rowKey]);

  const handleSort = useCallback((key: string) => {
    if (!sortable) return;
    
    let direction: 'asc' | 'desc' | null = 'asc';
    
    if (sortConfig?.key === key) {
      if (sortConfig.direction === 'asc') {
        direction = 'desc';
      } else if (sortConfig.direction === 'desc') {
        direction = null;
      }
    }
    
    if (direction) {
      setSortConfig({ key, direction });
    } else {
      setSortConfig(null);
    }
    
    onSort?.(key, direction);
  }, [sortable, sortConfig, onSort]);

  const handleSearch = useCallback((value: string) => {
    setSearchValue(value);
    onSearch?.(value);
  }, [onSearch]);

  const handleRowExpand = useCallback((key: string | number) => {
    const newExpandedRows = new Set(expandedRows);
    if (expandedRows.has(key)) {
      newExpandedRows.delete(key);
    } else {
      newExpandedRows.add(key);
    }
    setExpandedRows(newExpandedRows);
  }, [expandedRows]);

  const handleRowSelection = useCallback((key: string | number, selected: boolean) => {
    const newSelectedKeys = [...selectedRowKeys];
    const index = newSelectedKeys.indexOf(key);
    
    if (selected && index === -1) {
      newSelectedKeys.push(key);
    } else if (!selected && index > -1) {
      newSelectedKeys.splice(index, 1);
    }
    
    const selectedRows = data.filter((record, idx) => 
      newSelectedKeys.includes(getRowKey(record, idx))
    );
    
    onSelectionChange?.(newSelectedKeys, selectedRows);
  }, [selectedRowKeys, data, getRowKey, onSelectionChange]);

  const handleSelectAll = useCallback((selected: boolean) => {
    if (selected) {
      const allKeys = data.map((record, index) => getRowKey(record, index));
      onSelectionChange?.(allKeys, data);
    } else {
      onSelectionChange?.([], []);
    }
  }, [data, getRowKey, onSelectionChange]);

  const renderSortIcon = (column: Column<T>) => {
    if (!column.sortable || !sortable) return null;
    
    const isActive = sortConfig?.key === column.key;
    const direction = isActive ? sortConfig.direction : null;
    
    return (
      <button
        className="ml-1 inline-flex items-center justify-center w-4 h-4 hover:bg-muted rounded transition-colors"
        onClick={() => handleSort(column.key)}
      >
        {direction === 'asc' ? (
          <ChevronUp className="h-3 w-3" />
        ) : direction === 'desc' ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronsUpDown className="h-3 w-3 opacity-50" />
        )}
      </button>
    );
  };

  const renderActions = (record: T) => {
    if (!actions || actions.length === 0) return null;
    
    if (actions.length === 1) {
      const action = actions[0];
      return (
        <Button
          variant={action.variant || 'outline'}
          size="sm"
          onClick={() => action.onClick(record)}
          disabled={action.disabled?.(record)}
        >
          {action.icon}
          {action.label}
        </Button>
      );
    }
    
    return (
      <div className="flex items-center gap-1">
        {actions.slice(0, 2).map((action) => (
          <Button
            key={action.key}
            variant="ghost"
            size="sm"
            onClick={() => action.onClick(record)}
            disabled={action.disabled?.(record)}
            className="h-8 w-8 p-0"
          >
            {action.icon}
          </Button>
        ))}
        {actions.length > 2 && (
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  };

  const renderPagination = () => {
    if (!pagination) return null;
    
    const { current, pageSize, total, onChange, showSizeChanger, showQuickJumper } = pagination;
    const totalPages = Math.ceil(total / pageSize);
    const startItem = (current - 1) * pageSize + 1;
    const endItem = Math.min(current * pageSize, total);
    
    return (
      <div className="flex items-center justify-between px-4 py-3 border-t">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>
            Showing {startItem} to {endItem} of {total} results
          </span>
          {showSizeChanger && (
            <div className="flex items-center gap-2">
              <span>Show</span>
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => onChange(1, parseInt(value))}
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </Select>
              <span>per page</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onChange(current - 1, pageSize)}
            disabled={current <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 7) {
                pageNum = i + 1;
              } else if (current <= 4) {
                pageNum = i + 1;
              } else if (current >= totalPages - 3) {
                pageNum = totalPages - 6 + i;
              } else {
                pageNum = current - 3 + i;
              }
              
              return (
                <Button
                  key={pageNum}
                  variant={current === pageNum ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => onChange(pageNum, pageSize)}
                  className="w-8 h-8 p-0"
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onChange(current + 1, pageSize)}
            disabled={current >= totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  const hasSelection = onSelectionChange !== undefined;
  const hasExpansion = expandable !== undefined;
  const allSelected = selectedRowKeys.length === data.length && data.length > 0;
  const someSelected = selectedRowKeys.length > 0 && selectedRowKeys.length < data.length;

  return (
    <div className="space-y-md">
      {/* Search and Filters */}
      {(searchable || filterable) && (
        <div className="flex items-center gap-4">
          {searchable && (
            <div className="flex-1 max-w-sm">
              <Input
                placeholder="Search..."
                value={searchValue}
                onChange={(e) => handleSearch(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
              />
            </div>
          )}
          {filterable && (
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="relative overflow-auto rounded-md border">
        <table className={twMerge(tableVariants({ variant, size }), className)}>
          <thead className="bg-muted/50">
            <tr>
              {hasSelection && (
                <th className="w-12 px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = someSelected;
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-border"
                  />
                </th>
              )}
              {hasExpansion && (
                <th className="w-12 px-4 py-3"></th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={clsx(
                    'px-4 py-3 font-medium text-left',
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                    column.sortable && sortable && 'cursor-pointer hover:bg-muted/80'
                  )}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center">
                    {column.title}
                    {renderSortIcon(column)}
                  </div>
                </th>
              ))}
              {actions && actions.length > 0 && (
                <th className="w-32 px-4 py-3 text-right">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }, (_, i) => (
                <tr key={i}>
                  {hasSelection && (
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-4" />
                    </td>
                  )}
                  {hasExpansion && (
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-4" />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td key={column.key} className="px-4 py-3">
                      <Skeleton className="h-4 w-full" />
                    </td>
                  ))}
                  {actions && (
                    <td className="px-4 py-3">
                      <Skeleton className="h-8 w-20" />
                    </td>
                  )}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={
                    columns.length + 
                    (hasSelection ? 1 : 0) + 
                    (hasExpansion ? 1 : 0) + 
                    (actions ? 1 : 0)
                  }
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  {emptyText}
                </td>
              </tr>
            ) : (
              data.map((record, index) => {
                const key = getRowKey(record, index);
                const isSelected = selectedRowKeys.includes(key);
                const isExpanded = expandedRows.has(key);
                const canExpand = expandable?.rowExpandable?.(record) ?? true;
                
                return (
                  <React.Fragment key={key}>
                    <tr
                      className={clsx(
                        'border-b transition-colors hover:bg-muted/50',
                        variant === 'striped' && index % 2 === 1 && 'bg-muted/25',
                        isSelected && 'bg-primary/5',
                        onRowClick && 'cursor-pointer'
                      )}
                      onClick={() => onRowClick?.(record, index)}
                    >
                      {hasSelection && (
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleRowSelection(key, e.target.checked)}
                            onClick={(e) => e.stopPropagation()}
                            className="rounded border-border"
                          />
                        </td>
                      )}
                      {hasExpansion && (
                        <td className="px-4 py-3">
                          {canExpand && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRowExpand(key);
                              }}
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </td>
                      )}
                      {columns.map((column) => {
                        const value = column.dataIndex ? record[column.dataIndex] : record;
                        const content = column.render 
                          ? column.render(value, record, index)
                          : value;
                        
                        return (
                          <td
                            key={column.key}
                            className={clsx(
                              'px-4 py-3',
                              column.align === 'center' && 'text-center',
                              column.align === 'right' && 'text-right'
                            )}
                          >
                            {content as React.ReactNode}
                          </td>
                        );
                      })}
                      {actions && (
                        <td className="px-4 py-3 text-right">
                          <div onClick={(e) => e.stopPropagation()}>
                            {renderActions(record)}
                          </div>
                        </td>
                      )}
                    </tr>
                    {hasExpansion && isExpanded && canExpand && (
                      <tr>
                        <td
                          colSpan={
                            columns.length + 
                            (hasSelection ? 1 : 0) + 
                            (hasExpansion ? 1 : 0) + 
                            (actions ? 1 : 0)
                          }
                          className="px-4 py-3 bg-muted/25"
                        >
                          {expandable.expandedRowRender(record, index)}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {renderPagination()}
    </div>
  );
}

// Specialized table components
export const DataTable = Table;

export const SimpleTable = <T,>(props: Omit<TableProps<T>, 'pagination' | 'searchable' | 'filterable'>) => (
  <Table {...(props as any)} pagination={undefined} searchable={false} filterable={false} />
);

export const ActionTable = <T,>(props: TableProps<T> & { 
  onView?: (record: T) => void;
  onEdit?: (record: T) => void;
  onDelete?: (record: T) => void;
}) => {
  const { onView, onEdit, onDelete, ...tableProps } = props;
  
  const defaultActions: TableAction<T>[] = [
    ...(onView ? [{
      key: 'view',
      label: 'View',
      icon: <Eye className="h-4 w-4" />,
      onClick: onView,
    }] : []),
    ...(onEdit ? [{
      key: 'edit',
      label: 'Edit',
      icon: <Edit className="h-4 w-4" />,
      onClick: onEdit,
    }] : []),
    ...(onDelete ? [{
      key: 'delete',
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: onDelete,
      variant: 'destructive' as const,
    }] : []),
  ];
  
  return <Table {...(tableProps as any)} actions={[...defaultActions, ...(tableProps.actions || [])]} />;
};
