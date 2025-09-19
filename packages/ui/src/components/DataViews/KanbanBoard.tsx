'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useDataView } from './DataViewProvider';
import { Button } from '../atomic/Button';
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
import { KanbanColumn, KanbanCard } from './types';

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
    const groups: Record<string[]> = {};
    
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
        return 'bg-destructive';
      case 'high':
        return 'bg-warning';
      case 'medium':
        return 'bg-primary';
      case 'low':
        return 'bg-success';
      default:
        return 'bg-muted-foreground';
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
    flex gap-md h-full overflow-x-auto pb-md
    ${className}
  `.trim();

  return (
    <div className={boardClasses}>
      {columns.map((column: any) => {
        const records = groupedRecords[column.id] || [];
        const isCollapsed = collapsedColumns.has(column.id);
        const isOverLimit = column.wipLimit && records.length > column.wipLimit;
        const isDragOver = dragOverColumn === column.id;

        return (
          <div
            key={column.id}
            className={`
              flex-shrink-0 w-80 bg-muted rounded-lg
              ${isDragOver ? 'ring-2 ring-primary bg-primary/10' : ''}
            `}
            onDragOver={(e: any) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e: any) => handleDrop(e, column.id)}
          >
            {/* Column Header */}
            <div className="p-md border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-sm">
                  <button
                    onClick={() => toggleColumnCollapse(column.id)}
                    className="p-xs hover:bg-muted/50 rounded"
                  >
                    {isCollapsed ? (
                      <ChevronRight className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                  
                  <h3 className="font-semibold text-foreground">
                    {column.title}
                  </h3>
                  
                  <Badge variant="secondary" >
                    {records.length}
                  </Badge>
                  
                  {column.wipLimit && (
                    <Badge 
                      variant={isOverLimit ? 'destructive' : 'outline'} 
                      
                    >
                      {records.length}/{column.wipLimit}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-xs">
                  <Button
                    variant="ghost"
                    
                    onClick={() => {
                      // Create new card in this column
                      config.onCreate?.();
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  
                  <Button variant="ghost" >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Column Content */}
            {!isCollapsed && (
              <div className="p-md space-y-sm max-h-[calc(100vh-200px)] overflow-y-auto">
                {records.map((record: any) => {
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
                        ${state.selection.includes(record.id) ? 'ring-2 ring-primary' : ''}
                      `}
                      draggable
                      onDragStart={(e: any) => handleDragStart(e, record.id)}
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
                      <div className="p-sm space-y-sm">
                        {/* Priority Indicator */}
                        {priority && (
                          <div className="flex items-center gap-sm">
                            <div className={`w-2 h-2 rounded-full ${getPriorityColor(priority)}`} />
                            <span className="text-xs text-muted-foreground capitalize">
                              {priority} Priority
                            </span>
                          </div>
                        )}

                        {/* Title */}
                        <h4 className="font-medium text-foreground line-clamp-2">
                          {record[titleField]}
                        </h4>

                        {/* Description */}
                        {record.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {record.description}
                          </p>
                        )}

                        {/* Tags */}
                        {tags && Array.isArray(tags) && tags.length > 0 && (
                          <div className="flex flex-wrap gap-xs">
                            {tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="outline" >
                                {tag}
                              </Badge>
                            ))}
                            {tags.length > 3 && (
                              <Badge variant="outline" >
                                +{tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-sm border-t border-border">
                          <div className="flex items-center gap-sm">
                            {assignee && (
                              <div className="flex items-center gap-xs text-xs text-muted-foreground">
                                <User className="h-3 w-3" />
                                <span>{assignee}</span>
                              </div>
                            )}
                          </div>

                          {dueDate && (
                            <div className={`
                              flex items-center gap-xs text-xs
                              ${new Date(dueDate) < new Date() 
                                ? 'text-destructive' 
                                : 'text-muted-foreground'
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
                  <div className="text-center py-xl text-muted-foreground">
                    <div className="text-sm">No items in {column.title}</div>
                    <Button
                      variant="ghost"
                      
                      className="mt-sm"
                      onClick={() => config.onCreate?.()}
                    >
                      <Plus className="h-4 w-4 mr-xs" />
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
