'use client';


import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
import { Card, Badge, Button } from '@ghxstship/ui';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Award, 
  Briefcase,
  Edit,
  Camera,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface ProfileOverview {
  id: string;
  user_id: string;
  avatar_url?: string;
  full_name: string;
  email: string;
  job_title?: string;
  department?: string;
  phone_primary?: string;
  location?: string;
  profile_completion_percentage: number;
  status: string;
  last_login?: string;
  created_at: string;
  certifications_count: number;
  job_history_count: number;
}

interface RecentActivity {
  id: string;
  activity_type: string;
  activity_description: string;
  created_at: string;
}

export default function ProfileOverviewClient({ orgId, userId }: { orgId: string; userId: string }) {
  const t = useTranslations('profile');
  const sb = createBrowserClient();
  
  const [profile, setProfile] = useState<ProfileOverview | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfileOverview();
    loadRecentActivity();
  }, [orgId, userId]);

  const loadProfileOverview = async () => {
    try {
      // Get user profile with aggregated data
      const { data: profileData, error: profileError } = await sb
        .from('user_profiles')
        .select(`
          *,
          user:users(full_name, email),
          certifications:certifications(count),
          job_history:job_history(count)
        `)
        .eq('organization_id', orgId)
        .eq('user_id', userId)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      if (profileData) {
        setProfile({
          ...profileData,
          full_name: profileData.user?.full_name || 'Unknown User',
          email: profileData.user?.email || '',
          certifications_count: profileData.certifications?.length || 0,
          job_history_count: profileData.job_history?.length || 0
        });
      }
    } catch (error) {
      console.error('Error loading profile overview:', error);
    }
  };

  const loadRecentActivity = async () => {
    try {
      const { data, error } = await sb
        .from('user_profile_activity')
        .select('*')
        .eq('organization_id', orgId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error loading recent activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 50) return 'warning';
    return 'destructive';
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { variant: 'success' as const, label: 'Active' },
      inactive: { variant: 'secondary' as const, label: 'Inactive' },
      pending: { variant: 'warning' as const, label: 'Pending' }
    };
    
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  };

  if (loading) {
    return (
      <div className="stack-lg">
        <div className="animate-pulse">
          <div className="h-component-xl bg-secondary rounded-lg mb-md"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div className="h-container-xs bg-secondary rounded-lg"></div>
            <div className="h-container-xs bg-secondary rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="stack-lg">
      {/* Profile Header */}
      <Card>
        <div className="flex items-start gap-lg p-lg">
          <div className="relative">
            <div className="h-component-lg w-component-lg rounded-full bg-secondary flex items-center justify-center">
              {profile?.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt={profile.full_name || 'User'}
                  className="h-component-lg w-component-lg rounded-full object-cover"
                />
              ) : (
                <User className="h-icon-lg w-icon-lg color-muted" />
              )}
            </div>
            <Button
             
              variant="outline"
              className="absolute -bottom-2 -right-2 h-icon-lg w-icon-lg rounded-full p-0"
            >
              <Camera className="h-icon-xs w-icon-xs" />
            </Button>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-sm">
              <h1 className="text-heading-3 text-heading-3">{profile?.full_name || 'Unknown User'}</h1>
              <Badge {...getStatusBadge(profile?.status || 'pending')}>
                {getStatusBadge(profile?.status || 'pending').label}
              </Badge>
            </div>
            
            <div className="stack-sm text-body-sm color-muted">
              {profile?.job_title && (
                <div className="flex items-center gap-sm">
                  <Briefcase className="h-icon-xs w-icon-xs" />
                  <span>{profile.job_title}</span>
                  {profile.department && <span>• {profile.department}</span>}
                </div>
              )}
              
              <div className="flex items-center gap-sm">
                <Mail className="h-icon-xs w-icon-xs" />
                <span>{profile?.email}</span>
              </div>
              
              {profile?.phone_primary && (
                <div className="flex items-center gap-sm">
                  <Phone className="h-icon-xs w-icon-xs" />
                  <span>{profile.phone_primary}</span>
                </div>
              )}
              
              {profile?.location && (
                <div className="flex items-center gap-sm">
                  <MapPin className="h-icon-xs w-icon-xs" />
                  <span>{profile.location}</span>
                </div>
              )}
            </div>
          </div>
          
          <Button variant="outline" className="flex items-center gap-sm">
            <Edit className="h-icon-xs w-icon-xs" />
            Edit Profile
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
        {/* Profile Completion */}
        <Card>
          <div className="p-lg">
            <div className="flex items-center justify-between mb-md">
              <h3 className="text-body text-heading-4">Profile Completion</h3>
              <Badge variant={getCompletionColor(profile?.profile_completion_percentage || 0)}>
                {profile?.profile_completion_percentage || 0}%
              </Badge>
            </div>
            
            <div className="w-full bg-secondary rounded-full h-2 mb-md">
              <div 
                className="bg-accent h-2 rounded-full transition-all duration-300" 
                style={{ width: `${profile?.profile_completion_percentage || 0}%` }}
              ></div>
            </div>
            
            <div className="stack-sm text-body-sm">
              <div className="flex items-center gap-sm color-muted">
                <CheckCircle className="h-icon-xs w-icon-xs color-success" />
                <span>Basic information completed</span>
              </div>
              <div className="flex items-center gap-sm color-muted">
                <AlertCircle className="h-icon-xs w-icon-xs color-warning" />
                <span>Add professional certifications</span>
              </div>
              <div className="flex items-center gap-sm color-muted">
                <AlertCircle className="h-icon-xs w-icon-xs color-warning" />
                <span>Complete job history</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Stats */}
        <Card>
          <div className="p-lg">
            <h3 className="text-body text-heading-4 mb-md">Quick Stats</h3>
            
            <div className="grid grid-cols-2 gap-md">
              <div className="text-center p-md bg-secondary/50 rounded-lg">
                <div className="text-heading-3 text-heading-3 color-accent">
                  {profile?.certifications_count || 0}
                </div>
                <div className="text-body-sm color-muted">Certifications</div>
              </div>
              
              <div className="text-center p-md bg-secondary/50 rounded-lg">
                <div className="text-heading-3 text-heading-3 color-success">
                  {profile?.job_history_count || 0}
                </div>
                <div className="text-body-sm color-muted">Job History</div>
              </div>
            </div>
            
            <div className="mt-md pt-md border-t">
              <div className="flex items-center gap-sm text-body-sm color-muted">
                <Calendar className="h-icon-xs w-icon-xs" />
                <span>
                  Member since {profile?.created_at ? 
                    new Date(profile.created_at).toLocaleDateString() : 'Unknown'
                  }
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="md:col-span-2">
          <div className="p-lg">
            <h3 className="text-body text-heading-4 mb-md">Recent Activity</h3>
            
            {activities.length > 0 ? (
              <div className="stack-sm">
                {activities.map((activity: any) => (
                  <div key={activity.id} className="flex items-center gap-sm p-sm bg-secondary/50 rounded-lg">
                    <div className="h-2 w-2 bg-accent rounded-full"></div>
                    <div className="flex-1">
                      <div className="text-body-sm form-label">{activity.activity_description}</div>
                      <div className="text-body-sm color-muted">
                        {new Date(activity.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-xl color-muted">
                <User className="h-icon-2xl w-icon-2xl mx-auto mb-sm opacity-50" />
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
