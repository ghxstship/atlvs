'use client';

import React from 'react';
import { Card } from '@ghxstship/ui';
import { Calendar as CalendarIcon, CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarViewProps {
  data?: unknown[];
  onDateSelect?: (date: Date) => void;
}

export default function CalendarView({
  data = [],
  onDateSelect
}: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    return { daysInMonth, firstDay };
  };

  const { daysInMonth, firstDay } = getDaysInMonth(currentMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  return (
    <Card className="h-full">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <CalendarIcon className="h-5 w-5" />
            {monthName}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-muted rounded-md transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-muted rounded-md transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-7 gap-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
              {day}
            </div>
          ))}
          {blanks.map((blank) => (
            <div key={`blank-${blank}`} className="p-2" />
          ))}
          {days.map((day) => {
            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
            const isToday = date.toDateString() === new Date().toDateString();
            return (
              <button
                key={day}
                onClick={() => onDateSelect?.(date)}
                className={`
                  p-2 text-center rounded-md hover:bg-muted transition-colors
                  ${isToday ? 'bg-primary text-primary-foreground font-semibold' : ''}
                `}
              >
                {day}
              </button>
            );
          })}
        </div>
        {data && Array.isArray(data) && data.length === 0 && (
          <div className="mt-4 text-center text-muted-foreground">
            No events scheduled
          </div>
        )}
      </div>
    </Card>
  );
}
