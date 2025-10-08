// Performance Types and Utilities

import { z as zod } from 'zod';

// ============================================================================
// Core Types
// ============================================================================

export interface PerformanceReview {
  id: string;
  organization_id: string;
  user_id: string;
  reviewer_id: string;
  reviewer_name?: string | null;
  review_period_start: string;
  review_period_end: string;
  review_type: ReviewType;
  status: ReviewStatus;
  overall_rating?: number | null;
  technical_skills_rating?: number | null;
  communication_rating?: number | null;
  teamwork_rating?: number | null;
  leadership_rating?: number | null;
  goals: PerformanceGoal[];
  achievements: string[];
  areas_for_improvement?: string | null;
  strengths?: string | null;
  development_plan: string[];
  reviewer_comments?: string | null;
  employee_comments?: string | null;
  manager_comments?: string | null;
  hr_comments?: string | null;
  next_review_date?: string | null;
  salary_adjustment?: string | null;
  promotion_recommended: boolean;
  visibility: ReviewVisibility;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface PerformanceGoal {
  id: string;
  title: string;
  description: string;
  target_date: string;
  status: GoalStatus;
  progress_percentage: number;
  priority: GoalPriority;
  category: GoalCategory;
  metrics: string[];
  notes?: string;
}

export type ReviewType = 
  | 'annual'
  | 'quarterly'
  | 'project-based'
  | 'probationary';

export type ReviewStatus = 
  | 'draft'
  | 'submitted'
  | 'approved'
  | 'archived';

export type GoalStatus = 
  | 'not_started'
  | 'in_progress'
  | 'completed'
  | 'on_hold'
  | 'cancelled';

export type GoalPriority = 
  | 'low'
  | 'medium'
  | 'high'
  | 'critical';

export type GoalCategory = 
  | 'performance'
  | 'development'
  | 'leadership'
  | 'technical'
  | 'behavioral'
  | 'strategic';

export type ReviewVisibility = 
  | 'private'
  | 'manager'
  | 'hr'
  | 'organization';

export type PerformanceViewType = 
  | 'list'
  | 'grid'
  | 'table'
  | 'analytics';

export interface PerformanceFormData {
  reviewer_name: string;
  review_period_start: string;
  review_period_end: string;
  review_type: ReviewType;
  status: ReviewStatus;
  overall_rating: number;
  technical_skills_rating: number;
  communication_rating: number;
  teamwork_rating: number;
  leadership_rating: number;
  goals: PerformanceGoal[];
  achievements: string[];
  areas_for_improvement: string;
  strengths: string;
  development_plan: string[];
  reviewer_comments: string;
  employee_comments: string;
  manager_comments: string;
  hr_comments: string;
  next_review_date: string;
  salary_adjustment: string;
  promotion_recommended: boolean;
  visibility: ReviewVisibility;
  tags: string[];
}

export interface PerformanceFilters {
  search?: string;
  review_type?: ReviewType | 'all';
  status?: ReviewStatus | 'all';
  visibility?: ReviewVisibility | 'all';
  reviewer?: string | 'all';
  rating_min?: number;
  rating_max?: number;
  date_from?: string;
  date_to?: string;
  has_goals?: boolean;
  promotion_recommended?: boolean;
}

export interface PerformanceSort {
  field: 'review_period_start' | 'review_period_end' | 'overall_rating' | 'created_at' | 'status';
  direction: 'asc' | 'desc';
}

export interface PerformanceStats {
  totalReviews: number;
  completedReviews: number;
  averageRating: number;
  promotionRate: number;
  byType: Array<{
    type: ReviewType;
    count: number;
    averageRating: number;
  }>;
  byStatus: Array<{
    status: ReviewStatus;
    count: number;
  }>;
  ratingDistribution: Array<{
    rating: number;
    count: number;
  }>;
  goalCompletion: {
    total: number;
    completed: number;
    inProgress: number;
    notStarted: number;
  };
  topStrengths: Array<{
    strength: string;
    frequency: number;
  }>;
  developmentAreas: Array<{
    area: string;
    frequency: number;
  }>;
}

export interface PerformanceAnalytics {
  performanceTrends: Array<{
    period: string;
    averageRating: number;
    reviewCount: number;
    promotions: number;
  }>;
  goalAnalytics: Array<{
    category: GoalCategory;
    totalGoals: number;
    completedGoals: number;
    averageProgress: number;
  }>;
  competencyBreakdown: Array<{
    competency: string;
    averageRating: number;
    improvementTrend: number;
  }>;
  reviewerInsights: Array<{
    reviewer: string;
    reviewCount: number;
    averageRating: number;
    consistency: number;
  }>;
  careerProgression: Array<{
    year: number;
    rating: number;
    promotion: boolean;
    salaryAdjustment?: string;
  }>;
  benchmarkComparison: {
    organizationAverage: number;
    industryAverage: number;
    userRating: number;
    percentile: number;
  };
}

// ============================================================================
// Schemas
// ============================================================================

export const reviewTypeSchema = zod.enum([
  'annual',
  'quarterly',
  'project-based',
  'probationary',
]);

export const reviewStatusSchema = zod.enum([
  'draft',
  'submitted',
  'approved',
  'archived',
]);

export const goalStatusSchema = zod.enum([
  'not_started',
  'in_progress',
  'completed',
  'on_hold',
  'cancelled',
]);

export const goalPrioritySchema = zod.enum([
  'low',
  'medium',
  'high',
  'critical',
]);

export const goalCategorySchema = zod.enum([
  'performance',
  'development',
  'leadership',
  'technical',
  'behavioral',
  'strategic',
]);

export const reviewVisibilitySchema = zod.enum([
  'private',
  'manager',
  'hr',
  'organization',
]);

export const performanceGoalSchema = zod.object({
  id: zod.string(),
  title: zod.string().min(1, 'Goal title is required'),
  description: zod.string(),
  target_date: zod.string(),
  status: goalStatusSchema,
  progress_percentage: zod.number().min(0).max(100),
  priority: goalPrioritySchema,
  category: goalCategorySchema,
  metrics: zod.array(zod.string()),
  notes: zod.string().optional()
});

export const performanceFilterSchema = zod.object({
  search: zod.string().optional(),
  review_type: zod.union([reviewTypeSchema, zod.literal('all')]).optional(),
  status: zod.union([reviewStatusSchema, zod.literal('all')]).optional(),
  visibility: zod.union([reviewVisibilitySchema, zod.literal('all')]).optional(),
  reviewer: zod.string().optional(),
  rating_min: zod.number().min(1).max(5).optional(),
  rating_max: zod.number().min(1).max(5).optional(),
  date_from: zod.string().optional(),
  date_to: zod.string().optional(),
  has_goals: zod.boolean().optional(),
  promotion_recommended: zod.boolean().optional()
});

export const performanceUpsertSchema = zod.object({
  reviewer_name: zod.string().optional().nullable(),
  review_period_start: zod.string(),
  review_period_end: zod.string(),
  review_type: reviewTypeSchema,
  status: reviewStatusSchema,
  overall_rating: zod.number().min(1).max(5),
  goals_rating: zod.number().min(1).max(5).optional().nullable(),
  competencies_rating: zod.number().min(1).max(5).optional().nullable(),
  leadership_rating: zod.number().min(1).max(5).optional().nullable(),
  communication_rating: zod.number().min(1).max(5).optional().nullable(),
  technical_rating: zod.number().min(1).max(5).optional().nullable(),
  goals: zod.array(performanceGoalSchema),
  achievements: zod.array(zod.string()),
  areas_for_improvement: zod.array(zod.string()),
  strengths: zod.array(zod.string()),
  development_plan: zod.array(zod.string()),
  reviewer_comments: zod.string().optional().nullable(),
  employee_comments: zod.string().optional().nullable(),
  manager_comments: zod.string().optional().nullable(),
  hr_comments: zod.string().optional().nullable(),
  next_review_date: zod.string().optional().nullable(),
  salary_adjustment: zod.string().optional().nullable(),
  promotion_recommended: zod.boolean(),
  visibility: reviewVisibilitySchema,
  tags: zod.array(zod.string())
});

// ============================================================================
// Constants
// ============================================================================

export const REVIEW_TYPE_LABELS: Record<ReviewType, string> = {
  annual: 'Annual Review',
  quarterly: 'Quarterly Review',
  'project-based': 'Project-Based Review',
  probationary: 'Probationary Review'
};

export const REVIEW_STATUS_LABELS: Record<ReviewStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  approved: 'Approved',
  archived: 'Archived'
};

export const GOAL_STATUS_LABELS: Record<GoalStatus, string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  completed: 'Completed',
  on_hold: 'On Hold',
  cancelled: 'Cancelled'
};

export const GOAL_PRIORITY_LABELS: Record<GoalPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical'
};

export const GOAL_CATEGORY_LABELS: Record<GoalCategory, string> = {
  performance: 'Performance',
  development: 'Development',
  leadership: 'Leadership',
  technical: 'Technical',
  behavioral: 'Behavioral',
  strategic: 'Strategic'
};

export const VISIBILITY_LABELS: Record<ReviewVisibility, string> = {
  private: 'Private',
  manager: 'Manager Only',
  hr: 'HR Access',
  organization: 'Organization'
};

export const VIEW_CONFIG: Record<PerformanceViewType, { label: string; description: string }> = {
  list: {
    label: 'List',
    description: 'Detailed list view with expandable cards'
  },
  grid: {
    label: 'Grid',
    description: 'Card-based grid layout'
  },
  table: {
    label: 'Table',
    description: 'Sortable data table'
  },
  analytics: {
    label: 'Analytics',
    description: 'Performance insights and trends'
  }
};

export const QUICK_FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Approved', value: 'approved' },
  { label: 'High Rated', value: 'high_rated' },
  { label: 'Recent', value: 'recent' },
  { label: 'Promotions', value: 'promotions' },
];

export const RATING_LABELS = {
  1: 'Needs Improvement',
  2: 'Below Expectations',
  3: 'Meets Expectations',
  4: 'Exceeds Expectations',
  5: 'Outstanding'
};

// ============================================================================
// Utility Functions
// ============================================================================

export function createEmptyFormData(): PerformanceFormData {
  return {
    reviewer_name: '',
    review_period_start: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    review_period_end: new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0],
    review_type: 'annual',
    status: 'draft',
    overall_rating: 3,
    technical_skills_rating: 3,
    communication_rating: 3,
    teamwork_rating: 3,
    leadership_rating: 3,
    goals: [],
    achievements: [],
    areas_for_improvement: '',
    strengths: '',
    development_plan: [],
    reviewer_comments: '',
    employee_comments: '',
    manager_comments: '',
    hr_comments: '',
    next_review_date: '',
    salary_adjustment: '',
    promotion_recommended: false,
    visibility: 'manager',
    tags: []
  };
}

export function createEmptyGoal(): PerformanceGoal {
  return {
    id: crypto.randomUUID(),
    title: '',
    description: '',
    target_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'not_started',
    progress_percentage: 0,
    priority: 'medium',
    category: 'performance',
    metrics: [],
    notes: ''
  };
}

export function createEmptyStats(): PerformanceStats {
  return {
    totalReviews: 0,
    completedReviews: 0,
    averageRating: 0,
    promotionRate: 0,
    byType: [],
    byStatus: [],
    ratingDistribution: [],
    goalCompletion: {
      total: 0,
      completed: 0,
      inProgress: 0,
      notStarted: 0
    },
    topStrengths: [],
    developmentAreas: []
  };
}

export function createEmptyAnalytics(): PerformanceAnalytics {
  return {
    performanceTrends: [],
    goalAnalytics: [],
    competencyBreakdown: [],
    reviewerInsights: [],
    careerProgression: [],
    benchmarkComparison: {
      organizationAverage: 0,
      industryAverage: 0,
      userRating: 0,
      percentile: 0
    }
  };
}

export function validatePerformanceForm(data: PerformanceFormData): Record<string, string> {
  const errors: Record<string, string> = {};
  
  if (!data.review_period_start) {
    errors.review_period_start = 'Review period start date is required';
  }
  
  if (!data.review_period_end) {
    errors.review_period_end = 'Review period end date is required';
  }
  
  if (data.review_period_end && data.review_period_start && 
      new Date(data.review_period_end) <= new Date(data.review_period_start)) {
    errors.review_period_end = 'End date must be after start date';
  }
  
  if (data.overall_rating < 1 || data.overall_rating > 5) {
    errors.overall_rating = 'Overall rating must be between 1 and 5';
  }
  
  if (data.next_review_date && 
      new Date(data.next_review_date) <= new Date(data.review_period_end)) {
    errors.next_review_date = 'Next review date should be after current review period';
  }
  
  return errors;
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function formatDateShort(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function formatReviewPeriod(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (start.getFullYear() === end.getFullYear()) {
    return `${start.toLocaleDateString('en-US', { month: 'short' })} - ${end.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
  }
  
  return `${start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
}

export function getRatingColor(rating: number): string {
  if (rating >= 4.5) return 'green';
  if (rating >= 3.5) return 'blue';
  if (rating >= 2.5) return 'yellow';
  return 'red';
}

export function getRatingLabel(rating: number): string {
  const rounded = Math.round(rating);
  return RATING_LABELS[rounded as keyof typeof RATING_LABELS] || 'Unknown';
}

export function getStatusBadgeVariant(status: ReviewStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'approved':
      return 'default';
    case 'submitted':
      return 'secondary';
    case 'draft':
      return 'outline';
    case 'archived':
      return 'destructive';
    default:
      return 'outline';
  }
}

export function getGoalStatusColor(status: GoalStatus): string {
  switch (status) {
    case 'completed':
      return 'green';
    case 'in_progress':
      return 'blue';
    case 'on_hold':
      return 'yellow';
    case 'cancelled':
      return 'red';
    default:
      return 'gray';
  }
}

export function calculateGoalProgress(goals: PerformanceGoal[]): number {
  if (goals.length === 0) return 0;
  const totalProgress = goals.reduce((sum, goal) => sum + goal.progress_percentage, 0);
  return Math.round(totalProgress / goals.length);
}

export function sortPerformanceReviews(
  reviews: PerformanceReview[],
  sort: PerformanceSort
): PerformanceReview[] {
  return [...reviews].sort((a, b) => {
    let comparison = 0;
    
    switch (sort.field) {
      case 'review_period_start':
        comparison = new Date(a.review_period_start).getTime() - new Date(b.review_period_start).getTime();
        break;
      case 'review_period_end':
        comparison = new Date(a.review_period_end).getTime() - new Date(b.review_period_end).getTime();
        break;
      case 'overall_rating':
        const aRating = a.overall_rating ?? 0;
        const bRating = b.overall_rating ?? 0;
        comparison = aRating - bRating;
        break;
      case 'created_at':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
      case 'status':
        const statusOrder = { draft: 1, submitted: 2, approved: 3, archived: 4 };
        comparison = statusOrder[a.status] - statusOrder[b.status];
        break;
    }
    
    return sort.direction === 'asc' ? comparison : -comparison;
  });
}

export function filterPerformanceReviews(
  reviews: PerformanceReview[],
  filters: PerformanceFilters
): PerformanceReview[] {
  return reviews.filter(review => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const strengthsArray = review.strengths ? [review.strengths] : [];
      const areasArray = review.areas_for_improvement ? [review.areas_for_improvement] : [];
      const matchesSearch = 
        review.reviewer_name?.toLowerCase().includes(searchLower) ||
        review.reviewer_comments?.toLowerCase().includes(searchLower) ||
        review.employee_comments?.toLowerCase().includes(searchLower) ||
        review.achievements.some((achievement: string) => achievement.toLowerCase().includes(searchLower)) ||
        strengthsArray.some((strength: string) => strength.toLowerCase().includes(searchLower)) ||
        areasArray.some((area: string) => area.toLowerCase().includes(searchLower)) ||
        review.tags.some((tag: string) => tag.toLowerCase().includes(searchLower));
      if (!matchesSearch) return false;
    }
    
    // Review type filter
    if (filters.review_type && filters.review_type !== 'all') {
      if (review.review_type !== filters.review_type) return false;
    }
    
    // Status filter
    if (filters.status && filters.status !== 'all') {
      if (review.status !== filters.status) return false;
    }
    
    // Visibility filter
    if (filters.visibility && filters.visibility !== 'all') {
      if (review.visibility !== filters.visibility) return false;
    }
    
    // Reviewer filter
    if (filters.reviewer && filters.reviewer !== 'all') {
      if (review.reviewer_name !== filters.reviewer) return false;
    }
    
    // Rating range filter
    const rating = review.overall_rating ?? 0;
    if (filters.rating_min && rating < filters.rating_min) return false;
    if (filters.rating_max && rating > filters.rating_max) return false;
    
    // Date range filter
    if (filters.date_from) {
      if (new Date(review.review_period_start) < new Date(filters.date_from)) return false;
    }
    if (filters.date_to) {
      if (new Date(review.review_period_end) > new Date(filters.date_to)) return false;
    }
    
    // Has goals filter
    if (filters.has_goals) {
      if (review.goals.length === 0) return false;
    }
    
    // Promotion recommended filter
    if (filters.promotion_recommended !== undefined) {
      if (review.promotion_recommended !== filters.promotion_recommended) return false;
    }
    
    return true;
  });
}
