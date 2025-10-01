'use client';


import React, { useState, useEffect } from 'react';
import { Card, Badge, Button } from '@ghxstship/ui';
import { DynamicProgressBar } from "../../../../_components/ui"
import { 
  Users, 
  CheckCircle, 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Clock, 
  Target, 
  Award,
  DollarSign,
  Activity,
  Building,
  Truck,
  Wrench,
  Zap,
  Monitor,
  Key,
  Car,
  Plane,
  Music,
  Coffee,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';
import { createBrowserClient } from '@ghxstship/auth';

interface PipelineStats {
  totalCrew: number;
  activeProjects: number;
  completedTraining: number;
  pendingOnboarding: number;
  advancingItems: {
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
    blocked: number;
  };
  contractsStatus: {
    signed: number;
    pending: number;
    expired: number;
  };
  upcomingDeadlines: Array<{
    id: string;
    title: string;
    type: 'training' | 'contract' | 'advancing' | 'onboarding';
    dueDate: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
  }>;
  recentActivity: Array<{
    id: string;
    action: string;
    user: string;
    timestamp: string;
    type: 'training' | 'contract' | 'advancing' | 'onboarding' | 'manning';
  }>;
}

interface OverviewClientProps {
  orgId: string;
}

const CATEGORY_ICONS = {
  site_infrastructure: Building,
  site_assets: Building,
  site_vehicles: Truck,
  site_services: Zap,
  heavy_machinery: Wrench,
  it_communication: Monitor,
  office_admin: Building,
  access_credentials: Key,
  parking: Car,
  travel_lodging: Plane,
  artist_technical: Music,
  artist_hospitality: Coffee,
  artist_travel_lodging: Plane
};

export default function OverviewClient({ orgId }: OverviewClientProps) {
  const [stats, setStats] = useState<PipelineStats | null>(null);
  const [loading, setLoading] = useState(true);
  const sb = createBrowserClient();

  useEffect(() => {
    loadOverviewData();
  }, [orgId]);

  const loadOverviewData = async () => {
    setLoading(true);
    try {
      // In production, these would be actual Supabase queries
      // For now, using mock data to demonstrate the interface
      const mockStats: PipelineStats = {
        totalCrew: 156,
        activeProjects: 8,
        completedTraining: 142,
        pendingOnboarding: 14,
        advancingItems: {
          total: 47,
          completed: 28,
          inProgress: 12,
          pending: 5,
          blocked: 2
        },
        contractsStatus: {
          signed: 134,
          pending: 18,
          expired: 4
        },
        upcomingDeadlines: [
          {
            id: '1',
            title: 'Safety Training - Batch 3',
            type: 'training',
            dueDate: '2025-09-10',
            priority: 'high'
          },
          {
            id: '2',
            title: 'Power Distribution Setup',
            type: 'advancing',
            dueDate: '2025-09-12',
            priority: 'critical'
          },
          {
            id: '3',
            title: 'New Crew Onboarding',
            type: 'onboarding',
            dueDate: '2025-09-15',
            priority: 'medium'
          },
          {
            id: '4',
            title: 'Contract Renewals - Q4',
            type: 'contract',
            dueDate: '2025-09-20',
            priority: 'high'
          }
        ],
        recentActivity: [
          {
            id: '1',
            action: 'Completed safety training certification',
            user: 'John Smith',
            timestamp: '2025-09-07T14:30:00Z',
            type: 'training'
          },
          {
            id: '2',
            action: 'Updated advancing item status to completed',
            user: 'Sarah Johnson',
            timestamp: '2025-09-07T13:45:00Z',
            type: 'advancing'
          },
          {
            id: '3',
            action: 'New crew member onboarded',
            user: 'Mike Wilson',
            timestamp: '2025-09-07T11:20:00Z',
            type: 'onboarding'
          },
          {
            id: '4',
            action: 'Contract signed for technical crew',
            user: 'Lisa Brown',
            timestamp: '2025-09-07T10:15:00Z',
            type: 'contract'
          },
          {
            id: '5',
            action: 'Manning schedule updated for weekend',
            user: 'Tom Davis',
            timestamp: '2025-09-07T09:30:00Z',
            type: 'manning'
          }
        ]
      };

      setStats(mockStats);
    } catch (error) {
      console.error('Error loading overview data:', error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="stack-lg">
        <div className="animate-pulse">
          <div className="h-icon-lg bg-secondary rounded w-1/4 mb-md"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md mb-lg">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-component-xl bg-secondary rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <Card>
        <div className="p-xl text-center">
          <p className="color-muted">Failed to load overview data</p>
          <Button onClick={loadOverviewData} className="mt-md">
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  const advancingProgress = stats.advancingItems.total > 0 
    ? Math.round((stats.advancingItems.completed / stats.advancingItems.total) * 100)
    : 0;

  const trainingCompletion = stats.totalCrew > 0
    ? Math.round((stats.completedTraining / stats.totalCrew) * 100)
    : 0;

  const contractCompletion = (stats.contractsStatus.signed + stats.contractsStatus.pending + stats.contractsStatus.expired) > 0
    ? Math.round((stats.contractsStatus.signed / (stats.contractsStatus.signed + stats.contractsStatus.pending + stats.contractsStatus.expired)) * 100)
    : 0;

  return (
    <div className="stack-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-3">Pipeline Overview</h1>
          <p className="text-body-sm color-muted">
            Production pipeline status and key metrics
          </p>
        </div>
        <Button onClick={loadOverviewData}>
          <Activity className="w-icon-xs h-icon-xs mr-sm" />
          Refresh
        </Button>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
        <Card>
          <div className="p-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-body-sm form-label color-muted">Total Crew</p>
                <p className="text-heading-3">{stats.totalCrew}</p>
              </div>
              <div className="p-sm bg-accent/10 rounded-full">
                <Users className="w-icon-md h-icon-md color-accent" />
              </div>
            </div>
            <div className="mt-md flex items-center text-body-sm">
              <TrendingUp className="w-icon-xs h-icon-xs color-success mr-xs" />
              <span className="color-success">+12% from last month</span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-body-sm form-label color-muted">Active Projects</p>
                <p className="text-heading-3">{stats.activeProjects}</p>
              </div>
              <div className="p-sm bg-success/10 rounded-full">
                <Activity className="w-icon-md h-icon-md color-success" />
              </div>
            </div>
            <div className="mt-md flex items-center text-body-sm">
              <span className="color-muted">Across multiple venues</span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-body-sm form-label color-muted">Training Progress</p>
                <p className="text-heading-3">{trainingCompletion}%</p>
              </div>
              <div className="p-sm bg-secondary/10 rounded-full">
                <CheckCircle className="w-icon-md h-icon-md color-secondary" />
              </div>
            </div>
            <div className="mt-md">
              <DynamicProgressBar
                percentage={trainingCompletion}
                variant="default"
                size="sm"
                showLabel={false}
              />
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-body-sm form-label color-muted">Advancing Progress</p>
                <p className="text-heading-3">{advancingProgress}%</p>
              </div>
              <div className="p-sm bg-warning/10 rounded-full">
                <BarChart3 className="w-icon-md h-icon-md color-warning" />
              </div>
            </div>
            <div className="mt-md">
              <DynamicProgressBar
                percentage={advancingProgress}
                variant="warning"
                size="sm"
                showLabel={false}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        {/* Advancing Status */}
        <Card>
          <div className="p-lg">
            <div className="flex items-center justify-between mb-md">
              <h3 className="text-body text-heading-4">Production Advancing</h3>
              <Button>
                <ArrowRight className="w-icon-xs h-icon-xs" />
              </Button>
            </div>
            
            <div className="stack-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center cluster-sm">
                  <CheckCircle className="w-icon-xs h-icon-xs color-success" />
                  <span className="text-body-sm">Completed</span>
                </div>
                <Badge variant="success">
                  {stats.advancingItems.completed}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center cluster-sm">
                  <Clock className="w-icon-xs h-icon-xs color-accent" />
                  <span className="text-body-sm">In Progress</span>
                </div>
                <Badge variant="default">
                  {stats.advancingItems.inProgress}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center cluster-sm">
                  <Clock className="w-icon-xs h-icon-xs color-muted" />
                  <span className="text-body-sm">Pending</span>
                </div>
                <Badge variant="secondary">
                  {stats.advancingItems.pending}
                </Badge>
              </div>
              
              {stats.advancingItems.blocked > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center cluster-sm">
                    <AlertTriangle className="w-icon-xs h-icon-xs color-destructive" />
                    <span className="text-body-sm">Blocked</span>
                  </div>
                  <Badge variant="destructive">
                    {stats.advancingItems.blocked}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Contracts Status */}
        <Card>
          <div className="p-lg">
            <div className="flex items-center justify-between mb-md">
              <h3 className="text-body text-heading-4">Contracts Status</h3>
              <Button>
                <ArrowRight className="w-icon-xs h-icon-xs" />
              </Button>
            </div>
            
            <div className="stack-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center cluster-sm">
                  <CheckCircle className="w-icon-xs h-icon-xs color-success" />
                  <span className="text-body-sm">Signed</span>
                </div>
                <Badge variant="success">
                  {stats.contractsStatus.signed}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center cluster-sm">
                  <Clock className="w-icon-xs h-icon-xs color-warning" />
                  <span className="text-body-sm">Pending</span>
                </div>
                <Badge variant="warning">
                  {stats.contractsStatus.pending}
                </Badge>
              </div>
              
              {stats.contractsStatus.expired > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center cluster-sm">
                    <AlertTriangle className="w-icon-xs h-icon-xs color-destructive" />
                    <span className="text-body-sm">Expired</span>
                  </div>
                  <Badge variant="destructive">
                    {stats.contractsStatus.expired}
                  </Badge>
                </div>
              )}
            </div>
            
            <div className="mt-md pt-md border-t">
              <div className="flex justify-between text-body-sm color-muted">
                <span>Completion Rate</span>
                <span>{contractCompletion}%</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Upcoming Deadlines & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        {/* Upcoming Deadlines */}
        <Card>
          <div className="p-lg">
            <div className="flex items-center justify-between mb-md">
              <h3 className="text-body text-heading-4">Upcoming Deadlines</h3>
              <Calendar className="w-icon-sm h-icon-sm color-muted" />
            </div>
            
            <div className="stack-sm">
              {stats.upcomingDeadlines.map(deadline => {
                const daysUntil = Math.ceil(
                  (new Date(deadline.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                );
                
                const priorityStyles = {
                  low: 'bg-secondary text-secondary-foreground',
                  medium: 'bg-warning text-warning-foreground',
                  high: 'bg-warning text-warning-foreground',
                  critical: 'bg-destructive text-destructive-foreground'
                };

                return (
                  <div key={deadline.id} className="flex items-center justify-between p-sm bg-secondary/30 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center cluster-sm mb-xs">
                        <h4 className="text-body-sm form-label">{deadline.title}</h4>
                        <Badge className={`${priorityStyles[deadline.priority]} text-body-sm`}>
                          {deadline.priority}
                        </Badge>
                      </div>
                      <p className="text-body-sm color-muted">
                        {daysUntil > 0 ? `${daysUntil} days remaining` : 'Overdue'}
                      </p>
                    </div>
                    <div className="text-body-sm color-muted">
                      {new Date(deadline.dueDate).toLocaleDateString()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card>
          <div className="p-lg">
            <div className="flex items-center justify-between mb-md">
              <h3 className="text-body text-heading-4">Recent Activity</h3>
              <Activity className="w-icon-sm h-icon-sm color-muted" />
            </div>
            
            <div className="stack-sm">
              {stats.recentActivity.map(activity => {
                const typeColors = {
                  training: 'bg-secondary/10 color-secondary',
                  advancing: 'bg-warning/10 color-warning',
                  onboarding: 'bg-accent/10 color-accent',
                  contract: 'bg-success/10 color-success',
                  manning: 'bg-accent/10 color-accent'
                };

                return (
                  <div key={activity.id} className="flex items-start cluster-sm p-sm bg-secondary/30 rounded-lg">
                    <div className="flex-1">
                      <p className="text-body-sm">{activity.action}</p>
                      <div className="flex items-center cluster-sm mt-xs">
                        <span className="text-body-sm color-muted">by {activity.user}</span>
                        <Badge className={`${typeColors[activity.type]} text-body-sm`}>
                          {activity.type}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-body-sm color-muted">
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <div className="p-lg">
          <h3 className="text-body text-heading-4 mb-md">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
            <Button variant="outline" className="h-auto p-md flex flex-col items-center stack-sm">
              <Users className="w-icon-md h-icon-md" />
              <span className="text-body-sm">Manage Crew</span>
            </Button>
            <Button variant="outline" className="h-auto p-md flex flex-col items-center stack-sm">
              <CheckCircle className="w-icon-md h-icon-md" />
              <span className="text-body-sm">Schedule Training</span>
            </Button>
            <Button variant="outline" className="h-auto p-md flex flex-col items-center stack-sm">
              <Building className="w-icon-md h-icon-md" />
              <span className="text-body-sm">Update Advancing</span>
            </Button>
            <Button variant="outline" className="h-auto p-md flex flex-col items-center stack-sm">
              <DollarSign className="w-icon-md h-icon-md" />
              <span className="text-body-sm">Review Contracts</span>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
