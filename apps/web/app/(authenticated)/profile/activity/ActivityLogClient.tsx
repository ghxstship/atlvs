'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, Badge } from '@ghxstship/ui';
import { Activity, Clock, User, FileText, Settings, Award, Calendar, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ActivityLog {
  id: string;
  action: string;
  category: string;
  details?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

const categoryIcons: Record<string, React.ReactNode> = {
  profile: <User className="w-4 h-4" />,
  document: <FileText className="w-4 h-4" />,
  settings: <Settings className="w-4 h-4" />,
  achievement: <Award className="w-4 h-4" />,
  schedule: <Calendar className="w-4 h-4" />,
  performance: <TrendingUp className="w-4 h-4" />,
  default: <Activity className="w-4 h-4" />,
};

const categoryColors: Record<string, string> = {
  profile: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  document: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
  settings: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
  achievement: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  schedule: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  performance: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
  default: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
};

export default function ActivityLogClient() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const supabase = createClient();

  useEffect(() => {
    fetchActivities();
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
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="h-20" />
          </Card>
        ))}
      </div>
    );
  }

  const groupedActivities = groupActivitiesByDate(activities);
  const categories = ['all', 'profile', 'document', 'settings', 'achievement', 'schedule', 'performance'];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Activity Log</h2>
        <p className="text-muted-foreground">Track your recent account activity</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setFilter(category)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === category
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            {category === 'all' ? 'All Activity' : category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {activities.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No activity to display</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedActivities).map(([date, dateActivities]) => (
            <div key={date}>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">{date}</h3>
              <div className="space-y-2">
                {dateActivities.map(activity => (
                  <Card key={activity.id} className="hover:shadow-sm transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${categoryColors[activity.category] || categoryColors.default}`}>
                          {categoryIcons[activity.category] || categoryIcons.default}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{getActivityDescription(activity)}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              <span>{formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}</span>
                            </div>
                            {activity.ip_address && (
                              <span className="text-xs text-muted-foreground">
                                IP: {activity.ip_address}
                              </span>
                            )}
                          </div>
                          {activity.details && Object.keys(activity.details).length > 0 && (
                            <div className="mt-2 p-2 bg-muted rounded text-xs">
                              <pre className="whitespace-pre-wrap">
                                {JSON.stringify(activity.details, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs">
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
