'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Input, Badge, Drawer } from '@ghxstship/ui';
import { Plus, Search, Filter, Download, Upload, Users, Edit, Trash2, Copy, Calendar, MapPin } from 'lucide-react';
import { createBrowserClient } from '@ghxstship/auth';
import { useTranslations } from 'next-intl';

interface AssetAssignment {
  id: string;
  organizationId: string;
  assetId: string;
  assetName: string;
  assigneeType: 'project' | 'crew_member' | 'vendor' | 'partner';
  assigneeId: string;
  assigneeName: string;
  status: 'assigned' | 'in_use' | 'returned' | 'overdue' | 'damaged';
  assignedBy: string;
  assignedDate: string;
  expectedReturnDate?: string;
  actualReturnDate?: string;
  location?: string;
  purpose?: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'damaged';
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AssignmentsClientProps {
  orgId: string;
}

export default function AssignmentsClient({ orgId }: AssignmentsClientProps) {
  const t = useTranslations('assets.assignments');
  const supabase = createBrowserClient();
  const [assignments, setAssignments] = useState<AssetAssignment[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<AssetAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<AssetAssignment | null>(null);
  const [view, setView] = useState<'grid' | 'list' | 'kanban'>('list');

  useEffect(() => {
    loadAssignments();
  }, [orgId]);

  useEffect(() => {
    filterAssignments();
  }, [assignments, searchQuery, selectedStatus, selectedType]);

  const loadAssignments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('asset_assignments')
        .select(`
          *,
          assets!inner(name)
        `)
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading assignments:', error);
        setAssignments(generateDemoAssignments());
      } else {
        const mappedData = (data || []).map(item => ({
          ...item,
          assetName: item.assets?.name || 'Unknown Asset'
        }));
        setAssignments(mappedData);
      }
    } catch (error) {
      console.error('Error loading assignments:', error);
      setAssignments(generateDemoAssignments());
    } finally {
      setLoading(false);
    }
  };

  const generateDemoAssignments = (): AssetAssignment[] => [
    {
      id: '1',
      organizationId: orgId,
      assetId: 'asset-001',
      assetName: 'Professional Sound System',
      assigneeType: 'project',
      assigneeId: 'proj-001',
      assigneeName: 'Summer Festival 2024',
      status: 'in_use',
      assignedBy: 'Captain Blackbeard',
      assignedDate: '2024-08-01T09:00:00Z',
      expectedReturnDate: '2024-08-20T18:00:00Z',
      location: 'Main Stage Area',
      purpose: 'Main stage audio system for headliner performances',
      condition: 'excellent',
      notes: 'Regular sound checks scheduled daily at 10 AM',
      createdAt: '2024-08-01T09:00:00Z'
    },
    {
      id: '2',
      organizationId: orgId,
      assetId: 'asset-002',
      assetName: 'LED Video Wall Panels',
      assigneeType: 'crew_member',
      assigneeId: 'crew-001',
      assigneeName: 'Tech Specialist Sparks',
      status: 'assigned',
      assignedBy: 'First Mate Silver',
      assignedDate: '2024-08-05T14:00:00Z',
      expectedReturnDate: '2024-08-15T17:00:00Z',
      location: 'Tech Workshop',
      purpose: 'Setup and configuration for backdrop display',
      condition: 'good',
      notes: 'Requires calibration before installation',
      createdAt: '2024-08-05T14:00:00Z'
    },
    {
      id: '3',
      organizationId: orgId,
      assetId: 'asset-003',
      assetName: 'Crew Transport Van',
      assigneeType: 'crew_member',
      assigneeId: 'crew-002',
      assigneeName: 'Driver Compass',
      status: 'in_use',
      assignedBy: 'Quartermaster Hook',
      assignedDate: '2024-08-03T08:00:00Z',
      expectedReturnDate: '2024-08-18T20:00:00Z',
      location: 'Vehicle Bay 1',
      purpose: 'Daily crew transportation to venue',
      condition: 'excellent',
      notes: 'Fuel card provided. Daily mileage log required',
      createdAt: '2024-08-03T08:00:00Z'
    },
    {
      id: '4',
      organizationId: orgId,
      assetId: 'asset-004',
      assetName: 'Mobile Generator Unit',
      assigneeType: 'vendor',
      assigneeId: 'vendor-001',
      assigneeName: 'PowerTech Solutions',
      status: 'returned',
      assignedBy: 'Chief Engineer Sparks',
      assignedDate: '2024-07-20T10:00:00Z',
      expectedReturnDate: '2024-08-10T16:00:00Z',
      actualReturnDate: '2024-08-09T15:30:00Z',
      location: 'Power Station - Backup',
      purpose: 'Emergency power backup during setup phase',
      condition: 'good',
      notes: 'Returned early - no longer needed. Fuel tank full',
      createdAt: '2024-07-20T10:00:00Z'
    },
    {
      id: '5',
      organizationId: orgId,
      assetId: 'asset-005',
      assetName: 'Security Camera System',
      assigneeType: 'partner',
      assigneeId: 'partner-001',
      assigneeName: 'SecureGuard Services',
      status: 'overdue',
      assignedBy: 'Security Chief Bones',
      assignedDate: '2024-07-15T12:00:00Z',
      expectedReturnDate: '2024-08-05T18:00:00Z',
      location: 'Security Office',
      purpose: 'Perimeter monitoring and access control',
      condition: 'fair',
      notes: 'OVERDUE: Follow up required. Some cameras showing connectivity issues',
      createdAt: '2024-07-15T12:00:00Z'
    },
    {
      id: '6',
      organizationId: orgId,
      assetId: 'asset-006',
      assetName: 'Catering Equipment Set',
      assigneeType: 'project',
      assigneeId: 'proj-002',
      assigneeName: 'VIP Hospitality Setup',
      status: 'damaged',
      assignedBy: 'Galley Master Grub',
      assignedDate: '2024-08-02T11:00:00Z',
      expectedReturnDate: '2024-08-16T19:00:00Z',
      location: 'VIP Catering Area',
      purpose: 'Premium catering service for VIP guests',
      condition: 'damaged',
      notes: 'DAMAGED: Refrigeration unit malfunctioned. Replacement parts ordered',
      createdAt: '2024-08-02T11:00:00Z'
    }
  ];

  const filterAssignments = () => {
    let filtered = [...assignments];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(assignment =>
        assignment.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assignment.assigneeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assignment.assignedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assignment.purpose?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(assignment => assignment.status === selectedStatus);
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(assignment => assignment.assigneeType === selectedType);
    }

    setFilteredAssignments(filtered);
  };

  const handleCreateAssignment = () => {
    setSelectedAssignment(null);
    setShowDrawer(true);
  };

  const handleEditAssignment = (assignment: AssetAssignment) => {
    setSelectedAssignment(assignment);
    setShowDrawer(true);
  };

  const handleReturnAsset = async (assignmentId: string) => {
    if (confirm('Mark this asset as returned?')) {
      setAssignments(prev => prev.map(a => 
        a.id === assignmentId 
          ? { ...a, status: 'returned' as const, actualReturnDate: new Date().toISOString() }
          : a
      ));
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (confirm('Are you sure you want to delete this assignment?')) {
      setAssignments(prev => prev.filter(a => a.id !== assignmentId));
    }
  };

  const getStatusBadge = (status: AssetAssignment['status']) => {
    switch (status) {
      case 'assigned':
        return <Badge variant="secondary">Assigned</Badge>;
      case 'in_use':
        return <Badge variant="success">In Use</Badge>;
      case 'returned':
        return <Badge variant="outline">Returned</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>;
      case 'damaged':
        return <Badge variant="destructive">Damaged</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getConditionBadge = (condition: AssetAssignment['condition']) => {
    switch (condition) {
      case 'excellent':
        return <Badge variant="success">Excellent</Badge>;
      case 'good':
        return <Badge variant="secondary">Good</Badge>;
      case 'fair':
        return <Badge variant="warning">Fair</Badge>;
      case 'poor':
        return <Badge variant="warning">Poor</Badge>;
      case 'damaged':
        return <Badge variant="destructive">Damaged</Badge>;
      default:
        return <Badge variant="outline">{condition}</Badge>;
    }
  };

  const getAssigneeTypeBadge = (type: AssetAssignment['assigneeType']) => {
    switch (type) {
      case 'project':
        return <Badge variant="primary">Project</Badge>;
      case 'crew_member':
        return <Badge variant="secondary">Crew</Badge>;
      case 'vendor':
        return <Badge variant="outline">Vendor</Badge>;
      case 'partner':
        return <Badge variant="outline">Partner</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isOverdue = (assignment: AssetAssignment) => {
    if (!assignment.expectedReturnDate || assignment.actualReturnDate) return false;
    return new Date(assignment.expectedReturnDate) < new Date();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-anton uppercase">Asset Assignments</h1>
          <p className="text-sm text-muted-foreground">Track asset assignments and returns</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button onClick={handleCreateAssignment} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Assignment
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
                  placeholder="Search assignments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="project">Project</option>
                <option value="crew_member">Crew Member</option>
                <option value="vendor">Vendor</option>
                <option value="partner">Partner</option>
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="assigned">Assigned</option>
                <option value="in_use">In Use</option>
                <option value="returned">Returned</option>
                <option value="overdue">Overdue</option>
                <option value="damaged">Damaged</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Assignments List */}
      {loading ? (
        <Card>
          <div className="p-8 text-center text-muted-foreground">Loading assignments...</div>
        </Card>
      ) : filteredAssignments.length === 0 ? (
        <Card>
          <div className="p-8 text-center text-muted-foreground">
            No assignments found matching your criteria.
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAssignments.map(assignment => (
            <Card key={assignment.id} className={`hover:shadow-md transition-shadow ${isOverdue(assignment) ? 'border-red-200 bg-red-50' : ''}`}>
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <h3 className="font-semibold">{assignment.assetName}</h3>
                      <p className="text-sm text-muted-foreground">
                        Assigned to {assignment.assigneeName} • {formatDate(assignment.assignedDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(assignment.status)}
                    {getAssigneeTypeBadge(assignment.assigneeType)}
                    <div className="flex items-center gap-1 ml-2">
                      {assignment.status === 'in_use' && (
                        <Button
                         
                          variant="outline"
                          onClick={() => handleReturnAsset(assignment.id)}
                        >
                          Return
                        </Button>
                      )}
                      <Button
                       
                        variant="ghost"
                        onClick={() => handleEditAssignment(assignment)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                       
                        variant="ghost"
                        onClick={() => handleDeleteAssignment(assignment.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                {assignment.purpose && (
                  <p className="text-sm text-muted-foreground mb-3">
                    {assignment.purpose}
                  </p>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <span className="text-xs text-muted-foreground block">Assigned By</span>
                    <span className="font-medium">{assignment.assignedBy}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Expected Return</span>
                    <span className={`font-medium ${isOverdue(assignment) ? 'text-red-600' : ''}`}>
                      {assignment.expectedReturnDate ? formatDate(assignment.expectedReturnDate) : 'TBD'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Location</span>
                    <span className="font-medium">{assignment.location || 'Unspecified'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Condition</span>
                    {getConditionBadge(assignment.condition)}
                  </div>
                </div>

                {assignment.actualReturnDate && (
                  <div className="flex items-center gap-4 text-sm mb-3">
                    <span className="text-muted-foreground">Returned:</span>
                    <span className="font-medium">{formatDate(assignment.actualReturnDate)}</span>
                  </div>
                )}

                {assignment.notes && (
                  <div className="mt-3 p-3 bg-muted rounded-md">
                    <span className="text-xs text-muted-foreground block mb-1">Notes</span>
                    <p className="text-sm">{assignment.notes}</p>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Assignment Form Drawer */}
      <Drawer
        open={showDrawer}
        onClose={() => setShowDrawer(false)}
        title={selectedAssignment ? 'Edit Assignment' : 'New Asset Assignment'}
       
      >
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Asset</label>
            <Input
              placeholder="Select asset"
              defaultValue={selectedAssignment?.assetName}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Assignee Type</label>
              <select
                defaultValue={selectedAssignment?.assigneeType}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="project">Project</option>
                <option value="crew_member">Crew Member</option>
                <option value="vendor">Vendor</option>
                <option value="partner">Partner</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Assignee</label>
              <Input
                placeholder="Select assignee"
                defaultValue={selectedAssignment?.assigneeName}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Expected Return Date</label>
              <Input
                type="date"
                defaultValue={selectedAssignment?.expectedReturnDate?.split('T')[0]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <Input
                placeholder="Assignment location"
                defaultValue={selectedAssignment?.location}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Purpose</label>
            <Input
              placeholder="Purpose of assignment"
              defaultValue={selectedAssignment?.purpose}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Additional notes"
              defaultValue={selectedAssignment?.notes}
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button className="flex-1">
              {selectedAssignment ? 'Update Assignment' : 'Create Assignment'}
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
