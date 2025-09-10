'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useDataView } from './DataViewProvider';
import { Button } from '../Button';
import { Card } from '../Card';
import { Badge } from '../Badge';
import { 
  Plus, 
  MoreHorizontal, 
  User, 
  Calendar, 
  Flag,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { KanbanColumn, KanbanCard, DataRecord } from './types';

interface KanbanBoardProps {
  className?: string;
  columns: KanbanColumn[];
  statusField: string;
  titleField: string;
  assigneeField?: string;
  dueDateField?: string;
  priorityField?: string;
  tagsField?: string;
  onCardMove?: (cardId: string, fromColumn: string, toColumn: string) => void;
  onCardClick?: (card: DataRecord) => void;
}

export function KanbanBoard({
  className = '',
  columns,
  statusField,
  titleField,
  assigneeField,
  dueDateField,
  priorityField,
  tagsField,
  onCardMove,
  onCardClick
}: KanbanBoardProps) {
  const { state, config, actions } = useDataView();
  const [draggedCard, setDraggedCard] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [collapsedColumns, setCollapsedColumns] = useState<Set<string>>(new Set());

  // Group records by status
  const groupedRecords = useMemo(() => {
    const groups: Record<string, DataRecord[]> = {};
    
    columns.forEach(column => {
      groups[column.id] = [];
    });

    (config.data || []).forEach(record => {
      const status = record[statusField];
      if (groups[status]) {
        groups[status].push(record);
      }
    });

    return groups;
  }, [config.data, columns, statusField]);

  const handleDragStart = useCallback((e: React.DragEvent, cardId: string) => {
    setDraggedCard(cardId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', cardId);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(columnId);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverColumn(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData('text/plain');
    
    if (cardId && draggedCard) {
      const record = (config.data || []).find(r => r.id === cardId);
      const currentColumn = record?.[statusField];
      
      if (currentColumn !== columnId) {
        onCardMove?.(cardId, currentColumn, columnId);
      }
    }
    
    setDraggedCard(null);
    setDragOverColumn(null);
  }, [config.data, statusField, draggedCard, onCardMove]);

  const toggleColumnCollapse = useCallback((columnId: string) => {
    setCollapsedColumns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(columnId)) {
        newSet.delete(columnId);
      } else {
        newSet.add(columnId);
      }
      return newSet;
    });
  }, []);

  const getPriorityColor = useCallback((priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  }, []);

  const formatDate = useCallback((date: string | Date) => {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    const diffTime = d.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `${Math.abs(diffDays)} days overdue`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else {
      return `Due in ${diffDays} days`;
    }
  }, []);

  const boardClasses = `
    flex gap-4 h-full overflow-x-auto pb-4
    ${className}
  `.trim();

  return (
    <div className={boardClasses}>
      {columns.map((column) => {
        const records = groupedRecords[column.id] || [];
        const isCollapsed = collapsedColumns.has(column.id);
        const isOverLimit = column.wipLimit && records.length > column.wipLimit;
        const isDragOver = dragOverColumn === column.id;

        return (
          <div
            key={column.id}
            className={`
              flex-shrink-0 w-80 bg-gray-50 dark:bg-gray-800 rounded-lg
              ${isDragOver ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}
            `}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* Column Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleColumnCollapse(column.id)}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                  >
                    {isCollapsed ? (
                      <ChevronRight className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                  
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    {column.title}
                  </h3>
                  
                  <Badge variant="secondary" size="sm">
                    {records.length}
                  </Badge>
                  
                  {column.wipLimit && (
                    <Badge 
                      variant={isOverLimit ? 'destructive' : 'outline'} 
                      size="sm"
                    >
                      {records.length}/{column.wipLimit}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      // Create new card in this column
                      config.onCreate?.();
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Column Content */}
            {!isCollapsed && (
              <div className="p-4 space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
                {records.map((record) => {
                  const isDragging = draggedCard === record.id;
                  const priority = priorityField ? record[priorityField] : null;
                  const assignee = assigneeField ? record[assigneeField] : null;
                  const dueDate = dueDateField ? record[dueDateField] : null;
                  const tags = tagsField ? record[tagsField] : null;

                  return (
                    <Card
                      key={record.id}
                      className={`
                        cursor-pointer transition-all duration-200 hover:shadow-md
                        ${isDragging ? 'opacity-50 rotate-2 scale-95' : ''}
                        ${state.selection.includes(record.id) ? 'ring-2 ring-blue-500' : ''}
                      `}
                      draggable
                      onDragStart={(e) => handleDragStart(e, record.id)}
                      onClick={() => {
                        const isSelected = state.selection.includes(record.id);
                        if (isSelected) {
                          actions.setSelectedRecords(state.selection.filter(id => id !== record.id));
                        } else {
                          actions.setSelectedRecords([...state.selection, record.id]);
                        }
                        onCardClick?.(record);
                      }}
                    >
                      <div className="p-3 space-y-2">
                        {/* Priority Indicator */}
                        {priority && (
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${getPriorityColor(priority)}`} />
                            <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                              {priority} Priority
                            </span>
                          </div>
                        )}

                        {/* Title */}
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 line-clamp-2">
                          {record[titleField]}
                        </h4>

                        {/* Description */}
                        {record.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {record.description}
                          </p>
                        )}

                        {/* Tags */}
                        {tags && Array.isArray(tags) && tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="outline" size="sm">
                                {tag}
                              </Badge>
                            ))}
                            {tags.length > 3 && (
                              <Badge variant="outline" size="sm">
                                +{tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                          <div className="flex items-center gap-2">
                            {assignee && (
                              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                <User className="h-3 w-3" />
                                <span>{assignee}</span>
                              </div>
                            )}
                          </div>

                          {dueDate && (
                            <div className={`
                              flex items-center gap-1 text-xs
                              ${new Date(dueDate) < new Date() 
                                ? 'text-red-600 dark:text-red-400' 
                                : 'text-gray-500 dark:text-gray-400'
                              }
                            `}>
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(dueDate)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}

                {/* Empty State */}
                {records.length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <div className="text-sm">No items in {column.title}</div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2"
                      onClick={() => config.onCreate?.()}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add item
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
