'use client';
import { User, FileText, Settings, Award, Calendar, TrendingUp, Activity, Clock, Plus, Search, Play, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DataViewProvider, StateManagerProvider, Drawer, ViewSwitcher, DataActions } from '@ghxstship/ui';
import { Card, Badge, Button } from '@ghxstship/ui';
import { ResourcesService } from '../lib/resources-service';
import { getFieldConfigsForType } from '../lib/field-config';
import CreateResourceClient from '../drawers/CreateResourceClient';
import type { Resource } from '../types';

export default function PoliciesClient() {
 const [resources, setResources] = useState<Resource[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const [showCreateDrawer, setShowCreateDrawer] = useState(false);
 const [editingResource, setEditingResource] = useState<Resource | null>(null);

 const resourcesService = useMemo(() => new ResourcesService(), []);

 const fetchPolicies = useCallback(async () => {
 try {
 setLoading(true);
 const { resources: fetchedResources } = await resourcesService.getResources({
 filters: { type: 'policy' },
 sort_by: 'updated_at',
 sort_order: 'desc'
 });
 setResources(fetchedResources);
 } catch (err) {
 setError(err instanceof Error ? err.message : 'Failed to load policies');
 } finally {
 setLoading(false);
 }
 }, [resourcesService]);

 useEffect(() => {
 fetchPolicies();
 }, [fetchPolicies]);

 const handleCreate = useCallback(() => {
 setEditingResource(null);
 setShowCreateDrawer(true);
 }, []);

 const handleResourceSave = useCallback(async () => {
 await fetchPolicies();
 setShowCreateDrawer(false);
 setEditingResource(null);
 }, [fetchPolicies]);

 const stats = useMemo(() => {
 const published = resources.filter(r => r.status === 'published').length;
 const draft = resources.filter(r => r.status === 'draft').length;
 const underReview = resources.filter(r => r.status === 'under_review').length;
 
 return { total: resources.length, published, draft, underReview };
 }, [resources]);

 return (
 <StateManagerProvider>
 <div className="stack-lg">
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-heading-3">Organizational Policies</h1>
 <p className="color-muted">Manage company policies and governance documents</p>
 </div>
 <Button onClick={handleCreate}>
 <Plus className="w-4 h-4 mr-sm" />
 Add Policy
 </Button>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
 <Card>
 <div className="flex items-center gap-sm">
 <FileText className="w-5 h-5 color-accent" />
 <div>
 <div className="text-heading-3">{stats.total}</div>
 <div className="text-body-sm color-muted">Total Policies</div>
 </div>
 </div>
 </Card>
 <Card>
 <div className="flex items-center gap-sm">
 <Shield className="w-5 h-5 color-success" />
 <div>
 <div className="text-heading-3 color-success">{stats.published}</div>
 <div className="text-body-sm color-muted">Published</div>
 </div>
 </div>
 </Card>
 <Card>
 <div className="flex items-center gap-sm">
 <Eye className="w-5 h-5 color-warning" />
 <div>
 <div className="text-heading-3 color-warning">{stats.underReview}</div>
 <div className="text-body-sm color-muted">Under Review</div>
 </div>
 </div>
 </Card>
 <Card>
 <div className="flex items-center gap-sm">
 <Users className="w-5 h-5 color-secondary" />
 <div>
 <div className="text-heading-3 color-secondary">{stats.draft}</div>
 <div className="text-body-sm color-muted">Draft</div>
 </div>
 </div>
 </Card>
 </div>

 {!loading && !error && resources.length === 0 && (
 <Card>
 <div className="text-center py-xl">
 <FileText className="w-12 h-12 color-muted mx-auto mb-md" />
 <h3 className="text-body form-label color-foreground mb-sm">No policies found</h3>
 <p className="color-muted mb-md">Start building your policy library.</p>
 <Button onClick={handleCreate}>
 <Plus className="w-4 h-4 mr-sm" />
 Create First Policy
 </Button>
 </div>
 </Card>
 )}

 <Drawer
 isOpen={showCreateDrawer}
 onClose={() => setShowCreateDrawer(false)}
 title={editingResource ? 'Edit Policy' : 'Create Policy'}
 size="lg"
 >
 <CreateResourceClient
 resource={editingResource}
 onSuccess={handleResourceSave}
 onCancel={() => setShowCreateDrawer(false)}
 />
 </Drawer>
 </div>
 </StateManagerProvider>
 );
}
