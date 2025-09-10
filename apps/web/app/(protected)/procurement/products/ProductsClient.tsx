'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
import { Button, Input, Card, Badge } from '@ghxstship/ui';
import { Plus, Save, Package2, DollarSign, Edit, Trash2, Search } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  currency: string;
  sku?: string;
  supplier?: string;
  status: 'active' | 'inactive' | 'discontinued';
  created_at: string;
  updated_at: string;
}

export default function ProductsClient({ orgId }: { orgId: string }) {
  const t = useTranslations('procurement');
  const sb = createBrowserClient();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  type ProductStatus = 'active' | 'inactive' | 'discontinued';
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: 0,
    currency: 'USD',
    sku: '',
    supplier: '',
    status: 'active' as ProductStatus
  });

  useEffect(() => {
    loadProducts();
  }, [orgId]);

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      
      const { data: productsData } = await sb
        .from('products')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });

      setProducts(productsData || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    if (!searchQuery.trim()) {
      setFilteredProducts(products);
      return;
    }

    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.supplier?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  const handleCreate = async () => {
    try {
      setSaving(true);
      
      const { error } = await sb
        .from('products')
        .insert({
          ...formData,
          organization_id: orgId
        });

      if (error) throw error;
      
      resetForm();
      setShowCreateForm(false);
      await loadProducts();
    } catch (error) {
      console.error('Error creating product:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingProduct) return;
    
    try {
      setSaving(true);
      
      const { error } = await sb
        .from('products')
        .update(formData)
        .eq('id', editingProduct.id);

      if (error) throw error;
      
      resetForm();
      setEditingProduct(null);
      await loadProducts();
    } catch (error) {
      console.error('Error updating product:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (productId: string) => {
    try {
      const { error } = await sb
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      await loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      price: 0,
      currency: 'USD',
      sku: '',
      supplier: '',
      status: 'active'
    });
  };

  const startEdit = (product: Product) => {
    setFormData({
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      currency: product.currency,
      sku: product.sku || '',
      supplier: product.supplier || '',
      status: product.status
    });
    setEditingProduct(product);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'warning';
      case 'discontinued': return 'destructive';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="h-4 bg-muted rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package2 className="h-5 w-5" />
          <h3 className="font-semibold">Products Catalog</h3>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products by name, category, SKU, or supplier..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Create/Edit Form */}
      {(showCreateForm || editingProduct) && (
        <Card>
          <div className="p-4">
            <h4 className="font-medium mb-4">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Product Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Product name"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="Equipment, Supplies, Materials, etc."
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md"
                  rows={3}
                  placeholder="Product description..."
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Price *</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Currency</label>
                <select 
                  value={formData.currency} 
                  onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">SKU</label>
                <Input
                  value={formData.sku}
                  onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                  placeholder="Product SKU/Code"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Supplier</label>
                <Input
                  value={formData.supplier}
                  onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
                  placeholder="Supplier name"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <select 
                  value={formData.status} 
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' | 'discontinued' }))}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="discontinued">Discontinued</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={editingProduct ? handleUpdate : handleCreate} 
                disabled={saving || !formData.name}
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : (editingProduct ? 'Update Product' : 'Add Product')}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  resetForm();
                  setShowCreateForm(false);
                  setEditingProduct(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <div className="p-8 text-center text-muted-foreground">
                <Package2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{searchQuery ? 'No products found matching your search.' : 'No products in catalog.'}</p>
                <p className="text-sm">
                  {searchQuery ? 'Try adjusting your search terms.' : 'Add your first product to get started.'}
                </p>
              </div>
            </Card>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <Card key={product.id}>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium">{product.name}</h4>
                  <Badge variant={getStatusColor(product.status)}>
                    {product.status}
                  </Badge>
                </div>
                
                {product.category && (
                  <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">
                    {product.category}
                  </p>
                )}
                
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {product.description}
                </p>
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1 text-lg font-semibold">
                    <DollarSign className="h-4 w-4" />
                    {product.price.toLocaleString()} {product.currency}
                  </div>
                </div>
                
                {(product.sku || product.supplier) && (
                  <div className="text-xs text-muted-foreground mb-3 space-y-1">
                    {product.sku && <div><strong>SKU:</strong> {product.sku}</div>}
                    {product.supplier && <div><strong>Supplier:</strong> {product.supplier}</div>}
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Button
                   
                    variant="outline"
                    onClick={() => startEdit(product)}
                    className="flex-1"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                   
                    variant="outline"
                    onClick={() => handleDelete(product.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
