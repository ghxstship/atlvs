"use client";

import React from 'react';
import { List, MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '@ghxstship/ui';
import { Badge } from '@ghxstship/ui';
import { Checkbox } from '@ghxstship/ui';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@ghxstship/ui';

export interface ListViewProps {
  data: unknown[];
  fields: Array<{
    key: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'boolean' | 'badge' | 'currency';
  }>;
  primaryField?: string;
  secondaryField?: string;
  onItemClick?: (item: unknown) => void;
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

export default function ListView({
  data,
  fields,
  primaryField = 'name',
  secondaryField = 'description',
  onItemClick,
  onEdit,
  onDelete,
  onView,
  selectable = false,
  selectedItems = [],
  onSelectionChange,
  loading = false,
  emptyMessage = "No data available",
  className = "",
}: ListViewProps) {
  const handleItemSelect = (itemId: string, checked: boolean, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!onSelectionChange) return;

    if (checked) {
      onSelectionChange([...selectedItems, itemId]);
    } else {
      onSelectionChange(selectedItems.filter(id => id !== itemId));
    }
  };

  const renderFieldValue = (item: unknown, field: unknown) => {
    const value = item[field.key];
    switch (field.type) {
      case 'currency':
        return value ? `$${Number(value).toLocaleString()}` : '-';
      case 'date':
        return value ? new Date(value).toLocaleDateString() : '-';
      case 'boolean':
        return <Badge variant={value ? 'success' : 'secondary'}>{value ? 'Yes' : 'No'}</Badge>;
      case 'badge':
        return <Badge variant="outline">{String(value || '')}</Badge>;
      default:
        return String(value || '-');
    }
  };

  if (loading) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="animate-pulse bg-card border rounded-lg p-4">
            <div className="flex items-center gap-4">
              <div className="h-4 bg-muted rounded w-48"></div>
              <div className="h-3 bg-muted rounded w-32"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center text-muted-foreground">
          {emptyMessage}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {data.map((item) => (
        <div
          key={item.id}
          className={`bg-card border rounded-lg p-4 cursor-pointer hover:shadow-sm transition-shadow ${
            selectedItems.includes(item.id) ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => onItemClick?.(item)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              {selectable && (
                <Checkbox
                  checked={selectedItems.includes(item.id)}
                  onCheckedChange={(checked) => handleItemSelect(item.id, checked as boolean, { stopPropagation: () => {} } as any)}
                  onClick={(e) => e.stopPropagation()}
                />
              )}

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-sm">
                    {item[primaryField] || item.name || item.title}
                  </h3>
                  {item.status && (
                    <Badge variant="outline" className="text-xs">
                      {item.status}
                    </Badge>
                  )}
                </div>

                {item[secondaryField] && (
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {item[secondaryField]}
                  </p>
                )}

                <div className="flex items-center gap-4 mt-2">
                  {fields.slice(0, 3).map((field) => (
                    <div key={field.key} className="flex items-center gap-1 text-xs text-muted-foreground">
                      <span className="font-medium">{field.label}:</span>
                      <span>{renderFieldValue(item, field)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {(onView || onEdit || onDelete) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => e.stopPropagation()}
                    className="h-8 w-8 p-0"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onView && (
                    <DropdownMenuItem onClick={() => onView(item)}>
                      <Eye className="mr-2 h-3 w-3" />
                      View
                    </DropdownMenuItem>
                  )}
                  {onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(item)}>
                      <Edit className="mr-2 h-3 w-3" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem
                      onClick={() => onDelete(item)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-3 w-3" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      ))}

      {selectable && selectedItems.length > 0 && (
        <div className="px-4 py-2 bg-muted/30 rounded-lg text-sm text-muted-foreground">
          {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
        </div>
      )}
    </div>
  );
}
