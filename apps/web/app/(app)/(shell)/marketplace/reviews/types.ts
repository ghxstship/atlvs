import type { DataRecord } from '@ghxstship/ui';

export interface ReviewFormData {
  reviewee_id: string;
  project_id?: string;
  contract_id?: string;
  rating: number;
  title: string;
  content: string;
  categories: {
    communication: number;
    quality: number;
    timeliness: number;
    professionalism: number;
  };
  recommend: boolean;
  anonymous: boolean;
  tags?: string[];
  evidence?: Array<{
    type: 'image' | 'document' | 'link';
    url: string;
    description?: string;
  }>;
}

export interface ReviewData extends DataRecord {
  id: string;
  reviewer_id: string;
  reviewer_name?: string;
  reviewer_avatar?: string;
  reviewee_id: string;
  reviewee_name?: string;
  project_id?: string;
  project_title?: string;
  contract_id?: string;
  rating: number;
  title: string;
  content: string;
  categories: {
    communication: number;
    quality: number;
    timeliness: number;
    professionalism: number;
  };
  recommend: boolean;
  anonymous: boolean;
  helpful_count: number;
  verified: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  tags?: string[];
  evidence?: Array<{
    type: 'image' | 'document' | 'link';
    url: string;
    description?: string;
  }>;
  response?: {
    content: string;
    created_at: string;
  };
  created_at: string;
  updated_at: string;
  type: 'received' | 'given';
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  categoryAverages: {
    communication: number;
    quality: number;
    timeliness: number;
    professionalism: number;
  };
  responseRate: number;
  averageResponseTime: number;
  verifiedReviews: number;
  recommendationRate: number;
  monthlyTrends: Array<{
    month: string;
    count: number;
    average_rating: number;
  }>;
}

export interface ReviewActivity extends DataRecord {
  id: string;
  review_id: string;
  type: 'created' | 'updated' | 'responded' | 'flagged' | 'verified' | 'helpful_marked';
  user_id?: string;
  user_name?: string;
  description: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface ReviewResponse extends DataRecord {
  id: string;
  review_id: string;
  responder_id: string;
  responder_name?: string;
  content: string;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
}

export interface ReviewFlag extends DataRecord {
  id: string;
  review_id: string;
  flagger_id: string;
  flagger_name?: string;
  reason: 'inappropriate' | 'spam' | 'fake' | 'harassment' | 'other';
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  created_at: string;
  resolved_at?: string;
  resolution?: string;
}

export interface ReviewSearchFilters {
  query?: string;
  rating?: number;
  rating_range?: {
    min?: number;
    max?: number;
  };
  type?: 'received' | 'given';
  status?: 'pending' | 'approved' | 'rejected' | 'flagged';
  verified_only?: boolean;
  project_id?: string;
  date_range?: {
    start?: string;
    end?: string;
  };
  tags?: string[];
  sortBy?: 'created_at' | 'rating' | 'helpful_count' | 'updated_at';
  sortOrder?: 'asc' | 'desc';
}

export interface ReviewTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  questions: Array<{
    id: string;
    question: string;
    type: 'rating' | 'text' | 'boolean' | 'multiple_choice';
    required: boolean;
    options?: string[];
  }>;
  created_at: string;
}
