'use client';

import { TrendingUp, Clock, CheckCircle, XCircle, AlertTriangle, Building, DollarSign, Calendar } from "lucide-react";
import { useMemo } from 'react';
import { DataGrid, Badge, Button } from '@ghxstship/ui';
import type { JobOpportunity } from '../types';

interface OpportunityGridViewProps {
 opportunities: JobOpportunity[];
 loading?: boolean;
 onEdit?: (opportunity: JobOpportunity) => void;
 onView?: (opportunity: JobOpportunity) => void;
 onDelete?: (id: string) => void;
 onClose?: (id: string) => void;
 onAward?: (id: string) => void;
 onCancel?: (id: string) => void;
}

export default function OpportunityGridView({
 opportunities,
 loading = false,
 onEdit,
 onView,
 onDelete,
 onClose,
 onAward,
 onCancel
}: OpportunityGridViewProps) {
 
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
 return <TrendingUp className="h-icon-xs w-icon-xs" />;
 case 'awarded':
 return <CheckCircle className="h-icon-xs w-icon-xs" />;
 case 'closed':
 return <Clock className="h-icon-xs w-icon-xs" />;
 case 'cancelled':
 return <XCircle className="h-icon-xs w-icon-xs" />;
 default:
 return <TrendingUp className="h-icon-xs w-icon-xs" />;
 }
 };

 const getStageColor = (stage?: string) => {
 switch (stage) {
 case 'won':
 return 'success';
 case 'negotiation':
 return 'info';
 case 'proposal':
 return 'warning';
 case 'qualified':
 return 'info';
 case 'lead':
 return 'secondary';
 case 'lost':
 return 'destructive';
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
 maximumFractionDigits: 0,
 }).format(amount);
 };

 const isClosingSoon = (closesAt?: string) => {
 if (!closesAt) return false;
 const closes = new Date(closesAt);
 const now = new Date();
 const sevenDaysFromNow = new Date();
 sevenDaysFromNow.setDate(now.getDate() + 7);
 return closes <= sevenDaysFromNow && closes > now;
 };

 const columns = useMemo(() => [
 {
 key: 'title',
 label: 'Opportunity',
 sortable: true,
 render: (value: string, record: JobOpportunity) => (
 <div className="flex items-center gap-sm">
 <div className="h-icon-lg w-icon-lg bg-accent/10 rounded-md flex items-center justify-center">
 <TrendingUp className="h-icon-xs w-icon-xs color-accent" />
 </div>
 <div>
 <p className="text-body-sm font-medium color-foreground">{value || 'Untitled Opportunity'}</p>
 <p className="text-body-xs color-muted">ID: {record.id}</p>
 </div>
 </div>
 )
 },
 {
 key: 'organization_name',
 label: 'Organization',
 sortable: true,
 render: (value: string, record: JobOpportunity) => (
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
 key: 'estimated_value',
 label: 'Estimated Value',
 sortable: true,
 render: (value: number, record: JobOpportunity) => (
 <div className="flex items-center gap-xs">
 <DollarSign className="h-icon-xs w-icon-xs color-success" />
 <div>
 <p className="text-body-sm font-semibold color-success">
 {formatCurrency(value || record.budget_max)}
 </p>
 {record.probability && (
 <p className="text-body-xs color-muted">
 {record.probability}% probability
 </p>
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
 key: 'stage',
 label: 'Stage',
 sortable: true,
 render: (value: string) => {
 if (!value) return <span className="color-muted">—</span>;
 return (
 <Badge variant={getStageColor(value)} size="sm" className="capitalize">
 {value}
 </Badge>
 );
 }
 },
 {
 key: 'closes_at',
 label: 'Closes',
 sortable: true,
 render: (value: string) => {
 if (!value) return <span className="color-muted">—</span>;
 
 const closesDate = new Date(value);
 const isExpired = closesDate < new Date();
 const closingSoon = isClosingSoon(value);
 
 return (
 <div className={`flex items-center gap-xs ${
 isExpired ? 'color-destructive' : closingSoon ? 'color-warning' : 'color-foreground'
 }`}>
 {closingSoon && <AlertTriangle className="h-3 w-3" />}
 <div>
 <p className="text-body-sm">{closesDate.toLocaleDateString()}</p>
 {isExpired && (
 <p className="text-body-xs color-destructive">Expired</p>
 )}
 {closingSoon && !isExpired && (
 <p className="text-body-xs color-warning">Closing Soon</p>
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
 key: 'client_name',
 label: 'Client',
 render: (value: string) => (
 <p className="text-body-sm color-foreground">
 {value || '—'}
 </p>
 )
 },
 {
 key: 'actions',
 label: 'Actions',
 render: (_: unknown, record: JobOpportunity) => (
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
 ], [onEdit, onView, onDelete, onClose, onAward, onCancel]);

 return (
 <DataGrid
 data={opportunities}
 columns={columns}
 loading={loading}
 emptyState={{
 title: 'No Opportunities Found',
 description: 'No opportunities match your current filters.',
 icon: <TrendingUp className="h-icon-2xl w-icon-2xl color-muted" />
 }}
 />
 );
}
