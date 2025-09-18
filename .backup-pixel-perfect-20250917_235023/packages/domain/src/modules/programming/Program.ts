export interface Program {
  id: string;
  organizationId: string;
  name: string;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProgramRepository {
  findById(id: string, orgId: string): Promise<Program | null>;
  list(orgId: string, limit?: number, offset?: number): Promise<Program[]>;
  create(entity: Program): Promise<Program>;
  update(id: string, partial: Partial<Program>): Promise<Program>;
  delete(id: string): Promise<void>;
}
