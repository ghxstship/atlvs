'use client';


import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
import { Button, UnifiedInput, Card, Badge } from '@ghxstship/ui';
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
          <Truck className="h-icon-sm w-icon-sm" />
          <h3 className="text-body text-heading-4">Order Tracking</h3>
          <Badge variant="secondary">{filteredOrders.length} orders</Badge>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-xs/2 transform -translate-y-1/2 h-icon-xs w-icon-xs color-muted" />
          <UnifiedInput             placeholder="Search by order number, vendor, tracking number..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            className="pl-2xl"
          />
        </div>
        
        <select 
          value={statusFilter} 
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStatusFilter(e.target.value as typeof statusFilter)}
          className=" px-md py-sm border border-input bg-background rounded-md text-body-sm"
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
          <div className="p-xl text-center color-muted">
            <Truck className="h-icon-2xl w-icon-2xl mx-auto mb-md opacity-50" />
            <p>{searchQuery || statusFilter !== 'all' ? 'No orders found matching your filters.' : 'No orders to track.'}</p>
            <p className="text-body-sm">
              {searchQuery || statusFilter !== 'all' ? 'Try adjusting your search or filters.' : 'Orders will appear here once they are placed.'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="stack-md">
          {filteredOrders.map((order: any) => {
            const StatusIcon = getStatusIcon(order.status);
            const daysUntilDelivery = getDaysUntilDelivery(order.expected_delivery);
            
            return (
              <Card key={order.id}>
                <div className="p-md">
                  <div className="flex items-start justify-between mb-sm">
                    <div className="flex items-center gap-sm">
                      <StatusIcon className="h-icon-sm w-icon-sm color-muted" />
                      <div>
                        <h4 className="form-label">{order.order_number}</h4>
                        <p className="text-body-sm color-muted">{order.vendor_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-sm">
                      <Badge variant={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                      <Button
                       
                        variant="outline"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="h-3 w-3 mr-xs" />
                        Details
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-body-sm color-muted mb-sm line-clamp-xs">
                    {order.description}
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md text-body-sm">
                    <div>
                      <div className="color-muted">Order Date</div>
                      <div className="form-label">{formatDate(order.order_date)}</div>
                    </div>
                    
                    {order.expected_delivery && (
                      <div>
                        <div className="color-muted">Expected Delivery</div>
                        <div className="form-label">
                          {formatDate(order.expected_delivery)}
                          {daysUntilDelivery !== null && (
                            <span className={`ml-sm text-body-sm ${daysUntilDelivery < 0 ? 'color-destructive' : daysUntilDelivery <= 3 ? 'color-warning' : 'color-success'}`}>
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
                        <div className="color-muted">Tracking Number</div>
                        <div className="form-label font-mono text-body-sm">{order.tracking_number}</div>
                      </div>
                    )}
                    
                    <div>
                      <div className="color-muted">Total Amount</div>
                      <div className="form-label">${order.total_amount.toLocaleString()} {order.currency}</div>
                    </div>
                  </div>
                  
                  {order.shipping_carrier && (
                    <div className="mt-sm pt-sm border-t">
                      <div className="text-body-sm color-muted">
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
        <div className="fixed inset-0 bg-foreground/30 backdrop-blur-sm flex items-center justify-center p-md z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="p-lg">
              <div className="flex items-center justify-between mb-md">
                <h3 className="text-body text-heading-4">Order Details</h3>
                <Button
                  variant="outline"
                 
                  onClick={() => setSelectedOrder(null)}
                >
                  Close
                </Button>
              </div>
              
              <div className="stack-md">
                <div className="grid grid-cols-2 gap-md">
                  <div>
                    <label className="text-body-sm form-label color-muted">Order Number</label>
                    <div className="form-label">{selectedOrder.order_number}</div>
                  </div>
                  <div>
                    <label className="text-body-sm form-label color-muted">Status</label>
                    <div>
                      <Badge variant={getStatusColor(selectedOrder.status)}>
                        {selectedOrder.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="text-body-sm form-label color-muted">Vendor</label>
                  <div className="form-label">{selectedOrder.vendor_name}</div>
                </div>
                
                <div>
                  <label className="text-body-sm form-label color-muted">Description</label>
                  <div>{selectedOrder.description}</div>
                </div>
                
                <div className="grid grid-cols-2 gap-md">
                  <div>
                    <label className="text-body-sm form-label color-muted">Order Date</label>
                    <div>{formatDate(selectedOrder.order_date)}</div>
                  </div>
                  <div>
                    <label className="text-body-sm form-label color-muted">Total Amount</label>
                    <div className="form-label">${selectedOrder.total_amount.toLocaleString()} {selectedOrder.currency}</div>
                  </div>
                </div>
                
                {selectedOrder.expected_delivery && (
                  <div>
                    <label className="text-body-sm form-label color-muted">Expected Delivery</label>
                    <div>{formatDate(selectedOrder.expected_delivery)}</div>
                  </div>
                )}
                
                {selectedOrder.actual_delivery && (
                  <div>
                    <label className="text-body-sm form-label color-muted">Actual Delivery</label>
                    <div>{formatDate(selectedOrder.actual_delivery)}</div>
                  </div>
                )}
                
                {selectedOrder.tracking_number && (
                  <div>
                    <label className="text-body-sm form-label color-muted">Tracking Number</label>
                    <div className="font-mono text-body-sm bg-secondary p-sm rounded">{selectedOrder.tracking_number}</div>
                  </div>
                )}
                
                {selectedOrder.shipping_carrier && (
                  <div>
                    <label className="text-body-sm form-label color-muted">Shipping Carrier</label>
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
