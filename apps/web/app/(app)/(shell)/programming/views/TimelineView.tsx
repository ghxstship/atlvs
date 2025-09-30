'use client';

import React, { useState, useMemo } from 'react';
import { MoreHorizontal, Edit, Trash2, Eye, Calendar, Clock, MapPin } from 'lucide-react';
import { Button } from '@ghxstship/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@ghxstship/ui';
import { Badge } from '@ghxstship/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@ghxstship/ui';
import type { ProgrammingEntity } from '../types';

interface TimelineViewProps<T extends ProgrammingEntity> {
  data: T[];
  loading?: boolean;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onView?: (item: T) => void;
  groupByMonth?: boolean;
  showTime?: boolean;
  renderTimelineItem?: (item: T) => React.ReactNode;
  emptyMessage?: string;
  className?: string;
}

export function TimelineView<T extends ProgrammingEntity>({
  data,
  loading = false,
  onEdit,
  onDelete,
  onView,
  groupByMonth = true,
  showTime = true,
  renderTimelineItem,
  emptyMessage = 'No timeline items to display',
  className,
}: TimelineViewProps<T>) {
  const [expandedItems, setExpandedItems] = useState<Set<string>(new Set());

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  // Group and sort data by date
  const groupedData = useMemo(() => {
    // Sort data by date
    const sortedData = [...data].sort((a, b) => {
      let dateA: Date;
      let dateB: Date;

      // Determine date field based on entity type
      if ('start_date' in a) {
        dateA = new Date((a as any).start_date);
        dateB = new Date((b as any).start_date);
      } else if ('date' in a) {
        dateA = new Date((a as any).date);
        dateB = new Date((b as any).date);
      } else {
        return 0; // No date field, maintain original order
      }

      return dateA.getTime() - dateB.getTime();
    });

    if (!groupByMonth) {
      return { 'All Items': sortedData };
    }

    // Group by month/year
    const grouped: Record<string, T[]> = {};

    sortedData.forEach(item => {
      let itemDate: Date;

      if ('start_date' in item) {
        itemDate = new Date((item as any).start_date);
      } else if ('date' in item) {
        itemDate = new Date((item as any).date);
      } else {
        return; // Skip items without dates
      }

      const monthKey = itemDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
      });

      if (!grouped[monthKey]) {
        grouped[monthKey] = [];
      }
      grouped[monthKey].push(item);
    });

    return grouped;
  }, [data, groupByMonth]);

  // Default timeline item renderer
  const defaultRenderTimelineItem = (item: T) => {
    const isEvent = 'start_date' in item && 'end_date' in item;
    const isPerformance = 'date' in item && 'venue' in item;
    const isWorkshop = 'instructor' in item;
    const isExpanded = expandedItems.has(item.id);

    let itemDate: Date | null = null;
    let endDate: Date | null = null;

    if (isEvent) {
      itemDate = new Date((item as any).start_date);
      endDate = new Date((item as any).end_date);
    } else if (isPerformance) {
      itemDate = new Date((item as any).date);
    } else if (isWorkshop) {
      itemDate = new Date((item as any).start_date);
      endDate = new Date((item as any).end_date);
    }

    return (
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-8 bottom-0 w-px bg-gray-200" />

        {/* Timeline dot */}
        <div className="absolute left-4 top-6 w-4 h-4 bg-blue-500 rounded-full border-4 border-white shadow" />

        {/* Content card */}
        <Card className="ml-12 mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg flex items-center gap-2">
                  {item.title || 'Untitled'}
                  {'status' in item && (
                    <Badge variant={item.status === 'completed' ? 'default' : 'secondary'}>
                      {item.status}
                    </Badge>
                  )}
                </CardTitle>

                {/* Date and time information */}
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {itemDate && (
                      <span>
                        {itemDate.toLocaleDateString()}
                        {endDate && endDate.getTime() !== itemDate.getTime() && (
                          <> - {endDate.toLocaleDateString()}</>
                        )}
                      </span>
                    )}
                  </div>

                  {showTime && 'start_date' in item && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>
                        {new Date((item as any).start_date).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                        {'end_date' in item && (
                          <> - {new Date((item as any).end_date).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</>
                        )}
                      </span>
                    </div>
                  )}

                  {('location' in item || 'venue' in item) && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{(item as any).location || (item as any).venue}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleExpanded(item.id)}
                >
                  {isExpanded ? 'Less' : 'More'}
                </Button>

                {(onEdit || onDelete || onView) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onView && (
                        <DropdownMenuItem onClick={() => onView(item)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </DropdownMenuItem>
                      )}
                      {onEdit && (
                        <DropdownMenuItem onClick={() => onEdit(item)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                      )}
                      {onDelete && (
                        <DropdownMenuItem
                          onClick={() => onDelete(item)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            {item.description && (
              <p className="text-gray-700 mb-3">{item.description}</p>
            )}

            {/* Expanded details */}
            {isExpanded && (
              <div className="border-t pt-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Entity-specific details */}
                  <div>
                    <h4 className="font-medium text-sm text-gray-900 mb-2">Details</h4>
                    <dl className="space-y-1 text-sm">
                      {'type' in item && (
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Type:</dt>
                          <dd className="font-medium">{item.type}</dd>
                        </div>
                      )}
                      {isPerformance && 'duration' in item && (
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Duration:</dt>
                          <dd className="font-medium">{(item as any).duration} minutes</dd>
                        </div>
                      )}
                      {isWorkshop && 'capacity' in item && (
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Capacity:</dt>
                          <dd className="font-medium">{(item as any).capacity}</dd>
                        </div>
                      )}
                    </dl>
                  </div>

                  {/* Additional information */}
                  <div>
                    <h4 className="font-medium text-sm text-gray-900 mb-2">Additional Info</h4>
                    <dl className="space-y-1 text-sm">
                      {isWorkshop && 'instructor' in item && (
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Instructor:</dt>
                          <dd className="font-medium">{(item as any).instructor}</dd>
                        </div>
                      )}
                      {'capacity' in item && !isWorkshop && (
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Capacity:</dt>
                          <dd className="font-medium">{(item as any).capacity}</dd>
                        </div>
                      )}
                      {'created_at' in item && (
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Created:</dt>
                          <dd className="font-medium">
                            {new Date((item as any).created_at).toLocaleDateString()}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="relative">
            <div className="absolute left-4 top-6 w-4 h-4 bg-gray-300 rounded-full" />
            <div className="absolute left-6 top-8 bottom-0 w-px bg-gray-200" />
            <Card className="ml-12">
              <CardHeader>
                <div className="h-6 bg-gray-200 animate-pulse rounded w-3/4" />
                <div className="flex gap-4 mt-2">
                  <div className="h-4 bg-gray-200 animate-pulse rounded w-32" />
                  <div className="h-4 bg-gray-200 animate-pulse rounded w-24" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-gray-200 animate-pulse rounded w-full" />
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {Object.entries(groupedData).map(([groupKey, items]) => (
        <div key={groupKey}>
          {groupByMonth && (
            <h3 className="text-lg font-medium text-gray-900 mb-4 sticky top-0 bg-white py-2 border-b">
              {groupKey}
            </h3>
          )}

          <div className="space-y-6">
            {items.map((item) => (
              <div key={item.id}>
                {renderTimelineItem ? renderTimelineItem(item) : defaultRenderTimelineItem(item)}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default TimelineView;
