#!/bin/bash

##############################################################################
# GHXSTSHIP Transformation Script #2
# Setup Docker Containerization Strategy
#
# This script creates Docker configurations for local development and
# production deployments.
#
# Usage: ./scripts/transformation/02-setup-docker.sh
##############################################################################

set -e
set -u

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Directories
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  GHXSTSHIP TRANSFORMATION - Phase 0, Step 2${NC}"
echo -e "${BLUE}  Setup Docker Containerization${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

cd "$PROJECT_ROOT"

##############################################################################
# 1. Create Multi-Stage Dockerfile for Web App
##############################################################################

echo -e "${YELLOW}🐳 Creating Dockerfile for web application...${NC}"

cat > infrastructure/docker/Dockerfile.web <<'EOF'
# syntax=docker/dockerfile:1

# ============================================================================
# Stage 1: Dependencies
# ============================================================================
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY turbo.json ./
COPY packages/ui/package.json ./packages/ui/
COPY packages/domain/package.json ./packages/domain/
COPY packages/application/package.json ./packages/application/
COPY packages/infrastructure/package.json ./packages/infrastructure/
COPY packages/auth/package.json ./packages/auth/
COPY packages/config/package.json ./packages/config/
COPY packages/utils/package.json ./packages/utils/
COPY packages/analytics/package.json ./packages/analytics/
COPY packages/i18n/package.json ./packages/i18n/
COPY packages/icons/package.json ./packages/icons/
COPY packages/data-view/package.json ./packages/data-view/
COPY apps/web/package.json ./apps/web/

# Install dependencies
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --prefer-offline

# ============================================================================
# Stage 2: Builder
# ============================================================================
FROM node:20-alpine AS builder
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/*/node_modules ./packages/
COPY --from=deps /app/apps/*/node_modules ./apps/

# Copy source code
COPY . .

# Build arguments for Next.js
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_APP_URL
ARG DATABASE_URL

# Set environment variables
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL

# Build application
RUN pnpm build --filter=web

# ============================================================================
# Stage 3: Runner
# ============================================================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static

# Set correct permissions
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "apps/web/server.js"]
EOF

echo -e "${GREEN}✅ Dockerfile created${NC}"

##############################################################################
# 2. Create Docker Compose for Local Development
##############################################################################

echo -e "${YELLOW}🔧 Creating docker-compose configuration...${NC}"

cat > docker-compose.yml <<'EOF'
version: '3.9'

services:
  # ============================================================================
  # Web Application
  # ============================================================================
  web:
    build:
      context: .
      dockerfile: infrastructure/docker/Dockerfile.web
      args:
        - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
        - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
        - NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL:-http://localhost:3000}
        - DATABASE_URL=${DATABASE_URL}
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=redis://redis:6379
    volumes:
      - ./apps/web:/app/apps/web
      - ./packages:/app/packages
      - /app/node_modules
      - /app/apps/web/node_modules
      - /app/packages/*/node_modules
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - ghxstship
    restart: unless-stopped

  # ============================================================================
  # PostgreSQL Database (Supabase-compatible)
  # ============================================================================
  postgres:
    image: supabase/postgres:15.1.0.117
    ports:
      - "${POSTGRES_PORT:-5432}:5432"
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-postgres}
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres}
      POSTGRES_HOST_AUTH_METHOD: ${POSTGRES_HOST_AUTH_METHOD:-scram-sha-256}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./supabase/migrations:/docker-entrypoint-initdb.d:ro
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - ghxstship
    restart: unless-stopped

  # ============================================================================
  # Redis Cache
  # ============================================================================
  redis:
    image: redis:7-alpine
    ports:
      - "${REDIS_PORT:-6379}:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - ghxstship
    restart: unless-stopped

  # ============================================================================
  # Supabase Studio (Optional - for local DB management)
  # ============================================================================
  studio:
    image: supabase/studio:latest
    ports:
      - "${STUDIO_PORT:-3001}:3000"
    environment:
      SUPABASE_URL: http://localhost:${POSTGRES_PORT:-5432}
      STUDIO_PG_META_URL: http://postgres:5432
    depends_on:
      - postgres
    networks:
      - ghxstship
    profiles:
      - tools
    restart: unless-stopped

networks:
  ghxstship:
    driver: bridge

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local
EOF

echo -e "${GREEN}✅ docker-compose.yml created${NC}"

##############################################################################
# 3. Create Production Docker Compose
##############################################################################

echo -e "${YELLOW}🚀 Creating production docker-compose...${NC}"

cat > docker-compose.prod.yml <<'EOF'
version: '3.9'

services:
  web:
    build:
      context: .
      dockerfile: infrastructure/docker/Dockerfile.web
      target: runner
      args:
        - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
        - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
        - NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
        - DATABASE_URL=${DATABASE_URL}
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - DATABASE_URL=${DATABASE_URL}
    networks:
      - ghxstship
    restart: always
    deploy:
      replicas: 2
      update_config:
        parallelism: 1
        delay: 10s
        order: start-first
      rollback_config:
        parallelism: 1
        delay: 5s
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M

networks:
  ghxstship:
    driver: overlay
EOF

echo -e "${GREEN}✅ docker-compose.prod.yml created${NC}"

##############################################################################
# 4. Create .dockerignore
##############################################################################

echo -e "${YELLOW}🚫 Creating .dockerignore...${NC}"

cat > .dockerignore <<'EOF'
# Dependencies
node_modules
.pnp
.pnp.js

# Testing
coverage
*.test.ts
*.test.tsx
*.spec.ts
*.spec.tsx
tests/
__tests__/

# Next.js
.next/
out/
build/
dist/

# Turbo
.turbo

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
.pnpm-debug.log*

# Environment
.env*.local
.env.development
.env.test

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
tsconfig.tsbuildinfo

# Git
.git
.gitignore
.gitattributes

# Documentation
*.md
docs/
!README.md

# IDE
.vscode
.idea
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
logs
*.log

# Misc
.editorconfig
.eslintrc*
.prettierrc*
.husky/

# Scripts (not needed in container)
scripts/

# GitHub
.github/
EOF

echo -e "${GREEN}✅ .dockerignore created${NC}"

##############################################################################
# 5. Update next.config.mjs for Standalone Output
##############################################################################

echo -e "${YELLOW}⚙️  Updating Next.js configuration for Docker...${NC}"

# Backup existing config
if [ -f "apps/web/next.config.mjs" ]; then
    cp apps/web/next.config.mjs apps/web/next.config.mjs.backup
    
    # Check if output: 'standalone' exists
    if ! grep -q "output.*standalone" apps/web/next.config.mjs; then
        echo "Note: Add 'output: \"standalone\"' to next.config.mjs manually"
        echo "Location: apps/web/next.config.mjs"
        echo "Required for Docker builds"
    fi
fi

echo -e "${GREEN}✅ Next.js configuration checked${NC}"

##############################################################################
# 6. Create Docker Helper Scripts
##############################################################################

echo -e "${YELLOW}🛠️  Creating Docker helper scripts...${NC}"

mkdir -p infrastructure/docker/scripts

# Build script
cat > infrastructure/docker/scripts/build.sh <<'EOF'
#!/bin/bash
set -e

echo "🐳 Building Docker images..."

docker-compose build --no-cache

echo "✅ Build complete!"
EOF

# Start script
cat > infrastructure/docker/scripts/start.sh <<'EOF'
#!/bin/bash
set -e

echo "🚀 Starting GHXSTSHIP services..."

docker-compose up -d

echo "✅ Services started!"
echo "📱 Web: http://localhost:3000"
echo "🗄️  PostgreSQL: localhost:5432"
echo "📊 Redis: localhost:6379"
EOF

# Stop script
cat > infrastructure/docker/scripts/stop.sh <<'EOF'
#!/bin/bash
set -e

echo "⏹️  Stopping GHXSTSHIP services..."

docker-compose down

echo "✅ Services stopped!"
EOF

# Logs script
cat > infrastructure/docker/scripts/logs.sh <<'EOF'
#!/bin/bash

SERVICE=${1:-web}

echo "📋 Viewing logs for: $SERVICE"
docker-compose logs -f "$SERVICE"
EOF

# Clean script
cat > infrastructure/docker/scripts/clean.sh <<'EOF'
#!/bin/bash
set -e

echo "🧹 Cleaning Docker resources..."

docker-compose down -v
docker system prune -af

echo "✅ Cleanup complete!"
EOF

chmod +x infrastructure/docker/scripts/*.sh

echo -e "${GREEN}✅ Docker helper scripts created${NC}"

##############################################################################
# 7. Create Docker Documentation
##############################################################################

echo -e "${YELLOW}📝 Creating Docker documentation...${NC}"

cat > infrastructure/docker/README.md <<'EOF'
# Docker Configuration

## Quick Start

### Development
```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f web

# Stop services
docker-compose down
```

### Production
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start production stack
docker-compose -f docker-compose.prod.yml up -d
```

## Helper Scripts

Located in `scripts/`:

- `build.sh` - Build all images
- `start.sh` - Start services
- `stop.sh` - Stop services
- `logs.sh <service>` - View service logs
- `clean.sh` - Clean up all resources

## Services

### Web Application
- **Port:** 3000
- **URL:** http://localhost:3000
- **Health:** http://localhost:3000/api/health

### PostgreSQL
- **Port:** 5432
- **User:** postgres
- **Database:** postgres

### Redis
- **Port:** 6379

### Supabase Studio (Optional)
- **Port:** 3001
- **Start:** `docker-compose --profile tools up studio`

## Configuration

Environment variables are loaded from `.env.local`. Copy `.env.example`:

```bash
cp .env.example .env.local
```

## Troubleshooting

### Slow builds
```bash
# Use BuildKit
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1
```

### Permission issues
```bash
# Reset ownership
sudo chown -R $USER:$USER .
```

### Port conflicts
```bash
# Change ports in docker-compose.yml or use env vars
POSTGRES_PORT=5433 docker-compose up
```

### Clean slate
```bash
./scripts/clean.sh
docker-compose up --build
```

## Performance Tips

1. **Layer caching:** Order Dockerfile commands from least to most frequently changing
2. **Multi-stage builds:** Keep final image small
3. **BuildKit:** Use for parallel builds and better caching
4. **Volume mounts:** Use for development hot-reload

## Production Deployment

See [Production Deployment Guide](../../docs/deployment/docker-production.md)
EOF

echo -e "${GREEN}✅ Docker documentation created${NC}"

##############################################################################
# 8. Create GitHub Actions Workflow for Docker
##############################################################################

echo -e "${YELLOW}🔄 Creating CI/CD workflow for Docker...${NC}"

mkdir -p .github/workflows

cat > .github/workflows/docker-build.yml <<'EOF'
name: Docker Build & Push

on:
  push:
    branches: [main, develop]
    paths:
      - 'apps/**'
      - 'packages/**'
      - 'infrastructure/docker/**'
      - 'docker-compose*.yml'
      - 'Dockerfile*'
  pull_request:
    branches: [main, develop]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}/web

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Container registry
        if: github.event_name != 'pull_request'
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=sha,prefix={{branch}}-

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./infrastructure/docker/Dockerfile.web
          push: ${{ github.event_name != 'pull_request' }}
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
          build-args: |
            NEXT_PUBLIC_SUPABASE_URL=${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
            NEXT_PUBLIC_SUPABASE_ANON_KEY=${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}

      - name: Image digest
        run: echo ${{ steps.docker_build.outputs.digest }}
EOF

echo -e "${GREEN}✅ CI/CD workflow created${NC}"

##############################################################################
# 9. Summary
##############################################################################

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Docker Setup Complete!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}Created:${NC}"
echo "  • Multi-stage Dockerfile"
echo "  • docker-compose.yml for development"
echo "  • docker-compose.prod.yml for production"
echo "  • .dockerignore"
echo "  • Docker helper scripts"
echo "  • Docker documentation"
echo "  • CI/CD workflow"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. Copy .env.example to .env.local and configure"
echo "  2. Add 'output: \"standalone\"' to apps/web/next.config.mjs"
echo "  3. Test build: docker-compose build"
echo "  4. Test run: docker-compose up -d"
echo "  5. Run: ./scripts/transformation/03-extract-database-package.sh"
echo ""
echo -e "${BLUE}Quick Commands:${NC}"
echo "  • Build: ./infrastructure/docker/scripts/build.sh"
echo "  • Start: ./infrastructure/docker/scripts/start.sh"
echo "  • Logs: ./infrastructure/docker/scripts/logs.sh web"
echo "  • Stop: ./infrastructure/docker/scripts/stop.sh"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

touch .transformation-02-complete

exit 0
EOF

chmod +x infrastructure/docker/scripts/*.sh
