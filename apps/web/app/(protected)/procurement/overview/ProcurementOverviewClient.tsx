'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
import { Card, Badge, Button } from '@ghxstship/ui';
import { 
  ShoppingCart, 
  Package, 
  Wrench, 
  Building2, 
  Tag, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

interface ProcurementStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalProducts: number;
  totalServices: number;
  totalVendors: number;
  totalCategories: number;
  totalSpent: number;
  currency: string;
}

interface RecentOrder {
  id: string;
  order_number: string;
  vendor_name: string;
  total_amount: number;
  currency: string;
  status: string;
  created_at: string;
}

export default function ProcurementOverviewClient({ orgId }: { orgId: string }) {
  const t = useTranslations('procurement');
  const sb = createBrowserClient();
  const [stats, setStats] = useState<ProcurementStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOverviewData();
  }, [orgId]);

  const loadOverviewData = async () => {
    try {
      setLoading(true);
      
      // Load stats from multiple endpoints
      const [ordersRes, productsRes, servicesRes, vendorsRes, categoriesRes] = await Promise.all([
        fetch('/api/v1/procurement/purchase-orders', { headers: { 'x-organization-id': orgId } }),
        fetch('/api/v1/procurement/products', { headers: { 'x-organization-id': orgId } }),
        fetch('/api/v1/procurement/services', { headers: { 'x-organization-id': orgId } }),
        fetch('/api/v1/procurement/vendors', { headers: { 'x-organization-id': orgId } }),
        fetch('/api/v1/procurement/categories', { headers: { 'x-organization-id': orgId } }),
      ]);

      const [orders, products, services, vendors, categories] = await Promise.all([
        ordersRes.ok ? ordersRes.json() : { data: [] },
        productsRes.ok ? productsRes.json() : { data: [] },
        servicesRes.ok ? servicesRes.json() : { data: [] },
        vendorsRes.ok ? vendorsRes.json() : { data: [] },
        categoriesRes.ok ? categoriesRes.json() : { data: [] },
      ]);

      const ordersData = orders.data || [];
      const pendingOrders = ordersData.filter((o: any) => ['draft', 'pending', 'approved'].includes(o.status));
      const completedOrders = ordersData.filter((o: any) => ['delivered'].includes(o.status));
      const totalSpent = ordersData.reduce((sum: number, order: any) => sum + (order.total_amount || 0), 0);

      setStats({
        totalOrders: ordersData.length,
        pendingOrders: pendingOrders.length,
        completedOrders: completedOrders.length,
        totalProducts: (products.data || []).length,
        totalServices: (services.data || []).length,
        totalVendors: (vendors.data || []).length,
        totalCategories: (categories.data || []).length,
        totalSpent,
        currency: 'USD', // Default currency
      });

      // Set recent orders (last 5)
      setRecentOrders(ordersData.slice(0, 5));

    } catch (error) {
      console.error('Error loading overview data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-purple-100 text-purple-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground/70">Loading overview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-foreground/70">Total Orders</p>
              <p className="text-2xl font-bold">{stats?.totalOrders || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-foreground/70">Pending Orders</p>
              <p className="text-2xl font-bold">{stats?.pendingOrders || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-foreground/70">Completed Orders</p>
              <p className="text-2xl font-bold">{stats?.completedOrders || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-foreground/70">Total Spent</p>
              <p className="text-2xl font-bold">
                {formatCurrency(stats?.totalSpent || 0, stats?.currency)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Catalog Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Products</span>
            </div>
            <Link href="/procurement/products">
              <Button variant="ghost" size="sm">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <p className="text-2xl font-bold">{stats?.totalProducts || 0}</p>
          <p className="text-sm text-foreground/70">Active products</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Wrench className="h-5 w-5 text-green-600" />
              <span className="font-medium">Services</span>
            </div>
            <Link href="/procurement/services">
              <Button variant="ghost" size="sm">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <p className="text-2xl font-bold">{stats?.totalServices || 0}</p>
          <p className="text-sm text-foreground/70">Available services</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-orange-600" />
              <span className="font-medium">Vendors</span>
            </div>
            <Link href="/procurement/vendors">
              <Button variant="ghost" size="sm">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <p className="text-2xl font-bold">{stats?.totalVendors || 0}</p>
          <p className="text-sm text-foreground/70">Active vendors</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Tag className="h-5 w-5 text-purple-600" />
              <span className="font-medium">Categories</span>
            </div>
            <Link href="/procurement/categories">
              <Button variant="ghost" size="sm">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <p className="text-2xl font-bold">{stats?.totalCategories || 0}</p>
          <p className="text-sm text-foreground/70">Organization categories</p>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Recent Orders</h3>
            <Link href="/procurement/orders">
              <Button variant="outline" size="sm">
                View All
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="p-6">
          {recentOrders.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="h-12 w-12 text-foreground/30 mx-auto mb-4" />
              <p className="text-foreground/70">No recent orders</p>
              <Link href="/procurement/orders">
                <Button className="mt-4">
                  Create First Order
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-medium">{order.order_number}</p>
                      <p className="text-sm text-foreground/70">{order.vendor_name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium">
                        {formatCurrency(order.total_amount, order.currency)}
                      </p>
                      <p className="text-sm text-foreground/70">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Quick Actions */}
      <Card>
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Quick Actions</h3>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/procurement/orders">
              <Button variant="outline" className="w-full justify-start">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Create Order
              </Button>
            </Link>
            
            <Link href="/procurement/products">
              <Button variant="outline" className="w-full justify-start">
                <Package className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </Link>
            
            <Link href="/procurement/services">
              <Button variant="outline" className="w-full justify-start">
                <Wrench className="h-4 w-4 mr-2" />
                Add Service
              </Button>
            </Link>
            
            <Link href="/procurement/vendors">
              <Button variant="outline" className="w-full justify-start">
                <Building2 className="h-4 w-4 mr-2" />
                Add Vendor
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
