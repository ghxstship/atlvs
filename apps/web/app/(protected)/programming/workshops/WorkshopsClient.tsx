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
  BookOpen,
  GraduationCap,
  MapPin,
  User,
  Target
} from 'lucide-react';

export default function WorkshopsClient({ orgId }: { orgId: string }) {
  const t = useTranslations('programming');
  const sb = createBrowserClient();
  
  const [data, setData] = useState<DataRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'view' | 'edit' | 'create'>('view');

  // Define field configuration for workshops
  const fields: FieldConfig[] = [
    {
      key: 'name',
      label: 'Workshop Title',
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
      label: 'Start Date',
      type: 'date',
      sortable: true,
      filterable: true,
      width: 130
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
      key: 'instructor',
      label: 'Instructor',
      type: 'text',
      sortable: true,
      filterable: true,
      width: 150
    },
    {
      key: 'max_participants',
      label: 'Max Participants',
      type: 'number',
      sortable: true,
      filterable: true,
      width: 130
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'planning', label: 'Planning' },
        { value: 'open_registration', label: 'Open Registration' },
        { value: 'full', label: 'Full' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' }
      ],
      sortable: true,
      filterable: true,
      groupable: true,
      width: 140
    },
    {
      key: 'skill_level',
      label: 'Skill Level',
      type: 'select',
      options: [
        { value: 'beginner', label: 'Beginner' },
        { value: 'intermediate', label: 'Intermediate' },
        { value: 'advanced', label: 'Advanced' },
        { value: 'all_levels', label: 'All Levels' }
      ],
      sortable: true,
      filterable: true,
      groupable: true,
      width: 120
    }
  ];

  useEffect(() => {
    loadWorkshops();
  }, [orgId]);

  const loadWorkshops = async () => {
    if (!orgId) return;
    
    try {
      setLoading(true);
      
      const { data: workshopsData, error } = await sb
        .from('events')
        .select(`
          *,
          projects!inner(
            name,
            organization_id
          )
        `)
        .eq('kind', 'workshop')
        .eq('projects.organization_id', orgId)
        .order('starts_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform data to include computed fields
      const transformedData = (workshopsData || []).map(workshop => {
        const duration = workshop.ends_at && workshop.starts_at 
          ? Math.round((new Date(workshop.ends_at).getTime() - new Date(workshop.starts_at).getTime()) / (1000 * 60))
          : null;
          
        return {
          ...workshop,
          project_name: workshop.projects?.name || 'Unknown Project',
          status: computeWorkshopStatus(workshop),
          duration_minutes: duration,
          instructor: workshop.instructor || 'TBD',
          max_participants: workshop.max_participants || 20,
          skill_level: workshop.skill_level || 'all_levels',
          current_participants: workshop.current_participants || 0
        };
      });
      
      setData(transformedData);
    } catch (error) {
      console.error('Error loading workshops:', error);
    } finally {
      setLoading(false);
    }
  };

  const computeWorkshopStatus = (workshop: any) => {
    const now = new Date();
    const startDate = workshop.starts_at ? new Date(workshop.starts_at) : null;
    const endDate = workshop.ends_at ? new Date(workshop.ends_at) : null;

    if (!startDate) return 'planning';
    
    // Check if workshop is happening now
    if (startDate <= now && (!endDate || endDate >= now)) return 'in_progress';
    
    // Check if workshop is completed
    if (endDate && endDate < now) return 'completed';
    
    // Check registration status for future workshops
    if (startDate > now) {
      const maxParticipants = workshop.max_participants || 20;
      const currentParticipants = workshop.current_participants || 0;
      
      if (currentParticipants >= maxParticipants) return 'full';
      return 'open_registration';
    }
    
    return 'planning';
  };

  const handleCreateWorkshop = () => {
    setSelectedRecord(null);
    setDrawerMode('create');
    setDrawerOpen(true);
  };

  const handleEditWorkshop = (workshop: any) => {
    setSelectedRecord(workshop);
    setDrawerMode('edit');
    setDrawerOpen(true);
  };

  const handleViewWorkshop = (workshop: any) => {
    setSelectedRecord(workshop);
    setDrawerMode('view');
    setDrawerOpen(true);
  };

  const handleSaveWorkshop = async (workshopData: any) => {
    try {
      const eventData = {
        ...workshopData,
        kind: 'workshop'
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
      
      await loadWorkshops();
      setDrawerOpen(false);
    } catch (error) {
      console.error('Error saving workshop:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning':
        return 'text-gray-600 bg-gray-50';
      case 'open_registration':
        return 'text-green-600 bg-green-50';
      case 'full':
        return 'text-orange-600 bg-orange-50';
      case 'in_progress':
        return 'text-blue-600 bg-blue-50';
      case 'completed':
        return 'text-purple-600 bg-purple-50';
      case 'cancelled':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'text-green-600 bg-green-50';
      case 'intermediate':
        return 'text-yellow-600 bg-yellow-50';
      case 'advanced':
        return 'text-red-600 bg-red-50';
      case 'all_levels':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  // Configure DataView
  const config: DataViewConfig = {
    id: 'workshops-management',
    name: 'Workshops Management',
    viewType: 'grid',
    defaultView: 'grid',
    fields,
    data,
    
    onSearch: (query: string) => {
      console.log('Search workshops:', query);
    },
    onFilter: (filters: any[]) => {
      console.log('Filter workshops:', filters);
    },
    onSort: (sorts: any[]) => {
      console.log('Sort workshops:', sorts);
    },
    onRefresh: loadWorkshops,
    onExport: (data: any[], format: string) => {
      console.log('Export workshops:', format, data);
    },
    onImport: (data: any[]) => {
      console.log('Import workshops:', data);
    }
  };

  return (
    <div className="space-y-4">
      <DataViewProvider config={config}>
        <StateManagerProvider>
          <div className="space-y-4">
            {/* Header Actions */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold">Workshop Management</h2>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Workshop
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <ViewSwitcher />
                <DataActions />
              </div>
            </div>

            {/* Workshop Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <BookOpen className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {data.filter(w => w.status === 'open_registration').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Open Registration</div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <GraduationCap className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {data.filter(w => w.status === 'in_progress').length}
                    </div>
                    <div className="text-sm text-muted-foreground">In Progress</div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {data.reduce((sum, w) => sum + (w.current_participants || 0), 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Participants</div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-50 rounded-lg">
                    <Target className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {data.filter(w => w.status === 'completed').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Completed</div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Data Views */}
            <DataGrid />
            
            <KanbanBoard 
              columns={[
                { id: 'planning', title: 'Planning' },
                { id: 'open_registration', title: 'Open Registration' },
                { id: 'full', title: 'Full' },
                { id: 'in_progress', title: 'In Progress' },
                { id: 'completed', title: 'Completed' }
              ]}
              statusField="status"
              titleField="name"
              onCardClick={handleViewWorkshop}
            />
            
            <CalendarView 
              startDateField="starts_at"
              endDateField="ends_at"
              titleField="name"
              
            />
            
            <ListView 
              titleField="name"
              subtitleField="project_name"
              onItemClick={handleViewWorkshop}
            />
            
            {/* Workshop Details Drawer */}
            <Drawer
              open={drawerOpen}
              onClose={() => {
                setDrawerOpen(false);
                setSelectedRecord(null);
              }}
              title={
                drawerMode === 'create' 
                  ? 'Create Workshop' 
                  : selectedRecord?.name || 'Workshop Details'
              }
            >
              {/* Custom Workshop Details */}
              {selectedRecord && (
                <div className="space-y-6 mt-6">
                  {/* Workshop Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Date:</span>
                      <span>
                        {selectedRecord.starts_at 
                          ? new Date(selectedRecord.starts_at).toLocaleDateString()
                          : 'Not scheduled'
                        }
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Time:</span>
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
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Instructor:</span>
                      <span>{selectedRecord.instructor || 'TBD'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Duration:</span>
                      <span>{selectedRecord.duration_minutes ? `${selectedRecord.duration_minutes} min` : 'TBD'}</span>
                    </div>
                  </div>

                  {/* Status and Level Badges */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">Status:</span>
                      <Badge className={getStatusColor(selectedRecord.status)}>
                        {selectedRecord.status?.replace('_', ' ') || 'Planning'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">Level:</span>
                      <Badge className={getSkillLevelColor(selectedRecord.skill_level)}>
                        {selectedRecord.skill_level?.replace('_', ' ') || 'All Levels'}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Participation Metrics */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedRecord.current_participants || 0}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                        <Users className="h-3 w-3" />
                        Current Participants
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {selectedRecord.max_participants || 20}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                        <Target className="h-3 w-3" />
                        Max Capacity
                      </div>
                    </div>
                  </div>

                  {/* Workshop Description */}
                  {selectedRecord.description && (
                    <div className="pt-4 border-t">
                      <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Workshop Description
                      </h4>
                      <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                        {selectedRecord.description}
                      </p>
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button size="sm">
                      <Users className="h-4 w-4 mr-2" />
                      Manage Participants
                    </Button>
                    <Button size="sm">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Course Materials
                    </Button>
                    <Button size="sm">
                      <MapPin className="h-4 w-4 mr-2" />
                      Room Assignment
                    </Button>
                  </div>
                </div>
              )}
            </Drawer>

            {/* Empty State */}
            {!loading && data.length === 0 && (
              <Card className="p-8 text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Workshops Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start creating educational workshops and training sessions for your events.
                </p>
                <Button onClick={handleCreateWorkshop}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Workshop
                </Button>
              </Card>
            )}
          </div>
        </StateManagerProvider>
      </DataViewProvider>
    </div>
  );
}
