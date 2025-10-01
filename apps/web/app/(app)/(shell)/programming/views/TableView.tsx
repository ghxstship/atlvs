'use client';

import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@ghxstship/ui';
import { Checkbox } from '@ghxstship/ui';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@ghxstship/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@ghxstship/ui';
import type { ProgrammingEntity, SortOptions } from '../types';

interface TableViewProps<T extends ProgrammingEntity> {
  data: T[];
  columns: Array<{
    key: keyof T;
    label: string;
    sortable?: boolean;
    render?: (value: unknown, item: T) => React.ReactNode;
  }>;
  loading?: boolean;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  onSort?: (sort: SortOptions) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onView?: (item: T) => void;
  sort?: SortOptions;
  emptyMessage?: string;
  className?: string;
}

export function TableView<T extends ProgrammingEntity>({
  data,
  columns,
  loading = false,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  onSort,
  onEdit,
  onDelete,
  onView,
  sort,
  emptyMessage = 'No data available',
  className,
}: TableViewProps<T>) {
  const [internalSelectedIds, setInternalSelectedIds] = useState<string[]>(selectedIds);

  const selectedIdsToUse = onSelectionChange ? selectedIds : internalSelectedIds;
  const setSelectedIds = onSelectionChange || setInternalSelectedIds;

  const allSelected = data.length > 0 && selectedIdsToUse.length === data.length;
  const someSelected = selectedIdsToUse.length > 0 && selectedIdsToUse.length < data.length;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(data.map(item => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectItem = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIdsToUse, itemId]);
    } else {
      setSelectedIds(selectedIdsToUse.filter(id => id !== itemId));
    }
  };

  const handleSort = (columnKey: keyof T) => {
    if (!onSort) return;

    const newSort: SortOptions = {
      field: columnKey as string,
      direction: sort?.field === columnKey && sort.direction === 'asc' ? 'desc' : 'asc',
    };

    onSort(newSort);
  };

  const sortedData = useMemo(() => {
    if (!sort || !sort.field) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sort.field as keyof T];
      const bVal = b[sort.field as keyof T];

      let comparison = 0;
      if (aVal < bVal) comparison = -1;
      if (aVal > bVal) comparison = 1;

      return sort.direction === 'desc' ? -comparison : comparison;
    });
  }, [data, sort]);

  if (loading) {
    return (
      <div className={`space-y-md ${className}`}>
        {/* Loading skeleton */}
        <div className="h-icon-2xl bg-gray-100 animate-pulse rounded" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-component-md bg-gray-50 animate-pulse rounded" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={`text-center py-xsxl ${className}`}>
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`border rounded-lg overflow-hidden ${className}`}>
      <Table>
        <TableHeader>
          <TableRow>
            {selectable && (
              <TableHead className="w-icon-2xl">
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
            )}
            {columns.map((column) => (
              <TableHead
                key={column.key as string}
                className={column.sortable ? 'cursor-pointer hover:bg-gray-50' : ''}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className="flex items-center gap-xs">
                  {column.label}
                  {column.sortable && sort?.field === column.key && (
                    sort.direction === 'asc' ? (
                      <ChevronUp className="h-icon-xs w-icon-xs" />
                    ) : (
                      <ChevronDown className="h-icon-xs w-icon-xs" />
                    )
                  )}
                  {column.sortable && sort?.field !== column.key && (
                    <div className="h-icon-xs w-icon-xs opacity-30">
                      <ChevronUp className="h-3 w-3" />
                      <ChevronDown className="h-3 w-3 -mt-1" />
                    </div>
                  )}
                </div>
              </TableHead>
            ))}
            {(onEdit || onDelete || onView) && (
              <TableHead className="w-icon-2xl">Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((item) => (
            <TableRow
              key={item.id}
              className={selectedIdsToUse.includes(item.id) ? 'bg-blue-50' : ''}
            >
              {selectable && (
                <TableCell>
                  <Checkbox
                    checked={selectedIdsToUse.includes(item.id)}
                    onCheckedChange={(checked) => handleSelectItem(item.id, checked as boolean)}
                  />
                </TableCell>
              )}
              {columns.map((column) => (
                <TableCell key={column.key as string}>
                  {column.render
                    ? column.render(item[column.key], item)
                    : String(item[column.key] || '')
                  }
                </TableCell>
              ))}
              {(onEdit || onDelete || onView) && (
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-icon-xs w-icon-xs" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onView && (
                        <DropdownMenuItem onClick={() => onView(item)}>
                          <Eye className="h-icon-xs w-icon-xs mr-2" />
                          View
                        </DropdownMenuItem>
                      )}
                      {onEdit && (
                        <DropdownMenuItem onClick={() => onEdit(item)}>
                          <Edit className="h-icon-xs w-icon-xs mr-2" />
                          Edit
                        </DropdownMenuItem>
                      )}
                      {onDelete && (
                        <DropdownMenuItem
                          onClick={() => onDelete(item)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-icon-xs w-icon-xs mr-2" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default TableView;
