"use client";

import { CalendarDays, Calendar as CalendarIcon, Clock, Eye, FileText, Filter, LayoutGrid, List, MapPin, Pencil, Plus, RefreshCcw, Share2, Trash2, Users } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@ghxstship/auth";
import {
 Badge,
 Button,
 Card,
 Checkbox,
 Input,
 Select,
} from "@ghxstship/ui";
import { addDays, formatISO } from "date-fns";
import CreateCallSheetDrawer from "./drawers/CreateCallSheetDrawer";
import EditCallSheetDrawer from "./drawers/EditCallSheetDrawer";
import ViewCallSheetDrawer from "./drawers/ViewCallSheetDrawer";
import CallSheetsBoardView from "./views/CallSheetsBoardView";
import CallSheetsListView from "./views/CallSheetsListView";
import CallSheetsCalendarView from "./views/CallSheetsCalendarView";
import CallSheetsTimelineView from "./views/CallSheetsTimelineView";
import type { CallSheet, CallSheetProject, CallSheetEvent } from "./types";

const VIEW_TYPES = [
 { id: "board", label: "Board", icon: LayoutGrid },
 { id: "list", label: "List", icon: List },
 { id: "calendar", label: "Calendar", icon: CalendarIcon },
 { id: "timeline", label: "Timeline", icon: CalendarDays },
] as const;

type ViewType = (typeof VIEW_TYPES)[number]["id"];

type ProgrammingCallSheetsClientProps = {
 orgId: string;
 currentUserId: string;
 initialCallSheets: CallSheet[];
 projects: CallSheetProject[];
 events: CallSheetEvent[];
 users: { id: string; email: string; full_name?: string | null; avatar_url?: string | null }[];
};

const STATUS_BADGE: Record<CallSheet["status"], { label: string; variant: "secondary" | "outline" | "warning" | "info" | "success" | "destructive" }> = {
 draft: { label: "Draft", variant: "secondary" },
 published: { label: "Published", variant: "info" },
 distributed: { label: "Distributed", variant: "success" },
 updated: { label: "Updated", variant: "warning" },
 cancelled: { label: "Cancelled", variant: "destructive" },
};

const CALL_TYPE_LABEL: Record<CallSheet["call_type"], string> = {
 general: "General",
 crew: "Crew",
 talent: "Talent",
 vendor: "Vendor",
 security: "Security",
 medical: "Medical",
 transport: "Transport",
};

export default function ProgrammingCallSheetsClient({
 orgId,
 currentUserId,
 initialCallSheets,
 projects,
 events,
 users,
}: ProgrammingCallSheetsClientProps) {
 const supabase = useMemo(() => createBrowserClient(), []);
 const router = useRouter();

 const [callSheets, setCallSheets] = useState<CallSheet[]>(initialCallSheets);
 const [loading, setLoading] = useState(false);
 const [viewType, setViewType] = useState<ViewType>("list");
 const [selectedCallSheets, setSelectedCallSheets] = useState<Set<string>(new Set());
 const [searchTerm, setSearchTerm] = useState("");
 const [selectedProject, setSelectedProject] = useState<string>("all");
 const [selectedEvent, setSelectedEvent] = useState<string>("all");
 const [selectedStatus, setSelectedStatus] = useState<string>("all");
 const [selectedType, setSelectedType] = useState<string>("all");
 const [dateRangeStart, setDateRangeStart] = useState<string>(() => formatISO(new Date(), { representation: "date" }));
 const [dateRangeEnd, setDateRangeEnd] = useState<string>(() => formatISO(addDays(new Date(), 30), { representation: "date" }));

 const [createOpen, setCreateOpen] = useState(false);
 const [editOpen, setEditOpen] = useState(false);
 const [viewOpen, setViewOpen] = useState(false);
 const [activeCallSheet, setActiveCallSheet] = useState<CallSheet | null>(null);

 const filteredCallSheets = useMemo(() => {
 return callSheets.filter((callSheet) => {
 if (searchTerm) {
 const query = searchTerm.toLowerCase();
 const matchesSearch =
 callSheet.name.toLowerCase().includes(query) ||
 (callSheet.description?.toLowerCase().includes(query) ?? false) ||
 callSheet.location.toLowerCase().includes(query) ||
 callSheet.tags.some((tag) => tag.toLowerCase().includes(query));
 if (!matchesSearch) return false;
 }

 if (selectedProject !== "all" && callSheet.project_id !== selectedProject) return false;
 if (selectedEvent !== "all" && callSheet.event_id !== selectedEvent) return false;
 if (selectedStatus !== "all" && callSheet.status !== selectedStatus) return false;
 if (selectedType !== "all" && callSheet.call_type !== selectedType) return false;

 if (dateRangeStart) {
 if (new Date(callSheet.event_date) < new Date(dateRangeStart)) return false;
 }

 if (dateRangeEnd) {
 if (new Date(callSheet.event_date) > new Date(dateRangeEnd)) return false;
 }

 return true;
 });
 }, [callSheets, searchTerm, selectedProject, selectedEvent, selectedStatus, selectedType, dateRangeStart, dateRangeEnd]);

 const loadCallSheets = useCallback(async () => {
 try {
 setLoading(true);
 const params = new URLSearchParams({
 limit: "200",
 offset: "0",
 });
 if (selectedProject !== "all") params.set("project_id", selectedProject);
 if (selectedEvent !== "all") params.set("event_id", selectedEvent);
 if (selectedStatus !== "all") params.set("status", selectedStatus);
 if (selectedType !== "all") params.set("call_type", selectedType);
 if (searchTerm) params.set("search", searchTerm);

 const response = await fetch(`/api/v1/programming/call-sheets?${params.toString()}`);
 if (!response.ok) throw new Error("Failed to load call sheets");
 const json = await response.json();
 setCallSheets(json.data ?? []);
 } catch (error) {
 console.error("Failed to load call sheets", error);
 } finally {
 setLoading(false);
 }
 }, [searchTerm, selectedProject, selectedEvent, selectedStatus, selectedType]);

 useEffect(() => {
 loadCallSheets();
 }, [loadCallSheets]);

 useEffect(() => {
 const channel = supabase
 .channel(`call-sheets-${orgId}`)
 .on(
 'postgres_changes',
 {
 event: '*',
 schema: 'public',
 table: 'call_sheets',
 filter: `organization_id=eq.${orgId}`,
 },
 () => {
 loadCallSheets();
 },
 )
 .subscribe();

 return () => {
 supabase.removeChannel(channel);
 };
 }, [supabase, orgId, loadCallSheets]);

 const openCreateDrawer = () => {
 setActiveCallSheet(null);
 setCreateOpen(true);
 };

 const openEditDrawer = (callSheet: CallSheet) => {
 setActiveCallSheet(callSheet);
 setEditOpen(true);
 };

 const openViewDrawer = (callSheet: CallSheet) => {
 setActiveCallSheet(callSheet);
 setViewOpen(true);
 };

 const handleDelete = async (callSheet: CallSheet) => {
 if (!confirm(`Delete call sheet "${callSheet.name}"?`)) return;
 try {
 const res = await fetch(`/api/v1/programming/call-sheets/${callSheet.id}`, { method: 'DELETE' });
 if (!res.ok) throw new Error('Delete failed');
 loadCallSheets();
 } catch (error) {
 console.error('Failed to delete call sheet', error);
 }
 };

 const selectedCallSheetsList = useMemo(() => callSheets.filter((callSheet) => selectedCallSheets.has(callSheet.id)), [callSheets, selectedCallSheets]);

 const clearSelection = () => setSelectedCallSheets(new Set());

 const toggleSelection = (id: string) => {
 setSelectedCallSheets((prev: unknown) => {
 const next = new Set(prev);
 if (next.has(id)) {
 next.delete(id);
 } else {
 next.add(id);
 }
 return next;
 });
 };

 const bulkDelete = async () => {
 if (selectedCallSheets.size === 0) return;
 if (!confirm(`Delete ${selectedCallSheets.size} selected call sheets?`)) return;

 try {
 await Promise.all(
 Array.from(selectedCallSheets).map((id) => fetch(`/api/v1/programming/call-sheets/${id}`, { method: 'DELETE' })),
 );
 clearSelection();
 loadCallSheets();
 } catch (error) {
 console.error('Bulk delete failed', error);
 }
 };

 const renderView = () => {
 switch (viewType) {
 case 'board':
 return (
 <CallSheetsBoardView
 callSheets={filteredCallSheets}
 selected={selectedCallSheets}
 onSelect={toggleSelection}
 onView={openViewDrawer}
 onEdit={openEditDrawer}
 onDelete={handleDelete}
 />
 );
 case 'calendar':
 return <CallSheetsCalendarView callSheets={filteredCallSheets} onView={openViewDrawer} onEdit={openEditDrawer} />;
 case 'timeline':
 return <CallSheetsTimelineView callSheets={filteredCallSheets} onView={openViewDrawer} onEdit={openEditDrawer} />;
 case 'list':
 default:
 return (
 <CallSheetsListView
 callSheets={filteredCallSheets}
 selected={selectedCallSheets}
 onSelect={toggleSelection}
 onView={openViewDrawer}
 onEdit={openEditDrawer}
 onDelete={handleDelete}
 />
 );
 }
 };

 return (
 <div className="space-y-lg">
 <div className="flex flex-col gap-md lg:flex-row lg:items-center lg:justify-between">
 <div className="flex flex-1 flex-wrap items-center gap-sm">
 <div className="relative w-full max-w-md">
 <Input
 placeholder="Search call sheets..."
 value={searchTerm}
 onChange={(event) => setSearchTerm(event.target.value)}
 className="pl-9"
 />
 <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
 </div>

 <Select value={selectedProject} onValueChange={setSelectedProject}>
 <option value="all">All Projects</option>
 {projects.map((project) => (
 <option key={project.id} value={project.id}>
 {project.name}
 </option>
 ))}
 </Select>

 <Select value={selectedEvent} onValueChange={setSelectedEvent}>
 <option value="all">All Events</option>
 {events.map((event) => (
 <option key={event.id} value={event.id}>
 {event.title}
 </option>
 ))}
 </Select>

 <Select value={selectedStatus} onValueChange={setSelectedStatus}>
 <option value="all">All Statuses</option>
 {Object.entries(STATUS_BADGE).map(([key, value]) => (
 <option key={key} value={key}>
 {value.label}
 </option>
 ))}
 </Select>

 <Select value={selectedType} onValueChange={setSelectedType}>
 <option value="all">All Types</option>
 {Object.entries(CALL_TYPE_LABEL).map(([key, label]) => (
 <option key={key} value={key}>
 {label}
 </option>
 ))}
 </Select>

 <Input
 type="date"
 value={dateRangeStart}
 onChange={(event) => setDateRangeStart(event.target.value)}
 className="w-auto"
 />
 <Input
 type="date"
 value={dateRangeEnd}
 onChange={(event) => setDateRangeEnd(event.target.value)}
 className="w-auto"
 />

 <Button variant="outline" size="sm" onClick={loadCallSheets} disabled={loading}>
 <RefreshCcw className="mr-2 h-4 w-4" />
 Refresh
 </Button>
 </div>

 <div className="flex items-center gap-sm">
 {selectedCallSheets.size > 0 ? (
 <>
 <Button variant="outline" size="sm" onClick={bulkDelete}>
 <Trash2 className="mr-2 h-4 w-4" />
 Delete ({selectedCallSheets.size})
 </Button>
 <Button variant="outline" size="sm" onClick={clearSelection}>
 Clear selection
 </Button>
 </>
 ) : null}

 <div className="flex rounded-md shadow-sm">
 {VIEW_TYPES.map((option) => {
 const Icon = option.icon;
 return (
 <Button
 key={option.id}
 variant={viewType === option.id ? "default" : "outline"}
 size="sm"
 onClick={() => setViewType(option.id)}
 className="rounded-none first:rounded-l-md last:rounded-r-md"
 >
 <Icon className="h-4 w-4" />
 <span className="sr-only">{option.label}</span>
 </Button>
 );
 })}
 </div>

 <Button onClick={openCreateDrawer}>
 <Plus className="mr-2 h-4 w-4" />
 Create Call Sheet
 </Button>
 </div>
 </div>

 <Card className="p-lg">
 {loading ? (
 <div className="flex min-h-[320px] items-center justify-center text-muted-foreground">
 Loading call sheets...
 </div>
 ) : filteredCallSheets.length === 0 ? (
 <div className="flex min-h-[320px] flex-col items-center justify-center gap-md text-center">
 <FileText className="h-12 w-12 text-muted-foreground" />
 <div className="space-y-xs">
 <h3 className="text-heading-5">No call sheets found</h3>
 <p className="text-body-sm text-muted-foreground">
 {searchTerm || selectedStatus !== "all" || selectedType !== "all"
 ? "Try adjusting your filters or search"
 : "Create your first call sheet to get started"}
 </p>
 </div>
 <Button onClick={openCreateDrawer}>
 <Plus className="mr-2 h-4 w-4" />
 Create Call Sheet
 </Button>
 </div>
 ) : (
 renderView()
 )}
 </Card>

 <CreateCallSheetDrawer
 open={createOpen}
 onClose={() => setCreateOpen(false)}
 orgId={orgId}
 currentUserId={currentUserId}
 projects={projects}
 events={events}
 onSuccess={() => {
 loadCallSheets();
 router.refresh();
 }}
 />

 {activeCallSheet ? (
 <>
 <EditCallSheetDrawer
 open={editOpen}
 onClose={() => setEditOpen(false)}
 callSheet={activeCallSheet}
 orgId={orgId}
 currentUserId={currentUserId}
 projects={projects}
 events={events}
 onSuccess={() => {
 loadCallSheets();
 router.refresh();
 }}
 />
 <ViewCallSheetDrawer
 open={viewOpen}
 onClose={() => setViewOpen(false)}
 callSheet={activeCallSheet}
 onEdit={() => {
 setViewOpen(false);
 setEditOpen(true);
 }}
 onDelete={() => {
 setViewOpen(false);
 handleDelete(activeCallSheet);
 }}
 users={users}
 />
 </>
 ) : null}
 </div>
 );
}

export { STATUS_BADGE, CALL_TYPE_LABEL };
