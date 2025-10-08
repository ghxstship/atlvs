'use client';

import { FileText, Clock, CheckCircle, XCircle, AlertTriangle, Building, DollarSign, Calendar } from "lucide-react";
import { useMemo } from 'react';
import { DataGrid, Badge, Button } from '@ghxstship/ui';
import type { JobRfp } from '../types';

interface RfpGridViewProps {
 rfps: JobRfp[];
 loading?: boolean;
 onEdit?: (rfp: JobRfp) => void;
 onView?: (rfp: JobRfp) => void;
 onDelete?: (id: string) => void;
 onClose?: (id: string) => void;
 onAward?: (id: string) => void;
 onCancel?: (id: string) => void;
 onPublish?: (id: string) => void;
}

export default function RfpGridView({
 rfps,
 loading = false,
 onEdit,
 onView,
 onDelete,
 onClose,
 onAward,
 onCancel,
 onPublish
}: RfpGridViewProps) {
 
 const getStatusColor = (status: string) => {
 switch (status) {
 case 'open':
 return 'success';
 case 'awarded':
 return 'info';
 case 'closed':
 return 'secondary';
 case 'cancelled':
 return 'destructive';
 default:
 return 'secondary';
 }
 };

 const getStatusIcon = (status: string) => {
 switch (status) {
 case 'open':
 return <FileText className="h-icon-xs w-icon-xs" />;
 case 'awarded':
 return <CheckCircle className="h-icon-xs w-icon-xs" />;
 case 'closed':
 return <Clock className="h-icon-xs w-icon-xs" />;
 case 'cancelled':
 return <XCircle className="h-icon-xs w-icon-xs" />;
 default:
 return <FileText className="h-icon-xs w-icon-xs" />;
 }
 };

 const getCategoryColor = (category?: string) => {
 switch (category) {
 case 'construction':
 return 'warning';
 case 'consulting':
 return 'info';
 case 'technology':
 return 'success';
 case 'services':
 return 'secondary';
 case 'supplies':
 return 'info';
 case 'other':
 return 'secondary';
 default:
 return 'secondary';
 }
 };

 const formatCurrency = (amount?: number) => {
 if (!amount) return '—';
 return new Intl.NumberFormat('en-US', {
 style: 'currency',
 currency: 'USD',
 minimumFractionDigits: 0,
 maximumFractionDigits: 0
 }).format(amount);
 };

 const isDueSoon = (dueAt?: string) => {
 if (!dueAt) return false;
 const due = new Date(dueAt);
 const now = new Date();
 const sevenDaysFromNow = new Date();
 sevenDaysFromNow.setDate(now.getDate() + 7);
 return due <= sevenDaysFromNow && due > now;
 };

 const columns = useMemo(() => [
 {
 key: 'title',
 label: 'RFP Title',
 sortable: true,
 render: (value: string, record: JobRfp) => (
 <div className="flex items-center gap-sm">
 <div className="h-icon-lg w-icon-lg bg-accent/10 rounded-md flex items-center justify-center">
 <FileText className="h-icon-xs w-icon-xs color-accent" />
 </div>
 <div>
 <p className="text-body-sm font-medium color-foreground">{value || 'Untitled RFP'}</p>
 <p className="text-body-xs color-muted">ID: {record.id}</p>
 </div>
 </div>
 )
 },
 {
 key: 'organization_name',
 label: 'Organization',
 sortable: true,
 render: (value: string, record: JobRfp) => (
 <div className="flex items-center gap-sm">
 <div className="h-icon-md w-icon-md bg-secondary rounded-full flex items-center justify-center">
 <Building className="h-3 w-3" />
 </div>
 <div>
 <p className="text-body-sm color-foreground">{value || 'Unknown Organization'}</p>
 <p className="text-body-xs color-muted">ID: {record.organization_id}</p>
 </div>
 </div>
 )
 },
 {
 key: 'category',
 label: 'Category',
 sortable: true,
 render: (value: string) => {
 if (!value) return <span className="color-muted">—</span>;
 return (
 <Badge variant={getCategoryColor(value)} size="sm" className="capitalize">
 {value}
 </Badge>
 );
 }
 },
 {
 key: 'budget_max',
 label: 'Budget',
 sortable: true,
 render: (value: number, record: JobRfp) => (
 <div className="flex items-center gap-xs">
 <DollarSign className="h-icon-xs w-icon-xs color-success" />
 <div>
 <p className="text-body-sm font-semibold color-success">
 {record.budget_min && record.budget_max 
 ? `${formatCurrency(record.budget_min)} - ${formatCurrency(record.budget_max)}`
 : formatCurrency(value)
 }
 </p>
 {record.currency && record.currency !== 'USD' && (
 <p className="text-body-xs color-muted">{record.currency}</p>
 )}
 </div>
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
 key: 'due_at',
 label: 'Due Date',
 sortable: true,
 render: (value: string) => {
 if (!value) return <span className="color-muted">—</span>;
 
 const dueDate = new Date(value);
 const isExpired = dueDate < new Date();
 const dueSoon = isDueSoon(value);
 
 return (
 <div className={`flex items-center gap-xs ${
 isExpired ? 'color-destructive' : dueSoon ? 'color-warning' : 'color-foreground'
 }`}>
 {dueSoon && <AlertTriangle className="h-3 w-3" />}
 <div>
 <p className="text-body-sm">{dueDate.toLocaleDateString()}</p>
 {isExpired && (
 <p className="text-body-xs color-destructive">Expired</p>
 )}
 {dueSoon && !isExpired && (
 <p className="text-body-xs color-warning">Due Soon</p>
 )}
 </div>
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
 key: 'contact_person',
 label: 'Contact',
 render: (value: string) => (
 <p className="text-body-sm color-foreground">
 {value || '—'}
 </p>
 )
 },
 {
 key: 'actions',
 label: 'Actions',
 render: (_: unknown, record: JobRfp) => (
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
 {onEdit && record.status === 'open' && (
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onEdit(record)}
 >
 Edit
 </Button>
 )}
 {onPublish && record.status === 'open' && (
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onPublish(record.id)}
 className="color-info"
 >
 Publish
 </Button>
 )}
 {onAward && record.status === 'open' && (
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onAward(record.id)}
 className="color-success"
 >
 Award
 </Button>
 )}
 {onClose && record.status === 'open' && (
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onClose(record.id)}
 className="color-info"
 >
 Close
 </Button>
 )}
 {onCancel && record.status === 'open' && (
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onCancel(record.id)}
 className="color-warning"
 >
 Cancel
 </Button>
 )}
 {onDelete && ['awarded', 'cancelled', 'closed'].includes(record.status) && (
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
 ], [onEdit, onView, onDelete, onClose, onAward, onCancel, onPublish]);

 return (
 <DataGrid
 data={rfps}
 columns={columns}
 loading={loading}
 emptyState={{
 title: 'No RFPs Found',
 description: 'No RFPs match your current filters.',
 icon: <FileText className="h-icon-2xl w-icon-2xl color-muted" />
 }}
 />
 );
}
