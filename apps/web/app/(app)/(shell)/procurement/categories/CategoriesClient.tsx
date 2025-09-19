'use client';


import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
import { Card, Badge, Button, UnifiedInput } from '@ghxstship/ui';
import { animationPresets } from "../../../../_components/ui"
import { Tag, Search, Filter, Package, Wrench, Edit } from 'lucide-react';

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

  useEffect(() => {
    loadCategories();
  }, [orgId]);

  useEffect(() => {
    filterCategories();
  }, [categories, searchQuery, typeFilter, statusFilter]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/v1/procurement/categories', {
        headers: {
          'x-organization-id': orgId,
        },
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
      case 'product': return <Package className="h-4 w-4" />;
      case 'service': return <Wrench className="h-4 w-4" />;
      case 'both': return <Tag className="h-4 w-4" />;
      default: return <Tag className="h-4 w-4" />;
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
      <div className="flex items-center justify-center py-2xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-md"></div>
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
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 color-foreground/50" />
            <UnifiedInput               placeholder="Search categories..."
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
        <div className="text-center py-2xl">
          <Tag className="h-12 w-12 color-foreground/30 mx-auto mb-md" />
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
                  <Badge variant="outline">
                    {category.name}
                  </Badge>
                  <div>
                    <h3 className="form-label">{category.name}</h3>
                    <div className="flex items-center gap-sm mt-xs">
                      <Badge variant={getStatusVariant(category.status) === 'success' ? 'default' : 'secondary'}>
                        {category.status}
                      </Badge>
                      <Badge variant="outline">
                        {getTypeIcon(category.type)}
                        <span className="ml-xs">{getTypeLabel(category.type)}</span>
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>

              {category.description && (
                <p className="text-body-sm color-foreground/70 mb-md line-clamp-2">
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
