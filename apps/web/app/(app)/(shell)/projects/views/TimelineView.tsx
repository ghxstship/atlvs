"use client";

import React from 'react';
import { Clock, CheckCircle, Circle, AlertCircle } from 'lucide-react';
import { Badge } from '@ghxstship/ui';
import { format, isAfter, isBefore, isEqual } from 'date-fns';

export interface TimelineViewProps {
  data: unknown[];
  dateField?: string;
  titleField?: string;
  descriptionField?: string;
  statusField?: string;
  onItemClick?: (item: unknown) => void;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  groupBy?: 'month' | 'week' | 'day' | 'none';
}

export default function TimelineView({
  data,
  dateField = 'created_at',
  titleField = 'title',
  descriptionField = 'description',
  statusField = 'status',
  onItemClick,
  loading = false,
  emptyMessage = "No timeline events",
  className = "",
  groupBy = 'month',
}: TimelineViewProps) {
  // Sort data by date
  const sortedData = React.useMemo(() => {
    return [...data].sort((a, b) => {
      const dateA = new Date(a[dateField]).getTime();
      const dateB = new Date(b[dateField]).getTime();
      return dateB - dateA; // Most recent first
    });
  }, [data, dateField]);

  // Group data by time period
  const groupedData = React.useMemo(() => {
    if (groupBy === 'none') return { 'All Events': sortedData };

    const groups: Record<string, any[]> = {};

    sortedData.forEach(item => {
      const date = new Date(item[dateField]);
      let groupKey: string;

      switch (groupBy) {
        case 'month':
          groupKey = format(date, 'MMMM yyyy');
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          groupKey = `Week of ${format(weekStart, 'MMM d, yyyy')}`;
          break;
        case 'day':
          groupKey = format(date, 'MMMM d, yyyy');
          break;
        default:
          groupKey = 'All Events';
      }

      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(item);
    });

    return groups;
  }, [sortedData, groupBy]);

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'done':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
      case 'active':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'pending':
        return <Circle className="h-4 w-4 text-gray-500" />;
      case 'blocked':
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'done':
        return 'border-green-500';
      case 'in_progress':
      case 'active':
        return 'border-blue-500';
      case 'pending':
        return 'border-gray-500';
      case 'blocked':
      case 'failed':
        return 'border-red-500';
      default:
        return 'border-gray-400';
    }
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-6 bg-muted rounded w-48 mb-4"></div>
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, j) => (
                <div key={j} className="flex gap-4">
                  <div className="w-4 h-4 bg-muted rounded-full mt-1"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center text-muted-foreground">
          {emptyMessage}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {Object.entries(groupedData).map(([groupName, items]) => (
        <div key={groupName}>
          {groupBy !== 'none' && (
            <h3 className="text-lg font-semibold mb-4 text-muted-foreground border-b pb-2">
              {groupName}
            </h3>
          )}

          <div className="space-y-4">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="flex gap-4 cursor-pointer hover:bg-muted/30 p-3 rounded-lg transition-colors"
                onClick={() => onItemClick?.(item)}
              >
                {/* Timeline connector */}
                <div className="flex flex-col items-center">
                  <div className={`w-4 h-4 rounded-full border-2 ${getStatusColor(item[statusField])} bg-background flex items-center justify-center`}>
                    {getStatusIcon(item[statusField])}
                  </div>
                  {index < items.length - 1 && (
                    <div className="w-px h-8 bg-border mt-2"></div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">
                        {item[titleField] || item.name || item.title}
                      </h4>
                      {item[descriptionField] && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {item[descriptionField]}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Badge variant="outline" className="text-xs">
                        {item[statusField]}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(item[dateField]), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>

                  {/* Additional metadata */}
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    {item.priority && (
                      <span>Priority: {item.priority}</span>
                    )}
                    {item.assignee && (
                      <span>Assignee: {item.assignee.full_name || item.assignee.email}</span>
                    )}
                    {item.due_date && (
                      <span>Due: {format(new Date(item.due_date), 'MMM d, yyyy')}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
