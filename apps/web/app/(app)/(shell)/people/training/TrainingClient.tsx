'use client';
import { Activity, Award, Calendar, Clock, FileText, Play, Plus, Search, Settings, Trash2, TrendingUp, User } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppDrawer, CalendarView, DataActions, DataGrid, DataViewProvider, GalleryView, KanbanBoard, ListView, StateManagerProvider, TimelineView, ViewSwitcher, type DataRecord, type DataViewConfig, type FieldConfig } from '@ghxstship/ui';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';

interface TrainingRecord extends DataRecord {
 id: string;
 person_id: string;
 program_id: string;
 status: 'enrolled' | 'in_progress' | 'completed' | 'expired' | 'failed';
 completion_date?: string;
 expiry_date?: string;
 score?: number;
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
 program?: {
 name: string;
 category: string;
 duration: number;
 required: boolean;
 };
}

interface TrainingClientProps {
 orgId: string;
}

export default function TrainingClient({ orgId }: TrainingClientProps) {
 const t = useTranslations('people.training');
 const sb = createBrowserClient();
 const [loading, setLoading] = useState(false);
 const [trainingData, setTrainingData] = useState<TrainingRecord[]>([]);

 // eslint-disable-next-line react-hooks/exhaustive-deps
 useEffect(() => {
 loadTrainingData();
 
 // Set up real-time subscription
 const subscription = sb
 .channel('training-changes')
 .on('postgres_changes', 
 { 
 event: '*', 
 schema: 'public', 
 table: 'training_records',
 filter: `organization_id=eq.${orgId}`
 }, 
 (payload) => {
 loadTrainingData();
 }
 )
 .subscribe();

 return () => {
 subscription.unsubscribe();
 };
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [orgId]);

 const loadTrainingData = useCallback(async () => {
 setLoading(true);
 try {
 const { data, error } = await sb
 .from('training_records')
 .select(`
 *,
 person:people(first_name, last_name, email, department),
 program:training_programs(name, category, duration, required)
 `)
 .eq('organization_id', orgId)
 .order('created_at', { ascending: false });
 
 if (error) {
 console.error('Supabase error:', error);
 throw error;
 }
 
 setTrainingData(data || []);
 } catch (error) {
 console.error('Error loading training data:', error);
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
 key: 'program.name',
 label: t('program'),
 type: 'text',
 sortable: true,
 filterable: true
 },
 {
 key: 'program.category',
 label: t('category'),
 type: 'select',
 options: [
 { value: 'safety', label: t('safety') },
 { value: 'technical', label: t('technical') },
 { value: 'compliance', label: t('compliance') },
 { value: 'leadership', label: t('leadership') },
 { value: 'certification', label: t('certification') }
 ],
 sortable: true,
 filterable: true
 },
 {
 key: 'status',
 label: t('status'),
 type: 'select',
 options: [
 { value: 'enrolled', label: t('enrolled') },
 { value: 'in_progress', label: t('inProgress') },
 { value: 'completed', label: t('completed') },
 { value: 'expired', label: t('expired') },
 { value: 'failed', label: t('failed') }
 ],
 sortable: true,
 filterable: true
 },
 {
 key: 'completion_date',
 label: t('completionDate'),
 type: 'date',
 sortable: true,
 filterable: true
 },
 {
 key: 'expiry_date',
 label: t('expiryDate'),
 type: 'date',
 sortable: true,
 filterable: true
 },
 {
 key: 'score',
 label: t('score'),
 type: 'number',
 sortable: true,
 filterable: true
 },
 {
 key: 'program.duration',
 label: t('duration'),
 type: 'number',
 sortable: true,
 filterable: true
 },
 {
 key: 'created_at',
 label: t('enrolledAt'),
 type: 'date',
 sortable: true,
 filterable: true
 }
 ], [t]);

 // Advanced search functionality
 const handleSearch = useCallback(async (query: string) => {
 if (!query.trim()) {
 loadTrainingData();
 return;
 }

 try {
 const { data, error } = await sb
 .from('training_records')
 .select(`
 *,
 person:people(first_name, last_name, email, department),
 program:training_programs(name, category, duration, required)
 `)
 .eq('organization_id', orgId)
 .or(`notes.ilike.%${query}%`)
 .order('created_at', { ascending: false });
 
 if (error) throw error;
 setTrainingData(data || []);
 } catch (error) {
 console.error('Search error:', error);
 }
 }, [orgId, sb, loadTrainingData]);

 // Advanced filtering
 const handleFilter = useCallback(async (filters: unknown) => {
 try {
 let query = sb
 .from('training_records')
 .select(`
 *,
 person:people(first_name, last_name, email, department),
 program:training_programs(name, category, duration, required)
 `)
 .eq('organization_id', orgId);

 filters.forEach((filter: unknown) => {
 if (filter.value) {
 query = query.eq(filter.field, filter.value);
 }
 });

 const { data, error } = await query.order('created_at', { ascending: false });
 if (error) throw error;
 setTrainingData(data || []);
 } catch (error) {
 console.error('Filter error:', error);
 }
 }, [orgId, sb]);

 // Advanced sorting
 const handleSort = useCallback(async (sorts: unknown) => {
 try {
 let query = sb
 .from('training_records')
 .select(`
 *,
 person:people(first_name, last_name, email, department),
 program:training_programs(name, category, duration, required)
 `)
 .eq('organization_id', orgId);

 if (sorts.length > 0) {
 const sort = sorts[0];
 query = query.order(sort.field, { ascending: sort.direction === 'asc' });
 }

 const { data, error } = await query;
 if (error) throw error;
 setTrainingData(data || []);
 } catch (error) {
 console.error('Sort error:', error);
 }
 }, [orgId, sb]);

 // Export functionality
 const handleExport = useCallback((format: string, data: DataRecord[], config?: unknown) => {
 const exportData = data.map(record => ({
 'Person': record.person ? `${record.person.first_name} ${record.person.last_name}` : 'N/A',
 'Program': record.program?.name || 'N/A',
 'Category': record.program?.category || 'N/A',
 'Status': record.status,
 'Completion Date': record.completion_date || 'N/A',
 'Expiry Date': record.expiry_date || 'N/A',
 'Score': record.score || 'N/A',
 'Duration (hours)': record.program?.duration || 'N/A',
 'Enrolled At': record.created_at
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
 a.download = `training-records-${new Date().toISOString().split('T')[0]}.csv`;
 a.click();
 } else if (format === 'json') {
 const json = JSON.stringify(exportData, null, 2);
 const blob = new Blob([json], { type: 'application/json' });
 const url = URL.createObjectURL(blob);
 const a = document.createElement('a');
 a.href = url;
 a.download = `training-records-${new Date().toISOString().split('T')[0]}.json`;
 a.click();
 }
 }, []);

 // Import functionality
 const handleImport = useCallback(async (data: DataRecord[]) => {
 try {
 const importData = data.map(record => ({
 ...record,
 organization_id: orgId,
 created_at: new Date().toISOString(),
 updated_at: new Date().toISOString()
 }));

 const { error } = await sb
 .from('training_records')
 .insert(importData);

 if (error) throw error;
 
 loadTrainingData();
 } catch (error) {
 console.error('Import error:', error);
 }
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [orgId, sb, loadTrainingData]);

 // ATLVS DataViews configuration
 const trainingConfig: DataViewConfig = useMemo(() => ({
 id: 'training-dataviews',
 name: t('title'),
 viewType: 'grid',
 fields,
 data: trainingData,
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
 confirmMessage: 'Are you sure you want to delete the selected training records?'
 },
 {
 key: 'export',
 label: 'Export Selected',
 variant: 'secondary',
 onClick: async (selectedIds: string[]) => {
 const selectedData = trainingData.filter(t => selectedIds.includes(t.id));
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
 }), [t, fields, trainingData, handleSearch, handleFilter, handleSort, handleExport, handleImport]);

 return (
 <div className="stack-lg">
 <DataViewProvider config={trainingConfig}>
 <StateManagerProvider>
 <div className="stack-md">
 <ViewSwitcher />
 <DataActions />
 
 <DataGrid />
 
 <KanbanBoard 
 columns={[
 { id: 'enrolled', title: 'Enrolled' },
 { id: 'in_progress', title: 'In Progress' },
 { id: 'completed', title: 'Completed' },
 { id: 'expired', title: 'Expired' }
 ]}
 statusField="status"
 titleField="person.first_name"
 />
 
 <CalendarView 
 startDateField="created_at"
 endDateField="expiry_date"
 titleField="person.first_name"
 />
 
 <ListView 
 titleField="person.first_name"
 />
 
 <TimelineView 
 startDateField="created_at"
 titleField="person.first_name"
 />
 
 <GalleryView 
 titleField="person.first_name"
 />
 
 <AppDrawer
 title="Training Record Details"
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
 <label className="block text-body-sm form-label mb-xs">Program</label>
 <div className="text-body color-foreground">Safety Training</div>
 </div>
 <div>
 <label className="block text-body-sm form-label mb-xs">Status</label>
 <div className="text-body color-foreground">Completed</div>
 </div>
 <div>
 <label className="block text-body-sm form-label mb-xs">Score</label>
 <div className="text-body color-foreground">95%</div>
 </div>
 </div>
 </div>
 )
 },
 {
 key: 'progress',
 label: 'Progress',
 content: (
 <div className="p-md">
 <p className="color-muted">Training progress and milestones will be shown here.</p>
 </div>
 )
 },
 {
 key: 'certificates',
 label: 'Certificates',
 content: (
 <div className="p-md">
 <p className="color-muted">Training certificates and credentials will be shown here.</p>
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
