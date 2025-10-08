'use client';

import { Package, Truck, Clock, CheckCircle, AlertCircle, TrendingUp, TrendingDown, BarChart3, PieChart, Activity, MapPin, Calendar, DollarSign } from "lucide-react";
import { useState, useMemo } from 'react';
import { Card, Badge, Button } from '@ghxstship/ui';
import type { TrackingItem, TrackingAnalytics } from '../types';
import { formatCurrency, formatDate, calculateDeliveryPerformance } from '../types';

interface TrackingDashboardViewProps {
 items: TrackingItem[];
 analytics?: TrackingAnalytics;
 loading?: boolean;
 timeRange?: string;
 onTimeRangeChange?: (range: string) => void;
}

interface MetricCardProps {
 title: string;
 value: string | number;
 change?: number;
 changeLabel?: string;
 icon: React.ReactNode;
 color?: 'blue' | 'green' | 'orange' | 'red' | 'purple';
}

function MetricCard({ title, value, change, changeLabel, icon, color = 'blue' }: MetricCardProps) {
 const colorClasses = {
 blue: 'bg-blue-50 text-blue-600 border-blue-200',
 green: 'bg-green-50 text-green-600 border-green-200',
 orange: 'bg-orange-50 text-orange-600 border-orange-200',
 red: 'bg-red-50 text-red-600 border-red-200',
 purple: 'bg-purple-50 text-purple-600 border-purple-200'
 };

 return (
 <Card className="p-lg">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm font-medium text-gray-600">{title}</p>
 <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
 {change !== undefined && (
 <div className="flex items-center gap-xs mt-2">
 {change > 0 ? (
 <TrendingUp className="h-icon-xs w-icon-xs text-green-500" />
 ) : change < 0 ? (
 <TrendingDown className="h-icon-xs w-icon-xs text-red-500" />
 ) : null}
 <span className={`text-sm ${change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600'}`}>
 {change > 0 ? '+' : ''}{change}% {changeLabel}
 </span>
 </div>
 )}
 </div>
 <div className={`p-sm rounded-lg border ${colorClasses[color]}`}>
 {icon}
 </div>
 </div>
 </Card>
 );
}

export default function TrackingDashboardView({
 items,
 analytics,
 loading = false,
 timeRange = '30d',
 onTimeRangeChange
}: TrackingDashboardViewProps) {
 const [selectedMetric, setSelectedMetric] = useState<string>('overview');

 // Calculate real-time metrics from items
 const metrics = useMemo(() => {
 const totalItems = items.length;
 const deliveredItems = items.filter(item => item.status === 'delivered');
 const inTransitItems = items.filter(item => item.status === 'in_transit');
 const delayedItems = items.filter(item => item.status === 'delayed');
 const shippedItems = items.filter(item => item.status === 'shipped');

 const totalValue = items.reduce((sum, item) => sum + item.total_value, 0);
 const averageValue = totalItems > 0 ? totalValue / totalItems : 0;

 // Calculate performance metrics
 const performanceData = items
 .map(item => calculateDeliveryPerformance(item))
 .filter(Boolean);

 const onTimeDeliveries = performanceData.filter(p => p?.status === 'on_time').length;
 const earlyDeliveries = performanceData.filter(p => p?.status === 'early').length;
 const lateDeliveries = performanceData.filter(p => p?.status === 'late').length;

 const onTimeRate = performanceData.length > 0 ? 
 ((onTimeDeliveries + earlyDeliveries) / performanceData.length) * 100 : 0;

 // Calculate average delivery time
 const deliveryTimes = performanceData
 .filter(p => p?.actual_days)
 .map(p => p!.actual_days);
 const avgDeliveryTime = deliveryTimes.length > 0 ?
 deliveryTimes.reduce((sum, days) => sum + days, 0) / deliveryTimes.length : 0;

 // Group by carrier
 const carrierStats = items.reduce((acc, item) => {
 if (!acc[item.carrier]) {
 acc[item.carrier] = { count: 0, value: 0, delivered: 0 };
 }
 acc[item.carrier].count++;
 acc[item.carrier].value += item.total_value;
 if (item.status === 'delivered') {
 acc[item.carrier].delivered++;
 }
 return acc;
 }, {} as Record<string, { count: number; value: number; delivered: number }>);

 return {
 totalItems,
 deliveredItems: deliveredItems.length,
 inTransitItems: inTransitItems.length,
 delayedItems: delayedItems.length,
 shippedItems: shippedItems.length,
 totalValue,
 averageValue,
 onTimeRate,
 avgDeliveryTime,
 carrierStats,
 performanceData
 };
 }, [items]);

 const timeRangeOptions = [
 { value: '7d', label: 'Last 7 days' },
 { value: '30d', label: 'Last 30 days' },
 { value: '90d', label: 'Last 90 days' },
 { value: '1y', label: 'Last year' },
 ];

 if (loading) {
 return (
 <div className="space-y-lg">
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
 {Array.from({ length: 4 }).map((_, i) => (
 <Card key={i} className="p-lg">
 <div className="animate-pulse">
 <div className="h-icon-xs bg-gray-200 rounded w-1/2 mb-2" />
 <div className="h-icon-lg bg-gray-200 rounded w-3/4 mb-2" />
 <div className="h-icon-xs bg-gray-200 rounded w-1/3" />
 </div>
 </Card>
 ))}
 </div>
 </div>
 );
 }

 return (
 <div className="space-y-lg">
 {/* Header Controls */}
 <div className="flex items-center justify-between">
 <div>
 <h2 className="text-2xl font-bold text-gray-900">Tracking Dashboard</h2>
 <p className="text-gray-600 mt-1">Monitor shipment performance and delivery metrics</p>
 </div>
 
 {onTimeRangeChange && (
 <div className="flex items-center gap-xs">
 <label className="text-sm font-medium text-gray-700">Time Range:</label>
 <select
 value={timeRange}
 onChange={(e) => onTimeRangeChange(e.target.value)}
 className="px-sm py-xs border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
 >
 {timeRangeOptions.map(option => (
 <option key={option.value} value={option.value}>
 {option.label}
 </option>
 ))}
 </select>
 </div>
 )}
 </div>

 {/* Key Metrics */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
 <MetricCard
 title="Total Shipments"
 value={metrics.totalItems}
 change={analytics?.shipment_growth}
 changeLabel="vs last period"
 icon={<Package className="h-icon-md w-icon-md" />}
 color="blue"
 />
 
 <MetricCard
 title="In Transit"
 value={metrics.inTransitItems}
 icon={<Truck className="h-icon-md w-icon-md" />}
 color="orange"
 />
 
 <MetricCard
 title="On-Time Rate"
 value={`${metrics.onTimeRate.toFixed(1)}%`}
 change={analytics?.performance_change}
 changeLabel="vs last period"
 icon={<CheckCircle className="h-icon-md w-icon-md" />}
 color="green"
 />
 
 <MetricCard
 title="Total Value"
 value={formatCurrency(metrics.totalValue)}
 change={analytics?.value_growth}
 changeLabel="vs last period"
 icon={<DollarSign className="h-icon-md w-icon-md" />}
 color="purple"
 />
 </div>

 {/* Secondary Metrics */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
 <MetricCard
 title="Delivered"
 value={metrics.deliveredItems}
 icon={<CheckCircle className="h-icon-md w-icon-md" />}
 color="green"
 />
 
 <MetricCard
 title="Delayed"
 value={metrics.delayedItems}
 icon={<AlertCircle className="h-icon-md w-icon-md" />}
 color="red"
 />
 
 <MetricCard
 title="Avg Delivery Time"
 value={`${metrics.avgDeliveryTime.toFixed(1)} days`}
 icon={<Clock className="h-icon-md w-icon-md" />}
 color="blue"
 />
 
 <MetricCard
 title="Avg Shipment Value"
 value={formatCurrency(metrics.averageValue)}
 icon={<BarChart3 className="h-icon-md w-icon-md" />}
 color="purple"
 />
 </div>

 {/* Charts and Analytics */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
 {/* Status Distribution */}
 <Card className="p-lg">
 <div className="flex items-center justify-between mb-4">
 <h3 className="text-lg font-semibold">Status Distribution</h3>
 <PieChart className="h-icon-sm w-icon-sm text-gray-500" />
 </div>
 
 <div className="space-y-sm">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-xs">
 <div className="w-3 h-3 bg-green-500 rounded-full" />
 <span className="text-sm">Delivered</span>
 </div>
 <span className="text-sm font-medium">{metrics.deliveredItems}</span>
 </div>
 
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-xs">
 <div className="w-3 h-3 bg-blue-500 rounded-full" />
 <span className="text-sm">In Transit</span>
 </div>
 <span className="text-sm font-medium">{metrics.inTransitItems}</span>
 </div>
 
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-xs">
 <div className="w-3 h-3 bg-orange-500 rounded-full" />
 <span className="text-sm">Shipped</span>
 </div>
 <span className="text-sm font-medium">{metrics.shippedItems}</span>
 </div>
 
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-xs">
 <div className="w-3 h-3 bg-red-500 rounded-full" />
 <span className="text-sm">Delayed</span>
 </div>
 <span className="text-sm font-medium">{metrics.delayedItems}</span>
 </div>
 </div>
 </Card>

 {/* Carrier Performance */}
 <Card className="p-lg">
 <div className="flex items-center justify-between mb-4">
 <h3 className="text-lg font-semibold">Carrier Performance</h3>
 <BarChart3 className="h-icon-sm w-icon-sm text-gray-500" />
 </div>
 
 <div className="space-y-sm">
 {Object.entries(metrics.carrierStats)
 .sort(([,a], [,b]) => b.count - a.count)
 .slice(0, 5)
 .map(([carrier, stats]) => {
 const deliveryRate = stats.count > 0 ? (stats.delivered / stats.count) * 100 : 0;
 return (
 <div key={carrier} className="space-y-xs">
 <div className="flex items-center justify-between">
 <span className="text-sm font-medium">{carrier}</span>
 <span className="text-sm text-gray-600">{stats.count} shipments</span>
 </div>
 <div className="flex items-center gap-xs">
 <div className="flex-1 bg-gray-200 rounded-full h-2">
 <div 
 className="bg-blue-500 h-2 rounded-full" 
 style={{ width: `${deliveryRate}%` }}
 />
 </div>
 <span className="text-xs text-gray-500">{deliveryRate.toFixed(0)}%</span>
 </div>
 </div>
 );
 })}
 </div>
 </Card>
 </div>

 {/* Recent Activity */}
 <Card className="p-lg">
 <div className="flex items-center justify-between mb-4">
 <h3 className="text-lg font-semibold">Recent Activity</h3>
 <Activity className="h-icon-sm w-icon-sm text-gray-500" />
 </div>
 
 <div className="space-y-md">
 {items
 .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
 .slice(0, 5)
 .map((item) => (
 <div key={item.id} className="flex items-center gap-md p-sm bg-gray-50 rounded-lg">
 <div className="flex-shrink-0">
 {item.status === 'delivered' ? (
 <CheckCircle className="h-icon-sm w-icon-sm text-green-500" />
 ) : item.status === 'in_transit' ? (
 <Truck className="h-icon-sm w-icon-sm text-blue-500" />
 ) : item.status === 'delayed' ? (
 <AlertCircle className="h-icon-sm w-icon-sm text-red-500" />
 ) : (
 <Package className="h-icon-sm w-icon-sm text-orange-500" />
 )}
 </div>
 
 <div className="flex-1 min-w-0">
 <p className="text-sm font-medium text-gray-900">
 {item.order_number} - {item.vendor_name}
 </p>
 <p className="text-sm text-gray-600">
 Status updated to{' '}
 <Badge variant={getStatusColor(item.status)} className="ml-1">
 {item.status.replace('_', ' ').toUpperCase()}
 </Badge>
 </p>
 </div>
 
 <div className="flex-shrink-0 text-sm text-gray-500">
 {formatDate(item.updated_at)}
 </div>
 </div>
 ))}
 </div>
 
 {items.length === 0 && (
 <div className="text-center py-xl">
 <Activity className="h-icon-2xl w-icon-2xl text-gray-400 mx-auto mb-4" />
 <h3 className="text-lg font-medium text-gray-900 mb-2">No recent activity</h3>
 <p className="text-gray-500">Tracking updates will appear here as they occur.</p>
 </div>
 )}
 </Card>

 {/* Performance Insights */}
 {analytics && (
 <Card className="p-lg">
 <div className="flex items-center justify-between mb-4">
 <h3 className="text-lg font-semibold">Performance Insights</h3>
 <TrendingUp className="h-icon-sm w-icon-sm text-gray-500" />
 </div>
 
 <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
 <div className="text-center">
 <div className="text-2xl font-bold text-green-600 mb-1">
 {analytics.on_time_rate?.toFixed(1)}%
 </div>
 <p className="text-sm text-gray-600">On-Time Delivery Rate</p>
 </div>
 
 <div className="text-center">
 <div className="text-2xl font-bold text-blue-600 mb-1">
 {analytics.avg_delivery_days?.toFixed(1)}
 </div>
 <p className="text-sm text-gray-600">Avg Delivery Days</p>
 </div>
 
 <div className="text-center">
 <div className="text-2xl font-bold text-purple-600 mb-1">
 {analytics.cost_per_shipment ? formatCurrency(analytics.cost_per_shipment) : 'N/A'}
 </div>
 <p className="text-sm text-gray-600">Cost per Shipment</p>
 </div>
 </div>
 </Card>
 )}
 </div>
 );
}
