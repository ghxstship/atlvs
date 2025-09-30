import { createServiceRoleClient } from '@ghxstship/auth';
import { PostgrestError } from '@supabase/supabase-js';

/**
 * Optimistic Locking Utility
 * Provides version-based concurrency control for database operations
 */

export interface VersionedEntity {
  id: string;
  version: number;
  [key: string]: any;
}

export interface UpdateWithVersion<T = any> {
  id: string;
  version: number;
  updates: Partial<T>;
}

export interface ConflictResolutionStrategy {
  onConflict: 'fail' | 'retry' | 'merge';
  maxRetries?: number;
  retryDelay?: number;
  mergeFunction?: (current: any, proposed: any) => any;
}

/**
 * Optimistic Locking Service
 */
export class OptimisticLockingService {
  private supabase = createServiceRoleClient();

  /**
   * Update an entity with version checking
   */
  async updateWithVersion<T extends VersionedEntity>(
    table: string,
    { id, version, updates }: UpdateWithVersion<T>,
    strategy: ConflictResolutionStrategy = { onConflict: 'fail' }
  ): Promise<{ data: T | null; error: PostgrestError | null; conflict: boolean }> {
    try {
      // Attempt update with version check
      const { data, error } = await this.supabase
        .from(table)
        .update({ ...updates, version: version + 1 })
        .eq('id', id)
        .eq('version', version)
        .select()
        .single();

      if (error) {
        // Check if it's a version conflict
        if (error.code === 'PGRST116' || this.isVersionConflict(error)) {
          return await this.handleConflict(table, id, updates, strategy);
        }
        return { data: null, error, conflict: false };
      }

      return { data: data as T, error: null, conflict: false };
    } catch (err) {
      return {
        data: null,
        error: err as PostgrestError,
        conflict: false
      };
    }
  }

  /**
   * Batch update multiple entities with version checking
   */
  async batchUpdateWithVersion<T extends VersionedEntity>(
    table: string,
    updates: UpdateWithVersion<T>[],
    strategy: ConflictResolutionStrategy = { onConflict: 'fail' }
  ): Promise<{
    successful: T[];
    failed: { update: UpdateWithVersion<T>; error: PostgrestError }[];
    conflicts: UpdateWithVersion<T>[];
  }> {
    const successful: T[] = [];
    const failed: { update: UpdateWithVersion<T>; error: PostgrestError }[] = [];
    const conflicts: UpdateWithVersion<T>[] = [];

    // Process updates sequentially to handle conflicts properly
    for (const update of updates) {
      const result = await this.updateWithVersion(table, update, strategy);

      if (result.data) {
        successful.push(result.data);
      } else if (result.conflict) {
        conflicts.push(update);
      } else if (result.error) {
        failed.push({ update, error: result.error });
      }
    }

    return { successful, failed, conflicts };
  }

  /**
   * Get current version of an entity
   */
  async getCurrentVersion(table: string, id: string): Promise<{ version: number | null; error: PostgrestError | null }> {
    try {
      const { data, error } = await this.supabase
        .from(table)
        .select('version')
        .eq('id', id)
        .single();

      if (error) {
        return { version: null, error };
      }

      return { version: data.version, error: null };
    } catch (err) {
      return { version: null, error: err as PostgrestError };
    }
  }

  /**
   * Handle version conflicts based on strategy
   */
  private async handleConflict<T>(
    table: string,
    id: string,
    updates: Partial<T>,
    strategy: ConflictResolutionStrategy
  ): Promise<{ data: T | null; error: PostgrestError | null; conflict: boolean }> {
    switch (strategy.onConflict) {
      case 'fail':
        return {
          data: null,
          error: { message: 'Version conflict detected', code: 'VERSION_CONFLICT' } as PostgrestError,
          conflict: true
        };

      case 'retry':
        return await this.retryWithVersion(table, id, updates, strategy);

      case 'merge':
        return await this.mergeWithVersion(table, id, updates, strategy);

      default:
        return {
          data: null,
          error: { message: 'Unknown conflict resolution strategy', code: 'INVALID_STRATEGY' } as PostgrestError,
          conflict: true
        };
    }
  }

  /**
   * Retry update after fetching current version
   */
  private async retryWithVersion<T>(
    table: string,
    id: string,
    updates: Partial<T>,
    strategy: ConflictResolutionStrategy
  ): Promise<{ data: T | null; error: PostgrestError | null; conflict: boolean }> {
    const maxRetries = strategy.maxRetries || 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      // Get current version
      const { version: currentVersion, error: versionError } = await this.getCurrentVersion(table, id);

      if (versionError || currentVersion === null) {
        return {
          data: null,
          error: versionError || { message: 'Failed to get current version', code: 'VERSION_FETCH_FAILED' } as PostgrestError,
          conflict: true
        };
      }

      // Retry update with current version
      const result = await this.updateWithVersion(table, { id, version: currentVersion, updates }, { onConflict: 'fail' });

      if (!result.conflict) {
        return result as { data: T | null; error: PostgrestError | null; conflict: boolean };
      }

      attempt++;

      // Wait before retry
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, strategy.retryDelay || 1000));
      }
    }

    return {
      data: null,
      error: { message: `Max retries (${maxRetries}) exceeded`, code: 'MAX_RETRIES_EXCEEDED' } as PostgrestError,
      conflict: true
    };
  }

  /**
   * Merge conflicting updates
   */
  private async mergeWithVersion<T>(
    table: string,
    id: string,
    updates: Partial<T>,
    strategy: ConflictResolutionStrategy
  ): Promise<{ data: T | null; error: PostgrestError | null; conflict: boolean }> {
    if (!strategy.mergeFunction) {
      return {
        data: null,
        error: { message: 'Merge function required for merge strategy', code: 'MERGE_FUNCTION_MISSING' } as PostgrestError,
        conflict: true
      };
    }

    // Get current data
    const { data: currentData, error: fetchError } = await this.supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      return { data: null, error: fetchError, conflict: true };
    }

    // Merge data
    const mergedUpdates = strategy.mergeFunction(currentData, updates);

    // Update with merged data
    const result = await this.updateWithVersion(table, {
      id,
      version: currentData.version,
      updates: mergedUpdates
    }, { onConflict: 'fail' });

    return result as { data: T | null; error: PostgrestError | null; conflict: boolean };
  }

  /**
   * Check if error is a version conflict
   */
  private isVersionConflict(error: PostgrestError): boolean {
    // Supabase returns PGRST116 for no rows affected (version mismatch)
    return error.code === 'PGRST116' ||
           error.message.includes('version') ||
           error.message.includes('concurrent');
  }
}

// Singleton instance
let optimisticLockingService: OptimisticLockingService | null = null;

export function getOptimisticLockingService(): OptimisticLockingService {
  if (!optimisticLockingService) {
    optimisticLockingService = new OptimisticLockingService();
  }
  return optimisticLockingService;
}

// Utility functions for common merge strategies
export const MergeStrategies = {
  /**
   * Last-write-wins merge (proposed changes override current)
   */
  lastWriteWins: <T>(current: T, proposed: Partial<T>): Partial<T> => {
    return { ...current, ...proposed };
  },

  /**
   * Field-level merge (only non-null proposed values override)
   */
  fieldLevelMerge: <T>(current: T, proposed: Partial<T>): Partial<T> => {
    const result: Partial<T> = { ...current };

    Object.entries(proposed).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        (result as any)[key] = value;
      }
    });

    return result;
  },

  /**
   * Timestamp-based merge (newer timestamps win)
   */
  timestampBasedMerge: <T extends { updated_at?: string }>(
    current: T,
    proposed: Partial<T>
  ): Partial<T> => {
    const currentTime = current.updated_at ? new Date(current.updated_at).getTime() : 0;
    const proposedTime = proposed.updated_at ? new Date(proposed.updated_at as string).getTime() : Date.now();

    return proposedTime > currentTime ? proposed : current;
  }
};
