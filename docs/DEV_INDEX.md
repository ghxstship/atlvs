# Development Index

Quick reference for common development tasks.

## Getting Started
- [START_HERE.md](../START_HERE.md) - Onboarding guide
- [QUICK_START_GUIDE.md](../QUICK_START_GUIDE.md) - Quick start
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture

## Development
```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build
```

## Scripts
- `scripts/dev/` - Development utilities
- `scripts/build/` - Build scripts
- `scripts/deploy/` - Deployment scripts
- `scripts/utils/` - General utilities

## Testing
```bash
# Unit tests
pnpm test:unit

# Integration tests
pnpm test:integration

# E2E tests
pnpm test:e2e

# Coverage report
pnpm test:coverage
```

## Deployment
See `infrastructure/README.md` for deployment documentation.

## Code Quality
```bash
# Lint
pnpm lint

# Format
pnpm format

# Type check
pnpm typecheck
```

## Documentation
- API docs: `docs/api/`
- Architecture: `docs/architecture/`
- Guides: `docs/guides/`

## Support
- GitHub Issues: Report bugs & request features
- Discussions: Ask questions & share ideas
