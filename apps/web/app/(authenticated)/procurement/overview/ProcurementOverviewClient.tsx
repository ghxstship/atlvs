'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardHeader, CardContent, Badge, Button } from '@ghxstship/ui';
import { 
  ShoppingCart, Package, TrendingUp, AlertCircle, 
  DollarSign, Clock, CheckCircle, XCircle,
  BarChart3, PieChart, Activity, ArrowUpRight,
  ArrowDownRight, Minus, Plus
} from 'lucide-react';
import Link from 'next/link';

interface ProcurementStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalSpend: number;
  monthlySpend: number;
  averageOrderValue: number;
  topSuppliers: { name: string; spend: number; orders: number }[];
  recentOrders: {
    id: string;
    vendor: string;
    total: number;
    status: string;
    created_at: string;
  }[];
  categoryBreakdown: { category: string; spend: number; percentage: number }[];
  savingsThisMonth: number;
  ordersThisWeek: number;
  pendingApprovals: number;
}

export default function ProcurementOverviewClient() {
  const [stats, setStats] = useState<ProcurementStats>({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalSpend: 0,
    monthlySpend: 0,
    averageOrderValue: 0,
    topSuppliers: [],
    recentOrders: [],
    categoryBreakdown: [],
    savingsThisMonth: 0,
    ordersThisWeek: 0,
    pendingApprovals: 0,
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const supabase = createClient();

  useEffect(() => {
    fetchProcurementStats();
  }, [timeRange]);

  const fetchProcurementStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get organization context
      const { data: membership } = await supabase
        .from('memberships')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (!membership) return;

      // Fetch procurement orders
      const { data: orders, error: ordersError } = await supabase
        .from('procurement_orders')
        .select('*')
        .eq('organization_id', membership.organization_id);

      if (ordersError) throw ordersError;

      // Calculate stats
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));

      const monthlyOrders = orders?.filter((o: any) => 
        new Date(o.created_at) >= startOfMonth
      ) || [];

      const weeklyOrders = orders?.filter((o: any) => 
        new Date(o.created_at) >= startOfWeek
      ) || [];

      // Calculate category breakdown
      const categorySpend: Record<string, number> = {};
      orders?.forEach((order: any) => {
        const category = order.category || 'Uncategorized';
        categorySpend[category] = (categorySpend[category] || 0) + (order.total || 0);
      });

      const totalCategorySpend = Object.values(categorySpend).reduce((a, b) => a + b, 0);
      const categoryBreakdown = Object.entries(categorySpend).map(([category, spend]) => ({
        category,
        spend,
        percentage: totalCategorySpend > 0 ? (spend / totalCategorySpend) * 100 : 0,
      }));

      // Calculate supplier stats
      const supplierStats: Record<string, { spend: number; orders: number }> = {};
      orders?.forEach((order: any) => {
        const vendor = order.vendor || 'Unknown';
        if (!supplierStats[vendor]) {
          supplierStats[vendor] = { spend: 0, orders: 0 };
        }
        supplierStats[vendor].spend += order.total || 0;
        supplierStats[vendor].orders += 1;
      });

      const topSuppliers = Object.entries(supplierStats)
        .map(([name, stats]) => ({ name, ...stats }))
        .sort((a, b) => b.spend - a.spend)
        .slice(0, 5);

      setStats({
        totalOrders: orders?.length || 0,
        pendingOrders: orders?.filter((o: any) => o.status === 'pending' || o.status === 'processing').length || 0,
        completedOrders: orders?.filter((o: any) => o.status === 'delivered' || o.status === 'completed').length || 0,
        totalSpend: orders?.reduce((sum: number, o: any) => sum + (o.total || 0), 0) || 0,
        monthlySpend: monthlyOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0),
        averageOrderValue: orders?.length ? 
          (orders.reduce((sum: number, o: any) => sum + (o.total || 0), 0) / orders.length) : 0,
        topSuppliers,
        recentOrders: orders?.slice(0, 5).map((o: any) => ({
          id: o.id,
          vendor: o.vendor || 'Unknown',
          total: o.total || 0,
          status: o.status,
          created_at: o.created_at,
        })) || [],
        categoryBreakdown,
        savingsThisMonth: monthlyOrders.reduce((sum: number, o: any) => sum + (o.savings || 0), 0),
        ordersThisWeek: weeklyOrders.length,
        pendingApprovals: orders?.filter((o: any) => o.status === 'pending_approval').length || 0,
      });
    } catch (error) {
      console.error('Error fetching procurement stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
      case 'completed':
        return 'success';
      case 'pending':
      case 'processing':
        return 'warning';
      case 'cancelled':
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getChangeIndicator = (value: number) => {
    if (value > 0) {
      return (
        <span className="flex items-center text-success text-sm">
          <ArrowUpRight className="w-4 h-4" />
          {Math.abs(value)}%
        </span>
      );
    } else if (value < 0) {
      return (
        <span className="flex items-center text-destructive text-sm">
          <ArrowDownRight className="w-4 h-4" />
          {Math.abs(value)}%
        </span>
      );
    }
    return (
      <span className="flex items-center text-muted-foreground text-sm">
        <Minus className="w-4 h-4" />
        0%
      </span>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="h-32" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Procurement Overview</h1>
          <p className="text-muted-foreground">Monitor procurement activities and spending</p>
        </div>
        <div className="flex gap-2">
          {['week', 'month', 'quarter', 'year'].map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'primary' : 'outline'}
             
              onClick={() => setTimeRange(range as any)}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{stats.totalOrders}</p>
                {getChangeIndicator(12)}
              </div>
              <ShoppingCart className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Spend</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.monthlySpend)}</p>
                {getChangeIndicator(-8)}
              </div>
              <DollarSign className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Orders</p>
                <p className="text-2xl font-bold">{stats.pendingOrders}</p>
                <p className="text-sm text-muted-foreground">
                  {stats.pendingApprovals} awaiting approval
                </p>
              </div>
              <Clock className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Savings</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.savingsThisMonth)}</p>
                <p className="text-sm text-success">This month</p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <h3 className="font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Orders
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">{order.vendor}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{formatCurrency(order.total)}</span>
                    <Badge variant={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {stats.recentOrders.length === 0 && (
                <p className="text-center text-muted-foreground py-4">No recent orders</p>
              )}
            </div>
            <Link href="/procurement/orders">
              <Button variant="outline" className="w-full mt-4">
                View All Orders
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Top Suppliers */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold flex items-center gap-2">
              <Package className="w-5 h-5" />
              Top Suppliers
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topSuppliers.map((supplier, index) => (
                <div key={supplier.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      #{index + 1}
                    </span>
                    <div>
                      <p className="font-medium">{supplier.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {supplier.orders} orders
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold text-sm">
                    {formatCurrency(supplier.spend)}
                  </span>
                </div>
              ))}
              {stats.topSuppliers.length === 0 && (
                <p className="text-center text-muted-foreground py-4">No supplier data</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Spending by Category
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.categoryBreakdown.map((category) => (
              <div key={category.category}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">{category.category}</span>
                  <span className="text-sm text-muted-foreground">
                    {formatCurrency(category.spend)} ({category.percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${category.percentage}%` }}
                  />
                </div>
              </div>
            ))}
            {stats.categoryBreakdown.length === 0 && (
              <p className="text-center text-muted-foreground py-4">No category data</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/procurement/orders" as="/procurement/orders/new">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Plus className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-semibold">Create Order</p>
              <p className="text-sm text-muted-foreground">Start a new purchase order</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/procurement/catalog">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Package className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-semibold">Browse Catalog</p>
              <p className="text-sm text-muted-foreground">View products and services</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/procurement/tracking">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Activity className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-semibold">Track Orders</p>
              <p className="text-sm text-muted-foreground">Monitor order status</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
