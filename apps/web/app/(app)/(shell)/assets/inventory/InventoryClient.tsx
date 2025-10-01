'use client';


import { useState, useEffect } from 'react';
import { Card, Button, UnifiedInput, Badge, Drawer } from '@ghxstship/ui';
import { Plus, Search, Filter, Download, Upload, Package, Edit, Trash2, Copy } from 'lucide-react';
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
  barcode?: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  purchaseDate?: string;
  purchaseCost?: number;
  currentValue?: number;
  location?: string;
  tags?: string[];
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface InventoryClientProps {
  orgId: string;
}

const ASSET_CATEGORIES = [
  { id: 'site_infrastructure', name: 'Site Infrastructure', color: 'bg-accent' },
  { id: 'site_assets', name: 'Site Assets', color: 'bg-success' },
  { id: 'site_vehicles', name: 'Site Vehicles', color: 'bg-secondary' },
  { id: 'site_services', name: 'Site Services', color: 'bg-warning' },
  { id: 'heavy_machinery', name: 'Heavy Machinery & Equipment', color: 'bg-destructive' },
  { id: 'it_communication', name: 'IT & Communication Services', color: 'bg-info' },
  { id: 'office_admin', name: 'Office & Admin', color: 'bg-secondary' },
  { id: 'access_credentials', name: 'Access & Credentials', color: 'bg-warning' },
  { id: 'parking', name: 'Parking', color: 'bg-accent' },
  { id: 'travel_lodging', name: 'Travel & Lodging', color: 'bg-secondary' },
  { id: 'artist_technical', name: 'Artist Technical', color: 'bg-success' },
  { id: 'artist_hospitality', name: 'Artist Hospitality', color: 'bg-warning' },
  { id: 'artist_travel', name: 'Artist Travel & Lodging', color: 'bg-info' }
] as const;

export default function InventoryClient({ orgId }: InventoryClientProps) {
  const t = useTranslations('assets.inventory');
  const supabase = createBrowserClient();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [view, setView] = useState<'grid' | 'list' | 'kanban'>('grid');

  useEffect(() => {
    loadAssets();
  }, [orgId]);

  useEffect(() => {
    filterAssets();
  }, [assets, searchQuery, selectedCategory, selectedStatus]);

  const loadAssets = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading assets:', error);
        setAssets(generateDemoAssets());
      } else {
        setAssets(data || []);
      }
    } catch (error) {
      console.error('Error loading assets:', error);
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
      barcode: '123456789012',
      manufacturer: 'TrussWorks Pro',
      model: 'TR-5000',
      serialNumber: 'TW-2024-001',
      purchaseDate: '2024-01-01',
      purchaseCost: 50000,
      currentValue: 45000,
      location: 'Main Deck - Stage Area',
      tags: ['rigging', 'stage', 'structural'],
      notes: 'Inspected monthly. Last inspection: 2024-08-15',
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
      barcode: '123456789013',
      manufacturer: 'SoundCraft',
      model: 'SC-8000',
      serialNumber: 'SC-2024-002',
      purchaseDate: '2024-01-15',
      purchaseCost: 30000,
      currentValue: 25000,
      location: 'Equipment Storage - Bay 2',
      tags: ['audio', 'sound', 'mixing'],
      notes: 'Regular maintenance required every 6 months',
      createdAt: '2024-01-15T14:30:00Z'
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
      barcode: '123456789014',
      manufacturer: 'PixelPro',
      model: 'PP-4K-500',
      serialNumber: 'PP-2024-003',
      purchaseDate: '2024-02-01',
      purchaseCost: 40000,
      currentValue: 35000,
      location: 'Tech Workshop',
      tags: ['led', 'video', 'display'],
      notes: 'Currently being serviced - pixel replacement',
      createdAt: '2024-02-01T09:15:00Z'
    },
    {
      id: '4',
      organizationId: orgId,
      name: 'Mobile Generator Unit',
      description: 'Portable 100kW generator for backup power',
      category: 'site_services',
      type: 'fixed',
      status: 'available',
      sku: 'GEN-100-004',
      barcode: '123456789015',
      manufacturer: 'PowerGen',
      model: 'PG-100K',
      serialNumber: 'PG-2024-004',
      purchaseDate: '2024-02-15',
      purchaseCost: 25000,
      currentValue: 22000,
      location: 'Power Station - Backup',
      tags: ['generator', 'power', 'backup'],
      notes: 'Fuel capacity: 500L. Runtime: 8 hours at full load',
      createdAt: '2024-02-15T16:45:00Z'
    },
    {
      id: '5',
      organizationId: orgId,
      name: 'Crew Transport Van',
      description: '15-passenger van for crew transportation',
      category: 'site_vehicles',
      type: 'fixed',
      status: 'in_use',
      sku: 'VAN-CREW-005',
      barcode: '123456789016',
      manufacturer: 'Ford',
      model: 'Transit 350',
      serialNumber: 'FT-2024-005',
      purchaseDate: '2024-03-01',
      purchaseCost: 45000,
      currentValue: 40000,
      location: 'Vehicle Bay 1',
      tags: ['transport', 'crew', 'vehicle'],
      notes: 'Regular maintenance every 5,000 miles. Last service: 2024-08-01',
      createdAt: '2024-03-01T11:20:00Z'
    },
    {
      id: '6',
      organizationId: orgId,
      name: 'Catering Equipment Set',
      description: 'Complete mobile kitchen setup for event catering',
      category: 'artist_hospitality',
      type: 'rentable',
      status: 'available',
      sku: 'CATER-KIT-006',
      barcode: '123456789017',
      manufacturer: 'ChefMaster',
      model: 'CM-Mobile-Pro',
      serialNumber: 'CM-2024-006',
      purchaseDate: '2024-03-15',
      purchaseCost: 15000,
      currentValue: 13000,
      location: 'Galley Storage',
      tags: ['catering', 'kitchen', 'hospitality'],
      notes: 'Includes: grills, warmers, refrigeration, serving equipment',
      createdAt: '2024-03-15T13:10:00Z'
    }
  ];

  const filterAssets = () => {
    let filtered = [...assets];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(asset =>
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(asset => asset.category === selectedCategory);
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(asset => asset.status === selectedStatus);
    }

    setFilteredAssets(filtered);
  };

  const handleCreateAsset = () => {
    setSelectedAsset(null);
    setShowDrawer(true);
  };

  const handleEditAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    setShowDrawer(true);
  };

  const handleDuplicateAsset = (asset: Asset) => {
    const duplicated = {
      ...asset,
      id: crypto.randomUUID(),
      name: `${asset.name} (Copy)`,
      sku: asset.sku ? `${asset.sku}-COPY` : undefined,
      createdAt: new Date().toISOString()
    };
    setAssets(prev => [duplicated, ...prev]);
  };

  const handleDeleteAsset = async (assetId: string) => {
    if (confirm('Are you sure you want to delete this asset?')) {
      setAssets(prev => prev.filter(a => a.id !== assetId));
    }
  };

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

  const getCategoryColor = (category: string) => {
    const categoryInfo = ASSET_CATEGORIES.find(cat => cat.id === category);
    return categoryInfo?.color || 'bg-secondary';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  return (
    <div className="stack-lg">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-3 text-heading-3 font-anton uppercase">Asset Inventory</h1>
          <p className="text-body-sm color-muted">Master catalog of all available assets</p>
        </div>
        <div className="flex items-center gap-sm">
          <Button variant="outline" className="flex items-center gap-sm">
            <Upload className="w-icon-xs h-icon-xs" />
            Import
          </Button>
          <Button variant="outline" className="flex items-center gap-sm">
            <Download className="w-icon-xs h-icon-xs" />
            Export
          </Button>
          <Button onClick={handleCreateAsset} className="flex items-center gap-sm">
            <Plus className="w-icon-xs h-icon-xs" />
            Add Asset
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="p-md">
          <div className="flex flex-wrap items-center gap-md">
            <div className="flex-1 min-w-container-sm">
              <div className="relative">
                <Search className="absolute left-3 top-xs/2 transform -translate-y-1/2 color-muted w-icon-xs h-icon-xs" />
                <UnifiedInput                   placeholder="Search assets..."
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  className="pl-2xl"
                />
              </div>
            </div>
            <div className="flex items-center gap-sm">
              <select
                value={selectedCategory}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedCategory(e.target.value)}
                className=" px-md py-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Categories</option>
                {ASSET_CATEGORIES.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <select
                value={selectedStatus}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedStatus(e.target.value)}
                className=" px-md py-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="in_use">In Use</option>
                <option value="under_maintenance">Under Maintenance</option>
                <option value="damaged">Damaged</option>
                <option value="missing">Missing</option>
                <option value="retired">Retired</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Assets Grid */}
      {loading ? (
        <Card>
          <div className="p-xl text-center color-muted">Loading assets...</div>
        </Card>
      ) : filteredAssets.length === 0 ? (
        <Card>
          <div className="p-xl text-center color-muted">
            No assets found matching your criteria.
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
          {filteredAssets.map(asset => (
            <Card key={asset.id} className="hover:shadow-elevated transition-shadow">
              <div className="p-md">
                <div className="flex items-start justify-between mb-sm">
                  <div className="flex items-center gap-sm">
                    <div className={`w-3 h-3 rounded-full ${getCategoryColor(asset.category)}`} />
                    <h3 className="text-heading-4 truncate">{asset.name}</h3>
                  </div>
                  <div className="flex items-center gap-xs">
                    <Button
                     
                      variant="ghost"
                      onClick={() => handleEditAsset(asset)}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                     
                      variant="ghost"
                      onClick={() => handleDuplicateAsset(asset)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button
                     
                      variant="ghost"
                      onClick={() => handleDeleteAsset(asset.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {asset.description && (
                  <p className="text-body-sm color-muted mb-sm line-clamp-xs">
                    {asset.description}
                  </p>
                )}

                <div className="stack-sm mb-md">
                  <div className="flex items-center justify-between text-body-sm">
                    <span className="color-muted">SKU:</span>
                    <span className="font-mono">{asset.sku || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between text-body-sm">
                    <span className="color-muted">Location:</span>
                    <span>{asset.location || 'Unassigned'}</span>
                  </div>
                  {asset.currentValue && (
                    <div className="flex items-center justify-between text-body-sm">
                      <span className="color-muted">Value:</span>
                      <span className="form-label">{formatCurrency(asset.currentValue)}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <Badge variant="outline">
                    {ASSET_CATEGORIES.find(cat => cat.id === asset.category)?.name}
                  </Badge>
                  {getStatusBadge(asset.status)}
                </div>

                {asset.tags && asset.tags.length > 0 && (
                  <div className="mt-sm flex flex-wrap gap-xs">
                    {asset.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                    {asset.tags.length > 3 && (
                      <Badge variant="secondary">
                        +{asset.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Asset Form Drawer */}
      <Drawer
        open={showDrawer}
        onClose={() => setShowDrawer(false)}
        title={selectedAsset ? 'Edit Asset' : 'Create New Asset'}
       
      >
        <div className="p-lg stack-md">
          <div>
            <label className="block text-body-sm form-label mb-xs">Asset Name</label>
            <UnifiedInput               placeholder="Enter asset name"
              defaultValue={selectedAsset?.name}
            />
          </div>
          <div>
            <label className="block text-body-sm form-label mb-xs">Description</label>
            <UnifiedInput               placeholder="Enter description"
              defaultValue={selectedAsset?.description}
            />
          </div>
          <div className="grid grid-cols-2 gap-md">
            <div>
              <label className="block text-body-sm form-label mb-xs">Category</label>
              <select
                defaultValue={selectedAsset?.category}
                className="w-full  px-md py-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              >
                {ASSET_CATEGORIES.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-body-sm form-label mb-xs">Type</label>
              <select
                defaultValue={selectedAsset?.type}
                className="w-full  px-md py-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              >
                <option value="fixed">Fixed</option>
                <option value="rentable">Rentable</option>
                <option value="service">Service</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-md">
            <div>
              <label className="block text-body-sm form-label mb-xs">SKU</label>
              <UnifiedInput                 placeholder="Enter SKU"
                defaultValue={selectedAsset?.sku}
              />
            </div>
            <div>
              <label className="block text-body-sm form-label mb-xs">Location</label>
              <UnifiedInput                 placeholder="Enter location"
                defaultValue={selectedAsset?.location}
              />
            </div>
          </div>
          <div className="flex gap-sm pt-md">
            <Button className="flex-1">
              {selectedAsset ? 'Update Asset' : 'Create Asset'}
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
