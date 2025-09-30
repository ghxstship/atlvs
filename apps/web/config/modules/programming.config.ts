import { z } from 'zod';
import { 
  Calendar,
  Users,
  MapPin,
  Music,
  GraduationCap,
  Star,
  Clock,
  FileText,
  Settings,
  Plus,
  BarChart3
} from 'lucide-react';
import type { ModuleConfig } from '@ghxstship/ui/config/types';

const EventSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  title: z.string().min(1, 'Event title is required'),
  description: z.string().optional(),
  type: z.enum(['performance', 'workshop', 'rehearsal', 'meeting', 'other']),
  status: z.enum(['scheduled', 'in-progress', 'completed', 'cancelled']).default('scheduled'),
  start_date: z.date(),
  end_date: z.date(),
  location: z.string().optional(),
  capacity: z.number().int().positive().optional(),
  created_at: z.date(),
  updated_at: z.date(),
});

const PerformanceSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  title: z.string().min(1, 'Performance title is required'),
  description: z.string().optional(),
  venue: z.string().optional(),
  date: z.date(),
  duration: z.number().positive().optional(),
  status: z.enum(['planned', 'rehearsing', 'ready', 'performed', 'cancelled']).default('planned'),
  created_at: z.date(),
  updated_at: z.date(),
});

export const programmingModuleConfig: ModuleConfig = {
  id: 'programming',
  name: 'Programming',
  description: 'Event programming, performances, and schedule management',
  icon: Calendar,
  color: 'indigo',
  path: '/programming',
  
  entities: {
    events: {
      table: 'programming_events',
      singular: 'Event',
      plural: 'Events',
      schema: EventSchema,
      searchFields: ['title', 'description', 'location'],
      orderBy: 'start_date.asc',
      
      fields: [
        { key: 'title', label: 'Event Title', type: 'text', required: true, group: 'basic' },
        { key: 'description', label: 'Description', type: 'textarea', rows: 3, group: 'basic' },
        { key: 'type', label: 'Event Type', type: 'select', required: true,
          options: [
            { label: 'Performance', value: 'performance' },
            { label: 'Workshop', value: 'workshop' },
            { label: 'Rehearsal', value: 'rehearsal' },
            { label: 'Meeting', value: 'meeting' },
            { label: 'Other', value: 'other' }
          ], group: 'details' },
        { key: 'status', label: 'Status', type: 'select', defaultValue: 'scheduled',
          options: [
            { label: 'Scheduled', value: 'scheduled' },
            { label: 'In Progress', value: 'in-progress' },
            { label: 'Completed', value: 'completed' },
            { label: 'Cancelled', value: 'cancelled' }
          ], group: 'status' },
        { key: 'start_date', label: 'Start Date', type: 'datetime', required: true, group: 'schedule' },
        { key: 'end_date', label: 'End Date', type: 'datetime', required: true, group: 'schedule' },
        { key: 'location', label: 'Location', type: 'text', group: 'logistics' },
        { key: 'capacity', label: 'Capacity', type: 'number', min: 1, group: 'logistics' }
      ],
      
      drawerLayout: 'tabs',
      drawerSize: 'lg',
      defaultViews: ['calendar', 'list', 'timeline'],
      
      emptyState: {
        title: 'No events scheduled',
        description: 'Create your first programming event',
        action: { label: 'Create Event', icon: Plus }
      }
    },
    
    performances: {
      table: 'performances',
      singular: 'Performance',
      plural: 'Performances',
      schema: PerformanceSchema,
      searchFields: ['title', 'description', 'venue'],
      orderBy: 'date.asc',
      
      fields: [
        { key: 'title', label: 'Performance Title', type: 'text', required: true, group: 'basic' },
        { key: 'description', label: 'Description', type: 'textarea', rows: 3, group: 'basic' },
        { key: 'venue', label: 'Venue', type: 'text', group: 'logistics' },
        { key: 'date', label: 'Performance Date', type: 'datetime', required: true, group: 'schedule' },
        { key: 'duration', label: 'Duration (minutes)', type: 'number', min: 1, group: 'schedule' },
        { key: 'status', label: 'Status', type: 'select', defaultValue: 'planned',
          options: [
            { label: 'Planned', value: 'planned' },
            { label: 'Rehearsing', value: 'rehearsing' },
            { label: 'Ready', value: 'ready' },
            { label: 'Performed', value: 'performed' },
            { label: 'Cancelled', value: 'cancelled' }
          ], group: 'status' }
      ],
      
      drawerLayout: 'single',
      drawerSize: 'md',
      defaultViews: ['list', 'calendar'],
      
      emptyState: {
        title: 'No performances scheduled',
        description: 'Schedule your first performance',
        action: { label: 'Create Performance', icon: Plus }
      }
    }
  },
  
  tabs: [
    {
      id: 'overview',
      label: 'Overview',
      icon: BarChart3,
      type: 'overview',
      config: {
        widgets: [
          { type: 'metric', title: 'Total Events', metric: 'total_events' },
          { type: 'metric', title: 'Upcoming Events', metric: 'upcoming_events' },
          { type: 'metric', title: 'Performances', metric: 'total_performances' },
          { type: 'metric', title: 'This Month', metric: 'events_this_month' }
        ]
      }
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: Calendar,
      entity: 'events',
      views: ['calendar']
    },
    {
      id: 'events',
      label: 'Events',
      icon: Calendar,
      entity: 'events',
      views: ['list', 'timeline']
    },
    {
      id: 'performances',
      label: 'Performances',
      icon: Music,
      entity: 'performances',
      views: ['list', 'calendar']
    }
  ],
  
  defaultTab: 'overview',
  
  headerActions: [
    {
      id: 'create-event',
      label: 'New Event',
      icon: Plus,
      variant: 'default',
      onClick: () => console.log('Create event')
    }
  ],
  
  features: {
    search: true,
    filters: true,
    sort: true,
    export: true,
    import: false,
    bulkActions: true,
    realtime: true,
    audit: true,
    versioning: false,
    notifications: true,
    calendar: true
  },
  
  permissions: {
    view: ['owner', 'admin', 'manager', 'member', 'viewer'],
    create: ['owner', 'admin', 'manager', 'member'],
    update: ['owner', 'admin', 'manager', 'member'],
    delete: ['owner', 'admin', 'manager']
  }
};

export default programmingModuleConfig;
