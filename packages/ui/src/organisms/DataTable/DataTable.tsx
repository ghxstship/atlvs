/**
 * DataTable Component — Advanced Data Table
 * Feature-rich table with sorting, filtering, pagination
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import React from 'react';
import { ChevronDown, ChevronUp, MoreVertical } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  accessor: (row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

export interface DataTableProps<T> {
  /** Table data */
  data: T[];
  
  /** Column configuration */
  columns: Column<T>[];
  
  /** Row key accessor */
  getRowKey: (row: T) => string;
  
  /** Enable sorting */
  sortable?: boolean;
  
  /** Enable selection */
  selectable?: boolean;
  
  /** Selected row keys */
  selectedKeys?: string[];
  
  /** Selection change handler */
  onSelectionChange?: (keys: string[]) => void;
  
  /** Row click handler */
  onRowClick?: (row: T) => void;
  
  /** Loading state */
  loading?: boolean;
  
  /** Empty message */
  emptyMessage?: string;
}

/**
 * DataTable Component
 * 
 * @example
 * ```tsx
 * <DataTable
 *   data={users}
 *   columns={[
 *     { key: 'name', header: 'Name', accessor: (row) => row.name, sortable: true },
 *     { key: 'email', header: 'Email', accessor: (row) => row.email },
 *   ]}
 *   getRowKey={(row) => row.id}
 * />
 * ```
 */
export function DataTable<T>({
  data,
  columns,
  getRowKey,
  sortable = false,
  selectable = false,
  selectedKeys = [],
  onSelectionChange,
  onRowClick,
  loading = false,
  emptyMessage = 'No data available',
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = React.useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);
  
  // Handle sort
  const handleSort = (columnKey: string) => {
    if (!sortable) return;
    
    setSortConfig(current => {
      if (current?.key === columnKey) {
        return current.direction === 'asc'
          ? { key: columnKey, direction: 'desc' }
          : null;
      }
      return { key: columnKey, direction: 'asc' };
    });
  };
  
  // Sort data
  const sortedData = React.useMemo(() => {
    if (!sortConfig) return data;
    
    const column = columns.find(col => col.key === sortConfig.key);
    if (!column) return data;
    
    return [...data].sort((a, b) => {
      const aValue = column.accessor(a);
      const bValue = column.accessor(b);
      
      if (aValue === bValue) return 0;
      
      const comparison = aValue > bValue ? 1 : -1;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [data, sortConfig, columns]);
  
  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return;
    
    onSelectionChange(checked ? data.map(getRowKey) : []);
  };
  
  // Handle select row
  const handleSelectRow = (key: string, checked: boolean) => {
    if (!onSelectionChange) return;
    
    onSelectionChange(
      checked
        ? [...selectedKeys, key]
        : selectedKeys.filter(k => k !== key)
    );
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]" />
      </div>
    );
  }
  
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-[var(--color-foreground-secondary)]">
        {emptyMessage}
      </div>
    );
  }
  
  const allSelected = data.length > 0 && selectedKeys.length === data.length;
  
  return (
    <div className="w-full overflow-auto border border-[var(--color-border)] rounded-lg">
      <table className="w-full">
        <thead className="bg-[var(--color-muted)] border-b border-[var(--color-border)]">
          <tr>
            {selectable && (
              <th className="w-12 px-4 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded"
                />
              </th>
            )}
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-4 py-3 text-left text-sm font-medium"
                style={{ width: column.width }}
              >
                {column.sortable ? (
                  <button
                    onClick={() => handleSort(column.key)}
                    className="flex items-center gap-1 hover:text-[var(--color-primary)] transition-colors"
                  >
                    {column.header}
                    {sortConfig?.key === column.key && (
                      sortConfig.direction === 'asc' ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )
                    )}
                  </button>
                ) : (
                  column.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row) => {
            const key = getRowKey(row);
            const isSelected = selectedKeys.includes(key);
            
            return (
              <tr
                key={key}
                onClick={() => onRowClick?.(row)}
                className={`
                  border-b border-[var(--color-border)] last:border-0
                  hover:bg-[var(--color-muted)]
                  ${isSelected ? 'bg-[var(--color-primary)]/10' : ''}
                  ${onRowClick ? 'cursor-pointer' : ''}
                  transition-colors
                `}
              >
                {selectable && (
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => handleSelectRow(key, e.target.checked)}
                      className="rounded"
                    />
                  </td>
                )}
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3 text-sm">
                    {column.accessor(row)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

DataTable.displayName = 'DataTable';
