import type { DataRecord } from '@ghxstship/ui';

export type MarketplaceListingType = 'offer' | 'request' | 'exchange';
export type MarketplaceListingCategory =
  | 'equipment'
  | 'services'
  | 'talent'
  | 'locations'
  | 'materials'
  | 'other';

export interface MarketplaceListing extends DataRecord {
  id: string;
  organization_id: string;
  created_by: string;
  title: string;
  description: string;
  type: MarketplaceListingType;
  category: MarketplaceListingCategory;
  subcategory?: string | null;
  status: 'draft' | 'active' | 'archived';
  pricing?: {
    amount?: number | null;
    currency?: string | null;
    negotiable?: boolean | null;
    paymentTerms?: string | null;
  } | null;
  location?: {
    city?: string | null;
    state?: string | null;
    country?: string | null;
    isRemote?: boolean | null;
  } | null;
  availability?: {
    startDate?: string | null;
    endDate?: string | null;
    flexible?: boolean | null;
    immediateAvailable?: boolean | null;
  } | null;
  requirements?: string[] | null;
  tags?: string[] | null;
  images?: Array<{
    url: string;
    alt?: string | null;
    isPrimary?: boolean | null;
  }> | null;
  contactInfo?: {
    preferredMethod?: 'email' | 'phone' | 'platform';
    email?: string | null;
    phone?: string | null;
    showPublic?: boolean | null;
  } | null;
  featured: boolean;
  view_count?: number | null;
  response_count?: number | null;
  expires_at?: string | null;
  created_at: string;
  updated_at: string;
  is_demo?: boolean | null;
  organization?: {
    id: string;
    name: string;
    slug?: string | null;
  } | null;
  creator?: {
    id: string;
    name?: string | null;
    email?: string | null;
  } | null;
  responses?: Array<{ count: number } | null> | null;
}

export interface ListingFilters {
  type?: MarketplaceListingType;
  category?: MarketplaceListingCategory;
  location?: string;
  minPrice?: string;
  maxPrice?: string;
  search?: string;
  featured?: boolean;
  showMine?: boolean;
  active?: boolean;
}

export interface UpsertListingDto {
  id?: string;
  title: string;
  description: string;
  type: MarketplaceListingType;
  category: MarketplaceListingCategory;
  subcategory?: string;
  status?: 'draft' | 'active' | 'archived';
  amount?: number | null;
  currency?: string;
  negotiable?: boolean;
  paymentTerms?: string;
  city?: string;
  state?: string;
  country?: string;
  isRemote?: boolean;
  startDate?: string;
  endDate?: string;
  flexible?: boolean;
  immediateAvailable?: boolean;
  requirements?: string[];
  tags?: string[];
  featured?: boolean;
  expiresAt?: string | null;
  contactEmail?: string;
  contactPhone?: string;
  preferredContactMethod?: 'email' | 'phone' | 'platform';
}

export interface MarketplaceStats {
  totalListings: number;
  featuredListings: number;
  totalResponses: number;
  averageResponseRate: number;
  activeOffers: number;
  activeRequests: number;
  activeExchanges: number;
  totalVendors: number;
  totalProjects: number;
  lastUpdated: string;
}

export interface MarketplaceDashboardStats {
  vendor: {
    totalEarnings: number;
    activeProjects: number;
    completedProjects: number;
    avgRating: number;
    totalReviews: number;
    responseRate: number;
    profileViews: number;
    proposalsSent: number;
    successRate: number;
  };
  client: {
    totalSpent: number;
    activeProjects: number;
    completedProjects: number;
    vendorsHired: number;
    avgProjectValue: number;
    totalSaved: number;
    proposalsReceived: number;
    avgCompletionTime: number;
  };
}

export interface VendorProfile {
  id: string;
  user_id: string;
  organization_id: string;
  name?: string;
  business_name: string;
  business_type: 'individual' | 'company' | 'agency';
  display_name: string;
  tagline?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  cover_image_url?: string | null;
  email: string;
  phone?: string | null;
  website?: string | null;
  address?: unknown;
  timezone?: string;
  languages?: string[];
  years_experience?: number | null;
  team_size?: number | null;
  hourly_rate?: number | null;
  currency?: string;
  primary_category: string;
  categories?: string[];
  skills?: string[];
  certifications?: unknown[];
  availability_status: 'available' | 'busy' | 'unavailable';
  response_time?: string | null;
  rating?: number | null;
  total_reviews?: number | null;
  total_projects?: number | null;
  total_earnings?: number | null;
  success_rate?: number | null;
  verified?: boolean;
  verification_date?: string | null;
  featured?: boolean;
  status: 'pending' | 'active' | 'suspended' | 'inactive';
  settings?: unknown;
  created_at: string;
  updated_at: string;
}

export interface MarketplaceProject {
  id: string;
  organization_id: string;
  client_id: string;
  title: string;
  description: string;
  category?: string | null;
  subcategory?: string | null;
  status: 'draft' | 'open' | 'in_progress' | 'completed';
  experience_level?: 'entry' | 'intermediate' | 'expert' | null;
  budget_type?: 'fixed' | 'hourly' | 'not_specified' | null;
  budget_min?: number | null;
  budget_max?: number | null;
  currency?: string | null;
  location_type?: 'remote' | 'onsite' | 'hybrid' | null;
  visibility?: 'public' | 'private' | 'invite_only' | null;
  proposals?: Array<{ count: number | null } | null> | null;
  created_at: string;
  updated_at: string;
  start_date?: string | null;
  end_date?: string | null;
}

export interface MarketplaceProposal {
  id: string;
  project_id: string;
  vendor_id: string;
  organization_id: string;
  status: 'draft' | 'submitted' | 'under_review' | 'accepted' | 'rejected';
  amount?: number | null;
  currency?: string | null;
  timeline?: string | null;
  message?: string | null;
  attachments?: Array<{
    url: string;
    name?: string | null;
  }> | null;
  created_at: string;
  updated_at: string;
}

export interface ListingsResponse {
  listings: MarketplaceListing[];
}
