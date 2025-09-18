export interface PipelineStage {
  id: string;
  organizationId: string;
  name: string;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PipelineRepository {
  listStages(orgId: string): Promise<PipelineStage[]>;
  createStage(stage: PipelineStage): Promise<PipelineStage>; 
  updateStage(id: string, partial: Partial<PipelineStage>): Promise<PipelineStage>;
  deleteStage(id: string): Promise<void>;
}
