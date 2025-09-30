terraform {
  required_version = ">= 1.5"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = "GHXSTSHIP"
      Environment = "staging"
      ManagedBy   = "Terraform"
      CostCenter  = "Engineering"
    }
  }
}

# ============================================================================
# Networking
# ============================================================================

module "networking" {
  source = "../../modules/networking"
  
  project            = "ghxstship"
  environment        = "staging"
  vpc_cidr           = "10.1.0.0/16"
  availability_zones = ["us-east-1a", "us-east-1b", "us-east-1c"]
  
  tags = {
    Tier = "Network"
  }
}

# ============================================================================
# Security
# ============================================================================

module "security" {
  source = "../../modules/security"
  
  project     = "ghxstship"
  environment = "staging"
  aws_region  = var.aws_region
  
  # Secrets (should be in AWS Secrets Manager or environment variables)
  supabase_url              = var.supabase_url
  supabase_anon_key         = var.supabase_anon_key
  supabase_service_role_key = var.supabase_service_role_key
  stripe_secret_key         = var.stripe_secret_key
  stripe_webhook_secret     = var.stripe_webhook_secret
  google_client_id          = var.google_client_id
  google_client_secret      = var.google_client_secret
  
  security_alert_emails = var.security_alert_emails
  sns_topic_arn        = module.monitoring.sns_topic_arn
  
  enable_security_hub = true
  enable_guardduty    = true
  
  tags = {
    Tier = "Security"
  }
}

# ============================================================================
# Database
# ============================================================================

module "database" {
  source = "../../modules/database"
  
  project            = "ghxstship"
  environment        = "staging"
  vpc_id             = module.networking.vpc_id
  private_subnet_ids = module.networking.private_subnet_ids
  
  allowed_security_groups = [module.compute.ecs_security_group_id]
  kms_key_id              = module.security.kms_key_id
  sns_topic_arn           = module.monitoring.sns_topic_arn
  
  # RDS Configuration
  db_instance_class       = "db.t4g.small"
  db_allocated_storage    = 50
  db_name                 = "ghxstship_staging"
  db_username             = var.db_username
  db_password             = var.db_password
  backup_retention_period = 7
  
  # Redis Configuration
  redis_node_type          = "cache.t4g.small"
  redis_num_nodes          = 2
  redis_auth_token         = var.redis_auth_token
  redis_snapshot_retention = 5
  
  tags = {
    Tier = "Database"
  }
}

# ============================================================================
# Storage
# ============================================================================

module "storage" {
  source = "../../modules/storage"
  
  project         = "ghxstship"
  environment     = "staging"
  kms_key_id      = module.security.kms_key_id
  certificate_arn = var.certificate_arn
  
  domain_aliases        = var.domain_aliases
  cors_allowed_origins  = var.cors_allowed_origins
  cloudfront_price_class = "PriceClass_100"
  sns_topic_arn         = module.monitoring.sns_topic_arn
  
  tags = {
    Tier = "Storage"
  }
}

# ============================================================================
# Compute
# ============================================================================

module "compute" {
  source = "../../modules/compute"
  
  project            = "ghxstship"
  environment        = "staging"
  vpc_id             = module.networking.vpc_id
  public_subnet_ids  = module.networking.public_subnet_ids
  private_subnet_ids = module.networking.private_subnet_ids
  
  web_image         = var.web_image
  web_cpu           = "1024"
  web_memory        = "2048"
  web_desired_count = 2
  web_min_count     = 2
  web_max_count     = 10
  
  certificate_arn = var.certificate_arn
  secrets_arn     = module.security.secrets_arn
  
  tags = {
    Tier = "Compute"
  }
}

# ============================================================================
# Monitoring
# ============================================================================

module "monitoring" {
  source = "../../modules/monitoring"
  
  project         = "ghxstship"
  environment     = "staging"
  aws_region      = var.aws_region
  kms_key_id      = module.security.kms_key_id
  alert_emails    = var.alert_emails
  ecs_cluster_arn = module.compute.cluster_arn
  
  canary_bucket     = module.storage.logs_bucket_id
  canary_bucket_arn = module.storage.logs_bucket_arn
  
  tags = {
    Tier = "Monitoring"
  }
}
