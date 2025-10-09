'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Calendar, ChevronDown, ChevronRight, Circle, Clock, Dropdown, DropdownItem, DropdownMenuSeparator, Edit, Filter, MapPin, Minus, MoreHorizontal, Plus, Search, Tag, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage, Badge, Button, Card, CardBody, CardContent, Dropdown,  DropdownItem,  Input,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@ghxstship/ui";
import { cn } from '@ghxstship/ui/lib/utils';
import { format, isSameDay, parseISO } from 'date-fns';

// Timeline Field Configuration
export interface TimelineFieldMapping {
  id: string;
  title: string;
  date: string;
  endDate?: string;
  description?: string;
  category?: string;
  status?: string;
  assignee?: string;
  location?: string;
  tags?: string;
  color?: string;
  icon?: string;
}

// Timeline Item Types
export type TimelineItemType = 'event' | 'milestone' | 'task' | 'period' | 'deadline';

// Timeline View Props
export interface TimelineViewProps {
  data: Record<string, unknown>[];
  fieldMapping: TimelineFieldMapping;
  orientation?: 'horizontal' | 'vertical';
  layout?: 'timeline' | 'compact' | 'detailed';
  loading?: boolean;
  emptyMessage?: string;
  className?: string;

  // Search & Filter
  globalSearch?: string;
  onGlobalSearch?: (query: string) => void;
  categoryFilter?: string[];
  onCategoryFilter?: (categories: string[]) => void;
  dateRange?: { start: Date; end: Date };
  onDateRangeChange?: (range: { start: Date; end: Date } | undefined) => void;

  // Item Actions
  onItemClick?: (item: Record<string, unknown>) => void;
  onItemEdit?: (item: Record<string, unknown>) => void;
  onItemDelete?: (item: Record<string, unknown>) => void;
  onAddItem?: (date?: Date) => void;

  // Customization
  showIcons?: boolean;
  showColors?: boolean;
  showConnectors?: boolean;
  groupByDate?: boolean;
  maxItemsPerGroup?: number;
  zoomLevel?: 'day' | 'week' | 'month' | 'year';

  // Advanced Features
  interactive?: boolean;
  collapsible?: boolean;
  sortable?: boolean;
  filterable?: boolean;
}

// Timeline View Component
export const TimelineView: React.FC<TimelineViewProps> = ({
  data,
  fieldMapping,
  orientation = 'vertical',
  layout = 'timeline',
  loading = false,
  emptyMessage = 'No timeline items',
  className,

  // Search & Filter
  globalSearch = '',
  onGlobalSearch,
  categoryFilter = [],
  onCategoryFilter,
  dateRange,
  onDateRangeChange,

  // Item Actions
  onItemClick,
  onItemEdit,
  onItemDelete,
  onAddItem,

  // Customization
  showIcons = true,
  showColors = true,
  showConnectors = true,
  groupByDate = true,
  maxItemsPerGroup,
  zoomLevel = 'month',

  // Advanced Features
  interactive = true,
  collapsible = true,
  sortable = false,
  filterable = true
}) => {
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>(new Set());
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Filtered and sorted data
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const processedData = useMemo(() => {
    let filtered = data.filter(row => {
      // Apply search filter
      if (globalSearch) {
        const searchTerm = globalSearch.toLowerCase();
        const searchableText = [
          String(row[fieldMapping.title] || ''),
          String(row[fieldMapping.description] || ''),
          String(row[fieldMapping.category] || ''),
          String(row[fieldMapping.location] || ''),
          String(row[fieldMapping.tags] || '')
        ].join(' ').toLowerCase();

        if (!searchableText.includes(searchTerm)) return false;
      }

      // Apply category filter
      if (categoryFilter.length > 0) {
        const category = String(row[fieldMapping.category] || '');
        if (!categoryFilter.includes(category)) return false;
      }

      // Apply date range filter
      if (dateRange) {
        const itemDate = parseISO(String(row[fieldMapping.date]));
        if (itemDate < dateRange.start || itemDate > dateRange.end) return false;
      }

      return true;
    });

    // Sort by date
    filtered.sort((a, b) => {
      const dateA = parseISO(String(a[fieldMapping.date]));
      const dateB = parseISO(String(b[fieldMapping.date]));
      return dateA.getTime() - dateB.getTime();
    });

    return filtered;
  }, [data, globalSearch, categoryFilter, dateRange, fieldMapping]);

  // Group data by date if enabled
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const groupedData = useMemo(() => {
    if (!groupByDate) return { 'all': processedData };

    const groups: Record<string, Record<string, unknown>[]> = {};

    processedData.forEach(row => {
      const date = parseISO(String(row[fieldMapping.date]));
      const dateKey = format(date, 'yyyy-MM-dd');

      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(row);

      // Limit items per group if specified
      if (maxItemsPerGroup && groups[dateKey].length > maxItemsPerGroup) {
        groups[dateKey] = groups[dateKey].slice(0, maxItemsPerGroup);
      }
    });

    return groups;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [processedData, groupByDate, maxItemsPerGroup, fieldMapping.date]);

  // Get item type
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const getItemType = useCallback((row: Record<string, unknown>): TimelineItemType => {
    const status = String(row[fieldMapping.status] || '').toLowerCase();
    const category = String(row[fieldMapping.category] || '').toLowerCase();

    if (status === 'milestone' || category === 'milestone') return 'milestone';
    if (status === 'deadline' || category === 'deadline') return 'deadline';
    if (category === 'task') return 'task';
    if (fieldMapping.endDate && row[fieldMapping.endDate]) return 'period';

    return 'event';
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldMapping]);

  // Get item color
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const getItemColor = useCallback((row: Record<string, unknown>): string => {
    const color = row[fieldMapping.color] as string;
    if (color) return color;

    // Default colors based on type using design tokens
    const type = getItemType(row);
    switch (type) {
      case 'milestone': return 'hsl(var(--color-success))';
      case 'deadline': return 'hsl(var(--color-destructive))';
      case 'task': return 'hsl(var(--color-primary))';
      case 'period': return 'hsl(var(--color-purple))';
      default: return 'hsl(var(--color-muted))';
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldMapping.color, getItemType]);

  // Get item icon
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const getItemIcon = useCallback((row: Record<string, unknown>) => {
    const type = getItemType(row);
    switch (type) {
      case 'milestone': return Circle;
      case 'deadline': return Clock;
      case 'task': return Calendar;
      case 'period': return ChevronRight;
      default: return Circle;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getItemType]);

  // Toggle group collapse
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const toggleGroupCollapse = useCallback((groupKey: string) => {
    setCollapsedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupKey)) {
        newSet.delete(groupKey);
      } else {
        newSet.add(groupKey);
      }
      return newSet;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Render timeline item
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const renderTimelineItem = useCallback((row: Record<string, unknown>, index: number, isLast: boolean) => {
    const itemId = String(row[fieldMapping.id] || index);
    const title = String(row[fieldMapping.title] || '');
    const description = row[fieldMapping.description] ? String(row[fieldMapping.description]) : '';
    const category = row[fieldMapping.category] ? String(row[fieldMapping.category]) : '';
    const location = row[fieldMapping.location] ? String(row[fieldMapping.location]) : '';
    const tags = row[fieldMapping.tags] ? String(row[fieldMapping.tags]).split(',').map(t => t.trim()) : [];
    const itemType = getItemType(row);
    const color = getItemColor(row);
    const Icon = getItemIcon(row);
    const isHovered = hoveredItem === itemId;

    const date = parseISO(String(row[fieldMapping.date]));
    const endDate = fieldMapping.endDate && row[fieldMapping.endDate]
      ? parseISO(String(row[fieldMapping.endDate]))
      : null;

    return (
      <div
        key={itemId}
        className={cn(
          'relative flex gap-md pb-8',
          orientation === 'horizontal' && 'flex-col',
          interactive && 'cursor-pointer group'
        )}
        onMouseEnter={() => setHoveredItem(itemId)}
        onMouseLeave={() => setHoveredItem(null)}
        onClick={() => onItemClick?.(row)}
      >
        {/* Timeline Connector */}
        {showConnectors && orientation === 'vertical' && !isLast && (
          <div
            className="absolute left-4 top-xl w-0.5 h-full bg-border -z-10"
            style={{ backgroundColor: color + '40' }}
          />
        )}

        {/* Timeline Node */}
        <div className="flex-shrink-0 relative">
          <div
            className={cn(
              'flex items-center justify-center w-icon-lg h-icon-lg rounded-full border-2 transition-all duration-200',
              'bg-background',
              isHovered && 'scale-110 shadow-md'
            )}
            style={{
              borderColor: color,
              backgroundColor: isHovered ? color + '20' : 'white'
            }}
          >
            {showIcons && <Icon className="w-icon-xs h-icon-xs" style={{ color }} />}
          </div>

          {/* Connector dot for periods */}
          {itemType === 'period' && endDate && (
            <div
              className="absolute top-xl left-3.5 w-1 h-icon-lg border-l-2 border-dashed"
              style={{ borderLeftColor: color }}
            />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <Card className={cn(
            'transition-all duration-200',
            isHovered && 'shadow-md ring-1 ring-primary/20'
          )}>
            <CardContent className="p-md">
              <div className="flex items-start justify-between gap-md">
                <div className="flex-1 min-w-0">
                  {/* Title and Date */}
                  <div className="flex items-center gap-xs mb-2">
                    <h3 className="font-semibold truncate">{title}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {itemType}
                    </Badge>
                  </div>

                  {/* Date/Time */}
                  <div className="flex items-center gap-md text-sm text-muted-foreground mb-2">
                    <div className="flex items-center gap-xs">
                      <Calendar className="h-icon-xs w-icon-xs" />
                      {format(date, 'MMM d, yyyy')}
                      {endDate && itemType === 'period' && (
                        <span> - {format(endDate, 'MMM d, yyyy')}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-xs">
                      <Clock className="h-icon-xs w-icon-xs" />
                      {format(date, 'h:mm a')}
                      {endDate && itemType === 'period' && (
                        <span> - {format(endDate, 'h:mm a')}</span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  {description && layout !== 'compact' && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-xs">
                      {description}
                    </p>
                  )}

                  {/* Metadata */}
                  <div className="flex flex-wrap items-center gap-sm text-sm">
                    {category && (
                      <Badge variant="secondary" className="text-xs">
                        <Tag className="h-3 w-3 mr-1" />
                        {category}
                      </Badge>
                    )}

                    {location && (
                      <div className="flex items-center gap-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate max-w-component-xl">{location}</span>
                      </div>
                    )}

                    {row[fieldMapping.assignee] && (
                      <div className="flex items-center gap-xs">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <Avatar className="h-icon-sm w-icon-sm">
                          <AvatarFallback className="text-xs">
                            {String(row[fieldMapping.assignee]).slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    )}

                    {tags.length > 0 && (
                      <div className="flex gap-xs">
                        {tags.slice(0, 3).map((tag, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-xs opacity-0 group-hover:opacity-100 transition-opacity">
                  {onItemEdit && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        onItemEdit(row);
                      }}
                    >
                      Edit
                    </Button>
                  )}
                  {onItemDelete && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        onItemDelete(row);
                      }}
                      className="text-destructive hover:text-destructive"
                    >
                      Delete
                    </Button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="ghost">
                        <MoreHorizontal className="h-icon-xs w-icon-xs" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onItemClick?.(row)}>
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Duplicate</DropdownMenuItem>
                      <DropdownMenuItem>Move</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }, [
    fieldMapping,
    orientation,
    showConnectors,
    showIcons,
    interactive,
    layout,
    hoveredItem,
    getItemType,
    getItemColor,
    getItemIcon,
    onItemClick,
    onItemEdit,
    onItemDelete
  ]);

  // Render date group
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const renderDateGroup = useCallback((dateKey: string, items: Record<string, unknown>[]) => {
    const isCollapsed = collapsedGroups.has(dateKey);
    const date = parseISO(dateKey);
    const isTodayGroup = isSameDay(date, new Date());

    return (
      <div key={dateKey} className="mb-8">
        {/* Date Header */}
        <div className="flex items-center gap-xs mb-4">
          <div className={cn(
            'flex items-center gap-xs px-sm py-xs rounded-full text-sm font-medium',
            isTodayGroup ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          )}>
            <Calendar className="h-icon-xs w-icon-xs" />
            {format(date, 'EEEE, MMMM d, yyyy')}
            {isTodayGroup && <Badge variant="secondary" className="text-xs">Today</Badge>}
          </div>

          {collapsible && items.length > 1 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => toggleGroupCollapse(dateKey)}
              className="h-icon-md w-icon-md p-0"
            >
              {isCollapsed ? <ChevronRight className="h-icon-xs w-icon-xs" /> : <ChevronDown className="h-icon-xs w-icon-xs" />}
            </Button>
          )}

          <span className="text-sm text-muted-foreground">
            {items.length} item{items.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Items */}
        {(!isCollapsed || items.length === 1) && (
          <div className="ml-6 space-y-lg">
            {items.map((row, index) =>
              renderTimelineItem(row, index, index === items.length - 1)
            )}
          </div>
        )}
      </div>
    );
  }, [collapsedGroups, collapsible, toggleGroupCollapse, renderTimelineItem]);

  return (
    <div className={cn('space-y-lg', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-xs">
          {/* Search */}
          {onGlobalSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-xs/2 transform -translate-y-1/2 h-icon-xs w-icon-xs text-muted-foreground" />
              <Input
                placeholder="Search timeline..."
                value={globalSearch}
                onChange={(e) => onGlobalSearch(e.target.value)}
                className="pl-9 w-container-sm"
              />
            </div>
          )}

          {/* Category Filter */}
          {filterable && onCategoryFilter && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="sm">
                  <Filter className="h-icon-xs w-icon-xs mr-1" />
                  Categories
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {Array.from(new Set(processedData.map(row => String(row[fieldMapping.category] || '')))).filter(Boolean).map((category) => (
                  <DropdownMenuItem
                    key={category}
                    onClick={() => {
                      const newFilter = categoryFilter.includes(category)
                        ? categoryFilter.filter(c => c !== category)
                        : [...categoryFilter, category];
                      onCategoryFilter(newFilter);
                    }}
                  >
                    <Circle className={cn(
                      'h-3 w-3 mr-2',
                      categoryFilter.includes(category) ? 'fill-current' : 'stroke-current opacity-50'
                    )} />
                    {category}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="flex items-center gap-xs">
          {/* Add Item */}
          {onAddItem && (
            <Button onClick={() => onAddItem()}>
              <Plus className="h-icon-xs w-icon-xs mr-1" />
              Add Item
            </Button>
          )}

          {/* Layout Toggle */}
          <div className="flex items-center border rounded-md">
            <Button
              variant={orientation === 'vertical' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => {/* Would implement orientation toggle */}}
              className="rounded-none"
            >
              Vertical
            </Button>
            <Button
              variant={orientation === 'horizontal' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => {/* Would implement orientation toggle */}}
              className="rounded-none"
            >
              Horizontal
            </Button>
          </div>
        </div>
      </div>

      {/* Timeline Content */}
      <div className={cn(
        orientation === 'horizontal' && 'flex overflow-x-auto pb-4',
        className
      )}>
        {loading ? (
          // Loading state
          <div className="space-y-lg">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex gap-md pb-8">
                <div className="w-icon-lg h-icon-lg bg-muted rounded-full animate-pulse" />
                <div className="flex-1">
                  <div className="h-component-lg bg-muted rounded-lg animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : processedData.length === 0 ? (
          // Empty state
          <div className="flex items-center justify-center py-xsxl">
            <div className="text-center">
              <div className="text-muted-foreground mb-2">{emptyMessage}</div>
              {onAddItem && (
                <Button onClick={() => onAddItem()}>
                  <Plus className="h-icon-xs w-icon-xs mr-1" />
                  Add First Item
                </Button>
              )}
            </div>
          </div>
        ) : groupByDate ? (
          // Grouped by date
          Object.entries(groupedData)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([dateKey, items]) => renderDateGroup(dateKey, items))
        ) : (
          // All items in single timeline
          <div className="space-y-lg">
            {processedData.map((row, index) =>
              renderTimelineItem(row, index, index === processedData.length - 1)
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export type { TimelineViewProps, TimelineFieldMapping, TimelineItemType };
