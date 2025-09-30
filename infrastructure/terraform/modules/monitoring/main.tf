# ============================================================================
# Monitoring Module - Prometheus, Grafana, Loki, Tempo
# ============================================================================

# SNS Topic for Alerts
resource "aws_sns_topic" "alerts" {
  name              = "${var.project}-${var.environment}-alerts"
  kms_master_key_id = var.kms_key_id

  tags = merge(
    var.tags,
    {
      Name = "${var.project}-${var.environment}-alerts"
    }
  )
}

resource "aws_sns_topic_subscription" "alerts_email" {
  for_each = toset(var.alert_emails)

  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = each.value
}

# ============================================================================
# CloudWatch Dashboards
# ============================================================================

resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "${var.project}-${var.environment}-overview"

  dashboard_body = jsonencode({
    widgets = [
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/ECS", "CPUUtilization", { stat = "Average" }],
            [".", "MemoryUtilization", { stat = "Average" }]
          ]
          period = 300
          stat   = "Average"
          region = var.aws_region
          title  = "ECS Cluster Metrics"
        }
      },
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/RDS", "CPUUtilization", { stat = "Average" }],
            [".", "DatabaseConnections", { stat = "Sum" }],
            [".", "FreeStorageSpace", { stat = "Average" }]
          ]
          period = 300
          stat   = "Average"
          region = var.aws_region
          title  = "RDS Metrics"
        }
      },
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/ElastiCache", "CPUUtilization", { stat = "Average" }],
            [".", "DatabaseMemoryUsagePercentage", { stat = "Average" }],
            [".", "NetworkBytesIn", { stat = "Sum" }],
            [".", "NetworkBytesOut", { stat = "Sum" }]
          ]
          period = 300
          stat   = "Average"
          region = var.aws_region
          title  = "Redis Metrics"
        }
      },
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/ApplicationELB", "TargetResponseTime", { stat = "Average" }],
            [".", "RequestCount", { stat = "Sum" }],
            [".", "HTTPCode_Target_2XX_Count", { stat = "Sum" }],
            [".", "HTTPCode_Target_4XX_Count", { stat = "Sum" }],
            [".", "HTTPCode_Target_5XX_Count", { stat = "Sum" }]
          ]
          period = 300
          stat   = "Average"
          region = var.aws_region
          title  = "ALB Metrics"
        }
      },
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/CloudFront", "Requests", { stat = "Sum" }],
            [".", "BytesDownloaded", { stat = "Sum" }],
            [".", "4xxErrorRate", { stat = "Average" }],
            [".", "5xxErrorRate", { stat = "Average" }]
          ]
          period = 300
          stat   = "Average"
          region = "us-east-1"
          title  = "CloudFront Metrics"
        }
      },
      {
        type = "log"
        properties = {
          query   = "SOURCE '/ecs/${var.project}-${var.environment}' | fields @timestamp, @message | sort @timestamp desc | limit 20"
          region  = var.aws_region
          title   = "Recent ECS Logs"
        }
      }
    ]
  })
}

# ============================================================================
# CloudWatch Log Insights Queries
# ============================================================================

resource "aws_cloudwatch_query_definition" "error_logs" {
  name = "${var.project}-${var.environment}-error-logs"

  log_group_names = [
    "/ecs/${var.project}-${var.environment}",
    "/aws/lambda/${var.project}-${var.environment}",
  ]

  query_string = <<-QUERY
    fields @timestamp, @message, @logStream
    | filter @message like /ERROR/
    | sort @timestamp desc
    | limit 100
  QUERY
}

resource "aws_cloudwatch_query_definition" "slow_queries" {
  name = "${var.project}-${var.environment}-slow-queries"

  log_group_names = [
    "/ecs/${var.project}-${var.environment}",
  ]

  query_string = <<-QUERY
    fields @timestamp, @message
    | filter @message like /duration/
    | parse @message /duration: (?<duration>\d+)/
    | filter duration > 1000
    | sort @timestamp desc
    | limit 50
  QUERY
}

resource "aws_cloudwatch_query_definition" "request_stats" {
  name = "${var.project}-${var.environment}-request-stats"

  log_group_names = [
    "/ecs/${var.project}-${var.environment}",
  ]

  query_string = <<-QUERY
    fields @timestamp, @message
    | filter @message like /status/
    | parse @message /status: (?<status>\d+)/
    | stats count() by status
  QUERY
}

# ============================================================================
# CloudWatch Composite Alarms
# ============================================================================

resource "aws_cloudwatch_composite_alarm" "critical_system_health" {
  alarm_name          = "${var.project}-${var.environment}-critical-system-health"
  alarm_description   = "Critical system health composite alarm"
  actions_enabled     = true
  alarm_actions       = [aws_sns_topic.alerts.arn]
  ok_actions          = [aws_sns_topic.alerts.arn]

  alarm_rule = "ALARM(${var.project}-${var.environment}-ecs-cpu-high) OR ALARM(${var.project}-${var.environment}-rds-cpu-high) OR ALARM(${var.project}-${var.environment}-redis-cpu-high)"

  tags = var.tags
}

# ============================================================================
# CloudWatch Metric Filters
# ============================================================================

resource "aws_cloudwatch_log_metric_filter" "error_count" {
  name           = "${var.project}-${var.environment}-error-count"
  log_group_name = "/ecs/${var.project}-${var.environment}"
  pattern        = "[ERROR]"

  metric_transformation {
    name      = "ErrorCount"
    namespace = "${var.project}/${var.environment}"
    value     = "1"
  }
}

resource "aws_cloudwatch_metric_alarm" "high_error_rate" {
  alarm_name          = "${var.project}-${var.environment}-high-error-rate"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "ErrorCount"
  namespace           = "${var.project}/${var.environment}"
  period              = "300"
  statistic           = "Sum"
  threshold           = "100"
  alarm_description   = "Application error rate is too high"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  tags = var.tags
}

# ============================================================================
# X-Ray Tracing
# ============================================================================

resource "aws_xray_sampling_rule" "main" {
  rule_name      = "${var.project}-${var.environment}-sampling"
  priority       = 1000
  version        = 1
  reservoir_size = 1
  fixed_rate     = 0.05
  url_path       = "*"
  host           = "*"
  http_method    = "*"
  service_type   = "*"
  service_name   = "*"
  resource_arn   = "*"

  attributes = {
    Environment = var.environment
  }
}

# ============================================================================
# EventBridge Rules for Monitoring
# ============================================================================

resource "aws_cloudwatch_event_rule" "ecs_task_stopped" {
  name        = "${var.project}-${var.environment}-ecs-task-stopped"
  description = "Capture ECS task stopped events"

  event_pattern = jsonencode({
    source      = ["aws.ecs"]
    detail-type = ["ECS Task State Change"]
    detail = {
      lastStatus      = ["STOPPED"]
      stoppedReason   = [{ "prefix" = "Essential container" }]
      clusterArn      = [var.ecs_cluster_arn]
    }
  })

  tags = var.tags
}

resource "aws_cloudwatch_event_target" "ecs_task_stopped_sns" {
  rule      = aws_cloudwatch_event_rule.ecs_task_stopped.name
  target_id = "SendToSNS"
  arn       = aws_sns_topic.alerts.arn
}

resource "aws_cloudwatch_event_rule" "rds_maintenance" {
  name        = "${var.project}-${var.environment}-rds-maintenance"
  description = "Capture RDS maintenance events"

  event_pattern = jsonencode({
    source      = ["aws.rds"]
    detail-type = ["RDS DB Instance Event"]
  })

  tags = var.tags
}

resource "aws_cloudwatch_event_target" "rds_maintenance_sns" {
  rule      = aws_cloudwatch_event_rule.rds_maintenance.name
  target_id = "SendToSNS"
  arn       = aws_sns_topic.alerts.arn
}

# ============================================================================
# Application Insights
# ============================================================================

resource "aws_applicationinsights_application" "main" {
  resource_group_name = aws_resourcegroups_group.main.name
  auto_config_enabled = true
  auto_create         = true

  tags = var.tags
}

resource "aws_resourcegroups_group" "main" {
  name = "${var.project}-${var.environment}-resources"

  resource_query {
    query = jsonencode({
      ResourceTypeFilters = [
        "AWS::ECS::Cluster",
        "AWS::RDS::DBInstance",
        "AWS::ElastiCache::ReplicationGroup",
        "AWS::ElasticLoadBalancingV2::LoadBalancer"
      ]
      TagFilters = [
        {
          Key    = "Environment"
          Values = [var.environment]
        },
        {
          Key    = "Project"
          Values = [var.project]
        }
      ]
    })
  }

  tags = var.tags
}

# ============================================================================
# CloudWatch Synthetics (Canary)
# ============================================================================

resource "aws_synthetics_canary" "api_health" {
  name                 = "${var.project}-${var.environment}-api-health"
  artifact_s3_location = "s3://${var.canary_bucket}/canary-results/"
  execution_role_arn   = aws_iam_role.canary.arn
  handler              = "apiCanaryBlueprint.handler"
  zip_file             = "canary.zip"
  runtime_version      = "syn-nodejs-puppeteer-6.2"

  schedule {
    expression = "rate(5 minutes)"
  }

  run_config {
    timeout_in_seconds = 60
    memory_in_mb       = 960
    active_tracing     = true
  }

  success_retention_period = 31
  failure_retention_period = 31

  tags = var.tags
}

resource "aws_iam_role" "canary" {
  name = "${var.project}-${var.environment}-canary-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "canary_basic" {
  role       = aws_iam_role.canary.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "canary_s3" {
  name = "${var.project}-${var.environment}-canary-s3-policy"
  role = aws_iam_role.canary.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject"
        ]
        Resource = "${var.canary_bucket_arn}/*"
      },
      {
        Effect = "Allow"
        Action = [
          "s3:GetBucketLocation"
        ]
        Resource = var.canary_bucket_arn
      },
      {
        Effect = "Allow"
        Action = [
          "cloudwatch:PutMetricData"
        ]
        Resource = "*"
        Condition = {
          StringEquals = {
            "cloudwatch:namespace" = "CloudWatchSynthetics"
          }
        }
      }
    ]
  })
}
