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
      Environment = "dev"
      ManagedBy   = "Terraform"
      CostCenter  = "Engineering"
    }
  }
}

module "networking" {
  source = "../../modules/networking"
  
  project            = "ghxstship"
  environment        = "dev"
  vpc_cidr           = "10.0.0.0/16"
  availability_zones = ["us-east-1a", "us-east-1b"]
  
  tags = {
    Tier = "Network"
  }
}
