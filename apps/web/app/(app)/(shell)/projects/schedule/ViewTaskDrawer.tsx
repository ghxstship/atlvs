"use client";

import { ListTodo, Calendar, Clock, Users, CheckCircle, AlertCircle, Edit, FileText, Activity, Tag, TrendingUp } from "lucide-react";
import { AppDrawer, Button, Badge, Progress, Card } from "@ghxstship/ui";
import { format, parseISO, differenceInDays } from "date-fns";

interface Task {
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
 status: "todo" | "in_progress" | "review" | "done" | "blocked";
 priority: "low" | "medium" | "high" | "critical";
 assignee_id?: string;
 assignee?: {
 id: string;
 email: string;
 full_name?: string;
 };
 reporter_id?: string;
 reporter?: {
 id: string;
 email: string;
 full_name?: string;
 };
 start_date?: string;
 due_date?: string;
 completed_at?: string;
 estimated_hours?: number;
 actual_hours?: number;
 tags?: string[];
 position: number;
 created_at: string;
 updated_at: string;
}

interface ViewTaskDrawerProps {
 open: boolean;
 onOpenChange: (open: boolean) => void;
 task: Task;
 onEdit?: () => void;
}

export default function ViewTaskDrawer({
 open,
 onOpenChange,
 task,
 onEdit,
}: ViewTaskDrawerProps) {
 // Calculate days until due
 const getDaysUntil = () => {
 if (!task.due_date) return null;
 
 const days = differenceInDays(parseISO(task.due_date), new Date());
 
 if (task.status === "done") {
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
 task.status === "done" ? "success" :
 task.status === "in_progress" ? "warning" :
 task.status === "review" ? "info" :
 task.status === "blocked" ? "destructive" :
 "secondary";
 
 return (
 <Badge variant={variant}>
 {task.status.replace("_", " ")}
 </Badge>
 );
 };

 // Get priority badge
 const getPriorityBadge = () => {
 const variant = 
 task.priority === "critical" ? "destructive" :
 task.priority === "high" ? "warning" :
 task.priority === "medium" ? "secondary" :
 "outline";
 
 return (
 <Badge variant={variant}>
 {task.priority}
 </Badge>
 );
 };

 // Calculate progress
 const calculateProgress = () => {
 if (task.status === "done") return 100;
 if (task.status === "review") return 75;
 if (task.status === "in_progress") return 50;
 if (task.status === "blocked") return 25;
 return 0;
 };

 // Calculate efficiency
 const calculateEfficiency = () => {
 if (!task.estimated_hours || !task.actual_hours) return null;
 const efficiency = (task.estimated_hours / task.actual_hours) * 100;
 return efficiency.toFixed(0);
 };

 return (
 <AppDrawer
 open={open}
 onClose={() => onOpenChange(false)}
 title={task.title}
 description={task.project?.name || "Task Details"}
 icon={<ListTodo className="h-5 w-5" />}
 
 >
 <div className="space-y-6">
 {/* Header Actions */}
 <div className="flex justify-between items-start">
 <div className="flex items-center gap-2">
 {getStatusBadge()}
 {getPriorityBadge()}
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
 <span className="text-sm font-medium">Task Progress</span>
 <span className="text-2xl font-bold">{calculateProgress()}%</span>
 </div>
 <Progress value={calculateProgress()} className="h-2" />
 </div>
 </Card>

 {/* Description */}
 {task.description && (
 <div>
 <h3 className="font-medium mb-2 flex items-center gap-2">
 <FileText className="h-4 w-4" />
 Description
 </h3>
 <p className="text-sm text-muted-foreground whitespace-pre-wrap">
 {task.description}
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
 {task.start_date && (
 <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
 <span className="text-sm">Start Date</span>
 <span className="text-sm font-medium">
 {format(parseISO(task.start_date), "MMMM d, yyyy")}
 </span>
 </div>
 )}
 
 {task.due_date && (
 <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
 <span className="text-sm">Due Date</span>
 <span className="text-sm font-medium">
 {format(parseISO(task.due_date), "MMMM d, yyyy")}
 </span>
 </div>
 )}
 
 {task.completed_at && (
 <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
 <span className="text-sm">Completed</span>
 <span className="text-sm font-medium">
 {format(parseISO(task.completed_at), "MMMM d, yyyy 'at' h:mm a")}
 </span>
 </div>
 )}
 </div>
 </div>

 {/* Time Tracking */}
 {(task.estimated_hours || task.actual_hours) && (
 <div>
 <h3 className="font-medium mb-3 flex items-center gap-2">
 <Clock className="h-4 w-4" />
 Time Tracking
 </h3>
 <div className="grid grid-cols-2 gap-3">
 {task.estimated_hours && (
 <Card className="p-3">
 <div className="text-sm text-muted-foreground">Estimated</div>
 <div className="text-lg font-medium">{task.estimated_hours}h</div>
 </Card>
 )}
 {task.actual_hours && (
 <Card className="p-3">
 <div className="text-sm text-muted-foreground">Actual</div>
 <div className="text-lg font-medium">{task.actual_hours}h</div>
 </Card>
 )}
 </div>
 {calculateEfficiency() && (
 <div className="mt-3 p-3 bg-muted/50 rounded-lg flex items-center justify-between">
 <span className="text-sm flex items-center gap-2">
 <TrendingUp className="h-4 w-4" />
 Efficiency
 </span>
 <span className={`text-sm font-medium ${
 parseFloat(calculateEfficiency()) >= 100 ? "text-success" :
 parseFloat(calculateEfficiency()) >= 80 ? "text-warning" :
 "text-destructive"
 }`}>
 {calculateEfficiency()}%
 </span>
 </div>
 )}
 </div>
 )}

 {/* People */}
 <div>
 <h3 className="font-medium mb-3 flex items-center gap-2">
 <Users className="h-4 w-4" />
 People
 </h3>
 <div className="space-y-3">
 {task.assignee && (
 <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
 <span className="text-sm">Assignee</span>
 <span className="text-sm font-medium">
 {task.assignee.full_name || task.assignee.email}
 </span>
 </div>
 )}
 {task.reporter && (
 <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
 <span className="text-sm">Reporter</span>
 <span className="text-sm font-medium">
 {task.reporter.full_name || task.reporter.email}
 </span>
 </div>
 )}
 </div>
 </div>

 {/* Tags */}
 {task.tags && task.tags.length > 0 && (
 <div>
 <h3 className="font-medium mb-3 flex items-center gap-2">
 <Tag className="h-4 w-4" />
 Tags
 </h3>
 <div className="flex flex-wrap gap-2">
 {task.tags.map((tag) => (
 <Badge key={tag} variant="secondary">
 {tag}
 </Badge>
 ))}
 </div>
 </div>
 )}

 {/* Project Info */}
 {task.project && (
 <div>
 <h3 className="font-medium mb-2">Project</h3>
 <Card className="p-3">
 <div className="flex items-center justify-between">
 <span className="font-medium">{task.project.name}</span>
 <Badge variant={
 task.project.status === "active" ? "success" :
 task.project.status === "planning" ? "warning" :
 task.project.status === "on_hold" ? "secondary" :
 "destructive"
 }>
 {task.project.status}
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
 <span>{format(parseISO(task.created_at), "MMM d, yyyy 'at' h:mm a")}</span>
 </div>
 <div className="flex items-center justify-between">
 <span>Last Updated</span>
 <span>{format(parseISO(task.updated_at), "MMM d, yyyy 'at' h:mm a")}</span>
 </div>
 </div>
 </div>

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
