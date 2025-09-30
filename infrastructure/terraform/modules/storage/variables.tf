variable "project" {
  description = "Project name"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "kms_key_id" {
  description = "KMS key ID for encryption"
  type        = string
}

variable "certificate_arn" {
  description = "ACM certificate ARN for CloudFront"
  type        = string
}

variable "domain_aliases" {
  description = "Domain aliases for CloudFront"
  type        = list(string)
  default     = []
}

variable "cloudfront_price_class" {
  description = "CloudFront price class"
  type        = string
  default     = "PriceClass_100"
}

variable "cors_allowed_origins" {
  description = "CORS allowed origins for uploads bucket"
  type        = list(string)
}

variable "log_retention_days" {
  description = "Log retention in days"
  type        = number
  default     = 90
}

variable "sns_topic_arn" {
  description = "SNS topic ARN for alarms"
  type        = string
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}
