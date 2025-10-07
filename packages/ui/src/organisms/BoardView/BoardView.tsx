'use client';

import { Plus } from 'lucide-react';
import { Button } from '../../components/atomic/Button';
import { TaskCard, type Task } from '../TaskCard';

export interface BoardColumn {
  id: string;
  title: string;
  tasks: Task[];
}

export interface BoardViewProps {
  columns: BoardColumn[];
  onTaskClick?: (task: Task) => void;
  onTaskMove?: (taskId: string, fromColumn: string, toColumn: string) => void;
  onAddTask?: (columnId: string) => void;
  className?: string;
}

export function BoardView({
  columns,
  onTaskClick,
  onTaskMove: _onTaskMove,
  onAddTask,
  className = '',
}: BoardViewProps) {
  return (
    <div className={`flex gap-4 overflow-x-auto pb-4 ${className}`}>
      {columns.map((column) => (
        <div
          key={column.id}
          className="flex-shrink-0 w-80 bg-muted/50 rounded-lg p-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              {column.title}
              <span className="text-xs text-muted-foreground bg-background rounded-full px-2 py-0.5">
                {column.tasks.length}
              </span>
            </h3>
            {onAddTask && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => onAddTask(column.id)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {column.tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={onTaskClick}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
