'use client';

import React, { useState, useEffect } from 'react';
import { Card, Badge, Button } from '@ghxstship/ui';
import { createBrowserClient } from '@ghxstship/auth';
import { 
  Users, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  Calendar, 
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
  BarChart3
} from 'lucide-react';

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
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <Card>
        <div className="p-8 text-center">
          <p className="text-muted-foreground">Failed to load overview data</p>
          <Button onClick={loadOverviewData} className="mt-4">
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pipeline Overview</h1>
          <p className="text-sm text-muted-foreground">
            Production pipeline status and key metrics
          </p>
        </div>
        <Button onClick={loadOverviewData}>
          <Activity className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Crew</p>
                <p className="text-2xl font-bold">{stats.totalCrew}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+12% from last month</span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Projects</p>
                <p className="text-2xl font-bold">{stats.activeProjects}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-muted-foreground">Across multiple venues</span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Training Progress</p>
                <p className="text-2xl font-bold">{trainingCompletion}%</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all"
                  style={{ width: `${trainingCompletion}%` }}
                />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Advancing Progress</p>
                <p className="text-2xl font-bold">{advancingProgress}%</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-orange-600 h-2 rounded-full transition-all"
                  style={{ width: `${advancingProgress}%` }}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Advancing Status */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Production Advancing</h3>
              <Button variant="ghost" size="sm">
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Completed</span>
                </div>
                <Badge className="bg-green-500 text-white">
                  {stats.advancingItems.completed}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span className="text-sm">In Progress</span>
                </div>
                <Badge className="bg-blue-500 text-white">
                  {stats.advancingItems.inProgress}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">Pending</span>
                </div>
                <Badge variant="secondary">
                  {stats.advancingItems.pending}
                </Badge>
              </div>
              
              {stats.advancingItems.blocked > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span className="text-sm">Blocked</span>
                  </div>
                  <Badge className="bg-red-500 text-white">
                    {stats.advancingItems.blocked}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Contracts Status */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Contracts Status</h3>
              <Button variant="ghost" size="sm">
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Signed</span>
                </div>
                <Badge className="bg-green-500 text-white">
                  {stats.contractsStatus.signed}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm">Pending</span>
                </div>
                <Badge className="bg-yellow-500 text-white">
                  {stats.contractsStatus.pending}
                </Badge>
              </div>
              
              {stats.contractsStatus.expired > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span className="text-sm">Expired</span>
                  </div>
                  <Badge className="bg-red-500 text-white">
                    {stats.contractsStatus.expired}
                  </Badge>
                </div>
              )}
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Completion Rate</span>
                <span>{contractCompletion}%</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Upcoming Deadlines & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Deadlines */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Upcoming Deadlines</h3>
              <Calendar className="w-5 h-5 text-muted-foreground" />
            </div>
            
            <div className="space-y-3">
              {stats.upcomingDeadlines.map(deadline => {
                const daysUntil = Math.ceil(
                  (new Date(deadline.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                );
                
                const priorityColors = {
                  low: 'bg-gray-500',
                  medium: 'bg-yellow-500',
                  high: 'bg-orange-500',
                  critical: 'bg-red-500'
                };

                return (
                  <div key={deadline.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-sm font-medium">{deadline.title}</h4>
                        <Badge className={`${priorityColors[deadline.priority]} text-white text-xs`}>
                          {deadline.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {daysUntil > 0 ? `${daysUntil} days remaining` : 'Overdue'}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground">
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
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Recent Activity</h3>
              <Activity className="w-5 h-5 text-muted-foreground" />
            </div>
            
            <div className="space-y-3">
              {stats.recentActivity.map(activity => {
                const typeColors = {
                  training: 'bg-purple-100 text-purple-800',
                  advancing: 'bg-orange-100 text-orange-800',
                  onboarding: 'bg-blue-100 text-blue-800',
                  contract: 'bg-green-100 text-green-800',
                  manning: 'bg-indigo-100 text-indigo-800'
                };

                return (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm">{activity.action}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-muted-foreground">by {activity.user}</span>
                        <Badge className={`${typeColors[activity.type]} text-xs`}>
                          {activity.type}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
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
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Users className="w-6 h-6" />
              <span className="text-sm">Manage Crew</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <CheckCircle className="w-6 h-6" />
              <span className="text-sm">Schedule Training</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Building className="w-6 h-6" />
              <span className="text-sm">Update Advancing</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <DollarSign className="w-6 h-6" />
              <span className="text-sm">Review Contracts</span>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
