'use client';

import { Package, DollarSign, TrendingUp, TrendingDown, Calendar, AlertCircle, CheckCircle, Clock, Truck, BarChart3, Activity } from "lucide-react";
import { useState, useEffect } from 'react';
import { Card, Badge, Button } from '@ghxstship/ui';
import type { ProcurementOrder, OrderStats, OrderAnalytics } from '../types';
import { formatCurrency, formatDate, getStatusColor, getPriorityColor } from '../types';

interface OrderDashboardViewProps {
 orders: ProcurementOrder[];
 loading?: boolean;
 stats?: OrderStats;
 analytics?: OrderAnalytics;
 onOrderClick?: (order: ProcurementOrder) => void;
}

export default function OrderDashboardView({
 orders,
 loading = false,
 stats,
 analytics,
 onOrderClick,
}: OrderDashboardViewProps) {
 const [recentOrders, setRecentOrders] = useState<ProcurementOrder[]>([]);
 const [urgentOrders, setUrgentOrders] = useState<ProcurementOrder[]>([]);
 const [overdueOrders, setOverdueOrders] = useState<ProcurementOrder[]>([]);
 const [topVendors, setTopVendors] = useState<Array<{ vendor: string; count: number; value: number }>([]);

 useEffect(() => {
 // Get recent orders (last 10)
 const recent = [...orders]
 .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
 .slice(0, 10);
 setRecentOrders(recent);

 // Get urgent orders
 const urgent = orders.filter(order => 
 order.priority === 'urgent' && !['delivered', 'cancelled'].includes(order.status)
 );
 setUrgentOrders(urgent);

 // Get overdue orders
 const now = new Date();
 const overdue = orders.filter(order => {
 if (!order.expected_delivery) return false;
 const expectedDate = new Date(order.expected_delivery);
 return expectedDate < now && !['delivered', 'received', 'cancelled'].includes(order.status);
 });
 setOverdueOrders(overdue);

 // Calculate top vendors
 const vendorMap = new Map<string, { count: number; value: number }>();
 orders.forEach(order => {
 if (order.vendor_name) {
 const existing = vendorMap.get(order.vendor_name) || { count: 0, value: 0 };
 vendorMap.set(order.vendor_name, {
 count: existing.count + 1,
 value: existing.value + order.total_amount,
 });
 }
 });

 const vendors = Array.from(vendorMap.entries())
 .map(([vendor, data]) => ({ vendor, ...data }))
 .sort((a, b) => b.value - a.value)
 .slice(0, 5);
 setTopVendors(vendors);
 }, [orders]);

 if (loading) {
 return (
 <div className="space-y-lg">
 {/* Stats cards loading */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
 {Array.from({ length: 4 }).map((_, index) => (
 <Card key={index} className="p-md">
 <div className="animate-pulse">
 <div className="flex items-center justify-between mb-sm">
 <div className="h-icon-xs bg-muted rounded w-component-lg"></div>
 <div className="h-icon-lg w-icon-lg bg-muted rounded"></div>
 </div>
 <div className="h-icon-lg bg-muted rounded w-component-md mb-xs"></div>
 <div className="h-3 bg-muted rounded w-component-lg"></div>
 </div>
 </Card>
 ))}
 </div>

 {/* Charts loading */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
 <Card className="p-md">
 <div className="animate-pulse">
 <div className="h-icon-md bg-muted rounded w-component-xl mb-md"></div>
 <div className="h-container-xs bg-muted rounded"></div>
 </div>
 </Card>
 <Card className="p-md">
 <div className="animate-pulse">
 <div className="h-icon-md bg-muted rounded w-component-xl mb-md"></div>
 <div className="h-container-xs bg-muted rounded"></div>
 </div>
 </Card>
 </div>
 </div>
 );
 }

 const defaultStats: OrderStats = {
 totalOrders: orders.length,
 draftOrders: orders.filter(o => o.status === 'draft').length,
 pendingOrders: orders.filter(o => o.status === 'pending').length,
 approvedOrders: orders.filter(o => o.status === 'approved').length,
 orderedOrders: orders.filter(o => o.status === 'ordered').length,
 deliveredOrders: orders.filter(o => o.status === 'delivered').length,
 cancelledOrders: orders.filter(o => o.status === 'cancelled').length,
 totalValue: orders.reduce((sum, o) => sum + o.total_amount, 0),
 averageOrderValue: orders.length > 0 ? orders.reduce((sum, o) => sum + o.total_amount, 0) / orders.length : 0,
 pendingApprovals: orders.filter(o => o.approval_required && o.status === 'pending').length,
 overdueOrders: overdueOrders.length,
 recentOrders: orders.filter(o => {
 const weekAgo = new Date();
 weekAgo.setDate(weekAgo.getDate() - 7);
 return new Date(o.created_at) > weekAgo;
 }).length,
 topVendors: [],
 ordersByStatus: [],
 ordersByPriority: [],
 monthlyTrends: [],
 };

 const currentStats = stats || defaultStats;

 return (
 <div className="space-y-lg">
 {/* Key metrics */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
 <Card className="p-md">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-muted-foreground">Total Orders</p>
 <p className="text-2xl font-bold">{currentStats.totalOrders}</p>
 <p className="text-xs text-muted-foreground">
 {currentStats.recentOrders} this week
 </p>
 </div>
 <div className="p-sm bg-primary/10 rounded-lg">
 <Package className="h-icon-md w-icon-md text-primary" />
 </div>
 </div>
 </Card>

 <Card className="p-md">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-muted-foreground">Total Value</p>
 <p className="text-2xl font-bold">
 {formatCurrency(currentStats.totalValue)}
 </p>
 <p className="text-xs text-muted-foreground">
 Avg: {formatCurrency(currentStats.averageOrderValue)}
 </p>
 </div>
 <div className="p-sm bg-success/10 rounded-lg">
 <DollarSign className="h-icon-md w-icon-md text-success" />
 </div>
 </div>
 </Card>

 <Card className="p-md">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-muted-foreground">Pending Approvals</p>
 <p className="text-2xl font-bold">{currentStats.pendingApprovals}</p>
 <p className="text-xs text-muted-foreground">
 Require attention
 </p>
 </div>
 <div className="p-sm bg-warning/10 rounded-lg">
 <Clock className="h-icon-md w-icon-md text-warning" />
 </div>
 </div>
 </Card>

 <Card className="p-md">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-muted-foreground">Overdue Orders</p>
 <p className="text-2xl font-bold">{currentStats.overdueOrders}</p>
 <p className="text-xs text-muted-foreground">
 Past expected delivery
 </p>
 </div>
 <div className="p-sm bg-destructive/10 rounded-lg">
 <AlertCircle className="h-icon-md w-icon-md text-destructive" />
 </div>
 </div>
 </Card>
 </div>

 {/* Status breakdown and urgent items */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-md">
 <Card className="p-md">
 <h3 className="font-medium mb-md flex items-center gap-sm">
 <Activity className="h-icon-xs w-icon-xs" />
 Order Status
 </h3>
 <div className="space-y-sm">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-sm">
 <div className="w-3 h-3 bg-success rounded-full"></div>
 <span className="text-sm">Delivered</span>
 </div>
 <div className="flex items-center gap-sm">
 <span className="text-sm font-medium">{currentStats.deliveredOrders}</span>
 <Badge variant="success" className="text-xs">
 {Math.round((currentStats.deliveredOrders / currentStats.totalOrders) * 100)}%
 </Badge>
 </div>
 </div>
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-sm">
 <div className="w-3 h-3 bg-primary rounded-full"></div>
 <span className="text-sm">Ordered</span>
 </div>
 <div className="flex items-center gap-sm">
 <span className="text-sm font-medium">{currentStats.orderedOrders}</span>
 <Badge variant="primary" className="text-xs">
 {Math.round((currentStats.orderedOrders / currentStats.totalOrders) * 100)}%
 </Badge>
 </div>
 </div>
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-sm">
 <div className="w-3 h-3 bg-warning rounded-full"></div>
 <span className="text-sm">Pending</span>
 </div>
 <div className="flex items-center gap-sm">
 <span className="text-sm font-medium">{currentStats.pendingOrders}</span>
 <Badge variant="warning" className="text-xs">
 {Math.round((currentStats.pendingOrders / currentStats.totalOrders) * 100)}%
 </Badge>
 </div>
 </div>
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-sm">
 <div className="w-3 h-3 bg-secondary rounded-full"></div>
 <span className="text-sm">Draft</span>
 </div>
 <div className="flex items-center gap-sm">
 <span className="text-sm font-medium">{currentStats.draftOrders}</span>
 <Badge variant="secondary" className="text-xs">
 {Math.round((currentStats.draftOrders / currentStats.totalOrders) * 100)}%
 </Badge>
 </div>
 </div>
 </div>
 </Card>

 <Card className="p-md">
 <h3 className="font-medium mb-md flex items-center gap-sm">
 <AlertCircle className="h-icon-xs w-icon-xs" />
 Urgent Orders
 </h3>
 <div className="space-y-sm">
 {urgentOrders.length === 0 ? (
 <p className="text-sm text-muted-foreground">No urgent orders</p>
 ) : (
 urgentOrders.slice(0, 5).map((order) => (
 <div 
 key={order.id} 
 className="flex items-center justify-between cursor-pointer hover:bg-muted/30 p-xs rounded"
 onClick={() => onOrderClick?.(order)}
 >
 <div className="flex items-center gap-sm">
 <span className="text-xs">🔴</span>
 <span className="text-sm truncate">{order.order_number}</span>
 </div>
 <Badge variant={getStatusColor(order.status)} className="text-xs">
 {order.status}
 </Badge>
 </div>
 ))
 )}
 </div>
 </Card>

 <Card className="p-md">
 <h3 className="font-medium mb-md flex items-center gap-sm">
 <BarChart3 className="h-icon-xs w-icon-xs" />
 Top Vendors
 </h3>
 <div className="space-y-sm">
 {topVendors.length === 0 ? (
 <p className="text-sm text-muted-foreground">No vendor data</p>
 ) : (
 topVendors.map((vendor, index) => (
 <div key={vendor.vendor} className="flex items-center justify-between">
 <div className="flex items-center gap-sm">
 <span className="text-xs font-medium text-muted-foreground">
 #{index + 1}
 </span>
 <span className="text-sm truncate">{vendor.vendor}</span>
 </div>
 <div className="text-right">
 <div className="text-sm font-medium">{vendor.count}</div>
 <div className="text-xs text-muted-foreground">
 {formatCurrency(vendor.value)}
 </div>
 </div>
 </div>
 ))
 )}
 </div>
 </Card>
 </div>

 {/* Overdue orders alert */}
 {overdueOrders.length > 0 && (
 <Card className="p-md border-destructive/50 bg-destructive/5">
 <div className="flex items-center gap-sm mb-md">
 <AlertCircle className="h-icon-sm w-icon-sm text-destructive" />
 <h3 className="font-medium text-destructive">Overdue Orders ({overdueOrders.length})</h3>
 </div>
 <div className="space-y-sm">
 {overdueOrders.slice(0, 5).map((order) => (
 <div 
 key={order.id}
 className="flex items-center justify-between p-sm bg-background rounded cursor-pointer hover:bg-muted/30"
 onClick={() => onOrderClick?.(order)}
 >
 <div className="flex items-center gap-sm">
 <Package className="h-icon-xs w-icon-xs text-muted-foreground" />
 <div>
 <div className="font-medium">{order.order_number}</div>
 <div className="text-sm text-muted-foreground">{order.vendor_name}</div>
 </div>
 </div>
 <div className="text-right">
 <div className="text-sm font-medium">{formatCurrency(order.total_amount, order.currency)}</div>
 <div className="text-xs text-destructive">
 Due: {formatDate(order.expected_delivery!)}
 </div>
 </div>
 </div>
 ))}
 {overdueOrders.length > 5 && (
 <div className="text-center">
 <Button variant="outline" size="sm">
 View All {overdueOrders.length} Overdue Orders
 </Button>
 </div>
 )}
 </div>
 </Card>
 )}

 {/* Recent orders */}
 <Card className="p-md">
 <div className="flex items-center justify-between mb-md">
 <h3 className="font-medium flex items-center gap-sm">
 <Calendar className="h-icon-xs w-icon-xs" />
 Recent Orders
 </h3>
 <Button variant="outline" size="sm">
 View All
 </Button>
 </div>
 
 {recentOrders.length === 0 ? (
 <p className="text-sm text-muted-foreground text-center py-lg">
 No orders found
 </p>
 ) : (
 <div className="space-y-sm">
 {recentOrders.map((order) => (
 <div
 key={order.id}
 className="flex items-center gap-md p-sm rounded-lg hover:bg-muted/30 cursor-pointer transition-colors"
 onClick={() => onOrderClick?.(order)}
 >
 <Package className="h-icon-xs w-icon-xs text-muted-foreground flex-shrink-0" />
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-sm">
 <span className="font-medium truncate">{order.order_number}</span>
 <Badge variant={getStatusColor(order.status)}>
 {order.status}
 </Badge>
 <Badge variant={getPriorityColor(order.priority)} className="text-xs">
 {order.priority}
 </Badge>
 </div>
 <div className="flex items-center gap-md text-xs text-muted-foreground">
 <span>Vendor: {order.vendor_name}</span>
 <span>Created: {formatDate(order.created_at)}</span>
 {order.expected_delivery && (
 <span>Expected: {formatDate(order.expected_delivery)}</span>
 )}
 </div>
 </div>
 <div className="text-right">
 <div className="font-medium">
 {formatCurrency(order.total_amount, order.currency)}
 </div>
 {order.approval_required && !order.approved_by && (
 <div className="text-xs text-warning">
 Needs Approval
 </div>
 )}
 </div>
 </div>
 ))}
 </div>
 )}
 </Card>
 </div>
 );
}
