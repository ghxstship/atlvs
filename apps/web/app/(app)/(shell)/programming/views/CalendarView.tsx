'use client';

import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@ghxstship/ui';
import { Card, CardContent } from '@ghxstship/ui';
import { Badge } from '@ghxstship/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@ghxstship/ui';
import type { ProgrammingEntity } from '../types';

interface CalendarViewProps<T extends ProgrammingEntity> {
  data: T[];
  loading?: boolean;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onView?: (item: T) => void;
  onCreate?: (date: Date) => void;
  onDateChange?: (date: Date) => void;
  initialDate?: Date;
  renderEvent?: (item: T) => React.ReactNode;
  emptyMessage?: string;
  className?: string;
}

export function CalendarView<T extends ProgrammingEntity>({
  data,
  loading = false,
  onEdit,
  onDelete,
  onView,
  onCreate,
  onDateChange,
  initialDate = new Date(),
  renderEvent,
  emptyMessage = 'No events scheduled',
  className,
}: CalendarViewProps<T>) {
  const [currentDate, setCurrentDate] = useState(initialDate);

  const handleDateChange = (date: Date) => {
    setCurrentDate(date);
    onDateChange?.(date);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    handleDateChange(newDate);
  };

  const goToToday = () => {
    handleDateChange(new Date());
  };

  // Get calendar data
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Get first day of month and last day of month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Get the day of week for first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = firstDay.getDay();

    // Calculate days to show from previous month
    const daysFromPrevMonth = firstDayOfWeek;

    // Calculate total days to show
    const totalDays = 42; // 6 weeks * 7 days

    const calendarDays = [];

    // Add days from previous month
    const prevMonth = new Date(year, month - 1);
    const lastDayPrevMonth = new Date(year, month, 0).getDate();

    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      calendarDays.push({
        date: new Date(year, month - 1, lastDayPrevMonth - i),
        isCurrentMonth: false,
        events: [],
      });
    }

    // Add days from current month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      const dayEvents = data.filter(item => {
        if ('start_date' in item && 'end_date' in item) {
          // Event spans multiple days
          const startDate = new Date((item as any).start_date);
          const endDate = new Date((item as any).end_date);
          return date >= startDate && date <= endDate;
        } else if ('date' in item) {
          // Single day event (performance)
          const eventDate = new Date((item as any).date);
          return date.toDateString() === eventDate.toDateString();
        }
        return false;
      });

      calendarDays.push({
        date,
        isCurrentMonth: true,
        events: dayEvents,
      });
    }

    // Add days from next month to fill the grid
    const remainingDays = totalDays - calendarDays.length;
    for (let day = 1; day <= remainingDays; day++) {
      calendarDays.push({
        date: new Date(year, month + 1, day),
        isCurrentMonth: false,
        events: [],
      });
    }

    return calendarDays;
  }, [currentDate, data]);

  // Group events by date for better performance
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, T[]> = {};

    data.forEach(item => {
      let eventDate: Date;

      if ('start_date' in item) {
        // For events that span multiple days, use start date
        eventDate = new Date((item as any).start_date);
      } else if ('date' in item) {
        // For single-day events
        eventDate = new Date((item as any).date);
      } else {
        return; // Skip items without dates
      }

      const dateKey = eventDate.toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(item);
    });

    return grouped;
  }, [data]);

  // Default event renderer
  const defaultRenderEvent = (item: T) => {
    const isEvent = 'start_date' in item && 'end_date' in item;
    const isPerformance = 'date' in item && 'venue' in item;
    const isWorkshop = 'instructor' in item;

    return (
      <div className="text-xs p-1 bg-blue-100 text-blue-800 rounded truncate">
        {item.title || 'Untitled'}
        {isPerformance && (item as any).venue && (
          <span className="ml-1 opacity-75">• {(item as any).venue}</span>
        )}
        {isWorkshop && (item as any).instructor && (
          <span className="ml-1 opacity-75">• {(item as any).instructor}</span>
        )}
      </div>
    );
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 animate-pulse rounded w-48" />
          <div className="flex gap-2">
            <div className="h-8 w-8 bg-gray-200 animate-pulse rounded" />
            <div className="h-8 w-8 bg-gray-200 animate-pulse rounded" />
            <div className="h-8 w-8 bg-gray-200 animate-pulse rounded" />
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="aspect-square bg-gray-100 animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white border rounded-lg overflow-hidden">
        {/* Week day headers */}
        <div className="grid grid-cols-7 bg-gray-50 border-b">
          {weekDays.map((day) => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-700">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7">
          {calendarData.map((day, index) => {
            const dayEvents = eventsByDate[day.date.toDateString()] || [];
            const isToday = day.date.toDateString() === new Date().toDateString();

            return (
              <div
                key={index}
                className={`min-h-[120px] border-r border-b p-2 ${
                  day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                } ${isToday ? 'bg-blue-50' : ''}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-sm font-medium ${
                      day.isCurrentMonth
                        ? isToday
                          ? 'text-blue-600'
                          : 'text-gray-900'
                        : 'text-gray-400'
                    }`}
                  >
                    {day.date.getDate()}
                  </span>
                  {day.isCurrentMonth && onCreate && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onCreate(day.date)}
                      className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 hover:bg-blue-100"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  )}
                </div>

                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((event) => (
                    <div key={event.id} className="cursor-pointer">
                      {renderEvent ? renderEvent(event) : defaultRenderEvent(event)}
                    </div>
                  ))}

                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Event details sidebar or modal could go here */}
      {data.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          {emptyMessage}
        </div>
      )}
    </div>
  );
}

export default CalendarView;
