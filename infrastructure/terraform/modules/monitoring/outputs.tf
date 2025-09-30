output "sns_topic_arn" {
  description = "SNS topic ARN for alerts"
  value       = aws_sns_topic.alerts.arn
}

output "dashboard_name" {
  description = "CloudWatch dashboard name"
  value       = aws_cloudwatch_dashboard.main.dashboard_name
}

output "canary_name" {
  description = "Synthetics canary name"
  value       = aws_synthetics_canary.api_health.name
}

output "resource_group_arn" {
  description = "Resource group ARN"
  value       = aws_resourcegroups_group.main.arn
}
