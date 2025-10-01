"use client";

import { Calendar, Target, ListTodo, Clock, Users, Edit, Eye, Trash2, ChevronUp, ChevronDown, AlertCircle, CheckCircle, ArrowUpDown } from "lucide-react";
import { useState, useMemo } from "react";
import { Badge, Button, Card, Checkbox } from "@ghxstship/ui";
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

interface ScheduleItem {
 id: string;
 type: "project" | "milestone" | "task";
 title: string;
 start_date?: string;
 end_date?: string;
 due_date?: string;
 status: string;
 progress?: number;
 project?: {
 id: string;
 name: string;
 };
 assignee?: {
 id: string;
 name: string;
 };
 priority?: string;
 color?: string;
}

interface ScheduleListViewProps {
 items: ScheduleItem[];
 milestones: Milestone[];
 tasks: Task[];
 onViewMilestone?: (milestone: Milestone) => void;
 onEditMilestone?: (milestone: Milestone) => void;
 onViewTask?: (task: Task) => void;
 onEditTask?: (task: Task) => void;
}

type SortField = "title" | "due_date" | "status" | "priority" | "project";
type SortDirection = "asc" | "desc";

export default function ScheduleListView({
 items,
 milestones,
 tasks,
 onViewMilestone,
 onEditMilestone,
 onViewTask,
 onEditTask,
}: ScheduleListViewProps) {
 const [selectedItems, setSelectedItems] = useState<Set<string>(new Set());
 const [sortField, setSortField] = useState<SortField>("due_date");
 const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
 const [expandedSections, setExpandedSections] = useState<Set<string>(
 new Set(["milestones", "tasks"])
 );

 // Sort items
 const sortedMilestones = useMemo(() => {
 return [...milestones].sort((a, b) => {
 let comparison = 0;
 
 switch (sortField) {
 case "title":
 comparison = a.title.localeCompare(b.title);
 break;
 case "due_date":
 comparison = a.due_date.localeCompare(b.due_date);
 break;
 case "status":
 comparison = a.status.localeCompare(b.status);
 break;
 case "project":
 comparison = (a.project?.name || "").localeCompare(b.project?.name || "");
 break;
 default:
 comparison = 0;
 }
 
 return sortDirection === "asc" ? comparison : -comparison;
 });
 }, [milestones, sortField, sortDirection]);

 const sortedTasks = useMemo(() => {
 return [...tasks].sort((a, b) => {
 let comparison = 0;
 
 switch (sortField) {
 case "title":
 comparison = a.title.localeCompare(b.title);
 break;
 case "due_date":
 comparison = (a.due_date || "").localeCompare(b.due_date || "");
 break;
 case "status":
 comparison = a.status.localeCompare(b.status);
 break;
 case "priority":
 comparison = a.priority.localeCompare(b.priority);
 break;
 case "project":
 comparison = (a.project?.name || "").localeCompare(b.project?.name || "");
 break;
 default:
 comparison = 0;
 }
 
 return sortDirection === "asc" ? comparison : -comparison;
 });
 }, [tasks, sortField, sortDirection]);

 // Toggle sort
 const toggleSort = (field: SortField) => {
 if (sortField === field) {
 setSortDirection(prev => prev === "asc" ? "desc" : "asc");
 } else {
 setSortField(field);
 setSortDirection("asc");
 }
 };

 // Toggle selection
 const toggleSelection = (id: string) => {
 setSelectedItems(prev => {
 const next = new Set(prev);
 if (next.has(id)) {
 next.delete(id);
 } else {
 next.add(id);
 }
 return next;
 });
 };

 const toggleAllMilestones = () => {
 const allMilestoneIds = milestones.map(m => m.id);
 const allSelected = allMilestoneIds.every(id => selectedItems.has(id));
 
 if (allSelected) {
 setSelectedItems(prev => {
 const next = new Set(prev);
 allMilestoneIds.forEach(id => next.delete(id));
 return next;
 });
 } else {
 setSelectedItems(prev => {
 const next = new Set(prev);
 allMilestoneIds.forEach(id => next.add(id));
 return next;
 });
 }
 };

 const toggleAllTasks = () => {
 const allTaskIds = tasks.map(t => t.id);
 const allSelected = allTaskIds.every(id => selectedItems.has(id));
 
 if (allSelected) {
 setSelectedItems(prev => {
 const next = new Set(prev);
 allTaskIds.forEach(id => next.delete(id));
 return next;
 });
 } else {
 setSelectedItems(prev => {
 const next = new Set(prev);
 allTaskIds.forEach(id => next.add(id));
 return next;
 });
 }
 };

 // Toggle section expansion
 const toggleSection = (section: string) => {
 setExpandedSections(prev => {
 const next = new Set(prev);
 if (next.has(section)) {
 next.delete(section);
 } else {
 next.add(section);
 }
 return next;
 });
 };

 // Get status badge
 const getStatusBadge = (status: string) => {
 const variant = 
 status === "completed" || status === "done" ? "success" :
 status === "in_progress" || status === "review" ? "warning" :
 status === "overdue" || status === "blocked" ? "destructive" :
 "secondary";
 
 return (
 <Badge variant={variant} className="text-xs">
 {status.replace("_", " ")}
 </Badge>
 );
 };

 // Get priority badge
 const getPriorityBadge = (priority: string) => {
 const variant = 
 priority === "critical" ? "destructive" :
 priority === "high" ? "warning" :
 priority === "medium" ? "secondary" :
 "outline";
 
 return (
 <Badge variant={variant} className="text-xs">
 {priority}
 </Badge>
 );
 };

 // Calculate days until due
 const getDaysUntil = (date?: string) => {
 if (!date) return null;
 const days = differenceInDays(parseISO(date), new Date());
 
 if (days < 0) {
 return (
 <span className="text-destructive text-xs flex items-center gap-xs">
 <AlertCircle className="h-3 w-3" />
 {Math.abs(days)}d overdue
 </span>
 );
 } else if (days === 0) {
 return (
 <span className="text-warning text-xs flex items-center gap-xs">
 <Clock className="h-3 w-3" />
 Due today
 </span>
 );
 } else if (days <= 7) {
 return (
 <span className="text-warning text-xs flex items-center gap-xs">
 <Clock className="h-3 w-3" />
 {days}d left
 </span>
 );
 } else {
 return (
 <span className="text-muted-foreground text-xs flex items-center gap-xs">
 <Clock className="h-3 w-3" />
 {days}d
 </span>
 );
 }
 };

 // Render sort button
 const renderSortButton = (field: SortField, label: string) => {
 const isActive = sortField === field;
 return (
 <button
 onClick={() => toggleSort(field)}
 className="flex items-center gap-xs hover:text-primary transition-colors"
 >
 {label}
 {isActive ? (
 sortDirection === "asc" ? (
 <ChevronUp className="h-3 w-3" />
 ) : (
 <ChevronDown className="h-3 w-3" />
 )
 ) : (
 <ArrowUpDown className="h-3 w-3 opacity-50" />
 )}
 </button>
 );
 };

 return (
 <div className="space-y-md">
 {/* Milestones Section */}
 <Card>
 <div
 className="p-md border-b cursor-pointer hover:bg-muted/50 transition-colors"
 onClick={() => toggleSection("milestones")}
 >
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-xs">
 <Target className="h-icon-sm w-icon-sm text-success" />
 <h3 className="font-semibold">Milestones</h3>
 <Badge variant="secondary">{milestones.length}</Badge>
 </div>
 {expandedSections.has("milestones") ? (
 <ChevronUp className="h-icon-xs w-icon-xs" />
 ) : (
 <ChevronDown className="h-icon-xs w-icon-xs" />
 )}
 </div>
 </div>

 {expandedSections.has("milestones") && (
 <>
 {/* Table header */}
 <div className="p-md border-b bg-muted/30">
 <div className="flex items-center gap-md text-sm font-medium">
 <div className="w-icon-xl">
 <Checkbox
 checked={milestones.length > 0 && milestones.every(m => selectedItems.has(m.id))}
 onChange={() => toggleAllMilestones()}
 />
 </div>
 <div className="flex-1">{renderSortButton("title", "Title")}</div>
 <div className="w-component-xl">{renderSortButton("project", "Project")}</div>
 <div className="w-28">{renderSortButton("due_date", "Due Date")}</div>
 <div className="w-component-lg">{renderSortButton("status", "Status")}</div>
 <div className="w-component-lg text-center">Progress</div>
 <div className="w-component-lg text-center">Actions</div>
 </div>
 </div>

 {/* Milestone rows */}
 <div className="divide-y">
 {sortedMilestones.map(milestone => (
 <div
 key={milestone.id}
 className="p-md hover:bg-muted/30 transition-colors"
 >
 <div className="flex items-center gap-md">
 <div className="w-icon-xl">
 <Checkbox
 checked={selectedItems.has(milestone.id)}
 onChange={() => toggleSelection(milestone.id)}
 />
 </div>
 <div className="flex-1">
 <p className="font-medium">{milestone.title}</p>
 {milestone.description && (
 <p className="text-sm text-muted-foreground line-clamp-xs">
 {milestone.description}
 </p>
 )}
 </div>
 <div className="w-component-xl">
 {milestone.project && (
 <span className="text-sm text-muted-foreground">
 {milestone.project.name}
 </span>
 )}
 </div>
 <div className="w-28">
 <div className="text-sm">
 {format(parseISO(milestone.due_date), "MMM d, yyyy")}
 </div>
 {getDaysUntil(milestone.due_date)}
 </div>
 <div className="w-component-lg">
 {getStatusBadge(milestone.status)}
 </div>
 <div className="w-component-lg text-center">
 <span className="text-sm font-medium">{milestone.progress}%</span>
 </div>
 <div className="w-component-lg flex items-center justify-center gap-xs">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onViewMilestone?.(milestone)}
 >
 <Eye className="h-icon-xs w-icon-xs" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onEditMilestone?.(milestone)}
 >
 <Edit className="h-icon-xs w-icon-xs" />
 </Button>
 </div>
 </div>
 </div>
 ))}
 </div>
 </>
 )}
 </Card>

 {/* Tasks Section */}
 <Card>
 <div
 className="p-md border-b cursor-pointer hover:bg-muted/50 transition-colors"
 onClick={() => toggleSection("tasks")}
 >
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-xs">
 <ListTodo className="h-icon-sm w-icon-sm text-info" />
 <h3 className="font-semibold">Tasks</h3>
 <Badge variant="secondary">{tasks.length}</Badge>
 </div>
 {expandedSections.has("tasks") ? (
 <ChevronUp className="h-icon-xs w-icon-xs" />
 ) : (
 <ChevronDown className="h-icon-xs w-icon-xs" />
 )}
 </div>
 </div>

 {expandedSections.has("tasks") && (
 <>
 {/* Table header */}
 <div className="p-md border-b bg-muted/30">
 <div className="flex items-center gap-md text-sm font-medium">
 <div className="w-icon-xl">
 <Checkbox
 checked={tasks.length > 0 && tasks.every(t => selectedItems.has(t.id))}
 onChange={() => toggleAllTasks()}
 />
 </div>
 <div className="flex-1">{renderSortButton("title", "Title")}</div>
 <div className="w-component-xl">{renderSortButton("project", "Project")}</div>
 <div className="w-28">{renderSortButton("due_date", "Due Date")}</div>
 <div className="w-component-lg">{renderSortButton("status", "Status")}</div>
 <div className="w-component-lg">{renderSortButton("priority", "Priority")}</div>
 <div className="w-component-xl">Assignee</div>
 <div className="w-component-lg text-center">Actions</div>
 </div>
 </div>

 {/* Task rows */}
 <div className="divide-y">
 {sortedTasks.map(task => (
 <div
 key={task.id}
 className="p-md hover:bg-muted/30 transition-colors"
 >
 <div className="flex items-center gap-md">
 <div className="w-icon-xl">
 <Checkbox
 checked={selectedItems.has(task.id)}
 onChange={() => toggleSelection(task.id)}
 />
 </div>
 <div className="flex-1">
 <p className="font-medium">{task.title}</p>
 {task.description && (
 <p className="text-sm text-muted-foreground line-clamp-xs">
 {task.description}
 </p>
 )}
 </div>
 <div className="w-component-xl">
 {task.project && (
 <span className="text-sm text-muted-foreground">
 {task.project.name}
 </span>
 )}
 </div>
 <div className="w-28">
 {task.due_date && (
 <>
 <div className="text-sm">
 {format(parseISO(task.due_date), "MMM d, yyyy")}
 </div>
 {getDaysUntil(task.due_date)}
 </>
 )}
 </div>
 <div className="w-component-lg">
 {getStatusBadge(task.status)}
 </div>
 <div className="w-component-lg">
 {getPriorityBadge(task.priority)}
 </div>
 <div className="w-component-xl">
 {task.assignee && (
 <div className="flex items-center gap-xs text-sm">
 <Users className="h-3 w-3" />
 {task.assignee.full_name || task.assignee.email}
 </div>
 )}
 </div>
 <div className="w-component-lg flex items-center justify-center gap-xs">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onViewTask?.(task)}
 >
 <Eye className="h-icon-xs w-icon-xs" />
 </Button>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => onEditTask?.(task)}
 >
 <Edit className="h-icon-xs w-icon-xs" />
 </Button>
 </div>
 </div>
 </div>
 ))}
 </div>
 </>
 )}
 </Card>
 </div>
 );
}
