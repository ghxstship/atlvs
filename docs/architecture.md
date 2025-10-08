# ATLVS Architecture

## Directory Structure

```
atlvs/
├── apps/                      # Application implementations
│   ├── web/                  # Main web application (Next.js)
│   ├── mobile/               # Mobile application
│   └── desktop/              # Desktop application
├── packages/                  # Shared packages (monorepo)
│   ├── ui/                   # UI components library
│   ├── domain/               # Business logic & domain models
│   ├── infrastructure/       # External integrations
│   ├── application/          # Application services
│   ├── auth/                 # Authentication utilities
│   ├── database/             # Database utilities
│   ├── analytics/            # Analytics integration
│   ├── i18n/                 # Internationalization
│   ├── config/               # Configuration management
│   ├── utils/                # Utility functions
│   └── shared/               # Shared types & constants
├── infrastructure/            # Infrastructure as Code
│   ├── terraform/            # Terraform configurations
│   ├── kubernetes/           # K8s manifests
│   └── docker/               # Docker configurations
├── supabase/                  # Supabase backend
│   ├── migrations/           # Database migrations
│   ├── functions/            # Edge functions
│   └── seed/                 # Database seed data
├── scripts/                   # Utility scripts
│   ├── dev/                  # Development scripts
│   ├── build/                # Build scripts
│   ├── deploy/               # Deployment scripts
│   ├── utils/                # Utility scripts
│   └── archive/              # Legacy scripts
├── docs/                      # Documentation
│   ├── architecture/         # Architecture docs
│   ├── api/                  # API documentation
│   ├── guides/               # How-to guides
│   └── archive/              # Legacy documentation
├── tests/                     # Integration & E2E tests
├── .github/                   # GitHub workflows & templates
├── .husky/                    # Git hooks
└── .storybook/               # Storybook configuration
```

## Key Principles

1. **Modular Architecture**: Clear separation of concerns
2. **Monorepo Structure**: Shared packages with independent versioning
3. **Domain-Driven Design**: Business logic in domain package
4. **Infrastructure as Code**: All infrastructure versioned
5. **Type Safety**: TypeScript throughout
6. **Testing**: Comprehensive test coverage
7. **Documentation**: Living documentation alongside code

## Development Workflow

See [START_HERE.md](../START_HERE.md) for getting started.
