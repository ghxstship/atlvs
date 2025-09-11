'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Input, Badge, Drawer } from '@ghxstship/ui';
import { Plus, Search, Filter, Download, Upload, MapPin, Edit, Trash2, Copy, QrCode, Scan, Activity } from 'lucide-react';
import { createBrowserClient } from '@ghxstship/auth';
import { useTranslations } from 'next-intl';

interface AssetTracking {
  id: string;
  organizationId: string;
  assetId: string;
  assetName: string;
  currentLocation: string;
  previousLocation?: string;
  status: 'active' | 'idle' | 'in_transit' | 'maintenance' | 'offline';
  lastSeen: string;
  trackedBy: string;
  trackingMethod: 'manual' | 'barcode' | 'qr_code' | 'rfid' | 'gps';
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  temperature?: number;
  humidity?: number;
  batteryLevel?: number;
  signalStrength?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface TrackingClientProps {
  orgId: string;
}

export default function TrackingClient({ orgId }: TrackingClientProps) {
  const t = useTranslations('assets.tracking');
  const supabase = createBrowserClient();
  const [trackingData, setTrackingData] = useState<AssetTracking[]>([]);
  const [filteredData, setFilteredData] = useState<AssetTracking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedTracking, setSelectedTracking] = useState<AssetTracking | null>(null);
  const [view, setView] = useState<'grid' | 'list' | 'kanban'>('grid');

  useEffect(() => {
    loadTrackingData();
  }, [orgId]);

  useEffect(() => {
    filterData();
  }, [trackingData, searchQuery, selectedStatus, selectedMethod]);

  const loadTrackingData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('asset_tracking')
        .select(`
          *,
          assets!inner(name)
        `)
        .eq('organization_id', orgId)
        .order('last_seen', { ascending: false });

      if (error) {
        console.error('Error loading tracking data:', error);
        setTrackingData(generateDemoTrackingData());
      } else {
        const mappedData = (data || []).map(item => ({
          ...item,
          assetName: item.assets?.name || 'Unknown Asset'
        }));
        setTrackingData(mappedData);
      }
    } catch (error) {
      console.error('Error loading tracking data:', error);
      setTrackingData(generateDemoTrackingData());
    } finally {
      setLoading(false);
    }
  };

  const generateDemoTrackingData = (): AssetTracking[] => [
    {
      id: '1',
      organizationId: orgId,
      assetId: 'asset-001',
      assetName: 'Professional Sound System',
      currentLocation: 'Main Stage Area',
      previousLocation: 'Equipment Storage - Bay 2',
      status: 'active',
      lastSeen: '2024-08-07T15:30:00Z',
      trackedBy: 'Tech Specialist Sparks',
      trackingMethod: 'rfid',
      coordinates: {
        latitude: 40.7128,
        longitude: -74.0060
      },
      temperature: 22.5,
      humidity: 45,
      batteryLevel: 85,
      signalStrength: 92,
      notes: 'System operational and performing well',
      createdAt: '2024-08-01T09:00:00Z'
    },
    {
      id: '2',
      organizationId: orgId,
      assetId: 'asset-002',
      assetName: 'LED Video Wall Panels',
      currentLocation: 'Tech Workshop',
      previousLocation: 'Storage Warehouse',
      status: 'maintenance',
      lastSeen: '2024-08-07T14:15:00Z',
      trackedBy: 'Maintenance Crew',
      trackingMethod: 'qr_code',
      temperature: 24.1,
      humidity: 38,
      notes: 'Undergoing pixel replacement and calibration',
      createdAt: '2024-08-02T10:30:00Z'
    },
    {
      id: '3',
      organizationId: orgId,
      assetId: 'asset-003',
      assetName: 'Crew Transport Van',
      currentLocation: 'En Route to Venue',
      previousLocation: 'Vehicle Bay 1',
      status: 'in_transit',
      lastSeen: '2024-08-07T16:45:00Z',
      trackedBy: 'Driver Compass',
      trackingMethod: 'gps',
      coordinates: {
        latitude: 40.7589,
        longitude: -73.9851
      },
      batteryLevel: 78,
      signalStrength: 88,
      notes: 'Transporting crew to evening setup',
      createdAt: '2024-08-03T08:00:00Z'
    },
    {
      id: '4',
      organizationId: orgId,
      assetId: 'asset-004',
      assetName: 'Mobile Generator Unit',
      currentLocation: 'Power Station - Backup',
      status: 'idle',
      lastSeen: '2024-08-07T12:00:00Z',
      trackedBy: 'Chief Engineer Sparks',
      trackingMethod: 'manual',
      temperature: 28.3,
      humidity: 52,
      batteryLevel: 100,
      notes: 'Standby mode - ready for emergency activation',
      createdAt: '2024-08-04T11:20:00Z'
    },
    {
      id: '5',
      organizationId: orgId,
      assetId: 'asset-005',
      assetName: 'Security Camera System',
      currentLocation: 'Security Office',
      status: 'offline',
      lastSeen: '2024-08-06T22:30:00Z',
      trackedBy: 'Security Chief Bones',
      trackingMethod: 'rfid',
      temperature: 26.7,
      humidity: 41,
      batteryLevel: 15,
      signalStrength: 0,
      notes: 'OFFLINE: Low battery detected. Maintenance required',
      createdAt: '2024-08-05T14:45:00Z'
    },
    {
      id: '6',
      organizationId: orgId,
      assetId: 'asset-006',
      assetName: 'Catering Equipment Set',
      currentLocation: 'Galley Storage',
      previousLocation: 'VIP Catering Area',
      status: 'active',
      lastSeen: '2024-08-07T13:20:00Z',
      trackedBy: 'Galley Master Grub',
      trackingMethod: 'barcode',
      temperature: 4.2,
      humidity: 85,
      notes: 'Refrigeration units maintaining proper temperature',
      createdAt: '2024-08-06T09:15:00Z'
    }
  ];

  const filterData = () => {
    let filtered = [...trackingData];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.currentLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.trackedBy.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(item => item.status === selectedStatus);
    }

    // Method filter
    if (selectedMethod !== 'all') {
      filtered = filtered.filter(item => item.trackingMethod === selectedMethod);
    }

    setFilteredData(filtered);
  };

  const handleUpdateLocation = (tracking: AssetTracking) => {
    setSelectedTracking(tracking);
    setShowDrawer(true);
  };

  const handleScanBarcode = () => {
    // Placeholder for barcode scanning functionality
    alert('Barcode scanning feature would be implemented here');
  };

  const getStatusBadge = (status: AssetTracking['status']) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'idle':
        return <Badge variant="secondary">Idle</Badge>;
      case 'in_transit':
        return <Badge variant="warning">In Transit</Badge>;
      case 'maintenance':
        return <Badge variant="warning">Maintenance</Badge>;
      case 'offline':
        return <Badge variant="destructive">Offline</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getMethodBadge = (method: AssetTracking['trackingMethod']) => {
    switch (method) {
      case 'manual':
        return <Badge variant="outline">Manual</Badge>;
      case 'barcode':
        return <Badge variant="secondary">Barcode</Badge>;
      case 'qr_code':
        return <Badge variant="secondary">QR Code</Badge>;
      case 'rfid':
        return <Badge variant="primary">RFID</Badge>;
      case 'gps':
        return <Badge variant="success">GPS</Badge>;
      default:
        return <Badge variant="outline">{method}</Badge>;
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSignalIcon = (strength?: number) => {
    if (!strength) return null;
    if (strength >= 80) return '📶';
    if (strength >= 60) return '📶';
    if (strength >= 40) return '📶';
    if (strength >= 20) return '📶';
    return '📶';
  };

  const getBatteryIcon = (level?: number) => {
    if (!level) return null;
    if (level >= 80) return '🔋';
    if (level >= 60) return '🔋';
    if (level >= 40) return '🔋';
    if (level >= 20) return '🔋';
    return '🪫';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-anton uppercase">Asset Tracking</h1>
          <p className="text-sm text-muted-foreground">Real-time asset location and status monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleScanBarcode} className="flex items-center gap-2">
            <Scan className="w-4 h-4" />
            Scan
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search assets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="idle">Idle</option>
                <option value="in_transit">In Transit</option>
                <option value="maintenance">Maintenance</option>
                <option value="offline">Offline</option>
              </select>
              <select
                value={selectedMethod}
                onChange={(e) => setSelectedMethod(e.target.value)}
                className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Methods</option>
                <option value="manual">Manual</option>
                <option value="barcode">Barcode</option>
                <option value="qr_code">QR Code</option>
                <option value="rfid">RFID</option>
                <option value="gps">GPS</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Tracking Grid */}
      {loading ? (
        <Card>
          <div className="p-8 text-center text-muted-foreground">Loading tracking data...</div>
        </Card>
      ) : filteredData.length === 0 ? (
        <Card>
          <div className="p-8 text-center text-muted-foreground">
            No tracking data found matching your criteria.
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredData.map(tracking => (
            <Card key={tracking.id} className="hover:shadow-md transition-shadow">
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <h3 className="font-semibold truncate">{tracking.assetName}</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    {getStatusBadge(tracking.status)}
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div>
                    <span className="text-xs text-muted-foreground block">Current Location</span>
                    <span className="font-medium">{tracking.currentLocation}</span>
                  </div>
                  
                  {tracking.previousLocation && (
                    <div>
                      <span className="text-xs text-muted-foreground block">Previous Location</span>
                      <span className="text-sm">{tracking.previousLocation}</span>
                    </div>
                  )}

                  <div>
                    <span className="text-xs text-muted-foreground block">Last Seen</span>
                    <span className="text-sm">{formatDateTime(tracking.lastSeen)}</span>
                  </div>

                  <div>
                    <span className="text-xs text-muted-foreground block">Tracked By</span>
                    <span className="text-sm">{tracking.trackedBy}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {getMethodBadge(tracking.trackingMethod)}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {tracking.batteryLevel && (
                      <span className="flex items-center gap-1">
                        {getBatteryIcon(tracking.batteryLevel)}
                        {tracking.batteryLevel}%
                      </span>
                    )}
                    {tracking.signalStrength && (
                      <span className="flex items-center gap-1">
                        {getSignalIcon(tracking.signalStrength)}
                        {tracking.signalStrength}%
                      </span>
                    )}
                  </div>
                </div>

                {(tracking.temperature || tracking.humidity) && (
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    {tracking.temperature && (
                      <div>
                        <span className="text-xs text-muted-foreground block">Temperature</span>
                        <span>{tracking.temperature}°C</span>
                      </div>
                    )}
                    {tracking.humidity && (
                      <div>
                        <span className="text-xs text-muted-foreground block">Humidity</span>
                        <span>{tracking.humidity}%</span>
                      </div>
                    )}
                  </div>
                )}

                {tracking.coordinates && (
                  <div className="mb-4 text-sm">
                    <span className="text-xs text-muted-foreground block">Coordinates</span>
                    <span className="font-mono text-xs">
                      {tracking.coordinates.latitude.toFixed(4)}, {tracking.coordinates.longitude.toFixed(4)}
                    </span>
                  </div>
                )}

                {tracking.notes && (
                  <div className="mt-3 p-3 bg-muted rounded-md">
                    <span className="text-xs text-muted-foreground block mb-1">Notes</span>
                    <p className="text-sm">{tracking.notes}</p>
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <Button
                   
                    variant="outline"
                    onClick={() => handleUpdateLocation(tracking)}
                    className="flex-1"
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Update
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Update Location Drawer */}
      <Drawer
        open={showDrawer}
        onClose={() => setShowDrawer(false)}
        title="Update Asset Location"
        width="md"
      >
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Asset</label>
            <Input
              value={selectedTracking?.assetName || ''}
              disabled
              className="bg-muted"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Current Location</label>
            <Input
              placeholder="Enter new location"
              defaultValue={selectedTracking?.currentLocation}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              defaultValue={selectedTracking?.status}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="active">Active</option>
              <option value="idle">Idle</option>
              <option value="in_transit">In Transit</option>
              <option value="maintenance">Maintenance</option>
              <option value="offline">Offline</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
              placeholder="Update notes"
              defaultValue={selectedTracking?.notes}
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button className="flex-1">
              Update Location
            </Button>
            <Button variant="outline" onClick={() => setShowDrawer(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
