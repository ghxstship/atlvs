import { createClient } from './client';
import { createClient as createServerClient } from './server';
import type { Database } from '@/types/database';
import type { SupabaseClient } from '@supabase/supabase-js';

// Enterprise-grade Supabase client with advanced features
export class EnterpriseSupabaseClient {
  private clientPromise: Promise<SupabaseClient<Database>>;

  constructor(isServer = false) {
    this.clientPromise = isServer ? createServerClient() : Promise.resolve(createClient());
  }

  private async getClient(): Promise<SupabaseClient<Database>> {
    return await this.clientPromise;
  }

  // Query caching wrapper
  async cachedQuery<T>(
    cacheKey: string,
    queryFn: () => Promise<T>,
    ttlSeconds = 3600,
    organizationId?: string
  ): Promise<T> {
    try {
      // Check cache first
      const cached = await this.getCachedResult(cacheKey, organizationId);
      if (cached) return cached;

      // Execute query and cache result
      const result = await queryFn();
      await this.setCachedResult(cacheKey, result, ttlSeconds, organizationId);
      return result;
    } catch (error) {
      console.error('Cached query error:', error);
      // Fallback to direct query execution
      return await queryFn();
    }
  }

  // Rate limiting check
  async checkRateLimit(
    identifier: string,
    identifierType: 'user' | 'ip' | 'api_key',
    endpoint: string,
    limit = 100,
    windowDuration = '1 hour'
  ): Promise<boolean> {
    try {
      const client = await this.getClient();
      const { data, error } = await client.rpc('check_rate_limit', {
        p_identifier: identifier,
        p_identifier_type: identifierType,
        p_endpoint: endpoint,
        p_limit: limit,
        p_window_duration: windowDuration
      } as any);

      if (error) throw error;
      return (data as any)?.allowed || false;
    } catch (error) {
      console.error('Rate limit check failed:', error);
      return false; // Fail open for availability
    }
  }

  // Security event logging
  async logSecurityEvent(
    organizationId: string,
    userId: string,
    eventType: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    details: Record<string, any> = {},
    ipAddress?: string,
    userAgent?: string,
    sessionId?: string
  ): Promise<void> {
    try {
      const client = await this.getClient();
      await client.rpc('log_security_event', {
        p_organization_id: organizationId,
        p_user_id: userId,
        p_event_type: eventType,
        p_severity: severity,
        p_details: details,
        p_ip_address: ipAddress,
        p_user_agent: userAgent,
        p_session_id: sessionId
      } as any);
    } catch (error) {
      console.error('Security event logging failed:', error);
    }
  }

  // Background job queueing
  async queueBackgroundJob(
    jobType: string,
    jobData: Record<string, any>,
    organizationId?: string,
    priority = 5,
    scheduledAt?: Date
  ): Promise<string | null> {
    try {
      const client = await this.getClient();
      const { data, error } = await client.rpc('queue_background_job', {
        p_job_type: jobType,
        p_job_data: jobData,
        p_organization_id: organizationId,
        p_priority: priority,
        p_scheduled_at: scheduledAt?.toISOString()
      } as any);

      if (error) throw error;
      return (data as any)?.job_id || null;
    } catch (error) {
      console.error('Background job queueing failed:', error);
      return null;
    }
  }

  // GDPR data access request
  async processDataAccessRequest(requestId: string): Promise<any> {
    try {
      const client = await this.getClient();
      const { data, error } = await client.rpc('process_data_access_request', {
        p_request_id: requestId
      } as any);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Data access request failed:', error);
      throw error;
    }
  }

  // GDPR data erasure request
  async processDataErasureRequest(requestId: string, anonymizeOnly = false): Promise<void> {
    try {
      const client = await this.getClient();
      const { error } = await client.rpc('process_data_erasure_request', {
        p_request_id: requestId,
        p_anonymize_only: anonymizeOnly
      } as any);

      if (error) throw error;
    } catch (error) {
      console.error('Data erasure request failed:', error);
      throw error;
    }
  }

  // GDPR compliance check
  async checkGDPRCompliance(organizationId: string): Promise<any> {
    try {
      const client = await this.getClient();
      const { data, error } = await client.rpc('check_gdpr_compliance_status', {
        p_organization_id: organizationId
      } as any);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('GDPR compliance check failed:', error);
      throw error;
    }
  }

  // Performance monitoring
  async getQueryPerformanceStats(organizationId: string): Promise<any[]> {
    try {
      const client = await this.getClient();
      const { data, error } = await client.rpc('get_query_performance_stats', {
        p_organization_id: organizationId
      } as any);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Query performance stats failed:', error);
      return [];
    }
  }

  async analyzeTablePerformance(schemaName = 'public'): Promise<any[]> {
    try {
      const client = await this.getClient();
      const { data, error } = await client.rpc('analyze_table_performance', {
        p_schema_name: schemaName
      } as any);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Table performance analysis failed:', error);
      return [];
    }
  }

  async getTableStatistics(schemaName = 'public'): Promise<any[]> {
    try {
      const client = await this.getClient();
      const { data, error } = await client.rpc('get_table_statistics', {
        p_schema_name: schemaName
      } as any);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Table statistics failed:', error);
      return [];
    }
  }

  async suggestMissingIndexes(): Promise<any[]> {
    try {
      const client = await this.getClient();
      const { data, error } = await client.rpc('suggest_missing_indexes');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Missing indexes suggestion failed:', error);
      return [];
    }
  }

  // Analytics materialized views
  async refreshAnalyticsViews(): Promise<void> {
    try {
      const client = await this.getClient();
      await client.rpc('refresh_analytics_views');
    } catch (error) {
      console.error('Analytics views refresh failed:', error);
    }
  }

  async getOrganizationMetrics(organizationId: string): Promise<any> {
    try {
      const client = await this.getClient();
      const { data, error } = await client
        .from('mv_organization_metrics')
        .select('*')
        .eq('organization_id', organizationId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Organization metrics failed:', error);
      return null;
    }
  }

  async getProjectAnalytics(organizationId: string, projectId?: string): Promise<any[]> {
    try {
      const client = await this.getClient();
      let query = client
        .from('mv_project_analytics')
        .select('*')
        .eq('organization_id', organizationId);

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Project analytics failed:', error);
      return [];
    }
  }

  async getFinancialAnalytics(organizationId: string, months = 12): Promise<any[]> {
    try {
      const client = await this.getClient();
      const { data, error } = await client
        .from('mv_financial_analytics')
        .select('*')
        .eq('organization_id', organizationId)
        .gte('month', new Date(Date.now() - months * 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('month', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Financial analytics failed:', error);
      return [];
    }
  }

  // Cache management
  private async getCachedResult(cacheKey: string, organizationId?: string): Promise<any> {
    try {
      const client = await this.getClient();
      let query = client.from('query_cache')
        .select('result_data, expires_at')
        .eq('cache_key', cacheKey)
        .gte('expires_at', new Date().toISOString());

      if (organizationId) {
        query = query.eq('organization_id', organizationId);
      } else {
        query = query.is('organization_id', null);
      }

      const { data } = await query.single();
      return (data as any)?.result_data || null;
    } catch {
      return null;
    }
  }

  private async setCachedResult(
    cacheKey: string,
    result: any,
    ttlSeconds: number,
    organizationId?: string
  ): Promise<void> {
    try {
      const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
      const queryHash = this.generateQueryHash(result);

      const client = await this.getClient();
      await client.rpc('set_cache_result', {
        p_cache_key: cacheKey,
        p_query_hash: queryHash,
        p_result_data: result,
        p_ttl_seconds: ttlSeconds,
        p_organization_id: organizationId,
        p_user_id: null, // System cache
      } as any);
    } catch (error) {
      console.error('Cache setting failed:', error);
    }
  }

  private generateQueryHash(input: string): string {
    // Simple hash function for query identification
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  // Expose the underlying client
  async getSupabaseClient() {
    return await this.getClient();
  }
}

// Factory functions
export function createEnterpriseClient(): EnterpriseSupabaseClient {
  return new EnterpriseSupabaseClient(false);
}

export function createEnterpriseServerClient(): EnterpriseSupabaseClient {
  return new EnterpriseSupabaseClient(true);
}

// Singleton instances
let browserClient: EnterpriseSupabaseClient | null = null;
let serverClient: EnterpriseSupabaseClient | null = null;

export function getEnterpriseClient(): EnterpriseSupabaseClient {
  if (typeof window === 'undefined') {
    // Server-side
    if (!serverClient) {
      serverClient = createEnterpriseServerClient();
    }
    return serverClient;
  } else {
    // Client-side
    if (!browserClient) {
      browserClient = createEnterpriseClient();
    }
    return browserClient;
  }
}
