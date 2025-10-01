'use client';

import { Users, Clock, CheckCircle, AlertCircle, TrendingUp, Calendar, Target, Activity } from "lucide-react";
import { useMemo } from 'react';
import { Card, Badge, Button } from '@ghxstship/ui';
import type { JobAssignment, AssignmentStats } from '../types';

interface AssignmentDashboardViewProps {
 assignments: JobAssignment[];
 stats?: AssignmentStats;
 loading?: boolean;
 onViewAll?: () => void;
 onCreateNew?: () => void;
}

export default function AssignmentDashboardView({
 assignments,
 stats,
 loading = false,
 onViewAll,
 onCreateNew
}: AssignmentDashboardViewProps) {

 const calculatedStats = useMemo(() => {
 if (stats) return stats;

 // Calculate stats from assignments if not provided
 const total = assignments.length;
 const byStatus = assignments.reduce((acc, assignment) => {
 const status = assignment.job_status || 'pending';
 acc[status] = (acc[status] || 0) + 1;
 return acc;
 }, {} as Record<string, number>);

 const completed = byStatus.completed || 0;
 const completionRate = total > 0 ? (completed / total) * 100 : 0;

 const recentAssignments = assignments.filter(assignment => {
 const assignedDate = new Date(assignment.assigned_at);
 const weekAgo = new Date();
 weekAgo.setDate(weekAgo.getDate() - 7);
 return assignedDate >= weekAgo;
 }).length;

 const overdue = assignments.filter(assignment => {
 if (!assignment.job_due_at) return false;
 return new Date(assignment.job_due_at) < new Date();
 }).length;

 return {
 total,
 byStatus,
 completionRate,
 recentAssignments,
 overdue,
 byPriority: { low: 0, medium: 0, high: 0, critical: 0 },
 averageCompletionTime: 0
 };
 }, [assignments, stats]);

 const recentAssignments = useMemo(() => {
 return assignments
 .sort((a, b) => new Date(b.assigned_at).getTime() - new Date(a.assigned_at).getTime())
 .slice(0, 5);
 }, [assignments]);

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

 if (loading) {
 return (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
 {[...Array(8)].map((_, i) => (
 <Card key={i} className="p-lg">
 <div className="stack-sm">
 <div className="h-icon-md w-icon-md bg-secondary rounded" />
 <div className="h-icon-xs w-component-lg bg-secondary rounded" />
 <div className="h-icon-lg w-component-md bg-secondary rounded" />
 </div>
 </Card>
 ))}
 </div>
 );
 }

 return (
 <div className="stack-lg">
 {/* Header */}
 <div className="flex items-center justify-between">
 <div>
 <h2 className="text-heading-3 color-foreground">Assignment Dashboard</h2>
 <p className="color-muted">Overview of job assignments and performance metrics</p>
 </div>
 <div className="flex gap-sm">
 {onViewAll && (
 <Button variant="outline" onClick={onViewAll}>
 View All
 </Button>
 )}
 {onCreateNew && (
 <Button onClick={onCreateNew}>
 <Users className="h-icon-xs w-icon-xs mr-xs" />
 New Assignment
 </Button>
 )}
 </div>
 </div>

 {/* Stats Cards */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
 <Card className="p-lg">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-body-sm color-muted">Total Assignments</p>
 <p className="text-heading-2 font-semibold color-foreground">
 {calculatedStats.total}
 </p>
 <p className="text-body-xs color-muted">
 {calculatedStats.recentAssignments} this week
 </p>
 </div>
 <Users className="h-icon-lg w-icon-lg color-accent" />
 </div>
 </Card>

 <Card className="p-lg">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-body-sm color-muted">Completion Rate</p>
 <p className="text-heading-2 font-semibold color-foreground">
 {Math.round(calculatedStats.completionRate)}%
 </p>
 <p className="text-body-xs color-muted">
 {calculatedStats.byStatus.completed || 0} completed
 </p>
 </div>
 <Target className="h-icon-lg w-icon-lg color-success" />
 </div>
 </Card>

 <Card className="p-lg">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-body-sm color-muted">In Progress</p>
 <p className="text-heading-2 font-semibold color-foreground">
 {calculatedStats.byStatus.in_progress || 0}
 </p>
 <p className="text-body-xs color-muted">Active assignments</p>
 </div>
 <Activity className="h-icon-lg w-icon-lg color-info" />
 </div>
 </Card>

 <Card className="p-lg">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-body-sm color-muted">Overdue</p>
 <p className="text-heading-2 font-semibold color-foreground">
 {calculatedStats.overdue}
 </p>
 <p className="text-body-xs color-muted">Need attention</p>
 </div>
 <AlertCircle className="h-icon-lg w-icon-lg color-warning" />
 </div>
 </Card>
 </div>

 {/* Status Breakdown */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
 <Card className="p-lg">
 <div className="stack-md">
 <div className="flex items-center justify-between">
 <h3 className="text-heading-4 color-foreground">Status Breakdown</h3>
 <TrendingUp className="h-icon-sm w-icon-sm color-muted" />
 </div>
 
 <div className="stack-sm">
 {Object.entries(calculatedStats.byStatus).map(([status, count]) => (
 <div key={status} className="flex items-center justify-between p-sm border border-border rounded-md">
 <div className="flex items-center gap-sm">
 {getStatusIcon(status)}
 <span className="text-body-sm color-foreground capitalize">
 {status.replace('_', ' ')}
 </span>
 </div>
 <div className="flex items-center gap-sm">
 <Badge variant={getStatusColor(status)}>
 {count}
 </Badge>
 <span className="text-body-xs color-muted">
 {calculatedStats.total > 0 
 ? Math.round((count / calculatedStats.total) * 100)
 : 0
 }%
 </span>
 </div>
 </div>
 ))}
 </div>
 </div>
 </Card>

 {/* Recent Assignments */}
 <Card className="p-lg">
 <div className="stack-md">
 <div className="flex items-center justify-between">
 <h3 className="text-heading-4 color-foreground">Recent Assignments</h3>
 <Calendar className="h-icon-sm w-icon-sm color-muted" />
 </div>
 
 <div className="stack-sm">
 {recentAssignments.length === 0 ? (
 <div className="text-center p-lg">
 <Users className="h-icon-lg w-icon-lg color-muted mx-auto mb-sm" />
 <p className="color-muted">No recent assignments</p>
 </div>
 ) : (
 recentAssignments.map((assignment) => (
 <div key={assignment.id} className="flex items-center justify-between p-sm border border-border rounded-md">
 <div className="flex items-center gap-sm flex-1 min-w-0">
 <div className="h-icon-md w-icon-md bg-secondary rounded-full flex items-center justify-center">
 <Users className="h-3 w-3" />
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-body-sm font-medium color-foreground truncate">
 {assignment.job_title || 'Untitled Job'}
 </p>
 <p className="text-body-xs color-muted truncate">
 {assignment.assignee_name} • {new Date(assignment.assigned_at).toLocaleDateString()}
 </p>
 </div>
 </div>
 <Badge variant={getStatusColor(assignment.job_status || 'pending')} size="sm">
 {assignment.job_status || 'pending'}
 </Badge>
 </div>
 ))
 )}
 </div>
 </div>
 </Card>
 </div>
 </div>
 );
}
