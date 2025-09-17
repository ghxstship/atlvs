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
import { Plus, MapPin, Users, Square, Home, Coffee, Presentation } from 'lucide-react';

export default function SpacesClient({ orgId }: { orgId: string }) {
  const t = useTranslations('programming');
  const sb = createBrowserClient();
  
  const [data, setData] = useState<DataRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'view' | 'edit' | 'create'>('view');

  // Define field configuration for spaces
  const fields: FieldConfig[] = [
    {
      key: 'name',
      label: 'Space Name',
      type: 'text',
      required: true,
      sortable: true,
      filterable: true,
      width: 200
    },
    {
      key: 'kind',
      label: 'Space Type',
      type: 'select',
      options: [
        { value: 'room', label: 'Room' },
        { value: 'green_room', label: 'Green Room' },
        { value: 'dressing_room', label: 'Dressing Room' },
        { value: 'meeting_room', label: 'Meeting Room' },
        { value: 'classroom', label: 'Classroom' }
      ],
      required: true,
      sortable: true,
      filterable: true,
      groupable: true,
      width: 150
    },
    {
      key: 'capacity',
      label: 'Capacity',
      type: 'number',
      sortable: true,
      filterable: true,
      width: 100
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
      key: 'availability',
      label: 'Availability',
      type: 'select',
      options: [
        { value: 'available', label: 'Available' },
        { value: 'occupied', label: 'Occupied' },
        { value: 'maintenance', label: 'Maintenance' },
        { value: 'reserved', label: 'Reserved' }
      ],
      sortable: true,
      filterable: true,
      groupable: true,
      width: 120
    }
  ];

  useEffect(() => {
    loadSpaces();
  }, [orgId]);

  const loadSpaces = async () => {
    if (!orgId) return;
    
    try {
      setLoading(true);
      
      const { data: spacesData, error } = await sb
        .from('spaces')
        .select('*')
        .eq('organization_id', orgId)
        .order('name', { ascending: true });
      
      if (error) throw error;
      
      // Transform data to include computed availability status
      const transformedData = (spacesData || []).map(space => ({
        ...space,
        availability: space.availability || 'available'
      }));
      
      setData(transformedData);
    } catch (error) {
      console.error('Error loading spaces:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSpace = () => {
    setSelectedRecord(null);
    setDrawerMode('create');
    setDrawerOpen(true);
  };

  const handleEditSpace = (space: any) => {
    setSelectedRecord(space);
    setDrawerMode('edit');
    setDrawerOpen(true);
  };

  const handleViewSpace = (space: any) => {
    setSelectedRecord(space);
    setDrawerMode('view');
    setDrawerOpen(true);
  };

  const handleSaveSpace = async (spaceData: any) => {
    try {
      if (drawerMode === 'create') {
        const { error } = await sb.from('spaces').insert({
          ...spaceData,
          organization_id: orgId
        });
        if (error) throw error;
      } else if (drawerMode === 'edit') {
        const { error } = await sb
          .from('spaces')
          .update(spaceData)
          .eq('id', selectedRecord.id);
        if (error) throw error;
      }
      
      await loadSpaces();
      setDrawerOpen(false);
    } catch (error) {
      console.error('Error saving space:', error);
    }
  };

  const getSpaceIcon = (kind: string) => {
    switch (kind) {
      case 'green_room':
        return Coffee;
      case 'dressing_room':
        return Home;
      case 'meeting_room':
        return Presentation;
      case 'classroom':
        return Users;
      default:
        return Square;
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available':
        return 'color-success bg-success/10';
      case 'occupied':
        return 'color-destructive bg-destructive/10';
      case 'maintenance':
        return 'color-warning bg-warning/10';
      case 'reserved':
        return 'color-primary bg-primary/10';
      default:
        return 'color-muted bg-secondary';
    }
  };

  // Configure DataView
  const config: DataViewConfig = {
    id: 'spaces-management',
    name: 'Spaces Management',
    viewType: 'grid',
    defaultView: 'grid',
    fields,
    data,
    
    onSearch: (query: string) => {
      console.log('Search spaces:', query);
    },
    onFilter: (filters: any[]) => {
      console.log('Filter spaces:', filters);
    },
    onSort: (sorts: any[]) => {
      console.log('Sort spaces:', sorts);
    },
    onRefresh: loadSpaces,
    onExport: (data: any[], format: string) => {
      console.log('Export spaces:', format, data);
    },
    onImport: (data: any[]) => {
      console.log('Import spaces:', data);
    }
  };

  // Group spaces by type for better visualization
  const spacesByType = data.reduce((acc: any, space: any) => {
    const type = space.kind || 'room';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(space);
    return acc;
  }, {});

  const spaceTypeLabels: { [key: string]: string } = {
    room: 'General Rooms',
    green_room: 'Green Rooms',
    dressing_room: 'Dressing Rooms',
    meeting_room: 'Meeting Rooms',
    classroom: 'Classrooms'
  };

  return (
    <div className="space-y-4">
      <DataViewProvider config={config}>
        <StateManagerProvider>
          <div className="space-y-4">
            {/* Header Actions */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <h2 className="text-body text-heading-4">Spaces Management</h2>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Space
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <ViewSwitcher />
                <DataActions />
              </div>
            </div>

            {/* Space Type Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {Object.entries(spacesByType).map(([type, typeSpaces]: [string, any]) => {
                const IconComponent = getSpaceIcon(type);
                const availableSpaces = typeSpaces.filter((s: any) => s.availability === 'available').length;
                const totalCapacity = typeSpaces.reduce((sum: number, s: any) => sum + (s.capacity || 0), 0);
                
                return (
                  <Card key={type} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-heading-4 flex items-center gap-2">
                        <IconComponent className="h-4 w-4" />
                        {spaceTypeLabels[type] || type}
                      </h3>
                      <Badge variant="secondary">
                        {typeSpaces.length} spaces
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-body-sm">
                        <span className="color-muted">Available:</span>
                        <span className="form-label color-success">{availableSpaces}</span>
                      </div>
                      <div className="flex justify-between text-body-sm">
                        <span className="color-muted">Total Capacity:</span>
                        <span className="form-label">{totalCapacity}</span>
                      </div>
                    </div>
                    
                    <div className="mt-3 space-y-1">
                      {typeSpaces.slice(0, 2).map((space: any) => (
                        <div
                          key={space.id}
                          className="flex items-center justify-between text-body-sm p-2 rounded border cursor-pointer hover:bg-secondary/50"
                          onClick={() => handleViewSpace(space)}
                        >
                          <div>
                            <div className="form-label">{space.name}</div>
                            <div className="color-muted flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {space.location || 'Location TBD'}
                            </div>
                          </div>
                          <Badge variant="outline" className={getAvailabilityColor(space.availability)}>
                            {space.availability}
                          </Badge>
                        </div>
                      ))}
                      
                      {typeSpaces.length > 2 && (
                        <div className="text-body-sm color-muted text-center pt-1">
                          +{typeSpaces.length - 2} more spaces
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
                { id: 'available', title: 'Available' },
                { id: 'occupied', title: 'Occupied' },
                { id: 'reserved', title: 'Reserved' },
                { id: 'maintenance', title: 'Maintenance' }
              ]}
              statusField="availability"
              titleField="name"
              onCardClick={handleViewSpace}
            />
            
            <ListView 
              titleField="name"
              subtitleField="kind"
              onItemClick={handleViewSpace}
            />
            
            {/* Space Details Drawer */}
            <Drawer
              open={drawerOpen}
              onClose={() => {
                setDrawerOpen(false);
                setSelectedRecord(null);
              }}
              title={
                drawerMode === 'create' 
                  ? 'Add New Space' 
                  : selectedRecord?.name || 'Space Details'
              }
            >
              {/* Custom Space Details */}
              {selectedRecord && (
                <div className="space-y-4 mt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-body-sm color-muted">
                      <Square className="h-4 w-4" />
                      <span>
                        {selectedRecord.kind?.replace('_', ' ') || 'General Room'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-body-sm color-muted">
                      <Users className="h-4 w-4" />
                      <span>
                        {selectedRecord.capacity ? `${selectedRecord.capacity} people` : 'Capacity TBD'}
                      </span>
                    </div>
                  </div>
                  
                  {selectedRecord.location && (
                    <div className="flex items-center gap-2 text-body-sm color-muted">
                      <MapPin className="h-4 w-4" />
                      <span>{selectedRecord.location}</span>
                    </div>
                  )}
                  
                  <div className="pt-4 border-t">
                    <Badge className={getAvailabilityColor(selectedRecord.availability)}>
                      {selectedRecord.availability?.replace('_', ' ') || 'Available'}
                    </Badge>
                  </div>
                </div>
              )}
            </Drawer>

            {/* Empty State */}
            {!loading && data.length === 0 && (
              <Card className="p-8 text-center">
                <Square className="h-12 w-12 mx-auto mb-4 color-muted" />
                <h3 className="text-body text-heading-4 mb-2">No Spaces Yet</h3>
                <p className="color-muted mb-4">
                  Start managing your venue spaces by adding rooms, green rooms, dressing rooms, and other facilities.
                </p>
                <Button onClick={handleCreateSpace}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Space
                </Button>
              </Card>
            )}
          </div>
        </StateManagerProvider>
      </DataViewProvider>
    </div>
  );
}
