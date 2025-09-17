// Base repository interface
export interface BaseRepository<T> {
  findById(id: string): Promise<T | null>;
  create(entity: T): Promise<T>;
  update(id: string, entity: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

// Company repositories
export interface CompanyRepository extends BaseRepository<any> {
  findByOrganizationId(organizationId: string): Promise<any[]>;
  list(organizationId: string, filters?: any, pagination?: any): Promise<any[]>;
}

export interface CompanyContactRepository extends BaseRepository<any> {
  findByCompanyId(companyId: string): Promise<any[]>;
  list(companyId: string, filters?: any): Promise<any[]>;
  create(data: any, context?: any): Promise<any>;
  update(id: string, data: any, context?: any): Promise<any>;
}

export interface CompanyContractRepository extends BaseRepository<any> {
  findByCompanyId(companyId: string): Promise<any[]>;
  list(companyId: string, filters?: any): Promise<any[]>;
  findExpiringContracts(organizationId: string, context?: any): Promise<any[]>;
  create(data: any, context?: any): Promise<any>;
  update(id: string, data: any, context?: any): Promise<any>;
}

export interface CompanyQualificationRepository extends BaseRepository<any> {
  findByCompanyId(companyId: string): Promise<any[]>;
  list(companyId: string, filters?: any): Promise<any[]>;
  findExpiringQualifications(organizationId: string, context?: any): Promise<any[]>;
  create(data: any, context?: any): Promise<any>;
  update(id: string, data: any, context?: any): Promise<any>;
}

export interface CompanyRatingRepository extends BaseRepository<any> {
  findByCompanyId(companyId: string): Promise<any[]>;
  list(companyId: string, filters?: any): Promise<any[]>;
  getAverageRating(companyId: string, context?: any): Promise<number>;
  create(data: any, context?: any): Promise<any>;
  update(id: string, data: any, context?: any): Promise<any>;
}

// Finance repositories
export interface InvoiceRepository extends BaseRepository<any> {
  findByOrganizationId(organizationId: string): Promise<any[]>;
  list(organizationId: string, filters?: any): Promise<any[]>;
}

export interface BudgetRepository extends BaseRepository<any> {
  findByOrganizationId(organizationId: string): Promise<any[]>;
  list(organizationId: string, filters?: any): Promise<any[]>;
}

export interface ExpenseRepository extends BaseRepository<any> {
  findByOrganizationId(organizationId: string): Promise<any[]>;
  list(organizationId: string, filters?: any): Promise<any[]>;
}

export interface AccountRepository extends BaseRepository<any> {
  findByOrganizationId(organizationId: string): Promise<any[]>;
  list(organizationId: string, filters?: any): Promise<any[]>;
}

export interface TransactionRepository extends BaseRepository<any> {
  findByAccountId(accountId: string): Promise<any[]>;
  list(accountId: string, filters?: any): Promise<any[]>;
}

export interface RevenueRepository extends BaseRepository<any> {
  findByOrganizationId(organizationId: string): Promise<any[]>;
  list(organizationId: string, filters?: any): Promise<any[]>;
}

export interface ForecastRepository extends BaseRepository<any> {
  findByOrganizationId(organizationId: string): Promise<any[]>;
  list(organizationId: string, filters?: any): Promise<any[]>;
}

// Analytics repositories
export interface ReportRepository extends BaseRepository<any> {
  findByOrganizationId(organizationId: string): Promise<any[]>;
  list(organizationId: string, filters?: any): Promise<any[]>;
}

export interface DashboardRepository extends BaseRepository<any> {
  findByOrganizationId(organizationId: string): Promise<any[]>;
  list(organizationId: string, filters?: any): Promise<any[]>;
}

export interface ExportJobRepository extends BaseRepository<any> {
  findByOrganizationId(organizationId: string): Promise<any[]>;
  list(organizationId: string, filters?: any): Promise<any[]>;
  run(jobId: string): Promise<any>;
}

// Jobs repositories
export interface JobRepository extends BaseRepository<any> {
  findByOrganizationId(organizationId: string): Promise<any[]>;
  list(organizationId: string, filters?: any): Promise<any[]>;
}

export interface OpportunityRepository extends BaseRepository<any> {
  findByOrganizationId(organizationId: string): Promise<any[]>;
  list(organizationId: string, filters?: any): Promise<any[]>;
}

export interface BidRepository extends BaseRepository<any> {
  findByOpportunityId(opportunityId: string): Promise<any[]>;
  list(opportunityId: string, filters?: any): Promise<any[]>;
}

export interface ContractRepository extends BaseRepository<any> {
  findByJobId(jobId: string): Promise<any[]>;
  list(jobId: string, filters?: any): Promise<any[]>;
}

export interface AssignmentRepository extends BaseRepository<any> {
  findByJobId(jobId: string): Promise<any[]>;
  list(jobId: string, filters?: any): Promise<any[]>;
}

export interface ComplianceRepository extends BaseRepository<any> {
  findByJobId(jobId: string): Promise<any[]>;
  list(jobId: string, filters?: any): Promise<any[]>;
}

export interface RFPRepository extends BaseRepository<any> {
  findByOrganizationId(organizationId: string): Promise<any[]>;
  list(organizationId: string, filters?: any): Promise<any[]>;
}

// Programming repositories
export interface EventRepository extends BaseRepository<any> {
  findByOrganizationId(organizationId: string): Promise<any[]>;
  list(organizationId: string, filters?: any): Promise<any[]>;
}

export interface LineupRepository extends BaseRepository<any> {
  findByEventId(eventId: string): Promise<any[]>;
  list(eventId: string, filters?: any): Promise<any[]>;
}

export interface RiderRepository extends BaseRepository<any> {
  findByEventId(eventId: string): Promise<any[]>;
  list(eventId: string, filters?: any): Promise<any[]>;
}

export interface CallSheetRepository extends BaseRepository<any> {
  findByEventId(eventId: string): Promise<any[]>;
  list(eventId: string, filters?: any): Promise<any[]>;
}

export interface SpaceRepository extends BaseRepository<any> {
  findByOrganizationId(organizationId: string): Promise<any[]>;
  list(organizationId: string, filters?: any): Promise<any[]>;
}

export interface ItineraryRepository extends BaseRepository<any> {
  findByOrganizationId(organizationId: string): Promise<any[]>;
  list(organizationId: string, filters?: any): Promise<any[]>;
}

// Procurement repositories
export interface PurchaseOrderRepository extends BaseRepository<any> {
  findByOrganizationId(organizationId: string): Promise<any[]>;
  list(organizationId: string, filters?: any): Promise<any[]>;
}

export interface CatalogItemRepository extends BaseRepository<any> {
  findByOrganizationId(organizationId: string): Promise<any[]>;
  list(organizationId: string, filters?: any, pagination?: any, sorting?: any): Promise<any[]>;
}

// People repositories
export interface PersonRepository extends BaseRepository<any> {
  findByOrganizationId(organizationId: string): Promise<any[]>;
  list(organizationId: string, filters?: any): Promise<any[]>;
}

export interface EndorsementRepository extends BaseRepository<any> {
  findByPersonId(personId: string): Promise<any[]>;
  getAverageRating(personId: string, competencyId?: string): Promise<number>;
  list(personId: string, filters?: any): Promise<any[]>;
}

// API Keys repositories
export interface ApiKeyRepository extends BaseRepository<any> {
  findByOrganizationId(organizationId: string): Promise<any[]>;
  findByHash(hash: string): Promise<any | null>;
  listByOrg(organizationId: string): Promise<any[]>;
  deactivate(id: string): Promise<void>;
}

// Assets repositories
export interface AssetRepository extends BaseRepository<any> {
  findByOrganizationId(organizationId: string): Promise<any[]>;
  list(organizationId: string, filters?: any): Promise<any[]>;
}

export interface AssetAdvancingRepository extends BaseRepository<any> {
  findByAssetId(assetId: string): Promise<any[]>;
  list(assetId: string, filters?: any): Promise<any[]>;
}

export interface AssetAssignmentRepository extends BaseRepository<any> {
  findByAssetId(assetId: string): Promise<any[]>;
  list(assetId: string, filters?: any): Promise<any[]>;
}

export interface AssetTrackingRepository extends BaseRepository<any> {
  findByAssetId(assetId: string): Promise<any[]>;
  list(assetId: string, filters?: any): Promise<any[]>;
}
export interface AssetMaintenanceRepository extends BaseRepository<any> {
  findByAssetId(assetId: string): Promise<any[]>;
  list(assetId: string, filters?: any): Promise<any[]>;
  scheduleMaintenance(assetId: string, schedule: any): Promise<any>;
}
