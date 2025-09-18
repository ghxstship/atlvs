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
      case 'increase': return <ArrowUpRight className="h-4 w-4 color-success" />;
      case 'decrease': return <ArrowDownRight className="h-4 w-4 color-destructive" />;
      default: return <Minus className="h-4 w-4 color-muted" />;
    }
  };

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case 'increase': return 'color-success';
      case 'decrease': return 'color-destructive';
      default: return 'color-muted';
    }
  };

  if (loading) {
    return (
      <div className="stack-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-20 bg-secondary rounded"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card title="Error">
        <div className="text-body-sm color-destructive">{error}</div>
        <Button onClick={loadOverviewData} className="mt-md">
          Retry
        </Button>
      </Card>
    );
  }

  return (
    <div className="stack-lg">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
        {metrics.map((metric) => {
          const IconComponent = metric.icon;
          return (
            <Card key={metric.id} className="p-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center cluster-sm">
                  <IconComponent className="h-5 w-5 color-primary" />
                  <span className="text-body-sm form-label color-muted">
                    {metric.title}
                  </span>
                </div>
                {getChangeIcon(metric.changeType)}
              </div>
              <div className="mt-sm">
                <div className="text-heading-3 text-heading-3 color-foreground">
                  {metric.value}
                </div>
                <div className="flex items-center cluster-xs mt-xs">
                  <span className={`text-body-sm form-label ${getChangeColor(metric.changeType)}`}>
                    {metric.change > 0 ? '+' : ''}{metric.change}%
                  </span>
                  <span className="text-body-sm color-muted">
                    vs last period
                  </span>
                </div>
                <div className="text-body-sm color-muted mt-xs">
                  {metric.description}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        {/* Recent Activity */}
        <Card title="Recent Activity" className="p-lg">
          <div className="stack-md">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start cluster-sm">
                <div className="flex-shrink-0">
                  <Activity className="h-4 w-4 color-primary mt-xs" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-body-sm color-foreground">
                    {activity.description}
                  </div>
                  <div className="flex items-center cluster-sm mt-xs">
                    <span className="text-body-sm color-muted">
                      by {activity.user}
                    </span>
                    <span className="text-body-sm color-muted/60">•</span>
                    <span className="text-body-sm color-muted">
                      {formatTimestamp(activity.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-md pt-md border-t">
            <Button className="w-full">
              View All Activity
            </Button>
          </div>
        </Card>

        {/* Top Performers */}
        <Card title="Top Performers" className="p-lg">
          <div className="stack-md">
            {topPerformers.map((performer, index) => (
              <div key={performer.id} className="flex items-center justify-between">
                <div className="flex items-center cluster-sm">
                  <div className="flex-shrink-0">
                    <Badge variant="outline" className="text-body-sm">
                      #{index + 1}
                    </Badge>
                  </div>
                  <div>
                    <div className="text-body-sm form-label color-foreground">
                      {performer.name}
                    </div>
                    <div className="text-body-sm color-muted">
                      {performer.category}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-body-sm form-label color-foreground">
                    {performer.value}
                  </div>
                  <div className="text-body-sm color-success">
                    +{performer.change}%
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-md pt-md border-t">
            <Button className="w-full">
              View Detailed Analytics
            </Button>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card title="Quick Actions" className="p-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          <Button variant="outline" className="flex items-center cluster-sm">
            <BarChart3 className="h-4 w-4" />
            <span>Create Dashboard</span>
          </Button>
          <Button variant="outline" className="flex items-center cluster-sm">
            <TrendingUp className="h-4 w-4" />
            <span>Generate Report</span>
          </Button>
          <Button variant="outline" className="flex items-center cluster-sm">
            <Clock className="h-4 w-4" />
            <span>Schedule Export</span>
          </Button>
        </div>
      </Card>
    </div>
  );
}
