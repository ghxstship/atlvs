"use client";

import { CalendarDays, CalendarRange, Calendar as CalendarIcon, Eye, Filter, LayoutGrid, List, MapPin, Pencil, Plus, RefreshCcw, Share2, Trash2, Users } from "lucide-react";
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
 toast,
} from "@ghxstship/ui";
import { addMonths, formatISO } from "date-fns";
import CreateProgrammingEventDrawer from "./drawers/CreateProgrammingEventDrawer";
import EditProgrammingEventDrawer from "./drawers/EditProgrammingEventDrawer";
import ViewProgrammingEventDrawer from "./drawers/ViewProgrammingEventDrawer";
import ProgrammingCalendarBoardView from "./views/ProgrammingCalendarBoardView";
import ProgrammingCalendarListView from "./views/ProgrammingCalendarListView";
import ProgrammingCalendarGridView from "./views/ProgrammingCalendarGridView";
import ProgrammingCalendarTimelineView from "./views/ProgrammingCalendarTimelineView";
import type { ProgrammingEvent, ProgrammingEventProject } from "./types";

const VIEW_TYPES = [
 { id: "board", label: "Board", icon: LayoutGrid },
 { id: "list", label: "List", icon: List },
 { id: "calendar", label: "Calendar", icon: CalendarRange },
 { id: "timeline", label: "Timeline", icon: CalendarDays },
] as const;

type ViewType = (typeof VIEW_TYPES)[number]["id"];

type ProgrammingCalendarClientProps = {
 orgId: string;
 currentUserId: string;
 initialEvents: ProgrammingEvent[];
 projects: ProgrammingEventProject[];
 users: { id: string; email: string; full_name?: string | null; avatar_url?: string | null }[];
};

const STATUS_BADGE: Record<ProgrammingEvent["status"], { label: string; variant: "secondary" | "outline" | "warning" | "info" | "success" | "destructive" }> = {
 draft: { label: "Draft", variant: "secondary" },
 scheduled: { label: "Scheduled", variant: "info" },
 in_progress: { label: "In Progress", variant: "warning" },
 completed: { label: "Completed", variant: "success" },
 cancelled: { label: "Cancelled", variant: "destructive" },
};

const EVENT_TYPE_LABEL: Record<ProgrammingEvent["event_type"], string> = {
 performance: "Performance",
 activation: "Activation",
 workshop: "Workshop",
 meeting: "Meeting",
 rehearsal: "Rehearsal",
 setup: "Setup",
 breakdown: "Breakdown",
 other: "Other",
};

export default function ProgrammingCalendarClient({
 orgId,
 currentUserId,
 initialEvents,
 projects,
 users,
}: ProgrammingCalendarClientProps) {
 const supabase = useMemo(() => createBrowserClient(), []);
 const router = useRouter();

 const [events, setEvents] = useState<ProgrammingEvent[]>(initialEvents);
 const [loading, setLoading] = useState(false);
 const [viewType, setViewType] = useState<ViewType>("calendar");
 const [selectedEvents, setSelectedEvents] = useState<Set<string>(new Set());
 const [searchTerm, setSearchTerm] = useState("");
 const [selectedProject, setSelectedProject] = useState<string>("all");
 const [selectedStatus, setSelectedStatus] = useState<string>("all");
 const [selectedType, setSelectedType] = useState<string>("all");
 const [dateRangeStart, setDateRangeStart] = useState<string>(() => formatISO(new Date(), { representation: "date" }));
 const [dateRangeEnd, setDateRangeEnd] = useState<string>(() => formatISO(addMonths(new Date(), 1), { representation: "date" }));

 const [createOpen, setCreateOpen] = useState(false);
 const [editOpen, setEditOpen] = useState(false);
 const [viewOpen, setViewOpen] = useState(false);
 const [activeEvent, setActiveEvent] = useState<ProgrammingEvent | null>(null);

 const filteredEvents = useMemo(() => {
 return events.filter((event) => {
 if (searchTerm) {
 const query = searchTerm.toLowerCase();
 const matchesSearch =
 event.title.toLowerCase().includes(query) ||
 (event.description?.toLowerCase().includes(query) ?? false) ||
 event.tags.some((tag) => tag.toLowerCase().includes(query));
 if (!matchesSearch) return false;
 }

 if (selectedProject !== "all" && event.project_id !== selectedProject) return false;
 if (selectedStatus !== "all" && event.status !== selectedStatus) return false;
 if (selectedType !== "all" && event.event_type !== selectedType) return false;

 if (dateRangeStart) {
 if (new Date(event.start_at) < new Date(dateRangeStart)) return false;
 }

 if (dateRangeEnd) {
 if (new Date(event.start_at) > new Date(dateRangeEnd)) return false;
 }

 return true;
 });
 }, [events, searchTerm, selectedProject, selectedStatus, selectedType, dateRangeStart, dateRangeEnd]);

 const loadEvents = useCallback(async () => {
 try {
 setLoading(true);
 const params = new URLSearchParams({
 limit: "200",
 offset: "0",
 start_at: dateRangeStart ? new Date(dateRangeStart).toISOString() : "",
 end_at: dateRangeEnd ? new Date(dateRangeEnd).toISOString() : "",
 });
 if (selectedProject !== "all") params.set("project_id", selectedProject);
 if (selectedStatus !== "all") params.set("status", selectedStatus);
 if (selectedType !== "all") params.set("event_type", selectedType);
 if (searchTerm) params.set("search", searchTerm);

 const response = await fetch(`/api/v1/programming/events?${params.toString()}`);
 if (!response.ok) throw new Error("Failed to load events");
 const json = await response.json();
 setEvents(json.data ?? []);
 } catch (error) {
 console.error("Failed to load programming events", error);
 toast.error("Failed to load programming events");
 } finally {
 setLoading(false);
 }
 }, [dateRangeStart, dateRangeEnd, searchTerm, selectedProject, selectedStatus, selectedType]);

 useEffect(() => {
 loadEvents();
 }, [loadEvents]);

 useEffect(() => {
 const channel = supabase
 .channel(`programming-events-${orgId}`)
 .on(
 'postgres_changes',
 {
 event: '*',
 schema: 'public',
 table: 'programming_events',
 filter: `organization_id=eq.${orgId}`,
 },
 () => {
 loadEvents();
 },
 )
 .subscribe();

 return () => {
 supabase.removeChannel(channel);
 };
 }, [supabase, orgId, loadEvents]);

 const openCreateDrawer = () => {
 setActiveEvent(null);
 setCreateOpen(true);
 };

 const openEditDrawer = (event: ProgrammingEvent) => {
 setActiveEvent(event);
 setEditOpen(true);
 };

 const openViewDrawer = (event: ProgrammingEvent) => {
 setActiveEvent(event);
 setViewOpen(true);
 };

 const handleDelete = async (event: ProgrammingEvent) => {
 if (!confirm(`Delete event "${event.title}"?`)) return;
 try {
 const res = await fetch(`/api/v1/programming/events/${event.id}`, { method: 'DELETE' });
 if (!res.ok) throw new Error('Delete failed');
 toast.success('Event deleted');
 loadEvents();
 } catch (error) {
 console.error('Failed to delete event', error);
 toast.error('Failed to delete event');
 }
 };

 const selectedEventsList = useMemo(() => events.filter((event) => selectedEvents.has(event.id)), [events, selectedEvents]);

 const clearSelection = () => setSelectedEvents(new Set());

 const toggleSelection = (id: string) => {
 setSelectedEvents((prev: unknown) => {
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
 if (selectedEvents.size === 0) return;
 if (!confirm(`Delete ${selectedEvents.size} selected events?`)) return;

 try {
 await Promise.all(
 Array.from(selectedEvents).map((id) => fetch(`/api/v1/programming/events/${id}`, { method: 'DELETE' })),
 );
 toast.success('Selected events deleted');
 clearSelection();
 loadEvents();
 } catch (error) {
 console.error('Bulk delete failed', error);
 toast.error('Failed to delete selected events');
 }
 };

 const renderView = () => {
 switch (viewType) {
 case 'board':
 return (
 <ProgrammingCalendarBoardView
 events={filteredEvents}
 selected={selectedEvents}
 onSelect={toggleSelection}
 onView={openViewDrawer}
 onEdit={openEditDrawer}
 onDelete={handleDelete}
 />
 );
 case 'list':
 return (
 <ProgrammingCalendarListView
 events={filteredEvents}
 selected={selectedEvents}
 onSelect={toggleSelection}
 onView={openViewDrawer}
 onEdit={openEditDrawer}
 onDelete={handleDelete}
 />
 );
 case 'timeline':
 return <ProgrammingCalendarTimelineView events={filteredEvents} onView={openViewDrawer} onEdit={openEditDrawer} />;
 case 'calendar':
 default:
 return <ProgrammingCalendarGridView events={filteredEvents} onView={openViewDrawer} onEdit={openEditDrawer} />;
 }
 };

 return (
 <div className="space-y-lg">
 <div className="flex flex-col gap-md lg:flex-row lg:items-center lg:justify-between">
 <div className="flex flex-1 flex-wrap items-center gap-sm">
 <div className="relative w-full max-w-md">
 <Input
 placeholder="Search events..."
 value={searchTerm}
 onChange={(event) => setSearchTerm(event.target.value)}
 className="pl-9"
 />
 <Filter className="absolute left-3 top-xs/2 h-icon-xs w-icon-xs -translate-y-1/2 text-muted-foreground" />
 </div>

 <Select value={selectedProject} onValueChange={setSelectedProject}>
 <option value="all">All Projects</option>
 {projects.map((project) => (
 <option key={project.id} value={project.id}>
 {project.name}
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
 {Object.entries(EVENT_TYPE_LABEL).map(([key, label]) => (
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

 <Button variant="outline" size="sm" onClick={loadEvents} disabled={loading}>
 <RefreshCcw className="mr-2 h-icon-xs w-icon-xs" />
 Refresh
 </Button>
 </div>

 <div className="flex items-center gap-sm">
 {selectedEvents.size > 0 ? (
 <>
 <DropdownMenu>
 <DropdownMenuTrigger asChild>
 <Button variant="outline" size="sm">
 Bulk actions ({selectedEvents.size})
 </Button>
 </DropdownMenuTrigger>
 <DropdownMenuContent>
 <DropdownMenuItem onClick={bulkDelete}>
 <Trash2 className="mr-2 h-icon-xs w-icon-xs" />
 Delete selected
 </DropdownMenuItem>
 <DropdownMenuItem onClick={clearSelection}>
 Clear selection
 </DropdownMenuItem>
 </DropdownMenuContent>
 </DropdownMenu>
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
 <Icon className="h-icon-xs w-icon-xs" />
 <span className="sr-only">{option.label}</span>
 </Button>
 );
 })}
 </div>

 <Button onClick={openCreateDrawer}>
 <Plus className="mr-2 h-icon-xs w-icon-xs" />
 Create Event
 </Button>
 </div>
 </div>

 <Card className="p-lg">
 {loading ? (
 <div className="flex min-h-modal-sm items-center justify-center text-muted-foreground">
 Loading programming events...
 </div>
 ) : filteredEvents.length === 0 ? (
 <div className="flex min-h-modal-sm flex-col items-center justify-center gap-md text-center">
 <CalendarIcon className="h-icon-2xl w-icon-2xl text-muted-foreground" />
 <div className="space-y-xs">
 <h3 className="text-heading-5">No events found</h3>
 <p className="text-body-sm text-muted-foreground">
 {searchTerm || selectedStatus !== "all" || selectedType !== "all"
 ? "Try adjusting your filters or search"
 : "Create your first programming event to get started"}
 </p>
 </div>
 <Button onClick={openCreateDrawer}>
 <Plus className="mr-2 h-icon-xs w-icon-xs" />
 Create Event
 </Button>
 </div>
 ) : (
 renderView()
 )}
 </Card>

 <CreateProgrammingEventDrawer
 open={createOpen}
 onClose={() => setCreateOpen(false)}
 orgId={orgId}
 currentUserId={currentUserId}
 projects={projects}
 onSuccess={() => {
 loadEvents();
 router.refresh();
 }}
 />

 {activeEvent ? (
 <>
 <EditProgrammingEventDrawer
 open={editOpen}
 onClose={() => setEditOpen(false)}
 event={activeEvent}
 orgId={orgId}
 currentUserId={currentUserId}
 projects={projects}
 onSuccess={() => {
 loadEvents();
 router.refresh();
 }}
 />
 <ViewProgrammingEventDrawer
 open={viewOpen}
 onClose={() => setViewOpen(false)}
 event={activeEvent}
 onEdit={() => {
 setViewOpen(false);
 setEditOpen(true);
 }}
 onDelete={() => {
 setViewOpen(false);
 handleDelete(activeEvent);
 }}
 users={users}
 />
 </>
 ) : null}
 </div>
 );
}

export { STATUS_BADGE, EVENT_TYPE_LABEL };
