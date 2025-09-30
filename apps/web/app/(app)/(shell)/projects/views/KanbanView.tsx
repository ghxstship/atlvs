"use client";

import React from 'react';
import { KanbanSquare, Plus, MoreHorizontal } from 'lucide-react';
import { Button } from '@ghxstship/ui';
import { Badge } from '@ghxstship/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@ghxstship/ui';
import { Droppable, Draggable } from 'react-beautiful-dnd';

export interface KanbanViewProps {
  data: unknown[];
  columns: Array<{
    id: string;
    title: string;
    status: string;
    color?: string;
    limit?: number;
  }>;
  onCardClick?: (item: unknown) => void;
  onAddCard?: (columnId: string) => void;
  onMoveCard?: (cardId: string, sourceColumn: string, destinationColumn: string) => void;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

export default function KanbanView({
  data,
  columns,
  onCardClick,
  onAddCard,
  onMoveCard,
  loading = false,
  emptyMessage = "No data available",
  className = "",
}: KanbanViewProps) {
  // Group data by status/column
  const groupedData = React.useMemo(() => {
    const groups: Record<string, any[]> = {};
    columns.forEach(col => {
      groups[col.id] = data.filter(item => item.status === col.status);
    });
    return groups;
  }, [data, columns]);

  if (loading) {
    return (
      <div className={`flex gap-4 overflow-x-auto pb-4 ${className}`}>
        {columns.map((column) => (
          <div key={column.id} className="flex-shrink-0 w-80">
            <div className="bg-muted rounded-lg p-4 animate-pulse">
              <div className="h-6 bg-muted-foreground/20 rounded mb-4"></div>
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-20 bg-muted-foreground/10 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`flex gap-4 overflow-x-auto pb-4 ${className}`}>
      {columns.map((column) => (
        <div key={column.id} className="flex-shrink-0 w-80">
          <div className="bg-muted/30 rounded-lg p-4 min-h-[600px]">
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: column.color || '#6B7280' }}
                ></div>
                <h3 className="font-medium text-sm">{column.title}</h3>
                <Badge variant="secondary" className="text-xs">
                  {groupedData[column.id]?.length || 0}
                  {column.limit && `/${column.limit}`}
                </Badge>
              </div>

              {onAddCard && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onAddCard(column.id)}
                  className="h-6 w-6 p-0"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              )}
            </div>

            {/* Cards */}
            <div className="space-y-3">
              {groupedData[column.id]?.map((item, index) => (
                <Card
                  key={item.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onCardClick?.(item)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm line-clamp-2">
                        {item.name || item.title}
                      </h4>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-60">
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </div>

                    {item.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {item.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs">
                      <Badge variant="outline" className="text-xs">
                        {item.priority || 'Medium'}
                      </Badge>
                      {item.due_date && (
                        <span className="text-muted-foreground">
                          Due {new Date(item.due_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )) || (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  {emptyMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
