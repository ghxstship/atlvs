'use client';

import { MoreVertical, Calendar, User, Tag } from 'lucide-react';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/atomic/Button';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
  assignee?: string;
  dueDate?: string;
  tags?: string[];
}

export interface TaskCardProps {
  task: Task;
  onClick?: (task: Task) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  className?: string;
}

const priorityColors = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
};

const statusLabels = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
};

export function TaskCard({
  task,
  onClick,
  onEdit,
  onDelete: _onDelete,
  className = '',
}: TaskCardProps) {
  return (
    <div
      className={`bg-card border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${className}`}
      onClick={() => onClick?.(task)}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-sm">{task.title}</h3>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.(task);
          }}
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>

      {task.description && (
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex flex-wrap gap-2 mb-3">
        {task.priority && (
          <Badge className={priorityColors[task.priority]}>
            {task.priority}
          </Badge>
        )}
        <Badge variant="outline">{statusLabels[task.status]}</Badge>
        {task.tags?.map((tag) => (
          <Badge key={tag} variant="secondary">
            <Tag className="h-3 w-3 mr-1" />
            {tag}
          </Badge>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        {task.assignee && (
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span>{task.assignee}</span>
          </div>
        )}
        {task.dueDate && (
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{new Date(task.dueDate).toLocaleDateString()}</span>
          </div>
        )}
      </div>
    </div>
  );
}
