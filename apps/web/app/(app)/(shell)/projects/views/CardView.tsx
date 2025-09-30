"use client";

import React from 'react';
import { Eye, Edit, Trash2, MoreHorizontal, Calendar, User, DollarSign, Target, AlertTriangle } from 'lucide-react';
import { Button } from '@ghxstship/ui';
import { Badge } from '@ghxstship/ui';
import { Checkbox } from '@ghxstship/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@ghxstship/ui';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@ghxstship/ui';
import { format } from 'date-fns';

export interface CardViewProps {
  data: unknown[];
  fields: Array<{
    key: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'boolean' | 'badge' | 'currency';
    priority?: 'high' | 'medium' | 'low'; // For card display priority
  }>;
  onItemClick?: (item: unknown) => void;
  onEdit?: (item: unknown) => void;
  onDelete?: (item: unknown) => void;
  onView?: (item: unknown) => void;
  selectable?: boolean;
  selectedItems?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  cardLayout?: 'compact' | 'comfortable' | 'spacious';
}

export default function CardView({
  data,
  fields,
  onItemClick,
  onEdit,
  onDelete,
  onView,
  selectable = false,
  selectedItems = [],
  onSelectionChange,
  loading = false,
  emptyMessage = "No data available",
  className = "",
  cardLayout = 'comfortable',
}: CardViewProps) {
  // Handle item selection
  const handleItemSelect = (itemId: string, checked: boolean, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!onSelectionChange) return;

    if (checked) {
      onSelectionChange([...selectedItems, itemId]);
    } else {
      onSelectionChange(selectedItems.filter(id => id !== itemId));
    }
  };

  // Render field value based on type
  const renderFieldValue = (item: unknown, field: unknown) => {
    const value = item[field.key];

    switch (field.type) {
      case 'currency':
        return value ? (
          <div className="flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            ${Number(value).toLocaleString()}
          </div>
        ) : '-';
      case 'date':
        return value ? (
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {format(new Date(value), 'MMM d, yyyy')}
          </div>
        ) : '-';
      case 'boolean':
        return <Badge variant={value ? 'success' : 'secondary'}>{value ? 'Yes' : 'No'}</Badge>;
      case 'badge':
        let variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info' = 'default';
        let text = String(value || '');

        // Status-based badge variants
        if (field.key === 'status') {
          switch (value) {
            case 'active':
            case 'completed':
              variant = 'success';
              break;
            case 'on_hold':
            case 'pending':
              variant = 'warning';
              break;
            case 'cancelled':
            case 'failed':
              variant = 'destructive';
              break;
            default:
              variant = 'secondary';
          }
        } else if (field.key === 'priority') {
          switch (value) {
            case 'critical':
              variant = 'destructive';
              text = 'Critical';
              break;
            case 'high':
              variant = 'warning';
              text = 'High';
              break;
            case 'medium':
              variant = 'info';
              text = 'Medium';
              break;
            case 'low':
              variant = 'secondary';
              text = 'Low';
              break;
          }
        }

        return <Badge variant={variant}>{text}</Badge>;
      case 'number':
        return value?.toString() || '-';
      default:
        return String(value || '-');
    }
  };

  // Get layout classes
  const getLayoutClasses = () => {
    switch (cardLayout) {
      case 'compact':
        return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3';
      case 'spacious':
        return 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6';
      default: // comfortable
        return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4';
    }
  };

  // Separate high, medium, low priority fields for card layout
  const highPriorityFields = fields.filter(f => f.priority === 'high');
  const mediumPriorityFields = fields.filter(f => f.priority === 'medium');
  const lowPriorityFields = fields.filter(f => f.priority === 'low');
  const unprioritizedFields = fields.filter(f => !f.priority);

  if (loading) {
    return (
      <div className={className}>
        <div className={getLayoutClasses()}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded w-full"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
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
    <div className={className}>
      <div className={getLayoutClasses()}>
        {data.map((item) => (
          <Card
            key={item.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedItems.includes(item.id) ? 'ring-2 ring-primary' : ''
            } ${cardLayout === 'compact' ? 'p-3' : cardLayout === 'spacious' ? 'p-6' : 'p-4'}`}
            onClick={() => onItemClick?.(item)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className={`font-medium ${
                  cardLayout === 'compact' ? 'text-sm' : 'text-base'
                }`}>
                  {item.name || item.title || `Item ${item.id}`}
                </CardTitle>

                <div className="flex items-center gap-1">
                  {selectable && (
                    <Checkbox
                      checked={selectedItems.includes(item.id)}
                      onCheckedChange={(checked) => handleItemSelect(item.id, checked as boolean, { stopPropagation: () => {} } as any)}
                      onClick={(e) => e.stopPropagation()}
                      className="mr-1"
                    />
                  )}

                  {(onView || onEdit || onDelete) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => e.stopPropagation()}
                          className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                        >
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {onView && (
                          <DropdownMenuItem onClick={() => onView(item)}>
                            <Eye className="mr-2 h-3 w-3" />
                            View
                          </DropdownMenuItem>
                        )}
                        {onEdit && (
                          <DropdownMenuItem onClick={() => onEdit(item)}>
                            <Edit className="mr-2 h-3 w-3" />
                            Edit
                          </DropdownMenuItem>
                        )}
                        {onDelete && (
                          <DropdownMenuItem
                            onClick={() => onDelete(item)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-3 w-3" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {/* High priority fields */}
              {highPriorityFields.map((field) => (
                <div key={field.key} className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {field.label}
                  </span>
                  <div className="text-sm font-medium">
                    {renderFieldValue(item, field)}
                  </div>
                </div>
              ))}

              {/* Medium priority fields */}
              {mediumPriorityFields.map((field) => (
                <div key={field.key} className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {field.label}
                  </span>
                  <div className="text-sm">
                    {renderFieldValue(item, field)}
                  </div>
                </div>
              ))}

              {/* Description or main content field */}
              {item.description && (
                <p className={`text-muted-foreground ${
                  cardLayout === 'compact' ? 'text-xs line-clamp-2' : 'text-sm line-clamp-3'
                }`}>
                  {item.description}
                </p>
              )}

              {/* Low priority fields in footer */}
              {lowPriorityFields.length > 0 && (
                <div className="pt-2 border-t border-border/50">
                  <div className="flex flex-wrap gap-1">
                    {lowPriorityFields.slice(0, 3).map((field) => (
                      <div key={field.key} className="text-xs text-muted-foreground">
                        {renderFieldValue(item, field)}
                      </div>
                    ))}
                    {lowPriorityFields.length > 3 && (
                      <span className="text-xs text-muted-foreground">
                        +{lowPriorityFields.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selection summary */}
      {selectable && selectedItems.length > 0 && (
        <div className="mt-4 px-4 py-2 bg-muted/30 rounded-lg text-sm text-muted-foreground">
          {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
        </div>
      )}
    </div>
  );
}
