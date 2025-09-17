export interface AssetReport {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  type: AssetReportType;
  format: AssetReportFormat;
  status: AssetReportStatus;
  parameters: AssetReportParameters;
  generatedAt?: Date;
  generatedBy: string;
  fileUrl?: string;
  fileSize?: number;
  expiresAt?: Date;
  scheduledGeneration?: AssetReportSchedule;
  recipients?: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export type AssetReportType = 
  | 'inventory_summary'
  | 'asset_utilization'
  | 'maintenance_schedule'
  | 'cost_analysis'
  | 'depreciation_report'
  | 'assignment_history'
  | 'tracking_summary'
  | 'performance_metrics'
  | 'compliance_audit'
  | 'custom';

export type AssetReportFormat = 'pdf' | 'excel' | 'csv' | 'json';

export type AssetReportStatus = 
  | 'draft'
  | 'generating'
  | 'completed'
  | 'failed'
  | 'expired';

export interface AssetReportParameters {
  dateRange?: {
    start: Date;
    end: Date;
  };
  assetCategories?: string[];
  assetStatuses?: string[];
  locations?: string[];
  assignees?: string[];
  includeFinancials?: boolean;
  includeImages?: boolean;
  groupBy?: 'category' | 'location' | 'status' | 'assignee';
  sortBy?: 'name' | 'value' | 'date' | 'status';
  filters?: Record<string, any>;
}

export interface AssetReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  dayOfWeek?: number; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
  time?: string; // HH:mm format
  timezone?: string;
  enabled: boolean;
}

export interface AssetAnalytics {
  totalAssets: number;
  totalValue: number;
  utilizationRate: number;
  maintenanceCosts: number;
  depreciationRate: number;
  categoryBreakdown: Record<string, number>;
  statusBreakdown: Record<string, number>;
  locationBreakdown: Record<string, number>;
  trends: AssetTrend[];
}

export interface AssetTrend {
  period: string;
  metric: string;
  value: number;
  change: number;
  changePercent: number;
}

export interface AssetReportRepository {
  findById(id: string, organizationId: string): Promise<AssetReport | null>;
  findByOrganization(organizationId: string, filters?: AssetReportFilters): Promise<AssetReport[]>;
  create(report: Omit<AssetReport, 'id' | 'createdAt' | 'updatedAt'>): Promise<AssetReport>;
  update(id: string, organizationId: string, updates: Partial<AssetReport>): Promise<AssetReport>;
  delete(id: string, organizationId: string): Promise<void>;
  findByType(organizationId: string, type: AssetReportType): Promise<AssetReport[]>;
  findByStatus(organizationId: string, status: AssetReportStatus): Promise<AssetReport[]>;
  findScheduled(organizationId: string): Promise<AssetReport[]>;
  generateAnalytics(organizationId: string, parameters: AssetReportParameters): Promise<AssetAnalytics>;
}

export interface AssetReportFilters {
  type?: AssetReportType;
  status?: AssetReportStatus;
  generatedBy?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  search?: string;
}
