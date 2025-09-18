export interface Report {
  id: string;
  organizationId: string;
  name: string;
  definition: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReportRepository {
  findById(id: string, orgId: string): Promise<Report | null>;
  list(orgId: string, limit?: number, offset?: number): Promise<Report[]>;
  create(entity: Report): Promise<Report>;
  update(id: string, partial: Partial<Report>): Promise<Report>;
}
