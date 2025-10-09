'use client';

import { CreditCard, DollarSign, Download, FileText, History, Package, RefreshCw, Settings, TrendingUp } from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  DataViewProvider,
  StateManagerProvider,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  ViewSwitcher,
  useToastContext
} from "@ghxstship/ui";
import type { 
 BillingRecord, 
 BillingViewConfig, 
 BillingFieldConfig,
 BillingStatistics,
 BillingSearchParams,
 BillingClientProps
} from './types';
import { billingService } from './lib/billing-service';

// Field configuration for ATLVS DataViews
const fieldConfig: BillingFieldConfig[] = [
 {
 key: 'id',
 label: 'ID',
 type: 'text',
 width: 100,
 sortable: true,
 filterable: false
 },
 {
 key: 'name',
 label: 'Name',
 type: 'text',
 width: 200,
 sortable: true,
 filterable: true,
 required: true
 },
 {
 key: 'type',
 label: 'Type',
 type: 'select',
 width: 120,
 sortable: true,
 filterable: true,
 options: [
 { value: 'subscription', label: 'Subscription' },
 { value: 'invoice', label: 'Invoice' },
 { value: 'payment', label: 'Payment' },
 { value: 'plan', label: 'Plan' }
 ]
 },
 {
 key: 'amount',
 label: 'Amount',
 type: 'text',
 width: 120,
 sortable: true,
 filterable: true
 },
 {
 key: 'status',
 label: 'Status',
 type: 'select',
 width: 100,
 sortable: true,
 filterable: true,
 options: [
 { value: 'active', label: 'Active' },
 { value: 'paid', label: 'Paid' },
 { value: 'open', label: 'Open' },
 { value: 'current', label: 'Current' },
 { value: 'available', label: 'Available' }
 ]
 },
 {
 key: 'description',
 label: 'Description',
 type: 'textarea',
 width: 300,
 sortable: false,
 filterable: true
 },
 {
 key: 'category',
 label: 'Category',
 type: 'select',
 width: 120,
 sortable: true,
 filterable: true,
 options: [
 { value: 'subscriptions', label: 'Subscriptions' },
 { value: 'invoices', label: 'Invoices' },
 { value: 'payments', label: 'Payments' },
 { value: 'plans', label: 'Plans' }
 ]
 },
 {
 key: 'created_at',
 label: 'Created',
 type: 'date',
 width: 150,
 sortable: true,
 filterable: true
 },
 {
 key: 'updated_at',
 label: 'Updated',
 type: 'date',
 width: 150,
 sortable: true,
 filterable: true
 }
];

export default function BillingClient({ userId, orgId }: BillingClientProps) {
 const { toast } = useToastContext();
 
 // State management
 const [records, setRecords] = useState<BillingRecord[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
 const [statistics, setStatistics] = useState<BillingStatistics | null>(null);
 
 // View state
 const [currentView, setCurrentView] = useState<'grid' | 'list'>('grid');
 const [searchParams, setSearchParams] = useState<BillingSearchParams>({});
 const [activeTab, setActiveTab] = useState('overview');

 // Load billing records
 const loadRecords = useCallback(async (params?: BillingSearchParams) => {
 try {
 setLoading(true);
 setError(null);
 const data = await billingService.getBillingRecords(params);
 setRecords(data);
 } catch (err) {
 const message = err instanceof Error ? err.message : 'Failed to load billing records';
 setError(message);
 toast.error(message);
 } finally {
 setLoading(false);
 }
 }, [toast]);

 // Load statistics
 const loadStatistics = useCallback(async () => {
 try {
 const stats = await billingService.getStatistics();
 setStatistics(stats);
 } catch (err) {
 console.error('Failed to load statistics:', err);
 }
 }, []);

 // Event handlers
 const handleExport = useCallback(async (format: 'csv' | 'json') => {
 try {
 const blob = await billingService.exportRecords({
  // eslint-disable-next-line react-hooks/exhaustive-deps
 format,
 includeMetadata: true
 });

 const url = URL.createObjectURL(blob);
 const a = document.createElement('a');
 a.href = url;
 a.download = `billing-records.${format}`;
 document.body.appendChild(a);
 a.click();
 document.body.removeChild(a);
 URL.revokeObjectURL(url);

 toast.success(`Records exported as ${format.toUpperCase()}`);
 } catch (err) {
 const message = err instanceof Error ? err.message : 'Failed to export records';
 toast.error(message);
 }
 }, [toast]);

 // Initial data load
 useEffect(() => {
 loadRecords();
 loadStatistics();
 }, [loadRecords, loadStatistics]);

 // ATLVS DataViews configuration
 const dataViewConfig: BillingViewConfig = useMemo(() => ({
 id: 'billing',
  // eslint-disable-next-line react-hooks/exhaustive-deps
 name: 'Billing Management',
 viewType: currentView,
 // eslint-disable-next-line react-hooks/exhaustive-deps
 // eslint-disable-next-line react-hooks/exhaustive-deps
 defaultView: 'grid',
 fields: fieldConfig,
 data: records,
 onSearch: async (query: string) => {
 const params = { ...searchParams, query };
 setSearchParams(params);
 await loadRecords(params);
 },
 onFilter: async (filters: unknown) => {
 const params = { ...searchParams, ...filters };
 setSearchParams(params);
 await loadRecords(params);
 },
 onSort: async (sorts: unknown) => {
 },
 onRefresh: async () => {
 await loadRecords(searchParams);
 await loadStatistics();
 return records;
 },
 onExport: (data: unknown, format: unknown) => {
 handleExport(format as 'csv' | 'json');
 }
 }), [currentView, records, searchParams, loadRecords, loadStatistics, handleExport]);

 const handleRefresh = async () => {
 await loadRecords(searchParams);
 await loadStatistics();
 };

 // View switcher component
 const ViewSwitcher = () => (
 <div className="flex items-center gap-xs">
 <Button
 variant={currentView === 'grid' ? 'default' : 'outline'}
 size="sm"
 onClick={() => setCurrentView('grid')}
 >
 Grid
 </Button>
 <Button
 variant={currentView === 'list' ? 'default' : 'outline'}
 size="sm"
 onClick={() => setCurrentView('list')}
 >
 List
 </Button>
 </div>
 );

 // Simple grid view for billing
 const renderBillingGrid = () => {
 if (loading) {
 return (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
 {[...Array(6)].map((_, i) => (
 <Card key={i} className="animate-pulse">
 <CardContent className="p-lg">
 <div className="h-icon-xs bg-muted rounded w-3/4 mb-2"></div>
 <div className="h-3 bg-muted rounded w-1/2"></div>
 </CardContent>
 </Card>
 ))}
 </div>
 );
 }

 const subscriptionRecords = records.filter(r => r.type === 'subscription');
 const invoiceRecords = records.filter(r => r.type === 'invoice');
 const paymentRecords = records.filter(r => r.type === 'payment');
 const planRecords = records.filter(r => r.type === 'plan');

 return (
 <div className="space-y-lg">
 {/* Current Subscription */}
 {subscriptionRecords.length > 0 && (
 <div>
 <h3 className="text-lg font-semibold mb-4">Current Subscription</h3>
 <div className="grid grid-cols-1 gap-md">
 {subscriptionRecords.map((record) => (
 <Card key={record.id} className="border-2 border-primary">
 <CardContent className="p-lg">
 <div className="flex items-start justify-between mb-3">
 <div>
 <h4 className="font-medium text-lg">{record.name}</h4>
 <p className="text-sm text-muted-foreground">{record.description}</p>
 </div>
 <div className="text-right">
 <div className="text-2xl font-bold">{record.amount}</div>
 <Badge variant="primary">{record.status}</Badge>
 </div>
 </div>
 </CardContent>
 </Card>
 ))}
 </div>
 </div>
 )}

 {/* Recent Invoices */}
 {invoiceRecords.length > 0 && (
 <div>
 <h3 className="text-lg font-semibold mb-4">Recent Invoices ({invoiceRecords.length})</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
 {invoiceRecords.slice(0, 4).map((record) => (
 <Card key={record.id} className="hover:shadow-md transition-shadow">
 <CardContent className="p-lg">
 <div className="flex items-start justify-between mb-3">
 <div>
 <h4 className="font-medium">{record.name}</h4>
 <p className="text-sm text-muted-foreground">{record.description}</p>
 </div>
 <div className="text-right">
 <div className="font-bold">{record.amount}</div>
 <Badge variant={record.status === 'paid' ? 'default' : 'destructive'}>
 {record.status}
 </Badge>
 </div>
 </div>
 </CardContent>
 </Card>
 ))}
 </div>
 </div>
 )}

 {/* Payment Methods */}
 {paymentRecords.length > 0 && (
 <div>
 <h3 className="text-lg font-semibold mb-4">Payment Methods ({paymentRecords.length})</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
 {paymentRecords.map((record) => (
 <Card key={record.id} className="hover:shadow-md transition-shadow">
 <CardContent className="p-lg">
 <div className="flex items-center gap-sm mb-3">
 <CreditCard className="h-icon-lg w-icon-lg text-muted-foreground" />
 <div>
 <h4 className="font-medium">{record.name}</h4>
 <p className="text-sm text-muted-foreground">{record.description}</p>
 </div>
 </div>
 <Badge variant={record.amount === 'Default' ? 'default' : 'outline'}>
 {record.amount}
 </Badge>
 </CardContent>
 </Card>
 ))}
 </div>
 </div>
 )}

 {/* Available Plans */}
 {planRecords.length > 0 && (
 <div>
 <h3 className="text-lg font-semibold mb-4">Available Plans ({planRecords.length})</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
 {planRecords.map((record) => (
 <Card key={record.id} className={`hover:shadow-md transition-shadow ${
 record.status === 'current' ? 'border-2 border-primary' : ''
 }`}>
 <CardContent className="p-lg">
 <div className="text-center mb-4">
 <h4 className="font-medium text-lg">{record.name}</h4>
 <div className="text-2xl font-bold mt-2">{record.amount}</div>
 </div>
 <p className="text-sm text-muted-foreground text-center mb-3">
 {record.description}
 </p>
 <Badge 
 variant={record.status === 'current' ? 'default' : 'outline'}
 className="w-full justify-center"
 >
 {record.status === 'current' ? 'Current Plan' : 'Available'}
 </Badge>
 </CardContent>
 </Card>
 ))}
 </div>
 </div>
 )}
 </div>
 );
 };

 if (error) {
 return (
 <div className="flex items-center justify-center h-container-lg">
 <div className="text-center">
 <p className="text-destructive mb-4">{error}</p>
 <Button onClick={() => loadRecords()}>
 <RefreshCw className="h-icon-xs w-icon-xs mr-2" />
 Retry
 </Button>
 </div>
 </div>
 );
 }

 return (
 <DataViewProvider config={dataViewConfig}>
 <StateManagerProvider>
 <div className="space-y-lg">
 {/* Header */}
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-3xl font-bold">Billing & Subscription</h1>
 <p className="text-muted-foreground mt-1">
 Manage your subscription, billing, and payment methods
 </p>
 </div>
 <div className="flex items-center gap-sm">
 <Button variant="outline" onClick={handleRefresh} disabled={loading}>
 <RefreshCw className="h-icon-xs w-icon-xs mr-2" />
 Refresh
 </Button>
 <Button variant="outline" onClick={() => handleExport('csv')}>
 <Download className="h-icon-xs w-icon-xs mr-2" />
 Export
 </Button>
 </div>
 </div>

 {/* Statistics */}
 {statistics && (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
 <div className="bg-card p-md rounded-lg border">
 <div className="flex items-center gap-xs mb-2">
 <Package className="h-icon-sm w-icon-sm text-blue-600" />
 <div className="text-sm font-medium">Current Plan</div>
 </div>
 <div className="text-2xl font-bold">{statistics.currentPlan}</div>
 <div className="text-xs text-muted-foreground">
 Next billing: {new Date(statistics.nextBillingDate).toLocaleDateString()}
 </div>
 </div>
 <div className="bg-card p-md rounded-lg border">
 <div className="flex items-center gap-xs mb-2">
 <DollarSign className="h-icon-sm w-icon-sm text-green-600" />
 <div className="text-sm font-medium">Monthly Spend</div>
 </div>
 <div className="text-2xl font-bold">${statistics.monthlySpend}</div>
 <div className="text-xs text-muted-foreground">
 current billing cycle
 </div>
 </div>
 <div className="bg-card p-md rounded-lg border">
 <div className="flex items-center gap-xs mb-2">
 <FileText className="h-icon-sm w-icon-sm text-purple-600" />
 <div className="text-sm font-medium">Invoices</div>
 </div>
 <div className="text-2xl font-bold">{statistics.paidInvoices}</div>
 <div className="text-xs text-muted-foreground">
 of {statistics.totalInvoices} total
 </div>
 </div>
 <div className="bg-card p-md rounded-lg border">
 <div className="flex items-center gap-xs mb-2">
 <TrendingUp className="h-icon-sm w-icon-sm text-orange-600" />
 <div className="text-sm font-medium">Usage</div>
 </div>
 <div className="text-2xl font-bold">
 {statistics.usageMetrics.users.current}/{statistics.usageMetrics.users.limit}
 </div>
 <div className="text-xs text-muted-foreground">
 users this month
 </div>
 </div>
 </div>
 )}

 {/* Tab Navigation */}
 <Tabs value={activeTab} onValueChange={setActiveTab}>
 <TabsList className="grid w-full grid-cols-4">
 <TabsTrigger value="overview">
 <Package className="h-icon-xs w-icon-xs mr-2" />
 Overview
 </TabsTrigger>
 <TabsTrigger value="subscription">
 <Package className="h-icon-xs w-icon-xs mr-2" />
 Subscription
 </TabsTrigger>
 <TabsTrigger value="invoices">
 <FileText className="h-icon-xs w-icon-xs mr-2" />
 Invoices
 </TabsTrigger>
 <TabsTrigger value="settings">
 <Settings className="h-icon-xs w-icon-xs mr-2" />
 Settings
 </TabsTrigger>
 </TabsList>

 <TabsContent value="overview" className="space-y-md">
 {/* View Controls */}
 <div className="flex items-center justify-between">
 <ViewSwitcher />
 <div className="flex items-center gap-xs">
 {selectedRecords.length > 0 && (
 <Button variant="outline" size="sm">
 Actions ({selectedRecords.length})
 </Button>
 )}
 </div>
 </div>

 {/* Main Content */}
 {renderBillingGrid()}
 </TabsContent>

 <TabsContent value="subscription" className="space-y-md">
 <div className="bg-card p-xl rounded-lg border text-center">
 <Package className="h-icon-2xl w-icon-2xl mx-auto mb-4 text-muted-foreground" />
 <h3 className="text-lg font-semibold mb-2">Subscription Management</h3>
 <p className="text-muted-foreground mb-4">
 Subscription management is available through the overview interface above.
 </p>
 <Button onClick={() => setActiveTab('overview')}>
 Go to Overview
 </Button>
 </div>
 </TabsContent>

 <TabsContent value="invoices" className="space-y-md">
 <div className="bg-card p-xl rounded-lg border text-center">
 <FileText className="h-icon-2xl w-icon-2xl mx-auto mb-4 text-muted-foreground" />
 <h3 className="text-lg font-semibold mb-2">Invoice History</h3>
 <p className="text-muted-foreground mb-4">
 Invoice history is available through the overview interface above.
 </p>
 <Button onClick={() => setActiveTab('overview')}>
 Go to Overview
 </Button>
 </div>
 </TabsContent>

 <TabsContent value="settings" className="space-y-md">
 <div className="bg-card p-xl rounded-lg border text-center">
 <Settings className="h-icon-2xl w-icon-2xl mx-auto mb-4 text-muted-foreground" />
 <h3 className="text-lg font-semibold mb-2">Billing Settings</h3>
 <p className="text-muted-foreground mb-4">
 Billing settings configuration will be available in a future update.
 </p>
 <Button onClick={() => setActiveTab('overview')}>
 Go to Overview
 </Button>
 </div>
 </TabsContent>
 </Tabs>
 </div>
 </StateManagerProvider>
 </DataViewProvider>
 );
}
