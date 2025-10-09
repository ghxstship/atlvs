"use client";

import { Calendar, Clock, Download, Filter, Grid3X3, List, MoreHorizontal, Plus, Search, Trash2, Upload } from "lucide-react";
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
 ProgrammingLineup,
 LineupFilters,
 LineupSort,
 ViewType,
 LineupProject,
 LineupEvent,
 LineupStatus,
 PerformerType
} from "./types";
import { STATUS_BADGE, PERFORMER_TYPE_BADGE, VIEW_CONFIG } from "./types";

// Import view components
import ProgrammingLineupsListView from "./views/ProgrammingLineupsListView";
import ProgrammingLineupsGridView from "./views/ProgrammingLineupsGridView";
import ProgrammingLineupsTimelineView from "./views/ProgrammingLineupsTimelineView";
import ProgrammingLineupsScheduleView from "./views/ProgrammingLineupsScheduleView";

// Import drawer components
import CreateProgrammingLineupDrawer from "./drawers/CreateProgrammingLineupDrawer";
import EditProgrammingLineupDrawer from "./drawers/EditProgrammingLineupDrawer";
import ViewProgrammingLineupDrawer from "./drawers/ViewProgrammingLineupDrawer";

type User = {
 id: string;
 email: string;
 full_name?: string | null;
 avatar_url?: string | null;
};

type ProgrammingLineupsClientProps = {
 orgId: string;
 currentUserId: string;
 initialLineups: ProgrammingLineup[];
 projects: LineupProject[];
 events: LineupEvent[];
 users: User[];
};

export default function ProgrammingLineupsClient({
 orgId,
 currentUserId,
 initialLineups,
 projects,
 events,
 users
}: ProgrammingLineupsClientProps) {
 const supabase = useMemo(() => createBrowserClient(), []);

 // State management
 const [lineups, setLineups] = useState<ProgrammingLineup[]>(initialLineups);
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [selectedLineups, setSelectedLineups] = useState<Set<string>(new Set());
 const [currentView, setCurrentView] = useState<ViewType>("list");

 // Filter and search state
 const [filters, setFilters] = useState<LineupFilters>({});
 const [searchTerm, setSearchTerm] = useState("");
 const [sortConfig, setSortConfig] = useState<LineupSort>({
 field: "set_time",
 direction: "asc"
 });

 // Drawer state
 const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
 const [editDrawerOpen, setEditDrawerOpen] = useState(false);
 const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
 const [selectedLineup, setSelectedLineup] = useState<ProgrammingLineup | null>(null);

 // Real-time subscription
 useEffect(() => {
 const channel = supabase
 .channel(`programming_lineups_${orgId}`)
 .on(
 "postgres_changes",
 {
 event: "*",
 schema: "public",
 table: "programming_lineups",
 filter: `organization_id=eq.${orgId}`
 },
 (payload) => {
 if (payload.eventType === "INSERT") {
 setLineups((prev: unknown) => [payload.new as ProgrammingLineup, ...prev]);
 } else if (payload.eventType === "UPDATE") {
 setLineups((prev: unknown) =>
 prev.map((lineup) =>
 lineup.id === payload.new.id ? (payload.new as ProgrammingLineup) : lineup
 )
 );
 } else if (payload.eventType === "DELETE") {
 setLineups((prev: unknown) => prev.filter((lineup) => lineup.id !== payload.old.id));
 setSelectedLineups((prev: unknown) => {
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
  }, [supabase, orgId, setSelectedLineups]);

 // Data fetching
 const fetchLineups = useCallback(async () => {
 try {
 setLoading(true);
 setError(null);

 const params = new URLSearchParams();
 if (filters.event_id) params.append("event_id", filters.event_id);
 if (filters.project_id) params.append("project_id", filters.project_id);
 if (filters.status) params.append("status", filters.status);
 if (filters.performer_type) params.append("performer_type", filters.performer_type);
 if (filters.stage) params.append("stage", filters.stage);
 if (searchTerm) params.append("search", searchTerm);

 const response = await fetch(`/api/v1/programming/lineups?${params}`);
 if (!response.ok) {
 throw new Error("Failed to fetch lineups");
 }

 const data = await response.json();
 setLineups(data);
 } catch (err) {
 console.error("Error fetching lineups:", err);
 setError(err instanceof Error ? err.message : "Failed to fetch lineups");
 } finally {
 setLoading(false);
 }
 }, [filters, searchTerm]);

 // Filtered and sorted lineups
 const processedLineups = useMemo(() => {
 let filtered = [...lineups];

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
 }, [lineups, sortConfig]);

 // Event handlers
 const handleCreateLineup = () => {
 setCreateDrawerOpen(true);
 };

 const handleEditLineup = (lineup: ProgrammingLineup) => {
 setSelectedLineup(lineup);
 setEditDrawerOpen(true);
 };

 const handleViewLineup = (lineup: ProgrammingLineup) => {
 setSelectedLineup(lineup);
 setViewDrawerOpen(true);
 };

 const handleDeleteLineup = async (lineup: ProgrammingLineup) => {
 if (!confirm(`Are you sure you want to delete "${lineup.performer_name}"?`)) {
 return;
 }

 try {
 const response = await fetch(`/api/v1/programming/lineups/${lineup.id}`, {
 method: "DELETE"
 });

 if (!response.ok) {
 throw new Error("Failed to delete lineup");
 }

 // Optimistic update - real-time subscription will handle the actual update
 setLineups((prev: unknown) => prev.filter((l) => l.id !== lineup.id));
 } catch (err) {
 console.error("Error deleting lineup:", err);
 setError(err instanceof Error ? err.message : "Failed to delete lineup");
 }
 };

 const handleBulkDelete = async () => {
 if (selectedLineups.size === 0) return;

 if (!confirm(`Are you sure you want to delete ${selectedLineups.size} lineups?`)) {
 return;
 }

 try {
 await Promise.all(
 Array.from(selectedLineups).map((id) =>
 fetch(`/api/v1/programming/lineups/${id}`, { method: "DELETE" })
 )
 );

 setSelectedLineups(new Set());
 } catch (err) {
 console.error("Error bulk deleting lineups:", err);
 setError("Failed to delete some lineups");
 }
 };

 const handleSuccess = () => {
 fetchLineups();
 };

 const handleSelectionChange = (id: string, selected: boolean) => {
 setSelectedLineups((prev: unknown) => {
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
 setSelectedLineups(new Set(processedLineups.map((l) => l.id)));
 } else {
 setSelectedLineups(new Set());
 }
 };

 // Get unique stages for filter dropdown
 const uniqueStages = useMemo(() => {
 const stages = lineups
 .map((lineup) => lineup.stage)
 .filter((stage): stage is string => Boolean(stage));
 return Array.from(new Set(stages)).sort();
 }, [lineups]);

 // View component props
 const viewProps = {
 lineups: processedLineups,
 loading,
 selectedLineups,
 onSelectionChange: handleSelectionChange,
 onSelectAll: handleSelectAll,
 onEdit: handleEditLineup,
 onView: handleViewLineup,
 onDelete: handleDeleteLineup,
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
 <h1 className="text-heading-3 font-semibold">Programming Lineups</h1>
 <p className="text-body-sm text-muted-foreground">
 Manage performers, schedules, and event lineups
 </p>
 </div>
 <Button onClick={handleCreateLineup}>
 <Plus className="mr-2 h-icon-xs w-icon-xs" />
 Add Performer
 </Button>
 </div>

 {/* Filters and Search */}
 <div className="flex flex-col gap-md lg:flex-row lg:items-center lg:justify-between">
 <div className="flex flex-1 items-center gap-sm">
 <div className="relative flex-1 max-w-md">
 <Search className="absolute left-3 top-xs/2 h-icon-xs w-icon-xs -translate-y-1/2 text-muted-foreground" />
 <Input
 placeholder="Search performers, roles, stages..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className="pl-10"
 />
 </div>
 
 <Select
 value={filters.status || ""}
 onChange={(e) =>
 setFilters((prev: unknown) => ({
 ...prev,
 status: value ? (e.target.value as LineupStatus) : undefined
 }))
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
 value={filters.performer_type || ""}
 onChange={(e) =>
 setFilters((prev: unknown) => ({
 ...prev,
 performer_type: value ? (e.target.value as PerformerType) : undefined
 }))
 }
 >
 <option value="">All Types</option>
 {Object.entries(PERFORMER_TYPE_BADGE).map(([value, config]) => (
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

 {uniqueStages.length > 0 && (
 <Select
 value={filters.stage || ""}
 onChange={(e) =>
 setFilters((prev: unknown) => ({ ...prev, stage: e.target.value || undefined }))
 }
 >
 <option value="">All Stages</option>
 {uniqueStages.map((stage) => (
 <option key={stage} value={stage}>
 {stage}
 </option>
 ))}
 </Select>
 )}
 </div>

 <div className="flex items-center gap-sm">
 {selectedLineups.size > 0 && (
 <div className="flex items-center gap-sm">
 <span className="text-sm text-muted-foreground">
 {selectedLineups.size} selected
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
 <TabsTrigger value="schedule">
 <Clock className="mr-2 h-icon-xs w-icon-xs" />
 Schedule
 </TabsTrigger>
 </TabsList>

 <TabsContent value="list" className="mt-lg">
 <ProgrammingLineupsListView {...viewProps} />
 </TabsContent>

 <TabsContent value="grid" className="mt-lg">
 <ProgrammingLineupsGridView {...viewProps} />
 </TabsContent>

 <TabsContent value="timeline" className="mt-lg">
 <ProgrammingLineupsTimelineView {...viewProps} />
 </TabsContent>

 <TabsContent value="schedule" className="mt-lg">
 <ProgrammingLineupsScheduleView {...viewProps} />
 </TabsContent>
 </Tabs>

 {/* Error Display */}
 {error && (
 <div className="rounded-md bg-destructive/15 p-md">
 <p className="text-sm text-destructive">{error}</p>
 </div>
 )}

 {/* Empty State */}
 {!loading && processedLineups.length === 0 && (
 <EmptyState
 title="No lineups found"
 description="Get started by adding your first performer"
 primaryAction={{
 label: "Add Performer",
 onClick: handleCreateLineup,
 icon: <Plus className="h-icon-xs w-icon-xs" /> 
 }}
 />
 )}

 {/* Drawers */}
 <CreateProgrammingLineupDrawer
 open={createDrawerOpen}
 onClose={() => setCreateDrawerOpen(false)}
 orgId={orgId}
 currentUserId={currentUserId}
 projects={projects}
 events={events}
 onSuccess={handleSuccess}
 />

 {selectedLineup && (
 <>
 <EditProgrammingLineupDrawer
 open={editDrawerOpen}
 onClose={() => setEditDrawerOpen(false)}
 lineup={selectedLineup}
 orgId={orgId}
 currentUserId={currentUserId}
 projects={projects}
 events={events}
 onSuccess={handleSuccess}
 />

 <ViewProgrammingLineupDrawer
 open={viewDrawerOpen}
 onClose={() => setViewDrawerOpen(false)}
 lineup={selectedLineup}
 onEdit={() => {
 setViewDrawerOpen(false);
 setEditDrawerOpen(true);
 }}
 onDelete={() => {
 setViewDrawerOpen(false);
 handleDeleteLineup(selectedLineup);
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
