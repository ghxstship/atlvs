'use client';


import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { createBrowserClient } from '@ghxstship/auth';
import { Card, Button, Badge } from '@ghxstship/ui';
import { animationPresets } from "../../../../_components/ui"
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

  const getStatusVariant = (status: string): 'success' | 'warning' | 'destructive' | 'info' | 'secondary' => {
    switch (status) {
      case 'available':
        return 'success';
      case 'in_use':
        return 'info';
      case 'maintenance':
        return 'warning';
      case 'damaged':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'hsl(var(--success))';
      case 'in_use': return 'hsl(var(--primary))';
      case 'under_maintenance': return 'hsl(var(--warning))';
      case 'damaged': return 'hsl(var(--destructive))';
      case 'missing': return 'hsl(var(--muted-foreground))';
      default: return 'hsl(var(--muted-foreground))';
    }
  };

  if (loading) {
    return (
      <div className="p-lg stack-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-lg animate-pulse">
              <div className="h-4 bg-secondary rounded w-3/4 mb-sm"></div>
              <div className="h-8 bg-secondary rounded w-1/2"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-lg stack-lg">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-heading-3 text-heading-3 color-foreground">Assets Overview</h1>
          <p className="color-muted">Monitor and manage your organization's assets</p>
        </div>
        <div className="flex gap-sm">
          <Button>
            <Plus className="h-4 w-4 mr-sm" />
            Add Asset
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
        <Card className="p-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body-sm form-label color-muted">Total Assets</p>
              <p className="text-heading-3 text-heading-3 color-foreground">{stats.totalAssets}</p>
            </div>
            <div className="p-sm bg-primary/10 rounded-lg">
              <Package className="h-6 w-6 color-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body-sm form-label color-muted">Total Value</p>
              <p className="text-heading-3 text-heading-3 color-foreground">{formatCurrency(stats.totalValue)}</p>
            </div>
            <div className="p-sm bg-success/10 rounded-lg">
              <DollarSign className="h-6 w-6 color-success" />
            </div>
          </div>
        </Card>

        <Card className="p-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body-sm form-label color-muted">Active Assignments</p>
              <p className="text-heading-3 text-heading-3 color-foreground">{stats.activeAssignments}</p>
            </div>
            <div className="p-sm bg-primary/10 rounded-lg">
              <UserCheck className="h-6 w-6 color-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body-sm form-label color-muted">Pending Maintenance</p>
              <p className="text-heading-3 text-heading-3 color-foreground">{stats.pendingMaintenance}</p>
            </div>
            <div className="p-sm bg-warning/10 rounded-lg">
              <Wrench className="h-6 w-6 color-warning" />
            </div>
          </div>
        </Card>
      </div>

      {/* Asset Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        <Card className="p-lg">
          <h3 className="text-body text-heading-4 mb-md">Asset Status Breakdown</h3>
          <div className="stack-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-sm">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getStatusColor('available') }}></div>
                <span className="text-body-sm form-label">Available</span>
              </div>
              <div className="flex items-center gap-sm">
                <span className="text-body-sm color-muted">{stats.availableAssets}</span>
                <Badge variant={getStatusVariant('available')}>
                  {stats.totalAssets > 0 ? Math.round((stats.availableAssets / stats.totalAssets) * 100) : 0}%
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-sm">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getStatusColor('in_use') }}></div>
                <span className="text-body-sm form-label">In Use</span>
              </div>
              <div className="flex items-center gap-sm">
                <span className="text-body-sm color-muted">{stats.inUseAssets}</span>
                <Badge variant={getStatusVariant('in_use')}>
                  {stats.totalAssets > 0 ? Math.round((stats.inUseAssets / stats.totalAssets) * 100) : 0}%
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-sm">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getStatusColor('under_maintenance') }}></div>
                <span className="text-body-sm form-label">Under Maintenance</span>
              </div>
              <div className="flex items-center gap-sm">
                <span className="text-body-sm color-muted">{stats.maintenanceAssets}</span>
                <Badge variant={getStatusVariant('under_maintenance')}>
                  {stats.totalAssets > 0 ? Math.round((stats.maintenanceAssets / stats.totalAssets) * 100) : 0}%
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-lg">
          <h3 className="text-body text-heading-4 mb-md">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-sm">
            <Button variant="outline" className="h-auto p-md flex flex-col items-center gap-sm">
              <Package className="h-6 w-6" />
              <span className="text-body-sm">Add Asset</span>
            </Button>
            <Button variant="outline" className="h-auto p-md flex flex-col items-center gap-sm">
              <TrendingUp className="h-6 w-6" />
              <span className="text-body-sm">Create Advance</span>
            </Button>
            <Button variant="outline" className="h-auto p-md flex flex-col items-center gap-sm">
              <UserCheck className="h-6 w-6" />
              <span className="text-body-sm">New Assignment</span>
            </Button>
            <Button variant="outline" className="h-auto p-md flex flex-col items-center gap-sm">
              <Wrench className="h-6 w-6" />
              <span className="text-body-sm">Schedule Maintenance</span>
            </Button>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-lg">
        <div className="flex items-center justify-between mb-md">
          <h3 className="text-body text-heading-4">Recent Activity</h3>
          <Button>
            <Activity className="h-4 w-4 mr-sm" />
            View All
          </Button>
        </div>
        
        <div className="stack-sm">
          {stats.recentActivity.length > 0 ? (
            stats.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center gap-sm p-sm bg-secondary/50 rounded-lg">
                <div className="p-sm bg-background rounded-lg">
                  {getActivityIcon(activity.entity_type)}
                </div>
                <div className="flex-1">
                  <p className="text-body-sm form-label">
                    {activity.action === 'create' ? 'Created' : 
                     activity.action === 'update' ? 'Updated' : 
                     activity.action === 'delete' ? 'Deleted' : activity.action} {' '}
                    {activity.entity_type.replace('_', ' ')}
                  </p>
                  <p className="text-body-sm color-muted">
                    {new Date(activity.occurred_at).toLocaleString()}
                  </p>
                </div>
                {activity.metadata?.status && (
                  <Badge variant={getStatusVariant(activity.metadata.status)}>
                    {activity.metadata.status}
                  </Badge>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-xl color-muted">
              <Activity className="h-12 w-12 mx-auto mb-sm opacity-50" />
              <p>No recent activity</p>
            </div>
          )}
        </div>
      </Card>

      {/* Alerts & Notifications */}
      {stats.pendingMaintenance > 0 && (
        <Card className="p-lg border-warning/20 bg-warning/5">
          <div className="flex items-center gap-sm">
            <AlertTriangle className="h-6 w-6 color-warning" />
            <div>
              <h4 className="text-heading-4 color-warning">Maintenance Required</h4>
              <p className="text-body-sm color-warning/80">
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
