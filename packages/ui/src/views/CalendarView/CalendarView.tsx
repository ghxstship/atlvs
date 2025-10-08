/**
 * CalendarView Component — Calendar with Events
 * Day/week/month views for time-based data
 * 
 * @package @ghxstship/ui
 * @version 2.0.0
 */

'use client';

import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ViewProps, CalendarEvent } from '../types';

export interface CalendarViewProps extends ViewProps {
  /** Start date field */
  startField: string;
  
  /** End date field */
  endField?: string;
  
  /** Title field */
  titleField: string;
  
  /** Calendar view mode */
  mode?: 'month' | 'week' | 'day';
  
  /** Custom className */
  className?: string;
}

/**
 * CalendarView Component
 */
export function CalendarView({
  data,
  fields,
  state,
  loading = false,
  error = null,
  onRecordClick,
  onCreate,
  startField,
  endField,
  titleField,
  mode = 'month',
  className = '',
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState(mode);
  
  // Calendar calculations
  const { startDate, endDate, days } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = new Date(firstDay);
    startDay.setDate(startDay.getDate() - startDay.getDay());
    const endDay = new Date(lastDay);
    endDay.setDate(endDay.getDate() + (6 - endDay.getDay()));
    
    const days: Date[] = [];
    const current = new Date(startDay);
    while (current <= endDay) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return { startDate: startDay, endDate: endDay, days };
  }, [currentDate]);
  
  // Group events by date
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, typeof data> = {};
    
    data.forEach(record => {
      const startDate = new Date(record[startField]);
      const dateKey = startDate.toISOString().split('T')[0];
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(record);
    });
    
    return grouped;
  }, [data, startField]);
  
  // Navigation
  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };
  
  const handleNext = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };
  
  const handleToday = () => {
    setCurrentDate(new Date());
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-[var(--color-error)] font-medium">Error loading data</p>
          <p className="text-[var(--color-foreground-secondary)] text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <button
            onClick={handleToday}
            className="
              px-3 py-1 rounded
              border border-[var(--color-border)]
              hover:bg-[var(--color-muted)]
              text-sm
              transition-colors
            "
          >
            Today
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevious}
            className="p-2 rounded hover:bg-[var(--color-muted)] transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="p-2 rounded hover:bg-[var(--color-muted)] transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Calendar grid */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-[var(--color-border)]">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div
              key={day}
              className="
                p-2 text-center text-sm font-medium
                text-[var(--color-foreground-secondary)]
              "
            >
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar days */}
        <div className="flex-1 grid grid-cols-7 auto-rows-fr overflow-auto">
          {days.map((day, index) => {
            const dateKey = day.toISOString().split('T')[0];
            const events = eventsByDate[dateKey] || [];
            const isToday =
              day.toDateString() === new Date().toDateString();
            const isCurrentMonth =
              day.getMonth() === currentDate.getMonth();
            
            return (
              <div
                key={index}
                className={`
                  min-h-[100px] p-2
                  border-b border-r border-[var(--color-border)]
                  ${!isCurrentMonth ? 'bg-[var(--color-muted)]/30' : ''}
                  ${isToday ? 'bg-[var(--color-primary)]/5' : ''}
                `}
              >
                <div
                  className={`
                    inline-flex items-center justify-center
                    w-6 h-6 mb-1 rounded-full
                    text-sm
                    ${isToday
                      ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)] font-medium'
                      : isCurrentMonth
                      ? 'text-[var(--color-foreground)]'
                      : 'text-[var(--color-foreground-muted)]'
                    }
                  `}
                >
                  {day.getDate()}
                </div>
                
                {/* Events */}
                <div className="space-y-1">
                  {events.slice(0, 3).map(event => (
                    <div
                      key={event.id}
                      onClick={() => onRecordClick?.(event)}
                      className="
                        px-2 py-1 rounded
                        bg-[var(--color-primary)]/10
                        hover:bg-[var(--color-primary)]/20
                        text-xs truncate
                        cursor-pointer
                        transition-colors
                      "
                    >
                      {event[titleField]}
                    </div>
                  ))}
                  {events.length > 3 && (
                    <div className="px-2 text-xs text-[var(--color-foreground-secondary)]">
                      +{events.length - 3} more
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

CalendarView.displayName = 'CalendarView';
