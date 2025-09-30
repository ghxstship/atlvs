// Profile Activity Module - Type Definitions

export interface ActivityRecord {
  id: string;
  user_id: string;
  organization_id: string;
  activity_type: ActivityType;
  activity_description: string;
  metadata?: Record<string, unknown>;
  performed_by: string;
  performed_by_name?: string;
  created_at: string;
}

export type ActivityType = 
  | 'profile_updated'
  | 'certification_added'
  | 'certification_expired'
  | 'job_history_added'
  | 'emergency_contact_updated'
  | 'health_record_updated'
  | 'travel_info_updated'
  | 'uniform_sizing_updated'
  | 'performance_review_completed'
  | 'endorsement_received'
  | 'profile_created'
  | 'profile_viewed';

export interface ActivityFilters {
  activity_type?: ActivityType | 'all';
  date_from?: string;
  date_to?: string;
  performed_by?: string;
  search?: string;
}

export interface ActivitySort {
  field: keyof ActivityRecord;
  direction: 'asc' | 'desc';
}

export type ViewType = 'list' | 'timeline' | 'calendar' | 'analytics';

export interface ActivityStats {
  totalActivities: number;
  todayActivities: number;
  weekActivities: number;
  monthActivities: number;
  topActivityTypes: Array<{
    type: ActivityType;
    count: number;
    percentage: number;
  }>;
  activityTrends: Array<{
    date: string;
    count: number;
  }>;
  userEngagement: {
    profileUpdates: number;
    certificationsAdded: number;
    reviewsCompleted: number;
    lastActivity: string;
  };
}

export interface ActivityAnalytics {
  dailyActivity: Array<{
    date: string;
    count: number;
    types: Record<ActivityType, number>;
  }>;
  typeDistribution: Array<{
    type: ActivityType;
    count: number;
    percentage: number;
  }>;
  userActivity: Array<{
    user_id: string;
    user_name: string;
    activity_count: number;
    last_activity: string;
  }>;
  timePatterns: Array<{
    hour: number;
    count: number;
  }>;
}

// Configuration objects for UI display
export const ACTIVITY_TYPE_CONFIG = {
  profile_updated: { 
    label: 'Profile Updated', 
    icon: 'Edit', 
    color: 'bg-blue-100 text-blue-800',
    description: 'User profile information was modified'
  },
  profile_created: { 
    label: 'Profile Created', 
    icon: 'User', 
    color: 'bg-green-100 text-green-800',
    description: 'New user profile was created'
  },
  profile_viewed: { 
    label: 'Profile Viewed', 
    icon: 'Eye', 
    color: 'bg-gray-100 text-gray-800',
    description: 'User profile was accessed'
  },
  certification_added: { 
    label: 'Certification Added', 
    icon: 'Award', 
    color: 'bg-purple-100 text-purple-800',
    description: 'New certification was added to profile'
  },
  certification_expired: { 
    label: 'Certification Expired', 
    icon: 'AlertTriangle', 
    color: 'bg-red-100 text-red-800',
    description: 'Certification has expired'
  },
  job_history_added: { 
    label: 'Job History Added', 
    icon: 'Briefcase', 
    color: 'bg-indigo-100 text-indigo-800',
    description: 'Work experience was added to profile'
  },
  emergency_contact_updated: { 
    label: 'Emergency Contact Updated', 
    icon: 'Phone', 
    color: 'bg-orange-100 text-orange-800',
    description: 'Emergency contact information was modified'
  },
  health_record_updated: { 
    label: 'Health Record Updated', 
    icon: 'Heart', 
    color: 'bg-pink-100 text-pink-800',
    description: 'Health information was updated'
  },
  travel_info_updated: { 
    label: 'Travel Info Updated', 
    icon: 'Plane', 
    color: 'bg-cyan-100 text-cyan-800',
    description: 'Travel preferences and documents were updated'
  },
  uniform_sizing_updated: { 
    label: 'Uniform Sizing Updated', 
    icon: 'Shirt', 
    color: 'bg-teal-100 text-teal-800',
    description: 'Uniform and equipment sizing was updated'
  },
  performance_review_completed: { 
    label: 'Performance Review Completed', 
    icon: 'Star', 
    color: 'bg-yellow-100 text-yellow-800',
    description: 'Performance review was completed'
  },
  endorsement_received: { 
    label: 'Endorsement Received', 
    icon: 'ThumbsUp', 
    color: 'bg-emerald-100 text-emerald-800',
    description: 'Professional endorsement was received'
  },
} as const;

export const VIEW_CONFIG = {
  list: { label: 'List', icon: 'List' },
  timeline: { label: 'Timeline', icon: 'Clock' },
  calendar: { label: 'Calendar', icon: 'Calendar' },
  analytics: { label: 'Analytics', icon: 'BarChart3' },
} as const;

export const QUICK_FILTERS = [
  { label: 'All Activities', value: 'all' },
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'Profile Updates', value: 'profile_updated' },
  { label: 'Certifications', value: 'certification_added' },
  { label: 'Reviews', value: 'performance_review_completed' },
] as const;

export function createEmptyActivityStats(): ActivityStats {
  return {
    totalActivities: 0,
    todayActivities: 0,
    weekActivities: 0,
    monthActivities: 0,
    topActivityTypes: [],
    activityTrends: [],
    userEngagement: {
      profileUpdates: 0,
      certificationsAdded: 0,
      reviewsCompleted: 0,
      lastActivity: '',
    },
  };
}

export function createEmptyActivityAnalytics(): ActivityAnalytics {
  return {
    dailyActivity: [],
    typeDistribution: [],
    userActivity: [],
    timePatterns: [],
  };
}
