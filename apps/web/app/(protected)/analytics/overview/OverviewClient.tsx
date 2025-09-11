'use client';

import { useState, useEffect } from 'react';
import { Card, Badge, Button } from '@ghxstship/ui';
import { createBrowserClient } from '@ghxstship/auth';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar,
  Activity,
  Target,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';

interface AnalyticsMetric {
  id: string;
  title: string;
  value: string;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: any;
  description: string;
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  user: string;
}

interface TopPerformer {
  id: string;
  name: string;
  category: string;
  value: string;
  change: number;
}

interface OverviewClientProps {
  organizationId: string;
  translations: Record<string, string>;
}

export default function OverviewClient({ organizationId, translations }: OverviewClientProps) {
  const [metrics, setMetrics] = useState<AnalyticsMetric[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createBrowserClient();

  useEffect(() => {
    loadOverviewData();
  }, [organizationId]);

  const loadOverviewData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load analytics metrics from various tables
      const [
        projectsData,
        peopleData,
        financeData,
        eventsData
      ] = await Promise.all([
        supabase.from('projects').select('*').eq('organization_id', organizationId),
        supabase.from('people').select('*').eq('organization_id', organizationId),
        supabase.from('finance_transactions').select('*').eq('organization_id', organizationId),
        supabase.from('events').select('*').eq('organization_id', organizationId)
      ]);

      // Calculate metrics
      const totalProjects = projectsData.data?.length || 0;
      const activeProjects = projectsData.data?.filter((p: any) => p.status === 'active').length || 0;
      const totalPeople = peopleData.data?.length || 0;
      const totalRevenue = financeData.data?.filter((t: any) => t.type === 'income').reduce((sum: number, t: any) => sum + (t.amount || 0), 0) || 0;
      const totalEvents = eventsData.data?.length || 0;

      const calculatedMetrics: AnalyticsMetric[] = [
        {
          id: '1',
          title: 'Active Projects',
          value: activeProjects.toString(),
          change: 12.5,
          changeType: 'increase',
          icon: Target,
          description: `${totalProjects} total projects`
        },
        {
          id: '2',
          title: 'Team Members',
          value: totalPeople.toString(),
          change: 8.2,
          changeType: 'increase',
          icon: Users,
          description: 'Active team members'
        },
        {
          id: '3',
          title: 'Revenue',
          value: `$${(totalRevenue / 1000).toFixed(1)}k`,
          change: 15.3,
          changeType: 'increase',
          icon: DollarSign,
          description: 'Total revenue this period'
        },
        {
          id: '4',
          title: 'Events',
          value: totalEvents.toString(),
          change: -2.1,
          changeType: 'decrease',
          icon: Calendar,
          description: 'Scheduled events'
        }
      ];

      setMetrics(calculatedMetrics);

      // Load recent activity (mock data for now)
      const mockActivity: RecentActivity[] = [
        {
          id: '1',
          type: 'project_created',
          description: 'New project "Blackwater Reverb" created',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          user: 'Captain Jack Sparrow'
        },
        {
          id: '2',
          type: 'team_member_added',
          description: 'Elizabeth Swann joined the crew',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          user: 'Will Turner'
        },
        {
          id: '3',
          type: 'invoice_paid',
          description: 'Invoice #INV-001 marked as paid',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
          user: 'Hector Barbossa'
        },
        {
          id: '4',
          type: 'event_scheduled',
          description: 'Main Deck Performance scheduled',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
          user: 'Joshamee Gibbs'
        }
      ];

      setRecentActivity(mockActivity);

      // Load top performers (mock data)
      const mockPerformers: TopPerformer[] = [
        {
          id: '1',
          name: 'Blackwater Reverb',
          category: 'Project',
          value: '$75,000',
          change: 25.5
        },
        {
          id: '2',
          name: 'Captain Jack Sparrow',
          category: 'Team Member',
          value: '98% Rating',
          change: 12.3
        },
        {
          id: '3',
          name: 'Main Deck Takeover',
          category: 'Event',
          value: '500 Attendees',
          change: 18.7
        }
      ];

      setTopPerformers(mockPerformers);

    } catch (err) {
      console.error('Error loading overview data:', err);
      setError('Failed to load analytics overview');
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'increase': return <ArrowUpRight className="h-4 w-4 text-success" />;
      case 'decrease': return <ArrowDownRight className="h-4 w-4 text-destructive" />;
      default: return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case 'increase': return 'text-success';
      case 'decrease': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-20 bg-muted rounded"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card title="Error">
        <div className="text-sm text-destructive">{error}</div>
        <Button onClick={loadOverviewData} className="mt-4">
          Retry
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const IconComponent = metric.icon;
          return (
            <Card key={metric.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <IconComponent className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-muted-foreground">
                    {metric.title}
                  </span>
                </div>
                {getChangeIcon(metric.changeType)}
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold text-foreground">
                  {metric.value}
                </div>
                <div className="flex items-center space-x-1 mt-1">
                  <span className={`text-sm font-medium ${getChangeColor(metric.changeType)}`}>
                    {metric.change > 0 ? '+' : ''}{metric.change}%
                  </span>
                  <span className="text-sm text-muted-foreground">
                    vs last period
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {metric.description}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card title="Recent Activity" className="p-6">
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <Activity className="h-4 w-4 text-primary mt-1" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-foreground">
                    {activity.description}
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      by {activity.user}
                    </span>
                    <span className="text-xs text-muted-foreground/60">•</span>
                    <span className="text-xs text-muted-foreground">
                      {formatTimestamp(activity.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t">
            <Button className="w-full">
              View All Activity
            </Button>
          </div>
        </Card>

        {/* Top Performers */}
        <Card title="Top Performers" className="p-6">
          <div className="space-y-4">
            {topPerformers.map((performer, index) => (
              <div key={performer.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <Badge variant="outline" className="text-xs">
                      #{index + 1}
                    </Badge>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">
                      {performer.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {performer.category}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-foreground">
                    {performer.value}
                  </div>
                  <div className="text-xs text-success">
                    +{performer.change}%
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t">
            <Button className="w-full">
              View Detailed Analytics
            </Button>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card title="Quick Actions" className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Create Dashboard</span>
          </Button>
          <Button variant="outline" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Generate Report</span>
          </Button>
          <Button variant="outline" className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Schedule Export</span>
          </Button>
        </div>
      </Card>
    </div>
  );
}
