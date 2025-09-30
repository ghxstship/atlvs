variable "project" {
  description = "Project name"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "public_subnet_ids" {
  description = "List of public subnet IDs"
  type        = list(string)
}

variable "private_subnet_ids" {
  description = "List of private subnet IDs"
  type        = list(string)
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "web_image" {
  description = "Docker image for web application"
  type        = string
}

variable "web_cpu" {
  description = "CPU units for web task"
  type        = string
  default     = "512"
}

variable "web_memory" {
  description = "Memory for web task"
  type        = string
  default     = "1024"
}

variable "web_desired_count" {
  description = "Desired number of web tasks"
  type        = number
  default     = 2
}

variable "web_min_count" {
  description = "Minimum number of web tasks"
  type        = number
  default     = 1
}

variable "web_max_count" {
  description = "Maximum number of web tasks"
  type        = number
  default     = 10
}

variable "certificate_arn" {
  description = "ARN of ACM certificate for HTTPS"
  type        = string
}

variable "secrets_arn" {
  description = "ARN of Secrets Manager secret"
  type        = string
}

variable "log_retention_days" {
  description = "CloudWatch log retention in days"
  type        = number
  default     = 30
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}
