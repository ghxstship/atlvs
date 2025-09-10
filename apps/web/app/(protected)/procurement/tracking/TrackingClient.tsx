'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
import { Button, Input, Card, Badge } from '@ghxstship/ui';
import { Package, Truck, MapPin, Calendar, Clock, Search, Filter, Eye } from 'lucide-react';

interface TrackingOrder {
  id: string;
  order_number: string;
  vendor_name: string;
  description: string;
  total_amount: number;
  currency: string;
  status: 'draft' | 'pending' | 'approved' | 'ordered' | 'shipped' | 'delivered' | 'cancelled';
  order_date: string;
  expected_delivery?: string;
  actual_delivery?: string;
  tracking_number?: string;
  shipping_carrier?: string;
  created_at: string;
  updated_at: string;
}

export default function TrackingClient({ orgId }: { orgId: string }) {
  const t = useTranslations('procurement');
  const sb = createBrowserClient();
  const [orders, setOrders] = useState<TrackingOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<TrackingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | TrackingOrder['status']>('all');
  const [selectedOrder, setSelectedOrder] = useState<TrackingOrder | null>(null);

  useEffect(() => {
    loadOrders();
  }, [orgId]);

  useEffect(() => {
    filterOrders();
  }, [orders, searchQuery, statusFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      
      const { data: ordersData } = await sb
        .from('procurement_orders')
        .select('*')
        .eq('organization_id', orgId)
        .in('status', ['ordered', 'shipped', 'delivered'])
        .order('created_at', { ascending: false });

      setOrders(ordersData || []);
    } catch (error) {
      console.error('Error loading tracking orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(order =>
        order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.vendor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.tracking_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.shipping_carrier?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ordered': return 'info';
      case 'shipped': return 'warning';
      case 'delivered': return 'success';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ordered': return Package;
      case 'shipped': return Truck;
      case 'delivered': return MapPin;
      default: return Package;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getDaysUntilDelivery = (expectedDelivery?: string) => {
    if (!expectedDelivery) return null;
    const today = new Date();
    const delivery = new Date(expectedDelivery);
    const diffTime = delivery.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
          <Truck className="h-5 w-5" />
          <h3 className="font-semibold">Order Tracking</h3>
          <Badge variant="secondary">{filteredOrders.length} orders</Badge>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by order number, vendor, tracking number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          className="px-3 py-2 border border-input bg-background rounded-md text-sm"
        >
          <option value="all">All Status</option>
          <option value="ordered">Ordered</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
        </select>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Card>
          <div className="p-8 text-center text-muted-foreground">
            <Truck className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{searchQuery || statusFilter !== 'all' ? 'No orders found matching your filters.' : 'No orders to track.'}</p>
            <p className="text-sm">
              {searchQuery || statusFilter !== 'all' ? 'Try adjusting your search or filters.' : 'Orders will appear here once they are placed.'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const StatusIcon = getStatusIcon(order.status);
            const daysUntilDelivery = getDaysUntilDelivery(order.expected_delivery);
            
            return (
              <Card key={order.id}>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <StatusIcon className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium">{order.order_number}</h4>
                        <p className="text-sm text-muted-foreground">{order.vendor_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                      <Button
                       
                        variant="outline"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Details
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
                    {order.description}
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Order Date</div>
                      <div className="font-medium">{formatDate(order.order_date)}</div>
                    </div>
                    
                    {order.expected_delivery && (
                      <div>
                        <div className="text-muted-foreground">Expected Delivery</div>
                        <div className="font-medium">
                          {formatDate(order.expected_delivery)}
                          {daysUntilDelivery !== null && (
                            <span className={`ml-2 text-xs ${daysUntilDelivery < 0 ? 'text-red-600' : daysUntilDelivery <= 3 ? 'text-orange-600' : 'text-green-600'}`}>
                              ({daysUntilDelivery < 0 ? `${Math.abs(daysUntilDelivery)} days overdue` : 
                                daysUntilDelivery === 0 ? 'Today' : 
                                `${daysUntilDelivery} days`})
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {order.tracking_number && (
                      <div>
                        <div className="text-muted-foreground">Tracking Number</div>
                        <div className="font-medium font-mono text-xs">{order.tracking_number}</div>
                      </div>
                    )}
                    
                    <div>
                      <div className="text-muted-foreground">Total Amount</div>
                      <div className="font-medium">${order.total_amount.toLocaleString()} {order.currency}</div>
                    </div>
                  </div>
                  
                  {order.shipping_carrier && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="text-xs text-muted-foreground">
                        <strong>Carrier:</strong> {order.shipping_carrier}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Order Details</h3>
                <Button
                  variant="outline"
                 
                  onClick={() => setSelectedOrder(null)}
                >
                  Close
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Order Number</label>
                    <div className="font-medium">{selectedOrder.order_number}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <div>
                      <Badge variant={getStatusColor(selectedOrder.status)}>
                        {selectedOrder.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Vendor</label>
                  <div className="font-medium">{selectedOrder.vendor_name}</div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <div>{selectedOrder.description}</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Order Date</label>
                    <div>{formatDate(selectedOrder.order_date)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Total Amount</label>
                    <div className="font-medium">${selectedOrder.total_amount.toLocaleString()} {selectedOrder.currency}</div>
                  </div>
                </div>
                
                {selectedOrder.expected_delivery && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Expected Delivery</label>
                    <div>{formatDate(selectedOrder.expected_delivery)}</div>
                  </div>
                )}
                
                {selectedOrder.actual_delivery && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Actual Delivery</label>
                    <div>{formatDate(selectedOrder.actual_delivery)}</div>
                  </div>
                )}
                
                {selectedOrder.tracking_number && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Tracking Number</label>
                    <div className="font-mono text-sm bg-muted p-2 rounded">{selectedOrder.tracking_number}</div>
                  </div>
                )}
                
                {selectedOrder.shipping_carrier && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Shipping Carrier</label>
                    <div>{selectedOrder.shipping_carrier}</div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
