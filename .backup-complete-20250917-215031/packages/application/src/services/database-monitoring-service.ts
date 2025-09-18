import { BaseService, ServiceResult, ServiceContext } from './base-service';
import { logger } from '../utils/api-logger';
import { ApiMetrics } from '../utils/api-metrics';

// Database performance monitoring types
export interface TablePerformanceStats {
  tableName: string;
  tableSize: string;
  indexSize: string;
  totalSize: string;
  rowCount: number;
  seqScan: number;
  seqTupRead: number;
  idxScan: number;
  idxTupFetch: number;
  indexUsagePercent: number;
  lastVacuum?: string;
  lastAnalyze?: string;
}

export interface IndexUsageStats {
  tableName: string;
  indexName: string;
  timesUsed: number;
  indexSize: string;
  idxTupRead: number;
  idxTupFetch: number;
}

export interface MissingIndexRecommendation {
  tableName: string;
  columnName: string;
  constraintType: string;
  recommendation: string;
}

export interface PerformanceRecommendation {
  category: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  tableName: string;
  recommendation: string;
  impact: string;
}

export interface DatabaseHealthReport {
  section: string;
  metric: string;
  value: string;
  status: 'OK' | 'WARNING' | 'CRITICAL' | 'INFO';
  recommendation: string;
}

export interface QueryPerformanceStats {
  query: string;
  calls: number;
  totalTime: number;
  meanTime: number;
  rows: number;
  hitPercent: number;
}

export interface VacuumCandidate {
  tableName: string;
  deadTuples: number;
  liveTuples: number;
  deadTupPercent: number;
  lastVacuum?: string;
  lastAutovacuum?: string;
  recommendation: string;
}

export class DatabaseMonitoringService extends BaseService {
  constructor(context: ServiceContext) {
    super(context);
  }

  /**
   * Get comprehensive table performance statistics
   */
  async getTablePerformanceStats(): Promise<ServiceResult<TablePerformanceStats[]>> {
    try {
      logger.logServiceCall('DatabaseMonitoringService', 'getTablePerformanceStats', {}, {
        organizationId: this.organizationId,
        userId: this.userId
      });

      const startTime = Date.now();

      const { data, error } = await this.supabase
        .rpc('analyze_table_performance');

      if (error) {
        logger.error('Failed to get table performance stats', {
          organizationId: this.organizationId,
          userId: this.userId,
          error
        });
        return this.handleDatabaseError(error);
      }

      const stats: TablePerformanceStats[] = data?.map((row: any) => ({
        tableName: row.table_name,
        tableSize: row.table_size,
        indexSize: row.index_size,
        totalSize: row.total_size,
        rowCount: row.row_count,
        seqScan: row.seq_scan,
        seqTupRead: row.seq_tup_read,
        idxScan: row.idx_scan,
        idxTupFetch: row.idx_tup_fetch,
        indexUsagePercent: row.idx_scan > 0 ? 
          Math.round((row.idx_scan / (row.seq_scan + row.idx_scan)) * 100) : 0
      })) || [];

      const duration = Date.now() - startTime;
      // Record metrics for database query
      
      logger.logServiceResult('DatabaseMonitoringService', 'getTablePerformanceStats', true, duration, {
        organizationId: this.organizationId,
        userId: this.userId,
        metadata: { tableCount: stats.length }
      });

      return this.createSuccessResult(stats);
    } catch (error) {
      logger.error('Unexpected error in getTablePerformanceStats', {
        organizationId: this.organizationId,
        userId: this.userId,
        error: error as Error
      });
      return this.handleDatabaseError(error);
    }
  }

  /**
   * Get index usage statistics
   */
  async getIndexUsageStats(): Promise<ServiceResult<IndexUsageStats[]>> {
    try {
      logger.logServiceCall('DatabaseMonitoringService', 'getIndexUsageStats', {}, {
        organizationId: this.organizationId,
        userId: this.userId
      });

      const startTime = Date.now();

      const { data, error } = await this.supabase
        .from('index_usage_stats')
        .select('*')
        .order('times_used', { ascending: false });

      if (error) {
        logger.error('Failed to get index usage stats', {
          organizationId: this.organizationId,
          userId: this.userId,
          error
        });
        return this.handleDatabaseError(error);
      }

      const stats: IndexUsageStats[] = data?.map((row: any) => ({
        tableName: row.table_name,
        indexName: row.index_name,
        timesUsed: row.times_used,
        indexSize: row.index_size,
        idxTupRead: row.idx_tup_read,
        idxTupFetch: row.idx_tup_fetch
      })) || [];

      const duration = Date.now() - startTime;
      // Record metrics for index usage query

      return this.createSuccessResult(stats);
    } catch (error) {
      return this.handleDatabaseError(error);
    }
  }

  /**
   * Identify missing index recommendations
   */
  async getMissingIndexRecommendations(): Promise<ServiceResult<MissingIndexRecommendation[]>> {
    try {
      logger.logServiceCall('DatabaseMonitoringService', 'getMissingIndexRecommendations', {}, {
        organizationId: this.organizationId,
        userId: this.userId
      });

      const { data, error } = await this.supabase
        .rpc('identify_missing_indexes');

      if (error) {
        return this.handleDatabaseError(error);
      }

      const recommendations: MissingIndexRecommendation[] = data?.map((row: any) => ({
        tableName: row.table_name,
        columnName: row.column_name,
        constraintType: row.constraint_type,
        recommendation: row.recommendation
      })) || [];

      return this.createSuccessResult(recommendations);
    } catch (error) {
      return this.handleDatabaseError(error);
    }
  }

  /**
   * Get performance optimization recommendations
   */
  async getPerformanceRecommendations(): Promise<ServiceResult<PerformanceRecommendation[]>> {
    try {
      logger.logServiceCall('DatabaseMonitoringService', 'getPerformanceRecommendations', {}, {
        organizationId: this.organizationId,
        userId: this.userId
      });

      const { data, error } = await this.supabase
        .rpc('generate_performance_recommendations');

      if (error) {
        return this.handleDatabaseError(error);
      }

      const recommendations: PerformanceRecommendation[] = data?.map((row: any) => ({
        category: row.category,
        priority: row.priority as 'HIGH' | 'MEDIUM' | 'LOW',
        tableName: row.table_name,
        recommendation: row.recommendation,
        impact: row.impact
      })) || [];

      return this.createSuccessResult(recommendations);
    } catch (error) {
      return this.handleDatabaseError(error);
    }
  }

  /**
   * Get comprehensive database health report
   */
  async getDatabaseHealthReport(): Promise<ServiceResult<DatabaseHealthReport[]>> {
    try {
      logger.logServiceCall('DatabaseMonitoringService', 'getDatabaseHealthReport', {}, {
        organizationId: this.organizationId,
        userId: this.userId
      });

      const startTime = Date.now();

      const { data, error } = await this.supabase
        .rpc('database_performance_report');

      if (error) {
        return this.handleDatabaseError(error);
      }

      const report: DatabaseHealthReport[] = data?.map((row: any) => ({
        section: row.section,
        metric: row.metric,
        value: row.value,
        status: row.status as 'OK' | 'WARNING' | 'CRITICAL' | 'INFO',
        recommendation: row.recommendation
      })) || [];

      const duration = Date.now() - startTime;
      // Record metrics for health report query

      // Log health status summary
      const statusCounts = report.reduce((acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      logger.logServiceResult('DatabaseMonitoringService', 'getDatabaseHealthReport', true, duration, {
        organizationId: this.organizationId,
        userId: this.userId,
        metadata: { reportItems: report.length, statusCounts }
      });

      return this.createSuccessResult(report);
    } catch (error) {
      return this.handleDatabaseError(error);
    }
  }

  /**
   * Get query performance statistics (requires pg_stat_statements)
   */
  async getQueryPerformanceStats(): Promise<ServiceResult<QueryPerformanceStats[]>> {
    try {
      logger.logServiceCall('DatabaseMonitoringService', 'getQueryPerformanceStats', {}, {
        organizationId: this.organizationId,
        userId: this.userId
      });

      const { data, error } = await this.supabase
        .rpc('analyze_query_performance');

      if (error) {
        // pg_stat_statements might not be available
        logger.warn('Query performance stats not available', {
          organizationId: this.organizationId,
          error: error as Error
        });
        return this.createSuccessResult([]);
      }

      const stats: QueryPerformanceStats[] = data?.map((row: any) => ({
        query: row.query,
        calls: row.calls,
        totalTime: row.total_time,
        meanTime: row.mean_time,
        rows: row.rows,
        hitPercent: row.hit_percent
      })) || [];

      return this.createSuccessResult(stats);
    } catch (error) {
      return this.handleDatabaseError(error);
    }
  }

  /**
   * Get tables that need vacuum operations
   */
  async getVacuumCandidates(): Promise<ServiceResult<VacuumCandidate[]>> {
    try {
      logger.logServiceCall('DatabaseMonitoringService', 'getVacuumCandidates', {}, {
        organizationId: this.organizationId,
        userId: this.userId
      });

      const { data, error } = await this.supabase
        .rpc('identify_vacuum_candidates');

      if (error) {
        return this.handleDatabaseError(error);
      }

      const candidates: VacuumCandidate[] = data?.map((row: any) => ({
        tableName: row.table_name,
        deadTuples: row.n_dead_tup,
        liveTuples: row.n_live_tup,
        deadTupPercent: row.dead_tup_percent,
        lastVacuum: row.last_vacuum,
        lastAutovacuum: row.last_autovacuum,
        recommendation: row.recommendation
      })) || [];

      return this.createSuccessResult(candidates);
    } catch (error) {
      return this.handleDatabaseError(error);
    }
  }

  /**
   * Update table statistics for better query planning
   */
  async updateTableStatistics(): Promise<ServiceResult<string>> {
    try {
      logger.logServiceCall('DatabaseMonitoringService', 'updateTableStatistics', {}, {
        organizationId: this.organizationId,
        userId: this.userId
      });

      const startTime = Date.now();

      const { data, error } = await this.supabase
        .rpc('update_table_statistics');

      if (error) {
        return this.handleDatabaseError(error);
      }

      const duration = Date.now() - startTime;
      // Record metrics for statistics update

      logger.logServiceResult('DatabaseMonitoringService', 'updateTableStatistics', true, duration, {
        organizationId: this.organizationId,
        userId: this.userId,
        metadata: { result: data }
      });

      return this.createSuccessResult(data || 'Statistics updated successfully');
    } catch (error) {
      return this.handleDatabaseError(error);
    }
  }

  /**
   * Get unused indexes that could be dropped
   */
  async getUnusedIndexes(): Promise<ServiceResult<IndexUsageStats[]>> {
    try {
      logger.logServiceCall('DatabaseMonitoringService', 'getUnusedIndexes', {}, {
        organizationId: this.organizationId,
        userId: this.userId
      });

      const { data, error } = await this.supabase
        .from('unused_indexes')
        .select('*')
        .order('index_size', { ascending: false });

      if (error) {
        return this.handleDatabaseError(error);
      }

      const unusedIndexes: IndexUsageStats[] = data?.map((row: any) => ({
        tableName: row.table_name,
        indexName: row.index_name,
        timesUsed: row.times_used,
        indexSize: row.index_size,
        idxTupRead: 0,
        idxTupFetch: 0
      })) || [];

      return this.createSuccessResult(unusedIndexes);
    } catch (error) {
      return this.handleDatabaseError(error);
    }
  }

  /**
   * Get comprehensive performance dashboard data
   */
  async getPerformanceDashboard(): Promise<ServiceResult<{
    healthReport: DatabaseHealthReport[];
    tableStats: TablePerformanceStats[];
    recommendations: PerformanceRecommendation[];
    vacuumCandidates: VacuumCandidate[];
    unusedIndexes: IndexUsageStats[];
  }>> {
    try {
      logger.logServiceCall('DatabaseMonitoringService', 'getPerformanceDashboard', {}, {
        organizationId: this.organizationId,
        userId: this.userId
      });

      const startTime = Date.now();

      // Execute all monitoring queries in parallel
      const [
        healthResult,
        tableStatsResult,
        recommendationsResult,
        vacuumResult,
        unusedIndexesResult
      ] = await Promise.all([
        this.getDatabaseHealthReport(),
        this.getTablePerformanceStats(),
        this.getPerformanceRecommendations(),
        this.getVacuumCandidates(),
        this.getUnusedIndexes()
      ]);

      // Check for any failures
      if (!healthResult.success) return healthResult as any;
      if (!tableStatsResult.success) return tableStatsResult as any;
      if (!recommendationsResult.success) return recommendationsResult as any;
      if (!vacuumResult.success) return vacuumResult as any;
      if (!unusedIndexesResult.success) return unusedIndexesResult as any;

      const dashboard = {
        healthReport: healthResult.data!,
        tableStats: tableStatsResult.data!,
        recommendations: recommendationsResult.data!,
        vacuumCandidates: vacuumResult.data!,
        unusedIndexes: unusedIndexesResult.data!
      };

      const duration = Date.now() - startTime;
      // Record metrics for dashboard query

      logger.logServiceResult('DatabaseMonitoringService', 'getPerformanceDashboard', true, duration, {
        organizationId: this.organizationId,
        userId: this.userId,
        metadata: {
          healthItems: dashboard.healthReport.length,
          tableCount: dashboard.tableStats.length,
          recommendationCount: dashboard.recommendations.length
        }
      });

      return this.createSuccessResult(dashboard);
    } catch (error) {
      return this.handleDatabaseError(error);
    }
  }
}
