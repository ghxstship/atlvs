'use client';
import { User, FileText, Settings, Award, Calendar, TrendingUp, Activity, Clock, Plus, Search, Play, Trash2, CheckSquare, Eye, Download, Users } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, Badge, Button ,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter
} from '@ghxstship/ui';
import { FilesService } from '../lib/files-service';
import type { DigitalAsset, AssetFilters } from '../types';
import type { Procedure } from './types';

const procedureTypeIcons = {
 sop: FileText,
 workflow: CheckSquare,
 checklist: CheckSquare,
 guideline: FileText,
 protocol: FileText,
 other: FileText
};

const difficultyColors = {
 beginner: 'success',
 intermediate: 'warning',
 advanced: 'destructive'
};

export default function ProceduresClient() {
 const [procedures, setProcedures] = useState<DigitalAsset[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const [searchQuery, setSearchQuery] = useState('');
 const [selectedProcedures, setSelectedProcedures] = useState<string[]>([]);
 const [showCreateDrawer, setShowCreateDrawer] = useState(false);
 const [currentView, setCurrentView] = useState<'grid' | 'list'>('list');

 const filesService = useMemo(() => new FilesService(), []);

 const fetchProcedures = useCallback(async () => {
 try {
 setLoading(true);
 setError(null);
 
 // Filter for procedure-related assets
 const procedureFilters: AssetFilters = {
 category: 'document', // Procedures are typically documents
 // We can add more specific filtering once the service supports procedure types
 };
 
 const result = await filesService.getAssets(undefined, {
 search: searchQuery,
 filters: procedureFilters,
 sortField: 'updated_at',
 sortDirection: 'desc'
 });

 if (result.error) {
 setError(result.error);
 } else {
 setProcedures(result.data?.data || []);
 }
 } catch (err) {
 console.error('Error fetching procedures:', err);
 setError(err instanceof Error ? err.message : 'Failed to load procedures');
 } finally {
 setLoading(false);
 }
 }, [filesService, searchQuery]);

 useEffect(() => {
 fetchProcedures();
 }, [fetchProcedures]);

 const handleCreate = useCallback(() => {
 setShowCreateDrawer(true);
 }, []);

 const handleView = useCallback(async (procedure: DigitalAsset) => {
 try {
 await filesService.incrementViewCount(procedure.id);
 await fetchProcedures();
 } catch (err) {
 console.error('Error updating view count:', err);
 }
 }, [filesService, fetchProcedures]);

 const handleDownload = useCallback(async (procedure: DigitalAsset) => {
 if (!procedure.file_url) return;
 
 try {
 await filesService.incrementDownloadCount(procedure.id);
 window.open(procedure.file_url, '_blank');
 await fetchProcedures();
 } catch (err) {
 console.error('Error downloading procedure:', err);
 }
 }, [filesService, fetchProcedures]);

 const handleExecute = useCallback((procedure: DigitalAsset) => {
 // This would open a procedure execution interface
 }, []);

 // Calculate stats
 const stats = useMemo(() => {
 const totalViews = procedures.reduce((sum, proc) => sum + proc.view_count, 0);
 const totalUsage = procedures.reduce((sum, proc) => sum + proc.download_count, 0);
 const publishedCount = procedures.filter(proc => proc.status === 'active').length;
 const draftCount = procedures.filter(proc => proc.status === 'draft').length;
 
 return {
 total: procedures.length,
 published: publishedCount,
 draft: draftCount,
 totalViews,
 totalUsage
 };
 }, [procedures]);

 return (
 <div className="stack-lg">
 {/* Header */}
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-heading-3">Standard Operating Procedures</h1>
 <p className="color-muted">Manage organizational procedures, workflows, and checklists</p>
 </div>
 <Button onClick={handleCreate}>
 <Plus className="w-icon-xs h-icon-xs mr-sm" />
 Create Procedure
 </Button>
 </div>

 {/* Search */}
 <div className="relative">
 <Search className="absolute left-sm top-xs/2 transform -translate-y-1/2 w-icon-xs h-icon-xs color-muted" />
 <input
 type="text"
 placeholder="Search procedures..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full pl-xl pr-md py-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
 />
 </div>

 {/* Stats Cards */}
 <div className="grid grid-cols-1 md:grid-cols-5 gap-md">
 <Card>
 <div className="flex items-center gap-sm">
 <FileText className="w-icon-sm h-icon-sm color-accent" />
 <div>
 <div className="text-heading-3">{stats.total}</div>
 <div className="text-body-sm color-muted">Total Procedures</div>
 </div>
 </div>
 </Card>
 <Card>
 <div className="flex items-center gap-sm">
 <CheckSquare className="w-icon-sm h-icon-sm color-success" />
 <div>
 <div className="text-heading-3 color-success">{stats.published}</div>
 <div className="text-body-sm color-muted">Published</div>
 </div>
 </div>
 </Card>
 <Card>
 <div className="flex items-center gap-sm">
 <Clock className="w-icon-sm h-icon-sm color-warning" />
 <div>
 <div className="text-heading-3 color-warning">{stats.draft}</div>
 <div className="text-body-sm color-muted">Draft</div>
 </div>
 </div>
 </Card>
 <Card>
 <div className="flex items-center gap-sm">
 <Eye className="w-icon-sm h-icon-sm color-secondary" />
 <div>
 <div className="text-heading-3 color-secondary">{stats.totalViews}</div>
 <div className="text-body-sm color-muted">Total Views</div>
 </div>
 </div>
 </Card>
 <Card>
 <div className="flex items-center gap-sm">
 <Play className="w-icon-sm h-icon-sm color-primary" />
 <div>
 <div className="text-heading-3 color-primary">{stats.totalUsage}</div>
 <div className="text-body-sm color-muted">Executions</div>
 </div>
 </div>
 </Card>
 </div>

 {/* Procedures List */}
 {loading && (
 <div className="text-center py-xl">
 <div className="animate-spin rounded-full h-icon-lg w-icon-lg border-b-2 border-primary mx-auto mb-md"></div>
 <p className="color-muted">Loading procedures...</p>
 </div>
 )}
 
 {error && (
 <Card>
 <div className="text-center py-xl">
 <FileText className="w-icon-2xl h-icon-2xl color-destructive mx-auto mb-md" />
 <h3 className="text-body form-label color-foreground mb-sm">Error loading procedures</h3>
 <p className="color-muted mb-md">{error}</p>
 <Button onClick={fetchProcedures}>
 Try Again
 </Button>
 </div>
 </Card>
 )}
 
 {!loading && !error && procedures.length === 0 && (
 <Card>
 <div className="text-center py-xl">
 <FileText className="w-icon-2xl h-icon-2xl color-muted mx-auto mb-md" />
 <h3 className="text-body form-label color-foreground mb-sm">No procedures found</h3>
 <p className="color-muted mb-md">
 {searchQuery 
 ? 'No procedures match your search criteria.' 
 : 'Start building your procedure library with SOPs, workflows, and checklists.'}
 </p>
 <Button onClick={handleCreate}>
 <Plus className="w-icon-xs h-icon-xs mr-sm" />
 Create First Procedure
 </Button>
 </div>
 </Card>
 )}

 {!loading && !error && procedures.length > 0 && (
 <div className="stack-md">
 {procedures.map(procedure => {
 const IconComponent = procedureTypeIcons.sop; // Default to SOP icon
 
 return (
 <Card 
 key={procedure.id}
 className="cursor-pointer hover:shadow-elevated transition-shadow"
 onClick={() => handleView(procedure)}
 >
 <div className="flex items-start gap-md">
 <div className="p-sm bg-secondary/50 rounded">
 <IconComponent className="w-icon-sm h-icon-sm color-accent" />
 </div>
 
 <div className="flex-1 min-w-0">
 <div className="flex items-start justify-between mb-xs">
 <h3 className="text-body form-label color-foreground">{procedure.title}</h3>
 <Badge variant="outline">SOP</Badge>
 </div>
 
 {procedure.description && (
 <p className="text-body-sm color-muted mb-sm line-clamp-xs">{procedure.description}</p>
 )}
 
 <div className="flex items-center gap-md mb-sm">
 <div className="flex items-center gap-xs text-body-sm color-muted">
 <Users className="w-3 h-3" />
 <span>All Departments</span>
 </div>
 <div className="flex items-center gap-xs text-body-sm color-muted">
 <Clock className="w-3 h-3" />
 <span>~15 min</span>
 </div>
 <Badge variant="outline" className="text-xs">
 Beginner
 </Badge>
 </div>
 
 <div className="flex items-center gap-md text-body-sm color-muted">
 <div className="flex items-center gap-xs">
 <Eye className="w-3 h-3" />
 <span>{procedure.view_count}</span>
 </div>
 <div className="flex items-center gap-xs">
 <Play className="w-3 h-3" />
 <span>{procedure.download_count}</span>
 </div>
 <span>Updated {new Date(procedure.updated_at).toLocaleDateString()}</span>
 </div>
 </div>
 
 <div className="flex items-center gap-sm">
 <Button
 size="sm"
 variant="outline"
 onClick={(e) => {
 e.stopPropagation();
 handleExecute(procedure);
 }}
 >
 <Play className="w-3 h-3 mr-xs" />
 Execute
 </Button>
 {procedure.file_url && (
 <Button
 size="sm"
 variant="outline"
 onClick={(e) => {
 e.stopPropagation();
 handleDownload(procedure);
 }}
 >
 <Download className="w-3 h-3" />
 </Button>
 )}
 </div>
 </div>
 </Card>
 );
 })}
 </div>
 )}
 </div>
 );
}
