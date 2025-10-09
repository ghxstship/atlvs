'use client';


import { useEffect, useState } from 'react';
import {
  Drawer,
  type Button,
  Card,
  Badge,
  StateManagerProvider,
  DataViewProvider,
  ViewSwitcher,
  DataActions,
  DataGrid,
  KanbanBoard,
  CalendarView,
  ListView,
  Button
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
        return 'color-muted bg-secondary/50';
      case 'open_registration':
        return 'color-success bg-success/10';
      case 'full':
        return 'color-warning bg-warning/10';
      case 'in_progress':
        return 'color-accent bg-accent/10';
      case 'completed':
        return 'color-secondary bg-secondary/10';
      case 'cancelled':
        return 'color-destructive bg-destructive/10';
      default:
        return 'color-muted bg-secondary/50';
    }
  };

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'color-success bg-success/10';
      case 'intermediate':
        return 'color-warning bg-warning/10';
      case 'advanced':
        return 'color-destructive bg-destructive/10';
      case 'all_levels':
        return 'color-accent bg-accent/10';
      default:
        return 'color-muted bg-secondary/50';
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
    <div className="stack-md">
      <DataViewProvider config={config}>
        <StateManagerProvider>
          <div className="stack-md">
            {/* Header Actions */}
            <div className="flex items-center justify-between mb-md">
              <div className="flex items-center gap-md">
                <h2 className="text-body text-heading-4">Workshop Management</h2>
                <Button>
                  <Plus className="h-icon-xs w-icon-xs mr-sm" />
                  Create Workshop
                </Button>
              </div>
              <div className="flex items-center gap-sm">
                <ViewSwitcher />
                <DataActions />
              </div>
            </div>

            {/* Workshop Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-md mb-lg">
              <Card className="p-md">
                <div className="flex items-center gap-sm">
                  <div className="p-sm bg-success/10 rounded-lg">
                    <BookOpen className="h-icon-sm w-icon-sm color-success" />
                  </div>
                  <div>
                    <div className="text-heading-3 text-heading-3">
                      {data.filter(w => w.status === 'open_registration').length}
                    </div>
                    <div className="text-body-sm color-muted">Open Registration</div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-md">
                <div className="flex items-center gap-sm">
                  <div className="p-sm bg-accent/10 rounded-lg">
                    <GraduationCap className="h-icon-sm w-icon-sm color-accent" />
                  </div>
                  <div>
                    <div className="text-heading-3 text-heading-3">
                      {data.filter(w => w.status === 'in_progress').length}
                    </div>
                    <div className="text-body-sm color-muted">In Progress</div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-md">
                <div className="flex items-center gap-sm">
                  <div className="p-sm bg-secondary/10 rounded-lg">
                    <Users className="h-icon-sm w-icon-sm color-secondary" />
                  </div>
                  <div>
                    <div className="text-heading-3 text-heading-3">
                      {data.reduce((sum, w) => sum + (w.current_participants || 0), 0)}
                    </div>
                    <div className="text-body-sm color-muted">Total Participants</div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-md">
                <div className="flex items-center gap-sm">
                  <div className="p-sm bg-warning/10 rounded-lg">
                    <Target className="h-icon-sm w-icon-sm color-warning" />
                  </div>
                  <div>
                    <div className="text-heading-3 text-heading-3">
                      {data.filter(w => w.status === 'completed').length}
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
                <div className="stack-lg mt-lg">
                  {/* Workshop Info */}
                  <div className="grid grid-cols-2 gap-md">
                    <div className="flex items-center gap-sm text-body-sm">
                      <Calendar className="h-icon-xs w-icon-xs color-muted" />
                      <span className="form-label">Date:</span>
                      <span>
                        {selectedRecord.starts_at 
                          ? new Date(selectedRecord.starts_at).toLocaleDateString()
                          : 'Not scheduled'
                        }
                      </span>
                    </div>
                    <div className="flex items-center gap-sm text-body-sm">
                      <Clock className="h-icon-xs w-icon-xs color-muted" />
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
                      <User className="h-icon-xs w-icon-xs color-muted" />
                      <span className="form-label">Instructor:</span>
                      <span>{selectedRecord.instructor || 'TBD'}</span>
                    </div>
                    <div className="flex items-center gap-sm text-body-sm">
                      <Clock className="h-icon-xs w-icon-xs color-muted" />
                      <span className="form-label">Duration:</span>
                      <span>{selectedRecord.duration_minutes ? `${selectedRecord.duration_minutes} min` : 'TBD'}</span>
                    </div>
                  </div>

                  {/* Status and Level Badges */}
                  <div className="flex items-center gap-md">
                    <div className="flex items-center gap-sm">
                      <span className="form-label text-body-sm">Status:</span>
                      <Badge className={getStatusColor(selectedRecord.status)}>
                        {selectedRecord.status?.replace('_', ' ') || 'Planning'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-sm">
                      <span className="form-label text-body-sm">Level:</span>
                      <Badge className={getSkillLevelColor(selectedRecord.skill_level)}>
                        {selectedRecord.skill_level?.replace('_', ' ') || 'All Levels'}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Participation Metrics */}
                  <div className="grid grid-cols-2 gap-md pt-md border-t">
                    <div className="text-center">
                      <div className="text-heading-3 text-heading-3 color-accent">
                        {selectedRecord.current_participants || 0}
                      </div>
                      <div className="text-body-sm color-muted flex items-center justify-center gap-xs">
                        <Users className="h-3 w-3" />
                        Current Participants
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-heading-3 text-heading-3 color-success">
                        {selectedRecord.max_participants || 20}
                      </div>
                      <div className="text-body-sm color-muted flex items-center justify-center gap-xs">
                        <Target className="h-3 w-3" />
                        Max Capacity
                      </div>
                    </div>
                  </div>

                  {/* Workshop Description */}
                  {selectedRecord.description && (
                    <div className="pt-md border-t">
                      <h4 className="form-label text-body-sm mb-sm flex items-center gap-sm">
                        <BookOpen className="h-icon-xs w-icon-xs" />
                        Workshop Description
                      </h4>
                      <p className="text-body-sm color-muted bg-secondary/50 p-sm rounded-lg">
                        {selectedRecord.description}
                      </p>
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="flex gap-sm pt-md border-t">
                    <Button>
                      <Users className="h-icon-xs w-icon-xs mr-sm" />
                      Manage Participants
                    </Button>
                    <Button>
                      <BookOpen className="h-icon-xs w-icon-xs mr-sm" />
                      Course Materials
                    </Button>
                    <Button>
                      <MapPin className="h-icon-xs w-icon-xs mr-sm" />
                      Room Assignment
                    </Button>
                  </div>
                </div>
              )}
            </Drawer>

            {/* Empty State */}
            {!loading && data.length === 0 && (
              <Card className="p-xl text-center">
                <BookOpen className="h-icon-2xl w-icon-2xl mx-auto mb-md color-muted" />
                <h3 className="text-body text-heading-4 mb-sm">No Workshops Yet</h3>
                <p className="color-muted mb-md">
                  Start creating educational workshops and training sessions for your events.
                </p>
                <Button onClick={handleCreateWorkshop}>
                  <Plus className="h-icon-xs w-icon-xs mr-sm" />
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
