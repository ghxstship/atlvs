// Strict Base Service with Enhanced Type Safety
// Provides a foundation for all services with comprehensive type checking and validation

import { v4 as uuidv4 } from 'uuid';
import {
  UUID,
  Timestamp,
  StrictServiceContext,
  StrictServiceResult,
  StrictSuccessResult,
  StrictErrorResult,
  StrictPaginationParams,
  StrictSortParams,
  StrictQueryParams,
  createStrictSuccessResult,
  createStrictErrorResult,
  validateRequired,
  validateUUID
} from '../types/strict-types';
import {
  isUUID,
  isTimestamp,
  validateAndTransform,
  validateObject,
  isStrictPaginationParams,
  isStrictSortParams,
  isStrictQueryParams
} from '../utils/type-guards';
import { ApiLogger } from '../utils/api-logger';
import { ApiMetrics } from '../utils/api-metrics';

// Enhanced service context with strict validation
export interface StrictServiceContextInput {
  supabase: any; // TODO: Replace with proper Supabase client type
  organizationId: string;
  userId: string;
  requestId?: string;
}

// Abstract strict base service class
export abstract class StrictBaseService {
  protected readonly context: StrictServiceContext;
  protected readonly logger: ApiLogger;
  protected readonly metrics: ApiMetrics;

  constructor(contextInput: StrictServiceContextInput) {
    // Validate and transform context
    this.context = this.validateServiceContext(contextInput);
    this.logger = new ApiLogger();
    this.metrics = new ApiMetrics();
    
    this.logger.info('Service initialized', {
      serviceName: this.constructor.name,
      organizationId: this.context.organizationId,
      userId: this.context.userId,
      requestId: this.context.requestId
    });
  }

  // Validate service context with strict type checking
  private validateServiceContext(input: StrictServiceContextInput): StrictServiceContext {
    const organizationId = validateUUID(input.organizationId, 'organizationId');
    const userId = validateUUID(input.userId, 'userId');
    const requestId = input.requestId ? validateUUID(input.requestId, 'requestId') : (uuidv4() as UUID);
    const timestamp = new Date().toISOString() as Timestamp;

    if (!input.supabase) {
      throw new Error('Supabase client is required');
    }

    return {
      supabase: input.supabase,
      organizationId,
      userId,
      requestId,
      timestamp
    };
  }

  // Create success result with strict typing
  protected createSuccessResult<T>(data: T): StrictSuccessResult<T> {
    return createStrictSuccessResult(
      data as NonNullable<T>,
      this.context.requestId,
      new Date().toISOString() as Timestamp
    );
  }

  // Create error result with strict typing
  protected createErrorResult(error: string): StrictErrorResult {
    return createStrictErrorResult(
      error,
      this.context.requestId,
      new Date().toISOString() as Timestamp
    );
  }

  // Enhanced error handling with strict typing
  protected async handleDatabaseError(error: unknown, operation: string): Promise<StrictErrorResult> {
    const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
    
    this.logger.error('Database operation failed', {
      operation,
      error: errorMessage,
      organizationId: this.context.organizationId,
      userId: this.context.userId,
      requestId: this.context.requestId,
      stack: error instanceof Error ? error.stack : undefined
    });

    this.metrics.recordError(operation, errorMessage);

    return this.createErrorResult(`Database operation '${operation}' failed: ${errorMessage}`);
  }

  // Validate pagination parameters with strict typing
  protected validatePaginationParams(params: unknown): StrictPaginationParams {
    return validateAndTransform(
      params,
      isStrictPaginationParams,
      'Invalid pagination parameters'
    );
  }

  // Validate sort parameters with strict typing
  protected validateSortParams(params: unknown): StrictSortParams {
    return validateAndTransform(
      params,
      isStrictSortParams,
      'Invalid sort parameters'
    );
  }

  // Validate query parameters with strict typing
  protected validateQueryParams(params: unknown): StrictQueryParams {
    return validateAndTransform(
      params,
      isStrictQueryParams,
      'Invalid query parameters'
    );
  }

  // Build pagination query with type safety
  protected buildPaginationQuery(query: any, params: StrictPaginationParams): any {
    const validatedParams = this.validatePaginationParams(params);
    
    if (validatedParams.limit > 0) {
      query = query.limit(validatedParams.limit);
    }
    
    if (validatedParams.offset > 0) {
      const endRange = validatedParams.offset + validatedParams.limit - 1;
      query = query.range(validatedParams.offset, endRange);
    }
    
    return query;
  }

  // Build sort query with type safety
  protected buildSortQuery(query: any, params: StrictSortParams): any {
    const validatedParams = this.validateSortParams(params);
    
    return query.order(validatedParams.sortBy, { 
      ascending: validatedParams.sortOrder === 'asc' 
    });
  }

  // Execute database query with comprehensive error handling and logging
  protected async executeQuery<T>(
    operation: string,
    queryBuilder: () => Promise<{ data: T | null; error: any }>,
    validator?: (data: unknown) => data is T
  ): Promise<StrictServiceResult<T>> {
    const startTime = Date.now();
    
    try {
      this.logger.info('Executing database query', {
        operation,
        organizationId: this.context.organizationId,
        userId: this.context.userId,
        requestId: this.context.requestId
      });

      const result = await queryBuilder();
      const duration = Date.now() - startTime;

      if (result.error) {
        this.metrics.recordError(operation, result.error.message);
        return await this.handleDatabaseError(result.error, operation);
      }

      if (result.data === null) {
        this.logger.warn('Query returned null data', {
          operation,
          requestId: this.context.requestId
        });
        return this.createErrorResult(`No data found for operation: ${operation}`);
      }

      // Validate data if validator is provided
      if (validator && !validator(result.data)) {
        this.logger.error('Data validation failed', {
          operation,
          data: result.data,
          requestId: this.context.requestId
        });
        return this.createErrorResult(`Data validation failed for operation: ${operation}`);
      }

      this.metrics.recordSuccess(operation, duration);
      this.logger.info('Database query completed successfully', {
        operation,
        duration,
        requestId: this.context.requestId
      });

      return this.createSuccessResult(result.data);

    } catch (error) {
      const duration = Date.now() - startTime;
      this.metrics.recordError(operation, error instanceof Error ? error.message : 'Unknown error');
      
      return await this.handleDatabaseError(error, operation);
    }
  }

  // Execute multiple queries in a transaction with strict typing
  protected async executeTransaction<T>(
    operation: string,
    transactionBuilder: (client: any) => Promise<T>,
    validator?: (data: unknown) => data is T
  ): Promise<StrictServiceResult<T>> {
    const startTime = Date.now();
    
    try {
      this.logger.info('Starting database transaction', {
        operation,
        organizationId: this.context.organizationId,
        userId: this.context.userId,
        requestId: this.context.requestId
      });

      // Note: This is a simplified transaction example
      // In a real implementation, you would use Supabase's transaction capabilities
      const result = await transactionBuilder(this.context.supabase);
      const duration = Date.now() - startTime;

      // Validate result if validator is provided
      if (validator && !validator(result)) {
        this.logger.error('Transaction result validation failed', {
          operation,
          result,
          requestId: this.context.requestId
        });
        return this.createErrorResult(`Transaction result validation failed for operation: ${operation}`);
      }

      this.metrics.recordSuccess(operation, duration);
      this.logger.info('Database transaction completed successfully', {
        operation,
        duration,
        requestId: this.context.requestId
      });

      return this.createSuccessResult(result);

    } catch (error) {
      const duration = Date.now() - startTime;
      this.metrics.recordError(operation, error instanceof Error ? error.message : 'Unknown error');
      
      this.logger.error('Database transaction failed', {
        operation,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration,
        requestId: this.context.requestId
      });

      return await this.handleDatabaseError(error, operation);
    }
  }

  // Validate entity ownership for security
  protected async validateEntityOwnership(
    entityId: UUID,
    tableName: string,
    ownerField: string = 'organization_id'
  ): Promise<boolean> {
    try {
      const { data, error } = await this.context.supabase
        .from(tableName)
        .select(ownerField)
        .eq('id', entityId)
        .single();

      if (error || !data) {
        this.logger.warn('Entity ownership validation failed - entity not found', {
          entityId,
          tableName,
          ownerField,
          requestId: this.context.requestId
        });
        return false;
      }

      const isOwner = data[ownerField] === this.context.organizationId;
      
      if (!isOwner) {
        this.logger.warn('Entity ownership validation failed - access denied', {
          entityId,
          tableName,
          ownerField,
          expectedOwner: this.context.organizationId,
          actualOwner: data[ownerField],
          requestId: this.context.requestId
        });
      }

      return isOwner;

    } catch (error) {
      this.logger.error('Entity ownership validation error', {
        entityId,
        tableName,
        ownerField,
        error: error instanceof Error ? error.message : 'Unknown error',
        requestId: this.context.requestId
      });
      return false;
    }
  }

  // Rate limiting helper
  protected async checkRateLimit(
    operation: string,
    limit: number,
    windowMs: number
  ): Promise<boolean> {
    // This is a simplified rate limiting example
    // In a real implementation, you would use Redis or similar
    const key = `rate_limit:${this.context.organizationId}:${operation}`;
    
    try {
      // Implementation would check rate limit here
      // For now, we'll just log the attempt
      this.logger.debug('Rate limit check', {
        operation,
        limit,
        windowMs,
        key,
        requestId: this.context.requestId
      });
      
      return true; // Allow for now
      
    } catch (error) {
      this.logger.error('Rate limit check failed', {
        operation,
        error: error instanceof Error ? error.message : 'Unknown error',
        requestId: this.context.requestId
      });
      return false;
    }
  }

  // Cache helper with type safety
  protected async getCached<T>(
    key: string,
    validator: (data: unknown) => data is T,
    ttlSeconds: number = 300
  ): Promise<T | null> {
    try {
      // This is a simplified cache example
      // In a real implementation, you would use Redis or similar
      this.logger.debug('Cache get attempt', {
        key,
        ttlSeconds,
        requestId: this.context.requestId
      });
      
      // For now, return null (cache miss)
      return null;
      
    } catch (error) {
      this.logger.error('Cache get failed', {
        key,
        error: error instanceof Error ? error.message : 'Unknown error',
        requestId: this.context.requestId
      });
      return null;
    }
  }

  // Set cache with type safety
  protected async setCache<T>(
    key: string,
    data: T,
    ttlSeconds: number = 300
  ): Promise<void> {
    try {
      // This is a simplified cache example
      // In a real implementation, you would use Redis or similar
      this.logger.debug('Cache set attempt', {
        key,
        ttlSeconds,
        dataType: typeof data,
        requestId: this.context.requestId
      });
      
      // Implementation would set cache here
      
    } catch (error) {
      this.logger.error('Cache set failed', {
        key,
        error: error instanceof Error ? error.message : 'Unknown error',
        requestId: this.context.requestId
      });
    }
  }

  // Get service context for child services
  protected getContext(): StrictServiceContext {
    return { ...this.context };
  }

  // Get service metrics
  protected getMetrics(): any {
    return this.metrics.getMetrics();
  }

  // Abstract method for service-specific validation
  protected abstract validateServiceSpecificData<T>(
    data: unknown,
    operation: string
  ): data is T;
}
