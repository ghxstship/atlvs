'use client';

import { Users, Clock, CheckCircle, AlertCircle, Calendar, FileText, Edit } from "lucide-react";
import { Badge, Button } from '@ghxstship/ui';
import { AppDrawer } from '@ghxstship/ui';
import type { JobAssignment, AssignmentDrawerProps } from '../types';

interface ViewAssignmentDrawerProps extends Omit<AssignmentDrawerProps, 'mode' | 'onSave'> {
 assignment: JobAssignment;
 onEdit?: () => void;
}

export default function ViewAssignmentDrawer({
 assignment,
 onEdit,
 onClose,
 open
}: ViewAssignmentDrawerProps) {

 const getStatusColor = (status: string) => {
 switch (status) {
 case 'completed': return 'success';
 case 'in_progress': return 'info';
 case 'assigned': return 'warning';
 case 'pending': return 'secondary';
 case 'cancelled': return 'destructive';
 default: return 'secondary';
 }
 };

 const getStatusIcon = (status: string) => {
 switch (status) {
 case 'completed': return <CheckCircle className="h-icon-xs w-icon-xs" />;
 case 'in_progress': return <Clock className="h-icon-xs w-icon-xs" />;
 case 'assigned': return <Users className="h-icon-xs w-icon-xs" />;
 case 'pending': return <Clock className="h-icon-xs w-icon-xs" />;
 case 'cancelled': return <AlertCircle className="h-icon-xs w-icon-xs" />;
 default: return <Clock className="h-icon-xs w-icon-xs" />;
 }
 };

 return (
 <AppDrawer
 open={open}
 onClose={onClose}
 title="Assignment Details"
 record={assignment}
 mode="view"
 >
 <div className="stack-lg">
 {/* Header */}
 <div className="flex items-start justify-between">
 <div className="flex-1">
 <h2 className="text-heading-4 color-foreground">
 {assignment.job_title || 'Untitled Job'}
 </h2>
 <p className="text-body-sm color-muted">
 Assignment ID: {assignment.id}
 </p>
 </div>
 {onEdit && (
 <Button variant="outline" onClick={onEdit}>
 <Edit className="h-icon-xs w-icon-xs mr-xs" />
 Edit
 </Button>
 )}
 </div>

 {/* Status Badge */}
 <div className="flex items-center gap-sm">
 <Badge variant={getStatusColor(assignment.job_status || 'pending')} className="flex items-center gap-xs">
 {getStatusIcon(assignment.job_status || 'pending')}
 {assignment.job_status || 'Pending'}
 </Badge>
 </div>

 {/* Assignment Details */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
 {/* Job Information */}
 <div className="stack-md">
 <h3 className="text-heading-5 color-foreground">Job Information</h3>
 
 <div className="stack-sm">
 <div className="stack-2xs">
 <p className="text-body-xs form-label color-muted">Job Title</p>
 <p className="text-body-sm color-foreground">
 {assignment.job_title || '—'}
 </p>
 </div>

 <div className="stack-2xs">
 <p className="text-body-xs form-label color-muted">Job ID</p>
 <p className="text-body-sm color-foreground font-mono">
 {assignment.job_id}
 </p>
 </div>

 <div className="stack-2xs">
 <p className="text-body-xs form-label color-muted">Job Status</p>
 <Badge variant={getStatusColor(assignment.job_status || 'pending')} size="sm">
 {assignment.job_status || 'Pending'}
 </Badge>
 </div>

 {assignment.job_due_at && (
 <div className="stack-2xs">
 <p className="text-body-xs form-label color-muted">Due Date</p>
 <div className="flex items-center gap-xs">
 <Calendar className="h-icon-xs w-icon-xs color-muted" />
 <p className={`text-body-sm ${
 new Date(assignment.job_due_at) < new Date() 
 ? 'color-destructive' 
 : 'color-foreground'
 }`}>
 {new Date(assignment.job_due_at).toLocaleDateString()}
 {new Date(assignment.job_due_at) < new Date() && ' (Overdue)'}
 </p>
 </div>
 </div>
 )}

 {assignment.project_title && (
 <div className="stack-2xs">
 <p className="text-body-xs form-label color-muted">Project</p>
 <p className="text-body-sm color-foreground">
 {assignment.project_title}
 </p>
 </div>
 )}
 </div>
 </div>

 {/* Assignee Information */}
 <div className="stack-md">
 <h3 className="text-heading-5 color-foreground">Assignee Information</h3>
 
 <div className="stack-sm">
 <div className="flex items-center gap-sm">
 <div className="h-icon-xl w-icon-xl bg-secondary rounded-full flex items-center justify-center">
 <Users className="h-icon-sm w-icon-sm" />
 </div>
 <div>
 <p className="text-body-sm font-medium color-foreground">
 {assignment.assignee_name || 'Unassigned'}
 </p>
 <p className="text-body-xs color-muted">
 {assignment.assignee_email || '—'}
 </p>
 </div>
 </div>

 <div className="stack-2xs">
 <p className="text-body-xs form-label color-muted">Assignee ID</p>
 <p className="text-body-sm color-foreground font-mono">
 {assignment.assignee_user_id}
 </p>
 </div>
 </div>
 </div>
 </div>

 {/* Assignment Timeline */}
 <div className="stack-md">
 <h3 className="text-heading-5 color-foreground">Timeline</h3>
 
 <div className="stack-sm">
 <div className="flex items-center gap-sm p-sm border border-border rounded-md">
 <Calendar className="h-icon-xs w-icon-xs color-muted" />
 <div>
 <p className="text-body-sm color-foreground">Assigned</p>
 <p className="text-body-xs color-muted">
 {assignment.assigned_at 
 ? new Date(assignment.assigned_at).toLocaleString()
 : 'Not assigned'
 }
 </p>
 </div>
 </div>
 </div>
 </div>

 {/* Notes */}
 {assignment.note && (
 <div className="stack-md">
 <h3 className="text-heading-5 color-foreground">Notes</h3>
 <div className="p-md bg-secondary/50 rounded-md">
 <div className="flex items-start gap-sm">
 <FileText className="h-icon-xs w-icon-xs color-muted mt-xs" />
 <p className="text-body-sm color-foreground whitespace-pre-wrap">
 {assignment.note}
 </p>
 </div>
 </div>
 </div>
 )}

 {/* Actions */}
 <div className="flex items-center justify-end gap-sm pt-md border-t border-border">
 <Button variant="outline" onClick={onClose}>
 Close
 </Button>
 {onEdit && (
 <Button onClick={onEdit}>
 <Edit className="h-icon-xs w-icon-xs mr-xs" />
 Edit Assignment
 </Button>
 )}
 </div>
 </div>
 </AppDrawer>
 );
}
