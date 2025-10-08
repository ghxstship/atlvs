"use client";

import React, { useState, useMemo, useRef } from 'react';
import {
  Calendar,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  MoreHorizontal,
  Eye,
  Edit,
  Download,
  Trash2,
  Share
} from 'lucide-react';
import { Card, Button, Badge, DropdownMenu, Progress } from '@ghxstship/ui';
import {
  format,
  addDays,
  differenceInDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isWithinInterval
} from 'date-fns';
import type { DigitalAsset } from '../types';

interface GanttViewProps {
  files: DigitalAsset[];
  onView: (file: DigitalAsset) => void;
  onEdit: (file: DigitalAsset) => void;
  onDownload: (file: DigitalAsset) => void;
  onDelete: (file: DigitalAsset) => void;
  onShare: (file: DigitalAsset) => void;
  formatFileSize: (bytes: number) => string;
  getCategoryIcon: (category: string) => React.ComponentType<any>;
}

interface GanttTask {
  id: string;
  name: string;
  start: Date;
  end: Date;
  progress: number;
  dependencies: string[];
  category: string;
  status: string;
  assignee?: string;
}

export default function GanttView({
  files,
  onView,
  onEdit,
  onDownload,
  onDelete,
  onShare,
  formatFileSize,
  getCategoryIcon
}: GanttViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [zoom, setZoom] = useState<'day' | 'week' | 'month'>('week');
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Convert files to Gantt tasks
  const tasks: GanttTask[] = useMemo(() => {
    return files.map(file => ({
      id: file.id,
      name: file.title,
      start: new Date(file.created_at),
      end: new Date(file.updated_at),
      progress: file.status === 'active' ? 100 :
               file.status === 'processing' ? 50 :
               file.status === 'error' ? 25 : 0,
      dependencies: [], // Could be populated from project relationships
      category: file.category,
      status: file.status,
      assignee: file.created_by
    }));
  }, [files]);

  // Calculate timeline range based on zoom
  const timelineRange = useMemo(() => {
    const start = startOfWeek(currentDate);
    const end = endOfWeek(addDays(start, zoom === 'day' ? 6 : zoom === 'week' ? 27 : 89));
    return { start, end };
  }, [currentDate, zoom]);

  // Generate timeline headers
  const timelineHeaders = useMemo(() => {
    const headers: { date: Date; label: string }[] = [];
    const { start, end } = timelineRange;

    let current = start;
    while (current <= end) {
      let label: string;
      switch (zoom) {
        case 'day':
          label = format(current, 'MMM d');
          break;
        case 'week':
          label = `Week ${format(current, 'w')}`;
          current = addDays(current, 6); // Skip to end of week
          break;
        case 'month':
          label = format(current, 'MMM yyyy');
          current = addDays(current, 29); // Skip to next month
          break;
      }

      headers.push({ date: current, label });
      current = addDays(current, zoom === 'day' ? 1 : zoom === 'week' ? 7 : 30);
    }

    return headers;
  }, [timelineRange, zoom]);

  // Calculate task position and width
  const getTaskPosition = (task: GanttTask) => {
    const { start, end } = timelineRange;
    const totalDays = differenceInDays(end, start);
    const taskStartDays = differenceInDays(task.start, start);
    const taskDuration = differenceInDays(task.end, task.start) || 1;

    const left = Math.max(0, (taskStartDays / totalDays) * 100);
    const width = Math.min(100 - left, (taskDuration / totalDays) * 100);

    return { left: `${left}%`, width: `${Math.max(2, width)}%` };
  };

  // Navigate timeline
  const navigateTimeline = (direction: 'prev' | 'next') => {
    const days = zoom === 'day' ? 7 : zoom === 'week' ? 28 : 90;
    setCurrentDate(prev =>
      direction === 'next'
        ? addDays(prev, days)
        : addDays(prev, -days)
    );
  };

  // Get category color
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

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'processing': return 'bg-yellow-500';
      case 'archived': return 'bg-gray-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Gantt Header */}
      <div className="flex items-center justify-between p-md border-b border-gray-200">
        <div className="flex items-center gap-md">
          <h3 className="text-lg font-semibold">Project Timeline</h3>
          <Badge variant="secondary">{tasks.length} files</Badge>
        </div>

        <div className="flex items-center gap-xs">
          {/* Zoom Controls */}
          <div className="flex items-center gap-xs border border-gray-300 rounded-md">
            <Button
              variant={zoom === 'day' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setZoom('day')}
            >
              Day
            </Button>
            <Button
              variant={zoom === 'week' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setZoom('week')}
            >
              Week
            </Button>
            <Button
              variant={zoom === 'month' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setZoom('month')}
            >
              Month
            </Button>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-xs">
            <Button variant="outline" size="sm" onClick={() => navigateTimeline('prev')}>
              <ChevronLeft className="w-icon-xs h-icon-xs" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigateTimeline('next')}>
              <ChevronRight className="w-icon-xs h-icon-xs" />
            </Button>
          </div>
        </div>
      </div>

      {/* Gantt Chart */}
      <div className="flex" style={{ height: '600px' }}>
        {/* Task List */}
        <div className="w-container-md border-r border-gray-200 overflow-y-auto">
          <div className="sticky top-0 bg-gray-50 border-b border-gray-200 p-sm font-medium text-sm">
            Tasks
          </div>
          <div className="divide-y divide-gray-200">
            {tasks.map((task, index) => {
              const CategoryIcon = getCategoryIcon(task.category);
              const file = files.find(f => f.id === task.id);

              return (
                <div
                  key={task.id}
                  className={`p-sm hover:bg-gray-50 cursor-pointer ${
                    selectedTask === task.id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedTask(task.id)}
                >
                  <div className="flex items-start gap-sm">
                    <div className="flex-shrink-0 mt-1">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(task.status)}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-xs mb-1">
                        <CategoryIcon className="w-icon-xs h-icon-xs text-gray-500" />
                        <span className="font-medium text-sm truncate">{task.name}</span>
                      </div>

                      <div className="flex items-center gap-sm text-xs text-gray-500">
                        <div className="flex items-center gap-xs">
                          <Calendar className="w-3 h-3" />
                          <span>{format(task.start, 'MMM d')} - {format(task.end, 'MMM d')}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {task.category}
                        </Badge>
                      </div>

                      {file && (
                        <div className="mt-1 text-xs text-gray-500">
                          {formatFileSize(file.file_size || 0)}
                        </div>
                      )}

                      {/* Progress Bar */}
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span>Progress</span>
                          <span>{task.progress}%</span>
                        </div>
                        <Progress value={task.progress} className="h-1" />
                      </div>
                    </div>

                    {/* Actions */}
                    {file && (
                      <DropdownMenu>
                        <DropdownMenu.Trigger asChild>
                          <Button variant="ghost" size="sm" className="h-icon-md w-icon-md p-0">
                            <MoreHorizontal className="w-3 h-3" />
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
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Timeline */}
        <div className="flex-1 overflow-x-auto" ref={containerRef}>
          {/* Timeline Header */}
          <div className="sticky top-0 bg-gray-50 border-b border-gray-200 flex">
            {timelineHeaders.map((header, index) => (
              <div
                key={index}
                className="flex-shrink-0 border-r border-gray-200 px-xs py-sm text-center"
                style={{
                  width: zoom === 'day' ? '40px' : zoom === 'week' ? '120px' : '160px',
                  minWidth: zoom === 'day' ? '40px' : zoom === 'week' ? '120px' : '160px'
                }}
              >
                <div className="text-xs font-medium text-gray-900">{header.label}</div>
              </div>
            ))}
          </div>

          {/* Timeline Grid */}
          <div className="relative">
            {/* Grid Lines */}
            {timelineHeaders.map((_, index) => (
              <div
                key={index}
                className="absolute top-0 bottom-0 border-r border-gray-100"
                style={{
                  left: `${index * (zoom === 'day' ? 40 : zoom === 'week' ? 120 : 160)}px`,
                  width: zoom === 'day' ? '40px' : zoom === 'week' ? '120px' : '160px'
                }}
              />
            ))}

            {/* Tasks */}
            {tasks.map((task, rowIndex) => {
              const position = getTaskPosition(task);
              const isSelected = selectedTask === task.id;

              return (
                <div
                  key={task.id}
                  className="relative h-icon-2xl border-b border-gray-100 flex items-center"
                  style={{ top: `${rowIndex * 48}px` }}
                >
                  <div
                    className={`absolute h-icon-lg rounded cursor-pointer border-2 hover:shadow-md transition-shadow ${
                      isSelected ? 'border-blue-500 shadow-md' : 'border-gray-300'
                    } ${getCategoryColor(task.category)}`}
                    style={{
                      left: position.left,
                      width: position.width,
                      top: '4px'
                    }}
                    onClick={() => setSelectedTask(task.id)}
                    title={`${task.name} (${format(task.start, 'MMM d')} - ${format(task.end, 'MMM d')})`}
                  >
                    <div className="px-xs py-xs text-xs text-white font-medium truncate">
                      {task.name}
                    </div>

                    {/* Progress Indicator */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-black bg-opacity-30 rounded-b">
                      <div
                        className="h-full bg-white bg-opacity-80 rounded-b"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Task Details Panel */}
      {selectedTask && (
        <div className="border-t border-gray-200 p-md">
          {(() => {
            const task = tasks.find(t => t.id === selectedTask);
            const file = files.find(f => f.id === selectedTask);

            if (!task || !file) return null;

            const CategoryIcon = getCategoryIcon(task.category);

            return (
              <div className="flex items-start gap-md">
                <div className="w-icon-2xl h-icon-2xl rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <CategoryIcon className="w-icon-md h-icon-md text-gray-600" />
                </div>

                <div className="flex-1">
                  <h4 className="font-medium text-lg mb-2">{task.name}</h4>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-md mb-4">
                    <div>
                      <div className="text-sm text-gray-500">Start Date</div>
                      <div className="font-medium">{format(task.start, 'MMM d, yyyy')}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">End Date</div>
                      <div className="font-medium">{format(task.end, 'MMM d, yyyy')}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Progress</div>
                      <div className="font-medium">{task.progress}%</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Status</div>
                      <Badge variant="outline">{task.status}</Badge>
                    </div>
                  </div>

                  {file.description && (
                    <div className="mb-4">
                      <div className="text-sm text-gray-500 mb-1">Description</div>
                      <p className="text-sm">{file.description}</p>
                    </div>
                  )}

                  <div className="flex gap-xs">
                    <Button size="sm" onClick={() => onView(file)}>
                      <Eye className="w-icon-xs h-icon-xs mr-2" />
                      View Details
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => onEdit(file)}>
                      <Edit className="w-icon-xs h-icon-xs mr-2" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => onDownload(file)}>
                      <Download className="w-icon-xs h-icon-xs mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
