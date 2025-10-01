'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/atomic/Button';
import { Skeleton } from '../../components/atomic/Skeleton';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '../../components/DropdownMenu';
import { 
  ChevronLeft,
  ChevronRight,
  Calendar,
  Plus,
  MoreVertical,
  Eye,
  Edit,
  Trash,
  Clock
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import type { UnifiedService } from '../services/UnifiedService';
import type { FieldConfig } from '../drawers/UnifiedDrawer';

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end?: Date;
  allDay?: boolean;
  color?: string;
  data: any;
}

export interface UnifiedCalendarViewProps {
  service: UnifiedService<any>;
  fields: FieldConfig[];
  data?: any[];
  loading?: boolean;
  onItemClick?: (item: any) => void;
  onItemAction?: (action: string, item: any) => void;
  onDateClick?: (date: Date) => void;
  customActions?: Array<{
    id: string;
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick: (item: any) => void;
    condition?: (item: any) => boolean;
  }>;
  emptyState?: React.ReactNode;
  dateField?: string;
  endDateField?: string;
  titleField?: string;
  colorField?: string;
  viewMode?: 'month' | 'week' | 'day';
}

export const UnifiedCalendarView: React.FC<UnifiedCalendarViewProps> = ({
  service,
  fields,
  data: externalData,
  loading: externalLoading,
  onItemClick,
  onItemAction,
  onDateClick,
  customActions = [],
  emptyState,
  dateField = 'date',
  endDateField = 'end_date',
  titleField = 'title',
  colorField = 'color',
  viewMode: initialViewMode = 'month',
}) => {
  const [data, setData] = useState<any[]>(externalData || []);
  const [loading, setLoading] = useState(externalLoading || false);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>(initialViewMode);

  // Load data if not provided externally
  useEffect(() => {
    if (!externalData && service) {
      loadData();
    } else if (externalData) {
      setData(externalData);
    }
  }, [externalData, service, currentDate]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load data for the current month/week/day range
      const startOfPeriod = getStartOfPeriod(currentDate, viewMode);
      const endOfPeriod = getEndOfPeriod(currentDate, viewMode);
      
      const result = await service.list({
        limit: 500,
        filters: {
          [dateField]: {
            operator: 'gte',
            value: startOfPeriod.toISOString()
          },
          [`${dateField}_end`]: {
            operator: 'lte', 
            value: endOfPeriod.toISOString()
          }
        }
      });
      setData(result.data);
    } catch (err: any) {
      setError(err.message);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Convert data to calendar events
  const events = useMemo(() => {
    return data.map(item => {
      const startDate = new Date(item[dateField]);
      const endDate = item[endDateField] ? new Date(item[endDateField]) : null;
      const title = item[titleField] || item.name || item.title || 'Untitled';
      const color = item[colorField] || getEventColor(item);
      
      return {
        id: item.id,
        title,
        start: startDate,
        end: endDate,
        allDay: !hasTime(startDate) && (!endDate || !hasTime(endDate)),
        color,
        data: item
      } as CalendarEvent;
    });
  }, [data, dateField, endDateField, titleField, colorField]);

  // Generate calendar grid
  const calendarGrid = useMemo(() => {
    if (viewMode === 'month') {
      return generateMonthGrid(currentDate);
    } else if (viewMode === 'week') {
      return generateWeekGrid(currentDate);
    } else {
      return generateDayGrid(currentDate);
    }
  }, [currentDate, viewMode]);

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventStart = new Date(event.start);
      const eventEnd = event.end ? new Date(event.end) : eventStart;
      
      return date >= new Date(eventStart.toDateString()) && 
             date <= new Date(eventEnd.toDateString());
    });
  };

  const navigate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    }
    
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const renderEvent = (event: CalendarEvent, isCompact = false) => {
    const statusField = fields.find(f => f.key === 'status');
    const status = statusField ? event.data[statusField.key] : null;
    
    return (
      <div
        key={event.id}
        className={`
          text-xs p-xs rounded cursor-pointer hover:opacity-80 transition-opacity
          ${isCompact ? 'mb-1' : 'mb-2'}
          ${event.color ? `bg-${event.color}-100 text-${event.color}-800 border-${event.color}-200` : 'bg-primary/10 text-primary border-primary/20'}
          border
        `}
        onClick={(e) => {
          e.stopPropagation();
          onItemClick?.(event.data);
        }}
        title={event.title}
      >
        <div className="flex items-center justify-between">
          <span className="truncate flex-1">
            {event.allDay ? '' : formatTime(event.start)} {event.title}
          </span>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm" className="h-icon-xs w-icon-xs p-0 opacity-0 group-hover:opacity-100">
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onItemAction?.('view', event.data)}>
                <Eye className="mr-xs h-icon-xs w-icon-xs" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onItemAction?.('edit', event.data)}>
                <Edit className="mr-xs h-icon-xs w-icon-xs" />
                Edit
              </DropdownMenuItem>
              
              {customActions.length > 0 && <DropdownMenuSeparator />}
              
              {customActions.map(action => {
                if (action.condition && !action.condition(event.data)) return null;
                return (
                  <DropdownMenuItem 
                    key={action.id}
                    onClick={() => action.onClick(event.data)}
                  >
                    {action.icon && <action.icon className="mr-xs h-icon-xs w-icon-xs" />}
                    {action.label}
                  </DropdownMenuItem>
                );
              })}
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={() => onItemAction?.('delete', event.data)}
                className="text-destructive"
              >
                <Trash className="mr-xs h-icon-xs w-icon-xs" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {status && (
          <Badge variant="outline" className="text-xs mt-1">
            {status}
          </Badge>
        )}
      </div>
    );
  };

  const renderCalendarCell = (date: Date, isCurrentMonth = true) => {
    const dayEvents = getEventsForDate(date);
    const isToday = isSameDay(date, new Date());
    const isSelected = isSameDay(date, currentDate);
    
    return (
      <div
        key={date.toISOString()}
        className={`
          min-h-header-lg p-sm border border-border cursor-pointer hover:bg-muted/50 transition-colors group
          ${!isCurrentMonth ? 'bg-muted/20 text-muted-foreground' : ''}
          ${isToday ? 'bg-primary/5 border-primary' : ''}
          ${isSelected ? 'ring-2 ring-primary' : ''}
        `}
        onClick={() => onDateClick?.(date)}
      >
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm font-medium ${isToday ? 'text-primary' : ''}`}>
            {date.getDate()}
          </span>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-icon-md w-icon-md p-0 opacity-0 group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              onItemAction?.('create', { [dateField]: date });
            }}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        
        <div className="space-y-1">
          {dayEvents.slice(0, 3).map(event => renderEvent(event, true))}
          {dayEvents.length > 3 && (
            <div className="text-xs text-muted-foreground">
              +{dayEvents.length - 3} more
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading || externalLoading) {
    return (
      <div className="space-y-md">
        <div className="flex items-center justify-between">
          <Skeleton className="h-icon-lg w-container-xs" />
          <div className="flex gap-sm">
            <Skeleton className="h-icon-lg w-component-lg" />
            <Skeleton className="h-icon-lg w-component-lg" />
            <Skeleton className="h-icon-lg w-component-lg" />
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-px bg-border">
          {Array.from({ length: 42 }).map((_, i) => (
            <div key={i} className="bg-background min-h-header-lg p-sm">
              <Skeleton className="h-icon-xs w-icon-md mb-2" />
              <div className="space-y-1">
                <Skeleton className="h-icon-md w-full" />
                <Skeleton className="h-icon-md w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-lg">
        <div className="text-center">
          <p className="text-destructive mb-sm">Error loading calendar data</p>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button onClick={loadData} className="mt-md">
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-md">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-md">
          <h2 className="text-2xl font-semibold">
            {formatCalendarTitle(currentDate, viewMode)}
          </h2>
          
          <div className="flex items-center gap-xs">
            <Button variant="outline" size="sm" onClick={() => navigate('prev')}>
              <ChevronLeft className="h-icon-xs w-icon-xs" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('next')}>
              <ChevronRight className="h-icon-xs w-icon-xs" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-sm">
          <div className="flex items-center border rounded-md">
            {(['month', 'week', 'day'] as const).map(mode => (
              <Button
                key={mode}
                variant={viewMode === mode ? 'default' : 'ghost'}
                size="sm"
                className="rounded-none first:rounded-l-md last:rounded-r-md"
                onClick={() => setViewMode(mode)}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </Button>
            ))}
          </div>
          
          <Button
            onClick={() => onItemAction?.('create', { [dateField]: currentDate })}
          >
            <Plus className="h-icon-xs w-icon-xs mr-xs" />
            Add Event
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      {viewMode === 'month' && (
        <>
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-px bg-border">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="bg-muted p-sm text-center text-sm font-medium">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-px bg-border">
            {calendarGrid.map(({ date, isCurrentMonth }) => 
              renderCalendarCell(date, isCurrentMonth)
            )}
          </div>
        </>
      )}

      {/* Week View */}
      {viewMode === 'week' && (
        <div className="grid grid-cols-8 gap-px bg-border">
          <div className="bg-muted p-sm"></div>
          {calendarGrid.slice(0, 7).map(({ date }) => (
            <div key={date.toISOString()} className="bg-muted p-sm text-center">
              <div className="text-sm font-medium">{formatDate(date).split(',')[0]}</div>
              <div className={`text-lg ${isSameDay(date, new Date()) ? 'text-primary font-bold' : ''}`}>
                {date.getDate()}
              </div>
            </div>
          ))}
          
          {/* Time slots */}
          {Array.from({ length: 24 }).map((_, hour) => (
            <React.Fragment key={hour}>
              <div className="bg-background p-sm text-xs text-muted-foreground border-r">
                {formatHour(hour)}
              </div>
              {calendarGrid.slice(0, 7).map(({ date }) => {
                const hourEvents = getEventsForDate(date).filter(event => 
                  new Date(event.start).getHours() === hour
                );
                return (
                  <div key={`${date.toISOString()}-${hour}`} className="bg-background p-xs min-h-toolbar">
                    {hourEvents.map(event => renderEvent(event))}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Day View */}
      {viewMode === 'day' && (
        <div className="space-y-md">
          <div className="text-lg font-medium">
            {formatDate(currentDate)}
          </div>
          
          <div className="grid grid-cols-1 gap-px bg-border">
            {Array.from({ length: 24 }).map((_, hour) => {
              const hourEvents = getEventsForDate(currentDate).filter(event => 
                new Date(event.start).getHours() === hour
              );
              
              return (
                <div key={hour} className="bg-background p-md min-h-header-sm flex">
                  <div className="w-component-lg text-sm text-muted-foreground">
                    {formatHour(hour)}
                  </div>
                  <div className="flex-1 space-y-2">
                    {hourEvents.map(event => renderEvent(event))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper functions
function getStartOfPeriod(date: Date, viewMode: 'month' | 'week' | 'day'): Date {
  const start = new Date(date);
  if (viewMode === 'month') {
    start.setDate(1);
    start.setDate(start.getDate() - start.getDay());
  } else if (viewMode === 'week') {
    start.setDate(start.getDate() - start.getDay());
  }
  start.setHours(0, 0, 0, 0);
  return start;
}

function getEndOfPeriod(date: Date, viewMode: 'month' | 'week' | 'day'): Date {
  const end = new Date(date);
  if (viewMode === 'month') {
    end.setMonth(end.getMonth() + 1, 0);
    end.setDate(end.getDate() + (6 - end.getDay()));
  } else if (viewMode === 'week') {
    end.setDate(end.getDate() + (6 - end.getDay()));
  }
  end.setHours(23, 59, 59, 999);
  return end;
}

function generateMonthGrid(date: Date) {
  const grid = [];
  const start = getStartOfPeriod(date, 'month');
  const currentMonth = date.getMonth();
  
  for (let i = 0; i < 42; i++) {
    const cellDate = new Date(start);
    cellDate.setDate(start.getDate() + i);
    grid.push({
      date: cellDate,
      isCurrentMonth: cellDate.getMonth() === currentMonth
    });
  }
  
  return grid;
}

function generateWeekGrid(date: Date) {
  const grid = [];
  const start = getStartOfPeriod(date, 'week');
  
  for (let i = 0; i < 7; i++) {
    const cellDate = new Date(start);
    cellDate.setDate(start.getDate() + i);
    grid.push({
      date: cellDate,
      isCurrentMonth: true
    });
  }
  
  return grid;
}

function generateDayGrid(date: Date) {
  return [{ date: new Date(date), isCurrentMonth: true }];
}

function isSameDay(date1: Date, date2: Date): boolean {
  return date1.toDateString() === date2.toDateString();
}

function hasTime(date: Date): boolean {
  return date.getHours() !== 0 || date.getMinutes() !== 0 || date.getSeconds() !== 0;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
}

function formatHour(hour: number): string {
  const date = new Date();
  date.setHours(hour, 0, 0, 0);
  return formatTime(date);
}

function formatCalendarTitle(date: Date, viewMode: string): string {
  if (viewMode === 'month') {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  } else if (viewMode === 'week') {
    const start = getStartOfPeriod(date, 'week');
    const end = getEndOfPeriod(date, 'week');
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  } else {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  }
}

function getEventColor(item: any): string {
  // Default color logic based on status or priority
  if (item.status) {
    const status = item.status.toLowerCase();
    if (['completed', 'done', 'success'].includes(status)) return 'green';
    if (['in_progress', 'active'].includes(status)) return 'blue';
    if (['pending', 'draft'].includes(status)) return 'yellow';
    if (['cancelled', 'failed'].includes(status)) return 'red';
  }
  
  if (item.priority) {
    const priority = item.priority.toLowerCase();
    if (['high', 'critical'].includes(priority)) return 'red';
    if (priority === 'medium') return 'yellow';
    if (priority === 'low') return 'green';
  }
  
  return 'blue';
}

export default UnifiedCalendarView;
