'use client';

import { useEffect, useState } from 'react';
import { 
  DataViewProvider, 
  StateManagerProvider, 
  DataGrid, 
  KanbanBoard, 
  CalendarView, 
  ListView, 
  ViewSwitcher, 
  DataActions, 
  UniversalDrawer,
  type FieldConfig,
  type DataViewConfig,
  type DataRecord,
  Button
} from '@ghxstship/ui';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
import { Plus, Calendar, MapPin, Clock } from 'lucide-react';

export default function EventsClient({ orgId }: { orgId: string }) {
  const t = useTranslations('programming');
  const sb = createBrowserClient();
  
  const [data, setData] = useState<DataRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'view' | 'edit' | 'create'>('view');

  // Define field configuration for events
  const fields: FieldConfig[] = [
    {
      key: 'name',
      label: 'Event Name',
      type: 'text',
      required: true,
      sortable: true,
      filterable: true,
      width: 200
    },
    {
      key: 'kind',
      label: 'Type',
      type: 'select',
      options: [
        { value: 'performance', label: 'Performance' },
        { value: 'activation', label: 'Activation' },
        { value: 'workshop', label: 'Workshop' }
      ],
      sortable: true,
      filterable: true,
      groupable: true,
      width: 120
    },
    {
      key: 'project_name',
      label: 'Project',
      type: 'text',
      sortable: true,
      filterable: true,
      width: 150
    },
    {
      key: 'starts_at',
      label: 'Start Date',
      type: 'datetime',
      sortable: true,
      filterable: true,
      width: 180
    },
    {
      key: 'ends_at',
      label: 'End Date',
      type: 'datetime',
      sortable: true,
      filterable: true,
      width: 180
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'draft', label: 'Draft' },
        { value: 'scheduled', label: 'Scheduled' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' }
      ],
      sortable: true,
      filterable: true,
      groupable: true,
      width: 120
    }
  ];

  useEffect(() => {
    loadEvents();
  }, [orgId]);

  const loadEvents = async () => {
    if (!orgId) return;
    
    try {
      setLoading(true);
      
      const { data: eventsData, error } = await sb
        .from('events')
        .select(`
          *,
          projects!inner(
            name,
            organization_id
          ),
          lineups(count),
          riders(count),
          call_sheets(count)
        `)
        .eq('projects.organization_id', orgId)
        .order('starts_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform data to include project name and computed status
      const transformedData = (eventsData || []).map(event => ({
        ...event,
        project_name: event.projects?.name || 'Unknown Project',
        status: computeEventStatus(event),
        lineups_count: event.lineups?.[0]?.count || 0,
        riders_count: event.riders?.[0]?.count || 0,
        call_sheets_count: event.call_sheets?.[0]?.count || 0
      }));
      
      setData(transformedData);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const computeEventStatus = (event: any) => {
    const now = new Date();
    const startDate = event.starts_at ? new Date(event.starts_at) : null;
    const endDate = event.ends_at ? new Date(event.ends_at) : null;

    if (!startDate) return 'draft';
    if (startDate > now) return 'scheduled';
    if (endDate && endDate < now) return 'completed';
    if (startDate <= now && (!endDate || endDate >= now)) return 'in_progress';
    
    return 'draft';
  };

  const handleCreateEvent = () => {
    setSelectedRecord(null);
    setDrawerMode('create');
    setDrawerOpen(true);
  };

  const handleEditEvent = (event: any) => {
    setSelectedRecord(event);
    setDrawerMode('edit');
    setDrawerOpen(true);
  };

  const handleViewEvent = (event: any) => {
    setSelectedRecord(event);
    setDrawerMode('view');
    setDrawerOpen(true);
  };

  const handleSaveEvent = async (eventData: any) => {
    try {
      if (drawerMode === 'create') {
        const { error } = await sb.from('events').insert(eventData);
        if (error) throw error;
      } else if (drawerMode === 'edit') {
        const { error } = await sb
          .from('events')
          .update(eventData)
          .eq('id', selectedRecord.id);
        if (error) throw error;
      }
      
      await loadEvents();
      setDrawerOpen(false);
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  // Configure DataView
  const config: DataViewConfig = {
    id: 'events-management',
    name: 'Events Management',
    viewType: 'grid',
    defaultView: 'grid',
    fields,
    data,
    
    onSearch: (query: string) => {
      console.log('Search events:', query);
    },
    onFilter: (filters: any[]) => {
      console.log('Filter events:', filters);
    },
    onSort: (sorts: any[]) => {
      console.log('Sort events:', sorts);
    },
    onRefresh: loadEvents,
    onExport: (data: any[], format: string) => {
      console.log('Export events:', format, data);
    },
    onImport: (data: any[]) => {
      console.log('Import events:', data);
    },
    onRowClick: handleViewEvent
  };

  return (
    <div className="space-y-4">
      <DataViewProvider config={config}>
        <StateManagerProvider>
          <div className="space-y-4">
            {/* Header Actions */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold">Events Management</h2>
                <Button onClick={handleCreateEvent} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Event
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <ViewSwitcher />
                <DataActions />
              </div>
            </div>

            {/* Data Views */}
            <DataGrid onRowClick={handleViewEvent} />
            
            <KanbanBoard 
              columns={[
                { id: 'draft', title: 'Draft' },
                { id: 'scheduled', title: 'Scheduled' },
                { id: 'in_progress', title: 'In Progress' },
                { id: 'completed', title: 'Completed' },
                { id: 'cancelled', title: 'Cancelled' }
              ]}
              statusField="status"
              titleField="name"
              onCardClick={handleViewEvent}
            />
            
            <CalendarView 
              startDateField="starts_at"
              endDateField="ends_at"
              titleField="name"
              onEventClick={handleViewEvent}
            />
            
            <ListView 
              titleField="name"
              subtitleField="project_name"
              onItemClick={handleViewEvent}
            />
            
            {/* Event Details Drawer */}
            <UniversalDrawer
              open={drawerOpen}
              onClose={() => {
                setDrawerOpen(false);
                setSelectedRecord(null);
              }}
              record={selectedRecord}
              fields={fields}
              mode={drawerMode}
              onModeChange={setDrawerMode}
              title={
                drawerMode === 'create' 
                  ? 'Create Event' 
                  : selectedRecord?.name || 'Event Details'
              }
              onSave={handleSaveEvent}
              enableComments={true}
              enableActivity={true}
              enableFiles={true}
            >
              {/* Custom Event Details */}
              {selectedRecord && (
                <div className="space-y-4 mt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {selectedRecord.starts_at 
                          ? new Date(selectedRecord.starts_at).toLocaleDateString()
                          : 'No start date'
                        }
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>
                        {selectedRecord.starts_at 
                          ? new Date(selectedRecord.starts_at).toLocaleTimeString()
                          : 'No start time'
                        }
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{selectedRecord.lineups_count || 0}</div>
                      <div className="text-sm text-muted-foreground">Lineups</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{selectedRecord.riders_count || 0}</div>
                      <div className="text-sm text-muted-foreground">Riders</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{selectedRecord.call_sheets_count || 0}</div>
                      <div className="text-sm text-muted-foreground">Call Sheets</div>
                    </div>
                  </div>
                </div>
              )}
            </UniversalDrawer>
          </div>
        </StateManagerProvider>
      </DataViewProvider>
    </div>
  );
}
