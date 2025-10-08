'use client';


import React, { useState, useCallback, useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Badge, Card, CardBody, CardContent } from '@ghxstship/ui';
import { Activity, Clock, User, FileText, Settings, Award, Calendar, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ActivityLog {
  id: string;
  action: string;
  category: string;
  details?;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

const categoryIcons: Record<string, React.ReactNode> = {
  profile: <User className="w-icon-xs h-icon-xs" />,
  document: <FileText className="w-icon-xs h-icon-xs" />,
  settings: <Settings className="w-icon-xs h-icon-xs" />,
  achievement: <Award className="w-icon-xs h-icon-xs" />,
  schedule: <Calendar className="w-icon-xs h-icon-xs" />,
  performance: <TrendingUp className="w-icon-xs h-icon-xs" />,
  default: <Activity className="w-icon-xs h-icon-xs" />
};

const categoryColors: Record<string, string> = {
  profile: 'bg-accent/10 color-accent',
  document: 'bg-secondary/10 color-secondary',
  settings: 'bg-secondary color-muted',
  achievement: 'bg-warning/10 color-warning',
  schedule: 'bg-success/10 color-success',
  performance: 'bg-warning/10 color-warning',
  default: 'bg-secondary color-muted'
};

export default function ActivityLogClient() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const supabase = createClient();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchActivities();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchActivities = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (filter !== 'all') {
        query = query.eq('category', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityDescription = (activity: ActivityLog): string => {
    switch (activity.action) {
      case 'profile_updated':
        return 'Updated profile information';
      case 'password_changed':
        return 'Changed password';
      case 'email_verified':
        return 'Verified email address';
      case 'certification_added':
        return `Added certification: ${activity.details?.name || 'New certification'}`;
      case 'certification_expired':
        return `Certification expired: ${activity.details?.name || 'Certification'}`;
      case 'emergency_contact_added':
        return 'Added emergency contact';
      case 'emergency_contact_updated':
        return 'Updated emergency contact';
      case 'health_info_updated':
        return 'Updated health information';
      case 'travel_preferences_updated':
        return 'Updated travel preferences';
      case 'uniform_sizing_updated':
        return 'Updated uniform sizing';
      case 'performance_review_acknowledged':
        return 'Acknowledged performance review';
      case 'goal_completed':
        return `Completed goal: ${activity.details?.title || 'Goal'}`;
      case 'achievement_earned':
        return `Earned achievement: ${activity.details?.title || 'Achievement'}`;
      case 'endorsement_received':
        return `Received endorsement from ${activity.details?.from || 'colleague'}`;
      case 'job_history_added':
        return `Added job history: ${activity.details?.company || 'Company'}`;
      case 'login':
        return 'Logged in';
      case 'logout':
        return 'Logged out';
      case 'session_expired':
        return 'Session expired';
      case 'two_factor_enabled':
        return 'Enabled two-factor authentication';
      case 'two_factor_disabled':
        return 'Disabled two-factor authentication';
      default:
        return activity.action.replace(/_/g, ' ');
    }
  };

  const groupActivitiesByDate = (activities: ActivityLog[]) => {
    const groups: Record<string, ActivityLog[]> = {};
    
    activities.forEach(activity => {
      const date = new Date(activity.created_at);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      let key: string;
      if (date.toDateString() === today.toDateString()) {
        key = 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        key = 'Yesterday';
      } else {
        key = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      }
      
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(activity);
    });
    
    return groups;
  };

  if (loading) {
    return (
      <div className="stack-md">
        {[1, 2, 3, 4, 5].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="h-component-lg" />
          </Card>
        ))}
      </div>
    );
  }

  const groupedActivities = groupActivitiesByDate(activities);
  const categories = ['all', 'profile', 'document', 'settings', 'achievement', 'schedule', 'performance'];

  return (
    <div className="stack-lg">
      <div>
        <h2 className="text-heading-3">Activity Log</h2>
        <p className="color-muted">Track your recent account activity</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-sm flex-wrap">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setFilter(category)}
            className={`px-md py-sm rounded-lg text-body-sm form-label transition-colors ${
              filter === category
                ? 'bg-accent color-accent-foreground'
                : 'bg-secondary hover:bg-secondary/80'
            }`}
          >
            {category === 'all' ? 'All Activity' : category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {activities.length === 0 ? (
        <Card>
          <CardContent className="text-center py-xsxl">
            <Activity className="w-icon-2xl h-icon-2xl mx-auto mb-md color-muted" />
            <p className="color-muted">No activity to display</p>
          </CardContent>
        </Card>
      ) : (
        <div className="stack-lg">
          {Object.entries(groupedActivities).map(([date, dateActivities]) => (
            <div key={date}>
              <h3 className="text-body-sm text-heading-4 color-muted mb-sm">{date}</h3>
              <div className="stack-sm">
                {dateActivities.map(activity => (
                  <Card key={activity.id} className="hover:shadow-surface transition-shadow">
                    <CardContent className="p-md">
                      <div className="flex items-start gap-sm">
                        <div className={`p-sm rounded-lg ${categoryColors[activity.category] || categoryColors.default}`}>
                          {categoryIcons[activity.category] || categoryIcons.default}
                        </div>
                        <div className="flex-1">
                          <p className="form-label">{getActivityDescription(activity)}</p>
                          <div className="flex items-center gap-md mt-xs">
                            <div className="flex items-center gap-xs text-body-sm color-muted">
                              <Clock className="w-3 h-3" />
                              <span>{formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}</span>
                            </div>
                            {activity.ip_address && (
                              <span className="text-body-sm color-muted">
                                IP: {activity.ip_address}
                              </span>
                            )}
                          </div>
                          {activity.details && Object.keys(activity.details).length > 0 && (
                            <div className="mt-sm p-sm bg-secondary rounded text-body-sm">
                              <pre className="whitespace-pre-wrap">
                                {JSON.stringify(activity.details, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                        <Badge variant="secondary">
                          {activity.category}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
