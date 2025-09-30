import { createClient } from '@/lib/supabase/client';
import type { ReviewFormData, ReviewData, ReviewStats, ReviewActivity, ReviewResponse, ReviewFlag } from '../types';

export class ReviewsService {
  private supabase = createClient();

  async getReviews(filters: unknown = {}): Promise<ReviewData[]> {
    try {
      let query = this.supabase
        .from('marketplace_reviews')
        .select(`
          *,
          reviewer:users!reviewer_id(id, name, email),
          reviewee:users!reviewee_id(id, name, email),
          project:opendeck_projects(id, title),
          contract:opendeck_contracts(id, title)
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.type) {
        if (filters.type === 'received') {
          query = query.eq('reviewee_id', filters.user_id);
        } else if (filters.type === 'given') {
          query = query.eq('reviewer_id', filters.user_id);
        }
      }
      if (filters.rating) {
        query = query.eq('rating', filters.rating);
      }
      if (filters.rating_range?.min) {
        query = query.gte('rating', filters.rating_range.min);
      }
      if (filters.rating_range?.max) {
        query = query.lte('rating', filters.rating_range.max);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.verified_only) {
        query = query.eq('verified', true);
      }
      if (filters.project_id) {
        query = query.eq('project_id', filters.project_id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching reviews:', error);
      throw error;
    }
  }

  async getReview(id: string): Promise<ReviewData | null> {
    try {
      const { data, error } = await this.supabase
        .from('marketplace_reviews')
        .select(`
          *,
          reviewer:users!reviewer_id(id, name, email),
          reviewee:users!reviewee_id(id, name, email),
          project:opendeck_projects(id, title),
          contract:opendeck_contracts(id, title),
          response:review_responses(content, created_at)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching review:', error);
      return null;
    }
  }

  async createReview(reviewData: ReviewFormData): Promise<ReviewData> {
    try {
      const { data, error } = await this.supabase
        .from('marketplace_reviews')
        .insert([{
          ...reviewData,
          status: 'pending',
          verified: false,
          helpful_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      // Update reviewee's rating
      await this.updateRevieweeRating(reviewData.reviewee_id);

      return data;
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  }

  async updateReview(id: string, reviewData: Partial<ReviewFormData>): Promise<ReviewData> {
    try {
      const { data, error } = await this.supabase
        .from('marketplace_reviews')
        .update({
          ...reviewData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating review:', error);
      throw error;
    }
  }

  async deleteReview(id: string): Promise<void> {
    try {
      const review = await this.getReview(id);
      if (!review) throw new Error('Review not found');

      const { error } = await this.supabase
        .from('marketplace_reviews')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update reviewee's rating
      await this.updateRevieweeRating(review.reviewee_id);
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  }

  async respondToReview(reviewId: string, content: string): Promise<ReviewResponse> {
    try {
      const { data, error } = await this.supabase
        .from('review_responses')
        .insert([{
          review_id: reviewId,
          content,
          status: 'published',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      // Update review with response
      await this.supabase
        .from('marketplace_reviews')
        .update({
          response: {
            content,
            created_at: new Date().toISOString()
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', reviewId);

      return data;
    } catch (error) {
      console.error('Error responding to review:', error);
      throw error;
    }
  }

  async markHelpful(reviewId: string, userId: string): Promise<void> {
    try {
      // Check if user already marked as helpful
      const { data: existing } = await this.supabase
        .from('review_helpful')
        .select('id')
        .eq('review_id', reviewId)
        .eq('user_id', userId)
        .single();

      if (existing) {
        // Remove helpful mark
        await this.supabase
          .from('review_helpful')
          .delete()
          .eq('review_id', reviewId)
          .eq('user_id', userId);

        // Decrement count
        // Get current helpful_count and decrement
        const { data: review } = await this.supabase
          .from('marketplace_reviews')
          .select('helpful_count')
          .eq('id', reviewId)
          .single();
        
        const currentCount = review?.helpful_count || 0;
        await this.supabase
          .from('marketplace_reviews')
          .update({ helpful_count: Math.max(0, currentCount - 1) })
          .eq('id', reviewId);
      } else {
        // Add helpful mark
        await this.supabase
          .from('review_helpful')
          .insert([{
            review_id: reviewId,
            user_id: userId,
            created_at: new Date().toISOString()
          }]);

        // Increment count
        // Get current helpful_count and increment
        const { data: review } = await this.supabase
          .from('marketplace_reviews')
          .select('helpful_count')
          .eq('id', reviewId)
          .single();
        
        const currentCount = review?.helpful_count || 0;
        await this.supabase
          .from('marketplace_reviews')
          .update({ helpful_count: currentCount + 1 })
          .eq('id', reviewId);
      }
    } catch (error) {
      console.error('Error marking review as helpful:', error);
      throw error;
    }
  }

  async flagReview(reviewId: string, flagData: Partial<ReviewFlag>): Promise<ReviewFlag> {
    try {
      const { data, error } = await this.supabase
        .from('review_flags')
        .insert([{
          review_id: reviewId,
          ...flagData,
          status: 'pending',
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      // Update review status to flagged
      await this.supabase
        .from('marketplace_reviews')
        .update({ status: 'flagged' })
        .eq('id', reviewId);

      return data;
    } catch (error) {
      console.error('Error flagging review:', error);
      throw error;
    }
  }

  async verifyReview(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('marketplace_reviews')
        .update({ 
          verified: true,
          status: 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error verifying review:', error);
      throw error;
    }
  }

  async getReviewStats(userId: string, type: 'received' | 'given' = 'received'): Promise<ReviewStats> {
    try {
      const filterField = type === 'received' ? 'reviewee_id' : 'reviewer_id';
      
      const { data: reviews, error } = await this.supabase
        .from('marketplace_reviews')
        .select('*')
        .eq(filterField, userId)
        .eq('status', 'approved');

      if (error) throw error;

      const stats: ReviewStats = {
        totalReviews: reviews?.length || 0,
        averageRating: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        categoryAverages: {
          communication: 0,
          quality: 0,
          timeliness: 0,
          professionalism: 0
        },
        responseRate: 0,
        averageResponseTime: 0,
        verifiedReviews: reviews?.filter(r => r.verified).length || 0,
        recommendationRate: 0,
        monthlyTrends: []
      };

      if (reviews && reviews.length > 0) {
        // Calculate average rating
        stats.averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

        // Calculate rating distribution
        reviews.forEach(review => {
          stats.ratingDistribution[review.rating as keyof typeof stats.ratingDistribution]++;
        });

        // Calculate category averages
        const categoryTotals = { communication: 0, quality: 0, timeliness: 0, professionalism: 0 };
        reviews.forEach(review => {
          if (review.categories) {
            categoryTotals.communication += review.categories.communication || 0;
            categoryTotals.quality += review.categories.quality || 0;
            categoryTotals.timeliness += review.categories.timeliness || 0;
            categoryTotals.professionalism += review.categories.professionalism || 0;
          }
        });

        stats.categoryAverages = {
          communication: categoryTotals.communication / reviews.length,
          quality: categoryTotals.quality / reviews.length,
          timeliness: categoryTotals.timeliness / reviews.length,
          professionalism: categoryTotals.professionalism / reviews.length
        };

        // Calculate response rate
        const reviewsWithResponse = reviews.filter(r => r.response);
        stats.responseRate = (reviewsWithResponse.length / reviews.length) * 100;

        // Calculate recommendation rate
        const recommendedReviews = reviews.filter(r => r.recommend);
        stats.recommendationRate = (recommendedReviews.length / reviews.length) * 100;
      }

      return stats;
    } catch (error) {
      console.error('Error fetching review stats:', error);
      throw error;
    }
  }

  async updateRevieweeRating(revieweeId: string): Promise<void> {
    try {
      const { data: reviews, error } = await this.supabase
        .from('marketplace_reviews')
        .select('rating')
        .eq('reviewee_id', revieweeId)
        .eq('status', 'approved');

      if (error) throw error;

      if (reviews && reviews.length > 0) {
        const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        
        // Update vendor profile rating
        await this.supabase
          .from('opendeck_vendor_profiles')
          .update({
            rating: Math.round(averageRating * 10) / 10,
            total_reviews: reviews.length
          })
          .eq('user_id', revieweeId);
      }
    } catch (error) {
      console.error('Error updating reviewee rating:', error);
    }
  }

  async exportReviews(format: 'csv' | 'json' | 'excel', filters: unknown = {}): Promise<Blob> {
    try {
      const reviews = await this.getReviews(filters);
      
      const exportData = reviews.map(review => ({
        id: review.id,
        reviewer_name: review.reviewer_name,
        reviewee_name: review.reviewee_name,
        project_title: review.project_title,
        rating: review.rating,
        title: review.title,
        content: review.content,
        communication: review.categories?.communication,
        quality: review.categories?.quality,
        timeliness: review.categories?.timeliness,
        professionalism: review.categories?.professionalism,
        recommend: review.recommend,
        verified: review.verified,
        helpful_count: review.helpful_count,
        created_at: review.created_at
      }));

      if (format === 'csv') {
        const headers = Object.keys(exportData[0]).join(',');
        const rows = exportData.map(row => Object.values(row).join(','));
        const csv = [headers, ...rows].join('\n');
        return new Blob([csv], { type: 'text/csv' });
      } else if (format === 'json') {
        const json = JSON.stringify(exportData, null, 2);
        return new Blob([json], { type: 'application/json' });
      } else {
        throw new Error('Unsupported export format');
      }
    } catch (error) {
      console.error('Error exporting reviews:', error);
      throw error;
    }
  }

  // Helper methods
  calculateOverallRating(categories: { communication: number; quality: number; timeliness: number; professionalism: number }): number {
    const total = categories.communication + categories.quality + categories.timeliness + categories.professionalism;
    return Math.round((total / 4) * 10) / 10;
  }

  generateId(): string {
    return crypto.randomUUID();
  }
}
