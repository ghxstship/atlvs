'use client';
import { Activity, Award, Calendar, Clock, FileText, Play, Plus, Search, Settings, Trash2, TrendingUp, User } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppDrawer, CalendarView, DataActions, DataGrid, DataViewProvider, GalleryView, KanbanBoard, ListView, StateManagerProvider, TimelineView, ViewSwitcher, type DataRecord, type DataViewConfig, type FieldConfig } from '@ghxstship/ui';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';

interface OnboardingWorkflow extends DataRecord {
 id: string;
 person_id: string;
 project_id?: string;
 status: 'pending' | 'in_progress' | 'completed' | 'on_hold';
 start_date: string;
 target_completion_date?: string;
 actual_completion_date?: string;
 progress_percentage: number;
 notes?: string;
 organization_id: string;
 created_at: string;
 updated_at: string;
 person?: {
 first_name: string;
 last_name: string;
 email?: string;
 department?: string;
 };
 project?: {
 name: string;
 status: string;
 };
 tasks_completed?: number;
 tasks_total?: number;
}

interface OnboardingClientProps {
 orgId: string;
}

export default function OnboardingClient({ orgId }: OnboardingClientProps) {
 const t = useTranslations('people.onboarding');
 const sb = createBrowserClient();
 const [loading, setLoading] = useState(false);
 const [onboardingData, setOnboardingData] = useState<OnboardingWorkflow[]>([]);

 // eslint-disable-next-line react-hooks/exhaustive-deps
 useEffect(() => {
 loadOnboardingData();
 
 // Set up real-time subscription
 const subscription = sb
 .channel('onboarding-changes')
 .on('postgres_changes', 
 { 
 event: '*', 
 schema: 'public', 
 table: 'onboarding_workflows',
 filter: `organization_id=eq.${orgId}`
 }, 
 (payload) => {
 loadOnboardingData();
 }
 )
 .subscribe();

 return () => {
 subscription.unsubscribe();
 };
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [orgId]);

 const loadOnboardingData = useCallback(async () => {
 setLoading(true);
 try {
 const { data, error } = await sb
 .from('onboarding_workflows')
 .select(`
 *,
 person:people(first_name, last_name, email, department),
 project:projects(name, status),
 tasks_completed:onboarding_tasks!workflow_id(count),
 tasks_total:onboarding_tasks!workflow_id(count)
 `)
 .eq('organization_id', orgId)
 .order('created_at', { ascending: false });
 
 if (error) {
 console.error('Supabase error:', error);
 throw error;
 }
 
 setOnboardingData(data || []);
 } catch (error) {
 console.error('Error loading onboarding data:', error);
 } finally {
 setLoading(false);
 }
 }, [orgId, sb]);

 // ATLVS DataViews field configuration - memoized for performance
 const fields: FieldConfig[] = useMemo(() => [
 {
 key: 'person.first_name',
 label: t('person'),
 type: 'text',
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
 key: 'status',
 label: t('status'),
 type: 'select',
 options: [
 { value: 'pending', label: t('pending') },
 { value: 'in_progress', label: t('inProgress') },
 { value: 'completed', label: t('completed') },
 { value: 'on_hold', label: t('onHold') }
 ],
 sortable: true,
 filterable: true
 },
 {
 key: 'progress_percentage',
 label: t('progress'),
 type: 'number',
 sortable: true,
 filterable: true
 },
 {
 key: 'start_date',
 label: t('startDate'),
 type: 'date',
 sortable: true,
 filterable: true
 },
 {
 key: 'target_completion_date',
 label: t('targetDate'),
 type: 'date',
 sortable: true,
 filterable: true
 },
 {
 key: 'actual_completion_date',
 label: t('completionDate'),
 type: 'date',
 sortable: true,
 filterable: true
 },
 {
 key: 'tasks_completed',
 label: t('tasksCompleted'),
 type: 'number',
 sortable: true,
 filterable: false
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
 loadOnboardingData();
 return;
 }

 try {
 const { data, error } = await sb
 .from('onboarding_workflows')
 .select(`
 *,
 person:people(first_name, last_name, email, department),
 project:projects(name, status),
 tasks_completed:onboarding_tasks!workflow_id(count),
 tasks_total:onboarding_tasks!workflow_id(count)
 `)
 .eq('organization_id', orgId)
 .or(`notes.ilike.%${query}%`)
 .order('created_at', { ascending: false });
 
 if (error) throw error;
 setOnboardingData(data || []);
 } catch (error) {
 console.error('Search error:', error);
 }
 }, [orgId, sb, loadOnboardingData]);

 // Advanced filtering
 const handleFilter = useCallback(async (filters: unknown) => {
 try {
 let query = sb
 .from('onboarding_workflows')
 .select(`
 *,
 person:people(first_name, last_name, email, department),
 project:projects(name, status),
 tasks_completed:onboarding_tasks!workflow_id(count),
 tasks_total:onboarding_tasks!workflow_id(count)
 `)
 .eq('organization_id', orgId);

 filters.forEach((filter: unknown) => {
 if (filter.value) {
 query = query.eq(filter.field, filter.value);
 }
 });

 const { data, error } = await query.order('created_at', { ascending: false });
 if (error) throw error;
 setOnboardingData(data || []);
 } catch (error) {
 console.error('Filter error:', error);
 }
 }, [orgId, sb]);

 // Advanced sorting
 const handleSort = useCallback(async (sorts: unknown) => {
 try {
 let query = sb
 .from('onboarding_workflows')
 .select(`
 *,
 person:people(first_name, last_name, email, department),
 project:projects(name, status),
 tasks_completed:onboarding_tasks!workflow_id(count),
 tasks_total:onboarding_tasks!workflow_id(count)
 `)
 .eq('organization_id', orgId);

 if (sorts.length > 0) {
 const sort = sorts[0];
 query = query.order(sort.field, { ascending: sort.direction === 'asc' });
 }

 const { data, error } = await query;
 if (error) throw error;
 setOnboardingData(data || []);
 } catch (error) {
 console.error('Sort error:', error);
 }
 }, [orgId, sb]);

 // Export functionality
 const handleExport = useCallback((format: string, data: DataRecord[], config?: unknown) => {
 const exportData = data.map(workflow => ({
 'Person': workflow.person ? `${workflow.person.first_name} ${workflow.person.last_name}` : 'N/A',
 'Project': workflow.project?.name || 'N/A',
 'Status': workflow.status,
 'Progress': `${workflow.progress_percentage}%`,
 'Start Date': workflow.start_date,
 'Target Date': workflow.target_completion_date || 'N/A',
 'Completion Date': workflow.actual_completion_date || 'N/A',
 'Tasks Completed': workflow.tasks_completed || 0,
 'Tasks Total': workflow.tasks_total || 0,
 'Created At': workflow.created_at
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
 a.download = `onboarding-workflows-${new Date().toISOString().split('T')[0]}.csv`;
 a.click();
 } else if (format === 'json') {
 const json = JSON.stringify(exportData, null, 2);
 const blob = new Blob([json], { type: 'application/json' });
 const url = URL.createObjectURL(blob);
 const a = document.createElement('a');
 a.href = url;
 a.download = `onboarding-workflows-${new Date().toISOString().split('T')[0]}.json`;
 a.click();
 }
 }, []);

 // Import functionality
 const handleImport = useCallback(async (data: DataRecord[]) => {
 try {
 const importData = data.map(workflow => ({
 ...workflow,
 organization_id: orgId,
 created_at: new Date().toISOString(),
 updated_at: new Date().toISOString()
 }));

 const { error } = await sb
 .from('onboarding_workflows')
 .insert(importData);

 if (error) throw error;
 
 loadOnboardingData();
 } catch (error) {
 console.error('Import error:', error);
 }
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [orgId, sb, loadOnboardingData]);

 // ATLVS DataViews configuration
 const onboardingConfig: DataViewConfig = useMemo(() => ({
 id: 'onboarding-dataviews',
 name: t('title'),
 viewType: 'grid',
 fields,
 data: onboardingData,
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
 confirmMessage: 'Are you sure you want to delete the selected onboarding workflows?'
 },
 {
 key: 'export',
 label: 'Export Selected',
 variant: 'secondary',
 onClick: async (selectedIds: string[]) => {
 const selectedData = onboardingData.filter(o => selectedIds.includes(o.id));
 handleExport('csv', selectedData);
 },
 requiresSelection: true
 },
 {
 key: 'complete',
 label: 'Mark as Completed',
 variant: 'secondary',
 onClick: async (selectedIds: string[]) => {
 // Implement completion functionality
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
 }), [t, fields, onboardingData, handleSearch, handleFilter, handleSort, handleExport, handleImport]);

 return (
 <div className="stack-lg">
 <DataViewProvider config={onboardingConfig}>
 <StateManagerProvider>
 <div className="stack-md">
 <ViewSwitcher />
 <DataActions />
 
 <DataGrid />
 
 <KanbanBoard 
 columns={[
 { id: 'pending', title: 'Pending' },
 { id: 'in_progress', title: 'In Progress' },
 { id: 'completed', title: 'Completed' },
 { id: 'on_hold', title: 'On Hold' }
 ]}
 statusField="status"
 titleField="person.first_name"
 />
 
 <CalendarView 
 startDateField="start_date"
 endDateField="target_completion_date"
 titleField="person.first_name"
 />
 
 <ListView 
 titleField="person.first_name"
 />
 
 <TimelineView 
 startDateField="start_date"
 titleField="person.first_name"
 />
 
 <GalleryView 
 titleField="person.first_name"
 />
 
 <AppDrawer
 title="Onboarding Workflow Details"
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
 <label className="block text-body-sm form-label mb-xs">Person</label>
 <div className="text-body color-foreground">Jack Sparrow</div>
 </div>
 <div>
 <label className="block text-body-sm form-label mb-xs">Project</label>
 <div className="text-body color-foreground">Blackwater Reverb</div>
 </div>
 <div>
 <label className="block text-body-sm form-label mb-xs">Status</label>
 <div className="text-body color-foreground">In Progress</div>
 </div>
 <div>
 <label className="block text-body-sm form-label mb-xs">Progress</label>
 <div className="text-body color-foreground">75%</div>
 </div>
 </div>
 </div>
 )
 },
 {
 key: 'tasks',
 label: 'Tasks',
 content: (
 <div className="p-md">
 <p className="color-muted">Onboarding tasks and checklist will be shown here.</p>
 </div>
 )
 },
 {
 key: 'timeline',
 label: 'Timeline',
 content: (
 <div className="p-md">
 <p className="color-muted">Onboarding timeline and milestones will be shown here.</p>
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
