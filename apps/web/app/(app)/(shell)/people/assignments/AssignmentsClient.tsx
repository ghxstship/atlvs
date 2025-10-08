'use client';
import { Activity, Award, Calendar, Clock, FileText, Play, Plus, Search, Settings, Trash2, TrendingUp, User } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppDrawer, CalendarView, DataActions, DataGrid, DataViewProvider, GalleryView, KanbanBoard, ListView, StateManagerProvider, TimelineView, ViewSwitcher, type DataRecord, type DataViewConfig, type FieldConfig } from '@ghxstship/ui';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';

interface Assignment extends DataRecord {
 id: string;
 project_id: string;
 role: string;
 required_count: number;
 filled_count: number;
 department?: string;
 skills_required?: string[];
 hourly_rate?: number;
 notes?: string;
 organization_id: string;
 updated_at: string;
 project?: {
 name: string;
 status: string;
 };
}

interface AssignmentsClientProps {
 orgId: string;
}

interface QueryFilter {
 field: string;
 value?: string | number | boolean | null;
}

interface SortOption {
 field: string;
 direction: 'asc' | 'desc';
}

export default function AssignmentsClient({ orgId }: AssignmentsClientProps) {
 const t = useTranslations('people.assignments');
 const sb = useMemo(() => createBrowserClient(), []);
 const [loading, setLoading] = useState(false);
 const [assignmentsData, setAssignmentsData] = useState<Assignment[]>([]);

 const loadAssignmentsData = useCallback(async () => {
 setLoading(true);
 try {
 const { data, error } = await sb
 .from('manning_slots')
 .select(`
 *,
 project:projects(name, status)
 `)
 .eq('organization_id', orgId)
 .order('created_at', { ascending: false });
 
 if (error) {
 console.error('Supabase error:', error);
 throw error;
 }
 
 setAssignmentsData(data || []);
 } catch (error) {
 console.error('Error loading assignments data:', error);
 // Could add toast notification here
 } finally {
 setLoading(false);
 }
 }, [orgId, sb]);

 // eslint-disable-next-line react-hooks/exhaustive-deps
 useEffect(() => {
 loadAssignmentsData();
 
 // Set up real-time subscription
 const subscription = sb
 .channel('assignments-changes')
 .on('postgres_changes', 
 { 
 event: '*', 
 schema: 'public', 
 table: 'manning_slots',
 filter: `organization_id=eq.${orgId}`
 }, 
 (payload) => {
 loadAssignmentsData();
 }
 )
 .subscribe();

 return () => {
 subscription.unsubscribe();
 };
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [loadAssignmentsData, orgId, sb]);

 // ATLVS DataViews field configuration - memoized for performance
 const fields: FieldConfig[] = useMemo(() => [
 {
 key: 'role',
 label: t('role'),
 type: 'text',
 required: true,
 sortable: true,
 filterable: true
 },
 {
 key: 'project.name',
 label: t('project'),
 type: 'text',
 sortable: true,
 filterable: true
 },
 {
 key: 'required_count',
 label: t('requiredCount'),
 type: 'number',
 sortable: true,
 filterable: true
 },
 {
 key: 'filled_count',
 label: t('filledCount'),
 type: 'number',
 sortable: true,
 filterable: true
 },
 {
 key: 'department',
 label: t('department'),
 type: 'text',
 sortable: true,
 filterable: true
 },
 {
 key: 'hourly_rate',
 label: t('hourlyRate'),
 type: 'currency',
 sortable: true,
 filterable: true
 },
 {
 key: 'created_at',
 label: t('createdAt'),
 type: 'date',
 sortable: true,
 filterable: true
 }
 ], [t]);

 // Advanced search functionality
 const handleSearch = useCallback(async (query: string) => {
 if (!query.trim()) {
 loadAssignmentsData();
 return;
 }

 try {
 const { data } = await sb
 .from('manning_slots')
 .select(`
 *,
 project:projects(name, status)
 `)
 .eq('organization_id', orgId)
 .or(`role.ilike.%${query}%,department.ilike.%${query}%,notes.ilike.%${query}%`)
 .order('created_at', { ascending: false });
 
 setAssignmentsData(data || []);
 } catch (error) {
 console.error('Search error:', error);
 }
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [orgId, sb, loadAssignmentsData]);

 // Advanced filtering
 const handleFilter = useCallback(async (filters: QueryFilter[]) => {
 try {
 let query = sb
 .from('manning_slots')
 .select(`
 *,
 project:projects(name, status)
 `)
 .eq('organization_id', orgId);

 filters.forEach((filter) => {
 if (filter.value !== undefined && filter.value !== null && filter.value !== '') {
 query = query.eq(filter.field, filter.value as string | number | boolean);
 }
 });

 const { data } = await query.order('created_at', { ascending: false });
 setAssignmentsData(data || []);
 } catch (error) {
 console.error('Filter error:', error);
 }
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [orgId, sb]);

 // Advanced sorting
 const handleSort = useCallback(async (sorts: SortOption[]) => {
 try {
 let query = sb
 .from('manning_slots')
 .select(`
 *,
 project:projects(name, status)
 `)
 .eq('organization_id', orgId);

 if (Array.isArray(sorts) && sorts.length > 0) {
 const [sort] = sorts;
 if (sort?.field) {
 query = query.order(sort.field, { ascending: sort.direction === 'asc' });
 }
 }

 const { data } = await query;
 setAssignmentsData(data || []);
 } catch (error) {
 console.error('Sort error:', error);
 }
 }, [orgId, sb]);

 // Export functionality
 const handleExport = useCallback((format: string, data: DataRecord[]) => {
 const exportData = data.map(assignment => ({
 'Role': assignment.role,
 'Project': assignment.project?.name || 'N/A',
 'Required Count': assignment.required_count,
 'Filled Count': assignment.filled_count,
 'Department': assignment.department || 'N/A',
 'Hourly Rate': assignment.hourly_rate || 'N/A',
 'Notes': assignment.notes || 'N/A',
 'Created At': assignment.created_at
 }));

 if (format === 'csv') {
 const csv = [
 Object.keys(exportData[0]).join(','),
 ...exportData.map(row => Object.values(row).join(','))
 ].join('\n');
 
 const blob = new Blob([csv], { type: 'text/csv' });
 const url = URL.createObjectURL(blob);
 const a = document.createElement('a');
 a.href = url;
 a.download = `assignments-${new Date().toISOString().split('T')[0]}.csv`;
 a.click();
 } else if (format === 'json') {
 const json = JSON.stringify(exportData, null, 2);
 const blob = new Blob([json], { type: 'application/json' });
 const url = URL.createObjectURL(blob);
 const a = document.createElement('a');
 a.href = url;
 a.download = `assignments-${new Date().toISOString().split('T')[0]}.json`;
 a.click();
 }
 }, []);

 // Import functionality
 const handleImport = useCallback(async (data: DataRecord[]) => {
 try {
 const importData = data.map(assignment => ({
 ...assignment,
 organization_id: orgId,
 created_at: new Date().toISOString(),
 updated_at: new Date().toISOString()
 }));

 const { error } = await sb
 .from('manning_slots')
 .insert(importData);

 if (error) throw error;
 
 loadAssignmentsData();
 } catch (error) {
 console.error('Import error:', error);
 }
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [orgId, sb, loadAssignmentsData]);

 // ATLVS DataViews configuration
 const assignmentsConfig: DataViewConfig = useMemo(() => ({
 id: 'assignments-dataviews',
 name: t('title'),
 viewType: 'grid',
 fields,
 data: assignmentsData,
 defaultView: 'grid',
 bulkActions: [
 {
 key: 'delete',
 label: 'Delete Selected',
 variant: 'destructive',
 onClick: async (selectedIds: string[]) => {
 // Implement delete functionality
 },
 requiresSelection: true,
 confirmMessage: 'Are you sure you want to delete the selected assignments?'
 },
 {
 key: 'export',
 label: 'Export Selected',
 variant: 'secondary',
 onClick: async (selectedIds: string[]) => {
 const selectedData = assignmentsData.filter(a => selectedIds.includes(a.id));
 handleExport('csv', selectedData);
 },
 requiresSelection: true
 }
 ],
 exportConfig: {
 formats: ['csv', 'json', 'excel'],
 onExport: handleExport
 },
 importConfig: {
 formats: ['csv', 'json'],
 onImport: handleImport
 },
 onSearch: handleSearch,
 onFilter: handleFilter,
 onSort: handleSort
 }), [t, fields, assignmentsData, handleSearch, handleFilter, handleSort, handleExport, handleImport]);

 return (
 <div className="stack-lg">
 <DataViewProvider config={assignmentsConfig}>
 <StateManagerProvider>
 <div className="stack-md">
 <ViewSwitcher />
 <DataActions />
 
 <DataGrid />
 
 <KanbanBoard 
 columns={[
 { id: 'open', title: 'Open' },
 { id: 'filled', title: 'Filled' },
 { id: 'closed', title: 'Closed' }
 ]}
 statusField="status"
 titleField="role"
 />
 
 <CalendarView 
 startDateField="created_at"
 titleField="role"
 />
 
 <ListView 
 titleField="role"
 />
 
 <TimelineView 
 startDateField="created_at"
 titleField="role"
 />
 
 <GalleryView 
 titleField="role"
 />
 
 <AppDrawer
 title="Assignment Details"
 open={false}
 onClose={() => {}}
 record={null}
 fields={fields}
 mode="view"
 tabs={[
 {
 key: 'details',
 label: 'Details',
 content: (
 <div className="p-md stack-md">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
 <div>
 <label className="block text-body-sm form-label mb-xs">Role</label>
 <div className="text-body color-foreground">Camera Operator</div>
 </div>
 <div>
 <label className="block text-body-sm form-label mb-xs">Project</label>
 <div className="text-body color-foreground">Blackwater Reverb</div>
 </div>
 <div>
 <label className="block text-body-sm form-label mb-xs">Required Count</label>
 <div className="text-body color-foreground">3</div>
 </div>
 <div>
 <label className="block text-body-sm form-label mb-xs">Filled Count</label>
 <div className="text-body color-foreground">2</div>
 </div>
 </div>
 </div>
 )
 },
 {
 key: 'requirements',
 label: 'Requirements',
 content: (
 <div className="p-md">
 <p className="color-muted">Skills and requirements will be shown here.</p>
 </div>
 )
 },
 {
 key: 'candidates',
 label: 'Candidates',
 content: (
 <div className="p-md">
 <p className="color-muted">Candidate applications will be shown here.</p>
 </div>
 )
 }
 ]}
 />
 </div>
 </StateManagerProvider>
 </DataViewProvider>
 </div>
 );
}
