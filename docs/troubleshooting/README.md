# GHXSTSHIP Troubleshooting Guide

## 🔍 Overview

This comprehensive troubleshooting guide provides diagnostic procedures and resolution steps for common issues encountered in GHXSTSHIP. All procedures follow enterprise support standards with escalation paths and preventive measures.

## 🏥 Health Check Procedures

### System Health Verification

#### Database Connectivity
```bash
# Check Supabase connection
curl -H "apikey: $SUPABASE_ANON_KEY" $SUPABASE_URL/rest/v1/

# Verify RLS policies
# Expected: 200 OK with proper data filtering
```

#### Authentication Status
```bash
# Test auth endpoint
curl -X POST $SUPABASE_URL/auth/v1/token \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'

# Expected: Proper error handling for invalid credentials
```

#### API Endpoint Validation
```bash
# Health check endpoint
curl https://your-domain.com/api/health

# Expected: {"status":"healthy","timestamp":"2025-09-28T21:44:42-04:00"}
```

## 🚨 Critical Issues & Resolution

### 1. Application Unavailable (5xx Errors)

#### Symptoms
- HTTP 500/502/503 errors
- White screen of death
- Database connection failures

#### Immediate Actions
1. **Check Application Logs**
   ```bash
   # Vercel logs
   vercel logs --since 1h

   # Check for error patterns
   grep "ERROR\|FATAL" logs/application.log
   ```

2. **Database Health Check**
   ```bash
   # Supabase status
   supabase status

   # Connection test
   supabase db ping
   ```

3. **Rollback Procedures**
   ```bash
   # Emergency rollback
   vercel rollback --yes

   # Database restore if needed
   supabase db reset pre-incident-backup.sql
   ```

#### Prevention
- Implement circuit breakers for external services
- Configure proper error boundaries
- Set up automated health monitoring

### 2. Authentication Failures

#### Symptoms
- Users cannot log in
- Password reset not working
- Session timeouts

#### Diagnostic Steps
1. **Supabase Auth Status**
   ```bash
   # Check auth service
   curl $SUPABASE_URL/auth/v1/health
   ```

2. **Token Validation**
   ```bash
   # Validate JWT tokens
   node scripts/validate-tokens.js
   ```

3. **Rate Limiting Check**
   ```bash
   # Check if rate limited
   curl -I $SUPABASE_URL/auth/v1/token
   # Look for X-RateLimit headers
   ```

#### Resolution
```bash
# Clear auth sessions (admin only)
supabase auth admin delete-all-sessions

# Reset user password
supabase auth admin update-user --email user@example.com --password-reset
```

### 3. Data Synchronization Issues

#### Symptoms
- Real-time updates not working
- Data inconsistency between users
- Supabase subscriptions failing

#### Diagnostic Commands
```bash
# Check realtime service
curl $SUPABASE_URL/realtime/v1/health

# Validate WebSocket connections
node scripts/websocket-test.js

# Check RLS policies
supabase db inspect --policy
```

#### Resolution
```bash
# Restart realtime service
supabase functions restart realtime

# Rebuild indexes
supabase db reset --indexes-only

# Clear cache
redis-cli FLUSHALL
```

### 4. Performance Degradation

#### Symptoms
- Slow page loads (>3 seconds)
- Database query timeouts
- High memory usage

#### Performance Analysis
```bash
# Lighthouse audit
lighthouse https://your-domain.com --output=json

# Database performance
supabase db analyze

# Memory usage check
node scripts/memory-profile.js
```

#### Optimization Actions
```bash
# Database optimization
supabase db vacuum analyze

# Cache invalidation
redis-cli FLUSHDB

# CDN purge
curl -X POST https://api.cloudflare.com/client/v4/zones/$ZONE_ID/purge_cache \
  -H "Authorization: Bearer $CF_TOKEN" \
  -d '{"purge_everything":true}'
```

## 🔧 Module-Specific Issues

### Dashboard Module

#### Issue: Widgets not loading
```
Error: Cannot read properties of undefined (reading 'data')
```

**Resolution:**
1. Check DataViewProvider configuration
2. Validate widget data sources
3. Clear local storage cache

#### Issue: Real-time updates failing
**Resolution:**
1. Verify Supabase subscription setup
2. Check network connectivity
3. Restart realtime service

### Jobs Module

#### Issue: Bid submission failing
```
Error: PERMISSION_DENIED
```

**Resolution:**
1. Validate user permissions
2. Check organization membership
3. Verify bid validation rules

#### Issue: Compliance documents not uploading
**Resolution:**
1. Check file size limits (50MB max)
2. Validate file formats
3. Verify storage permissions

### Finance Module

#### Issue: Budget calculations incorrect
**Resolution:**
1. Validate budget period dates
2. Check currency conversion rates
3. Recalculate from source data

#### Issue: Expense approvals stuck
**Resolution:**
1. Check approval workflow configuration
2. Validate approver permissions
3. Clear pending approval cache

## 📊 Monitoring & Alerting

### Key Metrics to Monitor

#### Application Metrics
- Response time: <500ms average
- Error rate: <1%
- Throughput: 1000+ requests/minute
- CPU usage: <70%
- Memory usage: <80%

#### Database Metrics
- Connection count: <80% of max
- Query latency: <100ms
- Deadlocks: 0
- Cache hit rate: >90%

#### User Experience Metrics
- Core Web Vitals: All "Good"
- First Contentful Paint: <1.5s
- Largest Contentful Paint: <2.5s
- Cumulative Layout Shift: <0.1

### Alert Thresholds

#### Critical Alerts (Immediate Response)
- Error rate >5%
- Response time >5s
- Database connections >90%
- Service unavailable >5 minutes

#### Warning Alerts (Investigation Required)
- Error rate >1%
- Response time >2s
- Memory usage >85%
- Disk space >85%

## 🚀 Escalation Procedures

### Support Tiers

#### Tier 1: Basic Support (Auto-resolution)
- Automated monitoring alerts
- Standard health checks
- Basic configuration fixes

#### Tier 2: Technical Support (Investigation)
- Code-level debugging
- Database query optimization
- Configuration troubleshooting

#### Tier 3: Engineering (Deep Analysis)
- Architecture changes
- Code modifications
- Infrastructure updates

### Escalation Matrix

| Issue Severity | Initial Response | Escalation Time | Leadership Notification |
|----------------|------------------|-----------------|-------------------------|
| Critical | Immediate | 15 minutes | Executive team |
| High | 1 hour | 4 hours | Engineering lead |
| Medium | 4 hours | 24 hours | Team lead |
| Low | 24 hours | 1 week | N/A |

## 📝 Incident Post-Mortem

### Required Documentation
1. **Timeline**: Detailed sequence of events
2. **Impact Assessment**: Affected users and systems
3. **Root Cause**: Technical analysis
4. **Resolution Steps**: Actions taken
5. **Prevention Measures**: Future safeguards
6. **Lessons Learned**: Process improvements

### Post-Mortem Template
```markdown
# Incident Post-Mortem: [Issue Title]

## Summary
[Brief description of incident]

## Timeline
- [Timestamp]: Issue detected
- [Timestamp]: Investigation started
- [Timestamp]: Root cause identified
- [Timestamp]: Resolution implemented
- [Timestamp]: Service restored

## Impact
- Users affected: [number]
- Downtime duration: [time]
- Business impact: [description]

## Root Cause
[Detailed technical analysis]

## Resolution
[Step-by-step resolution process]

## Prevention
[Measures to prevent recurrence]

## Action Items
- [ ] [Action item 1] - Owner: [name] - Due: [date]
- [ ] [Action item 2] - Owner: [name] - Due: [date]
```

## 🛠️ Diagnostic Tools

### Built-in Diagnostics
```bash
# Run full diagnostic suite
npm run diagnostics

# Check system health
npm run health-check

# Validate configuration
npm run config-validate
```

### External Tools
- **Lighthouse**: Performance auditing
- **WebPageTest**: Load testing
- **Sentry**: Error monitoring
- **DataDog**: System monitoring
- **Supabase Dashboard**: Database monitoring

## 📞 Support Contacts

### Emergency Contacts
- **DevOps Lead**: [24/7 on-call]
- **Security Team**: [security@company.com]
- **Database Admin**: [dba@company.com]
- **Application Support**: [support@company.com]

### Business Hours Support
- **Technical Support**: Mon-Fri 9AM-6PM EST
- **Customer Success**: Mon-Fri 8AM-8PM EST
- **Account Management**: Mon-Fri 9AM-5PM EST

---

## 📋 Change Log

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-09-28 | 1.0.0 | Initial comprehensive troubleshooting guide | System |

## 🔗 Related Documentation

- [Production Deployment Guide](../deployment/production-deployment.md)
- [Security Incident Response](../compliance/incident-response-procedures.md)
- [API Documentation](../api/openapi-complete.json)
