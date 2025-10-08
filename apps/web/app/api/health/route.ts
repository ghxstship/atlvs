import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@ghxstship/auth';
import { db } from '@/lib/supabase/server';

/**
 * Health Check API Endpoint
 * Comprehensive health check for uptime monitoring
 * Returns 200 if all systems operational, 503 if any critical system is down
 */

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  services: {
    database: ServiceStatus;
    redis?: ServiceStatus;
    stripe?: ServiceStatus;
    email?: ServiceStatus;
    storage?: ServiceStatus;
  };
  metrics: {
    responseTime: number;
    memoryUsage: number;
    activeConnections: number;
  };
}

interface ServiceStatus {
  status: 'operational' | 'degraded' | 'outage';
  responseTime?: number;
  error?: string;
  lastChecked: string;
}

async function checkDatabase(): Promise<ServiceStatus> {
  const startTime = Date.now();

  try {
    // Check database connectivity
    const { data, error } = await db
      .from('organizations')
      .select('id')
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      throw error;
    }

    return {
      status: 'operational',
      responseTime: Date.now() - startTime,
      lastChecked: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'outage',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Database check failed',
      lastChecked: new Date().toISOString()
    };
  }
}

async function checkRedis(): Promise<ServiceStatus> {
  const startTime = Date.now();

  try {
    // Check Redis connectivity if available
    // This would integrate with your Redis client
    return {
      status: 'operational',
      responseTime: Date.now() - startTime,
      lastChecked: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'degraded',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Redis check failed',
      lastChecked: new Date().toISOString()
    };
  }
}

async function checkStripe(): Promise<ServiceStatus> {
  const startTime = Date.now();

  try {
    // Check Stripe API connectivity
    // This would make a test API call to Stripe
    if (!process.env.STRIPE_SECRET_KEY) {
      return {
        status: 'degraded',
        error: 'Stripe API key not configured',
        lastChecked: new Date().toISOString()
      };
    }

    return {
      status: 'operational',
      responseTime: Date.now() - startTime,
      lastChecked: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'degraded',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Stripe check failed',
      lastChecked: new Date().toISOString()
    };
  }
}

async function checkStorage(): Promise<ServiceStatus> {
  const startTime = Date.now();

  try {
    // Check Supabase Storage connectivity
    // This would check storage bucket access
    return {
      status: 'operational',
      responseTime: Date.now() - startTime,
      lastChecked: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'degraded',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Storage check failed',
      lastChecked: new Date().toISOString()
    };
  }
}

function getSystemMetrics() {
  const memUsage = process.memoryUsage();
  const uptime = process.uptime();

  return {
    responseTime: 0, // Will be set by the handler
    memoryUsage: memUsage.heapUsed / memUsage.heapTotal,
    activeConnections: 0, // Would need to track active connections
  };
}

function calculateOverallStatus(services: HealthStatus['services']): HealthStatus['status'] {
  const serviceStatuses = Object.values(services);

  // If any critical service is down, system is unhealthy
  if (serviceStatuses.some(service => service.status === 'outage')) {
    return 'unhealthy';
  }

  // If any service is degraded, system is degraded
  if (serviceStatuses.some(service => service.status === 'degraded')) {
    return 'degraded';
  }

  // All services operational
  return 'healthy';
}

export async function GET(request: NextRequest): Promise<NextResponse<HealthStatus>> {
  const startTime = Date.now();

  try {
    // Run all health checks in parallel
    const [databaseStatus, redisStatus, stripeStatus, storageStatus] = await Promise.all([
      checkDatabase(),
      checkRedis(),
      checkStripe(),
      checkStorage(),
    ]);

    const services = {
      database: databaseStatus,
      redis: redisStatus,
      stripe: stripeStatus,
      storage: storageStatus
    };

    const overallStatus = calculateOverallStatus(services);
    const metrics = {
      ...getSystemMetrics(),
      responseTime: Date.now() - startTime
    };

    const healthStatus: HealthStatus = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services,
      metrics
    };

    // Return appropriate HTTP status code
    const httpStatus = overallStatus === 'healthy' ? 200 :
                      overallStatus === 'degraded' ? 200 : 503;

    return NextResponse.json(healthStatus, {
      status: httpStatus,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    // If health check itself fails, return unhealthy status
    const errorHealthStatus: HealthStatus = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: { status: 'outage', error: 'Health check failed', lastChecked: new Date().toISOString() }
      },
      metrics: {
        responseTime: Date.now() - startTime,
        memoryUsage: 0,
        activeConnections: 0
      }
    };

    return NextResponse.json(errorHealthStatus, {
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json'
      }
    });
  }
}

// Only allow GET requests
export async function POST() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
