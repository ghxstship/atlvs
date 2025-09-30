/**
 * Search Service Interface - Adapter Pattern
 * Abstracts search provider implementation (Algolia, Elasticsearch, etc.)
 */

export interface SearchDocument {
  id: string;
  type: string;
  title: string;
  content: string;
  metadata?: Record<string, unknown>;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchQuery {
  query: string;
  filters?: Record<string, unknown>;
  facets?: string[];
  page?: number;
  hitsPerPage?: number;
  organizationId: string;
}

export interface SearchHit {
  id: string;
  type: string;
  title: string;
  content: string;
  highlights?: Record<string, string[]>;
  score: number;
  metadata?: Record<string, unknown>;
}

export interface SearchResult {
  hits: SearchHit[];
  totalHits: number;
  page: number;
  totalPages: number;
  facets?: Record<string, Record<string, number>>;
  processingTimeMs: number;
}

export interface ISearchService {
  index(document: SearchDocument): Promise<void>;
  indexBulk(documents: SearchDocument[]): Promise<void>;
  search(query: SearchQuery): Promise<SearchResult>;
  delete(documentId: string, organizationId: string): Promise<void>;
  deleteBulk(documentIds: string[], organizationId: string): Promise<void>;
  clearIndex(organizationId: string): Promise<void>;
}
