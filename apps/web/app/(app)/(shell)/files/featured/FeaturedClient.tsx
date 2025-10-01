'use client';
import { Star, Download, Edit, Eye, Plus, TrendingUp } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Drawer, Badge, Button } from '@ghxstship/ui';
import { ResourcesService } from '../lib/resources-service';
import CreateResourceClient from '../drawers/CreateResourceClient';
import type { Resource } from '../types';

export default function FeaturedClient() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateDrawer, setShowCreateDrawer] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);

  const resourcesService = useMemo(() => new ResourcesService(), []);

  // Fetch featured resources
  const fetchFeaturedResources = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await resourcesService.getResources('org-id', {
        is_featured: true,
        sort_by: 'view_count',
        sort_order: 'desc'
      });

      setResources(Array.isArray(data) ? data : []);
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

  // Handle resource download
  const handleDownload = useCallback(async (resource: Resource) => {
    if (!resource.file_url) return;
    
    try {
      await resourcesService.incrementDownloadCount('org-id', resource.id);
      window.open(resource.file_url, '_blank');
      await fetchFeaturedResources();
    } catch (err) {
      console.error('Error downloading resource:', err);
    }
  }, [resourcesService, fetchFeaturedResources]);

  // Handle resource view
  const handleView = useCallback(async (resource: Resource) => {
    try {
      await resourcesService.incrementViewCount('org-id', resource.id);
      await fetchFeaturedResources();
    } catch (err) {
      console.error('Error updating view count:', err);
    }
  }, [resourcesService, fetchFeaturedResources]);

  // Handle toggle featured status
  const handleToggleFeatured = useCallback(async (resource: Resource) => {
    try {
      await resourcesService.updateResource('org-id', resource.id, {
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

  // Calculate stats
  const stats = useMemo(() => {
    const totalViews = resources.reduce((sum, r) => sum + (r.view_count || 0), 0);
    const totalDownloads = resources.reduce((sum, r) => sum + (r.download_count || 0), 0);
    const avgViews = resources.length > 0 ? Math.round(totalViews / resources.length) : 0;
    const mostPopular = resources.length > 0 
      ? resources.reduce((max, r) => (r.view_count || 0) > (max.view_count || 0) ? r : max, resources[0])
      : null;

    return {
      totalFeatured: resources.length,
      totalViews,
      totalDownloads,
      avgViews,
      mostPopular
    };
  }, [resources]);

  // Render resource card
  const renderResourceCard = (resource: Resource) => (
    <div key={resource.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="font-semibold mb-1">{resource.title}</h3>
          <p className="text-sm text-muted-foreground mb-2">{resource.description}</p>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{resource.type}</Badge>
            <span className="text-xs text-muted-foreground">{resource.view_count || 0} views</span>
            <span className="text-xs text-muted-foreground">{resource.download_count || 0} downloads</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => handleView(resource)}>
            <Eye className="w-icon-xs h-icon-xs" />
          </Button>
          {resource.file_url && (
            <Button variant="ghost" size="sm" onClick={() => handleDownload(resource)}>
              <Download className="w-icon-xs h-icon-xs" />
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => handleEdit(resource)}>
            <Edit className="w-icon-xs h-icon-xs" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleToggleFeatured(resource)}>
            <Star className={`w-icon-xs h-icon-xs ${resource.is_featured ? 'fill-current text-warning' : ''}`} />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Featured Resources</h1>
          <p className="text-muted-foreground mt-1">Showcase your most important organizational resources</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-icon-xs h-icon-xs mr-2" />
          Add Featured Resource
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <Star className="w-icon-sm h-icon-sm text-warning" />
            <div>
              <div className="text-2xl font-bold">{stats.totalFeatured}</div>
              <div className="text-sm text-muted-foreground">Featured Resources</div>
            </div>
          </div>
        </div>
        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <Eye className="w-icon-sm h-icon-sm text-info" />
            <div>
              <div className="text-2xl font-bold">{stats.totalViews}</div>
              <div className="text-sm text-muted-foreground">Total Views</div>
            </div>
          </div>
        </div>
        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <Download className="w-icon-sm h-icon-sm text-success" />
            <div>
              <div className="text-2xl font-bold">{stats.totalDownloads}</div>
              <div className="text-sm text-muted-foreground">Total Downloads</div>
            </div>
          </div>
        </div>
        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-icon-sm h-icon-sm text-success" />
            <div>
              <div className="text-2xl font-bold">{stats.avgViews}</div>
              <div className="text-sm text-muted-foreground">Avg Views</div>
            </div>
          </div>
        </div>
      </div>

      {/* Most Popular Resource */}
      {stats.mostPopular && (
        <div className="p-4 border rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">Most Popular Featured Resource</h3>
              <p className="font-medium">{stats.mostPopular.title}</p>
              <div className="flex items-center gap-4 mt-2">
                <Badge variant="outline">{stats.mostPopular.type}</Badge>
                <span className="text-sm text-muted-foreground">{stats.mostPopular.view_count || 0} views</span>
                <span className="text-sm text-muted-foreground">{stats.mostPopular.download_count || 0} downloads</span>
              </div>
            </div>
            <Button onClick={() => handleView(stats.mostPopular!)}>
              View Resource
            </Button>
          </div>
        </div>
      )}

      {/* Resources Grid */}
      <div className="min-h-container-lg">
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-icon-lg w-icon-lg border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading featured resources...</p>
          </div>
        )}
        
        {error && (
          <div className="p-4 border rounded-lg">
            <div className="text-center py-12">
              <Star className="w-icon-2xl h-icon-2xl text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error loading featured resources</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={fetchFeaturedResources}>
                Try Again
              </Button>
            </div>
          </div>
        )}
        
        {!loading && !error && resources.length === 0 && (
          <div className="p-4 border rounded-lg">
            <div className="text-center py-12">
              <Star className="w-icon-2xl h-icon-2xl text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No featured resources</h3>
              <p className="text-muted-foreground mb-4">
                Start showcasing your most important resources by marking them as featured.
              </p>
              <Button onClick={handleCreate}>
                <Plus className="w-icon-xs h-icon-xs mr-2" />
                Add Featured Resource
              </Button>
            </div>
          </div>
        )}

        {!loading && !error && resources.length > 0 && (
          <div className="grid grid-cols-1 gap-4">
            {resources.map(renderResourceCard)}
          </div>
        )}
      </div>

      {/* Create/Edit Drawer */}
      <Drawer
        open={showCreateDrawer}
        onOpenChange={setShowCreateDrawer}
      >
        <CreateResourceClient
          resource={editingResource}
          onSuccess={handleResourceSave}
        />
      </Drawer>
    </div>
  );
}
