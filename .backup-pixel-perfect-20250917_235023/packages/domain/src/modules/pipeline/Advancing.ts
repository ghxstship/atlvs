export interface AdvancingItem {
  id: string;
  projectId: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assigneeId?: string;
  dueDate?: string;
  completedAt?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdvancingChecklist {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  items: AdvancingItem[];
  completionPercentage: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdvancingRepository {
  // Advancing Items
  listItems(projectId: string): Promise<AdvancingItem[]>;
  getItem(id: string): Promise<AdvancingItem | null>;
  createItem(item: Omit<AdvancingItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<AdvancingItem>;
  updateItem(id: string, updates: Partial<AdvancingItem>): Promise<AdvancingItem>;
  deleteItem(id: string): Promise<void>;

  // Advancing Checklists
  listChecklists(projectId: string): Promise<AdvancingChecklist[]>;
  getChecklist(id: string): Promise<AdvancingChecklist | null>;
  createChecklist(checklist: Omit<AdvancingChecklist, 'id' | 'items' | 'completionPercentage' | 'createdAt' | 'updatedAt'>): Promise<AdvancingChecklist>;
  updateChecklist(id: string, updates: Partial<AdvancingChecklist>): Promise<AdvancingChecklist>;
  deleteChecklist(id: string): Promise<void>;

  // Bulk operations
  getProjectAdvancing(projectId: string): Promise<{
    items: AdvancingItem[];
    checklists: AdvancingChecklist[];
  }>;
  updateItemStatus(id: string, status: AdvancingItem['status'], notes?: string): Promise<AdvancingItem>;
  calculateChecklistCompletion(checklistId: string): Promise<number>;
}
