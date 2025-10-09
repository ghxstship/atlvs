'use client';

import { AlertCircle, Calendar, CheckCircle, Clock, Edit, Users } from "lucide-react";
import { useMemo } from 'react';
import { KanbanBoard, Badge, Card } from '@ghxstship/ui';
import type { JobAssignment } from '../types';

interface AssignmentKanbanViewProps {
 assignments: JobAssignment[];
 loading?: boolean;
 onEdit?: (assignment: JobAssignment) => void;
 onView?: (assignment: JobAssignment) => void;
 onStatusChange?: (assignmentId: string, newStatus: string) => void;
}

export default function AssignmentKanbanView({
 assignments,
 loading = false,
 onEdit,
 onView,
 onStatusChange
}: AssignmentKanbanViewProps) {

 const columns = useMemo(() => [
 {
 id: 'pending',
 title: 'Pending',
 color: 'secondary',
 icon: <Clock className="h-icon-xs w-icon-xs" />
 },
 {
 id: 'assigned',
 title: 'Assigned',
 color: 'warning',
 icon: <Users className="h-icon-xs w-icon-xs" />
 },
 {
 id: 'in_progress',
 title: 'In Progress',
 color: 'info',
 icon: <Clock className="h-icon-xs w-icon-xs" />
 },
 {
 id: 'completed',
 title: 'Completed',
 color: 'success',
 icon: <CheckCircle className="h-icon-xs w-icon-xs" />
 },
 {
 id: 'cancelled',
 title: 'Cancelled',
 color: 'destructive',
 icon: <AlertCircle className="h-icon-xs w-icon-xs" />
 }
 ], []);

 const renderCard = (assignment: JobAssignment) => (
 <Card className="p-md hover:shadow-elevated transition-shadow cursor-pointer">
 <div className="stack-sm">
 {/* Header */}
 <div className="flex items-start justify-between">
 <div className="flex-1">
 <h4 className="text-body-sm font-medium color-foreground line-clamp-xs">
 {assignment.job_title || 'Untitled Job'}
 </h4>
 <p className="text-body-xs color-muted">
 Job ID: {assignment.job_id}
 </p>
 </div>
 </div>

 {/* Assignee Info */}
 <div className="flex items-center gap-sm">
 <div className="h-icon-md w-icon-md bg-secondary rounded-full flex items-center justify-center">
 <Users className="h-3 w-3" />
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-body-xs font-medium color-foreground truncate">
 {assignment.assignee_name || 'Unassigned'}
 </p>
 <p className="text-body-xs color-muted truncate">
 {assignment.assignee_email}
 </p>
 </div>
 </div>

 {/* Dates */}
 <div className="flex items-center justify-between text-body-xs color-muted">
 <div className="flex items-center gap-xs">
 <Calendar className="h-3 w-3" />
 <span>
 {assignment.assigned_at 
 ? new Date(assignment.assigned_at).toLocaleDateString()
 : 'Not assigned'
 }
 </span>
 </div>
 {assignment.job_due_at && (
 <div className={`flex items-center gap-xs ${
 new Date(assignment.job_due_at) < new Date() ? 'color-destructive' : ''
 }`}>
 <Clock className="h-3 w-3" />
 <span>Due {new Date(assignment.job_due_at).toLocaleDateString()}</span>
 </div>
 )}
 </div>

 {/* Notes */}
 {assignment.note && (
 <p className="text-body-xs color-muted line-clamp-xs bg-secondary/50 p-xs rounded">
 {assignment.note}
 </p>
 )}

 {/* Project Badge */}
 {assignment.project_title && (
 <Badge variant="outline" size="sm">
 {assignment.project_title}
 </Badge>
 )}

 {/* Actions */}
 <div className="flex items-center gap-xs pt-xs border-t border-border">
 {onView && (
 <button
 onClick={(e) => {
 e.stopPropagation();
 onView(assignment);
 }}
 className="text-body-xs color-accent hover:color-accent-foreground transition-colors"
 >
 View
 </button>
 )}
 {onEdit && (
 <button
 onClick={(e) => {
 e.stopPropagation();
 onEdit(assignment);
 }}
 className="text-body-xs color-accent hover:color-accent-foreground transition-colors"
 >
 Edit
 </button>
 )}
 </div>
 </div>
 </Card>
 );

 return (
 <KanbanBoard
 columns={columns}
 data={assignments}
 statusField="job_status"
 renderCard={renderCard}
 onCardMove={onStatusChange}
 loading={loading}
 emptyState={{
 title: 'No Assignments',
 description: 'No job assignments found for the current filters.',
 icon: <Users className="h-icon-2xl w-icon-2xl color-muted" />
 }}
 />
 );
}
