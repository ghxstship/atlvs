variable "project" {
  description = "Project name"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "kms_key_id" {
  description = "KMS key ID for encryption"
  type        = string
}

variable "alert_emails" {
  description = "Email addresses for alerts"
  type        = list(string)
}

variable "ecs_cluster_arn" {
  description = "ECS cluster ARN"
  type        = string
}

variable "canary_bucket" {
  description = "S3 bucket for canary artifacts"
  type        = string
}

variable "canary_bucket_arn" {
  description = "S3 bucket ARN for canary artifacts"
  type        = string
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}
