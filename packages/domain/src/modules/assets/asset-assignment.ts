export interface AssetAssignment {
  id: string;
  organizationId: string;
  assetId: string;
  assignedTo: string;
  assignedToType: 'user' | 'project' | 'vendor' | 'partner';
  assignedBy: string;
  projectId?: string;
  status: AssetAssignmentStatus;
  condition: AssetCondition;
  assignedDate: Date;
  expectedReturnDate?: Date;
  actualReturnDate?: Date;
  location?: string;
  purpose?: string;
  notes?: string;
  checkoutNotes?: string;
  checkinNotes?: string;
  damageReported?: boolean;
  damageDescription?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export type AssetAssignmentStatus = 
  | 'active'
  | 'returned'
  | 'overdue'
  | 'damaged'
  | 'lost'
  | 'cancelled';

import { AssetCondition } from './Asset';

export interface AssetAssignmentRepository {
  findById(id: string, organizationId: string): Promise<AssetAssignment | null>;
  findByOrganization(organizationId: string, filters?: AssetAssignmentFilters): Promise<AssetAssignment[]>;
  create(assignment: Omit<AssetAssignment, 'id' | 'createdAt' | 'updatedAt'>): Promise<AssetAssignment>;
  update(id: string, organizationId: string, updates: Partial<AssetAssignment>): Promise<AssetAssignment>;
  delete(id: string, organizationId: string): Promise<void>;
  findByAsset(organizationId: string, assetId: string): Promise<AssetAssignment[]>;
  findByAssignee(organizationId: string, assignedTo: string): Promise<AssetAssignment[]>;
  findByProject(organizationId: string, projectId: string): Promise<AssetAssignment[]>;
  findByStatus(organizationId: string, status: AssetAssignmentStatus): Promise<AssetAssignment[]>;
  findOverdue(organizationId: string): Promise<AssetAssignment[]>;
}

export interface AssetAssignmentFilters {
  assetId?: string;
  assignedTo?: string;
  assignedToType?: 'user' | 'project' | 'vendor' | 'partner';
  projectId?: string;
  status?: AssetAssignmentStatus;
  condition?: AssetCondition;
  overdue?: boolean;
  search?: string;
}
