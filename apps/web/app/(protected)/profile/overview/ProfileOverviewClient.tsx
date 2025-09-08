'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
import { 
  Card, 
  Badge, 
  Button
} from '@ghxstship/ui';
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
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-32 bg-muted rounded-lg mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-48 bg-muted rounded-lg"></div>
            <div className="h-48 bg-muted rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <div className="flex items-start gap-6 p-6">
          <div className="relative">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
              {profile?.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt={profile.full_name || 'User'}
                  className="h-20 w-20 rounded-full object-cover"
                />
              ) : (
                <User className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <Button
              size="sm"
              variant="outline"
              className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
            >
              <Camera className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-bold">{profile?.full_name || 'Unknown User'}</h1>
              <Badge {...getStatusBadge(profile?.status || 'pending')}>
                {getStatusBadge(profile?.status || 'pending').label}
              </Badge>
            </div>
            
            <div className="space-y-2 text-sm text-muted-foreground">
              {profile?.job_title && (
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  <span>{profile.job_title}</span>
                  {profile.department && <span>• {profile.department}</span>}
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>{profile?.email}</span>
              </div>
              
              {profile?.phone_primary && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>{profile.phone_primary}</span>
                </div>
              )}
              
              {profile?.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{profile.location}</span>
                </div>
              )}
            </div>
          </div>
          
          <Button variant="outline" className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Edit Profile
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Completion */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Profile Completion</h3>
              <Badge variant={getCompletionColor(profile?.profile_completion_percentage || 0)}>
                {profile?.profile_completion_percentage || 0}%
              </Badge>
            </div>
            
            <div className="w-full bg-muted rounded-full h-2 mb-4">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${profile?.profile_completion_percentage || 0}%` }}
              ></div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Basic information completed</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <span>Add professional certifications</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <span>Complete job history</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Stats */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {profile?.certifications_count || 0}
                </div>
                <div className="text-sm text-muted-foreground">Certifications</div>
              </div>
              
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {profile?.job_history_count || 0}
                </div>
                <div className="text-sm text-muted-foreground">Job History</div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
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
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            
            {activities.length > 0 ? (
              <div className="space-y-3">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{activity.activity_description}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(activity.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
