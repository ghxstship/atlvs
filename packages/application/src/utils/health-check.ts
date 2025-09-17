import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';
import { logger } from './api-logger';
import { HealthMetrics, PerformanceMonitor } from './api-metrics';

// Health check status types
export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';

export interface HealthCheckResult {
  status: HealthStatus;
  timestamp: number;
  version: string;
  environment: string;
  uptime: number;
  checks: {
    database: ServiceHealthCheck;
    supabase: ServiceHealthCheck;
    memory: ServiceHealthCheck;
    performance: ServiceHealthCheck;
  };
  metrics: {
    requests: {
      total: number;
      errors: number;
      errorRate: number;
    };
    responseTime: {
      average: number;
      p95: number;
      p99: number;
    };
    system: {
      memoryUsage: number;
      cpuUsage: number;
    };
  };
}

export interface ServiceHealthCheck {
  status: HealthStatus;
  responseTime: number;
  message: string;
  details?: any;
}

class HealthChecker {
  private static instance: HealthChecker;
  private startTime: number;
  private supabase: ReturnType<typeof createClient<Database>>;

  private constructor() {
    this.startTime = Date.now();
    this.supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  public static getInstance(): HealthChecker {
    if (!HealthChecker.instance) {
      HealthChecker.instance = new HealthChecker();
    }
    return HealthChecker.instance;
  }

  public async performHealthCheck(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    logger.info('Starting health check');

    // Run all health checks in parallel
    const [
      databaseCheck,
      supabaseCheck,
      memoryCheck,
      performanceCheck
    ] = await Promise.allSettled([
      this.checkDatabase(),
      this.checkSupabase(),
      this.checkMemory(),
      this.checkPerformance()
    ]);

    // Extract results from settled promises
    const checks = {
      database: this.extractResult(databaseCheck),
      supabase: this.extractResult(supabaseCheck),
      memory: this.extractResult(memoryCheck),
      performance: this.extractResult(performanceCheck)
    };

    // Determine overall status
    const overallStatus = this.determineOverallStatus(checks);
    
    // Get metrics
    const metrics = this.getMetrics();
    
    // Calculate uptime
    const uptime = Date.now() - this.startTime;
    
    const result: HealthCheckResult = {
      status: overallStatus,
      timestamp: Date.now(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime,
      checks,
      metrics
    };

    // Record health check metrics
    const duration = Date.now() - startTime;
    HealthMetrics.recordHealthCheck('overall', overallStatus, duration);
    
    logger.info('Health check completed', {
      status: overallStatus,
      duration,
      checks: Object.keys(checks).reduce((acc, key) => {
        acc[key] = checks[key as keyof typeof checks].status;
        return acc;
      }, {} as Record<string, string>)
    });

    return result;
  }

  private async checkDatabase(): Promise<ServiceHealthCheck> {
    const startTime = Date.now();
    
    try {
      // Simple database connectivity check
      const { data, error } = await this.supabase
        .from('organizations')
        .select('count')
        .limit(1);

      const responseTime = Date.now() - startTime;

      if (error) {
        HealthMetrics.recordHealthCheck('database', 'unhealthy', responseTime);
        return {
          status: 'unhealthy',
          responseTime,
          message: `Database error: ${error.message}`,
          details: { error: error.message }
        };
      }

      const status: HealthStatus = responseTime > 1000 ? 'degraded' : 'healthy';
      HealthMetrics.recordHealthCheck('database', status, responseTime);
      
      return {
        status,
        responseTime,
        message: 'Database connection successful',
        details: { responseTime }
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      HealthMetrics.recordHealthCheck('database', 'unhealthy', responseTime);
      
      return {
        status: 'unhealthy',
        responseTime,
        message: `Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { error }
      };
    }
  }

  private async checkSupabase(): Promise<ServiceHealthCheck> {
    const startTime = Date.now();
    
    try {
      // Check Supabase auth service
      const { data, error } = await this.supabase.auth.getSession();
      const responseTime = Date.now() - startTime;

      if (error) {
        HealthMetrics.recordHealthCheck('supabase', 'degraded', responseTime);
        return {
          status: 'degraded',
          responseTime,
          message: `Supabase auth warning: ${error.message}`,
          details: { error: error.message }
        };
      }

      const status: HealthStatus = responseTime > 500 ? 'degraded' : 'healthy';
      HealthMetrics.recordHealthCheck('supabase', status, responseTime);
      
      return {
        status,
        responseTime,
        message: 'Supabase services operational',
        details: { responseTime }
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      HealthMetrics.recordHealthCheck('supabase', 'unhealthy', responseTime);
      
      return {
        status: 'unhealthy',
        responseTime,
        message: `Supabase connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { error }
      };
    }
  }

  private async checkMemory(): Promise<ServiceHealthCheck> {
    const startTime = Date.now();
    
    try {
      const memoryUsage = process.memoryUsage();
      const totalMemory = memoryUsage.heapTotal;
      const usedMemory = memoryUsage.heapUsed;
      const memoryPercent = (usedMemory / totalMemory) * 100;
      
      const responseTime = Date.now() - startTime;
      
      // Record system metrics
      HealthMetrics.recordSystemMetric('memory_usage', memoryPercent);
      HealthMetrics.recordSystemMetric('heap_used', usedMemory);
      HealthMetrics.recordSystemMetric('heap_total', totalMemory);
      
      let status: HealthStatus = 'healthy';
      let message = 'Memory usage normal';
      
      if (memoryPercent > 90) {
        status = 'unhealthy';
        message = 'Critical memory usage';
      } else if (memoryPercent > 80) {
        status = 'degraded';
        message = 'High memory usage';
      }
      
      HealthMetrics.recordHealthCheck('memory', status, responseTime);
      
      return {
        status,
        responseTime,
        message,
        details: {
          heapUsed: Math.round(usedMemory / 1024 / 1024 * 100) / 100, // MB
          heapTotal: Math.round(totalMemory / 1024 / 1024 * 100) / 100, // MB
          percentage: Math.round(memoryPercent * 100) / 100,
          external: Math.round(memoryUsage.external / 1024 / 1024 * 100) / 100, // MB
          rss: Math.round(memoryUsage.rss / 1024 / 1024 * 100) / 100 // MB
        }
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      HealthMetrics.recordHealthCheck('memory', 'unhealthy', responseTime);
      
      return {
        status: 'unhealthy',
        responseTime,
        message: `Memory check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { error }
      };
    }
  }

  private async checkPerformance(): Promise<ServiceHealthCheck> {
    const startTime = Date.now();
    
    try {
      const performanceStatus = PerformanceMonitor.checkPerformance();
      const responseTime = Date.now() - startTime;
      
      HealthMetrics.recordHealthCheck('performance', performanceStatus.status, responseTime);
      
      return {
        status: performanceStatus.status,
        responseTime,
        message: performanceStatus.issues.length > 0 
          ? `Performance issues detected: ${performanceStatus.issues.join(', ')}`
          : 'Performance metrics within normal ranges',
        details: {
          issues: performanceStatus.issues,
          issueCount: performanceStatus.issues.length
        }
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      HealthMetrics.recordHealthCheck('performance', 'unhealthy', responseTime);
      
      return {
        status: 'unhealthy',
        responseTime,
        message: `Performance check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { error }
      };
    }
  }

  private extractResult(settledResult: PromiseSettledResult<ServiceHealthCheck>): ServiceHealthCheck {
    if (settledResult.status === 'fulfilled') {
      return settledResult.value;
    } else {
      return {
        status: 'unhealthy',
        responseTime: 0,
        message: `Health check failed: ${settledResult.reason}`,
        details: { error: settledResult.reason }
      };
    }
  }

  private determineOverallStatus(checks: Record<string, ServiceHealthCheck>): HealthStatus {
    const statuses = Object.values(checks).map(check => check.status);
    
    if (statuses.includes('unhealthy')) {
      return 'unhealthy';
    } else if (statuses.includes('degraded')) {
      return 'degraded';
    } else {
      return 'healthy';
    }
  }

  private getMetrics(): HealthCheckResult['metrics'] {
    const healthSummary = HealthMetrics.getHealthSummary();
    
    return {
      requests: {
        total: healthSummary.summary.totalRequests || 0,
        errors: healthSummary.metrics['api.requests.errors']?.value || 0,
        errorRate: healthSummary.summary.errorRate || 0
      },
      responseTime: {
        average: healthSummary.summary.averageResponseTime || 0,
        p95: healthSummary.metrics['api.request.duration']?.p95 || 0,
        p99: healthSummary.metrics['api.request.duration']?.p99 || 0
      },
      system: {
        memoryUsage: healthSummary.metrics['system.memory_usage']?.value || 0,
        cpuUsage: healthSummary.metrics['system.cpu_usage']?.value || 0
      }
    };
  }

  // Quick health check for readiness/liveness probes
  public async quickHealthCheck(): Promise<{ status: HealthStatus; message: string }> {
    try {
      const { error } = await this.supabase
        .from('organizations')
        .select('count')
        .limit(1);

      if (error) {
        return { status: 'unhealthy', message: 'Database connection failed' };
      }

      return { status: 'healthy', message: 'Service operational' };
    } catch (error) {
      return { 
        status: 'unhealthy', 
        message: `Service unavailable: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }
}

// Export singleton instance
export const healthChecker = HealthChecker.getInstance();

// Utility functions for different types of health checks
export class HealthCheckUtils {
  // Readiness probe - checks if the service is ready to serve traffic
  static async readinessProbe(): Promise<{ ready: boolean; message: string }> {
    try {
      const result = await healthChecker.quickHealthCheck();
      return {
        ready: result.status === 'healthy',
        message: result.message
      };
    } catch (error) {
      return {
        ready: false,
        message: `Readiness check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // Liveness probe - checks if the service is alive
  static async livenessProbe(): Promise<{ alive: boolean; message: string }> {
    try {
      // Simple check that the process is responsive
      const startTime = Date.now();
      await new Promise(resolve => setTimeout(resolve, 1));
      const responseTime = Date.now() - startTime;
      
      if (responseTime > 100) {
        return {
          alive: false,
          message: 'Service responding slowly'
        };
      }
      
      return {
        alive: true,
        message: 'Service alive and responsive'
      };
    } catch (error) {
      return {
        alive: false,
        message: `Liveness check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // Startup probe - checks if the service has started up correctly
  static async startupProbe(): Promise<{ started: boolean; message: string }> {
    try {
      // Check if essential services are available
      const checks = await Promise.allSettled([
        healthChecker.checkDatabase(),
        healthChecker.checkSupabase()
      ]);

      const results = checks.map(check => 
        check.status === 'fulfilled' ? check.value : null
      ).filter(Boolean);

      const hasFailures = results.some(result => result?.status === 'unhealthy');
      
      if (hasFailures) {
        return {
          started: false,
          message: 'Essential services not available'
        };
      }

      return {
        started: true,
        message: 'Service started successfully'
      };
    } catch (error) {
      return {
        started: false,
        message: `Startup check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // Deep health check with detailed diagnostics
  static async deepHealthCheck(): Promise<HealthCheckResult> {
    return await healthChecker.performHealthCheck();
  }
}

// Health check middleware for API routes
export function createHealthCheckEndpoint() {
  return async (request: Request): Promise<Response> => {
    const url = new URL(request.url);
    const type = url.searchParams.get('type') || 'full';
    
    try {
      let result: any;
      let status = 200;
      
      switch (type) {
        case 'ready':
        case 'readiness':
          result = await HealthCheckUtils.readinessProbe();
          status = result.ready ? 200 : 503;
          break;
          
        case 'live':
        case 'liveness':
          result = await HealthCheckUtils.livenessProbe();
          status = result.alive ? 200 : 503;
          break;
          
        case 'startup':
          result = await HealthCheckUtils.startupProbe();
          status = result.started ? 200 : 503;
          break;
          
        case 'quick':
          result = await healthChecker.quickHealthCheck();
          status = result.status === 'healthy' ? 200 : 503;
          break;
          
        default:
          result = await HealthCheckUtils.deepHealthCheck();
          status = result.status === 'healthy' ? 200 : 
                  result.status === 'degraded' ? 200 : 503;
          break;
      }
      
      return new Response(JSON.stringify(result), {
        status,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });
    } catch (error) {
      logger.error('Health check endpoint error', { error });
      
      return new Response(JSON.stringify({
        status: 'unhealthy',
        message: `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: Date.now()
      }), {
        status: 503,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });
    }
  };
}
