output "kms_key_id" {
  description = "KMS key ID"
  value       = aws_kms_key.main.id
}

output "kms_key_arn" {
  description = "KMS key ARN"
  value       = aws_kms_key.main.arn
}

output "secrets_arn" {
  description = "Secrets Manager secret ARN"
  value       = aws_secretsmanager_secret.app_secrets.arn
}

output "secrets_id" {
  description = "Secrets Manager secret ID"
  value       = aws_secretsmanager_secret.app_secrets.id
}

output "waf_web_acl_id" {
  description = "WAF Web ACL ID"
  value       = aws_wafv2_web_acl.main.id
}

output "waf_web_acl_arn" {
  description = "WAF Web ACL ARN"
  value       = aws_wafv2_web_acl.main.arn
}

output "security_alerts_topic_arn" {
  description = "Security alerts SNS topic ARN"
  value       = aws_sns_topic.security_alerts.arn
}

output "guardduty_detector_id" {
  description = "GuardDuty detector ID"
  value       = var.enable_guardduty ? aws_guardduty_detector.main[0].id : null
}
