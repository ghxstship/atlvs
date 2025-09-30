// Utility functions for database operations with conflict resolution
// Implements optimistic locking using updated_at timestamps

export interface ConflictResolutionOptions {
  table: string;
  id: string;
  organization_id: string;
  clientVersion?: string; // ISO timestamp from client
  operation: 'update' | 'delete';
}

export interface ConflictResult {
  success: boolean;
  data?: any;
  error?: {
    type: 'conflict' | 'not_found' | 'permission_denied' | 'server_error';
    message: string;
    serverVersion?: string;
  };
}

/**
 * Perform an update operation with optimistic locking
 * Checks if the record hasn't been modified since client last read it
 */
export async function updateWithOptimisticLock(
  supabase: any,
  table: string,
  id: string,
  organization_id: string,
  updates: Record<string, any>,
  clientVersion?: string,
  additionalFilters: Record<string, any> = {}
): Promise<ConflictResult> {
  try {
    // Build the query to check current state
    let query = supabase
      .from(table)
      .select('updated_at')
      .eq('id', id)
      .eq('organization_id', organization_id);

    // Add any additional filters
    Object.entries(additionalFilters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { data: current, error: fetchError } = await query.single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') { // Not found
        return {
          success: false,
          error: { type: 'not_found', message: 'Record not found' }
        };
      }
      throw fetchError;
    }

    // Check for version conflict if client provided a version
    if (clientVersion) {
      const clientTime = new Date(clientVersion);
      const serverTime = new Date(current.updated_at);

      // Allow small time differences (within 1 second) for clock skew
      const timeDiff = Math.abs(serverTime.getTime() - clientTime.getTime());

      if (timeDiff > 1000) { // More than 1 second difference
        return {
          success: false,
          error: {
            type: 'conflict',
            message: 'Record was modified by another user. Please refresh and try again.',
            serverVersion: current.updated_at
          }
        };
      }
    }

    // Perform the update
    const updateQuery = supabase
      .from(table)
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('organization_id', organization_id);

    // Add additional filters
    Object.entries(additionalFilters).forEach(([key, value]) => {
      updateQuery.eq(key, value);
    });

    const { data: updated, error: updateError } = await updateQuery.select().single();

    if (updateError) {
      throw updateError;
    }

    return { success: true, data: updated };

  } catch (error) {
    console.error('Optimistic locking update failed:', error);
    return {
      success: false,
      error: {
        type: 'server_error',
        message: error.message || 'Server error during update'
      }
    };
  }
}

/**
 * Perform a delete operation with optimistic locking
 */
export async function deleteWithOptimisticLock(
  supabase: any,
  table: string,
  id: string,
  organization_id: string,
  clientVersion?: string,
  additionalFilters: Record<string, any> = {}
): Promise<ConflictResult> {
  try {
    // Check current state first
    let query = supabase
      .from(table)
      .select('updated_at')
      .eq('id', id)
      .eq('organization_id', organization_id);

    // Add any additional filters
    Object.entries(additionalFilters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { data: current, error: fetchError } = await query.single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') { // Not found
        return {
          success: false,
          error: { type: 'not_found', message: 'Record not found' }
        };
      }
      throw fetchError;
    }

    // Check for version conflict if client provided a version
    if (clientVersion) {
      const clientTime = new Date(clientVersion);
      const serverTime = new Date(current.updated_at);

      const timeDiff = Math.abs(serverTime.getTime() - clientTime.getTime());

      if (timeDiff > 1000) {
        return {
          success: false,
          error: {
            type: 'conflict',
            message: 'Record was modified by another user. Please refresh and try again.',
            serverVersion: current.updated_at
          }
        };
      }
    }

    // Perform the delete
    const deleteQuery = supabase
      .from(table)
      .delete()
      .eq('id', id)
      .eq('organization_id', organization_id);

    // Add additional filters
    Object.entries(additionalFilters).forEach(([key, value]) => {
      deleteQuery.eq(key, value);
    });

    const { error: deleteError } = await deleteQuery;

    if (deleteError) {
      throw deleteError;
    }

    return { success: true };

  } catch (error) {
    console.error('Optimistic locking delete failed:', error);
    return {
      success: false,
      error: {
        type: 'server_error',
        message: error.message || 'Server error during delete'
      }
    };
  }
}

/**
 * Utility to get the current server timestamp for optimistic locking
 */
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}
