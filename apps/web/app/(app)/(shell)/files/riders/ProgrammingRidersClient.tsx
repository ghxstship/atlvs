'use client';

import { Plus, Search, Filter, Download, Upload, MoreHorizontal, FileText, Mic, Utensils, Settings, Calendar as CalendarIcon, Shield, Car, Hotel, Film, Users, Grid3X3, List, BarChart3, Clock } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createBrowserClient } from '@ghxstship/auth';
import {
 Badge,
 Button,
 Card,
 DataActions,
 DataGrid,
 DataViewProvider,
 KanbanBoard,
 ListView,
 StateManagerProvider,
 ViewSwitcher,
 Input,
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
 Tabs,
 TabsContent,
 TabsList,
 TabsTrigger,
 type DataRecord
} from '@ghxstship/ui';
import type { DataViewConfig, FieldConfig, FilterConfig, SortConfig } from '@ghxstship/ui/src/components/DataViews/types';

import type {
 ProgrammingRider,
 RiderFilters,
 RiderSort,
 ViewType,
 RiderKind,
 RiderStatus,
 RiderPriority,
 RiderEvent,
 RiderProject,
 STATUS_BADGE,
 PRIORITY_BADGE,
 RIDER_KIND_BADGE
} from './types';

// Import view components
import ProgrammingRidersListView from './views/ProgrammingRidersListView';
import ProgrammingRidersGridView from './views/ProgrammingRidersGridView';
import ProgrammingRidersTimelineView from './views/ProgrammingRidersTimelineView';
import ProgrammingRidersAnalyticsView from './views/ProgrammingRidersAnalyticsView';

// Import drawer components
import CreateProgrammingRiderDrawer from './drawers/CreateProgrammingRiderDrawer';
import EditProgrammingRiderDrawer from './drawers/EditProgrammingRiderDrawer';
import ViewProgrammingRiderDrawer from './drawers/ViewProgrammingRiderDrawer';

interface User {
 id: string;
 email: string;
 full_name?: string | null;
 avatar_url?: string | null;
}

interface ProgrammingRidersClientProps {
 orgId: string;
 currentUserId: string;
 initialRiders: ProgrammingRider[];
 projects: RiderProject[];
 events: RiderEvent[];
 users: User[];
}

export default function ProgrammingRidersClient({
 orgId,
 currentUserId,
 initialRiders,
 projects,
 events,
 users
}: ProgrammingRidersClientProps) {
 const supabase = useMemo(() => createBrowserClient(), []);

 // State management
 const [riders, setRiders] = useState<ProgrammingRider[]>(initialRiders);
 const [loading, setLoading] = useState(false);
 const [selectedRiders, setSelectedRiders] = useState<string[]>([]);
 const [currentView, setCurrentView] = useState<ViewType>('list');
 const [searchQuery, setSearchQuery] = useState('');
 const [filters, setFilters] = useState<RiderFilters>({});
 const [sort, setSort] = useState<RiderSort>({ field: 'created_at', direction: 'desc' });

 // Drawer state
 const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
 const [editDrawerOpen, setEditDrawerOpen] = useState(false);
 const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
 const [selectedRider, setSelectedRider] = useState<ProgrammingRider | null>(null);

 // Real-time subscription
 useEffect(() => {
 const channel = supabase
 .channel(`programming_riders_${orgId}`)
 .on(
 'postgres_changes',
 {
 event: '*',
 schema: 'public',
 table: 'programming_riders',
 filter: `organization_id=eq.${orgId}`
 },
 (payload) => {
 if (payload.eventType === 'INSERT') {
 fetchRiders();
 } else if (payload.eventType === 'UPDATE') {
 setRiders((prev: unknown) =>
 prev.map((rider) =>
 rider.id === payload.new.id ? { ...rider, ...payload.new } : rider
 )
 );
 } else if (payload.eventType === 'DELETE') {
 setRiders((prev: unknown) => prev.filter((rider) => rider.id !== payload.old.id));
 }
 }
 )
 .subscribe();

 return () => {
 supabase.removeChannel(channel);
 };
 }, [supabase, orgId]);

 // Fetch riders with filters
 const fetchRiders = useCallback(async () => {
 try {
 setLoading(true);
 const params = new URLSearchParams();

 if (filters.event_id) params.append('event_id', filters.event_id);
 if (filters.project_id) params.append('project_id', filters.project_id);
 if (filters.kind) params.append('kind', filters.kind);
 if (filters.status) params.append('status', filters.status);
 if (filters.priority) params.append('priority', filters.priority);
 if (searchQuery) params.append('search', searchQuery);
 if (filters.start_date) params.append('start_date', filters.start_date);
 if (filters.end_date) params.append('end_date', filters.end_date);
 if (filters.fulfilled !== undefined) params.append('fulfilled', filters.fulfilled.toString());
 if (filters.approved !== undefined) params.append('approved', filters.approved.toString());

 const response = await fetch(`/api/v1/programming/riders?${params}`);
 if (!response.ok) throw new Error('Failed to fetch riders');

 const data = await response.json();
 setRiders(data);
 } catch (error) {
 console.error('Error fetching riders:', error);
 } finally {
 setLoading(false);
 }
 }, [filters, searchQuery]);

 // Trigger fetch when filters change
 useEffect(() => {
 fetchRiders();
 }, [fetchRiders]);

 // Filter and sort riders
 const filteredAndSortedRiders = useMemo(() => {
 let filtered = [...riders];

 // Apply local search if no server search
 if (searchQuery && !filters.search) {
 const query = searchQuery.toLowerCase();
 filtered = filtered.filter(
 (rider) =>
 rider.title?.toLowerCase().includes(query) ||
 rider.description?.toLowerCase().includes(query) ||
 rider.requirements?.toLowerCase().includes(query) ||
 rider.event?.title?.toLowerCase().includes(query)
 );
 }

 // Apply sorting
 filtered.sort((a, b) => {
 const aValue = a[sort.field];
 const bValue = b[sort.field];

 if (aValue === null || aValue === undefined) return 1;
 if (bValue === null || bValue === undefined) return -1;

 if (typeof aValue === 'string' && typeof bValue === 'string') {
 return sort.direction === 'asc'
 ? aValue.localeCompare(bValue)
 : bValue.localeCompare(aValue);
 }

 if (aValue < bValue) return sort.direction === 'asc' ? -1 : 1;
 if (aValue > bValue) return sort.direction === 'asc' ? 1 : -1;
 return 0;
 });

 return filtered;
 }, [riders, searchQuery, filters.search, sort]);

 // Handlers
 const handleCreateRider = () => {
 setCreateDrawerOpen(true);
 };

 const handleEditRider = (rider: ProgrammingRider) => {
 setSelectedRider(rider);
 setEditDrawerOpen(true);
 };

 const handleViewRider = (rider: ProgrammingRider) => {
 setSelectedRider(rider);
 setViewDrawerOpen(true);
 };

 const handleDeleteRider = async (riderId: string) => {
 try {
 const response = await fetch(`/api/v1/programming/riders/${riderId}`, {
 method: 'DELETE'
 });

 if (!response.ok) throw new Error('Failed to delete rider');

 setRiders((prev: unknown) => prev.filter((rider) => rider.id !== riderId));
 } catch (error) {
 console.error('Error deleting rider:', error);
 }
 };

 const handleBulkAction = async (action: string, riderIds: string[]) => {
 try {
 setLoading(true);
 
 switch (action) {
 case 'delete':
 await Promise.all(
 riderIds.map((id) =>
 fetch(`/api/v1/programming/riders/${id}`, { method: 'DELETE' })
 )
 );
 setRiders((prev: unknown) => prev.filter((rider) => !riderIds.includes(rider.id)));
 break;
 case 'approve':
 await Promise.all(
 riderIds.map((id) =>
 fetch(`/api/v1/programming/riders/${id}`, {
 method: 'PATCH',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 status: 'approved',
 approved_at: new Date().toISOString(),
 approved_by: currentUserId
 })
 })
 )
 );
 fetchRiders();
 break;
 case 'fulfill':
 await Promise.all(
 riderIds.map((id) =>
 fetch(`/api/v1/programming/riders/${id}`, {
 method: 'PATCH',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 status: 'fulfilled',
 fulfilled_at: new Date().toISOString(),
 fulfilled_by: currentUserId
 })
 })
 )
 );
 fetchRiders();
 break;
 }
 
 setSelectedRiders([]);
 } catch (error) {
 console.error('Error performing bulk action:', error);
 } finally {
 setLoading(false);
 }
 };

 const handleSuccess = () => {
 fetchRiders();
 setCreateDrawerOpen(false);
 setEditDrawerOpen(false);
 setSelectedRider(null);
 };

 // Export functionality
 const handleExport = () => {
 const csvContent = [
 ['Title', 'Kind', 'Status', 'Priority', 'Event', 'Created At'].join(','),
 ...filteredAndSortedRiders.map((rider) =>
 [
 rider.title,
 rider.kind,
 rider.status,
 rider.priority,
 rider.event?.title || '',
 new Date(rider.created_at).toLocaleDateString(),
 ].join(',')
 ),
 ].join('\n');

 const blob = new Blob([csvContent], { type: 'text/csv' });
 const url = URL.createObjectURL(blob);
 const a = document.createElement('a');
 a.href = url;
 a.download = `programming-riders-${new Date().toISOString().split('T')[0]}.csv`;
 a.click();
 URL.revokeObjectURL(url);
 };

 // View icons
 const viewIcons = {
 list: List,
 grid: Grid3X3,
 timeline: Clock,
 analytics: BarChart3
 };

 return (
 <div className="space-y-lg">
 {/* Header */}
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-2xl font-bold">Programming Riders</h1>
 <p className="text-muted-foreground">
 Manage technical, hospitality, and production requirements
 </p>
 </div>
 <Button onClick={handleCreateRider}>
 <Plus className="mr-2 h-icon-xs w-icon-xs" />
 Create Rider
 </Button>
 </div>

 {/* Filters and Search */}
 <Card className="p-md">
 <div className="flex flex-col gap-md md:flex-row md:items-center md:justify-between">
 <div className="flex flex-1 items-center gap-md">
 <div className="relative flex-1 max-w-sm">
 <Search className="absolute left-3 top-xs/2 h-icon-xs w-icon-xs -translate-y-1/2 text-muted-foreground" />
 <Input
 placeholder="Search riders..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="pl-9"
 />
 </div>

 <Select
 value={filters.kind || ''}
 onValueChange={(value) =>
 setFilters((prev: unknown) => ({ ...prev, kind: value as RiderKind || undefined }))
 }
 >
 <SelectTrigger className="w-40">
 <SelectValue placeholder="All Types" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="">All Types</SelectItem>
 <SelectItem value="technical">Technical</SelectItem>
 <SelectItem value="hospitality">Hospitality</SelectItem>
 <SelectItem value="stage_plot">Stage Plot</SelectItem>
 <SelectItem value="security">Security</SelectItem>
 <SelectItem value="catering">Catering</SelectItem>
 <SelectItem value="transportation">Transportation</SelectItem>
 <SelectItem value="accommodation">Accommodation</SelectItem>
 <SelectItem value="production">Production</SelectItem>
 <SelectItem value="artist">Artist</SelectItem>
 <SelectItem value="crew">Crew</SelectItem>
 </SelectContent>
 </Select>

 <Select
 value={filters.status || ''}
 onValueChange={(value) =>
 setFilters((prev: unknown) => ({ ...prev, status: value as RiderStatus || undefined }))
 }
 >
 <SelectTrigger className="w-40">
 <SelectValue placeholder="All Status" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="">All Status</SelectItem>
 <SelectItem value="draft">Draft</SelectItem>
 <SelectItem value="pending_review">Pending Review</SelectItem>
 <SelectItem value="under_review">Under Review</SelectItem>
 <SelectItem value="approved">Approved</SelectItem>
 <SelectItem value="rejected">Rejected</SelectItem>
 <SelectItem value="fulfilled">Fulfilled</SelectItem>
 <SelectItem value="cancelled">Cancelled</SelectItem>
 </SelectContent>
 </Select>

 <Select
 value={filters.event_id || ''}
 onValueChange={(value) =>
 setFilters((prev: unknown) => ({ ...prev, event_id: value || undefined }))
 }
 >
 <SelectTrigger className="w-container-xs">
 <SelectValue placeholder="All Events" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="">All Events</SelectItem>
 {events.map((event) => (
 <SelectItem key={event.id} value={event.id}>
 {event.title}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>

 <div className="flex items-center gap-xs">
 <Button variant="outline" size="sm" onClick={handleExport}>
 <Download className="mr-2 h-icon-xs w-icon-xs" />
 Export
 </Button>

 {/* View Switcher */}
 <div className="flex items-center rounded-lg border p-xs">
 {(['list', 'grid', 'timeline', 'analytics'] as ViewType[]).map((view) => {
 const Icon = viewIcons[view];
 return (
 <Button
 key={view}
 variant={currentView === view ? 'default' : 'ghost'}
 size="sm"
 onClick={() => setCurrentView(view)}
 className="h-icon-lg w-icon-lg p-0"
 >
 <Icon className="h-icon-xs w-icon-xs" />
 </Button>
 );
 })}
 </div>
 </div>
 </div>

 {/* Bulk Actions */}
 {selectedRiders.length > 0 && (
 <div className="mt-4 flex items-center gap-xs rounded-lg border bg-muted/50 p-sm">
 <span className="text-sm text-muted-foreground">
 {selectedRiders.length} rider(s) selected
 </span>
 <div className="flex gap-xs">
 <Button
 size="sm"
 variant="outline"
 onClick={() => handleBulkAction('approve', selectedRiders)}
 >
 Approve
 </Button>
 <Button
 size="sm"
 variant="outline"
 onClick={() => handleBulkAction('fulfill', selectedRiders)}
 >
 Fulfill
 </Button>
 <Button
 size="sm"
 variant="destructive"
 onClick={() => handleBulkAction('delete', selectedRiders)}
 >
 Delete
 </Button>
 </div>
 </div>
 )}
 </Card>

 {/* Content */}
 <div className="min-h-content-lg">
 {currentView === 'list' && (
 <ProgrammingRidersListView
 riders={filteredAndSortedRiders}
 loading={loading}
 selectedRiders={selectedRiders}
 onSelectionChange={setSelectedRiders}
 onEdit={handleEditRider}
 onView={handleViewRider}
 onDelete={handleDeleteRider}
 sort={sort}
 onSortChange={setSort}
 />
 )}

 {currentView === 'grid' && (
 <ProgrammingRidersGridView
 riders={filteredAndSortedRiders}
 loading={loading}
 onEdit={handleEditRider}
 onView={handleViewRider}
 onDelete={handleDeleteRider}
 />
 )}

 {currentView === 'timeline' && (
 <ProgrammingRidersTimelineView
 riders={filteredAndSortedRiders}
 loading={loading}
 onEdit={handleEditRider}
 onView={handleViewRider}
 />
 )}

 {currentView === 'analytics' && (
 <ProgrammingRidersAnalyticsView
 riders={filteredAndSortedRiders}
 loading={loading}
 />
 )}
 </div>

 {/* Drawers */}
 <CreateProgrammingRiderDrawer
 open={createDrawerOpen}
 onClose={() => setCreateDrawerOpen(false)}
 orgId={orgId}
 currentUserId={currentUserId}
 projects={projects}
 events={events}
 onSuccess={handleSuccess}
 />

 {selectedRider && (
 <>
 <EditProgrammingRiderDrawer
 open={editDrawerOpen}
 onClose={() => setEditDrawerOpen(false)}
 rider={selectedRider}
 orgId={orgId}
 currentUserId={currentUserId}
 projects={projects}
 events={events}
 onSuccess={handleSuccess}
 />

 <ViewProgrammingRiderDrawer
 open={viewDrawerOpen}
 onClose={() => setViewDrawerOpen(false)}
 rider={selectedRider}
 users={users}
 onEdit={() => {
 setViewDrawerOpen(false);
 setEditDrawerOpen(true);
 }}
 onDelete={() => {
 handleDeleteRider(selectedRider.id);
 setViewDrawerOpen(false);
 setSelectedRider(null);
 }}
 />
 </>
 )}
 </div>
 );
}
