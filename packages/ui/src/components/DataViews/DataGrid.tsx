'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useDataView } from './DataViewProvider';
import { Button } from '../Button';
import { Input } from '../Input';
import { Checkbox } from '../Checkbox';
import { 
  ChevronUp, 
  ChevronDown, 
  MoreHorizontal, 
  Filter, 
  Search,
  Settings,
  Download,
  Upload
} from 'lucide-react';
import { FieldConfig, DataRecord, SortConfig } from './types';

interface DataGridProps {
  className?: string;
  height?: string | number;
  stickyHeader?: boolean;
  resizable?: boolean;
  reorderable?: boolean;
  virtualized?: boolean;
}

export function DataGrid({
  className = '',
  height = 'auto',
  stickyHeader = true,
  resizable = true,
  reorderable = true,
  virtualized = false
}: DataGridProps) {
  const { state, config, actions } = useDataView();
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const [resizing, setResizing] = useState<string | null>(null);

  // Filter visible fields
  const visibleFields = useMemo(() => 
    state.fields.filter(field => field.visible !== false),
    [state.fields]
  );

  // Apply filters, search, and sorting
  const processedData = useMemo(() => {
    let filtered = [...(config.data || [])];

    // Apply search
    if (state.search) {
      const searchLower = state.search.toLowerCase();
      filtered = filtered.filter(record =>
        Object.values(record).some(value =>
          String(value).toLowerCase().includes(searchLower)
        )
      );
    }

    // Apply filters
    state.filters.forEach(filter => {
      filtered = filtered.filter(record => {
        const value = record[filter.field];
        switch (filter.operator) {
          case 'equals':
            return value === filter.value;
          case 'contains':
            return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
          case 'startsWith':
            return String(value).toLowerCase().startsWith(String(filter.value).toLowerCase());
          case 'endsWith':
            return String(value).toLowerCase().endsWith(String(filter.value).toLowerCase());
          case 'gt':
            return Number(value) > Number(filter.value);
          case 'gte':
            return Number(value) >= Number(filter.value);
          case 'lt':
            return Number(value) < Number(filter.value);
          case 'lte':
            return Number(value) <= Number(filter.value);
          case 'in':
            return Array.isArray(filter.value) && filter.value.includes(value);
          case 'notIn':
            return Array.isArray(filter.value) && !filter.value.includes(value);
          default:
            return true;
        }
      });
    });

    // Apply sorting
    if (state.sorts.length > 0) {
      filtered.sort((a, b) => {
        for (const sort of state.sorts) {
          const aVal = a[sort.field];
          const bVal = b[sort.field];
          
          let comparison = 0;
          if (aVal < bVal) comparison = -1;
          else if (aVal > bVal) comparison = 1;
          
          if (comparison !== 0) {
            return sort.direction === 'desc' ? -comparison : comparison;
          }
        }
        return 0;
      });
    }

    return filtered;
  }, [config.data, state.search, state.filters, state.sorts]);

  // Pagination
  const paginatedData = useMemo(() => {
    const start = (state.pagination.page - 1) * state.pagination.pageSize;
    const end = start + state.pagination.pageSize;
    return processedData.slice(start, end);
  }, [processedData, state.pagination]);

  const handleSort = useCallback((field: string) => {
    const existingSort = state.sorts.find(s => s.field === field);
    let newSorts: SortConfig[];

    if (existingSort) {
      if (existingSort.direction === 'asc') {
        newSorts = state.sorts.map(s => 
          s.field === field ? { ...s, direction: 'desc' as const } : s
        );
      } else {
        newSorts = state.sorts.filter(s => s.field !== field);
      }
    } else {
      newSorts = [...state.sorts, { field, direction: 'asc' as const }];
    }

    actions.setSorts(newSorts);
  }, [state.sorts, actions]);

  const handleSelectAll = useCallback(() => {
    const allSelected = state.selection.length === paginatedData.length;
    if (allSelected) {
      actions.setSelectedRecords([]);
    } else {
      actions.setSelectedRecords(paginatedData.map(record => record.id));
    }
  }, [state.selection.length, paginatedData, actions]);

  const formatCellValue = useCallback((value: any, field: FieldConfig) => {
    if (field.format) {
      return field.format(value);
    }

    switch (field.type) {
      case 'date':
        return value ? new Date(value).toLocaleDateString() : '';
      case 'currency':
        return value ? new Intl.NumberFormat('en-US', { 
          style: 'currency', 
          currency: 'USD' 
        }).format(value) : '';
      case 'boolean':
        return value ? 'Yes' : 'No';
      case 'number':
        return value ? Number(value).toLocaleString() : '';
      default:
        return String(value || '');
    }
  }, []);

  const getSortIcon = useCallback((field: string) => {
    const sort = state.sorts.find(s => s.field === field);
    if (!sort) return null;
    return sort.direction === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  }, [state.sorts]);

  const gridClasses = `
    bg-background border border-border rounded-lg overflow-hidden
    ${className}
  `.trim();

  const tableClasses = `
    w-full border-collapse
    ${stickyHeader ? 'sticky-header' : ''}
  `.trim();

  return (
    <div className={gridClasses} style={{ height }}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search records..."
              value={state.search}
              onChange={(e) => actions.setSearch(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button variant="ghost" size="sm">
            <Filter className="h-4 w-4" />
            Filters ({state.filters.length})
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
            Columns
          </Button>
          {config.exportConfig && (
            <Button variant="ghost" size="sm">
              <Download className="h-4 w-4" />
              Export
            </Button>
          )}
          {config.importConfig && (
            <Button variant="ghost" size="sm">
              <Upload className="h-4 w-4" />
              Import
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto" style={{ maxHeight: typeof height === 'number' ? height - 120 : 'calc(100% - 120px)' }}>
        <table className={tableClasses}>
          <thead className={`bg-muted ${stickyHeader ? 'sticky top-0 z-10' : ''}`}>
            <tr>
              <th className="w-12 px-4 py-3 text-left">
                <Checkbox
                  checked={state.selection.length === paginatedData.length && paginatedData.length > 0}
                  indeterminate={state.selection.length > 0 && state.selection.length < paginatedData.length}
                  onChange={handleSelectAll}
                  aria-label="Select all rows"
                />
              </th>
              {visibleFields.map((field) => (
                <th
                  key={field.key}
                  className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/50"
                  style={{ width: columnWidths[field.key] || field.width }}
                  onClick={() => field.sortable !== false && handleSort(field.key)}
                >
                  <div className="flex items-center gap-2">
                    <span>{field.label}</span>
                    {field.sortable !== false && getSortIcon(field.key)}
                  </div>
                </th>
              ))}
              <th className="w-12 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="bg-background divide-y divide-border">
            {paginatedData.map((record) => (
              <tr
                key={record.id}
                className={`
                  hover:bg-muted/50 cursor-pointer
                  ${state.selection.includes(record.id) ? 'bg-primary/10' : ''}
                `}
                onClick={() => config.onEdit?.(record)}
              >
                <td className="px-4 py-3">
                  <Checkbox
                    checked={state.selection.includes(record.id)}
                    onClick={(e) => {
                      e.stopPropagation();
                      const isSelected = state.selection.includes(record.id);
                      if (isSelected) {
                        actions.setSelectedRecords(state.selection.filter(id => id !== record.id));
                      } else {
                        actions.setSelectedRecords([...state.selection, record.id]);
                      }
                    }}
                    aria-label={`Select row ${record.id}`}
                  />
                </td>
                {visibleFields.map((field) => (
                  <td
                    key={field.key}
                    className="px-4 py-3 text-sm text-foreground"
                  >
                    {formatCellValue(record[field.key], field)}
                  </td>
                ))}
                <td className="px-4 py-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Show row actions menu
                    }}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-border">
        <div className="text-sm text-muted-foreground">
          Showing {((state.pagination.page - 1) * state.pagination.pageSize) + 1} to{' '}
          {Math.min(state.pagination.page * state.pagination.pageSize, processedData.length)} of{' '}
          {processedData.length} results
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            disabled={state.pagination.page === 1}
            onClick={() => actions.setPagination({
              ...state.pagination,
              page: state.pagination.page - 1
            })}
          >
            Previous
          </Button>
          
          <span className="text-sm text-muted-foreground">
            Page {state.pagination.page} of {Math.ceil(processedData.length / state.pagination.pageSize)}
          </span>
          
          <Button
            variant="ghost"
            size="sm"
            disabled={state.pagination.page >= Math.ceil(processedData.length / state.pagination.pageSize)}
            onClick={() => actions.setPagination({
              ...state.pagination,
              page: state.pagination.page + 1
            })}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
