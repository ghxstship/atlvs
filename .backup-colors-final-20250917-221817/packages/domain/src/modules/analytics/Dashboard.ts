export interface Widget {
  id: string;
  title: string;
  type: 'chart' | 'metric' | 'table' | 'gauge';
  chartType?: 'bar' | 'line' | 'pie' | 'area';
  size: 'small' | 'medium' | 'large';
  position: { x: number; y: number };
  config: Record<string, any>;
  data?: any[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Dashboard {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  isPublic: boolean;
  layout: 'grid' | 'freeform';
  widgets: Widget[];
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

export interface DashboardRepository {
  findById(id: string, orgId: string): Promise<Dashboard | null>;
  list(orgId: string, limit?: number, offset?: number): Promise<Dashboard[]>;
  create(entity: Dashboard): Promise<Dashboard>;
  update(id: string, partial: Partial<Dashboard>): Promise<Dashboard>;
  delete(id: string, orgId: string): Promise<void>;
}

export interface ExportJob {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  dataSource: 'projects' | 'people' | 'finance' | 'events' | 'custom_query';
  format: 'csv' | 'xlsx' | 'json' | 'pdf';
  filters: Record<string, any>;
  schedule?: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    time: string;
    dayOfWeek?: number;
    dayOfMonth?: number;
  };
  status: 'active' | 'paused' | 'failed' | 'completed';
  lastRun?: string;
  nextRun?: string;
  fileUrl?: string;
  fileSize?: number;
  recordCount?: number;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

export interface ExportJobRepository {
  findById(id: string, orgId: string): Promise<ExportJob | null>;
  list(orgId: string, limit?: number, offset?: number): Promise<ExportJob[]>;
  create(entity: ExportJob): Promise<ExportJob>;
  update(id: string, partial: Partial<ExportJob>): Promise<ExportJob>;
  delete(id: string, orgId: string): Promise<void>;
  run(id: string, orgId: string): Promise<void>;
}
