'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useDataView } from './DataViewProvider';
import { Button } from '../Button';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Plus,
  MoreHorizontal
} from 'lucide-react';
import { CalendarEvent, DataRecord } from './types';

interface CalendarViewProps {
  className?: string;
  startDateField: string;
  endDateField?: string;
  titleField: string;
  colorField?: string;
  categoryField?: string;
  allDayField?: string;
  onEventClick?: (event: DataRecord) => void;
  onDateClick?: (date: Date) => void;
  onEventMove?: (eventId: string, newStart: Date, newEnd?: Date) => void;
}

type ViewMode = 'month' | 'week' | 'day';

export function CalendarView({
  className = '',
  startDateField,
  endDateField,
  titleField,
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
    return config.data.map(record => ({
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

  // Get calendar grid for current view
  const calendarGrid = useMemo(() => {
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
    } else if (viewMode === 'week') {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      
      const days = [];
      const current = new Date(startOfWeek);
      
      for (let i = 0; i < 7; i++) {
        days.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
      
      return days;
    } else {
      return [new Date(currentDate)];
    }
  }, [currentDate, viewMode]);

  // Get events for a specific date
  const getEventsForDate = useCallback((date: Date) => {
    return events.filter(event => {
      const eventStart = new Date(event.start);
      const eventEnd = event.end ? new Date(event.end) : new Date(event.start);
      
      const dateStart = new Date(date);
      dateStart.setHours(0, 0, 0, 0);
      const dateEnd = new Date(date);
      dateEnd.setHours(23, 59, 59, 999);
      
      return (eventStart <= dateEnd && eventEnd >= dateStart);
    });
  }, [events]);

  const navigateDate = useCallback((direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    }
    
    setCurrentDate(newDate);
  }, [currentDate, viewMode]);

  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const formatDateHeader = useCallback(() => {
    const options: Intl.DateTimeFormatOptions = {};
    
    if (viewMode === 'month') {
      options.year = 'numeric';
      options.month = 'long';
    } else if (viewMode === 'week') {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      return `${startOfWeek.toLocaleDateString()} - ${endOfWeek.toLocaleDateString()}`;
    } else {
      options.year = 'numeric';
      options.month = 'long';
      options.day = 'numeric';
    }
    
    return currentDate.toLocaleDateString(undefined, options);
  }, [currentDate, viewMode]);

  const isToday = useCallback((date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }, []);

  const isCurrentMonth = useCallback((date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  }, [currentDate]);

  const calendarClasses = `
    bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden
    ${className}
  `.trim();

  return (
    <div className={calendarClasses}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateDate('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 min-w-[200px] text-center">
              {formatDateHeader()}
            </h2>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateDate('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={goToToday}
          >
            Today
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {(['month', 'week', 'day'] as ViewMode[]).map((mode) => (
              <Button
                key={mode}
                variant={viewMode === mode ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode(mode)}
                className="capitalize"
              >
                {mode}
              </Button>
            ))}
          </div>
          
          <Button
            variant="primary"
            size="sm"
            onClick={() => onDateClick?.(currentDate)}
          >
            <Plus className="h-4 w-4 mr-1" />
            New Event
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {viewMode === 'month' && (
          <>
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-px mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div
                  key={day}
                  className="p-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400"
                >
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
              {calendarGrid.map((date, index) => {
                const dayEvents = getEventsForDate(date);
                const isCurrentMonthDay = isCurrentMonth(date);
                const isTodayDate = isToday(date);
                
                return (
                  <div
                    key={index}
                    className={`
                      bg-white dark:bg-gray-900 p-2 min-h-[120px] cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800
                      ${!isCurrentMonthDay ? 'opacity-40' : ''}
                    `}
                    onClick={() => onDateClick?.(date)}
                  >
                    <div className={`
                      text-sm font-medium mb-1
                      ${isTodayDate 
                        ? 'bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center' 
                        : 'text-gray-900 dark:text-gray-100'
                      }
                    `}>
                      {date.getDate()}
                    </div>
                    
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map((event) => (
                        <div
                          key={event.id}
                          className="text-xs p-1 rounded truncate cursor-pointer hover:opacity-80"
                          style={{ backgroundColor: event.color + '20', color: event.color }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventClick?.(event.record);
                          }}
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {viewMode === 'week' && (
          <div className="space-y-4">
            {/* Week Header */}
            <div className="grid grid-cols-8 gap-px">
              <div className="p-2"></div>
              {calendarGrid.map((date, index) => (
                <div
                  key={index}
                  className="p-2 text-center border-b border-gray-200 dark:border-gray-700"
                >
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {date.toLocaleDateString(undefined, { weekday: 'short' })}
                  </div>
                  <div className={`
                    text-lg font-semibold
                    ${isToday(date) 
                      ? 'bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto' 
                      : 'text-gray-900 dark:text-gray-100'
                    }
                  `}>
                    {date.getDate()}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Time Slots */}
            <div className="grid grid-cols-8 gap-px">
              <div className="space-y-12">
                {Array.from({ length: 24 }, (_, hour) => (
                  <div key={hour} className="text-xs text-gray-500 dark:text-gray-400 text-right pr-2">
                    {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                  </div>
                ))}
              </div>
              
              {calendarGrid.map((date, dayIndex) => {
                const dayEvents = getEventsForDate(date);
                
                return (
                  <div
                    key={dayIndex}
                    className="relative border-l border-gray-200 dark:border-gray-700 min-h-[600px]"
                    onClick={() => onDateClick?.(date)}
                  >
                    {/* Hour Lines */}
                    {Array.from({ length: 24 }, (_, hour) => (
                      <div
                        key={hour}
                        className="absolute w-full border-t border-gray-100 dark:border-gray-800"
                        style={{ top: `${hour * 25}px` }}
                      />
                    ))}
                    
                    {/* Events */}
                    {dayEvents.map((event) => {
                      const startHour = event.start.getHours() + event.start.getMinutes() / 60;
                      const duration = event.end 
                        ? (event.end.getTime() - event.start.getTime()) / (1000 * 60 * 60)
                        : 1;
                      
                      return (
                        <div
                          key={event.id}
                          className="absolute left-1 right-1 p-1 rounded text-xs cursor-pointer hover:opacity-80"
                          style={{
                            top: `${startHour * 25}px`,
                            height: `${Math.max(duration * 25, 20)}px`,
                            backgroundColor: event.color + '20',
                            borderLeft: `3px solid ${event.color}`,
                            color: event.color
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventClick?.(event.record);
                          }}
                        >
                          <div className="font-medium truncate">{event.title}</div>
                          <div className="text-xs opacity-75">
                            {event.start.toLocaleTimeString(undefined, { 
                              hour: 'numeric', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {viewMode === 'day' && (
          <div className="space-y-4">
            {/* Day Header */}
            <div className="text-center p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {currentDate.toLocaleDateString(undefined, { weekday: 'long' })}
              </div>
              <div className={`
                text-2xl font-bold
                ${isToday(currentDate) ? 'text-blue-600' : 'text-gray-900 dark:text-gray-100'}
              `}>
                {currentDate.getDate()}
              </div>
            </div>
            
            {/* Day Events */}
            <div className="space-y-2">
              {getEventsForDate(currentDate).map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => onEventClick?.(event.record)}
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: event.color }}
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {event.title}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {event.start.toLocaleTimeString(undefined, { 
                        hour: 'numeric', 
                        minute: '2-digit' 
                      })}
                      {event.end && (
                        <> - {event.end.toLocaleTimeString(undefined, { 
                          hour: 'numeric', 
                          minute: '2-digit' 
                        })}</>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              {getEventsForDate(currentDate).length === 0 && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <div className="text-lg font-medium mb-2">No events today</div>
                  <Button
                    variant="primary"
                    onClick={() => onDateClick?.(currentDate)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Create Event
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
