'use client';

import { AlertTriangle, BarChart3, Calendar, CheckCircle, Clock, DollarSign, Download, Filter, LineChart, PieChart, ShoppingCart, Target, TrendingDown, TrendingUp, Users } from 'lucide-react';
import React, { useState, useCallback, useEffect } from 'react';
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger } from '@ghxstship/ui';

interface AnalyticsClientProps {
 className?: string;
 orgId?: string;
}

interface AnalyticsMetric {
 id: string;
 title: string;
 value: string | number;
 change: number;
 trend: 'up' | 'down' | 'stable';
 icon: React.ReactNode;
 description: string;
}

interface SpendAnalysis {
 category: string;
 amount: number;
 percentage: number;
 trend: 'up' | 'down' | 'stable';
}

interface VendorPerformance {
 vendor: string;
 orders: number;
 totalSpend: number;
 avgDeliveryTime: number;
 rating: number;
 onTimeDelivery: number;
}

export default function AnalyticsClient({ className, orgId }: AnalyticsClientProps) {
 const [loading, setLoading] = useState(false);
 const [timeRange, setTimeRange] = useState('30d');
 const [activeTab, setActiveTab] = useState('spend-analysis');
 const [metrics, setMetrics] = useState<AnalyticsMetric[]>([]);
 const [spendAnalysis, setSpendAnalysis] = useState<SpendAnalysis[]>([]);
 const [vendorPerformance, setVendorPerformance] = useState<VendorPerformance[]>([]);

 // eslint-disable-next-line react-hooks/exhaustive-deps
 useEffect(() => {
 loadAnalyticsData();
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [timeRange, orgId]);

 async function loadAnalyticsData() {
 setLoading(true);
 try {
 // In a real implementation, this would fetch from analytics API
 // For now, we'll use demo data with realistic procurement metrics
 
 const demoMetrics: AnalyticsMetric[] = [
 {
 id: 'total-spend',
 title: 'Total Spend',
 value: '$2.4M',
 change: 12.5,
 trend: 'up',
 icon: <DollarSign className="h-icon-xs w-icon-xs" />,
 description: 'Total procurement spend this period'
 },
 {
 id: 'active-orders',
 title: 'Active Orders',
 value: 156,
 change: -8.2,
 trend: 'down',
 icon: <ShoppingCart className="h-icon-xs w-icon-xs" />,
 description: 'Currently active purchase orders'
 },
 {
 id: 'avg-approval-time',
 title: 'Avg Approval Time',
 value: '2.3 days',
 change: -15.7,
 trend: 'down',
 icon: <Clock className="h-icon-xs w-icon-xs" />,
 description: 'Average time for request approval'
 },
 {
 id: 'vendor-count',
 title: 'Active Vendors',
 value: 89,
 change: 5.3,
 trend: 'up',
 icon: <Users className="h-icon-xs w-icon-xs" />,
 description: 'Number of active vendor relationships'
 },
 {
 id: 'cost-savings',
 title: 'Cost Savings',
 value: '$180K',
 change: 22.1,
 trend: 'up',
 icon: <Target className="h-icon-xs w-icon-xs" />,
 description: 'Total cost savings achieved'
 },
 {
 id: 'compliance-rate',
 title: 'Compliance Rate',
 value: '94.2%',
 change: 3.1,
 trend: 'up',
 icon: <CheckCircle className="h-icon-xs w-icon-xs" />,
 description: 'Procurement policy compliance rate'
 }
 ];

 const demoSpendAnalysis: SpendAnalysis[] = [
 { category: 'Equipment', amount: 850000, percentage: 35.4, trend: 'up' },
 { category: 'Services', amount: 720000, percentage: 30.0, trend: 'stable' },
 { category: 'Supplies', amount: 480000, percentage: 20.0, trend: 'down' },
 { category: 'Software', amount: 240000, percentage: 10.0, trend: 'up' },
 { category: 'Maintenance', amount: 110000, percentage: 4.6, trend: 'stable' }
 ];

 const demoVendorPerformance: VendorPerformance[] = [
 {
 vendor: 'Tech Equipment Co.',
 orders: 45,
 totalSpend: 450000,
 avgDeliveryTime: 5.2,
 rating: 4.8,
 onTimeDelivery: 96
 },
 {
 vendor: 'Seaside Catering Co.',
 orders: 32,
 totalSpend: 180000,
 avgDeliveryTime: 2.1,
 rating: 4.6,
 onTimeDelivery: 98
 },
 {
 vendor: 'West Marine',
 orders: 28,
 totalSpend: 320000,
 avgDeliveryTime: 7.3,
 rating: 4.4,
 onTimeDelivery: 89
 },
 {
 vendor: 'Industrial Solutions Ltd.',
 orders: 19,
 totalSpend: 280000,
 avgDeliveryTime: 8.7,
 rating: 4.2,
 onTimeDelivery: 85
 }
 ];

 setMetrics(demoMetrics);
 setSpendAnalysis(demoSpendAnalysis);
 setVendorPerformance(demoVendorPerformance);
 
 } catch (error) {
 console.error('Error loading analytics data:', error);
 }
 setLoading(false);
 }

 const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
 switch (trend) {
 case 'up':
 return <TrendingUp className="h-3 w-3 text-green-500" />;
 case 'down':
 return <TrendingDown className="h-3 w-3 text-red-500" />;
 default:
 return <div className="h-3 w-3 rounded-full bg-gray-400" />;
 }
 };

 const formatCurrency = (amount: number) => {
 return new Intl.NumberFormat('en-US', {
 style: 'currency',
 currency: 'USD',
 minimumFractionDigits: 0,
 maximumFractionDigits: 0
 }).format(amount);
 };

 return (
 <div className={className}>
 <div className="space-y-lg">
 {/* Controls */}
 <div className="flex items-center justify-between">
 <div className="flex items-center space-x-xs">
 <Button variant="secondary" size="sm">
 <Filter className="h-icon-xs w-icon-xs mr-2" />
 Filters
 </Button>
 <Button variant="secondary" size="sm">
 <Calendar className="h-icon-xs w-icon-xs mr-2" />
 {timeRange === '7d' ? 'Last 7 days' : 
 timeRange === '30d' ? 'Last 30 days' : 
 timeRange === '90d' ? 'Last 90 days' : 'Last year'}
 </Button>
 </div>
 <Button variant="secondary" size="sm">
 <Download className="h-icon-xs w-icon-xs mr-2" />
 Export Report
 </Button>
 </div>

 {/* Key Metrics */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
 {metrics.map((metric) => (
 <Card key={metric.id}>
 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
 <CardTitle className="text-sm font-medium">
 {metric.title}
 </CardTitle>
 {metric.icon}
 </CardHeader>
 <CardContent>
 <div className="text-2xl font-bold">{metric.value}</div>
 <div className="flex items-center text-xs text-muted-foreground">
 {getTrendIcon(metric.trend)}
 <span className={`ml-1 ${
 metric.trend === 'up' ? 'text-green-500' : 
 metric.trend === 'down' ? 'text-red-500' : 
 'text-gray-500'
 }`}>
 {metric.change > 0 ? '+' : ''}{metric.change}%
 </span>
 <span className="ml-1">from last period</span>
 </div>
 <p className="text-xs text-muted-foreground mt-1">
 {metric.description}
 </p>
 </CardContent>
 </Card>
))}
</div>

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-md">
      <TabsList>
      <TabsTrigger value="spend-analysis">
        <PieChart className="h-icon-xs w-icon-xs mr-2" />
        Spend Analysis
      </TabsTrigger>
      <TabsTrigger value="vendor-performance">
 Vendor Performance
 </TabsTrigger>
 <TabsTrigger value="trends">
 <LineChart className="h-icon-xs w-icon-xs mr-2" />
 Trends & Forecasting
 </TabsTrigger>
 <TabsTrigger value="compliance">
 <CheckCircle className="h-icon-xs w-icon-xs mr-2" />
 Compliance & Risk
 </TabsTrigger>
 </TabsList>

 <TabsContent value="spend-analysis" className="space-y-md">
 <Card>
 <CardHeader>
 <CardTitle>Spend by Category</CardTitle>
 <CardDescription>
 Breakdown of procurement spend across different categories
 </CardDescription>
 </CardHeader>
 <CardContent>
 <div className="space-y-md">
 {spendAnalysis.map((item, index) => (
 <div key={index} className="flex items-center justify-between">
 <div className="flex items-center space-x-sm">
 <div className="flex items-center space-x-xs">
 <div 
 className="w-3 h-3 rounded-full"
 style={{ 
 backgroundColor: `hsl(${index * 60}, 70%, 50%)` 
 }}
 />
 <span className="font-medium">{item.category}</span>
 </div>
 {getTrendIcon(item.trend)}
 </div>
 <div className="text-right">
 <div className="font-medium">{formatCurrency(item.amount)}</div>
 <div className="text-sm text-muted-foreground">
 {item.percentage}%
 </div>
 </div>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>
 </TabsContent>

 <TabsContent value="vendor-performance" className="space-y-md">
 <Card>
 <CardHeader>
 <CardTitle>Top Vendor Performance</CardTitle>
 <CardDescription>
 Key performance metrics for your top vendors
 </CardDescription>
 </CardHeader>
 <CardContent>
 <div className="space-y-md">
 {vendorPerformance.map((vendor, index) => (
 <div key={index} className="border rounded-lg p-md">
 <div className="flex items-center justify-between mb-3">
 <h4 className="font-medium">{vendor.vendor}</h4>
 <Badge variant="secondary">
 {vendor.rating}/5.0 ⭐
 </Badge>
 </div>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-md text-sm">
 <div>
 <div className="text-muted-foreground">Orders</div>
 <div className="font-medium">{vendor.orders}</div>
 </div>
 <div>
 <div className="text-muted-foreground">Total Spend</div>
 <div className="font-medium">{formatCurrency(vendor.totalSpend)}</div>
 </div>
 <div>
 <div className="text-muted-foreground">Avg Delivery</div>
 <div className="font-medium">{vendor.avgDeliveryTime} days</div>
 </div>
 <div>
 <div className="text-muted-foreground">On-Time</div>
 <div className="font-medium">{vendor.onTimeDelivery}%</div>
 </div>
 </div>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>
 </TabsContent>

 <TabsContent value="trends" className="space-y-md">
 <Card>
 <CardHeader>
 <CardTitle>Procurement Trends</CardTitle>
 <CardDescription>
 Historical trends and future projections
 </CardDescription>
 </CardHeader>
 <CardContent>
 <div className="h-container-sm flex items-center justify-center text-muted-foreground">
 <div className="text-center">
 <LineChart className="h-icon-2xl w-icon-2xl mx-auto mb-4 opacity-50" />
 <p>Interactive charts and trend analysis</p>
 <p className="text-sm">Would integrate with charting library like Chart.js or D3</p>
 </div>
 </div>
 </CardContent>
 </Card>
 </TabsContent>

 <TabsContent value="compliance" className="space-y-md">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center">
 <CheckCircle className="h-icon-sm w-icon-sm mr-2 text-green-500" />
 Compliance Score
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="text-3xl font-bold text-green-500 mb-2">94.2%</div>
 <p className="text-sm text-muted-foreground">
 Overall procurement policy compliance rate
 </p>
 <div className="mt-4 space-y-xs">
 <div className="flex justify-between text-sm">
 <span>Approval Process</span>
 <span className="text-green-500">98%</span>
 </div>
 <div className="flex justify-between text-sm">
 <span>Vendor Verification</span>
 <span className="text-green-500">96%</span>
 </div>
 <div className="flex justify-between text-sm">
 <span>Budget Compliance</span>
 <span className="text-yellow-500">89%</span>
 </div>
 </div>
 </CardContent>
 </Card>

 <Card>
 <CardHeader>
 <CardTitle className="flex items-center">
 <AlertTriangle className="h-icon-sm w-icon-sm mr-2 text-yellow-500" />
 Risk Indicators
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="space-y-sm">
 <div className="flex items-center justify-between">
 <span className="text-sm">Single Source Dependencies</span>
 <Badge variant="error">High</Badge>
 </div>
 <div className="flex items-center justify-between">
 <span className="text-sm">Budget Overruns</span>
 <Badge variant="secondary">Medium</Badge>
 </div>
 <div className="flex items-center justify-between">
 <span className="text-sm">Vendor Performance</span>
 <Badge variant="secondary">Low</Badge>
 </div>
 <div className="flex items-center justify-between">
 <span className="text-sm">Contract Renewals</span>
 <Badge variant="secondary">Medium</Badge>
 </div>
 </div>
 </CardContent>
 </Card>
 </div>
 </TabsContent>
 </Tabs>
 </div>
 </div>
 );
}
