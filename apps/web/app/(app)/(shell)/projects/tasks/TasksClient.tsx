"use client";

import { ListTodo, LayoutGrid, Calendar, Activity, Search, Filter, Download, Upload, Plus, Edit, Trash2, Eye, Copy, Clock, CheckCircle, AlertCircle, Users, MoreVertical, ArrowUpDown, ChevronDown, Tag, TrendingUp, AlertTriangle, Briefcase, Target } from "lucide-react";
import { useState, useCallback, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@ghxstship/auth";
import {
 Card,
 Button,
 Badge,
 Input,
 Select,
 Checkbox,
 Progress,
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuTrigger,
 toast,
} from "@ghxstship/ui";
import { format, parseISO, differenceInDays, isOverdue, startOfWeek, endOfWeek } from "date-fns";
import CreateTaskDrawer from "./drawers/CreateTaskDrawer";
import EditTaskDrawer from "./drawers/EditTaskDrawer";
import ViewTaskDrawer from "./drawers/ViewTaskDrawer";
import TaskBoardView from "./views/TaskBoardView";
import TaskListView from "./views/TaskListView";
import TaskCalendarView from "./views/TaskCalendarView";
import TaskTimelineView from "./views/TaskTimelineView";

// Types
export interface Project {
 id: string;
 name: string;
 status: string;
}

export interface User {
 id: string;
 email: string;
 full_name?: string;
 avatar_url?: string;
}

export interface Task {
 id: string;
 project_id: string;
 organization_id: string;
 project?: Project;
 title: string;
 description?: string;
 status: "todo" | "in_progress" | "review" | "done" | "blocked";
 priority: "low" | "medium" | "high" | "critical";
 assignee_id?: string;
 assignee?: User;
 reporter_id?: string;
 reporter?: User;
 parent_task_id?: string;
 parent_task?: Task;
 subtasks?: Task[];
 estimated_hours?: number;
 actual_hours?: number;
 start_date?: string;
 due_date?: string;
 completed_at?: string;
 tags?: string[];
 dependencies?: string[];
 attachments?: string[];
 position: number;
 created_at: string;
 updated_at: string;
 created_by?: string;
 updated_by?: string;
}

interface TasksClientProps {
 orgId: string;
 projectId?: string;
 initialTasks?: Task[];
 projects?: Project[];
 users?: User[];
}

// View configurations
const VIEW_TYPES = [
 { id: "board", label: "Board", icon: LayoutGrid },
 { id: "list", label: "List", icon: ListTodo },
 { id: "calendar", label: "Calendar", icon: Calendar },
 { id: "timeline", label: "Timeline", icon: Activity },
] as const;

type ViewType = typeof VIEW_TYPES[number]["id"];

export default function TasksClient({
 orgId,
 projectId,
 initialTasks = [],
 projects = [],
 users = [],
}: TasksClientProps) {
 const router = useRouter();
 const supabase = createBrowserClient();

 // State
 const [tasks, setTasks] = useState<Task[]>(initialTasks);
 const [loading, setLoading] = useState(false);
 const [viewType, setViewType] = useState<ViewType>("board");
 const [searchQuery, setSearchQuery] = useState("");
 const [selectedProject, setSelectedProject] = useState<string>(projectId || "all");
 const [selectedStatus, setSelectedStatus] = useState<string>("all");
 const [selectedPriority, setSelectedPriority] = useState<string>("all");
 const [selectedAssignee, setSelectedAssignee] = useState<string>("all");
 const [selectedTags, setSelectedTags] = useState<string[]>([]);
 const [selectedItems, setSelectedItems] = useState<Set<string>(new Set());
 const [showSubtasks, setShowSubtasks] = useState(true);
 const [showCompleted, setShowCompleted] = useState(true);

 // Drawers
 const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
 const [editDrawerOpen, setEditDrawerOpen] = useState(false);
 const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
 const [selectedTask, setSelectedTask] = useState<Task | null>(null);

 // Load tasks from Supabase
 const loadTasks = useCallback(async () => {
 setLoading(true);
 try {
 let query = supabase
 .from("project_tasks")
 .select(`
 *,
 project:projects(id, name, status),
 assignee:users!project_tasks_assignee_id_fkey(id, email, full_name, avatar_url),
 reporter:users!project_tasks_reporter_id_fkey(id, email, full_name, avatar_url),
 parent_task:project_tasks!parent_task_id(id, title, status),
 subtasks:project_tasks!parent_task_id(
 id, title, status, priority, assignee_id, due_date
 )
 `)
 .eq("organization_id", orgId);

 // Apply project filter
 if (projectId) {
 query = query.eq("project_id", projectId);
 } else if (selectedProject !== "all") {
 query = query.eq("project_id", selectedProject);
 }

 // Apply status filter
 if (!showCompleted) {
 query = query.neq("status", "done");
 }

 // Order by position and creation date
 query = query.order("position", { ascending: true })
 .order("created_at", { ascending: false });

 const { data, error } = await query;

 if (error) throw error;

 setTasks(data || []);
 } catch (error) {
 console.error("Error loading tasks:", error);
 toast.error("Failed to load tasks");
 } finally {
 setLoading(false);
 }
 }, [supabase, orgId, projectId, selectedProject, showCompleted]);

 // Load tasks on mount and when filters change
 useEffect(() => {
 loadTasks();
 }, [loadTasks]);

 // Real-time subscriptions
 useEffect(() => {
 const channel = supabase
 .channel("tasks-changes")
 .on(
 "postgres_changes",
 {
 event: "*",
 schema: "public",
 table: "project_tasks",
 filter: `organization_id=eq.${orgId}`,
 },
 () => {
 loadTasks();
 }
 )
 .subscribe();

 return () => {
 supabase.removeChannel(channel);
 };
 }, [supabase, orgId, loadTasks]);

 // Filter tasks
 const filteredTasks = useMemo(() => {
 return tasks.filter(task => {
 // Don't show subtasks at root level if showSubtasks is false
 if (!showSubtasks && task.parent_task_id) {
 return false;
 }

 // Search filter
 if (searchQuery) {
 const query = searchQuery.toLowerCase();
 const matchesSearch = 
 task.title.toLowerCase().includes(query) ||
 task.description?.toLowerCase().includes(query) ||
 task.tags?.some(tag => tag.toLowerCase().includes(query));
 if (!matchesSearch) return false;
 }

 // Status filter
 if (selectedStatus !== "all" && task.status !== selectedStatus) {
 return false;
 }

 // Priority filter
 if (selectedPriority !== "all" && task.priority !== selectedPriority) {
 return false;
 }

 // Assignee filter
 if (selectedAssignee !== "all") {
 if (selectedAssignee === "unassigned" && task.assignee_id) return false;
 if (selectedAssignee !== "unassigned" && task.assignee_id !== selectedAssignee) return false;
 }

 // Tag filter
 if (selectedTags.length > 0) {
 if (!task.tags || !selectedTags.every(tag => task.tags!.includes(tag))) {
 return false;
 }
 }

 return true;
 });
 }, [tasks, searchQuery, selectedStatus, selectedPriority, selectedAssignee, selectedTags, showSubtasks]);

 // Get all unique tags
 const allTags = useMemo(() => {
 const tags = new Set<string>();
 tasks.forEach(task => {
 task.tags?.forEach(tag => tags.add(tag));
 });
 return Array.from(tags).sort();
 }, [tasks]);

 // Calculate statistics
 const statistics = useMemo(() => {
 const stats = {
 total: filteredTasks.length,
 todo: 0,
 inProgress: 0,
 review: 0,
 done: 0,
 blocked: 0,
 overdue: 0,
 dueThisWeek: 0,
 critical: 0,
 high: 0,
 unassigned: 0,
 withSubtasks: 0,
 };

 const today = new Date();
 const weekStart = startOfWeek(today);
 const weekEnd = endOfWeek(today);

 filteredTasks.forEach(task => {
 // Status counts
 switch (task.status) {
 case "todo": stats.todo++; break;
 case "in_progress": stats.inProgress++; break;
 case "review": stats.review++; break;
 case "done": stats.done++; break;
 case "blocked": stats.blocked++; break;
 }

 // Priority counts
 if (task.priority === "critical") stats.critical++;
 if (task.priority === "high") stats.high++;

 // Assignment
 if (!task.assignee_id) stats.unassigned++;

 // Subtasks
 if (task.subtasks && task.subtasks.length > 0) stats.withSubtasks++;

 // Due dates
 if (task.due_date) {
 const dueDate = parseISO(task.due_date);
 if (dueDate < today && task.status !== "done") {
 stats.overdue++;
 }
 if (dueDate >= weekStart && dueDate <= weekEnd) {
 stats.dueThisWeek++;
 }
 }
 });

 return stats;
 }, [filteredTasks]);

 // Handle actions
 const handleCreateTask = useCallback(() => {
 setSelectedTask(null);
 setCreateDrawerOpen(true);
 }, []);

 const handleViewTask = useCallback((task: Task) => {
 setSelectedTask(task);
 setViewDrawerOpen(true);
 }, []);

 const handleEditTask = useCallback((task: Task) => {
 setSelectedTask(task);
 setEditDrawerOpen(true);
 }, []);

 const handleDuplicateTask = useCallback(async (task: Task) => {
 try {
 const { data, error } = await supabase
 .from("project_tasks")
 .insert({
 organization_id: task.organization_id,
 project_id: task.project_id,
 title: `${task.title} (Copy)`,
 description: task.description,
 status: "todo",
 priority: task.priority,
 assignee_id: task.assignee_id,
 estimated_hours: task.estimated_hours,
 tags: task.tags,
 position: task.position + 1,
 })
 .select()
 .single();

 if (error) throw error;

 toast.success("Task duplicated successfully");
 loadTasks();
 } catch (error) {
 console.error("Error duplicating task:", error);
 toast.error("Failed to duplicate task");
 }
 }, [supabase, loadTasks]);

 const handleDeleteTask = useCallback(async (task: Task) => {
 if (!confirm(`Are you sure you want to delete "${task.title}"?`)) return;

 try {
 const { error } = await supabase
 .from("project_tasks")
 .delete()
 .eq("id", task.id);

 if (error) throw error;

 toast.success("Task deleted successfully");
 loadTasks();
 } catch (error) {
 console.error("Error deleting task:", error);
 toast.error("Failed to delete task");
 }
 }, [supabase, loadTasks]);

 // Bulk actions
 const handleSelectAll = useCallback(() => {
 if (selectedItems.size === filteredTasks.length) {
 setSelectedItems(new Set());
 } else {
 setSelectedItems(new Set(filteredTasks.map(t => t.id)));
 }
 }, [filteredTasks, selectedItems]);

 const handleBulkDelete = useCallback(async () => {
 if (selectedItems.size === 0) return;
 
 if (!confirm(`Are you sure you want to delete ${selectedItems.size} tasks?`)) return;

 try {
 const { error } = await supabase
 .from("project_tasks")
 .delete()
 .in("id", Array.from(selectedItems));

 if (error) throw error;

 toast.success(`${selectedItems.size} tasks deleted successfully`);
 setSelectedItems(new Set());
 loadTasks();
 } catch (error) {
 console.error("Error deleting tasks:", error);
 toast.error("Failed to delete tasks");
 }
 }, [supabase, selectedItems, loadTasks]);

 const handleBulkExport = useCallback(() => {
 const selectedTasks = filteredTasks.filter(t => selectedItems.has(t.id));
 const dataToExport = selectedItems.size > 0 ? selectedTasks : filteredTasks;
 
 const csv = convertToCSV(dataToExport);
 downloadCSV(csv, "tasks.csv");
 }, [filteredTasks, selectedItems]);

 // Helper functions for export
 const convertToCSV = (tasks: Task[]) => {
 const headers = ["Title", "Status", "Priority", "Assignee", "Project", "Due Date", "Tags"];
 const rows = tasks.map(task => [
 task.title,
 task.status,
 task.priority,
 task.assignee?.full_name || task.assignee?.email || "Unassigned",
 task.project?.name || "",
 task.due_date ? format(parseISO(task.due_date), "yyyy-MM-dd") : "",
 task.tags?.join(", ") || "",
 ]);
 return [headers, ...rows].map(row => row.join(",")).join("\n");
 };

 const downloadCSV = (csv: string, filename: string) => {
 const blob = new Blob([csv], { type: "text/csv" });
 const url = window.URL.createObjectURL(blob);
 const a = document.createElement("a");
 a.href = url;
 a.download = filename;
 a.click();
 window.URL.revokeObjectURL(url);
 };

 // Get status color
 const getStatusColor = (status: string) => {
 switch (status) {
 case "done": return "text-success";
 case "in_progress": return "text-info";
 case "review": return "text-warning";
 case "blocked": return "text-destructive";
 default: return "text-muted-foreground";
 }
 };

 // Get priority color
 const getPriorityColor = (priority: string) => {
 switch (priority) {
 case "critical": return "text-destructive";
 case "high": return "text-warning";
 case "medium": return "text-info";
 default: return "text-muted-foreground";
 }
 };

 return (
 <div className="space-y-md">
 {/* Header */}
 <Card className="p-lg">
 <div className="flex items-center justify-between mb-md">
 <div>
 <h1 className="text-2xl font-bold">Tasks</h1>
 <p className="text-muted-foreground">
 Manage and track project tasks
 </p>
 </div>
 <Button onClick={handleCreateTask}>
 <Plus className="mr-2 h-icon-xs w-icon-xs" />
 Create Task
 </Button>
 </div>

 {/* Statistics Cards */}
 <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-md mb-md">
 <Card className="p-sm">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-muted-foreground">Total</p>
 <p className="text-2xl font-bold">{statistics.total}</p>
 </div>
 <ListTodo className="h-icon-lg w-icon-lg text-muted-foreground" />
 </div>
 </Card>
 <Card className="p-sm">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-muted-foreground">In Progress</p>
 <p className="text-2xl font-bold text-info">{statistics.inProgress}</p>
 </div>
 <Clock className="h-icon-lg w-icon-lg text-info" />
 </div>
 </Card>
 <Card className="p-sm">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-muted-foreground">Review</p>
 <p className="text-2xl font-bold text-warning">{statistics.review}</p>
 </div>
 <Eye className="h-icon-lg w-icon-lg text-warning" />
 </div>
 </Card>
 <Card className="p-sm">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-muted-foreground">Completed</p>
 <p className="text-2xl font-bold text-success">{statistics.done}</p>
 </div>
 <CheckCircle className="h-icon-lg w-icon-lg text-success" />
 </div>
 </Card>
 <Card className="p-sm">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-muted-foreground">Overdue</p>
 <p className="text-2xl font-bold text-destructive">{statistics.overdue}</p>
 </div>
 <AlertTriangle className="h-icon-lg w-icon-lg text-destructive" />
 </div>
 </Card>
 <Card className="p-sm">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-muted-foreground">Critical</p>
 <p className="text-2xl font-bold text-destructive">{statistics.critical}</p>
 </div>
 <AlertCircle className="h-icon-lg w-icon-lg text-destructive" />
 </div>
 </Card>
 </div>

 {/* Filters and View Switcher */}
 <div className="flex flex-col lg:flex-row gap-md">
 <div className="flex-1 flex flex-wrap gap-sm">
 <div className="relative flex-1 min-w-content-narrow">
 <Search className="absolute left-3 top-xs/2 transform -translate-y-1/2 h-icon-xs w-icon-xs text-muted-foreground" />
 <Input
 placeholder="Search tasks..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="pl-9"
 />
 </div>
 
 {!projectId && projects.length > 0 && (
 <Select value={selectedProject} onValueChange={setSelectedProject}>
 <option value="all">All Projects</option>
 {projects.map((project) => (
 <option key={project.id} value={project.id}>
 {project.name}
 </option>
 ))}
 </Select>
 )}

 <Select value={selectedStatus} onValueChange={setSelectedStatus}>
 <option value="all">All Status</option>
 <option value="todo">To Do</option>
 <option value="in_progress">In Progress</option>
 <option value="review">Review</option>
 <option value="done">Done</option>
 <option value="blocked">Blocked</option>
 </Select>

 <Select value={selectedPriority} onValueChange={setSelectedPriority}>
 <option value="all">All Priorities</option>
 <option value="critical">Critical</option>
 <option value="high">High</option>
 <option value="medium">Medium</option>
 <option value="low">Low</option>
 </Select>

 {users.length > 0 && (
 <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
 <option value="all">All Assignees</option>
 <option value="unassigned">Unassigned</option>
 {users.map((user) => (
 <option key={user.id} value={user.id}>
 {user.full_name || user.email}
 </option>
 ))}
 </Select>
 )}

 {allTags.length > 0 && (
 <DropdownMenu>
 <DropdownMenuTrigger asChild>
 <Button variant="outline" size="sm">
 <Tag className="mr-2 h-icon-xs w-icon-xs" />
 Tags ({selectedTags.length})
 <ChevronDown className="ml-2 h-icon-xs w-icon-xs" />
 </Button>
 </DropdownMenuTrigger>
 <DropdownMenuContent>
 {allTags.map((tag) => (
 <DropdownMenuItem key={tag}>
 <Checkbox
 checked={selectedTags.includes(tag)}
 onChange={(e) => {
 if (e.target.checked) {
 setSelectedTags([...selectedTags, tag]);
 } else {
 setSelectedTags(selectedTags.filter(t => t !== tag));
 }
 }}
 label={tag}
 />
 </DropdownMenuItem>
 ))}
 </DropdownMenuContent>
 </DropdownMenu>
 )}

 <Checkbox
 checked={showSubtasks}
 onChange={(e) => setShowSubtasks(e.target.checked)}
 
 />

 <Checkbox
 checked={showCompleted}
 onChange={(e) => setShowCompleted(e.target.checked)}
 
 />
 </div>

 {/* View Switcher and Actions */}
 <div className="flex items-center gap-sm">
 {selectedItems.size > 0 && (
 <>
 <Button
 variant="outline"
 size="sm"
 onClick={handleBulkDelete}
 >
 <Trash2 className="mr-2 h-icon-xs w-icon-xs" />
 Delete ({selectedItems.size})
 </Button>
 <Button
 variant="outline"
 size="sm"
 onClick={handleBulkExport}
 >
 <Download className="mr-2 h-icon-xs w-icon-xs" />
 Export
 </Button>
 </>
 )}

 <Button
 variant="outline"
 size="sm"
 onClick={handleSelectAll}
 >
 {selectedItems.size === filteredTasks.length ? "Deselect All" : "Select All"}
 </Button>

 <div className="flex rounded-md shadow-sm">
 {VIEW_TYPES.map((view) => {
 const Icon = view.icon;
 return (
 <Button
 key={view.id}
 variant={viewType === view.id ? "default" : "outline"}
 size="sm"
 onClick={() => setViewType(view.id as ViewType)}
 className="rounded-none first:rounded-l-md last:rounded-r-md"
 >
 <Icon className="h-icon-xs w-icon-xs" />
 </Button>
 );
 })}
 </div>
 </div>
 </div>
 </Card>

 {/* Content Views */}
 <Card className="p-lg">
 {loading ? (
 <div className="flex items-center justify-center py-xl">
 <div className="animate-spin rounded-full h-icon-lg w-icon-lg border-b-2 border-primary"></div>
 </div>
 ) : filteredTasks.length === 0 ? (
 <div className="text-center py-xl">
 <ListTodo className="mx-auto h-icon-2xl w-icon-2xl text-muted-foreground mb-md" />
 <h3 className="text-lg font-semibold mb-sm">No tasks found</h3>
 <p className="text-muted-foreground mb-md">
 {searchQuery || selectedStatus !== "all" || selectedPriority !== "all"
 ? "Try adjusting your filters"
 : "Get started by creating your first task"}
 </p>
 <Button onClick={handleCreateTask}>
 <Plus className="mr-2 h-icon-xs w-icon-xs" />
 Create Task
 </Button>
 </div>
 ) : (
 <>
 {viewType === "board" && (
 <TaskBoardView
 tasks={filteredTasks}
 selectedItems={selectedItems}
 onSelectItem={(id) => {
 const next = new Set(selectedItems);
 if (next.has(id)) {
 next.delete(id);
 } else {
 next.add(id);
 }
 setSelectedItems(next);
 }}
 onViewTask={handleViewTask}
 onEditTask={handleEditTask}
 onDuplicateTask={handleDuplicateTask}
 onDeleteTask={handleDeleteTask}
 />
 )}
 {viewType === "list" && (
 <TaskListView
 tasks={filteredTasks}
 selectedItems={selectedItems}
 onSelectItem={(id) => {
 const next = new Set(selectedItems);
 if (next.has(id)) {
 next.delete(id);
 } else {
 next.add(id);
 }
 setSelectedItems(next);
 }}
 onViewTask={handleViewTask}
 onEditTask={handleEditTask}
 onDuplicateTask={handleDuplicateTask}
 onDeleteTask={handleDeleteTask}
 />
 )}
 {viewType === "calendar" && (
 <TaskCalendarView
 tasks={filteredTasks}
 onViewTask={handleViewTask}
 onEditTask={handleEditTask}
 />
 )}
 {viewType === "timeline" && (
 <TaskTimelineView
 tasks={filteredTasks}
 onViewTask={handleViewTask}
 onEditTask={handleEditTask}
 />
 )}
 </>
 )}
 </Card>

 {/* Drawers */}
 <CreateTaskDrawer
 open={createDrawerOpen}
 onClose={() => setCreateDrawerOpen(false)}
 orgId={orgId}
 projectId={projectId}
 projects={projects}
 users={users}
 onSuccess={loadTasks}
 />
 
 {selectedTask && (
 <>
 <EditTaskDrawer
 open={editDrawerOpen}
 onClose={() => setEditDrawerOpen(false)}
 task={selectedTask}
 projects={projects}
 users={users}
 onSuccess={loadTasks}
 />
 
 <ViewTaskDrawer
 open={viewDrawerOpen}
 onClose={() => setViewDrawerOpen(false)}
 task={selectedTask}
 onEdit={() => {
 setViewDrawerOpen(false);
 setEditDrawerOpen(true);
 }}
 />
 </>
 )}
 </div>
 );
}
