'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
import { Button, Input, Card, Badge } from '@ghxstship/ui';
import { Plus, Save, BookOpen, Package2, Wrench, Search, Filter, Grid, List } from 'lucide-react';

interface CatalogItem {
  id: string;
  name: string;
  description: string;
  type: 'product' | 'service';
  category: string;
  price: number;
  currency: string;
  supplier?: string;
  status: 'active' | 'inactive' | 'discontinued';
  created_at: string;
  updated_at: string;
}

export default function CatalogClient({ orgId }: { orgId: string }) {
  const t = useTranslations('procurement');
  const sb = createBrowserClient();
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'product' | 'service'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'discontinued'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    loadCatalogItems();
  }, [orgId]);

  useEffect(() => {
    filterItems();
  }, [catalogItems, searchQuery, typeFilter, statusFilter]);

  const loadCatalogItems = async () => {
    try {
      setLoading(true);
      
      // Load products
      const { data: productsData } = await sb
        .from('products')
        .select('id, name, description, category, price, currency, supplier, status, created_at, updated_at')
        .eq('organization_id', orgId);

      // Load services
      const { data: servicesData } = await sb
        .from('services')
        .select('id, name, description, category, rate as price, currency, supplier, status, created_at, updated_at')
        .eq('organization_id', orgId);

      const products = (productsData || []).map((item: any) => ({ ...item, type: 'product' as const }));
      const services = (servicesData || []).map((item: any) => ({ ...item, type: 'service' as const }));
      
      const allItems = [...products, ...services].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      setCatalogItems(allItems);
    } catch (error) {
      console.error('Error loading catalog items:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = catalogItems;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.supplier?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(item => item.type === typeFilter);
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    setFilteredItems(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'warning';
      case 'discontinued': return 'destructive';
      default: return 'secondary';
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'product' ? Package2 : Wrench;
  };

  const getTypeColor = (type: string) => {
    return type === 'product' ? 'bg-primary/10 color-primary' : 'bg-success/10 color-success';
  };

  if (loading) {
    return (
      <div className="stack-md">
        <div className="animate-pulse stack-md">
          <div className="h-4 bg-secondary rounded w-3/4"></div>
          <div className="h-4 bg-secondary rounded w-1/2"></div>
          <div className="h-4 bg-secondary rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="stack-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-sm">
          <BookOpen className="h-5 w-5" />
          <h3 className="text-heading-4">Procurement Catalog</h3>
          <Badge variant="secondary">{filteredItems.length} items</Badge>
        </div>
        <div className="flex items-center gap-sm">
          <Button
            variant={viewMode === 'grid' ? 'primary' : 'outline'}
           
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'primary' : 'outline'}
           
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 color-muted" />
          <Input
            placeholder="Search catalog items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-2xl"
          />
        </div>
        
        <div className="flex gap-sm">
          <select 
            value={typeFilter} 
            onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
            className="px-sm py-sm border border-input bg-background rounded-md text-body-sm"
          >
            <option value="all">All Types</option>
            <option value="product">Products</option>
            <option value="service">Services</option>
          </select>
          
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="px-sm py-sm border border-input bg-background rounded-md text-body-sm"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="discontinued">Discontinued</option>
          </select>
        </div>
      </div>

      {/* Catalog Items */}
      {filteredItems.length === 0 ? (
        <Card>
          <div className="p-xl text-center color-muted">
            <BookOpen className="h-12 w-12 mx-auto mb-md opacity-50" />
            <p>{searchQuery || typeFilter !== 'all' || statusFilter !== 'all' ? 'No items found matching your filters.' : 'No items in catalog.'}</p>
            <p className="text-body-sm">
              {searchQuery || typeFilter !== 'all' || statusFilter !== 'all' ? 'Try adjusting your search or filters.' : 'Add products and services to build your catalog.'}
            </p>
          </div>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
          {filteredItems.map((item) => {
            const TypeIcon = getTypeIcon(item.type);
            return (
              <Card key={`${item.type}-${item.id}`}>
                <div className="p-md">
                  <div className="flex items-start justify-between mb-sm">
                    <div className="flex items-center gap-sm">
                      <TypeIcon className="h-4 w-4" />
                      <h4 className="form-label">{item.name}</h4>
                    </div>
                    <Badge variant={getStatusColor(item.status)}>
                      {item.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-sm mb-sm">
                    <span className={`px-sm py-xs rounded-full text-body-sm form-label ${getTypeColor(item.type)}`}>
                      {item.type}
                    </span>
                    {item.category && (
                      <span className="text-body-sm color-muted uppercase tracking-wide">
                        {item.category}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-body-sm color-muted mb-sm line-clamp-2">
                    {item.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-sm">
                    <div className="text-body text-heading-4">
                      ${item.price.toLocaleString()} {item.currency}
                    </div>
                  </div>
                  
                  {item.supplier && (
                    <div className="text-body-sm color-muted">
                      <strong>Supplier:</strong> {item.supplier}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <div className="divide-y">
            {filteredItems.map((item) => {
              const TypeIcon = getTypeIcon(item.type);
              return (
                <div key={`${item.type}-${item.id}`} className="p-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-sm flex-1">
                      <TypeIcon className="h-5 w-5 color-muted" />
                      <div className="flex-1">
                        <div className="flex items-center gap-sm mb-xs">
                          <h4 className="form-label">{item.name}</h4>
                          <span className={`px-sm py-xs rounded-full text-body-sm form-label ${getTypeColor(item.type)}`}>
                            {item.type}
                          </span>
                          <Badge variant={getStatusColor(item.status)} className="text-body-sm">
                            {item.status}
                          </Badge>
                        </div>
                        <p className="text-body-sm color-muted line-clamp-1">
                          {item.description}
                        </p>
                        <div className="flex items-center gap-md mt-xs text-body-sm color-muted">
                          {item.category && <span>Category: {item.category}</span>}
                          {item.supplier && <span>Supplier: {item.supplier}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-body text-heading-4">
                        ${item.price.toLocaleString()} {item.currency}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
