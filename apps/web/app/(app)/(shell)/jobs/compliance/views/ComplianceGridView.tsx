'use client';

import { AlertTriangle, Calendar, CheckCircle, Clock, Edit, FileText, Shield, XCircle } from "lucide-react";
import { useMemo } from 'react';
import { DataGrid, Badge, Button } from '@ghxstship/ui';
import type { JobCompliance } from '../types';

interface ComplianceGridViewProps {
 compliance: JobCompliance[];
 loading?: boolean;
 onEdit?: (item: JobCompliance) => void;
 onView?: (item: JobCompliance) => void;
 onDelete?: (id: string) => void;
 onSubmit?: (id: string) => void;
 onApprove?: (id: string) => void;
 onReject?: (id: string) => void;
}

export default function ComplianceGridView({
 compliance,
 loading = false,
 onEdit,
 onView,
 onDelete,
 onSubmit,
 onApprove,
 onReject
}: ComplianceGridViewProps) {
 
 const getStatusColor = (status: string) => {
 switch (status) {
 case 'approved':
 return 'success';
 case 'submitted':
 return 'info';
 case 'pending':
 return 'warning';
 case 'rejected':
 return 'destructive';
 default:
 return 'secondary';
 }
 };

 const getStatusIcon = (status: string) => {
 switch (status) {
 case 'approved':
 return <CheckCircle className="h-icon-xs w-icon-xs" />;
 case 'submitted':
 return <Clock className="h-icon-xs w-icon-xs" />;
 case 'pending':
 return <AlertTriangle className="h-icon-xs w-icon-xs" />;
 case 'rejected':
 return <XCircle className="h-icon-xs w-icon-xs" />;
 default:
 return <Shield className="h-icon-xs w-icon-xs" />;
 }
 };

 const getKindColor = (kind: string) => {
 switch (kind) {
 case 'safety':
 return 'destructive';
 case 'security':
 return 'warning';
 case 'regulatory':
 return 'info';
 case 'quality':
 return 'success';
 case 'environmental':
 return 'secondary';
 case 'legal':
 return 'info';
 case 'financial':
 return 'warning';
 default:
 return 'secondary';
 }
 };

 const getRiskColor = (riskLevel?: string) => {
 switch (riskLevel) {
 case 'critical':
 return 'destructive';
 case 'high':
 return 'warning';
 case 'medium':
 return 'info';
 case 'low':
 return 'success';
 default:
 return 'secondary';
 }
 };

 const isOverdue = (dueDate?: string) => {
 if (!dueDate) return false;
 return new Date(dueDate) < new Date();
 };

 const columns = useMemo(() => [
 {
 key: 'compliance_title',
 label: 'Compliance Item',
 sortable: true,
 render: (value: string, record: JobCompliance) => (
 <div className="flex items-center gap-sm">
 <div className="h-icon-lg w-icon-lg bg-accent/10 rounded-md flex items-center justify-center">
 <Shield className="h-icon-xs w-icon-xs color-accent" />
 </div>
 <div>
 <p className="text-body-sm font-medium color-foreground">
 {value || `${record.kind} Compliance`}
 </p>
 <p className="text-body-xs color-muted">ID: {record.id}</p>
 </div>
 </div>
 )
 },
 {
 key: 'job_title',
 label: 'Job',
 sortable: true,
 render: (value: string, record: JobCompliance) => (
 <div>
 <p className="text-body-sm color-foreground">{value || 'Untitled Job'}</p>
 <p className="text-body-xs color-muted">ID: {record.job_id}</p>
 </div>
 )
 },
 {
 key: 'kind',
 label: 'Type',
 sortable: true,
 render: (value: string) => (
 <Badge variant={getKindColor(value)} className="capitalize">
 {value}
 </Badge>
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
 key: 'risk_level',
 label: 'Risk Level',
 sortable: true,
 render: (value: string) => {
 if (!value) return <span className="color-muted">—</span>;
 return (
 <Badge variant={getRiskColor(value)} size="sm" className="capitalize">
 {value}
 </Badge>
 );
 }
 },
 {
 key: 'due_at',
 label: 'Due Date',
 sortable: true,
 render: (value: string) => {
 if (!value) return <span className="color-muted">—</span>;
 
 const dueDate = new Date(value);
 const overdue = isOverdue(value);
 
 return (
 <div className={`flex items-center gap-xs ${
 overdue ? 'color-destructive' : 'color-foreground'
 }`}>
 {overdue && <AlertTriangle className="h-3 w-3" />}
 <div>
 <p className="text-body-sm">{dueDate.toLocaleDateString()}</p>
 {overdue && (
 <p className="text-body-xs color-destructive">Overdue</p>
 )}
 </div>
 </div>
 );
 }
 },
 {
 key: 'assessor_name',
 label: 'Assessor',
 render: (value: string) => (
 <p className="text-body-sm color-foreground">
 {value || '—'}
 </p>
 )
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
 render: (_: unknown, record: JobCompliance) => (
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
 {onEdit && record.status === 'pending' && (
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onEdit(record)}
 >
 Edit
 </Button>
 )}
 {onSubmit && record.status === 'pending' && (
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onSubmit(record.id)}
 className="color-info"
 >
 Submit
 </Button>
 )}
 {onApprove && record.status === 'submitted' && (
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onApprove(record.id)}
 className="color-success"
 >
 Approve
 </Button>
 )}
 {onReject && record.status === 'submitted' && (
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onReject(record.id)}
 className="color-warning"
 >
 Reject
 </Button>
 )}
 {onDelete && ['approved', 'rejected'].includes(record.status) && (
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
 ], [onEdit, onView, onDelete, onSubmit, onApprove, onReject]);

 return (
 <DataGrid
 data={compliance}
 columns={columns}
 loading={loading}
 emptyState={{
 title: 'No Compliance Items Found',
 description: 'No compliance items match your current filters.',
 icon: <Shield className="h-icon-2xl w-icon-2xl color-muted" />
 }}
 />
 );
}
