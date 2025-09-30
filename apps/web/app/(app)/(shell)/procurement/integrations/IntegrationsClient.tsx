'use client';

import { Zap, Settings, CheckCircle, AlertCircle, XCircle, Plus, Search, Filter, RefreshCw, ExternalLink, Database, ShoppingCart, CreditCard, FileText, Truck, BarChart3, Globe, Lock, Webhook, Cloud } from "lucide-react";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ghxstship/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ghxstship/ui';
import { Badge } from '@ghxstship/ui';
import { Button } from '@ghxstship/ui';
import { Input } from '@ghxstship/ui';
// Simple Switch component replacement
const Switch = ({ checked, onCheckedChange }: { checked: boolean; onCheckedChange: (checked: boolean) => void }) => (
 <button
 type="button"
 className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
 checked ? 'bg-blue-600' : 'bg-gray-200'
 }`}
 onClick={() => onCheckedChange(!checked)}
 >
 <span
 className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
 checked ? 'translate-x-6' : 'translate-x-1'
 }`}
 />
 </button>
);

interface IntegrationsClientProps {
 className?: string;
 orgId?: string;
}

interface Integration {
 id: string;
 name: string;
 description: string;
 category: 'erp' | 'marketplace' | 'payment' | 'shipping' | 'analytics' | 'accounting' | 'inventory';
 status: 'connected' | 'disconnected' | 'error' | 'pending';
 provider: string;
 icon: React.ReactNode;
 features: string[];
 lastSync?: string;
 syncFrequency: string;
 dataFlow: 'bidirectional' | 'inbound' | 'outbound';
 isEnabled: boolean;
 connectionHealth: 'healthy' | 'warning' | 'error';
 setupComplexity: 'easy' | 'medium' | 'complex';
 pricing: 'free' | 'paid' | 'enterprise';
}

interface IntegrationStats {
 totalIntegrations: number;
 activeConnections: number;
 dataTransferred: string;
 lastSyncTime: string;
 errorCount: number;
}

export default function IntegrationsClient({ className, orgId }: IntegrationsClientProps) {
 const [loading, setLoading] = useState(false);
 const [integrations, setIntegrations] = useState<Integration[]>([]);
 const [stats, setStats] = useState<IntegrationStats | null>(null);
 const [searchQuery, setSearchQuery] = useState('');
 const [selectedCategory, setSelectedCategory] = useState<string>('all');

 useEffect(() => {
 loadIntegrationsData();
 }, [orgId]);

 async function loadIntegrationsData() {
 setLoading(true);
 try {
 // In a real implementation, this would fetch from integrations API
 // For now, we'll use demo data with realistic procurement integrations
 
 const demoIntegrations: Integration[] = [
 {
 id: '1',
 name: 'SAP Ariba',
 description: 'Enterprise procurement and supply chain solutions',
 category: 'erp',
 status: 'connected',
 provider: 'SAP',
 icon: <Database className="h-6 w-6" />,
 features: ['Purchase Orders', 'Supplier Management', 'Contract Management', 'Spend Analytics'],
 lastSync: '2024-01-27T10:30:00Z',
 syncFrequency: 'Real-time',
 dataFlow: 'bidirectional',
 isEnabled: true,
 connectionHealth: 'healthy',
 setupComplexity: 'complex',
 pricing: 'enterprise'
 },
 {
 id: '2',
 name: 'Amazon Business',
 description: 'B2B marketplace for business procurement',
 category: 'marketplace',
 status: 'connected',
 provider: 'Amazon',
 icon: <ShoppingCart className="h-6 w-6" />,
 features: ['Product Catalog', 'Bulk Ordering', 'Business Pricing', 'Analytics'],
 lastSync: '2024-01-27T09:15:00Z',
 syncFrequency: 'Every 4 hours',
 dataFlow: 'bidirectional',
 isEnabled: true,
 connectionHealth: 'healthy',
 setupComplexity: 'easy',
 pricing: 'free'
 },
 {
 id: '3',
 name: 'Stripe Connect',
 description: 'Payment processing for vendor payments',
 category: 'payment',
 status: 'connected',
 provider: 'Stripe',
 icon: <CreditCard className="h-6 w-6" />,
 features: ['Vendor Payments', 'International Transfers', 'Payment Analytics', 'Compliance'],
 lastSync: '2024-01-27T11:00:00Z',
 syncFrequency: 'Real-time',
 dataFlow: 'outbound',
 isEnabled: true,
 connectionHealth: 'healthy',
 setupComplexity: 'medium',
 pricing: 'paid'
 },
 {
 id: '4',
 name: 'QuickBooks Online',
 description: 'Accounting and financial management integration',
 category: 'accounting',
 status: 'connected',
 provider: 'Intuit',
 icon: <FileText className="h-6 w-6" />,
 features: ['Invoice Sync', 'Expense Tracking', 'Financial Reporting', 'Tax Management'],
 lastSync: '2024-01-27T08:45:00Z',
 syncFrequency: 'Daily',
 dataFlow: 'bidirectional',
 isEnabled: true,
 connectionHealth: 'warning',
 setupComplexity: 'medium',
 pricing: 'paid'
 },
 {
 id: '5',
 name: 'FedEx Ship Manager',
 description: 'Shipping and logistics integration',
 category: 'shipping',
 status: 'connected',
 provider: 'FedEx',
 icon: <Truck className="h-6 w-6" />,
 features: ['Shipment Tracking', 'Label Generation', 'Rate Calculation', 'Delivery Notifications'],
 lastSync: '2024-01-27T07:20:00Z',
 syncFrequency: 'Every 2 hours',
 dataFlow: 'bidirectional',
 isEnabled: true,
 connectionHealth: 'healthy',
 setupComplexity: 'medium',
 pricing: 'free'
 },
 {
 id: '6',
 name: 'Tableau Analytics',
 description: 'Advanced procurement analytics and reporting',
 category: 'analytics',
 status: 'disconnected',
 provider: 'Salesforce',
 icon: <BarChart3 className="h-6 w-6" />,
 features: ['Spend Analytics', 'Supplier Performance', 'Cost Optimization', 'Custom Dashboards'],
 syncFrequency: 'Daily',
 dataFlow: 'inbound',
 isEnabled: false,
 connectionHealth: 'error',
 setupComplexity: 'complex',
 pricing: 'enterprise'
 },
 {
 id: '7',
 name: 'Oracle NetSuite',
 description: 'Enterprise resource planning integration',
 category: 'erp',
 status: 'pending',
 provider: 'Oracle',
 icon: <Globe className="h-6 w-6" />,
 features: ['Financial Management', 'Inventory Control', 'Order Management', 'Reporting'],
 syncFrequency: 'Real-time',
 dataFlow: 'bidirectional',
 isEnabled: false,
 connectionHealth: 'warning',
 setupComplexity: 'complex',
 pricing: 'enterprise'
 },
 {
 id: '8',
 name: 'Slack Notifications',
 description: 'Real-time procurement notifications and alerts',
 category: 'analytics',
 status: 'connected',
 provider: 'Slack',
 icon: <Zap className="h-6 w-6" />,
 features: ['Approval Notifications', 'Status Updates', 'Budget Alerts', 'Custom Workflows'],
 lastSync: '2024-01-27T11:30:00Z',
 syncFrequency: 'Real-time',
 dataFlow: 'outbound',
 isEnabled: true,
 connectionHealth: 'healthy',
 setupComplexity: 'easy',
 pricing: 'free'
 }
 ];

 const demoStats: IntegrationStats = {
 totalIntegrations: 8,
 activeConnections: 6,
 dataTransferred: '2.4 GB',
 lastSyncTime: '2024-01-27T11:30:00Z',
 errorCount: 2
 };

 setIntegrations(demoIntegrations);
 setStats(demoStats);
 
 } catch (error) {
 console.error('Error loading integrations data:', error);
 }
 setLoading(false);
 }

 const handleToggleIntegration = async (integrationId: string, enabled: boolean) => {
 try {
 // In a real implementation, this would call the API to enable/disable integration
 setIntegrations(prev => prev.map(integration => 
 integration.id === integrationId 
 ? { 
 ...integration, 
 isEnabled: enabled,
 status: enabled ? 'connected' : 'disconnected'
 }
 : integration
 ));
 } catch (error) {
 console.error('Error toggling integration:', error);
 }
 };

 const getStatusIcon = (status: string) => {
 switch (status) {
 case 'connected':
 return <CheckCircle className="h-4 w-4 text-green-500" />;
 case 'disconnected':
 return <XCircle className="h-4 w-4 text-gray-500" />;
 case 'error':
 return <AlertCircle className="h-4 w-4 text-red-500" />;
 case 'pending':
 return <AlertCircle className="h-4 w-4 text-yellow-500" />;
 default:
 return <XCircle className="h-4 w-4 text-gray-500" />;
 }
 };

 const getHealthColor = (health: string) => {
 switch (health) {
 case 'healthy':
 return 'text-green-500';
 case 'warning':
 return 'text-yellow-500';
 case 'error':
 return 'text-red-500';
 default:
 return 'text-gray-500';
 }
 };

 const getComplexityColor = (complexity: string) => {
 switch (complexity) {
 case 'easy':
 return 'bg-green-100 text-green-800';
 case 'medium':
 return 'bg-yellow-100 text-yellow-800';
 case 'complex':
 return 'bg-red-100 text-red-800';
 default:
 return 'bg-gray-100 text-gray-800';
 }
 };

 const getCategoryIcon = (category: string) => {
 switch (category) {
 case 'erp':
 return <Database className="h-4 w-4" />;
 case 'marketplace':
 return <ShoppingCart className="h-4 w-4" />;
 case 'payment':
 return <CreditCard className="h-4 w-4" />;
 case 'shipping':
 return <Truck className="h-4 w-4" />;
 case 'analytics':
 return <BarChart3 className="h-4 w-4" />;
 case 'accounting':
 return <FileText className="h-4 w-4" />;
 case 'inventory':
 return <Database className="h-4 w-4" />;
 default:
 return <Globe className="h-4 w-4" />;
 }
 };

 const filteredIntegrations = integrations.filter(integration => {
 const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
 integration.description.toLowerCase().includes(searchQuery.toLowerCase());
 const matchesCategory = selectedCategory === 'all' || integration.category === selectedCategory;
 return matchesSearch && matchesCategory;
 });

 return (
 <div className={className}>
 <div className="space-y-6">
 {/* Stats Cards */}
 {stats && (
 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
 <Card>
 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
 <CardTitle className="text-sm font-medium">Total Integrations</CardTitle>
 <Zap className="h-4 w-4 text-muted-foreground" />
 </CardHeader>
 <CardContent>
 <div className="text-2xl font-bold">{stats.totalIntegrations}</div>
 <p className="text-xs text-muted-foreground">
 Available connections
 </p>
 </CardContent>
 </Card>

 <Card>
 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
 <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
 <CheckCircle className="h-4 w-4 text-muted-foreground" />
 </CardHeader>
 <CardContent>
 <div className="text-2xl font-bold text-green-600">{stats.activeConnections}</div>
 <p className="text-xs text-muted-foreground">
 Currently connected
 </p>
 </CardContent>
 </Card>

 <Card>
 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
 <CardTitle className="text-sm font-medium">Data Transferred</CardTitle>
 <Cloud className="h-4 w-4 text-muted-foreground" />
 </CardHeader>
 <CardContent>
 <div className="text-2xl font-bold">{stats.dataTransferred}</div>
 <p className="text-xs text-muted-foreground">
 This month
 </p>
 </CardContent>
 </Card>

 <Card>
 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
 <CardTitle className="text-sm font-medium">Sync Errors</CardTitle>
 <AlertCircle className="h-4 w-4 text-muted-foreground" />
 </CardHeader>
 <CardContent>
 <div className="text-2xl font-bold text-red-600">{stats.errorCount}</div>
 <p className="text-xs text-muted-foreground">
 Requires attention
 </p>
 </CardContent>
 </Card>
 </div>
 )}

 {/* Controls */}
 <div className="flex items-center justify-between">
 <div className="flex items-center space-x-2">
 <div className="relative">
 <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
 <Input
 placeholder="Search integrations..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="pl-8 w-64"
 />
 </div>
 <select
 value={selectedCategory}
 onChange={(e) => setSelectedCategory(e.target.value)}
 className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
 >
 <option value="all">All Categories</option>
 <option value="erp">ERP Systems</option>
 <option value="marketplace">Marketplaces</option>
 <option value="payment">Payment</option>
 <option value="shipping">Shipping</option>
 <option value="analytics">Analytics</option>
 <option value="accounting">Accounting</option>
 <option value="inventory">Inventory</option>
 </select>
 </div>
 <div className="flex items-center space-x-2">
 <Button variant="outline" size="sm" onClick={loadIntegrationsData}>
 <RefreshCw className="h-4 w-4 mr-2" />
 Refresh
 </Button>
 <Button size="sm">
 <Plus className="h-4 w-4 mr-2" />
 Add Integration
 </Button>
 </div>
 </div>

 {/* Integrations Tabs */}
 <Tabs defaultValue="all-integrations" className="space-y-4">
 <TabsList>
 <TabsTrigger value="all-integrations">
 <Globe className="h-4 w-4 mr-2" />
 All Integrations
 </TabsTrigger>
 <TabsTrigger value="active">
 <CheckCircle className="h-4 w-4 mr-2" />
 Active
 </TabsTrigger>
 <TabsTrigger value="marketplace">
 <ShoppingCart className="h-4 w-4 mr-2" />
 Marketplace
 </TabsTrigger>
 <TabsTrigger value="webhooks">
 <Webhook className="h-4 w-4 mr-2" />
 Webhooks
 </TabsTrigger>
 </TabsList>

 <TabsContent value="all-integrations" className="space-y-4">
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 {filteredIntegrations.map((integration) => (
 <Card key={integration.id} className="relative">
 <CardHeader>
 <div className="flex items-start justify-between">
 <div className="flex items-center space-x-3">
 <div className="p-2 bg-gray-100 rounded-lg">
 {integration.icon}
 </div>
 <div>
 <CardTitle className="text-lg">{integration.name}</CardTitle>
 <div className="flex items-center space-x-2 mt-1">
 {getStatusIcon(integration.status)}
 <span className="text-sm text-muted-foreground capitalize">
 {integration.status}
 </span>
 </div>
 </div>
 </div>
 <Switch
 checked={integration.isEnabled}
 onCheckedChange={(checked) => handleToggleIntegration(integration.id, checked)}
 />
 </div>
 </CardHeader>
 <CardContent>
 <CardDescription className="mb-4">
 {integration.description}
 </CardDescription>
 
 <div className="space-y-3">
 <div className="flex items-center justify-between text-sm">
 <span className="text-muted-foreground">Category</span>
 <div className="flex items-center space-x-1">
 {getCategoryIcon(integration.category)}
 <span className="capitalize">{integration.category}</span>
 </div>
 </div>
 
 <div className="flex items-center justify-between text-sm">
 <span className="text-muted-foreground">Health</span>
 <span className={`font-medium ${getHealthColor(integration.connectionHealth)}`}>
 {integration.connectionHealth}
 </span>
 </div>
 
 <div className="flex items-center justify-between text-sm">
 <span className="text-muted-foreground">Setup</span>
 <Badge className={getComplexityColor(integration.setupComplexity)}>
 {integration.setupComplexity}
 </Badge>
 </div>
 
 <div className="flex items-center justify-between text-sm">
 <span className="text-muted-foreground">Pricing</span>
 <Badge variant={integration.pricing === 'free' ? 'secondary' : 'default'}>
 {integration.pricing}
 </Badge>
 </div>
 
 {integration.lastSync && (
 <div className="flex items-center justify-between text-sm">
 <span className="text-muted-foreground">Last Sync</span>
 <span>{new Date(integration.lastSync).toLocaleString()}</span>
 </div>
 )}
 </div>
 
 <div className="mt-4">
 <h4 className="text-sm font-medium mb-2">Features</h4>
 <div className="flex flex-wrap gap-1">
 {integration.features.slice(0, 3).map((feature, index) => (
 <Badge key={index} variant="outline" className="text-xs">
 {feature}
 </Badge>
 ))}
 {integration.features.length > 3 && (
 <Badge variant="outline" className="text-xs">
 +{integration.features.length - 3} more
 </Badge>
 )}
 </div>
 </div>
 
 <div className="flex justify-between mt-4">
 <Button variant="outline" size="sm">
 <Settings className="h-3 w-3 mr-1" />
 Configure
 </Button>
 <Button variant="outline" size="sm">
 <ExternalLink className="h-3 w-3 mr-1" />
 Docs
 </Button>
 </div>
 </CardContent>
 </Card>
 ))}
 </div>
 </TabsContent>

 <TabsContent value="active" className="space-y-4">
 <div className="grid grid-cols-1 gap-4">
 {filteredIntegrations
 .filter(integration => integration.status === 'connected')
 .map((integration) => (
 <Card key={integration.id}>
 <CardHeader>
 <div className="flex items-center justify-between">
 <div className="flex items-center space-x-3">
 <div className="p-2 bg-gray-100 rounded-lg">
 {integration.icon}
 </div>
 <div>
 <CardTitle>{integration.name}</CardTitle>
 <CardDescription>{integration.provider}</CardDescription>
 </div>
 </div>
 <div className="flex items-center space-x-2">
 <Badge className="bg-green-100 text-green-800">
 {integration.status}
 </Badge>
 <Switch
 checked={integration.isEnabled}
 onCheckedChange={(checked) => handleToggleIntegration(integration.id, checked)}
 />
 </div>
 </div>
 </CardHeader>
 <CardContent>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
 <div>
 <div className="text-muted-foreground">Sync Frequency</div>
 <div className="font-medium">{integration.syncFrequency}</div>
 </div>
 <div>
 <div className="text-muted-foreground">Data Flow</div>
 <div className="font-medium capitalize">{integration.dataFlow}</div>
 </div>
 <div>
 <div className="text-muted-foreground">Health</div>
 <div className={`font-medium ${getHealthColor(integration.connectionHealth)}`}>
 {integration.connectionHealth}
 </div>
 </div>
 {integration.lastSync && (
 <div>
 <div className="text-muted-foreground">Last Sync</div>
 <div className="font-medium">
 {new Date(integration.lastSync).toLocaleTimeString()}
 </div>
 </div>
 )}
 </div>
 </CardContent>
 </Card>
 ))}
 </div>
 </TabsContent>

 <TabsContent value="marketplace" className="space-y-4">
 <Card>
 <CardHeader>
 <CardTitle>Marketplace Integrations</CardTitle>
 <CardDescription>
 Connect with B2B marketplaces and supplier networks
 </CardDescription>
 </CardHeader>
 <CardContent>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {filteredIntegrations
 .filter(integration => integration.category === 'marketplace')
 .map((integration) => (
 <div key={integration.id} className="border rounded-lg p-4">
 <div className="flex items-center justify-between mb-3">
 <div className="flex items-center space-x-2">
 {integration.icon}
 <h4 className="font-medium">{integration.name}</h4>
 </div>
 {getStatusIcon(integration.status)}
 </div>
 <p className="text-sm text-muted-foreground mb-3">
 {integration.description}
 </p>
 <div className="flex justify-between items-center">
 <Badge className={getComplexityColor(integration.setupComplexity)}>
 {integration.setupComplexity} setup
 </Badge>
 <Button size="sm" variant="outline">
 {integration.status === 'connected' ? 'Manage' : 'Connect'}
 </Button>
 </div>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>
 </TabsContent>

 <TabsContent value="webhooks" className="space-y-4">
 <Card>
 <CardHeader>
 <CardTitle>Webhook Configuration</CardTitle>
 <CardDescription>
 Configure webhooks for real-time data synchronization
 </CardDescription>
 </CardHeader>
 <CardContent>
 <div className="space-y-4">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <label className="text-sm font-medium">Webhook URL</label>
 <Input 
 placeholder="https://your-app.com/webhooks/procurement"
 className="mt-1"
 />
 </div>
 <div>
 <label className="text-sm font-medium">Secret Key</label>
 <div className="flex mt-1">
 <Input 
 type="password"
 placeholder="webhook_secret_key"
 className="flex-1"
 />
 <Button variant="outline" className="ml-2">
 Generate
 </Button>
 </div>
 </div>
 </div>
 
 <div>
 <label className="text-sm font-medium">Events</label>
 <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
 {[
 'request.created',
 'request.approved',
 'order.placed',
 'order.delivered',
 'vendor.updated',
 'contract.expired'
 ].map((event) => (
 <label key={event} className="flex items-center space-x-2">
 <input type="checkbox" className="rounded" />
 <span className="text-sm">{event}</span>
 </label>
 ))}
 </div>
 </div>
 
 <div className="flex justify-end space-x-2">
 <Button variant="outline">Test Webhook</Button>
 <Button>Save Configuration</Button>
 </div>
 </div>
 </CardContent>
 </Card>
 </TabsContent>
 </Tabs>
 </div>
 </div>
 );
}
