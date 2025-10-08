'use client';

import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Settings,
  Download,
  Plus,
  MoreHorizontal,
  GripVertical,
  Play,
  Pause,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users
} from 'lucide-react';
import { Button } from '@ghxstship/ui';
import { Badge } from '@ghxstship/ui';
import { Avatar, AvatarFallback, AvatarImage } from '@ghxstship/ui';
import { Progress } from '@ghxstship/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@ghxstship/ui';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@ghxstship/ui';
import { cn } from '@ghxstship/ui/lib/utils';
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  differenceInDays,
  addDays,
  parseISO,
  isWithinInterval,
  isSameDay
} from 'date-fns';

// Gantt Task Types
export type GanttTaskType = 'task' | 'milestone' | 'phase' | 'project';

export interface GanttTask {
  id: string;
  name: string;
  type: GanttTaskType;
  start: Date;
  end: Date;
  progress?: number;
  dependencies?: string[];
  assignee?: {
    id: string;
    name: string;
    avatar?: string;
  };
  status?: 'not_started' | 'in_progress' | 'completed' | 'delayed' | 'blocked';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  color?: string;
  parentId?: string;
  children?: GanttTask[];
  metadata?: Record<string, unknown>;
}

// Gantt Field Mapping
export interface GanttFieldMapping {
  id: string;
  name: string;
  start: string;
  end: string;
  progress?: string;
  dependencies?: string;
  assignee?: string;
  status?: string;
  priority?: string;
  color?: string;
  parentId?: string;
  type?: string;
}

// Gantt View Props
export interface GanttViewProps {
  data: Record<string, unknown>[];
  fieldMapping: GanttFieldMapping;
  startDate?: Date;
  endDate?: Date;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;

  // View Controls
  zoom?: 'day' | 'week' | 'month' | 'quarter';
  onZoomChange?: (zoom: GanttViewProps['zoom']) => void;
  showWeekends?: boolean;
  showDependencies?: boolean;
  showProgress?: boolean;
  showCriticalPath?: boolean;

  // Task Actions
  onTaskClick?: (task: GanttTask) => void;
  onTaskEdit?: (task: GanttTask) => void;
  onTaskCreate?: (parentId?: string) => void;
  onTaskMove?: (taskId: string, newStart: Date, newEnd: Date) => Promise<void>;
  onDependencyCreate?: (fromTaskId: string, toTaskId: string) => Promise<void>;

  // Export & Settings
  onExport?: (format: 'png' | 'pdf' | 'excel') => void;
  onSettings?: () => void;

  // Advanced Features
  interactive?: boolean;
  dragAndDrop?: boolean;
  autoScheduling?: boolean;
  resourceLeveling?: boolean;
}

// Gantt View Component
export const GanttView: React.FC<GanttViewProps> = ({
  data,
  fieldMapping,
  startDate,
  endDate,
  loading = false,
  emptyMessage = 'No tasks to display',
  className,

  // View Controls
  zoom = 'week',
  onZoomChange,
  showWeekends = true,
  showDependencies = true,
  showProgress = true,
  showCriticalPath = false,

  // Task Actions
  onTaskClick,
  onTaskEdit,
  onTaskCreate,
  onTaskMove,
  onDependencyCreate,

  // Export & Settings
  onExport,
  onSettings,

  // Advanced Features
  interactive = true,
  dragAndDrop = false,
  autoScheduling = false,
  resourceLeveling = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredTask, setHoveredTask] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);

  // Process tasks data
  const tasks = useMemo((): GanttTask[] => {
    return data.map(row => {
      const start = parseISO(String(row[fieldMapping.start]));
      const end = parseISO(String(row[fieldMapping.end]));

      return {
        id: String(row[fieldMapping.id] || row.id),
        name: String(row[fieldMapping.name] || ''),
        type: (row[fieldMapping.type] as GanttTaskType) || 'task',
        start,
        end,
        progress: fieldMapping.progress ? Number(row[fieldMapping.progress]) || 0 : undefined,
        dependencies: fieldMapping.dependencies ?
          String(row[fieldMapping.dependencies]).split(',').map(d => d.trim()) : undefined,
        assignee: fieldMapping.assignee ? {
          id: String(row[fieldMapping.assignee]),
          name: String(row[fieldMapping.assignee]),
          // Would need additional mapping for avatar
        } : undefined,
        status: (row[fieldMapping.status] as GanttTask['status']) || 'not_started',
        priority: (row[fieldMapping.priority] as GanttTask['priority']) || 'medium',
        color: row[fieldMapping.color] ? String(row[fieldMapping.color]) : undefined,
        parentId: fieldMapping.parentId ? String(row[fieldMapping.parentId]) : undefined,
        metadata: row
      };
    }).sort((a, b) => a.start.getTime() - b.start.getTime());
  }, [data, fieldMapping]);

  // Calculate date range
  const dateRange = useMemo(() => {
    if (startDate && endDate) {
      return { start: startDate, end: endDate };
    }

    if (tasks.length === 0) {
      const today = new Date();
      return {
        start: startOfWeek(today, { weekStartsOn: 1 }),
        end: endOfWeek(addDays(today, 30), { weekStartsOn: 1 })
      };
    }

    const earliest = tasks.reduce((min, task) =>
      task.start < min ? task.start : min, tasks[0].start
    );
    const latest = tasks.reduce((max, task) =>
      task.end > max ? task.end : max, tasks[0].end
    );

    return {
      start: startOfWeek(earliest, { weekStartsOn: 1 }),
      end: endOfWeek(addDays(latest, 7), { weekStartsOn: 1 })
    };
  }, [tasks, startDate, endDate]);

  // Generate timeline headers
  const timelineHeaders = useMemo(() => {
    const headers: { date: Date; label: string; isWeekend: boolean }[] = [];

    let current = dateRange.start;
    while (current <= dateRange.end) {
      let label = '';
      let skipDays = 1;

      switch (zoom) {
        case 'day':
          label = format(current, 'MMM d');
          break;
        case 'week':
          label = `Week ${format(current, 'w')}`;
          skipDays = 7;
          break;
        case 'month':
          label = format(current, 'MMM yyyy');
          skipDays = 30;
          break;
        case 'quarter':
          const quarter = Math.floor((current.getMonth() / 3)) + 1;
          label = `Q${quarter} ${current.getFullYear()}`;
          skipDays = 90;
          break;
      }

      const isWeekend = !showWeekends && (current.getDay() === 0 || current.getDay() === 6);

      headers.push({
        date: current,
        label,
        isWeekend
      });

      current = addDays(current, skipDays);
    }

    return headers;
  }, [dateRange, zoom, showWeekends]);

  // Calculate task position and width
  const getTaskDimensions = useCallback((task: GanttTask) => {
    const totalDays = differenceInDays(dateRange.end, dateRange.start);
    const taskStartOffset = differenceInDays(task.start, dateRange.start);
    const taskDuration = Math.max(1, differenceInDays(task.end, task.start));

    const left = (taskStartOffset / totalDays) * 100;
    const width = (taskDuration / totalDays) * 100;

    return { left: Math.max(0, left), width: Math.min(100 - left, width) };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);

  // Get status color using design tokens
  const getStatusColor = useCallback((status: GanttTask['status']) => {
    switch (status) {
      case 'completed': return 'hsl(var(--color-success))';
      case 'in_progress': return 'hsl(var(--color-primary))';
      case 'delayed': return 'hsl(var(--color-warning))';
      case 'blocked': return 'hsl(var(--color-destructive))';
      default: return 'hsl(var(--color-muted))';
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Get priority icon
  const getPriorityIcon = useCallback((priority: GanttTask['priority']) => {
    switch (priority) {
      case 'critical': return AlertTriangle;
      case 'high': return AlertTriangle;
      case 'medium': return Clock;
      case 'low': return CheckCircle;
      default: return Clock;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Render task bar
  const renderTaskBar = useCallback((task: GanttTask) => {
    const dimensions = getTaskDimensions(task);
    const statusColor = task.color || getStatusColor(task.status);
    const isHovered = hoveredTask === task.id;
    const isSelected = selectedTask === task.id;
    const PriorityIcon = getPriorityIcon(task.priority || 'medium');

    return (
      <div
        key={task.id}
        className={cn(
          'absolute top-xs h-icon-md rounded cursor-pointer transition-all duration-200 flex items-center px-xs text-xs font-medium text-white overflow-hidden',
          isHovered && 'shadow-lg scale-105 z-10',
          isSelected && 'ring-2 ring-primary ring-offset-1',
          interactive && 'hover:shadow-md'
        )}
        style={{
          left: `${dimensions.left}%`,
          width: `${dimensions.width}%`,
          backgroundColor: statusColor,
          minWidth: '60px'
        }}
        onMouseEnter={() => setHoveredTask(task.id)}
        onMouseLeave={() => setHoveredTask(null)}
        onClick={() => {
          setSelectedTask(task.id);
          onTaskClick?.(task);
        }}
      >
        {/* Task Content */}
        <div className="flex items-center gap-xs flex-1 min-w-0">
          {task.type === 'milestone' ? (
            <div className="w-2 h-2 bg-white rounded-full flex-shrink-0" />
          ) : (
            <>
              <PriorityIcon className="w-3 h-3 flex-shrink-0" />
              <span className="truncate flex-1">{task.name}</span>
              {task.assignee && (
                <Avatar className="w-icon-xs h-icon-xs flex-shrink-0 -mr-1">
                  <AvatarImage src={task.assignee.avatar} />
                  <AvatarFallback className="text-xs">
                    {task.assignee.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
            </>
          )}
        </div>

        {/* Progress Indicator */}
        {showProgress && task.progress !== undefined && task.type !== 'milestone' && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20 rounded-b">
            <div
              className="h-full bg-white/80 rounded-b transition-all duration-300"
              style={{ width: `${task.progress}%` }}
            />
          </div>
        )}

        {/* Resize Handles */}
        {interactive && dragAndDrop && task.type !== 'milestone' && (
          <>
            <div className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/20" />
            <div className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/20" />
          </>
        )}
      </div>
    );
  }, [
    getTaskDimensions,
    getStatusColor,
    getPriorityIcon,
    hoveredTask,
    selectedTask,
    interactive,
    dragAndDrop,
    showProgress,
    onTaskClick
  ]);

  // Render task row
  const renderTaskRow = useCallback((task: GanttTask, index: number) => {
    const isHovered = hoveredTask === task.id;
    const isSelected = selectedTask === task.id;

    return (
      <div
        key={task.id}
        className={cn(
          'flex border-b hover:bg-accent/50 transition-colors relative',
          isSelected && 'bg-accent',
          isHovered && 'bg-accent/70'
        )}
        style={{ height: '40px' }}
      >
        {/* Task Info Column */}
        <div className="w-container-md flex-shrink-0 p-xs border-r flex items-center gap-sm">
          <div className="flex items-center gap-xs flex-1 min-w-0">
            {/* Task Type Indicator */}
            <div
              className={cn(
                'w-3 h-3 rounded-full flex-shrink-0',
                task.type === 'milestone' && 'bg-yellow-500',
                task.type === 'phase' && 'bg-blue-500',
                task.type === 'project' && 'bg-purple-500',
                task.type === 'task' && 'bg-green-500'
              )}
            />

            {/* Task Name */}
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate text-sm">{task.name}</div>
              {task.assignee && (
                <div className="flex items-center gap-xs mt-1">
                  <Avatar className="w-icon-xs h-icon-xs">
                    <AvatarImage src={task.assignee.avatar} />
                    <AvatarFallback className="text-xs">
                      {task.assignee.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground truncate">
                    {task.assignee.name}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Task Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-icon-md w-icon-md p-0">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onTaskClick?.(task)}>
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onTaskEdit?.(task)}>
                Edit Task
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onTaskCreate?.(task.id)}>
                Add Subtask
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                Delete Task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Timeline Column */}
        <div className="flex-1 relative bg-muted/30">
          {renderTaskBar(task)}

          {/* Dependency Lines */}
          {showDependencies && task.dependencies && (
            <svg className="absolute inset-0 pointer-events-none">
              {task.dependencies.map(depId => {
                // This would draw dependency arrows - simplified for now
                return null;
              })}
            </svg>
          )}
        </div>
      </div>
    );
  }, [
    hoveredTask,
    selectedTask,
    showDependencies,
    onTaskClick,
    onTaskEdit,
    onTaskCreate,
    renderTaskBar
  ]);

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-md border-b">
        <div className="flex items-center gap-xs">
          {/* Zoom Controls */}
          <div className="flex items-center border rounded-md">
            <Button
              variant={zoom === 'day' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onZoomChange?.('day')}
              className="rounded-r-none"
            >
              Day
            </Button>
            <Button
              variant={zoom === 'week' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onZoomChange?.('week')}
              className="rounded-none border-x"
            >
              Week
            </Button>
            <Button
              variant={zoom === 'month' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onZoomChange?.('month')}
              className="rounded-none"
            >
              Month
            </Button>
            <Button
              variant={zoom === 'quarter' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onZoomChange?.('quarter')}
              className="rounded-l-none"
            >
              Quarter
            </Button>
          </div>

          {/* Date Navigation */}
          <div className="flex items-center gap-xs ml-4">
            <Button variant="outline" size="sm">
              <ChevronLeft className="h-icon-xs w-icon-xs" />
            </Button>
            <Button variant="outline" size="sm">
              Today
            </Button>
            <Button variant="outline" size="sm">
              <ChevronRight className="h-icon-xs w-icon-xs" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-xs">
          {/* Settings */}
          {onSettings && (
            <Button variant="outline" size="sm" onClick={onSettings}>
              <Settings className="h-icon-xs w-icon-xs" />
            </Button>
          )}

          {/* Export */}
          {onExport && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-icon-xs w-icon-xs mr-1" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onExport('png')}>
                  Export as PNG
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport('pdf')}>
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport('excel')}>
                  Export as Excel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Add Task */}
          {onTaskCreate && (
            <Button onClick={() => onTaskCreate()}>
              <Plus className="h-icon-xs w-icon-xs mr-1" />
              Add Task
            </Button>
          )}
        </div>
      </div>

      {/* Gantt Chart */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Timeline Header */}
        <div className="flex border-b bg-muted/50">
          {/* Task Column Header */}
          <div className="w-container-md flex-shrink-0 p-sm border-r">
            <h3 className="font-medium">Tasks</h3>
          </div>

          {/* Timeline Headers */}
          <div className="flex-1 overflow-x-auto">
            <div className="flex min-w-max">
              {timelineHeaders.map((header, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex-shrink-0 p-xs text-center text-sm border-r min-w-20',
                    header.isWeekend && 'bg-muted'
                  )}
                >
                  {header.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Task Rows */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            // Loading state
            <div className="flex items-center justify-center h-component-xl">
              <div className="flex items-center gap-xs">
                <div className="w-icon-xs h-icon-xs border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span>Loading tasks...</span>
              </div>
            </div>
          ) : tasks.length === 0 ? (
            // Empty state
            <div className="flex items-center justify-center h-component-xl">
              <div className="text-center">
                <Calendar className="h-icon-lg w-icon-lg text-muted-foreground mx-auto mb-2" />
                <div className="text-muted-foreground">{emptyMessage}</div>
              </div>
            </div>
          ) : (
            <div className="divide-y">
              {tasks.map((task, index) => renderTaskRow(task, index))}
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between p-xs border-t text-xs text-muted-foreground bg-muted/30">
        <div>
          {tasks.length} tasks • {tasks.filter(t => t.status === 'completed').length} completed
        </div>
        <div className="flex items-center gap-md">
          {showCriticalPath && (
            <Badge variant="outline" className="text-xs">
              Critical Path
            </Badge>
          )}
          {autoScheduling && (
            <Badge variant="outline" className="text-xs">
              Auto-scheduling
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

export type { GanttViewProps, GanttTask, GanttTaskType, GanttFieldMapping };
