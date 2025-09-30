"use client";

import { MoreVertical, Clock, Users, Calendar, Tag, AlertCircle, CheckCircle, Eye, Edit, Copy, Trash2, ArrowUpDown, ChevronUp, ChevronDown, Briefcase, ListTodo } from "lucide-react";
import Image from "next/image";
import { useState, useMemo } from "react";
import { Badge, Button, Checkbox, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@ghxstship/ui";
import { format, parseISO, differenceInDays } from "date-fns";

interface User {
 id: string;
 email: string;
 full_name?: string;
 avatar_url?: string;
}

interface Project {
 id: string;
 name: string;
 status: string;
}

interface Task {
 id: string;
 title: string;
 description?: string;
 status: "todo" | "in_progress" | "review" | "done" | "blocked";
 priority: "low" | "medium" | "high" | "critical";
 assignee?: User;
 project?: Project;
 due_date?: string;
 estimated_hours?: number;
 actual_hours?: number;
 tags?: string[];
 subtasks?: Task[];
 created_at: string;
 updated_at: string;
}

interface TaskListViewProps {
 tasks: Task[];
 selectedItems: Set<string>;
 onSelectItem: (id: string) => void;
 onViewTask: (task: Task) => void;
 onEditTask: (task: Task) => void;
 onDuplicateTask: (task: Task) => void;
 onDeleteTask: (task: Task) => void;
}

type SortField = "title" | "status" | "priority" | "due_date" | "assignee" | "project";
type SortDirection = "asc" | "desc";

export default function TaskListView({
 tasks,
 selectedItems,
 onSelectItem,
 onViewTask,
 onEditTask,
 onDuplicateTask,
 onDeleteTask,
}: TaskListViewProps) {
 const [sortField, setSortField] = useState<SortField>("priority");
 const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
 const [expandedTasks, setExpandedTasks] = useState<Set<string>(new Set());

 // Sort tasks
 const sortedTasks = useMemo(() => {
 return [...tasks].sort((a, b) => {
 let comparison = 0;
 
 switch (sortField) {
 case "title":
 comparison = a.title.localeCompare(b.title);
 break;
 case "status":
 const statusOrder = { todo: 0, in_progress: 1, review: 2, done: 3, blocked: 4 };
 comparison = statusOrder[a.status] - statusOrder[b.status];
 break;
 case "priority":
 const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
 comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
 break;
 case "due_date":
 comparison = (a.due_date || "").localeCompare(b.due_date || "");
 break;
 case "assignee":
 const aName = a.assignee?.full_name || a.assignee?.email || "";
 const bName = b.assignee?.full_name || b.assignee?.email || "";
 comparison = aName.localeCompare(bName);
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

 // Toggle task expansion
 const toggleTaskExpansion = (taskId: string) => {
 setExpandedTasks(prev => {
 const next = new Set(prev);
 if (next.has(taskId)) {
 next.delete(taskId);
 } else {
 next.add(taskId);
 }
 return next;
 });
 };

 // Select all visible tasks
 const selectAll = () => {
 if (selectedItems.size === sortedTasks.length) {
 // Deselect all
 sortedTasks.forEach(task => onSelectItem(task.id));
 } else {
 // Select all
 sortedTasks.forEach(task => {
 if (!selectedItems.has(task.id)) {
 onSelectItem(task.id);
 }
 });
 }
 };

 // Get status badge
 const getStatusBadge = (status: string) => {
 const variant = 
 status === "done" ? "success" :
 status === "in_progress" ? "warning" :
 status === "review" ? "info" :
 status === "blocked" ? "destructive" :
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
 
 return <Badge variant={variant} className="text-xs">{priority}</Badge>;
 };

 // Get days until due
 const getDaysUntil = (dueDate?: string) => {
 if (!dueDate) return null;
 const days = differenceInDays(parseISO(dueDate), new Date());
 
 if (days < 0) {
 return (
 <span className="text-destructive text-xs flex items-center gap-1">
 <AlertCircle className="h-3 w-3" />
 {Math.abs(days)}d overdue
 </span>
 );
 } else if (days === 0) {
 return (
 <span className="text-warning text-xs flex items-center gap-1">
 <Clock className="h-3 w-3" />
 Due today
 </span>
 );
 } else if (days <= 7) {
 return (
 <span className="text-warning text-xs flex items-center gap-1">
 <Clock className="h-3 w-3" />
 {days}d
 </span>
 );
 } else {
 return (
 <span className="text-muted-foreground text-xs">
 {format(parseISO(dueDate), "MMM d")}
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
 className="flex items-center gap-1 hover:text-primary transition-colors"
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
 <div className="w-full">
 {/* Table Header */}
 <div className="border-b bg-muted/30 px-4 py-3">
 <div className="flex items-center gap-4 text-sm font-medium">
 <div className="w-10">
 <Checkbox
 checked={selectedItems.size === sortedTasks.length && sortedTasks.length > 0}
 onChange={selectAll}
 />
 </div>
 <div className="flex-1 min-w-[200px]">
 {renderSortButton("title", "Title")}
 </div>
 <div className="w-28 hidden lg:block">
 {renderSortButton("status", "Status")}
 </div>
 <div className="w-24 hidden md:block">
 {renderSortButton("priority", "Priority")}
 </div>
 <div className="w-32 hidden xl:block">
 {renderSortButton("assignee", "Assignee")}
 </div>
 <div className="w-32 hidden xl:block">
 {renderSortButton("project", "Project")}
 </div>
 <div className="w-28 hidden lg:block">
 {renderSortButton("due_date", "Due Date")}
 </div>
 <div className="w-20 hidden md:block text-center">
 Progress
 </div>
 <div className="w-20 text-center">
 Actions
 </div>
 </div>
 </div>

 {/* Table Body */}
 <div className="divide-y">
 {sortedTasks.map(task => {
 const isExpanded = expandedTasks.has(task.id);
 const hasSubtasks = task.subtasks && task.subtasks.length > 0;
 const completedSubtasks = task.subtasks?.filter(st => st.status === "done").length || 0;
 const totalSubtasks = task.subtasks?.length || 0;
 const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 
 task.status === "done" ? 100 : 
 task.status === "in_progress" ? 50 : 
 task.status === "review" ? 75 : 0;

 return (
 <div key={task.id}>
 <div className="px-4 py-3 hover:bg-muted/30 transition-colors">
 <div className="flex items-center gap-4">
 <div className="w-10">
 <Checkbox
 checked={selectedItems.has(task.id)}
 onChange={() => onSelectItem(task.id)}
 />
 </div>
 
 <div className="flex-1 min-w-[200px]">
 <div className="flex items-center gap-2">
 {hasSubtasks && (
 <button
 onClick={() => toggleTaskExpansion(task.id)}
 className="p-0.5 hover:bg-muted rounded"
 >
 {isExpanded ? (
 <ChevronDown className="h-4 w-4" />
 ) : (
 <ChevronUp className="h-4 w-4" />
 )}
 </button>
 )}
 <div>
 <p className="font-medium line-clamp-1">{task.title}</p>
 {task.description && (
 <p className="text-sm text-muted-foreground line-clamp-1">
 {task.description}
 </p>
 )}
 </div>
 </div>
 </div>

 <div className="w-28 hidden lg:block">
 {getStatusBadge(task.status)}
 </div>

 <div className="w-24 hidden md:block">
 {getPriorityBadge(task.priority)}
 </div>

 <div className="w-32 hidden xl:block">
 {task.assignee ? (
 <div className="flex items-center gap-2">
 {task.assignee.avatar_url ? (
 <Image
 src={task.assignee.avatar_url}
 alt={task.assignee.full_name || task.assignee.email}
 width={24}
 height={24}
 className="h-6 w-6 rounded-full"
 unoptimized
 />
 ) : (
 <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
 <Users className="h-3 w-3" />
 </div>
 )}
 <span className="text-sm truncate">
 {task.assignee.full_name || task.assignee.email}
 </span>
 </div>
 ) : (
 <span className="text-sm text-muted-foreground">Unassigned</span>
 )}
 </div>

 <div className="w-32 hidden xl:block">
 {task.project && (
 <div className="flex items-center gap-1">
 <Briefcase className="h-3 w-3 text-muted-foreground" />
 <span className="text-sm text-muted-foreground truncate">
 {task.project.name}
 </span>
 </div>
 )}
 </div>

 <div className="w-28 hidden lg:block">
 {getDaysUntil(task.due_date)}
 </div>

 <div className="w-20 hidden md:block">
 <div className="flex flex-col items-center gap-1">
 <div className="w-full bg-muted rounded-full h-1.5">
 <div 
 className="bg-primary h-1.5 rounded-full transition-all"
 style={{ width: `${progress}%` }}
 />
 </div>
 <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
 </div>
 </div>

 <div className="w-20 flex justify-center">
 <DropdownMenu>
 <DropdownMenuTrigger asChild>
 <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
 <MoreVertical className="h-4 w-4" />
 </Button>
 </DropdownMenuTrigger>
 <DropdownMenuContent align="end">
 <DropdownMenuItem onClick={() => onViewTask(task)}>
 <Eye className="mr-2 h-4 w-4" />
 View
 </DropdownMenuItem>
 <DropdownMenuItem onClick={() => onEditTask(task)}>
 <Edit className="mr-2 h-4 w-4" />
 Edit
 </DropdownMenuItem>
 <DropdownMenuItem onClick={() => onDuplicateTask(task)}>
 <Copy className="mr-2 h-4 w-4" />
 Duplicate
 </DropdownMenuItem>
 <DropdownMenuItem 
 onClick={() => onDeleteTask(task)}
 className="text-destructive"
 >
 <Trash2 className="mr-2 h-4 w-4" />
 Delete
 </DropdownMenuItem>
 </DropdownMenuContent>
 </DropdownMenu>
 </div>
 </div>

 {/* Tags */}
 {task.tags && task.tags.length > 0 && (
 <div className="flex items-center gap-2 mt-2 ml-14">
 <Tag className="h-3 w-3 text-muted-foreground" />
 {task.tags.map(tag => (
 <Badge key={tag} variant="outline" className="text-xs">
 {tag}
 </Badge>
 ))}
 </div>
 )}
 </div>

 {/* Subtasks */}
 {isExpanded && hasSubtasks && (
 <div className="pl-16 pr-4 pb-2 bg-muted/20">
 {task.subtasks!.map(subtask => (
 <div key={subtask.id} className="flex items-center gap-4 py-2 border-t">
 <ListTodo className="h-4 w-4 text-muted-foreground" />
 <div className="flex-1">
 <p className="text-sm">{subtask.title}</p>
 </div>
 {getStatusBadge(subtask.status)}
 {getPriorityBadge(subtask.priority)}
 {subtask.assignee_id && (
 <Users className="h-4 w-4 text-muted-foreground" />
 )}
 {getDaysUntil(subtask.due_date)}
 </div>
 ))}
 </div>
 )}
 </div>
 );
 })}
 </div>

 {/* Empty State */}
 {sortedTasks.length === 0 && (
 <div className="text-center py-12">
 <ListTodo className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
 <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
 <p className="text-muted-foreground">
 Try adjusting your filters or create a new task
 </p>
 </div>
 )}
 </div>
 );
}
