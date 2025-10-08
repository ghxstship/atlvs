import { z } from 'zod';
import { 
  User,
  Settings,
  Shield,
  Bell,
  Activity,
  Award,
  Heart,
  Briefcase,
  MapPin,
  Shirt,
  Plane,
  AlertTriangle,
  Plus,
  BarChart3
} from 'lucide-react';
import type { ModuleConfig } from '@ghxstship/ui';

import EmergencyClient, { EmergencyTabComponent } from '../../app/(app)/(shell)/profile/emergency/EmergencyClient';
import EndorsementsClient, { EndorsementsTabComponent } from '../../app/(app)/(shell)/profile/endorsements/EndorsementsClient';
import HealthClient, { HealthTabComponent } from '../../app/(app)/(shell)/profile/health/HealthClient';
import PerformanceClient, { PerformanceTabComponent } from '../../app/(app)/(shell)/profile/performance/PerformanceClient';
import TravelClient, { TravelTabComponent } from '../../app/(app)/(shell)/profile/travel/TravelClient';
import UniformClient, { UniformTabComponent } from '../../app/(app)/(shell)/profile/uniform/UniformClient';

const ProfileSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  avatar_url: z.string().url().optional(),
  location: z.string().optional(),
  timezone: z.string().optional(),
  created_at: z.date(),
  updated_at: z.date()
});

const ActivityLogSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  action: z.string().min(1, 'Action is required'),
  description: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  created_at: z.date()
});

export const profileModuleConfig: ModuleConfig = {
  id: 'profile',
  name: 'Profile',
  description: 'User profile management and personal settings',
  icon: User,
  color: 'blue',
  path: '/profile',
  
  entities: {
    profile: {
      table: 'user_profiles',
      singular: 'Profile',
      plural: 'Profiles',
      schema: ProfileSchema,
      searchFields: ['first_name', 'last_name', 'email'],
      orderBy: 'updated_at.desc',
      
      fields: [
        { key: 'first_name', label: 'First Name', type: 'text', required: true, group: 'basic' },
        { key: 'last_name', label: 'Last Name', type: 'text', required: true, group: 'basic' },
        { key: 'email', label: 'Email', type: 'email', required: true, group: 'contact' },
        { key: 'phone', label: 'Phone', type: 'text', group: 'contact' },
        { key: 'bio', label: 'Bio', type: 'textarea', rows: 4, group: 'about' },
        { key: 'location', label: 'Location', type: 'text', group: 'about' },
        { key: 'timezone', label: 'Timezone', type: 'select', options: ['UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London'], group: 'preferences' }
      ],
      
      drawerLayout: 'tabs',
      drawerSize: 'lg',
      defaultViews: ['list'],
      
      emptyState: {
        title: 'Profile not set up',
        description: 'Complete your profile to get started',
        action: { label: 'Update Profile', onClick: () => console.log('Update profile') }
      }
    },
    
    activity: {
      table: 'user_activity_logs',
      singular: 'Activity',
      plural: 'Activity Log',
      schema: ActivityLogSchema,
      searchFields: ['action', 'description'],
      orderBy: 'created_at.desc',
      
      fields: [
        { key: 'action', label: 'Action', type: 'text', required: true, group: 'basic' },
        { key: 'description', label: 'Description', type: 'textarea', rows: 3, group: 'basic' }
      ],
      
      drawerLayout: 'single',
      drawerSize: 'md',
      defaultViews: ['list'],
      
      emptyState: {
        title: 'No activity yet',
        description: 'Your activity will appear here',
        action: { label: 'View Dashboard', onClick: () => console.log('View dashboard') }
      }
    }
  },
  
  tabs: [
    {
      id: 'overview',
      label: 'Overview',
      icon: User,
      type: 'overview',
      config: {
        widgets: [
          { id: 'profile_completion', type: 'metric', title: 'Profile Completion', metric: 'profile_completion' },
          { id: 'recent_activities', type: 'metric', title: 'Recent Activities', metric: 'recent_activities' },
          { id: 'activity_list', type: 'list', title: 'Recent Activity', entity: 'activity', limit: 10 }
        ]
      }
    },
    {
      id: 'activity',
      label: 'Activity',
      icon: Activity,
      entity: 'activity',
      views: ['list']
    },
    {
      id: 'emergency',
      label: 'Emergency',
      icon: AlertTriangle,
      type: 'custom',
      component: EmergencyTabComponent
    },
    {
      id: 'endorsements',
      label: 'Endorsements',
      icon: Award,
      type: 'custom',
      component: EndorsementsTabComponent
    },
    {
      id: 'health',
      label: 'Health',
      icon: Heart,
      type: 'custom',
      component: HealthTabComponent
    },
    {
      id: 'performance',
      label: 'Performance',
      icon: BarChart3,
      type: 'custom',
      component: PerformanceTabComponent
    },
    {
      id: 'travel',
      label: 'Travel',
      icon: Plane,
      type: 'custom',
      component: TravelTabComponent
    },
    {
      id: 'uniform',
      label: 'Uniform',
      icon: Shirt,
      type: 'custom',
      component: UniformTabComponent
    }
  ],
  
  defaultTab: 'overview',
  
  headerActions: [
    {
      id: 'edit-profile',
      label: 'Edit Profile',
      icon: Settings,
      variant: 'default',
      onClick: () => console.log('Edit profile')
    }
  ],
  
  features: {
    search: true,
    filters: false,
    sort: true,
    export: false,
    import: false,
    bulkActions: false,
    realtime: true,
    audit: true,
    versioning: false,
    notifications: true
  },
  
  permissions: {
    view: ['owner'],
    create: ['owner'],
    update: ['owner'],
    delete: ['owner']
  }
};

export default profileModuleConfig;
