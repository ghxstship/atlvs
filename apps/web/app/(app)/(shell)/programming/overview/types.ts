// Programming Overview - Comprehensive Type Definitions

export interface ProgrammingOverviewStats {
  totalEvents: number;
  upcomingEvents: number;
  completedEvents: number;
  cancelledEvents: number;
  totalSpaces: number;
  availableSpaces: number;
  occupiedSpaces: number;
  totalWorkshops: number;
  activeWorkshops: number;
  completedWorkshops: number;
  totalRiders: number;
  pendingRiders: number;
  approvedRiders: number;
  totalPerformances: number;
  scheduledPerformances: number;
  completedPerformances: number;
  totalLineups: number;
  activeLineups: number;
  totalCallSheets: number;
  activeCallSheets: number;
  totalItineraries: number;
  activeItineraries: number;
  totalParticipants: number;
  totalRevenue: number;
  averageEventDuration: number;
  spaceUtilizationRate: number;
  workshopCompletionRate: number;
  riderApprovalRate: number;
}

export interface ActivityItem {
  id: string;
  type: 'event' | 'workshop' | 'performance' | 'rider' | 'space' | 'lineup' | 'call_sheet' | 'itinerary';
  action: 'created' | 'updated' | 'deleted' | 'approved' | 'cancelled' | 'completed';
  title: string;
  description?: string;
  user_name?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface EventSummary {
  id: string;
  title: string;
  kind: string;
  status: string;
  start_date: string;
  end_date?: string;
  location?: string;
  venue?: string;
  project?: {
    id: string;
    name: string;
  };
  participants_count?: number;
  spaces_count?: number;
}

export interface WorkshopSummary {
  id: string;
  title: string;
  category: string;
  status: string;
  start_date: string;
  instructor?: string;
  participants_count: number;
  max_participants?: number;
  price?: number;
}

export interface SpaceSummary {
  id: string;
  name: string;
  kind: string;
  status: string;
  capacity?: number;
  current_occupancy?: number;
  building?: string;
  floor?: string;
}

export interface PerformanceSummary {
  id: string;
  title: string;
  type: string;
  status: string;
  scheduled_at?: string;
  venue?: string;
  duration_minutes?: number;
  audience_capacity?: number;
}

export interface RiderSummary {
  id: string;
  title: string;
  kind: string;
  status: string;
  priority: string;
  event?: {
    id: string;
    title: string;
  };
  created_at: string;
}

export interface ModuleMetrics {
  events: {
    total: number;
    active: number;
    growth_rate: number;
    completion_rate: number;
  };
  workshops: {
    total: number;
    active: number;
    completion_rate: number;
    average_rating: number;
  };
  spaces: {
    total: number;
    utilization_rate: number;
    availability_rate: number;
    booking_rate: number;
  };
  performances: {
    total: number;
    scheduled: number;
    completion_rate: number;
    average_duration: number;
  };
  riders: {
    total: number;
    approval_rate: number;
    average_processing_time: number;
    fulfillment_rate: number;
  };
}

export interface TrendData {
  period: string;
  value: number;
  change?: number;
  change_percentage?: number;
}

export interface UtilizationData {
  resource: string;
  utilization: number;
  capacity: number;
  efficiency: number;
}

export interface MetricsData {
  metric: string;
  value: number;
  target?: number;
  trend: 'up' | 'down' | 'stable';
}

export interface UsageData {
  module: string;
  usage_count: number;
  active_users: number;
  growth_rate: number;
}

export interface OverviewAnalytics {
  eventTrends: TrendData[];
  workshopTrends: TrendData[];
  spaceTrends: TrendData[];
  performanceTrends: TrendData[];
  spaceUtilization: UtilizationData[];
  performanceMetrics: MetricsData[];
  moduleUsage: UsageData[];
  revenueAnalytics: {
    total_revenue: number;
    revenue_by_module: Array<{ module: string; revenue: number }>;
    revenue_trends: TrendData[];
  };
  participantAnalytics: {
    total_participants: number;
    participants_by_module: Array<{ module: string; count: number }>;
    engagement_metrics: MetricsData[];
  };
}

export interface ProgrammingOverviewData {
  stats: ProgrammingOverviewStats;
  recentActivity: ActivityItem[];
  upcomingEvents: EventSummary[];
  activeWorkshops: WorkshopSummary[];
  availableSpaces: SpaceSummary[];
  scheduledPerformances: PerformanceSummary[];
  pendingRiders: RiderSummary[];
  moduleMetrics: ModuleMetrics;
  analytics: OverviewAnalytics;
}

export interface OverviewFilters {
  date_from?: string;
  date_to?: string;
  module?: string;
  status?: string;
  project_id?: string;
  user_id?: string;
  search?: string;
}

export interface OverviewSort {
  field: keyof ProgrammingOverviewData;
  direction: 'asc' | 'desc';
}

export type ViewType = 'dashboard' | 'analytics' | 'timeline' | 'grid';

// Configuration objects for UI display
export const MODULE_CONFIG = {
  events: { label: 'Events', icon: '📅', color: 'bg-blue-100 text-blue-800' },
  workshops: { label: 'Workshops', icon: '🎓', color: 'bg-green-100 text-green-800' },
  spaces: { label: 'Spaces', icon: '🏢', color: 'bg-purple-100 text-purple-800' },
  performances: { label: 'Performances', icon: '🎭', color: 'bg-red-100 text-red-800' },
  riders: { label: 'Riders', icon: '📝', color: 'bg-yellow-100 text-yellow-800' },
  lineups: { label: 'Lineups', icon: '🎵', color: 'bg-pink-100 text-pink-800' },
  call_sheets: { label: 'Call Sheets', icon: '📋', color: 'bg-indigo-100 text-indigo-800' },
  itineraries: { label: 'Itineraries', icon: '🗺️', color: 'bg-teal-100 text-teal-800' },
  calendar: { label: 'Calendar', icon: '📆', color: 'bg-orange-100 text-orange-800' }
} as const;

export const ACTIVITY_CONFIG = {
  created: { label: 'Created', variant: 'success' as const, icon: '➕' },
  updated: { label: 'Updated', variant: 'info' as const, icon: '✏️' },
  deleted: { label: 'Deleted', variant: 'destructive' as const, icon: '🗑️' },
  approved: { label: 'Approved', variant: 'success' as const, icon: '✅' },
  cancelled: { label: 'Cancelled', variant: 'destructive' as const, icon: '❌' },
  completed: { label: 'Completed', variant: 'success' as const, icon: '🎉' }
} as const;

export const STATUS_CONFIG = {
  active: { label: 'Active', variant: 'success' as const },
  inactive: { label: 'Inactive', variant: 'secondary' as const },
  pending: { label: 'Pending', variant: 'warning' as const },
  completed: { label: 'Completed', variant: 'success' as const },
  cancelled: { label: 'Cancelled', variant: 'destructive' as const },
  draft: { label: 'Draft', variant: 'secondary' as const },
  published: { label: 'Published', variant: 'success' as const },
  archived: { label: 'Archived', variant: 'secondary' as const }
} as const;

export const VIEW_CONFIG = {
  dashboard: { label: 'Dashboard', icon: 'LayoutDashboard' },
  analytics: { label: 'Analytics', icon: 'BarChart3' },
  timeline: { label: 'Timeline', icon: 'Clock' },
  grid: { label: 'Grid', icon: 'Grid3X3' }
} as const;

// Quick action configurations
export const QUICK_ACTIONS = [
  {
    id: 'create_event',
    title: 'Create Event',
    description: 'Schedule a new performance, activation, or workshop',
    icon: 'CalendarPlus',
    href: '/programming/events',
    color: 'bg-blue-50 hover:bg-blue-100'
  },
  {
    id: 'manage_spaces',
    title: 'Manage Spaces',
    description: 'Configure rooms, green rooms, and meeting spaces',
    icon: 'Building',
    href: '/programming/spaces',
    color: 'bg-purple-50 hover:bg-purple-100'
  },
  {
    id: 'create_workshop',
    title: 'Create Workshop',
    description: 'Schedule educational sessions and training programs',
    icon: 'GraduationCap',
    href: '/programming/workshops',
    color: 'bg-green-50 hover:bg-green-100'
  },
  {
    id: 'build_lineup',
    title: 'Build Lineup',
    description: 'Organize performer schedules and stage assignments',
    icon: 'Users',
    href: '/programming/lineups',
    color: 'bg-pink-50 hover:bg-pink-100'
  },
  {
    id: 'create_call_sheet',
    title: 'Create Call Sheet',
    description: 'Generate daily production schedules',
    icon: 'FileText',
    href: '/programming/call-sheets',
    color: 'bg-indigo-50 hover:bg-indigo-100'
  },
  {
    id: 'manage_riders',
    title: 'Manage Riders',
    description: 'Handle technical and hospitality requirements',
    icon: 'ClipboardList',
    href: '/programming/riders',
    color: 'bg-yellow-50 hover:bg-yellow-100'
  },
] as const;

export function createEmptyProgrammingOverviewData(): ProgrammingOverviewData {
  return {
    stats: {
      totalEvents: 0,
      upcomingEvents: 0,
      completedEvents: 0,
      cancelledEvents: 0,
      totalSpaces: 0,
      availableSpaces: 0,
      occupiedSpaces: 0,
      totalWorkshops: 0,
      activeWorkshops: 0,
      completedWorkshops: 0,
      totalRiders: 0,
      pendingRiders: 0,
      approvedRiders: 0,
      totalPerformances: 0,
      scheduledPerformances: 0,
      completedPerformances: 0,
      totalLineups: 0,
      activeLineups: 0,
      totalCallSheets: 0,
      activeCallSheets: 0,
      totalItineraries: 0,
      activeItineraries: 0,
      totalParticipants: 0,
      totalRevenue: 0,
      averageEventDuration: 0,
      spaceUtilizationRate: 0,
      workshopCompletionRate: 0,
      riderApprovalRate: 0
    },
    recentActivity: [],
    upcomingEvents: [],
    activeWorkshops: [],
    availableSpaces: [],
    scheduledPerformances: [],
    pendingRiders: [],
    moduleMetrics: {
      events: { total: 0, active: 0, growth_rate: 0, completion_rate: 0 },
      workshops: { total: 0, active: 0, completion_rate: 0, average_rating: 0 },
      spaces: { total: 0, utilization_rate: 0, availability_rate: 0, booking_rate: 0 },
      performances: { total: 0, scheduled: 0, completion_rate: 0, average_duration: 0 },
      riders: { total: 0, approval_rate: 0, average_processing_time: 0, fulfillment_rate: 0 }
    },
    analytics: {
      eventTrends: [],
      workshopTrends: [],
      spaceTrends: [],
      performanceTrends: [],
      spaceUtilization: [],
      performanceMetrics: [],
      moduleUsage: [],
      revenueAnalytics: {
        total_revenue: 0,
        revenue_by_module: [],
        revenue_trends: []
      },
      participantAnalytics: {
        total_participants: 0,
        participants_by_module: [],
        engagement_metrics: []
      }
    }
  };
}
