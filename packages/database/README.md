# @ghxstship/database

Central database package for GHXSTSHIP. Contains Prisma schema, client, migrations, and seed data.

## Installation

```bash
pnpm install
```

## Setup

```bash
# Generate Prisma client
pnpm generate

# Run migrations
pnpm migrate:dev

# Seed database
pnpm seed
```

## Usage

```typescript
import { db } from '@ghxstship/database';

// Query database
const users = await db.user.findMany();

// Use transaction
import { transaction } from '@ghxstship/database';

await transaction([
  db.user.create({ data: { /* ... */ } }),
  db.organization.create({ data: { /* ... */ } }),
]);

// Health check
import { checkDatabaseHealth } from '@ghxstship/database';

const isHealthy = await checkDatabaseHealth();
```

## Scripts

- `pnpm generate` - Generate Prisma client
- `pnpm migrate:dev` - Create and apply migration in development
- `pnpm migrate:deploy` - Apply migrations in production
- `pnpm migrate:status` - Check migration status
- `pnpm studio` - Open Prisma Studio
- `pnpm seed` - Seed development database
- `pnpm seed:test` - Seed test database
- `pnpm seed:prod` - Seed production database

## Directory Structure

```
packages/database/
├── client/           # Database client
├── prisma/           # Prisma schema and migrations
├── seeds/            # Seed data
├── scripts/          # Helper scripts
└── types/            # TypeScript types
```

## Migration Workflow

### Development
```bash
# Create migration
pnpm migrate:dev --name add_user_table

# Reset database
pnpm migrate:reset
```

### Production
```bash
# Apply migrations
pnpm migrate:deploy

# Check status
pnpm migrate:status
```

## Best Practices

1. **Always create migrations** - Never use `db push` in production
2. **Test migrations** - Test in development before deploying
3. **Backup before migrate** - Always backup production database
4. **Use transactions** - For multi-table operations
5. **Monitor performance** - Use query logging in development

## Troubleshooting

### Migration conflicts
```bash
pnpm migrate:resolve --applied <migration_name>
```

### Reset database
```bash
./scripts/reset.sh
```

### Connection issues
- Check DATABASE_URL environment variable
- Verify database is running
- Check network connectivity
