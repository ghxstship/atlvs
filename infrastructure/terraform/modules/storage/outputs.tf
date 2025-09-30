output "assets_bucket_id" {
  description = "Assets S3 bucket ID"
  value       = aws_s3_bucket.assets.id
}

output "assets_bucket_arn" {
  description = "Assets S3 bucket ARN"
  value       = aws_s3_bucket.assets.arn
}

output "uploads_bucket_id" {
  description = "Uploads S3 bucket ID"
  value       = aws_s3_bucket.uploads.id
}

output "uploads_bucket_arn" {
  description = "Uploads S3 bucket ARN"
  value       = aws_s3_bucket.uploads.arn
}

output "logs_bucket_id" {
  description = "Logs S3 bucket ID"
  value       = aws_s3_bucket.logs.id
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = aws_cloudfront_distribution.main.id
}

output "cloudfront_distribution_arn" {
  description = "CloudFront distribution ARN"
  value       = aws_cloudfront_distribution.main.arn
}

output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name"
  value       = aws_cloudfront_distribution.main.domain_name
}

output "cloudfront_hosted_zone_id" {
  description = "CloudFront hosted zone ID"
  value       = aws_cloudfront_distribution.main.hosted_zone_id
}
