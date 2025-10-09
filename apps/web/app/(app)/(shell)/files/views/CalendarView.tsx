"use client";

import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Eye, Edit, Download, Trash2, Share, Plus, CalendarIcon } from 'lucide-react';
import {
  Badge,
  Button,
  CalendarView,
  Card,
  DropdownMenu
} from "@ghxstship/ui";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths
} from 'date-fns';
import type { DigitalAsset } from '../types';

interface CalendarViewProps {
  files: DigitalAsset[];
  onView: (file: DigitalAsset) => void;
  onEdit: (file: DigitalAsset) => void;
  onDownload: (file: DigitalAsset) => void;
  onDelete: (file: DigitalAsset) => void;
  onShare: (file: DigitalAsset) => void;
  onDateSelect: (date: Date) => void;
  selectedDate?: Date;
  formatFileSize: (bytes: number) => string;
  getCategoryIcon: (category: string) => React.ComponentType<any>;
}

export default function CalendarView({
  files,
  onView,
  onEdit,
  onDownload,
  onDelete,
  onShare,
  onDateSelect,
  selectedDate = new Date(),
  formatFileSize,
  getCategoryIcon
}: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');

  // Group files by date
  const filesByDate = useMemo(() => {
    const grouped: Record<string, DigitalAsset[]> = {};

    files.forEach(file => {
      // Use updated_at as the primary date, but could also consider created_at or custom date fields
      const dateKey = format(new Date(file.updated_at), 'yyyy-MM-dd');

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(file);
    });

    return grouped;
  }, [files]);

  // Get files for a specific date
  const getFilesForDate = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return filesByDate[dateKey] || [];
  };

  // Navigate months
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev =>
      direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1)
    );
  };

  // Generate calendar days for month view
  const generateMonthCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    const days = [];
    let day = calendarStart;

    while (day <= calendarEnd) {
      const dayFiles = getFilesForDate(day);
      const isCurrentMonth = isSameMonth(day, currentMonth);
      const isToday = isSameDay(day, new Date());
      const isSelected = selectedDate && isSameDay(day, selectedDate);

      days.push({
        date: day,
        files: dayFiles,
        isCurrentMonth,
        isToday,
        isSelected
      });

      day = addDays(day, 1);
    }

    return days;
  };

  const calendarDays = generateMonthCalendar();

  // Get category colors for calendar events
  const getCategoryColor = (category: string) => {
    const colors = {
      document: 'bg-blue-500',
      image: 'bg-green-500',
      video: 'bg-purple-500',
      audio: 'bg-yellow-500',
      drawing: 'bg-indigo-500',
      specification: 'bg-pink-500',
      report: 'bg-orange-500',
      template: 'bg-cyan-500',
      policy: 'bg-red-500',
      other: 'bg-gray-500'
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-md border-b border-gray-200">
        <div className="flex items-center gap-md">
          <h2 className="text-lg font-semibold text-gray-900">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>

          <div className="flex items-center gap-xs">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
            >
              <ChevronLeft className="w-icon-xs h-icon-xs" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(new Date())}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
            >
              <ChevronRight className="w-icon-xs h-icon-xs" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-xs">
          <div className="flex items-center gap-xs border border-gray-300 rounded-md">
            {(['month', 'week', 'day'] as const).map((mode) => (
              <Button
                key={mode}
                variant={viewMode === mode ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode(mode)}
                className="capitalize"
              >
                {mode}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-md">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-xs mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="p-xs text-center text-sm font-medium text-gray-500"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-xs">
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={`min-h-header-lg p-xs border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                !day.isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
              } ${day.isToday ? 'bg-blue-50 border-blue-300' : ''} ${
                day.isSelected ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => onDateSelect(day.date)}
            >
              {/* Day Number */}
              <div className={`text-sm font-medium mb-2 ${
                day.isToday ? 'text-blue-600' : day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
              }`}>
                {format(day.date, 'd')}
              </div>

              {/* Files for this day */}
              <div className="space-y-xs">
                {day.files.slice(0, 3).map((file) => {
                  const CategoryIcon = getCategoryIcon(file.category);

                  return (
                    <div
                      key={file.id}
                      className={`text-xs p-xs rounded flex items-center gap-xs ${getCategoryColor(file.category)} text-white cursor-pointer hover:opacity-80 transition-opacity`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onView(file);
                      }}
                      title={file.title}
                    >
                      <CategoryIcon className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate flex-1">{file.title}</span>
                    </div>
                  );
                })}

                {day.files.length > 3 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{day.files.length - 3} more
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Date Details */}
      {selectedDate && (
        <div className="border-t border-gray-200 p-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </h3>
            <Button
              size="sm"
              onClick={() => onDateSelect(selectedDate)}
            >
              <Plus className="w-icon-xs h-icon-xs mr-2" />
              Add File
            </Button>
          </div>

          <div className="space-y-sm">
            {getFilesForDate(selectedDate).length === 0 ? (
              <div className="text-center py-xl text-gray-500">
                <CalendarIcon className="w-icon-2xl h-icon-2xl mx-auto mb-4 opacity-50" />
                <p>No files for this date</p>
              </div>
            ) : (
              getFilesForDate(selectedDate).map((file) => {
                const CategoryIcon = getCategoryIcon(file.category);

                return (
                  <Card key={file.id} className="p-md hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-sm flex-1">
                        <div className="w-icon-xl h-icon-xl rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <CategoryIcon className="w-icon-sm h-icon-sm text-gray-600" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">
                            {file.title}
                          </h4>
                          {file.description && (
                            <p className="text-sm text-gray-600 truncate mt-1">
                              {file.description}
                            </p>
                          )}

                          <div className="flex items-center gap-md mt-2 text-xs text-gray-500">
                            <span>{formatFileSize(file.file_size || 0)}</span>
                            <span>•</span>
                            <div className="flex items-center gap-xs">
                              <Clock className="w-3 h-3" />
                              <span>{format(new Date(file.updated_at), 'h:mm a')}</span>
                            </div>
                          </div>

                          {file.tags && file.tags.length > 0 && (
                            <div className="flex flex-wrap gap-xs mt-2">
                              {file.tags.map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenu.Trigger asChild>
                          <Button variant="ghost" size="sm">
                            <ChevronRight className="w-icon-xs h-icon-xs" />
                          </Button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Content align="end">
                          <DropdownMenu.Item onClick={() => onView(file)}>
                            <Eye className="w-icon-xs h-icon-xs mr-2" />
                            View
                          </DropdownMenu.Item>
                          <DropdownMenu.Item onClick={() => onEdit(file)}>
                            <Edit className="w-icon-xs h-icon-xs mr-2" />
                            Edit
                          </DropdownMenu.Item>
                          <DropdownMenu.Item onClick={() => onDownload(file)}>
                            <Download className="w-icon-xs h-icon-xs mr-2" />
                            Download
                          </DropdownMenu.Item>
                          <DropdownMenu.Item onClick={() => onShare(file)}>
                            <Share className="w-icon-xs h-icon-xs mr-2" />
                            Share
                          </DropdownMenu.Item>
                          <DropdownMenu.Separator />
                          <DropdownMenu.Item
                            onClick={() => onDelete(file)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-icon-xs h-icon-xs mr-2" />
                            Delete
                          </DropdownMenu.Item>
                        </DropdownMenu.Content>
                      </DropdownMenu>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
