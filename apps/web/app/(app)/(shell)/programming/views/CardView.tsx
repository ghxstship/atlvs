'use client';

import React, { useState } from 'react';
import { MoreHorizontal, Edit, Trash2, Eye, Calendar, MapPin, Users } from 'lucide-react';
import { Button } from '@ghxstship/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@ghxstship/ui';
import { Checkbox } from '@ghxstship/ui';
import { Badge } from '@ghxstship/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@ghxstship/ui';
import type { ProgrammingEntity } from '../types';

interface CardViewProps<T extends ProgrammingEntity> {
  data: T[];
  loading?: boolean;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onView?: (item: T) => void;
  renderCard?: (item: T) => React.ReactNode;
  emptyMessage?: string;
  className?: string;
  columns?: number; // 1-4 columns
}

export function CardView<T extends ProgrammingEntity>({
  data,
  loading = false,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  onEdit,
  onDelete,
  onView,
  renderCard,
  emptyMessage = 'No data available',
  className,
  columns = 3
}: CardViewProps<T>) {
  const [internalSelectedIds, setInternalSelectedIds] = useState<string[]>(selectedIds);

  const selectedIdsToUse = onSelectionChange ? selectedIds : internalSelectedIds;
  const setSelectedIds = onSelectionChange || setInternalSelectedIds;

  const handleSelectItem = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIdsToUse, itemId]);
    } else {
      setSelectedIds(selectedIdsToUse.filter(id => id !== itemId));
    }
  };

  const getGridClass = () => {
    switch (columns) {
      case 1: return 'grid-cols-1';
      case 2: return 'grid-cols-1 md:grid-cols-2';
      case 3: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      case 4: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
      default: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    }
  };

  // Default card renderer
  const defaultRenderCard = (item: T) => {
    const isEvent = 'start_date' in item && 'end_date' in item;
    const isPerformance = 'date' in item && 'venue' in item;
    const isWorkshop = 'instructor' in item && 'start_date' in item;

    return (
      <Card className={`h-full ${selectedIdsToUse.includes(item.id) ? 'ring-2 ring-blue-500' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg line-clamp-xs">
                {item.title || 'Untitled'}
              </CardTitle>
              {item.description && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-xs">
                  {item.description}
                </p>
              )}
            </div>
            {selectable && (
              <Checkbox
                checked={selectedIdsToUse.includes(item.id)}
                onCheckedChange={(checked) => handleSelectItem(item.id, checked as boolean)}
                className="ml-2"
              />
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-sm">
            {/* Status and Type */}
            <div className="flex items-center gap-xs">
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

            {/* Date/Time Information */}
            {isEvent && (
              <div className="flex items-center gap-xs text-sm text-gray-600">
                <Calendar className="h-icon-xs w-icon-xs" />
                <span>
                  {new Date((item as any).start_date).toLocaleDateString()} - {' '}
                  {new Date((item as any).end_date).toLocaleDateString()}
                </span>
              </div>
            )}

            {isPerformance && (
              <div className="flex items-center gap-xs text-sm text-gray-600">
                <Calendar className="h-icon-xs w-icon-xs" />
                <span>
                  {new Date((item as any).date).toLocaleDateString()}
                  {(item as any).duration && ` (${(item as any).duration} min)`}
                </span>
              </div>
            )}

            {isWorkshop && (
              <div className="flex items-center gap-xs text-sm text-gray-600">
                <Calendar className="h-icon-xs w-icon-xs" />
                <span>
                  {new Date((item as any).start_date).toLocaleDateString()} - {' '}
                  {new Date((item as any).end_date).toLocaleDateString()}
                </span>
              </div>
            )}

            {/* Location/Venue */}
            {('location' in item || 'venue' in item) && (
              <div className="flex items-center gap-xs text-sm text-gray-600">
                <MapPin className="h-icon-xs w-icon-xs" />
                <span>{(item as any).location || (item as any).venue || 'No location'}</span>
              </div>
            )}

            {/* Capacity/Instructor */}
            {('capacity' in item || 'instructor' in item) && (
              <div className="flex items-center gap-xs text-sm text-gray-600">
                <Users className="h-icon-xs w-icon-xs" />
                <span>
                  {('capacity' in item) && `Capacity: ${(item as any).capacity || 'Unlimited'}`}
                  {('instructor' in item) && `Instructor: ${(item as any).instructor}`}
                </span>
              </div>
            )}

            {/* Actions */}
            {(onEdit || onDelete || onView) && (
              <div className="flex items-center justify-end gap-xs pt-2 border-t">
                {onView && (
                  <Button variant="outline" size="sm" onClick={() => onView(item)}>
                    <Eye className="h-icon-xs w-icon-xs" />
                  </Button>
                )}
                {onEdit && (
                  <Button variant="outline" size="sm" onClick={() => onEdit(item)}>
                    <Edit className="h-icon-xs w-icon-xs" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(item)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-icon-xs w-icon-xs" />
                  </Button>
                )}
                {(onEdit || onDelete || onView) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
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
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className={`grid ${getGridClass()} gap-md ${className}`}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="h-container-sm">
            <CardHeader>
              <div className="h-icon-md bg-gray-200 animate-pulse rounded" />
              <div className="h-icon-xs bg-gray-200 animate-pulse rounded mt-2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-xs">
                <div className="h-icon-xs bg-gray-200 animate-pulse rounded" />
                <div className="h-icon-xs bg-gray-200 animate-pulse rounded" />
                <div className="h-icon-xs bg-gray-200 animate-pulse rounded w-2/3" />
              </div>
            </CardContent>
          </Card>
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
    <div className={`grid ${getGridClass()} gap-md ${className}`}>
      {data.map((item) => (
        <div key={item.id}>
          {renderCard ? renderCard(item) : defaultRenderCard(item)}
        </div>
      ))}
    </div>
  );
}

export default CardView;
