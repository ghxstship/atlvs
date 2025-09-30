'use client';

import { FileText, Download, Edit, Eye, Calendar, DollarSign, Users, Clock, CheckCircle, AlertTriangle, Plus, Filter, Search, Upload, PenTool } from "lucide-react";
import { useState, useEffect } from 'react';
import { 
 Card,
 Button,
 Badge,
 Input,
 Select
} from '@ghxstship/ui';

interface ContractsClientProps {
 orgId: string;
 userId: string;
}

interface Contract {
 id: string;
 title: string;
 project_title?: string;
 client_name: string;
 vendor_name: string;
 contract_type: 'fixed' | 'hourly' | 'retainer' | 'milestone';
 total_amount: number;
 currency: string;
 status: 'draft' | 'pending' | 'active' | 'completed' | 'terminated' | 'disputed';
 start_date: string;
 end_date: string;
 created_at: string;
 client_signed: boolean;
 vendor_signed: boolean;
 client_signed_at?: string;
 vendor_signed_at?: string;
 document_url?: string;
 escrow_enabled: boolean;
 escrow_amount?: number;
 milestones?: Array<{
 title: string;
 amount: number;
 due_date: string;
 status: 'pending' | 'completed' | 'overdue';
 }>;
 role: 'client' | 'vendor';
}

export default function ContractsClient({ orgId, userId }: ContractsClientProps) {
 const [contracts, setContracts] = useState<Contract[]>([]);
 const [loading, setLoading] = useState(true);
 const [filter, setFilter] = useState<'all' | 'active' | 'pending' | 'completed'>('all');
 const [roleFilter, setRoleFilter] = useState<'all' | 'client' | 'vendor'>('all');
 const [searchQuery, setSearchQuery] = useState('');
 const [stats, setStats] = useState({
 totalContracts: 0,
 activeContracts: 0,
 pendingSignatures: 0,
 totalValue: 0
 });

 useEffect(() => {
 loadContracts();
 }, [orgId]);

 const loadContracts = async () => {
 try {
 setLoading(true);
 
 // Mock contract data - would integrate with real contracts API
 const mockContracts: Contract[] = [
 {
 id: '1',
 title: 'LED Wall System Rental Agreement',
 project_title: 'Music Festival 2024',
 client_name: 'TechCorp Solutions',
 vendor_name: 'Your Organization',
 contract_type: 'fixed',
 total_amount: 15000.00,
 currency: 'USD',
 status: 'active',
 start_date: '2024-03-01',
 end_date: '2024-03-05',
 created_at: '2024-01-15T10:00:00Z',
 client_signed: true,
 vendor_signed: true,
 client_signed_at: '2024-01-16T14:30:00Z',
 vendor_signed_at: '2024-01-16T15:45:00Z',
 document_url: '/contracts/led-wall-rental-001.pdf',
 escrow_enabled: true,
 escrow_amount: 7500.00,
 role: 'vendor'
 },
 {
 id: '2',
 title: 'Sound Engineering Services Contract',
 project_title: 'Corporate Event Series',
 client_name: 'Your Organization',
 vendor_name: 'AudioPro Services',
 contract_type: 'milestone',
 total_amount: 8500.00,
 currency: 'USD',
 status: 'pending',
 start_date: '2024-02-15',
 end_date: '2024-04-30',
 created_at: '2024-01-12T09:15:00Z',
 client_signed: true,
 vendor_signed: false,
 client_signed_at: '2024-01-12T16:20:00Z',
 document_url: '/contracts/sound-engineering-002.pdf',
 escrow_enabled: true,
 escrow_amount: 4250.00,
 milestones: [
 {
 title: 'Initial Setup & Testing',
 amount: 2500.00,
 due_date: '2024-02-20',
 status: 'pending'
 },
 {
 title: 'Event 1 - Corporate Launch',
 amount: 3000.00,
 due_date: '2024-03-15',
 status: 'pending'
 },
 {
 title: 'Event 2 - Annual Conference',
 amount: 3000.00,
 due_date: '2024-04-25',
 status: 'pending'
 }
 ],
 role: 'client'
 },
 {
 id: '3',
 title: 'Lighting Design & Installation',
 project_title: 'Concert Series 2024',
 client_name: 'Your Organization',
 vendor_name: 'LightMaster Inc',
 contract_type: 'fixed',
 total_amount: 25000.00,
 currency: 'USD',
 status: 'completed',
 start_date: '2024-01-01',
 end_date: '2024-01-31',
 created_at: '2023-12-15T11:30:00Z',
 client_signed: true,
 vendor_signed: true,
 client_signed_at: '2023-12-16T10:15:00Z',
 vendor_signed_at: '2023-12-16T14:45:00Z',
 document_url: '/contracts/lighting-design-003.pdf',
 escrow_enabled: false,
 role: 'client'
 }
 ];

 setContracts(mockContracts);

 // Calculate stats
 setStats({
 totalContracts: mockContracts.length,
 activeContracts: mockContracts.filter(c => c.status === 'active').length,
 pendingSignatures: mockContracts.filter(c => !c.client_signed || !c.vendor_signed).length,
 totalValue: mockContracts.reduce((sum, c) => sum + c.total_amount, 0)
 });
 } catch (error) {
 console.error('Error loading contracts:', error);
 } finally {
 setLoading(false);
 }
 };

 const filteredContracts = contracts.filter(contract => {
 const matchesFilter = filter === 'all' || contract.status === filter;
 const matchesRole = roleFilter === 'all' || contract.role === roleFilter;
 const matchesSearch = contract.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
 contract.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
 contract.vendor_name.toLowerCase().includes(searchQuery.toLowerCase());
 return matchesFilter && matchesRole && matchesSearch;
 });

 const getStatusColor = (status: string) => {
 switch (status) {
 case 'active': return 'success';
 case 'pending': return 'warning';
 case 'completed': return 'secondary';
 case 'draft': return 'outline';
 case 'terminated': return 'destructive';
 case 'disputed': return 'destructive';
 default: return 'secondary';
 }
 };

 const getStatusIcon = (status: string) => {
 switch (status) {
 case 'active': return CheckCircle;
 case 'pending': return Clock;
 case 'completed': return CheckCircle;
 case 'draft': return Edit;
 case 'terminated': return AlertTriangle;
 case 'disputed': return AlertTriangle;
 default: return FileText;
 }
 };

 const formatAmount = (amount: number, currency: string) => {
 return new Intl.NumberFormat('en-US', {
 style: 'currency',
 currency: currency
 }).format(amount);
 };

 const getSignatureStatus = (contract: Contract) => {
 if (contract.client_signed && contract.vendor_signed) {
 return { label: 'Fully Signed', variant: 'success' as const };
 } else if (contract.client_signed || contract.vendor_signed) {
 return { label: 'Partially Signed', variant: 'warning' as const };
 } else {
 return { label: 'Awaiting Signatures', variant: 'secondary' as const };
 }
 };

 return (
 <div className="stack-lg">
 {/* Header */}
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-heading-2">Contracts</h1>
 <p className="color-muted">Manage marketplace contracts and agreements</p>
 </div>
 <div className="flex items-center gap-sm">
 <Button variant="outline">
 <Upload className="h-4 w-4 mr-sm" />
 Upload Contract
 </Button>
 <Button>
 <Plus className="h-4 w-4 mr-sm" />
 Create Contract
 </Button>
 </div>
 </div>

 {/* Stats Cards */}
 <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
 <Card className="p-md">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-body-sm color-muted">Total Contracts</p>
 <p className="text-heading-3 font-bold">{stats.totalContracts}</p>
 </div>
 <FileText className="h-8 w-8 color-primary" />
 </div>
 </Card>
 <Card className="p-md">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-body-sm color-muted">Active</p>
 <p className="text-heading-3 font-bold">{stats.activeContracts}</p>
 </div>
 <CheckCircle className="h-8 w-8 color-success" />
 </div>
 </Card>
 <Card className="p-md">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-body-sm color-muted">Pending Signatures</p>
 <p className="text-heading-3 font-bold">{stats.pendingSignatures}</p>
 </div>
 <PenTool className="h-8 w-8 color-warning" />
 </div>
 </Card>
 <Card className="p-md">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-body-sm color-muted">Total Value</p>
 <p className="text-heading-3 font-bold">
 {formatAmount(stats.totalValue, 'USD')}
 </p>
 </div>
 <DollarSign className="h-8 w-8 color-secondary" />
 </div>
 </Card>
 </div>

 {/* Contracts List */}
 <Card className="p-md">
 <div className="flex items-center justify-between mb-md">
 <h3 className="text-heading-4">All Contracts</h3>
 <div className="flex items-center gap-sm">
 <Button variant="outline" size="sm">
 <Download className="h-4 w-4 mr-xs" />
 Export
 </Button>
 <Button variant="outline" size="sm">
 <Filter className="h-4 w-4" />
 </Button>
 </div>
 </div>

 <div className="flex items-center gap-sm mb-md">
 <Input
 placeholder="Search contracts..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="flex-1"
 />
 <Select value={filter} onValueChange={(value: unknown) => setFilter(value)}>
 <option value="all">All Status</option>
 <option value="active">Active</option>
 <option value="pending">Pending</option>
 <option value="completed">Completed</option>
 </Select>
 <Select value={roleFilter} onValueChange={(value: unknown) => setRoleFilter(value)}>
 <option value="all">All Roles</option>
 <option value="client">As Client</option>
 <option value="vendor">As Vendor</option>
 </Select>
 </div>

 <div className="stack-sm">
 {filteredContracts.map((contract) => {
 const StatusIcon = getStatusIcon(contract.status);
 const statusColor = getStatusColor(contract.status);
 const signatureStatus = getSignatureStatus(contract);

 return (
 <Card key={contract.id} className="p-md border hover:shadow-sm transition-shadow">
 <div className="flex items-start justify-between mb-sm">
 <div className="flex items-start gap-sm">
 <div className="flex items-center justify-center h-10 w-10 bg-primary/10 rounded">
 <StatusIcon className="h-5 w-5 color-primary" />
 </div>
 <div className="flex-1">
 <div className="flex items-center gap-sm mb-xs">
 <h4 className="text-body font-medium">{contract.title}</h4>
 <Badge variant={statusColor} size="sm">
 {contract.status}
 </Badge>
 <Badge variant={signatureStatus.variant} size="sm">
 <PenTool className="h-3 w-3 mr-xs" />
 {signatureStatus.label}
 </Badge>
 <Badge variant={contract.role === 'client' ? 'secondary' : 'outline'} size="sm">
 {contract.role}
 </Badge>
 </div>
 {contract.project_title && (
 <p className="text-body-sm color-muted mb-xs">
 Project: {contract.project_title}
 </p>
 )}
 <div className="flex items-center gap-md text-body-sm color-muted">
 <div className="flex items-center gap-xs">
 <Users className="h-4 w-4" />
 <span>
 {contract.role === 'client' 
 ? `Vendor: ${contract.vendor_name}` 
 : `Client: ${contract.client_name}`
 }
 </span>
 </div>
 <div className="flex items-center gap-xs">
 <Calendar className="h-4 w-4" />
 <span>
 {new Date(contract.start_date).toLocaleDateString()} - {new Date(contract.end_date).toLocaleDateString()}
 </span>
 </div>
 <div className="flex items-center gap-xs">
 <DollarSign className="h-4 w-4" />
 <span>{formatAmount(contract.total_amount, contract.currency)}</span>
 </div>
 </div>
 </div>
 </div>
 <div className="flex items-center gap-xs">
 <Button variant="outline" size="sm">
 <Eye className="h-4 w-4" />
 </Button>
 {contract.document_url && (
 <Button variant="outline" size="sm">
 <Download className="h-4 w-4" />
 </Button>
 )}
 <Button variant="outline" size="sm">
 <Edit className="h-4 w-4" />
 </Button>
 </div>
 </div>

 {/* Contract Details */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-md p-sm bg-muted/50 rounded">
 <div>
 <p className="text-body-sm font-medium mb-xs">Contract Type</p>
 <p className="text-body-sm color-muted capitalize">
 {contract.contract_type.replace('_', ' ')}
 </p>
 </div>
 <div>
 <p className="text-body-sm font-medium mb-xs">Escrow</p>
 <p className="text-body-sm color-muted">
 {contract.escrow_enabled 
 ? `Protected: ${formatAmount(contract.escrow_amount || 0, contract.currency)}`
 : 'Not enabled'
 }
 </p>
 </div>
 <div>
 <p className="text-body-sm font-medium mb-xs">Signatures</p>
 <div className="flex items-center gap-xs">
 <Badge variant={contract.client_signed ? 'success' : 'secondary'} size="sm">
 Client {contract.client_signed ? '✓' : '○'}
 </Badge>
 <Badge variant={contract.vendor_signed ? 'success' : 'secondary'} size="sm">
 Vendor {contract.vendor_signed ? '✓' : '○'}
 </Badge>
 </div>
 </div>
 </div>

 {/* Milestones */}
 {contract.milestones && contract.milestones.length > 0 && (
 <div className="mt-sm">
 <p className="text-body-sm font-medium mb-xs">Milestones</p>
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-xs">
 {contract.milestones.map((milestone, index) => (
 <div key={index} className="flex items-center justify-between p-xs border rounded">
 <div>
 <p className="text-body-sm font-medium">{milestone.title}</p>
 <p className="text-body-sm color-muted">
 Due: {new Date(milestone.due_date).toLocaleDateString()}
 </p>
 </div>
 <div className="text-right">
 <p className="text-body-sm font-medium">
 {formatAmount(milestone.amount, contract.currency)}
 </p>
 <Badge 
 variant={
 milestone.status === 'completed' ? 'success' :
 milestone.status === 'overdue' ? 'destructive' : 'secondary'
 } 
 size="sm"
 >
 {milestone.status}
 </Badge>
 </div>
 </div>
 ))}
 </div>
 </div>
 )}
 </Card>
 );
 })}
 </div>
 </Card>
 </div>
 );
}
