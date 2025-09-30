/**
 * Teams Settings Module Type Definitions
 * ATLVS Architecture Compliance
 */

// Core Team Types
export interface TeamMember {
  id: string;
  user_id: string;
  organization_id: string;
  name: string;
  email: string;
  role: TeamRole;
  status: MemberStatus;
  avatar_url?: string;
  department?: string;
  title?: string;
  invited_at: string;
  joined_at?: string;
  last_active?: string;
  created_at: string;
  updated_at: string;
}

export interface TeamInvite {
  id: string;
  organization_id: string;
  email: string;
  role: TeamRole;
  status: InviteStatus;
  invited_by: string;
  invited_by_name: string;
  expires_at: string;
  accepted_at?: string;
  created_at: string;
  updated_at: string;
}

export type TeamRole = 'owner' | 'admin' | 'manager' | 'member' | 'viewer';
export type MemberStatus = 'active' | 'inactive' | 'suspended' | 'pending';
export type InviteStatus = 'pending' | 'accepted' | 'expired' | 'cancelled';

// Team Record for ATLVS DataViews
export interface TeamRecord {
  id: string;
  type: TeamRecordType;
  name: string;
  email: string;
  role: TeamRole;
  status: string;
  description: string;
  category: TeamCategory;
  created_at: string;
  updated_at: string;
  metadata?: unknown;
}

export type TeamRecordType = 'member' | 'invite' | 'role' | 'permission';
export type TeamCategory = 'members' | 'invitations' | 'roles' | 'permissions';

// ATLVS DataViews Configuration Types
export interface TeamFieldConfig {
  key: keyof TeamRecord;
  label: string;
  type: 'text' | 'select' | 'date' | 'textarea' | 'boolean';
  width?: number;
  sortable?: boolean;
  filterable?: boolean;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
}

export interface TeamViewConfig {
  id: string;
  name: string;
  viewType: 'grid' | 'list' | 'kanban';
  defaultView: string;
  fields: TeamFieldConfig[];
  data: TeamRecord[];
  onSearch?: (query: string) => Promise<void>;
  onFilter?: (filters: unknown) => Promise<void>;
  onSort?: (sorts: unknown) => Promise<void>;
  onRefresh?: () => Promise<TeamRecord[]>;
  onExport?: (data: unknown, format: string) => void;
}

// Form Types
export interface InviteMemberFormData {
  email: string;
  role: TeamRole;
  department?: string;
  title?: string;
  message?: string;
}

export interface BulkInviteFormData {
  invites: Array<{
    email: string;
    role: TeamRole;
    department?: string;
    title?: string;
  }>;
  message?: string;
}

export interface UpdateMemberFormData {
  role: TeamRole;
  department?: string;
  title?: string;
  status: MemberStatus;
}

export interface TeamSettingsFormData {
  default_role: TeamRole;
  auto_approve_invites: boolean;
  require_email_verification: boolean;
  allow_self_registration: boolean;
  max_members?: number;
  invite_expiry_days: number;
}

// Statistics Types
export interface TeamStatistics {
  totalMembers: number;
  activeMembers: number;
  pendingInvites: number;
  membersByRole: Record<TeamRole, number>;
  membersByStatus: Record<MemberStatus, number>;
  recentJoins: number; // Last 30 days
  averageResponseTime: number; // Hours to accept invite
}

// Search and Filter Types
export interface TeamSearchParams {
  query?: string;
  type?: TeamRecordType;
  role?: TeamRole;
  status?: string;
  category?: TeamCategory;
  created_after?: string;
  created_before?: string;
}

export interface TeamFilterOptions {
  types: Array<{ value: TeamRecordType; label: string; count: number }>;
  roles: Array<{ value: TeamRole; label: string; count: number }>;
  statuses: Array<{ value: string; label: string; count: number }>;
  categories: Array<{ value: TeamCategory; label: string; count: number }>;
}

// Drawer Types
export interface TeamDrawerProps {
  mode: 'create' | 'edit' | 'view';
  record?: TeamRecord;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (data: unknown) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

// Component Props Types
export interface TeamsClientProps {
  userId: string;
  orgId: string;
}

export interface TeamGridViewProps {
  records: TeamRecord[];
  loading: boolean;
  onEdit: (record: TeamRecord) => void;
  onDelete: (id: string) => void;
  onSelect: (ids: string[]) => void;
  selectedIds: string[];
}

export interface TeamListViewProps {
  records: TeamRecord[];
  loading: boolean;
  onEdit: (record: TeamRecord) => void;
  onView: (record: TeamRecord) => void;
}

export interface TeamKanbanViewProps {
  records: TeamRecord[];
  loading: boolean;
  onEdit: (record: TeamRecord) => void;
  onMove: (recordId: string, newRole: TeamRole) => void;
}

// Audit Types
export interface TeamAuditLog {
  id: string;
  action: 'member_invite' | 'member_join' | 'member_remove' | 'role_change' | 'status_change' | 'settings_update';
  target_user_id?: string;
  target_user_name?: string;
  details: unknown;
  performed_by: string;
  performed_by_name: string;
  created_at: string;
}

// Export Types
export interface TeamExportOptions {
  format: 'csv' | 'json';
  includeMetadata: boolean;
  categories?: TeamCategory[];
  roles?: TeamRole[];
  dateRange?: {
    start: string;
    end: string;
  };
}

// Validation Types
export interface TeamValidationError {
  field: string;
  message: string;
  code: string;
}

export interface TeamValidationResult {
  valid: boolean;
  errors: TeamValidationError[];
}

// State Management Types
export interface TeamState {
  members: TeamMember[];
  invites: TeamInvite[];
  records: TeamRecord[];
  settings: TeamSettingsFormData | null;
  loading: boolean;
  error: string | null;
  selectedRecords: string[];
  searchQuery: string;
  filters: TeamSearchParams;
  statistics: TeamStatistics | null;
  auditLogs: TeamAuditLog[];
}

export interface TeamActions {
  loadMembers: () => Promise<void>;
  loadInvites: () => Promise<void>;
  inviteMember: (data: InviteMemberFormData) => Promise<void>;
  bulkInviteMembers: (data: BulkInviteFormData) => Promise<void>;
  resendInvite: (inviteId: string) => Promise<void>;
  cancelInvite: (inviteId: string) => Promise<void>;
  updateMember: (memberId: string, data: UpdateMemberFormData) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
  loadSettings: () => Promise<void>;
  updateSettings: (data: TeamSettingsFormData) => Promise<void>;
  loadRecords: () => Promise<void>;
  searchRecords: (query: string) => Promise<void>;
  filterRecords: (filters: TeamSearchParams) => Promise<void>;
  exportRecords: (options: TeamExportOptions) => Promise<void>;
  loadStatistics: () => Promise<void>;
  loadAuditLogs: () => Promise<void>;
}

// Role Configuration
export interface RoleConfig {
  value: TeamRole;
  label: string;
  description: string;
  permissions: string[];
  color: string;
}

export const ROLE_CONFIGS: Record<TeamRole, RoleConfig> = {
  owner: {
    value: 'owner',
    label: 'Owner',
    description: 'Full access to all organization features and settings',
    permissions: ['all'],
    color: 'text-red-600 bg-red-100',
  },
  admin: {
    value: 'admin',
    label: 'Administrator',
    description: 'Manage organization settings, members, and most features',
    permissions: ['manage_members', 'manage_settings', 'view_all', 'edit_all'],
    color: 'text-orange-600 bg-orange-100',
  },
  manager: {
    value: 'manager',
    label: 'Manager',
    description: 'Manage team members and projects within their scope',
    permissions: ['manage_team', 'view_reports', 'edit_projects'],
    color: 'text-blue-600 bg-blue-100',
  },
  member: {
    value: 'member',
    label: 'Member',
    description: 'Standard access to organization features and projects',
    permissions: ['view_projects', 'edit_assigned', 'create_content'],
    color: 'text-green-600 bg-green-100',
  },
  viewer: {
    value: 'viewer',
    label: 'Viewer',
    description: 'Read-only access to organization content',
    permissions: ['view_only'],
    color: 'text-gray-600 bg-gray-100',
  },
};

// Bulk Operations
export interface BulkOperation {
  type: 'role_change' | 'status_change' | 'remove' | 'resend_invite';
  memberIds: string[];
  data?: unknown;
}

export interface BulkOperationResult {
  success: number;
  failed: number;
  errors: Array<{
    memberId: string;
    error: string;
  }>;
}
