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
