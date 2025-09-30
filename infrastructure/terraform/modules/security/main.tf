# ============================================================================
# Security Module - KMS, Secrets Manager, WAF, Security Hub
# ============================================================================

# KMS Key for Encryption
resource "aws_kms_key" "main" {
  description             = "${var.project} ${var.environment} encryption key"
  deletion_window_in_days = var.environment == "prod" ? 30 : 7
  enable_key_rotation     = true

  tags = merge(
    var.tags,
    {
      Name = "${var.project}-${var.environment}-kms-key"
    }
  )
}

resource "aws_kms_alias" "main" {
  name          = "alias/${var.project}-${var.environment}"
  target_key_id = aws_kms_key.main.key_id
}

# ============================================================================
# AWS Secrets Manager
# ============================================================================

resource "aws_secretsmanager_secret" "app_secrets" {
  name                    = "${var.project}/${var.environment}/app-secrets"
  description             = "Application secrets for ${var.project} ${var.environment}"
  kms_key_id              = aws_kms_key.main.id
  recovery_window_in_days = var.environment == "prod" ? 30 : 7

  tags = merge(
    var.tags,
    {
      Name = "${var.project}-${var.environment}-app-secrets"
    }
  )
}

resource "aws_secretsmanager_secret_version" "app_secrets" {
  secret_id = aws_secretsmanager_secret.app_secrets.id
  secret_string = jsonencode({
    NEXT_PUBLIC_SUPABASE_URL      = var.supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY = var.supabase_anon_key
    SUPABASE_SERVICE_ROLE_KEY     = var.supabase_service_role_key
    STRIPE_SECRET_KEY             = var.stripe_secret_key
    STRIPE_WEBHOOK_SECRET         = var.stripe_webhook_secret
    GOOGLE_CLIENT_ID              = var.google_client_id
    GOOGLE_CLIENT_SECRET          = var.google_client_secret
  })
}

# ============================================================================
# AWS WAF (Web Application Firewall)
# ============================================================================

resource "aws_wafv2_web_acl" "main" {
  name  = "${var.project}-${var.environment}-waf"
  scope = "REGIONAL"

  default_action {
    allow {}
  }

  # Rate limiting rule
  rule {
    name     = "rate-limit"
    priority = 1

    action {
      block {}
    }

    statement {
      rate_based_statement {
        limit              = 2000
        aggregate_key_type = "IP"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${var.project}-${var.environment}-rate-limit"
      sampled_requests_enabled   = true
    }
  }

  # AWS Managed Rules - Core Rule Set
  rule {
    name     = "aws-managed-core-rules"
    priority = 2

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${var.project}-${var.environment}-core-rules"
      sampled_requests_enabled   = true
    }
  }

  # AWS Managed Rules - Known Bad Inputs
  rule {
    name     = "aws-managed-known-bad-inputs"
    priority = 3

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesKnownBadInputsRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${var.project}-${var.environment}-bad-inputs"
      sampled_requests_enabled   = true
    }
  }

  # AWS Managed Rules - SQL Injection
  rule {
    name     = "aws-managed-sql-injection"
    priority = 4

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesSQLiRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${var.project}-${var.environment}-sql-injection"
      sampled_requests_enabled   = true
    }
  }

  # Geo-blocking rule (optional)
  dynamic "rule" {
    for_each = length(var.blocked_countries) > 0 ? [1] : []

    content {
      name     = "geo-blocking"
      priority = 5

      action {
        block {}
      }

      statement {
        geo_match_statement {
          country_codes = var.blocked_countries
        }
      }

      visibility_config {
        cloudwatch_metrics_enabled = true
        metric_name                = "${var.project}-${var.environment}-geo-blocking"
        sampled_requests_enabled   = true
      }
    }
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "${var.project}-${var.environment}-waf"
    sampled_requests_enabled   = true
  }

  tags = merge(
    var.tags,
    {
      Name = "${var.project}-${var.environment}-waf"
    }
  )
}

# WAF Logging Configuration
resource "aws_wafv2_web_acl_logging_configuration" "main" {
  resource_arn            = aws_wafv2_web_acl.main.arn
  log_destination_configs = [aws_cloudwatch_log_group.waf.arn]

  redacted_fields {
    single_header {
      name = "authorization"
    }
  }

  redacted_fields {
    single_header {
      name = "cookie"
    }
  }
}

resource "aws_cloudwatch_log_group" "waf" {
  name              = "/aws/waf/${var.project}-${var.environment}"
  retention_in_days = var.log_retention_days
  kms_key_id        = aws_kms_key.main.arn

  tags = var.tags
}

# ============================================================================
# AWS Security Hub
# ============================================================================

resource "aws_securityhub_account" "main" {
  count = var.enable_security_hub ? 1 : 0
}

resource "aws_securityhub_standards_subscription" "cis" {
  count         = var.enable_security_hub ? 1 : 0
  depends_on    = [aws_securityhub_account.main]
  standards_arn = "arn:aws:securityhub:${var.aws_region}::standards/cis-aws-foundations-benchmark/v/1.4.0"
}

resource "aws_securityhub_standards_subscription" "aws_foundational" {
  count         = var.enable_security_hub ? 1 : 0
  depends_on    = [aws_securityhub_account.main]
  standards_arn = "arn:aws:securityhub:${var.aws_region}::standards/aws-foundational-security-best-practices/v/1.0.0"
}

# ============================================================================
# AWS GuardDuty
# ============================================================================

resource "aws_guardduty_detector" "main" {
  count  = var.enable_guardduty ? 1 : 0
  enable = true

  datasources {
    s3_logs {
      enable = true
    }
    kubernetes {
      audit_logs {
        enable = true
      }
    }
    malware_protection {
      scan_ec2_instance_with_findings {
        ebs_volumes {
          enable = true
        }
      }
    }
  }

  tags = merge(
    var.tags,
    {
      Name = "${var.project}-${var.environment}-guardduty"
    }
  )
}

# ============================================================================
# IAM Password Policy
# ============================================================================

resource "aws_iam_account_password_policy" "strict" {
  minimum_password_length        = 14
  require_lowercase_characters   = true
  require_uppercase_characters   = true
  require_numbers                = true
  require_symbols                = true
  allow_users_to_change_password = true
  max_password_age               = 90
  password_reuse_prevention      = 24
}

# ============================================================================
# CloudWatch Alarms for Security
# ============================================================================

resource "aws_cloudwatch_metric_alarm" "waf_blocked_requests" {
  alarm_name          = "${var.project}-${var.environment}-waf-blocked-requests"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "BlockedRequests"
  namespace           = "AWS/WAFV2"
  period              = "300"
  statistic           = "Sum"
  threshold           = "1000"
  alarm_description   = "WAF blocked requests are high"
  alarm_actions       = [var.sns_topic_arn]

  dimensions = {
    WebACL = aws_wafv2_web_acl.main.name
    Region = var.aws_region
    Rule   = "ALL"
  }

  tags = var.tags
}

resource "aws_cloudwatch_metric_alarm" "unauthorized_api_calls" {
  alarm_name          = "${var.project}-${var.environment}-unauthorized-api-calls"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "UnauthorizedAPICalls"
  namespace           = "CloudTrailMetrics"
  period              = "300"
  statistic           = "Sum"
  threshold           = "5"
  alarm_description   = "Unauthorized API calls detected"
  alarm_actions       = [var.sns_topic_arn]

  tags = var.tags
}

# ============================================================================
# SNS Topic for Security Alerts
# ============================================================================

resource "aws_sns_topic" "security_alerts" {
  name              = "${var.project}-${var.environment}-security-alerts"
  kms_master_key_id = aws_kms_key.main.id

  tags = merge(
    var.tags,
    {
      Name = "${var.project}-${var.environment}-security-alerts"
    }
  )
}

resource "aws_sns_topic_subscription" "security_alerts_email" {
  for_each = toset(var.security_alert_emails)

  topic_arn = aws_sns_topic.security_alerts.arn
  protocol  = "email"
  endpoint  = each.value
}
