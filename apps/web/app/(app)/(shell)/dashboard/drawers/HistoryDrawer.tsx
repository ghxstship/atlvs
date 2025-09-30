'use client';

import React, { useState, useMemo } from 'react';
import {
  X,
  Clock,
  User,
  Edit,
  Trash2,
  Plus,
  Eye,
  Download,
  Upload,
  Settings,
  AlertTriangle,
  CheckCircle,
  Info,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  Filter,
  Search
} from 'lucide-react';
import { Button } from '@ghxstship/ui';
import { Badge } from '@ghxstship/ui';
import { Separator } from '@ghxstship/ui';
import { ScrollArea } from '@ghxstship/ui';
import { Input } from '@ghxstship/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ghxstship/ui';
import { Avatar, AvatarFallback, AvatarImage } from '@ghxstship/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@ghxstship/ui';
import { Card, CardContent } from '@ghxstship/ui';
import { cn } from '@ghxstship/ui/lib/utils';
import { format, formatDistanceToNow, isToday, isYesterday, isThisWeek, isThisMonth } from 'date-fns';

// Activity Types
export type ActivityType =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'viewed'
  | 'exported'
  | 'imported'
  | 'shared'
  | 'commented'
  | 'assigned'
  | 'status_changed'
  | 'field_changed'
  | 'bulk_operation'
  | 'system_action';

// Activity Entry
export interface ActivityEntry {
  id: string;
  type: ActivityType;
  description: string;
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  timestamp: Date;
  entityId?: string;
  entityType?: string;
  changes?: Array<{
    field: string;
    oldValue: unknown;
    newValue: unknown;
    fieldLabel?: string;
  }>;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

// Activity Filter
export interface ActivityFilter {
  type?: ActivityType[];
  user?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  entityType?: string[];
}

// History Drawer Props
export interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activities: ActivityEntry[];
  loading?: boolean;
  title?: string;
  subtitle?: string;
  width?: 'sm' | 'md' | 'lg' | 'xl';

  // Actions
  onRevertActivity?: (activityId: string) => Promise<void>;
  onViewActivityDetails?: (activity: ActivityEntry) => void;
  onExportActivities?: (filter: ActivityFilter) => Promise<void>;

  // Filtering
  showFilters?: boolean;
  availableUsers?: Array<{ id: string; name: string; email: string }>;
  availableEntityTypes?: string[];

  // Grouping
  groupBy?: 'none' | 'day' | 'week' | 'month' | 'user' | 'type';
  showGrouping?: boolean;

  // Display Options
  showUserInfo?: boolean;
  showTimestamps?: boolean;
  showChanges?: boolean;
  maxActivities?: number;
  compact?: boolean;
}

// History Drawer Component
export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  activities,
  loading = false,
  title,
  subtitle,
  width = 'lg',

  // Actions
  onRevertActivity,
  onViewActivityDetails,
  onExportActivities,

  // Filtering
  showFilters = true,
  availableUsers = [],
  availableEntityTypes = [],

  // Grouping
  groupBy = 'day',
  showGrouping = true,

  // Display Options
  showUserInfo = true,
  showTimestamps = true,
  showChanges = true,
  maxActivities = 100,
  compact = false
}) => {
  const [filter, setFilter] = useState<ActivityFilter>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedActivities, setExpandedActivities] = useState<Set<string>(new Set());
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>(new Set());

  // Filter and search activities
  const filteredActivities = useMemo(() => {
    return activities
      .filter(activity => {
        // Type filter
        if (filter.type?.length && !filter.type.includes(activity.type)) {
          return false;
        }

        // User filter
        if (filter.user?.length && (!activity.user || !filter.user.includes(activity.user.id))) {
          return false;
        }

        // Entity type filter
        if (filter.entityType?.length && (!activity.entityType || !filter.entityType.includes(activity.entityType))) {
          return false;
        }

        // Date range filter
        if (filter.dateRange) {
          const activityDate = activity.timestamp;
          if (activityDate < filter.dateRange.start || activityDate > filter.dateRange.end) {
            return false;
          }
        }

        // Search filter
        if (searchQuery) {
          const searchTerm = searchQuery.toLowerCase();
          const searchableText = [
            activity.description,
            activity.user?.name,
            activity.user?.email,
            activity.type,
            activity.entityType
          ].filter(Boolean).join(' ').toLowerCase();

          if (!searchableText.includes(searchTerm)) {
            return false;
          }
        }

        return true;
      })
      .slice(0, maxActivities);
  }, [activities, filter, searchQuery, maxActivities]);

  // Group activities
  const groupedActivities = useMemo(() => {
    if (groupBy === 'none') {
      return { 'All Activities': filteredActivities };
    }

    const groups: Record<string, ActivityEntry[]> = {};

    filteredActivities.forEach(activity => {
      let groupKey = '';

      switch (groupBy) {
        case 'day':
          if (isToday(activity.timestamp)) groupKey = 'Today';
          else if (isYesterday(activity.timestamp)) groupKey = 'Yesterday';
          else if (isThisWeek(activity.timestamp)) groupKey = 'This Week';
          else if (isThisMonth(activity.timestamp)) groupKey = 'This Month';
          else groupKey = format(activity.timestamp, 'MMMM d, yyyy');
          break;

        case 'week':
          groupKey = `Week of ${format(activity.timestamp, 'MMM d, yyyy')}`;
          break;

        case 'month':
          groupKey = format(activity.timestamp, 'MMMM yyyy');
          break;

        case 'user':
          groupKey = activity.user?.name || 'System';
          break;

        case 'type':
          groupKey = activity.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
          break;

        default:
          groupKey = 'All Activities';
      }

      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(activity);
    });

    return groups;
  }, [filteredActivities, groupBy]);

  // Handle filter change
  const handleFilterChange = (key: keyof ActivityFilter, value: unknown) => {
    setFilter(prev => ({ ...prev, [key]: value }));
  };

  // Toggle activity expansion
  const toggleActivityExpansion = (activityId: string) => {
    setExpandedActivities(prev => {
      const newSet = new Set(prev);
      if (newSet.has(activityId)) {
        newSet.delete(activityId);
      } else {
        newSet.add(activityId);
      }
      return newSet;
    });
  };

  // Toggle group collapse
  const toggleGroupCollapse = (groupKey: string) => {
    setCollapsedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupKey)) {
        newSet.delete(groupKey);
      } else {
        newSet.add(groupKey);
      }
      return newSet;
    });
  };

  // Get activity icon
  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'created': return Plus;
      case 'updated': return Edit;
      case 'deleted': return Trash2;
      case 'viewed': return Eye;
      case 'exported': return Download;
      case 'imported': return Upload;
      case 'shared': return User;
      case 'commented': return Eye;
      case 'assigned': return User;
      case 'status_changed': return Settings;
      case 'field_changed': return Edit;
      case 'bulk_operation': return Settings;
      case 'system_action': return Settings;
      default: return Clock;
    }
  };

  // Get activity color
  const getActivityColor = (type: ActivityType) => {
    switch (type) {
      case 'created': return 'text-green-600';
      case 'updated': return 'text-blue-600';
      case 'deleted': return 'text-red-600';
      case 'viewed': return 'text-gray-600';
      case 'exported': return 'text-purple-600';
      case 'imported': return 'text-purple-600';
      case 'shared': return 'text-orange-600';
      case 'commented': return 'text-blue-600';
      case 'assigned': return 'text-green-600';
      case 'status_changed': return 'text-yellow-600';
      case 'field_changed': return 'text-blue-600';
      case 'bulk_operation': return 'text-purple-600';
      case 'system_action': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  // Drawer width classes
  const widthClasses = {
    sm: 'w-96',
    md: 'w-[32rem]',
    lg: 'w-[40rem]',
    xl: 'w-[48rem]'
  };

  // Render activity item
  const renderActivityItem = (activity: ActivityEntry, isLast: boolean) => {
    const Icon = getActivityIcon(activity.type);
    const iconColor = getActivityColor(activity.type);
    const isExpanded = expandedActivities.has(activity.id);
    const hasChanges = activity.changes && activity.changes.length > 0;
    const canRevert = onRevertActivity && ['updated', 'deleted', 'field_changed'].includes(activity.type);

    return (
      <div key={activity.id} className="relative">
        {/* Timeline line */}
        {!isLast && (
          <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-border" />
        )}

        <div className="flex gap-4 pb-6">
          {/* Timeline dot */}
          <div className="flex-shrink-0 relative">
            <div className={cn(
              'flex items-center justify-center w-8 h-8 rounded-full border-2 bg-background',
              iconColor.replace('text-', 'border-')
            )}>
              <Icon className={cn('h-4 w-4', iconColor)} />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Description */}
                    <p className="text-sm font-medium mb-2">{activity.description}</p>

                    {/* User and timestamp */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                      {showUserInfo && activity.user && (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={activity.user.avatar} />
                            <AvatarFallback>
                              {activity.user.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span>{activity.user.name}</span>
                        </div>
                      )}

                      {showTimestamps && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatDistanceToNow(activity.timestamp, { addSuffix: true })}</span>
                          <span className="text-muted-foreground/50">•</span>
                          <span>{format(activity.timestamp, 'MMM d, yyyy h:mm a')}</span>
                        </div>
                      )}
                    </div>

                    {/* Entity info */}
                    {(activity.entityId || activity.entityType) && (
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {activity.entityType}
                        </Badge>
                        {activity.entityId && (
                          <code className="text-xs bg-muted px-1 py-0.5 rounded">
                            {activity.entityId.slice(0, 8)}...
                          </code>
                        )}
                      </div>
                    )}

                    {/* Changes */}
                    {showChanges && hasChanges && (
                      <div className="mt-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleActivityExpansion(activity.id)}
                          className="p-0 h-auto text-xs"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronDown className="h-3 w-3 mr-1" />
                              Hide Changes
                            </>
                          ) : (
                            <>
                              <ChevronRight className="h-3 w-3 mr-1" />
                              Show Changes ({activity.changes!.length})
                            </>
                          )}
                        </Button>

                        {isExpanded && (
                          <div className="mt-2 space-y-1">
                            {activity.changes!.map((change, idx) => (
                              <div key={idx} className="text-xs bg-muted p-2 rounded">
                                <span className="font-medium">{change.fieldLabel || change.field}:</span>
                                <span className="text-red-600 line-through ml-2">{String(change.oldValue || '—')}</span>
                                <span className="text-green-600 ml-2">{String(change.newValue || '—')}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {onViewActivityDetails && (
                          <DropdownMenuItem onClick={() => onViewActivityDetails(activity)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                        )}
                        {canRevert && (
                          <DropdownMenuItem
                            onClick={() => onRevertActivity?.(activity.id)}
                            className="text-orange-600"
                          >
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            Revert Change
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  // Render activity group
  const renderActivityGroup = (groupName: string, groupActivities: ActivityEntry[]) => {
    const isCollapsed = collapsedGroups.has(groupName);

    return (
      <div key={groupName} className="mb-6">
        {/* Group header */}
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-lg font-medium">{groupName}</h3>
          <Badge variant="secondary">{groupActivities.length}</Badge>
          {showGrouping && groupBy !== 'none' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleGroupCollapse(groupName)}
              className="h-6 w-6 p-0"
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          )}
        </div>

        {/* Group activities */}
        {(!isCollapsed || groupBy === 'none') && (
          <div className="ml-6 space-y-0">
            {groupActivities.map((activity, index) =>
              renderActivityItem(activity, index === groupActivities.length - 1)
            )}
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex justify-end">
      <div className={cn(
        'bg-background shadow-xl transform transition-transform duration-300 ease-in-out',
        'flex flex-col h-full',
        widthClasses[width]
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-semibold truncate">
              {title || 'Activity History'}
            </h2>
            {subtitle && (
              <p className="text-sm text-muted-foreground truncate mt-1">{subtitle}</p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline">
                {filteredActivities.length} activities
              </Badge>
              {groupBy !== 'none' && (
                <Badge variant="outline">
                  Grouped by {groupBy}
                </Badge>
              )}
            </div>
          </div>

          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="p-4 border-b space-y-3">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Select
                value={filter.type?.[0] || ''}
                onValueChange={(value) => handleFilterChange('type', value ? [value as ActivityType] : undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="created">Created</SelectItem>
                  <SelectItem value="updated">Updated</SelectItem>
                  <SelectItem value="deleted">Deleted</SelectItem>
                  <SelectItem value="viewed">Viewed</SelectItem>
                  <SelectItem value="exported">Exported</SelectItem>
                  <SelectItem value="imported">Imported</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filter.user?.[0] || ''}
                onValueChange={(value) => handleFilterChange('user', value ? [value] : undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by user" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Users</SelectItem>
                  {availableUsers.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {onExportActivities && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExportActivities(filter)}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Export History
              </Button>
            )}
          </div>
        )}

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="p-6">
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="flex gap-4 pb-6">
                    <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
                    <div className="flex-1">
                      <div className="h-16 bg-muted rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredActivities.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <div className="text-muted-foreground mb-2">No activities found</div>
                  <div className="text-sm text-muted-foreground">
                    {activities.length === 0 ? 'No activity history available' : 'Try adjusting your filters'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-0">
                {Object.entries(groupedActivities).map(([groupName, groupActivities]) =>
                  renderActivityGroup(groupName, groupActivities)
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export type { HistoryDrawerProps, ActivityEntry, ActivityType, ActivityFilter };
