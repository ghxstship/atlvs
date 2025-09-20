'use client';


import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
import { Card, Badge, Button } from '@ghxstship/ui';
import { StatusBadge, designTokens } from "../../../../_components/ui"
import { 
  ShoppingCart, 
  Package, 
  Wrench, 
  Building, 
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
      const totalSpent = ordersData.reduce((sum: number, order) => sum + (order.total_amount || 0), 0);

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

  // Using design tokens for status colors

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-2xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-md"></div>
          <p className="color-foreground/70">Loading overview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="stack-lg">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
        <Card className="p-lg">
          <div className="flex items-center gap-md">
            <div className="p-sm bg-accent/10 rounded-lg">
              <ShoppingCart className="h-6 w-6 color-accent" />
            </div>
            <div>
              <p className="text-body-sm color-foreground/70">Total Orders</p>
              <p className="text-heading-3 text-heading-3">{stats?.totalOrders || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-lg">
          <div className="flex items-center gap-md">
            <div className="p-sm bg-warning/10 rounded-lg">
              <Clock className="h-6 w-6 color-warning" />
            </div>
            <div>
              <p className="text-body-sm color-foreground/70">Pending Orders</p>
              <p className="text-heading-3 text-heading-3">{stats?.pendingOrders || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-lg">
          <div className="flex items-center gap-md">
            <div className="p-sm bg-success/10 rounded-lg">
              <CheckCircle className="h-6 w-6 color-success" />
            </div>
            <div>
              <p className="text-body-sm color-foreground/70">Completed Orders</p>
              <p className="text-heading-3 text-heading-3">{stats?.completedOrders || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-lg">
          <div className="flex items-center gap-md">
            <div className="p-sm bg-secondary/10 rounded-lg">
              <DollarSign className="h-6 w-6 color-secondary" />
            </div>
            <div>
              <p className="text-body-sm color-foreground/70">Total Spent</p>
              <p className="text-heading-3 text-heading-3">
                {formatCurrency(stats?.totalSpent || 0, stats?.currency)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Catalog Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
        <Card className="p-lg">
          <div className="flex items-center justify-between mb-md">
            <div className="flex items-center gap-sm">
              <Package className="h-5 w-5 color-accent" />
              <span className="form-label">Products</span>
            </div>
            <Link href="/procurement/products">
              <Button>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <p className="text-heading-3 text-heading-3">{stats?.totalProducts || 0}</p>
          <p className="text-body-sm color-foreground/70">Active products</p>
        </Card>

        <Card className="p-lg">
          <div className="flex items-center justify-between mb-md">
            <div className="flex items-center gap-sm">
              <Wrench className="h-5 w-5 color-success" />
              <span className="form-label">Services</span>
            </div>
            <Link href="/procurement/services">
              <Button>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <p className="text-heading-3 text-heading-3">{stats?.totalServices || 0}</p>
          <p className="text-body-sm color-foreground/70">Available services</p>
        </Card>

        <Card className="p-lg">
          <div className="flex items-center justify-between mb-md">
            <div className="flex items-center gap-sm">
              <Building className="h-5 w-5 color-warning" />
              <span className="form-label">Vendors</span>
            </div>
            <Link href="/procurement/vendors">
              <Button>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <p className="text-heading-3 text-heading-3">{stats?.totalVendors || 0}</p>
          <p className="text-body-sm color-foreground/70">Active vendors</p>
        </Card>

        <Card className="p-lg">
          <div className="flex items-center justify-between mb-md">
            <div className="flex items-center gap-sm">
              <Tag className="h-5 w-5 color-secondary" />
              <span className="form-label">Categories</span>
            </div>
            <Link href="/procurement/categories">
              <Button>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <p className="text-heading-3 text-heading-3">{stats?.totalCategories || 0}</p>
          <p className="text-body-sm color-foreground/70">Organization categories</p>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <div className="p-lg border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-body text-heading-4">Recent Orders</h3>
            <Link href="/procurement/orders">
              <Button>
                View All
                <ArrowRight className="h-4 w-4 ml-sm" />
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="p-lg">
          {recentOrders.length === 0 ? (
            <div className="text-center py-xl">
              <ShoppingCart className="h-12 w-12 color-foreground/30 mx-auto mb-md" />
              <p className="color-foreground/70">No recent orders</p>
              <Link href="/procurement/orders">
                <Button className="mt-md">
                  Create First Order
                </Button>
              </Link>
            </div>
          ) : (
            <div className="stack-md">
              {recentOrders.map((order: any) => (
                <div key={order.id} className="flex items-center justify-between p-md border border-border rounded-lg">
                  <div className="flex items-center gap-md">
                    <div>
                      <p className="form-label">{order.order_number}</p>
                      <p className="text-body-sm color-foreground/70">{order.vendor_name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-md">
                    <div className="text-right">
                      <p className="form-label">
                        {formatCurrency(order.total_amount, order.currency)}
                      </p>
                      <p className="text-body-sm color-foreground/70">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Quick Actions */}
      <Card>
        <div className="p-lg border-b">
          <h3 className="text-body text-heading-4">Quick Actions</h3>
        </div>
        
        <div className="p-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
            <Link href="/procurement/orders">
              <Button variant="outline" className="w-full justify-start">
                <ShoppingCart className="h-4 w-4 mr-sm" />
                Create Order
              </Button>
            </Link>
            
            <Link href="/procurement/products">
              <Button variant="outline" className="w-full justify-start">
                <Package className="h-4 w-4 mr-sm" />
                Add Product
              </Button>
            </Link>
            
            <Link href="/procurement/services">
              <Button variant="outline" className="w-full justify-start">
                <Wrench className="h-4 w-4 mr-sm" />
                Add Service
              </Button>
            </Link>
            
            <Link href="/procurement/vendors">
              <Button variant="outline" className="w-full justify-start">
                <Building className="h-4 w-4 mr-sm" />
                Add Vendor
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
