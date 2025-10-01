'use client';

import React, { useState } from 'react';
import { MoreHorizontal, Edit, Trash2, Eye, Calendar, MapPin, Users, ChevronRight } from 'lucide-react';
import { Button } from '@ghxstship/ui';
import { Checkbox } from '@ghxstship/ui';
import { Badge } from '@ghxstship/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@ghxstship/ui';
import type { ProgrammingEntity } from '../types';

interface ListViewProps<T extends ProgrammingEntity> {
  data: T[];
  loading?: boolean;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onView?: (item: T) => void;
  renderListItem?: (item: T) => React.ReactNode;
  emptyMessage?: string;
  className?: string;
  showDetails?: boolean; // Whether to show expanded details
}

export function ListView<T extends ProgrammingEntity>({
  data,
  loading = false,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  onEdit,
  onDelete,
  onView,
  renderListItem,
  emptyMessage = 'No data available',
  className,
  showDetails = true,
}: ListViewProps<T>) {
  const [internalSelectedIds, setInternalSelectedIds] = useState<string[]>(selectedIds);
  const [expandedItems, setExpandedItems] = useState<Set<string>(new Set());

  const selectedIdsToUse = onSelectionChange ? selectedIds : internalSelectedIds;
  const setSelectedIds = onSelectionChange || setInternalSelectedIds;

  const handleSelectItem = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIdsToUse, itemId]);
    } else {
      setSelectedIds(selectedIdsToUse.filter(id => id !== itemId));
    }
  };

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  // Default list item renderer
  const defaultRenderListItem = (item: T) => {
    const isEvent = 'start_date' in item && 'end_date' in item;
    const isPerformance = 'date' in item && 'venue' in item;
    const isWorkshop = 'instructor' in item && 'start_date' in item;
    const isExpanded = expandedItems.has(item.id);

    return (
      <div className={`border rounded-lg overflow-hidden ${selectedIdsToUse.includes(item.id) ? 'ring-2 ring-blue-500' : ''}`}>
        <div className="p-md">
          <div className="flex items-start gap-md">
            {selectable && (
              <Checkbox
                checked={selectedIdsToUse.includes(item.id)}
                onCheckedChange={(checked) => handleSelectItem(item.id, checked as boolean)}
                className="mt-1"
              />
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 line-clamp-xs">
                    {item.title || 'Untitled'}
                  </h3>

                  <div className="flex items-center gap-xs mt-1">
                    {'status' in item && (
                      <Badge variant={item.status === 'completed' ? 'default' : 'secondary'}>
                        {item.status}
                      </Badge>
                    )}
                    {'type' in item && (
                      <Badge variant="outline">
                        {item.type}
                      </Badge>
                    )}
                  </div>

                  {item.description && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-xs">
                      {item.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-xs ml-4">
                  {showDetails && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpanded(item.id)}
                    >
                      <ChevronRight className={`h-icon-xs w-icon-xs transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </Button>
                  )}

                  {(onEdit || onDelete || onView) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-icon-xs w-icon-xs" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {onView && (
                          <DropdownMenuItem onClick={() => onView(item)}>
                            <Eye className="h-icon-xs w-icon-xs mr-2" />
                            View
                          </DropdownMenuItem>
                        )}
                        {onEdit && (
                          <DropdownMenuItem onClick={() => onEdit(item)}>
                            <Edit className="h-icon-xs w-icon-xs mr-2" />
                            Edit
                          </DropdownMenuItem>
                        )}
                        {onDelete && (
                          <DropdownMenuItem
                            onClick={() => onDelete(item)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-icon-xs w-icon-xs mr-2" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>

              {/* Main information row */}
              <div className="flex items-center gap-lg mt-3 text-sm text-gray-600">
                {isEvent && (
                  <div className="flex items-center gap-xs">
                    <Calendar className="h-icon-xs w-icon-xs" />
                    <span>
                      {new Date((item as any).start_date).toLocaleDateString()} - {' '}
                      {new Date((item as any).end_date).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {isPerformance && (
                  <div className="flex items-center gap-xs">
                    <Calendar className="h-icon-xs w-icon-xs" />
                    <span>
                      {new Date((item as any).date).toLocaleDateString()}
                      {(item as any).duration && ` (${(item as any).duration} min)`}
                    </span>
                  </div>
                )}

                {isWorkshop && (
                  <div className="flex items-center gap-xs">
                    <Calendar className="h-icon-xs w-icon-xs" />
                    <span>
                      {new Date((item as any).start_date).toLocaleDateString()} - {' '}
                      {new Date((item as any).end_date).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {('location' in item || 'venue' in item) && (
                  <div className="flex items-center gap-xs">
                    <MapPin className="h-icon-xs w-icon-xs" />
                    <span>{(item as any).location || (item as any).venue || 'No location'}</span>
                  </div>
                )}

                {('capacity' in item || 'instructor' in item) && (
                  <div className="flex items-center gap-xs">
                    <Users className="h-icon-xs w-icon-xs" />
                    <span>
                      {('capacity' in item) && `Capacity: ${(item as any).capacity || 'Unlimited'}`}
                      {('instructor' in item) && `Instructor: ${(item as any).instructor}`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Expanded details */}
          {showDetails && isExpanded && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
                {/* Additional details would go here based on entity type */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Details</h4>
                  <dl className="space-y-xs">
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">ID:</dt>
                      <dd className="text-sm text-gray-900">{item.id.slice(0, 8)}...</dd>
                    </div>
                    {'created_at' in item && (
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Created:</dt>
                        <dd className="text-sm text-gray-900">
                          {new Date((item as any).created_at).toLocaleDateString()}
                        </dd>
                      </div>
                    )}
                    {'updated_at' in item && (
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Updated:</dt>
                        <dd className="text-sm text-gray-900">
                          {new Date((item as any).updated_at).toLocaleDateString()}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>

                {/* Entity-specific details */}
                {isEvent && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Event Details</h4>
                    <dl className="space-y-xs">
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Type:</dt>
                        <dd className="text-sm text-gray-900">{(item as any).type}</dd>
                      </div>
                      {(item as any).capacity && (
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">Capacity:</dt>
                          <dd className="text-sm text-gray-900">{(item as any).capacity}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                )}

                {isPerformance && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Performance Details</h4>
                    <dl className="space-y-xs">
                      {(item as any).venue && (
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">Venue:</dt>
                          <dd className="text-sm text-gray-900">{(item as any).venue}</dd>
                        </div>
                      )}
                      {(item as any).duration && (
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">Duration:</dt>
                          <dd className="text-sm text-gray-900">{(item as any).duration} min</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                )}

                {isWorkshop && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Workshop Details</h4>
                    <dl className="space-y-xs">
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Instructor:</dt>
                        <dd className="text-sm text-gray-900">{(item as any).instructor}</dd>
                      </div>
                      {(item as any).capacity && (
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">Capacity:</dt>
                          <dd className="text-sm text-gray-900">{(item as any).capacity}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`space-y-md ${className}`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-md">
            <div className="animate-pulse">
              <div className="flex items-start gap-md">
                <div className="w-icon-xs h-icon-xs bg-gray-200 rounded" />
                <div className="flex-1">
                  <div className="h-icon-md bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-icon-xs bg-gray-200 rounded w-1/2 mb-3" />
                  <div className="flex gap-lg">
                    <div className="h-icon-xs bg-gray-200 rounded w-component-xl" />
                    <div className="h-icon-xs bg-gray-200 rounded w-component-lg" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={`text-center py-xsxl ${className}`}>
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`space-y-sm ${className}`}>
      {data.map((item) => (
        <div key={item.id}>
          {renderListItem ? renderListItem(item) : defaultRenderListItem(item)}
        </div>
      ))}
    </div>
  );
}

export default ListView;
