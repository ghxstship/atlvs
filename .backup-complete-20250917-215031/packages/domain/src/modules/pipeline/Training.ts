export interface Training {
  id: string;
  organizationId: string;
  title: string;
  description?: string;
  category: 'safety' | 'technical' | 'compliance' | 'soft_skills' | 'certification' | 'other';
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  duration: number; // minutes
  format: 'in_person' | 'online' | 'hybrid' | 'self_paced';
  maxParticipants?: number;
  prerequisites?: string[];
  materials?: string[];
  certificationRequired: boolean;
  validityPeriod?: number; // days
  instructorId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TrainingSession {
  id: string;
  trainingId: string;
  title: string;
  scheduledAt: string;
  duration: number; // minutes
  location?: string;
  instructorId?: string;
  maxParticipants?: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TrainingAttendance {
  id: string;
  sessionId: string;
  userId: string;
  status: 'registered' | 'attended' | 'absent' | 'cancelled';
  registeredAt: string;
  attendedAt?: string;
  completionPercentage?: number;
  score?: number;
  passed?: boolean;
  certificateIssued?: boolean;
  notes?: string;
}

export interface TrainingProgram {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  trainings: Training[];
  requiredTrainings: string[]; // training IDs
  optionalTrainings: string[]; // training IDs
  targetRoles?: string[];
  estimatedDuration?: number; // total minutes
  createdAt?: string;
  updatedAt?: string;
}

export interface TrainingRepository {
  // Trainings
  listTrainings(organizationId: string): Promise<Training[]>;
  getTraining(id: string): Promise<Training | null>;
  createTraining(training: Omit<Training, 'id' | 'createdAt' | 'updatedAt'>): Promise<Training>;
  updateTraining(id: string, updates: Partial<Training>): Promise<Training>;
  deleteTraining(id: string): Promise<void>;

  // Training Sessions
  listSessions(trainingId?: string): Promise<TrainingSession[]>;
  getSession(id: string): Promise<TrainingSession | null>;
  createSession(session: Omit<TrainingSession, 'id' | 'createdAt' | 'updatedAt'>): Promise<TrainingSession>;
  updateSession(id: string, updates: Partial<TrainingSession>): Promise<TrainingSession>;
  deleteSession(id: string): Promise<void>;

  // Training Attendance
  listAttendance(sessionId?: string, userId?: string): Promise<TrainingAttendance[]>;
  getAttendance(id: string): Promise<TrainingAttendance | null>;
  createAttendance(attendance: Omit<TrainingAttendance, 'id'>): Promise<TrainingAttendance>;
  updateAttendance(id: string, updates: Partial<TrainingAttendance>): Promise<TrainingAttendance>;
  deleteAttendance(id: string): Promise<void>;

  // Training Programs
  listPrograms(organizationId: string): Promise<TrainingProgram[]>;
  getProgram(id: string): Promise<TrainingProgram | null>;
  createProgram(program: Omit<TrainingProgram, 'id' | 'trainings' | 'estimatedDuration' | 'createdAt' | 'updatedAt'>): Promise<TrainingProgram>;
  updateProgram(id: string, updates: Partial<TrainingProgram>): Promise<TrainingProgram>;
  deleteProgram(id: string): Promise<void>;

  // Bulk operations
  getUserTrainingHistory(userId: string): Promise<{
    attendance: TrainingAttendance[];
    completedTrainings: Training[];
    upcomingSessions: TrainingSession[];
  }>;
  registerUserForSession(sessionId: string, userId: string): Promise<TrainingAttendance>;
  markAttendance(sessionId: string, userId: string, attended: boolean, score?: number): Promise<TrainingAttendance>;
  calculateProgramCompletion(programId: string, userId: string): Promise<number>;
}
