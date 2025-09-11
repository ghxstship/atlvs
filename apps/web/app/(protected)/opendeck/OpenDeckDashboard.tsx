'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Badge, Tabs, TabsContent, TabsList, TabsTrigger } from '@ghxstship/ui';
import { StandardButton, animationPresets } from '../components/ui';
import { 
  Briefcase, DollarSign, Users, TrendingUp, Package, Clock, Star, 
  MessageSquare, FileText, Award, Target, Calendar, BarChart3,
  Building2, Zap, Shield, Globe, ArrowUpRight, ArrowDownRight
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
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Earnings</p>
              <p className="text-2xl font-bold">${stats.vendor.totalEarnings.toLocaleString()}</p>
              <p className="text-xs text-success flex items-center mt-1">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +12% from last month
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-success" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Projects</p>
              <p className="text-2xl font-bold">{stats.vendor.activeProjects}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.vendor.completedProjects} completed
              </p>
            </div>
            <Briefcase className="h-8 w-8 text-primary" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Average Rating</p>
              <div className="flex items-center">
                <p className="text-2xl font-bold mr-2">{stats.vendor.avgRating}</p>
                <Star className="h-5 w-5 text-warning fill-warning" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.vendor.totalReviews} reviews
              </p>
            </div>
            <Award className="h-8 w-8 text-warning" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Success Rate</p>
              <p className="text-2xl font-bold">{stats.vendor.successRate}%</p>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.vendor.proposalsSent} proposals sent
              </p>
            </div>
            <Target className="h-8 w-8 text-info" />
          </div>
        </Card>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <h3 className="text-lg font-semibold mb-4">Earnings Overview</h3>
          <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg">
            <BarChart3 className="h-12 w-12 text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Chart will be rendered here</span>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Package className="h-4 w-4 mr-2" />
              Create New Service
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <FileText className="h-4 w-4 mr-2" />
              Browse Projects
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <MessageSquare className="h-4 w-4 mr-2" />
              View Messages
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Users className="h-4 w-4 mr-2" />
              Update Portfolio
            </Button>
          </div>
        </Card>
      </div>

      {/* Active Projects & Upcoming Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Active Projects</h3>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Event Production Setup</p>
                  <p className="text-sm text-muted-foreground">Due in 3 days</p>
                </div>
                <Badge variant="secondary">In Progress</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Reviews</h3>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="p-3 border rounded-lg">
                <div className="flex items-center mb-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star key={star} className="h-4 w-4 text-warning fill-warning" />
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-muted-foreground">2 days ago</span>
                </div>
                <p className="text-sm">"Excellent work on the lighting setup. Professional and timely."</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  const ClientDashboard = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Spent</p>
              <p className="text-2xl font-bold">${stats.client.totalSpent.toLocaleString()}</p>
              <p className="text-xs text-success flex items-center mt-1">
                <ArrowDownRight className="h-3 w-3 mr-1" />
                -8% from budget
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-primary" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Projects</p>
              <p className="text-2xl font-bold">{stats.client.activeProjects}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.client.completedProjects} completed
              </p>
            </div>
            <Briefcase className="h-8 w-8 text-info" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Vendors Hired</p>
              <p className="text-2xl font-bold">{stats.client.vendorsHired}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Across all projects
              </p>
            </div>
            <Users className="h-8 w-8 text-success" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Completion</p>
              <p className="text-2xl font-bold">{stats.client.avgCompletionTime}d</p>
              <p className="text-xs text-success flex items-center mt-1">
                <Zap className="h-3 w-3 mr-1" />
                2 days faster
              </p>
            </div>
            <Clock className="h-8 w-8 text-warning" />
          </div>
        </Card>
      </div>

      {/* Project Management */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <h3 className="text-lg font-semibold mb-4">Project Timeline</h3>
          <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg">
            <Calendar className="h-12 w-12 text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Timeline will be rendered here</span>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <FileText className="h-4 w-4 mr-2" />
              Post New Project
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Users className="h-4 w-4 mr-2" />
              Browse Vendors
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Package className="h-4 w-4 mr-2" />
              View Services
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <MessageSquare className="h-4 w-4 mr-2" />
              Messages
            </Button>
          </div>
        </Card>
      </div>

      {/* Active Projects & Proposals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Active Projects</h3>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Music Festival Setup</p>
                  <p className="text-sm text-muted-foreground">3 vendors assigned</p>
                </div>
                <Badge variant="secondary">In Progress</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Proposals</h3>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">Stage Design Services</p>
                  <Badge variant="outline">New</Badge>
                </div>
                <p className="text-sm text-muted-foreground">$5,000 - 7 days delivery</p>
                <div className="flex items-center mt-2">
                  <Star className="h-4 w-4 text-warning fill-warning" />
                  <span className="ml-1 text-sm">4.8 rating</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Dashboard Toggle */}
      {userRole === 'both' && (
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">OPENDECK Dashboard</h2>
          <Tabs value={activeView} onValueChange={(v) => setActiveView(v as 'vendor' | 'client')}>
            <TabsList>
              <TabsTrigger value="vendor">
                <Building2 className="h-4 w-4 mr-2" />
                Vendor Dashboard
              </TabsTrigger>
              <TabsTrigger value="client">
                <Briefcase className="h-4 w-4 mr-2" />
                Client Dashboard
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      )}

      {/* Notifications Bar */}
      {notifications.length > 0 && (
        <Card className="p-4 bg-info/5 border-info/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-info mr-2" />
              <span className="text-sm">
                You have {notifications.length} new notifications
              </span>
            </div>
            <Button>View All</Button>
          </div>
        </Card>
      )}

      {/* Main Dashboard Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        activeView === 'vendor' ? <VendorDashboard /> : <ClientDashboard />
      )}
    </div>
  );
}
