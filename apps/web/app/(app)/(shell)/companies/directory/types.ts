// Directory Module Types - extends main companies types
export * from '../types';

// Directory-specific interfaces
export interface DirectoryFilters {
  search?: string;
  industry?: string[];
  status?: ('active' | 'pending' | 'inactive' | 'blacklisted')[];
  size?: ('startup' | 'small' | 'medium' | 'large' | 'enterprise')[];
  country?: string[];
  city?: string[];
  founded_year_min?: number;
  founded_year_max?: number;
}

export interface DirectoryStats {
  totalCompanies: number;
  activeCompanies: number;
  pendingCompanies: number;
  inactiveCompanies: number;
  blacklistedCompanies: number;
  byIndustry: Record<string, number>;
  bySize: Record<string, number>;
  byCountry: Record<string, number>;
}

export interface DirectoryViewConfig {
  view: 'grid' | 'list' | 'kanban' | 'calendar';
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  pageSize: number;
  showFilters: boolean;
}
