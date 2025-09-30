import type { DataRecord } from '@ghxstship/ui';

export interface ListingFormData {
  title: string;
  description: string;
  type: 'offer' | 'request' | 'exchange';
  category: 'equipment' | 'services' | 'talent' | 'locations' | 'materials' | 'other';
  subcategory?: string;
  pricing?: {
    amount?: number;
    currency?: string;
    negotiable?: boolean;
    paymentTerms?: string;
  };
  location: {
    city: string;
    state?: string;
    country: string;
    isRemote?: boolean;
  };
  availability: {
    startDate?: string;
    endDate?: string;
    flexible?: boolean;
    immediateAvailable?: boolean;
  };
  requirements?: string[];
  tags?: string[];
  images?: Array<{
    url: string;
    alt?: string;
    isPrimary?: boolean;
  }>;
  contactInfo: {
    preferredMethod: 'email' | 'phone' | 'platform';
    email?: string;
    phone?: string;
    showPublic?: boolean;
  };
  featured?: boolean;
  expiresAt?: string;
}

export interface ListingStats {
  totalListings: number;
  activeListings: number;
  featuredListings: number;
  totalViews: number;
  totalResponses: number;
  averageResponseRate: number;
  categoryBreakdown: Record<string, number>;
  typeBreakdown: Record<string, number>;
}

export interface ListingActivity extends DataRecord {
  id: string;
  listing_id: string;
  type: 'view' | 'response' | 'contact' | 'share';
  user_id?: string;
  user_name?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface ListingResponse extends DataRecord {
  id: string;
  listing_id: string;
  responder_id: string;
  responder_name?: string;
  responder_email?: string;
  message: string;
  contact_info?: {
    email?: string;
    phone?: string;
    preferredMethod?: string;
  };
  status: 'pending' | 'accepted' | 'declined' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface ListingSearchFilters {
  query?: string;
  type?: 'offer' | 'request' | 'exchange';
  category?: string;
  location?: string;
  priceRange?: {
    min?: number;
    max?: number;
  };
  availability?: {
    startDate?: string;
    endDate?: string;
  };
  featured?: boolean;
  tags?: string[];
  sortBy?: 'created_at' | 'updated_at' | 'price' | 'views' | 'responses';
  sortOrder?: 'asc' | 'desc';
}
