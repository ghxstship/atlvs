'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Input, Badge, Drawer } from '@ghxstship/ui';
import { Plus, Search, Filter, Download, Upload, Wrench, Edit, Trash2, Copy, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { createBrowserClient } from '@ghxstship/auth';
import { useTranslations } from 'next-intl';

interface MaintenanceRecord {
  id: string;
  organizationId: string;
  assetId: string;
  assetName: string;
  type: 'preventive' | 'corrective' | 'emergency' | 'inspection';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description?: string;
  scheduledDate: string;
  completedDate?: string;
  estimatedDuration?: number;
  actualDuration?: number;
  assignedTo?: string;
  performedBy?: string;
  vendor?: string;
  cost?: number;
  partsUsed?: string[];
  nextMaintenanceDate?: string;
  notes?: string;
  attachments?: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface MaintenanceClientProps {
  orgId: string;
}

export default function MaintenanceClient({ orgId }: MaintenanceClientProps) {
  const t = useTranslations('assets.maintenance');
  const supabase = createBrowserClient();
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MaintenanceRecord | null>(null);
  const [view, setView] = useState<'grid' | 'list' | 'kanban'>('list');

  useEffect(() => {
    loadRecords();
  }, [orgId]);

  useEffect(() => {
    filterRecords();
  }, [records, searchQuery, selectedType, selectedStatus, selectedPriority]);

  const loadRecords = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('asset_maintenance')
        .select(`
          *,
          assets!inner(name)
        `)
        .eq('organization_id', orgId)
        .order('scheduled_date', { ascending: true });

      if (error) {
        console.error('Error loading maintenance records:', error);
        setRecords(generateDemoRecords());
      } else {
        const mappedData = (data || []).map(item => ({
          ...item,
          assetName: item.assets?.name || 'Unknown Asset'
        }));
        setRecords(mappedData);
      }
    } catch (error) {
      console.error('Error loading maintenance records:', error);
      setRecords(generateDemoRecords());
    } finally {
      setLoading(false);
    }
  };

  const generateDemoRecords = (): MaintenanceRecord[] => [
    {
      id: '1',
      organizationId: orgId,
      assetId: 'asset-001',
      assetName: 'Professional Sound System',
      type: 'preventive',
      status: 'scheduled',
      priority: 'medium',
      title: 'Quarterly Audio System Inspection',
      description: 'Comprehensive check of all audio components, connections, and calibration',
      scheduledDate: '2024-08-15T10:00:00Z',
      estimatedDuration: 180,
      assignedTo: 'Tech Specialist Sparks',
      cost: 500,
      partsUsed: [],
      nextMaintenanceDate: '2024-11-15T10:00:00Z',
      notes: 'Include microphone sensitivity testing and speaker alignment check',
      createdAt: '2024-08-01T09:00:00Z'
    },
    {
      id: '2',
      organizationId: orgId,
      assetId: 'asset-002',
      assetName: 'LED Video Wall Panels',
      type: 'corrective',
      status: 'in_progress',
      priority: 'high',
      title: 'Pixel Replacement and Calibration',
      description: 'Replace faulty LED pixels and recalibrate color accuracy',
      scheduledDate: '2024-08-08T09:00:00Z',
      estimatedDuration: 240,
      assignedTo: 'Display Technician',
      performedBy: 'Display Technician',
      vendor: 'PixelPro Service',
      cost: 1200,
      partsUsed: ['LED Pixel Module x12', 'Control Board'],
      notes: 'Customer reported color inconsistencies in lower right quadrant',
      createdAt: '2024-08-07T14:30:00Z'
    },
    {
      id: '3',
      organizationId: orgId,
      assetId: 'asset-003',
      assetName: 'Crew Transport Van',
      type: 'preventive',
      status: 'completed',
      priority: 'medium',
      title: '5,000 Mile Service',
      description: 'Oil change, tire rotation, brake inspection, and fluid checks',
      scheduledDate: '2024-08-01T08:00:00Z',
      completedDate: '2024-08-01T10:30:00Z',
      estimatedDuration: 120,
      actualDuration: 150,
      assignedTo: 'Fleet Maintenance',
      performedBy: 'Mechanic Wrench',
      cost: 350,
      partsUsed: ['Engine Oil', 'Oil Filter', 'Air Filter'],
      nextMaintenanceDate: '2024-10-01T08:00:00Z',
      notes: 'All systems checked and operational. Tire pressure adjusted',
      createdAt: '2024-07-25T16:00:00Z'
    },
    {
      id: '4',
      organizationId: orgId,
      assetId: 'asset-004',
      assetName: 'Mobile Generator Unit',
      type: 'inspection',
      status: 'overdue',
      priority: 'critical',
      title: 'Monthly Safety Inspection',
      description: 'Safety systems check, fuel quality test, and load testing',
      scheduledDate: '2024-08-05T14:00:00Z',
      estimatedDuration: 90,
      assignedTo: 'Chief Engineer Sparks',
      cost: 200,
      notes: 'OVERDUE: Critical safety inspection required before next use',
      createdAt: '2024-07-30T11:00:00Z'
    },
    {
      id: '5',
      organizationId: orgId,
      assetId: 'asset-005',
      assetName: 'Security Camera System',
      type: 'emergency',
      status: 'completed',
      priority: 'critical',
      title: 'Camera Network Connectivity Repair',
      description: 'Emergency repair of network connectivity issues affecting multiple cameras',
      scheduledDate: '2024-08-06T20:00:00Z',
      completedDate: '2024-08-06T23:45:00Z',
      estimatedDuration: 120,
      actualDuration: 225,
      assignedTo: 'IT Support Team',
      performedBy: 'Network Specialist Cable',
      vendor: 'SecureTech Emergency Service',
      cost: 800,
      partsUsed: ['Network Switch', 'Cat6 Cables x8'],
      notes: 'Emergency repair completed. Network switch failure was root cause',
      createdAt: '2024-08-06T19:30:00Z'
    },
    {
      id: '6',
      organizationId: orgId,
      assetId: 'asset-006',
      assetName: 'Catering Equipment Set',
      type: 'corrective',
      status: 'cancelled',
      priority: 'low',
      title: 'Refrigeration Unit Thermostat Replacement',
      description: 'Replace faulty thermostat in main refrigeration unit',
      scheduledDate: '2024-08-10T11:00:00Z',
      estimatedDuration: 60,
      assignedTo: 'Appliance Technician',
      cost: 150,
      notes: 'CANCELLED: Unit replaced entirely instead of repair',
      createdAt: '2024-08-03T13:20:00Z'
    }
  ];

  const filterRecords = () => {
    let filtered = [...records];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(record =>
        record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.assignedTo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(record => record.type === selectedType);
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(record => record.status === selectedStatus);
    }

    // Priority filter
    if (selectedPriority !== 'all') {
      filtered = filtered.filter(record => record.priority === selectedPriority);
    }

    setFilteredRecords(filtered);
  };

  const handleCreateRecord = () => {
    setSelectedRecord(null);
    setShowDrawer(true);
  };

  const handleEditRecord = (record: MaintenanceRecord) => {
    setSelectedRecord(record);
    setShowDrawer(true);
  };

  const handleCompleteRecord = async (recordId: string) => {
    if (confirm('Mark this maintenance record as completed?')) {
      setRecords(prev => prev.map(r => 
        r.id === recordId 
          ? { ...r, status: 'completed' as const, completedDate: new Date().toISOString() }
          : r
      ));
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (confirm('Are you sure you want to delete this maintenance record?')) {
      setRecords(prev => prev.filter(r => r.id !== recordId));
    }
  };

  const getStatusBadge = (status: MaintenanceRecord['status']) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="secondary">Scheduled</Badge>;
      case 'in_progress':
        return <Badge variant="warning">In Progress</Badge>;
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="outline">Cancelled</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: MaintenanceRecord['priority']) => {
    switch (priority) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'high':
        return <Badge variant="warning">High</Badge>;
      case 'medium':
        return <Badge variant="secondary">Medium</Badge>;
      case 'low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getTypeBadge = (type: MaintenanceRecord['type']) => {
    switch (type) {
      case 'preventive':
        return <Badge variant="success">Preventive</Badge>;
      case 'corrective':
        return <Badge variant="warning">Corrective</Badge>;
      case 'emergency':
        return <Badge variant="destructive">Emergency</Badge>;
      case 'inspection':
        return <Badge variant="secondary">Inspection</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const isOverdue = (record: MaintenanceRecord) => {
    if (record.status === 'completed' || record.status === 'cancelled') return false;
    return new Date(record.scheduledDate) < new Date();
  };

  return (
    <div className="stack-lg">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-3 text-heading-3 font-anton uppercase">Asset Maintenance</h1>
          <p className="text-body-sm color-muted">Schedule and track asset maintenance activities</p>
        </div>
        <div className="flex items-center gap-sm">
          <Button variant="outline" className="flex items-center gap-sm">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button onClick={handleCreateRecord} className="flex items-center gap-sm">
            <Plus className="w-4 h-4" />
            Schedule Maintenance
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="p-md">
          <div className="flex flex-wrap items-center gap-md">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 color-muted w-4 h-4" />
                <Input
                  placeholder="Search maintenance records..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-2xl"
                />
              </div>
            </div>
            <div className="flex items-center gap-sm">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-sm py-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Types</option>
                <option value="preventive">Preventive</option>
                <option value="corrective">Corrective</option>
                <option value="emergency">Emergency</option>
                <option value="inspection">Inspection</option>
              </select>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="px-sm py-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-sm py-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Records List */}
      {loading ? (
        <Card>
          <div className="p-xl text-center color-muted">Loading maintenance records...</div>
        </Card>
      ) : filteredRecords.length === 0 ? (
        <Card>
          <div className="p-xl text-center color-muted">
            No maintenance records found matching your criteria.
          </div>
        </Card>
      ) : (
        <div className="stack-md">
          {filteredRecords.map(record => (
            <Card key={record.id} className={`hover:shadow-md transition-shadow ${isOverdue(record) ? 'border-destructive/20 bg-destructive/10' : ''}`}>
              <div className="p-md">
                <div className="flex items-start justify-between mb-sm">
                  <div className="flex items-center gap-sm">
                    <Wrench className="w-5 h-5 color-muted" />
                    <div>
                      <h3 className="text-heading-4">{record.title}</h3>
                      <p className="text-body-sm color-muted">
                        {record.assetName} • Scheduled: {formatDateTime(record.scheduledDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-sm">
                    {getPriorityBadge(record.priority)}
                    {getTypeBadge(record.type)}
                    {getStatusBadge(record.status)}
                    <div className="flex items-center gap-xs ml-sm">
                      {record.status === 'scheduled' && (
                        <Button
                         
                          variant="outline"
                          onClick={() => handleCompleteRecord(record.id)}
                        >
                          Complete
                        </Button>
                      )}
                      <Button
                       
                        variant="ghost"
                        onClick={() => handleEditRecord(record)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                       
                        variant="ghost"
                        onClick={() => handleDeleteRecord(record.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                {record.description && (
                  <p className="text-body-sm color-muted mb-sm">
                    {record.description}
                  </p>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-md mb-md">
                  <div>
                    <span className="text-body-sm color-muted block">Assigned To</span>
                    <span className="form-label">{record.assignedTo || 'Unassigned'}</span>
                  </div>
                  <div>
                    <span className="text-body-sm color-muted block">Duration</span>
                    <span className="form-label">
                      {record.actualDuration || record.estimatedDuration} min
                    </span>
                  </div>
                  <div>
                    <span className="text-body-sm color-muted block">Cost</span>
                    <span className="form-label">
                      {record.cost ? formatCurrency(record.cost) : 'TBD'}
                    </span>
                  </div>
                  <div>
                    <span className="text-body-sm color-muted block">Next Maintenance</span>
                    <span className="form-label">
                      {record.nextMaintenanceDate ? formatDateTime(record.nextMaintenanceDate) : 'TBD'}
                    </span>
                  </div>
                </div>

                {record.completedDate && (
                  <div className="flex items-center gap-md text-body-sm mb-sm">
                    <span className="color-muted">Completed:</span>
                    <span className="form-label">{formatDateTime(record.completedDate)}</span>
                    {record.performedBy && (
                      <>
                        <span className="color-muted">By:</span>
                        <span>{record.performedBy}</span>
                      </>
                    )}
                  </div>
                )}

                {record.partsUsed && record.partsUsed.length > 0 && (
                  <div className="mb-sm">
                    <span className="text-body-sm color-muted block mb-xs">Parts Used</span>
                    <div className="flex flex-wrap gap-xs">
                      {record.partsUsed.map((part, index) => (
                        <Badge key={index} variant="outline" className="text-body-sm">
                          {part}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {record.vendor && (
                  <div className="flex items-center gap-md text-body-sm mb-sm">
                    <span className="color-muted">Vendor:</span>
                    <span className="form-label">{record.vendor}</span>
                  </div>
                )}

                {record.notes && (
                  <div className="mt-sm p-sm bg-secondary rounded-md">
                    <span className="text-body-sm color-muted block mb-xs">Notes</span>
                    <p className="text-body-sm">{record.notes}</p>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Maintenance Form Drawer */}
      <Drawer
        open={showDrawer}
        onClose={() => setShowDrawer(false)}
        title={selectedRecord ? 'Edit Maintenance Record' : 'Schedule Maintenance'}
       
      >
        <div className="p-lg stack-md">
          <div>
            <label className="block text-body-sm form-label mb-xs">Title</label>
            <Input
              placeholder="Enter maintenance title"
              defaultValue={selectedRecord?.title}
            />
          </div>
          <div>
            <label className="block text-body-sm form-label mb-xs">Asset</label>
            <Input
              placeholder="Select asset"
              defaultValue={selectedRecord?.assetName}
            />
          </div>
          <div className="grid grid-cols-3 gap-md">
            <div>
              <label className="block text-body-sm form-label mb-xs">Type</label>
              <select
                defaultValue={selectedRecord?.type}
                className="w-full px-sm py-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="preventive">Preventive</option>
                <option value="corrective">Corrective</option>
                <option value="emergency">Emergency</option>
                <option value="inspection">Inspection</option>
              </select>
            </div>
            <div>
              <label className="block text-body-sm form-label mb-xs">Priority</label>
              <select
                defaultValue={selectedRecord?.priority}
                className="w-full px-sm py-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-body-sm form-label mb-xs">Duration (min)</label>
              <Input
                type="number"
                placeholder="60"
                defaultValue={selectedRecord?.estimatedDuration}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-md">
            <div>
              <label className="block text-body-sm form-label mb-xs">Scheduled Date</label>
              <Input
                type="datetime-local"
                defaultValue={selectedRecord?.scheduledDate?.slice(0, 16)}
              />
            </div>
            <div>
              <label className="block text-body-sm form-label mb-xs">Assigned To</label>
              <Input
                placeholder="Select technician"
                defaultValue={selectedRecord?.assignedTo}
              />
            </div>
          </div>
          <div>
            <label className="block text-body-sm form-label mb-xs">Description</label>
            <textarea
              className="w-full px-sm py-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
              placeholder="Maintenance description"
              defaultValue={selectedRecord?.description}
            />
          </div>
          <div>
            <label className="block text-body-sm form-label mb-xs">Notes</label>
            <textarea
              className="w-full px-sm py-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              rows={2}
              placeholder="Additional notes"
              defaultValue={selectedRecord?.notes}
            />
          </div>
          <div className="flex gap-sm pt-md">
            <Button className="flex-1">
              {selectedRecord ? 'Update Record' : 'Schedule Maintenance'}
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
