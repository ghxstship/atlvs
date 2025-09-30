# 💰 Cost Optimization Report

**Version:** 1.0.0  
**Last Updated:** September 30, 2025

---

## Current Monthly Costs

### Infrastructure Costs

| Service | Dev | Staging | Production | Total |
|---------|-----|---------|------------|-------|
| **Compute (ECS)** | $30 | $60 | $250 | $340 |
| **Database (RDS)** | $15 | $40 | $400 | $455 |
| **Cache (Redis)** | $15 | $40 | $300 | $355 |
| **Storage (S3)** | $5 | $10 | $50 | $65 |
| **CDN (CloudFront)** | $10 | $20 | $100 | $130 |
| **Monitoring** | $20 | $30 | $100 | $150 |
| **Networking** | $10 | $20 | $50 | $80 |
| **Security** | $5 | $10 | $50 | $65 |
| **Subtotal** | $110 | $230 | $1,300 | $1,640 |

### Platform Costs

| Service | Monthly Cost |
|---------|--------------|
| **Supabase** | $25 |
| **Stripe** | 2.9% + $0.30/transaction |
| **Vercel** | $20 |
| **GitHub** | $21 |
| **Sentry** | $26 |
| **Datadog** | $15 |
| **Total** | ~$107 |

**Grand Total:** ~$1,750/month

---

## Cost Optimization Strategies

### 1. Compute Optimization

**Current:** ECS Fargate on-demand  
**Opportunity:** Savings Plans + Spot Instances

```hcl
# Use Fargate Spot for non-critical workloads
capacity_provider_strategy {
  capacity_provider = "FARGATE_SPOT"
  weight           = 70
  base             = 0
}

capacity_provider_strategy {
  capacity_provider = "FARGATE"
  weight           = 30
  base             = 1
}
```

**Estimated Savings:** $100/month (30%)

### 2. Database Optimization

**Current:** db.r6g.large (production)  
**Opportunities:**
- Right-size instances based on actual usage
- Use Aurora Serverless v2 for variable workloads
- Enable automated backups with lifecycle policies

```bash
# Analyze database usage
aws cloudwatch get-metric-statistics \
  --namespace AWS/RDS \
  --metric-name CPUUtilization \
  --dimensions Name=DBInstanceIdentifier,Value=ghxstship-prod \
  --start-time 2025-09-01T00:00:00Z \
  --end-time 2025-09-30T23:59:59Z \
  --period 3600 \
  --statistics Average
```

**Estimated Savings:** $150/month (37%)

### 3. Storage Optimization

**Current:** S3 Standard for all objects  
**Opportunities:**
- Implement lifecycle policies
- Use Intelligent-Tiering
- Enable compression
- Delete old logs

```hcl
lifecycle_rule {
  id      = "optimize-storage"
  enabled = true

  transition {
    days          = 30
    storage_class = "STANDARD_IA"
  }

  transition {
    days          = 90
    storage_class = "GLACIER_IR"
  }

  expiration {
    days = 365
  }
}
```

**Estimated Savings:** $20/month (30%)

### 4. CDN Optimization

**Current:** CloudFront PriceClass_All  
**Opportunities:**
- Use PriceClass_100 for most traffic
- Increase cache TTL
- Enable compression
- Optimize image delivery

```hcl
# Use cost-effective price class
price_class = "PriceClass_100"

# Increase cache TTL
default_ttl = 86400  # 24 hours
max_ttl     = 31536000  # 1 year
```

**Estimated Savings:** $30/month (30%)

### 5. Development Environment Optimization

**Current:** Always-on dev/staging environments  
**Opportunities:**
- Auto-shutdown after hours
- Use smaller instances
- Share resources

```bash
# Auto-shutdown script
#!/bin/bash
# Run via cron: 0 20 * * 1-5 (8 PM weekdays)

if [ "$ENVIRONMENT" = "dev" ]; then
  kubectl scale deployment --all --replicas=0 -n ghxstship-dev
  aws rds stop-db-instance --db-instance-identifier ghxstship-dev
fi
```

**Estimated Savings:** $50/month (45%)

---

## Reserved Capacity

### Compute Savings Plans

**Recommendation:** 1-year Compute Savings Plan

| Type | Commitment | Discount | Annual Savings |
|------|------------|----------|----------------|
| Compute Savings Plan | $200/month | 20% | $480/year |

### RDS Reserved Instances

**Recommendation:** 1-year RDS Reserved Instance (production)

| Instance | On-Demand | Reserved | Savings |
|----------|-----------|----------|---------|
| db.r6g.large | $400/month | $280/month | $1,440/year |

**Total Reserved Capacity Savings:** ~$1,920/year

---

## Monitoring & Alerts

### Cost Anomaly Detection

```hcl
resource "aws_ce_anomaly_monitor" "cost_monitor" {
  name              = "ghxstship-cost-monitor"
  monitor_type      = "DIMENSIONAL"
  monitor_dimension = "SERVICE"
}

resource "aws_ce_anomaly_subscription" "cost_alerts" {
  name      = "ghxstship-cost-alerts"
  frequency = "DAILY"

  monitor_arn_list = [
    aws_ce_anomaly_monitor.cost_monitor.arn
  ]

  subscriber {
    type    = "EMAIL"
    address = "devops@ghxstship.com"
  }

  threshold_expression {
    dimension {
      key           = "ANOMALY_TOTAL_IMPACT_ABSOLUTE"
      values        = ["100"]
      match_options = ["GREATER_THAN_OR_EQUAL"]
    }
  }
}
```

### Budget Alerts

```hcl
resource "aws_budgets_budget" "monthly" {
  name              = "ghxstship-monthly-budget"
  budget_type       = "COST"
  limit_amount      = "2000"
  limit_unit        = "USD"
  time_period_start = "2025-01-01_00:00"
  time_unit         = "MONTHLY"

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 80
    threshold_type            = "PERCENTAGE"
    notification_type         = "ACTUAL"
    subscriber_email_addresses = ["devops@ghxstship.com"]
  }
}
```

---

## Cost Allocation Tags

```hcl
default_tags {
  tags = {
    Project     = "GHXSTSHIP"
    Environment = var.environment
    ManagedBy   = "Terraform"
    CostCenter  = "Engineering"
    Owner       = "DevOps"
  }
}
```

---

## Optimization Roadmap

### Q1 2026
- [ ] Implement Compute Savings Plan
- [ ] Purchase RDS Reserved Instances
- [ ] Enable S3 Intelligent-Tiering
- [ ] Implement auto-shutdown for dev

**Expected Savings:** $350/month

### Q2 2026
- [ ] Migrate to Aurora Serverless v2
- [ ] Optimize CloudFront configuration
- [ ] Implement image optimization
- [ ] Review and remove unused resources

**Expected Savings:** $200/month

### Q3 2026
- [ ] Evaluate multi-region strategy
- [ ] Implement spot instances
- [ ] Optimize database queries
- [ ] Review third-party services

**Expected Savings:** $150/month

### Q4 2026
- [ ] Annual cost review
- [ ] Renegotiate vendor contracts
- [ ] Optimize monitoring costs
- [ ] Implement FinOps practices

**Expected Savings:** $100/month

---

## Total Optimization Potential

| Category | Current | Optimized | Savings |
|----------|---------|-----------|---------|
| **Infrastructure** | $1,640/month | $1,090/month | $550/month |
| **Platform Services** | $107/month | $90/month | $17/month |
| **Total** | $1,747/month | $1,180/month | $567/month |

**Annual Savings:** $6,804 (32% reduction)

---

## Best Practices

1. **Tag Everything** - Proper cost allocation
2. **Right-Size Resources** - Match capacity to demand
3. **Use Reserved Capacity** - For predictable workloads
4. **Automate Shutdowns** - For non-production environments
5. **Monitor Continuously** - Set up cost alerts
6. **Review Regularly** - Monthly cost reviews
7. **Optimize Storage** - Lifecycle policies
8. **Use Spot Instances** - For fault-tolerant workloads

---

## Tools

- **AWS Cost Explorer** - Analyze spending patterns
- **AWS Cost Anomaly Detection** - Detect unusual spending
- **Terraform Cost Estimation** - Preview infrastructure costs
- **Infracost** - Cost estimates in CI/CD
- **CloudHealth** - Multi-cloud cost management

---

**Next Review:** October 30, 2025
