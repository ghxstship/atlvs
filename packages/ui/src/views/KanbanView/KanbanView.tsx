/**
 * KanbanView Component — Drag-and-Drop Board
 * Modern kanban board with column management
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import React, { useState } from 'react';
import { Plus, MoreVertical, GripVertical } from 'lucide-react';
import type { ViewProps, KanbanColumn, KanbanCard, DataRecord } from '../types';

export interface KanbanViewProps extends ViewProps {
  /** Column field key */
  columnField: string;
  
  /** Available columns */
  columns: KanbanColumn[];
  
  /** Card title field */
  titleField: string;
  
  /** Card description field */
  descriptionField?: string;
  
  /** Enable drag and drop */
  draggable?: boolean;
  
  /** Card renderer */
  cardRenderer?: (record: DataRecord) => React.ReactNode;
  
  /** Column change handler */
  onColumnChange?: (recordId: string, columnId: string) => void;
  
  /** Custom className */
  className?: string;
}

/**
 * KanbanView Component
 */
export function KanbanView({
  data,
  fields,
  state,
  loading = false,
  error = null,
  onRecordClick,
  onCreate,
  columnField,
  columns,
  titleField,
  descriptionField,
  draggable = true,
  cardRenderer,
  onColumnChange,
  className = '',
}: KanbanViewProps) {
  const [draggedCard, setDraggedCard] = useState<string | null>(null);
  const [draggedOverColumn, setDraggedOverColumn] = useState<string | null>(null);
  
  // Group records by column
  const recordsByColumn = React.useMemo(() => {
    const grouped: Record<string, DataRecord[]> = {};
    columns.forEach(col => {
      grouped[col.id] = [];
    });
    
    data.forEach(record => {
      const columnId = record[columnField];
      if (grouped[columnId]) {
        grouped[columnId].push(record);
      }
    });
    
    return grouped;
  }, [data, columns, columnField]);
  
  // Drag handlers
  const handleDragStart = (e: React.DragEvent, cardId: string) => {
    if (!draggable) return;
    setDraggedCard(cardId);
    e.dataTransfer.effectAllowed = 'move';
  };
  
  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    if (!draggable) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDraggedOverColumn(columnId);
  };
  
  const handleDrop = (e: React.DragEvent, columnId: string) => {
    if (!draggable || !draggedCard) return;
    e.preventDefault();
    
    onColumnChange?.(draggedCard, columnId);
    setDraggedCard(null);
    setDraggedOverColumn(null);
  };
  
  const handleDragEnd = () => {
    setDraggedCard(null);
    setDraggedOverColumn(null);
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive font-medium">Error loading data</p>
          <p className="text-muted-foreground text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`flex gap-4 h-full overflow-x-auto p-4 ${className}`}>
      {columns.map((column) => {
        const cards = recordsByColumn[column.id] || [];
        const isOver = draggedOverColumn === column.id;
        
        return (
          <div
            key={column.id}
            className="flex-shrink-0 w-80 flex flex-col"
          >
            {/* Column header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {column.color && (
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: column.color }}
                  />
                )}
                <h3 className="font-semibold">{column.title}</h3>
                <span className="
                  px-2 py-0.5 rounded-full
                  bg-muted
                  text-xs font-medium
                ">
                  {cards.length}
                </span>
                {column.wipLimit && cards.length > column.wipLimit && (
                  <span className="
                    px-2 py-0.5 rounded-full
                    bg-destructive
                    text-destructive-foreground
                    text-xs font-medium
                  ">
                    WIP!
                  </span>
                )}
              </div>
              <button className="p-1 rounded hover:bg-muted transition-colors">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
            
            {/* Column content */}
            <div
              className={`
                flex-1 flex flex-col gap-2
                p-2 rounded-lg
                bg-muted/30
                ${isOver ? 'ring-2 ring-primary' : ''}
                transition-all
              `}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              {cards.map((record) => (
                <div
                  key={record.id}
                  draggable={draggable}
                  onDragStart={(e) => handleDragStart(e, record.id)}
                  onDragEnd={handleDragEnd}
                  onClick={() => onRecordClick?.(record)}
                  className={`
                    p-3 rounded-lg
                    bg-card
                    border border-border
                    hover:border-primary
                    cursor-pointer
                    transition-all
                    ${draggedCard === record.id ? 'opacity-50' : ''}
                  `}
                >
                  {cardRenderer ? (
                    cardRenderer(record)
                  ) : (
                    <>
                      {draggable && (
                        <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                          <GripVertical className="w-4 h-4" />
                        </div>
                      )}
                      <h4 className="font-medium mb-1">{record[titleField]}</h4>
                      {descriptionField && record[descriptionField] && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {record[descriptionField]}
                        </p>
                      )}
                    </>
                  )}
                </div>
              ))}
              
              {/* Add card button */}
              {onCreate && (
                <button
                  onClick={onCreate}
                  className="
                    flex items-center justify-center gap-2
                    p-3 rounded-lg
                    border-2 border-dashed border-border
                    hover:border-primary
                    hover:bg-muted
                    text-muted-foreground
                    transition-colors
                  "
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm">Add card</span>
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

KanbanView.displayName = 'KanbanView';
