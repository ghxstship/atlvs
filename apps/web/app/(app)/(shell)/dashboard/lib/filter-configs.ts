import type { FilterConfig } from '@ghxstship/atlvs';
import type { DashboardListItem } from '../types';

export const dashboardFilters: FilterConfig<DashboardListItem>[] = [
  {
    key: 'type',
    label: 'Dashboard Type',
    type: 'select',
    options: [
      { label: 'All Types', value: '' },
      { label: 'System Dashboards', value: 'system' },
      { label: 'Custom Dashboards', value: 'custom' },
      { label: 'Templates', value: 'template' }
    ],
    defaultValue: ''
  },
  {
    key: 'layout',
    label: 'Layout Type',
    type: 'select',
    options: [
      { label: 'All Layouts', value: '' },
      { label: 'Grid Layout', value: 'grid' },
      { label: 'Masonry Layout', value: 'masonry' },
      { label: 'Flexible Layout', value: 'flex' },
      { label: 'Tabbed Layout', value: 'tabs' },
      { label: 'Accordion Layout', value: 'accordion' },
      { label: 'Sidebar Layout', value: 'sidebar' },
      { label: 'Fullscreen Layout', value: 'fullscreen' }
    ],
    defaultValue: ''
  },
  {
    key: 'access_level',
    label: 'Access Level',
    type: 'select',
    options: [
      { label: 'All Access Levels', value: '' },
      { label: 'Private', value: 'private' },
      { label: 'Team', value: 'team' },
      { label: 'Organization', value: 'organization' },
      { label: 'Public', value: 'public' }
    ],
    defaultValue: ''
  },
  {
    key: 'is_default',
    label: 'Default Dashboard',
    type: 'select',
    options: [
      { label: 'All Dashboards', value: '' },
      { label: 'Default Only', value: 'true' },
      { label: 'Non-Default Only', value: 'false' }
    ],
    defaultValue: ''
  },
  {
    key: 'is_public',
    label: 'Public Access',
    type: 'select',
    options: [
      { label: 'All Dashboards', value: '' },
      { label: 'Public Only', value: 'true' },
      { label: 'Private Only', value: 'false' }
    ],
    defaultValue: ''
  },
  {
    key: 'widget_count',
    label: 'Widget Count',
    type: 'range',
    min: 0,
    max: 50,
    step: 1,
    defaultValue: [0, 50]
  },
  {
    key: 'share_count',
    label: 'Share Count',
    type: 'range',
    min: 0,
    max: 100,
    step: 1,
    defaultValue: [0, 100]
  },
  {
    key: 'created_at',
    label: 'Created Date',
    type: 'date_range',
    defaultValue: {
      from: undefined,
      to: undefined
    }
  },
  {
    key: 'updated_at',
    label: 'Last Updated',
    type: 'date_range',
    defaultValue: {
      from: undefined,
      to: undefined
    }
  },
  {
    key: 'tags',
    label: 'Tags',
    type: 'multi_select',
    options: [
      { label: 'Executive', value: 'executive' },
      { label: 'Finance', value: 'finance' },
      { label: 'Operations', value: 'operations' },
      { label: 'Marketing', value: 'marketing' },
      { label: 'Sales', value: 'sales' },
      { label: 'HR', value: 'hr' },
      { label: 'IT', value: 'it' },
      { label: 'Analytics', value: 'analytics' },
      { label: 'Performance', value: 'performance' },
      { label: 'Quarterly', value: 'quarterly' },
      { label: 'Monthly', value: 'monthly' },
      { label: 'Weekly', value: 'weekly' },
      { label: 'Real-time', value: 'real-time' }
    ],
    defaultValue: []
  },
  {
    key: 'search',
    label: 'Search',
    type: 'text',
    placeholder: 'Search dashboards by name, description, or tags...',
    defaultValue: ''
  }
];

export const dashboardQuickFilters = [
  {
    label: 'My Dashboards',
    filters: {
      created_by: 'current_user'
    }
  },
  {
    label: 'Default Dashboards',
    filters: {
      is_default: true
    }
  },
  {
    label: 'Public Dashboards',
    filters: {
      is_public: true
    }
  },
  {
    label: 'System Dashboards',
    filters: {
      type: 'system'
    }
  },
  {
    label: 'Custom Dashboards',
    filters: {
      type: 'custom'
    }
  },
  {
    label: 'Templates',
    filters: {
      type: 'template'
    }
  },
  {
    label: 'Recently Created',
    filters: {
      created_at: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    }
  },
  {
    label: 'Recently Updated',
    filters: {
      updated_at: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    }
  }
];
