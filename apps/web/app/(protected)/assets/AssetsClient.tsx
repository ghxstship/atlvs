'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Badge } from '@ghxstship/ui';
import { Plus, Package, TrendingUp, AlertTriangle, Settings, BarChart3 } from 'lucide-react';
import { createBrowserClient } from '@ghxstship/auth';
import { useTranslations } from 'next-intl';

interface Asset {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  category: string;
  type: 'fixed' | 'rentable' | 'service';
  status: 'available' | 'in_use' | 'under_maintenance' | 'damaged' | 'missing' | 'retired';
  sku?: string;
  currentValue?: number;
  location?: string;
  assignedTo?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AssetsClientProps {
  orgId: string;
}

const ASSET_CATEGORIES = [
  { id: 'site_infrastructure', name: 'Site Infrastructure', icon: '🏗️' },
  { id: 'site_assets', name: 'Site Assets', icon: '📦' },
  { id: 'site_vehicles', name: 'Site Vehicles', icon: '🚛' },
  { id: 'site_services', name: 'Site Services', icon: '⚡' },
  { id: 'heavy_machinery', name: 'Heavy Machinery & Equipment', icon: '🏭' },
  { id: 'it_communication', name: 'IT & Communication Services', icon: '📡' },
  { id: 'office_admin', name: 'Office & Admin', icon: '🏢' },
  { id: 'access_credentials', name: 'Access & Credentials', icon: '🔑' },
  { id: 'parking', name: 'Parking', icon: '🅿️' },
  { id: 'travel_lodging', name: 'Travel & Lodging', icon: '🏨' },
  { id: 'artist_technical', name: 'Artist Technical', icon: '🎵' },
  { id: 'artist_hospitality', name: 'Artist Hospitality', icon: '🍽️' },
  { id: 'artist_travel', name: 'Artist Travel & Lodging', icon: '✈️' }
] as const;

export default function AssetsClient({ orgId }: AssetsClientProps) {
  const t = useTranslations('assets');
  const supabase = createBrowserClient();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'advancing' | 'assignments' | 'tracking' | 'maintenance' | 'reports'>('overview');
  const [stats, setStats] = useState({
    totalAssets: 0,
    activeAssignments: 0,
    maintenanceRequired: 0,
    totalValue: 0
  });

  useEffect(() => {
    loadData();
  }, [orgId]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load assets from Supabase
      const { data: assetsData, error } = await supabase
        .from('assets')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading assets:', error);
        // Use demo data for development
        setAssets(generateDemoAssets());
      } else {
        setAssets(assetsData || []);
      }

      // Calculate stats
      const totalAssets = assetsData?.length || 0;
      const activeAssignments = assetsData?.filter(a => a.status === 'in_use').length || 0;
      const maintenanceRequired = assetsData?.filter(a => a.status === 'under_maintenance' || a.status === 'damaged').length || 0;
      const totalValue = assetsData?.reduce((sum, a) => sum + (a.current_value || 0), 0) || 0;

      setStats({
        totalAssets,
        activeAssignments,
        maintenanceRequired,
        totalValue
      });

    } catch (error) {
      console.error('Error loading assets data:', error);
      setAssets(generateDemoAssets());
    } finally {
      setLoading(false);
    }
  };

  const generateDemoAssets = (): Asset[] => [
    {
      id: '1',
      organizationId: orgId,
      name: 'Main Stage Rigging System',
      description: 'Professional stage rigging and truss system for main performance area',
      category: 'site_infrastructure',
      type: 'fixed',
      status: 'in_use',
      sku: 'STAGE-RIG-001',
      currentValue: 45000,
      location: 'Main Deck',
      assignedTo: 'Jack Sparrow',
      createdAt: '2024-01-01T10:00:00Z'
    },
    {
      id: '2',
      organizationId: orgId,
      name: 'Professional Sound System',
      description: 'High-end PA system with mixing console and monitors',
      category: 'artist_technical',
      type: 'rentable',
      status: 'available',
      sku: 'AUDIO-PA-002',
      currentValue: 25000,
      location: 'Equipment Storage',
      createdAt: '2024-01-02T14:30:00Z'
    },
    {
      id: '3',
      organizationId: orgId,
      name: 'LED Video Wall Panels',
      description: 'Modular LED display panels for backdrop and visual effects',
      category: 'artist_technical',
      type: 'rentable',
      status: 'under_maintenance',
      sku: 'LED-WALL-003',
      currentValue: 35000,
      location: 'Tech Workshop',
      assignedTo: 'Will Turner',
      createdAt: '2024-01-03T09:15:00Z'
    },
    {
      id: '4',
      organizationId: orgId,
      name: 'Catering Services',
      description: 'Full-service catering for crew and artist hospitality',
      category: 'artist_hospitality',
      type: 'service',
      status: 'available',
      sku: 'CATER-SRV-004',
      location: 'Galley',
      createdAt: '2024-01-04T16:45:00Z'
    },
    {
      id: '5',
      organizationId: orgId,
      name: 'Generator - 500kW',
      description: 'Primary power generation unit for event infrastructure',
      category: 'site_services',
      type: 'fixed',
      status: 'in_use',
      sku: 'GEN-500-005',
      currentValue: 75000,
      location: 'Power Station',
      assignedTo: 'Elizabeth Swann',
      createdAt: '2024-01-05T11:20:00Z'
    }
  ];

  const getStatusBadge = (status: Asset['status']) => {
    switch (status) {
      case 'available':
        return <Badge variant="success">Available</Badge>;
      case 'in_use':
        return <Badge variant="warning">In Use</Badge>;
      case 'under_maintenance':
        return <Badge variant="secondary">Maintenance</Badge>;
      case 'damaged':
        return <Badge variant="destructive">Damaged</Badge>;
      case 'missing':
        return <Badge variant="destructive">Missing</Badge>;
      case 'retired':
        return <Badge variant="outline">Retired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-3 text-heading-3 font-anton uppercase">Assets Management</h1>
          <p className="text-body-sm color-muted">Comprehensive asset inventory, tracking, and management system</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Asset
        </Button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-secondary p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'inventory', label: 'Inventory', icon: Package },
          { id: 'advancing', label: 'Advancing', icon: TrendingUp },
          { id: 'assignments', label: 'Assignments', icon: Settings },
          { id: 'tracking', label: 'Tracking', icon: AlertTriangle },
          { id: 'maintenance', label: 'Maintenance', icon: Settings },
          { id: 'reports', label: 'Reports', icon: BarChart3 }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-body-sm form-label transition-colors ${
                activeTab === tab.id
                  ? 'bg-background color-foreground shadow-sm'
                  : 'color-muted hover:color-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <Card>
          <div className="p-8 text-center color-muted">Loading assets data...</div>
        </Card>
      ) : (
        <>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-body-sm form-label color-muted">Total Assets</p>
                        <p className="text-heading-3 text-heading-3">{stats.totalAssets}</p>
                      </div>
                      <Package className="w-8 h-8 color-primary" />
                    </div>
                  </div>
                </Card>
                <Card>
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-body-sm form-label color-muted">Active Assignments</p>
                        <p className="text-heading-3 text-heading-3">{stats.activeAssignments}</p>
                      </div>
                      <TrendingUp className="w-8 h-8 color-success" />
                    </div>
                  </div>
                </Card>
                <Card>
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-body-sm form-label color-muted">Maintenance Required</p>
                        <p className="text-heading-3 text-heading-3">{stats.maintenanceRequired}</p>
                      </div>
                      <AlertTriangle className="w-8 h-8 color-warning" />
                    </div>
                  </div>
                </Card>
                <Card>
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-body-sm form-label color-muted">Total Value</p>
                        <p className="text-heading-3 text-heading-3">{formatCurrency(stats.totalValue)}</p>
                      </div>
                      <BarChart3 className="w-8 h-8 color-secondary" />
                    </div>
                  </div>
                </Card>
              </div>

              {/* Recent Assets */}
              <Card>
                <div className="p-4">
                  <h3 className="text-body text-heading-4 mb-4">Recent Assets</h3>
                  <div className="space-y-3">
                    {assets.slice(0, 5).map(asset => (
                      <div key={asset.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="form-label">{asset.name}</h4>
                          <p className="text-body-sm color-muted">
                            {ASSET_CATEGORIES.find(cat => cat.id === asset.category)?.name} • {asset.location}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          {asset.currentValue && (
                            <span className="text-body-sm form-label">{formatCurrency(asset.currentValue)}</span>
                          )}
                          {getStatusBadge(asset.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Other tabs will be implemented as separate components */}
          {activeTab !== 'overview' && (
            <Card>
              <div className="p-8 text-center color-muted">
                <h3 className="text-body text-heading-4 mb-2">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Module</h3>
                <p>This submodule is being implemented. Full functionality coming soon.</p>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
