import { Avatar } from "@ghxstship/ui";
'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@ghxstship/ui';
import { Badge } from '@ghxstship/ui';
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
        return 'bg-blue-100 text-blue-800';
      case 'people':
        return 'bg-green-100 text-green-800';
      case 'budgets':
      case 'expenses':
      case 'revenue':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
      <Card className="p-6 h-full">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-1">
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-2 bg-gray-200 rounded w-1/2"></div>
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
      <Card className="p-6 h-full">
        <div className="text-center">
          <p className="text-sm text-red-600 mb-2">Error loading activities</p>
          <p className="text-xs text-gray-500">{error}</p>
        </div>
      </Card>
    );
  }

  const groupedActivities = groupActivitiesByDate(activities);

  return (
    <Card className="p-6 h-full relative group">
      {/* Widget Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {(onEdit || onDelete) && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={onEdit}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
              aria-label="Edit widget"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Activity List */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {Object.entries(groupedActivities).map(([groupName, groupActivities]) => (
          <div key={groupName}>
            {config.groupByDate && (
              <h4 className="text-sm font-medium text-gray-500 mb-2">{groupName}</h4>
            )}
            <div className="space-y-3">
              {groupActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  {config.showAvatars && (
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-gray-500" />
                      </div>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.user_name}
                      </p>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${getModuleColor(activity.module)}`}
                      >
                        <span className="flex items-center space-x-1">
                          {getModuleIcon(activity.module)}
                          <span>{activity.module}</span>
                        </span>
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      {activity.description}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
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
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">No recent activity</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500 text-center">
          Showing last {Math.min(activities.length, config.maxItems)} activities
        </p>
      </div>
    </Card>
  );
}
