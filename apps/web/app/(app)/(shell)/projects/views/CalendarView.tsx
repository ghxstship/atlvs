"use client";

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@ghxstship/ui';
import { Badge } from '@ghxstship/ui';
import { Card, CardContent } from '@ghxstship/ui';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';

export interface CalendarViewProps {
  data: unknown[];
  dateField?: string;
  onEventClick?: (item: unknown) => void;
  onDateClick?: (date: Date) => void;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

export default function CalendarView({
  data,
  dateField = 'due_date',
  onEventClick,
  onDateClick,
  loading = false,
  emptyMessage = "No events scheduled",
  className = "",
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return data.filter(item => {
      const itemDate = item[dateField];
      return itemDate && isSameDay(new Date(itemDate), date);
    });
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    const days = [];
    let day = calendarStart;

    while (day <= calendarEnd) {
      days.push(day);
      day = addDays(day, 1);
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev =>
      direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1)
    );
  };

  if (loading) {
    return (
      <div className={`bg-card border rounded-lg p-lg ${className}`}>
        <div className="animate-pulse space-y-md">
          <div className="h-icon-lg bg-muted rounded w-container-xs"></div>
          <div className="grid grid-cols-7 gap-xs">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="h-component-lg bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-card border rounded-lg overflow-hidden ${className}`}>
      {/* Calendar Header */}
      <div className="p-md border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <div className="flex items-center gap-xs">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
            >
              <ChevronLeft className="h-icon-xs w-icon-xs" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date())}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
            >
              <ChevronRight className="h-icon-xs w-icon-xs" />
            </Button>
          </div>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-xs mt-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground py-xs">
              {day}
            </div>
          ))}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-md">
        <div className="grid grid-cols-7 gap-xs">
          {calendarDays.map((day, index) => {
            const dayEvents = getEventsForDate(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={index}
                className={`min-h-header-lg border rounded-lg p-xs cursor-pointer hover:bg-muted/50 transition-colors ${
                  !isCurrentMonth ? 'bg-muted/20 text-muted-foreground' : ''
                } ${isToday ? 'bg-primary/10 border-primary' : ''}`}
                onClick={() => onDateClick?.(day)}
              >
                <div className={`text-sm font-medium mb-1 ${isToday ? 'text-primary' : ''}`}>
                  {format(day, 'd')}
                </div>

                <div className="space-y-xs">
                  {dayEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      className="text-xs p-xs bg-primary/10 rounded cursor-pointer hover:bg-primary/20 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick?.(event);
                      }}
                    >
                      <div className="font-medium truncate">
                        {event.name || event.title}
                      </div>
                      <Badge variant="outline" className="text-xs mt-1">
                        {event.status}
                      </Badge>
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
      </div>
    </div>
  );
}
