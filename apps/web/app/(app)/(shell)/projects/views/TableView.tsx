"use client";

import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ArrowUpDown, MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '@ghxstship/ui';
import { Badge } from '@ghxstship/ui';
import { Checkbox } from '@ghxstship/ui';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@ghxstship/ui';
import { format } from 'date-fns';

// View-specific props interface
export interface TableViewProps {
  data: unknown[];
  fields: Array<{
    key: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'boolean' | 'badge' | 'currency';
    sortable?: boolean;
    width?: string;
  }>;
  onSort?: (field: string, direction: 'asc' | 'desc') => void;
  onRowClick?: (item: unknown) => void;
  onEdit?: (item: unknown) => void;
  onDelete?: (item: unknown) => void;
  onView?: (item: unknown) => void;
  selectable?: boolean;
  selectedItems?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

export default function TableView({
  data,
  fields,
  onSort,
  onRowClick,
  onEdit,
  onDelete,
  onView,
  selectable = false,
  selectedItems = [],
  onSelectionChange,
  loading = false,
  emptyMessage = "No data available",
  className = "",
}: TableViewProps) {
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Handle sorting
  const handleSort = (field: string) => {
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
    onSort?.(field, newDirection);
  };

  // Handle row selection
  const handleRowSelect = (itemId: string, checked: boolean) => {
    if (!onSelectionChange) return;

    if (checked) {
      onSelectionChange([...selectedItems, itemId]);
    } else {
      onSelectionChange(selectedItems.filter(id => id !== itemId));
    }
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return;

    if (checked) {
      onSelectionChange(data.map(item => item.id));
    } else {
      onSelectionChange([]);
    }
  };

  // Render cell content based on field type
  const renderCellContent = (item: unknown, field: unknown) => {
    const value = item[field.key];

    switch (field.type) {
      case 'currency':
        return value ? `$${Number(value).toLocaleString()}` : '-';
      case 'date':
        return value ? format(new Date(value), 'MMM d, yyyy') : '-';
      case 'boolean':
        return <Badge variant={value ? 'success' : 'secondary'}>{value ? 'Yes' : 'No'}</Badge>;
      case 'badge':
        let variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info' = 'default';
        let text = String(value || '');

        // Status-based badge variants
        if (field.key === 'status') {
          switch (value) {
            case 'active':
            case 'completed':
              variant = 'success';
              break;
            case 'on_hold':
            case 'pending':
              variant = 'warning';
              break;
            case 'cancelled':
            case 'failed':
              variant = 'destructive';
              break;
            default:
              variant = 'secondary';
          }
        } else if (field.key === 'priority') {
          switch (value) {
            case 'critical':
              variant = 'destructive';
              text = 'Critical';
              break;
            case 'high':
              variant = 'warning';
              text = 'High';
              break;
            case 'medium':
              variant = 'info';
              text = 'Medium';
              break;
            case 'low':
              variant = 'secondary';
              text = 'Low';
              break;
          }
        }

        return <Badge variant={variant}>{text}</Badge>;
      case 'number':
        return value?.toString() || '-';
      default:
        return String(value || '-');
    }
  };

  // Calculate if all items are selected
  const allSelected = data.length > 0 && selectedItems.length === data.length;
  const someSelected = selectedItems.length > 0 && selectedItems.length < data.length;

  if (loading) {
    return (
      <div className={`bg-card border rounded-lg overflow-hidden ${className}`}>
        <div className="p-8 text-center text-muted-foreground">
          <div className="animate-pulse">Loading data...</div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={`bg-card border rounded-lg overflow-hidden ${className}`}>
        <div className="p-8 text-center text-muted-foreground">
          {emptyMessage}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-card border rounded-lg overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b">
            <tr>
              {selectable && (
                <th className="px-4 py-3 text-left">
                  <Checkbox
                    checked={allSelected}
                    indeterminate={someSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all items"
                  />
                </th>
              )}
              {fields.map((field) => (
                <th
                  key={field.key}
                  className={`px-4 py-3 text-left font-medium text-sm ${
                    field.sortable ? 'cursor-pointer hover:bg-muted/70' : ''
                  } ${field.width ? `w-${field.width}` : ''}`}
                  onClick={field.sortable ? () => handleSort(field.key) : undefined}
                >
                  <div className="flex items-center gap-1">
                    {field.label}
                    {field.sortable && (
                      <div className="flex flex-col">
                        {sortField === field.key ? (
                          sortDirection === 'asc' ? (
                            <ChevronUp className="h-3 w-3" />
                          ) : (
                            <ChevronDown className="h-3 w-3" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-50" />
                        )}
                      </div>
                    )}
                  </div>
                </th>
              ))}
              {(onView || onEdit || onDelete) && (
                <th className="px-4 py-3 text-right font-medium text-sm">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr
                key={item.id}
                className={`border-b hover:bg-muted/30 cursor-pointer transition-colors ${
                  selectedItems.includes(item.id) ? 'bg-muted/50' : ''
                }`}
                onClick={() => onRowClick?.(item)}
              >
                {selectable && (
                  <td className="px-4 py-3">
                    <Checkbox
                      checked={selectedItems.includes(item.id)}
                      onCheckedChange={(checked) => handleRowSelect(item.id, checked as boolean)}
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Select item ${item.id}`}
                    />
                  </td>
                )}
                {fields.map((field) => (
                  <td key={field.key} className="px-4 py-3 text-sm">
                    {renderCellContent(item, field)}
                  </td>
                ))}
                {(onView || onEdit || onDelete) && (
                  <td className="px-4 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => e.stopPropagation()}
                          className="h-8 w-8 p-0"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {onView && (
                          <DropdownMenuItem onClick={() => onView(item)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                        )}
                        {onEdit && (
                          <DropdownMenuItem onClick={() => onEdit(item)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        )}
                        {onDelete && (
                          <DropdownMenuItem
                            onClick={() => onDelete(item)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Selection summary */}
      {selectable && selectedItems.length > 0 && (
        <div className="px-4 py-2 bg-muted/30 border-t text-sm text-muted-foreground">
          {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
        </div>
      )}
    </div>
  );
}
