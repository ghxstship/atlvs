'use client';

import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { createBrowserClient } from '@ghxstship/auth';
import { 
  Card, 
  Button, 
  Badge, 
  Skeleton,
  StateManagerProvider
} from '@ghxstship/ui';
import { 
  Building2,
  Users,
  FileText,
  Award,
  Star,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  Eye
} from 'lucide-react';

interface OverviewClientProps {
  user: User;
  orgId: string;
  translations: {
    title: string;
    subtitle: string;
  };
}

interface CompanyStats {
  totalCompanies: number;
  activeCompanies: number;
  pendingCompanies: number;
  blacklistedCompanies: number;
  totalContracts: number;
  activeContracts: number;
  expiringContracts: number;
  totalQualifications: number;
  expiringQualifications: number;
  averageRating: number;
  totalRatings: number;
}

interface RecentActivity {
  id: string;
  type: 'company_added' | 'contract_signed' | 'qualification_verified' | 'rating_submitted';
  companyName: string;
  description: string;
  timestamp: string;
  user: string;
}

export default function OverviewClient({ user, orgId, translations }: OverviewClientProps) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<CompanyStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [topRatedCompanies, setTopRatedCompanies] = useState<any[]>([]);

  const supabase = createBrowserClient();

  useEffect(() => {
    loadOverviewData();
  }, [orgId]);

  const loadOverviewData = async () => {
    try {
      setLoading(true);
      
      // Load companies stats
      const { data: companies } = await supabase
        .from('companies')
        .select('status')
        .eq('organization_id', orgId);

      // Load contracts stats  
      const { data: contracts } = await supabase
        .from('company_contracts')
        .select('status, end_date')
        .eq('organization_id', orgId);

      // Load qualifications stats
      const { data: qualifications } = await supabase
        .from('company_qualifications')
        .select('status, expiry_date')
        .eq('organization_id', orgId);

      // Load ratings stats
      const { data: ratings } = await supabase
        .from('company_ratings')
        .select('rating, company_id')
        .eq('organization_id', orgId);

      // Calculate stats
      const companyStats: CompanyStats = {
        totalCompanies: companies?.length || 0,
        activeCompanies: companies?.filter(c => c.status === 'active').length || 0,
        pendingCompanies: companies?.filter(c => c.status === 'pending').length || 0,
        blacklistedCompanies: companies?.filter(c => c.status === 'blacklisted').length || 0,
        totalContracts: contracts?.length || 0,
        activeContracts: contracts?.filter(c => c.status === 'active').length || 0,
        expiringContracts: contracts?.filter(c => {
          if (!c.end_date) return false;
          const endDate = new Date(c.end_date);
          const thirtyDaysFromNow = new Date();
          thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
          return endDate <= thirtyDaysFromNow;
        }).length || 0,
        totalQualifications: qualifications?.length || 0,
        expiringQualifications: qualifications?.filter(q => {
          if (!q.expiry_date) return false;
          const expiryDate = new Date(q.expiry_date);
          const thirtyDaysFromNow = new Date();
          thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
          return expiryDate <= thirtyDaysFromNow;
        }).length || 0,
        averageRating: ratings?.length ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length : 0,
        totalRatings: ratings?.length || 0
      };

      setStats(companyStats);

      // Load recent activity (mock data for now)
      setRecentActivity([
        {
          id: '1',
          type: 'company_added',
          companyName: 'Stellar Construction Co.',
          description: 'New company added to directory',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          user: 'John Doe'
        },
        {
          id: '2',
          type: 'contract_signed',
          companyName: 'TechFlow Solutions',
          description: 'Master Service Agreement signed',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          user: 'Jane Smith'
        },
        {
          id: '3',
          type: 'qualification_verified',
          companyName: 'Global Logistics Inc.',
          description: 'ISO 9001 certification verified',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          user: 'Mike Johnson'
        }
      ]);

      // Load top rated companies (mock data for now)
      setTopRatedCompanies([
        { name: 'Stellar Construction Co.', rating: 4.8, reviewCount: 24 },
        { name: 'TechFlow Solutions', rating: 4.6, reviewCount: 18 },
        { name: 'Global Logistics Inc.', rating: 4.4, reviewCount: 12 }
      ]);

    } catch (error) {
      console.error('Error loading overview data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'company_added':
        return <Building2 className="h-4 w-4 text-blue-500" />;
      case 'contract_signed':
        return <FileText className="h-4 w-4 text-green-500" />;
      case 'qualification_verified':
        return <Award className="h-4 w-4 text-purple-500" />;
      case 'rating_submitted':
        return <Star className="h-4 w-4 text-yellow-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-6 w-24 mb-4" />
              <Skeleton className="h-4 w-20" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <StateManagerProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{translations.title}</h1>
            <p className="text-sm text-foreground/70 mt-1">{translations.subtitle}</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={() => window.location.href = '/companies/directory'}>
              <Eye className="h-4 w-4 mr-2" />
              View Directory
            </Button>
            <Button onClick={() => window.location.href = '/companies'}>
              <Plus className="h-4 w-4 mr-2" />
              Add Company
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground/70">Total Companies</p>
                <p className="text-2xl font-bold text-foreground">{stats?.totalCompanies || 0}</p>
                <p className="text-xs text-green-600">{stats?.activeCompanies || 0} active</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-500" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground/70">Active Contracts</p>
                <p className="text-2xl font-bold text-green-600">{stats?.activeContracts || 0}</p>
                <p className="text-xs text-foreground/60">of {stats?.totalContracts || 0} total</p>
              </div>
              <FileText className="h-8 w-8 text-green-500" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground/70">Qualifications</p>
                <p className="text-2xl font-bold text-purple-600">{stats?.totalQualifications || 0}</p>
                {(stats?.expiringQualifications || 0) > 0 && (
                  <p className="text-xs text-orange-600">{stats?.expiringQualifications} expiring soon</p>
                )}
              </div>
              <Award className="h-8 w-8 text-purple-500" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground/70">Average Rating</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats?.averageRating ? stats.averageRating.toFixed(1) : 'N/A'}
                </p>
                <p className="text-xs text-foreground/60">{stats?.totalRatings || 0} reviews</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </Card>
        </div>

        {/* Alerts Section */}
        {((stats?.expiringContracts || 0) > 0 || (stats?.expiringQualifications || 0) > 0 || (stats?.pendingCompanies || 0) > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(stats?.expiringContracts || 0) > 0 && (
              <Card className="p-4 border-orange-200 bg-orange-50">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="font-medium text-orange-800">Contracts Expiring</p>
                    <p className="text-sm text-orange-600">{stats?.expiringContracts} contracts expire within 30 days</p>
                  </div>
                </div>
              </Card>
            )}
            
            {(stats?.expiringQualifications || 0) > 0 && (
              <Card className="p-4 border-red-200 bg-red-50">
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="font-medium text-red-800">Qualifications Expiring</p>
                    <p className="text-sm text-red-600">{stats?.expiringQualifications} qualifications expire within 30 days</p>
                  </div>
                </div>
              </Card>
            )}
            
            {(stats?.pendingCompanies || 0) > 0 && (
              <Card className="p-4 border-blue-200 bg-blue-50">
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium text-blue-800">Pending Reviews</p>
                    <p className="text-sm text-blue-600">{stats?.pendingCompanies} companies need review</p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
              <Button variant="ghost" size="sm">View All</Button>
            </div>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  {getActivityIcon(activity.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{activity.companyName}</p>
                    <p className="text-sm text-foreground/70">{activity.description}</p>
                    <p className="text-xs text-foreground/50 mt-1">
                      {formatTimeAgo(activity.timestamp)} by {activity.user}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Top Rated Companies */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Top Rated Companies</h3>
              <Button variant="ghost" size="sm">View All Ratings</Button>
            </div>
            <div className="space-y-4">
              {topRatedCompanies.map((company, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{company.name}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex items-center space-x-1">
                        {renderStars(company.rating)}
                      </div>
                      <span className="text-sm text-foreground/70">{company.rating}</span>
                      <span className="text-xs text-foreground/50">({company.reviewCount} reviews)</span>
                    </div>
                  </div>
                  <Badge variant="secondary">#{index + 1}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col" onClick={() => window.location.href = '/companies'}>
              <Building2 className="h-6 w-6 mb-2" />
              <span className="text-sm">Add Company</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col" onClick={() => window.location.href = '/companies/contracts'}>
              <FileText className="h-6 w-6 mb-2" />
              <span className="text-sm">New Contract</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col" onClick={() => window.location.href = '/companies/qualifications'}>
              <Award className="h-6 w-6 mb-2" />
              <span className="text-sm">Add Qualification</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col" onClick={() => window.location.href = '/companies/ratings'}>
              <Star className="h-6 w-6 mb-2" />
              <span className="text-sm">Submit Rating</span>
            </Button>
          </div>
        </Card>
      </div>
    </StateManagerProvider>
  );
}
