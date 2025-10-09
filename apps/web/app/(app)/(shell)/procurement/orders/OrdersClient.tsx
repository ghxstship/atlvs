'use client';


import { useState, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
import { Button, Input, Card, Badge } from '@ghxstship/ui';
import { Plus, Save, Package, Calendar, DollarSign, Truck, Eye, Edit, Trash2 } from 'lucide-react';

interface ProcurementOrder {
  id: string;
  order_number: string;
  vendor_name: string;
  description: string;
  total_amount: number;
  currency: string;
  status: 'draft' | 'pending' | 'approved' | 'ordered' | 'delivered' | 'cancelled';
  order_date: string;
  expected_delivery?: string;
  project_id?: string;
  created_at: string;
  updated_at: string;
}

export default function OrdersClient({ orgId }: { orgId: string }) {
  const t = useTranslations('procurement');
  const sb = createBrowserClient();
  const [orders, setOrders] = useState<ProcurementOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<ProcurementOrder | null>(null);
  type OrderStatus = 'draft' | 'pending' | 'approved' | 'ordered' | 'delivered' | 'cancelled';
  
  const [formData, setFormData] = useState({
    order_number: '',
    vendor_name: '',
    description: '',
    total_amount: 0,
    currency: 'USD',
    status: 'draft' as OrderStatus,
    order_date: new Date().toISOString().split('T')[0],
    expected_delivery: '',
    project_id: ''
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadOrders();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      
      const { data: ordersData } = await sb
        .from('procurement_orders')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });

      setOrders(ordersData || []);
    } catch (error) {
      console.error('Error loading procurement orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      setSaving(true);
      
      const { error } = await sb
        .from('procurement_orders')
        .insert({
          ...formData,
          organization_id: orgId,
          order_number: formData.order_number || `PO-${Date.now()}`
        });

      if (error) throw error;
      
      resetForm();
      setShowCreateForm(false);
      await loadOrders();
    } catch (error) {
      console.error('Error creating procurement order:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingOrder) return;
    
    try {
      setSaving(true);
      
      const { error } = await sb
        .from('procurement_orders')
        .update(formData)
        .eq('id', editingOrder.id);

      if (error) throw error;
      
      resetForm();
      setEditingOrder(null);
      await loadOrders();
    } catch (error) {
      console.error('Error updating procurement order:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (orderId: string) => {
    try {
      const { error } = await sb
        .from('procurement_orders')
        .delete()
        .eq('id', orderId);

      if (error) throw error;
      await loadOrders();
    } catch (error) {
      console.error('Error deleting procurement order:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      order_number: '',
      vendor_name: '',
      description: '',
      total_amount: 0,
      currency: 'USD',
      status: 'draft',
      order_date: new Date().toISOString().split('T')[0],
      expected_delivery: '',
      project_id: ''
    });
  };

  const startEdit = (order: ProcurementOrder) => {
    setFormData({
      order_number: order.order_number,
      vendor_name: order.vendor_name,
      description: order.description,
      total_amount: order.total_amount,
      currency: order.currency,
      status: order.status,
      order_date: order.order_date,
      expected_delivery: order.expected_delivery || '',
      project_id: order.project_id || ''
    });
    setEditingOrder(order);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'pending': return 'warning';
      case 'approved': return 'default';
      case 'ordered': return 'default';
      case 'delivered': return 'success';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ordered': return <Truck className="h-3 w-3" />;
      case 'delivered': return <Package className="h-3 w-3" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="stack-md">
        <div className="animate-pulse stack-md">
          <div className="h-icon-xs bg-secondary rounded w-3/4"></div>
          <div className="h-icon-xs bg-secondary rounded w-1/2"></div>
          <div className="h-icon-xs bg-secondary rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="stack-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-sm">
          <Package className="h-icon-sm w-icon-sm" />
          <h3 className="text-body text-heading-4">Purchase Orders</h3>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-icon-xs w-icon-xs mr-sm" />
          Create Order
        </Button>
      </div>

      {/* Create/Edit Form */}
      {(showCreateForm || editingOrder) && (
        <Card>
          <div className="p-md">
            <h4 className="form-label mb-md">
              {editingOrder ? 'Edit Purchase Order' : 'Create New Purchase Order'}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md mb-md">
              <div className="stack-sm">
                <label className="text-body-sm form-label">Order Number</label>
                <Input                   value={formData.order_number}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, order_number: e.target.value }))}
                  placeholder="PO-2024-001"
                />
              </div>
              
              <div className="stack-sm">
                <label className="text-body-sm form-label">Vendor Name *</label>
                <Input                   value={formData.vendor_name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, vendor_name: e.target.value }))}
                  placeholder="Vendor Company Name"
                />
              </div>
              
              <div className="stack-sm md:col-span-2">
                <label className="text-body-sm form-label">Description *</label>
                <Input                   value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description of goods/services"
                />
              </div>
              
              <div className="stack-sm">
                <label className="text-body-sm form-label">Total Amount *</label>
                <Input                   type="number"
                  step="0.01"
                  value={formData.total_amount}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, total_amount: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                />
              </div>
              
              <div className="stack-sm">
                <label className="text-body-sm form-label">Currency</label>
                <select 
                  value={formData.currency} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                  className="w-full  px-md py-sm border border-input bg-background rounded-md"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
              
              <div className="stack-sm">
                <label className="text-body-sm form-label">Status</label>
                <select 
                  value={formData.status} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, status: e.target.e.target.value as OrderStatus }))}
                  className="w-full  px-md py-sm border border-input bg-background rounded-md"
                >
                  <option value="draft">Draft</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="ordered">Ordered</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              <div className="stack-sm">
                <label className="text-body-sm form-label">Order Date</label>
                <Input                   type="date"
                  value={formData.order_date}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, order_date: e.target.value }))}
                />
              </div>
              
              <div className="stack-sm">
                <label className="text-body-sm form-label">Expected Delivery</label>
                <Input                   type="date"
                  value={formData.expected_delivery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, expected_delivery: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="flex gap-sm">
              <Button 
                onClick={editingOrder ? handleUpdate : handleCreate} 
                disabled={saving || !formData.vendor_name || !formData.description}
              >
                <Save className="h-icon-xs w-icon-xs mr-sm" />
                {saving ? 'Saving...' : (editingOrder ? 'Update Order' : 'Create Order')}
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => {
                  resetForm();
                  setShowCreateForm(false);
                  setEditingOrder(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Orders List */}
      <div className="stack-md">
        {orders.length === 0 ? (
          <Card>
            <div className="p-xl text-center color-muted">
              <Package className="h-icon-2xl w-icon-2xl mx-auto mb-md opacity-50" />
              <p>No purchase orders found.</p>
              <p className="text-body-sm">Create your first purchase order to get started.</p>
            </div>
          </Card>
        ) : (
          orders.map((order: any) => (
            <Card key={order.id}>
              <div className="p-md">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-sm mb-sm">
                      <h4 className="form-label">{order.order_number}</h4>
                      <Badge variant={getStatusColor(order.status)}>
                        {getStatusIcon(order.status)}
                        <span className="ml-xs capitalize">{order.status}</span>
                      </Badge>
                    </div>
                    
                    <p className="text-body-sm color-muted mb-sm">
                      <strong>Vendor:</strong> {order.vendor_name}
                    </p>
                    
                    <p className="text-body-sm mb-sm">{order.description}</p>
                    
                    <div className="flex items-center gap-md text-body-sm color-muted">
                      <div className="flex items-center gap-xs">
                        <DollarSign className="h-3 w-3" />
                        {order.total_amount.toLocaleString()} {order.currency}
                      </div>
                      <div className="flex items-center gap-xs">
                        <Calendar className="h-3 w-3" />
                        {new Date(order.order_date).toLocaleDateString()}
                      </div>
                      {order.expected_delivery && (
                        <div className="flex items-center gap-xs">
                          <Truck className="h-3 w-3" />
                          Expected: {new Date(order.expected_delivery).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-sm">
                    <Button
                     
                      variant="secondary"
                      onClick={() => startEdit(order)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                     
                      variant="secondary"
                      onClick={() => handleDelete(order.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
