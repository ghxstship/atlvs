"use client";

import { Grid3x3, LayoutGrid, Calendar, List, Search, Filter, Download, Upload, MoreVertical, Plus, Edit, Trash2, Eye, Copy, CheckCircle, Clock, Play, Rocket, DollarSign, Building, MapPin, ArrowUpDown, Columns } from "lucide-react";
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
 Tabs,
 TabsList,
 TabsTrigger,
 TabsContent,
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuTrigger,
 toast,
} from "@ghxstship/ui";
import { format, parseISO } from "date-fns";
import CreateActivationDrawer from "./drawers/CreateActivationDrawer";
import EditActivationDrawer from "./drawers/EditActivationDrawer";
import ViewActivationDrawer from "./drawers/ViewActivationDrawer";
import ActivationGridView from "./views/ActivationGridView";
import ActivationKanbanView from "./views/ActivationKanbanView";
import ActivationCalendarView from "./views/ActivationCalendarView";
import ActivationListView from "./views/ActivationListView";

// Types
export interface Activation {
 id: string;
 name: string;
 description?: string;
 status: "planning" | "ready" | "active" | "completed" | "cancelled";
 activation_type: "soft_launch" | "beta" | "full_launch" | "pilot" | "rollout";
 project_id?: string;
 project?: {
 id: string;
 name: string;
 status: string;
 };
 scheduled_date?: string;
 actual_date?: string;
 completion_date?: string;
 location?: string;
 budget?: number;
 actual_cost?: number;
 success_metrics?: Record<string, unknown>;
 stakeholders?: string[];
 dependencies?: string[];
 risks?: string[];
 notes?: string;
 created_at: string;
 updated_at: string;
 organization_id: string;
}

interface ActivationsClientProps {
 orgId: string;
 initialActivations?: Activation[];
 projects?: Array<{ id: string; name: string }>;
}

// View configurations
const VIEW_TYPES = [
 { id: "grid", label: "Grid", icon: Grid3x3 },
 { id: "kanban", label: "Kanban", icon: LayoutGrid },
 { id: "calendar", label: "Calendar", icon: Calendar },
 { id: "list", label: "List", icon: List },
] as const;

type ViewType = typeof VIEW_TYPES[number]["id"];

// Field configuration
export const FIELD_CONFIG = [
 { id: "name", label: "Name", visible: true, sortable: true },
 { id: "status", label: "Status", visible: true, sortable: true },
 { id: "activation_type", label: "Type", visible: true, sortable: true },
 { id: "project", label: "Project", visible: true, sortable: true },
 { id: "scheduled_date", label: "Scheduled Date", visible: true, sortable: true },
 { id: "actual_date", label: "Actual Date", visible: false, sortable: true },
 { id: "completion_date", label: "Completion Date", visible: false, sortable: true },
 { id: "location", label: "Location", visible: true, sortable: false },
 { id: "budget", label: "Budget", visible: true, sortable: true },
 { id: "actual_cost", label: "Actual Cost", visible: false, sortable: true },
 { id: "created_at", label: "Created", visible: false, sortable: true },
 { id: "updated_at", label: "Updated", visible: false, sortable: true },
];

export default function ActivationsClient({
 orgId,
 initialActivations = [],
 projects = [],
}: ActivationsClientProps) {
 const router = useRouter();
 const supabase = createBrowserClient();

 // State
 const [activations, setActivations] = useState<Activation[]>(initialActivations);
 const [loading, setLoading] = useState(false);
 const [viewType, setViewType] = useState<ViewType>("grid");
 const [searchQuery, setSearchQuery] = useState("");
 const [selectedStatus, setSelectedStatus] = useState<string>("all");
 const [selectedType, setSelectedType] = useState<string>("all");
 const [selectedProject, setSelectedProject] = useState<string>("all");
 const [sortField, setSortField] = useState<string>("scheduled_date");
 const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
 const [selectedActivations, setSelectedActivations] = useState<Set<string>(new Set());
 const [fieldVisibility, setFieldVisibility] = useState(FIELD_CONFIG);

 // Drawers
 const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
 const [editDrawerOpen, setEditDrawerOpen] = useState(false);
 const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
 const [selectedActivation, setSelectedActivation] = useState<Activation | null>(null);

 // Load activations from Supabase
 const loadActivations = useCallback(async () => {
 setLoading(true);
 try {
 const query = supabase
 .from("project_activations")
 .select(`
 *,
 project:projects(id, name, status)
 `)
 .eq("organization_id", orgId)
 .order(sortField, { ascending: sortDirection === "asc" });

 // Apply filters
 if (selectedStatus !== "all") {
 query.eq("status", selectedStatus);
 }
 if (selectedType !== "all") {
 query.eq("activation_type", selectedType);
 }
 if (selectedProject !== "all") {
 query.eq("project_id", selectedProject);
 }

 const { data, error } = await query;

 if (error) throw error;
 setActivations(data || []);
 } catch (error) {
 console.error("Error loading activations:", error);
 toast.error("Failed to load activations");
 } finally {
 setLoading(false);
 }
 }, [supabase, orgId, selectedStatus, selectedType, selectedProject, sortField, sortDirection]);

 // Load activations on mount and when filters change
 useEffect(() => {
 loadActivations();
 }, [loadActivations]);

 // Real-time subscription
 useEffect(() => {
 const channel = supabase
 .channel("activations-changes")
 .on(
 "postgres_changes",
 {
 event: "*",
 schema: "public",
 table: "project_activations",
 filter: `organization_id=eq.${orgId}`,
 },
 (payload) => {
 loadActivations();
 }
 )
 .subscribe();

 return () => {
 supabase.removeChannel(channel);
 };
 }, [supabase, orgId, loadActivations]);

 // Filter activations based on search
 const filteredActivations = useMemo(() => {
 return activations.filter((activation) => {
 if (searchQuery) {
 const query = searchQuery.toLowerCase();
 return (
 activation.name.toLowerCase().includes(query) ||
 activation.description?.toLowerCase().includes(query) ||
 activation.location?.toLowerCase().includes(query) ||
 activation.project?.name.toLowerCase().includes(query)
 );
 }
 return true;
 });
 }, [activations, searchQuery]);

 // Sort activations
 const sortedActivations = useMemo(() => {
 return [...filteredActivations].sort((a, b) => {
 let aVal: unknown = a[sortField as keyof Activation];
 let bVal: unknown = b[sortField as keyof Activation];

 // Handle nested project field
 if (sortField === "project") {
 aVal = a.project?.name || "";
 bVal = b.project?.name || "";
 }

 // Handle dates
 if (sortField.includes("date") || sortField.includes("_at")) {
 aVal = aVal ? new Date(aVal).getTime() : 0;
 bVal = bVal ? new Date(bVal).getTime() : 0;
 }

 // Handle numbers
 if (typeof aVal === "number" && typeof bVal === "number") {
 return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
 }

 // Handle strings
 const aStr = String(aVal || "").toLowerCase();
 const bStr = String(bVal || "").toLowerCase();
 return sortDirection === "asc" 
 ? aStr.localeCompare(bStr)
 : bStr.localeCompare(aStr);
 });
 }, [filteredActivations, sortField, sortDirection]);

 // Handle selection
 const handleSelectAll = useCallback(() => {
 if (selectedActivations.size === sortedActivations.length) {
 setSelectedActivations(new Set());
 } else {
 setSelectedActivations(new Set(sortedActivations.map((a) => a.id)));
 }
 }, [selectedActivations, sortedActivations]);

 const handleSelectActivation = useCallback((id: string) => {
 setSelectedActivations((prev: unknown) => {
 const next = new Set(prev);
 if (next.has(id)) {
 next.delete(id);
 } else {
 next.add(id);
 }
 return next;
 });
 }, []);

 // Handle actions
 const handleView = useCallback((activation: Activation) => {
 setSelectedActivation(activation);
 setViewDrawerOpen(true);
 }, []);

 const handleEdit = useCallback((activation: Activation) => {
 setSelectedActivation(activation);
 setEditDrawerOpen(true);
 }, []);

 const handleDelete = useCallback(async (activation: Activation) => {
 if (!confirm(`Are you sure you want to delete "${activation.name}"?`)) return;

 try {
 const { error } = await supabase
 .from("project_activations")
 .delete()
 .eq("id", activation.id);

 if (error) throw error;
 
 toast.success("Activation deleted successfully");
 loadActivations();
 } catch (error) {
 console.error("Error deleting activation:", error);
 toast.error("Failed to delete activation");
 }
 }, [supabase, loadActivations]);

 const handleDuplicate = useCallback(async (activation: Activation) => {
 try {
 const { id, created_at, updated_at, ...activationData } = activation;
 const { data, error } = await supabase
 .from("project_activations")
 .insert({
 ...activationData,
 name: `${activation.name} (Copy)`,
 status: "planning",
 })
 .select()
 .single();

 if (error) throw error;
 
 toast.success("Activation duplicated successfully");
 loadActivations();
 } catch (error) {
 console.error("Error duplicating activation:", error);
 toast.error("Failed to duplicate activation");
 }
 }, [supabase, loadActivations]);

 const handleStatusChange = useCallback(async (activation: Activation, newStatus: string) => {
 try {
 const updates: unknown = { status: newStatus };
 
 // Set actual_date when activation goes active
 if (newStatus === "active" && !activation.actual_date) {
 updates.actual_date = new Date().toISOString();
 }
 
 // Set completion_date when activation is completed
 if (newStatus === "completed" && !activation.completion_date) {
 updates.completion_date = new Date().toISOString();
 }

 const { error } = await supabase
 .from("project_activations")
 .update(updates)
 .eq("id", activation.id);

 if (error) throw error;
 
 toast.success(`Activation status updated to ${newStatus}`);
 loadActivations();
 } catch (error) {
 console.error("Error updating activation status:", error);
 toast.error("Failed to update activation status");
 }
 }, [supabase, loadActivations]);

 return (
 <div className="space-y-md">
 {/* Header */}
 <Card className="p-lg">
 <div className="flex items-center justify-between mb-md">
 <div>
 <h1 className="text-2xl font-bold">Project Activations</h1>
 <p className="text-muted-foreground">
 Manage project launches, go-live processes, and activations
 </p>
 </div>
 <Button onClick={() => setCreateDrawerOpen(true)}>
 <Plus className="mr-2 h-icon-xs w-icon-xs" />
 New Activation
 </Button>
 </div>

 {/* Filters and View Switcher */}
 <div className="flex flex-col lg:flex-row gap-md">
 <div className="flex-1 flex flex-wrap gap-sm">
 <div className="relative flex-1 min-w-content-narrow">
 <Search className="absolute left-3 top-xs/2 transform -translate-y-1/2 h-icon-xs w-icon-xs text-muted-foreground" />
 <Input
 placeholder="Search activations..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="pl-9"
 />
 </div>
 
 <Select value={selectedStatus} onValueChange={setSelectedStatus}>
 <option value="all">All Status</option>
 <option value="planning">Planning</option>
 <option value="ready">Ready</option>
 <option value="active">Active</option>
 <option value="completed">Completed</option>
 <option value="cancelled">Cancelled</option>
 </Select>

 <Select value={selectedType} onValueChange={setSelectedType}>
 <option value="all">All Types</option>
 <option value="soft_launch">Soft Launch</option>
 <option value="beta">Beta</option>
 <option value="full_launch">Full Launch</option>
 <option value="pilot">Pilot</option>
 <option value="rollout">Rollout</option>
 </Select>

 {projects.length > 0 && (
 <Select value={selectedProject} onValueChange={setSelectedProject}>
 <option value="all">All Projects</option>
 {projects.map((project) => (
 <option key={project.id} value={project.id}>
 {project.name}
 </option>
 ))}
 </Select>
 )}
 </div>

 {/* View Switcher */}
 <div className="flex items-center gap-sm">
 <DropdownMenu>
 <DropdownMenuTrigger asChild>
 <Button variant="outline" size="sm">
 <Columns className="mr-2 h-icon-xs w-icon-xs" />
 Columns
 </Button>
 </DropdownMenuTrigger>
 <DropdownMenuContent align="end" className="w-content-narrow">
 {fieldVisibility.map((field) => (
 <DropdownMenuItem key={field.id} asChild>
 <label className="flex items-center gap-xs cursor-pointer">
 <Checkbox
 checked={field.visible}
 onCheckedChange={(checked) => {
 setFieldVisibility((prev: unknown) =>
 prev.map((f) =>
 f.id === field.id ? { ...f, visible: !!checked } : f
 )
 );
 }}
 />
 {field.label}
 </label>
 </DropdownMenuItem>
 ))}
 </DropdownMenuContent>
 </DropdownMenu>

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

 {/* Bulk Actions Bar */}
 {selectedActivations.size > 0 && (
 <Card className="p-sm">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-sm">
 <Checkbox
 checked={selectedActivations.size === sortedActivations.length}
 onCheckedChange={handleSelectAll}
 />
 <span className="text-sm text-muted-foreground">
 {selectedActivations.size} selected
 </span>
 </div>
 <div className="flex items-center gap-sm">
 <Button
 variant="outline"
 size="sm"
 onClick={() => handleStatusChange(Array.from(selectedActivations)[0] as unknown, "active")}
 >
 Set Active
 </Button>
 <Button
 variant="outline"
 size="sm"
 onClick={() => handleStatusChange(Array.from(selectedActivations)[0] as unknown, "completed")}
 >
 Set Completed
 </Button>
 <Button
 variant="destructive"
 size="sm"
 onClick={async () => {
 if (confirm(`Delete ${selectedActivations.size} activations?`)) {
 for (const id of selectedActivations) {
 await supabase.from("project_activations").delete().eq("id", id);
 }
 loadActivations();
 setSelectedActivations(new Set());
 }
 }}
 >
 Delete
 </Button>
 </div>
 </div>
 </Card>
 )}

 {/* Content Views */}
 <Card className="p-lg">
 {loading ? (
 <div className="flex items-center justify-center py-xl">
 <div className="animate-spin rounded-full h-icon-lg w-icon-lg border-b-2 border-primary"></div>
 </div>
 ) : sortedActivations.length === 0 ? (
 <div className="text-center py-xl">
 <Rocket className="mx-auto h-icon-2xl w-icon-2xl text-muted-foreground mb-md" />
 <h3 className="text-lg font-semibold mb-sm">No activations found</h3>
 <p className="text-muted-foreground mb-md">
 {searchQuery || selectedStatus !== "all" || selectedType !== "all"
 ? "Try adjusting your filters"
 : "Get started by creating your first activation"}
 </p>
 {!searchQuery && selectedStatus === "all" && selectedType === "all" && (
 <Button onClick={() => setCreateDrawerOpen(true)}>
 <Plus className="mr-2 h-icon-xs w-icon-xs" />
 Create Activation
 </Button>
 )}
 </div>
 ) : (
 <>
 {viewType === "grid" && (
 <ActivationGridView
 activations={sortedActivations}
 selectedActivations={selectedActivations}
 onSelectActivation={handleSelectActivation}
 onView={handleView}
 onEdit={handleEdit}
 onDelete={handleDelete}
 onDuplicate={handleDuplicate}
 onStatusChange={handleStatusChange}
 />
 )}
 {viewType === "kanban" && (
 <ActivationKanbanView
 activations={sortedActivations}
 selectedActivations={selectedActivations}
 onSelectActivation={handleSelectActivation}
 onView={handleView}
 onEdit={handleEdit}
 onDelete={handleDelete}
 onStatusChange={handleStatusChange}
 />
 )}
 {viewType === "calendar" && (
 <ActivationCalendarView
 activations={sortedActivations}
 onView={handleView}
 />
 )}
 {viewType === "list" && (
 <ActivationListView
 activations={sortedActivations}
 selectedActivations={selectedActivations}
 fieldVisibility={fieldVisibility}
 sortField={sortField}
 sortDirection={sortDirection}
 onSelectAll={handleSelectAll}
 onSelectActivation={handleSelectActivation}
 onSort={(field) => {
 if (sortField === field) {
 setSortDirection(sortDirection === "asc" ? "desc" : "asc");
 } else {
 setSortField(field);
 setSortDirection("asc");
 }
 }}
 onView={handleView}
 onEdit={handleEdit}
 onDelete={handleDelete}
 onDuplicate={handleDuplicate}
 onStatusChange={handleStatusChange}
 />
 )}
 </>
 )}
 </Card>

 {/* Drawers */}
 <CreateActivationDrawer
 open={createDrawerOpen}
 onClose={() => setCreateDrawerOpen(false)}
 orgId={orgId}
 projects={projects}
 onSuccess={loadActivations}
 />
 
 {selectedActivation && (
 <>
 <EditActivationDrawer
 open={editDrawerOpen}
 onClose={() => setEditDrawerOpen(false)}
 activation={selectedActivation}
 projects={projects}
 onSuccess={loadActivations}
 />
 
 <ViewActivationDrawer
 open={viewDrawerOpen}
 onClose={() => setViewDrawerOpen(false)}
 activation={selectedActivation}
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
