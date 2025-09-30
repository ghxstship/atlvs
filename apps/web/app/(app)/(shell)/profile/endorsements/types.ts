// Endorsement Types and Utilities

import { z as zod } from 'zod';

// ============================================================================
// Core Types
// ============================================================================

export interface Endorsement {
  id: string;
  organization_id: string;
  user_id: string;
  endorser_name: string;
  endorser_title?: string | null;
  endorser_company?: string | null;
  endorser_email?: string | null;
  endorser_linkedin?: string | null;
  relationship: EndorsementRelationship;
  endorsement_text: string;
  skills_endorsed: string[];
  rating: number;
  date_received: string;
  is_public: boolean;
  is_featured: boolean;
  verification_status: EndorsementVerificationStatus;
  verified_at?: string | null;
  verified_by?: string | null;
  created_at: string;
  updated_at: string;
}

export type EndorsementRelationship = 
  | 'colleague'
  | 'supervisor'
  | 'client'
  | 'subordinate'
  | 'mentor'
  | 'mentee'
  | 'partner'
  | 'other';

export type EndorsementVerificationStatus = 
  | 'pending'
  | 'verified'
  | 'rejected';

export type EndorsementViewType = 
  | 'form'
  | 'card'
  | 'list'
  | 'grid'
  | 'analytics';

export interface EndorsementFormData {
  endorser_name: string;
  endorser_title: string;
  endorser_company: string;
  endorser_email: string;
  endorser_linkedin: string;
  relationship: EndorsementRelationship;
  endorsement_text: string;
  skills_endorsed: string[];
  rating: number;
  date_received: string;
  is_public: boolean;
  is_featured: boolean;
}

export interface EndorsementFilters {
  search: string;
  relationship: EndorsementRelationship | 'all';
  rating: number | 'all';
  verification_status: EndorsementVerificationStatus | 'all';
  is_public: 'public' | 'private' | 'all';
  is_featured: 'featured' | 'not_featured' | 'all';
  date_from?: string;
  date_to?: string;
}

export interface EndorsementSort {
  field: 'date_received' | 'rating' | 'endorser_name' | 'created_at';
  direction: 'asc' | 'desc';
}

export interface EndorsementStats {
  totalEndorsements: number;
  averageRating: number;
  verifiedCount: number;
  publicCount: number;
  featuredCount: number;
  byRelationship: Array<{
    relationship: EndorsementRelationship;
    count: number;
  }>;
  byRating: Array<{
    rating: number;
    count: number;
  }>;
  topSkills: Array<{
    skill: string;
    count: number;
  }>;
}

export interface EndorsementAnalytics {
  endorsementTrends: Array<{
    month: string;
    count: number;
    averageRating: number;
  }>;
  relationshipDistribution: Array<{
    relationship: EndorsementRelationship;
    percentage: number;
  }>;
  skillCloud: Array<{
    skill: string;
    frequency: number;
    weight: number;
  }>;
  verificationRate: number;
  publicRate: number;
  recentEndorsements: Endorsement[];
}

// ============================================================================
// Schemas
// ============================================================================

export const endorsementRelationshipSchema = zod.enum([
  'colleague',
  'supervisor',
  'client',
  'subordinate',
  'mentor',
  'mentee',
  'partner',
  'other',
]);

export const endorsementVerificationStatusSchema = zod.enum([
  'pending',
  'verified',
  'rejected',
]);

export const endorsementFilterSchema = zod.object({
  search: zod.string().optional(),
  relationship: zod.union([endorsementRelationshipSchema, zod.literal('all')]).optional(),
  rating: zod.union([zod.number().min(1).max(5), zod.literal('all')]).optional(),
  verification_status: zod.union([endorsementVerificationStatusSchema, zod.literal('all')]).optional(),
  is_public: zod.enum(['public', 'private', 'all']).optional(),
  is_featured: zod.enum(['featured', 'not_featured', 'all']).optional(),
  date_from: zod.string().optional(),
  date_to: zod.string().optional(),
});

export const endorsementUpsertSchema = zod.object({
  endorser_name: zod.string().min(1, 'Endorser name is required'),
  endorser_title: zod.string().optional().nullable(),
  endorser_company: zod.string().optional().nullable(),
  endorser_email: zod.string().email().optional().nullable(),
  endorser_linkedin: zod.string().url().optional().nullable(),
  relationship: endorsementRelationshipSchema,
  endorsement_text: zod.string().min(10, 'Endorsement text must be at least 10 characters'),
  skills_endorsed: zod.array(zod.string()).min(1, 'At least one skill must be endorsed'),
  rating: zod.number().min(1).max(5),
  date_received: zod.string(),
  is_public: zod.boolean(),
  is_featured: zod.boolean(),
});

// ============================================================================
// Constants
// ============================================================================

export const RELATIONSHIP_LABELS: Record<EndorsementRelationship, string> = {
  colleague: 'Colleague',
  supervisor: 'Supervisor',
  client: 'Client',
  subordinate: 'Subordinate',
  mentor: 'Mentor',
  mentee: 'Mentee',
  partner: 'Partner',
  other: 'Other',
};

export const VERIFICATION_STATUS_LABELS: Record<EndorsementVerificationStatus, string> = {
  pending: 'Pending',
  verified: 'Verified',
  rejected: 'Rejected',
};

export const VIEW_CONFIG: Record<EndorsementViewType, { label: string; description: string }> = {
  form: {
    label: 'Form',
    description: 'Add or edit endorsements',
  },
  card: {
    label: 'Cards',
    description: 'Visual card layout',
  },
  list: {
    label: 'List',
    description: 'Detailed list view',
  },
  grid: {
    label: 'Grid',
    description: 'Compact grid layout',
  },
  analytics: {
    label: 'Analytics',
    description: 'Insights and metrics',
  },
};

export const QUICK_FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Featured', value: 'featured' },
  { label: 'Verified', value: 'verified' },
  { label: '5 Stars', value: '5stars' },
  { label: 'Recent', value: 'recent' },
];

export const COMMON_SKILLS = [
  'Leadership',
  'Communication',
  'Problem Solving',
  'Teamwork',
  'Project Management',
  'Strategic Planning',
  'Innovation',
  'Customer Service',
  'Technical Expertise',
  'Sales',
  'Marketing',
  'Analytics',
  'Creativity',
  'Adaptability',
  'Time Management',
];

// ============================================================================
// Utility Functions
// ============================================================================

export function createEmptyFormData(): EndorsementFormData {
  return {
    endorser_name: '',
    endorser_title: '',
    endorser_company: '',
    endorser_email: '',
    endorser_linkedin: '',
    relationship: 'colleague',
    endorsement_text: '',
    skills_endorsed: [],
    rating: 5,
    date_received: new Date().toISOString().split('T')[0],
    is_public: true,
    is_featured: false,
  };
}

export function createEmptyStats(): EndorsementStats {
  return {
    totalEndorsements: 0,
    averageRating: 0,
    verifiedCount: 0,
    publicCount: 0,
    featuredCount: 0,
    byRelationship: [],
    byRating: [],
    topSkills: [],
  };
}

export function createEmptyAnalytics(): EndorsementAnalytics {
  return {
    endorsementTrends: [],
    relationshipDistribution: [],
    skillCloud: [],
    verificationRate: 0,
    publicRate: 0,
    recentEndorsements: [],
  };
}

export function validateEndorsementForm(data: EndorsementFormData): Record<string, string> {
  const errors: Record<string, string> = {};
  
  if (!data.endorser_name.trim()) {
    errors.endorser_name = 'Endorser name is required';
  }
  
  if (!data.endorsement_text.trim()) {
    errors.endorsement_text = 'Endorsement text is required';
  } else if (data.endorsement_text.trim().length < 10) {
    errors.endorsement_text = 'Endorsement must be at least 10 characters';
  }
  
  if (data.skills_endorsed.length === 0) {
    errors.skills_endorsed = 'At least one skill must be endorsed';
  }
  
  if (data.endorser_email && !isValidEmail(data.endorser_email)) {
    errors.endorser_email = 'Invalid email format';
  }
  
  if (data.endorser_linkedin && !isValidUrl(data.endorser_linkedin)) {
    errors.endorser_linkedin = 'Invalid LinkedIn URL';
  }
  
  if (!data.date_received) {
    errors.date_received = 'Date received is required';
  }
  
  return errors;
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatRating(rating: number): string {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating);
}

export function truncateText(text: string, maxLength: number = 150): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

export function getRelationshipColor(relationship: EndorsementRelationship): string {
  const colors: Record<EndorsementRelationship, string> = {
    colleague: 'blue',
    supervisor: 'green',
    client: 'purple',
    subordinate: 'yellow',
    mentor: 'indigo',
    mentee: 'pink',
    partner: 'orange',
    other: 'gray',
  };
  return colors[relationship] || 'gray';
}

export function getVerificationBadgeVariant(status: EndorsementVerificationStatus): 'default' | 'success' | 'destructive' {
  switch (status) {
    case 'verified':
      return 'success';
    case 'rejected':
      return 'destructive';
    default:
      return 'default';
  }
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function sortEndorsements(
  endorsements: Endorsement[],
  sort: EndorsementSort
): Endorsement[] {
  return [...endorsements].sort((a, b) => {
    let comparison = 0;
    
    switch (sort.field) {
      case 'date_received':
        comparison = new Date(a.date_received).getTime() - new Date(b.date_received).getTime();
        break;
      case 'rating':
        comparison = a.rating - b.rating;
        break;
      case 'endorser_name':
        comparison = a.endorser_name.localeCompare(b.endorser_name);
        break;
      case 'created_at':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
    }
    
    return sort.direction === 'asc' ? comparison : -comparison;
  });
}

export function filterEndorsements(
  endorsements: Endorsement[],
  filters: EndorsementFilters
): Endorsement[] {
  return endorsements.filter(endorsement => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        endorsement.endorser_name.toLowerCase().includes(searchLower) ||
        endorsement.endorsement_text.toLowerCase().includes(searchLower) ||
        endorsement.endorser_company?.toLowerCase().includes(searchLower) ||
        endorsement.skills_endorsed.some(skill => 
          skill.toLowerCase().includes(searchLower)
        );
      if (!matchesSearch) return false;
    }
    
    // Relationship filter
    if (filters.relationship && filters.relationship !== 'all') {
      if (endorsement.relationship !== filters.relationship) return false;
    }
    
    // Rating filter
    if (filters.rating && filters.rating !== 'all') {
      if (endorsement.rating !== filters.rating) return false;
    }
    
    // Verification status filter
    if (filters.verification_status && filters.verification_status !== 'all') {
      if (endorsement.verification_status !== filters.verification_status) return false;
    }
    
    // Public/private filter
    if (filters.is_public && filters.is_public !== 'all') {
      const isPublic = filters.is_public === 'public';
      if (endorsement.is_public !== isPublic) return false;
    }
    
    // Featured filter
    if (filters.is_featured && filters.is_featured !== 'all') {
      const isFeatured = filters.is_featured === 'featured';
      if (endorsement.is_featured !== isFeatured) return false;
    }
    
    // Date range filter
    if (filters.date_from) {
      if (new Date(endorsement.date_received) < new Date(filters.date_from)) return false;
    }
    if (filters.date_to) {
      if (new Date(endorsement.date_received) > new Date(filters.date_to)) return false;
    }
    
    return true;
  });
}
