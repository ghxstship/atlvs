'use client';


import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
import { Card, Badge, Button } from '@ghxstship/ui';
import { 
  Activity, 
  Clock, 
  User, 
  Edit, 
  Trash2, 
  Eye,
  Filter,
  Calendar,
  Download
} from 'lucide-react';

interface ActivityRecord {
  id: string;
  activity_type: string;
  activity_description: string;
  performed_by: string;
  performed_by_name?: string;
  created_at: string;
  metadata?;
}

export default function ActivityClient({ orgId, userId }: { orgId: string; userId: string }) {
  const t = useTranslations('profile');
  const sb = createBrowserClient();
  
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadActivities();
  }, [orgId, userId, filter]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      
      let query = sb
        .from('user_profile_activity')
        .select(`
          *,
          performed_by_user:users!performed_by(full_name)
        `)
        .eq('organization_id', orgId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('activity_type', filter);
      }

      const { data, error } = await query.limit(50);

      if (error) throw error;

      const formattedActivities = (data || []).map(activity => ({
        ...activity,
        performed_by_name: activity.performed_by_user?.full_name || 'System'
      }));

      setActivities(formattedActivities);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    const icons = {
      profile_updated: Edit,
      profile_created: User,
      profile_viewed: Eye,
      certification_added: Badge,
      job_history_added: Activity,
      default: Activity
    };
    
    const IconComponent = icons[type as keyof typeof icons] || icons.default;
    return <IconComponent className="h-icon-xs w-icon-xs" />;
  };

  const getActivityColor = (type: string) => {
    const colors = {
      profile_updated: 'color-accent',
      profile_created: 'color-success',
      profile_viewed: 'color-muted',
      certification_added: 'color-secondary',
      job_history_added: 'color-warning',
      default: 'color-muted'
    };
    
    return colors[type as keyof typeof colors] || colors.default;
  };

  const formatActivityType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const exportActivities = () => {
    const csvContent = [
      ['Date', 'Activity Type', 'Description', 'Performed By'],
      ...activities.map(activity => [
        new Date(activity.created_at).toLocaleString(),
        formatActivityType(activity.activity_type),
        activity.activity_description,
        activity.performed_by_name || 'System'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `profile-activity-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="stack-md">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-component-md bg-secondary rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="stack-lg">
      {/* Header with filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-md">
          <h2 className="text-heading-4 text-heading-4">Activity Log</h2>
          <select
            value={filter}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilter(e.target.value)}
            className=" px-md py-xs border rounded-md text-body-sm"
          >
            <option value="all">All Activities</option>
            <option value="profile_updated">Profile Updates</option>
            <option value="profile_created">Profile Created</option>
            <option value="certification_added">Certifications</option>
            <option value="job_history_added">Job History</option>
          </select>
        </div>
        
        <Button
          variant="outline"
         
          onClick={exportActivities}
          className="flex items-center gap-sm"
        >
          <Download className="h-icon-xs w-icon-xs" />
          Export
        </Button>
      </div>

      {/* Activity Timeline */}
      <div className="stack-md">
        {activities.length > 0 ? (
          activities.map((activity, index) => (
            <Card key={activity.id}>
              <div className="p-md">
                <div className="flex items-start gap-md">
                  <div className={`p-sm rounded-full bg-secondary ${getActivityColor(activity.activity_type)}`}>
                    {getActivityIcon(activity.activity_type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-sm">
                      <div className="flex items-center gap-sm">
                        <h4 className="form-label">{activity.activity_description}</h4>
                        <Badge variant="secondary">
                          {formatActivityType(activity.activity_type)}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-sm text-body-sm color-muted">
                        <Clock className="h-icon-xs w-icon-xs" />
                        <span>{new Date(activity.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-sm text-body-sm color-muted">
                      <User className="h-icon-xs w-icon-xs" />
                      <span>by {activity.performed_by_name}</span>
                    </div>
                    
                    {activity.metadata && (
                      <div className="mt-sm p-sm bg-secondary/50 rounded text-body-sm">
                        <pre className="whitespace-pre-wrap">
                          {JSON.stringify(activity.metadata, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card>
            <div className="p-xl text-center">
              <Activity className="h-icon-2xl w-icon-2xl mx-auto mb-md color-muted opacity-50" />
              <h3 className="text-body form-label mb-sm">No Activity Found</h3>
              <p className="color-muted">
                {filter === 'all' 
                  ? 'No profile activity has been recorded yet.'
                  : `No ${formatActivityType(filter)} activities found.`
                }
              </p>
            </div>
          </Card>
        )}
      </div>

      {/* Load More */}
      {activities.length >= 50 && (
        <div className="text-center">
          <Button variant="outline" onClick={loadActivities}>
            Load More Activities
          </Button>
        </div>
      )}
    </div>
  );
}
