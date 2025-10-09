'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Search, Filter, MoreHorizontal, Plus, Clock, MapPin, Users, Tag, CalendarIcon } from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input
} from "@ghxstship/ui";
import { Input ,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@ghxstship/ui';
import { Badge ,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@ghxstship/ui';
import { Avatar, AvatarFallback, AvatarImage ,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@ghxstship/ui';
import {
  Dropdown,
  
  DropdownItem,
  DropdownMenuTrigger
} from '@ghxstship/ui';
import { Card, CardContent ,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@ghxstship/ui';
import { cn } from '@ghxstship/ui/lib/utils';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  parseISO,
  isWithinInterval
} from 'date-fns';

// Calendar View Types
export type CalendarViewMode = 'month' | 'week' | 'day' | 'agenda';

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  color?: string;
  category?: string;
  location?: string;
  attendees?: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
  description?: string;
  data: Record<string, unknown>;
}

// Calendar Field Configuration
export interface CalendarFieldMapping {
  id: string;
  title: string;
  startDate: string;
  endDate?: string;
  allDay?: string;
  color?: string;
  category?: string;
  location?: string;
  attendees?: string;
  description?: string;
}

// Calendar View Props
export interface CalendarViewProps {
  data: Record<string, unknown>[];
  fieldMapping: CalendarFieldMapping;
  viewMode?: CalendarViewMode;
  currentDate?: Date;
  loading?: boolean;
  className?: string;

  // View Controls
  onViewModeChange?: (mode: CalendarViewMode) => void;
  onDateChange?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  onEventCreate?: (date: Date, time?: string) => void;

  // Search & Filter
  globalSearch?: string;
  onGlobalSearch?: (query: string) => void;
  categoryFilter?: string[];
  onCategoryFilter?: (categories: string[]) => void;

  // Customization
  eventColors?: Record<string, string>;
  showWeekends?: boolean;
  showTimeGrid?: boolean;
  timeFormat?: '12h' | '24h';
  firstDayOfWeek?: 0 | 1; // 0 = Sunday, 1 = Monday

  // Advanced Features
  multiDayEvents?: boolean;
  overlappingEvents?: boolean;
  dragAndDrop?: boolean;
  resizeEvents?: boolean;
  externalCalendars?: Array<{
    id: string;
    name: string;
    color: string;
    events: CalendarEvent[];
  }>;
}

// Calendar View Component
export const CalendarView: React.FC<CalendarViewProps> = ({
  data,
  fieldMapping,
  viewMode = 'month',
  currentDate = new Date(),
  loading = false,
  className,

  // View Controls
  onViewModeChange,
  onDateChange,
  onEventClick,
  onEventCreate,

  // Search & Filter
  globalSearch = '',
  onGlobalSearch,
  categoryFilter = [],
  onCategoryFilter,

  // Customization
  eventColors = {},
  showWeekends = true,
  showTimeGrid = true,
  timeFormat = '12h',
  firstDayOfWeek = 1,

  // Advanced Features
  multiDayEvents = true,
  overlappingEvents = true,
  dragAndDrop = false,
  resizeEvents = false,
  externalCalendars = []
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [draggedEvent, setDraggedEvent] = useState<string | null>(null);

  // Convert data to calendar events
  const events = useMemo((): CalendarEvent[] => {
    const filteredData = data.filter(row => {
      // Apply search filter
      if (globalSearch) {
        const searchTerm = globalSearch.toLowerCase();
        const searchableText = [
          String(row[fieldMapping.title] || ''),
          String(row[fieldMapping.description] || ''),
          String(row[fieldMapping.location] || ''),
          String(row[fieldMapping.category] || '')
        ].join(' ').toLowerCase();

        if (!searchableText.includes(searchTerm)) return false;
      }

      // Apply category filter
      if (categoryFilter.length > 0) {
        const category = String(row[fieldMapping.category] || '');
        if (!categoryFilter.includes(category)) return false;
      }

      return true;
    });

    return filteredData.map(row => {
      const startDateStr = String(row[fieldMapping.startDate]);
      const endDateStr = fieldMapping.endDate ? String(row[fieldMapping.endDate]) : startDateStr;

      let start: Date;
      let end: Date;

      try {
        start = parseISO(startDateStr);
        end = parseISO(endDateStr);
      } catch {
        // Fallback for non-ISO date strings
        start = new Date(startDateStr);
        end = fieldMapping.endDate ? new Date(endDateStr) : new Date(start.getTime() + 3600000); // 1 hour default
      }

      const color = eventColors[String(row[fieldMapping.color] || '')] ||
                   eventColors[String(row[fieldMapping.category] || '')] ||
                   'hsl(var(--color-primary))';

      let attendees: CalendarEvent['attendees'] = [];
      if (fieldMapping.attendees && row[fieldMapping.attendees]) {
        const attendeesData = row[fieldMapping.attendees];
        if (Array.isArray(attendeesData)) {
          attendees = attendeesData.map(attendee => ({
            id: String(attendee.id || attendee),
            name: String(attendee.name || attendee),
            avatar: attendee.avatar
          }));
        }
      }

      return {
        id: String(row[fieldMapping.id] || row.id || ''),
        title: String(row[fieldMapping.title] || ''),
        start,
        end,
        allDay: Boolean(row[fieldMapping.allDay]),
        color,
        category: fieldMapping.category ? String(row[fieldMapping.category]) : undefined,
        location: fieldMapping.location ? String(row[fieldMapping.location]) : undefined,
        attendees,
        description: fieldMapping.description ? String(row[fieldMapping.description]) : undefined,
        data: row
      };
    });
  }, [data, fieldMapping, globalSearch, categoryFilter, eventColors]);

  // Get events for current view
  const viewEvents = useMemo(() => {
    switch (viewMode) {
      case 'month':
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        return events.filter(event =>
          isWithinInterval(event.start, { start: monthStart, end: monthEnd }) ||
          (multiDayEvents && event.end && isWithinInterval(event.end, { start: monthStart, end: monthEnd }))
        );

      case 'week':
        const weekStart = startOfWeek(currentDate, { weekStartsOn: firstDayOfWeek });
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: firstDayOfWeek });
        return events.filter(event =>
          isWithinInterval(event.start, { start: weekStart, end: weekEnd }) ||
          (multiDayEvents && event.end && isWithinInterval(event.end, { start: weekStart, end: weekEnd }))
        );

      case 'day':
        return events.filter(event =>
          isSameDay(event.start, currentDate) ||
          (multiDayEvents && event.end && isWithinInterval(currentDate, { start: event.start, end: event.end }))
        );

      case 'agenda':
        return events
          .filter(event => event.start >= currentDate)
          .sort((a, b) => a.start.getTime() - b.start.getTime())
          .slice(0, 50); // Limit for performance

      default:
        return events;
    }
  }, [events, viewMode, currentDate, multiDayEvents, firstDayOfWeek]);

  // Handle navigation
  const handlePrevious = useCallback(() => {
    const newDate = viewMode === 'month' ? subMonths(currentDate, 1) : new Date(currentDate);
    if (viewMode === 'week') newDate.setDate(currentDate.getDate() - 7);
    if (viewMode === 'day') newDate.setDate(currentDate.getDate() - 1);
    onDateChange?.(newDate);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate, viewMode, onDateChange]);

  const handleNext = useCallback(() => {
    const newDate = viewMode === 'month' ? addMonths(currentDate, 1) : new Date(currentDate);
    if (viewMode === 'week') newDate.setDate(currentDate.getDate() + 7);
    if (viewMode === 'day') newDate.setDate(currentDate.getDate() + 1);
    onDateChange?.(newDate);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate, viewMode, onDateChange]);

  const handleToday = useCallback(() => {
    onDateChange?.(new Date());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onDateChange]);

  // Handle date click
  const handleDateClick = // eslint-disable-next-line react-hooks/exhaustive-deps
  useCallback((date: Date) => {
    setSelectedDate(date);
    onEventCreate?.(date);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onEventCreate]);

  // Render event
  const renderEvent = useCallback((event: CalendarEvent, style?: React.CSSProperties) => (
    <div
      key={event.id}
      className={cn(
        'text-xs p-xs rounded cursor-pointer truncate border-l-2 mb-1',
        'hover:opacity-80 transition-opacity'
      )}
      style={{
        backgroundColor: `${event.color}20`,
        borderLeftColor: event.color,
        color: event.color,
        ...style
      }}
      onClick={() => onEventClick?.(event)}
      title={`${event.title}${event.location ? ` @ ${event.location}` : ''}`}
    >
      <div className="font-medium truncate">{event.title}</div>
      {event.location && (
        <div className="text-xs opacity-75 truncate flex items-center gap-xs">
          <MapPin className="h-3 w-3" />
          {event.location}
        </div>
      )}
      {event.attendees && event.attendees.length > 0 && (
        <div className="flex items-center gap-xs mt-1">
          <Users className="h-3 w-3" />
          <div className="flex -space-x-1">
            {event.attendees.slice(0, 3).map((attendee, idx) => (
              <Avatar key={idx} className="h-icon-xs w-icon-xs border border-background">
                <AvatarImage src={attendee.avatar} />
                <AvatarFallback className="text-xs">
                  {attendee.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ))}
            {event.attendees.length > 3 && (
              <div className="h-icon-xs w-icon-xs rounded-full bg-muted border border-background flex items-center justify-center text-xs">
                +{event.attendees.length - 3}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  ), [onEventClick]);

  // Render month view
  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: firstDayOfWeek });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: firstDayOfWeek });

    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return (
      <div className="bg-background border rounded-lg overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-7 border-b">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
            <div key={day} className="p-sm text-center font-medium text-sm text-muted-foreground border-r last:border-r-0">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 auto-rows-fr">
          {weeks.map((week, weekIdx) =>
            week.map((day, dayIdx) => {
              const dayEvents = events.filter(event =>
                isSameDay(event.start, day) ||
                (multiDayEvents && event.end && isWithinInterval(day, { start: event.start, end: event.end }))
              );

              const isCurrentMonth = isSameMonth(day, currentDate);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isCurrentDay = isToday(day);

              return (
                <div
                  key={`${weekIdx}-${dayIdx}`}
                  className={cn(
                    'min-h-header-lg p-xs border-r border-b last:border-r-0 cursor-pointer hover:bg-accent/50 transition-colors',
                    !isCurrentMonth && 'bg-muted/30 text-muted-foreground',
                    isSelected && 'bg-accent ring-2 ring-primary',
                    isCurrentDay && 'bg-primary/10'
                  )}
                  onClick={() => handleDateClick(day)}
                >
                  <div className="text-sm font-medium mb-1">
                    {format(day, 'd')}
                  </div>

                  <div className="space-y-xs">
                    {dayEvents.slice(0, 3).map(event => renderEvent(event))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  // Render week view
  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: firstDayOfWeek });
    const weekDays = eachDayOfInterval({ start: weekStart, end: endOfWeek(currentDate, { weekStartsOn: firstDayOfWeek }) });

    return (
      <div className="space-y-md">
        {/* Time slots would go here - simplified for brevity */}
        <div className="grid grid-cols-8 gap-xs">
          {/* Time column */}
          <div className="space-y-xs">
            {Array.from({ length: 24 }, (_, i) => (
              <div key={i} className="h-icon-2xl text-xs text-muted-foreground text-right pr-2">
                {format(new Date().setHours(i, 0, 0, 0), timeFormat === '12h' ? 'ha' : 'HH:mm')}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map(day => (
            <div key={day.toISOString()} className="border-l space-y-xs">
              <div className="h-icon-2xl text-center text-sm font-medium border-b pb-2">
                {format(day, 'EEE d')}
              </div>
              {/* Events would be positioned here based on time */}
              <div className="space-y-xs">
                {events
                  .filter(event => isSameDay(event.start, day))
                  .map(event => renderEvent(event, { height: '40px' }))
                }
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render agenda view
  const renderAgendaView = () => (
    <div className="space-y-xs">
      {viewEvents.map(event => (
        <Card key={event.id} className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-md">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-medium">{event.title}</h3>
                <div className="flex items-center gap-md mt-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-xs">
                    <CalendarIcon className="h-icon-xs w-icon-xs" />
                    {format(event.start, 'PPP')}
                  </div>
                  {!event.allDay && (
                    <div className="flex items-center gap-xs">
                      <Clock className="h-icon-xs w-icon-xs" />
                      {format(event.start, timeFormat === '12h' ? 'h:mm a' : 'HH:mm')}
                      {event.end && ` - ${format(event.end, timeFormat === '12h' ? 'h:mm a' : 'HH:mm')}`}
                    </div>
                  )}
                  {event.location && (
                    <div className="flex items-center gap-xs">
                      <MapPin className="h-icon-xs w-icon-xs" />
                      {event.location}
                    </div>
                  )}
                </div>
                {event.description && (
                  <p className="text-sm mt-2 text-muted-foreground line-clamp-xs">
                    {event.description}
                  </p>
                )}
                {event.attendees && event.attendees.length > 0 && (
                  <div className="flex items-center gap-xs mt-2">
                    <Users className="h-icon-xs w-icon-xs text-muted-foreground" />
                    <div className="flex -space-x-2">
                      {event.attendees.slice(0, 5).map((attendee, idx) => (
                        <Avatar key={idx} className="h-icon-md w-icon-md border border-background">
                          <AvatarImage src={attendee.avatar} />
                          <AvatarFallback className="text-xs">
                            {attendee.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {event.attendees.length > 5 && (
                        <div className="h-icon-md w-icon-md rounded-full bg-muted border border-background flex items-center justify-center text-xs">
                          +{event.attendees.length - 5}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-xs">
                {event.category && (
                  <Badge variant="secondary" className="text-xs">
                    {event.category}
                  </Badge>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-icon-lg w-icon-lg p-0">
                      <MoreHorizontal className="h-icon-xs w-icon-xs" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEventClick?.(event)}>
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>Edit Event</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      Delete Event
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const viewModeLabels = {
    month: 'Month',
    week: 'Week',
    day: 'Day',
    agenda: 'Agenda'
  };

  return (
    <div className={cn('space-y-md', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-md">
          {/* Navigation */}
          <div className="flex items-center gap-xs">
            <Button variant="outline" size="sm" onClick={handlePrevious}>
              <ChevronLeft className="h-icon-xs w-icon-xs" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleToday}>
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={handleNext}>
              <ChevronRight className="h-icon-xs w-icon-xs" />
            </Button>
          </div>

          {/* Current Date/Range */}
          <h2 className="text-lg font-semibold">
            {viewMode === 'month' && format(currentDate, 'MMMM yyyy')}
            {viewMode === 'week' && `Week of ${format(currentDate, 'MMM d, yyyy')}`}
            {viewMode === 'day' && format(currentDate, 'EEEE, MMMM d, yyyy')}
            {viewMode === 'agenda' && 'Upcoming Events'}
          </h2>
        </div>

        <div className="flex items-center gap-xs">
          {/* Search */}
          {onGlobalSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-xs/2 transform -translate-y-1/2 h-icon-xs w-icon-xs text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={globalSearch}
                onChange={(e) => onGlobalSearch(e.target.value)}
                className="pl-9 w-container-sm"
              />
            </div>
          )}

          {/* View Mode Selector */}
          <div className="flex items-center border rounded-md">
            {Object.entries(viewModeLabels).map(([mode, label]) => (
              <Button
                key={mode}
                variant={viewMode === mode ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange?.(mode as CalendarViewMode)}
                className="rounded-none first:rounded-l-md last:rounded-r-md"
              >
                {label}
              </Button>
            ))}
          </div>

          {/* Add Event */}
          {onEventCreate && (
            <Button onClick={() => onEventCreate(new Date())}>
              <Plus className="h-icon-xs w-icon-xs mr-1" />
              Add Event
            </Button>
          )}
        </div>
      </div>

      {/* Calendar Content */}
      <div className="min-h-content-xl">
        {loading ? (
          <div className="flex items-center justify-center h-container-lg">
            <div className="text-muted-foreground">Loading calendar...</div>
          </div>
        ) : (
          <>
            {viewMode === 'month' && renderMonthView()}
            {viewMode === 'week' && renderWeekView()}
            {viewMode === 'day' && <div>Day view - Implementation simplified</div>}
            {viewMode === 'agenda' && renderAgendaView()}
          </>
        )}
      </div>

      {/* Event Details Modal would go here */}
    </div>
  );
};

export type { CalendarEvent, CalendarFieldMapping, CalendarViewProps, CalendarViewMode };
