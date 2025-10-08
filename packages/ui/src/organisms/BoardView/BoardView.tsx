/**
 * BoardView Component
 * Kanban-style board view
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import React from 'react';
import { Plus, MoreVertical } from 'lucide-react';
import { Card } from '../../molecules/Card/Card';
import { Button } from '../../atoms/Button/Button';

export interface Task {
  id: string;
  title: string;
  description?: string;
  assignee?: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
}

export interface Column {
  id: string;
  title: string;
  status: string;
  color: string;
  tasks: Task[];
}

export interface BoardViewProps {
  /** Board columns */
  columns: Column[];
  
  /** Task click handler */
  onTaskClick?: (task: Task) => void;
  
  /** Task edit handler */
  onTaskEdit?: (task: Task) => void;
  
  /** Task delete handler */
  onTaskDelete?: (task: Task) => void;
  
  /** Task create handler */
  onTaskCreate?: (columnId: string) => void;
}

/**
 * BoardView Component
 */
export const BoardView: React.FC<BoardViewProps> = ({
  columns,
  onTaskClick,
  onTaskEdit,
  onTaskDelete,
  onTaskCreate,
}) => {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((column) => (
        <div
          key={column.id}
          className="flex-shrink-0 w-80"
        >
          {/* Column Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: column.color }}
              />
              <h3 className="font-semibold text-foreground">
                {column.title}
              </h3>
              <span className="text-sm text-muted-foreground">
                {column.tasks.length}
              </span>
            </div>
            
            {onTaskCreate && (
              <Button
                variant="ghost"
                size="sm"
                icon={Plus}
                onClick={() => onTaskCreate(column.id)}
              />
            )}
          </div>
          
          {/* Tasks */}
          <div className="space-y-3">
            {column.tasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No tasks
              </div>
            ) : (
              column.tasks.map((task) => (
                <Card
                  key={task.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onTaskClick?.(task)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-foreground">
                      {task.title}
                    </h4>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTaskEdit?.(task);
                      }}
                      className="p-1 rounded hover:bg-muted transition-colors"
                    >
                      <MoreVertical className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                  
                  {task.description && (
                    <p className="text-sm text-muted-foreground mb-3">
                      {task.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-xs">
                    {task.assignee && (
                      <span className="text-muted-foreground">
                        {task.assignee}
                      </span>
                    )}
                    {task.priority && (
                      <span
                        className={`px-2 py-1 rounded ${
                          task.priority === 'high'
                            ? 'bg-destructive/10 text-destructive'
                            : task.priority === 'medium'
                            ? 'bg-warning/10 text-warning'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {task.priority}
                      </span>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

BoardView.displayName = 'BoardView';
