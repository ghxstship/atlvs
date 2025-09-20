'use client';

import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '../atomic/Button';
import { useDataView } from './DataViewProvider';

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end?: Date;
  allDay?: boolean;
  color?: string;
  category?: string;
  record: any;
}

export interface CalendarViewProps {
  titleField: string;
  startDateField: string;
  endDateField?: string;
  colorField?: string;
  categoryField?: string;
  allDayField?: string;
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
  onEventMove?: (event: CalendarEvent, newStart: Date, newEnd?: Date) => void;
}

type ViewMode = 'month' | 'week' | 'day';

export function CalendarView({
  titleField,
  startDateField,
  endDateField,
  colorField,
  categoryField,
  allDayField,
  onEventClick,
  onDateClick,
  onEventMove
}: CalendarViewProps) {
  const { state, config, actions } = useDataView();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');

  // Convert data records to calendar events
  const events = useMemo(() => {
    return (config.data || []).map(record => ({
      id: record.id,
      title: record[titleField] || 'Untitled',
      start: new Date(record[startDateField]),
      end: endDateField ? new Date(record[endDateField]) : undefined,
      allDay: allDayField ? Boolean(record[allDayField]) : false,
      color: colorField ? record[colorField] : '#3B82F6',
      category: categoryField ? record[categoryField] : undefined,
      record
    }));
  }, [config.data, startDateField, endDateField, titleField, colorField, categoryField, allDayField]);

  // Navigation functions
  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    
    switch (viewMode) {
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
    }
    
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get calendar grid for current view
  const getCalendarGrid = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    if (viewMode === 'month') {
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const startDate = new Date(firstDay);
      startDate.setDate(startDate.getDate() - firstDay.getDay());
      
      const days = [];
      const current = new Date(startDate);
      
      for (let i = 0; i < 42; i++) {
        days.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
      
      return days;
    }
    
    return [];
  };

  const calendarDays = getCalendarGrid();

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long'
    }).format(date);
  };

  return (
    <div className="calendar-view h-full flex flex-col">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-md border-b">
        <div className="flex items-center gap-md">
          <h2 className="text-lg font-semibold">{formatDate(currentDate)}</h2>
          <div className="flex items-center gap-xs">
            <Button
              variant="outline"
              
              onClick={() => navigateDate('prev')}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              
              onClick={() => navigateDate('next')}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              
              onClick={goToToday}
            >
              Today
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-sm">
          {(['month', 'week', 'day'] as ViewMode[]).map(mode => (
            <Button
              key={mode}
              variant={viewMode === mode ? 'primary' : 'outline'}
              
              onClick={() => setViewMode(mode)}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 p-md">
        {viewMode === 'month' && (
          <div className="grid grid-cols-7 gap-xs h-full">
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-sm text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {calendarDays.map((date, index) => {
              const dayEvents = getEventsForDate(date);
              const isCurrentMonth = date.getMonth() === currentDate.getMonth();
              const isToday = date.toDateString() === new Date().toDateString();
              
              return (
                <div
                  key={index}
                  className={`
                    p-xs min-h-[100px] border border-border cursor-pointer
                    ${!isCurrentMonth ? 'bg-muted text-muted-foreground' : 'bg-background'}
                    ${isToday ? 'bg-accent/10 border-primary' : ''}
                    hover:bg-muted/50
                  `}
                  onClick={() => onDateClick?.(date)}
                >
                  <div className="text-sm font-medium mb-xs">
                    {date.getDate()}
                  </div>
                  
                  {/* Events */}
                  <div className="space-y-xs">
                    {dayEvents.slice(0, 3).map(event => (
                      <div
                        key={event.id}
                        className="text-xs p-xs rounded truncate cursor-pointer"
                        style={{ backgroundColor: event.color + '20', color: event.color }}
                        onClick={(e: any) => {
                          e.stopPropagation();
                          onEventClick?.(event);
                        }}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Week and Day views would go here */}
        {viewMode !== 'month' && (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)} view coming soon
          </div>
        )}
      </div>
    </div>
  );
}
