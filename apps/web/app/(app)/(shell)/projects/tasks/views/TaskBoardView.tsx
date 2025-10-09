"use client";

import { MoreVertical, Clock, Users, Calendar, Tag, AlertCircle, CheckCircle, Eye, Edit, Copy, Trash2, ChevronUp, ChevronDown, Briefcase } from 'lucide-react';
import Image from "next/image";
import { useState, useMemo } from 'react';
import {
  Badge,
  Button,
  Card,
  Checkbox,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@ghxstship/ui";
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

interface TaskBoardViewProps {
 tasks: Task[];
 selectedItems: Set<string>;
 onSelectItem: (id: string) => void;
 onViewTask: (task: Task) => void;
 onEditTask: (task: Task) => void;
 onDuplicateTask: (task: Task) => void;
 onDeleteTask: (task: Task) => void;
}

const BOARD_COLUMNS = [
 { id: "todo", label: "To Do", color: "bg-gray-500" },
 { id: "in_progress", label: "In Progress", color: "bg-blue-500" },
 { id: "review", label: "Review", color: "bg-yellow-500" },
 { id: "done", label: "Done", color: "bg-green-500" },
 { id: "blocked", label: "Blocked", color: "bg-red-500" },
] as const;

export default function TaskBoardView({
 tasks,
 selectedItems,
 onSelectItem,
 onViewTask,
 onEditTask,
 onDuplicateTask,
 onDeleteTask
}: TaskBoardViewProps) {
 const [collapsedColumns, setCollapsedColumns] = useState<Set<string>(new Set());

 // Group tasks by status
 const tasksByStatus = useMemo(() => {
 const grouped: Record<string, Task[]> = {
 todo: [],
 in_progress: [],
 review: [],
 done: [],
 blocked: []
 };

 tasks.forEach(task => {
 if (grouped[task.status]) {
 grouped[task.status].push(task);
 }
 });

 // Sort tasks within each column by priority and due date
 Object.keys(grouped).forEach(status => {
 grouped[status].sort((a, b) => {
 // Priority order: critical > high > medium > low
 const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
 const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
 if (priorityDiff !== 0) return priorityDiff;

 // Then by due date (earliest first)
 if (a.due_date && b.due_date) {
 return a.due_date.localeCompare(b.due_date);
 }
 if (a.due_date) return -1;
 if (b.due_date) return 1;

 // Finally by creation date
 return b.created_at.localeCompare(a.created_at);
 });
 });

 return grouped;
 }, [tasks]);

 // Toggle column collapse
 const toggleColumn = (columnId: string) => {
 setCollapsedColumns(prev => {
 const next = new Set(prev);
 if (next.has(columnId)) {
 next.delete(columnId);
 } else {
 next.add(columnId);
 }
 return next;
 });
 };

 // Get priority badge variant
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
 } else if (days <= 3) {
 return (
 <span className="text-warning text-xs flex items-center gap-xs">
 <Clock className="h-3 w-3" />
 {days}d left
 </span>
 );
 } else {
 return (
 <span className="text-muted-foreground text-xs flex items-center gap-xs">
 <Calendar className="h-3 w-3" />
 {format(parseISO(dueDate), "MMM d")}
 </span>
 );
 }
 };

 // Render task card
 const renderTaskCard = (task: Task) => {
 const isSelected = selectedItems.has(task.id);

 return (
 <Card
 key={task.id}
 className={`p-sm cursor-pointer transition-all hover:shadow-md ${
 isSelected ? "ring-2 ring-primary" : ""
 }`}
 onClick={() => onViewTask(task)}
 >
 <div className="space-y-xs">
 {/* Header */}
 <div className="flex items-start justify-between">
 <div className="flex items-start gap-xs flex-1">
 <Checkbox
 checked={isSelected}
 onChange={() => onSelectItem(task.id)}
 onClick={(e) => e.stopPropagation()}
 />
 <div className="flex-1 min-w-0">
 <h4 className="font-medium text-sm line-clamp-xs">{task.title}</h4>
 {task.project && (
 <div className="flex items-center gap-xs mt-1">
 <Briefcase className="h-3 w-3 text-muted-foreground" />
 <span className="text-xs text-muted-foreground truncate">
 {task.project.name}
 </span>
 </div>
 )}
 </div>
 </div>
 <DropdownMenu>
 <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
 <Button variant="ghost" size="sm" className="h-icon-md w-icon-md p-0">
 <MoreVertical className="h-icon-xs w-icon-xs" />
 </Button>
 </DropdownMenuTrigger>
 <DropdownMenuContent align="end">
 <DropdownMenuItem onClick={(e) => {
 e.stopPropagation();
 onViewTask(task);
 }}>
 <Eye className="mr-2 h-icon-xs w-icon-xs" />
 View
 </DropdownMenuItem>
 <DropdownMenuItem onClick={(e) => {
 e.stopPropagation();
 onEditTask(task);
 }}>
 <Edit className="mr-2 h-icon-xs w-icon-xs" />
 Edit
 </DropdownMenuItem>
 <DropdownMenuItem onClick={(e) => {
 e.stopPropagation();
 onDuplicateTask(task);
 }}>
 <Copy className="mr-2 h-icon-xs w-icon-xs" />
 Duplicate
 </DropdownMenuItem>
 <DropdownMenuItem 
 onClick={(e) => {
 e.stopPropagation();
 onDeleteTask(task);
 }}
 className="text-destructive"
 >
 <Trash2 className="mr-2 h-icon-xs w-icon-xs" />
 Delete
 </DropdownMenuItem>
 </DropdownMenuContent>
 </DropdownMenu>
 </div>

 {/* Description */}
 {task.description && (
 <p className="text-xs text-muted-foreground line-clamp-xs">
 {task.description}
 </p>
 )}

 {/* Priority and Due Date */}
 <div className="flex items-center justify-between">
 {getPriorityBadge(task.priority)}
 {getDaysUntil(task.due_date)}
 </div>

 {/* Tags */}
 {task.tags && task.tags.length > 0 && (
 <div className="flex items-center gap-xs flex-wrap">
 <Tag className="h-3 w-3 text-muted-foreground" />
 {task.tags.slice(0, 2).map(tag => (
 <Badge key={tag} variant="outline" className="text-xs px-xs py-0">
 {tag}
 </Badge>
 ))}
 {task.tags.length > 2 && (
 <span className="text-xs text-muted-foreground">
 +{task.tags.length - 2}
 </span>
 )}
 </div>
 )}

 {/* Footer */}
 <div className="flex items-center justify-between pt-2 border-t">
 {/* Assignee */}
 {task.assignee ? (
 <div className="flex items-center gap-xs">
 {task.assignee.avatar_url ? (
 <Image
 src={task.assignee.avatar_url}
 alt={task.assignee.full_name || task.assignee.email}
 width={20}
 height={20}
 className="h-icon-sm w-icon-sm rounded-full"
 unoptimized
 />
 ) : (
 <div className="h-icon-sm w-icon-sm rounded-full bg-muted flex items-center justify-center">
 <Users className="h-3 w-3" />
 </div>
 )}
 <span className="text-xs text-muted-foreground truncate max-w-component-lg">
 {task.assignee.full_name || task.assignee.email}
 </span>
 </div>
 ) : (
 <span className="text-xs text-muted-foreground">Unassigned</span>
 )}

 {/* Subtasks */}
 {task.subtasks && task.subtasks.length > 0 && (
 <div className="flex items-center gap-xs text-xs text-muted-foreground">
 <CheckCircle className="h-3 w-3" />
 {task.subtasks.filter(st => st.status === "done").length}/{task.subtasks.length}
 </div>
 )}

 {/* Time tracking */}
 {(task.estimated_hours || task.actual_hours) && (
 <div className="flex items-center gap-xs text-xs text-muted-foreground">
 <Clock className="h-3 w-3" />
 {task.actual_hours || 0}/{task.estimated_hours || 0}h
 </div>
 )}
 </div>
 </div>
 </Card>
 );
 };

 return (
 <div className="flex gap-md overflow-x-auto pb-4">
 {BOARD_COLUMNS.map(column => {
 const columnTasks = tasksByStatus[column.id] || [];
 const isCollapsed = collapsedColumns.has(column.id);

 return (
 <div
 key={column.id}
 className={`flex-shrink-0 ${isCollapsed ? "w-component-md" : "w-container-md"} transition-all`}
 >
 {/* Column Header */}
 <div
 className={`flex items-center justify-between p-sm mb-3 rounded-lg ${column.color} bg-opacity-10 cursor-pointer`}
 onClick={() => toggleColumn(column.id)}
 >
 <div className="flex items-center gap-xs">
 <div className={`w-2 h-2 rounded-full ${column.color}`} />
 <h3 className={`font-medium ${isCollapsed ? "sr-only" : ""}`}>
 {column.label}
 </h3>
 <Badge variant="secondary" className="text-xs">
 {columnTasks.length}
 </Badge>
 </div>
 {isCollapsed ? (
 <ChevronDown className="h-icon-xs w-icon-xs" />
 ) : (
 <ChevronUp className="h-icon-xs w-icon-xs" />
 )}
 </div>

 {/* Column Tasks */}
 {!isCollapsed && (
 <div className="space-y-sm max-h-screen-minus-xl overflow-y-auto">
 {columnTasks.length === 0 ? (
 <div className="text-center py-xl text-muted-foreground">
 <p className="text-sm">No tasks</p>
 </div>
 ) : (
 columnTasks.map(renderTaskCard)
 )}
 </div>
 )}
 </div>
 );
 })}
 </div>
 );
}
