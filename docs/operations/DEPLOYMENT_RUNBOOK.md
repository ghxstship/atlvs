# 🚀 Deployment Runbook

**Version:** 1.0.0  
**Last Updated:** September 30, 2025

---

## Overview

This runbook provides step-by-step procedures for deploying GHXSTSHIP to all environments.

---

## Pre-Deployment Checklist

- [ ] All tests passing (unit, integration, e2e)
- [ ] Code review approved
- [ ] Security scan passed
- [ ] Performance benchmarks met
- [ ] Database migrations reviewed
- [ ] Environment variables configured
- [ ] Rollback plan prepared
- [ ] Stakeholders notified

---

## Deployment to Development

### Automatic Deployment

```bash
# Triggered automatically on push to develop branch
git push origin develop
```

### Manual Deployment

```bash
# Using CLI
ghxstship deploy dev

# Using Terraform
cd infrastructure/terraform/environments/dev
terraform apply

# Using kubectl
kubectl apply -k infrastructure/kubernetes/overlays/dev
```

**Expected Duration:** 5-10 minutes  
**Downtime:** None (rolling update)

---

## Deployment to Staging

### Prerequisites

- [ ] All dev tests passed
- [ ] Feature branch merged to main
- [ ] Release notes prepared

### Deployment Steps

```bash
# 1. Create release branch
git checkout -b release/v1.x.x

# 2. Update version
npm version minor

# 3. Deploy to staging
ghxstship deploy staging

# 4. Run smoke tests
pnpm test:e2e --env=staging

# 5. Verify deployment
curl https://staging.ghxstship.com/api/health
```

**Expected Duration:** 10-15 minutes  
**Downtime:** None (blue-green deployment)

---

## Deployment to Production

### Prerequisites

- [ ] Staging deployment successful
- [ ] Smoke tests passed
- [ ] Load tests passed
- [ ] Security audit completed
- [ ] Change approval obtained
- [ ] Maintenance window scheduled (if needed)
- [ ] On-call engineer available

### Deployment Steps

#### 1. Pre-Deployment

```bash
# Backup database
pg_dump -h prod-db.ghxstship.com -U admin ghxstship > backup_$(date +%Y%m%d_%H%M%S).sql

# Tag release
git tag -a v1.x.x -m "Release v1.x.x"
git push origin v1.x.x

# Notify team
slack-notify "#deployments" "🚀 Starting production deployment v1.x.x"
```

#### 2. Deployment

```bash
# Deploy infrastructure changes (if any)
cd infrastructure/terraform/environments/prod
terraform plan
terraform apply

# Deploy application
ghxstship deploy prod

# Monitor deployment
kubectl rollout status deployment/ghxstship-web -n ghxstship-prod
```

#### 3. Verification

```bash
# Health check
curl https://ghxstship.com/api/health

# Run smoke tests
pnpm test:e2e --env=production

# Check metrics
open https://grafana.ghxstship.com/d/production-overview

# Check logs
kubectl logs -f deployment/ghxstship-web -n ghxstship-prod
```

#### 4. Post-Deployment

```bash
# Monitor for 30 minutes
# Check error rates, response times, resource usage

# If successful
slack-notify "#deployments" "✅ Production deployment v1.x.x successful"

# If issues detected
ghxstship rollback prod
```

**Expected Duration:** 20-30 minutes  
**Downtime:** None (zero-downtime deployment)

---

## Rollback Procedures

### Automatic Rollback

Deployment circuit breaker will automatically rollback if:
- Health checks fail
- Error rate > 5%
- Response time > 2s

### Manual Rollback

```bash
# Rollback application
kubectl rollout undo deployment/ghxstship-web -n ghxstship-prod

# Rollback database (if needed)
psql -h prod-db.ghxstship.com -U admin ghxstship < backup_YYYYMMDD_HHMMSS.sql

# Rollback infrastructure (if needed)
cd infrastructure/terraform/environments/prod
terraform apply -var="app_version=v1.x.x-1"

# Verify rollback
curl https://ghxstship.com/api/health
```

**Expected Duration:** 5-10 minutes

---

## Database Migrations

### Running Migrations

```bash
# Development
pnpm db:migrate

# Staging
pnpm db:migrate --env=staging

# Production (requires approval)
pnpm db:migrate --env=production --dry-run
pnpm db:migrate --env=production
```

### Migration Checklist

- [ ] Migration tested in dev
- [ ] Migration tested in staging
- [ ] Rollback script prepared
- [ ] Database backup created
- [ ] Migration is backward compatible
- [ ] Estimated duration < 5 minutes

---

## Monitoring During Deployment

### Key Metrics

1. **Error Rate** - Should remain < 1%
2. **Response Time** - p95 should remain < 500ms
3. **CPU Usage** - Should remain < 70%
4. **Memory Usage** - Should remain < 80%
5. **Active Connections** - Monitor for spikes

### Dashboards

- **Grafana:** https://grafana.ghxstship.com/d/production-overview
- **CloudWatch:** AWS Console > CloudWatch > Dashboards
- **Datadog:** https://app.datadoghq.com/dashboard/ghxstship

---

## Troubleshooting

### Deployment Stuck

```bash
# Check pod status
kubectl get pods -n ghxstship-prod

# Check events
kubectl get events -n ghxstship-prod --sort-by='.lastTimestamp'

# Check logs
kubectl logs -f deployment/ghxstship-web -n ghxstship-prod
```

### Health Check Failing

```bash
# Check application logs
kubectl logs deployment/ghxstship-web -n ghxstship-prod | grep ERROR

# Check database connectivity
kubectl exec -it deployment/ghxstship-web -n ghxstship-prod -- psql -h $DB_HOST -U $DB_USER -c "SELECT 1"

# Check external services
curl https://api.supabase.co/health
```

### High Error Rate

```bash
# Check error logs
kubectl logs deployment/ghxstship-web -n ghxstship-prod | grep "ERROR\|FATAL"

# Check Sentry
open https://sentry.io/organizations/ghxstship/issues/

# Rollback if critical
ghxstship rollback prod
```

---

## Emergency Contacts

- **On-Call Engineer:** +1-XXX-XXX-XXXX
- **DevOps Lead:** devops@ghxstship.com
- **CTO:** cto@ghxstship.com
- **Slack:** #incidents

---

## Post-Deployment Tasks

- [ ] Update release notes
- [ ] Close deployment ticket
- [ ] Update documentation
- [ ] Schedule retrospective (if issues)
- [ ] Archive deployment logs
- [ ] Update monitoring dashboards

---

**Remember:** Safety first. If in doubt, rollback and investigate.
