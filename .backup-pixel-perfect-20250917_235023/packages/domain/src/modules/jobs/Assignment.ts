export type AssignmentStatus = 'pending' | 'accepted' | 'declined' | 'in_progress' | 'completed' | 'cancelled';
export type AssignmentType = 'contractor' | 'employee' | 'consultant' | 'vendor';

export interface JobAssignment {
  id: string;
  organizationId: string;
  jobId: string;
  assigneeUserId?: string;
  assigneeCompanyId?: string;
  assigneeType: AssignmentType;
  status: AssignmentStatus;
  role?: string;
  responsibilities?: string[];
  startDate?: string;
  endDate?: string;
  hourlyRate?: number;
  totalBudget?: number;
  currency?: string;
  note?: string;
  assignedAt: string;
  acceptedAt?: string;
  completedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAssignmentRequest {
  organizationId: string;
  jobId: string;
  assigneeUserId?: string;
  assigneeCompanyId?: string;
  assigneeType: AssignmentType;
  role?: string;
  responsibilities?: string[];
  startDate?: string;
  endDate?: string;
  hourlyRate?: number;
  totalBudget?: number;
  currency?: string;
  note?: string;
}

export interface UpdateAssignmentRequest {
  status?: AssignmentStatus;
  role?: string;
  responsibilities?: string[];
  startDate?: string;
  endDate?: string;
  hourlyRate?: number;
  totalBudget?: number;
  currency?: string;
  note?: string;
}

export interface AssignmentFilters {
  status?: AssignmentStatus[];
  assigneeType?: AssignmentType[];
  assigneeUserId?: string;
  assigneeCompanyId?: string;
  jobId?: string;
  startDate?: {
    from?: string;
    to?: string;
  };
  endDate?: {
    from?: string;
    to?: string;
  };
}

export interface AssignmentRepository {
  findById(id: string, orgId: string): Promise<JobAssignment | null>;
  list(orgId: string, filters?: AssignmentFilters, limit?: number, offset?: number): Promise<JobAssignment[]>;
  create(entity: JobAssignment): Promise<JobAssignment>;
  update(id: string, orgId: string, partial: Partial<JobAssignment>): Promise<JobAssignment>;
  delete(id: string, orgId: string): Promise<void>;
  accept(id: string, orgId: string): Promise<JobAssignment>;
  decline(id: string, orgId: string, reason?: string): Promise<JobAssignment>;
  complete(id: string, orgId: string): Promise<JobAssignment>;
  getStats(orgId: string): Promise<{
    totalAssignments: number;
    activeAssignments: number;
    completedAssignments: number;
    pendingAssignments: number;
    countByStatus: Record<AssignmentStatus, number>;
    countByType: Record<AssignmentType, number>;
  }>;
}
