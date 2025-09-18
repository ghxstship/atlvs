import { 
  Asset, 
  AssetRepository, 
  AssetFilters,
  AssetAdvancing, 
  AssetAdvancingRepository, 
  AssetAdvancingFilters,
  AssetAssignment, 
  AssetAssignmentRepository, 
  AssetAssignmentFilters,
  AssetTracking, 
  AssetTrackingRepository, 
  AssetTrackingFilters,
  AssetMaintenance, 
  AssetMaintenanceRepository, 
  AssetMaintenanceFilters,
  AssetReport, 
  AssetReportRepository, 
  AssetReportFilters,
  AssetAnalytics,
  AssetReportParameters
} from '@ghxstship/domain';
// Note: Using any types temporarily until infrastructure interfaces are properly defined
type AuditLogger = any;
type EventBus = any;

export class AssetsService {
  constructor(
    private readonly repos: {
      assets: AssetRepository;
      advancing: AssetAdvancingRepository;
      assignments: AssetAssignmentRepository;
      tracking: AssetTrackingRepository;
      maintenance: AssetMaintenanceRepository;
      reports: AssetReportRepository;
    },
    private readonly audit: AuditLogger,
    private readonly bus: EventBus
  ) {}

  // Asset Management
  async getAssets(organizationId: string, filters?: AssetFilters): Promise<Asset[]> {
    const assets = await this.repos.assets.findByOrganization(organizationId, filters);
    
    await this.audit.log({
      action: 'assets.list',
      organizationId,
      metadata: { count: assets.length, filters }
    });

    return assets;
  }

  async getAsset(id: string, organizationId: string): Promise<Asset | null> {
    const asset = await this.repos.assets.findById(id, organizationId);
    
    if (asset) {
      await this.audit.log({
        action: 'assets.read',
        organizationId,
        resourceId: id,
        metadata: { assetName: asset.name }
      });
    }

    return asset;
  }

  async createAsset(organizationId: string, userId: string, data: Omit<Asset, 'id' | 'createdAt' | 'updatedAt' | 'organizationId' | 'createdBy' | 'updatedBy'>): Promise<Asset> {
    const asset = await this.repos.assets.create({
      ...data,
      organizationId,
      createdBy: userId,
      updatedBy: userId
    });

    await this.audit.log({
      action: 'assets.create',
      organizationId,
      resourceId: asset.id,
      userId,
      metadata: { assetName: asset.name, category: asset.category }
    });

    await this.bus.publish('asset.created', { asset, organizationId, userId });

    return asset;
  }

  async updateAsset(id: string, organizationId: string, userId: string, updates: Partial<Asset>): Promise<Asset> {
    const asset = await this.repos.assets.update(id, organizationId, {
      ...updates,
      updatedBy: userId,
      updatedAt: new Date()
    });

    await this.audit.log({
      action: 'assets.update',
      organizationId,
      resourceId: id,
      userId,
      metadata: { updates }
    });

    await this.bus.publish('asset.updated', { asset, organizationId, userId });

    return asset;
  }

  async deleteAsset(id: string, organizationId: string, userId: string): Promise<void> {
    // Check for active assignments
    const assignments = await this.repos.assignments.findByAsset(organizationId, id);
    const activeAssignments = assignments.filter((a: any) => a.status === 'active');
    
    if (activeAssignments.length > 0) {
      throw new Error('Cannot delete asset with active assignments');
    }

    await this.repos.assets.delete(id, organizationId);

    await this.audit.log({
      action: 'assets.delete',
      organizationId,
      resourceId: id,
      userId
    });

    await this.bus.publish('asset.deleted', { assetId: id, organizationId, userId });
  }

  // Asset Advancing Management
  async getAdvancingItems(organizationId: string, filters?: AssetAdvancingFilters): Promise<AssetAdvancing[]> {
    const items = await this.repos.advancing.findByOrganization(organizationId, filters);
    
    await this.audit.log({
      action: 'assets.advancing.list',
      organizationId,
      metadata: { count: items.length, filters }
    });

    return items;
  }

  async createAdvancingItem(organizationId: string, userId: string, data: Omit<AssetAdvancing, 'id' | 'createdAt' | 'updatedAt' | 'organizationId' | 'createdBy' | 'updatedBy'>): Promise<AssetAdvancing> {
    const item = await this.repos.advancing.create({
      ...data,
      organizationId,
      createdBy: userId,
      updatedBy: userId
    });

    await this.audit.log({
      action: 'assets.advancing.create',
      organizationId,
      resourceId: item.id,
      userId,
      metadata: { title: item.title, category: item.category }
    });

    await this.bus.publish('asset.advancing.created', { item, organizationId, userId });

    return item;
  }

  // Asset Assignment Management
  async getAssignments(organizationId: string, filters?: AssetAssignmentFilters): Promise<AssetAssignment[]> {
    const assignments = await this.repos.assignments.findByOrganization(organizationId, filters);
    
    await this.audit.log({
      action: 'assets.assignments.list',
      organizationId,
      metadata: { count: assignments.length, filters }
    });

    return assignments;
  }

  async createAssignment(organizationId: string, userId: string, data: Omit<AssetAssignment, 'id' | 'createdAt' | 'updatedAt' | 'organizationId' | 'createdBy' | 'updatedBy'>): Promise<AssetAssignment> {
    // Check if asset is available
    const asset = await this.repos.assets.findById(data.assetId, organizationId);
    if (!asset) {
      throw new Error('Asset not found');
    }
    
    if (asset.status !== 'available') {
      throw new Error('Asset is not available for assignment');
    }

    const assignment = await this.repos.assignments.create({
      ...data,
      organizationId,
      createdBy: userId,
      updatedBy: userId
    });

    // Update asset status to in_use
    await this.repos.assets.update(data.assetId, organizationId, {
      status: 'in_use',
      assignedTo: data.assignedTo,
      updatedBy: userId,
      updatedAt: new Date()
    });

    await this.audit.log({
      action: 'assets.assignments.create',
      organizationId,
      resourceId: assignment.id,
      userId,
      metadata: { assetId: data.assetId, assignedTo: data.assignedTo }
    });

    await this.bus.publish('asset.assigned', { assignment, organizationId, userId });

    return assignment;
  }

  async returnAsset(assignmentId: string, organizationId: string, userId: string, condition: string, notes?: string): Promise<AssetAssignment> {
    const assignment = await this.repos.assignments.findById(assignmentId, organizationId);
    if (!assignment) {
      throw new Error('Assignment not found');
    }

    const updatedAssignment = await this.repos.assignments.update(assignmentId, organizationId, {
      status: 'returned',
      actualReturnDate: new Date(),
      condition: condition as any,
      checkinNotes: notes,
      updatedBy: userId,
      updatedAt: new Date()
    });

    // Update asset status back to available
    await this.repos.assets.update(assignment.assetId, organizationId, {
      status: 'available',
      assignedTo: undefined,
      updatedBy: userId,
      updatedAt: new Date()
    });

    await this.audit.log({
      action: 'assets.assignments.return',
      organizationId,
      resourceId: assignmentId,
      userId,
      metadata: { assetId: assignment.assetId, condition }
    });

    await this.bus.publish('asset.returned', { assignment: updatedAssignment, organizationId, userId });

    return updatedAssignment;
  }

  // Asset Tracking Management
  async getTrackingData(organizationId: string, filters?: AssetTrackingFilters): Promise<AssetTracking[]> {
    const tracking = await this.repos.tracking.findByOrganization(organizationId, filters);
    
    await this.audit.log({
      action: 'assets.tracking.list',
      organizationId,
      metadata: { count: tracking.length, filters }
    });

    return tracking;
  }

  async updateAssetLocation(assetId: string, organizationId: string, userId: string, location: string, coordinates?: { latitude: number; longitude: number }): Promise<AssetTracking> {
    let tracking = await this.repos.tracking.findByAsset(organizationId, assetId);
    
    if (!tracking) {
      // Create new tracking record
      tracking = await this.repos.tracking.create({
        organizationId,
        assetId,
        trackingMethod: 'manual',
        status: 'active',
        location,
        coordinates,
        lastSeenAt: new Date(),
        lastSeenBy: userId,
        createdBy: userId,
        updatedBy: userId
      });
    } else {
      // Update existing tracking
      tracking = await this.repos.tracking.updateLocation(tracking.id, organizationId, location, coordinates);
    }

    await this.audit.log({
      action: 'assets.tracking.update',
      organizationId,
      resourceId: tracking.id,
      userId,
      metadata: { assetId, location }
    });

    return tracking;
  }

  // Asset Maintenance Management
  async getMaintenanceRecords(organizationId: string, filters?: AssetMaintenanceFilters): Promise<AssetMaintenance[]> {
    const maintenance = await this.repos.maintenance.findByOrganization(organizationId, filters);
    
    await this.audit.log({
      action: 'assets.maintenance.list',
      organizationId,
      metadata: { count: maintenance.length, filters }
    });

    return maintenance;
  }

  async scheduleMaintenace(organizationId: string, userId: string, data: Omit<AssetMaintenance, 'id' | 'createdAt' | 'updatedAt' | 'organizationId' | 'createdBy' | 'updatedBy'>): Promise<AssetMaintenance> {
    const maintenance = await this.repos.maintenance.create({
      ...data,
      organizationId,
      createdBy: userId,
      updatedBy: userId
    });

    await this.audit.log({
      action: 'assets.maintenance.schedule',
      organizationId,
      resourceId: maintenance.id,
      userId,
      metadata: { assetId: data.assetId, type: data.type }
    });

    await this.bus.publish('asset.maintenance.scheduled', { maintenance, organizationId, userId });

    return maintenance;
  }

  // Asset Reports Management
  async getReports(organizationId: string, filters?: AssetReportFilters): Promise<AssetReport[]> {
    const reports = await this.repos.reports.findByOrganization(organizationId, filters);
    
    await this.audit.log({
      action: 'assets.reports.list',
      organizationId,
      metadata: { count: reports.length, filters }
    });

    return reports;
  }

  async generateReport(organizationId: string, userId: string, data: Omit<AssetReport, 'id' | 'createdAt' | 'updatedAt' | 'organizationId' | 'createdBy' | 'updatedBy' | 'generatedAt' | 'generatedBy'>): Promise<AssetReport> {
    const report = await this.repos.reports.create({
      ...data,
      organizationId,
      generatedBy: userId,
      createdBy: userId,
      updatedBy: userId
    });

    await this.audit.log({
      action: 'assets.reports.generate',
      organizationId,
      resourceId: report.id,
      userId,
      metadata: { type: report.type, format: report.format }
    });

    await this.bus.publish('asset.report.generated', { report, organizationId, userId });

    return report;
  }

  async getAnalytics(organizationId: string, parameters: AssetReportParameters): Promise<AssetAnalytics> {
    const analytics = await this.repos.reports.generateAnalytics(organizationId, parameters);
    
    await this.audit.log({
      action: 'assets.analytics.generate',
      organizationId,
      metadata: { parameters }
    });

    return analytics;
  }
}
