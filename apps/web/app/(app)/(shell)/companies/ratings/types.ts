// Ratings Subdirectory Types

export interface RatingFilters {
  search?: string;
  company_id?: string;
  project_id?: string;
  category?: CompanyRating['category'][];
  rating_min?: number;
  rating_max?: number;
  recommendation?: CompanyRating['recommendation'][];
  is_public?: boolean;
  created_from?: string;
  created_to?: string;
}

export interface RatingStats {
  totalRatings: number;
  averageRating: number;
  ratingDistribution: Record<number, number>;
  recommendationRate: number;
  categoryAverages: Record<CompanyRating['category'], number>;
  ratingsByCategory: Record<string, number>;
  ratingsByRecommendation: Record<string, number>;
}

export interface RatingFormData {
  company_id: string;
  project_id?: string;
  rating: number;
  category: CompanyRating['category'];
  review?: string;
  recommendation: CompanyRating['recommendation'];
  is_public?: boolean;
}

// Re-export from parent types
export type {
  CompanyRating,
  CreateRatingForm
} from '../types';
