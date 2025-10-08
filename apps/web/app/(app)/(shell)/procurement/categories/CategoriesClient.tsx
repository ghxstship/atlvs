'use client';


import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
import { Badge, Button, Card, Input, animationPresets } from '@ghxstship/ui';
import { Edit, Filter, Package, Search, Tag, Wrench } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description?: string;
  type: 'product' | 'service' | 'both';
  parent_category_id?: string;
  color?: string;
  status: 'active' | 'inactive';
  sort_order?: number;
  created_at: string;
  updated_at: string;
}

export default function CategoriesClient({ orgId }: { orgId: string }) {
  const t = useTranslations('procurement');
  const sb = createBrowserClient();
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | Category['type']>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | Category['status']>('all');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadCategories();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    filterCategories();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories, searchQuery, typeFilter, statusFilter]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/v1/procurement/categories', {
        headers: {
          'x-organization-id': orgId
        }
      });

      if (response.ok) {
        const result = await response.json();
        setCategories(result.data || []);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCategories = () => {
    let filtered = categories;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(category =>
        category.name.toLowerCase().includes(query) ||
        category.description?.toLowerCase().includes(query)
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(category => category.type === typeFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(category => category.status === statusFilter);
    }

    setFilteredCategories(filtered);
  };

  const getStatusVariant = (status: Category['status']) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'secondary';
      default: return 'secondary';
    }
  };

  const getTypeIcon = (type: Category['type']) => {
    switch (type) {
      case 'product': return <Package className="h-icon-xs w-icon-xs" />;
      case 'service': return <Wrench className="h-icon-xs w-icon-xs" />;
      case 'both': return <Tag className="h-icon-xs w-icon-xs" />;
      default: return <Tag className="h-icon-xs w-icon-xs" />;
    }
  };

  const getTypeLabel = (type: Category['type']) => {
    switch (type) {
      case 'product': return 'Products';
      case 'service': return 'Services';
      case 'both': return 'Both';
      default: return 'Both';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-xsxl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-icon-lg w-icon-lg border-b-2 border-primary mx-auto mb-md"></div>
          <p className="color-foreground/70">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="stack-lg">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-md">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-xs/2 transform -translate-y-1/2 h-icon-xs w-icon-xs color-foreground/50" />
            <Input               placeholder="Search categories..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="pl-2xl"
            />
          </div>
        </div>
        
        <div className="flex gap-sm">
          <select
            value={typeFilter}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTypeFilter(e.target.value as any)}
            className=" px-md py-sm border border-input rounded-md bg-background"
          >
            <option value="all">All Types</option>
            <option value="product">Products</option>
            <option value="service">Services</option>
            <option value="both">Both</option>
          </select>
          
          <select
            value={statusFilter}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStatusFilter(e.target.value as any)}
            className=" px-md py-sm border border-input rounded-md bg-background"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Categories Grid */}
      {filteredCategories.length === 0 ? (
        <div className="text-center py-xsxl">
          <Tag className="h-icon-2xl w-icon-2xl color-foreground/30 mx-auto mb-md" />
          <h3 className="text-body form-label mb-sm">No categories found</h3>
          <p className="color-foreground/70 mb-md">
            {searchQuery || typeFilter !== 'all' || statusFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first category'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
          {filteredCategories.map((category: any) => (
            <Card
              key={category.id}
              className={`p-lg ${animationPresets.cardInteractive}`}
            >
              <div className="flex items-start justify-between mb-md">
                <div className="flex items-center gap-sm">
                  <Badge variant="secondary">
                    {category.name}
                  </Badge>
                  <div>
                    <h3 className="form-label">{category.name}</h3>
                    <div className="flex items-center gap-sm mt-xs">
                      <Badge variant={getStatusVariant(category.status) === 'success' ? 'default' : 'secondary'}>
                        {category.status}
                      </Badge>
                      <Badge variant="secondary">
                        {getTypeIcon(category.type)}
                        <span className="ml-xs">{getTypeLabel(category.type)}</span>
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Edit className="h-icon-xs w-icon-xs" />
                </Button>
              </div>

              {category.description && (
                <p className="text-body-sm color-foreground/70 mb-md line-clamp-xs">
                  {category.description}
                </p>
              )}

              <div className="flex items-center justify-between text-body-sm color-foreground/50">
                {category.sort_order !== undefined && (
                  <span>Order: {category.sort_order}</span>
                )}
                <span>
                  Created {new Date(category.created_at).toLocaleDateString()}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
