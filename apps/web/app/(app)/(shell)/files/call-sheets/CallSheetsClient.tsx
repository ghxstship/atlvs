"use client";


import { CheckCircle, Clock, FileText, Plus, Users, Calendar as CalendarIcon, CalendarIcon } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createBrowserClient } from '@ghxstship/auth';
import {
 Badge,
 Button,
 Card,
 DataActions,
 DataGrid,
 DataViewProvider,
 KanbanBoard,
 ListView,
 StateManagerProvider,
 ViewSwitcher,
 type DataRecord
} from '@ghxstship/ui';
import type { DataViewConfig, FieldConfig, FilterConfig, SortConfig } from '@ghxstship/ui/src/components/DataViews/types';
import { AppDrawer } from '@ghxstship/ui';

interface CallSheetRecord extends DataRecord {
 id: string;
 event_name: string;
 call_date: string;
 call_time: string;
 location: string;
 status: string;
 details?: Record<string, unknown> | null;
}

export default function CallSheetsClient({ orgId }: { orgId: string }) {
 const supabase = useMemo(() => createBrowserClient(), []);
 
 const [data, setData] = useState<CallSheetRecord[]>([]);
 const [loading, setLoading] = useState(false);
 const [selectedRecord, setSelectedRecord] = useState<CallSheetRecord | null>(null);
 const [drawerOpen, setDrawerOpen] = useState(false);
 const [drawerMode, setDrawerMode] = useState<'view' | 'edit' | 'create'>('view');

 // Define field configuration for call sheets
 const fields: FieldConfig[] = [
 {
 key: 'event_name',
 label: 'Event',
 type: 'text',
 sortable: true,
 filterable: true
 },
 {
 key: 'call_date',
 label: 'Call Date',
 type: 'date',
 required: true,
 sortable: true,
 filterable: true
 },
 {
 key: 'call_time',
 label: 'Call Time',
 type: 'text',
 sortable: true,
 filterable: true
 },
 {
 key: 'location',
 label: 'Location',
 type: 'text',
 sortable: true,
 filterable: true
 },
 {
 key: 'status',
 label: 'Status',
 type: 'select',
 options: [
 { value: 'draft', label: 'Draft' },
 { value: 'published', label: 'Published' },
 { value: 'distributed', label: 'Distributed' },
 { value: 'completed', label: 'Completed' }
 ],
 sortable: true,
 filterable: true
 },
 {
 key: 'created_at',
 label: 'Created',
 type: 'date',
 sortable: true,
 filterable: true
 }
 ];

 const loadCallSheets = useCallback(async () => {
 if (!orgId) {
 return;
 }

 try {
 setLoading(true);
 
 const { data: callSheetsData, error } = await supabase
 .from('call_sheets')
 .select(`
 *,
 events!inner(
 name,
 starts_at,
 projects!inner(
 organization_id
 )
 )
 `)
 .eq('events.projects.organization_id', orgId)
 .order('call_date', { ascending: false });
 
 if (error) throw error;
 
 // Transform data to include event name and computed fields
 const transformedData: CallSheetRecord[] = (callSheetsData || []).map((callSheet: unknown) => ({
 id: callSheet.id,
 event_name: callSheet.events?.name || 'Unknown Event',
 call_date: callSheet.call_date,
 call_time: callSheet.details?.call_time || 'TBD',
 location: callSheet.details?.location || 'TBD',
 status: callSheet.status || 'draft',
 details: callSheet.details ?? null,
 ...callSheet
 }));
 
 setData(transformedData);
 } catch (error) {
 console.error('Error loading call sheets:', error);
 } finally {
 setLoading(false);
 }
 }, [orgId, supabase]);

 useEffect(() => {
 void loadCallSheets();
 }, [loadCallSheets]);

 const handleCreateCallSheet = () => {
 setSelectedRecord(null);
 setDrawerMode('create');
 setDrawerOpen(true);
 };

 const handleEditCallSheet = (callSheet: CallSheetRecord) => {
 setSelectedRecord(callSheet);
 setDrawerMode('edit');
 setDrawerOpen(true);
 };

 const handleViewCallSheet = (callSheet: CallSheetRecord) => {
 setSelectedRecord(callSheet);
 setDrawerMode('view');
 setDrawerOpen(true);
 };

 const handleSaveCallSheet = async (callSheetData: Partial<CallSheetRecord>) => {
 try {
 if (drawerMode === 'create') {
 const { error } = await supabase.from('call_sheets').insert(callSheetData);
 if (error) throw error;
 } else if (drawerMode === 'edit') {
 if (!selectedRecord) {
 throw new Error('No call sheet selected for update');
 }
 const { error } = await supabase
 .from('call_sheets')
 .update(callSheetData)
 .eq('id', selectedRecord.id);
 if (error) throw error;
 }
 
 await loadCallSheets();
 setDrawerOpen(false);
 } catch (error) {
 console.error('Error saving call sheet:', error);
 }
 };

 const getStatusColor = (status: string) => {
 switch (status) {
 case 'draft':
 return 'color-muted bg-secondary';
 case 'published':
 return 'color-accent bg-accent/10';
 case 'distributed':
 return 'color-success bg-success/10';
 case 'completed':
 return 'color-secondary bg-secondary/10';
 default:
 return 'color-muted bg-secondary';
 }
 };

 const getStatusIcon = (status: string) => {
 switch (status) {
 case 'completed':
 return CheckCircle;
 case 'distributed':
 return Users;
 case 'published':
 return FileText;
 default:
 return Clock;
 }
 };

 // Configure DataView
 const config: DataViewConfig = {
 id: 'call-sheets-management',
 name: 'Call Sheets Management',
 viewType: 'grid',
 defaultView: 'grid',
 fields,
 data,
 
 onSearch: (query: string) => {
 },
 onFilter: (filters: FilterConfig[]) => {
 },
 onSort: (sorts: SortConfig[]) => {
 },
 onRefresh: loadCallSheets,
 onExport: (exportData: DataRecord[], format: string) => {
 },
 onImport: (importData: DataRecord[]) => {
 }
 };

 // Get upcoming call sheets for quick overview
 const upcomingCallSheets = data
 .filter(cs => new Date(cs.call_date) >= new Date())
 .sort((a, b) => new Date(a.call_date).getTime() - new Date(b.call_date).getTime())
 .slice(0, 3);

 const statusCounts = data.reduce<Record<string, number>((acc, cs) => {
 const key = cs.status ?? 'unknown';
 acc[key] = (acc[key] || 0) + 1;
 return acc;
 }, {});

 return (
 <div className="stack-md">
 <DataViewProvider config={config}>
 <StateManagerProvider>
 <div className="stack-md">
 {/* Header Actions */}
 <div className="flex items-center justify-between mb-md">
 <div className="flex items-center gap-md">
 <h2 className="text-body text-heading-4">Call Sheets Management</h2>
 <Button>
 <Plus className="h-icon-xs w-icon-xs mr-sm" />
 Create Call Sheet
 </Button>
 </div>
 <div className="flex items-center gap-sm">
 <ViewSwitcher />
 <DataActions />
 </div>
 </div>

 {/* Status Overview Cards */}
 <div className="grid grid-cols-1 md:grid-cols-4 gap-md mb-lg">
 {[
 { status: 'draft', label: 'Draft', icon: Clock },
 { status: 'published', label: 'Published', icon: FileText },
 { status: 'distributed', label: 'Distributed', icon: Users },
 { status: 'completed', label: 'Completed', icon: CheckCircle }
 ].map(({ status, label, icon: IconComponent }) => (
 <Card key={status} className="p-md">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-sm">
 <IconComponent className="h-icon-xs w-icon-xs" />
 <span className="form-label">{label}</span>
 </div>
 <Badge variant="outline">
 {statusCounts[status] || 0}
 </Badge>
 </div>
 </Card>
 ))}
 </div>

 {/* Upcoming Call Sheets */}
 {upcomingCallSheets.length > 0 && (
 <Card className="p-md mb-lg">
 <h3 className="text-heading-4 mb-sm flex items-center gap-sm">
 <CalendarIcon className="h-icon-xs w-icon-xs" />
 Upcoming Call Sheets
 </h3>
 <div className="stack-sm">
 {upcomingCallSheets.map((callSheet: CallSheetRecord) => (
 <div
 key={callSheet.id}
 className="flex items-center justify-between p-sm rounded border cursor-pointer hover:bg-secondary/50"
 onClick={() => handleViewCallSheet(callSheet)}
 >
 <div>
 <div className="form-label">{callSheet.event_name}</div>
 <div className="text-body-sm color-muted flex items-center gap-md">
 <span className="flex items-center gap-xs">
 <CalendarIcon className="h-3 w-3" />
 {new Date(callSheet.call_date).toLocaleDateString()}
 </span>
 <span className="flex items-center gap-xs">
 <Clock className="h-3 w-3" />
 {callSheet.call_time}
 </span>
 {callSheet.location !== 'TBD' && (
 <span>{callSheet.location}</span>
 )}
 </div>
 </div>
 <Badge className={getStatusColor(callSheet.status)}>
 {callSheet.status}
 </Badge>
 </div>
 ))}
 </div>
 </Card>
 )}

 {/* Data Views */}
 <DataGrid />
 
 <KanbanBoard
 columns={[
 { id: 'draft', title: 'Draft' },
 { id: 'published', title: 'Published' },
 { id: 'distributed', title: 'Distributed' },
 { id: 'completed', title: 'Completed' }
 ]}
 statusField="status"
 titleField="event_name"
 onCardClick={handleViewCallSheet}
 />
 
 <ListView
 titleField="event_name"
 subtitleField="call_date"
 onItemClick={handleViewCallSheet}
 />
 
 {/* Call Sheet Details Drawer */}
 <AppDrawer
 open={drawerOpen}
 onClose={() => {
 setDrawerOpen(false);
 setSelectedRecord(null);
 }}
 record={null}
 fields={[]}
 mode={drawerMode}
 title={
 drawerMode === 'create' 
 ? 'Create Call Sheet' 
 : `${selectedRecord?.event_name} Call Sheet` || 'Call Sheet Details'
 }
 tabs={[{
 key: 'content',
 label: 'Details',
 content: (
 <div>
 {selectedRecord && (
 <div className="stack-md mt-lg">
 <div className="grid grid-cols-2 gap-md">
 <div className="flex items-center gap-sm text-body-sm color-muted">
 {selectedRecord.call_date ? <CalendarIcon className="h-icon-xs w-icon-xs" /> : null}
 <span>
 {selectedRecord.call_date ? new Date(selectedRecord.call_date).toLocaleDateString() : 'Call date TBD'}
 </span>
 </div>
 <div className="flex items-center gap-sm text-body-sm color-muted">
 <Clock className="h-icon-xs w-icon-xs" />
 <span>
 {selectedRecord.call_time || 'Call time TBD'}
 </span>
 </div>
 </div>
 
 {selectedRecord.location && selectedRecord.location !== 'TBD' && (
 <div className="flex items-center gap-sm text-body-sm color-muted">
 <Users className="h-icon-xs w-icon-xs" />
 <span>{selectedRecord.location}</span>
 </div>
 )}
 
 <div className="pt-md border-t">
 <Badge className={getStatusColor(selectedRecord.status)}>
 {selectedRecord.status || 'Draft'}
 </Badge>
 </div>
 
 {selectedRecord.details && typeof selectedRecord.details === 'object' && (
 <div className="pt-md border-t">
 <h4 className="form-label mb-sm">Call Sheet Details</h4>
 <div className="text-body-sm color-muted bg-secondary/50 p-sm rounded">
 <pre className="whitespace-pre-wrap">
 {JSON.stringify(selectedRecord.details, null, 2)}
 </pre>
 </div>
 </div>
 )}
 </div>
 )}
 </div>
 )
 }]}
 />

 {/* Empty State */}
 {!loading && data.length === 0 && (
 <Card className="p-xl text-center">
 <FileText className="h-icon-2xl w-icon-2xl mx-auto mb-md color-muted" />
 <h3 className="text-body text-heading-4 mb-sm">No Call Sheets Yet</h3>
 <p className="color-muted mb-md">
 Create call sheets to organize production schedules and ensure everyone knows when and where to be.
 </p>
 <Button onClick={handleCreateCallSheet}>
 <Plus className="h-icon-xs w-icon-xs mr-sm" />
 Create First Call Sheet
 </Button>
 </Card>
 )}
 </div>
 </StateManagerProvider>
 </DataViewProvider>
 </div>
 );
}
