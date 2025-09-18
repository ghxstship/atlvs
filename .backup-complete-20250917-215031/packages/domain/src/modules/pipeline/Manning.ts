export interface ManningSlot {
  id: string;
  projectId: string;
  role: string;
  requiredCount: number;
  filledCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ManningAssignment {
  id: string;
  slotId: string;
  userId: string;
  status: 'assigned' | 'confirmed' | 'declined' | 'completed';
  assignedAt: string;
  confirmedAt?: string;
  completedAt?: string;
  notes?: string;
}

export interface ManningRepository {
  // Manning Slots
  listSlots(projectId: string): Promise<ManningSlot[]>;
  getSlot(id: string): Promise<ManningSlot | null>;
  createSlot(slot: Omit<ManningSlot, 'id' | 'createdAt' | 'updatedAt'>): Promise<ManningSlot>;
  updateSlot(id: string, updates: Partial<ManningSlot>): Promise<ManningSlot>;
  deleteSlot(id: string): Promise<void>;

  // Manning Assignments
  listAssignments(slotId: string): Promise<ManningAssignment[]>;
  getAssignment(id: string): Promise<ManningAssignment | null>;
  createAssignment(assignment: Omit<ManningAssignment, 'id'>): Promise<ManningAssignment>;
  updateAssignment(id: string, updates: Partial<ManningAssignment>): Promise<ManningAssignment>;
  deleteAssignment(id: string): Promise<void>;

  // Bulk operations
  getProjectManning(projectId: string): Promise<{
    slots: ManningSlot[];
    assignments: ManningAssignment[];
  }>;
  updateSlotCounts(slotId: string): Promise<void>;
}
