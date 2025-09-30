'use client';

import { FileText, Clock, CheckCircle, XCircle, AlertTriangle, Building, DollarSign } from "lucide-react";
import { useMemo } from 'react';
import { DataGrid, Badge, Button } from '@ghxstship/ui';
import type { JobContract } from '../types';

interface ContractGridViewProps {
 contracts: JobContract[];
 loading?: boolean;
 onEdit?: (contract: JobContract) => void;
 onView?: (contract: JobContract) => void;
 onDelete?: (id: string) => void;
 onActivate?: (id: string) => void;
 onTerminate?: (id: string) => void;
}

export default function ContractGridView({
 contracts,
 loading = false,
 onEdit,
 onView,
 onDelete,
 onActivate,
 onTerminate
}: ContractGridViewProps) {
 
 const getStatusColor = (status: string) => {
 switch (status) {
 case 'active':
 return 'success';
 case 'completed':
 return 'info';
 case 'draft':
 return 'warning';
 case 'terminated':
 return 'destructive';
 default:
 return 'secondary';
 }
 };

 const getStatusIcon = (status: string) => {
 switch (status) {
 case 'active':
 return <CheckCircle className="h-4 w-4" />;
 case 'completed':
 return <CheckCircle className="h-4 w-4" />;
 case 'draft':
 return <Clock className="h-4 w-4" />;
 case 'terminated':
 return <XCircle className="h-4 w-4" />;
 default:
 return <FileText className="h-4 w-4" />;
 }
 };

 const formatCurrency = (amount?: number) => {
 if (!amount) return '—';
 return new Intl.NumberFormat('en-US', {
 style: 'currency',
 currency: 'USD',
 minimumFractionDigits: 0,
 maximumFractionDigits: 0,
 }).format(amount);
 };

 const isExpiringSoon = (endDate?: string) => {
 if (!endDate) return false;
 const end = new Date(endDate);
 const now = new Date();
 const thirtyDaysFromNow = new Date();
 thirtyDaysFromNow.setDate(now.getDate() + 30);
 return end <= thirtyDaysFromNow && end > now;
 };

 const columns = useMemo(() => [
 {
 key: 'job_title',
 label: 'Job',
 sortable: true,
 render: (value: string, record: JobContract) => (
 <div className="flex items-center gap-sm">
 <div className="h-8 w-8 bg-accent/10 rounded-md flex items-center justify-center">
 <FileText className="h-4 w-4 color-accent" />
 </div>
 <div>
 <p className="text-body-sm font-medium color-foreground">{value || 'Untitled Job'}</p>
 <p className="text-body-xs color-muted">ID: {record.job_id}</p>
 </div>
 </div>
 )
 },
 {
 key: 'company_name',
 label: 'Company',
 sortable: true,
 render: (value: string, record: JobContract) => (
 <div className="flex items-center gap-sm">
 <div className="h-6 w-6 bg-secondary rounded-full flex items-center justify-center">
 <Building className="h-3 w-3" />
 </div>
 <div>
 <p className="text-body-sm color-foreground">{value || 'Unknown Company'}</p>
 <p className="text-body-xs color-muted">ID: {record.company_id}</p>
 </div>
 </div>
 )
 },
 {
 key: 'contract_value',
 label: 'Value',
 sortable: true,
 render: (value: number) => (
 <div className="flex items-center gap-xs">
 <DollarSign className="h-4 w-4 color-success" />
 <p className="text-body-sm font-semibold color-success">
 {formatCurrency(value)}
 </p>
 </div>
 )
 },
 {
 key: 'status',
 label: 'Status',
 sortable: true,
 render: (value: string) => (
 <Badge variant={getStatusColor(value)} className="flex items-center gap-xs">
 {getStatusIcon(value)}
 {value ? value.toUpperCase() : 'UNKNOWN'}
 </Badge>
 )
 },
 {
 key: 'start_date',
 label: 'Start Date',
 sortable: true,
 render: (value: string) => (
 <div>
 <p className="text-body-sm color-foreground">
 {value ? new Date(value).toLocaleDateString() : '—'}
 </p>
 </div>
 )
 },
 {
 key: 'end_date',
 label: 'End Date',
 sortable: true,
 render: (value: string, record: JobContract) => {
 if (!value) return <span className="color-muted">—</span>;
 
 const endDate = new Date(value);
 const isExpired = endDate < new Date();
 const expiringSoon = isExpiringSoon(value);
 
 return (
 <div className={`flex items-center gap-xs ${
 isExpired ? 'color-destructive' : expiringSoon ? 'color-warning' : 'color-foreground'
 }`}>
 {expiringSoon && <AlertTriangle className="h-3 w-3" />}
 <div>
 <p className="text-body-sm">{endDate.toLocaleDateString()}</p>
 {isExpired && (
 <p className="text-body-xs color-destructive">Expired</p>
 )}
 {expiringSoon && !isExpired && (
 <p className="text-body-xs color-warning">Expiring Soon</p>
 )}
 </div>
 </div>
 );
 }
 },
 {
 key: 'created_at',
 label: 'Created',
 sortable: true,
 render: (value: string) => (
 <div>
 <p className="text-body-sm color-foreground">
 {value ? new Date(value).toLocaleDateString() : '—'}
 </p>
 <p className="text-body-xs color-muted">
 {value ? new Date(value).toLocaleTimeString() : ''}
 </p>
 </div>
 )
 },
 {
 key: 'actions',
 label: 'Actions',
 render: (_: unknown, record: JobContract) => (
 <div className="flex items-center gap-xs">
 {onView && (
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onView(record)}
 >
 View
 </Button>
 )}
 {onEdit && record.status === 'draft' && (
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onEdit(record)}
 >
 Edit
 </Button>
 )}
 {onActivate && record.status === 'draft' && (
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onActivate(record.id)}
 className="color-success"
 >
 Activate
 </Button>
 )}
 {onTerminate && record.status === 'active' && (
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onTerminate(record.id)}
 className="color-warning"
 >
 Terminate
 </Button>
 )}
 {onDelete && ['terminated', 'completed'].includes(record.status) && (
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onDelete(record.id)}
 className="color-destructive"
 >
 Delete
 </Button>
 )}
 </div>
 )
 }
 ], [onEdit, onView, onDelete, onActivate, onTerminate]);

 return (
 <DataGrid
 data={contracts}
 columns={columns}
 loading={loading}
 emptyState={{
 title: 'No Contracts Found',
 description: 'No contracts match your current filters.',
 icon: <FileText className="h-12 w-12 color-muted" />
 }}
 />
 );
}
