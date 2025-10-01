'use client';

import { DollarSign, Clock, CheckCircle, XCircle, AlertCircle, Building } from "lucide-react";
import { useMemo } from 'react';
import { DataGrid, Badge, Button } from '@ghxstship/ui';
import type { JobBid } from '../types';

interface BidGridViewProps {
 bids: JobBid[];
 loading?: boolean;
 onEdit?: (bid: JobBid) => void;
 onView?: (bid: JobBid) => void;
 onDelete?: (id: string) => void;
 onWithdraw?: (id: string) => void;
}

export default function BidGridView({
 bids,
 loading = false,
 onEdit,
 onView,
 onDelete,
 onWithdraw
}: BidGridViewProps) {
 
 const getStatusColor = (status: string) => {
 switch (status) {
 case 'accepted':
 return 'success';
 case 'under_review':
 return 'info';
 case 'submitted':
 return 'warning';
 case 'rejected':
 return 'destructive';
 case 'withdrawn':
 return 'secondary';
 default:
 return 'secondary';
 }
 };

 const getStatusIcon = (status: string) => {
 switch (status) {
 case 'accepted':
 return <CheckCircle className="h-icon-xs w-icon-xs" />;
 case 'under_review':
 return <Clock className="h-icon-xs w-icon-xs" />;
 case 'submitted':
 return <DollarSign className="h-icon-xs w-icon-xs" />;
 case 'rejected':
 return <XCircle className="h-icon-xs w-icon-xs" />;
 case 'withdrawn':
 return <AlertCircle className="h-icon-xs w-icon-xs" />;
 default:
 return <Clock className="h-icon-xs w-icon-xs" />;
 }
 };

 const formatCurrency = (amount: number) => {
 return new Intl.NumberFormat('en-US', {
 style: 'currency',
 currency: 'USD',
 minimumFractionDigits: 0,
 maximumFractionDigits: 0,
 }).format(amount);
 };

 const columns = useMemo(() => [
 {
 key: 'opportunity_title',
 label: 'Opportunity',
 sortable: true,
 render: (value: string, record: JobBid) => (
 <div className="flex items-center gap-sm">
 <div className="h-icon-lg w-icon-lg bg-accent/10 rounded-md flex items-center justify-center">
 <DollarSign className="h-icon-xs w-icon-xs color-accent" />
 </div>
 <div>
 <p className="text-body-sm font-medium color-foreground">{value || 'Untitled Opportunity'}</p>
 <p className="text-body-xs color-muted">ID: {record.opportunity_id}</p>
 </div>
 </div>
 )
 },
 {
 key: 'company_name',
 label: 'Company',
 sortable: true,
 render: (value: string, record: JobBid) => (
 <div className="flex items-center gap-sm">
 <div className="h-icon-md w-icon-md bg-secondary rounded-full flex items-center justify-center">
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
 key: 'amount',
 label: 'Bid Amount',
 sortable: true,
 render: (value: number) => (
 <div>
 <p className="text-body-sm font-semibold color-foreground">
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
 {value ? value.replace('_', ' ').toUpperCase() : 'UNKNOWN'}
 </Badge>
 )
 },
 {
 key: 'submitted_at',
 label: 'Submitted',
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
 key: 'response_deadline',
 label: 'Deadline',
 sortable: true,
 render: (value: string) => {
 if (!value) return <span className="color-muted">—</span>;
 
 const deadline = new Date(value);
 const isOverdue = deadline < new Date();
 
 return (
 <div className={isOverdue ? 'color-destructive' : 'color-foreground'}>
 <p className="text-body-sm">{deadline.toLocaleDateString()}</p>
 {isOverdue && (
 <p className="text-body-xs color-destructive">Overdue</p>
 )}
 </div>
 );
 }
 },
 {
 key: 'project_title',
 label: 'Project',
 render: (value: string) => (
 <p className="text-body-sm color-muted line-clamp-xs max-w-xs">
 {value || '—'}
 </p>
 )
 },
 {
 key: 'actions',
 label: 'Actions',
 render: (_: unknown, record: JobBid) => (
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
 {onEdit && record.status === 'submitted' && (
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onEdit(record)}
 >
 Edit
 </Button>
 )}
 {onWithdraw && record.status === 'submitted' && (
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onWithdraw(record.id)}
 className="color-warning"
 >
 Withdraw
 </Button>
 )}
 {onDelete && ['rejected', 'withdrawn'].includes(record.status) && (
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
 ], [onEdit, onView, onDelete, onWithdraw]);

 return (
 <DataGrid
 data={bids}
 columns={columns}
 loading={loading}
 emptyState={{
 title: 'No Bids Found',
 description: 'No bids match your current filters.',
 icon: <DollarSign className="h-icon-2xl w-icon-2xl color-muted" />
 }}
 />
 );
}
