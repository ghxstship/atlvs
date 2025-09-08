export interface OnboardingTask {
  id: string;
  organizationId: string;
  title: string;
  description?: string;
  category: 'documentation' | 'training' | 'equipment' | 'access' | 'compliance' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedDuration?: number; // minutes
  required: boolean;
  instructions?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OnboardingAssignment {
  id: string;
  taskId: string;
  userId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'waived' | 'overdue';
  assignedAt: string;
  startedAt?: string;
  completedAt?: string;
  waivedAt?: string;
  waivedBy?: string;
  waiverReason?: string;
  notes?: string;
  attachments?: string[];
}

export interface OnboardingProgram {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  tasks: OnboardingTask[];
  isDefault: boolean;
  targetRoles?: string[];
  estimatedDuration?: number; // total minutes
  createdAt?: string;
  updatedAt?: string;
}

export interface OnboardingRepository {
  // Onboarding Tasks
  listTasks(organizationId: string): Promise<OnboardingTask[]>;
  getTask(id: string): Promise<OnboardingTask | null>;
  createTask(task: Omit<OnboardingTask, 'id' | 'createdAt' | 'updatedAt'>): Promise<OnboardingTask>;
  updateTask(id: string, updates: Partial<OnboardingTask>): Promise<OnboardingTask>;
  deleteTask(id: string): Promise<void>;

  // Onboarding Assignments
  listAssignments(userId?: string, taskId?: string): Promise<OnboardingAssignment[]>;
  getAssignment(id: string): Promise<OnboardingAssignment | null>;
  createAssignment(assignment: Omit<OnboardingAssignment, 'id'>): Promise<OnboardingAssignment>;
  updateAssignment(id: string, updates: Partial<OnboardingAssignment>): Promise<OnboardingAssignment>;
  deleteAssignment(id: string): Promise<void>;

  // Onboarding Programs
  listPrograms(organizationId: string): Promise<OnboardingProgram[]>;
  getProgram(id: string): Promise<OnboardingProgram | null>;
  createProgram(program: Omit<OnboardingProgram, 'id' | 'tasks' | 'estimatedDuration' | 'createdAt' | 'updatedAt'>): Promise<OnboardingProgram>;
  updateProgram(id: string, updates: Partial<OnboardingProgram>): Promise<OnboardingProgram>;
  deleteProgram(id: string): Promise<void>;

  // Bulk operations
  getUserOnboarding(userId: string): Promise<{
    assignments: OnboardingAssignment[];
    completionPercentage: number;
  }>;
  assignProgramToUser(programId: string, userId: string): Promise<OnboardingAssignment[]>;
  waiveAssignment(assignmentId: string, waivedBy: string, reason: string): Promise<OnboardingAssignment>;
  calculateProgramDuration(programId: string): Promise<number>;
}
