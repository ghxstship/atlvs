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
