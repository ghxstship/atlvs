/**
 * GHXSTSHIP Module Overview Configurations
 * Standardized configurations for all module overview pages
 */

import type { ModuleOverviewConfig } from '../types';

export const MODULE_CONFIGS: Record<string, ModuleOverviewConfig> = {
  // Dashboard Module
  dashboard: {
    module_name: 'dashboard',
    display_name: 'Dashboard',
    description: 'Enterprise command center with cross-module analytics, quick actions, and personalized insights.',
    icon: '🚀',
    color: 'blue',
    primary_metrics: [
      'total_dashboards',
      'shared_dashboards',
      'active_dashboards',
      'average_widgets'
    ],
    chart_types: ['bar', 'line', 'pie', 'area', 'radar'],
    default_widgets: [],
    quick_actions: [
      { label: 'Create Dashboard', action: 'create_dashboard', icon: '📊', href: '/analytics/dashboards/create' },
      { label: 'Launch Builder', action: 'launch_builder', icon: '🛠️', href: '/analytics/dashboards' },
      { label: 'Share Dashboard', action: 'share_dashboard', icon: '🔗', href: '/analytics/dashboards/shares' },
      { label: 'Explore Templates', action: 'explore_templates', icon: '🧩', href: '/analytics/dashboards/templates' }
    ]
  },

  // Analytics Module
  analytics: {
    module_name: 'analytics',
    display_name: 'Analytics',
    description: 'Comprehensive business intelligence with reports, dashboards, and data visualization.',
    icon: '📊',
    color: 'blue',
    primary_metrics: ['total_reports', 'active_dashboards', 'data_sources', 'monthly_insights'],
    chart_types: ['bar', 'line', 'pie', 'area'],
    default_widgets: [],
    quick_actions: [
      { label: 'New Report', action: 'create_report', icon: '📈', href: '/analytics/reports/create' },
      { label: 'Create Dashboard', action: 'create_dashboard', icon: '📊', href: '/analytics/dashboards/create' },
      { label: 'Export Data', action: 'export_data', icon: '💾', href: '/analytics/exports' },
      { label: 'Data Sources', action: 'manage_sources', icon: '🔗', href: '/analytics/sources' }
    ]
  },

  // Assets Module
  assets: {
    module_name: 'assets',
    display_name: 'Assets',
    description: 'Complete asset lifecycle management with inventory, maintenance, and tracking.',
    icon: '🏗️',
    color: 'orange',
    primary_metrics: ['total_assets', 'active_assets', 'maintenance_due', 'asset_utilization'],
    chart_types: ['bar', 'pie', 'line'],
    default_widgets: [],
    quick_actions: [
      { label: 'Add Asset', action: 'create_asset', icon: '➕', href: '/assets/inventory/create' },
      { label: 'Schedule Maintenance', action: 'schedule_maintenance', icon: '🔧', href: '/assets/maintenance/create' },
      { label: 'Asset Reports', action: 'view_reports', icon: '📋', href: '/assets/reports' },
      { label: 'Track Assets', action: 'track_assets', icon: '📍', href: '/assets/tracking' }
    ]
  },

  // Companies Module
  companies: {
    module_name: 'companies',
    display_name: 'Companies',
    description: 'Comprehensive company management with directory, contracts, and relationship tracking.',
    icon: '🏢',
    color: 'purple',
    primary_metrics: ['total_companies', 'active_contracts', 'qualified_vendors', 'partnership_score'],
    chart_types: ['bar', 'donut', 'line'],
    default_widgets: [],
    quick_actions: [
      { label: 'Add Company', action: 'create_company', icon: '🏢', href: '/companies/directory/create' },
      { label: 'New Contract', action: 'create_contract', icon: '📄', href: '/companies/contracts/create' },
      { label: 'Rate Company', action: 'rate_company', icon: '⭐', href: '/companies/ratings' },
      { label: 'View Directory', action: 'view_directory', icon: '📂', href: '/companies/directory' }
    ]
  },

  // Finance Module
  finance: {
    module_name: 'finance',
    display_name: 'Finance',
    description: 'Complete financial management with budgets, expenses, revenue tracking, and analytics.',
    icon: '💰',
    color: 'green',
    primary_metrics: ['total_budget', 'total_expenses', 'revenue', 'budget_utilization'],
    chart_types: ['bar', 'line', 'pie', 'area'],
    default_widgets: [],
    quick_actions: [
      { label: 'Create Budget', action: 'create_budget', icon: '💰', href: '/finance/budgets/create' },
      { label: 'Add Expense', action: 'create_expense', icon: '💸', href: '/finance/expenses/create' },
      { label: 'Record Revenue', action: 'create_revenue', icon: '💵', href: '/finance/revenue/create' },
      { label: 'Financial Reports', action: 'view_reports', icon: '📊', href: '/finance/reports' }
    ]
  },

  // Jobs Module
  jobs: {
    module_name: 'jobs',
    display_name: 'Jobs',
    description: 'Complete job lifecycle management with opportunities, bids, contracts, and assignments.',
    icon: '💼',
    color: 'indigo',
    primary_metrics: ['total_jobs', 'active_jobs', 'completion_rate', 'revenue_pipeline'],
    chart_types: ['bar', 'line', 'funnel'],
    default_widgets: [],
    quick_actions: [
      { label: 'Post Job', action: 'create_job', icon: '💼', href: '/jobs/create' },
      { label: 'Submit Bid', action: 'create_bid', icon: '💰', href: '/jobs/bids/create' },
      { label: 'Assign Task', action: 'create_assignment', icon: '👥', href: '/jobs/assignments/create' },
      { label: 'View Pipeline', action: 'view_pipeline', icon: '📈', href: '/jobs/opportunities' }
    ]
  },

  // People Module
  people: {
    module_name: 'people',
    display_name: 'People',
    description: 'Comprehensive people management with directory, roles, competencies, and networking.',
    icon: '👥',
    color: 'blue',
    primary_metrics: ['total_people', 'active_members', 'skill_coverage', 'endorsement_score'],
    chart_types: ['bar', 'donut', 'radar'],
    default_widgets: [],
    quick_actions: [
      { label: 'Add Person', action: 'create_person', icon: '👤', href: '/people/directory/create' },
      { label: 'Define Role', action: 'create_role', icon: '🎭', href: '/people/roles/create' },
      { label: 'Add Skill', action: 'create_competency', icon: '🎯', href: '/people/competencies/create' },
      { label: 'Give Endorsement', action: 'create_endorsement', icon: '⭐', href: '/people/endorsements/create' }
    ]
  },

  // Procurement Module
  procurement: {
    module_name: 'procurement',
    display_name: 'Procurement',
    description: 'Complete procurement management with orders, products, services, and vendor relationships.',
    icon: '🛒',
    color: 'teal',
    primary_metrics: ['total_orders', 'order_value', 'vendor_count', 'delivery_performance'],
    chart_types: ['bar', 'line', 'pie'],
    default_widgets: [],
    quick_actions: [
      { label: 'Create Order', action: 'create_order', icon: '🛒', href: '/procurement/orders/create' },
      { label: 'Add Product', action: 'create_product', icon: '📦', href: '/procurement/products/create' },
      { label: 'Add Service', action: 'create_service', icon: '🔧', href: '/procurement/services/create' },
      { label: 'Track Orders', action: 'track_orders', icon: '📍', href: '/procurement/tracking' }
    ]
  },

  // Programming Module
  programming: {
    module_name: 'programming',
    display_name: 'Programming',
    description: 'Event and production management with scheduling, lineups, performances, and logistics.',
    icon: '🎭',
    color: 'pink',
    primary_metrics: ['total_events', 'active_shows', 'venue_utilization', 'audience_satisfaction'],
    chart_types: ['bar', 'line', 'area'],
    default_widgets: [],
    quick_actions: [
      { label: 'Create Event', action: 'create_event', icon: '🎪', href: '/programming/events/create' },
      { label: 'Schedule Show', action: 'create_performance', icon: '🎭', href: '/programming/performances/create' },
      { label: 'Book Venue', action: 'book_space', icon: '🏛️', href: '/programming/spaces/create' },
      { label: 'Plan Workshop', action: 'create_workshop', icon: '🎓', href: '/programming/workshops/create' }
    ]
  },

  // Projects Module
  projects: {
    module_name: 'projects',
    display_name: 'Projects',
    description: 'Comprehensive project management with tasks, files, schedules, and team collaboration.',
    icon: '📁',
    color: 'blue',
    primary_metrics: ['total_projects', 'active_projects', 'completion_rate', 'team_utilization'],
    chart_types: ['bar', 'line', 'area'],
    default_widgets: [],
    quick_actions: [
      { label: 'New Project', action: 'create_project', icon: '📁', href: '/projects/create' },
      { label: 'Add Task', action: 'create_task', icon: '✅', href: '/projects/tasks/create' },
      { label: 'Upload File', action: 'upload_file', icon: '📎', href: '/projects/files/upload' },
      { label: 'Schedule Meeting', action: 'schedule_meeting', icon: '📅', href: '/projects/schedule/create' }
    ]
  },

  // Files Module
  files: {
    module_name: 'files',
    display_name: 'Files',
    description: 'Unified digital asset management with organization, sharing, and collaboration features.',
    icon: '📂',
    color: 'gray',
    primary_metrics: ['total_files', 'storage_used', 'shared_files', 'download_count'],
    chart_types: ['bar', 'pie', 'line'],
    default_widgets: [],
    quick_actions: [
      { label: 'Upload Files', action: 'upload_files', icon: '📤', href: '/files/upload' },
      { label: 'Create Folder', action: 'create_folder', icon: '📁', href: '/files/folders/create' },
      { label: 'Share Files', action: 'share_files', icon: '🔗', href: '/files/share' },
      { label: 'View Gallery', action: 'view_gallery', icon: '🖼️', href: '/files/gallery' }
    ]
  },

  // Settings Module
  settings: {
    module_name: 'settings',
    display_name: 'Settings',
    description: 'Organization settings, security, integrations, and system configuration.',
    icon: '⚙️',
    color: 'gray',
    primary_metrics: ['active_integrations', 'security_score', 'user_permissions', 'system_health'],
    chart_types: ['gauge', 'bar', 'pie'],
    default_widgets: [],
    quick_actions: [
      { label: 'Manage Users', action: 'manage_users', icon: '👥', href: '/settings/users' },
      { label: 'Security Settings', action: 'security_settings', icon: '🔒', href: '/settings/security' },
      { label: 'Integrations', action: 'manage_integrations', icon: '🔗', href: '/settings/integrations' },
      { label: 'Billing', action: 'manage_billing', icon: '💳', href: '/settings/billing' }
    ]
  },

  // Profile Module
  profile: {
    module_name: 'profile',
    display_name: 'Profile',
    description: 'Personal profile management with contact info, certifications, and performance tracking.',
    icon: '👤',
    color: 'blue',
    primary_metrics: ['profile_completion', 'certifications', 'endorsements', 'activity_score'],
    chart_types: ['bar', 'radar', 'pie'],
    default_widgets: [],
    quick_actions: [
      { label: 'Edit Profile', action: 'edit_profile', icon: '✏️', href: '/profile/basic' },
      { label: 'Add Certification', action: 'add_certification', icon: '🏆', href: '/profile/certifications/create' },
      { label: 'Update Contact', action: 'update_contact', icon: '📞', href: '/profile/contact' },
      { label: 'View Activity', action: 'view_activity', icon: '📊', href: '/profile/activity' }
    ]
  }
};

export function getModuleConfig(moduleName: string): ModuleOverviewConfig {
  return MODULE_CONFIGS[moduleName] || {
    module_name: moduleName,
    display_name: moduleName.charAt(0).toUpperCase() + moduleName.slice(1),
    description: `${moduleName} management and overview`,
    icon: '📋',
    color: 'gray',
    primary_metrics: [],
    chart_types: ['bar'],
    default_widgets: [],
    quick_actions: []
  };
}
