import type { DataRecord } from '@ghxstship/ui';

export interface VendorFormData {
  business_name: string;
  business_type: 'individual' | 'company' | 'agency';
  display_name: string;
  tagline: string;
  bio: string;
  email: string;
  phone: string;
  website: string;
  primary_category: string;
  categories: string[];
  skills: string[];
  years_experience: number;
  team_size: number;
  hourly_rate: number;
  currency: string;
  availability_status: 'available' | 'busy' | 'unavailable';
  response_time: string;
  portfolio_items?: Array<{
    title: string;
    description: string;
    image_url?: string;
    project_url?: string;
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
    date: string;
    expiry?: string;
    url?: string;
  }>;
}

export interface VendorStats {
  totalVendors: number;
  activeVendors: number;
  verifiedVendors: number;
  averageRating: number;
  totalProjects: number;
  totalEarnings: number;
  categoryBreakdown: Record<string, number>;
  availabilityBreakdown: Record<string, number>;
}

export interface VendorActivity extends DataRecord {
  id: string;
  vendor_id: string;
  type: 'profile_updated' | 'project_completed' | 'review_received' | 'verification_status';
  description: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface VendorReview extends DataRecord {
  id: string;
  vendor_id: string;
  client_id: string;
  client_name?: string;
  project_title?: string;
  rating: number;
  review_text: string;
  categories: {
    communication: number;
    quality: number;
    timeliness: number;
    professionalism: number;
  };
  created_at: string;
  verified: boolean;
}

export interface VendorSearchFilters {
  query?: string;
  category?: string;
  availability_status?: 'available' | 'busy' | 'unavailable';
  business_type?: 'individual' | 'company' | 'agency';
  rating_min?: number;
  hourly_rate_range?: {
    min?: number;
    max?: number;
  };
  years_experience_min?: number;
  skills?: string[];
  verified_only?: boolean;
  sortBy?: 'created_at' | 'rating' | 'hourly_rate' | 'years_experience';
  sortOrder?: 'asc' | 'desc';
}
