'use client';

import React, { useState } from 'react';
import { Plus, MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@ghxstship/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@ghxstship/ui';
import { Badge } from '@ghxstship/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@ghxstship/ui';
import type { ProgrammingEntity } from '../types';

interface KanbanColumn {
  id: string;
  title: string;
  items: ProgrammingEntity[];
  color?: string;
}

interface KanbanViewProps<T extends ProgrammingEntity> {
  data: T[];
  columns: KanbanColumn[];
  groupBy: keyof T;
  loading?: boolean;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onView?: (item: T) => void;
  onMoveItem?: (itemId: string, fromColumn: string, toColumn: string) => void;
  onAddItem?: (columnId: string) => void;
  renderCard?: (item: T, columnId: string) => React.ReactNode;
  emptyMessage?: string;
  className?: string;
}

export function KanbanView<T extends ProgrammingEntity>({
  data,
  columns,
  groupBy,
  loading = false,
  onEdit,
  onDelete,
  onView,
  onMoveItem,
  onAddItem,
  renderCard,
  emptyMessage = 'No data available',
  className
}: KanbanViewProps<T>) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [draggedOverColumn, setDraggedOverColumn] = useState<string | null>(null);

  // Group data by the specified field
  const groupedData = React.useMemo(() => {
    const groups: Record<string, T[]> = {};

    // Initialize with provided columns
    columns.forEach(col => {
      groups[col.id] = [];
    });

    // Group items
    data.forEach(item => {
      const groupValue = String(item[groupBy] || 'unassigned');
      if (groups[groupValue]) {
        groups[groupValue].push(item);
      } else {
        // Fallback for unassigned items
        groups['unassigned'] = groups['unassigned'] || [];
        groups['unassigned'].push(item);
      }
    });

    return groups;
  }, [data, columns, groupBy]);

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggedItem(itemId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDraggedOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDraggedOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDraggedOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();

    if (!draggedItem || !onMoveItem) return;

    const item = data.find(d => d.id === draggedItem);
    if (!item) return;

    const currentColumn = String(item[groupBy] || 'unassigned');
    if (currentColumn !== columnId) {
      onMoveItem(draggedItem, currentColumn, columnId);
    }

    setDraggedItem(null);
    setDraggedOverColumn(null);
  };

  // Default card renderer
  const defaultRenderCard = (item: T, columnId: string) => {
    const isEvent = 'start_date' in item && 'end_date' in item;
    const isPerformance = 'date' in item && 'venue' in item;
    const isWorkshop = 'instructor' in item && 'start_date' in item;

    return (
      <Card
        className={`cursor-move hover:shadow-md transition-shadow ${
          draggedItem === item.id ? 'opacity-50' : ''
        }`}
        draggable
        onDragStart={(e) => handleDragStart(e, item.id)}
        onDragEnd={handleDragEnd}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-sm line-clamp-xs flex-1">
              {item.title || 'Untitled'}
            </CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-icon-md w-icon-md p-0">
                  <MoreHorizontal className="h-3 w-3" />
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
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-xs">
            {item.description && (
              <p className="text-xs text-gray-600 line-clamp-xs">
                {item.description}
              </p>
            )}

            {/* Date information */}
            <div className="text-xs text-gray-500">
              {isEvent && (
                <div>
                  {new Date((item as any).start_date).toLocaleDateString()}
                </div>
              )}
              {isPerformance && (
                <div>
                  {new Date((item as any).date).toLocaleDateString()}
                </div>
              )}
              {isWorkshop && (
                <div>
                  {new Date((item as any).start_date).toLocaleDateString()}
                </div>
              )}
            </div>

            {/* Additional metadata */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">
                {(item as any).location || (item as any).venue || (item as any).instructor || 'No details'}
              </span>
              {'capacity' in item && (item as any).capacity && (
                <Badge variant="outline" className="text-xs">
                  {(item as any).capacity}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className={`flex gap-lg overflow-x-auto pb-4 ${className}`}>
        {columns.map((column) => (
          <div key={column.id} className="flex-shrink-0 w-container-md">
            <div className="bg-gray-50 rounded-lg p-md">
              <div className="h-icon-md bg-gray-200 animate-pulse rounded mb-4" />
              <div className="space-y-sm">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-component-lg bg-gray-200 animate-pulse rounded" />
                ))}
              </div>
            </div>
          </div>
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
    <div className={`flex gap-lg overflow-x-auto pb-4 ${className}`}>
      {columns.map((column) => {
        const columnItems = groupedData[column.id] || [];
        const isDraggedOver = draggedOverColumn === column.id;

        return (
          <div
            key={column.id}
            className={`flex-shrink-0 w-container-md ${
              isDraggedOver ? 'bg-blue-50 border-blue-300' : 'bg-gray-50'
            } rounded-lg transition-colors`}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className="p-md border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">
                  {column.title}
                </h3>
                <div className="flex items-center gap-xs">
                  <Badge variant="secondary" className="text-xs">
                    {columnItems.length}
                  </Badge>
                  {onAddItem && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onAddItem(column.id)}
                      className="h-icon-md w-icon-md p-0"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="p-md space-y-sm min-h-content-lg">
              {columnItems.map((item) => (
                <div key={item.id}>
                  {renderCard ? renderCard(item, column.id) : defaultRenderCard(item, column.id)}
                </div>
              ))}

              {columnItems.length === 0 && (
                <div className="text-center py-xl text-gray-500 text-sm">
                  No items in {column.title.toLowerCase()}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default KanbanView;
