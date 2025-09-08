'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@ghxstship/auth/client';
import { 
  DataGrid, 
  KanbanBoard, 
  CalendarView, 
  ListView,
  UniversalDrawer,
  Card,
  Badge,
  Button,
  ViewSwitcher,
  EmptyState
} from '@ghxstship/ui';
import { 
  Calendar,
  MapPin,
  Clock,
  Users,
  Plane,
  Car,
  Train,
  Ship,
  Plus,
  Filter,
  Search,
  Download
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { FieldConfig } from '@ghxstship/ui/types';

interface Itinerary {
  id: string;
  name: string;
  description?: string;
  type: 'travel' | 'daily' | 'event' | 'tour';
  status: 'draft' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  start_date: string;
  end_date: string;
  location?: string;
  transportation_type?: 'flight' | 'car' | 'train' | 'bus' | 'ship' | 'walking';
  total_cost?: number;
  currency?: string;
  participants_count?: number;
  project_id?: string;
  event_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  organization_id: string;
}

interface ItinerariesClientProps {
  orgId: string;
}

const ITINERARY_STATUSES = [
  { value: 'draft', label: 'Draft', color: 'gray' },
  { value: 'confirmed', label: 'Confirmed', color: 'blue' },
  { value: 'in_progress', label: 'In Progress', color: 'yellow' },
  { value: 'completed', label: 'Completed', color: 'green' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' }
] as const;

const ITINERARY_TYPES = [
  { value: 'travel', label: 'Travel', icon: Plane },
  { value: 'daily', label: 'Daily Schedule', icon: Calendar },
  { value: 'event', label: 'Event Schedule', icon: Users },
  { value: 'tour', label: 'Tour', icon: MapPin }
] as const;

const TRANSPORTATION_TYPES = [
  { value: 'flight', label: 'Flight', icon: Plane },
  { value: 'car', label: 'Car', icon: Car },
  { value: 'train', label: 'Train', icon: Train },
  { value: 'bus', label: 'Bus', icon: Car },
  { value: 'ship', label: 'Ship', icon: Ship },
  { value: 'walking', label: 'Walking', icon: MapPin }
] as const;

export default function ItinerariesClient({ orgId }: ItinerariesClientProps) {
  const t = useTranslations('programming');
  const supabase = createClient();
  
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [currentView, setCurrentView] = useState<'grid' | 'kanban' | 'calendar' | 'list'>('grid');
  
  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedItinerary, setSelectedItinerary] = useState<Itinerary | null>(null);
  const [drawerMode, setDrawerMode] = useState<'view' | 'create' | 'edit'>('view');

  // Load itineraries
  useEffect(() => {
    loadItineraries();
  }, [orgId]);

  const loadItineraries = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('programming_itineraries')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setItineraries(data || []);
    } catch (err) {
      console.error('Error loading itineraries:', err);
      setError(err instanceof Error ? err.message : 'Failed to load itineraries');
    } finally {
      setLoading(false);
    }
  };

  // Computed values
  const stats = useMemo(() => {
    const total = itineraries.length;
    const draft = itineraries.filter(i => i.status === 'draft').length;
    const confirmed = itineraries.filter(i => i.status === 'confirmed').length;
    const inProgress = itineraries.filter(i => i.status === 'in_progress').length;
    const completed = itineraries.filter(i => i.status === 'completed').length;

    return { total, draft, confirmed, inProgress, completed };
  }, [itineraries]);

  // Filter and search itineraries
  const filteredItineraries = useMemo(() => {
    return itineraries.filter(itinerary => {
      const matchesSearch = !searchTerm || 
        itinerary.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        itinerary.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        itinerary.location?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || itinerary.status === statusFilter;
      const matchesType = typeFilter === 'all' || itinerary.type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [itineraries, searchTerm, statusFilter, typeFilter]);

  // Field configuration for the drawer
  const fieldConfig: FieldConfig[] = [
    {
      key: 'name',
      label: 'Name',
      type: 'text',
      required: true,
      placeholder: 'Enter itinerary name'
    },
    {
      key: 'description',
      label: 'Description',
      type: 'textarea',
      placeholder: 'Enter itinerary description'
    },
    {
      key: 'type',
      label: 'Type',
      type: 'select',
      required: true,
      options: ITINERARY_TYPES.map(type => ({ value: type.value, label: type.label }))
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      options: ITINERARY_STATUSES.map(status => ({ value: status.value, label: status.label }))
    },
    {
      key: 'start_date',
      label: 'Start Date',
      type: 'datetime',
      required: true
    },
    {
      key: 'end_date',
      label: 'End Date',
      type: 'datetime',
      required: true
    },
    {
      key: 'location',
      label: 'Location',
      type: 'text',
      placeholder: 'Enter location'
    },
    {
      key: 'transportation_type',
      label: 'Transportation',
      type: 'select',
      options: TRANSPORTATION_TYPES.map(transport => ({ value: transport.value, label: transport.label }))
    },
    {
      key: 'total_cost',
      label: 'Total Cost',
      type: 'number',
      placeholder: '0.00'
    },
    {
      key: 'currency',
      label: 'Currency',
      type: 'select',
      options: [
        { value: 'USD', label: 'USD' },
        { value: 'EUR', label: 'EUR' },
        { value: 'GBP', label: 'GBP' },
        { value: 'CAD', label: 'CAD' }
      ]
    },
    {
      key: 'participants_count',
      label: 'Participants',
      type: 'number',
      placeholder: '0'
    }
  ];

  // Status computation
  const computeStatus = (itinerary: Itinerary) => {
    const now = new Date();
    const startDate = new Date(itinerary.start_date);
    const endDate = new Date(itinerary.end_date);

    if (itinerary.status === 'cancelled') return 'cancelled';
    if (itinerary.status === 'draft') return 'draft';
    if (now < startDate) return 'confirmed';
    if (now >= startDate && now <= endDate) return 'in_progress';
    if (now > endDate) return 'completed';
    
    return itinerary.status;
  };

  // Duration calculation
  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day';
    if (diffDays < 7) return `${diffDays} days`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks`;
    return `${Math.ceil(diffDays / 30)} months`;
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    const statusConfig = ITINERARY_STATUSES.find(s => s.value === status);
    return statusConfig?.color || 'gray';
  };

  // Get type icon
  const getTypeIcon = (type: string) => {
    const typeConfig = ITINERARY_TYPES.find(t => t.value === type);
    return typeConfig?.icon || Calendar;
  };

  // Get transportation icon
  const getTransportationIcon = (transportationType?: string) => {
    if (!transportationType) return MapPin;
    const transportConfig = TRANSPORTATION_TYPES.find(t => t.value === transportationType);
    return transportConfig?.icon || MapPin;
  };

  // Handle drawer actions
  const handleCreate = () => {
    setSelectedItinerary(null);
    setDrawerMode('create');
    setDrawerOpen(true);
  };

  const handleEdit = (itinerary: Itinerary) => {
    setSelectedItinerary(itinerary);
    setDrawerMode('edit');
    setDrawerOpen(true);
  };

  const handleView = (itinerary: Itinerary) => {
    setSelectedItinerary(itinerary);
    setDrawerMode('view');
    setDrawerOpen(true);
  };

  const handleSave = async (data: any) => {
    try {
      if (drawerMode === 'create') {
        const { error } = await supabase
          .from('programming_itineraries')
          .insert([{
            ...data,
            organization_id: orgId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);
        
        if (error) throw error;
      } else if (drawerMode === 'edit' && selectedItinerary) {
        const { error } = await supabase
          .from('programming_itineraries')
          .update({
            ...data,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedItinerary.id);
        
        if (error) throw error;
      }
      
      await loadItineraries();
      setDrawerOpen(false);
    } catch (err) {
      console.error('Error saving itinerary:', err);
      setError(err instanceof Error ? err.message : 'Failed to save itinerary');
    }
  };

  const handleDelete = async (itinerary: Itinerary) => {
    try {
      const { error } = await supabase
        .from('programming_itineraries')
        .delete()
        .eq('id', itinerary.id);
      
      if (error) throw error;
      
      await loadItineraries();
      setDrawerOpen(false);
    } catch (err) {
      console.error('Error deleting itinerary:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete itinerary');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={loadItineraries} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Calendar className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Itineraries</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Clock className="h-8 w-8 text-gray-600" />
            <div>
              <p className="text-2xl font-bold">{stats.draft}</p>
              <p className="text-sm text-muted-foreground">Draft</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <MapPin className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold">{stats.confirmed}</p>
              <p className="text-sm text-muted-foreground">Confirmed</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Plane className="h-8 w-8 text-yellow-600" />
            <div>
              <p className="text-2xl font-bold">{stats.inProgress}</p>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold">{stats.completed}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Search itineraries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          >
            <option value="all">All Statuses</option>
            {ITINERARY_STATUSES.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          >
            <option value="all">All Types</option>
            {ITINERARY_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <ViewSwitcher
            currentView={currentView}
            onViewChange={setCurrentView}
            availableViews={['grid', 'kanban', 'calendar', 'list']}
          />
          <Button onClick={handleCreate} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Itinerary
          </Button>
        </div>
      </div>

      {/* Data Views */}
      {filteredItineraries.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No itineraries found"
          description="Create your first itinerary to get started with travel and schedule management."
          action={{
            label: "Create Itinerary",
            onClick: handleCreate
          }}
        />
      ) : (
        <>
          {currentView === 'grid' && (
            <DataGrid
              data={filteredItineraries}
              columns={[
                {
                  key: 'name',
                  label: 'Name',
                  render: (itinerary: Itinerary) => (
                    <div className="flex items-center gap-3">
                      {(() => {
                        const TypeIcon = getTypeIcon(itinerary.type);
                        return <TypeIcon className="h-4 w-4 text-muted-foreground" />;
                      })()}
                      <div>
                        <p className="font-medium">{itinerary.name}</p>
                        {itinerary.description && (
                          <p className="text-sm text-muted-foreground truncate max-w-xs">
                            {itinerary.description}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                },
                {
                  key: 'type',
                  label: 'Type',
                  render: (itinerary: Itinerary) => {
                    const typeConfig = ITINERARY_TYPES.find(t => t.value === itinerary.type);
                    return (
                      <Badge variant="outline">
                        {typeConfig?.label || itinerary.type}
                      </Badge>
                    );
                  }
                },
                {
                  key: 'status',
                  label: 'Status',
                  render: (itinerary: Itinerary) => {
                    const status = computeStatus(itinerary);
                    const color = getStatusColor(status);
                    return (
                      <Badge variant={color as any}>
                        {ITINERARY_STATUSES.find(s => s.value === status)?.label || status}
                      </Badge>
                    );
                  }
                },
                {
                  key: 'dates',
                  label: 'Duration',
                  render: (itinerary: Itinerary) => (
                    <div>
                      <p className="text-sm">
                        {new Date(itinerary.start_date).toLocaleDateString()} - {new Date(itinerary.end_date).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {calculateDuration(itinerary.start_date, itinerary.end_date)}
                      </p>
                    </div>
                  )
                },
                {
                  key: 'location',
                  label: 'Location',
                  render: (itinerary: Itinerary) => (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{itinerary.location || 'Not specified'}</span>
                    </div>
                  )
                },
                {
                  key: 'transportation',
                  label: 'Transport',
                  render: (itinerary: Itinerary) => {
                    if (!itinerary.transportation_type) return <span className="text-muted-foreground">-</span>;
                    const TransportIcon = getTransportationIcon(itinerary.transportation_type);
                    const transportConfig = TRANSPORTATION_TYPES.find(t => t.value === itinerary.transportation_type);
                    return (
                      <div className="flex items-center gap-2">
                        <TransportIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{transportConfig?.label}</span>
                      </div>
                    );
                  }
                },
                {
                  key: 'cost',
                  label: 'Cost',
                  render: (itinerary: Itinerary) => (
                    <div className="text-right">
                      {itinerary.total_cost ? (
                        <p className="font-medium">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: itinerary.currency || 'USD'
                          }).format(itinerary.total_cost)}
                        </p>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </div>
                  )
                }
              ]}
              onRowClick={handleView}
              className="min-h-[400px]"
            />
          )}

          {currentView === 'kanban' && (
            <KanbanBoard
              data={filteredItineraries}
              groupBy="status"
              groups={ITINERARY_STATUSES.map(status => ({
                id: status.value,
                title: status.label,
                color: status.color
              }))}
              renderCard={(itinerary: Itinerary) => (
                <div 
                  className="p-4 bg-card border rounded-lg cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleView(itinerary)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium truncate">{itinerary.name}</h4>
                    {(() => {
                      const TypeIcon = getTypeIcon(itinerary.type);
                      return <TypeIcon className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-2" />;
                    })()}
                  </div>
                  
                  {itinerary.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {itinerary.description}
                    </p>
                  )}
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{calculateDuration(itinerary.start_date, itinerary.end_date)}</span>
                    </div>
                    
                    {itinerary.location && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{itinerary.location}</span>
                      </div>
                    )}
                    
                    {itinerary.participants_count && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span>{itinerary.participants_count} participants</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            />
          )}

          {currentView === 'calendar' && (
            <CalendarView
              events={filteredItineraries.map(itinerary => ({
                id: itinerary.id,
                title: itinerary.name,
                start: itinerary.start_date,
                end: itinerary.end_date,
                color: getStatusColor(computeStatus(itinerary)),
                data: itinerary
              }))}
              onEventClick={(event) => handleView(event.data)}
              onDateClick={(date) => {
                // Could pre-fill start date when creating new itinerary
                handleCreate();
              }}
            />
          )}

          {currentView === 'list' && (
            <ListView
              data={filteredItineraries}
              renderItem={(itinerary: Itinerary) => (
                <div 
                  className="p-4 border-b last:border-b-0 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleView(itinerary)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {(() => {
                        const TypeIcon = getTypeIcon(itinerary.type);
                        return <TypeIcon className="h-5 w-5 text-muted-foreground" />;
                      })()}
                      
                      <div>
                        <h4 className="font-medium">{itinerary.name}</h4>
                        {itinerary.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {itinerary.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>{new Date(itinerary.start_date).toLocaleDateString()} - {new Date(itinerary.end_date).toLocaleDateString()}</span>
                          {itinerary.location && (
                            <>
                              <span>•</span>
                              <span>{itinerary.location}</span>
                            </>
                          )}
                          {itinerary.participants_count && (
                            <>
                              <span>•</span>
                              <span>{itinerary.participants_count} participants</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {itinerary.total_cost && (
                        <span className="font-medium">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: itinerary.currency || 'USD'
                          }).format(itinerary.total_cost)}
                        </span>
                      )}
                      
                      <Badge variant={getStatusColor(computeStatus(itinerary)) as any}>
                        {ITINERARY_STATUSES.find(s => s.value === computeStatus(itinerary))?.label}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            />
          )}
        </>
      )}

      {/* Universal Drawer */}
      <UniversalDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedItinerary}
        fields={fieldConfig}
        mode={drawerMode}
        onModeChange={setDrawerMode}
        onSave={handleSave}
        onDelete={selectedItinerary ? () => handleDelete(selectedItinerary) : undefined}
        title={
          drawerMode === 'create' 
            ? 'Create Itinerary'
            : drawerMode === 'edit'
            ? 'Edit Itinerary'
            : 'Itinerary Details'
        }
        enableComments={true}
        enableActivity={true}
        enableFiles={true}
      />
    </div>
  );
}
