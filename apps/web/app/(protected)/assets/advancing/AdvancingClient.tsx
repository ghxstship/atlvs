'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Input, Badge, Drawer } from '@ghxstship/ui';
import { Plus, Search, Filter, Download, Upload, Package, Edit, Trash2, Copy, Calendar, DollarSign } from 'lucide-react';
import { createBrowserClient } from '@ghxstship/auth';
import { useTranslations } from 'next-intl';

interface AdvancingItem {
  id: string;
  organizationId: string;
  projectId?: string;
  assetId?: string;
  name: string;
  description?: string;
  category: string;
  type: 'purchase' | 'rental' | 'service';
  status: 'requested' | 'approved' | 'ordered' | 'delivered' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  requestedBy: string;
  approvedBy?: string;
  vendor?: string;
  estimatedCost?: number;
  actualCost?: number;
  quantity: number;
  unit?: string;
  requestedDate: string;
  neededBy?: string;
  deliveryDate?: string;
  location?: string;
  notes?: string;
  attachments?: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface AdvancingClientProps {
  orgId: string;
}

const ASSET_CATEGORIES = [
  { id: 'site_infrastructure', name: 'Site Infrastructure', color: 'bg-blue-500' },
  { id: 'site_assets', name: 'Site Assets', color: 'bg-green-500' },
  { id: 'site_vehicles', name: 'Site Vehicles', color: 'bg-purple-500' },
  { id: 'site_services', name: 'Site Services', color: 'bg-orange-500' },
  { id: 'heavy_machinery', name: 'Heavy Machinery & Equipment', color: 'bg-red-500' },
  { id: 'it_communication', name: 'IT & Communication Services', color: 'bg-cyan-500' },
  { id: 'office_admin', name: 'Office & Admin', color: 'bg-gray-500' },
  { id: 'access_credentials', name: 'Access & Credentials', color: 'bg-yellow-500' },
  { id: 'parking', name: 'Parking', color: 'bg-indigo-500' },
  { id: 'travel_lodging', name: 'Travel & Lodging', color: 'bg-pink-500' },
  { id: 'artist_technical', name: 'Artist Technical', color: 'bg-emerald-500' },
  { id: 'artist_hospitality', name: 'Artist Hospitality', color: 'bg-amber-500' },
  { id: 'artist_travel', name: 'Artist Travel & Lodging', color: 'bg-teal-500' }
] as const;

export default function AdvancingClient({ orgId }: AdvancingClientProps) {
  const t = useTranslations('assets.advancing');
  const supabase = createBrowserClient();
  const [items, setItems] = useState<AdvancingItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<AdvancingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedItem, setSelectedItem] = useState<AdvancingItem | null>(null);
  const [view, setView] = useState<'grid' | 'list' | 'kanban'>('list');

  useEffect(() => {
    loadItems();
  }, [orgId]);

  useEffect(() => {
    filterItems();
  }, [items, searchQuery, selectedCategory, selectedStatus, selectedType]);

  const loadItems = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('asset_advancing')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading advancing items:', error);
        setItems(generateDemoItems());
      } else {
        setItems(data || []);
      }
    } catch (error) {
      console.error('Error loading advancing items:', error);
      setItems(generateDemoItems());
    } finally {
      setLoading(false);
    }
  };

  const generateDemoItems = (): AdvancingItem[] => [
    {
      id: '1',
      organizationId: orgId,
      projectId: 'proj-001',
      name: 'Additional Stage Lighting Rig',
      description: 'Extra LED wash lights and spotlights for main stage performance',
      category: 'artist_technical',
      type: 'rental',
      status: 'approved',
      priority: 'high',
      requestedBy: 'Captain Blackbeard',
      approvedBy: 'First Mate Silver',
      vendor: 'Lighting Solutions Co.',
      estimatedCost: 5000,
      actualCost: 4800,
      quantity: 12,
      unit: 'fixtures',
      requestedDate: '2024-08-01T10:00:00Z',
      neededBy: '2024-08-15T18:00:00Z',
      deliveryDate: '2024-08-14T14:00:00Z',
      location: 'Main Stage Area',
      notes: 'Need DMX control capability and weather protection',
      createdAt: '2024-08-01T10:00:00Z'
    },
    {
      id: '2',
      organizationId: orgId,
      projectId: 'proj-002',
      name: 'Crew Catering Service',
      description: 'Daily meal service for 50 crew members during event week',
      category: 'artist_hospitality',
      type: 'service',
      status: 'ordered',
      priority: 'medium',
      requestedBy: 'Quartermaster Hook',
      approvedBy: 'Captain Blackbeard',
      vendor: 'Galley Grub Catering',
      estimatedCost: 8000,
      quantity: 7,
      unit: 'days',
      requestedDate: '2024-07-20T09:00:00Z',
      neededBy: '2024-08-10T07:00:00Z',
      location: 'Crew Mess Hall',
      notes: 'Include vegetarian and gluten-free options. Setup required by 6 AM daily',
      createdAt: '2024-07-20T09:00:00Z'
    },
    {
      id: '3',
      organizationId: orgId,
      name: 'Portable Generator Rental',
      description: 'Backup power generation for emergency situations',
      category: 'site_services',
      type: 'rental',
      status: 'requested',
      priority: 'urgent',
      requestedBy: 'Chief Engineer Sparks',
      vendor: 'Power Pro Rentals',
      estimatedCost: 1200,
      quantity: 2,
      unit: 'units',
      requestedDate: '2024-08-05T14:30:00Z',
      neededBy: '2024-08-12T08:00:00Z',
      location: 'Power Distribution Center',
      notes: 'Minimum 50kW capacity each. Fuel included for 48 hours operation',
      createdAt: '2024-08-05T14:30:00Z'
    },
    {
      id: '4',
      organizationId: orgId,
      projectId: 'proj-001',
      name: 'Security Equipment Package',
      description: 'Additional security cameras and access control systems',
      category: 'site_infrastructure',
      type: 'purchase',
      status: 'delivered',
      priority: 'high',
      requestedBy: 'Security Chief Bones',
      approvedBy: 'First Mate Silver',
      vendor: 'SecureTech Systems',
      estimatedCost: 3500,
      actualCost: 3200,
      quantity: 1,
      unit: 'package',
      requestedDate: '2024-07-15T11:00:00Z',
      neededBy: '2024-08-01T12:00:00Z',
      deliveryDate: '2024-07-30T10:00:00Z',
      location: 'Security Office',
      notes: 'Installation completed. System operational and tested',
      createdAt: '2024-07-15T11:00:00Z'
    },
    {
      id: '5',
      organizationId: orgId,
      name: 'Artist Transportation Service',
      description: 'VIP transport for headlining performers',
      category: 'artist_travel',
      type: 'service',
      status: 'approved',
      priority: 'high',
      requestedBy: 'Artist Relations Parrot',
      approvedBy: 'Captain Blackbeard',
      vendor: 'Luxury Fleet Services',
      estimatedCost: 2500,
      quantity: 3,
      unit: 'vehicles',
      requestedDate: '2024-07-25T16:00:00Z',
      neededBy: '2024-08-16T19:00:00Z',
      location: 'VIP Entrance',
      notes: 'Black SUVs preferred. Professional chauffeurs required',
      createdAt: '2024-07-25T16:00:00Z'
    },
    {
      id: '6',
      organizationId: orgId,
      name: 'Temporary Office Setup',
      description: 'Mobile office units for production management',
      category: 'office_admin',
      type: 'rental',
      status: 'cancelled',
      priority: 'low',
      requestedBy: 'Admin Assistant Compass',
      vendor: 'Mobile Office Solutions',
      estimatedCost: 1800,
      quantity: 2,
      unit: 'units',
      requestedDate: '2024-07-10T13:00:00Z',
      neededBy: '2024-08-05T09:00:00Z',
      location: 'Administration Area',
      notes: 'Cancelled - decided to use existing facilities instead',
      createdAt: '2024-07-10T13:00:00Z'
    }
  ];

  const filterItems = () => {
    let filtered = [...items];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.vendor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.requestedBy.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(item => item.status === selectedStatus);
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(item => item.type === selectedType);
    }

    setFilteredItems(filtered);
  };

  const handleCreateItem = () => {
    setSelectedItem(null);
    setShowDrawer(true);
  };

  const handleEditItem = (item: AdvancingItem) => {
    setSelectedItem(item);
    setShowDrawer(true);
  };

  const handleDuplicateItem = (item: AdvancingItem) => {
    const duplicated = {
      ...item,
      id: crypto.randomUUID(),
      name: `${item.name} (Copy)`,
      status: 'requested' as const,
      createdAt: new Date().toISOString()
    };
    setItems(prev => [duplicated, ...prev]);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (confirm('Are you sure you want to delete this advancing item?')) {
      setItems(prev => prev.filter(i => i.id !== itemId));
    }
  };

  const getStatusBadge = (status: AdvancingItem['status']) => {
    switch (status) {
      case 'requested':
        return <Badge variant="secondary">Requested</Badge>;
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'ordered':
        return <Badge variant="warning">Ordered</Badge>;
      case 'delivered':
        return <Badge variant="success">Delivered</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: AdvancingItem['priority']) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive">Urgent</Badge>;
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

  const getTypeBadge = (type: AdvancingItem['type']) => {
    switch (type) {
      case 'purchase':
        return <Badge variant="primary">Purchase</Badge>;
      case 'rental':
        return <Badge variant="secondary">Rental</Badge>;
      case 'service':
        return <Badge variant="outline">Service</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getCategoryColor = (category: string) => {
    const categoryInfo = ASSET_CATEGORIES.find(cat => cat.id === category);
    return categoryInfo?.color || 'bg-gray-500';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-anton uppercase">Asset Advancing</h1>
          <p className="text-sm text-muted-foreground">Request and manage asset procurement</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button onClick={handleCreateItem} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Request
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
                  placeholder="Search requests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {ASSET_CATEGORIES.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="purchase">Purchase</option>
                <option value="rental">Rental</option>
                <option value="service">Service</option>
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="requested">Requested</option>
                <option value="approved">Approved</option>
                <option value="ordered">Ordered</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Items List */}
      {loading ? (
        <Card>
          <div className="p-8 text-center text-muted-foreground">Loading advancing requests...</div>
        </Card>
      ) : filteredItems.length === 0 ? (
        <Card>
          <div className="p-8 text-center text-muted-foreground">
            No advancing requests found matching your criteria.
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredItems.map(item => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getCategoryColor(item.category)}`} />
                    <div>
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Requested by {item.requestedBy} • {formatDate(item.requestedDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getPriorityBadge(item.priority)}
                    {getStatusBadge(item.status)}
                    <div className="flex items-center gap-1 ml-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditItem(item)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDuplicateItem(item)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                {item.description && (
                  <p className="text-sm text-muted-foreground mb-3">
                    {item.description}
                  </p>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <span className="text-xs text-muted-foreground block">Type</span>
                    {getTypeBadge(item.type)}
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Quantity</span>
                    <span className="font-medium">{item.quantity} {item.unit}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Estimated Cost</span>
                    <span className="font-medium">
                      {item.estimatedCost ? formatCurrency(item.estimatedCost) : 'TBD'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Needed By</span>
                    <span className="font-medium">
                      {item.neededBy ? formatDate(item.neededBy) : 'TBD'}
                    </span>
                  </div>
                </div>

                {item.vendor && (
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">Vendor:</span>
                    <span className="font-medium">{item.vendor}</span>
                    {item.location && (
                      <>
                        <span className="text-muted-foreground">Location:</span>
                        <span>{item.location}</span>
                      </>
                    )}
                  </div>
                )}

                {item.notes && (
                  <div className="mt-3 p-3 bg-muted rounded-md">
                    <span className="text-xs text-muted-foreground block mb-1">Notes</span>
                    <p className="text-sm">{item.notes}</p>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Request Form Drawer */}
      <Drawer
        open={showDrawer}
        onClose={() => setShowDrawer(false)}
        title={selectedItem ? 'Edit Advancing Request' : 'New Advancing Request'}
        width="lg"
      >
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Request Name</label>
            <Input
              placeholder="Enter request name"
              defaultValue={selectedItem?.name}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Input
              placeholder="Enter description"
              defaultValue={selectedItem?.description}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                defaultValue={selectedItem?.category}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {ASSET_CATEGORIES.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                defaultValue={selectedItem?.type}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="purchase">Purchase</option>
                <option value="rental">Rental</option>
                <option value="service">Service</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Quantity</label>
              <Input
                type="number"
                placeholder="1"
                defaultValue={selectedItem?.quantity}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Unit</label>
              <Input
                placeholder="units"
                defaultValue={selectedItem?.unit}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <select
                defaultValue={selectedItem?.priority}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Estimated Cost</label>
              <Input
                type="number"
                placeholder="0.00"
                defaultValue={selectedItem?.estimatedCost}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Needed By</label>
              <Input
                type="date"
                defaultValue={selectedItem?.neededBy?.split('T')[0]}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Additional notes or requirements"
              defaultValue={selectedItem?.notes}
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button className="flex-1">
              {selectedItem ? 'Update Request' : 'Submit Request'}
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
