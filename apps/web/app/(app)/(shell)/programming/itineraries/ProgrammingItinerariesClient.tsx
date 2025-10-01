"use client";

import { Plus, Search, Filter, Download, Upload, MoreHorizontal, Calendar, List, Map, Timeline, Trash2 } from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { createBrowserClient } from "@ghxstship/auth";
import {
 Button,
 Input,
 Select,
 Tabs,
 TabsList,
 TabsTrigger,
 TabsContent,
 Badge,
 EmptyState,
} from "@ghxstship/ui";
import type {
 ProgrammingItinerary,
 ItineraryFilters,
 ItinerarySort,
 ViewType,
 ItineraryProject,
 ItineraryEvent,
} from "./types";
import { STATUS_BADGE, TYPE_BADGE, VIEW_CONFIG } from "./types";

// Import view components
import ProgrammingItinerariesListView from "./views/ProgrammingItinerariesListView";
import ProgrammingItinerariesTimelineView from "./views/ProgrammingItinerariesTimelineView";
import ProgrammingItinerariesCalendarView from "./views/ProgrammingItinerariesCalendarView";
import ProgrammingItinerariesMapView from "./views/ProgrammingItinerariesMapView";

// Import drawer components
import CreateProgrammingItineraryDrawer from "./drawers/CreateProgrammingItineraryDrawer";
import EditProgrammingItineraryDrawer from "./drawers/EditProgrammingItineraryDrawer";
import ViewProgrammingItineraryDrawer from "./drawers/ViewProgrammingItineraryDrawer";

type User = {
 id: string;
 email: string;
 full_name?: string | null;
 avatar_url?: string | null;
};

type ProgrammingItinerariesClientProps = {
 orgId: string;
 currentUserId: string;
 initialItineraries: ProgrammingItinerary[];
 projects: ItineraryProject[];
 events: ItineraryEvent[];
 users: User[];
};

export default function ProgrammingItinerariesClient({
 orgId,
 currentUserId,
 initialItineraries,
 projects,
 events,
 users,
}: ProgrammingItinerariesClientProps) {
 const supabase = useMemo(() => createBrowserClient(), []);

 // State management
 const [itineraries, setItineraries] = useState<ProgrammingItinerary[]>(initialItineraries);
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [selectedItineraries, setSelectedItineraries] = useState<Set<string>(new Set());
 const [currentView, setCurrentView] = useState<ViewType>("list");

 // Filter and search state
 const [filters, setFilters] = useState<ItineraryFilters>({});
 const [searchTerm, setSearchTerm] = useState("");
 const [sortConfig, setSortConfig] = useState<ItinerarySort>({
 field: "start_date",
 direction: "asc",
 });

 // Drawer state
 const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
 const [editDrawerOpen, setEditDrawerOpen] = useState(false);
 const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
 const [selectedItinerary, setSelectedItinerary] = useState<ProgrammingItinerary | null>(null);

 // Real-time subscription
 useEffect(() => {
 const channel = supabase
 .channel(`programming_itineraries_${orgId}`)
 .on(
 "postgres_changes",
 {
 event: "*",
 schema: "public",
 table: "programming_itineraries",
 filter: `organization_id=eq.${orgId}`,
 },
 (payload) => {
 if (payload.eventType === "INSERT") {
 setItineraries((prev: unknown) => [payload.new as ProgrammingItinerary, ...prev]);
 } else if (payload.eventType === "UPDATE") {
 setItineraries((prev: unknown) =>
 prev.map((itinerary) =>
 itinerary.id === payload.new.id ? (payload.new as ProgrammingItinerary) : itinerary
 )
 );
 } else if (payload.eventType === "DELETE") {
 setItineraries((prev: unknown) => prev.filter((itinerary) => itinerary.id !== payload.old.id));
 setSelectedItineraries((prev: unknown) => {
 const newSet = new Set(prev);
 newSet.delete(payload.old.id);
 return newSet;
 });
 }
 }
 )
 .subscribe();

 return () => {
 supabase.removeChannel(channel);
 };
 }, [supabase, orgId]);

 // Data fetching
 const fetchItineraries = useCallback(async () => {
 try {
 setLoading(true);
 setError(null);

 const params = new URLSearchParams();
 if (filters.project_id) params.append("project_id", filters.project_id);
 if (filters.event_id) params.append("event_id", filters.event_id);
 if (filters.status) params.append("status", filters.status);
 if (filters.type) params.append("type", filters.type);
 if (filters.start_date) params.append("start_date", filters.start_date);
 if (filters.end_date) params.append("end_date", filters.end_date);
 if (searchTerm) params.append("search", searchTerm);

 const response = await fetch(`/api/v1/programming/itineraries?${params}`);
 if (!response.ok) {
 throw new Error("Failed to fetch itineraries");
 }

 const data = await response.json();
 setItineraries(data);
 } catch (err) {
 console.error("Error fetching itineraries:", err);
 setError(err instanceof Error ? err.message : "Failed to fetch itineraries");
 } finally {
 setLoading(false);
 }
 }, [filters, searchTerm]);

 // Filtered and sorted itineraries
 const processedItineraries = useMemo(() => {
 let filtered = [...itineraries];

 // Apply sorting
 filtered.sort((a, b) => {
 const aValue = a[sortConfig.field];
 const bValue = b[sortConfig.field];
 
 if (aValue === null || aValue === undefined) return 1;
 if (bValue === null || bValue === undefined) return -1;
 
 if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
 if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
 return 0;
 });

 return filtered;
 }, [itineraries, sortConfig]);

 // Event handlers
 const handleCreateItinerary = () => {
 setCreateDrawerOpen(true);
 };

 const handleEditItinerary = (itinerary: ProgrammingItinerary) => {
 setSelectedItinerary(itinerary);
 setEditDrawerOpen(true);
 };

 const handleViewItinerary = (itinerary: ProgrammingItinerary) => {
 setSelectedItinerary(itinerary);
 setViewDrawerOpen(true);
 };

 const handleDeleteItinerary = async (itinerary: ProgrammingItinerary) => {
 if (!confirm(`Are you sure you want to delete "${itinerary.name}"?`)) {
 return;
 }

 try {
 const response = await fetch(`/api/v1/programming/itineraries/${itinerary.id}`, {
 method: "DELETE",
 });

 if (!response.ok) {
 throw new Error("Failed to delete itinerary");
 }

 // Optimistic update - real-time subscription will handle the actual update
 setItineraries((prev: unknown) => prev.filter((e) => e.id !== itinerary.id));
 } catch (err) {
 console.error("Error deleting itinerary:", err);
 setError(err instanceof Error ? err.message : "Failed to delete itinerary");
 }
 };

 const handleBulkDelete = async () => {
 if (selectedItineraries.size === 0) return;

 if (!confirm(`Are you sure you want to delete ${selectedItineraries.size} itineraries?`)) {
 return;
 }

 try {
 await Promise.all(
 Array.from(selectedItineraries).map((id) =>
 fetch(`/api/v1/programming/itineraries/${id}`, { method: "DELETE" })
 )
 );

 setSelectedItineraries(new Set());
 } catch (err) {
 console.error("Error bulk deleting itineraries:", err);
 setError("Failed to delete some itineraries");
 }
 };

 const handleSuccess = () => {
 fetchItineraries();
 };

 const handleSelectionChange = (id: string, selected: boolean) => {
 setSelectedItineraries((prev: unknown) => {
 const newSet = new Set(prev);
 if (selected) {
 newSet.add(id);
 } else {
 newSet.delete(id);
 }
 return newSet;
 });
 };

 const handleSelectAll = (selected: boolean) => {
 if (selected) {
 setSelectedItineraries(new Set(processedItineraries.map((e) => e.id)));
 } else {
 setSelectedItineraries(new Set());
 }
 };

 // View component props
 const viewProps = {
 itineraries: processedItineraries,
 loading,
 selectedItineraries,
 onSelectionChange: handleSelectionChange,
 onSelectAll: handleSelectAll,
 onEdit: handleEditItinerary,
 onView: handleViewItinerary,
 onDelete: handleDeleteItinerary,
 sortConfig,
 onSort: setSortConfig,
 users,
 };

 return (
 <div className="space-y-lg">
 {/* Header */}
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-heading-3 font-semibold">Programming Itineraries</h1>
 <p className="text-body-sm text-muted-foreground">
 Manage travel plans, schedules, and logistics
 </p>
 </div>
 <Button onClick={handleCreateItinerary}>
 <Plus className="mr-2 h-icon-xs w-icon-xs" />
 Create Itinerary
 </Button>
 </div>

 {/* Filters and Search */}
 <div className="flex flex-col gap-md lg:flex-row lg:items-center lg:justify-between">
 <div className="flex flex-1 items-center gap-sm">
 <div className="relative flex-1 max-w-md">
 <Search className="absolute left-3 top-xs/2 h-icon-xs w-icon-xs -translate-y-1/2 text-muted-foreground" />
 <Input
 placeholder="Search itineraries..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className="pl-10"
 />
 </div>
 
 <Select
 value={filters.status || ""}
 onValueChange={(value) =>
 setFilters((prev: unknown) => ({ ...prev, status: value || undefined }))
 }
 >
 <option value="">All Statuses</option>
 {Object.entries(STATUS_BADGE).map(([value, config]) => (
 <option key={value} value={value}>
 {config.label}
 </option>
 ))}
 </Select>

 <Select
 value={filters.type || ""}
 onValueChange={(value) =>
 setFilters((prev: unknown) => ({ ...prev, type: value || undefined }))
 }
 >
 <option value="">All Types</option>
 {Object.entries(TYPE_BADGE).map(([value, config]) => (
 <option key={value} value={value}>
 {config.label}
 </option>
 ))}
 </Select>

 <Select
 value={filters.project_id || ""}
 onValueChange={(value) =>
 setFilters((prev: unknown) => ({ ...prev, project_id: value || undefined }))
 }
 >
 <option value="">All Projects</option>
 {projects.map((project) => (
 <option key={project.id} value={project.id}>
 {project.name}
 </option>
 ))}
 </Select>
 </div>

 <div className="flex items-center gap-sm">
 {selectedItineraries.size > 0 && (
 <div className="flex items-center gap-sm">
 <span className="text-sm text-muted-foreground">
 {selectedItineraries.size} selected
 </span>
 <Button variant="outline" size="sm" onClick={handleBulkDelete}>
 <Trash2 className="mr-2 h-icon-xs w-icon-xs" />
 Delete
 </Button>
 </div>
 )}

 <Button variant="outline" size="sm">
 <Download className="mr-2 h-icon-xs w-icon-xs" />
 Export
 </Button>
 </div>
 </div>

 {/* View Tabs */}
 <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as ViewType)}>
 <TabsList>
 <TabsTrigger value="list">
 <List className="mr-2 h-icon-xs w-icon-xs" />
 List
 </TabsTrigger>
 <TabsTrigger value="timeline">
 <Timeline className="mr-2 h-icon-xs w-icon-xs" />
 Timeline
 </TabsTrigger>
 <TabsTrigger value="calendar">
 <Calendar className="mr-2 h-icon-xs w-icon-xs" />
 Calendar
 </TabsTrigger>
 <TabsTrigger value="map">
 <Map className="mr-2 h-icon-xs w-icon-xs" />
 Map
 </TabsTrigger>
 </TabsList>

 <TabsContent value="list" className="mt-lg">
 <ProgrammingItinerariesListView {...viewProps} />
 </TabsContent>

 <TabsContent value="timeline" className="mt-lg">
 <ProgrammingItinerariesTimelineView {...viewProps} />
 </TabsContent>

 <TabsContent value="calendar" className="mt-lg">
 <ProgrammingItinerariesCalendarView {...viewProps} />
 </TabsContent>

 <TabsContent value="map" className="mt-lg">
 <ProgrammingItinerariesMapView {...viewProps} />
 </TabsContent>
 </Tabs>

 {/* Error Display */}
 {error && (
 <div className="rounded-md bg-destructive/15 p-md">
 <p className="text-sm text-destructive">{error}</p>
 </div>
 )}

 {/* Empty State */}
 {!loading && processedItineraries.length === 0 && (
 <EmptyState
 title="No itineraries found"
 description="Get started by creating your first itinerary"
 action={
 <Button onClick={handleCreateItinerary}>
 <Plus className="mr-2 h-icon-xs w-icon-xs" />
 Create Itinerary
 </Button>
 }
 />
 )}

 {/* Drawers */}
 <CreateProgrammingItineraryDrawer
 open={createDrawerOpen}
 onClose={() => setCreateDrawerOpen(false)}
 orgId={orgId}
 currentUserId={currentUserId}
 projects={projects}
 events={events}
 onSuccess={handleSuccess}
 />

 {selectedItinerary && (
 <>
 <EditProgrammingItineraryDrawer
 open={editDrawerOpen}
 onClose={() => setEditDrawerOpen(false)}
 itinerary={selectedItinerary}
 orgId={orgId}
 currentUserId={currentUserId}
 projects={projects}
 events={events}
 onSuccess={handleSuccess}
 />

 <ViewProgrammingItineraryDrawer
 open={viewDrawerOpen}
 onClose={() => setViewDrawerOpen(false)}
 itinerary={selectedItinerary}
 onEdit={() => {
 setViewDrawerOpen(false);
 setEditDrawerOpen(true);
 }}
 onDelete={() => {
 setViewDrawerOpen(false);
 handleDeleteItinerary(selectedItinerary);
 }}
 users={users}
 />
 </>
 )}
 </div>
 );
}
