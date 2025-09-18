export type ForecastType = 'revenue' | 'expense' | 'cash_flow' | 'budget_variance';
export type ForecastPeriod = 'monthly' | 'quarterly' | 'yearly';

export interface Forecast {
  id: string;
  organizationId: string;
  projectId?: string;
  name: string;
  description?: string;
  type: ForecastType;
  period: ForecastPeriod;
  periodStart: string;
  periodEnd: string;
  projectedAmount: number;
  actualAmount?: number;
  variance?: number;
  currency: string;
  assumptions?: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ForecastRepository {
  findById(id: string, orgId: string): Promise<Forecast | null>;
  list(orgId: string, filters?: ForecastFilters, limit?: number, offset?: number): Promise<Forecast[]>;
  create(entity: Forecast): Promise<Forecast>;
  update(id: string, partial: Partial<Forecast>): Promise<Forecast>;
  delete(id: string, orgId: string): Promise<void>;
  getByProject(projectId: string, orgId: string): Promise<Forecast[]>;
  getByPeriod(periodStart: string, periodEnd: string, orgId: string): Promise<Forecast[]>;
  calculateVariance(id: string, actualAmount: number, orgId: string): Promise<Forecast>;
}

export interface ForecastFilters {
  type?: ForecastType;
  period?: ForecastPeriod;
  projectId?: string;
  createdBy?: string;
  periodStart?: string;
  periodEnd?: string;
}
