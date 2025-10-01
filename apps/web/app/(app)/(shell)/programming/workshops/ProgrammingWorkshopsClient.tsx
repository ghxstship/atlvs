'use client';

import { Plus, Search, Download, Grid3X3, List, BarChart3, Calendar } from "lucide-react";
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
} from '@ghxstship/ui';

import type {
 ProgrammingWorkshop,
 WorkshopFilters,
 WorkshopSort,
 ViewType,
 WorkshopCategory,
 WorkshopStatus,
 WorkshopSkillLevel,
 WorkshopFormat,
 WorkshopProject,
 WorkshopEvent,
} from './types';

// Import view components
import ProgrammingWorkshopsListView from './views/ProgrammingWorkshopsListView';
import ProgrammingWorkshopsGridView from './views/ProgrammingWorkshopsGridView';
import ProgrammingWorkshopsTimelineView from './views/ProgrammingWorkshopsTimelineView';
import ProgrammingWorkshopsAnalyticsView from './views/ProgrammingWorkshopsAnalyticsView';

// Import drawer components
import CreateProgrammingWorkshopDrawer from './drawers/CreateProgrammingWorkshopDrawer';
import EditProgrammingWorkshopDrawer from './drawers/EditProgrammingWorkshopDrawer';
import ViewProgrammingWorkshopDrawer from './drawers/ViewProgrammingWorkshopDrawer';

interface User {
 id: string;
 email: string;
 full_name?: string | null;
 avatar_url?: string | null;
}

interface ProgrammingWorkshopsClientProps {
 orgId: string;
 currentUserId: string;
 initialWorkshops: ProgrammingWorkshop[];
 projects: WorkshopProject[];
 events: WorkshopEvent[];
 users: User[];
}

export default function ProgrammingWorkshopsClient({
 orgId,
 currentUserId,
 initialWorkshops,
 projects,
 events,
 users,
}: ProgrammingWorkshopsClientProps) {
 const supabase = useMemo(() => createBrowserClient(), []);

 // State management
 const [workshops, setWorkshops] = useState<ProgrammingWorkshop[]>(initialWorkshops);
 const [loading, setLoading] = useState(false);
 const [selectedWorkshops, setSelectedWorkshops] = useState<string[]>([]);
 const [currentView, setCurrentView] = useState<ViewType>('list');
 const [searchQuery, setSearchQuery] = useState('');
 const [filters, setFilters] = useState<WorkshopFilters>({});
 const [sort, setSort] = useState<WorkshopSort>({ field: 'start_date', direction: 'asc' });

 // Drawer state
 const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
 const [editDrawerOpen, setEditDrawerOpen] = useState(false);
 const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
 const [selectedWorkshop, setSelectedWorkshop] = useState<ProgrammingWorkshop | null>(null);

 // Real-time subscription
 useEffect(() => {
 const channel = supabase
 .channel(`programming_workshops_${orgId}`)
 .on(
 'postgres_changes',
 {
 event: '*',
 schema: 'public',
 table: 'programming_workshops',
 filter: `organization_id=eq.${orgId}`,
 },
 (payload) => {
 if (payload.eventType === 'INSERT') {
 fetchWorkshops();
 } else if (payload.eventType === 'UPDATE') {
 setWorkshops((prev: unknown) =>
 prev.map((workshop) =>
 workshop.id === payload.new.id ? { ...workshop, ...payload.new } : workshop
 )
 );
 } else if (payload.eventType === 'DELETE') {
 setWorkshops((prev: unknown) => prev.filter((workshop) => workshop.id !== payload.old.id));
 }
 }
 )
 .subscribe();

 return () => {
 supabase.removeChannel(channel);
 };
 }, [supabase, orgId]);

 // Fetch workshops with filters
 const fetchWorkshops = useCallback(async () => {
 try {
 setLoading(true);
 const params = new URLSearchParams();

 if (filters.project_id) params.append('project_id', filters.project_id);
 if (filters.event_id) params.append('event_id', filters.event_id);
 if (filters.category) params.append('category', filters.category);
 if (filters.status) params.append('status', filters.status);
 if (filters.skill_level) params.append('skill_level', filters.skill_level);
 if (filters.format) params.append('format', filters.format);
 if (searchQuery) params.append('search', searchQuery);
 if (filters.start_date_from) params.append('start_date_from', filters.start_date_from);
 if (filters.start_date_to) params.append('start_date_to', filters.start_date_to);
 if (filters.price_min !== undefined) params.append('price_min', filters.price_min.toString());
 if (filters.price_max !== undefined) params.append('price_max', filters.price_max.toString());
 if (filters.has_availability !== undefined) params.append('has_availability', filters.has_availability.toString());
 if (filters.certification_available !== undefined) params.append('certification_available', filters.certification_available.toString());

 const response = await fetch(`/api/v1/programming/workshops?${params}`);
 if (!response.ok) throw new Error('Failed to fetch workshops');

 const data = await response.json();
 setWorkshops(data);
 } catch (error) {
 console.error('Error fetching workshops:', error);
 } finally {
 setLoading(false);
 }
 }, [filters, searchQuery]);

 // Trigger fetch when filters change
 useEffect(() => {
 fetchWorkshops();
 }, [fetchWorkshops]);

 // Filter and sort workshops
 const filteredAndSortedWorkshops = useMemo(() => {
 let filtered = [...workshops];

 // Apply local search if no server search
 if (searchQuery && !filters.search) {
 const query = searchQuery.toLowerCase();
 filtered = filtered.filter(
 (workshop) =>
 workshop.title?.toLowerCase().includes(query) ||
 workshop.description?.toLowerCase().includes(query) ||
 workshop.agenda?.toLowerCase().includes(query)
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
 }, [workshops, searchQuery, filters.search, sort]);

 // Handlers
 const handleCreateWorkshop = () => {
 setCreateDrawerOpen(true);
 };

 const handleEditWorkshop = (workshop: ProgrammingWorkshop) => {
 setSelectedWorkshop(workshop);
 setEditDrawerOpen(true);
 };

 const handleViewWorkshop = (workshop: ProgrammingWorkshop) => {
 setSelectedWorkshop(workshop);
 setViewDrawerOpen(true);
 };

 const handleDeleteWorkshop = async (workshopId: string) => {
 try {
 const response = await fetch(`/api/v1/programming/workshops/${workshopId}`, {
 method: 'DELETE',
 });

 if (!response.ok) throw new Error('Failed to delete workshop');

 setWorkshops((prev: unknown) => prev.filter((workshop) => workshop.id !== workshopId));
 } catch (error) {
 console.error('Error deleting workshop:', error);
 }
 };

 const handleBulkAction = async (action: string, workshopIds: string[]) => {
 try {
 setLoading(true);
 
 switch (action) {
 case 'delete':
 await Promise.all(
 workshopIds.map((id) =>
 fetch(`/api/v1/programming/workshops/${id}`, { method: 'DELETE' })
 )
 );
 setWorkshops((prev: unknown) => prev.filter((workshop) => !workshopIds.includes(workshop.id)));
 break;
 case 'cancel':
 await Promise.all(
 workshopIds.map((id) =>
 fetch(`/api/v1/programming/workshops/${id}`, {
 method: 'PATCH',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ status: 'cancelled' }),
 })
 )
 );
 fetchWorkshops();
 break;
 case 'open_registration':
 await Promise.all(
 workshopIds.map((id) =>
 fetch(`/api/v1/programming/workshops/${id}`, {
 method: 'PATCH',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ status: 'open_registration' }),
 })
 )
 );
 fetchWorkshops();
 break;
 }
 
 setSelectedWorkshops([]);
 } catch (error) {
 console.error('Error performing bulk action:', error);
 } finally {
 setLoading(false);
 }
 };

 const handleSuccess = () => {
 fetchWorkshops();
 setCreateDrawerOpen(false);
 setEditDrawerOpen(false);
 setSelectedWorkshop(null);
 };

 // Export functionality
 const handleExport = () => {
 const csvContent = [
 ['Title', 'Category', 'Status', 'Skill Level', 'Format', 'Start Date', 'Participants', 'Price'].join(','),
 ...filteredAndSortedWorkshops.map((workshop) =>
 [
 workshop.title,
 workshop.category,
 workshop.status,
 workshop.skill_level,
 workshop.format,
 new Date(workshop.start_date).toLocaleDateString(),
 `${workshop.current_participants}${workshop.max_participants ? `/${workshop.max_participants}` : ''}`,
 workshop.price ? `${workshop.currency || '$'}${workshop.price}` : 'Free',
 ].join(',')
 ),
 ].join('\n');

 const blob = new Blob([csvContent], { type: 'text/csv' });
 const url = URL.createObjectURL(blob);
 const a = document.createElement('a');
 a.href = url;
 a.download = `programming-workshops-${new Date().toISOString().split('T')[0]}.csv`;
 a.click();
 URL.revokeObjectURL(url);
 };

 // View icons
 const viewIcons = {
 list: List,
 grid: Grid3X3,
 timeline: Calendar,
 analytics: BarChart3,
 };

 return (
 <div className="space-y-lg">
 {/* Header */}
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-2xl font-bold">Programming Workshops</h1>
 <p className="text-muted-foreground">
 Manage educational workshops, training sessions, and learning experiences
 </p>
 </div>
 <Button onClick={handleCreateWorkshop}>
 <Plus className="mr-2 h-icon-xs w-icon-xs" />
 Create Workshop
 </Button>
 </div>

 {/* Filters and Search */}
 <Card className="p-md">
 <div className="flex flex-col gap-md md:flex-row md:items-center md:justify-between">
 <div className="flex flex-1 items-center gap-md">
 <div className="relative flex-1 max-w-sm">
 <Search className="absolute left-3 top-xs/2 h-icon-xs w-icon-xs -translate-y-1/2 text-muted-foreground" />
 <Input
 placeholder="Search workshops..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="pl-9"
 />
 </div>

 <Select
 value={filters.category || ''}
 onValueChange={(value) =>
 setFilters((prev: unknown) => ({ ...prev, category: value as WorkshopCategory || undefined }))
 }
 >
 <SelectTrigger className="w-40">
 <SelectValue placeholder="All Categories" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="">All Categories</SelectItem>
 <SelectItem value="technical">Technical</SelectItem>
 <SelectItem value="creative">Creative</SelectItem>
 <SelectItem value="business">Business</SelectItem>
 <SelectItem value="leadership">Leadership</SelectItem>
 <SelectItem value="production">Production</SelectItem>
 <SelectItem value="design">Design</SelectItem>
 <SelectItem value="marketing">Marketing</SelectItem>
 <SelectItem value="finance">Finance</SelectItem>
 <SelectItem value="legal">Legal</SelectItem>
 <SelectItem value="other">Other</SelectItem>
 </SelectContent>
 </Select>

 <Select
 value={filters.status || ''}
 onValueChange={(value) =>
 setFilters((prev: unknown) => ({ ...prev, status: value as WorkshopStatus || undefined }))
 }
 >
 <SelectTrigger className="w-40">
 <SelectValue placeholder="All Status" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="">All Status</SelectItem>
 <SelectItem value="planning">Planning</SelectItem>
 <SelectItem value="open_registration">Open Registration</SelectItem>
 <SelectItem value="registration_closed">Registration Closed</SelectItem>
 <SelectItem value="full">Full</SelectItem>
 <SelectItem value="in_progress">In Progress</SelectItem>
 <SelectItem value="completed">Completed</SelectItem>
 <SelectItem value="cancelled">Cancelled</SelectItem>
 <SelectItem value="postponed">Postponed</SelectItem>
 </SelectContent>
 </Select>

 <Select
 value={filters.skill_level || ''}
 onValueChange={(value) =>
 setFilters((prev: unknown) => ({ ...prev, skill_level: value as WorkshopSkillLevel || undefined }))
 }
 >
 <SelectTrigger className="w-40">
 <SelectValue placeholder="All Levels" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="">All Levels</SelectItem>
 <SelectItem value="beginner">Beginner</SelectItem>
 <SelectItem value="intermediate">Intermediate</SelectItem>
 <SelectItem value="advanced">Advanced</SelectItem>
 <SelectItem value="expert">Expert</SelectItem>
 <SelectItem value="all_levels">All Levels</SelectItem>
 </SelectContent>
 </Select>

 <Select
 value={filters.format || ''}
 onValueChange={(value) =>
 setFilters((prev: unknown) => ({ ...prev, format: value as WorkshopFormat || undefined }))
 }
 >
 <SelectTrigger className="w-40">
 <SelectValue placeholder="All Formats" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="">All Formats</SelectItem>
 <SelectItem value="in_person">In Person</SelectItem>
 <SelectItem value="virtual">Virtual</SelectItem>
 <SelectItem value="hybrid">Hybrid</SelectItem>
 </SelectContent>
 </Select>

 <Select
 value={filters.project_id || ''}
 onValueChange={(value) =>
 setFilters((prev: unknown) => ({ ...prev, project_id: value || undefined }))
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
 {selectedWorkshops.length > 0 && (
 <div className="mt-4 flex items-center gap-xs rounded-lg border bg-muted/50 p-sm">
 <span className="text-sm text-muted-foreground">
 {selectedWorkshops.length} workshop(s) selected
 </span>
 <div className="flex gap-xs">
 <Button
 size="sm"
 variant="outline"
 onClick={() => handleBulkAction('open_registration', selectedWorkshops)}
 >
 Open Registration
 </Button>
 <Button
 size="sm"
 variant="outline"
 onClick={() => handleBulkAction('cancel', selectedWorkshops)}
 >
 Cancel
 </Button>
 <Button
 size="sm"
 variant="destructive"
 onClick={() => handleBulkAction('delete', selectedWorkshops)}
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
 <ProgrammingWorkshopsListView
 workshops={filteredAndSortedWorkshops}
 loading={loading}
 selectedWorkshops={selectedWorkshops}
 onSelectionChange={setSelectedWorkshops}
 onEdit={handleEditWorkshop}
 onView={handleViewWorkshop}
 onDelete={handleDeleteWorkshop}
 sort={sort}
 onSortChange={setSort}
 />
 )}

 {currentView === 'grid' && (
 <ProgrammingWorkshopsGridView
 workshops={filteredAndSortedWorkshops}
 loading={loading}
 onEdit={handleEditWorkshop}
 onView={handleViewWorkshop}
 onDelete={handleDeleteWorkshop}
 />
 )}

 {currentView === 'timeline' && (
 <ProgrammingWorkshopsTimelineView
 workshops={filteredAndSortedWorkshops}
 loading={loading}
 onEdit={handleEditWorkshop}
 onView={handleViewWorkshop}
 />
 )}

 {currentView === 'analytics' && (
 <ProgrammingWorkshopsAnalyticsView
 workshops={filteredAndSortedWorkshops}
 loading={loading}
 />
 )}
 </div>

 {/* Drawers */}
 <CreateProgrammingWorkshopDrawer
 open={createDrawerOpen}
 onClose={() => setCreateDrawerOpen(false)}
 orgId={orgId}
 currentUserId={currentUserId}
 projects={projects}
 events={events}
 users={users}
 onSuccess={handleSuccess}
 />

 {selectedWorkshop && (
 <>
 <EditProgrammingWorkshopDrawer
 open={editDrawerOpen}
 onClose={() => setEditDrawerOpen(false)}
 workshop={selectedWorkshop}
 orgId={orgId}
 currentUserId={currentUserId}
 projects={projects}
 events={events}
 users={users}
 onSuccess={handleSuccess}
 />

 <ViewProgrammingWorkshopDrawer
 open={viewDrawerOpen}
 onClose={() => setViewDrawerOpen(false)}
 workshop={selectedWorkshop}
 users={users}
 onEdit={() => {
 setViewDrawerOpen(false);
 setEditDrawerOpen(true);
 }}
 onDelete={() => {
 handleDeleteWorkshop(selectedWorkshop.id);
 setViewDrawerOpen(false);
 setSelectedWorkshop(null);
 }}
 />
 </>
 )}
 </div>
 );
}
