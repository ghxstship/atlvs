'use client';

import { useEffect, useState } from 'react';
import { 
  Button,
  Card,
  Badge
} from '@ghxstship/ui';
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
        return 'bg-blue-500';
      case 'activation':
        return 'bg-green-500';
      case 'workshop':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'text-blue-600 bg-blue-50';
      case 'in_progress':
        return 'text-green-600 bg-green-50';
      case 'completed':
        return 'text-gray-600 bg-gray-50';
      case 'cancelled':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-yellow-600 bg-yellow-50';
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-semibold min-w-[200px] text-center">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
          >
            Today
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </div>
      </div>

      {/* Event Type Legend */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span>Performance</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span>Activation</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-500"></div>
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
              className="p-3 text-center text-sm font-medium text-muted-foreground border-b border-r last:border-r-0"
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
                className={`min-h-[120px] p-2 border-b border-r last:border-r-0 ${
                  date ? 'bg-background hover:bg-muted/50' : 'bg-muted/20'
                } ${isToday ? 'bg-blue-50 dark:bg-blue-950/20' : ''}`}
              >
                {date && (
                  <>
                    <div className={`text-sm font-medium mb-2 ${
                      isToday ? 'text-blue-600 font-bold' : 'text-foreground'
                    }`}>
                      {date.getDate()}
                    </div>
                    
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map(event => (
                        <div
                          key={event.id}
                          className="text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity"
                          style={{ backgroundColor: `${getEventTypeColor(event.kind)}20` }}
                        >
                          <div className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${getEventTypeColor(event.kind)}`}></div>
                            <span className="truncate font-medium">{event.name}</span>
                          </div>
                          <div className="text-muted-foreground mt-1 flex items-center gap-1">
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
                        <div className="text-xs text-muted-foreground p-1">
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
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Upcoming Events This Month</h3>
          
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading events...
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No events scheduled for this month</p>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Event
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {events.slice(0, 5).map(event => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getEventTypeColor(event.kind)}`}></div>
                    <div>
                      <div className="font-medium">{event.name}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(event.starts_at).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(event.starts_at).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.project_name}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className={getStatusColor(event.status)}>
                      {event.status.replace('_', ' ')}
                    </Badge>
                    <Badge variant="outline">
                      {event.kind}
                    </Badge>
                  </div>
                </div>
              ))}
              
              {events.length > 5 && (
                <div className="text-center pt-4">
                  <Button size="sm">
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
