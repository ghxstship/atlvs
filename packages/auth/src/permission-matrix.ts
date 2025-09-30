import { createServerClient } from '@ghxstship/auth';

export enum UserRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MANAGER = 'manager',
  PRODUCER = 'producer',
  MEMBER = 'member',
}

export enum Permission {
  // Organization Management
  ORG_UPDATE = 'org:update',
  ORG_DELETE = 'org:delete',
  ORG_MANAGE_SETTINGS = 'org:manage_settings',

  // User Management
  USER_VIEW = 'user:view',
  USER_CREATE = 'user:create',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',
  USER_MANAGE_ROLES = 'user:manage_roles',

  // Project Management
  PROJECT_VIEW = 'project:view',
  PROJECT_CREATE = 'project:create',
  PROJECT_UPDATE = 'project:update',
  PROJECT_DELETE = 'project:delete',
  PROJECT_MANAGE_TEAM = 'project:manage_team',

  // People Management
  PEOPLE_VIEW = 'people:view',
  PEOPLE_CREATE = 'people:create',
  PEOPLE_UPDATE = 'people:update',
  PEOPLE_DELETE = 'people:delete',

  // Finance Management
  FINANCE_VIEW = 'finance:view',
  FINANCE_CREATE = 'finance:create',
  FINANCE_UPDATE = 'finance:update',
  FINANCE_DELETE = 'finance:delete',

  // Programming Management
  PROGRAMMING_VIEW = 'programming:view',
  PROGRAMMING_CREATE = 'programming:create',
  PROGRAMMING_UPDATE = 'programming:update',
  PROGRAMMING_DELETE = 'programming:delete',

  // Procurement Management
  PROCUREMENT_VIEW = 'procurement:view',
  PROCUREMENT_CREATE = 'procurement:create',
  PROCUREMENT_UPDATE = 'procurement:update',
  PROCUREMENT_DELETE = 'procurement:delete',

  // Jobs Management
  JOBS_VIEW = 'jobs:view',
  JOBS_CREATE = 'jobs:create',
  JOBS_UPDATE = 'jobs:update',
  JOBS_DELETE = 'jobs:delete',

  // Companies Management
  COMPANIES_VIEW = 'companies:view',
  COMPANIES_CREATE = 'companies:create',
  COMPANIES_UPDATE = 'companies:update',
  COMPANIES_DELETE = 'companies:delete',

  // Analytics
  ANALYTICS_VIEW = 'analytics:view',
  ANALYTICS_CREATE = 'analytics:create',
  ANALYTICS_UPDATE = 'analytics:update',
  ANALYTICS_DELETE = 'analytics:delete',

  // Assets Management
  ASSETS_VIEW = 'assets:view',
  ASSETS_CREATE = 'assets:create',
  ASSETS_UPDATE = 'assets:update',
  ASSETS_DELETE = 'assets:delete',

  // Files Management
  FILES_VIEW = 'files:view',
  FILES_CREATE = 'files:create',
  FILES_UPDATE = 'files:update',
  FILES_DELETE = 'files:delete',
  FILES_SHARE = 'files:share',

  // Settings
  SETTINGS_VIEW = 'settings:view',
  SETTINGS_UPDATE = 'settings:update',

  // Profile
  PROFILE_VIEW = 'profile:view',
  PROFILE_UPDATE = 'profile:update',
}

export const PERMISSION_MATRIX: Record<UserRole, Permission[]> = {
  [UserRole.OWNER]: [
    // Organization Management
    Permission.ORG_UPDATE,
    Permission.ORG_DELETE,
    Permission.ORG_MANAGE_SETTINGS,

    // User Management
    Permission.USER_VIEW,
    Permission.USER_CREATE,
    Permission.USER_UPDATE,
    Permission.USER_DELETE,
    Permission.USER_MANAGE_ROLES,

    // All module permissions
    Permission.PROJECT_VIEW,
    Permission.PROJECT_CREATE,
    Permission.PROJECT_UPDATE,
    Permission.PROJECT_DELETE,
    Permission.PROJECT_MANAGE_TEAM,

    Permission.PEOPLE_VIEW,
    Permission.PEOPLE_CREATE,
    Permission.PEOPLE_UPDATE,
    Permission.PEOPLE_DELETE,

    Permission.FINANCE_VIEW,
    Permission.FINANCE_CREATE,
    Permission.FINANCE_UPDATE,
    Permission.FINANCE_DELETE,

    Permission.PROGRAMMING_VIEW,
    Permission.PROGRAMMING_CREATE,
    Permission.PROGRAMMING_UPDATE,
    Permission.PROGRAMMING_DELETE,

    Permission.PROCUREMENT_VIEW,
    Permission.PROCUREMENT_CREATE,
    Permission.PROCUREMENT_UPDATE,
    Permission.PROCUREMENT_DELETE,

    Permission.JOBS_VIEW,
    Permission.JOBS_CREATE,
    Permission.JOBS_UPDATE,
    Permission.JOBS_DELETE,

    Permission.COMPANIES_VIEW,
    Permission.COMPANIES_CREATE,
    Permission.COMPANIES_UPDATE,
    Permission.COMPANIES_DELETE,

    Permission.ANALYTICS_VIEW,
    Permission.ANALYTICS_CREATE,
    Permission.ANALYTICS_UPDATE,
    Permission.ANALYTICS_DELETE,

    Permission.ASSETS_VIEW,
    Permission.ASSETS_CREATE,
    Permission.ASSETS_UPDATE,
    Permission.ASSETS_DELETE,

    Permission.FILES_VIEW,
    Permission.FILES_CREATE,
    Permission.FILES_UPDATE,
    Permission.FILES_DELETE,
    Permission.FILES_SHARE,

    Permission.SETTINGS_VIEW,
    Permission.SETTINGS_UPDATE,

    Permission.PROFILE_VIEW,
    Permission.PROFILE_UPDATE,
  ],

  [UserRole.ADMIN]: [
    // Organization Management (limited)
    Permission.ORG_UPDATE,
    Permission.ORG_MANAGE_SETTINGS,

    // User Management (limited)
    Permission.USER_VIEW,
    Permission.USER_CREATE,
    Permission.USER_UPDATE,
    Permission.USER_MANAGE_ROLES,

    // All module permissions except org delete
    Permission.PROJECT_VIEW,
    Permission.PROJECT_CREATE,
    Permission.PROJECT_UPDATE,
    Permission.PROJECT_DELETE,
    Permission.PROJECT_MANAGE_TEAM,

    Permission.PEOPLE_VIEW,
    Permission.PEOPLE_CREATE,
    Permission.PEOPLE_UPDATE,
    Permission.PEOPLE_DELETE,

    Permission.FINANCE_VIEW,
    Permission.FINANCE_CREATE,
    Permission.FINANCE_UPDATE,
    Permission.FINANCE_DELETE,

    Permission.PROGRAMMING_VIEW,
    Permission.PROGRAMMING_CREATE,
    Permission.PROGRAMMING_UPDATE,
    Permission.PROGRAMMING_DELETE,

    Permission.PROCUREMENT_VIEW,
    Permission.PROCUREMENT_CREATE,
    Permission.PROCUREMENT_UPDATE,
    Permission.PROCUREMENT_DELETE,

    Permission.JOBS_VIEW,
    Permission.JOBS_CREATE,
    Permission.JOBS_UPDATE,
    Permission.JOBS_DELETE,

    Permission.COMPANIES_VIEW,
    Permission.COMPANIES_CREATE,
    Permission.COMPANIES_UPDATE,
    Permission.COMPANIES_DELETE,

    Permission.ANALYTICS_VIEW,
    Permission.ANALYTICS_CREATE,
    Permission.ANALYTICS_UPDATE,
    Permission.ANALYTICS_DELETE,

    Permission.ASSETS_VIEW,
    Permission.ASSETS_CREATE,
    Permission.ASSETS_UPDATE,
    Permission.ASSETS_DELETE,

    Permission.FILES_VIEW,
    Permission.FILES_CREATE,
    Permission.FILES_UPDATE,
    Permission.FILES_DELETE,
    Permission.FILES_SHARE,

    Permission.SETTINGS_VIEW,
    Permission.SETTINGS_UPDATE,

    Permission.PROFILE_VIEW,
    Permission.PROFILE_UPDATE,
  ],

  [UserRole.MANAGER]: [
    // User Management (limited)
    Permission.USER_VIEW,

    // Project management (full)
    Permission.PROJECT_VIEW,
    Permission.PROJECT_CREATE,
    Permission.PROJECT_UPDATE,
    Permission.PROJECT_MANAGE_TEAM,

    // Module permissions (view + create + update, no delete)
    Permission.PEOPLE_VIEW,
    Permission.PEOPLE_CREATE,
    Permission.PEOPLE_UPDATE,

    Permission.FINANCE_VIEW,
    Permission.FINANCE_CREATE,
    Permission.FINANCE_UPDATE,

    Permission.PROGRAMMING_VIEW,
    Permission.PROGRAMMING_CREATE,
    Permission.PROGRAMMING_UPDATE,

    Permission.PROCUREMENT_VIEW,
    Permission.PROCUREMENT_CREATE,
    Permission.PROCUREMENT_UPDATE,

    Permission.JOBS_VIEW,
    Permission.JOBS_CREATE,
    Permission.JOBS_UPDATE,

    Permission.COMPANIES_VIEW,
    Permission.COMPANIES_CREATE,
    Permission.COMPANIES_UPDATE,

    Permission.ANALYTICS_VIEW,

    Permission.ASSETS_VIEW,
    Permission.ASSETS_CREATE,
    Permission.ASSETS_UPDATE,

    Permission.FILES_VIEW,
    Permission.FILES_CREATE,
    Permission.FILES_UPDATE,
    Permission.FILES_SHARE,

    Permission.SETTINGS_VIEW,

    Permission.PROFILE_VIEW,
    Permission.PROFILE_UPDATE,
  ],

  [UserRole.PRODUCER]: [
    // User Management (limited)
    Permission.USER_VIEW,

    // Module permissions (view + create + update, no delete)
    Permission.PROJECT_VIEW,
    Permission.PROJECT_UPDATE,

    Permission.PEOPLE_VIEW,
    Permission.PEOPLE_UPDATE,

    Permission.FINANCE_VIEW,

    Permission.PROGRAMMING_VIEW,
    Permission.PROGRAMMING_CREATE,
    Permission.PROGRAMMING_UPDATE,

    Permission.PROCUREMENT_VIEW,
    Permission.PROCUREMENT_UPDATE,

    Permission.JOBS_VIEW,
    Permission.JOBS_CREATE,
    Permission.JOBS_UPDATE,

    Permission.COMPANIES_VIEW,
    Permission.COMPANIES_UPDATE,

    Permission.ANALYTICS_VIEW,

    Permission.ASSETS_VIEW,
    Permission.ASSETS_UPDATE,

    Permission.FILES_VIEW,
    Permission.FILES_UPDATE,
    Permission.FILES_SHARE,

    Permission.SETTINGS_VIEW,

    Permission.PROFILE_VIEW,
    Permission.PROFILE_UPDATE,
  ],

  [UserRole.MEMBER]: [
    // Basic view permissions only
    Permission.USER_VIEW,

    Permission.PROJECT_VIEW,

    Permission.PEOPLE_VIEW,

    Permission.FINANCE_VIEW,

    Permission.PROGRAMMING_VIEW,

    Permission.PROCUREMENT_VIEW,

    Permission.JOBS_VIEW,

    Permission.COMPANIES_VIEW,

    Permission.ANALYTICS_VIEW,

    Permission.ASSETS_VIEW,

    Permission.FILES_VIEW,

    Permission.SETTINGS_VIEW,

    Permission.PROFILE_VIEW,
    Permission.PROFILE_UPDATE,
  ],
};
