/**
 * Project Data Transfer Object
 */

export interface ProjectDTO {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  status: string;
  priority: string;
  type: string;
  progress: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}
