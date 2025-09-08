export type JobStatus = 'draft' | 'open' | 'in_progress' | 'completed' | 'cancelled';

export interface Job {
  id: string;
  organizationId: string;
  title: string;
  status: JobStatus;
  rfpId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface JobRepository {
  findById(id: string, orgId: string): Promise<Job | null>;
  list(orgId: string, limit?: number, offset?: number): Promise<Job[]>;
  create(entity: Job): Promise<Job>;
  update(id: string, partial: Partial<Job>): Promise<Job>;
}
