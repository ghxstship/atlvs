'use client';


import { useEffect, useState } from 'react';
import { Drawer, type Button, Card, Badge } from '@ghxstship/ui';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
import { Plus, FileText, Mic, Utensils, Settings, Calendar } from 'lucide-react';

export default function RidersClient({ orgId }: { orgId: string }) {
  const t = useTranslations('programming');
  const sb = createBrowserClient();
  
  const [data, setData] = useState<DataRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'view' | 'edit' | 'create'>('view');

  // Define field configuration for riders
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
      key: 'kind',
      label: 'Rider Type',
      type: 'select',
      options: [
        { value: 'technical', label: 'Technical' },
        { value: 'hospitality', label: 'Hospitality' },
        { value: 'stage_plot', label: 'Stage Plot' }
      ],
      required: true,
      sortable: true,
      filterable: true,
      groupable: true,
      width: 150
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'draft', label: 'Draft' },
        { value: 'pending_review', label: 'Pending Review' },
        { value: 'approved', label: 'Approved' },
        { value: 'fulfilled', label: 'Fulfilled' }
      ],
      sortable: true,
      filterable: true,
      groupable: true,
      width: 130
    },
    {
      key: 'priority',
      label: 'Priority',
      type: 'select',
      options: [
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' },
        { value: 'critical', label: 'Critical' }
      ],
      sortable: true,
      filterable: true,
      groupable: true,
      width: 100
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
    loadRiders();
  }, [orgId]);

  const loadRiders = async () => {
    if (!orgId) return;
    
    try {
      setLoading(true);
      
      const { data: ridersData, error } = await sb
        .from('riders')
        .select(`
          *,
          events!inner(
            name,
            projects!inner(
              organization_id
            )
          )
        `)
        .eq('events.projects.organization_id', orgId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform data to include event name and computed fields
      const transformedData = (ridersData || []).map(rider => ({
        ...rider,
        event_name: rider.events?.name || 'Unknown Event',
        status: rider.status || 'draft',
        priority: rider.priority || 'medium'
      }));
      
      setData(transformedData);
    } catch (error) {
      console.error('Error loading riders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRider = () => {
    setSelectedRecord(null);
    setDrawerMode('create');
    setDrawerOpen(true);
  };

  const handleEditRider = (rider: any) => {
    setSelectedRecord(rider);
    setDrawerMode('edit');
    setDrawerOpen(true);
  };

  const handleViewRider = (rider: any) => {
    setSelectedRecord(rider);
    setDrawerMode('view');
    setDrawerOpen(true);
  };

  const handleSaveRider = async (riderData: any) => {
    try {
      if (drawerMode === 'create') {
        const { error } = await sb.from('riders').insert(riderData);
        if (error) throw error;
      } else if (drawerMode === 'edit') {
        const { error } = await sb
          .from('riders')
          .update(riderData)
          .eq('id', selectedRecord.id);
        if (error) throw error;
      }
      
      await loadRiders();
      setDrawerOpen(false);
    } catch (error) {
      console.error('Error saving rider:', error);
    }
  };

  const getRiderIcon = (kind: string) => {
    switch (kind) {
      case 'technical':
        return Settings;
      case 'hospitality':
        return Utensils;
      case 'stage_plot':
        return Mic;
      default:
        return FileText;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'color-muted bg-secondary/50';
      case 'pending_review':
        return 'color-warning-foreground bg-warning/10';
      case 'approved':
        return 'text-info-foreground bg-info/10';
      case 'fulfilled':
        return 'color-success-foreground bg-success/10';
      default:
        return 'color-muted bg-secondary/50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'color-muted bg-secondary/50';
      case 'medium':
        return 'text-info-foreground bg-info/10';
      case 'high':
        return 'color-warning-foreground bg-warning/10';
      case 'critical':
        return 'color-destructive-foreground bg-destructive/10';
      default:
        return 'color-muted bg-secondary/50';
    }
  };

  // Configure DataView
  const config: DataViewConfig = {
    id: 'riders-management',
    name: 'Riders Management',
    viewType: 'grid',
    defaultView: 'grid',
    fields,
    data,
    
    onSearch: (query: string) => {
      console.log('Search riders:', query);
    },
    onFilter: (filters: any[]) => {
      console.log('Filter riders:', filters);
    },
    onSort: (sorts: any[]) => {
      console.log('Sort riders:', sorts);
    },
    onRefresh: loadRiders,
    onExport: (data: any[], format: string) => {
      console.log('Export riders:', format, data);
    },
    onImport: (data: any[]) => {
      console.log('Import riders:', data);
    }
  };

  // Group riders by type for better visualization
  const ridersByType = data.reduce((acc, rider) => {
    const type = rider.kind || 'technical';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(rider);
    return acc;
  }, {});

  const riderTypeLabels: { [key: string]: string } = {
    technical: 'Technical Riders',
    hospitality: 'Hospitality Riders',
    stage_plot: 'Stage Plots'
  };

  return (
    <div className="stack-md">
      <DataViewProvider config={config}>
        <StateManagerProvider>
          <div className="stack-md">
            {/* Header Actions */}
            <div className="flex items-center justify-between mb-md">
              <div className="flex items-center gap-md">
                <h2 className="text-body text-heading-4">Riders Management</h2>
                <Button>
                  <Plus className="h-4 w-4 mr-sm" />
                  Create Rider
                </Button>
              </div>
              <div className="flex items-center gap-sm">
                <ViewSwitcher />
                <DataActions />
              </div>
            </div>

            {/* Rider Type Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-md mb-lg">
              {Object.entries(ridersByType).map(([type, typeRiders]: [string, any]) => {
                const IconComponent = getRiderIcon(type);
                const pendingCount = typeRiders.filter((r: any) => r.status === 'pending_review').length;
                const approvedCount = typeRiders.filter((r: any) => r.status === 'approved').length;
                
                return (
                  <Card key={type} className="p-md">
                    <div className="flex items-center justify-between mb-sm">
                      <h3 className="text-heading-4 flex items-center gap-sm">
                        <IconComponent className="h-4 w-4" />
                        {riderTypeLabels[type] || type}
                      </h3>
                      <Badge variant="secondary">
                        {typeRiders.length} riders
                      </Badge>
                    </div>
                    
                    <div className="stack-sm">
                      <div className="flex justify-between text-body-sm">
                        <span className="color-muted">Pending Review:</span>
                        <span className="form-label color-warning">{pendingCount}</span>
                      </div>
                      <div className="flex justify-between text-body-sm">
                        <span className="color-muted">Approved:</span>
                        <span className="form-label color-success">{approvedCount}</span>
                      </div>
                    </div>
                    
                    <div className="mt-sm stack-xs">
                      {typeRiders.slice(0, 2).map((rider: any) => (
                        <div
                          key={rider.id}
                          className="flex items-center justify-between text-body-sm p-sm rounded border cursor-pointer hover:bg-secondary/50"
                          onClick={() => handleViewRider(rider)}
                        >
                          <div>
                            <div className="form-label">{rider.event_name}</div>
                            <div className="color-muted flex items-center gap-xs">
                              <Calendar className="h-3 w-3" />
                              {new Date(rider.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex flex-col gap-xs">
                            <Badge variant="outline">
                              {rider.status.replace('_', ' ')}
                            </Badge>
                            <Badge variant="outline">
                              {rider.priority}
                            </Badge>
                          </div>
                        </div>
                      ))}
                      
                      {typeRiders.length > 2 && (
                        <div className="text-body-sm color-muted text-center pt-xs">
                          +{typeRiders.length - 2} more riders
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Data Views */}
            <DataGrid />
            
            <KanbanBoard 
              columns={[
                { id: 'draft', title: 'Draft' },
                { id: 'pending_review', title: 'Pending Review' },
                { id: 'approved', title: 'Approved' },
                { id: 'fulfilled', title: 'Fulfilled' }
              ]}
              statusField="status"
              titleField="event_name"
              onCardClick={handleViewRider}
            />
            
            <ListView 
              titleField="event_name"
              subtitleField="kind"
              onItemClick={handleViewRider}
            />
            
            {/* Rider Details Drawer */}
            <Drawer
              open={drawerOpen}
              onClose={() => {
                setDrawerOpen(false);
                setSelectedRecord(null);
              }}
              title={
                drawerMode === 'create' 
                  ? 'Create New Rider' 
                  : `${selectedRecord?.kind?.replace('_', ' ')} Rider` || 'Rider Details'
              }
            >
              {/* Custom Rider Details */}
              {selectedRecord && (
                <div className="stack-md mt-lg">
                  <div className="grid grid-cols-2 gap-md">
                    <div className="flex items-center gap-sm text-body-sm color-muted">
                      <FileText className="h-4 w-4" />
                      <span>
                        {selectedRecord.kind?.replace('_', ' ') || 'Technical'} Rider
                      </span>
                    </div>
                    <div className="flex items-center gap-sm text-body-sm color-muted">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Created {new Date(selectedRecord.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-md">
                    <Badge className={getStatusColor(selectedRecord.status)}>
                      {selectedRecord.status?.replace('_', ' ') || 'Draft'}
                    </Badge>
                    <Badge className={getPriorityColor(selectedRecord.priority)}>
                      {selectedRecord.priority || 'Medium'} Priority
                    </Badge>
                  </div>
                  
                  {selectedRecord.details && (
                    <div className="pt-md border-t">
                      <h4 className="form-label mb-sm">Rider Details</h4>
                      <div className="text-body-sm color-muted bg-secondary/50 p-sm rounded">
                        {typeof selectedRecord.details === 'object' 
                          ? JSON.stringify(selectedRecord.details, null, 2)
                          : selectedRecord.details
                        }
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Drawer>

            {/* Empty State */}
            {!loading && data.length === 0 && (
              <Card className="p-xl text-center">
                <FileText className="h-12 w-12 mx-auto mb-md color-muted" />
                <h3 className="text-body text-heading-4 mb-sm">No Riders Yet</h3>
                <p className="color-muted mb-md">
                  Start creating technical and hospitality riders for your events to ensure all requirements are met.
                </p>
                <Button onClick={handleCreateRider}>
                  <Plus className="h-4 w-4 mr-sm" />
                  Create First Rider
                </Button>
              </Card>
            )}
          </div>
        </StateManagerProvider>
      </DataViewProvider>
    </div>
  );
}
