export type FileCategory = 'document' | 'image' | 'video' | 'audio' | 'drawing' | 'specification' | 'report' | 'template' | 'policy' | 'contract' | 'other';
export type FileStatus = 'active' | 'archived' | 'processing' | 'error';
export type AccessLevel = 'public' | 'team' | 'restricted' | 'private';

export type ResourceType = 'policy' | 'guide' | 'training' | 'template' | 'procedure' | 'featured';
export type ResourceStatus = 'draft' | 'under_review' | 'published' | 'archived';
export type ResourceVisibility = 'public' | 'private' | 'team' | 'role_based';

export interface Resource {
  id: string;
  organization_id: string;
  title: string;
  description?: string | null;
  content?: string | null;
  type: ResourceType;
  category?: string | null;
  tags: string[];
  status: ResourceStatus;
  visibility: ResourceVisibility;
  version: string;
  language: string;
  file_url?: string | null;
  file_size?: number | null;
  file_type?: string | null;
  thumbnail_url?: string | null;
  download_count: number;
  view_count: number;
  is_featured: boolean;
  is_pinned: boolean;
  expiry_date?: string | null;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  updated_by?: string | null;
}

export interface ResourceFilters {
  type?: ResourceType;
  category?: string;
  status?: ResourceStatus;
  visibility?: ResourceVisibility;
  tags?: string[];
  language?: string;
  is_featured?: boolean;
  is_pinned?: boolean;
  search?: string;
}

export interface CreateResourceData {
  title: string;
  description?: string | null;
  content?: string | null;
  type: ResourceType;
  category?: string | null;
  tags?: string[];
  status?: ResourceStatus;
  visibility?: ResourceVisibility;
  version?: string;
  language?: string;
  file_url?: string | null;
  file_size?: number | null;
  file_type?: string | null;
  thumbnail_url?: string | null;
  download_count?: number;
  view_count?: number;
  is_featured?: boolean;
  is_pinned?: boolean;
  expiry_date?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface UpdateResourceData extends Partial<CreateResourceData> {
  id: string;
}

export interface ResourceStats {
  total_resources: number;
  featured_resources: number;
  published_resources: number;
  draft_resources: number;
  under_review_resources: number;
  archived_resources: number;
  total_views: number;
  total_downloads: number;
}

export interface DigitalAsset {
  id: string;
  organization_id: string;
  title: string;
  description?: string | null;
  content: string;
  category: FileCategory;
  tags: string[];
  status: FileStatus;
  access_level: AccessLevel;
  project_id?: string;
  project?: {
    id: string;
    name: string;
  };
  allowed_roles?: string[];
  allowed_teams?: string[];
  version: string;
  language: string;
  file_url?: string | null;
  file_size?: number | null;
  file_type?: string | null;
  thumbnail_url?: string | null;
  download_count: number;
  view_count: number;
  is_featured: boolean;
  is_pinned: boolean;
  expiry_date?: string | null;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  updated_by?: string | null;
}

export interface AssetCategory {
  id: string;
  organization_id: string;
  name: string;
  description?: string | null;
  type?: string | null;
  color?: string | null;
  icon?: string | null;
  parent_id?: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  updated_by?: string | null;
}

export interface AssetAccess {
  id: string;
  resource_id: string;
  organization_id: string;
  user_id: string;
  access_type: 'view' | 'download' | 'edit' | 'share';
  ip_address?: string | null;
  user_agent?: string | null;
  duration?: number | null;
  accessed_at: string;
}

export interface AssetComment {
  id: string;
  resource_id: string;
  organization_id: string;
  user_id: string;
  parent_id?: string | null;
  content: string;
  is_resolved: boolean;
  resolved_by?: string | null;
  resolved_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AssetTemplate {
  id: string;
  organization_id: string;
  name: string;
  description?: string | null;
  template_type: string;
  content: string;
  variables: Record<string, unknown>;
  usage_count: number;
  is_public: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  updated_by?: string | null;
}

export interface AssetVersion {
  id: string;
  asset_id: string;
  version: string;
  file_url: string;
  file_size: number;
  file_type: string;
  is_latest: boolean;
  uploaded_by: string;
  uploaded_by_user?: {
    id: string;
    email: string;
    full_name?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface AssetFolder {
  id: string;
  organization_id: string;
  project_id?: string;
  name: string;
  description?: string;
  parent_folder_id?: string;
  path: string;
  is_system: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

// Form interfaces for CRUD operations
export interface CreateAssetData {
  title: string;
  description?: string;
  content?: string;
  category: FileCategory;
  project_id?: string;
  tags?: string[];
  status?: FileStatus;
  access_level?: AccessLevel;
  allowed_roles?: string[];
  allowed_teams?: string[];
  version?: string;
  language?: string;
  file_url?: string;
  file_size?: number;
  file_type?: string;
  thumbnail_url?: string;
  is_featured?: boolean;
  is_pinned?: boolean;
  folder_id?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateAssetData extends Partial<CreateAssetData> {
  id: string;
}

// Filter and search interfaces
export interface AssetFilters {
  category?: FileCategory;
  project_id?: string;
  status?: FileStatus;
  access_level?: AccessLevel;
  tags?: string[];
  is_featured?: boolean;
  is_pinned?: boolean;
  created_by?: string;
  folder_id?: string;
  file_type?: string;
  date_range?: {
    start: string;
    end: string;
  };
}

export interface AssetSearchParams {
  query?: string;
  filters?: AssetFilters;
  sort_by?: 'created_at' | 'updated_at' | 'title' | 'view_count' | 'download_count';
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Statistics and analytics interfaces
export interface AssetStats {
  total_assets: number;
  active_assets: number;
  archived_assets: number;
  featured_assets: number;
  total_views: number;
  total_downloads: number;
  total_storage_used: number;
  categories_count: number;
  folders_count: number;
  active_users: number;
}

export interface AssetAnalytics {
  views_by_day: Array<{ date: string; count: number }>;
  downloads_by_day: Array<{ date: string; count: number }>;
  popular_assets: Array<{ asset_id: string; title: string; views: number; downloads: number }>;
  category_distribution: Array<{ category: FileCategory; count: number }>;
  storage_by_category: Array<{ category: FileCategory; size_bytes: number }>;
  access_level_distribution: Array<{ access_level: AccessLevel; count: number }>;
}

// ATLVS DataViews field configurations
export interface AssetFieldConfig {
  id: string;
  title: string;
  type: 'text' | 'select' | 'date' | 'number' | 'boolean' | 'tags' | 'file';
  sortable?: boolean;
  filterable?: boolean;
  searchable?: boolean;
  width?: number;
  options?: Array<{ label: string; value: string }>;
}

// Export/Import interfaces
export interface AssetExportData {
  assets: DigitalAsset[];
  categories: AssetCategory[];
  folders: AssetFolder[];
  metadata: {
    exported_at: string;
    total_count: number;
    filters_applied: AssetFilters;
  };
}

export interface AssetImportResult {
  success: boolean;
  imported_count: number;
  failed_count: number;
  errors: Array<{ row: number; message: string }>;
  warnings: Array<{ row: number; message: string }>;
}

// ========================================
// CONTRACT-SPECIFIC TYPES
// ========================================

export type ContractType = 
  | 'employment'     // People contracts
  | 'freelance'      // Jobs contracts
  | 'vendor'         // Companies contracts
  | 'service'        // Procurement contracts
  | 'partnership'    // Companies contracts
  | 'nda'           // Multi-module
  | 'purchase'       // Procurement contracts
  | 'lease'          // Assets contracts
  | 'msa'           // Master Service Agreement
  | 'sow'           // Statement of Work
  | 'other';

export type ContractStatus = 'draft' | 'active' | 'completed' | 'terminated' | 'expired' | 'pending_approval' | 'under_review';

export type ContractPriority = 'low' | 'medium' | 'high' | 'critical';

export type SignatureStatus = 'unsigned' | 'partially_signed' | 'fully_signed' | 'pending_signature';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'requires_changes';

// Contract milestone interface
export interface ContractMilestone {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  completion_date?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  value?: number;
  deliverables?: string[];
  notes?: string;
}

// Contract amendment interface
export interface ContractAmendment {
  id: string;
  amendment_type: 'extension' | 'value_change' | 'scope_change' | 'termination' | 'renewal';
  description: string;
  effective_date: string;
  old_value?: unknown;
  new_value?: unknown;
  approved_by?: string;
  approved_at?: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  reason?: string;
}

// Signatory information interface
export interface SignatoryInfo {
  id: string;
  name: string;
  email: string;
  role: string;
  organization?: string;
  signed_at?: string;
  signature_url?: string;
  ip_address?: string;
  is_required: boolean;
  signing_order?: number;
}

// Contract metadata interface
export interface ContractMetadata {
  contract_type: ContractType;
  contract_status: ContractStatus;
  contract_priority?: ContractPriority;
  contract_value?: number;
  currency?: string;
  start_date?: string;
  end_date?: string;
  renewal_date?: string;
  auto_renewal?: boolean;
  notice_period_days?: number;
  
  // Relationship fields
  related_entity_type: 'job' | 'company' | 'person' | 'project' | 'asset' | 'procurement_order';
  related_entity_id: string;
  related_entity_name: string;
  
  // Contract-specific fields
  terms?: string;
  milestones?: ContractMilestone[];
  amendments?: ContractAmendment[];
  signatory_info?: SignatoryInfo[];
  compliance_requirements?: string[];
  
  // Workflow fields
  approval_status?: ApprovalStatus;
  approved_by?: string;
  approved_at?: string;
  signature_status?: SignatureStatus;
  
  // Legal and compliance
  governing_law?: string;
  jurisdiction?: string;
  confidentiality_clause?: boolean;
  termination_clause?: string;
  liability_limit?: number;
  
  // Financial terms
  payment_terms?: string;
  payment_schedule?: Array<{
    due_date: string;
    amount: number;
    description?: string;
    status: 'pending' | 'paid' | 'overdue';
  }>;
  
  // Performance metrics
  kpis?: Array<{
    name: string;
    target: string;
    measurement: string;
    current_value?: string;
  }>;
}

// Enhanced DigitalAsset for contracts
export interface ContractAsset extends Omit<DigitalAsset, 'category' | 'metadata'> {
  category: 'contract';
  contract_metadata: ContractMetadata;
}

// Contract-specific form interfaces
export interface CreateContractData {
  title: string;
  description?: string;
  content?: string;
  project_id?: string;
  tags?: string[];
  access_level?: AccessLevel;
  allowed_roles?: string[];
  allowed_teams?: string[];
  file_url?: string;
  contract_metadata: Partial<ContractMetadata>;
}

export interface UpdateContractData extends Partial<CreateContractData> {
  id: string;
}

// Contract-specific filter interfaces
export interface ContractFilters extends Omit<AssetFilters, 'category'> {
  contract_type?: ContractType;
  contract_status?: ContractStatus;
  contract_priority?: ContractPriority;
  related_entity_type?: ContractMetadata['related_entity_type'];
  related_entity_id?: string;
  approval_status?: ApprovalStatus;
  signature_status?: SignatureStatus;
  value_min?: number;
  value_max?: number;
  expiring_within_days?: number;
  requires_renewal?: boolean;
  auto_renewal?: boolean;
}

// Contract statistics interface
export interface ContractStats {
  total: number;
  by_status: Record<ContractStatus, number>;
  by_type: Record<ContractType, number>;
  by_priority: Record<ContractPriority, number>;
  total_value: number;
  average_contract_value: number;
  active_contracts: number;
  expiring_contracts: number;
  pending_approvals: number;
  pending_signatures: number;
  recent_contracts: number;
  completion_rate: number;
  renewal_rate: number;
  overdue_milestones: number;
}

// Contract template interface
export interface ContractTemplate extends AssetTemplate {
  template_type: 'contract';
  contract_type: ContractType;
  default_terms?: string;
  required_fields: string[];
  optional_fields: string[];
  approval_workflow?: Array<{
    role: string;
    order: number;
    is_required: boolean;
  }>;
}

// Contract workflow interfaces
export interface ContractWorkflowStep {
  id: string;
  step_type: 'approval' | 'signature' | 'review' | 'notification';
  assignee_type: 'user' | 'role' | 'team';
  assignee_id: string;
  order: number;
  is_required: boolean;
  due_date?: string;
  completed_at?: string;
  completed_by?: string;
  status: 'pending' | 'completed' | 'skipped' | 'overdue';
  notes?: string;
}

export interface ContractWorkflow {
  id: string;
  contract_id: string;
  workflow_type: 'approval' | 'signature' | 'renewal' | 'termination';
  status: 'active' | 'completed' | 'cancelled';
  steps: ContractWorkflowStep[];
  created_at: string;
  completed_at?: string;
}

// Contract analytics interfaces
export interface ContractAnalytics extends AssetAnalytics {
  contracts_by_type: Array<{ type: ContractType; count: number; total_value: number }>;
  contracts_by_status: Array<{ status: ContractStatus; count: number }>;
  expiring_contracts: Array<{ 
    contract_id: string; 
    title: string; 
    end_date: string; 
    days_until_expiry: number;
    auto_renewal: boolean;
  }>;
  value_by_month: Array<{ month: string; total_value: number; contract_count: number }>;
  renewal_trends: Array<{ month: string; renewed: number; expired: number; renewal_rate: number }>;
  approval_metrics: {
    average_approval_time: number;
    pending_approvals: number;
    approval_bottlenecks: Array<{ role: string; pending_count: number; avg_time: number }>;
  };
}

// Contract export/import interfaces
export interface ContractExportData extends AssetExportData {
  contracts: ContractAsset[];
  contract_templates: ContractTemplate[];
  contract_workflows: ContractWorkflow[];
}

// Contract field configuration for ATLVS
export interface ContractFieldConfig extends AssetFieldConfig {
  contract_specific?: boolean;
  entity_dependent?: boolean;
  workflow_stage?: 'creation' | 'approval' | 'signature' | 'execution' | 'completion';
}
