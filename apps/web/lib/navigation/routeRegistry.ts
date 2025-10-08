import { Home, Briefcase, Users, Code, Layers, ShoppingCart, Building, DollarSign, BarChart3, BookOpen, Settings, User, Package, Shield } from 'lucide-react';

export type RouteNode = {
  id: string;
  label: string; // i18n key-friendly label
  path?: string; // absolute path when this node is directly navigable
  icon?: any; // lucide icon for top-level only
  featureFlag?: 'atlvs' | 'opendeck' | 'ghxstship' | null; // optional entitlement gate
  children?: RouteNode[];
};

// Centralized, typed route registry (single source of truth)
export const routeRegistry: RouteNode[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, children: [
    { id: 'dashboard-overview', label: 'Overview', path: '/dashboard/overview' },
  ]},

  { id: 'projects', label: 'Projects', icon: Briefcase, children: [
    { id: 'projects-overview', label: 'Overview', path: '/projects/overview' },
    { id: 'projects-schedule', label: 'Schedule', path: '/projects/schedule' },
    { id: 'projects-tasks', label: 'Tasks', path: '/projects/tasks' },
    { id: 'projects-activations', label: 'Activations', path: '/projects/activations' },
    { id: 'projects-locations', label: 'Locations', path: '/projects/locations' },
    { id: 'projects-files', label: 'Files', path: '/projects/files' },
    { id: 'projects-inspections', label: 'Inspections', path: '/projects/inspections' },
    { id: 'projects-risks', label: 'Risks', path: '/projects/risks' },
  ]},

  { id: 'people', label: 'People', icon: Users, children: [
    { id: 'people-overview', label: 'Overview', path: '/people/overview' },
    { id: 'people-directory', label: 'Directory', path: '/people/directory' },
    { id: 'people-roles', label: 'Roles', path: '/people/roles' },
    { id: 'people-competencies', label: 'Competencies', path: '/people/competencies' },
    { id: 'people-shortlists', label: 'Shortlists', path: '/people/shortlists' },
    { id: 'people-network', label: 'Network', path: '/people/network' },
    { id: 'people-endorsements', label: 'Endorsements', path: '/people/endorsements' },
  ]},

  { id: 'programming', label: 'Programming', icon: Code, children: [
    { id: 'programming-overview', label: 'Overview', path: '/programming/overview' },
    { id: 'programming-calendar', label: 'Calendar', path: '/programming/calendar' },
    { id: 'programming-events', label: 'Events', path: '/programming/events' },
    { id: 'programming-spaces', label: 'Spaces', path: '/programming/spaces' },
    { id: 'programming-call-sheets', label: 'Call Sheets', path: '/programming/call-sheets' },
    { id: 'programming-lineups', label: 'Lineups', path: '/programming/lineups' },
    { id: 'programming-riders', label: 'Riders', path: '/programming/riders' },
  ]},

  { id: 'pipeline', label: 'Pipeline', icon: Layers, children: [
    { id: 'pipeline-overview', label: 'Overview', path: '/pipeline/overview' },
    { id: 'pipeline-manning', label: 'Manning', path: '/pipeline/manning' },
    { id: 'pipeline-training', label: 'Training', path: '/pipeline/training' },
    { id: 'pipeline-onboarding', label: 'Onboarding', path: '/pipeline/onboarding' },
    { id: 'pipeline-contracting', label: 'Contracting', path: '/pipeline/contracting' },
  ]},

  { id: 'assets', label: 'Assets', icon: Package, children: [
    { id: 'assets-overview', label: 'Overview', path: '/assets' },
    { id: 'assets-inventory', label: 'Inventory', path: '/assets/inventory' },
    { id: 'assets-advancing', label: 'Advancing', path: '/assets/advancing' },
    { id: 'assets-assignments', label: 'Assignments', path: '/assets/assignments' },
    { id: 'assets-tracking', label: 'Tracking', path: '/assets/tracking' },
    { id: 'assets-maintenance', label: 'Maintenance', path: '/assets/maintenance' },
    { id: 'assets-reports', label: 'Reports', path: '/assets/reports' },
  ]},

  { id: 'procurement', label: 'Procurement', icon: ShoppingCart, children: [
    { id: 'procurement-overview', label: 'Overview', path: '/procurement/overview' },
    { id: 'procurement-tracking', label: 'Tracking', path: '/procurement/tracking' },
    { id: 'procurement-orders', label: 'Orders', path: '/procurement/orders' },
    { id: 'procurement-products', label: 'Products', path: '/procurement/products' },
    { id: 'procurement-services', label: 'Services', path: '/procurement/services' },
    { id: 'procurement-catalog', label: 'Catalog', path: '/procurement/catalog' },
  ]},

  { id: 'jobs', label: 'Jobs', icon: Briefcase, children: [
    { id: 'jobs-overview', label: 'Overview', path: '/jobs/overview' },
    { id: 'jobs-assignments', label: 'Assignments', path: '/jobs/assignments' },
    { id: 'jobs-contracts', label: 'Contracts', path: '/jobs/contracts' },
    { id: 'jobs-compliance', label: 'Compliance', path: '/jobs/compliance' },
    { id: 'jobs-bids', label: 'Bids', path: '/jobs/bids' },
    { id: 'jobs-opportunities', label: 'Opportunities', path: '/jobs/opportunities' },
    { id: 'jobs-rfps', label: 'RFPs', path: '/jobs/rfps' },
  ]},

  { id: 'companies', label: 'Companies', icon: Building, children: [
    { id: 'companies-overview', label: 'Overview', path: '/companies/overview' },
    { id: 'companies-directory', label: 'Directory', path: '/companies/directory' },
    { id: 'companies-contracts', label: 'Contracts', path: '/companies/contracts' },
    { id: 'companies-qualifications', label: 'Qualifications', path: '/companies/qualifications' },
    { id: 'companies-ratings', label: 'Ratings', path: '/companies/ratings' },
  ]},

  { id: 'finance', label: 'Finance', icon: DollarSign, children: [
    { id: 'finance-overview', label: 'Overview', path: '/finance/overview' },
    { id: 'finance-budgets', label: 'Budgets', path: '/finance/budgets' },
    { id: 'finance-forecasts', label: 'Forecasts', path: '/finance/forecasts' },
    { id: 'finance-expenses', label: 'Expenses', path: '/finance/expenses' },
    { id: 'finance-revenue', label: 'Revenue', path: '/finance/revenue' },
    { id: 'finance-transactions', label: 'Transactions', path: '/finance/transactions' },
    { id: 'finance-invoices', label: 'Invoices', path: '/finance/invoices' },
    { id: 'finance-accounts', label: 'Accounts', path: '/finance/accounts' },
  ]},

  { id: 'analytics', label: 'Analytics', icon: BarChart3, children: [
    { id: 'analytics-overview', label: 'Overview', path: '/analytics/overview' },
    { id: 'analytics-dashboards', label: 'Dashboards', path: '/analytics/dashboards' },
    { id: 'analytics-reports', label: 'Reports', path: '/analytics/reports' },
    { id: 'analytics-exports', label: 'Exports', path: '/analytics/exports' },
  ]},

  { id: 'resources', label: 'Resources', icon: BookOpen, children: [
    { id: 'resources-overview', label: 'Overview', path: '/resources/overview' },
    { id: 'resources-policies', label: 'Policies', path: '/resources/policies' },
    { id: 'resources-guides', label: 'Guides', path: '/resources/guides' },
    { id: 'resources-trainings', label: 'Trainings', path: '/resources/trainings' },
    { id: 'resources-templates', label: 'Templates', path: '/resources/templates' },
    { id: 'resources-procedures', label: 'Procedures', path: '/resources/procedures' },
    { id: 'resources-featured', label: 'Featured', path: '/resources/featured' },
  ]},

  // Enterprise features - requires admin role and ghxstship feature flag
  { id: 'enterprise', label: 'Enterprise', icon: Shield, featureFlag: 'ghxstship', children: [
    { id: 'enterprise-overview', label: 'Overview', path: '/admin/enterprise' },
    { id: 'enterprise-monitoring', label: 'System Monitoring', path: '/admin/enterprise/monitoring' },
    { id: 'enterprise-security', label: 'Security Dashboard', path: '/admin/enterprise/security' },
    { id: 'enterprise-database', label: 'Database Management', path: '/admin/enterprise/database' },
    { id: 'enterprise-settings', label: 'Configuration', path: '/admin/enterprise/settings' },
  ]},

  // Settings and Profile are always present
  { id: 'settings', label: 'Settings', icon: Settings, children: [
    { id: 'settings-account', label: 'Account', path: '/settings/account' },
    { id: 'settings-billing', label: 'Billing', path: '/settings/billing' },
    { id: 'settings-organization', label: 'Organization', path: '/settings/organization' },
    { id: 'settings-teams', label: 'Teams', path: '/settings/teams' },
    { id: 'settings-permissions', label: 'Permissions', path: '/settings/permissions' },
    { id: 'settings-notifications', label: 'Notifications', path: '/settings/notifications' },
    { id: 'settings-integrations', label: 'Integrations', path: '/settings/integrations' },
    { id: 'settings-automations', label: 'Automations', path: '/settings/automations' },
    { id: 'settings-security', label: 'Security', path: '/settings/security' },
  ]},

  { id: 'profile', label: 'Profile', icon: User, children: [
    { id: 'profile-basic', label: 'Basic Information', path: '/profile/basic' },
    { id: 'profile-contact', label: 'Contact Information', path: '/profile/contact' },
    { id: 'profile-emergency', label: 'Emergency Contact', path: '/profile/emergency' },
    { id: 'profile-health', label: 'Health & Dietary', path: '/profile/health' },
    { id: 'profile-uniform', label: 'Uniform', path: '/profile/uniform' },
    { id: 'profile-travel', label: 'Travel', path: '/profile/travel' },
    { id: 'profile-professional', label: 'Professional', path: '/profile/professional' },
    { id: 'profile-certifications', label: 'Certifications', path: '/profile/certifications' },
    { id: 'profile-activity', label: 'Activity', path: '/profile/activity' },
    { id: 'profile-job-history', label: 'Job History', path: '/profile/job-history' },
    { id: 'profile-performance', label: 'Performance', path: '/profile/performance' },
    { id: 'profile-endorsements', label: 'Endorsements', path: '/profile/endorsements' },
  ]},
];

export type NavSection = { label: string; items: { label: string; href: string }[] };

export function toNavSections(routes: RouteNode[]): NavSection[] {
  return routes.map((node) => {
    const items = (node.children ?? []).map((child) => ({
      label: child.label,
      href: child.path || '#'
    }));

    // If an Overview child exists, ensure it is first in the list
    items.sort((a, b) => (a.label === 'Overview' ? -1 : b.label === 'Overview' ? 1 : 0));

    return {
      label: node.label,
      items
    };
  });
}

// RBAC filtering — hide disallowed top-level modules by role
import { normalizeRole, canAccessModule, canAccessChild } from '../auth/roles';
export function filterByRole(routes: RouteNode[], role: string): RouteNode[] {
  const normalized = normalizeRole(role);
  return routes
    .filter((r) => canAccessModule(normalized, r.id as any))
    .map((r) => {
      if (!r.children || r.children.length === 0) return r;
      const children = r.children.filter((c) => canAccessChild(normalized, r.id as any, c.id));
      return { ...r, children };
    });
}

export function filterByEntitlements(routes: RouteNode[], feature_atlvs: boolean, feature_ghxstship: boolean = false): RouteNode[] {
  // Today, treat all main modules as ATLVS-gated. Settings/Profile are unconditional
  const gated = new Set([
    'dashboard','projects','people','programming','pipeline','procurement','jobs','companies','finance','analytics','resources'
  ]);
  return routes.filter((r) => {
    if (r.id === 'settings' || r.id === 'profile') return true;
    if (r.featureFlag === 'ghxstship') return feature_ghxstship;
    if (r.featureFlag === 'atlvs' || gated.has(r.id)) return feature_atlvs;
    return true;
  });
}

export function findByPath(pathname: string, routes: RouteNode[] = routeRegistry): RouteNode[] {
  const stack: RouteNode[] = [];
  const dfs = (nodes: RouteNode[], trail: RouteNode[]): RouteNode[] | null => {
    for (const n of nodes) {
      const currentTrail = [...trail, n];
      if (n.path === pathname) return currentTrail;
      if (n.children) {
        const found = dfs(n.children, currentTrail);
        if (found) return found;
      }
    }
    return null;
  };
  return dfs(routes, []) ?? [];
}
