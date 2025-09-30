'use client';
import { User, FileText, Settings, Award, Calendar, TrendingUp, Activity, Clock, Plus, Search, Play, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DataViewProvider, StateManagerProvider, Drawer, ViewSwitcher, DataActions } from '@ghxstship/ui';
import { Card, Badge, Button } from '@ghxstship/ui';
import { ResourcesService } from '../lib/resources-service';
import { getFieldConfigsForType } from '../lib/field-config';
import CreateResourceClient from '../drawers/CreateResourceClient';
import type { Resource, ResourceFilters, ResourceStats } from '../types';

export default function FeaturedClient() {
 const [resources, setResources] = useState<Resource[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const [selectedResources, setSelectedResources] = useState<string[]>([]);
 const [showCreateDrawer, setShowCreateDrawer] = useState(false);
 const [editingResource, setEditingResource] = useState<Resource | null>(null);
 const [currentView, setCurrentView] = useState<'grid' | 'kanban' | 'calendar' | 'list'>('grid');

 const resourcesService = useMemo(() => new ResourcesService(), []);

 // Fetch featured resources
 const fetchFeaturedResources = useCallback(async () => {
 try {
 setLoading(true);
 setError(null);
 
 const { resources: fetchedResources } = await resourcesService.getResources({
 filters: { is_featured: true },
 sort_by: 'view_count',
 sort_order: 'desc'
 });

 setResources(fetchedResources);
 } catch (err) {
 console.error('Error fetching featured resources:', err);
 setError(err instanceof Error ? err.message : 'Failed to load featured resources');
 } finally {
 setLoading(false);
 }
 }, [resourcesService]);

 useEffect(() => {
 fetchFeaturedResources();
 }, [fetchFeaturedResources]);

 // Handle resource creation
 const handleCreate = useCallback(() => {
 setEditingResource(null);
 setShowCreateDrawer(true);
 }, []);

 // Handle resource editing
 const handleEdit = useCallback((resource: Resource) => {
 setEditingResource(resource);
 setShowCreateDrawer(true);
 }, []);

 // Handle resource deletion
 const handleDelete = useCallback(async (resourceIds: string[]) => {
 try {
 if (resourceIds.length === 1) {
 await resourcesService.deleteResource(resourceIds[0]);
 } else {
 await resourcesService.deleteResources(resourceIds);
 }
 await fetchFeaturedResources();
 setSelectedResources([]);
 } catch (err) {
 console.error('Error deleting resources:', err);
 }
 }, [resourcesService, fetchFeaturedResources]);

 // Handle resource download
 const handleDownload = useCallback(async (resource: Resource) => {
 if (!resource.file_url) return;
 
 try {
 await resourcesService.incrementDownloadCount(resource.id);
 window.open(resource.file_url, '_blank');
 await fetchFeaturedResources();
 } catch (err) {
 console.error('Error downloading resource:', err);
 }
 }, [resourcesService, fetchFeaturedResources]);

 // Handle resource view
 const handleView = useCallback(async (resource: Resource) => {
 try {
 await resourcesService.incrementViewCount(resource.id);
 await fetchFeaturedResources();
 } catch (err) {
 console.error('Error updating view count:', err);
 }
 }, [resourcesService, fetchFeaturedResources]);

 // Handle toggle featured status
 const handleToggleFeatured = useCallback(async (resource: Resource) => {
 try {
 await resourcesService.updateResource({
 id: resource.id,
 is_featured: !resource.is_featured
 });
 await fetchFeaturedResources();
 } catch (err) {
 console.error('Error toggling featured status:', err);
 }
 }, [resourcesService, fetchFeaturedResources]);

 // Handle drawer close
 const handleDrawerClose = useCallback(() => {
 setShowCreateDrawer(false);
 setEditingResource(null);
 }, []);

 // Handle successful resource save
 const handleResourceSave = useCallback(async () => {
 await fetchFeaturedResources();
 handleDrawerClose();
 }, [fetchFeaturedResources, handleDrawerClose]);

 // Data view configuration
 const dataViewConfig = useMemo(() => ({
 fields: getFieldConfigsForType('featured'),
 data: resources,
 loading,
 error,
 selectedItems: selectedResources,
 onSelectionChange: setSelectedResources,
 onItemClick: handleView,
 onItemEdit: handleEdit,
 onItemDelete: (ids: string[]) => handleDelete(ids),
 currentView,
 onViewChange: setCurrentView,
 actions: [
 {
 id: 'toggle-featured',
 label: 'Remove from Featured',
 icon: Star,
 onClick: handleToggleFeatured
 },
 {
 id: 'download',
 label: 'Download',
 icon: Download,
 onClick: (resource: Resource) => handleDownload(resource),
 show: (resource: Resource) => !!resource.file_url
 },
 {
 id: 'edit',
 label: 'Edit',
 icon: Edit,
 onClick: handleEdit
 }
 ],
 bulkActions: [
 {
 id: 'remove-featured',
 label: 'Remove from Featured',
 onClick: async (resourceIds: string[]) => {
 for (const id of resourceIds) {
 const resource = resources.find(r => r.id === id);
 if (resource) {
 await resourcesService.updateResource({
 id: resource.id,
 is_featured: false
 });
 }
 }
 await fetchFeaturedResources();
 setSelectedResources([]);
 }
 },
 {
 id: 'delete',
 label: 'Delete Selected',
 onClick: handleDelete,
 variant: 'destructive' as const
 }
 ]
 }), [
 resources, loading, error, selectedResources, currentView,
 handleView, handleEdit, handleDelete, handleDownload, handleToggleFeatured, resourcesService, fetchFeaturedResources
 ]);

 // Calculate stats
 const stats = useMemo(() => {
 const totalViews = resources.reduce((sum, r) => sum + r.view_count, 0);
 const totalDownloads = resources.reduce((sum, r) => sum + r.download_count, 0);
 const avgViews = resources.length > 0 ? Math.round(totalViews / resources.length) : 0;
 const mostPopular = resources.reduce((max, r) => r.view_count > max.view_count ? r : max, resources[0]);

 return {
 totalFeatured: resources.length,
 totalViews,
 totalDownloads,
 avgViews,
 mostPopular
 };
 }, [resources]);

 return (
 <StateManagerProvider>
 <div className="stack-lg">
 {/* Header */}
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-heading-3">Featured Resources</h1>
 <p className="color-muted">Showcase your most important organizational resources</p>
 </div>
 <Button onClick={handleCreate}>
 <Plus className="w-4 h-4 mr-sm" />
 Add Featured Resource
 </Button>
 </div>

 {/* Stats Cards */}
 <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
 <Card>
 <div className="flex items-center gap-sm">
 <Star className="w-5 h-5 color-warning" />
 <div>
 <div className="text-heading-3 color-accent">{stats.totalFeatured}</div>
 <div className="text-body-sm color-muted">Featured Resources</div>
 </div>
 </div>
 </Card>
 <Card>
 <div className="flex items-center gap-sm">
 <Eye className="w-5 h-5 color-secondary" />
 <div>
 <div className="text-heading-3 color-secondary">{stats.totalViews}</div>
 <div className="text-body-sm color-muted">Total Views</div>
 </div>
 </div>
 </Card>
 <Card>
 <div className="flex items-center gap-sm">
 <Download className="w-5 h-5 color-accent" />
 <div>
 <div className="text-heading-3 color-accent">{stats.totalDownloads}</div>
 <div className="text-body-sm color-muted">Total Downloads</div>
 </div>
 </div>
 </Card>
 <Card>
 <div className="flex items-center gap-sm">
 <TrendingUp className="w-5 h-5 color-success" />
 <div>
 <div className="text-heading-3 color-success">{stats.avgViews}</div>
 <div className="text-body-sm color-muted">Avg Views</div>
 </div>
 </div>
 </Card>
 </div>

 {/* Most Popular Resource */}
 {stats.mostPopular && (
 <Card>
 <div className="flex items-center justify-between">
 <div>
 <h3 className="text-heading-4 mb-xs">Most Popular Featured Resource</h3>
 <p className="text-body color-foreground">{stats.mostPopular.title}</p>
 <div className="flex items-center gap-md mt-sm">
 <Badge variant="outline">{stats.mostPopular.type}</Badge>
 <span className="text-body-sm color-muted">{stats.mostPopular.view_count} views</span>
 <span className="text-body-sm color-muted">{stats.mostPopular.download_count} downloads</span>
 </div>
 </div>
 <Button onClick={() => handleView(stats.mostPopular)}>
 View Resource
 </Button>
 </div>
 </Card>
 )}

 {/* ATLVS DataViews */}
 <DataViewProvider config={dataViewConfig}>
 <div className="flex items-center justify-between mb-md">
 <ViewSwitcher />
 <DataActions />
 </div>
 
 <div className="min-h-96">
 {loading && (
 <div className="text-center py-xl">
 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-md"></div>
 <p className="color-muted">Loading featured resources...</p>
 </div>
 )}
 
 {error && (
 <Card>
 <div className="text-center py-xl">
 <Star className="w-12 h-12 color-destructive mx-auto mb-md" />
 <h3 className="text-body form-label color-foreground mb-sm">Error loading featured resources</h3>
 <p className="color-muted mb-md">{error}</p>
 <Button onClick={fetchFeaturedResources}>
 Try Again
 </Button>
 </div>
 </Card>
 )}
 
 {!loading && !error && resources.length === 0 && (
 <Card>
 <div className="text-center py-xl">
 <Star className="w-12 h-12 color-muted mx-auto mb-md" />
 <h3 className="text-body form-label color-foreground mb-sm">No featured resources</h3>
 <p className="color-muted mb-md">
 Start showcasing your most important resources by marking them as featured.
 </p>
 <Button onClick={handleCreate}>
 <Plus className="w-4 h-4 mr-sm" />
 Add Featured Resource
 </Button>
 </div>
 </Card>
 )}
 </div>
 </DataViewProvider>

 {/* Create/Edit Drawer */}
 <Drawer
 isOpen={showCreateDrawer}
 onClose={handleDrawerClose}
 title={editingResource ? 'Edit Featured Resource' : 'Create Featured Resource'}
 size="lg"
 >
 <CreateResourceClient
 resource={editingResource}
 onSuccess={handleResourceSave}
 onCancel={handleDrawerClose}
 />
 </Drawer>
 </div>
 </StateManagerProvider>
 );
}
