/**
 * PEOPLE MODULE - CALENDAR VIEW COMPONENT
 * Date-based scheduling and events visualization for People data
 * Multi-calendar support with time zones and recurring events
 */

"use client";

import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  person: unknown;
  type: 'start_date' | 'anniversary' | 'review' | 'training' | 'meeting';
  color?: string;
}

export interface CalendarViewProps {
  data: unknown[];
  events?: CalendarEvent[];
  currentDate?: Date;
  onDateChange?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  onPersonClick?: (person: unknown) => void;
  view?: 'month' | 'week' | 'day';
  className?: string;
}

const PeopleCalendarView: React.FC<CalendarViewProps> = ({
  data,
  events: externalEvents,
  currentDate = new Date(),
  onDateChange,
  onEventClick,
  onPersonClick,
  view = 'month',
  className
}) => {
  const [selectedDate, setSelectedDate] = useState(currentDate);
  const [currentView, setCurrentView] = useState(view);

  // Generate events from people data
  const generatedEvents = useMemo(() => {
    const events: CalendarEvent[] = [];

    data.forEach(person => {
      // Start date event
      if (person.start_date) {
        events.push({
          id: `start-${person.id}`,
          title: `${person.first_name} ${person.last_name} started`,
          date: person.start_date,
          person,
          type: 'start_date',
          color: 'bg-green-500'
        });

        // Work anniversary (yearly recurring)
        const startDate = new Date(person.start_date);
        const currentYear = selectedDate.getFullYear();
        const anniversaryDate = new Date(currentYear, startDate.getMonth(), startDate.getDate());

        if (anniversaryDate >= new Date(currentYear, 0, 1) &&
            anniversaryDate <= new Date(currentYear, 11, 31)) {
          events.push({
            id: `anniversary-${person.id}-${currentYear}`,
            title: `${person.first_name} ${person.last_name} work anniversary`,
            date: anniversaryDate.toISOString().split('T')[0],
            person,
            type: 'anniversary',
            color: 'bg-purple-500'
          });
        }
      }
    });

    return events;
  }, [data, selectedDate]);

  const allEvents = useMemo(() => {
    return [...generatedEvents, ...(externalEvents || [])];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generatedEvents, externalEvents]);

  // Group events by date
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, CalendarEvent[]> = {};

    allEvents.forEach(event => {
      const dateKey = event.date;
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });

    return grouped;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allEvents]);

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);

    if (currentView === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    } else if (currentView === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    }

    setSelectedDate(newDate);
    onDateChange?.(newDate);
  };

  const goToToday = () => {
    const today = new Date();
    setSelectedDate(today);
    onDateChange?.(today);
  };

  const renderMonthView = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const weeks = [];
    let currentWeek = [];
    let currentDate = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayEvents = eventsByDate[dateStr] || [];
      const isCurrentMonth = currentDate.getMonth() === month;
      const isToday = dateStr === new Date().toISOString().split('T')[0];

      currentWeek.push({
        date: new Date(currentDate),
        dateStr,
        events: dayEvents,
        isCurrentMonth,
        isToday
      });

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-md border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex items-center space-x-xs">
            <button
              onClick={() => navigateDate('prev')}
              className="p-xs hover:bg-gray-100 rounded"
            >
              <ChevronLeft className="h-icon-sm w-icon-sm" />
            </button>
            <button
              onClick={goToToday}
              className="px-sm py-xs text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Today
            </button>
            <button
              onClick={() => navigateDate('next')}
              className="p-xs hover:bg-gray-100 rounded"
            >
              <ChevronRight className="h-icon-sm w-icon-sm" />
            </button>
          </div>
        </div>

        {/* Calendar grid */}
        <div className="p-md">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-xs mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-xs text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-xs">
            {weeks.map((week, weekIndex) =>
              week.map((day, dayIndex) => (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  className={cn(
                    "min-h-header-md p-xs border border-gray-200 rounded cursor-pointer hover:bg-gray-50",
                    !day.isCurrentMonth && "bg-gray-50 text-gray-400",
                    day.isToday && "bg-blue-50 border-blue-300"
                  )}
                  onClick={() => onDateChange?.(day.date)}
                >
                  <div className="text-sm font-medium mb-1">
                    {day.date.getDate()}
                  </div>

                  {/* Events */}
                  <div className="space-y-xs">
                    {day.events.slice(0, 3).map(event => (
                      <div
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick?.(event);
                        }}
                        className={cn(
                          "text-xs p-xs rounded truncate cursor-pointer hover:opacity-80",
                          event.color || "bg-blue-500",
                          "text-white"
                        )}
                        title={event.title}
                      >
                        {event.title}
                      </div>
                    ))}
                    {day.events.length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{day.events.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    // Simplified week view - could be expanded
    return (
      <div className="text-center py-xsxl text-gray-500">
        Week view coming soon
      </div>
    );
  };

  const renderDayView = () => {
    // Simplified day view - could be expanded
    return (
      <div className="text-center py-xsxl text-gray-500">
        Day view coming soon
      </div>
    );
  };

  return (
    <div className={cn("w-full", className)}>
      {/* View switcher */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-xs">
          <button
            onClick={() => setCurrentView('month')}
            className={cn(
              "px-sm py-xs text-sm rounded",
              currentView === 'month'
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            )}
          >
            Month
          </button>
          <button
            onClick={() => setCurrentView('week')}
            className={cn(
              "px-sm py-xs text-sm rounded",
              currentView === 'week'
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            )}
          >
            Week
          </button>
          <button
            onClick={() => setCurrentView('day')}
            className={cn(
              "px-sm py-xs text-sm rounded",
              currentView === 'day'
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            )}
          >
            Day
          </button>
        </div>

        <div className="text-sm text-gray-500">
          {allEvents.length} events
        </div>
      </div>

      {/* Calendar content */}
      {currentView === 'month' && renderMonthView()}
      {currentView === 'week' && renderWeekView()}
      {currentView === 'day' && renderDayView()}

      {/* Upcoming events sidebar */}
      <div className="mt-6 bg-white rounded-lg shadow p-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Upcoming Events</h3>
        <div className="space-y-sm">
          {allEvents
            .filter(event => new Date(event.date) >= new Date())
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 5)
            .map(event => (
              <div
                key={event.id}
                onClick={() => onEventClick?.(event)}
                className="flex items-start space-x-sm p-xs hover:bg-gray-50 rounded cursor-pointer"
              >
                <div className={cn("w-3 h-3 rounded-full mt-2", event.color || "bg-blue-500")}></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{event.title}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(event.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default PeopleCalendarView;
