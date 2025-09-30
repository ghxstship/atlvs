'use client';
import { User, FileText, Settings, Award, Calendar, TrendingUp, Activity, Clock, Plus, Search, Play, Trash2 } from "lucide-react";
import { useEffect, useState, useCallback, useMemo } from 'react';
import { type DataRecord } from '@ghxstship/ui';
import { DataViewProvider, StateManagerProvider, ViewSwitcher, DataActions, DataGrid, KanbanBoard, CalendarView, ListView, TimelineView, GalleryView } from '@ghxstship/ui';
import { type FieldConfig, type DataViewConfig } from '@ghxstship/ui';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
import { AppDrawer } from '@ghxstship/ui';

interface Contract extends DataRecord {
 id: string;
 person_id: string;
 project_id: string;
 type: 'employment' | 'freelance' | 'nda' | 'vendor' | 'service';
 status: 'draft' | 'sent' | 'signed' | 'expired' | 'terminated';
 start_date: string;
 end_date?: string;
 value?: number;
 currency: string;
 signed_date?: string;
 document_url?: string;
 notes?: string;
 organization_id: string;
 created_at: string;
 updated_at: string;
 person?: {
 first_name: string;
 last_name: string;
 email?: string;
 };
 project?: {
 name: string;
 status: string;
 };
}

interface ContractsClientProps {
 orgId: string;
}

export default function ContractsClient({ orgId }: ContractsClientProps) {
 const t = useTranslations('people.contracts');
 const sb = createBrowserClient();
 const [loading, setLoading] = useState(false);
 const [contractsData, setContractsData] = useState<Contract[]>([]);

 useEffect(() => {
 loadContractsData();
 
 // Set up real-time subscription
 const subscription = sb
 .channel('files-contracts-changes')
 .on('postgres_changes', 
 { 
 event: '*', 
 schema: 'public', 
 table: 'files_contracts',
 filter: `organization_id=eq.${orgId}`
 }, 
 (payload) => {
 loadContractsData();
 }
 )
 .subscribe();

 return () => {
 subscription.unsubscribe();
 };
 }, [orgId]);

 const loadContractsData = useCallback(async () => {
 setLoading(true);
 try {
 const { data, error } = await sb
 .from('files_contracts')
 .select(`
 *,
 person:people(first_name, last_name, email),
 project:projects(name, status)
 `)
 .eq('organization_id', orgId)
 .order('created_at', { ascending: false });
 
 if (error) {
 console.error('Supabase error:', error);
 throw error;
 }
 
 setContractsData(data || []);
 } catch (error) {
 console.error('Error loading contracts data:', error);
 // Could add toast notification here
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
 key: 'type',
 label: t('type'),
 type: 'select',
 options: [
 { value: 'employment', label: t('employment') },
 { value: 'freelance', label: t('freelance') },
 { value: 'nda', label: t('nda') },
 { value: 'vendor', label: t('vendor') },
 { value: 'service', label: t('service') }
 ],
 sortable: true,
 filterable: true
 },
 {
 key: 'status',
 label: t('status'),
 type: 'select',
 options: [
 { value: 'draft', label: t('draft') },
 { value: 'sent', label: t('sent') },
 { value: 'signed', label: t('signed') },
 { value: 'expired', label: t('expired') },
 { value: 'terminated', label: t('terminated') }
 ],
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
 key: 'end_date',
 label: t('endDate'),
 type: 'date',
 sortable: true,
 filterable: true
 },
 {
 key: 'value',
 label: t('value'),
 type: 'currency',
 sortable: true,
 filterable: true
 },
 {
 key: 'currency',
 label: t('currency'),
 type: 'text',
 sortable: true,
 filterable: true
 },
 {
 key: 'signed_date',
 label: t('signedDate'),
 type: 'date',
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
 loadContractsData();
 return;
 }

 try {
 const { data, error } = await sb
 .from('files_contracts')
 .select(`
 *,
 person:people(first_name, last_name, email),
 project:projects(name, status)
 `)
 .eq('organization_id', orgId)
 .or(`notes.ilike.%${query}%,type.ilike.%${query}%,status.ilike.%${query}%`)
 .order('created_at', { ascending: false });
 
 if (error) throw error;
 setContractsData(data || []);
 } catch (error) {
 console.error('Search error:', error);
 }
 }, [orgId, sb, loadContractsData]);

 // Advanced filtering
 const handleFilter = useCallback(async (filters: Array<{ field: string; value?: unknown }>) => {
 try {
 let query = sb
 .from('files_contracts')
 .select(`
 *,
 person:people(first_name, last_name, email),
 project:projects(name, status)
 `)
 .eq('organization_id', orgId);

 for (const filter of filters) {
 if (!filter || typeof filter.field !== 'string') continue;
 const value = filter.value;
 if (value === undefined || value === null || value === '') continue;
 query = query.eq(filter.field, value as string | number | boolean);
 }

 const { data, error } = await query.order('created_at', { ascending: false });
 if (error) throw error;
 setContractsData(data || []);
 } catch (error) {
 console.error('Filter error:', error);
 }
 }, [orgId, sb]);

 // Advanced sorting
 const handleSort = useCallback(async (sorts: Array<{ field: string; direction: 'asc' | 'desc' }>) => {
 try {
 let query = sb
 .from('files_contracts')
 .select(`
 *,
 person:people(first_name, last_name, email),
 project:projects(name, status)
 `)
 .eq('organization_id', orgId);

 if (Array.isArray(sorts) && sorts.length > 0) {
 const sort = sorts[0];
 if (sort && sort.field) {
 query = query.order(sort.field, { ascending: sort.direction === 'asc' });
 }
 }

 const { data, error } = await query;
 if (error) throw error;
 setContractsData(data || []);
 } catch (error) {
 console.error('Sort error:', error);
 }
 }, [orgId, sb]);

 // Export functionality
 const handleExport = useCallback((format: string, data: DataRecord[], config?: unknown) => {
 const exportData = data.map(contract => ({
 'Person': contract.person ? `${contract.person.first_name} ${contract.person.last_name}` : 'N/A',
 'Project': contract.project?.name || 'N/A',
 'Type': contract.type,
 'Status': contract.status,
 'Start Date': contract.start_date,
 'End Date': contract.end_date || 'N/A',
 'Value': contract.value || 'N/A',
 'Currency': contract.currency,
 'Signed Date': contract.signed_date || 'N/A',
 'Notes': contract.notes || 'N/A',
 'Created At': contract.created_at
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
 a.download = `contracts-${new Date().toISOString().split('T')[0]}.csv`;
 a.click();
 } else if (format === 'json') {
 const json = JSON.stringify(exportData, null, 2);
 const blob = new Blob([json], { type: 'application/json' });
 const url = URL.createObjectURL(blob);
 const a = document.createElement('a');
 a.href = url;
 a.download = `contracts-${new Date().toISOString().split('T')[0]}.json`;
 a.click();
 }
 }, []);

 // Import functionality
 const handleImport = useCallback(async (data: DataRecord[]) => {
 try {
 const importData = data.map(contract => ({
 ...contract,
 organization_id: orgId,
 created_at: new Date().toISOString(),
 updated_at: new Date().toISOString()
 }));

 const { error } = await sb
 .from('files_contracts')
 .insert(importData);

 if (error) throw error;
 
 loadContractsData();
 } catch (error) {
 console.error('Import error:', error);
 }
 }, [orgId, sb, loadContractsData]);

 // ATLVS DataViews configuration
 const contractsConfig: DataViewConfig = useMemo(() => ({
 id: 'contracts-dataviews',
 name: t('title'),
 viewType: 'grid',
 fields,
 data: contractsData,
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
 confirmMessage: 'Are you sure you want to delete the selected contracts?'
 },
 {
 key: 'export',
 label: 'Export Selected',
 variant: 'secondary',
 onClick: async (selectedIds: string[]) => {
 const selectedData = contractsData.filter(c => selectedIds.includes(c.id));
 handleExport('csv', selectedData);
 },
 requiresSelection: true
 },
 {
 key: 'sign',
 label: 'Mark as Signed',
 variant: 'secondary',
 onClick: async (selectedIds: string[]) => {
 // Implement sign functionality
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
 }), [t, fields, contractsData, handleSearch, handleFilter, handleSort, handleExport, handleImport]);

 return (
 <div className="stack-lg">
 <DataViewProvider config={contractsConfig}>
 <StateManagerProvider>
 <div className="stack-md">
 <ViewSwitcher />
 <DataActions />
 
 <DataGrid />
 
 <KanbanBoard 
 columns={[
 { id: 'draft', title: 'Draft' },
 { id: 'sent', title: 'Sent' },
 { id: 'signed', title: 'Signed' },
 { id: 'expired', title: 'Expired' }
 ]}
 statusField="status"
 titleField="person.first_name"
 />
 
 <CalendarView 
 startDateField="start_date"
 endDateField="end_date"
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
 title="Contract Details"
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
 <label className="block text-body-sm form-label mb-xs">Type</label>
 <div className="text-body color-foreground">Employment</div>
 </div>
 <div>
 <label className="block text-body-sm form-label mb-xs">Status</label>
 <div className="text-body color-foreground">Signed</div>
 </div>
 </div>
 </div>
 )
 },
 {
 key: 'terms',
 label: 'Terms',
 content: (
 <div className="p-md">
 <p className="color-muted">Contract terms and conditions will be shown here.</p>
 </div>
 )
 },
 {
 key: 'documents',
 label: 'Documents',
 content: (
 <div className="p-md">
 <p className="color-muted">Contract documents and attachments will be shown here.</p>
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
