'use client';

import { Plus, Search, Filter, Download, Upload, MoreHorizontal, MapPin, Users, Square, Home, Grid3X3, List, BarChart3, Clock } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createBrowserClient } from '@ghxstship/auth';
import {
 Badge,
 Button,
 Card,
 Input,
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
 Tabs,
 TabsTrigger,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter
} from "@ghxstship/ui";

import type {
 ProgrammingSpace,
 SpaceFilters,
 SpaceSort,
 ViewType,
 SpaceKind,
 SpaceStatus,
 SpaceAccessLevel,
 SpaceProject
} from './types';

// Import view components
import ProgrammingSpacesListView from './views/ProgrammingSpacesListView';
import ProgrammingSpacesGridView from './views/ProgrammingSpacesGridView';
import ProgrammingSpacesTimelineView from './views/ProgrammingSpacesTimelineView';
import ProgrammingSpacesAnalyticsView from './views/ProgrammingSpacesAnalyticsView';

// Import drawer components
import CreateProgrammingSpaceDrawer from './drawers/CreateProgrammingSpaceDrawer';
import EditProgrammingSpaceDrawer from './drawers/EditProgrammingSpaceDrawer';
import ViewProgrammingSpaceDrawer from './drawers/ViewProgrammingSpaceDrawer';

interface User {
 id: string;
 email: string;
 full_name?: string | null;
 avatar_url?: string | null;
}

interface ProgrammingSpacesClientProps {
 orgId: string;
 currentUserId: string;
 initialSpaces: ProgrammingSpace[];
 projects: SpaceProject[];
 users: User[];
}

export default function ProgrammingSpacesClient({
 orgId,
 currentUserId,
 initialSpaces,
 projects,
 users
}: ProgrammingSpacesClientProps) {
 const supabase = useMemo(() => createBrowserClient(), []);

 // State management
 const [spaces, setSpaces] = useState<ProgrammingSpace[]>(initialSpaces);
 const [loading, setLoading] = useState(false);
 const [selectedSpaces, setSelectedSpaces] = useState<string[]>([]);
 const [currentView, setCurrentView] = useState<ViewType>('list');
 const [searchQuery, setSearchQuery] = useState('');
 const [filters, setFilters] = useState<SpaceFilters>({});
 const [sort, setSort] = useState<SpaceSort>({ field: 'name', direction: 'asc' });

 // Drawer state
 const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
 const [editDrawerOpen, setEditDrawerOpen] = useState(false);
 const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
 const [selectedSpace, setSelectedSpace] = useState<ProgrammingSpace | null>(null);

 // Real-time subscription
 useEffect(() => {
 const channel = supabase
 .channel(`programming_spaces_${orgId}`)
 .on(
 'postgres_changes',
 {
 event: '*',
 schema: 'public',
 table: 'programming_spaces',
 filter: `organization_id=eq.${orgId}`
 },
 (payload) => {
 if (payload.eventType === 'INSERT') {
 fetchSpaces();
 } else if (payload.eventType === 'UPDATE') {
 setSpaces((prev: unknown) =>
 prev.map((space) =>
 space.id === payload.new.id ? { ...space, ...payload.new } : space
 )
 );
 } else if (payload.eventType === 'DELETE') {
 setSpaces((prev: unknown) => prev.filter((space) => space.id !== payload.old.id));
 }
 }
 )
 .subscribe();

 return () => {
 supabase.removeChannel(channel);
 };
 // eslint-disable-next-line react-hooks/exhaustive-deps
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [supabase, orgId]);

 // Fetch spaces with filters
 const fetchSpaces = useCallback(async () => {
 try {
 setLoading(true);
 const params = new URLSearchParams();

 if (filters.project_id) params.append('project_id', filters.project_id);
 if (filters.kind) params.append('kind', filters.kind);
 if (filters.status) params.append('status', filters.status);
 if (filters.access_level) params.append('access_level', filters.access_level);
 if (filters.building) params.append('building', filters.building);
 if (filters.floor) params.append('floor', filters.floor);
 if (searchQuery) params.append('search', searchQuery);
 if (filters.min_capacity) params.append('min_capacity', filters.min_capacity.toString());
 if (filters.max_capacity) params.append('max_capacity', filters.max_capacity.toString());
 if (filters.is_bookable !== undefined) params.append('is_bookable', filters.is_bookable.toString());

 const response = await fetch(`/api/v1/programming/spaces?${params}`);
 if (!response.ok) throw new Error('Failed to fetch spaces');

 const data = await response.json();
 setSpaces(data);
 } catch (error) {
 console.error('Error fetching spaces:', error);
 } finally {
 setLoading(false);
 }
 }, [filters, searchQuery]);

 // Trigger fetch when filters change
 useEffect(() => {
 fetchSpaces();
 }, [fetchSpaces]);

 // Filter and sort spaces
 const filteredAndSortedSpaces = useMemo(() => {
 let filtered = [...spaces];

 // Apply local search if no server search
 if (searchQuery && !filters.search) {
 const query = searchQuery.toLowerCase();
 filtered = filtered.filter(
 (space) =>
 space.name?.toLowerCase().includes(query) ||
 space.description?.toLowerCase().includes(query) ||
 space.location?.toLowerCase().includes(query) ||
 space.building?.toLowerCase().includes(query)
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
 }, [spaces, searchQuery, filters.search, sort]);

 // Get unique buildings and floors for filters
 const buildings = useMemo(() => {
 const uniqueBuildings = [...new Set(spaces.map(s => s.building).filter(Boolean))];
 return uniqueBuildings.sort();
 }, [spaces]);

 const floors = useMemo(() => {
 const uniqueFloors = [...new Set(spaces.map(s => s.floor).filter(Boolean))];
 return uniqueFloors.sort();
 }, [spaces]);

 // Handlers
 const handleCreateSpace = () => {
 setCreateDrawerOpen(true);
 };

 const handleEditSpace = (space: ProgrammingSpace) => {
 setSelectedSpace(space);
 setEditDrawerOpen(true);
 };

 const handleViewSpace = (space: ProgrammingSpace) => {
 setSelectedSpace(space);
 setViewDrawerOpen(true);
 };

 const handleDeleteSpace = async (spaceId: string) => {
 try {
 const response = await fetch(`/api/v1/programming/spaces/${spaceId}`, {
 method: 'DELETE'
 });

 if (!response.ok) throw new Error('Failed to delete space');

 setSpaces((prev: unknown) => prev.filter((space) => space.id !== spaceId));
 } catch (error) {
 console.error('Error deleting space:', error);
 }
 };

 const handleBulkAction = async (action: string, spaceIds: string[]) => {
 try {
 setLoading(true);
 
 switch (action) {
 case 'delete':
 await Promise.all(
 spaceIds.map((id) =>
 fetch(`/api/v1/programming/spaces/${id}`, { method: 'DELETE' })
 )
 );
 setSpaces((prev: unknown) => prev.filter((space) => !spaceIds.includes(space.id)));
 break;
 case 'available':
 await Promise.all(
 spaceIds.map((id) =>
 fetch(`/api/v1/programming/spaces/${id}`, {
 method: 'PATCH',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ status: 'available' })
 })
 )
 );
 fetchSpaces();
 break;
 case 'maintenance':
 await Promise.all(
 spaceIds.map((id) =>
 fetch(`/api/v1/programming/spaces/${id}`, {
 method: 'PATCH',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ status: 'maintenance' })
 })
 )
 );
 fetchSpaces();
 break;
 }
 
 setSelectedSpaces([]);
 } catch (error) {
 console.error('Error performing bulk action:', error);
 } finally {
 setLoading(false);
 }
 };

 const handleSuccess = () => {
 fetchSpaces();
 setCreateDrawerOpen(false);
 setEditDrawerOpen(false);
 setSelectedSpace(null);
 };

 // Export functionality
 const handleExport = () => {
 const csvContent = [
 ['Name', 'Kind', 'Status', 'Access Level', 'Capacity', 'Building', 'Floor', 'Location'].join(','),
 ...filteredAndSortedSpaces.map((space) =>
 [
 space.name,
 space.kind,
 space.status,
 space.access_level,
 space.capacity || '',
 space.building || '',
 space.floor || '',
 space.location || '',
 ].join(',')
 ),
 ].join('\n');

 const blob = new Blob([csvContent], { type: 'text/csv' });
 const url = URL.createObjectURL(blob);
 const a = document.createElement('a');
 a.href = url;
 a.download = `programming-spaces-${new Date().toISOString().split('T')[0]}.csv`;
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
 <h1 className="text-2xl font-bold">Programming Spaces</h1>
 <p className="text-muted-foreground">
 Manage venues, rooms, and facilities for events and productions
 </p>
 </div>
 <Button onClick={handleCreateSpace}>
 <Plus className="mr-2 h-icon-xs w-icon-xs" />
 Create Space
 </Button>
 </div>

 {/* Filters and Search */}
 <Card className="p-md">
 <div className="flex flex-col gap-md md:flex-row md:items-center md:justify-between">
 <div className="flex flex-1 items-center gap-md">
 <div className="relative flex-1 max-w-sm">
 <Search className="absolute left-3 top-xs/2 h-icon-xs w-icon-xs -translate-y-1/2 text-muted-foreground" />
 <Input
 placeholder="Search spaces..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="pl-9"
 />
 </div>

 <Select
 value={filters.kind || ''}
 onChange={(e) =>
 setFilters((prev: unknown) => ({ ...prev, kind: e.target.value as SpaceKind || undefined }))
 }
 >
 <SelectTrigger className="w-40">
 <SelectValue placeholder="All Types" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="">All Types</SelectItem>
 <SelectItem value="room">Room</SelectItem>
 <SelectItem value="green_room">Green Room</SelectItem>
 <SelectItem value="dressing_room">Dressing Room</SelectItem>
 <SelectItem value="meeting_room">Meeting Room</SelectItem>
 <SelectItem value="classroom">Classroom</SelectItem>
 <SelectItem value="studio">Studio</SelectItem>
 <SelectItem value="rehearsal_room">Rehearsal Room</SelectItem>
 <SelectItem value="storage">Storage</SelectItem>
 <SelectItem value="office">Office</SelectItem>
 <SelectItem value="lounge">Lounge</SelectItem>
 <SelectItem value="other">Other</SelectItem>
 </SelectContent>
 </Select>

 <Select
 value={filters.status || ''}
 onChange={(e) =>
 setFilters((prev: unknown) => ({ ...prev, status: e.target.value as SpaceStatus || undefined }))
 }
 >
 <SelectTrigger className="w-40">
 <SelectValue placeholder="All Status" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="">All Status</SelectItem>
 <SelectItem value="available">Available</SelectItem>
 <SelectItem value="occupied">Occupied</SelectItem>
 <SelectItem value="reserved">Reserved</SelectItem>
 <SelectItem value="maintenance">Maintenance</SelectItem>
 <SelectItem value="cleaning">Cleaning</SelectItem>
 <SelectItem value="out_of_service">Out of Service</SelectItem>
 </SelectContent>
 </Select>

 {buildings.length > 0 && (
 <Select
 value={filters.building || ''}
 onChange={(e) =>
 setFilters((prev: unknown) => ({ ...prev, building: e.target.value || undefined }))
 }
 >
 <SelectTrigger className="w-40">
 <SelectValue placeholder="All Buildings" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="">All Buildings</SelectItem>
 {buildings.map((building) => (
 <SelectItem key={building} value={building}>
 {building}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 )}

 <Select
 value={filters.project_id || ''}
 onChange={(e) =>
 setFilters((prev: unknown) => ({ ...prev, project_id: e.target.value || undefined }))
 }
 >
 <SelectTrigger className="w-container-xs">
 <SelectValue placeholder="All Projects" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="">All Projects</SelectItem>
 {projects.map((project) => (
 <SelectItem key={project.id} value={project.id}>
 {project.name}
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
 {selectedSpaces.length > 0 && (
 <div className="mt-4 flex items-center gap-xs rounded-lg border bg-muted/50 p-sm">
 <span className="text-sm text-muted-foreground">
 {selectedSpaces.length} space(s) selected
 </span>
 <div className="flex gap-xs">
 <Button
 size="sm"
 variant="outline"
 onClick={() => handleBulkAction('available', selectedSpaces)}
 >
 Mark Available
 </Button>
 <Button
 size="sm"
 variant="outline"
 onClick={() => handleBulkAction('maintenance', selectedSpaces)}
 >
 Mark Maintenance
 </Button>
 <Button
 size="sm"
 variant="destructive"
 onClick={() => handleBulkAction('delete', selectedSpaces)}
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
 <ProgrammingSpacesListView
 spaces={filteredAndSortedSpaces}
 loading={loading}
 selectedSpaces={selectedSpaces}
 onSelectionChange={setSelectedSpaces}
 onEdit={handleEditSpace}
 onView={handleViewSpace}
 onDelete={handleDeleteSpace}
 sort={sort}
 onSortChange={setSort}
 />
 )}

 {currentView === 'grid' && (
 <ProgrammingSpacesGridView
 spaces={filteredAndSortedSpaces}
 loading={loading}
 onEdit={handleEditSpace}
 onView={handleViewSpace}
 onDelete={handleDeleteSpace}
 />
 )}

 {currentView === 'timeline' && (
 <ProgrammingSpacesTimelineView
 spaces={filteredAndSortedSpaces}
 loading={loading}
 onEdit={handleEditSpace}
 onView={handleViewSpace}
 />
 )}

 {currentView === 'analytics' && (
 <ProgrammingSpacesAnalyticsView
 spaces={filteredAndSortedSpaces}
 loading={loading}
 />
 )}
 </div>

 {/* Drawers */}
 <CreateProgrammingSpaceDrawer
 open={createDrawerOpen}
 onClose={() => setCreateDrawerOpen(false)}
 orgId={orgId}
 currentUserId={currentUserId}
 projects={projects}
 onSuccess={handleSuccess}
 />

 {selectedSpace && (
 <>
 <EditProgrammingSpaceDrawer
 open={editDrawerOpen}
 onClose={() => setEditDrawerOpen(false)}
 space={selectedSpace}
 orgId={orgId}
 currentUserId={currentUserId}
 projects={projects}
 onSuccess={handleSuccess}
 />

 <ViewProgrammingSpaceDrawer
 open={viewDrawerOpen}
 onClose={() => setViewDrawerOpen(false)}
 space={selectedSpace}
 users={users}
 onEdit={() => {
 setViewDrawerOpen(false);
 setEditDrawerOpen(true);
 }}
 onDelete={() => {
 handleDeleteSpace(selectedSpace.id);
 setViewDrawerOpen(false);
 setSelectedSpace(null);
 }}
 />
 </>
 )}
 </div>
 );
}
