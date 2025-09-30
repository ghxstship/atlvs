# Database Connection Pooling Configuration

## Overview
This document outlines the connection pooling strategy for GHXSTSHIP's Supabase integration to ensure optimal database performance and resource utilization.

## Supabase Connection Pooling

### Default Configuration
Supabase provides built-in connection pooling through PgBouncer with the following default settings:

- **Pool Mode**: Transaction pooling (recommended for web applications)
- **Max Connections**: 100 per database
- **Connection Timeout**: 60 seconds
- **Idle Timeout**: 300 seconds (5 minutes)

### Environment Variables
Configure the following environment variables for production:

```bash
# Database Connection
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres?pgbouncer=true&connection_limit=1

# Connection Pool Settings
DB_POOL_SIZE=10
DB_POOL_MAX_IDLE_TIME=300
DB_POOL_MAX_LIFETIME=600
```

### Monitoring Connection Usage

#### Key Metrics to Monitor:
- **Active Connections**: Number of currently active database connections
- **Idle Connections**: Number of idle connections in the pool
- **Connection Wait Time**: Time spent waiting for a connection from the pool
- **Connection Errors**: Failed connection attempts

#### Supabase Dashboard Monitoring:
1. Navigate to Project Settings → Database → Connection Pooling
2. Monitor real-time connection metrics
3. Set up alerts for connection limits

## Application-Level Connection Management

### Connection Limits per Environment

#### Development
```typescript
const dbConfig = {
  max: 5,           // Maximum connections
  min: 1,           // Minimum connections
  idle: 10000,      // Close idle connections after 10s
  acquire: 30000,   // Timeout for acquiring connection
};
```

#### Production
```typescript
const dbConfig = {
  max: 20,          // Maximum connections
  min: 5,           // Minimum connections
  idle: 30000,      // Close idle connections after 30s
  acquire: 60000,   // Timeout for acquiring connection
  evict: 60000,     // Run eviction check every 60s
};
```

### Connection Health Checks

#### Periodic Health Checks
```typescript
// Health check query
const healthCheckQuery = 'SELECT 1';

// Execute every 30 seconds
setInterval(async () => {
  try {
    const result = await supabase.rpc('health_check');
    if (!result) throw new Error('Health check failed');
  } catch (error) {
    console.error('Database health check failed:', error);
    // Trigger alert/notification
  }
}, 30000);
```

## Performance Optimization Strategies

### 1. Query Optimization
- Use prepared statements for repeated queries
- Implement query result caching
- Optimize complex queries with proper indexing

### 2. Connection Reuse
- Keep connections alive for multiple operations
- Use connection pooling middleware
- Implement connection retry logic with exponential backoff

### 3. Load Balancing
- Distribute read queries across replicas (when available)
- Use read/write splitting for appropriate queries
- Implement geographic load balancing for global users

## Troubleshooting Connection Issues

### Common Issues and Solutions

#### Connection Timeout
```
Error: timeout expired
```
**Solutions:**
- Increase `acquire` timeout
- Check network connectivity
- Verify Supabase service status

#### Connection Pool Exhausted
```
Error: pool is exhausted
```
**Solutions:**
- Increase pool size (`max` connections)
- Optimize query performance
- Implement query queuing

#### Too Many Idle Connections
**Solutions:**
- Decrease `idle` timeout
- Implement connection eviction
- Monitor connection usage patterns

### Monitoring Queries

#### Slow Query Identification
```sql
-- Find queries taking longer than 1 second
SELECT
  query,
  calls,
  total_time,
  mean_time,
  rows
FROM pg_stat_statements
WHERE mean_time > 1000
ORDER BY mean_time DESC;
```

#### Connection Status Monitoring
```sql
-- Current connection status
SELECT
  count(*) as total_connections,
  count(*) filter (where state = 'active') as active_connections,
  count(*) filter (where state = 'idle') as idle_connections
FROM pg_stat_activity;
```

## Scaling Considerations

### Vertical Scaling
- Increase database instance size
- Upgrade to higher performance tiers
- Optimize memory allocation

### Horizontal Scaling
- Implement read replicas
- Use database sharding
- Implement caching layers (Redis)

### Auto-scaling Strategies
- Implement connection pool auto-scaling
- Use serverless database options
- Implement intelligent load balancing

## Security Considerations

### Connection Security
- Use SSL/TLS encryption for all connections
- Implement proper authentication
- Rotate credentials regularly

### Access Control
- Implement row-level security (RLS)
- Use parameterized queries to prevent SQL injection
- Limit database user privileges

### Audit Logging
- Enable database audit logging
- Monitor connection attempts
- Log suspicious activities

## Best Practices

1. **Monitor Regularly**: Set up comprehensive monitoring and alerting
2. **Optimize Queries**: Regularly review and optimize slow queries
3. **Implement Retry Logic**: Handle transient connection failures gracefully
4. **Use Connection Pooling**: Always use connection pooling in production
5. **Plan for Scale**: Design with future growth in mind
6. **Security First**: Implement security measures at all levels
7. **Test Thoroughly**: Test connection handling under various conditions

## Contact Information

For connection pooling issues:
- **DevOps Team**: devops@ghxstship.com
- **Database Admin**: dba@ghxstship.com
- **Supabase Support**: https://supabase.com/support

---

*Last Updated: 2025-09-29*
