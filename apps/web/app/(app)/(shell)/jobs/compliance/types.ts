import { type DataRecord } from '@ghxstship/ui';

// Core compliance types
export type ComplianceStatus = 'pending' | 'submitted' | 'approved' | 'rejected';
export type ComplianceKind = 'regulatory' | 'safety' | 'quality' | 'security' | 'environmental' | 'legal' | 'financial';
export type CompliancePriority = 'low' | 'medium' | 'high' | 'critical';
export type ComplianceRiskLevel = 'low' | 'medium' | 'high' | 'critical';

// Main compliance interface
export interface JobCompliance extends DataRecord {
  id: string;
  job_id: string;
  kind: ComplianceKind;
  status: ComplianceStatus;
  due_at?: string;
  created_at: string;
  // Enhanced fields from joins
  job_title?: string;
  job_status?: string;
  project_title?: string;
  project_id?: string;
  organization_name?: string;
  compliance_title?: string;
  description?: string;
  requirements?: string[];
  evidence_documents?: string[];
  assessor_name?: string;
  assessment_date?: string;
  completion_date?: string;
  risk_level?: ComplianceRiskLevel;
  notes?: string;
}

// API response types
export interface ComplianceResponse {
  compliance: JobCompliance[];
  total?: number;
  page?: number;
  limit?: number;
}

// Form data types
export interface CreateComplianceData {
  job_id: string;
  kind: ComplianceKind;
  compliance_title?: string;
  description?: string;
  requirements?: string[];
  due_at?: string;
  risk_level?: ComplianceRiskLevel;
  priority?: CompliancePriority;
  assessor_name?: string;
  notes?: string;
}

export interface UpdateComplianceData extends Partial<CreateComplianceData> {
  id: string;
  status?: ComplianceStatus;
  evidence_documents?: string[];
  assessment_date?: string;
  completion_date?: string;
}

// Filter and search types
export interface ComplianceFilters {
  status?: ComplianceStatus;
  kind?: ComplianceKind;
  job_id?: string;
  risk_level?: ComplianceRiskLevel;
  priority?: CompliancePriority;
  search?: string;
  due_from?: string;
  due_to?: string;
  overdue?: boolean;
  assessor?: string;
}

// Statistics types
export interface ComplianceStats {
  total: number;
  byStatus: Record<ComplianceStatus, number>;
  byKind: Record<ComplianceKind, number>;
  byRiskLevel: Record<ComplianceRiskLevel, number>;
  pendingCompliance: number;
  overdueCompliance: number;
  recentCompliance: number;
  complianceRate: number;
  averageCompletionTime: number;
  criticalIssues: number;
}

// View configuration types
export interface ComplianceViewConfig {
  showRiskLevels: boolean;
  groupByKind: boolean;
  showJobDetails: boolean;
  showOverdueAlerts: boolean;
  defaultSort: 'due_at' | 'created_at' | 'risk_level' | 'status' | 'kind';
  defaultView: 'grid' | 'kanban' | 'calendar' | 'list' | 'timeline' | 'dashboard';
  riskColorCoding: boolean;
}

// Drawer types
export interface ComplianceDrawerProps {
  compliance?: JobCompliance;
  mode: 'create' | 'edit' | 'view';
  onSave?: (data: CreateComplianceData | UpdateComplianceData) => Promise<void>;
  onClose: () => void;
  open: boolean;
}

// Service types
export interface ComplianceService {
  getCompliance: (filters?: ComplianceFilters) => Promise<ComplianceResponse>;
  getComplianceItem: (id: string) => Promise<JobCompliance>;
  createCompliance: (data: CreateComplianceData) => Promise<JobCompliance>;
  updateCompliance: (data: UpdateComplianceData) => Promise<JobCompliance>;
  deleteCompliance: (id: string) => Promise<void>;
  getComplianceStats: () => Promise<ComplianceStats>;
  submitCompliance: (id: string) => Promise<JobCompliance>;
  approveCompliance: (id: string, notes?: string) => Promise<JobCompliance>;
  rejectCompliance: (id: string, reason: string) => Promise<JobCompliance>;
}

// Job integration types
export interface JobInfo {
  id: string;
  title: string;
  description?: string;
  status?: string;
  project_id?: string;
  project_title?: string;
  organization_id?: string;
  due_at?: string;
  created_by?: string;
  risk_assessment?: ComplianceRiskLevel;
}

// Compliance framework types
export interface ComplianceFramework {
  id: string;
  name: string;
  kind: ComplianceKind;
  version: string;
  requirements: ComplianceRequirement[];
  effective_date: string;
  is_active: boolean;
}

export interface ComplianceRequirement {
  id: string;
  framework_id: string;
  title: string;
  description: string;
  category: string;
  mandatory: boolean;
  evidence_required: string[];
  assessment_criteria: string[];
}

// Audit trail types
export interface ComplianceAudit {
  id: string;
  compliance_id: string;
  action: 'created' | 'updated' | 'submitted' | 'approved' | 'rejected' | 'evidence_added';
  performed_by: string;
  performed_at: string;
  details: Record<string, unknown>;
  notes?: string;
}

// Evidence types
export interface ComplianceEvidence {
  id: string;
  compliance_id: string;
  document_name: string;
  document_url: string;
  document_type: string;
  uploaded_by: string;
  uploaded_at: string;
  verified: boolean;
  verified_by?: string;
  verified_at?: string;
}

// Assessment types
export interface ComplianceAssessment {
  id: string;
  compliance_id: string;
  assessor_id: string;
  assessment_date: string;
  score?: number;
  max_score?: number;
  findings: AssessmentFinding[];
  recommendations: string[];
  status: 'in_progress' | 'completed' | 'requires_followup';
  next_review_date?: string;
}

export interface AssessmentFinding {
  id: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  evidence?: string;
  remediation_required: boolean;
  remediation_deadline?: string;
  status: 'open' | 'in_progress' | 'resolved' | 'accepted_risk';
}

// Export all types
export type {
  DataRecord
} from '@ghxstship/ui';
