# 🚀 GHXSTSHIP - Enterprise Management Platform

**2030-Ready Enterprise SaaS** | **ATLVS · OPENDECK · Marketplace**

[![Phase 0](https://img.shields.io/badge/Phase%200-Complete-success)](./PHASE_0_COMPLETE.md)
[![Infrastructure](https://img.shields.io/badge/Infrastructure-Ready-blue)](./infrastructure/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](./docker-compose.yml)
[![Docs](https://img.shields.io/badge/Docs-220%2B%20pages-brightgreen)](./docs/architecture/)

> **✅ 2030 Transformation Phase 0 Complete** - Infrastructure foundation established with ZERO TOLERANCE execution. [Read more →](./START_HERE.md)

---

## 🎯 Platform Overview

This monorepo contains the GHXSTSHIP enterprise management platform, along with OPENDECK marketplace and GHXSTSHIP marketing site:

- **apps/web**: Next.js App Router (ATLVS platform, OPENDECK marketplace, marketing)
- **packages/**: Shared libraries (UI, domain, application, infrastructure, auth, analytics)
- **infrastructure/**: Complete IaC setup (Terraform, Kubernetes, Docker, Monitoring)
- **supabase/**: SQL migrations and seeds

**Parent Company**: GHXSTSHIP INDUSTRIES LLC

## Quick Start

1. Install pnpm and Supabase CLI

```bash
npm i -g pnpm @supabase/cli
```

2. Install deps

```bash
pnpm install
```

3. Setup env

Copy `.env.example` to `apps/web/.env.local` and set Supabase URL/keys and PostHog key.

4. Dev

```bash
pnpm dev
```

Visit http://localhost:3000

5. Supabase (local)

```bash
supabase start
supabase db reset --db-url "postgresql://postgres:postgres@127.0.0.1:54322/postgres"
```

Apply migrations from `supabase/migrations` and seed data from `supabase/seed/seed.sql`.

## Packages

- `@ghxstship/ui`: design system and components built on Tailwind and shadcn patterns.
- `@ghxstship/config`: tailwind preset and shared configs.
- `@ghxstship/utils`: helpers for date/currency/i18n.
- `@ghxstship/auth`: Supabase auth client and hooks.
- `@ghxstship/analytics`: PostHog wrappers.
- `@ghxstship/data-view`: DataView engines (grid first).

## 🏗️ 2030 Transformation

**Status**: Phase 0 Complete ✅ | Overall: 4% Complete

| Phase | Status | Progress |
|-------|--------|----------|
| **Phase 0: Foundation** | ✅ Complete | 100% |
| Phase 1: Infrastructure | 📋 Next | 0% |
| Phase 2: Testing & Quality | 📋 Planned | 0% |
| Phase 3: Multi-Platform | 📋 Planned | 0% |
| Phase 4: Tooling & DX | 📋 Planned | 0% |
| Phase 5: Operations | 📋 Planned | 0% |

**Phase 0 Delivered:**
- ✅ Complete infrastructure foundation (Terraform, Kubernetes, Docker)
- ✅ Production-ready Docker containerization
- ✅ Database package isolation
- ✅ 86 legacy files removed
- ✅ 220+ pages of documentation

**Learn More:**
- 📄 [Start Here](./START_HERE.md) - Entry point for transformation
- 📄 [Phase 0 Complete](./PHASE_0_COMPLETE.md) - Detailed breakdown
- 📄 [Executive Summary](./docs/architecture/TRANSFORMATION_EXECUTIVE_SUMMARY.md) - Business case
- 📄 [Quick Start](./docs/architecture/TRANSFORMATION_QUICK_START.md) - Implementation guide

## 🐳 Docker Support

Run the entire stack locally:

```bash
# Copy environment template
cp .env.example .env.local

# Build and run
docker-compose up -d

# View logs
docker-compose logs -f web

# Stop services
docker-compose down
```

## CI/CD

GitHub Actions workflows in `.github/workflows/` handle linting, builds, and Docker image creation on PRs.
