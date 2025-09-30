import type { 
  AssetFieldConfig, 
  FileCategory, 
  FileStatus, 
  AccessLevel,
  ContractFieldConfig,
  ContractType,
  ContractStatus,
  ContractPriority,
  SignatureStatus,
  ApprovalStatus
} from '../types';

export const ASSET_FIELD_CONFIGS: AssetFieldConfig[] = [
  {
    id: 'title',
    title: 'Title',
    type: 'text',
    sortable: true,
    filterable: true,
    searchable: true,
    width: 250
  },
  {
    id: 'category',
    title: 'Category',
    type: 'select',
    sortable: true,
    filterable: true,
    width: 120,
    options: [
      { label: 'Document', value: 'document' },
      { label: 'Image', value: 'image' },
      { label: 'Video', value: 'video' },
      { label: 'Audio', value: 'audio' },
      { label: 'Drawing', value: 'drawing' },
      { label: 'Specification', value: 'specification' },
      { label: 'Report', value: 'report' },
      { label: 'Template', value: 'template' },
      { label: 'Policy', value: 'policy' },
      { label: 'Contract', value: 'contract' },
      { label: 'Other', value: 'other' }
    ]
  },
  {
    id: 'project_id',
    title: 'Project',
    type: 'select',
    sortable: true,
    filterable: true,
    width: 150
  },
  {
    id: 'status',
    title: 'Status',
    type: 'select',
    sortable: true,
    filterable: true,
    width: 120,
    options: [
      { label: 'Active', value: 'active' },
      { label: 'Archived', value: 'archived' },
      { label: 'Processing', value: 'processing' },
      { label: 'Error', value: 'error' }
    ]
  },
  {
    id: 'access_level',
    title: 'Access Level',
    type: 'select',
    sortable: true,
    filterable: true,
    width: 120,
    options: [
      { label: 'Public', value: 'public' },
      { label: 'Team', value: 'team' },
      { label: 'Restricted', value: 'restricted' },
      { label: 'Private', value: 'private' }
    ]
  },
  {
    id: 'version',
    title: 'Version',
    type: 'text',
    sortable: true,
    width: 80
  },
  {
    id: 'language',
    title: 'Language',
    type: 'text',
    sortable: true,
    filterable: true,
    width: 80
  },
  {
    id: 'view_count',
    title: 'Views',
    type: 'number',
    sortable: true,
    width: 80
  },
  {
    id: 'download_count',
    title: 'Downloads',
    type: 'number',
    sortable: true,
    width: 100
  },
  {
    id: 'is_featured',
    title: 'Featured',
    type: 'boolean',
    sortable: true,
    filterable: true,
    width: 80
  },
  {
    id: 'is_pinned',
    title: 'Pinned',
    type: 'boolean',
    sortable: true,
    filterable: true,
    width: 80
  },
  {
    id: 'tags',
    title: 'Tags',
    type: 'tags',
    filterable: true,
    searchable: true,
    width: 200
  },
  {
    id: 'file_url',
    title: 'File',
    type: 'file',
    width: 100
  },
  {
    id: 'created_at',
    title: 'Created',
    type: 'date',
    sortable: true,
    filterable: true,
    width: 120
  },
  {
    id: 'updated_at',
    title: 'Updated',
    type: 'date',
    sortable: true,
    filterable: true,
    width: 120
  }
];

export const FILE_CATEGORY_OPTIONS: Array<{ label: string; value: FileCategory }> = [
  { label: 'Document', value: 'document' },
  { label: 'Image', value: 'image' },
  { label: 'Video', value: 'video' },
  { label: 'Audio', value: 'audio' },
  { label: 'Drawing', value: 'drawing' },
  { label: 'Specification', value: 'specification' },
  { label: 'Report', value: 'report' },
  { label: 'Template', value: 'template' },
  { label: 'Policy', value: 'policy' },
  { label: 'Contract', value: 'contract' },
  { label: 'Other', value: 'other' }
];

export const FILE_STATUS_OPTIONS: Array<{ label: string; value: FileStatus }> = [
  { label: 'Active', value: 'active' },
  { label: 'Archived', value: 'archived' },
  { label: 'Processing', value: 'processing' },
  { label: 'Error', value: 'error' }
];

export const ACCESS_LEVEL_OPTIONS: Array<{ label: string; value: AccessLevel }> = [
  { label: 'Public', value: 'public' },
  { label: 'Team Only', value: 'team' },
  { label: 'Restricted', value: 'restricted' },
  { label: 'Private', value: 'private' }
];

export const RESOURCE_LANGUAGE_OPTIONS = [
  { label: 'English', value: 'en' },
  { label: 'Spanish', value: 'es' },
  { label: 'French', value: 'fr' },
  { label: 'German', value: 'de' },
  { label: 'Portuguese', value: 'pt' },
  { label: 'Italian', value: 'it' },
  { label: 'Dutch', value: 'nl' },
  { label: 'Russian', value: 'ru' },
  { label: 'Chinese', value: 'zh' },
  { label: 'Japanese', value: 'ja' }
];

export const RESOURCE_CATEGORY_OPTIONS = [
  { label: 'HR & People', value: 'hr' },
  { label: 'Safety & Compliance', value: 'safety' },
  { label: 'Operations', value: 'operations' },
  { label: 'Finance & Accounting', value: 'finance' },
  { label: 'IT & Technology', value: 'technology' },
  { label: 'Marketing & Sales', value: 'marketing' },
  { label: 'Legal & Contracts', value: 'legal' },
  { label: 'Quality Assurance', value: 'quality' },
  { label: 'Training & Development', value: 'training' },
  { label: 'Project Management', value: 'projects' },
  { label: 'Customer Service', value: 'customer_service' },
  { label: 'General', value: 'general' }
];

// ========================================
// CONTRACT-SPECIFIC CONFIGURATIONS
// ========================================

export const CONTRACT_TYPE_OPTIONS: Array<{ label: string; value: ContractType }> = [
  { label: 'Employment Contract', value: 'employment' },
  { label: 'Freelance Agreement', value: 'freelance' },
  { label: 'Vendor Contract', value: 'vendor' },
  { label: 'Service Agreement', value: 'service' },
  { label: 'Partnership Agreement', value: 'partnership' },
  { label: 'Non-Disclosure Agreement', value: 'nda' },
  { label: 'Purchase Agreement', value: 'purchase' },
  { label: 'Lease Agreement', value: 'lease' },
  { label: 'Master Service Agreement', value: 'msa' },
  { label: 'Statement of Work', value: 'sow' },
  { label: 'Other', value: 'other' }
];

export const CONTRACT_STATUS_OPTIONS: Array<{ label: string; value: ContractStatus }> = [
  { label: 'Draft', value: 'draft' },
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
  { label: 'Terminated', value: 'terminated' },
  { label: 'Expired', value: 'expired' },
  { label: 'Pending Approval', value: 'pending_approval' },
  { label: 'Under Review', value: 'under_review' }
];

export const CONTRACT_PRIORITY_OPTIONS: Array<{ label: string; value: ContractPriority }> = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
  { label: 'Critical', value: 'critical' }
];

export const SIGNATURE_STATUS_OPTIONS: Array<{ label: string; value: SignatureStatus }> = [
  { label: 'Unsigned', value: 'unsigned' },
  { label: 'Partially Signed', value: 'partially_signed' },
  { label: 'Fully Signed', value: 'fully_signed' },
  { label: 'Pending Signature', value: 'pending_signature' }
];

export const APPROVAL_STATUS_OPTIONS: Array<{ label: string; value: ApprovalStatus }> = [
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Requires Changes', value: 'requires_changes' }
];

export const CONTRACT_FIELD_CONFIGS: ContractFieldConfig[] = [
  {
    id: 'title',
    title: 'Contract Title',
    type: 'text',
    sortable: true,
    filterable: true,
    searchable: true,
    width: 250,
    contract_specific: true,
    workflow_stage: 'creation'
  },
  {
    id: 'contract_type',
    title: 'Contract Type',
    type: 'select',
    sortable: true,
    filterable: true,
    width: 150,
    options: CONTRACT_TYPE_OPTIONS,
    contract_specific: true,
    workflow_stage: 'creation'
  },
  {
    id: 'contract_status',
    title: 'Status',
    type: 'select',
    sortable: true,
    filterable: true,
    width: 120,
    options: CONTRACT_STATUS_OPTIONS,
    contract_specific: true,
    workflow_stage: 'execution'
  },
  {
    id: 'contract_priority',
    title: 'Priority',
    type: 'select',
    sortable: true,
    filterable: true,
    width: 100,
    options: CONTRACT_PRIORITY_OPTIONS,
    contract_specific: true,
    workflow_stage: 'creation'
  },
  {
    id: 'contract_value',
    title: 'Contract Value',
    type: 'number',
    sortable: true,
    filterable: true,
    width: 120,
    contract_specific: true,
    workflow_stage: 'creation'
  },
  {
    id: 'currency',
    title: 'Currency',
    type: 'text',
    sortable: true,
    filterable: true,
    width: 80,
    contract_specific: true,
    workflow_stage: 'creation'
  },
  {
    id: 'related_entity_type',
    title: 'Related To',
    type: 'select',
    sortable: true,
    filterable: true,
    width: 120,
    options: [
      { label: 'Job', value: 'job' },
      { label: 'Company', value: 'company' },
      { label: 'Person', value: 'person' },
      { label: 'Project', value: 'project' },
      { label: 'Asset', value: 'asset' },
      { label: 'Procurement Order', value: 'procurement_order' }
    ],
    contract_specific: true,
    entity_dependent: true,
    workflow_stage: 'creation'
  },
  {
    id: 'related_entity_name',
    title: 'Entity Name',
    type: 'text',
    sortable: true,
    filterable: true,
    searchable: true,
    width: 180,
    contract_specific: true,
    entity_dependent: true,
    workflow_stage: 'creation'
  },
  {
    id: 'start_date',
    title: 'Start Date',
    type: 'date',
    sortable: true,
    filterable: true,
    width: 120,
    contract_specific: true,
    workflow_stage: 'execution'
  },
  {
    id: 'end_date',
    title: 'End Date',
    type: 'date',
    sortable: true,
    filterable: true,
    width: 120,
    contract_specific: true,
    workflow_stage: 'execution'
  },
  {
    id: 'renewal_date',
    title: 'Renewal Date',
    type: 'date',
    sortable: true,
    filterable: true,
    width: 120,
    contract_specific: true,
    workflow_stage: 'completion'
  },
  {
    id: 'auto_renewal',
    title: 'Auto Renewal',
    type: 'boolean',
    sortable: true,
    filterable: true,
    width: 100,
    contract_specific: true,
    workflow_stage: 'execution'
  },
  {
    id: 'approval_status',
    title: 'Approval Status',
    type: 'select',
    sortable: true,
    filterable: true,
    width: 130,
    options: APPROVAL_STATUS_OPTIONS,
    contract_specific: true,
    workflow_stage: 'approval'
  },
  {
    id: 'signature_status',
    title: 'Signature Status',
    type: 'select',
    sortable: true,
    filterable: true,
    width: 140,
    options: SIGNATURE_STATUS_OPTIONS,
    contract_specific: true,
    workflow_stage: 'signature'
  },
  {
    id: 'created_at',
    title: 'Created',
    type: 'date',
    sortable: true,
    filterable: true,
    width: 120,
    contract_specific: true
  },
  {
    id: 'updated_at',
    title: 'Updated',
    type: 'date',
    sortable: true,
    filterable: true,
    width: 120,
    contract_specific: true
  }
];

// Contract field configurations for different views
export const getContractFieldConfigsForView = (viewType: 'grid' | 'list' | 'kanban' | 'calendar' | 'timeline'): ContractFieldConfig[] => {
  const allFields = CONTRACT_FIELD_CONFIGS;
  
  switch (viewType) {
    case 'grid':
      return allFields.filter(field => 
        ['title', 'contract_type', 'contract_status', 'contract_value', 'related_entity_name', 'end_date', 'signature_status'].includes(field.id)
      );
    
    case 'list':
      return allFields;
    
    case 'kanban':
      return allFields.filter(field => 
        ['title', 'contract_type', 'contract_value', 'related_entity_name', 'end_date', 'approval_status'].includes(field.id)
      );
    
    case 'calendar':
      return allFields.filter(field => 
        ['title', 'contract_type', 'contract_status', 'start_date', 'end_date', 'renewal_date'].includes(field.id)
      );
    
    case 'timeline':
      return allFields.filter(field => 
        ['title', 'contract_type', 'contract_status', 'start_date', 'end_date', 'created_at'].includes(field.id)
      );
    
    default:
      return allFields;
  }
};

// Contract field configurations for different workflow stages
export const getContractFieldConfigsForStage = (stage: 'creation' | 'approval' | 'signature' | 'execution' | 'completion'): ContractFieldConfig[] => {
  return CONTRACT_FIELD_CONFIGS.filter(field => 
    !field.workflow_stage || field.workflow_stage === stage
  );
};

// Default sort configurations for contracts
export const getDefaultContractSort = (viewType: 'grid' | 'list' | 'kanban' | 'calendar' | 'timeline') => {
  switch (viewType) {
    case 'calendar':
      return { field: 'end_date', direction: 'asc' };
    case 'timeline':
      return { field: 'start_date', direction: 'desc' };
    case 'kanban':
      return { field: 'contract_priority', direction: 'desc' };
    default:
      return { field: 'updated_at', direction: 'desc' };
  }
};

// Contract status workflow columns for Kanban view
export const CONTRACT_STATUS_COLUMNS = [
  { id: 'draft', title: 'Draft', status: 'draft' },
  { id: 'pending_approval', title: 'Pending Approval', status: 'pending_approval' },
  { id: 'under_review', title: 'Under Review', status: 'under_review' },
  { id: 'active', title: 'Active', status: 'active' },
  { id: 'completed', title: 'Completed', status: 'completed' },
  { id: 'terminated', title: 'Terminated', status: 'terminated' },
  { id: 'expired', title: 'Expired', status: 'expired' }
];
