'use client';


import { useEffect, useState } from 'react';
import { Button, Card, Badge } from '@ghxstship/ui';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  MapPin,
  Users,
  Filter
} from 'lucide-react';

interface Event {
  id: string;
  name: string;
  kind: 'performance' | 'activation' | 'workshop';
  starts_at: string;
  ends_at: string;
  project_name: string;
  status: string;
}

export default function CalendarClient({ orgId }: { orgId: string }) {
  const t = useTranslations('programming');
  const sb = createBrowserClient();
  
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  useEffect(() => {
    loadEvents();
  }, [orgId, currentDate]);

  const loadEvents = async () => {
    if (!orgId) return;
    
    try {
      setLoading(true);
      
      // Get start and end of current month for filtering
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const { data: eventsData, error } = await sb
        .from('events')
        .select(`
          *,
          projects!inner(
            name,
            organization_id
          )
        `)
        .eq('projects.organization_id', orgId)
        .gte('starts_at', startOfMonth.toISOString())
        .lte('starts_at', endOfMonth.toISOString())
        .order('starts_at', { ascending: true });
      
      if (error) throw error;
      
      const transformedEvents = (eventsData || []).map(event => ({
        ...event,
        project_name: event.projects?.name || 'Unknown Project',
        status: computeEventStatus(event)
      }));
      
      setEvents(transformedEvents);
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

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getEventsForDate = (date: Date | null) => {
    if (!date) return [];
    
    return events.filter(event => {
      const eventDate = new Date(event.starts_at);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const getEventTypeColor = (kind: string) => {
    switch (kind) {
      case 'performance':
        return 'bg-primary';
      case 'activation':
        return 'bg-success';
      case 'workshop':
        return 'bg-secondary';
      default:
        return 'bg-secondary-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'color-primary bg-primary/10';
      case 'in_progress':
        return 'color-success bg-success/10';
      case 'completed':
        return 'color-muted bg-secondary/50';
      case 'cancelled':
        return 'color-destructive bg-destructive/10';
      default:
        return 'color-warning bg-warning/10';
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="stack-lg">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-md">
          <div className="flex items-center gap-sm">
            <Button
              variant="outline"
             
              onClick={() => navigateMonth('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-heading-4 text-heading-4 min-w-[200px] text-center">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <Button
              variant="outline"
             
              onClick={() => navigateMonth('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <Button
            variant="outline"
           
            onClick={() => setCurrentDate(new Date())}
          >
            Today
          </Button>
        </div>

        <div className="flex items-center gap-sm">
          <Button>
            <Filter className="h-4 w-4 mr-sm" />
            Filter
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-sm" />
            Create Event
          </Button>
        </div>
      </div>

      {/* Event Type Legend */}
      <div className="flex items-center gap-md text-body-sm">
        <div className="flex items-center gap-sm">
          <div className="w-3 h-3 rounded-full bg-primary"></div>
          <span>Performance</span>
        </div>
        <div className="flex items-center gap-sm">
          <div className="w-3 h-3 rounded-full bg-success"></div>
          <span>Activation</span>
        </div>
        <div className="flex items-center gap-sm">
          <div className="w-3 h-3 rounded-full bg-secondary"></div>
          <span>Workshop</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card className="p-0">
        <div className="grid grid-cols-7 gap-0">
          {/* Week day headers */}
          {weekDays.map(day => (
            <div
              key={day}
              className="p-sm text-center text-body-sm form-label color-muted border-b border-r last:border-r-0"
            >
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {getDaysInMonth().map((date, index) => {
            const dayEvents = getEventsForDate(date);
            const isToday = date && date.toDateString() === new Date().toDateString();
            
            return (
              <div
                key={index}
                className={`min-h-[120px] p-sm border-b border-r last:border-r-0 ${
                  date ? 'bg-background hover:bg-secondary/50' : 'bg-secondary/20'
                } ${isToday ? 'bg-primary/10' : ''}`}
              >
                {date && (
                  <>
                    <div className={`text-body-sm form-label mb-sm ${
                      isToday ? 'color-primary text-heading-3' : 'color-foreground'
                    }`}>
                      {date.getDate()}
                    </div>
                    
                    <div className="stack-md">
                      {dayEvents.slice(0, 3).map(event => (
                        <div
                          key={event.id}
                          className="text-body-sm p-xs rounded cursor-pointer hover:opacity-80 transition-opacity"
                          style={{ backgroundColor: `${getEventTypeColor(event.kind)}20` }}
                        >
                          <div className="flex items-center gap-xs">
                            <div className={`w-2 h-2 rounded-full ${getEventTypeColor(event.kind)}`}></div>
                            <span className="truncate form-label">{event.name}</span>
                          </div>
                          <div className="color-muted mt-xs flex items-center gap-xs">
                            <Clock className="h-3 w-3" />
                            <span>
                              {new Date(event.starts_at).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                        </div>
                      ))}
                      
                      {dayEvents.length > 3 && (
                        <div className="text-body-sm color-muted p-xs">
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Upcoming Events List */}
      <Card>
        <div className="p-lg">
          <h3 className="text-body text-heading-4 mb-md">Upcoming Events This Month</h3>
          
          {loading ? (
            <div className="text-center py-xl color-muted">
              Loading events...
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-xl color-muted">
              <Calendar className="h-12 w-12 mx-auto mb-md opacity-50" />
              <p>No events scheduled for this month</p>
              <Button>
                <Plus className="h-4 w-4 mr-sm" />
                Create Your First Event
              </Button>
            </div>
          ) : (
            <div className="stack-sm">
              {events.slice(0, 5).map(event => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-sm rounded-lg border hover:bg-secondary/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-sm">
                    <div className={`w-3 h-3 rounded-full ${getEventTypeColor(event.kind)}`}></div>
                    <div>
                      <div className="form-label">{event.name}</div>
                      <div className="text-body-sm color-muted flex items-center gap-md">
                        <span className="flex items-center gap-xs">
                          <Calendar className="h-3 w-3" />
                          {new Date(event.starts_at).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-xs">
                          <Clock className="h-3 w-3" />
                          {new Date(event.starts_at).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                        <span className="flex items-center gap-xs">
                          <MapPin className="h-3 w-3" />
                          {event.project_name}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-sm">
                    <Badge variant="outline">
                      {event.status.replace('_', ' ')}
                    </Badge>
                    <Badge variant="outline">
                      {event.kind}
                    </Badge>
                  </div>
                </div>
              ))}
              
              {events.length > 5 && (
                <div className="text-center pt-md">
                  <Button>
                    View All {events.length} Events
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
