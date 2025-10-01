'use client';



import { useState, useEffect } from 'react';
import { Card, Button, Badge, Tabs, TabsContent, TabsList, TabsTrigger } from '@ghxstship/ui';
import { 
  Briefcase, DollarSign, Users, TrendingUp, Package, Clock, Star, 
  MessageSquare, FileText, Award, Target, Calendar, BarChart3,
  Building, Zap, Shield, Globe, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { createBrowserClient } from '@ghxstship/auth';
import { useTranslations } from 'next-intl';

interface DashboardProps {
  orgId: string;
  userId: string;
  userRole: 'vendor' | 'client' | 'both';
}

export default function OpenDeckDashboard({ orgId, userId, userRole }: DashboardProps) {
  const t = useTranslations('opendeck');
  const supabase = createBrowserClient();
  
  const [activeView, setActiveView] = useState<'vendor' | 'client'>(
    userRole === 'vendor' ? 'vendor' : 'client'
  );
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({
    vendor: {
      totalEarnings: 0,
      activeProjects: 0,
      completedProjects: 0,
      avgRating: 0,
      totalReviews: 0,
      responseRate: 0,
      profileViews: 0,
      proposalsSent: 0,
      successRate: 0
    },
    client: {
      totalSpent: 0,
      activeProjects: 0,
      completedProjects: 0,
      vendorsHired: 0,
      avgProjectValue: 0,
      totalSaved: 0,
      proposalsReceived: 0,
      avgCompletionTime: 0
    }
  });

  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [upcomingMilestones, setUpcomingMilestones] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, [orgId, userId, activeView]);

  async function loadDashboardData() {
    setLoading(true);
    try {
      // Load vendor profile if vendor view
      if (activeView === 'vendor') {
        const { data: vendorProfile } = await supabase
          .from('opendeck_vendor_profiles')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (vendorProfile) {
          // Load vendor stats
          const { data: contracts } = await supabase
            .from('opendeck_contracts')
            .select('*')
            .eq('vendor_id', vendorProfile.id);

          const { data: proposals } = await supabase
            .from('opendeck_proposals')
            .select('*')
            .eq('vendor_id', vendorProfile.id);

          const { data: reviews } = await supabase
            .from('opendeck_reviews')
            .select('*')
            .eq('reviewee_id', userId)
            .eq('status', 'published');

          // Calculate stats
          const activeContracts = contracts?.filter(c => c.status === 'active') || [];
          const completedContracts = contracts?.filter(c => c.status === 'completed') || [];
          const totalEarnings = completedContracts.reduce((sum, c) => sum + Number(c.total_amount), 0);
          const avgRating = reviews?.length ? 
            reviews.reduce((sum, r) => sum + r.overall_rating, 0) / reviews.length : 0;

          setStats((prev: any) => ({
            ...prev,
            vendor: {
              totalEarnings,
              activeProjects: activeContracts.length,
              completedProjects: completedContracts.length,
              avgRating: avgRating.toFixed(1),
              totalReviews: reviews?.length || 0,
              responseRate: 98, // Mock for now
              profileViews: vendorProfile.views || 0,
              proposalsSent: proposals?.length || 0,
              successRate: proposals?.length ? 
                (proposals.filter(p => p.status === 'accepted').length / proposals.length * 100).toFixed(0) : 0
            }
          }));
        }
      }

      // Load client stats
      if (activeView === 'client') {
        const { data: projects } = await supabase
          .from('opendeck_projects')
          .select('*')
          .eq('client_id', userId);

        const { data: contracts } = await supabase
          .from('opendeck_contracts')
          .select('*')
          .eq('client_id', userId);

        const activeProjects = projects?.filter(p => p.status === 'in_progress') || [];
        const completedProjects = projects?.filter(p => p.status === 'completed') || [];
        const totalSpent = contracts?.reduce((sum, c) => sum + Number(c.total_amount), 0) || 0;

        setStats((prev: any) => ({
          ...prev,
          client: {
            totalSpent,
            activeProjects: activeProjects.length,
            completedProjects: completedProjects.length,
            vendorsHired: new Set(contracts?.map(c => c.vendor_id)).size,
            avgProjectValue: contracts?.length ? totalSpent / contracts.length : 0,
            totalSaved: totalSpent * 0.15, // Mock savings
            proposalsReceived: 0, // Will calculate from proposals
            avgCompletionTime: 14 // Mock days
          }
        }));
      }

      // Load recent activity
      const { data: activityData } = await supabase
        .from('opendeck_analytics')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);
      
      setRecentActivity(activityData || []);

      // Load notifications
      const { data: notifs } = await supabase
        .from('opendeck_notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('read', false)
        .order('created_at', { ascending: false })
        .limit(5);
      
      setNotifications(notifs || []);

    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  }

  const VendorDashboard = () => (
    <div className="brand-opendeck stack-lg">
      {/* Key Metrics */}
      <div className="brand-opendeck grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
        <Card className="p-md">
          <div className="brand-opendeck flex items-center justify-between">
            <div>
              <p className="text-body-sm color-muted">Total Earnings</p>
              <p className="text-heading-3">${stats.vendor.totalEarnings.toLocaleString()}</p>
              <p className="text-body-sm color-success flex items-center mt-xs">
                <ArrowUpRight className="h-3 w-3 mr-xs" />
                +12% from last month
              </p>
            </div>
            <DollarSign className="h-icon-lg w-icon-lg color-success" />
          </div>
        </Card>

        <Card className="p-md">
          <div className="brand-opendeck flex items-center justify-between">
            <div>
              <p className="text-body-sm color-muted">Active Projects</p>
              <p className="text-heading-3">{stats.vendor.activeProjects}</p>
              <p className="text-body-sm color-muted mt-xs">
                {stats.vendor.completedProjects} completed
              </p>
            </div>
            <Briefcase className="h-icon-lg w-icon-lg color-accent" />
          </div>
        </Card>

        <Card className="p-md">
          <div className="brand-opendeck flex items-center justify-between">
            <div>
              <p className="text-body-sm color-muted">Average Rating</p>
              <div className="brand-opendeck flex items-center">
                <p className="text-heading-3 mr-sm">{stats.vendor.avgRating}</p>
                <Star className="h-icon-sm w-icon-sm color-warning fill-warning" />
              </div>
              <p className="text-body-sm color-muted mt-xs">
                {stats.vendor.totalReviews} reviews
              </p>
            </div>
            <Award className="h-icon-lg w-icon-lg color-warning" />
          </div>
        </Card>

        <Card className="p-md">
          <div className="brand-opendeck flex items-center justify-between">
            <div>
              <p className="text-body-sm color-muted">Success Rate</p>
              <p className="text-heading-3">{stats.vendor.successRate}%</p>
              <p className="text-body-sm color-muted mt-xs">
                {stats.vendor.proposalsSent} proposals sent
              </p>
            </div>
            <Target className="h-icon-lg w-icon-lg text-info" />
          </div>
        </Card>
      </div>

      {/* Performance Overview */}
      <div className="brand-opendeck grid grid-cols-1 lg:grid-cols-3 gap-lg">
        <Card className="lg:col-span-2 p-lg">
          <h3 className="text-body text-heading-4 mb-md">Earnings Overview</h3>
          <div className="brand-opendeck h-container-sm flex items-center justify-center border-2 border-dashed rounded-lg">
            <BarChart3 className="h-icon-2xl w-icon-2xl color-muted" />
            <span className="ml-sm color-muted">Chart will be rendered here</span>
          </div>
        </Card>

        <Card className="p-lg">
          <h3 className="text-body text-heading-4 mb-md">Quick Actions</h3>
          <div className="brand-opendeck stack-sm">
            <Button variant="outline" className="w-full justify-start">
              <Package className="h-icon-xs w-icon-xs mr-sm" />
              Create New Service
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <FileText className="h-icon-xs w-icon-xs mr-sm" />
              Browse Projects
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <MessageSquare className="h-icon-xs w-icon-xs mr-sm" />
              View Messages
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Users className="h-icon-xs w-icon-xs mr-sm" />
              Update Portfolio
            </Button>
          </div>
        </Card>
      </div>

      {/* Active Projects & Upcoming Milestones */}
      <div className="brand-opendeck grid grid-cols-1 lg:grid-cols-2 gap-lg">
        <Card className="p-lg">
          <h3 className="text-body text-heading-4 mb-md">Active Projects</h3>
          <div className="brand-opendeck stack-sm">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center justify-between p-sm border rounded-lg">
                <div>
                  <p className="form-label">Event Production Setup</p>
                  <p className="text-body-sm color-muted">Due in 3 days</p>
                </div>
                <Badge variant="secondary">In Progress</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-lg">
          <h3 className="text-body text-heading-4 mb-md">Recent Reviews</h3>
          <div className="brand-opendeck stack-sm">
            {[1, 2, 3].map(i => (
              <div key={i} className="p-sm border rounded-lg">
                <div className="brand-opendeck flex items-center mb-sm">
                  <div className="brand-opendeck flex">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star key={star} className="h-icon-xs w-icon-xs color-warning fill-warning" />
                    ))}
                  </div>
                  <span className="ml-sm text-body-sm color-muted">2 days ago</span>
                </div>
                <p className="text-body-sm">"Excellent work on the lighting setup. Professional and timely."</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  const ClientDashboard = () => (
    <div className="brand-opendeck stack-lg">
      {/* Key Metrics */}
      <div className="brand-opendeck grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
        <Card className="p-md">
          <div className="brand-opendeck flex items-center justify-between">
            <div>
              <p className="text-body-sm color-muted">Total Spent</p>
              <p className="text-heading-3">${stats.client.totalSpent.toLocaleString()}</p>
              <p className="text-body-sm color-success flex items-center mt-xs">
                <ArrowDownRight className="h-3 w-3 mr-xs" />
                -8% from budget
              </p>
            </div>
            <DollarSign className="h-icon-lg w-icon-lg color-accent" />
          </div>
        </Card>

        <Card className="p-md">
          <div className="brand-opendeck flex items-center justify-between">
            <div>
              <p className="text-body-sm color-muted">Active Projects</p>
              <p className="text-heading-3">{stats.client.activeProjects}</p>
              <p className="text-body-sm color-muted mt-xs">
                {stats.client.completedProjects} completed
              </p>
            </div>
            <Briefcase className="h-icon-lg w-icon-lg text-info" />
          </div>
        </Card>

        <Card className="p-md">
          <div className="brand-opendeck flex items-center justify-between">
            <div>
              <p className="text-body-sm color-muted">Vendors Hired</p>
              <p className="text-heading-3">{stats.client.vendorsHired}</p>
              <p className="text-body-sm color-muted mt-xs">
                Across all projects
              </p>
            </div>
            <Users className="h-icon-lg w-icon-lg color-success" />
          </div>
        </Card>

        <Card className="p-md">
          <div className="brand-opendeck flex items-center justify-between">
            <div>
              <p className="text-body-sm color-muted">Avg Completion</p>
              <p className="text-heading-3">{stats.client.avgCompletionTime}d</p>
              <p className="text-body-sm color-success flex items-center mt-xs">
                <Zap className="h-3 w-3 mr-xs" />
                2 days faster
              </p>
            </div>
            <Clock className="h-icon-lg w-icon-lg color-warning" />
          </div>
        </Card>
      </div>

      {/* Project Management */}
      <div className="brand-opendeck grid grid-cols-1 lg:grid-cols-3 gap-lg">
        <Card className="lg:col-span-2 p-lg">
          <h3 className="text-body text-heading-4 mb-md">Project Timeline</h3>
          <div className="brand-opendeck h-container-sm flex items-center justify-center border-2 border-dashed rounded-lg">
            <Calendar className="h-icon-2xl w-icon-2xl color-muted" />
            <span className="ml-sm color-muted">Timeline will be rendered here</span>
          </div>
        </Card>

        <Card className="p-lg">
          <h3 className="text-body text-heading-4 mb-md">Quick Actions</h3>
          <div className="brand-opendeck stack-sm">
            <Button variant="outline" className="w-full justify-start">
              <FileText className="h-icon-xs w-icon-xs mr-sm" />
              Post New Project
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Users className="h-icon-xs w-icon-xs mr-sm" />
              Browse Vendors
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Package className="h-icon-xs w-icon-xs mr-sm" />
              View Services
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <MessageSquare className="h-icon-xs w-icon-xs mr-sm" />
              Messages
            </Button>
          </div>
        </Card>
      </div>

      {/* Active Projects & Proposals */}
      <div className="brand-opendeck grid grid-cols-1 lg:grid-cols-2 gap-lg">
        <Card className="p-lg">
          <h3 className="text-body text-heading-4 mb-md">Active Projects</h3>
          <div className="brand-opendeck stack-sm">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center justify-between p-sm border rounded-lg">
                <div>
                  <p className="form-label">Music Festival Setup</p>
                  <p className="text-body-sm color-muted">3 vendors assigned</p>
                </div>
                <Badge variant="secondary">In Progress</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-lg">
          <h3 className="text-body text-heading-4 mb-md">Recent Proposals</h3>
          <div className="brand-opendeck stack-sm">
            {[1, 2, 3].map(i => (
              <div key={i} className="p-sm border rounded-lg">
                <div className="brand-opendeck flex items-center justify-between mb-sm">
                  <p className="form-label">Stage Design Services</p>
                  <Badge variant="outline">New</Badge>
                </div>
                <p className="text-body-sm color-muted">$5,000 - 7 days delivery</p>
                <div className="brand-opendeck flex items-center mt-sm">
                  <Star className="h-icon-xs w-icon-xs color-warning fill-warning" />
                  <span className="ml-xs text-body-sm">4.8 rating</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="brand-opendeck stack-lg">
      {/* Dashboard Toggle */}
      {userRole === 'both' && (
        <div className="brand-opendeck flex items-center justify-between">
          <h2 className="text-heading-3">OPENDECK Dashboard</h2>
          <Tabs value={activeView} onValueChange={(v: any) => setActiveView(v as 'vendor' | 'client')}>
            <TabsList>
              <TabsTrigger value="vendor">
                <Building className="h-icon-xs w-icon-xs mr-sm" />
                Vendor Dashboard
              </TabsTrigger>
              <TabsTrigger value="client">
                <Briefcase className="h-icon-xs w-icon-xs mr-sm" />
                Client Dashboard
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      )}

      {/* Notifications Bar */}
      {notifications.length > 0 && (
        <Card className="p-md bg-info/5 border-info/20">
          <div className="brand-opendeck flex items-center justify-between">
            <div className="brand-opendeck flex items-center">
              <Shield className="h-icon-sm w-icon-sm text-info mr-sm" />
              <span className="text-body-sm">
                You have {notifications.length} new notifications
              </span>
            </div>
            <Button>View All</Button>
          </div>
        </Card>
      )}

      {/* Main Dashboard Content */}
      {loading ? (
        <div className="brand-opendeck flex items-center justify-center h-container-sm">
          <div className="brand-opendeck animate-spin rounded-full h-icon-lg w-icon-lg border-b-2 border-primary"></div>
        </div>
      ) : (
        activeView === 'vendor' ? <VendorDashboard /> : <ClientDashboard />
      )}
    </div>
  );
}
