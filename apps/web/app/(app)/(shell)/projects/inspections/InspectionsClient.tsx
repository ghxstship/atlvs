"use client";

import { Grid3x3, LayoutGrid, Calendar, List, Search, Filter, Download, Upload, MoreVertical, Plus, Edit, Trash2, Eye, Copy, Archive, CheckCircle, XCircle, Clock, AlertTriangle, ClipboardCheck, Shield, Award, TrendingUp, FileCheck, MapPin, User, CalendarCheck, FileText, ChevronDown, ArrowUpDown, ArrowUp, ArrowDown, Columns } from "lucide-react";
import { useState, useCallback, useMemo, useEffect } from 'react';
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
 toast
} from "@ghxstship/ui";
import { format, parseISO, isAfter, isBefore, isToday, addDays } from "date-fns";
import CreateInspectionDrawer from "./CreateInspectionDrawer";
import EditInspectionDrawer from "./EditInspectionDrawer";
import ViewInspectionDrawer from "./ViewInspectionDrawer";
import InspectionGridView from "./views/InspectionGridView";
import InspectionKanbanView from "./views/InspectionKanbanView";
import InspectionCalendarView from "./views/InspectionCalendarView";
import InspectionListView from "./views/InspectionListView";

// Types
export interface Inspection {
 id: string;
 project_id?: string;
 project?: {
 id: string;
 name: string;
 status: string;
 };
 organization_id: string;
 title: string;
 description?: string;
 type: "safety" | "quality" | "compliance" | "progress" | "final";
 status: "scheduled" | "in_progress" | "completed" | "failed" | "cancelled";
 scheduled_date: string;
 completed_date?: string;
 inspector_id: string;
 inspector?: {
 id: string;
 email: string;
 full_name?: string;
 };
 location?: string;
 findings?: string;
 recommendations?: string;
 score?: number;
 is_passed: boolean;
 follow_up_required: boolean;
 follow_up_date?: string;
 attachments?: string[];
 checklist_items?: Array<{
 id: string;
 category: string;
 item: string;
 status: "pass" | "fail" | "na" | "pending";
 notes?: string;
 }>;
 created_at: string;
 updated_at: string;
 created_by?: string;
 updated_by?: string;
}

interface InspectionsClientProps {
 orgId: string;
 projectId?: string;
 initialInspections?: Inspection[];
 projects?: Array<{ id: string; name: string }>;
 inspectors?: Array<{ id: string; email: string; full_name?: string }>;
}

// View configurations
const VIEW_TYPES = [
 { id: "grid", label: "Grid", icon: Grid3x3 },
 { id: "kanban", label: "Kanban", icon: LayoutGrid },
 { id: "calendar", label: "Calendar", icon: Calendar },
 { id: "list", label: "List", icon: List },
] as const;

type ViewType = typeof VIEW_TYPES[number]["id"];

// Field configuration for visibility and ordering
const FIELD_CONFIG = [
 { id: "title", label: "Title", visible: true, sortable: true },
 { id: "type", label: "Type", visible: true, sortable: true },
 { id: "status", label: "Status", visible: true, sortable: true },
 { id: "project", label: "Project", visible: true, sortable: true },
 { id: "scheduled_date", label: "Scheduled", visible: true, sortable: true },
 { id: "completed_date", label: "Completed", visible: false, sortable: true },
 { id: "inspector", label: "Inspector", visible: true, sortable: true },
 { id: "location", label: "Location", visible: false, sortable: false },
 { id: "score", label: "Score", visible: true, sortable: true },
 { id: "is_passed", label: "Passed", visible: true, sortable: true },
 { id: "follow_up_required", label: "Follow-up", visible: false, sortable: true },
 { id: "created_at", label: "Created", visible: false, sortable: true },
 { id: "updated_at", label: "Updated", visible: false, sortable: true },
];

export default function InspectionsClient({
 orgId,
 projectId,
 initialInspections = [],
 projects = [],
 inspectors = []
}: InspectionsClientProps) {
 const router = useRouter();
 const supabase = createBrowserClient();

 // State
 const [inspections, setInspections] = useState<Inspection[]>(initialInspections);
 const [loading, setLoading] = useState(false);
 const [viewType, setViewType] = useState<ViewType>("grid");
 const [searchQuery, setSearchQuery] = useState("");
 const [selectedType, setSelectedType] = useState<string>("all");
 const [selectedStatus, setSelectedStatus] = useState<string>("all");
 const [selectedProject, setSelectedProject] = useState<string>(projectId || "all");
 const [selectedInspector, setSelectedInspector] = useState<string>("all");
 const [sortField, setSortField] = useState<string>("scheduled_date");
 const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
 const [selectedInspections, setSelectedInspections] = useState<Set<string>(new Set());
 const [fieldVisibility, setFieldVisibility] = useState(FIELD_CONFIG);
 const [dateRange, setDateRange] = useState<{ start?: Date; end?: Date }>({});

 // Drawers
 const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
 const [editDrawerOpen, setEditDrawerOpen] = useState(false);
 const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
 const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);

 // Load inspections from Supabase
 const loadInspections = useCallback(async () => {
 setLoading(true);
 try {
 let query = supabase
 .from("project_inspections")
 .select(`
 *,
 project:projects(id, name, status),
 inspector:users!project_inspections_inspector_id_fkey(id, email, full_name)
 `)
 .eq("organization_id", orgId)
 .order(sortField, { ascending: sortDirection === "asc" });

 // Apply filters
 if (projectId) {
 query = query.eq("project_id", projectId);
 } else if (selectedProject !== "all") {
 query = query.eq("project_id", selectedProject);
 }
 
 if (selectedType !== "all") {
 query = query.eq("type", selectedType);
 }
 
 if (selectedStatus !== "all") {
 query = query.eq("status", selectedStatus);
 }
 
 if (selectedInspector !== "all") {
 query = query.eq("inspector_id", selectedInspector);
 }
 
 if (dateRange.start) {
 query = query.gte("scheduled_date", dateRange.start.toISOString());
 }
 
 if (dateRange.end) {
 query = query.lte("scheduled_date", dateRange.end.toISOString());
 }

 const { data, error } = await query;

 if (error) throw error;
 setInspections(data || []);
 } catch (error) {
 console.error("Error loading inspections:", error);
 toast.error("Failed to load inspections");
 } finally {
 setLoading(false);
 }
 }, [supabase, orgId, projectId, selectedProject, selectedType, selectedStatus, selectedInspector, sortField, sortDirection, dateRange]);

 // Load inspections on mount and when filters change
 useEffect(() => {
 loadInspections();
 }, [loadInspections]);

 // Real-time subscription
 useEffect(() => {
 const channel = supabase
 .channel("inspections-changes")
 .on(
 "postgres_changes",
 {
 event: "*",
 schema: "public",
 table: "project_inspections",
 filter: `organization_id=eq.${orgId}`
 },
 (payload) => {
 loadInspections();
 }
 )
 .subscribe();

 return () => {
 supabase.removeChannel(channel);
 };
 }, [supabase, orgId, loadInspections]);

 // Filter inspections based on search
 const filteredInspections = useMemo(() => {
 return inspections.filter((inspection) => {
 if (searchQuery) {
 const query = searchQuery.toLowerCase();
 return (
 inspection.title.toLowerCase().includes(query) ||
 inspection.description?.toLowerCase().includes(query) ||
 inspection.location?.toLowerCase().includes(query) ||
 inspection.project?.name.toLowerCase().includes(query) ||
 inspection.inspector?.full_name?.toLowerCase().includes(query) ||
 inspection.inspector?.email.toLowerCase().includes(query)
 );
 }
 return true;
 });
 }, [inspections, searchQuery]);

 // Sort inspections
 const sortedInspections = useMemo(() => {
 return [...filteredInspections].sort((a, b) => {
 let aVal: unknown = a[sortField as keyof Inspection];
 let bVal: unknown = b[sortField as keyof Inspection];

 // Handle nested fields
 if (sortField === "project") {
 aVal = a.project?.name || "";
 bVal = b.project?.name || "";
 } else if (sortField === "inspector") {
 aVal = a.inspector?.full_name || a.inspector?.email || "";
 bVal = b.inspector?.full_name || b.inspector?.email || "";
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

 // Handle booleans
 if (typeof aVal === "boolean" && typeof bVal === "boolean") {
 return sortDirection === "asc" 
 ? (aVal ? 1 : 0) - (bVal ? 1 : 0)
 : (bVal ? 1 : 0) - (aVal ? 1 : 0);
 }

 // Handle strings
 const aStr = String(aVal || "").toLowerCase();
 const bStr = String(bVal || "").toLowerCase();
 return sortDirection === "asc" 
 ? aStr.localeCompare(bStr)
 : bStr.localeCompare(aStr);
 });
 }, [filteredInspections, sortField, sortDirection]);

 // Group inspections for kanban view
 const groupedInspections = useMemo(() => {
 const groups: Record<string, Inspection[]> = {
 scheduled: [],
 in_progress: [],
 completed: [],
 failed: [],
 cancelled: []
 };

 sortedInspections.forEach((inspection) => {
 if (groups[inspection.status]) {
 groups[inspection.status].push(inspection);
 }
 });

 return groups;
 }, [sortedInspections]);

 // Handle selection
 const handleSelectAll = useCallback(() => {
 if (selectedInspections.size === sortedInspections.length) {
 setSelectedInspections(new Set());
 } else {
 setSelectedInspections(new Set(sortedInspections.map((i) => i.id)));
 }
 }, [selectedInspections, sortedInspections]);

 const handleSelectInspection = useCallback((id: string) => {
 setSelectedInspections((prev: unknown) => {
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
 const handleView = useCallback((inspection: Inspection) => {
 setSelectedInspection(inspection);
 setViewDrawerOpen(true);
 }, []);

 const handleEdit = useCallback((inspection: Inspection) => {
 setSelectedInspection(inspection);
 setEditDrawerOpen(true);
 }, []);

 const handleDelete = useCallback(async (inspection: Inspection) => {
 if (!confirm(`Are you sure you want to delete "${inspection.title}"?`)) return;

 try {
 const { error } = await supabase
 .from("project_inspections")
 .delete()
 .eq("id", inspection.id);

 if (error) throw error;
 
 toast.success("Inspection deleted successfully");
 loadInspections();
 } catch (error) {
 console.error("Error deleting inspection:", error);
 toast.error("Failed to delete inspection");
 }
 }, [supabase, loadInspections]);

 const handleDuplicate = useCallback(async (inspection: Inspection) => {
 try {
 const { id, created_at, updated_at, completed_date, ...inspectionData } = inspection;
 const { data, error } = await supabase
 .from("project_inspections")
 .insert({
 ...inspectionData,
 title: `${inspection.title} (Copy)`,
 status: "scheduled",
 scheduled_date: addDays(new Date(), 7).toISOString()
 })
 .select()
 .single();

 if (error) throw error;
 
 toast.success("Inspection duplicated successfully");
 loadInspections();
 } catch (error) {
 console.error("Error duplicating inspection:", error);
 toast.error("Failed to duplicate inspection");
 }
 }, [supabase, loadInspections]);

 const handleStatusChange = useCallback(async (inspection: Inspection, newStatus: string) => {
 try {
 const updates: unknown = { status: newStatus };
 
 // Set completed_date when inspection is completed
 if (newStatus === "completed" && !inspection.completed_date) {
 updates.completed_date = new Date().toISOString();
 }

 const { error } = await supabase
 .from("project_inspections")
 .update(updates)
 .eq("id", inspection.id);

 if (error) throw error;
 
 toast.success(`Inspection status updated to ${newStatus}`);
 loadInspections();
 } catch (error) {
 console.error("Error updating inspection status:", error);
 toast.error("Failed to update inspection status");
 }
 }, [supabase, loadInspections]);

 // Bulk actions
 const handleBulkDelete = useCallback(async () => {
 if (!confirm(`Are you sure you want to delete ${selectedInspections.size} inspections?`)) return;

 try {
 const { error } = await supabase
 .from("project_inspections")
 .delete()
 .in("id", Array.from(selectedInspections));

 if (error) throw error;
 
 toast.success(`${selectedInspections.size} inspections deleted successfully`);
 setSelectedInspections(new Set());
 loadInspections();
 } catch (error) {
 console.error("Error deleting inspections:", error);
 toast.error("Failed to delete inspections");
 }
 }, [supabase, selectedInspections, loadInspections]);

 const handleBulkStatusChange = useCallback(async (newStatus: string) => {
 try {
 const updates: unknown = { status: newStatus };
 
 // Set completed_date for completed inspections
 if (newStatus === "completed") {
 updates.completed_date = new Date().toISOString();
 }

 const { error } = await supabase
 .from("project_inspections")
 .update(updates)
 .in("id", Array.from(selectedInspections));

 if (error) throw error;
 
 toast.success(`${selectedInspections.size} inspections updated successfully`);
 setSelectedInspections(new Set());
 loadInspections();
 } catch (error) {
 console.error("Error updating inspections:", error);
 toast.error("Failed to update inspections");
 }
 }, [supabase, selectedInspections, loadInspections]);

 const handleBulkExport = useCallback(() => {
 // Export functionality
 toast.info("Export coming soon");
 }, []);

 // Get type icon
 const getTypeIcon = (type: string) => {
 switch (type) {
 case "safety":
 return Shield;
 case "quality":
 return Award;
 case "compliance":
 return ClipboardCheck;
 case "progress":
 return TrendingUp;
 case "final":
 return FileCheck;
 default:
 return ClipboardCheck;
 }
 };

 // Get status badge variant
 const getStatusBadgeVariant = (status: string) => {
 switch (status) {
 case "scheduled":
 return "secondary";
 case "in_progress":
 return "warning";
 case "completed":
 return "success";
 case "failed":
 return "destructive";
 case "cancelled":
 return "outline";
 default:
 return "secondary";
 }
 };

 // Get type badge variant
 const getTypeBadgeVariant = (type: string) => {
 switch (type) {
 case "safety":
 return "destructive";
 case "quality":
 return "info";
 case "compliance":
 return "warning";
 case "progress":
 return "secondary";
 case "final":
 return "success";
 default:
 return "default";
 }
 };

 // Get score color
 const getScoreColor = (score: number) => {
 if (score >= 90) return "text-green-600";
 if (score >= 70) return "text-yellow-600";
 if (score >= 50) return "text-orange-600";
 return "text-red-600";
 };

 return (
 <div className="space-y-md">
 {/* Header */}
 <Card className="p-lg">
 <div className="flex items-center justify-between mb-md">
 <div>
 <h1 className="text-2xl font-bold">Project Inspections</h1>
 <p className="text-muted-foreground">
 Manage safety, quality, compliance, and progress inspections
 </p>
 </div>
 <Button onClick={() => setCreateDrawerOpen(true)}>
 <Plus className="mr-2 h-icon-xs w-icon-xs" />
 Schedule Inspection
 </Button>
 </div>

 {/* Filters and View Switcher */}
 <div className="flex flex-col lg:flex-row gap-md">
 <div className="flex-1 flex flex-wrap gap-sm">
 <div className="relative flex-1 min-w-content-narrow">
 <Search className="absolute left-3 top-xs/2 transform -translate-y-1/2 h-icon-xs w-icon-xs text-muted-foreground" />
 <Input
 placeholder="Search inspections..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="pl-9"
 />
 </div>
 
 <Select value={selectedType} onValueChange={setSelectedType}>
 <option value="all">All Types</option>
 <option value="safety">Safety</option>
 <option value="quality">Quality</option>
 <option value="compliance">Compliance</option>
 <option value="progress">Progress</option>
 <option value="final">Final</option>
 </Select>

 <Select value={selectedStatus} onValueChange={setSelectedStatus}>
 <option value="all">All Status</option>
 <option value="scheduled">Scheduled</option>
 <option value="in_progress">In Progress</option>
 <option value="completed">Completed</option>
 <option value="failed">Failed</option>
 <option value="cancelled">Cancelled</option>
 </Select>

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

 {inspectors.length > 0 && (
 <Select value={selectedInspector} onValueChange={setSelectedInspector}>
 <option value="all">All Inspectors</option>
 {inspectors.map((inspector) => (
 <option key={inspector.id} value={inspector.id}>
 {inspector.full_name || inspector.email}
 </option>
 ))}
 </Select>
 )}
 </div>

 {/* View Switcher */}
 <div className="flex items-center gap-sm">
 <Button
 variant="outline"
 size="sm"
 onClick={handleBulkExport}
 >
 <Download className="mr-2 h-icon-xs w-icon-xs" />
 Export
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

 {/* Bulk Actions Bar */}
 {selectedInspections.size > 0 && (
 <Card className="p-sm">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-sm">
 <Checkbox
 checked={selectedInspections.size === sortedInspections.length}
 onChange={handleSelectAll}
 />
 <span className="text-sm text-muted-foreground">
 {selectedInspections.size} selected
 </span>
 </div>
 <div className="flex items-center gap-sm">
 <Button
 variant="outline"
 size="sm"
 onClick={() => handleBulkStatusChange("in_progress")}
 >
 Start Inspection
 </Button>
 <Button
 variant="outline"
 size="sm"
 onClick={() => handleBulkStatusChange("completed")}
 >
 Mark Complete
 </Button>
 <Button
 variant="destructive"
 size="sm"
 onClick={handleBulkDelete}
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
 ) : sortedInspections.length === 0 ? (
 <div className="text-center py-xl">
 <ClipboardCheck className="mx-auto h-icon-2xl w-icon-2xl text-muted-foreground mb-md" />
 <h3 className="text-lg font-semibold mb-sm">No inspections found</h3>
 <p className="text-muted-foreground mb-md">
 {searchQuery || selectedType !== "all" || selectedStatus !== "all"
 ? "Try adjusting your filters"
 : "Get started by scheduling your first inspection"}
 </p>
 {!searchQuery && selectedType === "all" && selectedStatus === "all" && (
 <Button onClick={() => setCreateDrawerOpen(true)}>
 <Plus className="mr-2 h-icon-xs w-icon-xs" />
 Schedule Inspection
 </Button>
 )}
 </div>
 ) : (
 <>
 {viewType === "grid" && (
 <InspectionGridView
 inspections={sortedInspections}
 selectedInspections={selectedInspections}
 onSelectInspection={handleSelectInspection}
 onView={handleView}
 onEdit={handleEdit}
 onDelete={handleDelete}
 onDuplicate={handleDuplicate}
 onStatusChange={handleStatusChange}
 getTypeIcon={getTypeIcon}
 getStatusBadgeVariant={getStatusBadgeVariant}
 getTypeBadgeVariant={getTypeBadgeVariant}
 getScoreColor={getScoreColor}
 />
 )}
 {viewType === "kanban" && (
 <InspectionKanbanView
 inspections={sortedInspections}
 selectedInspections={selectedInspections}
 onSelectInspection={handleSelectInspection}
 onView={handleView}
 onEdit={handleEdit}
 onDelete={handleDelete}
 onStatusChange={handleStatusChange}
 getTypeIcon={getTypeIcon}
 getTypeBadgeVariant={getTypeBadgeVariant}
 getScoreColor={getScoreColor}
 />
 )}
 {viewType === "calendar" && (
 <InspectionCalendarView
 inspections={sortedInspections}
 onView={handleView}
 getTypeIcon={getTypeIcon}
 getStatusBadgeVariant={getStatusBadgeVariant}
 />
 )}
 {viewType === "list" && (
 <InspectionListView
 inspections={sortedInspections}
 selectedInspections={selectedInspections}
 fieldVisibility={fieldVisibility}
 sortField={sortField}
 sortDirection={sortDirection}
 onSelectAll={handleSelectAll}
 onSelectInspection={handleSelectInspection}
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
 getTypeBadgeVariant={getTypeBadgeVariant}
 getStatusBadgeVariant={getStatusBadgeVariant}
 getScoreColor={getScoreColor}
 />
 )}
 </>
 )}
 </Card>

 {/* Drawers */}
 <CreateInspectionDrawer
 open={createDrawerOpen}
 onClose={() => setCreateDrawerOpen(false)}
 orgId={orgId}
 projectId={projectId}
 projects={projects}
 inspectors={inspectors}
 onSuccess={loadInspections}
 />
 
 {selectedInspection && (
 <>
 <EditInspectionDrawer
 open={editDrawerOpen}
 onClose={() => setEditDrawerOpen(false)}
 inspection={selectedInspection}
 projects={projects}
 inspectors={inspectors}
 onSuccess={loadInspections}
 />
 
 <ViewInspectionDrawer
 open={viewDrawerOpen}
 onClose={() => setViewDrawerOpen(false)}
 inspection={selectedInspection}
 onEdit={() => {
 setViewDrawerOpen(false);
 setEditDrawerOpen(true);
 }}
 getTypeIcon={getTypeIcon}
 getStatusBadgeVariant={getStatusBadgeVariant}
 getTypeBadgeVariant={getTypeBadgeVariant}
 getScoreColor={getScoreColor}
 />
 </>
 )}
 </div>
 );
}
