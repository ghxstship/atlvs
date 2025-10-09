'use client';

import { AlertCircle, CheckCircle, Clock, Edit, Users } from "lucide-react";
import { useMemo } from 'react';
import { DataGrid, Badge, Button } from '@ghxstship/ui';
import type { JobAssignment } from '../types';

interface AssignmentGridViewProps {
 assignments: JobAssignment[];
 loading?: boolean;
 onEdit?: (assignment: JobAssignment) => void;
 onView?: (assignment: JobAssignment) => void;
 onDelete?: (id: string) => void;
}

export default function AssignmentGridView({
 assignments,
 loading = false,
 onEdit,
 onView,
 onDelete
}: AssignmentGridViewProps) {
 
 const getStatusColor = (status: string) => {
 switch (status) {
 case 'completed':
 return 'success';
 case 'in_progress':
 return 'info';
 case 'assigned':
 return 'warning';
 case 'pending':
 return 'secondary';
 case 'cancelled':
 return 'destructive';
 default:
 return 'secondary';
 }
 };

 const getStatusIcon = (status: string) => {
 switch (status) {
 case 'completed':
 return <CheckCircle className="h-icon-xs w-icon-xs" />;
 case 'in_progress':
 return <Clock className="h-icon-xs w-icon-xs" />;
 case 'assigned':
 return <Users className="h-icon-xs w-icon-xs" />;
 case 'pending':
 return <Clock className="h-icon-xs w-icon-xs" />;
 case 'cancelled':
 return <AlertCircle className="h-icon-xs w-icon-xs" />;
 default:
 return <Clock className="h-icon-xs w-icon-xs" />;
 }
 };

 const columns = useMemo(() => [
 {
 key: 'job_title',
 label: 'Job Title',
 sortable: true,
 render: (value: string, record: JobAssignment) => (
 <div className="flex items-center gap-sm">
 <div className="h-icon-lg w-icon-lg bg-accent/10 rounded-md flex items-center justify-center">
 <Users className="h-icon-xs w-icon-xs color-accent" />
 </div>
 <div>
 <p className="text-body-sm font-medium color-foreground">{value || 'Untitled Job'}</p>
 <p className="text-body-xs color-muted">ID: {record.job_id}</p>
 </div>
 </div>
 )
 },
 {
 key: 'assignee_name',
 label: 'Assignee',
 sortable: true,
 render: (value: string, record: JobAssignment) => (
 <div className="flex items-center gap-sm">
 <div className="h-icon-md w-icon-md bg-secondary rounded-full flex items-center justify-center">
 <Users className="h-3 w-3" />
 </div>
 <div>
 <p className="text-body-sm color-foreground">{value || 'Unassigned'}</p>
 <p className="text-body-xs color-muted">{record.assignee_email}</p>
 </div>
 </div>
 )
 },
 {
 key: 'job_status',
 label: 'Job Status',
 sortable: true,
 render: (value: string) => (
 <Badge variant={getStatusColor(value)} className="flex items-center gap-xs">
 {getStatusIcon(value)}
 {value || 'Unknown'}
 </Badge>
 )
 },
 {
 key: 'assigned_at',
 label: 'Assigned Date',
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
 key: 'job_due_at',
 label: 'Due Date',
 sortable: true,
 render: (value: string) => {
 if (!value) return <span className="color-muted">—</span>;
 
 const dueDate = new Date(value);
 const isOverdue = dueDate < new Date();
 
 return (
 <div className={isOverdue ? 'color-destructive' : 'color-foreground'}>
 <p className="text-body-sm">{dueDate.toLocaleDateString()}</p>
 {isOverdue && (
 <p className="text-body-xs color-destructive">Overdue</p>
 )}
 </div>
 );
 }
 },
 {
 key: 'note',
 label: 'Notes',
 render: (value: string) => (
 <p className="text-body-sm color-muted line-clamp-xs max-w-xs">
 {value || '—'}
 </p>
 )
 },
 {
 key: 'actions',
 label: 'Actions',
 render: (_: unknown, record: JobAssignment) => (
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
 {onEdit && (
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onEdit(record)}
 >
 Edit
 </Button>
 )}
 {onDelete && (
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
 ], [onEdit, onView, onDelete]);

 return (
 <DataGrid
 data={assignments}
 columns={columns}
 loading={loading}
 emptyState={{
 title: 'No Assignments Found',
 description: 'No job assignments match your current filters.',
 icon: <Users className="h-icon-2xl w-icon-2xl color-muted" />
 }}
 />
 );
}
