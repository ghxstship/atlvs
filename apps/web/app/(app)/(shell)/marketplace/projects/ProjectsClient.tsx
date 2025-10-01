'use client';

import { Plus, Briefcase, Clock, DollarSign, Users, MapPin, Calendar, Eye, Edit, Trash2, Star } from "lucide-react";
import { useState, useEffect } from 'react';
import { 
 DataGrid,
 ViewSwitcher,
 DataActions,
 DataViewProvider,
 StateManagerProvider,
 Drawer,
 Button,
 Badge,
 Card,
 type DataRecord
} from '@ghxstship/ui';
import { createBrowserClient } from '@ghxstship/auth';
import type { MarketplaceProject } from '../types';
import CreateProjectClient from '../drawers/CreateProjectClient';

interface ProjectsClientProps {
 orgId: string;
 userId: string;
}

const PROJECTS_FIELD_CONFIGS = [
 {
 key: 'title',
 label: 'Project Title',
 type: 'text' as const,
 sortable: true,
 filterable: true,
 searchable: true,
 visible: true,
 width: 250
 },
 {
 key: 'category',
 label: 'Category',
 type: 'select' as const,
 options: [
 { label: 'Audio/Visual', value: 'audio_visual' },
 { label: 'Lighting', value: 'lighting' },
 { label: 'Staging', value: 'staging' },
 { label: 'Production', value: 'production' },
 { label: 'Creative', value: 'creative' },
 { label: 'Technical', value: 'technical' }
 ],
 sortable: true,
 filterable: true,
 visible: true,
 width: 140
 },
 {
 key: 'status',
 label: 'Status',
 type: 'select' as const,
 options: [
 { label: 'Draft', value: 'draft' },
 { label: 'Open', value: 'open' },
 { label: 'In Progress', value: 'in_progress' },
 { label: 'Completed', value: 'completed' }
 ],
 sortable: true,
 filterable: true,
 visible: true,
 width: 120
 },
 {
 key: 'budget_type',
 label: 'Budget Type',
 type: 'select' as const,
 options: [
 { label: 'Fixed', value: 'fixed' },
 { label: 'Hourly', value: 'hourly' },
 { label: 'Not Specified', value: 'not_specified' }
 ],
 sortable: true,
 filterable: true,
 visible: true,
 width: 130
 },
 {
 key: 'budget_range',
 label: 'Budget Range',
 type: 'currency' as const,
 sortable: true,
 filterable: true,
 visible: true,
 width: 150
 },
 {
 key: 'location_type',
 label: 'Location',
 type: 'select' as const,
 options: [
 { label: 'Remote', value: 'remote' },
 { label: 'On-site', value: 'onsite' },
 { label: 'Hybrid', value: 'hybrid' }
 ],
 sortable: true,
 filterable: true,
 visible: true,
 width: 120
 },
 {
 key: 'experience_level',
 label: 'Experience',
 type: 'select' as const,
 options: [
 { label: 'Entry', value: 'entry' },
 { label: 'Intermediate', value: 'intermediate' },
 { label: 'Expert', value: 'expert' }
 ],
 sortable: true,
 filterable: true,
 visible: true,
 width: 120
 },
 {
 key: 'proposals_count',
 label: 'Proposals',
 type: 'number' as const,
 sortable: true,
 filterable: false,
 visible: true,
 width: 100
 },
 {
 key: 'start_date',
 label: 'Start Date',
 type: 'date' as const,
 sortable: true,
 filterable: true,
 visible: true,
 width: 140
 },
 {
 key: 'created_at',
 label: 'Posted',
 type: 'datetime' as const,
 sortable: true,
 filterable: true,
 visible: true,
 width: 160
 }
];

export default function ProjectsClient({ orgId, userId }: ProjectsClientProps) {
 const [projects, setProjects] = useState<MarketplaceProject[]>([]);
 const [loading, setLoading] = useState(true);
 const [selectedView, setSelectedView] = useState<'grid' | 'list' | 'kanban' | 'calendar'>('grid');
 const [drawerOpen, setDrawerOpen] = useState(false);
 const [drawerMode, setDrawerMode] = useState<'create' | 'edit' | 'view'>('create');
 const [selectedProject, setSelectedProject] = useState<MarketplaceProject | null>(null);
 const [stats, setStats] = useState({
 total: 0,
 open: 0,
 inProgress: 0,
 proposals: 0
 });

 const supabase = createBrowserClient();

 useEffect(() => {
 loadProjects();
 }, [orgId]);

 const loadProjects = async () => {
 try {
 setLoading(true);
 
 const response = await fetch('/api/v1/marketplace/projects');
 const data = await response.json();

 if (response.ok) {
 const projectsData = data.projects || [];
 setProjects(projectsData);
 
 // Calculate stats
 setStats({
 total: projectsData.length,
 open: projectsData.filter((p: MarketplaceProject) => p.status === 'open').length,
 inProgress: projectsData.filter((p: MarketplaceProject) => p.status === 'in_progress').length,
 proposals: projectsData.reduce((sum: number, p: MarketplaceProject) => 
 sum + (p.proposals?.reduce((pSum, prop) => pSum + (prop?.count || 0), 0) || 0), 0)
 });
 } else {
 console.error('Error loading projects:', data.error);
 }
 } catch (error) {
 console.error('Error loading projects:', error);
 } finally {
 setLoading(false);
 }
 };

 const handleCreateProject = () => {
 setSelectedProject(null);
 setDrawerMode('create');
 setDrawerOpen(true);
 };

 const handleEditProject = (project: MarketplaceProject) => {
 setSelectedProject(project);
 setDrawerMode('edit');
 setDrawerOpen(true);
 };

 const handleViewProject = (project: MarketplaceProject) => {
 setSelectedProject(project);
 setDrawerMode('view');
 setDrawerOpen(true);
 };

 const handleDeleteProject = async (project: MarketplaceProject) => {
 if (!confirm('Are you sure you want to delete this project?')) return;

 try {
 const response = await fetch('/api/v1/marketplace/projects', {
 method: 'DELETE',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ id: project.id })
 });

 if (response.ok) {
 await loadProjects();
 } else {
 const data = await response.json();
 console.error('Error deleting project:', data.error);
 }
 } catch (error) {
 console.error('Error deleting project:', error);
 }
 };

 const handleExport = async (format: 'csv' | 'json' | 'excel') => {
 try {
 const exportData = projects.map(project => ({
 title: project.title,
 category: project.category,
 status: project.status,
 budget_type: project.budget_type,
 budget_min: project.budget_min,
 budget_max: project.budget_max,
 currency: project.currency,
 location_type: project.location_type,
 experience_level: project.experience_level,
 start_date: project.start_date,
 end_date: project.end_date,
 created_at: project.created_at
 }));

 const filename = `marketplace-projects-${new Date().toISOString().split('T')[0]}`;
 
 if (format === 'csv') {
 const csv = [
 Object.keys(exportData[0]).join(','),
 ...exportData.map(row => Object.values(row).join(','))
 ].join('\n');
 
 const blob = new Blob([csv], { type: 'text/csv' });
 const url = URL.createObjectURL(blob);
 const a = document.createElement('a');
 a.href = url;
 a.download = `${filename}.csv`;
 a.click();
 URL.revokeObjectURL(url);
 } else if (format === 'json') {
 const json = JSON.stringify(exportData, null, 2);
 const blob = new Blob([json], { type: 'application/json' });
 const url = URL.createObjectURL(blob);
 const a = document.createElement('a');
 a.href = url;
 a.download = `${filename}.json`;
 a.click();
 URL.revokeObjectURL(url);
 }
 } catch (error) {
 console.error('Error exporting projects:', error);
 }
 };

 const handleBulkAction = async (action: string, selectedIds: string[]) => {
 if (action === 'delete') {
 if (!confirm(`Are you sure you want to delete ${selectedIds.length} projects?`)) return;
 
 try {
 await Promise.all(
 selectedIds.map(id => 
 fetch('/api/v1/marketplace/projects', {
 method: 'DELETE',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ id })
 })
 )
 );
 await loadProjects();
 } catch (error) {
 console.error('Error bulk deleting projects:', error);
 }
 }
 };

 const getRowActions = (project: MarketplaceProject) => [
 {
 label: 'View',
 icon: Eye,
 onClick: () => handleViewProject(project)
 },
 {
 label: 'Edit',
 icon: Edit,
 onClick: () => handleEditProject(project),
 disabled: project.client_id !== userId
 },
 {
 label: 'Delete',
 icon: Trash2,
 onClick: () => handleDeleteProject(project),
 disabled: project.client_id !== userId,
 variant: 'destructive' as const
 }
 ];

 const renderProjectCard = (project: MarketplaceProject) => {
 const statusColors = {
 draft: 'secondary',
 open: 'success',
 in_progress: 'warning',
 completed: 'primary'
 };

 return (
 <Card key={project.id} className="p-md hover:shadow-md transition-shadow">
 <div className="flex items-start justify-between mb-sm">
 <div className="flex items-center gap-sm">
 <Briefcase className="h-icon-sm w-icon-sm color-primary" />
 <Badge variant={statusColors[project.status] as unknown}>
 {project.status.replace('_', ' ')}
 </Badge>
 </div>
 <Badge variant="outline">
 {project.category?.replace('_', ' ')}
 </Badge>
 </div>
 
 <h3 className="text-heading-4 mb-xs">{project.title}</h3>
 <p className="text-body-sm color-muted mb-sm line-clamp-xs">{project.description}</p>
 
 <div className="flex items-center gap-md mb-sm text-body-sm color-muted">
 {project.budget_min && project.budget_max && (
 <div className="flex items-center gap-xs">
 <DollarSign className="h-icon-xs w-icon-xs" />
 <span>{project.currency} {project.budget_min} - {project.budget_max}</span>
 </div>
 )}
 {project.location_type && (
 <div className="flex items-center gap-xs">
 <MapPin className="h-icon-xs w-icon-xs" />
 <span>{project.location_type}</span>
 </div>
 )}
 {project.start_date && (
 <div className="flex items-center gap-xs">
 <Calendar className="h-icon-xs w-icon-xs" />
 <span>{new Date(project.start_date).toLocaleDateString()}</span>
 </div>
 )}
 </div>
 
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-md text-body-sm color-muted">
 <span>{project.proposals?.reduce((sum, p) => sum + (p?.count || 0), 0) || 0} proposals</span>
 <span>{project.experience_level} level</span>
 </div>
 <div className="flex items-center gap-xs">
 <Button size="sm" variant="outline" onClick={() => handleViewProject(project)}>
 <Eye className="h-icon-xs w-icon-xs" />
 </Button>
 {project.client_id === userId && (
 <Button size="sm" variant="outline" onClick={() => handleEditProject(project)}>
 <Edit className="h-icon-xs w-icon-xs" />
 </Button>
 )}
 </div>
 </div>
 </Card>
 );
 };

 return (
 <div className="stack-lg">
 {/* Header */}
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-heading-2">Marketplace Projects</h1>
 <p className="color-muted">Post and manage project opportunities</p>
 </div>
 <Button onClick={handleCreateProject}>
 <Plus className="h-icon-xs w-icon-xs mr-sm" />
 Post Project
 </Button>
 </div>

 {/* Stats Cards */}
 <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
 <Card className="p-md">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-body-sm color-muted">Total Projects</p>
 <p className="text-heading-3 font-bold">{stats.total}</p>
 </div>
 <Briefcase className="h-icon-lg w-icon-lg color-primary" />
 </div>
 </Card>
 <Card className="p-md">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-body-sm color-muted">Open</p>
 <p className="text-heading-3 font-bold">{stats.open}</p>
 </div>
 <Clock className="h-icon-lg w-icon-lg color-success" />
 </div>
 </Card>
 <Card className="p-md">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-body-sm color-muted">In Progress</p>
 <p className="text-heading-3 font-bold">{stats.inProgress}</p>
 </div>
 <Users className="h-icon-lg w-icon-lg color-warning" />
 </div>
 </Card>
 <Card className="p-md">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-body-sm color-muted">Total Proposals</p>
 <p className="text-heading-3 font-bold">{stats.proposals}</p>
 </div>
 <Star className="h-icon-lg w-icon-lg color-secondary" />
 </div>
 </Card>
 </div>

 {/* Data View */}
 <StateManagerProvider>
 <DataViewProvider
 data={projects}
 fields={PROJECTS_FIELD_CONFIGS}
 onExport={handleExport}
 onBulkAction={handleBulkAction}
 >
 <Card className="p-md">
 <div className="flex items-center justify-between mb-md">
 <ViewSwitcher
 currentView={selectedView}
 onViewChange={setSelectedView}
 availableViews={['grid', 'list', 'kanban']}
 />
 </div>

 <div className="stack-sm">
 <DataActions
 onExport={handleExport}
 showBulkActions={true}
 bulkActions={[
 { label: 'Delete Selected', value: 'delete', variant: 'destructive' }
 ]}
 />
 
 {selectedView === 'grid' ? (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
 {projects.map(renderProjectCard)}
 </div>
 ) : (
 <DataGrid
 viewType={selectedView}
 onRowClick={handleViewProject}
 rowActions={getRowActions}
 emptyMessage="No projects found"
 loading={loading}
 className="min-h-content-lg"
 />
 )}
 </div>
 </Card>
 </DataViewProvider>
 </StateManagerProvider>

 {/* Create/Edit Drawer */}
 <Drawer
 isOpen={drawerOpen}
 onClose={() => setDrawerOpen(false)}
 title={drawerMode === 'create' ? 'Post Project' : drawerMode === 'edit' ? 'Edit Project' : 'View Project'}
 size="lg"
 >
 <CreateProjectClient
 mode={drawerMode}
 project={selectedProject}
 onSuccess={() => {
 setDrawerOpen(false);
 loadProjects();
 }}
 onCancel={() => setDrawerOpen(false)}
 />
 </Drawer>
 </div>
 );
}
