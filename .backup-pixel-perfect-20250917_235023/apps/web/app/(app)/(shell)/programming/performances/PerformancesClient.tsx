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
import { 
  Plus, 
  Calendar, 
  Clock, 
  Users, 
  Music, 
  Mic,
  Star,
  MapPin,
  FileText
} from 'lucide-react';

export default function PerformancesClient({ orgId }: { orgId: string }) {
  const t = useTranslations('programming');
  const sb = createBrowserClient();
  
  const [data, setData] = useState<DataRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'view' | 'edit' | 'create'>('view');

  // Define field configuration for performances
  const fields: FieldConfig[] = [
    {
      key: 'name',
      label: 'Performance Name',
      type: 'text',
      required: true,
      sortable: true,
      filterable: true,
      width: 200
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
      label: 'Performance Date',
      type: 'date',
      sortable: true,
      filterable: true,
      width: 180
    },
    {
      key: 'duration_minutes',
      label: 'Duration (min)',
      type: 'number',
      sortable: true,
      filterable: true,
      width: 120
    },
    {
      key: 'venue',
      label: 'Venue',
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
        { value: 'planning', label: 'Planning' },
        { value: 'rehearsal', label: 'Rehearsal' },
        { value: 'ready', label: 'Ready' },
        { value: 'live', label: 'Live' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' }
      ],
      sortable: true,
      filterable: true,
      groupable: true,
      width: 120
    },
    {
      key: 'lineup_count',
      label: 'Performers',
      type: 'number',
      sortable: true,
      width: 100
    },
    {
      key: 'technical_requirements',
      label: 'Tech Requirements',
      type: 'text',
      filterable: true,
      width: 180
    }
  ];

  useEffect(() => {
    loadPerformances();
  }, [orgId]);

  const loadPerformances = async () => {
    if (!orgId) return;
    
    try {
      setLoading(true);
      
      const { data: performancesData, error } = await sb
        .from('events')
        .select(`
          *,
          projects!inner(
            name,
            organization_id
          ),
          lineups(
            id,
            performer,
            stage,
            start_time,
            end_time
          ),
          riders(
            id,
            kind,
            details
          ),
          call_sheets(
            id,
            call_date,
            details
          )
        `)
        .eq('kind', 'performance')
        .eq('projects.organization_id', orgId)
        .order('starts_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform data to include computed fields
      const transformedData = (performancesData || []).map(performance => {
        const duration = performance.ends_at && performance.starts_at 
          ? Math.round((new Date(performance.ends_at).getTime() - new Date(performance.starts_at).getTime()) / (1000 * 60))
          : null;
          
        return {
          ...performance,
          project_name: performance.projects?.name || 'Unknown Project',
          status: computePerformanceStatus(performance),
          duration_minutes: duration,
          lineup_count: performance.lineups?.length || 0,
          riders_count: performance.riders?.length || 0,
          call_sheets_count: performance.call_sheets?.length || 0,
          venue: performance.location || 'TBD',
          technical_requirements: performance.riders?.find((r: any) => r.kind === 'technical')?.details?.summary || 'None specified'
        };
      });
      
      setData(transformedData);
    } catch (error) {
      console.error('Error loading performances:', error);
    } finally {
      setLoading(false);
    }
  };

  const computePerformanceStatus = (performance: any) => {
    const now = new Date();
    const startDate = performance.starts_at ? new Date(performance.starts_at) : null;
    const endDate = performance.ends_at ? new Date(performance.ends_at) : null;

    if (!startDate) return 'planning';
    
    // Check if performance is happening now
    if (startDate <= now && (!endDate || endDate >= now)) return 'live';
    
    // Check if performance is completed
    if (endDate && endDate < now) return 'completed';
    
    // Check if performance is soon (within 2 hours)
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    if (startDate <= twoHoursFromNow && startDate > now) return 'ready';
    
    // Check if we have lineups (indicates rehearsal stage)
    if (performance.lineups && performance.lineups.length > 0) return 'rehearsal';
    
    return 'planning';
  };

  const handleCreatePerformance = () => {
    setSelectedRecord(null);
    setDrawerMode('create');
    setDrawerOpen(true);
  };

  const handleEditPerformance = (performance: any) => {
    setSelectedRecord(performance);
    setDrawerMode('edit');
    setDrawerOpen(true);
  };

  const handleViewPerformance = (performance: any) => {
    setSelectedRecord(performance);
    setDrawerMode('view');
    setDrawerOpen(true);
  };

  const handleSavePerformance = async (performanceData: any) => {
    try {
      const eventData = {
        ...performanceData,
        kind: 'performance'
      };
      
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
      
      await loadPerformances();
      setDrawerOpen(false);
    } catch (error) {
      console.error('Error saving performance:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning':
        return 'color-muted bg-secondary/50';
      case 'rehearsal':
        return 'color-warning bg-warning/10';
      case 'ready':
        return 'color-primary bg-primary/10';
      case 'live':
        return 'color-success bg-success/10';
      case 'completed':
        return 'color-secondary bg-secondary/10';
      case 'cancelled':
        return 'color-destructive bg-destructive/10';
      default:
        return 'color-muted bg-secondary/50';
    }
  };

  // Configure DataView
  const config: DataViewConfig = {
    id: 'performances-management',
    name: 'Performances Management',
    viewType: 'grid',
    defaultView: 'grid',
    fields,
    data,
    
    onSearch: (query: string) => {
      console.log('Search performances:', query);
    },
    onFilter: (filters: any[]) => {
      console.log('Filter performances:', filters);
    },
    onSort: (sorts: any[]) => {
      console.log('Sort performances:', sorts);
    },
    onRefresh: loadPerformances,
    onExport: (data: any[], format: string) => {
      console.log('Export performances:', format, data);
    },
    onImport: (data: any[]) => {
      console.log('Import performances:', data);
    },
  };

  return (
    <div className="stack-md">
      <DataViewProvider config={config}>
        <StateManagerProvider>
          <div className="stack-md">
            {/* Header Actions */}
            <div className="flex items-center justify-between mb-md">
              <div className="flex items-center gap-md">
                <h2 className="text-body text-heading-4">Performance Management</h2>
                <Button>
                  <Plus className="h-4 w-4 mr-sm" />
                  Create Performance
                </Button>
              </div>
              <div className="flex items-center gap-sm">
                <ViewSwitcher />
                <DataActions />
              </div>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-md mb-lg">
              <Card className="p-md">
                <div className="flex items-center gap-sm">
                  <div className="p-sm bg-primary/10 rounded-lg">
                    <Calendar className="h-5 w-5 color-primary" />
                  </div>
                  <div>
                    <div className="text-heading-3 text-heading-3">
                      {data.filter(p => p.status === 'ready' || p.status === 'live').length}
                    </div>
                    <div className="text-body-sm color-muted">Upcoming</div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-md">
                <div className="flex items-center gap-sm">
                  <div className="p-sm bg-success/10 rounded-lg">
                    <Music className="h-5 w-5 color-success" />
                  </div>
                  <div>
                    <div className="text-heading-3 text-heading-3">
                      {data.filter(p => p.status === 'live').length}
                    </div>
                    <div className="text-body-sm color-muted">Live Now</div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-md">
                <div className="flex items-center gap-sm">
                  <div className="p-sm bg-secondary/10 rounded-lg">
                    <Users className="h-5 w-5 color-secondary" />
                  </div>
                  <div>
                    <div className="text-heading-3 text-heading-3">
                      {data.reduce((sum, p) => sum + (p.lineup_count || 0), 0)}
                    </div>
                    <div className="text-body-sm color-muted">Total Performers</div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-md">
                <div className="flex items-center gap-sm">
                  <div className="p-sm bg-warning/10 rounded-lg">
                    <Star className="h-5 w-5 color-warning" />
                  </div>
                  <div>
                    <div className="text-heading-3 text-heading-3">
                      {data.filter(p => p.status === 'completed').length}
                    </div>
                    <div className="text-body-sm color-muted">Completed</div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Data Views */}
            <DataGrid />
            
            <KanbanBoard 
              columns={[
                { id: 'planning', title: 'Planning' },
                { id: 'rehearsal', title: 'Rehearsal' },
                { id: 'ready', title: 'Ready' },
                { id: 'live', title: 'Live' },
                { id: 'completed', title: 'Completed' }
              ]}
              statusField="status"
              titleField="name"
              onCardClick={handleViewPerformance}
            />
            
            <CalendarView 
              startDateField="starts_at"
              endDateField="ends_at"
              titleField="name"
              
            />
            
            <ListView 
              titleField="name"
              subtitleField="project_name"
              onItemClick={handleViewPerformance}
            />
            
            {/* Performance Details Drawer */}
            <Drawer
              open={drawerOpen}
              onClose={() => {
                setDrawerOpen(false);
                setSelectedRecord(null);
              }}
              title={
                drawerMode === 'create' 
                  ? 'Create Performance' 
                  : selectedRecord?.name || 'Performance Details'
              }
            >
              {/* Custom Performance Details */}
              {selectedRecord && (
                <div className="stack-lg mt-lg">
                  {/* Performance Info */}
                  <div className="grid grid-cols-2 gap-md">
                    <div className="flex items-center gap-sm text-body-sm">
                      <Calendar className="h-4 w-4 color-muted" />
                      <span className="form-label">Date:</span>
                      <span>
                        {selectedRecord.starts_at 
                          ? new Date(selectedRecord.starts_at).toLocaleDateString()
                          : 'Not scheduled'
                        }
                      </span>
                    </div>
                    <div className="flex items-center gap-sm text-body-sm">
                      <Clock className="h-4 w-4 color-muted" />
                      <span className="form-label">Time:</span>
                      <span>
                        {selectedRecord.starts_at 
                          ? new Date(selectedRecord.starts_at).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })
                          : 'TBD'
                        }
                      </span>
                    </div>
                    <div className="flex items-center gap-sm text-body-sm">
                      <MapPin className="h-4 w-4 color-muted" />
                      <span className="form-label">Venue:</span>
                      <span>{selectedRecord.venue || 'TBD'}</span>
                    </div>
                    <div className="flex items-center gap-sm text-body-sm">
                      <Clock className="h-4 w-4 color-muted" />
                      <span className="form-label">Duration:</span>
                      <span>{selectedRecord.duration_minutes ? `${selectedRecord.duration_minutes} min` : 'TBD'}</span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-sm">
                    <span className="form-label text-body-sm">Status:</span>
                    <Badge className={getStatusColor(selectedRecord.status)}>
                      {selectedRecord.status?.replace('_', ' ') || 'Unknown'}
                    </Badge>
                  </div>
                  
                  {/* Performance Metrics */}
                  <div className="grid grid-cols-3 gap-md pt-md border-t">
                    <div className="text-center">
                      <div className="text-heading-3 text-heading-3 color-primary">{selectedRecord.lineup_count || 0}</div>
                      <div className="text-body-sm color-muted flex items-center justify-center gap-xs">
                        <Users className="h-3 w-3" />
                        Performers
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-heading-3 text-heading-3 color-success">{selectedRecord.riders_count || 0}</div>
                      <div className="text-body-sm color-muted flex items-center justify-center gap-xs">
                        <FileText className="h-3 w-3" />
                        Riders
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-heading-3 text-heading-3 color-secondary">{selectedRecord.call_sheets_count || 0}</div>
                      <div className="text-body-sm color-muted flex items-center justify-center gap-xs">
                        <Calendar className="h-3 w-3" />
                        Call Sheets
                      </div>
                    </div>
                  </div>

                  {/* Technical Requirements */}
                  {selectedRecord.technical_requirements && selectedRecord.technical_requirements !== 'None specified' && (
                    <div className="pt-md border-t">
                      <h4 className="form-label text-body-sm mb-sm flex items-center gap-sm">
                        <Mic className="h-4 w-4" />
                        Technical Requirements
                      </h4>
                      <p className="text-body-sm color-muted bg-secondary/50 p-sm rounded-lg">
                        {selectedRecord.technical_requirements}
                      </p>
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="flex gap-sm pt-md border-t">
                    <Button asChild>
                      <a href={`/programming/lineups?event_id=${selectedRecord.id}`}>
                        <Users className="h-4 w-4 mr-sm" />
                        Manage Lineup
                      </a>
                    </Button>
                    <Button asChild>
                      <a href={`/programming/riders?event_id=${selectedRecord.id}`}>
                        <FileText className="h-4 w-4 mr-sm" />
                        Tech Riders
                      </a>
                    </Button>
                    <Button asChild>
                      <a href={`/programming/call-sheets?event_id=${selectedRecord.id}`}>
                        <Calendar className="h-4 w-4 mr-sm" />
                        Call Sheets
                      </a>
                    </Button>
                  </div>
                </div>
              )}
            </Drawer>
          </div>
        </StateManagerProvider>
      </DataViewProvider>
    </div>
  );
}
