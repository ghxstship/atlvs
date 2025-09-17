'use client';

import { useEffect, useState } from 'react';
import { 
  DataViewProvider, 
  StateManagerProvider, 
  DataGrid, 
  KanbanBoard, 
  ListView, 
  ViewSwitcher, 
  DataActions, 
  Drawer,
  type FieldConfig,
  type DataViewConfig,
  type DataRecord,
  Button,
  Card,
  Badge
} from '@ghxstship/ui';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
import { Plus, FileText, Calendar, Clock, Users, CheckCircle } from 'lucide-react';

export default function CallSheetsClient({ orgId }: { orgId: string }) {
  const t = useTranslations('programming');
  const sb = createBrowserClient();
  
  const [data, setData] = useState<DataRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'view' | 'edit' | 'create'>('view');

  // Define field configuration for call sheets
  const fields: FieldConfig[] = [
    {
      key: 'event_name',
      label: 'Event',
      type: 'text',
      sortable: true,
      filterable: true,
      width: 200
    },
    {
      key: 'call_date',
      label: 'Call Date',
      type: 'date',
      required: true,
      sortable: true,
      filterable: true,
      width: 130
    },
    {
      key: 'call_time',
      label: 'Call Time',
      type: 'text',
      sortable: true,
      filterable: true,
      width: 120
    },
    {
      key: 'location',
      label: 'Location',
      type: 'text',
      sortable: true,
      filterable: true,
      width: 150
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
      filterable: true,
      groupable: true,
      width: 120
    },
    {
      key: 'created_at',
      label: 'Created',
      type: 'date',
      sortable: true,
      filterable: true,
      width: 120
    }
  ];

  useEffect(() => {
    loadCallSheets();
  }, [orgId]);

  const loadCallSheets = async () => {
    if (!orgId) return;
    
    try {
      setLoading(true);
      
      const { data: callSheetsData, error } = await sb
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
      const transformedData = (callSheetsData || []).map(callSheet => ({
        ...callSheet,
        event_name: callSheet.events?.name || 'Unknown Event',
        event_date: callSheet.events?.starts_at,
        status: callSheet.status || 'draft',
        call_time: callSheet.details?.call_time || 'TBD',
        location: callSheet.details?.location || 'TBD'
      }));
      
      setData(transformedData);
    } catch (error) {
      console.error('Error loading call sheets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCallSheet = () => {
    setSelectedRecord(null);
    setDrawerMode('create');
    setDrawerOpen(true);
  };

  const handleEditCallSheet = (callSheet: any) => {
    setSelectedRecord(callSheet);
    setDrawerMode('edit');
    setDrawerOpen(true);
  };

  const handleViewCallSheet = (callSheet: any) => {
    setSelectedRecord(callSheet);
    setDrawerMode('view');
    setDrawerOpen(true);
  };

  const handleSaveCallSheet = async (callSheetData: any) => {
    try {
      if (drawerMode === 'create') {
        const { error } = await sb.from('call_sheets').insert(callSheetData);
        if (error) throw error;
      } else if (drawerMode === 'edit') {
        const { error } = await sb
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
        return 'color-primary bg-primary/10';
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
      console.log('Search call sheets:', query);
    },
    onFilter: (filters: any[]) => {
      console.log('Filter call sheets:', filters);
    },
    onSort: (sorts: any[]) => {
      console.log('Sort call sheets:', sorts);
    },
    onRefresh: loadCallSheets,
    onExport: (data: any[], format: string) => {
      console.log('Export call sheets:', format, data);
    },
    onImport: (data: any[]) => {
      console.log('Import call sheets:', data);
    }
  };

  // Get upcoming call sheets for quick overview
  const upcomingCallSheets = data
    .filter(cs => new Date(cs.call_date) >= new Date())
    .sort((a, b) => new Date(a.call_date).getTime() - new Date(b.call_date).getTime())
    .slice(0, 3);

  const statusCounts = data.reduce((acc: any, cs: any) => {
    acc[cs.status] = (acc[cs.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <DataViewProvider config={config}>
        <StateManagerProvider>
          <div className="space-y-4">
            {/* Header Actions */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <h2 className="text-body text-heading-4">Call Sheets Management</h2>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Call Sheet
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <ViewSwitcher />
                <DataActions />
              </div>
            </div>

            {/* Status Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {[
                { status: 'draft', label: 'Draft', icon: Clock },
                { status: 'published', label: 'Published', icon: FileText },
                { status: 'distributed', label: 'Distributed', icon: Users },
                { status: 'completed', label: 'Completed', icon: CheckCircle }
              ].map(({ status, label, icon: IconComponent }) => (
                <Card key={status} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-4 w-4" />
                      <span className="form-label">{label}</span>
                    </div>
                    <Badge variant="secondary" className={getStatusColor(status)}>
                      {statusCounts[status] || 0}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>

            {/* Upcoming Call Sheets */}
            {upcomingCallSheets.length > 0 && (
              <Card className="p-4 mb-6">
                <h3 className="text-heading-4 mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Upcoming Call Sheets
                </h3>
                <div className="space-y-2">
                  {upcomingCallSheets.map((callSheet: any) => (
                    <div
                      key={callSheet.id}
                      className="flex items-center justify-between p-3 rounded border cursor-pointer hover:bg-secondary/50"
                      onClick={() => handleViewCallSheet(callSheet)}
                    >
                      <div>
                        <div className="form-label">{callSheet.event_name}</div>
                        <div className="text-body-sm color-muted flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(callSheet.call_date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
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
            <Drawer
              open={drawerOpen}
              onClose={() => {
                setDrawerOpen(false);
                setSelectedRecord(null);
              }}
              title={
                drawerMode === 'create' 
                  ? 'Create Call Sheet' 
                  : `${selectedRecord?.event_name} Call Sheet` || 'Call Sheet Details'
              }
            >
              {/* Custom Call Sheet Details */}
              {selectedRecord && (
                <div className="space-y-4 mt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-body-sm color-muted">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(selectedRecord.call_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-body-sm color-muted">
                      <Clock className="h-4 w-4" />
                      <span>
                        {selectedRecord.call_time || 'Call time TBD'}
                      </span>
                    </div>
                  </div>
                  
                  {selectedRecord.location && selectedRecord.location !== 'TBD' && (
                    <div className="flex items-center gap-2 text-body-sm color-muted">
                      <Users className="h-4 w-4" />
                      <span>{selectedRecord.location}</span>
                    </div>
                  )}
                  
                  <div className="pt-4 border-t">
                    <Badge className={getStatusColor(selectedRecord.status)}>
                      {selectedRecord.status || 'Draft'}
                    </Badge>
                  </div>
                  
                  {selectedRecord.details && typeof selectedRecord.details === 'object' && (
                    <div className="pt-4 border-t">
                      <h4 className="form-label mb-2">Call Sheet Details</h4>
                      <div className="text-body-sm color-muted bg-secondary/50 p-3 rounded">
                        <pre className="whitespace-pre-wrap">
                          {JSON.stringify(selectedRecord.details, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Drawer>

            {/* Empty State */}
            {!loading && data.length === 0 && (
              <Card className="p-8 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 color-muted" />
                <h3 className="text-body text-heading-4 mb-2">No Call Sheets Yet</h3>
                <p className="color-muted mb-4">
                  Create call sheets to organize production schedules and ensure everyone knows when and where to be.
                </p>
                <Button onClick={handleCreateCallSheet}>
                  <Plus className="h-4 w-4 mr-2" />
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
