#!/bin/bash

##############################################################################
# GHXSTSHIP Transformation Script #1
# Setup Enterprise Infrastructure Directory Structure
#
# This script creates the complete infrastructure directory structure
# required for 2030-ready enterprise deployment.
#
# Usage: ./scripts/transformation/01-setup-infrastructure.sh
##############################################################################

set -e  # Exit on error
set -u  # Exit on undefined variable

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  GHXSTSHIP TRANSFORMATION - Phase 0, Step 1${NC}"
echo -e "${BLUE}  Setup Enterprise Infrastructure Directory${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

cd "$PROJECT_ROOT"

##############################################################################
# 1. Create Infrastructure Directory Structure
##############################################################################

echo -e "${YELLOW}📁 Creating infrastructure directory structure...${NC}"

# Main infrastructure directories
mkdir -p infrastructure/{terraform,kubernetes,docker,monitoring}

# Terraform structure
mkdir -p infrastructure/terraform/modules/{networking,compute,database,storage,monitoring,security}
mkdir -p infrastructure/terraform/environments/{dev,staging,prod,dr}
mkdir -p infrastructure/terraform/global/{route53,acm,iam}
mkdir -p infrastructure/terraform/scripts

# Kubernetes structure
mkdir -p infrastructure/kubernetes/base/{deployments,services,configmaps,secrets,ingress}
mkdir -p infrastructure/kubernetes/overlays/{dev,staging,prod}
mkdir -p infrastructure/kubernetes/helm-charts

# Docker structure
mkdir -p infrastructure/docker/{scripts,configs}

# Monitoring structure
mkdir -p infrastructure/monitoring/{prometheus,grafana,loki,tempo,alertmanager}
mkdir -p infrastructure/monitoring/prometheus/{config,rules}
mkdir -p infrastructure/monitoring/grafana/{dashboards,datasources}

echo -e "${GREEN}✅ Infrastructure directories created${NC}"

##############################################################################
# 2. Create Terraform Base Configuration
##############################################################################

echo -e "${YELLOW}🏗️  Creating Terraform base configuration...${NC}"

# Create main Terraform configuration
cat > infrastructure/terraform/main.tf <<'EOF'
terraform {
  required_version = ">= 1.5"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Provider configuration will be in environments/*/main.tf
EOF

# Create backend configuration template
cat > infrastructure/terraform/backend.tf.example <<'EOF'
terraform {
  backend "s3" {
    bucket         = "ghxstship-terraform-state"
    key            = "terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-locks"
  }
}
EOF

# Create variables template
cat > infrastructure/terraform/variables.tf <<'EOF'
variable "project" {
  description = "Project name"
  type        = string
  default     = "ghxstship"
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

variable "tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default     = {}
}
EOF

echo -e "${GREEN}✅ Terraform base configuration created${NC}"

##############################################################################
# 3. Create Networking Module
##############################################################################

echo -e "${YELLOW}🌐 Creating networking module...${NC}"

cat > infrastructure/terraform/modules/networking/main.tf <<'EOF'
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  tags = merge(
    var.tags,
    {
      Name = "${var.project}-${var.environment}-vpc"
    }
  )
}

resource "aws_subnet" "public" {
  count                   = length(var.availability_zones)
  vpc_id                  = aws_vpc.main.id
  cidr_block              = cidrsubnet(var.vpc_cidr, 8, count.index)
  availability_zone       = var.availability_zones[count.index]
  map_public_ip_on_launch = true
  
  tags = merge(
    var.tags,
    {
      Name = "${var.project}-${var.environment}-public-${count.index + 1}"
      Type = "Public"
    }
  )
}

resource "aws_subnet" "private" {
  count             = length(var.availability_zones)
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, count.index + length(var.availability_zones))
  availability_zone = var.availability_zones[count.index]
  
  tags = merge(
    var.tags,
    {
      Name = "${var.project}-${var.environment}-private-${count.index + 1}"
      Type = "Private"
    }
  )
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  
  tags = merge(
    var.tags,
    {
      Name = "${var.project}-${var.environment}-igw"
    }
  )
}

resource "aws_eip" "nat" {
  count  = length(var.availability_zones)
  domain = "vpc"
  
  tags = merge(
    var.tags,
    {
      Name = "${var.project}-${var.environment}-nat-eip-${count.index + 1}"
    }
  )
}

resource "aws_nat_gateway" "main" {
  count         = length(var.availability_zones)
  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[count.index].id
  
  tags = merge(
    var.tags,
    {
      Name = "${var.project}-${var.environment}-nat-${count.index + 1}"
    }
  )
  
  depends_on = [aws_internet_gateway.main]
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }
  
  tags = merge(
    var.tags,
    {
      Name = "${var.project}-${var.environment}-public-rt"
    }
  )
}

resource "aws_route_table" "private" {
  count  = length(var.availability_zones)
  vpc_id = aws_vpc.main.id
  
  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main[count.index].id
  }
  
  tags = merge(
    var.tags,
    {
      Name = "${var.project}-${var.environment}-private-rt-${count.index + 1}"
    }
  )
}

resource "aws_route_table_association" "public" {
  count          = length(var.availability_zones)
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "private" {
  count          = length(var.availability_zones)
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private[count.index].id
}
EOF

cat > infrastructure/terraform/modules/networking/variables.tf <<'EOF'
variable "project" {
  description = "Project name"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "vpc_cidr" {
  description = "VPC CIDR block"
  type        = string
}

variable "availability_zones" {
  description = "List of availability zones"
  type        = list(string)
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}
EOF

cat > infrastructure/terraform/modules/networking/outputs.tf <<'EOF'
output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "vpc_cidr" {
  description = "VPC CIDR block"
  value       = aws_vpc.main.cidr_block
}

output "public_subnet_ids" {
  description = "List of public subnet IDs"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "List of private subnet IDs"
  value       = aws_subnet.private[*].id
}

output "nat_gateway_ids" {
  description = "List of NAT Gateway IDs"
  value       = aws_nat_gateway.main[*].id
}
EOF

echo -e "${GREEN}✅ Networking module created${NC}"

##############################################################################
# 4. Create Dev Environment Configuration
##############################################################################

echo -e "${YELLOW}🔧 Creating dev environment configuration...${NC}"

cat > infrastructure/terraform/environments/dev/main.tf <<'EOF'
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
EOF

cat > infrastructure/terraform/environments/dev/variables.tf <<'EOF'
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}
EOF

cat > infrastructure/terraform/environments/dev/outputs.tf <<'EOF'
output "vpc_id" {
  description = "VPC ID"
  value       = module.networking.vpc_id
}

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = module.networking.public_subnet_ids
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = module.networking.private_subnet_ids
}
EOF

cat > infrastructure/terraform/environments/dev/terraform.tfvars.example <<'EOF'
aws_region = "us-east-1"
EOF

echo -e "${GREEN}✅ Dev environment configuration created${NC}"

##############################################################################
# 5. Create Infrastructure README
##############################################################################

echo -e "${YELLOW}📝 Creating infrastructure documentation...${NC}"

cat > infrastructure/README.md <<'EOF'
# GHXSTSHIP Infrastructure

This directory contains all infrastructure as code (IaC) and deployment configurations for GHXSTSHIP.

## Directory Structure

```
infrastructure/
├── terraform/          # Infrastructure as Code
├── kubernetes/         # Kubernetes manifests
├── docker/             # Container definitions
└── monitoring/         # Observability configuration
```

## Quick Start

### Prerequisites
- Terraform >= 1.5
- AWS CLI configured
- kubectl (for Kubernetes)
- Docker

### Provisioning Dev Environment

```bash
cd infrastructure/terraform/environments/dev
terraform init
terraform plan
terraform apply
```

### Local Development with Docker

```bash
# From project root
docker-compose up -d
```

## Documentation

- [Terraform Modules](./terraform/modules/README.md)
- [Kubernetes Setup](./kubernetes/README.md)
- [Monitoring Stack](./monitoring/README.md)

## Support

For issues or questions, contact the DevOps team in #ghxstship-ops
EOF

echo -e "${GREEN}✅ Infrastructure documentation created${NC}"

##############################################################################
# 6. Create Git Structure
##############################################################################

echo -e "${YELLOW}📦 Initializing Git tracking...${NC}"

# Create .gitkeep files for empty directories
find infrastructure -type d -empty -exec touch {}/.gitkeep \;

# Create infrastructure .gitignore
cat > infrastructure/.gitignore <<'EOF'
# Terraform
**/.terraform/
**/.terraform.lock.hcl
**/terraform.tfstate
**/terraform.tfstate.backup
**/terraform.tfvars
**/.terraformrc
**/terraform.rc

# Kubernetes secrets
**/secrets/**
!**/secrets/.gitkeep

# Local development
*.local
*.env

# Logs
*.log
EOF

echo -e "${GREEN}✅ Git structure initialized${NC}"

##############################################################################
# 7. Summary and Next Steps
##############################################################################

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Infrastructure Setup Complete!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}Created:${NC}"
echo "  • Infrastructure directory structure"
echo "  • Terraform base configuration"
echo "  • Networking module"
echo "  • Dev environment template"
echo "  • Documentation"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. Review infrastructure/README.md"
echo "  2. Run: ./scripts/transformation/02-setup-docker.sh"
echo "  3. Configure AWS credentials"
echo "  4. Initialize Terraform: cd infrastructure/terraform/environments/dev && terraform init"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Create marker file
touch .transformation-01-complete

exit 0
