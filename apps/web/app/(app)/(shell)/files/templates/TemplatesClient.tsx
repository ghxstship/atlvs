'use client';
import { User, FileText, Settings, Award, Calendar, TrendingUp, Activity, Clock, Plus, Search, Play, Trash2, Download, Users, File } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, Badge, Button } from '@ghxstship/ui';
import { ResourcesService } from '../lib/resources-service';
import type { Resource } from '../types';

export default function TemplatesClient() {
 const [resources, setResources] = useState<Resource[]>([]);
 const [loading, setLoading] = useState(true);

 const resourcesService = useMemo(() => new ResourcesService(), []);

 const fetchTemplates = useCallback(async () => {
 try {
 setLoading(true);
 const { resources: fetchedResources } = await resourcesService.getResources({
 filters: { type: 'template' },
 sort_by: 'download_count',
 sort_order: 'desc'
 });
 setResources(fetchedResources);
 } catch (err) {
 console.error('Error fetching templates:', err);
 } finally {
 setLoading(false);
 }
 }, [resourcesService]);

 useEffect(() => {
 fetchTemplates();
 }, [fetchTemplates]);

 const stats = useMemo(() => {
 const totalDownloads = resources.reduce((sum, r) => sum + r.download_count, 0);
 const mostUsed = resources.reduce((max, r) => r.download_count > max.download_count ? r : max, resources[0]);
 
 return { 
 total: resources.length, 
 totalDownloads,
 mostUsed: mostUsed?.title || 'None'
 };
 }, [resources]);

 return (
 <div className="stack-lg">
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-heading-3">Templates & Forms</h1>
 <p className="color-muted">Reusable templates and document forms</p>
 </div>
 <Button>
 <Plus className="w-icon-xs h-icon-xs mr-sm" />
 Add Template
 </Button>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
 <Card>
 <div className="flex items-center gap-sm">
 <File className="w-icon-sm h-icon-sm color-accent" />
 <div>
 <div className="text-heading-3">{stats.total}</div>
 <div className="text-body-sm color-muted">Total Templates</div>
 </div>
 </div>
 </Card>
 <Card>
 <div className="flex items-center gap-sm">
 <Download className="w-icon-sm h-icon-sm color-success" />
 <div>
 <div className="text-heading-3 color-success">{stats.totalDownloads}</div>
 <div className="text-body-sm color-muted">Total Downloads</div>
 </div>
 </div>
 </Card>
 <Card>
 <div className="flex items-center gap-sm">
 <Users className="w-icon-sm h-icon-sm color-secondary" />
 <div>
 <div className="text-heading-4 color-secondary truncate">{stats.mostUsed}</div>
 <div className="text-body-sm color-muted">Most Popular</div>
 </div>
 </div>
 </Card>
 </div>

 {!loading && resources.length === 0 && (
 <Card>
 <div className="text-center py-xl">
 <File className="w-icon-2xl h-icon-2xl color-muted mx-auto mb-md" />
 <h3 className="text-body form-label color-foreground mb-sm">No templates found</h3>
 <p className="color-muted mb-md">Create reusable templates and forms.</p>
 <Button>
 <Plus className="w-icon-xs h-icon-xs mr-sm" />
 Create First Template
 </Button>
 </div>
 </Card>
 )}
 </div>
 );
}
