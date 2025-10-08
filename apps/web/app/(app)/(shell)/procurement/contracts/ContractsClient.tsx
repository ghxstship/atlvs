'use client';

import { AlertTriangle, Building, Calendar, CheckCircle, Clock, DollarSign, Download, Edit, Eye, FileText, Filter, Gavel, Plus, RefreshCw, Search, TrendingUp, Users } from 'lucide-react';
import React, { useState, useCallback, useState, useEffect } from 'react';
import { AppDrawer, Badge, Button, CalendarView, Card, CardBody, CardContent, CardDescription, CardHeader, CardTitle, DataActions, DataGrid, DataViewProvider, Input, KanbanBoard, ListView, Tabs, TabsContent, TabsList, TabsTrigger, ViewSwitcher } from '@ghxstship/ui';
import type { FilterConfig, SortConfig, DataViewConfig, FieldConfig, DataRecord } from '@ghxstship/ui';

interface ContractsClientProps {
 className?: string;
 orgId?: string;
}

interface Contract {
 id: string;
 title: string;
 vendor: string;
 type: 'master_agreement' | 'purchase_agreement' | 'service_agreement' | 'nda' | 'sow';
 status: 'draft' | 'under_review' | 'negotiation' | 'approved' | 'active' | 'expired' | 'terminated';
 value: number;
 currency: string;
 startDate: string;
 endDate: string;
 renewalDate?: string;
 autoRenewal: boolean;
 terms: string;
 paymentTerms: string;
 deliverables: string[];
 riskLevel: 'low' | 'medium' | 'high';
 assignedTo: string;
 createdAt: string;
 updatedAt: string;
}

export default function ContractsClient({ className, orgId }: ContractsClientProps) {
 const [loading, setLoading] = useState(false);
 const [contracts, setContracts] = useState<Contract[]>([]);
 const [searchQuery, setSearchQuery] = useState('');
 const [selectedDrawerContract, setSelectedDrawerContract] = useState<Contract | null>(null);
 const [drawerMode, setDrawerMode] = useState<'view' | 'edit' | 'create'>('view');
 const [drawerOpen, setDrawerOpen] = useState(false);

 // Define field configuration for contracts
 const fieldConfig: FieldConfig[] = [
 {
 key: 'title',
 label: 'Contract Title',
 type: 'text',
 required: true,
 sortable: true
 },
 {
 key: 'vendor',
 label: 'Vendor',
 type: 'text',
 required: true,
 sortable: true
 },
 {
 key: 'type',
 label: 'Contract Type',
 type: 'select',
 options: [
 { value: 'master_agreement', label: 'Master Agreement' },
 { value: 'purchase_agreement', label: 'Purchase Agreement' },
 { value: 'service_agreement', label: 'Service Agreement' },
 { value: 'nda', label: 'NDA' },
 { value: 'sow', label: 'Statement of Work' }
 ],
 filterable: true,
 sortable: true
 },
 {
 key: 'status',
 label: 'Status',
 type: 'select',
 options: [
 { value: 'draft', label: 'Draft' },
 { value: 'under_review', label: 'Under Review' },
 { value: 'negotiation', label: 'Negotiation' },
 { value: 'approved', label: 'Approved' },
 { value: 'active', label: 'Active' },
 { value: 'expired', label: 'Expired' },
 { value: 'terminated', label: 'Terminated' }
 ],
 filterable: true,
 sortable: true
 },
 {
 key: 'value',
 label: 'Contract Value',
 type: 'currency',
 required: true,
 sortable: true
 },
 {
 key: 'startDate',
 label: 'Start Date',
 type: 'date',
 required: true,
 sortable: true
 },
 {
 key: 'endDate',
 label: 'End Date',
 type: 'date',
 required: true,
 sortable: true
 },
 {
 key: 'renewalDate',
 label: 'Renewal Date',
 type: 'date',
 sortable: true
 },
 {
 key: 'riskLevel',
 label: 'Risk Level',
 type: 'select',
 options: [
 { value: 'low', label: 'Low' },
 { value: 'medium', label: 'Medium' },
 { value: 'high', label: 'High' }
 ],
 filterable: true,
 sortable: true
 },
 {
 key: 'assignedTo',
 label: 'Assigned To',
 type: 'text',
 sortable: true
 }
 ];

 // eslint-disable-next-line react-hooks/exhaustive-deps
 useEffect(() => {
 loadContractsData();
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [orgId]);

 async function loadContractsData() {
 setLoading(true);
 try {
 // In a real implementation, this would fetch from contracts API
 // For now, we'll use demo data
 
 const demoContracts: Contract[] = [
 {
 id: '1',
 title: 'Tech Equipment Co. Master Agreement',
 vendor: 'Tech Equipment Co.',
 type: 'master_agreement',
 status: 'active',
 value: 500000,
 currency: 'USD',
 startDate: '2024-01-01',
 endDate: '2024-12-31',
 renewalDate: '2024-11-01',
 autoRenewal: true,
 terms: 'Standard master agreement for equipment procurement with volume discounts',
 paymentTerms: 'Net 30 days',
 deliverables: ['Equipment delivery', 'Installation support', 'Warranty coverage'],
 riskLevel: 'low',
 assignedTo: 'Quartermaster',
 createdAt: '2023-12-01T10:00:00Z',
 updatedAt: '2024-01-15T14:30:00Z'
 },
 {
 id: '2',
 title: 'Seaside Catering Service Agreement',
 vendor: 'Seaside Catering Co.',
 type: 'service_agreement',
 status: 'active',
 value: 120000,
 currency: 'USD',
 startDate: '2024-01-01',
 endDate: '2024-06-30',
 renewalDate: '2024-05-01',
 autoRenewal: false,
 terms: 'Catering services for production crew with dietary accommodation requirements',
 paymentTerms: 'Net 15 days',
 deliverables: ['Daily meal service', 'Special dietary accommodations', 'Emergency catering'],
 riskLevel: 'medium',
 assignedTo: 'Captain Blackbeard',
 createdAt: '2023-11-15T09:00:00Z',
 updatedAt: '2024-01-10T11:20:00Z'
 },
 {
 id: '3',
 title: 'West Marine Safety Equipment Contract',
 vendor: 'West Marine',
 type: 'purchase_agreement',
 status: 'negotiation',
 value: 85000,
 currency: 'USD',
 startDate: '2024-02-01',
 endDate: '2024-07-31',
 autoRenewal: false,
 terms: 'Safety equipment procurement with compliance certification requirements',
 paymentTerms: 'Net 30 days',
 deliverables: ['Safety equipment delivery', 'Compliance certification', 'Training materials'],
 riskLevel: 'high',
 assignedTo: 'Bosun',
 createdAt: '2024-01-20T16:00:00Z',
 updatedAt: '2024-01-25T10:15:00Z'
 },
 {
 id: '4',
 title: 'Industrial Solutions Maintenance SOW',
 vendor: 'Industrial Solutions Ltd.',
 type: 'sow',
 status: 'under_review',
 value: 45000,
 currency: 'USD',
 startDate: '2024-03-01',
 endDate: '2024-08-31',
 autoRenewal: true,
 terms: 'Preventive maintenance services for industrial equipment',
 paymentTerms: 'Net 45 days',
 deliverables: ['Monthly maintenance', 'Emergency repairs', 'Performance reports'],
 riskLevel: 'medium',
 assignedTo: 'Ship Engineer',
 createdAt: '2024-01-18T13:30:00Z',
 updatedAt: '2024-01-22T09:45:00Z'
 }
 ];

 setContracts(demoContracts);
 
 } catch (error) {
 console.error('Error loading contracts data:', error);
 }
 setLoading(false);
 }

 // Transform contracts to DataRecord format
 const contractsData: DataRecord[] = contracts.map(contract => ({
 id: contract.id,
 title: contract.title,
 vendor: contract.vendor,
 type: contract.type,
 status: contract.status,
 value: contract.value,
 currency: contract.currency,
 startDate: contract.startDate,
 endDate: contract.endDate,
 renewalDate: contract.renewalDate || '',
 riskLevel: contract.riskLevel,
 assignedTo: contract.assignedTo,
 created_at: contract.createdAt,
 updated_at: contract.updatedAt
 }));

 // Define DataView configuration
 const dataViewConfig: DataViewConfig = {
 id: 'contracts-data',
 name: 'Contracts Management',
 viewType: 'grid',
 defaultView: 'grid',
 fields: fieldConfig,
 data: contractsData,
 onSearch: (query: string) => {
 setSearchQuery(query);
 },
 onFilter: (filters: FilterConfig[]) => {
 },
 onSort: (sorts: SortConfig[]) => {
 },
 onRefresh: async () => {
 await loadContractsData();
 },
 onExport: (data: DataRecord[], format: string) => {
 },
 onImport: (data: unknown[]) => {
 }
 };

 const getStatusColor = (status: string) => {
 switch (status) {
 case 'active':
 return 'bg-green-100 text-green-800';
 case 'expired':
 return 'bg-red-100 text-red-800';
 case 'negotiation':
 return 'bg-yellow-100 text-yellow-800';
 case 'under_review':
 return 'bg-blue-100 text-blue-800';
 case 'terminated':
 return 'bg-gray-100 text-gray-800';
 default:
 return 'bg-gray-100 text-gray-800';
 }
 };

 const getRiskColor = (risk: string) => {
 switch (risk) {
 case 'high':
 return 'text-red-500';
 case 'medium':
 return 'text-yellow-500';
 case 'low':
 return 'text-green-500';
 default:
 return 'text-gray-500';
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

 const getDaysUntilExpiry = (endDate: string) => {
 const today = new Date();
 const expiry = new Date(endDate);
 const diffTime = expiry.getTime() - today.getTime();
 const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
 return diffDays;
 };

 const handleViewContract = (contract: Contract) => {
 setSelectedDrawerContract(contract);
 setDrawerMode('view');
 setDrawerOpen(true);
 };

 const handleEditContract = (contract: Contract) => {
 setSelectedDrawerContract(contract);
 setDrawerMode('edit');
 setDrawerOpen(true);
 };

 const handleCreateContract = () => {
 setSelectedDrawerContract(null);
 setDrawerMode('create');
 setDrawerOpen(true);
 };

 const contractSummary = {
 total: contracts.length,
 active: contracts.filter(c => c.status === 'active').length,
 expiringSoon: contracts.filter(c => {
 const days = getDaysUntilExpiry(c.endDate);
 return days <= 30 && days > 0;
 }).length,
 totalValue: contracts.reduce((sum, c) => sum + c.value, 0)
 };

 return (
 <div className={className}>
 <DataViewProvider config={dataViewConfig}>
 <div className="space-y-lg">
 {/* Summary Cards */}
 <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
 <Card>
 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
 <CardTitle className="text-sm font-medium">Total Contracts</CardTitle>
 <FileText className="h-icon-xs w-icon-xs text-muted-foreground" />
 </CardHeader>
 <CardContent>
 <div className="text-2xl font-bold">{contractSummary.total}</div>
 <p className="text-xs text-muted-foreground">
 Active portfolio
 </p>
 </CardContent>
 </Card>

 <Card>
 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
 <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
 <CheckCircle className="h-icon-xs w-icon-xs text-muted-foreground" />
 </CardHeader>
 <CardContent>
 <div className="text-2xl font-bold text-green-600">{contractSummary.active}</div>
 <p className="text-xs text-muted-foreground">
 Currently in effect
 </p>
 </CardContent>
 </Card>

 <Card>
 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
 <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
 <AlertTriangle className="h-icon-xs w-icon-xs text-muted-foreground" />
 </CardHeader>
 <CardContent>
 <div className="text-2xl font-bold text-yellow-600">{contractSummary.expiringSoon}</div>
 <p className="text-xs text-muted-foreground">
 Within 30 days
 </p>
 </CardContent>
 </Card>

 <Card>
 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
 <CardTitle className="text-sm font-medium">Total Value</CardTitle>
 <DollarSign className="h-icon-xs w-icon-xs text-muted-foreground" />
 </CardHeader>
 <CardContent>
 <div className="text-2xl font-bold">{formatCurrency(contractSummary.totalValue)}</div>
 <p className="text-xs text-muted-foreground">
 Portfolio value
 </p>
 </CardContent>
 </Card>
 </div>

 {/* Controls */}
 <div className="flex items-center justify-between">
 <div className="flex items-center space-x-xs">
 <Button variant="secondary" size="sm" onClick={handleCreateContract}>
 <Plus className="h-icon-xs w-icon-xs mr-2" />
 New Contract
 </Button>
 <Button variant="secondary" size="sm">
 <Download className="h-icon-xs w-icon-xs mr-2" />
 Export
 </Button>
 </div>
 </div>

 {/* Contracts Tabs */}
 <Tabs defaultValue="contracts-list" className="space-y-md">
 <TabsList>
 <TabsTrigger value="contracts-list">
 <FileText className="h-icon-xs w-icon-xs mr-2" />
 Contracts List
 </TabsTrigger>
 <TabsTrigger value="expiring">
 <Clock className="h-icon-xs w-icon-xs mr-2" />
 Expiring Soon
 </TabsTrigger>
 <TabsTrigger value="analytics">
 <TrendingUp className="h-icon-xs w-icon-xs mr-2" />
 Analytics
 </TabsTrigger>
 </TabsList>

 <TabsContent value="contracts-list" className="space-y-md">
 {/* Data Actions */}
 <DataActions />

 {/* View Switcher */}
 <ViewSwitcher />

 {/* Data Views */}
 <DataGrid />
 <KanbanBoard
 columns={[
 { id: 'draft', title: 'Draft' },
 { id: 'under_review', title: 'Under Review' },
 { id: 'negotiation', title: 'Negotiation' },
 { id: 'approved', title: 'Approved' },
 { id: 'active', title: 'Active' },
 { id: 'expired', title: 'Expired' }
 ]}
 statusField="status"
 titleField="title"
 />
 <CalendarView startDateField="startDate" titleField="title" />
 <ListView titleField="title" />
 </TabsContent>

 <TabsContent value="expiring" className="space-y-md">
 <Card>
 <CardHeader>
 <CardTitle>Contracts Expiring Soon</CardTitle>
 <CardDescription>
 Contracts requiring renewal or renegotiation
 </CardDescription>
 </CardHeader>
 <CardContent>
 <div className="space-y-md">
 {contracts
 .filter(contract => {
 const days = getDaysUntilExpiry(contract.endDate);
 return days <= 90 && days > 0;
 })
 .sort((a, b) => getDaysUntilExpiry(a.endDate) - getDaysUntilExpiry(b.endDate))
 .map((contract) => {
 const daysUntilExpiry = getDaysUntilExpiry(contract.endDate);
 return (
 <div key={contract.id} className="flex items-center justify-between p-md border rounded-lg">
 <div className="space-y-xs">
 <h4 className="font-medium">{contract.title}</h4>
 <p className="text-sm text-muted-foreground">{contract.vendor}</p>
 <div className="flex items-center space-x-xs">
 <Badge className={getStatusColor(contract.status)}>
 {contract.status}
 </Badge>
 <span className="text-sm text-muted-foreground">
 {formatCurrency(contract.value)}
 </span>
 </div>
 </div>
 <div className="text-right space-y-xs">
 <div className={`text-sm font-medium ${
 daysUntilExpiry <= 30 ? 'text-red-600' : 
 daysUntilExpiry <= 60 ? 'text-yellow-600' : 'text-blue-600'
 }`}>
 {daysUntilExpiry} days remaining
 </div>
 <div className="text-xs text-muted-foreground">
 Expires {new Date(contract.endDate).toLocaleDateString()}
 </div>
 <div className="flex space-x-xs">
 <Button
 size="sm"
 variant="secondary"
 onClick={() => handleViewContract(contract)}
 >
 <Eye className="h-3 w-3" />
 </Button>
 <Button
 size="sm"
 variant="secondary"
 onClick={() => handleEditContract(contract)}
 >
 <RefreshCw className="h-3 w-3" />
 </Button>
 </div>
 </div>
 </div>
 );
 })}
 </div>
 </CardContent>
 </Card>
 </TabsContent>

 <TabsContent value="analytics" className="space-y-md">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
 <Card>
 <CardHeader>
 <CardTitle>Contract Types</CardTitle>
 <CardDescription>
 Distribution by contract type
 </CardDescription>
 </CardHeader>
 <CardContent>
 <div className="space-y-sm">
 {['master_agreement', 'service_agreement', 'purchase_agreement', 'sow', 'nda'].map((type) => {
 const count = contracts.filter(c => c.type === type).length;
 const percentage = contracts.length > 0 ? (count / contracts.length) * 100 : 0;
 return (
 <div key={type} className="flex items-center justify-between">
 <span className="capitalize">{type.replace('_', ' ')}</span>
 <div className="flex items-center space-x-xs">
 <div className="w-component-lg bg-gray-200 rounded-full h-2">
 <div 
 className="bg-blue-600 h-2 rounded-full" 
 style={{ width: `${percentage}%` }}
 />
 </div>
 <span className="text-sm font-medium">{count}</span>
 </div>
 </div>
 );
 })}
 </div>
 </CardContent>
 </Card>

 <Card>
 <CardHeader>
 <CardTitle>Risk Distribution</CardTitle>
 <CardDescription>
 Contract risk assessment
 </CardDescription>
 </CardHeader>
 <CardContent>
 <div className="space-y-sm">
 {['low', 'medium', 'high'].map((risk) => {
 const count = contracts.filter(c => c.riskLevel === risk).length;
 const percentage = contracts.length > 0 ? (count / contracts.length) * 100 : 0;
 return (
 <div key={risk} className="flex items-center justify-between">
 <span className={`capitalize ${getRiskColor(risk)}`}>{risk} Risk</span>
 <div className="flex items-center space-x-xs">
 <div className="w-component-lg bg-gray-200 rounded-full h-2">
 <div 
 className={`h-2 rounded-full ${
 risk === 'high' ? 'bg-red-500' :
 risk === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
 }`}
 style={{ width: `${percentage}%` }}
 />
 </div>
 <span className="text-sm font-medium">{count}</span>
 </div>
 </div>
 );
 })}
 </div>
 </CardContent>
 </Card>
 </div>
 </TabsContent>
 </Tabs>

 {/* Universal Drawer */}
 <AppDrawer
 open={drawerOpen}
 onClose={() => setDrawerOpen(false)}
 record={selectedDrawerContract}
 fields={fieldConfig}
 mode={drawerMode}
 title={
 drawerMode === 'create' ? 'New Contract' :
 drawerMode === 'edit' ? 'Edit Contract' : 'Contract Details'
 }
 tabs={[
 {
 key: 'details',
 label: 'Contract Details',
 content: (
 <div className="p-md space-y-md">
 {selectedDrawerContract && (
 <>
 <div className="grid grid-cols-2 gap-md">
 <div>
 <label className="text-sm font-medium">Title</label>
 <p className="text-sm text-muted-foreground">{selectedDrawerContract.title}</p>
 </div>
 <div>
 <label className="text-sm font-medium">Vendor</label>
 <p className="text-sm text-muted-foreground">{selectedDrawerContract.vendor}</p>
 </div>
 </div>
 <div className="grid grid-cols-2 gap-md">
 <div>
 <label className="text-sm font-medium">Type</label>
 <p className="text-sm text-muted-foreground capitalize">
 {selectedDrawerContract.type.replace('_', ' ')}
 </p>
 </div>
 <div>
 <label className="text-sm font-medium">Status</label>
 <Badge className={getStatusColor(selectedDrawerContract.status)}>
 {selectedDrawerContract.status}
 </Badge>
 </div>
 </div>
 <div className="grid grid-cols-2 gap-md">
 <div>
 <label className="text-sm font-medium">Value</label>
 <p className="text-sm text-muted-foreground">
 {formatCurrency(selectedDrawerContract.value)}
 </p>
 </div>
 <div>
 <label className="text-sm font-medium">Risk Level</label>
 <span className={`text-sm font-medium ${getRiskColor(selectedDrawerContract.riskLevel)}`}>
 {selectedDrawerContract.riskLevel.toUpperCase()}
 </span>
 </div>
 </div>
 <div>
 <label className="text-sm font-medium">Terms</label>
 <p className="text-sm text-muted-foreground">{selectedDrawerContract.terms}</p>
 </div>
 <div>
 <label className="text-sm font-medium">Deliverables</label>
 <ul className="text-sm text-muted-foreground list-disc list-inside">
 {selectedDrawerContract.deliverables.map((item, index) => (
 <li key={index}>{item}</li>
 ))}
 </ul>
 </div>
 </>
 )}
 </div>
 )
 },
 {
 key: 'timeline',
 label: 'Timeline',
 content: (
 <div className="p-md">
 {selectedDrawerContract && (
 <div className="space-y-md">
 <div className="flex items-center justify-between">
 <span className="text-sm font-medium">Start Date</span>
 <span className="text-sm text-muted-foreground">
 {new Date(selectedDrawerContract.startDate).toLocaleDateString()}
 </span>
 </div>
 <div className="flex items-center justify-between">
 <span className="text-sm font-medium">End Date</span>
 <span className="text-sm text-muted-foreground">
 {new Date(selectedDrawerContract.endDate).toLocaleDateString()}
 </span>
 </div>
 {selectedDrawerContract.renewalDate && (
 <div className="flex items-center justify-between">
 <span className="text-sm font-medium">Renewal Date</span>
 <span className="text-sm text-muted-foreground">
 {new Date(selectedDrawerContract.renewalDate).toLocaleDateString()}
 </span>
 </div>
 )}
 <div className="flex items-center justify-between">
 <span className="text-sm font-medium">Auto Renewal</span>
 <Badge variant={selectedDrawerContract.autoRenewal ? 'default' : 'secondary'}>
 {selectedDrawerContract.autoRenewal ? 'Enabled' : 'Disabled'}
 </Badge>
 </div>
 <div className="flex items-center justify-between">
 <span className="text-sm font-medium">Days Until Expiry</span>
 <span className={`text-sm font-medium ${
 getDaysUntilExpiry(selectedDrawerContract.endDate) <= 30 ? 'text-red-600' : 
 getDaysUntilExpiry(selectedDrawerContract.endDate) <= 60 ? 'text-yellow-600' : 
 'text-green-600'
 }`}>
 {getDaysUntilExpiry(selectedDrawerContract.endDate)} days
 </span>
 </div>
 </div>
 )}
 </div>
 )
 }
 ]}
 />
 </div>
 </DataViewProvider>
 </div>
 );
}
