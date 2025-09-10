'use client';

import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { createBrowserClient } from '@ghxstship/auth';
import { 
  Card,
  Button,
  Badge
} from '@ghxstship/ui';
import { 
  Package,
  TrendingUp,
  UserCheck,
  Wrench,
  MapPin,
  FileText,
  Plus,
  Activity,
  DollarSign,
  AlertTriangle
} from 'lucide-react';

interface OverviewClientProps {
  user: User;
  orgId: string;
}

interface AssetStats {
  totalAssets: number;
  availableAssets: number;
  inUseAssets: number;
  maintenanceAssets: number;
  totalValue: number;
  activeAssignments: number;
  pendingMaintenance: number;
  recentActivity: any[];
}

export default function OverviewClient({ user, orgId }: OverviewClientProps) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AssetStats>({
    totalAssets: 0,
    availableAssets: 0,
    inUseAssets: 0,
    maintenanceAssets: 0,
    totalValue: 0,
    activeAssignments: 0,
    pendingMaintenance: 0,
    recentActivity: []
  });

  const supabase = createBrowserClient();

  useEffect(() => {
    loadAssetStats();
  }, [orgId]);

  const loadAssetStats = async () => {
    try {
      setLoading(true);

      // Get asset counts by status
      const { data: assets } = await supabase
        .from('assets')
        .select('status, current_value')
        .eq('organization_id', orgId);

      // Get assignment counts
      const { data: assignments } = await supabase
        .from('asset_assignments')
        .select('status')
        .eq('organization_id', orgId)
        .eq('status', 'active');

      // Get maintenance counts
      const { data: maintenance } = await supabase
        .from('asset_maintenance')
        .select('status')
        .eq('organization_id', orgId)
        .in('status', ['scheduled', 'in_progress']);

      // Get recent activity
      const { data: activity } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('organization_id', orgId)
        .in('entity_type', ['asset', 'asset_assignment', 'asset_maintenance', 'asset_tracking'])
        .order('occurred_at', { ascending: false })
        .limit(10);

      const totalAssets = assets?.length || 0;
      const availableAssets = assets?.filter(a => a.status === 'available').length || 0;
      const inUseAssets = assets?.filter(a => a.status === 'in_use').length || 0;
      const maintenanceAssets = assets?.filter(a => a.status === 'under_maintenance').length || 0;
      const totalValue = assets?.reduce((sum, asset) => sum + (asset.current_value || 0), 0) || 0;

      setStats({
        totalAssets,
        availableAssets,
        inUseAssets,
        maintenanceAssets,
        totalValue,
        activeAssignments: assignments?.length || 0,
        pendingMaintenance: maintenance?.length || 0,
        recentActivity: activity || []
      });
    } catch (error) {
      console.error('Error loading asset stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getActivityIcon = (entityType: string) => {
    switch (entityType) {
      case 'asset': return <Package className="h-4 w-4" />;
      case 'asset_assignment': return <UserCheck className="h-4 w-4" />;
      case 'asset_maintenance': return <Wrench className="h-4 w-4" />;
      case 'asset_tracking': return <MapPin className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'in_use': return 'bg-blue-100 text-blue-800';
      case 'under_maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'damaged': return 'bg-red-100 text-red-800';
      case 'missing': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assets Overview</h1>
          <p className="text-gray-600">Monitor and manage your organization's assets</p>
        </div>
        <div className="flex gap-3">
          <Button>
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Asset
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Assets</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalAssets}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalValue)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Assignments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeAssignments}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <UserCheck className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Maintenance</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingMaintenance}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Wrench className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Asset Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Asset Status Breakdown</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{stats.availableAssets}</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {stats.totalAssets > 0 ? Math.round((stats.availableAssets / stats.totalAssets) * 100) : 0}%
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium">In Use</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{stats.inUseAssets}</span>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {stats.totalAssets > 0 ? Math.round((stats.inUseAssets / stats.totalAssets) * 100) : 0}%
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm font-medium">Under Maintenance</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{stats.maintenanceAssets}</span>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  {stats.totalAssets > 0 ? Math.round((stats.maintenanceAssets / stats.totalAssets) * 100) : 0}%
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Package className="h-6 w-6" />
              <span className="text-sm">Add Asset</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <TrendingUp className="h-6 w-6" />
              <span className="text-sm">Create Advance</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <UserCheck className="h-6 w-6" />
              <span className="text-sm">New Assignment</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Wrench className="h-6 w-6" />
              <span className="text-sm">Schedule Maintenance</span>
            </Button>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Recent Activity</h3>
          <Button>
            <Activity className="h-4 w-4 mr-2" />
            View All
          </Button>
        </div>
        
        <div className="space-y-3">
          {stats.recentActivity.length > 0 ? (
            stats.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="p-2 bg-white rounded-lg">
                  {getActivityIcon(activity.entity_type)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {activity.action === 'create' ? 'Created' : 
                     activity.action === 'update' ? 'Updated' : 
                     activity.action === 'delete' ? 'Deleted' : activity.action} {' '}
                    {activity.entity_type.replace('_', ' ')}
                  </p>
                  <p className="text-xs text-gray-600">
                    {new Date(activity.occurred_at).toLocaleString()}
                  </p>
                </div>
                {activity.metadata?.status && (
                  <Badge className={getStatusColor(activity.metadata.status)}>
                    {activity.metadata.status}
                  </Badge>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No recent activity</p>
            </div>
          )}
        </div>
      </Card>

      {/* Alerts & Notifications */}
      {stats.pendingMaintenance > 0 && (
        <Card className="p-6 border-orange-200 bg-orange-50">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-orange-600" />
            <div>
              <h4 className="font-semibold text-orange-900">Maintenance Required</h4>
              <p className="text-sm text-orange-700">
                {stats.pendingMaintenance} asset{stats.pendingMaintenance !== 1 ? 's' : ''} require{stats.pendingMaintenance === 1 ? 's' : ''} maintenance attention
              </p>
            </div>
            <Button className="ml-auto">
              View Details
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
