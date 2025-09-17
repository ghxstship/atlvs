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
import { Plus, Users, Clock, Calendar, Music, MapPin } from 'lucide-react';

export default function LineupsClient({ orgId }: { orgId: string }) {
  const t = useTranslations('programming');
  const sb = createBrowserClient();
  
  const [data, setData] = useState<DataRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'view' | 'edit' | 'create'>('view');

  // Define field configuration for lineups
  const fields: FieldConfig[] = [
    {
      key: 'performer',
      label: 'Performer',
      type: 'text',
      required: true,
      sortable: true,
      filterable: true,
      width: 200
    },
    {
      key: 'event_name',
      label: 'Event',
      type: 'text',
      sortable: true,
      filterable: true,
      width: 180
    },
    {
      key: 'stage',
      label: 'Stage/Location',
      type: 'text',
      sortable: true,
      filterable: true,
      groupable: true,
      width: 150
    },
    {
      key: 'set_time',
      label: 'Set Time',
      type: 'text',
      sortable: true,
      filterable: true,
      width: 120
    },
    {
      key: 'duration',
      label: 'Duration (min)',
      type: 'number',
      sortable: true,
      filterable: true,
      width: 120
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'confirmed', label: 'Confirmed' },
        { value: 'tentative', label: 'Tentative' },
        { value: 'cancelled', label: 'Cancelled' }
      ],
      sortable: true,
      filterable: true,
      groupable: true,
      width: 120
    }
  ];

  useEffect(() => {
    loadLineups();
  }, [orgId]);

  const loadLineups = async () => {
    if (!orgId) return;
    
    try {
      setLoading(true);
      
      const { data: lineupsData, error } = await sb
        .from('lineups')
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
        .order('set_time', { ascending: true });
      
      if (error) throw error;
      
      // Transform data to include event name and computed fields
      const transformedData = (lineupsData || []).map(lineup => ({
        ...lineup,
        event_name: lineup.events?.name || 'Unknown Event',
        event_date: lineup.events?.starts_at,
        status: lineup.status || 'tentative'
      }));
      
      setData(transformedData);
    } catch (error) {
      console.error('Error loading lineups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLineup = () => {
    setSelectedRecord(null);
    setDrawerMode('create');
    setDrawerOpen(true);
  };

  const handleEditLineup = (lineup: any) => {
    setSelectedRecord(lineup);
    setDrawerMode('edit');
    setDrawerOpen(true);
  };

  const handleViewLineup = (lineup: any) => {
    setSelectedRecord(lineup);
    setDrawerMode('view');
    setDrawerOpen(true);
  };

  const handleSaveLineup = async (lineupData: any) => {
    try {
      if (drawerMode === 'create') {
        const { error } = await sb.from('lineups').insert(lineupData);
        if (error) throw error;
      } else if (drawerMode === 'edit') {
        const { error } = await sb
          .from('lineups')
          .update(lineupData)
          .eq('id', selectedRecord.id);
        if (error) throw error;
      }
      
      await loadLineups();
      setDrawerOpen(false);
    } catch (error) {
      console.error('Error saving lineup:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'color-success bg-success/10';
      case 'tentative':
        return 'color-warning bg-warning/10';
      case 'cancelled':
        return 'color-destructive bg-destructive/10';
      default:
        return 'color-muted bg-secondary/10';
    }
  };

  // Configure DataView
  const config: DataViewConfig = {
    id: 'lineups-management',
    name: 'Lineups Management',
    viewType: 'grid',
    defaultView: 'grid',
    fields,
    data,
    
    onSearch: (query: string) => {
      console.log('Search lineups:', query);
    },
    onFilter: (filters: any[]) => {
      console.log('Filter lineups:', filters);
    },
    onSort: (sorts: any[]) => {
      console.log('Sort lineups:', sorts);
    },
    onRefresh: loadLineups,
    onExport: (data: any[], format: string) => {
      console.log('Export lineups:', format, data);
    },
    onImport: (data: any[]) => {
      console.log('Import lineups:', data);
    }
  };

  // Group lineups by stage for better visualization
  const lineupsByStage = data.reduce((acc: any, lineup: any) => {
    const stage = lineup.stage || 'Unassigned';
    if (!acc[stage]) {
      acc[stage] = [];
    }
    acc[stage].push(lineup);
    return acc;
  }, {});

  return (
    <div className="stack-md">
      <DataViewProvider config={config}>
        <StateManagerProvider>
          <div className="stack-md">
            {/* Header Actions */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-md">
                <h2 className="text-body text-heading-4">Lineups Management</h2>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Performer
                </Button>
              </div>
              <div className="flex items-center gap-sm">
                <ViewSwitcher />
                <DataActions />
              </div>
            </div>

            {/* Stage Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md mb-6">
              {Object.entries(lineupsByStage).map(([stage, stageLineups]: [string, any]) => (
                <Card key={stage} className="p-md">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-heading-4 flex items-center gap-sm">
                      <MapPin className="h-4 w-4" />
                      {stage}
                    </h3>
                    <Badge variant="secondary">
                      {stageLineups.length} performers
                    </Badge>
                  </div>
                  
                  <div className="stack-sm">
                    {stageLineups.slice(0, 3).map((lineup: any) => (
                      <div
                        key={lineup.id}
                        className="flex items-center justify-between text-body-sm p-sm rounded border cursor-pointer hover:bg-secondary/50"
                        onClick={() => handleViewLineup(lineup)}
                      >
                        <div>
                          <div className="form-label">{lineup.performer}</div>
                          <div className="color-muted flex items-center gap-sm">
                            <Clock className="h-3 w-3" />
                            {lineup.set_time || 'TBD'}
                            {lineup.duration && (
                              <span>({lineup.duration}min)</span>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline" className={getStatusColor(lineup.status)}>
                          {lineup.status}
                        </Badge>
                      </div>
                    ))}
                    
                    {stageLineups.length > 3 && (
                      <div className="text-body-sm color-muted text-center pt-2">
                        +{stageLineups.length - 3} more performers
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            {/* Data Views */}
            <DataGrid />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md mt-4">
              {data.map((lineup) => (
                <div key={lineup.id} className="p-md border rounded-lg hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleViewLineup(lineup)}>
                  <h3 className="form-label">{lineup.performer}</h3>
                  <p className="text-body-sm color-muted">{lineup.stage}</p>
                </div>
              ))}
            </div>
            
            <ListView 
              titleField="performer"
              subtitleField="event_name"
              onItemClick={handleViewLineup}
            />
            
            {/* Lineup Details Drawer */}
            <Drawer
              open={drawerOpen}
              onClose={() => {
                setDrawerOpen(false);
                setSelectedRecord(null);
              }}
              title={
                drawerMode === 'create' 
                  ? 'Add Performer to Lineup' 
                  : selectedRecord?.performer || 'Lineup Details'
              }
            >
              {/* Custom Lineup Details */}
              {selectedRecord && (
                <div className="stack-md mt-6">
                  <div className="grid grid-cols-2 gap-md">
                    <div className="flex items-center gap-sm text-body-sm color-muted">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {selectedRecord.event_date 
                          ? new Date(selectedRecord.event_date).toLocaleDateString()
                          : 'No event date'
                        }
                      </span>
                    </div>
                    <div className="flex items-center gap-sm text-body-sm color-muted">
                      <Clock className="h-4 w-4" />
                      <span>
                        {selectedRecord.set_time || 'Set time TBD'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-sm text-body-sm color-muted">
                    <MapPin className="h-4 w-4" />
                    <span>{selectedRecord.stage || 'Stage TBD'}</span>
                  </div>
                  
                  {selectedRecord.duration && (
                    <div className="flex items-center gap-sm text-body-sm color-muted">
                      <Music className="h-4 w-4" />
                      <span>{selectedRecord.duration} minute set</span>
                    </div>
                  )}
                  
                  <div className="pt-4 border-t">
                    <Badge className={getStatusColor(selectedRecord.status)}>
                      {selectedRecord.status?.replace('_', ' ') || 'Status Unknown'}
                    </Badge>
                  </div>
                </div>
              )}
            </Drawer>

            {/* Empty State */}
            {!loading && data.length === 0 && (
              <Card className="p-xl text-center">
                <Users className="h-12 w-12 mx-auto mb-4 color-muted" />
                <h3 className="text-body text-heading-4 mb-2">No Lineups Yet</h3>
                <p className="color-muted mb-4">
                  Start building your event lineups by adding performers and their set times.
                </p>
                <Button onClick={handleCreateLineup}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Performer
                </Button>
              </Card>
            )}
          </div>
        </StateManagerProvider>
      </DataViewProvider>
    </div>
  );
}
