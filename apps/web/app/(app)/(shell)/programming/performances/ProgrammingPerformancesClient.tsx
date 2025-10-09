"use client";

import { Plus, Search, Filter, Download, Upload, MoreHorizontal, List, Grid3X3, Calendar, BarChart3, Trash2 } from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from 'react';
import { createBrowserClient } from "@ghxstship/auth";
import {
  Badge,
  Button,
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  EmptyState,
  Input,
  Select,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@ghxstship/ui";
import type {
 ProgrammingPerformance,
 PerformanceFilters,
 PerformanceSort,
 ViewType,
 PerformanceProject,
 PerformanceEvent
} from "./types";
import { STATUS_BADGE, PERFORMANCE_TYPE_BADGE, VIEW_CONFIG } from "./types";

// Import view components
import ProgrammingPerformancesListView from "./views/ProgrammingPerformancesListView";
import ProgrammingPerformancesGridView from "./views/ProgrammingPerformancesGridView";
import ProgrammingPerformancesTimelineView from "./views/ProgrammingPerformancesTimelineView";
import ProgrammingPerformancesAnalyticsView from "./views/ProgrammingPerformancesAnalyticsView";

// Import drawer components
import CreateProgrammingPerformanceDrawer from "./drawers/CreateProgrammingPerformanceDrawer";
import EditProgrammingPerformanceDrawer from "./drawers/EditProgrammingPerformanceDrawer";
import ViewProgrammingPerformanceDrawer from "./drawers/ViewProgrammingPerformanceDrawer";

type User = {
 id: string;
 email: string;
 full_name?: string | null;
 avatar_url?: string | null;
};

type ProgrammingPerformancesClientProps = {
 orgId: string;
 currentUserId: string;
 initialPerformances: ProgrammingPerformance[];
 projects: PerformanceProject[];
 events: PerformanceEvent[];
 users: User[];
};

export default function ProgrammingPerformancesClient({
 orgId,
 currentUserId,
 initialPerformances,
 projects,
 events,
 users
}: ProgrammingPerformancesClientProps) {
 const supabase = useMemo(() => createBrowserClient(), []);

 // State management
 const [performances, setPerformances] = useState<ProgrammingPerformance[]>(initialPerformances);
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [selectedPerformances, setSelectedPerformances] = useState<Set<string>(new Set());
 const [currentView, setCurrentView] = useState<ViewType>("list");

 // Filter and search state
 const [filters, setFilters] = useState<PerformanceFilters>({});
 const [searchTerm, setSearchTerm] = useState("");
 const [sortConfig, setSortConfig] = useState<PerformanceSort>({
 field: "starts_at",
 direction: "asc"
 });

 // Drawer state
 const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
 const [editDrawerOpen, setEditDrawerOpen] = useState(false);
 const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
 const [selectedPerformance, setSelectedPerformance] = useState<ProgrammingPerformance | null>(null);

 // Real-time subscription
 useEffect(() => {
 const channel = supabase
 .channel(`programming_performances_${orgId}`)
 .on(
 "postgres_changes",
 {
 event: "*",
 schema: "public",
 table: "programming_performances",
 filter: `organization_id=eq.${orgId}`
 },
 (payload) => {
 if (payload.eventType === "INSERT") {
 setPerformances((prev: unknown) => [payload.new as ProgrammingPerformance, ...prev]);
 } else if (payload.eventType === "UPDATE") {
 setPerformances((prev: unknown) =>
 prev.map((performance) =>
 performance.id === payload.new.id ? (payload.new as ProgrammingPerformance) : performance
 )
 );
 } else if (payload.eventType === "DELETE") {
 setPerformances((prev: unknown) => prev.filter((performance) => performance.id !== payload.old.id));
 setSelectedPerformances((prev: unknown) => {
 const newSet = new Set(prev);
 newSet.delete(payload.old.id);
 return newSet;
 });
 }
 })
 .subscribe();

 return () => {
 supabase.removeChannel(channel);
 };
  }, [supabase, orgId, setSelectedPerformances]);

 // Data fetching
 const fetchPerformances = useCallback(async () => {
 try {
 setLoading(true);
 setError(null);

 const params = new URLSearchParams();
 if (filters.event_id) params.append("event_id", filters.event_id);
 if (filters.project_id) params.append("project_id", filters.project_id);
 if (filters.status) params.append("status", filters.status);
 if (filters.performance_type) params.append("performance_type", filters.performance_type);
 if (filters.venue) params.append("venue", filters.venue);
 if (filters.start_date) params.append("start_date", filters.start_date);
 if (filters.end_date) params.append("end_date", filters.end_date);
 if (searchTerm) params.append("search", searchTerm);

 const response = await fetch(`/api/v1/programming/performances?${params}`);
 if (!response.ok) {
 throw new Error("Failed to fetch performances");
 }

 const data = await response.json();
 setPerformances(data);
 } catch (err) {
 console.error("Error fetching performances:", err);
 setError(err instanceof Error ? err.message : "Failed to fetch performances");
 } finally {
 setLoading(false);
 }
 }, [filters, searchTerm]);

 // Filtered and sorted performances
 const processedPerformances = useMemo(() => {
 let filtered = [...performances];

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
 }, [performances, sortConfig]);

 // Event handlers
 const handleCreatePerformance = () => {
 setCreateDrawerOpen(true);
 };

 const handleEditPerformance = (performance: ProgrammingPerformance) => {
 setSelectedPerformance(performance);
 setEditDrawerOpen(true);
 };

 const handleViewPerformance = (performance: ProgrammingPerformance) => {
 setSelectedPerformance(performance);
 setViewDrawerOpen(true);
 };

 const handleDeletePerformance = async (performance: ProgrammingPerformance) => {
 if (!confirm(`Are you sure you want to delete "${performance.name}"?`)) {
 return;
 }

 try {
 const response = await fetch(`/api/v1/programming/performances/${performance.id}`, {
 method: "DELETE"
 });

 if (!response.ok) {
 throw new Error("Failed to delete performance");
 }

 // Optimistic update - real-time subscription will handle the actual update
 setPerformances((prev: unknown) => prev.filter((p) => p.id !== performance.id));
 } catch (err) {
 console.error("Error deleting performance:", err);
 setError(err instanceof Error ? err.message : "Failed to delete performance");
 }
 };

 const handleBulkDelete = async () => {
 if (selectedPerformances.size === 0) return;

 if (!confirm(`Are you sure you want to delete ${selectedPerformances.size} performances?`)) {
 return;
 }

 try {
 await Promise.all(
 Array.from(selectedPerformances).map((id) =>
 fetch(`/api/v1/programming/performances/${id}`, { method: "DELETE" })
 )
 );

 setSelectedPerformances(new Set());
 } catch (err) {
 console.error("Error bulk deleting performances:", err);
 setError("Failed to delete some performances");
 }
 };

 const handleSuccess = () => {
 fetchPerformances();
 };

 const handleSelectionChange = (id: string, selected: boolean) => {
 setSelectedPerformances((prev: unknown) => {
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
 setSelectedPerformances(new Set(processedPerformances.map((p) => p.id)));
 } else {
 setSelectedPerformances(new Set());
 }
 };

 // Get unique venues for filter dropdown
 const uniqueVenues = useMemo(() => {
 const venues = performances
 .map((performance) => performance.venue)
 .filter((venue): venue is string => Boolean(venue));
 return Array.from(new Set(venues)).sort();
 }, [performances]);

 // View component props
 const viewProps = {
 performances: processedPerformances,
 loading,
 selectedPerformances,
 onSelectionChange: handleSelectionChange,
 onSelectAll: handleSelectAll,
 onEdit: handleEditPerformance,
 onView: handleViewPerformance,
 onDelete: handleDeletePerformance,
 sortConfig,
 onSort: setSortConfig,
 users,
 projects,
 events
 };

 return (
 <div className="space-y-lg">
 {/* Header */}
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-heading-3 font-semibold">Programming Performances</h1>
 <p className="text-body-sm text-muted-foreground">
 Manage shows, concerts, and live performances
 </p>
 </div>
 <Button onClick={handleCreatePerformance}>
 <Plus className="mr-2 h-icon-xs w-icon-xs" />
 Create Performance
 </Button>
 </div>

 {/* Filters and Search */}
 <div className="flex flex-col gap-md lg:flex-row lg:items-center lg:justify-between">
 <div className="flex flex-1 items-center gap-sm">
 <div className="relative flex-1 max-w-md">
 <Search className="absolute left-3 top-xs/2 h-icon-xs w-icon-xs -translate-y-1/2 text-muted-foreground" />
 <Input
 placeholder="Search performances, venues, descriptions..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className="pl-10"
 />
 </div>
 
 <Select
 value={filters.status || ""}
 onChange={(e) =>
 setFilters((prev: unknown) => ({ ...prev, status: e.target.value || undefined }))
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
 value={filters.performance_type || ""}
 onChange={(e) =>
 setFilters((prev: unknown) => ({ ...prev, performance_type: e.target.value || undefined }))
 }
 >
 <option value="">All Types</option>
 {Object.entries(PERFORMANCE_TYPE_BADGE).map(([value, config]) => (
 <option key={value} value={value}>
 {config.label}
 </option>
 ))}
 </Select>

 <Select
 value={filters.event_id || ""}
 onChange={(e) =>
 setFilters((prev: unknown) => ({ ...prev, event_id: e.target.value || undefined }))
 }
 >
 <option value="">All Events</option>
 {events.map((event) => (
 <option key={event.id} value={event.id}>
 {event.title}
 </option>
 ))}
 </Select>

 {uniqueVenues.length > 0 && (
 <Select
 value={filters.venue || ""}
 onChange={(e) =>
 setFilters((prev: unknown) => ({ ...prev, venue: e.target.value || undefined }))
 }
 >
 <option value="">All Venues</option>
 {uniqueVenues.map((venue) => (
 <option key={venue} value={venue}>
 {venue}
 </option>
 ))}
 </Select>
 )}
 </div>

 <div className="flex items-center gap-sm">
 {selectedPerformances.size > 0 && (
 <div className="flex items-center gap-sm">
 <span className="text-sm text-muted-foreground">
 {selectedPerformances.size} selected
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
 <Tabs value={currentView} onChange={(e) => setCurrentView(e.target.value as ViewType)}>
 <TabsList>
 <TabsTrigger value="list">
 <List className="mr-2 h-icon-xs w-icon-xs" />
 List
 </TabsTrigger>
 <TabsTrigger value="grid">
 <Grid3X3 className="mr-2 h-icon-xs w-icon-xs" />
 Grid
 </TabsTrigger>
 <TabsTrigger value="timeline">
 <Calendar className="mr-2 h-icon-xs w-icon-xs" />
 Timeline
 </TabsTrigger>
 <TabsTrigger value="analytics">
 <BarChart3 className="mr-2 h-icon-xs w-icon-xs" />
 Analytics
 </TabsTrigger>
 </TabsList>

 <TabsContent value="list" className="mt-lg">
 <ProgrammingPerformancesListView {...viewProps} />
 </TabsContent>

 <TabsContent value="grid" className="mt-lg">
 <ProgrammingPerformancesGridView {...viewProps} />
 </TabsContent>

 <TabsContent value="timeline" className="mt-lg">
 <ProgrammingPerformancesTimelineView {...viewProps} />
 </TabsContent>

 <TabsContent value="analytics" className="mt-lg">
 <ProgrammingPerformancesAnalyticsView {...viewProps} />
 </TabsContent>
 </Tabs>

 {/* Error Display */}
 {error && (
 <div className="rounded-md bg-destructive/15 p-md">
 <p className="text-sm text-destructive">{error}</p>
 </div>
 )}

 {/* Empty State */}
 {!loading && processedPerformances.length === 0 && (
 <EmptyState
 title="No performances found"
 description="Get started by creating your first performance"
 action={
 <Button onClick={handleCreatePerformance}>
 <Plus className="mr-2 h-icon-xs w-icon-xs" />
 Create Performance
 </Button>
 }
 />
 )}

 {/* Drawers */}
 <CreateProgrammingPerformanceDrawer
 open={createDrawerOpen}
 onClose={() => setCreateDrawerOpen(false)}
 orgId={orgId}
 currentUserId={currentUserId}
 projects={projects}
 events={events}
 onSuccess={handleSuccess}
 />

 {selectedPerformance && (
 <>
 <EditProgrammingPerformanceDrawer
 open={editDrawerOpen}
 onClose={() => setEditDrawerOpen(false)}
 performance={selectedPerformance}
 orgId={orgId}
 currentUserId={currentUserId}
 projects={projects}
 events={events}
 onSuccess={handleSuccess}
 />

 <ViewProgrammingPerformanceDrawer
 open={viewDrawerOpen}
 onClose={() => setViewDrawerOpen(false)}
 performance={selectedPerformance}
 onEdit={() => {
 setViewDrawerOpen(false);
 setEditDrawerOpen(true);
 }}
 onDelete={() => {
 setViewDrawerOpen(false);
 handleDeletePerformance(selectedPerformance);
 }}
 users={users}
 projects={projects}
 events={events}
 />
 </>
 )}
 </div>
 );
}
