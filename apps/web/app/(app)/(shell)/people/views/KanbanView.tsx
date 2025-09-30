/**
 * PEOPLE MODULE - KANBAN VIEW COMPONENT
 * Status-based board organization for People data
 * Drag-and-drop functionality with WIP limits and swimlanes
 */

"use client";

import React, { useState, useMemo } from 'react';
import { Plus, MoreHorizontal, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface KanbanColumn {
  id: string;
  title: string;
  status: string;
  color: string;
  wipLimit?: number;
}

export interface KanbanViewProps {
  data: unknown[];
  columns: KanbanColumn[];
  groupBy?: string;
  onCardClick?: (item: unknown) => void;
  onAddCard?: (columnId: string) => void;
  onMoveCard?: (cardId: string, fromColumn: string, toColumn: string) => void;
  loading?: boolean;
  className?: string;
}

const PeopleKanbanView: React.FC<KanbanViewProps> = ({
  data,
  columns,
  groupBy = 'status',
  onCardClick,
  onAddCard,
  onMoveCard,
  loading = false,
  className
}) => {
  const [draggedCard, setDraggedCard] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  // Group data by the specified field
  const groupedData = useMemo(() => {
    const groups: Record<string, any[]> = {};

    // Initialize groups for all columns
    columns.forEach(column => {
      groups[column.status] = [];
    });

    // Group the data
    data.forEach(item => {
      const groupKey = item[groupBy] || 'unknown';
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
    });

    return groups;
  }, [data, columns, groupBy]);

  const handleDragStart = (cardId: string) => {
    setDraggedCard(cardId);
  };

  const handleDragEnd = () => {
    setDraggedCard(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDragOverColumn(columnId);
  };

  const handleDrop = (e: React.DragEvent, toColumn: string) => {
    e.preventDefault();
    if (!draggedCard) return;

    const card = data.find(item => item.id === draggedCard);
    if (!card) return;

    const fromColumn = card[groupBy];
    if (fromColumn !== toColumn) {
      onMoveCard?.(draggedCard, fromColumn, toColumn);
    }

    setDraggedCard(null);
    setDragOverColumn(null);
  };

  const renderCard = (person: unknown) => {
    const isDragging = draggedCard === person.id;

    return (
      <div
        key={person.id}
        draggable
        onDragStart={() => handleDragStart(person.id)}
        onDragEnd={handleDragEnd}
        onClick={() => onCardClick?.(person)}
        className={cn(
          "bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-pointer transition-all duration-200",
          "hover:shadow-md hover:border-blue-300",
          isDragging && "opacity-50 rotate-2 shadow-lg",
          onCardClick && "cursor-pointer"
        )}
      >
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
            {person.first_name?.[0]}{person.last_name?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 truncate">
              {person.first_name} {person.last_name}
            </h4>
            <p className="text-sm text-gray-500 truncate">{person.title || 'No title'}</p>
            {person.department && (
              <p className="text-xs text-gray-400 mt-1">{person.department}</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderColumn = (column: KanbanColumn) => {
    const columnData = groupedData[column.status] || [];
    const isOver = dragOverColumn === column.id;
    const wipExceeded = column.wipLimit && columnData.length > column.wipLimit;

    return (
      <div
        key={column.id}
        className={cn(
          "bg-gray-50 rounded-lg p-4 min-h-[500px] transition-colors",
          isOver && "bg-blue-50 border-2 border-blue-300 border-dashed"
        )}
        onDragOver={(e) => handleDragOver(e, column.id)}
        onDrop={(e) => handleDrop(e, column.status)}
      >
        {/* Column header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className={cn("w-3 h-3 rounded-full", column.color)}></div>
            <h3 className="font-medium text-gray-900">{column.title}</h3>
            <span className={cn(
              "px-2 py-1 text-xs rounded-full",
              wipExceeded ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-600"
            )}>
              {columnData.length}
              {column.wipLimit && ` / ${column.wipLimit}`}
            </span>
          </div>

          {onAddCard && (
            <button
              onClick={() => onAddCard(column.id)}
              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
              title={`Add to ${column.title}`}
            >
              <Plus className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Column content */}
        <div className="space-y-3">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 3 }).map((_, index) => (
              <div key={`skeleton-${index}`} className="bg-white p-4 rounded-lg border border-gray-200 animate-pulse">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))
          ) : columnData.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No team members</p>
            </div>
          ) : (
            columnData.map(renderCard)
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto pb-4">
        {columns.map(renderColumn)}
      </div>

      {/* Summary */}
      <div className="mt-6 text-center text-sm text-gray-500">
        {data.length} team members across {columns.length} columns
      </div>
    </div>
  );
};

export default PeopleKanbanView;
