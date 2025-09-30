'use client';
import { User, FileText, Settings, Award, Calendar, TrendingUp, Activity, Clock, Plus, Search, Play, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
 type DataRecord,
 type FieldConfig,
 type FilterConfig,
 type SortConfig,
 DataViewProvider,
 StateManagerProvider,
 ViewSwitcher,
 DataActions,
 DataGrid,
 KanbanBoard,
 CalendarView,
 ListView
} from '@ghxstship/ui';
import type { DataViewConfig } from '@ghxstship/ui';
import { tryCatch, reportError } from '@ghxstship/ui/utils/error-handling';
import { AppDrawer } from '@ghxstship/ui';

interface JobsResponse {
 jobs: DataRecord[];
}

export default function JobsClient({ orgId }: { orgId: string }) {
 const t = useTranslations('jobs');
 const [jobs, setJobs] = useState<DataRecord[]>([]);
 const [loading, setLoading] = useState(true);
 const [filters, setFilters] = useState<Record<string, string>({});
 const [selectedJob, setSelectedJob] = useState<DataRecord | null>(null);

 // Field configuration for jobs data (matching database schema)
 const fieldConfig: FieldConfig[] = [
 {
 key: 'title',
 label: 'Job Title',
 type: 'text' as const,
 required: true,
 sortable: true,
 filterable: true
 },
 {
 key: 'status',
 label: 'Status',
 type: 'select' as const,
 required: true,
 sortable: true,
 filterable: true,
 options: [
 { value: 'open', label: 'Open' },
 { value: 'in_progress', label: 'In Progress' },
 { value: 'blocked', label: 'Blocked' },
 { value: 'done', label: 'Done' },
 { value: 'cancelled', label: 'Cancelled' }
 ]
 },
 {
 key: 'project_id',
 label: 'Project',
 type: 'text' as const,
 required: false,
 sortable: true,
 filterable: true
 },
 {
 key: 'due_at',
 label: 'Due Date',
 type: 'date' as const,
 required: false,
 sortable: true,
 filterable: true
 },
 {
 key: 'created_by',
 label: 'Created By',
 type: 'text' as const,
 required: false,
 sortable: true,
 filterable: true
 },
 {
 key: 'created_at',
 label: 'Created Date',
 type: 'date' as const,
 required: false,
 sortable: true,
 filterable: true
 }
 ];

 // Real Supabase data loading function
 const loadJobsData = useCallback(async (activeFilters?: Record<string, string>): Promise<DataRecord[]> => {
 try {
 const params = new URLSearchParams();
 if (activeFilters?.type) params.append('type', activeFilters.type);
 if (activeFilters?.status) params.append('status', activeFilters.status);
 if (activeFilters?.search) params.append('search', activeFilters.search);

 const responseResult = await tryCatch(async () =>
 fetch(`/api/v1/jobs?${params.toString()}`, {
 method: 'GET',
 headers: { 'Content-Type': 'application/json' }
 })
 );

 if (!responseResult.success) {
 reportError(responseResult.error);
 throw new Error(responseResult.error.message);
 }

 const response = responseResult.data;
 if (!response.ok) {
 throw new Error(`Failed to fetch jobs: ${response.statusText}`);
 }

 const data: JobsResponse = await response.json();
 return data.jobs ?? [];
 } catch (error) {
 console.error('Error loading jobs:', error);
 return [];
 }
 }, []);

 // Load data on mount and when filters change
 useEffect(() => {
 const fetchData = async () => {
 setLoading(true);
 const data = await loadJobsData(filters);
 setJobs(data);
 setLoading(false);
 };
 void fetchData();
 }, [filters, loadJobsData]);

 const closeDrawer = useCallback(() => {
 setSelectedJob(null);
 }, []);

 const openViewDrawer = useCallback((record: DataRecord) => {
 setSelectedJob(record);
 }, []);

 const handleSearch = useCallback((query: string) => {
 setFilters(prev => ({ ...prev, search: query }));
 }, []);

 const handleFilter = useCallback((newFilters: FilterConfig[]) => {
 const normalizedFilters = newFilters.reduce<Record<string, string>((acc, filter) => {
 if (filter.value) {
 acc[filter.field] = String(filter.value);
 }
 return acc;
 }, {});
 setFilters(prev => ({ ...prev, ...normalizedFilters }));
 }, []);

 const handleSort = useCallback((sorts: SortConfig[]) => {
 console.debug('Sort jobs:', sorts);
 }, []);

 const handleRefresh = useCallback(() => {
 setFilters({});
 }, []);

 const handleExport = useCallback((data: DataRecord[], format: string) => {
 console.debug('Export jobs:', format, data.length);
 }, []);

 const handleImport = useCallback((data: DataRecord[]) => {
 console.debug('Import jobs:', data.length);
 }, []);

 const handleDelete = useCallback((ids: string[]) => {
 console.debug('Delete jobs:', ids);
 }, []);

 const dataViewConfig = useMemo<DataViewConfig>(() => ({
 id: 'jobs-view',
 name: 'Jobs Management',
 viewType: 'grid',
 defaultView: 'grid',
 fields: fieldConfig,
 data: jobs,
 loading,
 onSearch: handleSearch,
 onFilter: handleFilter,
 onSort: handleSort,
 onRefresh: handleRefresh,
 onExport: handleExport,
 onImport: handleImport,
 onEdit: openViewDrawer,
 onDelete: handleDelete
 }), [jobs, fieldConfig, handleDelete, handleExport, handleFilter, handleImport, handleRefresh, handleSearch, handleSort, loading, openViewDrawer]);

 return (
 <div className="h-full w-full">
 <StateManagerProvider>
 <DataViewProvider config={dataViewConfig}>
 <div className="flex flex-col h-full stack-md">
 {/* View Switcher and Actions */}
 <div className="flex items-center justify-between">
 <ViewSwitcher />
 <DataActions />
 </div>

 {/* Data Views */}
 <DataGrid />
 <KanbanBoard
 columns={[
 { id: 'open', title: 'Open' },
 { id: 'in_progress', title: 'In Progress' },
 { id: 'blocked', title: 'Blocked' },
 { id: 'done', title: 'Done' },
 { id: 'cancelled', title: 'Cancelled' }
 ]}
 statusField="status"
 titleField="title"
 />
 <CalendarView
 startDateField="due_at"
 titleField="title"
 />
 <ListView
 titleField="title"
 subtitleField="description"
 />

 {/* Drawer for CRUD operations */}
 {selectedJob && (
 <AppDrawer
 open
 onClose={closeDrawer}
 title={selectedJob.title ?? 'Job Details'}
 record={selectedJob}
 mode="view"
 >
 <div className="stack-md">
 {fieldConfig.map(field => (
 <div key={field.key} className="stack-2xs">
 <p className="text-body-xs form-label color-muted">{field.label}</p>
 <p className="text-body-sm">{String(selectedJob[field.key] ?? '—')}</p>
 </div>
 ))}
 </div>
 </AppDrawer>
 )}
 </div>
 </DataViewProvider>
 </StateManagerProvider>
 </div>
 );
}
