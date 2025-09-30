import { createServerClient } from '@ghxstship/auth';
import { Permission } from './permission-matrix';
import { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';
import { createServiceRoleClient } from './supabase';
import { getAuditLogger } from './audit-logger';

export interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

export interface PermissionCache {
  memberships: CacheEntry<any>;
  permissions: CacheEntry<Permission[]>;
  organizationSettings: CacheEntry<any>;
}

export class PermissionCacheService {
  private cache = new Map<string, PermissionCache>();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes
  private readonly cleanupInterval = 60 * 1000; // 1 minute
  private realtimeChannel: RealtimeChannel | null = null;
  private supabase: SupabaseClient | null = null;

  constructor() {
    // Periodic cleanup of expired entries
    setInterval(() => this.cleanup(), this.cleanupInterval);
  }

  /**
   * Get cached membership data
   */
  getMembership(userId: string, organizationId?: string): any | null {
    const cacheKey = this.getCacheKey('membership', userId, organizationId);
    const cache = this.cache.get(cacheKey);

    if (!cache?.memberships) return null;

    if (Date.now() > cache.memberships.expiresAt) {
      this.cache.delete(cacheKey);
      return null;
    }

    return cache.memberships.data;
  }

  /**
   * Set cached membership data
   */
  setMembership(userId: string, organizationId: string, data: any, ttl: number = this.defaultTTL): void {
    const cacheKey = this.getCacheKey('membership', userId, organizationId);
    const cache = this.cache.get(cacheKey) || {} as PermissionCache;

    cache.memberships = {
      data,
      expiresAt: Date.now() + ttl,
    };

    this.cache.set(cacheKey, cache);
  }

  /**
   * Get cached permissions
   */
  getPermissions(userId: string, organizationId: string): Permission[] | null {
    const cacheKey = this.getCacheKey('permissions', userId, organizationId);
    const cache = this.cache.get(cacheKey);

    if (!cache?.permissions) return null;

    if (Date.now() > cache.permissions.expiresAt) {
      this.cache.delete(cacheKey);
      return null;
    }

    return cache.permissions.data;
  }

  /**
   * Set cached permissions
   */
  setPermissions(userId: string, organizationId: string, permissions: Permission[], ttl: number = this.defaultTTL): void {
    const cacheKey = this.getCacheKey('permissions', userId, organizationId);
    const cache = this.cache.get(cacheKey) || {} as PermissionCache;

    cache.permissions = {
      data: permissions,
      expiresAt: Date.now() + ttl,
    };

    this.cache.set(cacheKey, cache);
  }

  /**
   * Get cached organization settings
   */
  getOrganizationSettings(organizationId: string): any | null {
    const cacheKey = this.getCacheKey('org_settings', organizationId);
    const cache = this.cache.get(cacheKey);

    if (!cache?.organizationSettings) return null;

    if (Date.now() > cache.organizationSettings.expiresAt) {
      this.cache.delete(cacheKey);
      return null;
    }

    return cache.organizationSettings.data;
  }

  /**
   * Set cached organization settings
   */
  setOrganizationSettings(organizationId: string, settings: any, ttl: number = this.defaultTTL): void {
    const cacheKey = this.getCacheKey('org_settings', organizationId);
    const cache = this.cache.get(cacheKey) || {} as PermissionCache;

    cache.organizationSettings = {
      data: settings,
      expiresAt: Date.now() + ttl,
    };

    this.cache.set(cacheKey, cache);
  }

  /**
   * Invalidate all caches for a user
   */
  invalidateUserCache(userId: string): void {
    const keysToDelete: string[] = [];

    for (const [key] of this.cache.entries()) {
      if (key.includes(userId)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Invalidate all caches for an organization
   */
  invalidateOrganizationCache(organizationId: string): void {
    const keysToDelete: string[] = [];

    for (const [key] of this.cache.entries()) {
      if (key.includes(organizationId)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Clear all caches
   */
  clearAll(): void {
    this.cache.clear();
  }

  /**
   * Setup Realtime invalidation via Supabase
   */
  setupRealtimeInvalidation(supabaseClient?: SupabaseClient): void {
    this.supabase = supabaseClient || createServiceRoleClient();

    if (this.realtimeChannel) {
      this.realtimeChannel.unsubscribe();
    }

    this.realtimeChannel = this.supabase
      .channel('permission_cache_invalidation')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'memberships' },
        (payload) => this.handleMembershipChange(payload)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'organizations' },
        (payload) => this.handleOrganizationChange(payload)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'users' },
        (payload) => this.handleUserChange(payload)
      )
      .subscribe();
  }

  /**
   * Stop Realtime invalidation
   */
  stopRealtimeInvalidation(): void {
    if (this.realtimeChannel) {
      this.realtimeChannel.unsubscribe();
      this.realtimeChannel = null;
    }
    this.supabase = null;
  }

  /**
   * Handle membership changes (role changes, status changes)
   */
  private handleMembershipChange(payload: any): void {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    if (eventType === 'INSERT' || eventType === 'UPDATE') {
      // Invalidate user caches when membership changes
      if (newRecord?.user_id) {
        this.invalidateUserCache(newRecord.user_id);
      }
      // Invalidate organization caches when membership changes
      if (newRecord?.organization_id) {
        this.invalidateOrganizationCache(newRecord.organization_id);
      }

      // Log RBAC changes
      if (eventType === 'UPDATE' && oldRecord) {
        this.logRBACChange(newRecord, oldRecord);
      }
    } else if (eventType === 'DELETE') {
      // Invalidate user caches when membership is deleted
      if (oldRecord?.user_id) {
        this.invalidateUserCache(oldRecord.user_id);
      }
      // Invalidate organization caches when membership is deleted
      if (oldRecord?.organization_id) {
        this.invalidateOrganizationCache(oldRecord.organization_id);
      }
    }
  }

  /**
   * Log RBAC changes for audit purposes
   */
  private async logRBACChange(newRecord: any, oldRecord: any): Promise<void> {
    try {
      const auditLogger = getAuditLogger();

      if (newRecord.role !== oldRecord.role) {
        // Role change
        await auditLogger.logRBACChange(
          'role_changed',
          newRecord.user_id, // This should be the user making the change, but we don't have that info
          newRecord.organization_id,
          newRecord.user_id,
          {
            oldRole: oldRecord.role,
            newRole: newRecord.role,
            reason: 'role_updated_via_membership_change',
          }
        );
      }

      if (newRecord.status !== oldRecord.status) {
        // Status change (active/inactive/invited/suspended)
        const eventType = newRecord.status === 'active' ? 'user_added_to_org' :
                         newRecord.status === 'suspended' ? 'user_removed_from_org' : 'role_changed';

        await auditLogger.logRBACChange(
          eventType,
          newRecord.user_id,
          newRecord.organization_id,
          newRecord.user_id,
          {
            oldRole: oldRecord.role,
            newRole: newRecord.role,
            reason: `status_changed_to_${newRecord.status}`,
          }
        );
      }
    } catch (error) {
      console.error('Failed to log RBAC change:', error);
    }
  }

  /**
   * Handle organization changes (settings, structure changes)
   */
  private handleOrganizationChange(payload: any): void {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    const orgId = newRecord?.id || oldRecord?.id;
    if (orgId) {
      // Invalidate all organization-related caches
      this.invalidateOrganizationCache(orgId);
    }
  }

  /**
   * Handle user changes (profile updates, status changes)
   */
  private handleUserChange(payload: any): void {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    const userId = newRecord?.id || oldRecord?.id;
    if (userId) {
      // Invalidate user-related caches
      this.invalidateUserCache(userId);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): { entries: number; hitRate?: number; realtimeEnabled: boolean } {
    return {
      entries: this.cache.size,
      realtimeEnabled: this.realtimeChannel !== null,
    };
  }

  private getCacheKey(type: string, ...identifiers: (string | undefined)[]): string {
    return `${type}:${identifiers.filter(Boolean).join(':')}`;
  }

  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, cache] of this.cache.entries()) {
      let hasExpiredEntries = false;

      if (cache.memberships && now > cache.memberships.expiresAt) {
        hasExpiredEntries = true;
      }
      if (cache.permissions && now > cache.permissions.expiresAt) {
        hasExpiredEntries = true;
      }
      if (cache.organizationSettings && now > cache.organizationSettings.expiresAt) {
        hasExpiredEntries = true;
      }

      if (hasExpiredEntries) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
  }
}

// Singleton instance
let cacheInstance: PermissionCacheService | null = null;

export function getPermissionCache(): PermissionCacheService {
  if (!cacheInstance) {
    cacheInstance = new PermissionCacheService();
  }
  return cacheInstance;
}

export function getPermissionCacheWithRealtime(supabaseClient?: SupabaseClient): PermissionCacheService {
  if (!cacheInstance) {
    cacheInstance = new PermissionCacheService();
  }

  // Setup Realtime invalidation if not already enabled
  if (!cacheInstance.getStats().realtimeEnabled) {
    cacheInstance.setupRealtimeInvalidation(supabaseClient);
  }

  return cacheInstance;
}

// Redis-based cache implementation (for future use)
export class RedisPermissionCache extends PermissionCacheService {
  private redis: any = null;

  constructor(redisClient?: any) {
    super();
    this.redis = redisClient;
  }

  async getMembership(userId: string, organizationId?: string): Promise<any | null> {
    if (!this.redis) return super.getMembership(userId, organizationId);

    const key = `membership:${userId}:${organizationId || 'default'}`;
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  async setMembership(userId: string, organizationId: string, data: any, ttl: number = 300): Promise<void> {
    if (!this.redis) return super.setMembership(userId, organizationId, data, ttl);

    const key = `membership:${userId}:${organizationId}`;
    await this.redis.setex(key, ttl, JSON.stringify(data));
  }

  // Similar implementations for other cache methods...
}

export default PermissionCacheService;
