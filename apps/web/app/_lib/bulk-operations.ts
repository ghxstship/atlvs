/**
 * Universal Bulk Operations System
 * Provides bulk CRUD operations for all modules
 */

export interface BulkOperationResult<T = any> {
  success: boolean;
  successCount: number;
  failureCount: number;
  results: Array<{
    id: string;
    success: boolean;
    error?: string;
    data?: T;
  }>;
}

export interface BulkOperationOptions {
  onProgress?: (current: number, total: number) => void;
  onError?: (error: Error, id: string) => void;
  continueOnError?: boolean;
}

/**
 * Bulk delete items
 */
export async function bulkDelete(
  endpoint: string,
  ids: string[],
  options: BulkOperationOptions = {}
): Promise<BulkOperationResult> {
  const results: BulkOperationResult['results'] = [];
  let successCount = 0;
  let failureCount = 0;

  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    
    try {
      options.onProgress?.(i + 1, ids.length);
      
      const response = await fetch(`${endpoint}/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        successCount++;
        results.push({ id, success: true });
      } else {
        failureCount++;
        const error = await response.text();
        results.push({ id, success: false, error });
        options.onError?.(new Error(error), id);
        
        if (!options.continueOnError) break;
      }
    } catch (error) {
      failureCount++;
      results.push({ 
        id, 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      options.onError?.(error as Error, id);
      
      if (!options.continueOnError) break;
    }
  }

  return {
    success: failureCount === 0,
    successCount,
    failureCount,
    results
  };
}

/**
 * Bulk update items
 */
export async function bulkUpdate<T = any>(
  endpoint: string,
  updates: Array<{ id: string; data: Partial<T> }>,
  options: BulkOperationOptions = {}
): Promise<BulkOperationResult<T>> {
  const results: BulkOperationResult<T>['results'] = [];
  let successCount = 0;
  let failureCount = 0;

  for (let i = 0; i < updates.length; i++) {
    const { id, data } = updates[i];
    
    try {
      options.onProgress?.(i + 1, updates.length);
      
      const response = await fetch(`${endpoint}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const result = await response.json();
        successCount++;
        results.push({ id, success: true, data: result });
      } else {
        failureCount++;
        const error = await response.text();
        results.push({ id, success: false, error });
        options.onError?.(new Error(error), id);
        
        if (!options.continueOnError) break;
      }
    } catch (error) {
      failureCount++;
      results.push({ 
        id, 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      options.onError?.(error as Error, id);
      
      if (!options.continueOnError) break;
    }
  }

  return {
    success: failureCount === 0,
    successCount,
    failureCount,
    results
  };
}

/**
 * Bulk export items
 */
export async function bulkExport(
  endpoint: string,
  ids: string[],
  format: 'csv' | 'json' | 'xlsx' = 'csv'
): Promise<Blob> {
  const response = await fetch(`${endpoint}/export`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids, format })
  });

  if (!response.ok) {
    throw new Error('Export failed');
  }

  return response.blob();
}

/**
 * Bulk archive items
 */
export async function bulkArchive(
  endpoint: string,
  ids: string[],
  options: BulkOperationOptions = {}
): Promise<BulkOperationResult> {
  return bulkUpdate(
    endpoint,
    ids.map(id => ({ id, data: { archived: true } as any })),
    options
  );
}

/**
 * Bulk restore items
 */
export async function bulkRestore(
  endpoint: string,
  ids: string[],
  options: BulkOperationOptions = {}
): Promise<BulkOperationResult> {
  return bulkUpdate(
    endpoint,
    ids.map(id => ({ id, data: { archived: false } as any })),
    options
  );
}

/**
 * React hook for bulk operations
 */
export function useBulkOperations() {
  return {
    bulkDelete,
    bulkUpdate,
    bulkExport,
    bulkArchive,
    bulkRestore
  };
}
