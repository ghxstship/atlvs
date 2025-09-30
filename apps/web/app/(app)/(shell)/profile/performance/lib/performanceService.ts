// Performance Service Layer

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  PerformanceReview,
  PerformanceFilters,
  PerformanceStats,
  PerformanceAnalytics,
} from '../types';
import {
  performanceFilterSchema,
  performanceUpsertSchema,
  filterPerformanceReviews,
  sortPerformanceReviews,
} from '../types';

// ============================================================================
// Fetch Functions
// ============================================================================

export async function fetchPerformanceReviews(
  supabase: SupabaseClient,
  organizationId: string,
  userId: string,
  filters?: PerformanceFilters
): Promise<{ reviews: PerformanceReview[]; total: number }> {
  let query = supabase
    .from('user_performance_reviews')
    .select('*', { count: 'exact' })
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .order('review_period_start', { ascending: false });

  // Apply filters if provided
  if (filters) {
    const validatedFilters = performanceFilterSchema.parse(filters);
    
    if (validatedFilters.review_type && validatedFilters.review_type !== 'all') {
      query = query.eq('review_type', validatedFilters.review_type);
    }
    
    if (validatedFilters.status && validatedFilters.status !== 'all') {
      query = query.eq('status', validatedFilters.status);
    }
    
    if (validatedFilters.visibility && validatedFilters.visibility !== 'all') {
      query = query.eq('visibility', validatedFilters.visibility);
    }
    
    if (validatedFilters.reviewer && validatedFilters.reviewer !== 'all') {
      query = query.eq('reviewer_name', validatedFilters.reviewer);
    }
    
    if (validatedFilters.rating_min) {
      query = query.gte('overall_rating', validatedFilters.rating_min);
    }
    
    if (validatedFilters.rating_max) {
      query = query.lte('overall_rating', validatedFilters.rating_max);
    }
    
    if (validatedFilters.date_from) {
      query = query.gte('review_period_start', validatedFilters.date_from);
    }
    
    if (validatedFilters.date_to) {
      query = query.lte('review_period_end', validatedFilters.date_to);
    }
    
    if (validatedFilters.promotion_recommended !== undefined) {
      query = query.eq('promotion_recommended', validatedFilters.promotion_recommended);
    }
    
    if (validatedFilters.search) {
      query = query.or(
        `reviewer_name.ilike.%${validatedFilters.search}%,` +
        `reviewer_comments.ilike.%${validatedFilters.search}%,` +
        `employee_comments.ilike.%${validatedFilters.search}%`
      );
    }
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching performance reviews:', error);
    throw error;
  }

  return {
    reviews: data || [],
    total: count || 0,
  };
}

export async function fetchPerformanceReviewById(
  supabase: SupabaseClient,
  reviewId: string
): Promise<PerformanceReview | null> {
  const { data, error } = await supabase
    .from('user_performance_reviews')
    .select('*')
    .eq('id', reviewId)
    .single();

  if (error) {
    console.error('Error fetching performance review:', error);
    throw error;
  }

  return data;
}

export async function fetchPerformanceStats(
  supabase: SupabaseClient,
  organizationId: string,
  userId: string
): Promise<PerformanceStats> {
  const { data: reviews, error } = await supabase
    .from('user_performance_reviews')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching performance stats:', error);
    throw error;
  }

  if (!reviews || reviews.length === 0) {
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
        notStarted: 0,
      },
      topStrengths: [],
      developmentAreas: [],
    };
  }

  // Calculate stats
  const totalReviews = reviews.length;
  const completedReviews = reviews.filter(r => r.status === 'completed').length;
  const averageRating = reviews.reduce((sum, r) => sum + r.overall_rating, 0) / totalReviews;
  const promotionRate = reviews.filter(r => r.promotion_recommended).length / totalReviews;

  // Group by type
  const typeMap = new Map<string, { count: number; totalRating: number }>();
  reviews.forEach(r => {
    const existing = typeMap.get(r.review_type) || { count: 0, totalRating: 0 };
    typeMap.set(r.review_type, {
      count: existing.count + 1,
      totalRating: existing.totalRating + r.overall_rating,
    });
  });
  const byType = Array.from(typeMap.entries()).map(([type, data]) => ({
    type: type as unknown,
    count: data.count,
    averageRating: data.totalRating / data.count,
  }));

  // Group by status
  const statusMap = new Map<string, number>();
  reviews.forEach(r => {
    statusMap.set(r.status, (statusMap.get(r.status) || 0) + 1);
  });
  const byStatus = Array.from(statusMap.entries()).map(([status, count]) => ({
    status: status as unknown,
    count,
  }));

  // Rating distribution
  const ratingMap = new Map<number, number>();
  reviews.forEach(r => {
    const rounded = Math.round(r.overall_rating);
    ratingMap.set(rounded, (ratingMap.get(rounded) || 0) + 1);
  });
  const ratingDistribution = Array.from(ratingMap.entries()).map(([rating, count]) => ({
    rating,
    count,
  }));

  // Goal completion stats
  const allGoals = reviews.flatMap(r => r.goals || []);
  const goalCompletion = {
    total: allGoals.length,
    completed: allGoals.filter(g => g.status === 'completed').length,
    inProgress: allGoals.filter(g => g.status === 'in_progress').length,
    notStarted: allGoals.filter(g => g.status === 'not_started').length,
  };

  // Top strengths
  const strengthsMap = new Map<string, number>();
  reviews.forEach((r) => {
    r.strengths?.forEach((strength: string) => {
      strengthsMap.set(strength, (strengthsMap.get(strength) || 0) + 1);
    });
  });
  const topStrengths = Array.from(strengthsMap.entries())
    .map(([strength, frequency]) => ({ strength, frequency }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 10);

  // Development areas
  const areasMap = new Map<string, number>();
  reviews.forEach((r) => {
    r.areas_for_improvement?.forEach((area: string) => {
      areasMap.set(area, (areasMap.get(area) || 0) + 1);
    });
  });
  const developmentAreas = Array.from(areasMap.entries())
    .map(([area, frequency]) => ({ area, frequency }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 10);

  return {
    totalReviews,
    completedReviews,
    averageRating: Math.round(averageRating * 100) / 100,
    promotionRate: Math.round(promotionRate * 100) / 100,
    byType,
    byStatus,
    ratingDistribution,
    goalCompletion,
    topStrengths,
    developmentAreas,
  };
}

export async function fetchPerformanceAnalytics(
  supabase: SupabaseClient,
  organizationId: string
): Promise<PerformanceAnalytics> {
  // Fetch all performance reviews for the organization
  const { data: reviews, error } = await supabase
    .from('user_performance_reviews')
    .select('*')
    .eq('organization_id', organizationId)
    .order('review_period_start', { ascending: true });

  if (error) {
    console.error('Error fetching performance analytics:', error);
    throw error;
  }

  if (!reviews || reviews.length === 0) {
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
        percentile: 0,
      },
    };
  }

  // Calculate performance trends by period
  const trendMap = new Map<string, { ratings: number[]; promotions: number }>();
  reviews.forEach(review => {
    const period = `${new Date(review.review_period_start).getFullYear()}`;
    const existing = trendMap.get(period) || { ratings: [], promotions: 0 };
    existing.ratings.push(review.overall_rating);
    if (review.promotion_recommended) existing.promotions += 1;
    trendMap.set(period, existing);
  });
  
  const performanceTrends = Array.from(trendMap.entries())
    .map(([period, data]) => ({
      period,
      averageRating: data.ratings.reduce((a, b) => a + b, 0) / data.ratings.length,
      reviewCount: data.ratings.length,
      promotions: data.promotions,
    }))
    .sort((a, b) => a.period.localeCompare(b.period));

  // Calculate goal analytics by category
  const goalMap = new Map<string, { total: number; completed: number; progress: number[] }>();
  reviews.forEach((review) => {
    review.goals?.forEach((goal) => {
      const existing = goalMap.get(goal.category) || { total: 0, completed: 0, progress: [] };
      existing.total += 1;
      if (goal.status === 'completed') existing.completed += 1;
      existing.progress.push(goal.progress_percentage);
      goalMap.set(goal.category, existing);
    });
  });
  
  const goalAnalytics = Array.from(goalMap.entries()).map(([category, data]) => ({
    category: category as unknown,
    totalGoals: data.total,
    completedGoals: data.completed,
    averageProgress: data.progress.reduce((a, b) => a + b, 0) / data.progress.length,
  }));

  // Calculate competency breakdown
  const competencyBreakdown = [
    {
      competency: 'Goals Achievement',
      averageRating: reviews.reduce((sum, r) => sum + (r.goals_rating || 0), 0) / reviews.length,
      improvementTrend: 0, // Would need historical data
    },
    {
      competency: 'Leadership',
      averageRating: reviews.reduce((sum, r) => sum + (r.leadership_rating || 0), 0) / reviews.length,
      improvementTrend: 0,
    },
    {
      competency: 'Communication',
      averageRating: reviews.reduce((sum, r) => sum + (r.communication_rating || 0), 0) / reviews.length,
      improvementTrend: 0,
    },
    {
      competency: 'Technical Skills',
      averageRating: reviews.reduce((sum, r) => sum + (r.technical_rating || 0), 0) / reviews.length,
      improvementTrend: 0,
    },
  ].filter(c => c.averageRating > 0);

  // Calculate reviewer insights
  const reviewerMap = new Map<string, { count: number; ratings: number[] }>();
  reviews.forEach(review => {
    if (review.reviewer_name) {
      const existing = reviewerMap.get(review.reviewer_name) || { count: 0, ratings: [] };
      existing.count += 1;
      existing.ratings.push(review.overall_rating);
      reviewerMap.set(review.reviewer_name, existing);
    }
  });
  
  const reviewerInsights = Array.from(reviewerMap.entries()).map(([reviewer, data]) => ({
    reviewer,
    reviewCount: data.count,
    averageRating: data.ratings.reduce((a, b) => a + b, 0) / data.ratings.length,
    consistency: calculateConsistency(data.ratings),
  }));

  // Calculate career progression
  const careerProgression = reviews.map(review => ({
    year: new Date(review.review_period_start).getFullYear(),
    rating: review.overall_rating,
    promotion: review.promotion_recommended,
    salaryAdjustment: review.salary_adjustment,
  }));

  // Calculate benchmark comparison
  const organizationAverage = reviews.reduce((sum, r) => sum + r.overall_rating, 0) / reviews.length;
  const benchmarkComparison = {
    organizationAverage,
    industryAverage: 3.2, // Mock data - would come from external source
    userRating: organizationAverage,
    percentile: calculatePercentile(organizationAverage, reviews.map(r => r.overall_rating)),
  };

  return {
    performanceTrends,
    goalAnalytics,
    competencyBreakdown,
    reviewerInsights,
    careerProgression,
    benchmarkComparison,
  };
}

// ============================================================================
// Mutation Functions
// ============================================================================

export async function createPerformanceReview(
  supabase: SupabaseClient,
  organizationId: string,
  userId: string,
  data: unknown
): Promise<PerformanceReview> {
  const validated = performanceUpsertSchema.parse(data);

  const { data: review, error } = await supabase
    .from('user_performance_reviews')
    .insert({
      organization_id: organizationId,
      user_id: userId,
      ...validated,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating performance review:', error);
    throw error;
  }

  return review;
}

export async function updatePerformanceReview(
  supabase: SupabaseClient,
  reviewId: string,
  data: unknown
): Promise<PerformanceReview> {
  const validated = performanceUpsertSchema.parse(data);

  const { data: review, error } = await supabase
    .from('user_performance_reviews')
    .update({
      ...validated,
      updated_at: new Date().toISOString(),
    })
    .eq('id', reviewId)
    .select()
    .single();

  if (error) {
    console.error('Error updating performance review:', error);
    throw error;
  }

  return review;
}

export async function deletePerformanceReview(
  supabase: SupabaseClient,
  reviewId: string
): Promise<void> {
  const { error } = await supabase
    .from('user_performance_reviews')
    .delete()
    .eq('id', reviewId);

  if (error) {
    console.error('Error deleting performance review:', error);
    throw error;
  }
}

export async function updateReviewStatus(
  supabase: SupabaseClient,
  reviewId: string,
  status: string
): Promise<PerformanceReview> {
  const { data: review, error } = await supabase
    .from('user_performance_reviews')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', reviewId)
    .select()
    .single();

  if (error) {
    console.error('Error updating review status:', error);
    throw error;
  }

  return review;
}

export async function updateReviewVisibility(
  supabase: SupabaseClient,
  reviewId: string,
  visibility: string
): Promise<PerformanceReview> {
  const { data: review, error } = await supabase
    .from('user_performance_reviews')
    .update({
      visibility,
      updated_at: new Date().toISOString(),
    })
    .eq('id', reviewId)
    .select()
    .single();

  if (error) {
    console.error('Error updating review visibility:', error);
    throw error;
  }

  return review;
}

// ============================================================================
// Helper Functions
// ============================================================================

function calculateConsistency(ratings: number[]): number {
  if (ratings.length < 2) return 1;
  
  const mean = ratings.reduce((a, b) => a + b, 0) / ratings.length;
  const variance = ratings.reduce((sum, rating) => sum + Math.pow(rating - mean, 2), 0) / ratings.length;
  const standardDeviation = Math.sqrt(variance);
  
  // Convert to consistency score (lower deviation = higher consistency)
  return Math.max(0, 1 - (standardDeviation / 2));
}

function calculatePercentile(value: number, dataset: number[]): number {
  const sorted = dataset.sort((a, b) => a - b);
  const index = sorted.findIndex(v => v >= value);
  return Math.round((index / sorted.length) * 100);
}

// ============================================================================
// Export Functions
// ============================================================================

export { performanceFilterSchema, performanceUpsertSchema };
