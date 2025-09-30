"use client";

import { Target, Calendar, Clock, CheckCircle, AlertCircle, Edit, FileText, Activity } from "lucide-react";
import { AppDrawer, Button, Badge, Progress, Card } from "@ghxstship/ui";
import { format, parseISO, differenceInDays } from "date-fns";

interface Milestone {
 id: string;
 project_id: string;
 organization_id: string;
 project?: {
 id: string;
 name: string;
 status: string;
 };
 title: string;
 description?: string;
 due_date: string;
 completed_at?: string;
 status: "pending" | "completed" | "overdue";
 progress: number;
 dependencies?: string[];
 created_at: string;
 updated_at: string;
}

interface ViewMilestoneDrawerProps {
 open: boolean;
 onOpenChange: (open: boolean) => void;
 milestone: Milestone;
 onEdit?: () => void;
}

export default function ViewMilestoneDrawer({
 open,
 onOpenChange,
 milestone,
 onEdit,
}: ViewMilestoneDrawerProps) {
 // Calculate days until due
 const getDaysUntil = () => {
 const days = differenceInDays(parseISO(milestone.due_date), new Date());
 
 if (milestone.status === "completed") {
 return (
 <span className="text-success flex items-center gap-1">
 <CheckCircle className="h-4 w-4" />
 Completed
 </span>
 );
 } else if (days < 0) {
 return (
 <span className="text-destructive flex items-center gap-1">
 <AlertCircle className="h-4 w-4" />
 {Math.abs(days)} days overdue
 </span>
 );
 } else if (days === 0) {
 return (
 <span className="text-warning flex items-center gap-1">
 <Clock className="h-4 w-4" />
 Due today
 </span>
 );
 } else if (days <= 7) {
 return (
 <span className="text-warning flex items-center gap-1">
 <Clock className="h-4 w-4" />
 {days} days left
 </span>
 );
 } else {
 return (
 <span className="text-muted-foreground flex items-center gap-1">
 <Clock className="h-4 w-4" />
 {days} days left
 </span>
 );
 }
 };

 // Get status badge
 const getStatusBadge = () => {
 const variant = 
 milestone.status === "completed" ? "success" :
 milestone.status === "overdue" ? "destructive" :
 "secondary";
 
 return (
 <Badge variant={variant}>
 {milestone.status}
 </Badge>
 );
 };

 // Get progress color
 const getProgressColor = () => {
 if (milestone.progress === 100) return "text-success";
 if (milestone.progress >= 75) return "text-info";
 if (milestone.progress >= 50) return "text-warning";
 if (milestone.progress >= 25) return "text-orange-500";
 return "text-destructive";
 };

 return (
 <AppDrawer
 open={open}
 onClose={() => onOpenChange(false)}
 title={milestone.title}
 description={milestone.project?.name || "Milestone Details"}
 icon={<Target className="h-5 w-5" />}
 
 >
 <div className="space-y-6">
 {/* Header Actions */}
 <div className="flex justify-between items-start">
 <div className="flex items-center gap-2">
 {getStatusBadge()}
 {getDaysUntil()}
 </div>
 {onEdit && (
 <Button
 variant="outline"
 size="sm"
 onClick={onEdit}
 >
 <Edit className="h-4 w-4 mr-2" />
 Edit
 </Button>
 )}
 </div>

 {/* Progress */}
 <Card className="p-4">
 <div className="space-y-3">
 <div className="flex items-center justify-between">
 <span className="text-sm font-medium">Progress</span>
 <span className={`text-2xl font-bold ${getProgressColor()}`}>
 {milestone.progress}%
 </span>
 </div>
 <Progress value={milestone.progress} className="h-2" />
 <div className="flex justify-between text-xs text-muted-foreground">
 <span>0%</span>
 <span>25%</span>
 <span>50%</span>
 <span>75%</span>
 <span>100%</span>
 </div>
 </div>
 </Card>

 {/* Description */}
 {milestone.description && (
 <div>
 <h3 className="font-medium mb-2 flex items-center gap-2">
 <FileText className="h-4 w-4" />
 Description
 </h3>
 <p className="text-sm text-muted-foreground whitespace-pre-wrap">
 {milestone.description}
 </p>
 </div>
 )}

 {/* Timeline */}
 <div>
 <h3 className="font-medium mb-3 flex items-center gap-2">
 <Calendar className="h-4 w-4" />
 Timeline
 </h3>
 <div className="space-y-3">
 <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
 <span className="text-sm">Due Date</span>
 <span className="text-sm font-medium">
 {format(parseISO(milestone.due_date), "MMMM d, yyyy")}
 </span>
 </div>
 
 {milestone.completed_at && (
 <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
 <span className="text-sm">Completed</span>
 <span className="text-sm font-medium">
 {format(parseISO(milestone.completed_at), "MMMM d, yyyy 'at' h:mm a")}
 </span>
 </div>
 )}
 </div>
 </div>

 {/* Project Info */}
 {milestone.project && (
 <div>
 <h3 className="font-medium mb-2">Project</h3>
 <Card className="p-3">
 <div className="flex items-center justify-between">
 <span className="font-medium">{milestone.project.name}</span>
 <Badge variant={
 milestone.project.status === "active" ? "success" :
 milestone.project.status === "planning" ? "warning" :
 milestone.project.status === "on_hold" ? "secondary" :
 "destructive"
 }>
 {milestone.project.status}
 </Badge>
 </div>
 </Card>
 </div>
 )}

 {/* Activity */}
 <div>
 <h3 className="font-medium mb-3 flex items-center gap-2">
 <Activity className="h-4 w-4" />
 Activity
 </h3>
 <div className="space-y-2 text-sm text-muted-foreground">
 <div className="flex items-center justify-between">
 <span>Created</span>
 <span>{format(parseISO(milestone.created_at), "MMM d, yyyy 'at' h:mm a")}</span>
 </div>
 <div className="flex items-center justify-between">
 <span>Last Updated</span>
 <span>{format(parseISO(milestone.updated_at), "MMM d, yyyy 'at' h:mm a")}</span>
 </div>
 </div>
 </div>

 {/* Dependencies (if any) */}
 {milestone.dependencies && milestone.dependencies.length > 0 && (
 <div>
 <h3 className="font-medium mb-2">Dependencies</h3>
 <div className="space-y-2">
 {milestone.dependencies.map((dep, index) => (
 <Card key={index} className="p-2">
 <span className="text-sm">{dep}</span>
 </Card>
 ))}
 </div>
 </div>
 )}

 {/* Close Button */}
 <div className="pt-6 border-t">
 <Button
 variant="outline"
 className="w-full"
 onClick={() => onOpenChange(false)}
 >
 Close
 </Button>
 </div>
 </div>
 </AppDrawer>
 );
}
