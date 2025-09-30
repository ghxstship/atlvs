'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/atomic/Button';
import { Skeleton } from '../../components/atomic/Skeleton';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '../../components/DropdownMenu';
import { 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash, 
  Copy,
  Clock,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { formatDate, formatRelativeTime } from '../../utils/formatters';
import type { UnifiedService } from '../services/UnifiedService';
import type { FieldConfig } from '../drawers/UnifiedDrawer';

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  date: Date;
  endDate?: Date;
  status?: string;
  priority?: string;
  category?: string;
  color?: string;
  data: any;
}

export interface UnifiedTimelineViewProps {
  service: UnifiedService<any>;
  fields: FieldConfig[];
  data?: any[];
  loading?: boolean;
  onItemClick?: (item: any) => void;
  onItemAction?: (action: string, item: any) => void;
  customActions?: Array<{
    id: string;
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick: (item: any) => void;
    condition?: (item: any) => boolean;
  }>;
  emptyState?: React.ReactNode;
  dateField?: string;
  endDateField?: string;
  titleField?: string;
  descriptionField?: string;
  statusField?: string;
  categoryField?: string;
  groupBy?: 'day' | 'week' | 'month' | 'year';
  showMilestones?: boolean;
  compact?: boolean;
}

export const UnifiedTimelineView: React.FC<UnifiedTimelineViewProps> = ({
  service,
  fields,
  data: externalData,
  loading: externalLoading,
  onItemClick,
  onItemAction,
  customActions = [],
  emptyState,
  dateField = 'created_at',
  endDateField = 'end_date',
  titleField = 'title',
  descriptionField = 'description',
  statusField = 'status',
  categoryField = 'category',
  groupBy = 'day',
  showMilestones = true,
  compact = false,
}) => {
  const [data, setData] = useState<any[]>(externalData || []);
  const [loading, setLoading] = useState(externalLoading || false);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [zoomLevel, setZoomLevel] = useState<'day' | 'week' | 'month' | 'year'>(groupBy);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Load data if not provided externally
  useEffect(() => {
    if (!externalData && service) {
      loadData();
    } else if (externalData) {
      setData(externalData);
    }
  }, [externalData, service, currentDate, zoomLevel]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load data for the current time range
      const { start, end } = getTimeRange(currentDate, zoomLevel);
      
      const result = await service.list({
        limit: 1000,
        filters: {
          [dateField]: {
            operator: 'gte',
            value: start.toISOString()
          },
          [`${dateField}_end`]: {
            operator: 'lte',
            value: end.toISOString()
          }
        },
        orderBy: `${dateField}.asc`
      });
      setData(result.data);
    } catch (err: any) {
      setError(err.message);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Convert data to timeline items
  const timelineItems = useMemo(() => {
    return data
      .filter(item => {
        // Filter by selected categories
        if (selectedCategories.length > 0 && categoryField) {
          return selectedCategories.includes(item[categoryField]);
        }
        return true;
      })
      .map(item => {
        const date = new Date(item[dateField]);
        const endDate = item[endDateField] ? new Date(item[endDateField]) : null;
        const title = item[titleField] || item.name || 'Untitled';
        const description = item[descriptionField];
        const status = item[statusField];
        const priority = item.priority;
        const category = item[categoryField];
        const color = getItemColor(item);
        
        return {
          id: item.id,
          title,
          description,
          date,
          endDate,
          status,
          priority,
          category,
          color,
          data: item
        } as TimelineItem;
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [data, selectedCategories, dateField, endDateField, titleField, descriptionField, statusField, categoryField]);

  // Group items by time period
  const groupedItems = useMemo(() => {
    const groups: Record<string, TimelineItem[]> = {};
    
    timelineItems.forEach(item => {
      const groupKey = getGroupKey(item.date, zoomLevel);
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
    });
    
    return groups;
  }, [timelineItems, zoomLevel]);

  // Get unique categories for filtering
  const categories = useMemo(() => {
    if (!categoryField) return [];
    const cats = [...new Set(data.map(item => item[categoryField]).filter(Boolean))];
    return cats.sort();
  }, [data, categoryField]);

  const navigate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    
    switch (zoomLevel) {
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
      case 'year':
        newDate.setFullYear(newDate.getFullYear() + (direction === 'next' ? 1 : -1));
        break;
    }
    
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const renderTimelineItem = (item: TimelineItem, index: number) => {
    const isEven = index % 2 === 0;
    const duration = item.endDate ? item.endDate.getTime() - item.date.getTime() : 0;
    const isMilestone = duration === 0 || !item.endDate;
    
    return (
      <div 
        key={item.id}
        className={`
          relative flex items-center gap-md mb-lg
          ${isEven ? 'flex-row' : 'flex-row-reverse'}
        `}
      >
        {/* Timeline Line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border -translate-x-1/2 -z-10" />
        
        {/* Timeline Node */}
        <div className={`
          absolute left-1/2 top-4 -translate-x-1/2 z-10
          ${isMilestone ? 'w-4 h-4 rounded-full' : 'w-6 h-3 rounded-sm'}
          ${item.color ? `bg-${item.color}-500 border-${item.color}-600` : 'bg-primary border-primary-600'}
          border-2 bg-background
        `} />
        
        {/* Content */}
        <Card 
          className={`
            w-[calc(50%-2rem)] cursor-pointer hover:shadow-lg transition-all group
            ${isEven ? 'mr-auto' : 'ml-auto'}
            ${compact ? 'p-sm' : ''}
          `}
          onClick={() => onItemClick?.(item.data)}
        >
          <CardHeader className={compact ? 'pb-xs' : 'pb-sm'}>
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <CardTitle className={`${compact ? 'text-sm' : 'text-base'} font-medium truncate`}>
                  {item.title}
                </CardTitle>
                <div className={`flex items-center gap-xs mt-xs ${compact ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
                  <Clock className="h-3 w-3" />
                  <span>{formatDate(item.date, true)}</span>
                  {item.endDate && (
                    <>
                      <span>→</span>
                      <span>{formatDate(item.endDate, true)}</span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-xs ml-sm">
                {item.status && (
                  <Badge variant={getStatusVariant(item.status)} className="text-xs">
                    {item.status}
                  </Badge>
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100">
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onItemAction?.('view', item.data)}>
                      <Eye className="mr-xs h-4 w-4" />
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onItemAction?.('edit', item.data)}>
                      <Edit className="mr-xs h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onItemAction?.('duplicate', item.data)}>
                      <Copy className="mr-xs h-4 w-4" />
                      Duplicate
                    </DropdownMenuItem>
                    
                    {customActions.length > 0 && <DropdownMenuSeparator />}
                    
                    {customActions.map(action => {
                      if (action.condition && !action.condition(item.data)) return null;
                      return (
                        <DropdownMenuItem 
                          key={action.id}
                          onClick={() => action.onClick(item.data)}
                        >
                          {action.icon && <action.icon className="mr-xs h-4 w-4" />}
                          {action.label}
                        </DropdownMenuItem>
                      );
                    })}
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem 
                      onClick={() => onItemAction?.('delete', item.data)}
                      className="text-destructive"
                    >
                      <Trash className="mr-xs h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          
          {item.description && (
            <CardContent className={compact ? 'pt-0' : 'pt-0'}>
              <p className={`${compact ? 'text-xs' : 'text-sm'} text-muted-foreground line-clamp-2`}>
                {item.description}
              </p>
            </CardContent>
          )}
          
          {/* Additional metadata */}
          <CardContent className="pt-xs">
            <div className="flex items-center gap-xs">
              {item.priority && (
                <Badge variant={getPriorityVariant(item.priority)} className="text-xs">
                  {item.priority}
                </Badge>
              )}
              {item.category && (
                <Badge variant="outline" className="text-xs">
                  {item.category}
                </Badge>
              )}
              {duration > 0 && (
                <span className="text-xs text-muted-foreground">
                  {formatDuration(duration)}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Date Label */}
        <div className={`
          w-24 text-center
          ${isEven ? 'order-first' : 'order-last'}
        `}>
          <div className={`${compact ? 'text-xs' : 'text-sm'} font-medium`}>
            {formatGroupLabel(item.date, zoomLevel)}
          </div>
          <div className="text-xs text-muted-foreground">
            {formatRelativeTime(item.date)}
          </div>
        </div>
      </div>
    );
  };

  if (loading || externalLoading) {
    return (
      <div className="space-y-md">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-sm">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
        
        <div className="space-y-lg">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="relative flex items-center gap-md">
              <div className="w-24">
                <Skeleton className="h-4 w-16 mb-xs" />
                <Skeleton className="h-3 w-12" />
              </div>
              <Card className="flex-1 max-w-md">
                <CardHeader>
                  <Skeleton className="h-5 w-3/4 mb-xs" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-xs" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-lg">
        <div className="text-center">
          <p className="text-destructive mb-sm">Error loading timeline data</p>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button onClick={loadData} className="mt-md">
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  if (timelineItems.length === 0) {
    return (
      emptyState || (
        <Card className="p-xl">
          <div className="text-center">
            <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-md" />
            <p className="text-muted-foreground mb-sm">No timeline items found</p>
            <p className="text-sm text-muted-foreground">
              Create your first item to see it on the timeline
            </p>
          </div>
        </Card>
      )
    );
  }

  return (
    <div className="space-y-md">
      {/* Timeline Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-md">
          <h2 className="text-2xl font-semibold">
            {formatTimelineTitle(currentDate, zoomLevel)}
          </h2>
          
          <div className="flex items-center gap-xs">
            <Button variant="outline" size="sm" onClick={() => navigate('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-sm">
          {/* Zoom Controls */}
          <div className="flex items-center border rounded-md">
            {(['day', 'week', 'month', 'year'] as const).map(zoom => (
              <Button
                key={zoom}
                variant={zoomLevel === zoom ? 'default' : 'ghost'}
                size="sm"
                className="rounded-none first:rounded-l-md last:rounded-r-md"
                onClick={() => setZoomLevel(zoom)}
              >
                {zoom.charAt(0).toUpperCase() + zoom.slice(1)}
              </Button>
            ))}
          </div>
          
          {/* Category Filter */}
          {categories.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-xs" />
                  Categories
                  {selectedCategories.length > 0 && (
                    <Badge variant="secondary" className="ml-xs">
                      {selectedCategories.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {categories.map(category => (
                  <DropdownMenuItem
                    key={category}
                    onClick={() => toggleCategory(category)}
                  >
                    <div className="flex items-center gap-xs">
                      <div className={`w-3 h-3 rounded border ${selectedCategories.includes(category) ? 'bg-primary' : ''}`} />
                      {category}
                    </div>
                  </DropdownMenuItem>
                ))}
                {selectedCategories.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setSelectedCategories([])}>
                      Clear All
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {timelineItems.length > 0 && (
          <div className="space-y-0">
            {timelineItems.map((item, index) => renderTimelineItem(item, index))}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper functions
function getTimeRange(date: Date, zoomLevel: string) {
  const start = new Date(date);
  const end = new Date(date);
  
  switch (zoomLevel) {
    case 'day':
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'week':
      start.setDate(start.getDate() - start.getDay());
      start.setHours(0, 0, 0, 0);
      end.setDate(end.getDate() + (6 - end.getDay()));
      end.setHours(23, 59, 59, 999);
      break;
    case 'month':
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(end.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'year':
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(11, 31);
      end.setHours(23, 59, 59, 999);
      break;
  }
  
  return { start, end };
}

function getGroupKey(date: Date, zoomLevel: string): string {
  switch (zoomLevel) {
    case 'day':
      return date.toDateString();
    case 'week':
      const weekStart = new Date(date);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      return `Week of ${weekStart.toDateString()}`;
    case 'month':
      return `${date.getFullYear()}-${date.getMonth()}`;
    case 'year':
      return date.getFullYear().toString();
    default:
      return date.toDateString();
  }
}

function formatGroupLabel(date: Date, zoomLevel: string): string {
  switch (zoomLevel) {
    case 'day':
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    case 'week':
      return `Week ${getWeekNumber(date)}`;
    case 'month':
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    case 'year':
      return date.getFullYear().toString();
    default:
      return formatDate(date);
  }
}

function formatTimelineTitle(date: Date, zoomLevel: string): string {
  switch (zoomLevel) {
    case 'day':
      return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    case 'week':
      const weekStart = new Date(date);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    case 'month':
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    case 'year':
      return date.getFullYear().toString();
    default:
      return formatDate(date);
  }
}

function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

function getItemColor(item: any): string {
  if (item.status) {
    const status = item.status.toLowerCase();
    if (['completed', 'done', 'success'].includes(status)) return 'green';
    if (['in_progress', 'active'].includes(status)) return 'blue';
    if (['pending', 'draft'].includes(status)) return 'yellow';
    if (['cancelled', 'failed'].includes(status)) return 'red';
  }
  
  if (item.priority) {
    const priority = item.priority.toLowerCase();
    if (['high', 'critical'].includes(priority)) return 'red';
    if (priority === 'medium') return 'yellow';
    if (priority === 'low') return 'green';
  }
  
  return 'blue';
}

function getStatusVariant(status: string): any {
  const lowercased = status?.toLowerCase();
  if (['completed', 'done', 'success'].includes(lowercased)) return 'success';
  if (['in_progress', 'active'].includes(lowercased)) return 'default';
  if (['pending', 'draft'].includes(lowercased)) return 'warning';
  if (['cancelled', 'failed'].includes(lowercased)) return 'destructive';
  return 'secondary';
}

function getPriorityVariant(priority: string): any {
  switch (priority?.toLowerCase()) {
    case 'critical':
    case 'high':
      return 'destructive';
    case 'medium':
      return 'warning';
    case 'low':
      return 'secondary';
    default:
      return 'default';
  }
}

function formatDuration(ms: number): string {
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${minutes}m`;
  }
}

export default UnifiedTimelineView;
