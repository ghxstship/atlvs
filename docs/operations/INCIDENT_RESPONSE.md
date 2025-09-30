# 🚨 Incident Response Playbook

**Version:** 1.0.0  
**Last Updated:** September 30, 2025

---

## Severity Levels

| Level | Description | Response Time | Example |
|-------|-------------|---------------|---------|
| **P0 - Critical** | Complete outage | < 15 min | Site down, data loss |
| **P1 - High** | Major degradation | < 1 hour | API errors > 10%, slow response |
| **P2 - Medium** | Partial degradation | < 4 hours | Single feature broken |
| **P3 - Low** | Minor issue | < 1 day | UI glitch, typo |

---

## Incident Response Process

### 1. Detection (0-5 minutes)

**Alerts:**
- PagerDuty notification
- Slack alert in #incidents
- Monitoring dashboard alert
- Customer report

**Initial Actions:**
```bash
# Acknowledge alert
pagerduty ack <incident-id>

# Join incident channel
slack join #incident-<id>

# Check status page
open https://status.ghxstship.com
```

### 2. Assessment (5-15 minutes)

**Questions to Answer:**
- What is broken?
- How many users affected?
- What is the business impact?
- Is data at risk?

**Investigation:**
```bash
# Check system health
kubectl get pods -n ghxstship-prod
curl https://ghxstship.com/api/health

# Check metrics
open https://grafana.ghxstship.com/d/production-overview

# Check logs
kubectl logs -f deployment/ghxstship-web -n ghxstship-prod --tail=100

# Check error tracking
open https://sentry.io/organizations/ghxstship/issues/
```

### 3. Communication (Ongoing)

**Internal:**
```bash
# Update incident channel
slack post #incident-<id> "Status: Investigating. ETA: 30 min"

# Page additional engineers if needed
pagerduty escalate <incident-id>
```

**External:**
```bash
# Update status page
statuspage update --status investigating --message "We are investigating reports of..."

# Notify affected customers (if P0/P1)
email-blast --template incident-notification --severity P0
```

### 4. Mitigation (15-60 minutes)

**Common Mitigations:**

#### Service Down
```bash
# Restart pods
kubectl rollout restart deployment/ghxstship-web -n ghxstship-prod

# Scale up
kubectl scale deployment/ghxstship-web --replicas=10 -n ghxstship-prod

# Rollback
ghxstship rollback prod
```

#### Database Issues
```bash
# Check connections
kubectl exec -it deployment/ghxstship-web -n ghxstship-prod -- psql -h $DB_HOST -U $DB_USER -c "SELECT count(*) FROM pg_stat_activity"

# Kill long-running queries
psql -h $DB_HOST -U $DB_USER -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'active' AND query_start < now() - interval '5 minutes'"

# Failover to replica
aws rds failover-db-cluster --db-cluster-identifier ghxstship-prod
```

#### High Traffic
```bash
# Enable rate limiting
kubectl set env deployment/ghxstship-web RATE_LIMIT_ENABLED=true -n ghxstship-prod

# Scale up
kubectl scale deployment/ghxstship-web --replicas=20 -n ghxstship-prod

# Enable CDN caching
cloudflare cache-everything --zone ghxstship.com
```

#### External Service Down
```bash
# Enable circuit breaker
kubectl set env deployment/ghxstship-web CIRCUIT_BREAKER_ENABLED=true -n ghxstship-prod

# Switch to backup service
kubectl set env deployment/ghxstship-web PAYMENT_PROVIDER=backup -n ghxstship-prod

# Enable maintenance mode (last resort)
kubectl set env deployment/ghxstship-web MAINTENANCE_MODE=true -n ghxstship-prod
```

### 5. Resolution (Variable)

**Verification:**
```bash
# Check health
curl https://ghxstship.com/api/health

# Run smoke tests
pnpm test:e2e --env=production

# Monitor metrics for 30 minutes
watch -n 60 'curl -s https://ghxstship.com/api/metrics | jq ".error_rate"'
```

**Communication:**
```bash
# Update status page
statuspage update --status operational --message "The issue has been resolved"

# Notify team
slack post #incident-<id> "✅ Incident resolved. Root cause: ..."

# Close PagerDuty incident
pagerduty resolve <incident-id>
```

### 6. Post-Mortem (Within 48 hours)

**Required for P0/P1 incidents:**

1. **Timeline** - Detailed sequence of events
2. **Root Cause** - What actually happened
3. **Impact** - Users affected, revenue lost
4. **Resolution** - How it was fixed
5. **Action Items** - Prevent recurrence

**Template:** `docs/operations/post-mortems/YYYY-MM-DD-incident.md`

---

## Common Incidents

### P0: Complete Site Outage

**Symptoms:**
- Site unreachable
- All health checks failing
- 100% error rate

**Immediate Actions:**
```bash
# 1. Check infrastructure
kubectl get nodes
kubectl get pods -n ghxstship-prod

# 2. Check DNS
dig ghxstship.com
nslookup ghxstship.com

# 3. Check load balancer
aws elbv2 describe-target-health --target-group-arn <arn>

# 4. Rollback if recent deployment
ghxstship rollback prod

# 5. Failover to backup region (if available)
terraform apply -var="active_region=us-west-2"
```

### P1: High Error Rate

**Symptoms:**
- Error rate > 10%
- Sentry flooding with errors
- Customer complaints

**Immediate Actions:**
```bash
# 1. Identify error pattern
kubectl logs deployment/ghxstship-web -n ghxstship-prod | grep ERROR | head -50

# 2. Check recent changes
git log --since="1 hour ago" --oneline

# 3. Rollback if recent deployment
ghxstship rollback prod

# 4. Enable circuit breaker
kubectl set env deployment/ghxstship-web CIRCUIT_BREAKER_ENABLED=true -n ghxstship-prod
```

### P1: Database Connection Pool Exhausted

**Symptoms:**
- "Too many connections" errors
- Slow queries
- Timeouts

**Immediate Actions:**
```bash
# 1. Check active connections
psql -h $DB_HOST -U $DB_USER -c "SELECT count(*) FROM pg_stat_activity"

# 2. Kill idle connections
psql -h $DB_HOST -U $DB_USER -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle' AND state_change < now() - interval '5 minutes'"

# 3. Increase pool size (temporary)
kubectl set env deployment/ghxstship-web DB_POOL_SIZE=50 -n ghxstship-prod

# 4. Scale up database
aws rds modify-db-instance --db-instance-identifier ghxstship-prod --db-instance-class db.r6g.xlarge --apply-immediately
```

### P2: Memory Leak

**Symptoms:**
- Increasing memory usage
- OOMKilled pods
- Slow performance

**Immediate Actions:**
```bash
# 1. Restart affected pods
kubectl rollout restart deployment/ghxstship-web -n ghxstship-prod

# 2. Increase memory limits (temporary)
kubectl set resources deployment/ghxstship-web --limits=memory=4Gi -n ghxstship-prod

# 3. Enable heap profiling
kubectl set env deployment/ghxstship-web NODE_OPTIONS="--max-old-space-size=4096 --heap-prof" -n ghxstship-prod

# 4. Schedule investigation
jira create --project OPS --type Bug --summary "Memory leak investigation"
```

---

## Escalation Path

1. **On-Call Engineer** (0-15 min)
2. **Engineering Lead** (15-30 min)
3. **CTO** (30-60 min)
4. **CEO** (P0 only, > 1 hour)

---

## Tools & Access

### Monitoring
- **Grafana:** https://grafana.ghxstship.com
- **Datadog:** https://app.datadoghq.com
- **CloudWatch:** AWS Console
- **Sentry:** https://sentry.io/organizations/ghxstship

### Communication
- **Slack:** #incidents
- **PagerDuty:** https://ghxstship.pagerduty.com
- **Status Page:** https://status.ghxstship.com

### Infrastructure
- **AWS Console:** https://console.aws.amazon.com
- **Kubernetes:** `kubectl config use-context prod`
- **Terraform:** `infrastructure/terraform/environments/prod`

---

## Prevention

- Regular load testing
- Chaos engineering
- Automated rollbacks
- Comprehensive monitoring
- Regular security audits
- Disaster recovery drills

---

**Remember:** Stay calm, communicate clearly, and focus on resolution first, root cause second.
