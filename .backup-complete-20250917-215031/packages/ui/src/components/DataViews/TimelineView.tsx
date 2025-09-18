'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useDataView } from './DataViewProvider';
import { Button } from '../Button';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar,
  Plus,
  MoreHorizontal,
  Flag,
  Clock,
  Users,
  AlertTriangle
} from 'lucide-react';
import { TimelineItem, DataRecord } from './types';

interface TimelineViewProps {
  className?: string;
  startDateField: string;
  endDateField?: string;
  titleField: string;
  progressField?: string;
  dependenciesField?: string;
  milestoneField?: string;
  criticalField?: string;
  assigneeField?: string;
  onItemClick?: (item: DataRecord) => void;
  onItemMove?: (itemId: string, newStart: Date, newEnd?: Date) => void;
  onDependencyCreate?: (fromId: string, toId: string) => void;
}

type TimelineScale = 'day' | 'week' | 'month' | 'quarter';

export function TimelineView({
  className = '',
  startDateField,
  endDateField,
  titleField,
  progressField,
  dependenciesField,
  milestoneField,
  criticalField,
  assigneeField,
  onItemClick,
  onItemMove,
  onDependencyCreate
}: TimelineViewProps) {
  const { state, config, actions } = useDataView();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [scale, setScale] = useState<TimelineScale>('month');
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  // Convert data records to timeline items
  const timelineItems = useMemo(() => {
    if (!config.data) return [];
    return config.data.map(record => ({
      id: record.id,
      title: record[titleField] || 'Untitled',
      start: new Date(record[startDateField]),
      end: endDateField ? new Date(record[endDateField]) : undefined,
      progress: progressField ? Number(record[progressField]) || 0 : 0,
      dependencies: dependenciesField ? record[dependenciesField] || [] : [],
      milestone: milestoneField ? Boolean(record[milestoneField]) : false,
      critical: criticalField ? Boolean(record[criticalField]) : false,
      assignee: assigneeField ? record[assigneeField] : undefined,
      record
    }));
  }, [config.data, startDateField, endDateField, titleField, progressField, dependenciesField, milestoneField, criticalField, assigneeField]);

  // Generate timeline grid based on scale
  const timelineGrid = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    let periods = [];
    let startDate: Date;
    let endDate: Date;
    
    switch (scale) {
      case 'day':
        startDate = new Date(year, month, 1);
        endDate = new Date(year, month + 1, 0);
        for (let day = 1; day <= endDate.getDate(); day++) {
          periods.push(new Date(year, month, day));
        }
        break;
      case 'week':
        startDate = new Date(year, month, 1);
        endDate = new Date(year, month + 1, 0);
        const firstWeek = new Date(startDate);
        firstWeek.setDate(firstWeek.getDate() - firstWeek.getDay());
        
        let current = new Date(firstWeek);
        while (current <= endDate) {
          periods.push(new Date(current));
          current.setDate(current.getDate() + 7);
        }
        break;
      case 'month':
        startDate = new Date(year, 0, 1);
        endDate = new Date(year, 11, 31);
        for (let m = 0; m < 12; m++) {
          periods.push(new Date(year, m, 1));
        }
        break;
      case 'quarter':
        startDate = new Date(year, 0, 1);
        endDate = new Date(year, 11, 31);
        for (let q = 0; q < 4; q++) {
          periods.push(new Date(year, q * 3, 1));
        }
        break;
    }
    
    return { periods, startDate, endDate };
  }, [currentDate, scale]);

  const navigateTimeline = useCallback((direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    
    switch (scale) {
      case 'day':
      case 'week':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
      case 'month':
      case 'quarter':
        newDate.setFullYear(newDate.getFullYear() + (direction === 'next' ? 1 : -1));
        break;
    }
    
    setCurrentDate(newDate);
  }, [currentDate, scale]);

  const getItemPosition = useCallback((item: TimelineItem) => {
    const { startDate, endDate } = timelineGrid;
    const totalDuration = endDate.getTime() - startDate.getTime();
    
    const itemStart = Math.max(item.start.getTime(), startDate.getTime());
    const itemEnd = item.end ? Math.min(item.end.getTime(), endDate.getTime()) : itemStart;
    
    const startPercent = ((itemStart - startDate.getTime()) / totalDuration) * 100;
    const widthPercent = ((itemEnd - itemStart) / totalDuration) * 100;
    
    return {
      left: `${Math.max(0, startPercent)}%`,
      width: `${Math.max(2, widthPercent)}%`,
    };
  }, [timelineGrid]);

  const formatPeriodLabel = useCallback((date: Date) => {
    switch (scale) {
      case 'day':
        return date.getDate().toString();
      case 'week':
        return `Week ${Math.ceil(date.getDate() / 7)}`;
      case 'month':
        return date.toLocaleDateString(undefined, { month: 'short' });
      case 'quarter':
        return `Q${Math.floor(date.getMonth() / 3) + 1}`;
      default:
        return '';
    }
  }, [scale]);

  const formatHeaderLabel = useCallback(() => {
    switch (scale) {
      case 'day':
      case 'week':
        return currentDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long' });
      case 'month':
      case 'quarter':
        return currentDate.getFullYear().toString();
      default:
        return '';
    }
  }, [currentDate, scale]);

  const handleItemDragStart = useCallback((e: React.DragEvent, itemId: string) => {
    setDraggedItem(itemId);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleItemDrop = useCallback((e: React.DragEvent, targetDate: Date) => {
    e.preventDefault();
    if (draggedItem) {
      const item = timelineItems.find(i => i.id === draggedItem);
      if (item) {
        const duration = item.end ? item.end.getTime() - item.start.getTime() : 0;
        const newEnd = duration > 0 ? new Date(targetDate.getTime() + duration) : undefined;
        onItemMove?.(draggedItem, targetDate, newEnd);
      }
    }
    setDraggedItem(null);
  }, [draggedItem, timelineItems, onItemMove]);

  const timelineClasses = `
    bg-background border border-border rounded-lg overflow-hidden
    ${className}
  `.trim();

  return (
    <div className={timelineClasses}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateTimeline('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <h2 className="text-lg font-semibold text-foreground min-w-[150px] text-center">
              {formatHeaderLabel()}
            </h2>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateTimeline('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
          >
            Today
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-muted rounded-lg p-1">
            {(['day', 'week', 'month', 'quarter'] as TimelineScale[]).map((scaleOption) => (
              <Button
                key={scaleOption}
                variant={scale === scaleOption ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setScale(scaleOption)}
                className="capitalize"
              >
                {scaleOption}
              </Button>
            ))}
          </div>
          
          <Button
            variant="primary"
            size="sm"
            onClick={() => config.onCreate?.()}
          >
            <Plus className="h-4 w-4 mr-1" />
            New Task
          </Button>
        </div>
      </div>

      {/* Timeline */}
      <div className="overflow-auto">
        {/* Timeline Header */}
        <div className="flex border-b border-border bg-muted">
          <div className="w-64 p-3 border-r border-border font-medium text-sm text-foreground">
            Task
          </div>
          <div className="flex-1 flex">
            {timelineGrid.periods.map((period, index) => (
              <div
                key={index}
                className="flex-1 p-3 border-r border-border text-center text-sm font-medium text-muted-foreground min-w-[80px]"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleItemDrop(e, period)}
              >
                {formatPeriodLabel(period)}
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Items */}
        <div className="divide-y divide-border">
          {timelineItems.map((item) => {
            const position = getItemPosition(item);
            const isDragging = draggedItem === item.id;
            
            return (
              <div
                key={item.id}
                className={`flex hover:bg-muted/50 ${isDragging ? 'opacity-50' : ''}`}
              >
                {/* Task Info */}
                <div className="w-64 p-3 border-r border-border">
                  <div className="flex items-center gap-2">
                    {item.milestone && (
                      <Flag className="h-4 w-4 text-warning" />
                    )}
                    {item.critical && (
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                    )}
                    <div
                      className="font-medium text-sm text-foreground cursor-pointer hover:text-primary truncate"
                      onClick={() => onItemClick?.(item.record)}
                    >
                      {item.title}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                    {item.assignee && (
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{item.assignee}</span>
                      </div>
                    )}
                    {item.progress > 0 && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{item.progress}%</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Timeline Bar */}
                <div className="flex-1 relative p-3">
                  <div className="relative h-6">
                    {item.milestone ? (
                      <div
                        className="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 bg-warning rotate-45 cursor-pointer"
                        style={{ left: position.left }}
                        draggable
                        onDragStart={(e) => handleItemDragStart(e, item.id)}
                        onClick={() => onItemClick?.(item.record)}
                        title={`${item.title} - ${item.start.toLocaleDateString()}`}
                      />
                    ) : (
                      <div
                        className={`
                          absolute top-1/2 transform -translate-y-1/2 h-4 rounded cursor-pointer
                          ${item.critical ? 'bg-destructive' : 'bg-primary'}
                          hover:opacity-80 transition-opacity
                        `}
                        style={position}
                        draggable
                        onDragStart={(e) => handleItemDragStart(e, item.id)}
                        onClick={() => onItemClick?.(item.record)}
                        title={`${item.title} - ${item.start.toLocaleDateString()}${item.end ? ` to ${item.end.toLocaleDateString()}` : ''}`}
                      >
                        {/* Progress Bar */}
                        {item.progress > 0 && (
                          <div
                            className="h-full bg-success rounded"
                            style={{ width: `${item.progress}%` }}
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="w-12 p-3 flex items-center justify-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      // Show item actions menu
                    }}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {timelineItems.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <div className="text-lg font-medium mb-2">No tasks in timeline</div>
            <Button
              variant="primary"
              onClick={() => config.onCreate?.()}
            >
              <Plus className="h-4 w-4 mr-1" />
              Create Task
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
