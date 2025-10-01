/**
 * PEOPLE MODULE - TABLE VIEW COMPONENT
 * Enterprise-grade table implementation for People data
 * Advanced features: sorting, filtering, frozen columns, cell editing
 */

"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { ChevronUp, ChevronDown, MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TableColumn {
  key: string;
  title: string;
  width?: number;
  sortable?: boolean;
  filterable?: boolean;
  frozen?: boolean;
  render?: (value: unknown, row: unknown) => React.ReactNode;
}

export interface TableViewProps {
  data: unknown[];
  columns: TableColumn[];
  loading?: boolean;
  selectable?: boolean;
  selectedRows?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  onRowClick?: (row: unknown) => void;
  onEdit?: (row: unknown) => void;
  onDelete?: (row: unknown) => void;
  onView?: (row: unknown) => void;
  className?: string;
  height?: number;
  virtualized?: boolean;
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export interface FilterConfig {
  [key: string]: unknown;
}

const PeopleTableView: React.FC<TableViewProps> = ({
  data,
  columns,
  loading = false,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  onRowClick,
  onEdit,
  onDelete,
  onView,
  className,
  height = 600,
  virtualized = false
}) => {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [filters, setFilters] = useState<FilterConfig>({});

  // Separate frozen and scrollable columns
  const { frozenColumns, scrollableColumns } = useMemo(() => {
    const frozen = columns.filter(col => col.frozen);
    const scrollable = columns.filter(col => !col.frozen);
    return { frozenColumns: frozen, scrollableColumns: scrollable };
  }, [columns]);

  // Sort and filter data
  const processedData = useMemo(() => {
    let result = [...data];

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        result = result.filter(row => {
          const cellValue = row[key];
          if (typeof cellValue === 'string') {
            return cellValue.toLowerCase().includes(value.toLowerCase());
          }
          return cellValue == value;
        });
      }
    });

    // Apply sorting
    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, filters, sortConfig]);

  // Handle column sorting
  const handleSort = useCallback((key: string) => {
    setSortConfig(current => {
      if (!current || current.key !== key) {
        return { key, direction: 'asc' };
      }
      if (current.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      return null; // Remove sorting
    });
  }, []);

  // Handle row selection
  const handleRowSelection = useCallback((rowId: string, checked: boolean) => {
    if (!onSelectionChange) return;

    const newSelection = checked
      ? [...selectedRows, rowId]
      : selectedRows.filter(id => id !== rowId);

    onSelectionChange(newSelection);
  }, [selectedRows, onSelectionChange]);

  // Handle select all
  const handleSelectAll = useCallback((checked: boolean) => {
    if (!onSelectionChange) return;

    if (checked) {
      const allIds = processedData.map(row => row.id);
      onSelectionChange(allIds);
    } else {
      onSelectionChange([]);
    }
  }, [processedData, onSelectionChange]);

  // Handle filter change
  const handleFilterChange = useCallback((key: string, value: unknown) => {
    setFilters(current => ({
      ...current,
      [key]: value
    }));
  }, []);

  // Render column header
  const renderColumnHeader = (column: TableColumn) => {
    const isSorted = sortConfig?.key === column.key;
    const sortDirection = sortConfig?.direction;

    return (
      <th
        key={column.key}
        className={cn(
          "bg-white border-b border-gray-200 px-md py-sm text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
          column.frozen && "sticky left-0 z-10 bg-gray-50 shadow-sm",
          column.sortable && "cursor-pointer hover:bg-gray-50 select-none",
          column.width && `w-[${column.width}px]`
        )}
        style={{ width: column.width }}
        onClick={column.sortable ? () => handleSort(column.key) : undefined}
      >
        <div className="flex items-center space-x-xs">
          <span>{column.title}</span>
          {column.sortable && (
            <div className="flex flex-col">
              <ChevronUp
                className={cn(
                  "h-3 w-3",
                  isSorted && sortDirection === 'asc' ? "text-blue-600" : "text-gray-300"
                )}
              />
              <ChevronDown
                className={cn(
                  "h-3 w-3 -mt-1",
                  isSorted && sortDirection === 'desc' ? "text-blue-600" : "text-gray-300"
                )}
              />
            </div>
          )}
        </div>

        {/* Filter input */}
        {column.filterable && (
          <input
            type="text"
            placeholder={`Filter ${column.title}`}
            className="mt-1 block w-full px-xs py-xs text-xs border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
            value={filters[column.key] || ''}
            onChange={(e) => handleFilterChange(column.key, e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
        )}
      </th>
    );
  };

  // Render table cell
  const renderCell = (row: unknown, column: TableColumn) => {
    const value = row[column.key];
    const content = column.render ? column.render(value, row) : value;

    return (
      <td
        key={column.key}
        className={cn(
          "px-md py-sm whitespace-nowrap text-sm text-gray-900 border-b border-gray-200",
          column.frozen && "sticky left-0 z-10 bg-white",
          onRowClick && "cursor-pointer hover:bg-gray-50"
        )}
      >
        {content}
      </td>
    );
  };

  // Render action menu
  const renderActions = (row: unknown) => {
    const hasActions = onView || onEdit || onDelete;

    if (!hasActions) return null;

    return (
      <td className="px-md py-sm whitespace-nowrap text-right text-sm font-medium border-b border-gray-200">
        <div className="flex items-center justify-end space-x-xs">
          {onView && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onView(row);
              }}
              className="text-blue-600 hover:text-blue-900 p-xs rounded hover:bg-blue-50"
              title="View"
            >
              <Eye className="h-icon-xs w-icon-xs" />
            </button>
          )}
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(row);
              }}
              className="text-green-600 hover:text-green-900 p-xs rounded hover:bg-green-50"
              title="Edit"
            >
              <Edit className="h-icon-xs w-icon-xs" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(row);
              }}
              className="text-red-600 hover:text-red-900 p-xs rounded hover:bg-red-50"
              title="Delete"
            >
              <Trash2 className="h-icon-xs w-icon-xs" />
            </button>
          )}
        </div>
      </td>
    );
  };

  const allSelected = processedData.length > 0 && selectedRows.length === processedData.length;
  const someSelected = selectedRows.length > 0 && selectedRows.length < processedData.length;

  return (
    <div className={cn("bg-white shadow overflow-hidden sm:rounded-md", className)}>
      <div
        className="overflow-x-auto overflow-y-auto"
        style={{ height: `${height}px` }}
      >
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-20">
            <tr>
              {/* Selection column */}
              {selectable && (
                <th className="bg-gray-50 border-b border-gray-200 px-md py-sm">
                  <input
                    type="checkbox"
                    className="h-icon-xs w-icon-xs text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected;
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </th>
              )}

              {/* Frozen columns */}
              {frozenColumns.map(renderColumnHeader)}

              {/* Scrollable columns */}
              {scrollableColumns.map(renderColumnHeader)}

              {/* Actions column */}
              {(onView || onEdit || onDelete) && (
                <th className="bg-gray-50 border-b border-gray-200 px-md py-sm text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={`skeleton-${index}`}>
                  {selectable && (
                    <td className="px-md py-sm">
                      <div className="h-icon-xs w-icon-xs bg-gray-200 rounded animate-pulse"></div>
                    </td>
                  )}
                  {columns.map((column) => (
                    <td key={column.key} className="px-md py-sm">
                      <div className="h-icon-xs bg-gray-200 rounded animate-pulse"></div>
                    </td>
                  ))}
                  {(onView || onEdit || onDelete) && (
                    <td className="px-md py-sm">
                      <div className="h-icon-xs w-component-md bg-gray-200 rounded animate-pulse"></div>
                    </td>
                  )}
                </tr>
              ))
            ) : processedData.length === 0 ? (
              // Empty state
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0) + ((onView || onEdit || onDelete) ? 1 : 0)}
                  className="px-md py-xl text-center text-gray-500"
                >
                  No data found
                </td>
              </tr>
            ) : (
              // Data rows
              processedData.map((row, index) => (
                <tr
                  key={row.id || index}
                  className={cn(
                    "hover:bg-gray-50",
                    onRowClick && "cursor-pointer",
                    selectedRows.includes(row.id) && "bg-blue-50"
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {/* Selection checkbox */}
                  {selectable && (
                    <td className="px-md py-sm" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        className="h-icon-xs w-icon-xs text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={selectedRows.includes(row.id)}
                        onChange={(e) => handleRowSelection(row.id, e.target.checked)}
                      />
                    </td>
                  )}

                  {/* Frozen columns */}
                  {frozenColumns.map(column => renderCell(row, column))}

                  {/* Scrollable columns */}
                  {scrollableColumns.map(column => renderCell(row, column))}

                  {/* Actions */}
                  {renderActions(row)}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Table footer with summary */}
      <div className="bg-gray-50 px-md py-sm border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-700">
          <div>
            Showing {processedData.length} of {data.length} entries
            {selectedRows.length > 0 && (
              <span className="ml-2 text-blue-600">
                ({selectedRows.length} selected)
              </span>
            )}
          </div>
          {sortConfig && (
            <div className="text-gray-500">
              Sorted by {columns.find(c => c.key === sortConfig.key)?.title} ({sortConfig.direction})
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PeopleTableView;
