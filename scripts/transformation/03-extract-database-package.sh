#!/bin/bash

##############################################################################
# GHXSTSHIP Transformation Script #3
# Extract Database Package from Infrastructure
#
# This script extracts the database layer into a dedicated package for
# better separation of concerns and testability.
#
# Usage: ./scripts/transformation/03-extract-database-package.sh
##############################################################################

set -e
set -u

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  GHXSTSHIP TRANSFORMATION - Phase 0, Step 3${NC}"
echo -e "${BLUE}  Extract Database Package${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

cd "$PROJECT_ROOT"

##############################################################################
# 1. Create Database Package Structure
##############################################################################

echo -e "${YELLOW}📦 Creating database package structure...${NC}"

mkdir -p packages/database/{prisma,client,seeds/{dev,test,prod},scripts,types}

##############################################################################
# 2. Create Package Configuration
##############################################################################

echo -e "${YELLOW}⚙️  Creating package.json...${NC}"

cat > packages/database/package.json <<'EOF'
{
  "name": "@ghxstship/database",
  "version": "0.0.1",
  "private": true,
  "main": "./client/index.ts",
  "types": "./client/index.ts",
  "exports": {
    ".": "./client/index.ts",
    "./client": "./client/index.ts",
    "./types": "./types/index.ts",
    "./seeds": "./seeds/index.ts"
  },
  "scripts": {
    "generate": "prisma generate",
    "migrate:dev": "prisma migrate dev",
    "migrate:deploy": "prisma migrate deploy",
    "migrate:reset": "prisma migrate reset",
    "migrate:status": "prisma migrate status",
    "studio": "prisma studio",
    "seed": "tsx seeds/dev/index.ts",
    "seed:test": "tsx seeds/test/index.ts",
    "seed:prod": "tsx seeds/prod/index.ts",
    "db:push": "prisma db push",
    "db:pull": "prisma db pull",
    "format": "prisma format",
    "validate": "prisma validate",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@prisma/client": "^5.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "prisma": "^5.0.0",
    "tsx": "^4.0.0",
    "typescript": "^5.0.0"
  }
}
EOF

echo -e "${GREEN}✅ package.json created${NC}"

##############################################################################
# 3. Create Database Client
##############################################################################

echo -e "${YELLOW}🔌 Creating database client...${NC}"

cat > packages/database/client/index.ts <<'EOF'
/**
 * GHXSTSHIP Database Client
 * 
 * Singleton Prisma client instance with proper configuration for
 * development and production environments.
 */

import { PrismaClient } from '@prisma/client';

// Extend PrismaClient with custom methods if needed
export interface DatabaseClient extends PrismaClient {
  // Add custom methods here
}

// Singleton instance
declare global {
  var __prisma: PrismaClient | undefined;
}

/**
 * Database client configuration
 */
const createPrismaClient = (): PrismaClient => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
    errorFormat: process.env.NODE_ENV === 'development' 
      ? 'pretty' 
      : 'minimal',
  });
};

/**
 * Get or create database client
 */
export const db = global.__prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = db;
}

/**
 * Graceful shutdown
 */
export const disconnectDatabase = async (): Promise<void> => {
  await db.$disconnect();
};

/**
 * Health check
 */
export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    await db.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
};

/**
 * Re-export Prisma types and utilities
 */
export * from '@prisma/client';
export type { Prisma } from '@prisma/client';

/**
 * Transaction helper
 */
export const transaction = db.$transaction.bind(db);

/**
 * Extend client with custom methods
 */
export const extendClient = <T>(
  client: PrismaClient,
  extensions: T
): PrismaClient & T => {
  return Object.assign(client, extensions);
};

export default db;
EOF

echo -e "${GREEN}✅ Database client created${NC}"

##############################################################################
# 4. Create TypeScript Configuration
##############################################################################

echo -e "${YELLOW}📝 Creating TypeScript configuration...${NC}"

cat > packages/database/tsconfig.json <<'EOF'
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": ".",
    "composite": true,
    "declaration": true,
    "declarationMap": true
  },
  "include": [
    "client/**/*",
    "types/**/*",
    "seeds/**/*",
    "scripts/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "prisma/migrations"
  ]
}
EOF

echo -e "${GREEN}✅ TypeScript configuration created${NC}"

##############################################################################
# 5. Create Seed Data Structure
##############################################################################

echo -e "${YELLOW}🌱 Creating seed data templates...${NC}"

cat > packages/database/seeds/dev/index.ts <<'EOF'
/**
 * Development Seed Data
 * 
 * Seeds database with development/demo data including:
 * - Demo organizations
 * - Demo users
 * - Sample projects
 * - Test data
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding development database...');

  // Clear existing data (optional - be careful!)
  // await prisma.user.deleteMany();
  // await prisma.organization.deleteMany();

  // Create demo organization
  const org = await prisma.organization.upsert({
    where: { slug: 'ghxstship-demo' },
    update: {},
    create: {
      name: 'GHXSTSHIP Demo',
      slug: 'ghxstship-demo',
      // Add other required fields based on your schema
    },
  });

  console.log('✅ Created demo organization:', org.slug);

  // Create demo users
  // Add your user seeding logic here

  // Create sample projects
  // Add your project seeding logic here

  console.log('✅ Development seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
EOF

cat > packages/database/seeds/test/index.ts <<'EOF'
/**
 * Test Seed Data
 * 
 * Minimal seed data for testing
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧪 Seeding test database...');

  // Add minimal test data
  
  console.log('✅ Test seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Test seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
EOF

cat > packages/database/seeds/prod/index.ts <<'EOF'
/**
 * Production Seed Data
 * 
 * CAUTION: Only essential data for production initialization
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Seeding production database...');

  // Only essential production data
  // - System settings
  // - Default roles/permissions
  // - Required configurations
  
  console.log('✅ Production seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Production seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
EOF

echo -e "${GREEN}✅ Seed templates created${NC}"

##############################################################################
# 6. Create Helper Scripts
##############################################################################

echo -e "${YELLOW}🛠️  Creating helper scripts...${NC}"

cat > packages/database/scripts/migrate.sh <<'EOF'
#!/bin/bash
set -e

ENVIRONMENT=${1:-dev}

echo "🔄 Running migrations for environment: $ENVIRONMENT"

case $ENVIRONMENT in
  dev)
    pnpm prisma migrate dev
    ;;
  staging|prod)
    pnpm prisma migrate deploy
    ;;
  *)
    echo "❌ Unknown environment: $ENVIRONMENT"
    exit 1
    ;;
esac

echo "✅ Migration complete!"
EOF

cat > packages/database/scripts/reset.sh <<'EOF'
#!/bin/bash
set -e

echo "⚠️  WARNING: This will delete all data and reset the database!"
read -p "Are you sure? (yes/no): " -r
echo

if [[ $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    pnpm prisma migrate reset --force
    echo "✅ Database reset complete!"
else
    echo "❌ Reset cancelled"
    exit 1
fi
EOF

cat > packages/database/scripts/backup.sh <<'EOF'
#!/bin/bash
set -e

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups"
BACKUP_FILE="${BACKUP_DIR}/backup_${TIMESTAMP}.sql"

mkdir -p "$BACKUP_DIR"

echo "💾 Creating database backup..."

# Extract from DATABASE_URL or use defaults
pg_dump "$DATABASE_URL" > "$BACKUP_FILE"

echo "✅ Backup created: $BACKUP_FILE"
EOF

chmod +x packages/database/scripts/*.sh

echo -e "${GREEN}✅ Helper scripts created${NC}"

##############################################################################
# 7. Create Database README
##############################################################################

echo -e "${YELLOW}📚 Creating documentation...${NC}"

cat > packages/database/README.md <<'EOF'
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
EOF

echo -e "${GREEN}✅ Documentation created${NC}"

##############################################################################
# 8. Move Existing Schema (if exists)
##############################################################################

echo -e "${YELLOW}📋 Checking for existing Prisma schema...${NC}"

if [ -f "packages/infrastructure/prisma/schema.prisma" ]; then
    echo "  Found existing schema, copying to new location..."
    cp packages/infrastructure/prisma/schema.prisma packages/database/prisma/
    
    if [ -d "packages/infrastructure/prisma/migrations" ]; then
        echo "  Copying migrations..."
        cp -r packages/infrastructure/prisma/migrations packages/database/prisma/
    fi
    
    echo -e "${GREEN}✅ Existing schema copied${NC}"
else
    echo "  No existing schema found, creating template..."
    
    cat > packages/database/prisma/schema.prisma <<'EOF'
// GHXSTSHIP Database Schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Add your models here
// Example:
// model User {
//   id        String   @id @default(cuid())
//   email     String   @unique
//   name      String?
//   createdAt DateTime @default(now())
//   updatedAt DateTime @updatedAt
// }
EOF
    
    echo -e "${GREEN}✅ Template schema created${NC}"
fi

##############################################################################
# 9. Update Package References
##############################################################################

echo -e "${YELLOW}🔗 Instructions for updating package references...${NC}"

cat > packages/database/MIGRATION_NOTES.md <<'EOF'
# Database Package Migration Notes

## Manual Steps Required

### 1. Update workspace configuration
Add to `pnpm-workspace.yaml`:
```yaml
packages:
  - 'packages/database'
```

### 2. Update package.json dependencies
In packages that use the database, update:
```json
{
  "dependencies": {
    "@ghxstship/database": "workspace:*"
  }
}
```

### 3. Update imports
Replace:
```typescript
import { db } from '@ghxstship/infrastructure';
```

With:
```typescript
import { db } from '@ghxstship/database';
```

### 4. Update Prisma schema location
If using Prisma in CI/CD, update paths to:
```
packages/database/prisma/schema.prisma
```

### 5. Update environment variables
Ensure DATABASE_URL is available in all environments.

### 6. Generate Prisma client
```bash
cd packages/database
pnpm generate
```

### 7. Test the migration
```bash
pnpm --filter @ghxstship/database generate
pnpm --filter @ghxstship/database migrate:dev
```

## Verification Checklist

- [ ] Package builds successfully
- [ ] Prisma client generates
- [ ] Migrations run successfully
- [ ] Seed data works
- [ ] All imports updated
- [ ] Tests pass
- [ ] CI/CD updated

## Rollback Plan

If issues occur:
1. Revert changes to package.json files
2. Restore original imports
3. Move schema back to infrastructure package
4. Regenerate Prisma client
EOF

echo -e "${YELLOW}📋 Migration notes created at packages/database/MIGRATION_NOTES.md${NC}"

##############################################################################
# 10. Summary
##############################################################################

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Database Package Extraction Complete!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}Created:${NC}"
echo "  • Database package structure"
echo "  • Database client with singleton pattern"
echo "  • Seed data templates (dev/test/prod)"
echo "  • Helper scripts for migrations and backups"
echo "  • Comprehensive documentation"
echo ""
echo -e "${YELLOW}⚠️  Manual Steps Required:${NC}"
echo "  1. Read: packages/database/MIGRATION_NOTES.md"
echo "  2. Add '@ghxstship/database' to workspace configuration"
echo "  3. Update dependencies in packages using the database"
echo "  4. Update all imports to use new package"
echo "  5. Generate Prisma client: cd packages/database && pnpm generate"
echo "  6. Test migrations and seeds"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "  1. Complete manual migration steps above"
echo "  2. Test database connectivity"
echo "  3. Run: ./scripts/transformation/04-centralize-tooling.sh"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

touch .transformation-03-complete

exit 0
