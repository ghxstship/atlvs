"use client";

import React, { useState, useMemo } from 'react';
import {
  Clock,
  Calendar,
  ChevronDown,
  ChevronUp,
  Eye,
  Edit,
  Download,
  Trash2,
  Share,
  MoreHorizontal,
  GitBranch
} from 'lucide-react';
import { Card, Button, Badge, Dropdown, Select ,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@ghxstship/ui';
import { format, isSameDay, startOfDay, endOfDay } from 'date-fns';
import type { DigitalAsset } from '../types';

interface TimelineViewProps {
  files: DigitalAsset[];
  onView: (file: DigitalAsset) => void;
  onEdit: (file: DigitalAsset) => void;
  onDownload: (file: DigitalAsset) => void;
  onDelete: (file: DigitalAsset) => void;
  onShare: (file: DigitalAsset) => void;
  formatFileSize: (bytes: number) => string;
  getCategoryIcon: (category: string) => React.ComponentType<any>;
}

export default function TimelineView({
  files,
  onView,
  onEdit,
  onDownload,
  onDelete,
  onShare,
  formatFileSize,
  getCategoryIcon
}: TimelineViewProps) {
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('day');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>(new Set());

  // Sort files by date
  const sortedFiles = useMemo(() => {
    return [...files].sort((a, b) => {
      const dateA = new Date(a.updated_at);
      const dateB = new Date(b.updated_at);

      return sortOrder === 'newest'
        ? dateB.getTime() - dateA.getTime()
        : dateA.getTime() - dateB.getTime();
    });
  }, [files, sortOrder]);

  // Group files by time period
  const groupedFiles = useMemo(() => {
    const groups: Record<string, DigitalAsset[]> = {};

    sortedFiles.forEach(file => {
      const fileDate = new Date(file.updated_at);
      let groupKey: string;

      switch (groupBy) {
        case 'day':
          groupKey = format(fileDate, 'yyyy-MM-dd');
          break;
        case 'week':
          const weekStart = new Date(fileDate);
          weekStart.setDate(fileDate.getDate() - fileDate.getDay());
          groupKey = format(weekStart, 'yyyy-MM-dd');
          break;
        case 'month':
          groupKey = format(fileDate, 'yyyy-MM');
          break;
        default:
          groupKey = format(fileDate, 'yyyy-MM-dd');
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(file);
    });

    return groups;
  }, [sortedFiles, groupBy]);

  // Get group display info
  const getGroupInfo = (groupKey: string) => {
    switch (groupBy) {
      case 'day':
        const date = new Date(groupKey);
        const isToday = isSameDay(date, new Date());
        const isYesterday = isSameDay(date, new Date(Date.now() - 86400000));

        let label: string;
        if (isToday) {
          label = 'Today';
        } else if (isYesterday) {
          label = 'Yesterday';
        } else {
          label = format(date, 'EEEE, MMMM d, yyyy');
        }

        return {
          label,
          icon: Calendar,
          color: isToday ? 'text-blue-600' : 'text-gray-900'
        };

      case 'week':
        const weekStart = new Date(groupKey);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        return {
          label: `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`,
          icon: Calendar,
          color: 'text-gray-900'
        };

      case 'month':
        const monthDate = new Date(groupKey + '-01');
        return {
          label: format(monthDate, 'MMMM yyyy'),
          icon: Calendar,
          color: 'text-gray-900'
        };

      default:
        return {
          label: groupKey,
          icon: Calendar,
          color: 'text-gray-900'
        };
    }
  };

  // Toggle group expansion
  const toggleGroupExpansion = (groupKey: string) => {
    setExpandedGroups(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(groupKey)) {
        newExpanded.delete(groupKey);
      } else {
        newExpanded.add(groupKey);
      }
      return newExpanded;
    });
  };

  // Get timeline line style
  const getTimelineStyle = (index: number, total: number) => {
    if (index === 0 && total === 1) {
      return 'timeline-dot-only';
    }
    if (index === 0) {
      return 'timeline-start';
    }
    if (index === total - 1) {
      return 'timeline-end';
    }
    return 'timeline-middle';
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Controls */}
      <div className="flex items-center justify-between mb-6 p-md bg-white rounded-lg border border-gray-200">
        <div className="flex items-center gap-md">
          <div className="flex items-center gap-xs">
            <label className="text-sm font-medium">Sort:</label>
            <Select value={sortOrder} onChange={(value: 'newest' | 'oldest') => setSortOrder(value)}>
              <Select.Trigger className="w-component-xl">
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="newest">Newest First</Select.Item>
                <Select.Item value="oldest">Oldest First</Select.Item>
              </Select.Content>
            </Select>
          </div>

          <div className="flex items-center gap-xs">
            <label className="text-sm font-medium">Group by:</label>
            <Select value={groupBy} onChange={(value: 'day' | 'week' | 'month') => setGroupBy(value)}>
              <Select.Trigger className="w-component-lg">
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="day">Day</Select.Item>
                <Select.Item value="week">Week</Select.Item>
                <Select.Item value="month">Month</Select.Item>
              </Select.Content>
            </Select>
          </div>
        </div>

        <div className="text-sm text-gray-500">
          {files.length} files
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-xl">
        {Object.entries(groupedFiles).map(([groupKey, groupFiles]) => {
          const groupInfo = getGroupInfo(groupKey);
          const isExpanded = expandedGroups.has(groupKey) || groupFiles.length <= 3;
          const IconComponent = groupInfo.icon;

          return (
            <div key={groupKey} className="relative">
              {/* Group Header */}
              <div
                className="flex items-center gap-sm mb-4 cursor-pointer hover:bg-gray-50 p-xs rounded-lg"
                onClick={() => toggleGroupExpansion(groupKey)}
              >
                <IconComponent className={`w-icon-sm h-icon-sm ${groupInfo.color}`} />
                <h3 className={`font-semibold ${groupInfo.color}`}>
                  {groupInfo.label}
                </h3>
                <Badge variant="secondary" className="ml-2">
                  {groupFiles.length}
                </Badge>
                <div className="ml-auto">
                  {isExpanded ? (
                    <ChevronUp className="w-icon-xs h-icon-xs text-gray-400" />
                  ) : (
                    <ChevronDown className="w-icon-xs h-icon-xs text-gray-400" />
                  )}
                </div>
              </div>

              {/* Timeline Items */}
              {isExpanded && (
                <div className="ml-8 relative">
                  {/* Timeline Line */}
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

                  <div className="space-y-lg">
                    {groupFiles.map((file, index) => {
                      const CategoryIcon = getCategoryIcon(file.category);
                      const timelineStyle = getTimelineStyle(index, groupFiles.length);

                      return (
                        <div key={file.id} className="relative flex gap-md">
                          {/* Timeline Dot */}
                          <div className="flex-shrink-0 w-icon-2xl h-icon-2xl rounded-full bg-white border-4 border-gray-200 flex items-center justify-center z-10">
                            <div className={`w-3 h-3 rounded-full ${
                              file.status === 'active' ? 'bg-green-500' :
                              file.status === 'processing' ? 'bg-yellow-500' :
                              file.status === 'error' ? 'bg-red-500' :
                              'bg-gray-400'
                            }`} />
                          </div>

                          {/* File Card */}
                          <Card className="flex-1 p-md hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-md">
                              {/* File Icon */}
                              <div className="flex-shrink-0">
                                <div className="w-icon-2xl h-icon-2xl rounded-lg bg-gray-100 flex items-center justify-center">
                                  <CategoryIcon className="w-icon-md h-icon-md text-gray-600" />
                                </div>
                              </div>

                              {/* File Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h4 className="font-medium text-gray-900 truncate mb-1">
                                      {file.title}
                                    </h4>

                                    {file.description && (
                                      <p className="text-sm text-gray-600 truncate mb-2">
                                        {file.description}
                                      </p>
                                    )}

                                    {/* Metadata */}
                                    <div className="flex items-center gap-md text-xs text-gray-500 mb-2">
                                      <div className="flex items-center gap-xs">
                                        <CategoryIcon className="w-3 h-3" />
                                        <span className="capitalize">{file.category}</span>
                                      </div>
                                      <span>{formatFileSize(file.file_size || 0)}</span>
                                      <Badge variant="outline" className="text-xs">
                                        {file.access_level}
                                      </Badge>
                                      <div className="flex items-center gap-xs">
                                        <Clock className="w-3 h-3" />
                                        <span>{format(new Date(file.updated_at), 'h:mm a')}</span>
                                      </div>
                                    </div>

                                    {/* Tags */}
                                    {file.tags && file.tags.length > 0 && (
                                      <div className="flex flex-wrap gap-xs mb-2">
                                        {file.tags.map((tag, index) => (
                                          <Badge key={index} variant="outline" className="text-xs">
                                            {tag}
                                          </Badge>
                                        ))}
                                      </div>
                                    )}

                                    {/* Status */}
                                    <Badge
                                      variant={file.status === 'active' ? 'default' : 'secondary'}
                                      className="text-xs"
                                    >
                                      {file.status}
                                    </Badge>
                                  </div>

                                  {/* Actions */}
                                  <DropdownMenu>
                                    <DropdownMenu.Trigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <MoreHorizontal className="w-icon-xs h-icon-xs" />
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
                              </div>
                            </div>
                          </Card>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {files.length === 0 && (
        <div className="text-center py-xsxl">
          <GitBranch className="w-icon-2xl h-icon-2xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No files to display</h3>
          <p className="text-gray-500">Upload some files to see the timeline.</p>
        </div>
      )}
    </div>
  );
}
