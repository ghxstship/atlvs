'use client';

import React, { useState, useEffect } from 'react';
import { Card, Badge } from '@ghxstship/ui';
import { MoreHorizontal, Clock, User, FileText, DollarSign, Users } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface ActivityWidgetProps {
  id: string;
  title: string;
  config: {
    dataSources: string[];
    maxItems: number;
    showAvatars: boolean;
    groupByDate: boolean;
    includeModules: string[];
    refreshInterval: number;
  };
  organizationId: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

interface ActivityItem {
  id: string;
  action: string;
  user_name: string;
  user_email: string;
  module: string;
  description: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export default function ActivityWidget({ 
  id, 
  title, 
  config, 
  organizationId, 
  onEdit, 
  onDelete 
}: ActivityWidgetProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function fetchActivityData() {
      try {
        setLoading(true);
        
        // Fetch activity data from audit logs
        const { data: auditData, error } = await supabase
          .from('audit_logs')
          .select(`
            *,
            user:users(full_name, email)
          `)
          .eq('organization_id', organizationId)
          .in('table_name', config.includeModules)
          .order('occurred_at', { ascending: false })
          .limit(config.maxItems);

        if (error) throw error;

        // Transform audit data to activity items
        const activityItems: ActivityItem[] = (auditData || []).map(log => ({
          id: log.id,
          action: log.action,
          user_name: log.user?.full_name || 'Unknown User',
          user_email: log.user?.email || '',
          module: log.table_name,
          description: generateActivityDescription(log),
          timestamp: new Date(log.occurred_at),
          metadata: log.new_values || log.old_values
        }));

        setActivities(activityItems);
      } catch (err) {
        console.error('Error fetching activity data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load activities');
      } finally {
        setLoading(false);
      }
    }

    fetchActivityData();

    // Set up real-time subscription for activity updates
    const subscription = supabase
      .channel(`activity-widget-${id}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'audit_logs',
          filter: `organization_id=eq.${organizationId}`
        }, 
        () => {
          fetchActivityData();
        }
      )
      .subscribe();

    // Set up refresh interval
    const interval = setInterval(fetchActivityData, config.refreshInterval * 1000);

    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, [id, config, organizationId, supabase]);

  const generateActivityDescription = (log: any): string => {
    const action = log.action;
    const tableName = log.table_name;
    const recordName = log.new_values?.name || log.old_values?.name || 'record';

    switch (action) {
      case 'INSERT':
        return `Created ${tableName.slice(0, -1)} "${recordName}"`;
      case 'UPDATE':
        return `Updated ${tableName.slice(0, -1)} "${recordName}"`;
      case 'DELETE':
        return `Deleted ${tableName.slice(0, -1)} "${recordName}"`;
      default:
        return `${action} ${tableName.slice(0, -1)} "${recordName}"`;
    }
  };

  const getModuleIcon = (module: string) => {
    switch (module) {
      case 'projects':
        return <FileText className="h-4 w-4" />;
      case 'people':
        return <Users className="h-4 w-4" />;
      case 'budgets':
      case 'expenses':
      case 'revenue':
        return <DollarSign className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getModuleColor = (module: string) => {
    switch (module) {
      case 'projects':
        return 'bg-primary/10 color-primary';
      case 'people':
        return 'bg-success/10 color-success';
      case 'budgets':
      case 'expenses':
      case 'revenue':
        return 'bg-warning/10 color-warning';
      default:
        return 'bg-secondary color-muted';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return timestamp.toLocaleDateString();
  };

  const groupActivitiesByDate = (activities: ActivityItem[]) => {
    if (!config.groupByDate) return { 'Recent Activity': activities };

    return activities.reduce((groups, activity) => {
      const date = activity.timestamp.toDateString();
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();

      let groupKey = date;
      if (date === today) groupKey = 'Today';
      else if (date === yesterday) groupKey = 'Yesterday';

      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(activity);
      return groups;
    }, {} as Record<string, ActivityItem[]>);
  };

  if (loading) {
    return (
      <Card className="p-lg h-full">
        <div className="animate-pulse">
          <div className="h-4 bg-secondary/50 rounded w-3/4 mb-md"></div>
          <div className="stack-sm">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center cluster-sm">
                <div className="h-8 w-8 bg-secondary/50 rounded-full"></div>
                <div className="flex-1 stack-xs">
                  <div className="h-3 bg-secondary/50 rounded w-3/4"></div>
                  <div className="h-2 bg-secondary/50 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-lg h-full">
        <div className="text-center">
          <p className="text-body-sm color-destructive mb-sm">Error loading activities</p>
          <p className="text-body-sm color-muted">{error}</p>
        </div>
      </Card>
    );
  }

  const groupedActivities = groupActivitiesByDate(activities);

  return (
    <Card className="p-lg h-full relative group">
      {/* Widget Header */}
      <div className="flex items-center justify-between mb-md">
        <h3 className="text-body text-heading-4">{title}</h3>
        {(onEdit || onDelete) && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={onEdit}
              className="p-xs color-muted hover:color-foreground rounded"
              aria-label="Edit widget"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Activity List */}
      <div className="stack-md max-h-96 overflow-y-auto">
        {Object.entries(groupedActivities).map(([groupName, groupActivities]) => (
          <div key={groupName}>
            {config.groupByDate && (
              <h4 className="text-body-sm form-label color-muted mb-sm">{groupName}</h4>
            )}
            <div className="stack-sm">
              {groupActivities.map((activity) => (
                <div key={activity.id} className="flex items-start cluster-sm">
                  {config.showAvatars && (
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 bg-secondary/50 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 color-muted" />
                      </div>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center cluster-sm mb-xs">
                      <p className="text-body-sm form-label truncate">
                        {activity.user_name}
                      </p>
                      <Badge 
                        variant="secondary" 
                        className={`text-body-sm ${getModuleColor(activity.module)}`}
                      >
                        <span className="flex items-center cluster-xs">
                          {getModuleIcon(activity.module)}
                          <span>{activity.module}</span>
                        </span>
                      </Badge>
                    </div>
                    <p className="text-body-sm color-muted mb-xs">
                      {activity.description}
                    </p>
                    <div className="flex items-center cluster-sm text-body-sm color-muted">
                      <Clock className="h-3 w-3" />
                      <span>{formatTimestamp(activity.timestamp)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {activities.length === 0 && (
          <div className="text-center py-xl">
            <p className="text-body-sm color-muted">No recent activity</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-md pt-md border-t border-border">
        <p className="text-body-sm color-muted text-center">
          Showing last {Math.min(activities.length, config.maxItems)} activities
        </p>
      </div>
    </Card>
  );
}
