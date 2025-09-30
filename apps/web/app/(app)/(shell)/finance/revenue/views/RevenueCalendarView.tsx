'use client';

import React, { useState } from 'react';
import { Card, Badge, Button } from '@ghxstship/ui';
import { ChevronLeft, ChevronRight, Calendar, DollarSign } from 'lucide-react';
import type { DataRecord } from '@ghxstship/ui';

interface RevenueCalendarViewProps {
  data: DataRecord[];
  isLoading?: boolean;
  onRecordClick?: (record: DataRecord) => void;
}

export default function RevenueCalendarView({ data, isLoading, onRecordClick }: RevenueCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const getRecordsForDate = (date: Date) => {
    return data.filter(record => {
      if (!record.recognition_date) return false;
      const recordDate = new Date(record.recognition_date);
      return recordDate.toDateString() === date.toDateString();
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);

  if (isLoading) {
    return (
      <Card className="p-lg">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-lg"></div>
          <div className="grid grid-cols-7 gap-sm">
            {[...Array(35)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-lg">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-lg">
        <h2 className="text-xl font-semibold">
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex items-center gap-sm">
          <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-sm mb-sm">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-sm text-center font-medium text-gray-600 text-sm">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-sm">
        {/* Empty cells for days before the first day of the month */}
        {[...Array(startingDayOfWeek)].map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square"></div>
        ))}

        {/* Days of the month */}
        {[...Array(daysInMonth)].map((_, dayIndex) => {
          const day = dayIndex + 1;
          const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
          const dayRecords = getRecordsForDate(date);
          const isToday = date.toDateString() === new Date().toDateString();

          return (
            <div
              key={day}
              className={`aspect-square p-xs border rounded-lg ${
                isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              } hover:shadow-sm transition-shadow`}
            >
              <div className="text-sm font-medium mb-xs">{day}</div>
              <div className="space-y-xs">
                {dayRecords.slice(0, 2).map((record) => (
                  <div
                    key={record.id}
                    className="bg-green-100 text-green-800 text-xs p-xs rounded truncate cursor-pointer hover:bg-green-200 transition-colors"
                    onClick={() => onRecordClick?.(record)}
                    title={`${record.source} - $${record.amount?.toLocaleString() || '0'}`}
                  >
                    {record.source}
                  </div>
                ))}
                {dayRecords.length > 2 && (
                  <div className="text-xs text-gray-500">
                    +{dayRecords.length - 2} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue Summary */}
      <div className="mt-lg pt-lg border-t">
        <h3 className="font-semibold mb-md">Monthly Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {data.filter(r => r.status === 'projected').length}
            </div>
            <div className="text-sm text-gray-600">Projected</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {data.filter(r => r.status === 'invoiced').length}
            </div>
            <div className="text-sm text-gray-600">Invoiced</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {data.filter(r => r.status === 'received').length}
            </div>
            <div className="text-sm text-gray-600">Received</div>
          </div>
        </div>
      </div>
    </Card>
  );
}
